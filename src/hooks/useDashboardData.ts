import { useState, useEffect, useMemo } from 'react';
import { useDashboardCache } from './useDashboardCache';
import { startOfMonth, endOfMonth, subMonths, format, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, Category, Subcategory, CreditCard } from '../types';

interface DashboardData {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  creditCards: CreditCard[];
  loading: boolean;
  error: string | null;
}

interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  color: string;
}

interface MonthlyStats {
  month: string;
  monthName: string;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  transactionCount: number;
}

interface SubcategoryStats {
  subcategoryId: string;
  subcategoryName: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

interface CreditCardStats {
  cardId: string;
  cardName: string;
  totalSpent: number;
  currentBill: number;
  availableLimit: number;
  usagePercentage: number;
}

export function useDashboardData(selectedPeriod: { start: Date; end: Date }) {
  const { loadDataWithCache, loading: cacheLoading } = useDashboardCache();
  const [data, setData] = useState<DashboardData>({
    transactions: [],
    categories: [],
    subcategories: [],
    creditCards: [],
    loading: true,
    error: null
  });

  // Helper function para processar datas do Firestore
  const parseFirestoreDate = (dateField: any): Date | null => {
    if (!dateField) return null;
    
    try {
      // Se for um objeto Firestore timestamp
      if (dateField._seconds) {
        return new Date(dateField._seconds * 1000);
      } else if (typeof dateField === 'string') {
        return new Date(dateField);
      } else if (dateField instanceof Date) {
        return dateField;
      } else {
        return new Date(dateField);
      }
    } catch (error) {
      console.log('❌ Erro ao processar data:', dateField, error);
      return null;
    }
  };

  // Helper function para filtrar transações por período
  const filterTransactionsByPeriod = (transactions: any[]) => {
    console.log('🔍 Filtrando transações por período:', {
      totalTransacoes: transactions.length,
      periodoInicio: selectedPeriod.start.toISOString(),
      periodoFim: selectedPeriod.end.toISOString()
    });

    const filtered = transactions.filter(t => {
      if (!t) return false;
      
      // Tentar diferentes campos de data
      let dateField = t.dueDate || t.receivedDate || t.paymentDate;
      if (!dateField) {
        console.log('❌ Transação sem data:', t.description);
        return false;
      }
      
      const transactionDate = parseFirestoreDate(dateField);
      if (!transactionDate) {
        console.log('❌ Data inválida para transação:', t.description, 'Data:', dateField);
        return false;
      }
      
      const isInPeriod = transactionDate >= selectedPeriod.start && transactionDate <= selectedPeriod.end;
      
      if (!isInPeriod) {
        console.log('📅 Transação fora do período:', {
          descricao: t.description,
          dataTransacao: transactionDate.toISOString(),
          periodoInicio: selectedPeriod.start.toISOString(),
          periodoFim: selectedPeriod.end.toISOString()
        });
      }
      
      return isInPeriod;
    });

    console.log('✅ Transações filtradas:', filtered.length, 'de', transactions.length);
    return filtered;
  };

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Carregando dados do dashboard...');
        setData(prev => ({ ...prev, loading: true, error: null }));

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token de autenticação não encontrado');
        }

        // REQUISIÇÕES DIRETAS AO BANCO - SEM CACHE
        console.log('📡 Fazendo requisições diretas ao banco de dados...');

        // 1. BUSCAR DESPESAS
        console.log('🔍 Buscando despesas...');
        const expensesResponse = await fetch('https://aurance-back-end.vercel.app/api/expenses?excludeCreditCard=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!expensesResponse.ok) {
          throw new Error(`Erro na API de despesas: ${expensesResponse.status} - ${expensesResponse.statusText}`);
        }
        
        const expensesData = await expensesResponse.json();
        const expenses = expensesData.data?.expenses || expensesData.expenses || [];
        console.log('✅ Despesas carregadas:', expenses.length);
        console.log('📋 Primeiras despesas:', expenses.slice(0, 2));

        // 2. BUSCAR RECEITAS
        console.log('🔍 Buscando receitas...');
        const incomesResponse = await fetch('https://aurance-back-end.vercel.app/api/incomes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!incomesResponse.ok) {
          throw new Error(`Erro na API de receitas: ${incomesResponse.status} - ${incomesResponse.statusText}`);
        }
        
        const incomesData = await incomesResponse.json();
        const incomes = incomesData.data?.incomes || incomesData.incomes || [];
        console.log('✅ Receitas carregadas:', incomes.length);
        console.log('📋 Primeiras receitas:', incomes.slice(0, 2));

        // 3. BUSCAR CATEGORIAS
        console.log('🔍 Buscando categorias...');
        const categoriesResponse = await fetch('https://aurance-back-end.vercel.app/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!categoriesResponse.ok) {
          throw new Error(`Erro na API de categorias: ${categoriesResponse.status} - ${categoriesResponse.statusText}`);
        }
        
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.data?.categories || categoriesData.categories || [];
        console.log('✅ Categorias carregadas:', categories.length);

        // 4. BUSCAR SUBCATEGORIAS
        console.log('🔍 Buscando subcategorias...');
        const subcategoriesResponse = await fetch('https://aurance-back-end.vercel.app/api/subcategories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!subcategoriesResponse.ok) {
          throw new Error(`Erro na API de subcategorias: ${subcategoriesResponse.status} - ${subcategoriesResponse.statusText}`);
        }
        
        const subcategoriesData = await subcategoriesResponse.json();
        const subcategories = subcategoriesData.data?.subcategories || subcategoriesData.subcategories || [];
        console.log('✅ Subcategorias carregadas:', subcategories.length);

        // 5. BUSCAR CARTÕES DE CRÉDITO
        console.log('🔍 Buscando cartões de crédito...');
        const creditCardsResponse = await fetch('https://aurance-back-end.vercel.app/api/credit-cards', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!creditCardsResponse.ok) {
          throw new Error(`Erro na API de cartões: ${creditCardsResponse.status} - ${creditCardsResponse.statusText}`);
        }
        
        const creditCardsData = await creditCardsResponse.json();
        const creditCards = creditCardsData.data?.creditCards || creditCardsData.creditCards || [];
        console.log('✅ Cartões carregados:', creditCards.length);

        // COMBINAR DADOS E CORRIGIR TIPOS
        const allTransactions = [
          ...expenses.map((expense: any) => ({ ...expense, type: 'expense' })),
          ...incomes.map((income: any) => ({ ...income, type: 'income' }))
        ];
        
        console.log('📊 RESUMO DOS DADOS CARREGADOS:', {
          totalDespesas: expenses.length,
          totalReceitas: incomes.length,
          totalTransacoes: allTransactions.length,
          totalCategorias: categories.length,
          totalSubcategorias: subcategories.length,
          totalCartoes: creditCards.length
        });

        // ANÁLISE DETALHADA DAS TRANSAÇÕES
        console.log('🔍 ANÁLISE DAS TRANSAÇÕES:');
        allTransactions.forEach((t, index) => {
          console.log(`Transação ${index + 1}:`, {
            id: t.id,
            description: t.description,
            type: t.type,
            amount: t.amount,
            dueDate: t.dueDate,
            receivedDate: t.receivedDate,
            paymentDate: t.paymentDate,
            isPaid: t.isPaid,
            categoryId: t.categoryId,
            subcategoryId: t.subcategoryId
          });
        });

        setData({
          transactions: allTransactions,
          categories,
          subcategories,
          creditCards,
          loading: false,
          error: null
        });

        console.log('✅ DADOS CARREGADOS COM SUCESSO NO DASHBOARD!');

      } catch (error) {
        console.error('❌ ERRO CRÍTICO ao carregar dados do dashboard:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro crítico ao carregar dados do dashboard'
        }));
      }
    };

    loadData();
  }, [selectedPeriod]);

  // Estatísticas por categoria
  const categoryStats = useMemo((): CategoryStats[] => {
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return [];
    }

    // Filtrar transações do período selecionado
    const periodTransactions = filterTransactionsByPeriod(data.transactions);

    const expenses = periodTransactions.filter(t => 
      t && 
      t.type === 'expense' && 
      typeof t.amount === 'number' && 
      t.amount > 0 &&
      t.isPaid === true
    );
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId || 'uncategorized';
      const category = data.categories?.find(c => c && c.id === categoryId);
      const categoryName = category?.name || 'Sem categoria';
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          totalAmount: 0,
          transactionCount: 0,
          color: category?.color || '#6B7280'
        };
      }
      
      acc[categoryId].totalAmount += transaction.amount;
      acc[categoryId].transactionCount += 1;
      
      return acc;
    }, {} as Record<string, Omit<CategoryStats, 'percentage'>>);

    const totalAmount = Object.values(categoryTotals).reduce((sum, cat: any) => sum + cat.totalAmount, 0) as number;

    const result = Object.values(categoryTotals)
      .map((cat: any) => ({
        ...cat,
        percentage: totalAmount > 0 ? (cat.totalAmount / totalAmount) * 100 : 0
      }))
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount);
    
    console.log('📂 Estatísticas por categoria:', result);
    
    return result;
  }, [data.transactions, data.categories, selectedPeriod]);

  // Estatísticas mensais
  const monthlyStats = useMemo((): MonthlyStats[] => {
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return [];
    }

    const months = eachMonthOfInterval({
      start: selectedPeriod.start,
      end: selectedPeriod.end
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = data.transactions.filter(t => {
        if (!t || !t.dueDate) return false;
        try {
          const transactionDate = new Date(t.dueDate);
          return !isNaN(transactionDate.getTime()) && transactionDate >= monthStart && transactionDate <= monthEnd;
        } catch {
          return false;
        }
      });

      const expenses = monthTransactions.filter(t => 
        t && 
        t.type === 'expense' && 
        t.isPaid && 
        typeof t.amount === 'number' && 
        t.amount > 0
      );
      const incomes = monthTransactions.filter(t => 
        t && 
        t.type === 'income' && 
        t.isPaid && 
        typeof t.amount === 'number' && 
        t.amount > 0
      );

      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'yyyy-MM'),
        monthName: format(month, 'MMM/yyyy', { locale: ptBR }),
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
        transactionCount: monthTransactions.length
      };
    });
  }, [data.transactions, selectedPeriod]);

  // Estatísticas por subcategoria
  const subcategoryStats = useMemo((): SubcategoryStats[] => {
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return [];
    }

    // Filtrar transações do período selecionado
    const periodTransactions = filterTransactionsByPeriod(data.transactions);

    const expenses = periodTransactions.filter(t => 
      t && 
      t.type === 'expense' && 
      t.subcategoryId && 
      typeof t.amount === 'number' && 
      t.amount > 0 &&
      t.isPaid === true
    );
    
    const subcategoryTotals = expenses.reduce((acc, transaction) => {
      const subcategoryId = transaction.subcategoryId!;
      const subcategory = data.subcategories?.find(s => s && s.id === subcategoryId);
      const category = data.categories?.find(c => c && c.id === subcategory?.categoryId);
      
      if (!acc[subcategoryId]) {
        acc[subcategoryId] = {
          subcategoryId,
          subcategoryName: subcategory?.name || 'Sem subcategoria',
          categoryName: category?.name || 'Sem categoria',
          totalAmount: 0,
          transactionCount: 0
        };
      }
      
      acc[subcategoryId].totalAmount += transaction.amount;
      acc[subcategoryId].transactionCount += 1;
      
      return acc;
    }, {} as Record<string, Omit<SubcategoryStats, 'percentage'>>);

    const totalAmount = Object.values(subcategoryTotals).reduce((sum, sub: any) => sum + sub.totalAmount, 0) as number;

    return Object.values(subcategoryTotals)
      .map((sub: any) => ({
        ...sub,
        percentage: totalAmount > 0 ? (sub.totalAmount / totalAmount) * 100 : 0
      }))
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 10); // Top 10 subcategorias
  }, [data.transactions, data.subcategories, data.categories, selectedPeriod]);

  // Estatísticas de cartões de crédito
  const creditCardStats = useMemo((): CreditCardStats[] => {
    if (!data.creditCards || !Array.isArray(data.creditCards)) {
      return [];
    }

    return data.creditCards
      .filter(card => card && card.id && card.name)
      .map(card => ({
        cardId: card.id,
        cardName: card.name,
        totalSpent: typeof card.totalSpent === 'number' ? card.totalSpent : 0,
        currentBill: typeof card.currentBill === 'number' ? card.currentBill : 0,
        availableLimit: typeof card.availableLimit === 'number' ? card.availableLimit : 0,
        usagePercentage: card.limit && typeof card.limit === 'number' && card.limit > 0 
          ? ((card.currentBalance || 0) / card.limit) * 100 
          : 0
      }));
  }, [data.creditCards]);

  // Resumo geral
  const summaryStats = useMemo(() => {
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        balance: 0,
        transactionCount: 0,
        expenseCount: 0,
        incomeCount: 0
      };
    }

    // Filtrar transações do período selecionado
    const periodTransactions = filterTransactionsByPeriod(data.transactions);

    console.log('🔍 PROCESSANDO RESUMO GERAL:');
    console.log('📋 Transações do período:', periodTransactions.length);
    console.log('📋 Todas as transações:', data.transactions.length);
    
    // Log detalhado de cada transação do período
    periodTransactions.forEach((t, index) => {
      console.log(`Transação ${index + 1} do período:`, {
        description: t.description,
        type: t.type,
        amount: t.amount,
        isPaid: t.isPaid
      });
    });

    // Filtro temporário para debug - vamos ver o que está acontecendo
    const expenses = periodTransactions.filter(t => 
      t && 
      t.type === 'expense' && 
      typeof t.amount === 'number' && 
      t.amount > 0 &&
      (t.isPaid === true || t.isPaid === undefined) // Temporário: incluir undefined
    );
    const incomes = periodTransactions.filter(t => 
      t && 
      t.type === 'income' && 
      typeof t.amount === 'number' && 
      t.amount > 0 &&
      (t.isPaid === true || t.isPaid === undefined) // Temporário: incluir undefined
    );
    
    console.log('💰 Despesas PAGAS filtradas:', expenses.length);
    console.log('💰 Receitas RECEBIDAS filtradas:', incomes.length);
    
    // Log detalhado das transações do período
    console.log('🔍 TRANSAÇÕES DO PERÍODO (antes do filtro isPaid):');
    periodTransactions.forEach((t, index) => {
      console.log(`Transação ${index + 1}:`, {
        description: t.description,
        type: t.type,
        amount: t.amount,
        isPaid: t.isPaid,
        dueDate: t.dueDate,
        receivedDate: t.receivedDate,
        paymentDate: t.paymentDate
      });
    });
    
    expenses.forEach((expense, index) => {
      console.log(`Despesa PAGA ${index + 1}:`, {
        description: expense.description,
        amount: expense.amount,
        type: expense.type,
        isPaid: expense.isPaid
      });
    });
    
    incomes.forEach((income, index) => {
      console.log(`Receita RECEBIDA ${index + 1}:`, {
        description: income.description,
        amount: income.amount,
        type: income.type,
        isPaid: income.isPaid
      });
    });
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    console.log('📊 Estatísticas do período:', {
      totalTransactions: data.transactions.length,
      periodTransactions: periodTransactions.length,
      expenses: expenses.length,
      incomes: incomes.length,
      totalExpenses,
      totalIncome,
      balance,
      periodStart: selectedPeriod.start.toISOString(),
      periodEnd: selectedPeriod.end.toISOString()
    });
    
    return {
      totalExpenses,
      totalIncome,
      balance,
      transactionCount: periodTransactions.length,
      expenseCount: expenses.length,
      incomeCount: incomes.length
    };
  }, [data.transactions, selectedPeriod]);

  return {
    ...data,
    categoryStats,
    monthlyStats,
    subcategoryStats,
    creditCardStats,
    summaryStats
  };
}
