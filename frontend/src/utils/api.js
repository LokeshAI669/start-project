const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:3000' : 'https://start-project-mu.vercel.app');


export async function api(method, endpoint, body = null) {
  const token    = localStorage.getItem('token');
  const userStr  = localStorage.getItem('user');
  const anonStr  = localStorage.getItem('anon_user');

  const headers = { 'Content-Type': 'application/json' };

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
    if (emailFallback) headers['x-user-email'] = emailFallback;
  } catch (_e) {}

  const options = { method, headers };
  if (body) {
    if (body instanceof FormData) {
      delete headers['Content-Type']; // let browser set multipart/form-data boundary
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  let data;
  try {
    data = await res.json();
  } catch (_e) {
    throw new Error('Server returned invalid response');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

