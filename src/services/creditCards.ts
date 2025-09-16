import api from './api';

// Serviços de cartões de crédito
export const creditCardService = {
  // Listar cartões
  getCreditCards: async () => {
    const response = await api.get('/credit-cards');
    return response.data;
  },

  // Obter cartão por ID
  getCreditCard: async (id: string) => {
    const response = await api.get(`/credit-cards/${id}`);
    return response.data;
  },

  // Criar cartão
  createCreditCard: async (creditCardData: any) => {
    const response = await api.post('/credit-cards', creditCardData);
    return response.data;
  },

  // Atualizar cartão
  updateCreditCard: async (id: string, creditCardData: any) => {
    const response = await api.put(`/credit-cards/${id}`, creditCardData);
    return response.data;
  },

  // Deletar cartão
  deleteCreditCard: async (id: string) => {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
  },

  // Ativar cartão
  activateCreditCard: async (id: string) => {
    const response = await api.patch(`/credit-cards/${id}/activate`);
    return response.data;
  },

  // Desativar cartão
  deactivateCreditCard: async (id: string) => {
    const response = await api.patch(`/credit-cards/${id}/deactivate`);
    return response.data;
  },

  // Atualizar limite
  updateLimit: async (id: string, limit: number) => {
    const response = await api.patch(`/credit-cards/${id}/update-limit`, { limit });
    return response.data;
  },

  // Obter estatísticas dos cartões
  getStats: async () => {
    const response = await api.get('/credit-cards/stats/summary');
    return response.data;
  },

  // Obter cartões próximos do vencimento
  getUpcomingDue: async () => {
    const response = await api.get('/credit-cards/upcoming-due');
    return response.data;
  },

  // Obter estatísticas de um cartão específico
  getCardStats: async (id: string, startDate?: string, endDate?: string) => {
    const response = await api.get(`/credit-cards/${id}/stats`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Transações
  // Listar transações de um cartão
  getTransactions: async (creditCardId: string, filters?: any) => {
    const response = await api.get(`/credit-cards/${creditCardId}/transactions`, {
      params: filters
    });
    return response.data;
  },

  // Criar transação
  createTransaction: async (creditCardId: string, transactionData: any) => {
    const response = await api.post(`/credit-cards/${creditCardId}/transactions`, transactionData);
    return response.data;
  },

  // Criar adiantamento de fatura
  createAdvancePayment: async (creditCardId: string, advanceData: any) => {
    const response = await api.post(`/credit-cards/${creditCardId}/advance-payment`, advanceData);
    return response.data;
  },

  // Criar estorno
  createRefund: async (creditCardId: string, refundData: any) => {
    const response = await api.post(`/credit-cards/${creditCardId}/refund`, refundData);
    return response.data;
  },

  // Buscar transações com filtros avançados
  searchTransactions: async (filters?: any) => {
    const response = await api.get('/credit-cards/transactions/search', {
      params: filters
    });
    return response.data;
  },

  // Buscar TODAS as despesas de cartão de crédito (para a tela de cartões)
  getCreditCardExpenses: async () => {
    const response = await api.get('/expenses?includeCreditCard=true');
    return response.data;
  }
};
