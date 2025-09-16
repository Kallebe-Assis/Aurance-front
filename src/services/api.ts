import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base do axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://aurance-back-end.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

export default api;