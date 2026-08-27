const API_BASE = import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:3000' : 'https://start-project-mu.vercel.app');


export async function api(method, endpoint, body = null) {
  const token    = localStorage.getItem('token');
  const anonStr  = localStorage.getItem('anon_user');

  const headers = { 'Content-Type': 'application/json' };

  // ── Real JWT auth (admin and logged-in users) ──────────────────────────
  if (token && token !== 'student' && token !== 'admin') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ── Email header fallback for anonymous student requests ────────────────
  // Used by the /api/requests/mine route for users who submitted a form
  // without creating an account.
  if (!token && anonStr) {
    try {
      const u = JSON.parse(anonStr);
      if (u?.email) headers['x-user-email'] = u.email;
    } catch (_e) {}
  }

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

