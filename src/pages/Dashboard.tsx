import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiCalendar, FiFilter } from 'react-icons/fi';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

import { PieChart, BarChart, LineChart, AreaChart } from '../components/charts';
import { useDashboardData } from '../hooks/useDashboardData';
import { GlobalLoading } from '../components/GlobalLoading';






const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
  background: #f8fafc;
  min-height: calc(100vh - 60px);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const PeriodSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PeriodButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 6px;
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-primary)'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    background: ${props => props.active ? 'var(--primary-color)' : 'var(--primary-color-light)'};
  }
`;

const CustomDateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
`;

// Cards de resumo
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SummaryCard = styled.div<{ type: 'income' | 'expense' | 'balance' | 'transactions' }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: ${props => {
      switch (props.type) {
        case 'income': return '#10B981';
        case 'expense': return '#EF4444';
        case 'balance': return '#3B82F6';
        case 'transactions': return '#8B5CF6';
        default: return '#6B7280';
      }
    }};
  }

  .content {
  flex: 1;
  }

  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
  color: var(--text-primary);
  }

  .change {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .positive {
    color: #10B981;
  }

  .negative {
    color: #EF4444;
  }
`;

// Grid de gráficos
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const FullWidthChart = styled.div`
  grid-column: 1 / -1;
`;

// Lista de percentuais
const PercentagesList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
`;

const ListTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const ItemName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const ItemDetails = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ItemValues = styled.div`
  text-align: right;
`;

const ItemAmount = styled.div`
  font-weight: 600;
  color: var(--text-primary);
`;

const ItemPercentage = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;


const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return {
      start: startOfMonth(now), // Mês atual
      end: endOfMonth(now)
    };
  });

  const [customPeriod, setCustomPeriod] = useState({
    start: '',
    end: ''
  });

  const { 
    loading, 
    error, 
    categoryStats, 
    monthlyStats, 
    subcategoryStats, 
    creditCardStats, 
    summaryStats 
  } = useDashboardData(selectedPeriod);

  // Períodos predefinidos
  const predefinedPeriods = useMemo(() => {
    const now = new Date();
    return [
      {
        label: 'Mês atual',
        start: startOfMonth(now),
        end: endOfMonth(now)
      },
      {
        label: 'Mês passado',
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1))
      },
      {
        label: 'Últimos 3 meses',
        start: startOfMonth(subMonths(now, 3)),
        end: endOfMonth(now)
      },
      {
        label: 'Últimos 6 meses',
        start: startOfMonth(subMonths(now, 6)),
        end: endOfMonth(now)
      }
    ];
  }, []);

  const handlePeriodChange = (period: { start: Date; end: Date }) => {
    setSelectedPeriod(period);
  };

  const handleCustomPeriodSubmit = () => {
    if (customPeriod.start && customPeriod.end) {
      setSelectedPeriod({
        start: new Date(customPeriod.start),
        end: new Date(customPeriod.end)
      });
    }
  };

  // Verificar se não há transações (só mostra se não está carregando e realmente não há dados)
  if (!loading && summaryStats.transactionCount === 0) {
    return (
      <DashboardContainer>
        <Header>
          <Title>Dashboard</Title>
        </Header>
        
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Nenhuma transação encontrada
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Para ver estatísticas no dashboard, você precisa cadastrar algumas despesas ou receitas.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = '/expenses'}
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cadastrar Despesa
            </button>
            <button
              onClick={() => window.location.href = '/incomes'}
              style={{
                background: 'var(--success-color)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Cadastrar Receita
            </button>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  // Dados para gráficos
  const pieChartData = categoryStats.map(cat => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    color: cat.color
  }));

  const monthlyChartData = monthlyStats.map(month => ({
    name: month.monthName,
    Receitas: month.totalIncome,
    Despesas: month.totalExpenses,
    Saldo: month.balance
  }));

  const subcategoryChartData = subcategoryStats.slice(0, 8).map(sub => ({
    name: sub.subcategoryName,
    value: sub.totalAmount,
    category: sub.categoryName
  }));

  const creditCardChartData = creditCardStats.map(card => ({
    name: card.cardName,
    'Gasto Total': card.totalSpent,
    'Fatura Atual': card.currentBill,
    'Limite Disponível': card.availableLimit
  }));

  if (loading) {
    return <GlobalLoading message="💰 Carregando Dashboard" subtitle="Analisando suas finanças..." />;
  }

  if (error) {
    return (
      <DashboardContainer>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          margin: '2rem'
        }}>
          <div style={{ 
            color: '#EF4444', 
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>❌ Erro no Dashboard</h2>
            <p style={{ marginBottom: '1rem' }}><strong>Erro:</strong> {error}</p>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.875rem',
              color: '#6c757d'
            }}>
              <p><strong>Possíveis soluções:</strong></p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Verifique se o servidor backend está rodando na porta 3001</li>
                <li>Verifique se você está logado no sistema</li>
                <li>Verifique se há dados no banco de dados</li>
                <li>Abra o console do navegador para mais detalhes</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Dashboard Financeiro</Title>
        <PeriodSelector>
          <FiCalendar size={16} />
          {predefinedPeriods.map((period, index) => (
            <PeriodButton
              key={index}
              active={
                period.start.getTime() === selectedPeriod.start.getTime() &&
                period.end.getTime() === selectedPeriod.end.getTime()
              }
              onClick={() => handlePeriodChange(period)}
            >
              {period.label}
            </PeriodButton>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <CustomDateInput
              type="date"
              value={customPeriod.start}
              onChange={(e) => setCustomPeriod(prev => ({ ...prev, start: e.target.value }))}
              placeholder="Data início"
            />
            <span>até</span>
            <CustomDateInput
              type="date"
              value={customPeriod.end}
              onChange={(e) => setCustomPeriod(prev => ({ ...prev, end: e.target.value }))}
              placeholder="Data fim"
            />
            <PeriodButton onClick={handleCustomPeriodSubmit}>
              <FiFilter size={14} />
            </PeriodButton>
          </div>
        </PeriodSelector>
      </Header>

      {/* Cards de resumo */}
      <SummaryGrid>
        <SummaryCard type="income">
          <div className="icon">
                <FiTrendingUp />
          </div>
          <div className="content">
            <div className="label">Total de Receitas</div>
            <div className="value">
              R$ {summaryStats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="change positive">
              <FiTrendingUp size={12} />
              {summaryStats.incomeCount} transações
            </div>
          </div>
        </SummaryCard>

        <SummaryCard type="expense">
          <div className="icon">
            <FiTrendingDown />
          </div>
          <div className="content">
            <div className="label">Total de Despesas</div>
            <div className="value">
              R$ {summaryStats.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="change negative">
              <FiTrendingDown size={12} />
              {summaryStats.expenseCount} transações
            </div>
          </div>
        </SummaryCard>

        <SummaryCard type="balance">
          <div className="icon">
                <FiDollarSign />
          </div>
          <div className="content">
            <div className="label">Saldo</div>
            <div className="value">
              R$ {summaryStats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`change ${summaryStats.balance >= 0 ? 'positive' : 'negative'}`}>
              {summaryStats.balance >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {summaryStats.balance >= 0 ? 'Positivo' : 'Negativo'}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard type="transactions">
          <div className="icon">
                <FiCreditCard />
          </div>
          <div className="content">
            <div className="label">Total de Transações</div>
            <div className="value">{summaryStats.transactionCount}</div>
            <div className="change">
              No período selecionado
            </div>
          </div>
        </SummaryCard>
      </SummaryGrid>

      {/* Gráficos */}
      <ChartsGrid>
        <PieChart
          data={pieChartData}
          title="Gastos por Categoria"
          subtitle="Distribuição dos gastos por categoria no período"
          height={400}
        />

        <BarChart
          data={subcategoryChartData}
          title="Top Subcategorias"
          subtitle="Principais subcategorias de gastos"
          dataKeys={['value']}
          height={400}
        />


        <AreaChart
          data={monthlyChartData}
          title="Área de Receitas vs Despesas"
          subtitle="Comparação visual entre receitas e despesas"
          dataKeys={['Receitas', 'Despesas']}
          colors={['#10B981', '#EF4444']}
          height={400}
        />

        <BarChart
          data={creditCardChartData}
          title="Cartões de Crédito"
          subtitle="Status dos cartões de crédito"
          dataKeys={['Gasto Total', 'Fatura Atual', 'Limite Disponível']}
          colors={['#8B5CF6', '#F59E0B', '#10B981']}
          height={400}
        />
      </ChartsGrid>

      {/* Listas de Percentuais */}
      <ChartsGrid>
        <PercentagesList>
          <ListTitle>Gastos por Categoria</ListTitle>
          {categoryStats.length > 0 ? (
            categoryStats.map((category, index) => (
              <ListItem key={category.categoryId}>
                <ItemInfo>
                  <ColorIndicator color={category.color} />
                  <div>
                    <ItemName>{category.categoryName}</ItemName>
                    <ItemDetails>{category.transactionCount} transações</ItemDetails>
                  </div>
                </ItemInfo>
                <ItemValues>
                  <ItemAmount>
                    R$ {category.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </ItemAmount>
                  <ItemPercentage>
                    {category.percentage.toFixed(1)}%
                  </ItemPercentage>
                </ItemValues>
              </ListItem>
              ))
            ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              Nenhuma categoria com gastos no período
              </div>
            )}
        </PercentagesList>

        <PercentagesList>
          <ListTitle>Gastos por Subcategoria</ListTitle>
          {subcategoryStats.length > 0 ? (
            subcategoryStats.map((subcategory, index) => (
              <ListItem key={subcategory.subcategoryId}>
                <ItemInfo>
                  <div>
                    <ItemName>{subcategory.subcategoryName}</ItemName>
                    <ItemDetails>{subcategory.categoryName} • {subcategory.transactionCount} transações</ItemDetails>
                  </div>
                </ItemInfo>
                <ItemValues>
                  <ItemAmount>
                    R$ {subcategory.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </ItemAmount>
                  <ItemPercentage>
                    {subcategory.percentage.toFixed(1)}%
                  </ItemPercentage>
                </ItemValues>
              </ListItem>
              ))
            ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>
              Nenhuma subcategoria com gastos no período
              </div>
            )}
        </PercentagesList>
      </ChartsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;