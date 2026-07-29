import { create } from 'zustand';
import api from '../services/api';

const normalizePG = (pg) => (pg ? { ...pg, _id: pg._id || pg.id } : pg);

const usePGStore = create((set, get) => ({
  pgs: [],
  pagination: null,
  currentPG: null,
  myPGs: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters) => set({ filters }),

  fetchPGs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/pg', { params: { ...get().filters, ...params } });
      const payload = response.data?.data || [];
      set({
        pgs: Array.isArray(payload) ? payload.map(normalizePG) : [],
        pagination: response.data?.pagination || null,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyPGs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/pg/my');
      const pgs = response.data?.data?.pgs || [];
      set({ myPGs: pgs.map(normalizePG), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPGById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/pg/${id}`);
      const pg = normalizePG(response.data?.data?.pg || null);
      set({ currentPG: pg, loading: false });
      return pg;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createPG: async (data) => {
    try {
      const response = await api.post('/pg', data);
      const newPG = normalizePG(response.data?.data?.pg || response.data?.pg || response.data);
      set((state) => ({
        myPGs: [newPG, ...state.myPGs.filter((p) => p?._id !== newPG?._id)],
        pgs: [newPG, ...state.pgs.filter((p) => p?._id !== newPG?._id)],
      }));
      return newPG;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updatePG: async (id, data) => {
    const response = await api.put(`/pg/${id}`, data);
    const updated = normalizePG(response.data?.data?.pg || response.data?.pg || null);
    set((state) => ({
      myPGs: state.myPGs.map((p) => (p._id === id ? updated : p)),
      pgs: state.pgs.map((p) => (p._id === id ? updated : p)),
    }));
    return updated;
  },

  deletePG: async (id) => {
    await api.delete(`/pg/${id}`);
    set((state) => ({
      myPGs: state.myPGs.filter((p) => p._id !== id),
      pgs: state.pgs.filter((p) => p._id !== id),
    }));
  },

  clearCurrentPG: () => set({ currentPG: null }),
}));

export default usePGStore;
