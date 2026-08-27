import { api } from './api';

export const schemeService = {
  async getSchemes(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '' && params[key] !== 'All') {
        query.append(key, params[key]);
      }
    });

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await api.get(`/schemes${queryString}`);
  },

  async getSchemeById(id) {
    return await api.get(`/schemes/${id}`);
  },

  async getCategories() {
    return await api.get('/schemes/categories');
  }
};
