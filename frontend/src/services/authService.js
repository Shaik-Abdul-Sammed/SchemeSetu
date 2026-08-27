import { api } from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.token) {
      localStorage.setItem('schemesetu_token', res.token);
      localStorage.setItem('schemesetu_user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.token) {
      localStorage.setItem('schemesetu_token', res.token);
      localStorage.setItem('schemesetu_user', JSON.stringify(res.user));
    }
    return res;
  },

  async getCurrentUser() {
    const token = localStorage.getItem('schemesetu_token');
    if (!token) return null;
    try {
      const res = await api.get('/auth/me');
      return res.user;
    } catch {
      localStorage.removeItem('schemesetu_token');
      localStorage.removeItem('schemesetu_user');
      return null;
    }
  },

  logout() {
    localStorage.removeItem('schemesetu_token');
    localStorage.removeItem('schemesetu_user');
  }
};
