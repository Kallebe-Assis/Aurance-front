import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token encontrado:', token ? 'Sim' : 'Não');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Configuração da requisição:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na API:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expirado ou inválido - não redirecionar se estiver na página de login
          if (!window.location.pathname.includes('/login')) {
            console.log('Token inválido, redirecionando para login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            toast.error('Sessão expirada. Faça login novamente.');
          }
          break;
        case 403:
          toast.error('Acesso negado.');
          break;
        case 404:
          toast.error('Recurso não encontrado.');
          break;
        case 422:
          // Erro de validação
          const errors = data.error?.details || data.message || 'Erro de validação';
          toast.error(Array.isArray(errors) ? errors.join(', ') : errors);
          break;
        case 500:
          toast.error('Erro interno do servidor.');
          break;
        default:
          toast.error(data.message || 'Erro inesperado.');
      }
    } else if (error.request) {
      console.error('Erro de conexão:', error.request);
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado.');
    }
    
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { data: { user } };
  },

  // Registro
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { data: { user } };
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obter usuário atual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Atualizar perfil
  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/me', userData);
    const { user } = response.data.data;
    
    localStorage.setItem('user', JSON.stringify(user));
    return { data: { user } };
  },

  // Alterar senha
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

// Serviços de despesas
export const expenseService = {
  // Listar despesas
  getExpenses: async (filters?: any) => {
    console.log('📡 expenseService.getExpenses - Filtros:', filters);
    console.log('📡 expenseService.getExpenses - Tipos dos filtros:', Object.entries(filters || {}).map(([key, value]) => ({ key, value, type: typeof value })));
    const response = await api.get('/expenses', { params: filters });
    console.log('📦 expenseService.getExpenses - Resposta:', response.data);
    return response.data;
  },

  // Obter despesa por ID
  getExpense: async (id: string) => {
    console.log('📡 expenseService.getExpense - ID:', id);
    const response = await api.get(`/expenses/${id}`);
    console.log('📦 expenseService.getExpense - Resposta:', response.data);
    return response.data;
  },

  // Criar despesa
  createExpense: async (expenseData: any) => {
    console.log('📡 expenseService.createExpense - Dados:', expenseData);
    const response = await api.post('/expenses', expenseData);
    console.log('📦 expenseService.createExpense - Resposta:', response.data);
    return response.data;
  },

  // Atualizar despesa
  updateExpense: async (id: string, expenseData: any) => {
    console.log('📡 expenseService.updateExpense - ID:', id, 'Dados:', expenseData);
    const response = await api.put(`/expenses/${id}`, expenseData);
    console.log('📦 expenseService.updateExpense - Resposta:', response.data);
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

// Serviços de categorias
export const categoryService = {
  // Listar categorias
  getCategories: async (type?: 'expense' | 'income') => {
    const response = await api.get('/categories', { params: { type } });
    return response.data;
  },

  // Criar categoria
  createCategory: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Atualizar categoria
  updateCategory: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Deletar categoria
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Serviços de subcategorias
export const subcategoryService = {
  // Listar subcategorias
  getSubcategories: async (categoryId?: string) => {
    const response = await api.get('/subcategories', { params: { categoryId } });
    return response.data;
  },

  // Criar subcategoria
  createSubcategory: async (subcategoryData: any) => {
    const response = await api.post('/subcategories', subcategoryData);
    return response.data;
  },

  // Atualizar subcategoria
  updateSubcategory: async (id: string, subcategoryData: any) => {
    const response = await api.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  },

  // Deletar subcategoria
  deleteSubcategory: async (id: string) => {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  }
};

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

export default api;
