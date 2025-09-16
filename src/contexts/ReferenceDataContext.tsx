import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  categoryService, 
  subcategoryService, 
  bankAccountService, 
  creditCardService
} from '../services';
import { 
  Category, 
  Subcategory, 
  BankAccount, 
  CreditCard
} from '../types';
import { useAuth } from './AuthContext';
import { useCategoriesCache, useBankAccountsCache, useCreditCardsCache } from '../hooks/useUnifiedCache';
import toast from 'react-hot-toast';

// Tipos para o contexto de dados de referência
interface ReferenceDataContextType {
  // Dados
  categories: Category[];
  subcategories: Subcategory[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  
  // Estados de loading
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Métodos de atualização
  refreshAllReferenceData: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSubcategories: () => Promise<void>;
  refreshBankAccounts: () => Promise<void>;
  refreshCreditCards: () => Promise<void>;
  
  // Métodos de adição/atualização local
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  
  addSubcategory: (subcategory: Subcategory) => void;
  updateSubcategory: (subcategory: Subcategory) => void;
  removeSubcategory: (id: string) => void;
  
  addBankAccount: (account: BankAccount) => void;
  updateBankAccount: (account: BankAccount) => void;
  removeBankAccount: (id: string) => void;
  
  addCreditCard: (card: CreditCard) => void;
  updateCreditCard: (card: CreditCard) => void;
  removeCreditCard: (id: string) => void;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

interface ReferenceDataProviderProps {
  children: ReactNode;
}

export const ReferenceDataProvider: React.FC<ReferenceDataProviderProps> = ({ children }) => {
  // Estados dos dados de referência
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  
  // Hooks de cache
  const categoriesCache = useCategoriesCache();
  const bankAccountsCache = useBankAccountsCache();
  const creditCardsCache = useCreditCardsCache();

  // Função para carregar subcategorias
  const loadSubcategories = async (categories: Category[]) => {
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
    
    return allSubcategories;
  };

  // Função para carregar todos os dados de referência
  const loadAllReferenceData = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      
      // Carregar dados principais usando cache
      const [
        categoriesResponse,
        bankAccountsResponse,
        creditCardsResponse
      ] = await Promise.allSettled([
        categoriesCache.loadData(() => categoryService.getCategories()),
        bankAccountsCache.loadData(() => bankAccountService.getBankAccounts()),
        creditCardsCache.loadData(() => creditCardService.getCreditCards())
      ]) as PromiseSettledResult<any>[];
      
      // Processar respostas
      const categories = categoriesResponse.status === 'fulfilled' ? categoriesResponse.value.data?.categories || [] : [];
      setCategories(categories);
      
      setBankAccounts(bankAccountsResponse.status === 'fulfilled' ? bankAccountsResponse.value.data?.bankAccounts || [] : []);
      setCreditCards(creditCardsResponse.status === 'fulfilled' ? creditCardsResponse.value.data || [] : []);
      
      // Carregar subcategorias
      const allSubcategories = await loadSubcategories(categories);
      setSubcategories(allSubcategories);
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados de referência:', error);
      toast.error('Erro ao carregar dados de referência. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllReferenceData();
    }
  }, [isAuthenticated, user]);

  // Funções de refresh individuais
  const refreshAllReferenceData = async () => {
    await loadAllReferenceData();
  };

  const refreshCategories = async () => {
    try {
      const response = await categoriesCache.refresh(() => categoryService.getCategories()) as any;
      const categories = response.data?.categories || [];
      setCategories(categories);
      
      // Recarregar subcategorias
      const allSubcategories = await loadSubcategories(categories);
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error('Erro ao atualizar categorias:', error);
    }
  };

  const refreshSubcategories = async () => {
    try {
      const allSubcategories = await loadSubcategories(categories);
      setSubcategories(allSubcategories);
    } catch (error) {
      console.error('Erro ao atualizar subcategorias:', error);
    }
  };

  const refreshBankAccounts = async () => {
    try {
      const response = await bankAccountsCache.refresh(() => bankAccountService.getBankAccounts()) as any;
      setBankAccounts(response.data?.bankAccounts || []);
    } catch (error) {
      console.error('Erro ao atualizar contas bancárias:', error);
    }
  };

  const refreshCreditCards = async () => {
    try {
      const response = await creditCardsCache.refresh(() => creditCardService.getCreditCards()) as any;
      setCreditCards(response.data || []);
    } catch (error) {
      console.error('Erro ao atualizar cartões de crédito:', error);
    }
  };

  // Funções para atualização local
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

  const value: ReferenceDataContextType = {
    // Dados
    categories,
    subcategories,
    bankAccounts,
    creditCards,
    
    // Estados
    isLoading,
    lastUpdated,
    
    // Métodos de refresh
    refreshAllReferenceData,
    refreshCategories,
    refreshSubcategories,
    refreshBankAccounts,
    refreshCreditCards,
    
    // Métodos de atualização local
    addCategory,
    updateCategory,
    removeCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    addCreditCard,
    updateCreditCard,
    removeCreditCard
  };

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
};

// Hook para usar o contexto de dados de referência
export const useReferenceData = (): ReferenceDataContextType => {
  const context = useContext(ReferenceDataContext);
  if (context === undefined) {
    throw new Error('useReferenceData deve ser usado dentro de um ReferenceDataProvider');
  }
  return context;
};
