import api from './api';

export const leadService = {
  getMyLeads: async (type) => {
    const res = await api.get('/lead/my', { params: type ? { type } : {} });
    return res.data.data.leads;
  },
  getPGLeads: async (pgId) => {
    const res = await api.get(`/lead/pg/${pgId}`);
    return res.data.data.leads;
  },
  addLead: async (pgId, type = 'inquiry', message = '') => {
    const res = await api.post('/lead', { pgId, type, message });
    return res.data;
  },
};

export const visitService = {
  createVisit: async (data) => {
    const res = await api.post('/visit', data);
    return res.data.data.visit;
  },
  getMyVisits: async () => {
    const res = await api.get('/visit/my');
    return res.data.data.visits;
  },
  getPGVisits: async (pgId) => {
    const res = await api.get(`/visit/pg/${pgId}`);
    return res.data.data.visits;
  },
  updateStatus: async (id, status, ownerNote) => {
    const res = await api.put(`/visit/${id}/status`, { status, ownerNote });
    return res.data.data.visit;
  },
};
