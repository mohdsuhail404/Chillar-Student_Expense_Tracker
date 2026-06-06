import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chillar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle errors ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('chillar_token');
      localStorage.removeItem('chillar_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    }

    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

export default api;