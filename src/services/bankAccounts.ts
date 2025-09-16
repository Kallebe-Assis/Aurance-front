import api from './api';

// Serviços de contas bancárias
export const bankAccountService = {
  // Listar contas bancárias
  getBankAccounts: async () => {
    const response = await api.get('/bank-accounts');
    return response.data;
  },

  // Obter conta por ID
  getBankAccount: async (id: string) => {
    const response = await api.get(`/bank-accounts/${id}`);
    return response.data;
  },

  // Criar conta bancária
  createBankAccount: async (accountData: any) => {
    const response = await api.post('/bank-accounts', accountData);
    return response.data;
  },

  // Atualizar conta bancária
  updateBankAccount: async (id: string, accountData: any) => {
    const response = await api.put(`/bank-accounts/${id}`, accountData);
    return response.data;
  },

  // Deletar conta bancária
  deleteBankAccount: async (id: string) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },

  // Ativar conta
  activateAccount: async (id: string) => {
    const response = await api.patch(`/bank-accounts/${id}/status`, { isActive: true });
    return response.data;
  },

  // Desativar conta
  deactivateAccount: async (id: string) => {
    const response = await api.patch(`/bank-accounts/${id}/status`, { isActive: false });
    return response.data;
  },

  // Atualizar saldo
  updateBalance: async (id: string, balance: number) => {
    const response = await api.patch(`/bank-accounts/${id}/balance`, { balance });
    return response.data;
  },

  // Obter estatísticas das contas
  getStats: async () => {
    const response = await api.get('/bank-accounts/stats');
    return response.data;
  }
};
