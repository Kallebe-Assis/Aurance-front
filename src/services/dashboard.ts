import api from './api';

// Serviços de dashboard
export const dashboardService = {
  // Obter dados do dashboard
  getDashboardData: async (period?: string) => {
    const response = await api.get('/dashboard', { params: { period } });
    return response.data;
  },

  // Obter estatísticas
  getStats: async (filters?: any) => {
    const response = await api.get('/dashboard/stats', { params: filters });
    return response.data;
  }
};

// Serviços de usuário
export const userService = {
  // Obter perfil do usuário
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Atualizar preferências
  updatePreferences: async (preferences: any) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // Excluir conta
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },

  // Excluir todos os dados (exclusão total)
  deleteAllData: async () => {
    const response = await api.delete('/users/me/delete-all-data');
    return response.data;
  },

  // Excluir todos os dados (busca agressiva)
  deleteAllDataAggressive: async () => {
    const response = await api.delete('/users/me/delete-all-data-aggressive');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  }
};

// Serviços de metas
export const goalService = {
  // Listar metas
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  // Criar meta
  createGoal: async (goalData: any) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  // Atualizar meta
  updateGoal: async (id: string, goalData: any) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  // Deletar meta
  deleteGoal: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  // Atualizar progresso
  updateProgress: async (id: string, progress: number) => {
    const response = await api.patch(`/goals/${id}/progress`, { progress });
    return response.data;
  }
};

// Serviços de relatórios
export const reportService = {
  // Obter estatísticas
  getStats: async (period: string) => {
    const response = await api.get('/reports/stats', { params: { period } });
    return response.data;
  },

  // Obter relatórios
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Gerar relatório
  generateReport: async (type: string, period: string) => {
    const response = await api.post('/reports/generate', { type, period });
    return response.data;
  },

  // Download relatório
  downloadReport: async (id: string, format: 'pdf' | 'csv' = 'pdf') => {
    const response = await api.get(`/reports/${id}/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Recálculo automático de saldos das contas bancárias
  recalculateBalances: async () => {
    console.log('🔄 Iniciando recálculo de saldos...');
    const response = await api.post('/recalculate-balances');
    console.log('✅ Recálculo concluído:', response.data);
    return response.data;
  }
};

// Serviços de busca
export const searchService = {
  // Busca global
  globalSearch: async (query: string) => {
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  }
};
