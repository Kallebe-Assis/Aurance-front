import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCreditCard, FiDollarSign, FiCalendar, FiTrendingUp, FiEdit, FiTrash2, FiEye, FiX, FiShoppingCart, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { creditCardService, expenseService, categoryService, subcategoryService, bankAccountService } from '../services';
import { expenseCardService } from '../services/expenseCardService';
import { CreditCard, Expense, ExpenseCard, Category, Subcategory, BankAccount } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';
import { formatDateToLocal, getTodayString, parseLocalDate, parseLocalDateFlexible } from '../utils/dateUtils';

const CreditCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  
  @media (max-width: 768px) {
    gap: var(--spacing-mobile-lg);
    padding: var(--spacing-mobile-md);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-mobile-md);
  }
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

// Navegação por mês
const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const MonthButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--gray-100);
    color: var(--text-primary);
  }
`;

const MonthDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 150px;
  text-align: center;
`;

const TodayButton = styled.button`
  background: #3B82F6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-left: var(--spacing-md);

  &:hover {
    background: #2563EB;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Grid de cartões compactos
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

// Card compacto do cartão
const CompactCard = styled.div<{ color?: string; isExpanded?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.isExpanded ? props.color || '#3B82F6' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--gray-200);
`;

const CardName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const CardIcon = styled.div<{ color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color || '#3B82F6'};
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--gray-100);
    color: var(--text-primary);
  }
`;

const CardStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div<{ variant?: 'primary' | 'success' | 'warning' | 'danger' }>`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => {
    switch (props.variant) {
      case 'success': return 'var(--success-color)';
      case 'warning': return 'var(--warning-color)';
      case 'danger': return 'var(--error-color)';
      default: return 'var(--text-primary)';
    }
  }};
  line-height: 1.2;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  /* Animação suave para mudanças de valor */
  &.value-changing {
    transform: scale(1.05);
    color: var(--primary-color);
  }
`;

const UsageBar = styled.div`
  width: 100%;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
`;

const UsageFill = styled.div<{ percentage: number; color?: string }>`
  height: 100%;
  width: ${props => Math.min(props.percentage, 100)}%;
  background: ${props => {
    if (props.percentage >= 90) return 'var(--error-color)';
    if (props.percentage >= 70) return 'var(--warning-color)';
    return props.color || 'var(--success-color)';
  }};
  transition: width 0.3s ease;
`;

const UsageText = styled.div`
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
`;

// Componente de Spinner
const Spinner = styled.div<{ size?: number }>`
  width: ${props => props.size || 20}px;
  height: ${props => props.size || 20}px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
`;

const LoadingButton = styled.button<{ isLoading?: boolean }>`
  position: relative;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Seção de detalhes expansível
const CardDetails = styled.div<{ isExpanded: boolean }>`
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  border-top: ${props => props.isExpanded ? '1px solid var(--gray-200)' : 'none'};
  margin-top: ${props => props.isExpanded ? 'var(--spacing-sm)' : '0'};
  padding-top: ${props => props.isExpanded ? 'var(--spacing-sm)' : '0'};
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: var(--primary-color);
          color: white;
          &:hover {
            background: var(--primary-hover);
          }
        `;
      case 'danger':
        return `
          background: var(--error-color);
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: var(--background-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          &:hover {
            background: var(--background-hover);
          }
        `;
    }
  }}
`;

const ExpensesList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
  border-bottom: 1px solid var(--gray-100);
  font-size: 0.8rem;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ExpenseDescription = styled.div`
  color: var(--text-primary);
  font-weight: 500;
`;

const ExpenseAmount = styled.div`
  color: var(--error-color);
  font-weight: 600;
`;

// Estatísticas gerais (menores)
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-mobile-sm);
    margin-bottom: var(--spacing-mobile-lg);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-mobile-sm);
  }
`;

const StatCard = styled.div`
  background: white;
  padding: var(--spacing-sm);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 3px solid var(--primary-color);
  text-align: center;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: var(--spacing-mobile-sm);
    min-height: 70px;
  }
`;

const StatTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: 0.65rem;
  font-weight: 500;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    margin: 0 0 2px 0;
  }
`;



const StatChange = styled.div`
  font-size: 0.9rem;
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CardItem = styled.div<{ cardColor?: string }>`
  background: white;
  padding: var(--spacing-md);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border-left: 3px solid ${props => props.cardColor || 'var(--primary-color)'};
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${props => props.cardColor || 'var(--primary-color)'}08 0%, transparent 50%);
    border-radius: 8px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    
    &::before {
      opacity: 1;
    }
  }
`;


const CardNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const ColorIndicator = styled.div<{ color: string; size?: 'small' | 'medium' }>`
  width: ${props => props.size === 'small' ? '8px' : '12px'};
  height: ${props => props.size === 'small' ? '8px' : '12px'};
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}dd);
  box-shadow: 0 0 0 2px ${props => props.color}20;
  flex-shrink: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${props => props.size === 'small' ? '4px' : '6px'};
    height: ${props => props.size === 'small' ? '4px' : '6px'};
    border-radius: 50%;
    background: white;
    opacity: 0.8;
  }
`;


const CardStatus = styled.span<{ active: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.active ? 'var(--success-color)' : 'var(--danger-color)'};
  color: white;
`;

const CardInfo = styled.div`
  margin-bottom: 0;
  display: flex;
  gap: var(--spacing-lg);
  flex: 1;
`;

const CardRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 0.8rem;
  min-width: 80px;
`;

const CardLabel = styled.span`
  color: var(--text-secondary);
`;

const CardValue = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`;

const CardProgress = styled.div`
  margin: 0;
  min-width: 120px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: ${props => {
    if (props.percentage > 80) return 'var(--danger-color)';
    if (props.percentage > 60) return 'var(--warning-color)';
    return 'var(--success-color)';
  }};
  width: ${props => Math.min(props.percentage, 100)}%;
  transition: width 0.3s ease;
`;


const AddExpenseButton = styled(Button)`
  background: var(--success-color) !important;
  border-color: var(--success-color) !important;
  color: white !important;
  
  &:hover {
    background: #059669 !important;
    border-color: #059669 !important;
  }
`;

const CreateCategoriesButton = styled(Button)`
  font-size: 0.8rem;
  padding: var(--spacing-sm);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 65vh;
  overflow-y: auto;
  padding: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: rgba(59, 130, 246, 0.02);
  }

  &:focus-within {
    background: rgba(59, 130, 246, 0.03);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.8rem;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  
  &.required::after {
    content: ' *';
    color: var(--danger-color);
    font-weight: bold;
    font-size: 0.9rem;
  }

  &:hover {
    color: var(--primary-color);
  }
`;

const StyledInput = styled.input`
  padding: var(--spacing-sm);
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fafbfc;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    border-color: #a0aec0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;

const StyledSelect = styled.select`
  padding: var(--spacing-sm);
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fafbfc;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    border-color: #a0aec0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
`;



const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-xl);
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
`;

const CancelButton = styled(Button)`
  min-width: 120px;
`;

const SubmitButton = styled(Button)`
  min-width: 140px;
`;

const ColorPicker = styled.input`
  width: 60px;
  height: 50px;
  border: 2px solid #cbd5e1; /* Borda padrão mais visível */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); /* Sombra sutil no estado padrão */
  
  &:hover {
    transform: scale(1.05);
    border-color: #a0aec0; /* Borda mais escura no hover */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(59, 130, 246, 0.02);
    margin: 0 calc(-1 * var(--spacing-sm));
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    border-radius: 6px;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  min-width: 140px;
`;

const DetailValue = styled.span`
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
  flex: 1;
`;

const DeleteButton = styled(Button)`
  color: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
  
  &:hover {
    background-color: var(--danger-color) !important;
    color: white !important;
  }
`;

const FormSection = styled.div`
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  transition: all 0.2s ease;
  
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: rgba(248, 250, 252, 0.8);
    border-color: rgba(203, 213, 225, 0.5);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 2px solid var(--primary-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(59, 130, 246, 0.05);
  border-radius: 6px 6px 0 0;
  margin: calc(-1 * var(--spacing-md)) calc(-1 * var(--spacing-md)) var(--spacing-sm) calc(-1 * var(--spacing-md));
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 60px;
  height: 50px;
  border-radius: 8px;
  background: ${props => props.color};
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

// Switch Components
const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const SwitchInput = styled.input`
  display: none;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  background-color: #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  ${SwitchInput}:checked + & {
    background-color: var(--primary-color);
  }

  ${SwitchInput}:checked + &::after {
    transform: translateX(26px);
  }
`;

// Styled components para lista de despesas

const ExpensesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const ExpensesTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ExpensesCount = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: #e2e8f0;
  padding: 4px 8px;
  border-radius: 12px;
`;

const EmptyExpenses = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  font-size: 0.9rem;
  
  svg {
    font-size: 2rem;
    opacity: 0.5;
  }
`;

const ExpensesTable = styled.div`
  width: 100%;
`;

const ExpensesTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
`;

const ExpensesTableHeaderCell = styled.div`
  padding: var(--spacing-sm) 0;
`;

const ExpensesTableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  font-size: 0.85rem;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ExpensesTableCell = styled.div`
  padding: var(--spacing-sm) 0;
`;


const ExpenseInstallment = styled.span`
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: var(--spacing-xs);
  font-weight: 500;
`;


const ExpenseStatus = styled.span<{ paid: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.paid ? '#dcfce7' : '#fef2f2'};
  color: ${props => props.paid ? '#166534' : '#dc2626'};
`;

const ExpenseActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

// Mini Loading Component
const MiniLoading = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  
  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Botão de navegação com loading
const NavigationButton = styled.button<{ isLoading?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.isLoading ? 0.7 : 1};
  pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
  
  &:hover {
    background: var(--gray-50);
    border-color: var(--primary-color);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Overlay sutil para os cartões durante loading
const CardsLoadingOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(1px);
  display: ${props => props.isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 5;
  border-radius: 12px;
  
  .loading-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 0.875rem;
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const CreditCards: React.FC = () => {
  const { creditCards, updateCreditCard, refreshCreditCards, addCreditCard, removeCreditCard } = useData();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    totalLimit: 0,
    totalUsed: 0,
    totalAvailable: 0
  });

  // Estados para navegação por mês
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Estado para controlar animação dos valores
  const [animatingValues, setAnimatingValues] = useState<Set<string>>(new Set());
  
  // Estado para controlar loading da mudança de mês
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    limit: '',
    closingDate: '',
    dueDate: '',
    color: '#3B82F6',
    bank: '',
    lastFourDigits: '',
    interestRate: '',
    installmentInterestRate: '',
    advanceDiscountRate: '',
    annualFee: ''
  });

  // Estados para despesas
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCards, setExpenseCards] = useState<ExpenseCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | ExpenseCard | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | ExpenseCard | null>(null);
  const [isViewExpenseModalOpen, setIsViewExpenseModalOpen] = useState(false);
  const [selectedCardForExpense, setSelectedCardForExpense] = useState<CreditCard | null>(null);

  // Estados para pagamento de fatura
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<CreditCard | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    paymentType: 'full' as 'full' | 'partial',
    amount: '',
    bankAccountId: '',
    description: ''
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    dueDate: getTodayString(), // Data atual como padrão
    categoryId: '',
    subcategoryId: '',
    tags: '',
    observations: '',
    isPaid: true, // Sempre true para cartão de crédito
    paymentDate: '',
    isInstallment: false,
    installments: 1
  });

  useEffect(() => {
    fetchCreditCards();
    fetchCategories();
    fetchExpenses();
    fetchBankAccounts();
  }, []);

  // Recalcular stats sempre que cartões ou despesas mudarem
  useEffect(() => {
    if (creditCards.length > 0 && expenses.length > 0) {
      recalculateStats(creditCards, expenses);
    }
  }, [creditCards, expenses]);

  // Função simplificada para atualizar valores dos cartões
  const updateCardValuesOnly = async (newMonth: Date) => {
    try {
      await expenseCardService.updateMetrics(newMonth);
      // Usar o refreshCreditCards do DataContext para atualizar globalmente
      await refreshCreditCards();
      
      // Recalcular stats
      if (expenses.length > 0) {
        recalculateStats(creditCards, expenses);
      }
      
    } catch (error: any) {
      console.error('Erro ao atualizar valores dos cartões:', error);
    }
  };

  // Funções simplificadas para navegação por mês
  const changeMonth = async (monthOffset: number) => {
    try {
      setIsChangingMonth(true);
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + monthOffset);
      setCurrentMonth(newMonth);
      
      // Adicionar delay mínimo para mostrar o loading
      const [updateResult] = await Promise.all([
        updateCardValuesOnly(newMonth),
        new Promise(resolve => setTimeout(resolve, 300)) // Mínimo 300ms
      ]);
    } catch (error: any) {
      console.error('Erro ao alterar mês:', error);
    } finally {
      setIsChangingMonth(false);
    }
  };

  const goToPreviousMonth = () => changeMonth(-1);
  const goToNextMonth = () => changeMonth(1);
  const goToToday = async () => {
    try {
      setIsChangingMonth(true);
      const today = new Date();
      setCurrentMonth(today);
      
      // Adicionar delay mínimo para mostrar o loading
      const [updateResult] = await Promise.all([
        updateCardValuesOnly(today),
        new Promise(resolve => setTimeout(resolve, 300)) // Mínimo 300ms
      ]);
      
    } catch (error: any) {
      console.error('Erro ao ir para hoje:', error);
    } finally {
      setIsChangingMonth(false);
    }
  };

  const formatMonthYear = (date: Date) => 
    date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Função para controlar expansão dos cartões
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      newSet.has(cardId) ? newSet.delete(cardId) : newSet.add(cardId);
      return newSet;
    });
  };

  // Função para obter todas as despesas do cartão (pagas, pendentes e futuras)
  const getAllExpensesForCard = (cardId: string) => {
    return expenseCards.filter(expense => expense.creditCardId === cardId);
  };

  // Função simplificada para filtrar despesas por mês
  const getExpensesForMonth = (cardId: string, month: Date) => {
    const targetMonthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    return expenseCards.filter(expense => 
      expense.creditCardId === cardId && 
      expense.referenceMonth === targetMonthStr
    );
  };

  // Função ultra simplificada para estatísticas do cartão
  const getCardStats = (card: CreditCard, month: Date) => ({
    totalSpent: card.totalSpent || 0,
    currentBill: card.currentBill || 0,
    usagePercentage: card.limit > 0 ? ((card.limit - card.availableLimit) / card.limit) * 100 : 0,
    available: card.availableLimit || 0,
    expenseCount: getExpensesForMonth(card.id, month).length
  });

  // Usar o DataContext para carregar cartões
  const fetchCreditCards = async () => {
    try {
      setLoading(true);
      await refreshCreditCards();
      
      if (expenses.length > 0) {
        recalculateStats(creditCards, expenses);
      }
    } catch (error: any) {
      console.error('Erro ao carregar cartões:', error);
      setStats({ totalCards: 0, totalLimit: 0, totalUsed: 0, totalAvailable: 0 });
      toast.error('Erro ao carregar cartões de crédito');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccounts = async () => {
    setIsLoadingBankAccounts(true);
    try {
      const response = await bankAccountService.getBankAccounts();
      if (response.success && response.data) {
        const accounts = response.data.bankAccounts || response.data;
        setBankAccounts(accounts);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar contas bancárias:', error);
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      console.log('🔄 Iniciando carregamento de categorias...');
      const response = await categoryService.getCategories();
      console.log('📦 Resposta da API de categorias:', response);
      
      // Verificar a estrutura da resposta
      if (response && response.data && response.data.categories) {
        console.log('✅ Categorias encontradas:', response.data.categories);
        setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
      } else if (response && Array.isArray(response.data)) {
        console.log('✅ Categorias encontradas (array direto):', response.data);
        setCategories(response.data);
      } else {
        console.log('⚠️ Estrutura de resposta inesperada:', response);
        setCategories([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar categorias:', error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      console.log('🔄 Criando categorias padrão...');
      const response = await fetch('/api/categories/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Categorias padrão criadas com sucesso');
        toast.success('Categorias padrão criadas com sucesso!');
        fetchCategories(); // Recarregar categorias
      } else {
        console.error('❌ Erro ao criar categorias padrão:', result.message);
        toast.error(result.message || 'Erro ao criar categorias padrão');
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar categorias padrão:', error);
      toast.error('Erro ao criar categorias padrão');
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await subcategoryService.getSubcategories(categoryId);
      const subcategories = response?.data?.subcategories || response?.data || [];
      setSubcategories(Array.isArray(subcategories) ? subcategories : []);
    } catch (error: any) {
      console.error('Erro ao carregar subcategorias:', error);
      setSubcategories([]);
    }
  };

  const formatDate = (date: Date | string | { _seconds: number; _nanoseconds: number } | null | undefined) => {
    if (!date) return '-';
    
    try {
      const dateObj = date && typeof date === 'object' && '_seconds' in date 
        ? (() => {
            const firebaseDate = new Date(date._seconds * 1000);
            // Converter para timezone local usando parseLocalDateFlexible
            const localDateString = firebaseDate.toISOString().split('T')[0]; // Pega apenas YYYY-MM-DD
            return parseLocalDateFlexible(localDateString);
          })()
        : parseLocalDateFlexible(date as string | Date);
      
      return isNaN(dateObj.getTime()) ? '-' : dateObj.toLocaleDateString('pt-BR');
    } catch (error: any) {
      return '-';
    }
  };

  // Função para recalcular stats
  const recalculateStats = (cards: CreditCard[], allExpenses: (Expense | ExpenseCard)[]) => {
    const totalLimit = cards.reduce((sum: number, card: CreditCard) => sum + (card.limit || 0), 0);
    
    
    // Verificar se algum cartão tem currentBalance válido
    const hasValidBalance = cards.some(card => card.currentBalance && card.currentBalance > 0);
    
    let totalUsed = 0;
    
    if (hasValidBalance) {
      // Se pelo menos um cartão tem saldo válido, usar currentBalance
      totalUsed = cards.reduce((sum: number, card: CreditCard) => {
        const cardBalance = card.currentBalance || 0;
        return sum + cardBalance;
      }, 0);
    } else {
      // Se nenhum cartão tem saldo válido, calcular baseado nas despesas (método anterior)
      let runningTotal = 0;
      const processedExpenses = new Set<string>();
      
      totalUsed = allExpenses.reduce((sum: number, expense: Expense | ExpenseCard) => {
        // Verificar se é uma despesa de cartão
        if ('creditCardId' in expense) {
          const belongsToExistingCard = cards.some(card => card.id === expense.creditCardId);
          if (belongsToExistingCard) {
            let amountToAdd = expense.amount;
            
            // Se for uma despesa parcelada, usar o valor original apenas uma vez
            if (expense.isInstallment && expense.originalAmount && expense.installmentNumber && expense.totalInstallments) {
              const originalPurchaseKey = `${expense.creditCardId}-${expense.originalAmount}-${expense.totalInstallments}-${expense.description.replace(/ \(\d+\/\d+\)$/, '')}`;
              
              if (!processedExpenses.has(originalPurchaseKey)) {
                amountToAdd = expense.originalAmount;
                processedExpenses.add(originalPurchaseKey);
              } else {
                amountToAdd = 0;
              }
            }
            
            runningTotal += amountToAdd;
            return sum + amountToAdd;
          }
        }
        return sum;
      }, 0);
    }
    
    const totalAvailable = totalLimit - totalUsed;


    setStats({
      totalCards: cards.length,
      totalLimit,
      totalUsed,
      totalAvailable
    });
  };

  const fetchExpenses = async () => {
    console.log('🔄 fetchExpenses - Iniciando busca de despesas...');
    setIsLoadingExpenses(true);
    try {
      // Buscar despesas normais
      console.log('🔄 Buscando despesas normais...');
      const normalResponse = await expenseService.getExpenses();
      const normalExpenses = normalResponse.data.expenses || [];
      setExpenses(normalExpenses);
      console.log('✅ Despesas normais buscadas:', normalExpenses.length);
      
      // Buscar despesas de cartão
      console.log('🔄 Buscando despesas de cartão...');
      const creditCardExpenses = await expenseCardService.getExpenseCards();
      console.log('📦 Despesas de cartão buscadas:', {
        count: creditCardExpenses.length,
        expenses: creditCardExpenses.map(e => ({
          id: e.id,
          description: e.description,
          amount: e.amount,
          creditCardId: e.creditCardId,
          referenceMonth: e.referenceMonth
        }))
      });
      setExpenseCards(creditCardExpenses);
      
      // Atualizar métricas dos cartões
      console.log('🔄 Atualizando métricas dos cartões...');
      await expenseCardService.updateMetrics();
      console.log('✅ Métricas atualizadas');
      
      // Recalcular stats com as novas despesas (só se cartões já foram carregados)
      if (creditCards.length > 0) {
        recalculateStats(creditCards, [...normalExpenses, ...creditCardExpenses]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar despesas:', error);
      console.error('❌ Detalhes do erro:', error);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const refreshData = async () => {
    try {
      console.log('🔄 Atualizando dados do banco...');
      toast.loading('Recalculando faturas...', { id: 'refresh' });
      
      // 1. Atualizar métricas dos cartões (recalcular GASTO e FATURA ATUAL)
      console.log('📊 Recalculando métricas dos cartões...');
      await expenseCardService.updateMetrics();
      
      // 2. Recarregar cartões com dados atualizados
      console.log('🔄 Recarregando cartões...');
      await fetchCreditCards();
      
      // 3. Recarregar despesas
      console.log('🔄 Recarregando despesas...');
      await fetchExpenses();
      
      toast.success('Faturas recalculadas com sucesso!', { id: 'refresh' });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar dados:', error);
      toast.error('Erro ao recalcular faturas', { id: 'refresh' });
    }
  };

  const openModal = (type: 'create' | 'edit', cardId?: string) => {
    setModalType(type);
    setEditingCardId(cardId || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCardId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cardData = {
        name: formData.name,
        limit: parseFloat(formData.limit) || 0,
        closingDate: parseInt(formData.closingDate) || 1,
        dueDate: parseInt(formData.dueDate) || 1,
        color: formData.color,
        bank: formData.bank || undefined,
        lastFourDigits: formData.lastFourDigits || undefined,
        interestRate: parseFloat(formData.interestRate) || 0,
        installmentInterestRate: parseFloat(formData.installmentInterestRate) || 0,
        advanceDiscountRate: parseFloat(formData.advanceDiscountRate) || 0,
        annualFee: parseFloat(formData.annualFee) || 0
      };

      console.log('📦 Dados do cartão sendo enviados:', cardData);
      console.log('📦 FormData original:', formData);

      if (modalType === 'create') {
        const response = await creditCardService.createCreditCard(cardData);
        console.log('✅ Resposta da criação:', response);
        toast.success('Cartão criado com sucesso!');
        // Adicionar cartão ao contexto global
        addCreditCard(response.data);
      } else if (modalType === 'edit' && editingCardId) {
        const response = await creditCardService.updateCreditCard(editingCardId, cardData);
        console.log('✅ Resposta da atualização:', response);
        toast.success('Cartão atualizado com sucesso!');
        // Atualizar cartão no contexto global
        updateCreditCard(response.data);
      }

      closeModal();
    } catch (error: any) {
      console.error('❌ Erro ao salvar cartão:', error);
      console.error('❌ Detalhes do erro:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      toast.error(`Erro ao salvar cartão: ${error?.response?.data?.error?.message || error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (cardId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este cartão?')) {
      try {
        await creditCardService.deleteCreditCard(cardId);
        toast.success('Cartão deletado com sucesso!');
        // Remover cartão do contexto global
        removeCreditCard(cardId);
      } catch (error: any) {
        console.error('Erro ao deletar cartão:', error);
        toast.error('Erro ao deletar cartão');
      }
    }
  };

  // Funções para gerenciar despesas
  const openExpenseModal = (card: CreditCard) => {
    setSelectedCardForExpense(card);
    setExpenseFormData({
      description: '',
      amount: '',
      dueDate: getTodayString(), // Data atual como padrão
      categoryId: '',
      subcategoryId: '',
      tags: '',
      observations: '',
      isPaid: true, // Sempre true para cartão de crédito
      paymentDate: '',
      isInstallment: false,
      installments: 1
    });
    setEditingExpense(null);
    setSubcategories([]); // Limpar subcategorias ao abrir modal de nova despesa
    setIsExpenseModalOpen(true);
  };

  const handleExpenseInputChange = (field: string, value: string | boolean | number) => {
    setExpenseFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'categoryId') {
      value ? fetchSubcategories(value as string) : setSubcategories([]);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCardForExpense) return;

    setIsSavingExpense(true);
    try {
      const expenseData = {
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        dueDate: parseLocalDate(expenseFormData.dueDate),
        categoryId: expenseFormData.categoryId,
        subcategoryId: expenseFormData.subcategoryId || '',
        tags: expenseFormData.tags ? expenseFormData.tags.split(',').map(tag => tag.trim()) : [],
        observations: expenseFormData.observations,
        isPaid: true, // Sempre true para cartão de crédito
        paidDate: parseLocalDate(expenseFormData.dueDate), // Usar a data de pagamento como paidDate
        isCreditCard: true,
        creditCardId: selectedCardForExpense.id,
        isInstallment: Boolean(expenseFormData.isInstallment),
        installments: expenseFormData.isInstallment ? parseInt(expenseFormData.installments.toString()) : 1
      };


      if (editingExpense) {
        // Usar o serviço correto baseado no tipo de despesa
        if ('creditCardId' in editingExpense) {
          await expenseCardService.updateExpenseCard(editingExpense.id, expenseData);
        } else {
          await expenseService.updateExpense(editingExpense.id, expenseData);
        }
        toast.success('Despesa atualizada com sucesso!');
      } else {
        // Criação de nova despesa
        const isInstallment = Boolean(expenseFormData.isInstallment);
        const installments = isInstallment ? parseInt(expenseFormData.installments.toString()) : 1;
        const totalAmount = parseFloat(expenseFormData.amount);

        if (isInstallment && installments > 1) {
          // Criar múltiplas despesas para parcelamento
          console.log('➕ Criando despesa parcelada...');
          
          const baseDate = parseLocalDate(expenseFormData.dueDate);
          const installmentAmount = totalAmount / installments;
          const createdExpenses = [];
          const closingDay = selectedCardForExpense.closingDate || 1;

          for (let i = 1; i <= installments; i++) {
            // Calcular a data de vencimento da parcela baseada no mês da fatura
            const dueDate = new Date(baseDate);
            
            // A primeira parcela vai para o mês atual
            // As demais vão para os meses seguintes
            if (i > 1) {
              dueDate.setMonth(dueDate.getMonth() + (i - 1));
            }
            
            // Ajustar para o dia de fechamento do cartão
            dueDate.setDate(closingDay);

            const installmentData = {
              description: `${expenseFormData.description} (${i}/${installments})`,
              amount: installmentAmount,
              dueDate: dueDate,
              categoryId: expenseFormData.categoryId,
              subcategoryId: expenseFormData.subcategoryId || '',
              tags: expenseFormData.tags ? expenseFormData.tags.split(',').map(tag => tag.trim()) : [],
              observations: expenseFormData.observations,
              isPaid: false, // Parcelas começam como não pagas
              paidDate: undefined, // Sem data de pagamento
              isCreditCard: true,
              creditCardId: selectedCardForExpense.id,
              isInstallment: true,
              installments: installments,
              installmentNumber: i,
              totalInstallments: installments,
              originalAmount: totalAmount
            };

            // Usar o serviço correto baseado no tipo de despesa
            const response = installmentData.isCreditCard 
              ? await expenseCardService.createExpenseCard(installmentData)
              : await expenseService.createExpense(installmentData);
            
            createdExpenses.push(response);
          }

          toast.success(`${installments} parcelas criadas com sucesso!`);
        } else {
          // Criar despesa única
          // Usar o serviço correto baseado no tipo de despesa
          const response = expenseData.isCreditCard 
            ? await expenseCardService.createExpenseCard(expenseData)
            : await expenseService.createExpense(expenseData);
          toast.success('Despesa criada com sucesso!');
        }
      }
      
      await fetchExpenses();
      await fetchCreditCards();
      
      setIsExpenseModalOpen(false);
      setSelectedCardForExpense(null);
      setEditingExpense(null);
    } catch (error: any) {
      console.error('❌ Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleEditExpense = (expense: Expense | ExpenseCard) => {
    setEditingExpense(expense);
    setSelectedCardForExpense(creditCards.find((card: CreditCard) => card.id === expense.creditCardId) || null);
    
    // Função para formatar data para input
    const formatDateForInput = (date: Date | string | { _seconds: number; _nanoseconds: number } | null | undefined) => {
      if (!date) return '';
      
      let dateObj: Date;
      
      try {
        // Se for um objeto do Firebase (tem _seconds)
        if (date && typeof date === 'object' && '_seconds' in date && typeof date._seconds === 'number') {
          const firebaseDate = new Date(date._seconds * 1000);
          // Converter para timezone local usando parseLocalDateFlexible
          const localDateString = firebaseDate.toISOString().split('T')[0]; // Pega apenas YYYY-MM-DD
          dateObj = parseLocalDateFlexible(localDateString);
        }
        // Se for uma string
        else if (typeof date === 'string') {
          dateObj = parseLocalDateFlexible(date);
        }
        // Se já for uma instância de Date
        else if (date instanceof Date) {
          dateObj = date;
        }
        // Fallback
        else {
          return '';
        }
        
        // Verificar se a data é válida
        if (isNaN(dateObj.getTime())) {
          return '';
        }
        
        return formatDateToLocal(dateObj);
      } catch (error: any) {
        console.error('Erro ao formatar data para input:', error, date);
        return '';
      }
    };
    
    setExpenseFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      dueDate: formatDateForInput(expense.dueDate),
      categoryId: expense.categoryId,
      subcategoryId: expense.subcategoryId || '',
      tags: expense.tags ? expense.tags.join(', ') : '',
      observations: expense.observations || '',
      isPaid: true, // Sempre true para cartão de crédito
      paymentDate: formatDateForInput(expense.paidDate),
      isInstallment: expense.isInstallment || false,
      installments: expense.installments || 1
    });
    
    // Carregar subcategorias para a categoria da despesa
    if (expense.categoryId) {
      console.log('🔄 Carregando subcategorias para edição da despesa:', expense.categoryId);
      fetchSubcategories(expense.categoryId);
    }
    
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (expense: Expense | ExpenseCard) => {
    if (window.confirm('Tem certeza que deseja deletar esta despesa?')) {
      try {
        // Usar o serviço correto baseado no tipo de despesa
        if ('creditCardId' in expense) {
          await expenseCardService.deleteExpenseCard(expense.id);
        } else {
          await expenseService.deleteExpense(expense.id);
        }
        toast.success('Despesa deletada com sucesso!');
        
        await fetchExpenses();
        await fetchCreditCards();
      } catch (error: any) {
        console.error('Erro ao deletar despesa:', error);
        toast.error('Erro ao deletar despesa');
      }
    }
  };

  const handleViewExpense = (expense: Expense | ExpenseCard) => {
    setViewingExpense(expense);
    setIsViewExpenseModalOpen(true);
  };

  const handlePayBill = (card: CreditCard) => {
    setSelectedCardForPayment(card);
    const cardStats = getCardStats(card, currentMonth);
    setPaymentFormData({
      paymentType: 'full',
      amount: cardStats.currentBill.toString(),
      bankAccountId: '',
      description: `Pagamento fatura ${card.name}`
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCardForPayment) return;
    
    setIsProcessingPayment(true);
    
    try {
      const paymentAmount = parseFloat(paymentFormData.amount);
      
      if (paymentAmount <= 0) {
        toast.error('Valor do pagamento deve ser maior que zero');
        return;
      }
      
      if (!paymentFormData.bankAccountId) {
        toast.error('Selecione uma conta bancária');
        return;
      }
      
      // 1. Pagar fatura do cartão (marcar despesas como pagas)
      console.log('💳 Pagando fatura do cartão:', selectedCardForPayment.id);
      
      const paymentResult = await expenseCardService.payBill(
        selectedCardForPayment.id,
        currentMonth,
        paymentAmount
      );
      
      console.log('✅ Resultado do pagamento:', paymentResult);
      
      // 2. Criar despesa de pagamento na conta bancária
      const paymentExpense = {
        description: paymentFormData.description,
        amount: paymentAmount,
        dueDate: getTodayString(),
        categoryId: '', // Categoria vazia para pagamentos
        subcategoryId: '',
        tags: ['pagamento', 'fatura'],
        observations: `Pagamento da fatura do cartão ${selectedCardForPayment.name}`,
        isPaid: true,
        paidDate: getTodayString(),
        isCreditCard: false, // IMPORTANTE: false indica que é pagamento, não despesa de cartão
        bankAccountId: paymentFormData.bankAccountId
      };
      
      console.log('💳 Criando despesa de pagamento:', paymentExpense);
      
      // Usar rota específica para pagamentos
      const response = await fetch('https://aurance-back-end.vercel.app/api/expenses/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          description: paymentExpense.description,
          amount: paymentExpense.amount,
          dueDate: paymentExpense.dueDate,
          bankAccountId: paymentExpense.bankAccountId,
          observations: paymentExpense.observations,
          tags: paymentExpense.tags
        })
      });
      
      console.log('📡 Status da resposta:', response.status);
      console.log('📡 Headers da resposta:', response.headers);
      
      if (!response.ok) {
        console.log('❌ Erro na resposta:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('❌ Conteúdo da resposta:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Erro ao processar pagamento');
        } catch (parseError) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      console.log('✅ Pagamento criado:', result);
      
      toast.success(`Pagamento de ${formatCurrency(paymentAmount)} realizado com sucesso!`);
      
      // 3. Recarregar dados (as métricas já foram atualizadas pelo payBill)
      await fetchCreditCards();
      await fetchExpenses();
      
      // 4. Fechar modal
      setIsPaymentModalOpen(false);
      setSelectedCardForPayment(null);
      setPaymentFormData({
        paymentType: 'full',
        amount: '',
        bankAccountId: '',
        description: ''
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Funções utilitárias simplificadas
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercentage = (value: number, total: number) => 
    total === 0 ? '0%' : `${Math.round((value / total) * 100)}%`;

  const getUsagePercentage = (card: CreditCard) => 
    card.limit ? Math.round(((card.currentBalance || 0) / card.limit) * 100) : 0;

  if (loading) {
    return <GlobalLoading message="💳 Carregando Cartões" subtitle="Buscando seus cartões de crédito..." />;
  }

  return (
    <CreditCardsContainer>
      <Header>
        <Title>Cartões de Crédito</Title>
        <HeaderActions>
          <Button onClick={() => openModal('create')}>
            <FiPlus />
            Novo Cartão
          </Button>
        </HeaderActions>
      </Header>

      {/* Navegação por mês */}
      <MonthNavigation>
        <NavigationButton 
          onClick={goToPreviousMonth}
          isLoading={isChangingMonth}
          disabled={isChangingMonth}
        >
          <FiChevronLeft />
          {isChangingMonth && <MiniLoading><div className="spinner"></div></MiniLoading>}
        </NavigationButton>
        
        <MonthDisplay>
          {formatMonthYear(currentMonth)}
          {isChangingMonth && (
            <MiniLoading>
              <div className="spinner"></div>
              <span>Atualizando...</span>
            </MiniLoading>
          )}
        </MonthDisplay>
        
        <NavigationButton 
          onClick={goToNextMonth}
          isLoading={isChangingMonth}
          disabled={isChangingMonth}
        >
          <FiChevronRight />
          {isChangingMonth && <MiniLoading><div className="spinner"></div></MiniLoading>}
        </NavigationButton>
        
        <NavigationButton 
          onClick={goToToday}
          isLoading={isChangingMonth}
          disabled={isChangingMonth}
        >
          Hoje
          {isChangingMonth && <MiniLoading><div className="spinner"></div></MiniLoading>}
        </NavigationButton>
      </MonthNavigation>

      {/* Estatísticas gerais (menores) */}
      <StatsGrid>
        <StatCard>
          <StatTitle>Total de Cartões</StatTitle>
          <StatValue>{stats.totalCards}</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Limite Total</StatTitle>
          <StatValue>{formatCurrency(stats.totalLimit)}</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Valor Usado</StatTitle>
          <StatValue>{formatCurrency(stats.totalUsed)}</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>Disponível</StatTitle>
          <StatValue>{formatCurrency(stats.totalAvailable)}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* Grid de cartões compactos */}
      {creditCards.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiCreditCard />
          </EmptyIcon>
          <h3>Nenhum cartão de crédito encontrado</h3>
          <p>Adicione seu primeiro cartão de crédito para começar a controlar seus gastos.</p>
          <Button onClick={() => openModal('create')}>
            <FiPlus />
            Adicionar Cartão
          </Button>
        </EmptyState>
      ) : (
        <CardsGrid>
          {creditCards.map((card: CreditCard) => {
            const isExpanded = expandedCards.has(card.id);
            const cardStats = getCardStats(card, currentMonth);
            const monthExpenses = getExpensesForMonth(card.id, currentMonth);
            
            return (
              <CompactCard 
                key={card.id} 
                color={card.color}
                isExpanded={isExpanded}
                style={{ position: 'relative' }}
              >
                {/* Overlay de loading durante mudança de mês */}
                <CardsLoadingOverlay isVisible={isChangingMonth}>
                  <div className="loading-content">
                    <div className="spinner"></div>
                    <span>Atualizando valores...</span>
                  </div>
                </CardsLoadingOverlay>
                {(isLoadingExpenses || isLoadingCategories || isLoadingBankAccounts) && (
                  <LoadingOverlay>
                    <Spinner size={24} />
                  </LoadingOverlay>
                )}
                <CardHeader>
                  <CardName>
                    <CardIcon color={card.color} />
                    {card.name}
                  </CardName>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Botões de ação do cartão */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCardForExpense(card);
                        setEditingExpense(null);
                        setExpenseFormData({
                          description: '',
                          amount: '',
                          dueDate: getTodayString(), // Data atual como padrão
                          categoryId: '',
                          subcategoryId: '',
                          tags: '',
                          observations: '',
                          isPaid: true,
                          paymentDate: '',
                          isInstallment: false,
                          installments: 1
                        });
                        setIsExpenseModalOpen(true);
                      }}
                      style={{
                        background: '#3B82F6',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '500',
                        gap: '2px'
                      }}
                      title="Nova Despesa"
                    >
                      <FiPlus size={12} />
                      Nova Despesa
                    </button>
                    
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayBill(card);
                      }}
                      style={{
                        background: '#10B981',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '500',
                        gap: '2px'
                      }}
                      title="Pagar Fatura"
                    >
                      <FiCreditCard size={12} />
                      Pagar Fatura
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({
                          name: card.name,
                          limit: card.limit?.toString() || '',
                          closingDate: card.closingDate?.toString() || '',
                          dueDate: card.dueDate?.toString() || '',
                          color: card.color || '#3B82F6',
                          bank: card.bank || '',
                          lastFourDigits: card.lastFourDigits || '',
                          interestRate: card.interestRate?.toString() || '',
                          installmentInterestRate: card.installmentInterestRate?.toString() || '',
                          advanceDiscountRate: card.advanceDiscountRate?.toString() || '',
                          annualFee: card.annualFee?.toString() || ''
                        });
                        openModal('edit', card.id);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #D1D5DB',
                        color: '#6B7280',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Editar Cartão"
                    >
                      <FiEdit size={16} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(card.id);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #EF4444',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Deletar Cartão"
                    >
                      <FiTrash2 size={16} />
                    </button>
                    
                    <ExpandButton onClick={() => toggleCardExpansion(card.id)}>
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </ExpandButton>
                  </div>
                </CardHeader>

                <CardStats>
                  <StatItem>
                    <StatLabel>Total</StatLabel>
                    <StatValue>{formatCurrency(card.limit)}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Gasto</StatLabel>
                    <StatValue 
                      variant="danger"
                      className={animatingValues.has(`${card.id}-totalSpent`) ? 'value-changing' : ''}
                    >
                      {formatCurrency(cardStats.totalSpent)}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Fatura Atual</StatLabel>
                    <StatValue 
                      variant="warning"
                      className={animatingValues.has(`${card.id}-currentBill`) ? 'value-changing' : ''}
                    >
                      {formatCurrency(cardStats.currentBill)}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Disponível</StatLabel>
                    <StatValue 
                      variant="success"
                      className={animatingValues.has(`${card.id}-availableLimit`) ? 'value-changing' : ''}
                    >
                      {formatCurrency(cardStats.available)}
                    </StatValue>
                  </StatItem>
                </CardStats>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                  <div></div>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: '#6B7280', 
                    fontWeight: '500' 
                  }}>
                    {cardStats.usagePercentage.toFixed(1)}%
                  </div>
                </div>
                <UsageBar>
                  <UsageFill 
                    percentage={cardStats.usagePercentage} 
                    color={card.color}
                  />
                </UsageBar>
                
                <UsageText>
                  {cardStats.expenseCount} compra{cardStats.expenseCount !== 1 ? 's' : ''} este mês • Fatura: {formatCurrency(cardStats.currentBill)}
                </UsageText>

                {/* Detalhes expansíveis */}
                <CardDetails isExpanded={isExpanded}>
                  <ExpensesList>
                    {monthExpenses.length === 0 ? (
                      <div style={{ 
                        textAlign: 'center', 
                        color: 'var(--text-secondary)', 
                        padding: 'var(--spacing-md)',
                        fontSize: '0.8rem'
                      }}>
                        Nenhuma compra este mês
                      </div>
                    ) : (
                      monthExpenses.map(expense => (
                        <ExpenseItem key={expense.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            {/* Indicador de status */}
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: expense.isPaid ? '#10B981' : '#F59E0B',
                              flexShrink: 0
                            }} title={expense.isPaid ? 'Paga' : 'Pendente'} />
                            
                            <ExpenseDescription>
                              {expense.description}
                              {expense.referenceMonth && (
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  color: '#666', 
                                  marginLeft: '4px' 
                                }}>
                                  ({expense.referenceMonth})
                                </span>
                              )}
                            </ExpenseDescription>
                            <ExpenseAmount>
                              {formatCurrency(expense.amount)}
                            </ExpenseAmount>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditExpense(expense);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#3B82F6',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Editar despesa"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(expense);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Deletar despesa"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </ExpenseItem>
                      ))
                    )}
                  </ExpensesList>
                </CardDetails>
              </CompactCard>
            );
          })}
        </CardsGrid>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                 {modalType === 'create' && (
                   <>
                     <FiCreditCard />
                     Novo Cartão de Crédito
                   </>
                 )}
                 {modalType === 'edit' && (
                   <>
                     <FiEdit />
                     Editar Cartão de Crédito
                   </>
                 )}
               </ModalTitle>
               <CloseButton onClick={closeModal}>
                 <FiX />
               </CloseButton>
             </ModalHeader>

                             <Form onSubmit={handleSubmit}>
                 {/* Seção: Informações Básicas */}
                 <FormSection>
                   <SectionTitle>
                     <FiCreditCard />
                     Informações Básicas
                   </SectionTitle>
                   
                                        <FormGroup>
                       <Label htmlFor="name" className="required">Nome do Cartão</Label>
                                           <StyledInput
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                        placeholder="Ex: Nubank, Itaú, Bradesco..."
                      />
                   </FormGroup>

                   <FormRow>
                                            <FormGroup>
                         <Label htmlFor="limit" className="required">Limite</Label>
                                               <StyledInput
                          type="number"
                          id="limit"
                          name="limit"
                          value={formData.limit}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                        />
                     </FormGroup>

                     <FormGroup>
                       <Label htmlFor="color">Cor do Cartão</Label>
                       <ColorPickerContainer>
                         <ColorPicker
                           type="color"
                           id="color"
                           name="color"
                           value={formData.color}
                           onChange={handleInputChange}
                         />
                         <ColorPreview color={formData.color}>
                           {formData.color}
                         </ColorPreview>
                       </ColorPickerContainer>
                     </FormGroup>
                   </FormRow>
                 </FormSection>

                 {/* Seção: Datas e Vencimentos */}
                 <FormSection>
                   <SectionTitle>
                     <FiCalendar />
                     Datas e Vencimentos
                   </SectionTitle>
                   
                   <FormRow>
                                            <FormGroup>
                         <Label htmlFor="closingDate" className="required">Dia de Fechamento</Label>
                                               <StyledSelect
                          id="closingDate"
                          name="closingDate"
                          value={formData.closingDate}
                          onChange={handleInputChange}
                          required
                        >
                         <option value="">Selecione o dia</option>
                         {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                           <option key={day} value={day}>{day}</option>
                         ))}
                       </StyledSelect>
                     </FormGroup>

                                            <FormGroup>
                         <Label htmlFor="dueDate" className="required">Dia de Vencimento</Label>
                                               <StyledSelect
                          id="dueDate"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                        >
                         <option value="">Selecione o dia</option>
                         {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                           <option key={day} value={day}>{day}</option>
                         ))}
                       </StyledSelect>
                     </FormGroup>
                   </FormRow>
                 </FormSection>

                 {/* Seção: Informações do Banco */}
                 <FormSection>
                   <SectionTitle>
                     <FiDollarSign />
                     Informações do Banco
                   </SectionTitle>
                   
                   <FormRow>
                     <FormGroup>
                       <Label htmlFor="bank">Banco</Label>
                                               <StyledInput
                          type="text"
                          id="bank"
                          name="bank"
                          value={formData.bank}
                          onChange={handleInputChange}
                          maxLength={50}
                          placeholder="Nome do banco"
                        />
                     </FormGroup>

                     <FormGroup>
                       <Label htmlFor="lastFourDigits">Últimos 4 dígitos</Label>
                                               <StyledInput
                          type="text"
                          id="lastFourDigits"
                          name="lastFourDigits"
                          value={formData.lastFourDigits}
                          onChange={handleInputChange}
                          maxLength={4}
                          pattern="[0-9]{4}"
                          placeholder="1234"
                        />
                     </FormGroup>
                   </FormRow>
                 </FormSection>

                 {/* Seção: Taxas e Custos */}
                 <FormSection>
                   <SectionTitle>
                     <FiTrendingUp />
                     Taxas e Custos
                   </SectionTitle>
                   
                   <FormRow>
                     <FormGroup>
                       <Label htmlFor="interestRate">Taxa de Juros Mensal (%)</Label>
                                               <StyledInput
                          type="number"
                          id="interestRate"
                          name="interestRate"
                          value={formData.interestRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0,00"
                        />
                     </FormGroup>

                     <FormGroup>
                       <Label htmlFor="installmentInterestRate">Taxa de Parcelamento (%)</Label>
                                               <StyledInput
                          type="number"
                          id="installmentInterestRate"
                          name="installmentInterestRate"
                          value={formData.installmentInterestRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0,00"
                        />
                     </FormGroup>
                   </FormRow>

                   <FormRow>
                     <FormGroup>
                       <Label htmlFor="advanceDiscountRate">Desconto por Adiantamento (%)</Label>
                                               <StyledInput
                          type="number"
                          id="advanceDiscountRate"
                          name="advanceDiscountRate"
                          value={formData.advanceDiscountRate}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0,00"
                        />
                     </FormGroup>

                     <FormGroup>
                       <Label htmlFor="annualFee">Taxa Anual</Label>
                                               <StyledInput
                          type="number"
                          id="annualFee"
                          name="annualFee"
                          value={formData.annualFee}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                        />
                     </FormGroup>
                   </FormRow>
                 </FormSection>

                                 <FormActions>
                   <CancelButton 
                     type="button" 
                     variant="outline" 
                     onClick={closeModal}
                   >
                     <FiX style={{ marginRight: '4px' }} />
                     Cancelar
                   </CancelButton>
                   <SubmitButton 
                     type="submit"
                   >
                     {modalType === 'create' ? (
                       <>
                         <FiPlus style={{ marginRight: '4px' }} />
                         Criar Cartão
                       </>
                     ) : (
                       <>
                         <FiEdit style={{ marginRight: '4px' }} />
                         Salvar Alterações
                       </>
                     )}
                   </SubmitButton>
                 </FormActions>
              </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal de Despesa */}
      {isExpenseModalOpen && (
        <ModalOverlay onClick={() => setIsExpenseModalOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingExpense ? (
                  <>
                    <FiEdit />
                    Editar Despesa
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    Nova Despesa - {selectedCardForExpense?.name}
                  </>
                )}
              </ModalTitle>
              <CloseButton onClick={() => setIsExpenseModalOpen(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

                         <Form onSubmit={handleExpenseSubmit}>
               <FormSection>
                 <SectionTitle>
                   <FiShoppingCart />
                   Informações da Despesa
                 </SectionTitle>
                 
                 <FormGroup>
                   <Label htmlFor="description" className="required">Descrição</Label>
                   <StyledInput
                     type="text"
                     id="description"
                     name="description"
                     value={expenseFormData.description}
                     onChange={(e) => handleExpenseInputChange('description', e.target.value)}
                     placeholder="Descrição da despesa"
                     required
                   />
                 </FormGroup>

                 <FormRow>
                   <FormGroup>
                     <Label htmlFor="amount" className="required">Valor</Label>
                     <StyledInput
                       type="number"
                       id="amount"
                       name="amount"
                       value={expenseFormData.amount}
                       onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                       min="0.01"
                       step="0.01"
                       placeholder="0,00"
                       required
                     />
                   </FormGroup>

                   <FormGroup>
                     <Label htmlFor="dueDate" className="required">Data de Pagamento</Label>
                     <StyledInput
                       type="date"
                       id="dueDate"
                       name="dueDate"
                       value={expenseFormData.dueDate}
                       onChange={(e) => handleExpenseInputChange('dueDate', e.target.value)}
                       required
                     />
                   </FormGroup>
                 </FormRow>

                 <FormRow>
                                     <FormGroup>
                    <Label htmlFor="categoryId" className="required">Categoria</Label>
                    {categories.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                        <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>
                          Nenhuma categoria encontrada
                        </p>
                        <CreateCategoriesButton 
                          type="button" 
                          onClick={createDefaultCategories}
                        >
                          Criar Categorias Padrão
                        </CreateCategoriesButton>
                      </div>
                    ) : (
                      <StyledSelect
                        id="categoryId"
                        name="categoryId"
                        value={expenseFormData.categoryId}
                        onChange={(e) => handleExpenseInputChange('categoryId', e.target.value)}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {(categories || []).filter(category => category.type === 'expense').map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </StyledSelect>
                    )}
                  </FormGroup>

                   <FormGroup>
                     <Label htmlFor="subcategoryId">Subcategoria</Label>
                     {(() => {
                       console.log('🔍 Renderizando subcategorias:', {
                         subcategories,
                         categoryId: expenseFormData.categoryId,
                         filtered: (subcategories || []).filter(sub => sub.categoryId === expenseFormData.categoryId)
                       });
                       return (
                         <StyledSelect
                           id="subcategoryId"
                           name="subcategoryId"
                           value={expenseFormData.subcategoryId}
                           onChange={(e) => handleExpenseInputChange('subcategoryId', e.target.value)}
                         >
                           <option value="">Selecione uma subcategoria</option>
                                                       {(subcategories || [])
                              .filter(sub => {
                                // Verificar se sub.categoryId é um objeto ou string
                                let subCategoryId: string;
                                if (typeof sub.categoryId === 'object' && sub.categoryId !== null) {
                                  subCategoryId = (sub.categoryId as any).id || (sub.categoryId as any)._id || '';
                                } else {
                                  subCategoryId = String(sub.categoryId || '');
                                }
                                
                                const expenseCategoryId = expenseFormData.categoryId;
                                const match = subCategoryId === expenseCategoryId;
                                
                                console.log('🔍 Filtrando subcategoria:', {
                                  subCategoryId: sub.categoryId,
                                  subCategoryIdProcessed: subCategoryId,
                                  expenseCategoryId,
                                  match
                                });
                                return match;
                              })
                             .map(subcategory => (
                               <option key={subcategory.id} value={subcategory.id}>
                                 {subcategory.name}
                               </option>
                             ))}
                         </StyledSelect>
                       );
                     })()}
                   </FormGroup>
                 </FormRow>

                 <FormGroup>
                   <Label htmlFor="tags">Tags</Label>
                   <StyledInput
                     type="text"
                     id="tags"
                     name="tags"
                     value={expenseFormData.tags}
                     onChange={(e) => handleExpenseInputChange('tags', e.target.value)}
                     placeholder="tag1, tag2, tag3"
                   />
                 </FormGroup>

                 <FormGroup>
                   <Label htmlFor="observations">Observações</Label>
                   <textarea
                     id="observations"
                     name="observations"
                     value={expenseFormData.observations}
                     onChange={(e) => handleExpenseInputChange('observations', e.target.value)}
                     placeholder="Observações adicionais"
                     rows={2}
                     style={{
                       padding: 'var(--spacing-sm)',
                       border: '2px solid #cbd5e1',
                       borderRadius: '6px',
                       fontSize: '0.9rem',
                       resize: 'vertical',
                       minHeight: '60px',
                       fontFamily: 'inherit',
                       background: '#fafbfc',
                       transition: 'all 0.2s ease'
                     }}
                   />
                 </FormGroup>
               </FormSection>

                             <FormSection>
                 <SectionTitle>
                   <FiCreditCard />
                   Configurações de Pagamento
                 </SectionTitle>
                 
                                   <FormRow>
                    <FormGroup>
                      <Label htmlFor="isInstallment">Parcelado</Label>
                      <SwitchContainer>
                        <SwitchInput
                          type="checkbox"
                          id="isInstallment"
                          checked={expenseFormData.isInstallment}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExpenseInputChange('isInstallment', e.target.checked)}
                        />
                        <Switch htmlFor="isInstallment" />
                        <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '0.85rem' }}>
                          {expenseFormData.isInstallment ? 'Sim' : 'Não'}
                        </span>
                      </SwitchContainer>
                    </FormGroup>
                  </FormRow>

                 {expenseFormData.isInstallment && (
                   <FormGroup>
                     <Label htmlFor="installments">Número de Parcelas</Label>
                     <StyledSelect
                       id="installments"
                       name="installments"
                       value={expenseFormData.installments}
                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleExpenseInputChange('installments', parseInt(e.target.value))}
                     >
                       {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                         <option key={num} value={num}>{num}x</option>
                       ))}
                     </StyledSelect>
                   </FormGroup>
                 )}
               </FormSection>

              <FormActions>
                <CancelButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsExpenseModalOpen(false)}
                >
                  <FiX style={{ marginRight: '4px' }} />
                  Cancelar
                </CancelButton>
                <SubmitButton type="submit" disabled={isSavingExpense}>
                  {isSavingExpense ? (
                    <Spinner size={16} />
                  ) : editingExpense ? (
                    <>
                      <FiEdit style={{ marginRight: '4px' }} />
                      Salvar Alterações
                    </>
                  ) : (
                    <>
                      <FiPlus style={{ marginRight: '4px' }} />
                      Criar Despesa
                    </>
                  )}
                </SubmitButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal de Visualização de Despesa */}
      {isViewExpenseModalOpen && viewingExpense && (
        <ModalOverlay onClick={() => setIsViewExpenseModalOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FiEye />
                Detalhes da Despesa
              </ModalTitle>
              <CloseButton onClick={() => setIsViewExpenseModalOpen(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <div style={{ padding: 'var(--spacing-xl)' }}>
              <DetailRow>
                <DetailLabel>Descrição:</DetailLabel>
                <DetailValue>{viewingExpense.description}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Valor:</DetailLabel>
                <DetailValue>{formatCurrency(viewingExpense.amount)}</DetailValue>
              </DetailRow>
              
                             <DetailRow>
                 <DetailLabel>Data de Pagamento:</DetailLabel>
                 <DetailValue>{formatDate(viewingExpense.paidDate || viewingExpense.dueDate)}</DetailValue>
               </DetailRow>
               
               <DetailRow>
                 <DetailLabel>Fatura:</DetailLabel>
                 <DetailValue>
                   {(() => {
                     if (!viewingExpense.paidDate) return '-';
                     
                     const paymentDate = viewingExpense.paidDate ? new Date(viewingExpense.paidDate) : null;
                      const card = creditCards.find((c: CreditCard) => c.id === viewingExpense.creditCardId);
                     
                     if (!card || !card.closingDate || !paymentDate) return '-';
                     
                     const closingDay = card.closingDate;
                     let invoiceDate = new Date(paymentDate);
                     
                     if (paymentDate.getDate() > closingDay) {
                       invoiceDate.setMonth(invoiceDate.getMonth() + 1);
                     }
                     
                     return invoiceDate.toLocaleDateString('pt-BR', { 
                       month: 'long', 
                       year: 'numeric' 
                     });
                   })()}
                 </DetailValue>
               </DetailRow>
              
              {viewingExpense.isInstallment && (
                <DetailRow>
                  <DetailLabel>Parcelamento:</DetailLabel>
                  <DetailValue>{viewingExpense.installments}x de {formatCurrency(viewingExpense.amount / (viewingExpense.installments || 1))}</DetailValue>
                </DetailRow>
              )}
              
              {viewingExpense.tags && viewingExpense.tags.length > 0 && (
                <DetailRow>
                  <DetailLabel>Tags:</DetailLabel>
                  <DetailValue>{viewingExpense.tags.join(', ')}</DetailValue>
                </DetailRow>
              )}
              
              {viewingExpense.observations && (
                <DetailRow>
                  <DetailLabel>Observações:</DetailLabel>
                  <DetailValue>{viewingExpense.observations}</DetailValue>
                </DetailRow>
              )}
            </div>
          </Modal>
        </ModalOverlay>
      )}

      {/* Modal de Pagamento de Fatura */}
      {isPaymentModalOpen && selectedCardForPayment && (
        <ModalOverlay>
          <Modal>
            <ModalHeader>
              <ModalTitle>Pagar Fatura</ModalTitle>
              <CloseButton onClick={() => setIsPaymentModalOpen(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handlePaymentSubmit}>
              <FormGroup>
                <Label>Cartão</Label>
                <StyledInput
                  type="text"
                  value={selectedCardForPayment.name}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Tipo de Pagamento</Label>
                <StyledSelect
                  value={paymentFormData.paymentType}
                  onChange={(e) => {
                    const paymentType = e.target.value as 'full' | 'partial';
                    setPaymentFormData(prev => ({
                      ...prev,
                      paymentType,
                      amount: paymentType === 'full' ? getCardStats(selectedCardForPayment, currentMonth).currentBill.toString() : prev.amount
                    }));
                  }}
                >
                  <option value="full">Fatura Completa</option>
                  <option value="partial">Pagamento Parcial</option>
                </StyledSelect>
              </FormGroup>

              <FormGroup>
                <Label>Valor do Pagamento</Label>
                <StyledInput
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentFormData.amount}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Conta Bancária</Label>
                <StyledSelect
                  value={paymentFormData.bankAccountId}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, bankAccountId: e.target.value }))}
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {formatCurrency(account.balance)}
                    </option>
                  ))}
                </StyledSelect>
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <StyledInput
                  type="text"
                  value={paymentFormData.description}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do pagamento"
                  required
                />
              </FormGroup>

              <FormActions>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancelar
                </Button>
                <SubmitButton type="submit" disabled={isProcessingPayment}>
                  {isProcessingPayment ? (
                    <Spinner size={16} />
                  ) : (
                    <FiCreditCard style={{ marginRight: '4px' }} />
                  )}
                  {isProcessingPayment ? 'Processando...' : 'Pagar Fatura'}
                </SubmitButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalOverlay>
      )}
    </CreditCardsContainer>
  );
};

export default CreditCards;
