import axios from 'axios';
import { ExpenseCard } from '../types';
import { formatDateToLocalISO } from '../utils/dateUtils';

const API_URL = 'https://aurance-back-end.vercel.app/api/expenses-cards';

// Configurar axios com token de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const expenseCardService = {
  // Buscar despesas de cartão
  async getExpenseCards(creditCardId?: string): Promise<ExpenseCard[]> {
    try {
      const params = creditCardId ? { creditCardId } : {};
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
        params
      });
      console.log('🔍 expenseCardService.getExpenseCards - Resposta da API:', response.data);
      return response.data.data.expenses || [];
    } catch (error: any) {
      console.error('Erro ao buscar despesas de cartão:', error);
      throw error;
    }
  },

  // Criar despesa de cartão
  async createExpenseCard(expenseData: Partial<ExpenseCard>): Promise<ExpenseCard> {
    try {
      const response = await axios.post(API_URL, expenseData, {
        headers: getAuthHeaders()
      });
      return response.data.data.expense;
    } catch (error: any) {
      console.error('Erro ao criar despesa de cartão:', error.response?.data || error.message);
      throw error;
    }
  },

  // Atualizar despesa de cartão
  async updateExpenseCard(id: string, expenseData: Partial<ExpenseCard>): Promise<ExpenseCard> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, expenseData, {
        headers: getAuthHeaders()
      });
      return response.data.data.expense;
    } catch (error: any) {
      console.error('Erro ao atualizar despesa de cartão:', error);
      throw error;
    }
  },

  // Deletar despesa de cartão
  async deleteExpenseCard(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
    } catch (error: any) {
      console.error('Erro ao deletar despesa de cartão:', error);
      throw error;
    }
  },

  // Atualizar métricas de todos os cartões
  async updateMetrics(selectedMonth?: Date): Promise<void> {
    try {
      const data = selectedMonth ? { selectedMonth: formatDateToLocalISO(selectedMonth) } : {};
      await axios.post(`${API_URL}/update-metrics`, data, {
        headers: getAuthHeaders()
      });
    } catch (error: any) {
      console.error('Erro ao atualizar métricas:', error);
      throw error;
    }
  },

  // Pagar fatura do cartão
  async payBill(creditCardId: string, selectedMonth?: Date, paymentAmount?: number): Promise<any> {
    try {
      const data = {
        creditCardId,
        selectedMonth: selectedMonth ? formatDateToLocalISO(selectedMonth) : null,
        paymentAmount
      };
      const response = await axios.post(`${API_URL}/pay-bill`, data, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao pagar fatura:', error);
      throw error;
    }
  }
};
