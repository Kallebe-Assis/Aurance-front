import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';

/**
 * HOOK UNIFICADO PARA TRANSAÇÕES
 * Substitui toda a lógica duplicada de CRUD em todas as páginas
 * Suporta: Despesas, receitas, despesas de cartão
 */

interface UseTransactionsOptions {
  type?: 'expense' | 'income' | 'creditCard';
  creditCardId?: string;
  referenceMonth?: string;
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  // Estados
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  
  // Ações CRUD
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  
  // Ações específicas
  createInstallment: (data: Partial<Transaction>, installments: number) => Promise<Transaction[]>;
  updateMetrics: (selectedMonth?: Date) => Promise<void>;
  
  // Estados de loading específicos
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export const useTransactions = (options: UseTransactionsOptions = {}): UseTransactionsReturn => {
  const { type, creditCardId, referenceMonth, autoFetch = true } = options;
  
  // Estados principais
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de loading específicos
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Função para buscar transações
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (creditCardId) params.append('creditCardId', creditCardId);
      if (referenceMonth) params.append('referenceMonth', referenceMonth);
      
      const response = await fetch(`/api/transactions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }
      
      const data = await response.json();
      setTransactions(data.data.transactions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [type, creditCardId, referenceMonth]);

  // Função para criar transação
  const createTransaction = useCallback(async (data: Partial<Transaction>): Promise<Transaction> => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }
      
      const result = await response.json();
      const newTransaction = result.data.transaction;
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  // Função para atualizar transação
  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }
      
      const result = await response.json();
      const updatedTransaction = result.data.transaction;
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      
      return updatedTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar transação');
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Função para deletar transação
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setDeleting(true);
      setError(null);
      
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao deletar transação');
      }
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar transação');
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  // Função para criar parcelamento
  const createInstallment = useCallback(async (data: Partial<Transaction>, installments: number): Promise<Transaction[]> => {
    try {
      setCreating(true);
      setError(null);
      
      const installmentTransactions = [];
      
      for (let i = 1; i <= installments; i++) {
        const installmentData = {
          ...data,
          installmentNumber: i,
          totalInstallments: installments,
          originalAmount: data.amount,
          amount: data.amount ? data.amount / installments : 0,
          description: `${data.description} (${i}/${installments})`
        };
        
        installmentTransactions.push(installmentData);
      }
      
      const response = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactions: installmentTransactions })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar parcelamento');
      }
      
      const result = await response.json();
      const newTransactions = result.data.transactions;
      
      setTransactions(prev => [...newTransactions, ...prev]);
      return newTransactions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar parcelamento');
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  // Função para atualizar métricas
  const updateMetrics = useCallback(async (selectedMonth?: Date): Promise<void> => {
    try {
      setError(null);
      
      const body = selectedMonth ? { selectedMonth: selectedMonth.toISOString() } : {};
      
      const response = await fetch('/api/transactions/update-metrics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar métricas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar métricas');
      throw err;
    }
  }, []);

  // Função para refresh
  const refreshTransactions = useCallback(async (): Promise<void> => {
    await fetchTransactions();
  }, [fetchTransactions]);

  // Auto-fetch quando dependências mudarem
  useEffect(() => {
    if (autoFetch) {
      fetchTransactions();
    }
  }, [fetchTransactions, autoFetch]);

  return {
    // Estados
    transactions,
    loading,
    error,
    
    // Ações CRUD
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    
    // Ações específicas
    createInstallment,
    updateMetrics,
    
    // Estados de loading específicos
    creating,
    updating,
    deleting
  };
};
