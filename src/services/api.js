import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://localhost:5001/api/v1' 
//  import.meta.env.VITE_API_URL || 'http://192.168.1.60:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle Errors ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    let message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      message = error.response.data.errors.map(e => e.message).join(', ');
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
