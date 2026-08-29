import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AIChatbot.css';

const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:3000' : 'https://start-project-mu.vercel.app');

const QUICK_PROMPTS = [
  'What ML projects do you have?',
  'Which project fits ₹50,000 budget?',
  'How long does a project take?',
  'How do I submit a request?',
];

function renderMarkdown(text) {
  // Very simple markdown → HTML for bot messages
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIChatbot() {
  const { user } = useContext(AuthContext);
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // [{role, parts, display}]
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, open, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', parts: msg, display: msg };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token && token !== 'student' && token !== 'admin') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: msg,
          history: newHistory.slice(0, -1).map(h => ({ role: h.role, parts: h.parts })),
        }),
      });

      // Safe JSON parse — Vercel may return HTML if env vars are missing
      let data;
      try {
        data = await res.json();
      } catch (_) {
        throw new Error('AI service not configured yet. Please add GROQ_API_KEY in Vercel → Settings → Environment Variables.');
      }

      if (!res.ok) {
        throw new Error(
          data.error?.includes('GROQ_API_KEY')
            ? '⚙️ GROQ_API_KEY is not set. Go to Vercel → Settings → Environment Variables and add it.'
            : data.error || 'AI chat failed'
        );
      }

      setHistory(prev => [
        ...prev,
        { role: 'model', parts: data.reply, display: data.reply },
      ]);
    } catch (err) {
      setHistory(prev => [
        ...prev,
        { role: 'model', parts: err.message, display: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };


  const clearChat = () => setHistory([]);

  return (
    <>
      {/* ── Floating trigger button ── */}
      <motion.button
        id="ai-chatbot-trigger"
        className={`chatbot-fab ${open ? 'chatbot-fab--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><ChevronDown size={22} /></motion.span>
            : <motion.span key="open"  initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Sparkles size={22} /></motion.span>
          }
        </AnimatePresence>
        {!open && <span className="chatbot-fab-label">AI Assistant</span>}
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="ai-chatbot-panel"
            className="chatbot-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header-left">
                <div className="chatbot-avatar">
                  <Bot size={18} />
                </div>
                <div>
                  <div className="chatbot-title">HireBot</div>
                  <div className="chatbot-status">
                    <span className="chatbot-status-dot" />
                    AI-powered assistant
                  </div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                {history.length > 0 && (
                  <button className="chatbot-icon-btn" onClick={clearChat} title="Clear chat">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button className="chatbot-icon-btn" onClick={() => setOpen(false)} title="Close">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {/* Welcome message */}
              {history.length === 0 && (
                <motion.div
                  className="chatbot-welcome"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="chatbot-welcome-icon">👋</div>
                  <div className="chatbot-welcome-text">
                    Hi{user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm <strong>HireBot</strong>, your AI assistant for HireProject.
                    <br />Ask me anything about our projects, process, or pricing!
                  </div>
                  <div className="chatbot-quick-prompts">
                    {QUICK_PROMPTS.map(p => (
                      <button key={p} className="chatbot-quick-btn" onClick={() => sendMessage(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message history */}
              <AnimatePresence initial={false}>
                {history.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`chatbot-msg chatbot-msg--${msg.role}`}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {msg.role === 'model' && (
                      <div className="chatbot-msg-avatar"><Bot size={13} /></div>
                    )}
                    <div
                      className="chatbot-bubble"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.display) }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    className="chatbot-msg chatbot-msg--model"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="chatbot-msg-avatar"><Bot size={13} /></div>
                    <div className="chatbot-bubble chatbot-typing">
                      <span /><span /><span />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="chatbot-input-area">
              <input
                ref={inputRef}
                id="ai-chatbot-input"
                className="chatbot-input"
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={loading}
              />
              <motion.button
                id="ai-chatbot-send"
                className={`chatbot-send-btn ${(!input.trim() || loading) ? 'disabled' : ''}`}
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <Send size={17} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
