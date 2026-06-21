import { create } from 'zustand';
import api from '../services/api';

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
      set({
        pgs: response.data.data,
        pagination: response.data.pagination,
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
      set({ myPGs: response.data.data.pgs, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPGById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/pg/${id}`);
      set({ currentPG: response.data.data.pg, loading: false });
      return response.data.data.pg;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  createPG: async (data) => {
    const response = await api.post('/pg', data);
    const newPG = response.data.data.pg;
    set((state) => ({ myPGs: [newPG, ...state.myPGs] }));
    return newPG;
  },

  updatePG: async (id, data) => {
    const response = await api.put(`/pg/${id}`, data);
    const updated = response.data.data.pg;
    set((state) => ({
      myPGs: state.myPGs.map((p) => (p._id === id ? updated : p)),
    }));
    return updated;
  },

  deletePG: async (id) => {
    await api.delete(`/pg/${id}`);
    set((state) => ({ myPGs: state.myPGs.filter((p) => p._id !== id) }));
  },

  clearCurrentPG: () => set({ currentPG: null }),
}));

export default usePGStore;
