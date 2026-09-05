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

  async demoLogin() {
    try {
      const res = await api.post('/auth/login', { email: 'ramesh@example.com', password: 'password123' });
      if (res && res.token) {
        const demoUser = { ...res.user, isDemo: true, name: 'Ramesh Kumar (Demo Citizen)' };
        localStorage.setItem('schemesetu_token', res.token);
        localStorage.setItem('schemesetu_user', JSON.stringify(demoUser));
        return { ...res, user: demoUser };
      }
    } catch (e) {
      console.warn("Backend demo login falling back to client demo session:", e);
    }

    const demoUser = {
      id: 'user-demo-sih',
      name: 'Ramesh Kumar (Demo Citizen)',
      email: 'ramesh@example.com',
      state: 'Telangana',
      district: 'Hyderabad',
      role: 'citizen',
      isDemo: true
    };
    const demoToken = 'demo-jwt-token-sih-2026';
    localStorage.setItem('schemesetu_token', demoToken);
    localStorage.setItem('schemesetu_user', JSON.stringify(demoUser));
    return { token: demoToken, user: demoUser };
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
      const local = localStorage.getItem('schemesetu_user');
      if (local) {
        try {
          return JSON.parse(local);
        } catch {
          // parse error
        }
      }
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
