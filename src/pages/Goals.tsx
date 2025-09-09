import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTarget, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';
import { goalService } from '../services/api';
import { Goal } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import toast from 'react-hot-toast';

const GoalsContainer = styled.div`
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

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
`;

const GoalCard = styled.div<{ isCompleted: boolean }>`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
  position: relative;
  opacity: ${({ isCompleted }) => isCompleted ? 0.7 : 1};
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const GoalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
`;

const GoalTitle = styled.h3<{ isCompleted: boolean }>`
  margin: 0;
  color: var(--text-primary);
  text-decoration: ${({ isCompleted }) => isCompleted ? 'line-through' : 'none'};
`;

const GoalActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const GoalDescription = styled.p<{ isCompleted: boolean }>`
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  text-decoration: ${({ isCompleted }) => isCompleted ? 'line-through' : 'none'};
`;

const GoalProgress = styled.div`
  margin-bottom: var(--spacing-md);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
`;

const ProgressText = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ProgressPercentage = styled.span<{ color: string }>`
  font-weight: 600;
  color: ${({ color }) => color};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  background-color: ${({ color }) => color};
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  transition: width 0.3s ease;
`;

const GoalDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const DetailValue = styled.span<{ color?: string }>`
  font-weight: 600;
  color: ${({ color }) => color || 'var(--text-primary)'};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${({ status }) => {
    switch (status) {
      case 'completed': return 'var(--success-color)20';
      case 'in_progress': return 'var(--primary-color)20';
      case 'not_started': return 'var(--gray-300)';
      default: return 'var(--gray-300)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'completed': return 'var(--success-color)';
      case 'in_progress': return 'var(--primary-color)';
      case 'not_started': return 'var(--text-secondary)';
      default: return 'var(--text-secondary)';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
`;

const Modal = styled.div<{ isOpen: boolean }>`
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

const ModalContent = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
`;

const ModalTitle = styled.h2`
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
`;

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar metas
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const response = await goalService.getGoals();
        setGoals(response.data.goals || []);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
        toast.error('Erro ao carregar metas');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'var(--success-color)';
    if (percentage >= 75) return 'var(--primary-color)';
    if (percentage >= 50) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Andamento';
      case 'not_started': return 'Não Iniciada';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string | { _seconds: number; _nanoseconds: number } | Date | null | undefined) => {
    if (!dateString) return '-';
    
    try {
      let dateObj: Date;
      
      // Se for um objeto do Firebase (tem _seconds)
      if (dateString && typeof dateString === 'object' && '_seconds' in dateString && typeof dateString._seconds === 'number') {
        dateObj = new Date(dateString._seconds * 1000);
      }
      // Se for uma string
      else if (typeof dateString === 'string') {
        dateObj = new Date(dateString);
      }
      // Se já for uma instância de Date
      else if (dateString instanceof Date) {
        dateObj = dateString;
      }
      // Fallback
      else {
        return '-';
      }
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return '-';
      }
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data no Goals:', error, dateString);
      return '-';
    }
  };

  if (loading) {
    return <GlobalLoading message="🎯 Carregando Metas" subtitle="Buscando suas metas..." />;
  }

  return (
    <GoalsContainer>
      <Header>
        <Title>Metas Financeiras</Title>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus />
          Nova Meta
        </Button>
      </Header>

      {goals.length === 0 ? (
        <EmptyState>
          <FiTarget size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
          <h3>Nenhuma meta cadastrada</h3>
          <p>Crie sua primeira meta financeira para começar a planejar seu futuro.</p>
        </EmptyState>
      ) : (
        <GoalsGrid>
          {goals.map((goal) => {
            const progressPercentage = getProgressPercentage(goal);
            const progressColor = getProgressColor(progressPercentage);
            const isCompleted = goal.status === 'completed';
            
            return (
              <GoalCard key={goal.id} isCompleted={isCompleted}>
                <GoalHeader>
                  <GoalTitle isCompleted={isCompleted}>{goal.title}</GoalTitle>
                  <GoalActions>
                    <ActionButton title="Editar">
                      <FiEdit />
                    </ActionButton>
                    <ActionButton title="Excluir">
                      <FiTrash2 />
                    </ActionButton>
                    {isCompleted && (
                      <ActionButton title="Concluída" style={{ color: 'var(--success-color)' }}>
                        <FiCheck />
                      </ActionButton>
                    )}
                  </GoalActions>
                </GoalHeader>
                
                <GoalDescription isCompleted={isCompleted}>
                  {goal.description}
                </GoalDescription>
                
                <GoalProgress>
                  <ProgressHeader>
                    <ProgressText>Progresso</ProgressText>
                    <ProgressPercentage color={progressColor}>
                      {progressPercentage.toFixed(1)}%
                    </ProgressPercentage>
                  </ProgressHeader>
                  <ProgressBar>
                    <ProgressFill percentage={progressPercentage} color={progressColor} />
                  </ProgressBar>
                </GoalProgress>
                
                <GoalDetails>
                  <DetailRow>
                    <DetailLabel>Meta</DetailLabel>
                    <DetailValue>{formatCurrency(goal.targetAmount)}</DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Atual</DetailLabel>
                    <DetailValue color={progressColor}>
                      {formatCurrency(goal.currentAmount)}
                    </DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Restante</DetailLabel>
                    <DetailValue>
                      {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </DetailValue>
                  </DetailRow>
                  
                  <DetailRow>
                    <DetailLabel>Status</DetailLabel>
                    <StatusBadge status={goal.status}>
                      {getStatusText(goal.status)}
                    </StatusBadge>
                  </DetailRow>
                  
                  {goal.deadline && (
                    <DetailRow>
                      <DetailLabel>Prazo</DetailLabel>
                      <DetailValue>{formatDate(goal.deadline)}</DetailValue>
                    </DetailRow>
                  )}
                </GoalDetails>
              </GoalCard>
            );
          })}
        </GoalsGrid>
      )}

      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Nova Meta</ModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
          </ModalHeader>
          
          <Form>
            <div>
              <label>Título da Meta</label>
              <input type="text" placeholder="Ex: Comprar um carro" required />
            </div>
            
            <div>
              <label>Descrição</label>
              <textarea placeholder="Descreva sua meta..." rows={3} />
            </div>
            
            <FormRow>
              <div>
                <label>Valor Alvo</label>
                <input type="number" placeholder="0,00" step="0.01" min="0" required />
              </div>
              <div>
                <label>Valor Atual</label>
                <input type="number" placeholder="0,00" step="0.01" min="0" />
              </div>
            </FormRow>
            
            <FormRow>
              <div>
                <label>Data Limite</label>
                <input type="date" />
              </div>
              <div>
                <label>Status</label>
                <select>
                  <option value="not_started">Não Iniciada</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
            </FormRow>
            
            <FormActions>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Meta
              </Button>
            </FormActions>
          </Form>
        </ModalContent>
      </Modal>
    </GoalsContainer>
  );
};

export default Goals;
