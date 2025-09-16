import api from './api';

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
