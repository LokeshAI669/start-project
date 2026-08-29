const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { pool } = require('../db');
const { optionalAuth } = require('../auth');

const router = express.Router();

// ── Gemini client (lazy-initialised so missing key doesn't crash start) ────────
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables.');
  return new GoogleGenerativeAI(key);
}

/* ════════════════════════════════════════════════════════════════════════════
   1. AI CHATBOT
   POST /api/ai/chat
   Body: { message: string, history?: [{role, parts}] }
   ════════════════════════════════════════════════════════════════════════════ */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    // Fetch a snapshot of the catalog for context (titles + domains only — lightweight)
    const { rows: catalog } = await pool.query(`
      SELECT title, domain, difficulty, short_description, tech_stack, estimated_duration
      FROM project_catalog
      WHERE is_active = TRUE
      ORDER BY title ASC
      LIMIT 60
    `);

    const catalogSummary = catalog
      .map(p => `• ${p.title} (${p.domain}, ${p.difficulty}) — ${p.short_description || ''} | Stack: ${p.tech_stack || 'N/A'} | Duration: ${p.estimated_duration || 'N/A'}`)
      .join('\n');

    const systemPrompt = `You are HireBot, a friendly and knowledgeable AI assistant for HireProject — a platform where students submit project requests (like AI, ML, web apps, data science, etc.) and get them built by expert developers.

Your job is to:
- Help students find the right project from the catalog
- Answer questions about the platform, pricing, process, and timelines
- Suggest which projects fit a student's interests, budget, or skill goals
- Explain technical concepts in a simple, encouraging way
- Guide users to submit a request or browse the catalog

Be concise, warm, and professional. Use markdown formatting (bold, bullet points) where helpful. If you don't know something specific about the platform, guide the user to contact the admin team.

CURRENT PROJECT CATALOG (${catalog.length} projects):
${catalogSummary}

Platform info:
- Students can browse the catalog at /browse or submit a custom request at /request
- After submission, the admin team reviews and schedules a meeting
- Budgets are in INR (₹) by default but USD/EUR also supported
- Dashboard at /dashboard to track all submissions`;

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation history for multi-turn chat
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: "Hello! I'm HireBot 👋 I'm here to help you find the perfect project or answer any questions about HireProject. What can I help you with today?" }],
        },
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('[AI] chat error:', err.message);
    if (err.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' });
    }
    res.status(500).json({ error: 'AI chat failed. Please try again.' });
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   2. SMART DESCRIPTION GENERATOR
   POST /api/ai/generate-description
   Body: { projectName: string, roughIdea?: string }
   ════════════════════════════════════════════════════════════════════════════ */
router.post('/generate-description', async (req, res) => {
  try {
    const { projectName, roughIdea = '' } = req.body;
    if (!projectName?.trim()) return res.status(400).json({ error: 'Project name is required' });

    const prompt = `You are a professional technical project writer. A student wants to hire developers for a project.

Project Name: "${projectName}"
${roughIdea ? `Student's rough idea: "${roughIdea}"` : ''}

Write a clear, professional project description (150–250 words) that includes:
1. A brief overview of what the project does and its purpose
2. Key features (3–5 bullet points)
3. The target users / use case
4. A brief mention of expected technical approach (without being too technical)

Keep the tone professional but approachable. Write it as if the student is describing their vision to a development team. Do NOT include any headers or markdown — just plain, well-structured paragraphs and a bulleted list for features.`;

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    res.json({ description });
  } catch (err) {
    console.error('[AI] generate-description error:', err.message);
    if (err.message?.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured.' });
    }
    res.status(500).json({ error: 'Failed to generate description. Please try again.' });
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   3. SEMANTIC SEARCH
   GET /api/ai/semantic-search?q=...&limit=20
   Returns catalog projects ranked by semantic relevance to the query
   ════════════════════════════════════════════════════════════════════════════ */
router.get('/semantic-search', async (req, res) => {
  try {
    const { q = '', limit = 20 } = req.query;
    if (!q.trim()) return res.json({ data: [], query: q, semantic: false });

    // Fetch all active catalog projects
    const { rows: catalog } = await pool.query(`
      SELECT id, title, domain, difficulty, short_description, tech_stack, estimated_duration, objectives, prerequisites
      FROM project_catalog
      WHERE is_active = TRUE
      ORDER BY title ASC
    `);

    if (catalog.length === 0) return res.json({ data: [], query: q, semantic: true });

    // Ask Gemini to rank projects by relevance to the query
    const catalogList = catalog.map((p, i) =>
      `[${i}] ${p.title} | Domain: ${p.domain} | Level: ${p.difficulty} | ${p.short_description || ''} | Stack: ${p.tech_stack || ''}`
    ).join('\n');

    const prompt = `You are a semantic search engine for an academic project catalog.

User search query: "${q}"

Below is a list of available projects (format: [index] title | domain | level | description | stack):
${catalogList}

Return ONLY a JSON array of the most relevant project indices (0-based), ordered from most to least relevant. Include only projects with meaningful relevance to the query. Maximum ${Math.min(Number(limit), catalog.length)} results. If nothing is relevant, return an empty array.

Example output: [3, 0, 7, 2]
Return ONLY the JSON array, no other text.`;

    const genAI = getGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Parse the returned indices
    let indices = [];
    try {
      // Extract JSON array from response (handles cases where Gemini adds backticks)
      const match = rawText.match(/\[[\d,\s]*\]/);
      if (match) indices = JSON.parse(match[0]);
    } catch (_) {
      // Fallback: return top N by simple text match
      indices = catalog
        .map((p, i) => ({
          i,
          score: [p.title, p.domain, p.short_description, p.tech_stack]
            .join(' ').toLowerCase().includes(q.toLowerCase()) ? 1 : 0
        }))
        .filter(x => x.score > 0)
        .map(x => x.i)
        .slice(0, Number(limit));
    }

    const data = indices
      .filter(i => i >= 0 && i < catalog.length)
      .map(i => catalog[i]);

    res.json({ data, query: q, semantic: true, total: data.length });
  } catch (err) {
    console.error('[AI] semantic-search error:', err.message);
    // On error, fallback to empty (frontend will use local filter)
    res.json({ data: [], query: q, semantic: false, error: err.message });
  }
});

/* ════════════════════════════════════════════════════════════════════════════
   4. PROJECT RECOMMENDATIONS
   GET /api/ai/recommendations?student_id=:id&email=:email&limit=3
   Returns personalized catalog recommendations
   ════════════════════════════════════════════════════════════════════════════ */
router.get('/recommendations', optionalAuth, async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || req.query.email || req.headers['x-user-email'] || null;

    let pastProjects = [];

    // Fetch the student's past submissions
    if (userId || userEmail) {
      const conditions = [];
      const params = [];

      if (userId) { params.push(userId); conditions.push(`student_id = $${params.length}`); }
      if (userEmail) { params.push(userEmail); conditions.push(`LOWER(email) = LOWER($${params.length})`); }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' OR ')}` : '';
      const { rows } = await pool.query(`
        SELECT project_name, description, catalog_project_id
        FROM projects
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT 10
      `, params);
      pastProjects = rows;
    }

    // Fetch most-requested catalog projects (for popularity-based fallback)
    const { rows: popular } = await pool.query(`
      SELECT pc.id, pc.title, pc.domain, pc.difficulty, pc.short_description, pc.tech_stack,
             COUNT(p.id) as request_count
      FROM project_catalog pc
      LEFT JOIN projects p ON p.catalog_project_id = pc.id
      WHERE pc.is_active = TRUE
      GROUP BY pc.id
      ORDER BY request_count DESC, pc.title ASC
      LIMIT 50
    `);

    if (popular.length === 0) return res.json({ recommendations: [], reason: 'no_catalog' });

    let recommendations = [];
    let reason = 'popular';

    if (pastProjects.length === 0) {
      // No history → return top popular projects
      recommendations = popular.slice(0, Number(limit)).map(p => ({
        ...p,
        match_reason: 'Most requested project on the platform',
        request_count: Number(p.request_count),
      }));
    } else {
      // Has history → use Gemini to recommend based on interests
      reason = 'personalized';

      const pastSummary = pastProjects
        .map(p => `• ${p.project_name}: ${(p.description || '').slice(0, 100)}`)
        .join('\n');

      const catalogList = popular
        .map((p, i) => `[${i}] ${p.title} (${p.domain}, ${p.difficulty}) — ${p.short_description || ''} | Requests: ${p.request_count}`)
        .join('\n');

      const prompt = `You are a project recommendation engine.

A student has submitted these past projects:
${pastSummary}

Available catalog projects:
${catalogList}

Recommend the top ${Math.min(Number(limit), popular.length)} most suitable catalog projects for this student based on their interests and past work.

Return ONLY a JSON array in this exact format, nothing else:
[
  { "index": 0, "reason": "short reason why this matches their interests (1 sentence)" },
  { "index": 2, "reason": "..." }
]`;

      try {
        const genAI = getGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();

        // Extract JSON from response
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          recommendations = parsed
            .filter(r => r.index >= 0 && r.index < popular.length)
            .slice(0, Number(limit))
            .map(r => ({
              ...popular[r.index],
              match_reason: r.reason,
              request_count: Number(popular[r.index].request_count),
            }));
        }
      } catch (_geminiErr) {
        // Gemini failed → fallback to popular
        reason = 'popular';
        recommendations = popular.slice(0, Number(limit)).map(p => ({
          ...p,
          match_reason: 'Most requested project on the platform',
          request_count: Number(p.request_count),
        }));
      }
    }

    res.json({ recommendations, reason });
  } catch (err) {
    console.error('[AI] recommendations error:', err.message);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

module.exports = router;
