import api from './api';

export const appVersionService = {
  getAllVersions: async () => {
    const res = await api.get('/app-version/admin/all');
    return res.data.data.versions;
  },
  getVersionAudits: async () => {
    const res = await api.get('/app-version/admin/audits');
    return res.data.data.audits;
  },
  createVersion: async (data) => {
    const res = await api.post('/app-version', data);
    return res.data.data.version;
  },
  updateVersion: async (id, data) => {
    const res = await api.put(`/app-version/${id}`, data);
    return res.data.data.version;
  },
  deleteVersion: async (id) => {
    const res = await api.delete(`/app-version/${id}`);
    return res.data;
  },
};

export default appVersionService;
