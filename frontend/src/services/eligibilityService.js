import { api } from './api';

export const eligibilityService = {
  async checkEligibility(payload) {
    return await api.post('/eligibility/check', payload);
  }
};
