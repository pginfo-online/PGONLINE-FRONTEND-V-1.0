import api from './api';

export const pgService = {
  getAll: async (params) => {
    const res = await api.get('/pg', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/pg/${id}`);
    return res.data.data.pg;
  },
  getMy: async () => {
    const res = await api.get('/pg/my');
    return res.data.data.pgs;
  },
  create: async (data) => {
    const res = await api.post('/pg', data);
    return res.data.data.pg;
  },
  update: async (id, data) => {
    const res = await api.put(`/pg/${id}`, data);
    return res.data.data.pg;
  },
  remove: async (id) => api.delete(`/pg/${id}`),
  uploadImages: async (pgId, files, setMain = false) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    if (pgId) formData.append('pgId', pgId);
    if (setMain) formData.append('setMain', 'true');
    const res = await api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.images;
  },
  deleteImage: async (pgId, publicId) => {
    const res = await api.delete(`/upload/image/${pgId}`, { data: { publicId } });
    return res.data.data;
  },
  getMyUpdateRequests: async () => {
    const res = await api.get('/pg/my/update-requests');
    return res.data.data.requests;
  },
  cancelUpdateRequest: async (id) => api.delete(`/pg/my/update-requests/${id}`),
};

export default pgService;
