// Centralised API base URL — used everywhere in the app.
// Priority: VITE_API_URL env var > dev localhost > production backend
export const API_BASE =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '')
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? 'http://localhost:3000'
      : 'https://hire-project-backend.vercel.app'; // production backend


export async function api(method, endpoint, body = null, customHeaders = {}) {
  const token    = localStorage.getItem('token');
  const userStr  = localStorage.getItem('user');
  const anonStr  = localStorage.getItem('anon_user');

  const headers = { 'Content-Type': 'application/json', ...customHeaders };

  // ── Real JWT auth (admin and logged-in users) ──────────────────────────
  if (token && token !== 'student' && token !== 'admin') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ── Email header fallback ──────────────────────────────────────────────
  // Used by the backend's requireStudent middleware as a fallback if the 
  // token is missing or invalid (e.g. JobZen main site token mismatch).
  try {
    let emailFallback = null;
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.email) emailFallback = u.email;
    }
    if (!emailFallback && anonStr) {
      const au = JSON.parse(anonStr);
      if (au?.email) emailFallback = au.email;
    }
    if (emailFallback && !headers['x-user-email']) {
      headers['x-user-email'] = emailFallback;
    }
  } catch {
    // Ignore JSON parsing errors for malformed local storage
  }

  const options = { method, headers };
  if (body) {
    if (body instanceof FormData) {
      delete headers['Content-Type']; // let browser set multipart/form-data boundary
      options.body = body;

      // DEV: log each FormData field so we can trace submission payloads
      if (import.meta.env.DEV) {
        console.group(`[API] ${method} ${endpoint}`);
        for (const [k, v] of body.entries()) {
          console.log(`  ${k}:`, v instanceof File ? `File(${v.name}, ${v.size}b)` : v);
        }
        console.groupEnd();
      }
    } else {
      options.body = JSON.stringify(body);
    }
  }



  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const contentType = res.headers.get('content-type') || '';
  
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      throw new Error('Server returned invalid JSON response');
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Server returned status ${res.status}`);
    }
    data = { message: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || (typeof data === 'string' ? data : JSON.stringify(data)) || `Request failed with status ${res.status}`);
  }
  return data;
}
