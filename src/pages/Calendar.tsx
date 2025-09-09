import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { expenseService, incomeService } from '../services/api';
import { Expense, Income } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import toast from 'react-hot-toast';

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
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--gray-50);
`;

const CalendarHeaderCell = styled.div`
  padding: var(--spacing-md);
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const CalendarDay = styled.div<{ isCurrentMonth: boolean; isToday: boolean; hasEvents: boolean }>`
  min-height: 120px;
  padding: var(--spacing-sm);
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  ${({ isCurrentMonth }) => !isCurrentMonth && `
    background-color: var(--gray-50);
    color: var(--text-secondary);
  `}
  
  ${({ isToday }) => isToday && `
    background-color: var(--primary-color)10;
    border-color: var(--primary-color);
  `}
  
  ${({ hasEvents }) => hasEvents && `
    background-color: var(--warning-color)10;
  `}
  
  &:hover {
    background-color: var(--gray-50);
  }
`;

const DayNumber = styled.div<{ isToday: boolean }>`
  font-weight: ${({ isToday }) => isToday ? '700' : '500'};
  color: ${({ isToday }) => isToday ? 'var(--primary-color)' : 'inherit'};
  margin-bottom: var(--spacing-xs);
`;

const EventIndicator = styled.div`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--warning-color);
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

const EventItem = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
`;

const EventTitle = styled.div`
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
`;

const EventDetails = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
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
        
        setExpenses(expensesResponse.data.expenses || []);
        setIncomes(incomesResponse.data.incomes || []);
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
      const incomeDate = new Date(income.receivedDate);
      return incomeDate.getDate() === day && 
             incomeDate.getMonth() === month && 
             incomeDate.getFullYear() === year;
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

  const formatDate = (date: Date | string | { _seconds: number; _nanoseconds: number } | null | undefined) => {
    if (!date) return '-';
    
    try {
      let dateObj: Date;
      
      // Se for um objeto do Firebase (tem _seconds)
      if (date && typeof date === 'object' && '_seconds' in date && typeof date._seconds === 'number') {
        dateObj = new Date(date._seconds * 1000);
      }
      // Se for uma string
      else if (typeof date === 'string') {
        dateObj = new Date(date);
      }
      // Se já for uma instância de Date
      else if (date instanceof Date) {
        dateObj = date;
      }
      // Fallback
      else {
        return '-';
      }
      
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
    
    // Dias do mês anterior
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês
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

      <CalendarGrid>
        <CalendarHeader>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <CalendarHeaderCell key={day}>{day}</CalendarHeaderCell>
          ))}
        </CalendarHeader>
        
        {renderCalendar().map(({ date, isCurrentMonth }, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const hasEventsOnDay = hasEvents(date);
          
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
              {hasEventsOnDay && <EventIndicator />}
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
                  <EventItem key={`expense-${idx}`}>
                    <EventTitle style={{ color: 'var(--error-color)' }}>
                      <FiDollarSign style={{ marginRight: '4px' }} />
                      {expense.description}: {formatCurrency(expense.amount)}
                    </EventTitle>
                    <EventDetails>
                      Vencimento: {formatDate(new Date(expense.dueDate))}
                      {expense.observations && ` • ${expense.observations}`}
                    </EventDetails>
                  </EventItem>
                ))}
                
                {selectedEvents.incomes.map((income: Income, idx: number) => (
                  <EventItem key={`income-${idx}`}>
                    <EventTitle style={{ color: 'var(--success-color)' }}>
                      <FiTrendingUp style={{ marginRight: '4px' }} />
                      {income.description}: {formatCurrency(income.amount)}
                    </EventTitle>
                    <EventDetails>
                      Data prevista: {formatDate(new Date(income.receivedDate))}
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
