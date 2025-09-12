import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FiHome,
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCreditCard,
  FiTool,
  FiAlertTriangle,
  FiMoreVertical
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import FloatingActionButton from '../components/FloatingActionButton';
import { PieChart, BarChart, LineChart } from '../components/charts';

// ========================================
// FUNÇÃO PARA FORMATAR MOEDA
// ========================================
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// ========================================
// COMPONENTES ESTILIZADOS SIMPLES
// ========================================

// Container principal do dashboard
const Container = styled.div`
  padding: 0.75rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--gray-200);
  min-height: 100vh;
`;

// Cabeçalho com título e botão
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Container para botões do header
const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// Botão de recalcular
const RecalculateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

// Seletor de período
const PeriodSelector = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PeriodLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
`;

const PeriodSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  background: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 66, 134, 0.1);
  }

  &:hover {
    border-color: var(--gray-400);
  }
`;

// Grid para os cards de resumo
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

// Card individual
const Card = styled.div<{ bgColor?: string; borderColor?: string }>`
  background: ${props => props.bgColor || 'white'};
  border-radius: 4px;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: ${props => props.borderColor ? `1px solid ${props.borderColor}` : 'none'};
  min-height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  /* Barra colorida no topo */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.borderColor || 'transparent'};
    border-radius: 4px 4px 0 0;
  }
`;

// Ícone do card
const CardIcon = styled.div<{ color: string }>`
  width: 18px;
  height: 18px;
  border-radius: 3px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  color: white;
  font-size: var(--font-size-xs);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
`;

// Valor do card
const CardValue = styled.div<{ color?: string }>`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: ${props => props.color || 'var(--gray-800)'};
  margin-bottom: 0.125rem;
  line-height: var(--line-height-tight);
`;

// Label do card
const CardLabel = styled.div`
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

// Grid para as seções principais
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Card principal (maior)
const MainCard = styled(Card)`
  padding: 1.25rem;
  min-height: auto;
`;

// Card específico para cartões de crédito (altura dinâmica)
const CreditCardMainCard = styled(Card)<{ itemCount: number }>`
  padding: 1.25rem;
  min-height: ${props => {
    // Altura base: header + padding
    const baseHeight = 120; // Header + padding
    // Altura por item: 40px (CreditCardItem com padding)
    const itemHeight = 40;
    // Altura total baseada na quantidade de itens
    return `${baseHeight + (props.itemCount * itemHeight)}px`;
  }};
  max-height: ${props => {
    // Altura máxima para evitar cards muito altos
    const maxItems = 6;
    const baseHeight = 120;
    const itemHeight = 40;
    return `${baseHeight + (Math.min(props.itemCount, maxItems) * itemHeight)}px`;
  }};
  overflow-y: ${props => props.itemCount > 6 ? 'auto' : 'visible'};
`;

// Cabeçalho do card principal
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Botão de menu (três pontos)
const MenuButton = styled.button`
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100);
    color: var(--gray-600);
  }
`;

// Item da lista de contas
const AccountItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--gray-100);
  min-width: 0;

  &:last-child {
    border-bottom: none;
    font-weight: 700;
    background: var(--gray-50);
    margin: 0 -1.25rem -1.25rem -1.25rem;
    padding: 1.25rem 1.25rem;
    border-radius: 0 0 12px 12px;
  }
`;

// Item da lista de cartões de crédito (menor)
const CreditCardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0; /* Reduzido de 1rem para 0.5rem */
  border-bottom: 1px solid var(--gray-100);
  min-width: 0;

  &:last-child {
    border-bottom: none;
    font-weight: 700;
    background: var(--gray-50);
    margin: 0 -1.25rem -1.25rem -1.25rem;
    padding: 0.75rem 1.25rem; /* Reduzido de 1.25rem para 0.75rem */
    border-radius: 0 0 12px 12px;
  }
`;

// Informações da conta
const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Ícone da conta
const AccountIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
`;

// Detalhes da conta
const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountName = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-800);
  margin-bottom: 0.25rem;
`;

const AccountInitial = styled.div`
  font-size: var(--font-size-xs);
  color: var(--gray-500);
`;

// Valor da conta
const AccountValue = styled.div<{ color?: string }>`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: ${props => props.color || 'var(--gray-800)'};
  text-align: right;
  min-width: 0;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

// Componentes específicos para cartões de crédito (menores)
const CreditCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduzido de 1rem */
`;

const CreditCardIcon = styled.div<{ color: string }>`
  width: 28px; /* Reduzido de 36px */
  height: 28px; /* Reduzido de 36px */
  border-radius: 6px; /* Reduzido de 8px */
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.75rem; /* Reduzido de 0.875rem */
`;

const CreditCardDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CreditCardName = styled.div`
  font-size: 0.75rem; /* Reduzido de 1rem */
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.125rem; /* Reduzido de 0.25rem */
`;

const CreditCardInitial = styled.div`
  font-size: 0.625rem; /* Reduzido de 0.75rem */
  color: var(--gray-500);
`;

const CreditCardValue = styled.div<{ color?: string }>`
  font-size: 0.875rem; /* Reduzido de 1.125rem */
  font-weight: 700;
  color: ${props => props.color || 'var(--gray-800)'};
  text-align: right;
  min-width: 0;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
`;

// Componentes para lista de categorias
const CategoriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;

  &:hover {
    background: var(--gray-100);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CategoryIcon = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const CategoryName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-800);
`;

const CategoryRank = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

const CategoryValues = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
`;

const CategoryAmount = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gray-800);
`;

const CategoryPercentage = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  background: var(--primary-color)10;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
`;

// ========================================
// COMPONENTES PARA GRÁFICOS E ESTATÍSTICAS
// ========================================

// Seção de estatísticas
const StatsSection = styled.div`
  margin-top: 1.5rem;
`;

// Grid para estatísticas
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

// Card de estatística
const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

// Valor da estatística
const StatValue = styled.div<{ color?: string }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.color || 'var(--gray-800)'};
  margin-bottom: 0.25rem;
`;

// Label da estatística
const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--gray-600);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Mudança da estatística
const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 0.625rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-weight: 600;
  margin-top: 0.25rem;
`;

// Seção de gráficos
const ChartsSection = styled.div`
  margin-top: 1.5rem;
`;

// Grid para gráficos
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

// Card do gráfico
const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
`;

// ========================================
// COMPONENTE PRINCIPAL DO DASHBOARD
// ========================================
export default function Dashboard() {
  // Hook para acessar os dados do contexto
  const { expenses, incomes, bankAccounts, creditCards, categories, updateBankAccount } = useData();
  
  // Estados para os modais
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateProgress, setRecalculateProgress] = useState(0);
  
  // Estado para o período selecionado
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | '3months' | '6months' | '1year'>('current');

  // ========================================
  // FUNÇÃO PARA CALCULAR PERÍODO
  // ========================================
  const getPeriodDates = (period: string) => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'current':
        // Mês atual
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case '3months':
        // Últimos 3 meses
        start.setMonth(now.getMonth() - 2);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case '6months':
        // Últimos 6 meses
        start.setMonth(now.getMonth() - 5);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case '1year':
        // Último ano
        start.setFullYear(now.getFullYear() - 1);
        start.setMonth(now.getMonth());
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }
    
    return { start, end: now };
  };

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================
  
  // Converter Firebase Timestamp para Date
  const convertToDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'object') {
      if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
      if (dateValue.toDate) return dateValue.toDate();
      if (dateValue._seconds) return new Date(dateValue._seconds * 1000);
    }
    
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  };

  // Verificar se data está no período
  const isDateInPeriod = (date: Date | null, start: Date, end: Date): boolean => {
    return date ? date >= start && date <= end : false;
  };

  // ========================================
  // CÁLCULOS DOS TOTAIS (useMemo para performance)
  // ========================================
  const totals = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    
    // Calcular despesas
    const totalExpenses = expenses
      .filter(expense => 
        expense.amount > 0 && 
        expense.isPaid && 
        isDateInPeriod(convertToDate(expense.paidDate), start, end)
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calcular receitas
    const totalIncomes = incomes
      .filter(income => 
        income.amount > 0 && 
        income.isReceived && 
        isDateInPeriod(convertToDate(income.receivedDate), start, end)
      )
      .reduce((sum, income) => sum + income.amount, 0);
    
    // Soma todos os saldos das contas bancárias (NÃO filtrado por período - estado atual)
    const totalBankBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Soma todas as faturas atuais dos cartões de crédito (NÃO filtrado por período - estado atual)
    const totalCreditCardDebt = creditCards.reduce((sum, card) => 
      sum + (card.currentBill || card.currentBalance || 0), 0
    );
    
    return {
      totalExpenses,
      totalIncomes,
      totalBankBalance,
      totalCreditCardDebt,
      netWorth: totalBankBalance - totalCreditCardDebt
    };
  }, [expenses, incomes, bankAccounts, creditCards, selectedPeriod]);

  // ========================================
  // FUNÇÃO SIMPLES PARA GRÁFICO
  // ========================================
  const recalculateMonthlyData = () => {
    
    // Determinar quantos meses mostrar
    let monthsToShow = 1;
    switch (selectedPeriod) {
      case 'current': monthsToShow = 1; break;
      case '3months': monthsToShow = 3; break;
      case '6months': monthsToShow = 6; break;
      case '1year': monthsToShow = 12; break;
    }
    
    // Criar array dos meses
    const currentDate = new Date();
    const months: Array<{ key: string; name: string; receitas: number; despesas: number }> = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      months.push({
        key: monthKey,
        name: monthName,
        receitas: 0,
        despesas: 0
      });
    }
    
    // SOMAR RECEITAS POR MÊS
    incomes.forEach(income => {
      if (!income.amount || !income.isReceived) return;
      
      const receivedDate = convertToDate(income.receivedDate);
      if (!receivedDate) return;
      
      const monthKey = `${receivedDate.getFullYear()}-${String(receivedDate.getMonth() + 1).padStart(2, '0')}`;
      const month = months.find(m => m.key === monthKey);
      if (month) month.receitas += income.amount;
    });
    
    // SOMAR DESPESAS POR MÊS
    expenses.forEach(expense => {
      if (!expense.amount || !expense.isPaid) return;
      
      const paidDate = convertToDate(expense.paidDate);
      if (!paidDate) return;
      
      const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, '0')}`;
      const month = months.find(m => m.key === monthKey);
      if (month) month.despesas += expense.amount;
    });
    
    return months.map(({ key, ...rest }) => rest);
  };

  // ========================================
  // CÁLCULOS PARA GRÁFICOS E ESTATÍSTICAS
  // ========================================

  // Dados para gráfico de pizza - Despesas por categoria
  const expensesByCategory = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    const categoryTotals: { [key: string]: { name: string; value: number; color: string } } = {};
    
    expenses
      .filter(expense => 
        expense.amount > 0 && 
        expense.isPaid && 
        isDateInPeriod(convertToDate(expense.paidDate), start, end)
      )
      .forEach(expense => {
        const categoryName = categories.find(cat => cat.id === expense.categoryId)?.name || 'Sem categoria';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            name: categoryName,
            value: 0,
            color: getCategoryColor(categoryName)
          };
        }
        categoryTotals[categoryName].value += expense.amount;
      });

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [expenses, categories, selectedPeriod]);

  // Dados para gráfico de pizza - Receitas por categoria
  const incomesByCategory = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    const categoryTotals: { [key: string]: { name: string; value: number; color: string } } = {};
    
    incomes
      .filter(income => 
        income.amount > 0 && 
        income.isReceived && 
        isDateInPeriod(convertToDate(income.receivedDate), start, end)
      )
      .forEach(income => {
        const categoryName = categories.find(cat => cat.id === income.categoryId)?.name || 'Sem categoria';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = {
            name: categoryName,
            value: 0,
            color: getCategoryColor(categoryName)
          };
        }
        categoryTotals[categoryName].value += income.amount;
      });

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
  }, [incomes, categories, selectedPeriod]);

  // Dados para gráfico de barras - Receitas vs Despesas por mês
  const monthlyData = useMemo(() => {
    return recalculateMonthlyData();
  }, [incomes, expenses, selectedPeriod, recalculateProgress]);

  // Dados para gráfico de distribuição por contas
  const accountsDistribution = useMemo(() => 
    bankAccounts
      .map((account, index) => ({
        name: account.name,
        value: Math.abs(account.balance),
        color: getAccountColor(index),
        balance: account.balance
      }))
      .filter(account => account.value > 0),
    [bankAccounts]
  );

  // Dados para gráfico de linha - Evolução do saldo
  const balanceEvolution = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const points = Math.min(daysDiff, 30); // Máximo 30 pontos
    
    const data = [];
    for (let i = 0; i < points; i++) {
      const date = new Date(start.getTime() + (i * (end.getTime() - start.getTime()) / points));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const dayKey = `${monthKey}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Calcular saldo acumulado até esta data
      let balance = 0;
      
      // Somar receitas recebidas até esta data
      incomes
        .filter(income => 
          income.amount > 0 && 
          income.isReceived && 
          convertToDate(income.receivedDate) && 
          convertToDate(income.receivedDate)! <= date
        )
        .forEach(income => balance += income.amount);
      
      // Subtrair despesas pagas até esta data
      expenses
        .filter(expense => 
          expense.amount > 0 && 
          expense.isPaid && 
          convertToDate(expense.paidDate) && 
          convertToDate(expense.paidDate)! <= date
        )
        .forEach(expense => balance -= expense.amount);
      
      data.push({
        name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        saldo: balance
      });
    }
    
    return data;
  }, [incomes, expenses, selectedPeriod]);

  // Dados para gráfico de barras - Top 5 despesas
  const topExpenses = useMemo(() => {
    const { start, end } = getPeriodDates(selectedPeriod);
    
    return expenses
      .filter(expense => 
        expense.amount > 0 && 
        expense.isPaid && 
        isDateInPeriod(convertToDate(expense.paidDate), start, end)
      )
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(expense => ({
        name: expense.description.length > 20 
          ? expense.description.substring(0, 20) + '...' 
          : expense.description,
        valor: expense.amount,
        categoria: categories.find(cat => cat.id === expense.categoryId)?.name || 'Sem categoria',
        data: convertToDate(expense.paidDate)?.toLocaleDateString('pt-BR') || 'N/A'
      }));
  }, [expenses, categories, selectedPeriod]);

  // Função para obter cores das categorias
  function getCategoryColor(categoryName: string): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    const hash = categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  // Função para obter cores das contas
  function getAccountColor(index: number): string {
    const colors = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];
    return colors[index % colors.length];
  }


  // ========================================
  // FUNÇÃO PARA RECALCULAR SALDOS
  // ========================================
  const handleRecalculate = async () => {
    setShowRecalculateModal(false);
    setIsRecalculating(true);
    setRecalculateProgress(0);
    
    try {
      console.log('🔄 Iniciando recálculo completo...');
      
      // Simular progresso
      for (let i = 0; i <= 100; i += 10) {
        setRecalculateProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Recalcular dados mensais
      console.log('🔄 RECALCULANDO GRÁFICO...');
      const newMonthlyData = recalculateMonthlyData();
      
      // Forçar re-render do componente
      setRecalculateProgress(prev => prev + 1);
      
      // Chamar o serviço de recálculo do backend
      const { reportService } = await import('../services/api');
      const result = await reportService.recalculateBalances();
      
      console.log('✅ Resultado do recálculo:', result);
      
      // Atualizar as contas bancárias no contexto local
      if (result.success && result.data.accounts) {
        result.data.accounts.forEach((updatedAccount: any) => {
          updateBankAccount(updatedAccount);
        });
      }
      
      setTimeout(() => {
        setIsRecalculating(false);
        setRecalculateProgress(0);
        
        if (result.success) {
          const accountsUpdated = result.data.updatedAccounts || 0;
          if (accountsUpdated > 0) {
            alert(`Recálculo concluído! ${accountsUpdated} conta(s) foram atualizadas.`);
          } else {
            alert('Recálculo concluído! Todos os saldos já estavam corretos.');
          }
        } else {
          alert('Erro durante o recálculo. Tente novamente.');
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Erro no recálculo:', error);
      setIsRecalculating(false);
      setRecalculateProgress(0);
      alert('Erro durante o recálculo. Tente novamente.');
    }
  };

  // ========================================
  // RENDERIZAÇÃO DO DASHBOARD
  // ========================================

  // Se não há dados, mostrar tela vazia
  if (!expenses.length && !incomes.length && !bankAccounts.length) {
    return (
      <Container>
        <Header>
          <Title>
            <FiHome />
            Visão Geral
          </Title>
        </Header>
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          color: 'var(--gray-600)'
        }}>
          <FiHome style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '1rem' }}>Nenhum dado disponível</h2>
          <p>Adicione algumas despesas, receitas ou contas bancárias para ver o dashboard.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* ========================================
          CABEÇALHO DO DASHBOARD
          ======================================== */}
      <Header>
        <Title>
          <FiHome />
          Visão Geral
          <span style={{ 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: 'var(--font-weight-normal)', 
            color: 'var(--gray-600)',
            marginLeft: '0.5rem'
          }}>
            ({selectedPeriod === 'current' ? 'Mês atual' : selectedPeriod === '3months' ? 'Últimos 3 meses' : selectedPeriod === '6months' ? 'Últimos 6 meses' : 'Último ano'})
          </span>
        </Title>
        <HeaderButtons>
          <PeriodSelector>
            <PeriodLabel>Período:</PeriodLabel>
            <PeriodSelect 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as 'current' | '3months' | '6months' | '1year')}
            >
              <option value="current">Mês atual</option>
              <option value="3months">3 meses</option>
              <option value="6months">6 meses</option>
              <option value="1year">1 ano</option>
            </PeriodSelect>
          </PeriodSelector>
          <RecalculateButton onClick={() => setShowRecalculateModal(true)}>
            <FiTool />
            Recalcular
          </RecalculateButton>
        </HeaderButtons>
      </Header>

      {/* ========================================
          CARDS DE RESUMO PRINCIPAIS
          ======================================== */}
      <SummaryGrid>
        {/* Card de Contas Bancárias */}
        <Card bgColor="#f0f9ff" borderColor="#0ea5e9">
          <CardIcon color="#0ea5e9">
            <FiDollarSign />
          </CardIcon>
          <CardValue color={totals.totalBankBalance < 0 ? '#ef4444' : '#0ea5e9'}>
            {formatCurrency(totals.totalBankBalance)}
          </CardValue>
          <CardLabel>Contas Bancárias</CardLabel>
        </Card>
        
        {/* Card de Receitas */}
        <Card bgColor="#f0fdf4" borderColor="#22c55e">
          <CardIcon color="#22c55e">
            <FiTrendingUp />
          </CardIcon>
          <CardValue color="#22c55e">
            {formatCurrency(totals.totalIncomes)}
          </CardValue>
          <CardLabel>Receitas</CardLabel>
        </Card>
        
        {/* Card de Despesas */}
        <Card bgColor="#fef2f2" borderColor="#ef4444">
          <CardIcon color="#ef4444">
            <FiTrendingDown />
          </CardIcon>
          <CardValue color="#ef4444">
            {formatCurrency(totals.totalExpenses)}
          </CardValue>
          <CardLabel>Despesas</CardLabel>
        </Card>
        
        {/* Card de Cartões de Crédito */}
        <Card bgColor="#fffbeb" borderColor="#f59e0b">
          <CardIcon color="#f59e0b">
            <FiCreditCard />
          </CardIcon>
          <CardValue color="#f59e0b">
            {formatCurrency(totals.totalCreditCardDebt)}
          </CardValue>
          <CardLabel>Cartões de Crédito</CardLabel>
        </Card>
      </SummaryGrid>

      {/* ========================================
          SEÇÃO PRINCIPAL - CONTAS E CARTÕES
          ======================================== */}
      <MainGrid>
        {/* Lista de Contas Bancárias */}
        <MainCard>
          <CardHeader>
            <CardTitle>
              <FiDollarSign />
              Contas Bancárias
            </CardTitle>
            <MenuButton>
              <FiMoreVertical />
            </MenuButton>
          </CardHeader>
          
          {/* Lista cada conta bancária */}
          {bankAccounts.map((account, index) => {
            // Cores diferentes para cada conta
            const colors = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];
            const color = colors[index % colors.length];
            const isNegative = account.balance < 0;
            
            return (
              <AccountItem key={account.id}>
                <AccountInfo>
                  <AccountIcon color={color}>
                    {account.name.charAt(0).toUpperCase()}
                  </AccountIcon>
                  <AccountDetails>
                    <AccountName>{account.name}</AccountName>
                    <AccountInitial>
                      Saldo inicial: {formatCurrency(account.initialBalance || 0)}
                    </AccountInitial>
                  </AccountDetails>
                </AccountInfo>
                <AccountValue color={isNegative ? '#ef4444' : '#0ea5e9'}>
                  {formatCurrency(account.balance)}
                </AccountValue>
              </AccountItem>
            );
          })}
          
          {/* Total das contas */}
          <AccountItem>
            <AccountInfo>
              <AccountIcon color="#374151">
                T
              </AccountIcon>
              <AccountDetails>
                <AccountName>Total</AccountName>
              </AccountDetails>
            </AccountInfo>
            <AccountValue color={totals.totalBankBalance < 0 ? '#ef4444' : '#0ea5e9'}>
              {formatCurrency(totals.totalBankBalance)}
            </AccountValue>
          </AccountItem>
        </MainCard>

        {/* Lista de Cartões de Crédito */}
        {creditCards.length > 0 && (
          <CreditCardMainCard itemCount={creditCards.length}>
            <CardHeader>
              <CardTitle>
                <FiCreditCard />
                Cartões de Crédito
              </CardTitle>
              <MenuButton>
                <FiMoreVertical />
              </MenuButton>
            </CardHeader>
            
            {/* Lista cada cartão de crédito */}
            {creditCards.map((card, index) => {
              const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
              const color = colors[index % colors.length];
              
              return (
                <CreditCardItem key={card.id}>
                  <CreditCardInfo>
                    <CreditCardIcon color={color}>
                      {card.name.charAt(0).toUpperCase()}
                    </CreditCardIcon>
                    <CreditCardDetails>
                      <CreditCardName>{card.name}</CreditCardName>
                      <CreditCardInitial>
                        Limite: {formatCurrency(card.limit)}
                      </CreditCardInitial>
                    </CreditCardDetails>
                  </CreditCardInfo>
                  <CreditCardValue color="#ef4444">
                    {formatCurrency(card.currentBill || 0)}
                  </CreditCardValue>
                </CreditCardItem>
              );
            })}
          </CreditCardMainCard>
        )}
      </MainGrid>

      {/* ========================================
          SEÇÃO DE ESTATÍSTICAS
          ======================================== */}
      <StatsSection>
        <StatsGrid>
          {/* Saldo Líquido */}
          <StatCard>
            <StatValue color="#10b981">
              {formatCurrency(totals.totalIncomes - totals.totalExpenses)}
            </StatValue>
            <StatLabel>Saldo Líquido</StatLabel>
            <StatChange positive={totals.totalIncomes > totals.totalExpenses}>
              {totals.totalIncomes > totals.totalExpenses ? 'Positivo' : 'Negativo'}
            </StatChange>
          </StatCard>
          
          {/* Total de Despesas */}
          <StatCard>
            <StatValue color="#3b82f6">
              {expenses.length}
            </StatValue>
            <StatLabel>Total de Despesas</StatLabel>
            <StatChange positive={false}>
              {expenses.filter(e => e.isPaid).length} pagas
            </StatChange>
          </StatCard>
          
          {/* Total de Receitas */}
          <StatCard>
            <StatValue color="#10b981">
              {incomes.length}
            </StatValue>
            <StatLabel>Total de Receitas</StatLabel>
            <StatChange positive={true}>
              {incomes.filter(i => i.isReceived).length} recebidas
            </StatChange>
          </StatCard>
          
          {/* Categorias Ativas */}
          <StatCard>
            <StatValue color="#8b5cf6">
              {categories.length}
            </StatValue>
            <StatLabel>Categorias Ativas</StatLabel>
            <StatChange positive={true}>
              {expensesByCategory.length} com gastos
            </StatChange>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* ========================================
          SEÇÃO DE CATEGORIAS DETALHADAS
          ======================================== */}
      {expensesByCategory.length > 0 && (
        <StatsSection>
          <StatsGrid>
            <StatCard style={{ gridColumn: '1 / -1' }}>
              <StatValue color="#8b5cf6" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                📊 Análise Detalhada por Categoria
              </StatValue>
              <CategoriesList>
                {expensesByCategory.map((category, index) => {
                  const percentage = totals.totalExpenses > 0 ? (category.value / totals.totalExpenses) * 100 : 0;
                  return (
                    <CategoryItem key={category.name}>
                      <CategoryInfo>
                        <CategoryIcon color={category.color}>
                          {category.name.charAt(0).toUpperCase()}
                        </CategoryIcon>
                        <CategoryDetails>
                          <CategoryName>{category.name}</CategoryName>
                          <CategoryRank>#{index + 1} categoria</CategoryRank>
                        </CategoryDetails>
                      </CategoryInfo>
                      <CategoryValues>
                        <CategoryAmount>{formatCurrency(category.value)}</CategoryAmount>
                        <CategoryPercentage>{percentage.toFixed(1)}%</CategoryPercentage>
                      </CategoryValues>
                    </CategoryItem>
                  );
                })}
              </CategoriesList>
            </StatCard>
          </StatsGrid>
        </StatsSection>
      )}

      {/* ========================================
          SEÇÃO DE GRÁFICOS
          ======================================== */}
      <ChartsSection>
        <ChartsGrid>
          {/* Gráfico de Pizza - Despesas por Categoria */}
          {expensesByCategory.length > 0 && (
            <ChartCard>
              <PieChart
                data={expensesByCategory}
                title="Despesas por Categoria"
                subtitle="Distribuição dos gastos por categoria"
                height={280}
              />
            </ChartCard>
          )}

          {/* Gráfico de Pizza - Receitas por Categoria */}
          {incomesByCategory.length > 0 && (
            <ChartCard>
              <PieChart
                data={incomesByCategory}
                title="Receitas por Categoria"
                subtitle="Distribuição das receitas por categoria"
                height={280}
              />
            </ChartCard>
          )}

          {/* Gráfico de Barras - Receitas vs Despesas */}
          {monthlyData.length > 0 && (
            <ChartCard>
              <BarChart
                data={monthlyData}
                title="Receitas vs Despesas"
                subtitle={`Comparativo mensal - ${selectedPeriod === 'current' ? 'Mês atual' : selectedPeriod === '3months' ? 'Últimos 3 meses' : selectedPeriod === '6months' ? 'Últimos 6 meses' : 'Último ano'}`}
                height={280}
                dataKeys={['receitas', 'despesas']}
                colors={['#10b981', '#ef4444']}
                xAxisKey="name"
              />
            </ChartCard>
          )}

          {/* Gráfico de Pizza - Distribuição por Contas */}
          {accountsDistribution.length > 0 && (
            <ChartCard>
              <PieChart
                data={accountsDistribution}
                title="Distribuição por Contas"
                subtitle="Saldo atual por conta bancária"
                height={280}
              />
            </ChartCard>
          )}

          {/* Gráfico de Linha - Evolução do Saldo */}
          {balanceEvolution.length > 0 && (
            <ChartCard>
              <LineChart
                data={balanceEvolution}
                title="Evolução do Saldo"
                subtitle="Variação do saldo ao longo do período"
                height={280}
                dataKeys={['saldo']}
                xAxisKey="name"
                colors={['#10b981']}
              />
            </ChartCard>
          )}

          {/* Gráfico de Barras - Top 5 Despesas */}
          {topExpenses.length > 0 && (
            <ChartCard>
              <BarChart
                data={topExpenses}
                title="Top 5 Despesas"
                subtitle="Maiores gastos do período"
                height={280}
                dataKeys={['valor']}
                colors={['#ef4444']}
                xAxisKey="name"
              />
            </ChartCard>
          )}
        </ChartsGrid>
      </ChartsSection>

      {/* ========================================
          MODAL DE CONFIRMAÇÃO PARA RECALCULAR
          ======================================== */}
      {showRecalculateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowRecalculateModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <FiAlertTriangle />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--gray-800)',
                margin: 0
              }}>Recalcular Dados</h3>
            </div>
            <p style={{
              color: 'var(--gray-600)',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              Esta ação irá recalcular todos os saldos das contas bancárias baseado nas transações. 
              Isso pode levar alguns segundos.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                background: 'var(--gray-200)',
                color: 'var(--gray-800)'
              }} onClick={() => setShowRecalculateModal(false)}>
                Cancelar
              </button>
              <button style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                background: '#f59e0b',
                color: 'white'
              }} onClick={handleRecalculate}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL DE PROGRESSO DO RECÁLCULO
          ======================================== */}
      {isRecalculating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white',
              fontSize: '1.5rem',
              animation: 'spin 1s linear infinite'
            }}>
              <FiTool />
            </div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--gray-800)',
              margin: '0 0 0.5rem 0'
            }}>Recalculando...</h3>
            <p style={{
              color: 'var(--gray-600)',
              marginBottom: '1.5rem'
            }}>
              Por favor, aguarde enquanto recalculamos os dados.
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'var(--gray-200)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                height: '100%',
                background: '#3b82f6',
                width: `${recalculateProgress}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante para adicionar transações */}
      <FloatingActionButton />
    </Container>
  );
}