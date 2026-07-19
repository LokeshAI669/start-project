const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function api(method, endpoint, body = null) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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
  } catch (e) {
    throw new Error('Server returned invalid response');
  }
  
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}
