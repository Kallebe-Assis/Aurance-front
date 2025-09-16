import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { expenseService, incomeService } from '../services';
import { Expense, Income, FirebaseDateType, FirebaseTimestamp, FirebaseDate } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import toast from 'react-hot-toast';

// Função utilitária para converter datas do Firebase
const convertFirebaseDate = (date: FirebaseDateType): Date => {
  if (!date) {
    throw new Error('Data inválida');
  }

  // Se for um objeto do Firebase com _seconds
  if (typeof date === 'object' && '_seconds' in date) {
    const timestamp = date as FirebaseTimestamp;
    return new Date(timestamp._seconds * 1000);
  }
  
  // Se for um objeto do Firebase com toDate()
  if (typeof date === 'object' && 'toDate' in date) {
    const firebaseDate = date as FirebaseDate;
    return firebaseDate.toDate();
  }
  
  // Se for uma string
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  // Se já for uma instância de Date
  if (date instanceof Date) {
    return date;
  }
  
  throw new Error('Formato de data não suportado');
};

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const Title = styled.h1`
  margin: 0;
`;

const CalendarNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const MonthYear = styled.h2`
  margin: 0;
  min-width: 150px;
  text-align: center;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--gray-200);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--gray-200);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  overflow: hidden;
  margin-bottom: 0;
`;

const CalendarHeaderCell = styled.div`
  padding: var(--spacing-md);
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
  background-color: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
`;

const CalendarDay = styled.div<{ isCurrentMonth: boolean; isToday: boolean; hasEvents: boolean }>`
  min-height: 120px;
  padding: var(--spacing-sm);
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  
  ${({ isCurrentMonth }) => !isCurrentMonth && `
    background-color: var(--gray-50);
    color: var(--text-secondary);
  `}
  
  ${({ isToday }) => isToday && `
    background-color: var(--primary-color)10;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color)20;
  `}
  
  &:hover {
    background-color: var(--gray-50);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  font-weight: ${({ isToday }) => isToday ? '700' : '500'};
  color: ${({ isToday }) => isToday ? 'var(--primary-color)' : 'inherit'};
  margin-bottom: var(--spacing-xs);
`;

const DayContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: var(--spacing-xs);
`;

const TransactionIndicator = styled.div<{ type: 'expense' | 'income' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ type }) => type === 'expense' && `
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  `}
  
  ${({ type }) => type === 'income' && `
    background-color: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  `}
`;

const TransactionIcon = styled.div<{ type: 'expense' | 'income' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${({ type }) => type === 'expense' && `
    background-color: #dc2626;
  `}
  
  ${({ type }) => type === 'income' && `
    background-color: #16a34a;
  `}
`;

const TransactionAmount = styled.span`
  font-size: 9px;
  font-weight: 700;
`;

const SummaryIndicator = styled.div<{ hasExpenses: boolean; hasIncomes: boolean }>`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  display: flex;
  gap: 2px;
  
  ${({ hasExpenses, hasIncomes }) => {
    if (hasExpenses && hasIncomes) {
      return `
        &::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #dc2626;
        }
        &::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #16a34a;
        }
      `;
    } else if (hasExpenses) {
      return `
        &::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #dc2626;
        }
      `;
    } else if (hasIncomes) {
      return `
        &::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #16a34a;
        }
      `;
    }
  }}
`;

const EventModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const EventModalContent = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
`;

const EventModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
`;

const EventModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const EventItem = styled.div<{ type: 'expense' | 'income' }>`
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  transition: all 0.2s ease;
  
  ${({ type }) => type === 'expense' && `
    background-color: #fef2f2;
    border-left-color: #dc2626;
    border: 1px solid #fecaca;
  `}
  
  ${({ type }) => type === 'income' && `
    background-color: #f0fdf4;
    border-left-color: #16a34a;
    border: 1px solid #bbf7d0;
  `}
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const EventTitle = styled.div<{ type: 'expense' | 'income' }>`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  ${({ type }) => type === 'expense' && `
    color: #dc2626;
  `}
  
  ${({ type }) => type === 'income' && `
    color: #16a34a;
  `}
`;

const EventDetails = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
`;

const EventAmount = styled.span<{ type: 'expense' | 'income' }>`
  font-weight: 700;
  font-size: 1.1rem;
  
  ${({ type }) => type === 'expense' && `
    color: #dc2626;
  `}
  
  ${({ type }) => type === 'income' && `
    color: #16a34a;
  `}
`;

const EventIcon = styled.div<{ type: 'expense' | 'income' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  
  ${({ type }) => type === 'expense' && `
    background-color: #fecaca;
    color: #dc2626;
  `}
  
  ${({ type }) => type === 'income' && `
    background-color: #bbf7d0;
    color: #16a34a;
  `}
`;

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesResponse, incomesResponse] = await Promise.all([
          expenseService.getExpenses(),
          incomeService.getIncomes()
        ]);
        
        const expensesData = expensesResponse.data.expenses || [];
        const incomesData = incomesResponse.data.incomes || [];
        
        console.log('📅 Calendário - Despesas carregadas:', expensesData.length);
        console.log('📅 Calendário - Receitas carregadas:', incomesData.length);
        console.log('📅 Calendário - Primeira receita:', incomesData[0]);
        
        setExpenses(expensesData);
        setIncomes(incomesData);
      } catch (error) {
        console.error('Erro ao carregar dados do calendário:', error);
        toast.error('Erro ao carregar dados do calendário');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, firstDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const expensesForDate = expenses.filter(expense => {
      const expenseDate = new Date(expense.dueDate);
      return expenseDate.getDate() === day && 
             expenseDate.getMonth() === month && 
             expenseDate.getFullYear() === year;
    });
    
    const incomesForDate = incomes.filter(income => {
      try {
        const incomeDate = convertFirebaseDate(income.receivedDate);
        
        // Verificar se a data é válida
        if (isNaN(incomeDate.getTime())) {
          return false;
        }
        
        const matches = incomeDate.getDate() === day && 
                       incomeDate.getMonth() === month && 
                       incomeDate.getFullYear() === year;
        
        if (matches) {
          console.log('🎯 Receita encontrada para', date.toDateString(), ':', income.description, incomeDate.toDateString());
        }
        
        return matches;
      } catch (error) {
        console.error('Erro ao processar data da receita:', error, income.receivedDate);
        return false;
      }
    });
    
    return { expenses: expensesForDate, incomes: incomesForDate };
  };

  const hasEvents = (date: Date) => {
    const events = getEventsForDate(date);
    return events.expenses.length > 0 || events.incomes.length > 0;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: FirebaseDateType | null | undefined) => {
    if (!date) return '-';
    
    try {
      const dateObj = convertFirebaseDate(date);
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Erro ao formatar data no Calendar:', error, date);
      return '-';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const renderCalendar = () => {
    const { daysInMonth, firstDayOfWeek } = getDaysInMonth(currentDate);
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const days = [];
    
    // Dias do mês anterior (preencher espaços antes do primeiro dia do mês)
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfWeek; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês (preencher espaços para completar 6 semanas)
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  if (loading) {
    return <GlobalLoading message="📅 Carregando Calendário" subtitle="Buscando suas transações..." />;
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : { expenses: [], incomes: [] };

  return (
    <CalendarContainer>
      <Header>
        <Title>Calendário</Title>
        <CalendarNavigation>
          <NavigationButton onClick={() => navigateMonth('prev')}>
            <FiChevronLeft />
          </NavigationButton>
          <MonthYear>
            {currentDate.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </MonthYear>
          <NavigationButton onClick={() => navigateMonth('next')}>
            <FiChevronRight />
          </NavigationButton>
        </CalendarNavigation>
      </Header>

      <CalendarHeader>
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <CalendarHeaderCell key={day}>{day}</CalendarHeaderCell>
        ))}
      </CalendarHeader>
      
      <CalendarGrid>
        {renderCalendar().map(({ date, isCurrentMonth }, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const events = getEventsForDate(date);
          const hasEventsOnDay = events.expenses.length > 0 || events.incomes.length > 0;
          
          // Calcular totais
          const totalExpenses = events.expenses.reduce((sum, expense) => sum + expense.amount, 0);
          const totalIncomes = events.incomes.reduce((sum, income) => sum + income.amount, 0);
          
          return (
            <CalendarDay
              key={index}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              hasEvents={hasEventsOnDay}
              onClick={() => handleDayClick(date)}
            >
              <DayNumber isToday={isToday}>
                {date.getDate()}
              </DayNumber>
              
              {hasEventsOnDay && (
                <SummaryIndicator 
                  hasExpenses={events.expenses.length > 0} 
                  hasIncomes={events.incomes.length > 0} 
                />
              )}
              
              {isCurrentMonth && hasEventsOnDay && (
                <DayContent>
                  {events.expenses.length > 0 && (
                    <TransactionIndicator type="expense">
                      <TransactionIcon type="expense" />
                      <span>Desp</span>
                      <TransactionAmount>
                        R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </TransactionAmount>
                    </TransactionIndicator>
                  )}
                  
                  {events.incomes.length > 0 && (
                    <TransactionIndicator type="income">
                      <TransactionIcon type="income" />
                      <span>Rec</span>
                      <TransactionAmount>
                        R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </TransactionAmount>
                    </TransactionIndicator>
                  )}
                </DayContent>
              )}
            </CalendarDay>
          );
        })}
      </CalendarGrid>

      <EventModal isOpen={isModalOpen}>
        <EventModalContent>
          <EventModalHeader>
            <EventModalTitle>
              Eventos de {selectedDate ? formatDate(selectedDate) : ''}
            </EventModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
          </EventModalHeader>
          
          <EventList>
            {selectedEvents.expenses.length === 0 && selectedEvents.incomes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-md)' }}>
                Nenhum evento para esta data
              </div>
            ) : (
              <>
                {selectedEvents.expenses.map((expense: Expense, idx: number) => (
                  <EventItem key={`expense-${idx}`} type="expense">
                    <EventTitle type="expense">
                      <EventIcon type="expense">
                        <FiDollarSign />
                      </EventIcon>
                      <div>
                        <div>{expense.description}</div>
                        <EventAmount type="expense">{formatCurrency(expense.amount)}</EventAmount>
                      </div>
                    </EventTitle>
                    <EventDetails>
                      Vencimento: {formatDate(new Date(expense.dueDate))}
                      {expense.observations && ` • ${expense.observations}`}
                    </EventDetails>
                  </EventItem>
                ))}
                
                {selectedEvents.incomes.map((income: Income, idx: number) => (
                  <EventItem key={`income-${idx}`} type="income">
                    <EventTitle type="income">
                      <EventIcon type="income">
                        <FiTrendingUp />
                      </EventIcon>
                      <div>
                        <div>{income.description}</div>
                        <EventAmount type="income">{formatCurrency(income.amount)}</EventAmount>
                      </div>
                    </EventTitle>
                    <EventDetails>
                      Data prevista: {formatDate(income.receivedDate)}
                      {income.observations && ` • ${income.observations}`}
                    </EventDetails>
                  </EventItem>
                ))}
              </>
            )}
          </EventList>
        </EventModalContent>
      </EventModal>
    </CalendarContainer>
  );
};

export default Calendar;
