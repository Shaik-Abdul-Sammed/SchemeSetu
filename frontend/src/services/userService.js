import { api } from './api';

export const userService = {
  async getSavedSchemes() {
    return await api.get('/user/saved-schemes');
  },

  async toggleSaveScheme(schemeId) {
    return await api.post('/user/saved-schemes', { schemeId });
  },

  async getApplications() {
    return await api.get('/user/applications');
  },

  async applyScheme(schemeId, notes) {
    return await api.post('/user/applications', { schemeId, notes });
  },

  async getNotifications() {
    return await api.get('/user/notifications');
  }
};
