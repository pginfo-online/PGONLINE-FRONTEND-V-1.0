import api from './api';
import { parsePaginatedResponse } from '../utils/apiHelpers';

export const meetupService = {
  getAll: async (params) => {
    const res = await api.get('/meetups', { params });
    return res.data;
  },
  getUpcoming: async () => {
    const res = await api.get('/meetups/upcoming');
    return res.data.data.meetups;
  },
  getById: async (id) => {
    const res = await api.get(`/meetups/${id}`);
    return res.data.data.meetup;
  },
  getMy: async () => {
    const res = await api.get('/meetups/my');
    return res.data.data.meetups;
  },
  create: async (data) => {
    const res = await api.post('/meetups', data);
    return res.data.data.meetup;
  },
  update: async (id, data) => {
    const res = await api.put(`/meetups/${id}`, data);
    return res.data.data.meetup;
  },
  remove: async (id) => api.delete(`/meetups/${id}`),
  publish: async (id) => {
    const res = await api.put(`/meetups/${id}/publish`);
    return res.data.data.meetup;
  },
  uploadImages: async (meetupId, files, setMain = false) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    if (setMain) formData.append('setMain', 'true');
    const res = await api.post(`/meetups/${meetupId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.images;
  },
  deleteImage: async (meetupId, publicId) => {
    const res = await api.delete(`/meetups/${meetupId}/images`, { data: { publicId } });
    return res.data.data;
  },
  setMainImage: async (meetupId, publicId) => {
    const res = await api.put(`/meetups/${meetupId}/images/main`, { publicId });
    return res.data.data;
  },
  rsvp: async (id, status) => {
    const res = await api.post(`/meetups/${id}/rsvp`, { status });
    return res.data.data;
  },
  // Admin
  adminGetAll: async (params) => {
    const res = await api.get('/admin/meetups', { params });
    const { items, pagination } = parsePaginatedResponse(res, 'meetups');
    return { meetups: items, pagination };
  },
  adminToggleApproval: async (id, approve) => {
    const res = await api.put(`/admin/meetups/${id}/approve`, { approve });
    return res.data.data.meetup;
  },
  adminDelete: async (id) => api.delete(`/admin/meetups/${id}`),
};

export default meetupService;
