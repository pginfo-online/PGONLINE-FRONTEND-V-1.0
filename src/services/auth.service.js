import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  updateMe: async (data) => {
    const res = await api.put('/auth/me', data);
    return res.data.data.user;
  },

  sendOtpUnified: async (contact, type) => {
    const res = await api.post('/auth/otp/send-unified', { contact, type });
    return res.data;
  },

  verifyOtpUnified: async (contact, otp) => {
    const res = await api.post('/auth/otp/verify-unified', { contact, otp });
    return res.data.data;
  },

  completeRegistration: async (data) => {
    const res = await api.post('/auth/register-complete', data);
    return res.data.data;
  },
};

export default authService;
