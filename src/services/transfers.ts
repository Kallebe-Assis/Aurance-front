import api from './api';

// Serviços de transferências
export const transferService = {
  // Listar transferências
  getTransfers: async (filters?: any) => {
    const response = await api.get('/transfers', { params: filters });
    return response.data;
  },

  // Criar transferência
  createTransfer: async (transferData: any) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },

  // Buscar transferência por ID
  getTransferById: async (id: string) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  // Deletar transferência (reverter)
  deleteTransfer: async (id: string) => {
    const response = await api.delete(`/transfers/${id}`);
    return response.data;
  }
};
