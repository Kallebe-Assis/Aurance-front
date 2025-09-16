import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { 
  FiCreditCard,
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiAlertTriangle,
  FiCalendar,
  FiPercent,
  FiMoreVertical
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import FloatingActionButton from '../components/FloatingActionButton';
import { PieChart, BarChart } from '../components/charts';

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
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--gray-200);
  min-height: 100vh;
`;

// Cabeçalho com título
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Grid para os cards de resumo
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

// Card individual
const Card = styled.div<{ bgColor?: string; borderColor?: string }>`
  background: ${props => props.bgColor || 'white'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: ${props => props.borderColor ? `2px solid ${props.borderColor}` : 'none'};
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Barra colorida no topo */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.borderColor || 'transparent'};
    border-radius: 8px 8px 0 0;
  }
`;

// Ícone do card
const CardIcon = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: white;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

// Valor do card
const CardValue = styled.div<{ color?: string }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.color || 'var(--gray-800)'};
  margin-bottom: 0.25rem;
  line-height: 1.2;
`;

// Label do card
const CardLabel = styled.div`
  font-size: 0.625rem;
  color: var(--gray-600);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Grid para as seções principais
const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

// Card principal (maior)
const MainCard = styled(Card)`
  padding: 1.5rem;
  min-height: auto;
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

// Item da lista de cartões
const CardItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--gray-100);

  &:last-child {
    border-bottom: none;
    font-weight: 700;
    background: var(--gray-50);
    margin: 0 -1.5rem -1.5rem -1.5rem;
    padding: 1.25rem 1.5rem;
    border-radius: 0 0 8px 8px;
  }
`;

// Informações do cartão
const CardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Ícone do cartão
const CardIconItem = styled.div<{ color: string }>`
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

// Detalhes do cartão
const CardDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
`;

const CardLimit = styled.div`
  font-size: 0.75rem;
  color: var(--gray-500);
`;

// Valor do cartão
const CardValueItem = styled.div<{ color?: string }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.color || 'var(--gray-800)'};
  text-align: right;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

// Card de estatística
const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Card do gráfico
const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
`;

// ========================================
// COMPONENTE PRINCIPAL DO DASHBOARD
// ========================================
export default function CreditCardsDashboard() {
  // Hook para acessar os dados do contexto
  const { creditCards, expenses, categories } = useData();

  // ========================================
  // CÁLCULOS DOS TOTAIS (useMemo para performance)
  // ========================================
  const totals = useMemo(() => {
    // Soma todos os saldos dos cartões de crédito
    const totalBalance = creditCards.reduce((sum, card) => sum + (card.currentBalance || 0), 0);
    
    // Soma todos os limites dos cartões
    const totalLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);
    
    // Calcula limite disponível total
    const totalAvailable = totalLimit - totalBalance;
    
    // Calcula percentual de uso total
    const usagePercentage = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
    
    // Conta cartões ativos
    const activeCards = creditCards.filter(card => card.isActive).length;
    
    // Soma total gasto
    const totalSpent = creditCards.reduce((sum, card) => sum + (card.totalSpent || 0), 0);
    
    return {
      totalBalance,
      totalLimit,
      totalAvailable,
      usagePercentage,
      activeCards,
      totalSpent
    };
  }, [creditCards]);

  // ========================================
  // CÁLCULOS PARA GRÁFICOS E ESTATÍSTICAS
  // ========================================

  // Dados para gráfico de pizza - Distribuição por cartões
  const cardsDistribution = useMemo(() => {
    return creditCards.map((card, index) => ({
      name: card.name,
      value: Math.abs(card.currentBalance || 0),
      color: getCardColor(index),
      balance: card.currentBalance || 0
    })).filter(card => card.value > 0);
  }, [creditCards]);

  // Dados para gráfico de barras - Limite vs Saldo
  const limitVsBalance = useMemo(() => {
    return creditCards.map(card => ({
      name: card.name.length > 10 ? card.name.substring(0, 10) + '...' : card.name,
      limite: card.limit,
      saldo: Math.abs(card.currentBalance || 0),
      disponivel: card.limit - (card.currentBalance || 0)
    }));
  }, [creditCards]);

  // Dados para gráfico de pizza - Gastos por categoria (cartões)
  const expensesByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: { name: string; value: number; color: string } } = {};
    
    // Filtrar apenas despesas de cartão de crédito
    const cardExpenses = expenses.filter(expense => expense.creditCardId);
    
    cardExpenses.forEach(expense => {
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
  }, [expenses, categories]);

  // Função para obter cores dos cartões
  function getCardColor(index: number): string {
    const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#10b981', '#3b82f6'];
    return colors[index % colors.length];
  }

  // Função para obter cores das categorias
  function getCategoryColor(categoryName: string): string {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    const hash = categoryName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  // ========================================
  // RENDERIZAÇÃO DO DASHBOARD
  // ========================================

  // Se não há cartões, mostrar tela vazia
  if (!creditCards.length) {
    return (
      <Container>
        <Header>
          <Title>
            <FiCreditCard />
            Cartões de Crédito
          </Title>
        </Header>
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          color: 'var(--gray-600)'
        }}>
          <FiCreditCard style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ marginBottom: '1rem' }}>Nenhum cartão cadastrado</h2>
          <p>Adicione alguns cartões de crédito para ver o dashboard.</p>
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
          <FiCreditCard />
          Cartões de Crédito
        </Title>
      </Header>

      {/* ========================================
          CARDS DE RESUMO PRINCIPAIS
          ======================================== */}
      <SummaryGrid>
        {/* Card de Saldo Total */}
        <Card bgColor="#fef2f2" borderColor="#ef4444">
          <CardIcon color="#ef4444">
            <FiDollarSign />
          </CardIcon>
          <CardValue color="#ef4444">
            {formatCurrency(totals.totalBalance)}
          </CardValue>
          <CardLabel>Saldo Total</CardLabel>
        </Card>
        
        {/* Card de Limite Total */}
        <Card bgColor="#f0f9ff" borderColor="#3b82f6">
          <CardIcon color="#3b82f6">
            <FiTrendingUp />
          </CardIcon>
          <CardValue color="#3b82f6">
            {formatCurrency(totals.totalLimit)}
          </CardValue>
          <CardLabel>Limite Total</CardLabel>
        </Card>
        
        {/* Card de Limite Disponível */}
        <Card bgColor="#f0fdf4" borderColor="#10b981">
          <CardIcon color="#10b981">
            <FiTrendingDown />
          </CardIcon>
          <CardValue color="#10b981">
            {formatCurrency(totals.totalAvailable)}
          </CardValue>
          <CardLabel>Disponível</CardLabel>
        </Card>
        
        {/* Card de Percentual de Uso */}
        <Card bgColor="#fffbeb" borderColor="#f59e0b">
          <CardIcon color="#f59e0b">
            <FiPercent />
          </CardIcon>
          <CardValue color={totals.usagePercentage > 80 ? '#ef4444' : '#f59e0b'}>
            {totals.usagePercentage.toFixed(1)}%
          </CardValue>
          <CardLabel>Uso do Limite</CardLabel>
        </Card>
      </SummaryGrid>

      {/* ========================================
          SEÇÃO PRINCIPAL - LISTA DE CARTÕES
          ======================================== */}
      <MainGrid>
        {/* Lista de Cartões de Crédito */}
        <MainCard>
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
            const color = getCardColor(index);
            const usagePercent = card.limit > 0 ? ((card.currentBalance || 0) / card.limit) * 100 : 0;
            const isHighUsage = usagePercent > 80;
            
            return (
              <CardItem key={card.id}>
                <CardInfo>
                  <CardIconItem color={color}>
                    {card.name?.charAt(0)?.toUpperCase() || '?'}
                  </CardIconItem>
                  <CardDetails>
                    <CardName>{card.name}</CardName>
                    <CardLimit>
                      Limite: {formatCurrency(card.limit)} | Uso: {usagePercent.toFixed(1)}%
                    </CardLimit>
                  </CardDetails>
                </CardInfo>
                <CardValueItem color={isHighUsage ? '#ef4444' : '#8b5cf6'}>
                  {formatCurrency(card.currentBalance || 0)}
                </CardValueItem>
              </CardItem>
            );
          })}
          
          {/* Total dos cartões */}
          <CardItem>
            <CardInfo>
              <CardIconItem color="#374151">
                T
              </CardIconItem>
              <CardDetails>
                <CardName>Total</CardName>
              </CardDetails>
            </CardInfo>
            <CardValueItem color="#ef4444">
              {formatCurrency(totals.totalBalance)}
            </CardValueItem>
          </CardItem>
        </MainCard>
      </MainGrid>

      {/* ========================================
          SEÇÃO DE ESTATÍSTICAS
          ======================================== */}
      <StatsSection>
        <StatsGrid>
          {/* Cartões Ativos */}
          <StatCard>
            <StatValue color="#3b82f6">
              {totals.activeCards}
            </StatValue>
            <StatLabel>Cartões Ativos</StatLabel>
            <StatChange positive={true}>
              {creditCards.length} total
            </StatChange>
          </StatCard>
          
          {/* Total Gasto */}
          <StatCard>
            <StatValue color="#ef4444">
              {formatCurrency(totals.totalSpent)}
            </StatValue>
            <StatLabel>Total Gasto</StatLabel>
            <StatChange positive={false}>
              Este mês
            </StatChange>
          </StatCard>
          
          {/* Percentual Médio de Uso */}
          <StatCard>
            <StatValue color={totals.usagePercentage > 80 ? '#ef4444' : '#f59e0b'}>
              {totals.usagePercentage.toFixed(1)}%
            </StatValue>
            <StatLabel>Uso Médio</StatLabel>
            <StatChange positive={totals.usagePercentage < 80}>
              {totals.usagePercentage > 80 ? 'Alto' : 'Normal'}
            </StatChange>
          </StatCard>
          
          {/* Limite Disponível */}
          <StatCard>
            <StatValue color="#10b981">
              {formatCurrency(totals.totalAvailable)}
            </StatValue>
            <StatLabel>Disponível</StatLabel>
            <StatChange positive={true}>
              Para gastar
            </StatChange>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* ========================================
          SEÇÃO DE GRÁFICOS
          ======================================== */}
      <ChartsSection>
        <ChartsGrid>
          {/* Gráfico de Pizza - Distribuição por Cartões */}
          {cardsDistribution.length > 0 && (
            <ChartCard>
              <PieChart
                data={cardsDistribution}
                title="Distribuição por Cartões"
                subtitle="Saldo atual por cartão de crédito"
                height={280}
              />
            </ChartCard>
          )}

          {/* Gráfico de Barras - Limite vs Saldo */}
          {limitVsBalance.length > 0 && (
            <ChartCard>
              <BarChart
                data={limitVsBalance}
                title="Limite vs Saldo"
                subtitle="Comparativo de limite e saldo por cartão"
                height={280}
                dataKeys={['limite', 'saldo', 'disponivel']}
                colors={['#3b82f6', '#ef4444', '#10b981']}
                xAxisKey="name"
              />
            </ChartCard>
          )}

          {/* Gráfico de Pizza - Gastos por Categoria */}
          {expensesByCategory.length > 0 && (
            <ChartCard>
              <PieChart
                data={expensesByCategory}
                title="Gastos por Categoria"
                subtitle="Distribuição dos gastos em cartões por categoria"
                height={280}
              />
            </ChartCard>
          )}
        </ChartsGrid>
      </ChartsSection>

      {/* Botão flutuante para adicionar transações */}
      <FloatingActionButton />
    </Container>
  );
}
