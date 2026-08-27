const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const token = localStorage.getItem('schemesetu_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(id);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorObj = new Error(data.error || data.message || `HTTP Error ${response.status}`);
      errorObj.status = response.status;
      errorObj.data = data;
      throw errorObj;
    }

    return data;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Network request timed out. Please check your internet connection.');
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    throw error;
  }
}

export const api = {
  get: (endpoint, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'GET', ...options }),
  post: (endpoint, body, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => fetchWithTimeout(`${BASE_URL}${endpoint}`, { method: 'DELETE', ...options })
};
