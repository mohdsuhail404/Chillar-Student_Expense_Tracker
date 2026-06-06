import api from './api';

export const expenseService = {
  // CRUD
  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  bulkDelete: async (ids) => {
    const response = await api.delete('/expenses/bulk/delete', { data: { ids } });
    return response.data;
  },

  // Stats
  getMonthlySummary: async (params) => {
    const response = await api.get('/expenses/stats/monthly', { params });
    return response.data;
  },

  getYearlySummary: async (params) => {
    const response = await api.get('/expenses/stats/yearly', { params });
    return response.data;
  },

  getCategoryStats: async (params) => {
    const response = await api.get('/expenses/stats/categories', { params });
    return response.data;
  },

  // Budget
  getBudget: async (params) => {
    const response = await api.get('/budget', { params });
    return response.data;
  },

  setBudget: async (data) => {
    const response = await api.post('/budget', data);
    return response.data;
  }
};