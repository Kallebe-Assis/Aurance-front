import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  expenseService, 
  incomeService, 
  transferService
} from '../services';
import { 
  Expense, 
  Income, 
  Transfer
} from '../types';
import { useAuth } from './AuthContext';
import { useExpensesCache, useIncomesCache, useTransfersCache } from '../hooks/useUnifiedCache';
import toast from 'react-hot-toast';

// Tipos para o contexto financeiro
interface FinancialDataContextType {
  // Dados
  expenses: Expense[];
  incomes: Income[];
  transfers: Transfer[];
  
  // Estados de loading
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Métodos de atualização
  refreshAllFinancialData: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshIncomes: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  
  // Métodos de adição/atualização local
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense, updatedBankAccount?: any) => void;
  removeExpense: (id: string) => void;
  
  addIncome: (income: Income) => void;
  updateIncome: (income: Income, updatedBankAccount?: any) => void;
  removeIncome: (id: string) => void;
  
  addTransfer: (transfer: Transfer) => void;
  removeTransfer: (id: string) => void;
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

interface FinancialDataProviderProps {
  children: ReactNode;
}

export const FinancialDataProvider: React.FC<FinancialDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Hooks de cache
  const expensesCache = useExpensesCache();
  const incomesCache = useIncomesCache();
  const transfersCache = useTransfersCache();

  // Carregar todos os dados financeiros
  const refreshAllFinancialData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Carregar dados usando cache
      const responses = await Promise.allSettled([
        expensesCache.loadData(() => expenseService.getExpenses()),
        incomesCache.loadData(() => incomeService.getIncomes()),
        transfersCache.loadData(() => transferService.getTransfers())
      ]) as PromiseSettledResult<any>[];
      
      // Processar respostas
      setExpenses(responses[0].status === 'fulfilled' ? responses[0].value.data?.expenses || [] : []);
      setIncomes(responses[1].status === 'fulfilled' ? responses[1].value.data?.incomes || [] : []);
      setTransfers(responses[2].status === 'fulfilled' ? responses[2].value.data?.transfers || [] : []);
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar despesas
  const refreshExpenses = async () => {
    if (!user) return;
    
    try {
      const data = await expensesCache.loadData(() => expenseService.getExpenses()) as any;
      setExpenses(data.data?.expenses || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas. Tente novamente.');
    }
  };

  // Carregar receitas
  const refreshIncomes = async () => {
    if (!user) return;
    
    try {
      const data = await incomesCache.loadData(() => incomeService.getIncomes()) as any;
      setIncomes(data.data?.incomes || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas. Tente novamente.');
    }
  };

  // Carregar transferências
  const refreshTransfers = async () => {
    if (!user) return;
    
    try {
      const data = await transfersCache.loadData(() => transferService.getTransfers()) as any;
      setTransfers(data.data?.transfers || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Erro ao carregar transferências:', error);
      toast.error('Erro ao carregar transferências. Tente novamente.');
    }
  };

  // Métodos de adição/atualização local
  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const updateExpense = (expense: Expense, updatedBankAccount?: any) => {
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addIncome = (income: Income) => {
    setIncomes(prev => [income, ...prev]);
  };

  const updateIncome = (income: Income, updatedBankAccount?: any) => {
    setIncomes(prev => prev.map(i => i.id === income.id ? income : i));
  };

  const removeIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const addTransfer = (transfer: Transfer) => {
    setTransfers(prev => [transfer, ...prev]);
  };

  const removeTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  // Carregar dados na inicialização
  useEffect(() => {
    if (user) {
      refreshAllFinancialData();
    }
  }, [user]);

  const value: FinancialDataContextType = {
    expenses,
    incomes,
    transfers,
    isLoading,
    lastUpdated,
    refreshAllFinancialData,
    refreshExpenses,
    refreshIncomes,
    refreshTransfers,
    addExpense,
    updateExpense,
    removeExpense,
    addIncome,
    updateIncome,
    removeIncome,
    addTransfer,
    removeTransfer
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData deve ser usado dentro de um FinancialDataProvider');
  }
  return context;
};
