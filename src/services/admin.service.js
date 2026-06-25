import api from './api';
import { parsePaginatedResponse } from '../utils/apiHelpers';

export const adminService = {
  // PG management
  getAllPGs: async (params) => {
    const res = await api.get('/admin/pgs', { params });
    return res.data.data;
  },
  approvePG: async (id) => {
    const res = await api.put(`/admin/pgs/${id}/approve`);
    return res.data.data.pg;
  },
  rejectPG: async (id, reason) => {
    const res = await api.put(`/admin/pgs/${id}/reject`, { reason });
    return res.data.data.pg;
  },
  toggleVerify: async (id) => {
    const res = await api.put(`/admin/pgs/${id}/verify`);
    return res.data.data.pg;
  },
  removePG: async (id) => api.delete(`/admin/pgs/${id}`),

  // User management
  getAllUsers: async (params) => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },
  suspendUser: async (id) => {
    const res = await api.put(`/admin/users/${id}/suspend`);
    return res.data.data.user;
  },
  deleteUser: async (id) => api.delete(`/admin/users/${id}`),

  // Analytics
  getAnalytics: async () => {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  // PG Update Requests
  getAllUpdateRequests: async (params) => {
    const res = await api.get('/admin/pg-updates', { params });
    const { items, pagination } = parsePaginatedResponse(res, 'requests');
    return { requests: items, pagination };
  },
  approveUpdateRequest: async (id) => {
    const res = await api.put(`/admin/pg-updates/${id}/approve`);
    return res.data.data.request;
  },
  rejectUpdateRequest: async (id, comment) => {
    const res = await api.put(`/admin/pg-updates/${id}/reject`, { comment });
    return res.data.data.request;
  },
  requestCorrection: async (id, comment) => {
    const res = await api.put(`/admin/pg-updates/${id}/correction`, { comment });
    return res.data.data.request;
  },
};

export default adminService;
