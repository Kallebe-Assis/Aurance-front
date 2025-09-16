import api from './api';

// Serviços de despesas
export const expenseService = {
  // Listar despesas
  getExpenses: async (filters?: any) => {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
  },

  // Obter despesa por ID
  getExpense: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Criar despesa
  createExpense: async (expenseData: any) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Atualizar despesa
  updateExpense: async (id: string, expenseData: any) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  // Deletar despesa
  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Marcar como paga
  markAsPaid: async (id: string, paidDate?: Date) => {
    const response = await api.patch(`/expenses/${id}/mark-paid`, { paidDate });
    return response.data;
  },

  // Marcar como não paga
  markAsUnpaid: async (id: string) => {
    const response = await api.patch(`/expenses/${id}/mark-unpaid`);
    return response.data;
  },

  // Despesas vencidas
  getOverdueExpenses: async () => {
    const response = await api.get('/expenses/overdue');
    return response.data;
  },

  // Próximas despesas
  getUpcomingExpenses: async (days?: number) => {
    const response = await api.get('/expenses/upcoming', { params: { days } });
    return response.data;
  },

  // Estatísticas por período
  getStatsByPeriod: async (startDate: string, endDate: string) => {
    const response = await api.get('/expenses/stats/period', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Estatísticas por categoria
  getStatsByCategory: async (startDate: string, endDate: string) => {
    const response = await api.get('/expenses/stats/category', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Buscar despesas
  searchExpenses: async (query: string) => {
    const response = await api.get('/expenses/search', { params: { q: query } });
    return response.data;
  }
};
