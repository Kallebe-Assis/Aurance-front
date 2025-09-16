import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  expenseService, 
  incomeService, 
  categoryService, 
  subcategoryService, 
  bankAccountService, 
  creditCardService,
  transferService
} from '../services/api';
import { 
  Expense, 
  Income, 
  Category, 
  Subcategory, 
  BankAccount, 
  CreditCard,
  Transfer
} from '../types';
import { useAuth } from './AuthContext';
import GlobalDataLoading from '../components/GlobalDataLoading';
import toast from 'react-hot-toast';

// Tipos para o contexto
interface DataContextType {
  // Dados
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
  subcategories: Subcategory[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  transfers: Transfer[];
  
  // Estados de loading
  isLoading: boolean;
  isInitialLoad: boolean;
  lastUpdated: Date | null;
  
  // Métodos de atualização
  refreshAllData: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshIncomes: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSubcategories: () => Promise<void>;
  refreshBankAccounts: () => Promise<void>;
  refreshCreditCards: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  
  // Métodos de adição/atualização local
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense, updatedBankAccount?: any) => void;
  removeExpense: (id: string) => void;
  
  addIncome: (income: Income) => void;
  updateIncome: (income: Income, updatedBankAccount?: any) => void;
  removeIncome: (id: string) => void;
  
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  removeBankAccount: (id: string) => void;
  
  addCreditCard: (card: CreditCard) => void;
  updateCreditCard: (card: CreditCard) => void;
  removeCreditCard: (id: string) => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  
  addSubcategory: (subcategory: Subcategory) => void;
  updateSubcategory: (subcategory: Subcategory) => void;
  removeSubcategory: (id: string) => void;
  
  addTransfer: (transfer: Transfer) => void;
  removeTransfer: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Estados dos dados
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<Array<{
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
  }>>([]);
  
  const { user, isAuthenticated } = useAuth();

  // Função para carregar todos os dados
  const loadAllData = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      
      // Definir steps de carregamento
      const steps = [
        { id: 'expenses', label: 'Carregando despesas...', completed: false, current: false },
        { id: 'incomes', label: 'Carregando receitas...', completed: false, current: false },
        { id: 'categories', label: 'Carregando categorias...', completed: false, current: false },
        { id: 'bank-accounts', label: 'Carregando contas bancárias...', completed: false, current: false },
        { id: 'credit-cards', label: 'Carregando cartões de crédito...', completed: false, current: false },
        { id: 'transfers', label: 'Carregando transferências...', completed: false, current: false },
        { id: 'subcategories', label: 'Carregando subcategorias...', completed: false, current: false }
      ];
      setLoadingSteps(steps);
      
      
      // Carregar dados principais em paralelo
      setLoadingProgress(10);
      steps[0].current = true;
      setLoadingSteps([...steps]);
      
      const [
        expensesResponse,
        incomesResponse,
        categoriesResponse,
        bankAccountsResponse,
        creditCardsResponse,
        transfersResponse
      ] = await Promise.allSettled([
        expenseService.getExpenses(),
        incomeService.getIncomes(),
        categoryService.getCategories(),
        bankAccountService.getBankAccounts(),
        creditCardService.getCreditCards(),
        transferService.getTransfers()
      ]);
      
      // Processar respostas
      setExpenses(expensesResponse.status === 'fulfilled' ? expensesResponse.value.data?.expenses || [] : []);
      steps[0].completed = true;
      steps[0].current = false;
      steps[1].completed = true;
      steps[2].completed = true;
      steps[3].completed = true;
      steps[4].completed = true;
      steps[5].completed = true;
      setLoadingProgress(70);
      setLoadingSteps([...steps]);
      
      setIncomes(incomesResponse.status === 'fulfilled' ? incomesResponse.value.data?.incomes || [] : []);
      setBankAccounts(bankAccountsResponse.status === 'fulfilled' ? bankAccountsResponse.value.data?.bankAccounts || [] : []);
      // A API retorna { success: true, data: cards } não { data: { creditCards: [...] } }
      setCreditCards(creditCardsResponse.status === 'fulfilled' ? creditCardsResponse.value.data || [] : []);
      setTransfers(transfersResponse.status === 'fulfilled' ? transfersResponse.value.data?.transfers || [] : []);
      
      // Carregar categorias
      const allCategories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value.data?.categories || [] : [];
      setCategories(allCategories);
      
      // Carregar subcategorias
      steps[6].current = true;
      setLoadingSteps([...steps]);
      setLoadingProgress(85);
      
      const allSubcategories: Subcategory[] = [];
      for (const category of allCategories) {
        try {
          const subcategoriesResponse = await subcategoryService.getSubcategories(category.id);
          if (subcategoriesResponse.data?.subcategories) {
            allSubcategories.push(...subcategoriesResponse.data.subcategories);
          }
        } catch (error) {
          console.error(`Erro ao carregar subcategorias da categoria ${category.id}:`, error);
        }
      }
      setSubcategories(allSubcategories);
      
      // Finalizar
      steps[6].completed = true;
      steps[6].current = false;
      setLoadingProgress(100);
      setLoadingSteps([...steps]);
      
      setLastUpdated(new Date());
      setIsInitialLoad(false);
      
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (isAuthenticated && user && isInitialLoad) {
      loadAllData();
    }
  }, [isAuthenticated, user, isInitialLoad]);

  // Funções de refresh individuais
  const refreshAllData = async () => {
    await loadAllData();
  };

  const refreshExpenses = async () => {
    try {
      const response = await expenseService.getExpenses();
      setExpenses(response.data?.expenses || []);
    } catch (error) {
      console.error('Erro ao atualizar despesas:', error);
    }
  };

  const refreshIncomes = async () => {
    try {
      const response = await incomeService.getIncomes();
      setIncomes(response.data?.incomes || []);
    } catch (error) {
      console.error('Erro ao atualizar receitas:', error);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Erro ao atualizar categorias:', error);
    }
  };

  const refreshSubcategories = async () => {
    try {
      const allSubcategories: Subcategory[] = [];
      for (const category of categories) {
        try {
          const response = await subcategoryService.getSubcategories(category.id);
          if (response.data?.subcategories) {
            allSubcategories.push(...response.data.subcategories);
          }
        } catch (error) {
          console.error(`Erro ao carregar subcategorias da categoria ${category.id}:`, error);
        }
      }
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error('Erro ao atualizar subcategorias:', error);
    }
  };

  const refreshBankAccounts = async () => {
    try {
      const response = await bankAccountService.getBankAccounts();
      setBankAccounts(response.data?.bankAccounts || []);
    } catch (error) {
      console.error('Erro ao atualizar contas bancárias:', error);
    }
  };

  const refreshCreditCards = async () => {
    try {
      const response = await creditCardService.getCreditCards();
      console.log('🔄 Refresh cartões - Resposta:', response);
      // A API retorna { success: true, data: cards } não { data: { creditCards: [...] } }
      setCreditCards(response.data || []);
    } catch (error) {
      console.error('Erro ao atualizar cartões de crédito:', error);
    }
  };

  const refreshTransfers = async () => {
    try {
      const response = await transferService.getTransfers();
      setTransfers(response.data?.transfers || []);
    } catch (error) {
      console.error('Erro ao atualizar transferências:', error);
    }
  };

  // Funções para atualização local (otimização)
  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    
    // Se a despesa está paga e tem conta bancária, atualizar o saldo
    if (expense.isPaid && expense.bankAccountId) {
      console.log('💰 DataContext: Adicionando despesa paga e atualizando saldo:', {
        despesa: expense.description,
        valor: expense.amount,
        contaId: expense.bankAccountId,
        isPaid: expense.isPaid
      });
      
      setBankAccounts(prev => prev.map(account => {
        if (account.id === expense.bankAccountId) {
          const newBalance = account.balance - expense.amount;
          console.log(`💸 Conta ${account.name}: ${account.balance} - ${expense.amount} = ${newBalance}`);
          return { ...account, balance: newBalance };
        }
        return account;
      }));
    }
  };

  const updateExpense = (expense: Expense, updatedBankAccount?: any) => {
    console.log('🔄 DataContext: updateExpense chamado:', {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      isPaid: expense.isPaid,
      bankAccountId: expense.bankAccountId,
      hasUpdatedBankAccount: !!updatedBankAccount
    });
    
    // Encontrar a despesa anterior para comparar valores
    const previousExpense = expenses.find(e => e.id === expense.id);
    const amountChanged = previousExpense && previousExpense.amount !== expense.amount;
    
    setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    
    // Se o backend retornou uma conta bancária atualizada, usar ela
    if (updatedBankAccount) {
      console.log('🏦 DataContext: Atualizando conta bancária com dados do backend:', {
        contaId: updatedBankAccount.id,
        nome: updatedBankAccount.name,
        saldoAnterior: bankAccounts.find(acc => acc.id === updatedBankAccount.id)?.balance,
        saldoNovo: updatedBankAccount.balance
      });
      
      setBankAccounts(prev => prev.map(account => 
        account.id === updatedBankAccount.id ? updatedBankAccount : account
      ));
    } else if (expense.isPaid && expense.bankAccountId) {
      console.log('💰 DataContext: Atualizando saldo da conta bancária (despesa):', {
        despesa: expense.description,
        valor: expense.amount,
        contaId: expense.bankAccountId,
        valorAlterado: amountChanged,
        isPaid: expense.isPaid
      });
      
      // Se o valor foi alterado, precisamos recalcular completamente
      if (amountChanged) {
        console.log('🔄 DataContext: Valor da despesa alterado - recálculo automático será feito pelo backend');
        // O backend já faz o recálculo automático, então não precisamos fazer nada aqui
      } else {
        // Atualização simples do saldo
        setBankAccounts(prev => {
          console.log('🏦 DataContext: Contas antes da atualização:', prev.map(acc => ({ name: acc.name, balance: acc.balance })));
          
          const updated = prev.map(account => {
            if (account.id === expense.bankAccountId) {
              const newBalance = account.balance - expense.amount;
              console.log(`💸 Conta ${account.name}: ${account.balance} - ${expense.amount} = ${newBalance}`);
              return { ...account, balance: newBalance };
            }
            return account;
          });
          
          console.log('🏦 DataContext: Contas depois da atualização:', updated.map(acc => ({ name: acc.name, balance: acc.balance })));
          return updated;
        });
      }
      
      // Forçar re-render do dashboard
      setTimeout(() => {
        console.log('🔄 DataContext: Forçando atualização do dashboard...');
      }, 100);
    } else {
      console.log('❌ DataContext: Despesa não atualiza saldo:', {
        isPaid: expense.isPaid,
        bankAccountId: expense.bankAccountId,
        reason: !expense.isPaid ? 'Despesa não está paga' : 'Sem conta bancária'
      });
    }
  };

  const removeExpense = (id: string) => {
    // Encontrar a despesa antes de removê-la para ajustar o saldo da conta
    const expenseToRemove = expenses.find(e => e.id === id);
    
    setExpenses(prev => prev.filter(e => e.id !== id));
    
    // Se a despesa estava paga e tinha conta bancária, reverter o saldo
    if (expenseToRemove && expenseToRemove.isPaid && expenseToRemove.bankAccountId) {
      setBankAccounts(prev => prev.map(account => 
        account.id === expenseToRemove.bankAccountId 
          ? { ...account, balance: account.balance + expenseToRemove.amount }
          : account
      ));
    }
  };

  const addIncome = (income: Income) => {
    setIncomes(prev => [income, ...prev]);
    
    // Se a receita está recebida e tem conta bancária, atualizar o saldo
    if (income.isReceived && income.bankAccountId) {
      setBankAccounts(prev => prev.map(account => 
        account.id === income.bankAccountId 
          ? { ...account, balance: account.balance + income.amount }
          : account
      ));
    }
  };

  const updateIncome = (income: Income, updatedBankAccount?: any) => {
    console.log('🔄 DataContext: updateIncome chamado:', {
      id: income.id,
      description: income.description,
      amount: income.amount,
      isReceived: income.isReceived,
      bankAccountId: income.bankAccountId,
      hasUpdatedBankAccount: !!updatedBankAccount
    });
    
    // Encontrar a receita anterior para comparar valores
    const previousIncome = incomes.find(i => i.id === income.id);
    const amountChanged = previousIncome && previousIncome.amount !== income.amount;
    
    setIncomes(prev => prev.map(i => i.id === income.id ? income : i));
    
    // Se o backend retornou uma conta bancária atualizada, usar ela
    if (updatedBankAccount) {
      console.log('🏦 DataContext: Atualizando conta bancária com dados do backend:', {
        contaId: updatedBankAccount.id,
        nome: updatedBankAccount.name,
        saldoAnterior: bankAccounts.find(acc => acc.id === updatedBankAccount.id)?.balance,
        saldoNovo: updatedBankAccount.balance
      });
      
      setBankAccounts(prev => prev.map(account => 
        account.id === updatedBankAccount.id ? updatedBankAccount : account
      ));
    } else if (income.isReceived && income.bankAccountId) {
      console.log('💰 DataContext: Atualizando saldo da conta bancária (receita):', {
        receita: income.description,
        valor: income.amount,
        contaId: income.bankAccountId,
        valorAlterado: amountChanged,
        isReceived: income.isReceived
      });
      
      // Se o valor foi alterado, precisamos recalcular completamente
      if (amountChanged) {
        console.log('🔄 DataContext: Valor da receita alterado - recálculo automático será feito pelo backend');
        // O backend já faz o recálculo automático, então não precisamos fazer nada aqui
      } else {
        // Atualização simples do saldo
        setBankAccounts(prev => prev.map(account => 
          account.id === income.bankAccountId 
            ? { ...account, balance: account.balance + income.amount }
            : account
        ));
      }
    } else {
      console.log('❌ DataContext: Receita não atualiza saldo:', {
        isReceived: income.isReceived,
        bankAccountId: income.bankAccountId,
        reason: !income.isReceived ? 'Receita não está recebida' : 'Sem conta bancária'
      });
    }
  };

  const removeIncome = (id: string) => {
    // Encontrar a receita antes de removê-la para ajustar o saldo da conta
    const incomeToRemove = incomes.find(i => i.id === id);
    
    setIncomes(prev => prev.filter(i => i.id !== id));
    
    // Se a receita estava recebida e tinha conta bancária, reverter o saldo
    if (incomeToRemove && incomeToRemove.bankAccountId) {
      let amountToRevert = 0;
      
      if (incomeToRemove.isReceived && !incomeToRemove.isPartial) {
        // Receita totalmente recebida - reverter o valor total
        amountToRevert = incomeToRemove.amount;
      } else if (incomeToRemove.isPartial && incomeToRemove.partialAmount) {
        // Receita parcialmente recebida - reverter apenas a parte paga
        amountToRevert = incomeToRemove.partialAmount;
      }
      
      if (amountToRevert > 0) {
        setBankAccounts(prev => prev.map(account => 
          account.id === incomeToRemove.bankAccountId 
            ? { ...account, balance: account.balance - amountToRevert }
            : account
        ));
      }
    }
  };

  const addBankAccount = (account: BankAccount) => {
    setBankAccounts(prev => [...prev, account]);
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };

  const removeBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addCreditCard = (card: CreditCard) => {
    setCreditCards(prev => [...prev, card]);
  };

  const updateCreditCard = (card: CreditCard) => {
    setCreditCards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const removeCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSubcategory = (subcategory: Subcategory) => {
    setSubcategories(prev => [...prev, subcategory]);
  };

  const updateSubcategory = (subcategory: Subcategory) => {
    setSubcategories(prev => prev.map(s => s.id === subcategory.id ? subcategory : s));
  };

  const removeSubcategory = (id: string) => {
    setSubcategories(prev => prev.filter(s => s.id !== id));
  };

  const addTransfer = (transfer: Transfer) => {
    setTransfers(prev => [transfer, ...prev]);
  };

  const removeTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  const value: DataContextType = {
    // Dados
    expenses,
    incomes,
    categories,
    subcategories,
    bankAccounts,
    creditCards,
    transfers,
    
    // Estados
    isLoading,
    isInitialLoad,
    lastUpdated,
    
    // Métodos de refresh
    refreshAllData,
    refreshExpenses,
    refreshIncomes,
    refreshCategories,
    refreshSubcategories,
    refreshBankAccounts,
    refreshCreditCards,
    refreshTransfers,
    
    // Métodos de atualização local
    addExpense,
    updateExpense,
    removeExpense,
    addIncome,
    updateIncome,
    removeIncome,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    addCreditCard,
    updateCreditCard,
    removeCreditCard,
    addCategory,
    updateCategory,
    removeCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    addTransfer,
    removeTransfer
  };

  return (
    <DataContext.Provider value={value}>
      {children}
      {isLoading && isInitialLoad && (
        <GlobalDataLoading
          message="Preparando seus dados"
          subtitle="Carregando todas as informações para uma experiência mais rápida..."
          progress={loadingProgress}
          steps={loadingSteps}
        />
      )}
    </DataContext.Provider>
  );
};

// Hook para usar o contexto
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};
