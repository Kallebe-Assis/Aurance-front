import api from './api';

// Serviços de receitas
export const incomeService = {
  // Listar receitas
  getIncomes: async (filters?: any) => {
    const response = await api.get('/incomes', { params: filters });
    return response.data;
  },

  // Obter receita por ID
  getIncome: async (id: string) => {
    const response = await api.get(`/incomes/${id}`);
    return response.data;
  },

  // Criar receita
  createIncome: async (incomeData: any) => {
    const response = await api.post('/incomes', incomeData);
    return response.data;
  },

  // Atualizar receita
  updateIncome: async (id: string, incomeData: any) => {
    const response = await api.put(`/incomes/${id}`, incomeData);
    return response.data;
  },

  // Deletar receita
  deleteIncome: async (id: string) => {
    const response = await api.delete(`/incomes/${id}`);
    return response.data;
  },

  // Marcar como recebida
  markAsReceived: async (id: string, paymentInfo: { amount?: number; receivedDate?: string; isPartial?: boolean }) => {
    const response = await api.patch(`/incomes/${id}/mark-received`, paymentInfo);
    return response.data;
  },

  // Marcar como não recebida
  markAsUnreceived: async (id: string) => {
    const response = await api.patch(`/incomes/${id}/mark-unreceived`);
    return response.data;
  }
};
