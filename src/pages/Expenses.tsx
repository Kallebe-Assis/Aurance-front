import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { expenseService } from '../services';
import { Expense } from '../types';
import Button from '../components/common/Button';
import { Input, Select, TextArea } from '../components/common/Input';
import { GlobalLoading } from '../components/GlobalLoading';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const ExpensesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const FiltersSection = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
`;

const FiltersTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const ExpensesList = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  background-color: var(--gray-50);
`;

const ListTitle = styled.h3`
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 2.5rem;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: var(--gray-50);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--gray-200);
  
  &:hover {
    background-color: var(--gray-50);
  }
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.75rem;
`;

const TableCell = styled.td`
  padding: var(--spacing-sm) var(--spacing-md);
  vertical-align: middle;
  font-size: 0.8rem;
`;

const StatusBadge = styled.span<{ isPaid: boolean; isPartial?: boolean }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props: any) => {
    if (props.isPartial) return 'var(--warning-color)20';
    return props.isPaid ? 'var(--success-color)20' : 'var(--warning-color)20';
  }};
  color: ${(props: any) => {
    if (props.isPartial) return 'var(--warning-color)';
    return props.isPaid ? 'var(--success-color)' : 'var(--warning-color)';
  }};
`;

const Amount = styled.span`
  font-weight: 600;
  color: var(--error-color);
`;

const ActionsCell = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 1.1rem;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
    transform: scale(1.1);
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  opacity: ${(props: any) => props.isOpen ? 1 : 0};
  visibility: ${(props: any) => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalContent = styled.div<{ isOpen: boolean }>`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 0;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transform: ${(props: any) => props.isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    border-radius: 20px 20px 0 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b, #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  
  &:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  overflow-y: auto;
  max-height: calc(90vh - 120px);
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
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  margin: var(--spacing-xl) calc(-1 * var(--spacing-xl)) calc(-1 * var(--spacing-xl)) calc(-1 * var(--spacing-xl));
  padding: var(--spacing-lg) var(--spacing-xl);
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const SwitchLabel = styled.label`
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  font-size: 0.95rem;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 56px;
  height: 28px;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &:after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    top: 3px;
    left: 3px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  input:checked + & {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(16, 185, 129, 0.2);
  }

  input:checked + &:after {
    transform: translateX(28px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;



interface ExpenseFormData {
  description: string;
  amount: string;
  dueDate: string;
  categoryId: string;
  subcategoryId: string;
  tags: string;
  observations: string;
  isPaid: boolean;
  paymentDate: string;
  bankAccountId: string;
}

const PaymentDateContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const PaymentDateLabel = styled.label`
  font-weight: 600;
  color: #92400e;
  font-size: 0.95rem;
`;

const DashboardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const DashboardCard = styled.div`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const DashboardTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const DashboardValue = styled.div<{ variant?: 'success' | 'warning' | 'info' }>`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
  color: ${(props: any) => {
    switch (props.variant) {
      case 'success': return 'var(--success-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--primary-color)';
      default: return 'var(--text-primary)';
    }
  }};
`;

const DashboardSubtitle = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const FiltersRow2 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
`;

const ClearFiltersButton = styled(Button)`
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
`;

const InfoCard = styled.div`
  padding: var(--spacing-sm);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const InfoLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const InfoValue = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.3;
`;

const Expenses: React.FC = () => {
  // Usar dados do contexto global
  const { 
    expenses, 
    categories, 
    subcategories, 
    bankAccounts, 
    isLoading: globalLoading,
    addExpense,
    updateExpense,
    removeExpense,
    refreshExpenses
  } = useData();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [paymentExpense, setPaymentExpense] = useState<Expense | null>(null);
  const [paymentData, setPaymentData] = useState({
    paymentDate: '',
    paymentType: 'full', // 'full' ou 'partial'
    partialAmount: ''
  });
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0], // Data atual como padrão
    categoryId: '',
    subcategoryId: '',
    tags: '',
    observations: '',
    isPaid: false,
    paymentDate: '',
    bankAccountId: ''
  });

  // Filtrar despesas para excluir despesas de cartão de crédito
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => !expense.isCreditCard && !expense.creditCardId);
  }, [expenses]);

  // Filtrar categorias para mostrar apenas categorias de despesas
  const expenseCategories = useMemo(() => {
    return categories.filter(category => category.type === 'expense');
  }, [categories]);

  // Filtrar subcategorias baseado na categoria selecionada
  const filteredSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return subcategories.filter(sub => sub.categoryId === formData.categoryId);
  }, [subcategories, formData.categoryId]);

  // Aplicar filtros de busca nas despesas já filtradas
  const searchFilteredExpenses: Expense[] = useMemo(() => {
    return filteredExpenses.filter((expense: Expense) => {
      const matchesSearch = !searchTerm || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.observations?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || expense.categoryId === selectedCategory;
      
      const matchesStatus = !selectedStatus || 
        (selectedStatus === 'paid' && expense.isPaid) ||
        (selectedStatus === 'partial' && expense.isPartial) ||
        (selectedStatus === 'unpaid' && !expense.isPaid && !expense.isPartial);
      
      const matchesAmount = (!minAmount || expense.amount >= parseFloat(minAmount)) &&
                           (!maxAmount || expense.amount <= parseFloat(maxAmount));
      
      const matchesDate = !dueDate || (() => {
        const expenseDate = new Date(expense.dueDate);
        const filterDate = new Date(dueDate);
        return expenseDate.getFullYear() === filterDate.getFullYear() &&
               expenseDate.getMonth() === filterDate.getMonth() &&
               expenseDate.getDate() === filterDate.getDate();
      })();
      
      return matchesSearch && matchesCategory && matchesStatus && matchesAmount && matchesDate;
    });
    
    // Verificação final de segurança
    const creditCardExpensesFound = filteredExpenses.filter((e: Expense) => e.isCreditCard === true || e.creditCardId);
    if (creditCardExpensesFound.length > 0) {
      console.error('🚨🚨🚨 ALERTA CRÍTICO: Despesas de cartão foram encontradas na tela de despesas!', creditCardExpensesFound);
    }
    
    console.log('🔍 Despesas filtradas (apenas despesas normais):', searchFilteredExpenses.length);
    console.log('✅ Verificação: Nenhuma despesa de cartão deve aparecer aqui');
    
    return filteredExpenses;
  }, [filteredExpenses, searchTerm, selectedCategory, selectedStatus, minAmount, maxAmount, dueDate]);

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (date: Date | string | { _seconds: number; _nanoseconds: number } | null | undefined) => {
    if (!date) return '-';
    
    let dateObj: Date;
    
    try {
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
      
    return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error, date);
      return '-';
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Se o status de pagamento foi alterado para false, limpar a data de pagamento
      if (field === 'isPaid' && value === false) {
        newData.paymentDate = '';
      }
      

      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ajustar as datas para o fuso horário local
      const adjustDateForTimezone = (dateString: string) => {
        if (!dateString) return dateString;
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
      };



      // 🚫 VERIFICAÇÃO DE SEGURANÇA: Garantir que NUNCA seja criada despesa de cartão pela tela de despesas
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        dueDate: adjustDateForTimezone(formData.dueDate),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        observations: formData.observations,
        isPaid: Boolean(formData.isPaid),
        paidDate: formData.isPaid ? adjustDateForTimezone(formData.paymentDate) : null,
        bankAccountId: formData.bankAccountId && formData.bankAccountId !== '' ? formData.bankAccountId : null,
        // 🚫 GARANTIR que despesas criadas pela tela de despesas NUNCA sejam de cartão
        isCreditCard: false,
        creditCardId: null
      };

      console.log('=== DEBUG FRONTEND ===');
      console.log('Dados do formulário:', formData);
      console.log('Dados enviados para API:', expenseData);
      console.log('🔍 VERIFICAÇÃO ESPECÍFICA DO BANKACCOUNTID:');
      console.log('  - formData.bankAccountId:', formData.bankAccountId);
      console.log('  - expenseData.bankAccountId:', expenseData.bankAccountId);
      console.log('  - Tipo do bankAccountId:', typeof formData.bankAccountId);
      console.log('  - Valor booleano (!!formData.bankAccountId):', !!formData.bankAccountId);
      console.log('======================');

      if (editingExpense) {
        // Atualizar despesa existente
        const response = await expenseService.updateExpense(editingExpense.id, expenseData);
        toast.success('Despesa atualizada com sucesso!');
        
        // Atualizar dados localmente com conta bancária atualizada
        updateExpense(response.data.expense, response.data.updatedBankAccount);
      } else {
        // Criar nova despesa
        console.log('📝 Expenses: Criando nova despesa com dados:', expenseData);
        const response = await expenseService.createExpense(expenseData);
        console.log('📝 Expenses: Despesa criada com sucesso:', response.data.expense);
        toast.success('Despesa criada com sucesso!');
        
        // Atualizar dados localmente
        console.log('🔄 Expenses: Chamando addExpense do DataContext...');
        addExpense(response.data.expense);
      }
      
      // Limpar formulário e fechar modal
      resetForm();
      setEditingExpense(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0], // Data atual como padrão
      categoryId: '',
      subcategoryId: '',
      tags: '',
      observations: '',
      isPaid: false,
      paymentDate: '',
      bankAccountId: ''
    });
    setEditingExpense(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setMinAmount('');
    setMaxAmount('');
    setDueDate('');
  };

  const handleViewExpense = (expense: Expense) => {
    // 🚫 VERIFICAÇÃO DE SEGURANÇA: NUNCA permitir visualizar despesas de cartão pela tela de despesas
    if (expense.isCreditCard === true || expense.creditCardId) {
      console.error('🚨🚨🚨 TENTATIVA DE VISUALIZAR DESPESA DE CARTÃO PELA TELA DE DESPESAS!', expense);
      toast.error('Despesas de cartão só podem ser visualizadas na tela de cartões!');
      return;
    }
    
    setViewingExpense(expense);
    setIsViewModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    // 🚫 VERIFICAÇÃO DE SEGURANÇA: NUNCA permitir editar despesas de cartão pela tela de despesas
    if (expense.isCreditCard === true || expense.creditCardId) {
      console.error('🚨🚨🚨 TENTATIVA DE EDITAR DESPESA DE CARTÃO PELA TELA DE DESPESAS!', expense);
      toast.error('Despesas de cartão só podem ser editadas na tela de cartões!');
      return;
    }
    
    setEditingExpense(expense);
    
         // Preencher o formulário com os dados da despesa
     const formatDateForInput = (date: Date | string | { _seconds: number; _nanoseconds: number } | null | undefined) => {
       if (!date) return '';
       
       let dateObj: Date;
       
       try {
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
           return '';
         }
         
         // Verificar se a data é válida
         if (isNaN(dateObj.getTime())) {
           return '';
         }
         
         return dateObj.toISOString().split('T')[0];
       } catch (error) {
         console.error('Erro ao formatar data para input:', error, date);
         return '';
       }
     };
    
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      dueDate: formatDateForInput(expense.dueDate),
      categoryId: expense.categoryId,
      subcategoryId: expense.subcategoryId || '',
      tags: expense.tags ? expense.tags.join(', ') : '',
      observations: expense.observations || '',
      isPaid: expense.isPaid,
      paymentDate: formatDateForInput(expense.paidDate),
      bankAccountId: expense.bankAccountId || ''
    });
    
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (window.confirm(`Tem certeza que deseja excluir a despesa "${expense.description}"?`)) {
      try {
        await expenseService.deleteExpense(expense.id);
        
        // Atualizar dados localmente
        removeExpense(expense.id);
        
        toast.success('Despesa excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        toast.error('Erro ao excluir despesa');
      }
    }
  };

  const handleMarkAsPaid = async (expense: Expense) => {
    console.log('💳 Expenses: handleMarkAsPaid chamado para:', {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      isPaid: expense.isPaid,
      bankAccountId: expense.bankAccountId
    });
    
    setPaymentExpense(expense);
    
    // Se já tem pagamento parcial, calcular o valor restante
    const remainingAmount = expense.isPartial ? (expense.amount - (expense.partialAmount || 0)) : expense.amount;
    
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: remainingAmount === expense.amount ? 'full' : 'partial',
      partialAmount: remainingAmount === expense.amount ? '' : remainingAmount.toString()
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentExpense) return;
    
    try {
      const isPartial = paymentData.paymentType === 'partial';
      
      // Simplificar os dados enviados
      const updateData: any = {
        paidDate: paymentData.paymentDate
      };
      
      if (isPartial) {
        // Pagamento parcial
        const newPartialAmount = parseFloat(paymentData.partialAmount);
        const currentPartialAmount = paymentExpense.partialAmount || 0;
        const totalPaidAmount = currentPartialAmount + newPartialAmount;
        
        // Validações
        if (newPartialAmount <= 0) {
          toast.error('Valor deve ser maior que 0');
          return;
        }
        
        const remainingAmount = paymentExpense.amount - currentPartialAmount;
        if (newPartialAmount > remainingAmount) {
          toast.error(`Valor deve ser no máximo ${formatCurrency(remainingAmount)}`);
          return;
        }
        
        // Se o pagamento atual completa o valor total, marcar como pago
        const willBeFullyPaid = totalPaidAmount >= paymentExpense.amount;
        
        if (willBeFullyPaid) {
          updateData.isPaid = true;
          updateData.isPartial = false;
          updateData.partialAmount = null;
        } else {
          updateData.isPaid = false;
          updateData.isPartial = true;
          updateData.partialAmount = totalPaidAmount;
        }
      } else {
        // Pagamento integral
        updateData.isPaid = true;
        updateData.isPartial = false;
        updateData.partialAmount = null;
      }
      
      console.log('📤 Expenses: Enviando dados para atualização:', updateData);
      console.log('📤 Expenses: Despesa original:', {
        id: paymentExpense.id,
        description: paymentExpense.description,
        amount: paymentExpense.amount,
        isPaid: paymentExpense.isPaid,
        bankAccountId: paymentExpense.bankAccountId
      });
      
      const response = await expenseService.updateExpense(paymentExpense.id, updateData);
      
      console.log('📝 Expenses: Dados da despesa atualizada:', {
        id: response.data.expense.id,
        description: response.data.expense.description,
        amount: response.data.expense.amount,
        isPaid: response.data.expense.isPaid,
        bankAccountId: response.data.expense.bankAccountId
      });
      
      // Atualizar dados localmente
      console.log('🔄 Expenses: Chamando updateExpense do DataContext...');
      updateExpense(response.data.expense);
      
      // Fechar modal e limpar dados
      setIsPaymentModalOpen(false);
      setPaymentExpense(null);
      setPaymentData({
        paymentDate: '',
        paymentType: 'full',
        partialAmount: ''
      });
      
      if (isPartial) {
        if (updateData.isPaid) {
          toast.success('Despesa quitada com sucesso!');
        } else {
          const remainingAmountAfterPayment = paymentExpense.amount - updateData.partialAmount;
          toast.success(`Pagamento parcial registrado! Resta ${formatCurrency(remainingAmountAfterPayment)}`);
        }
      } else {
        toast.success('Despesa quitada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return 'Sem categoria';
    
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    if (!subcategoryId) return '';
    
    const subcategory = subcategories.find((sub: any) => sub.id === subcategoryId);
    return subcategory ? subcategory.name : '';
  };

  const getBankAccountName = (bankAccountId: string) => {
    const account = bankAccounts.find(acc => acc.id === bankAccountId);
    return account ? account.name : 'Conta não encontrada';
  };


  // Calcular totais baseados nos filtros aplicados
  const dashboardStats = useMemo(() => {
    const totalExpenses = searchFilteredExpenses.length;
    const paidExpenses = searchFilteredExpenses.filter((expense: Expense) => expense.isPaid).length;
    const partialExpenses = searchFilteredExpenses.filter((expense: Expense) => expense.isPartial).length;
    const unpaidExpenses = searchFilteredExpenses.filter((expense: Expense) => !expense.isPaid && !expense.isPartial).length;
    
    const totalAmount = searchFilteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    
    // Valor total pago: despesas totalmente pagas + valores parciais das despesas parciais
    const paidAmount = searchFilteredExpenses
      .filter((expense: Expense) => expense.isPaid)
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0) +
      searchFilteredExpenses
        .filter((expense: Expense) => expense.isPartial)
        .reduce((sum: number, expense: Expense) => sum + (expense.partialAmount || 0), 0);
    
    // Valor total em pagamentos parciais
    const partialAmount = searchFilteredExpenses
      .filter((expense: Expense) => expense.isPartial)
      .reduce((sum: number, expense: Expense) => sum + (expense.partialAmount || 0), 0);
    
    // Valor total pendente: despesas não pagas + valores restantes das despesas parciais
    const unpaidAmount = searchFilteredExpenses
      .filter((expense: Expense) => !expense.isPaid && !expense.isPartial)
      .reduce((sum: number, expense: Expense) => sum + expense.amount, 0) +
      searchFilteredExpenses
        .filter((expense: Expense) => expense.isPartial)
        .reduce((sum: number, expense: Expense) => sum + (expense.amount - (expense.partialAmount || 0)), 0);
    
    return {
      totalExpenses,
      paidExpenses,
      partialExpenses,
      unpaidExpenses,
      totalAmount,
      paidAmount,
      partialAmount,
      unpaidAmount
    };
  }, [filteredExpenses]);

  if (globalLoading) {
    return <GlobalLoading message="💰 Carregando Despesas" subtitle="Buscando suas despesas..." />;
  }

  return (
    <ExpensesContainer>
      <Header>
        <Title>Despesas</Title>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus />
          Nova Despesa
        </Button>
      </Header>

       <DashboardSection>
         <DashboardCard>
           <DashboardTitle>Total de Despesas</DashboardTitle>
           <DashboardValue variant="info">{dashboardStats.totalExpenses}</DashboardValue>
           <DashboardSubtitle>{formatCurrency(dashboardStats.totalAmount)}</DashboardSubtitle>
         </DashboardCard>
         
         <DashboardCard>
           <DashboardTitle>Valor Total Pago</DashboardTitle>
           <DashboardValue variant="success">{dashboardStats.paidExpenses + dashboardStats.partialExpenses}</DashboardValue>
           <DashboardSubtitle>{formatCurrency(dashboardStats.paidAmount)}</DashboardSubtitle>
         </DashboardCard>
         
                   <DashboardCard>
            <DashboardTitle>Valor em Pagamentos Parciais</DashboardTitle>
            <DashboardValue variant="warning">{dashboardStats.partialExpenses}</DashboardValue>
            <DashboardSubtitle>{formatCurrency(dashboardStats.partialAmount)}</DashboardSubtitle>
          </DashboardCard>
          
          <DashboardCard>
            <DashboardTitle>Valor Total Pendente</DashboardTitle>
            <DashboardValue variant="warning">{dashboardStats.unpaidExpenses}</DashboardValue>
            <DashboardSubtitle>{formatCurrency(dashboardStats.unpaidAmount)}</DashboardSubtitle>
          </DashboardCard>
       </DashboardSection>

      <FiltersSection>
        <FiltersHeader>
          <h3>Filtros</h3>
                       <ClearFiltersButton 
              type="button" 
              variant="outline" 
              onClick={clearFilters}
            >
              Limpar Filtros
            </ClearFiltersButton>
        </FiltersHeader>
         
         <FiltersRow>
          <Select
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
            fullWidth
          >
            <option value="">Todas as categorias</option>
             {expenseCategories.map(category => (
               <option key={category.id} value={category.id}>
                 {category.name}
               </option>
             ))}
          </Select>
          
          <Select
            value={selectedStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
            fullWidth
          >
            <option value="">Todos os status</option>
            <option value="paid">Pago</option>
              <option value="partial">Pago Parcial</option>
            <option value="unpaid">Não pago</option>
          </Select>
           
           <Input
             type="number"
             placeholder="Valor mínimo"
             value={minAmount}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinAmount(e.target.value)}
             fullWidth
             step="0.01"
             min="0"
           />
           
           <Input
             type="number"
             placeholder="Valor máximo"
             value={maxAmount}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxAmount(e.target.value)}
             fullWidth
             step="0.01"
             min="0"
           />
         </FiltersRow>
         
                   <FiltersRow2>
            <Input
              type="date"
              placeholder="Data de vencimento"
              value={dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
              fullWidth
            />
            
            <Input
              type="text"
              placeholder="Pesquisar despesas..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              fullWidth
            />
          </FiltersRow2>
       </FiltersSection>

             <ExpensesList>
         <ListHeader>
           <ListTitle>Lista de Despesas ({searchFilteredExpenses.length})</ListTitle>
        </ListHeader>

        {searchFilteredExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Nenhuma despesa encontrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Descrição</TableHeaderCell>
                <TableHeaderCell>Categoria</TableHeaderCell>
                <TableHeaderCell>Valor</TableHeaderCell>
                <TableHeaderCell>Vencimento</TableHeaderCell>
                <TableHeaderCell>Conta Bancária</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>

                <TableHeaderCell>Data Pagamento</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {searchFilteredExpenses.map((expense: Expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <div style={{ fontWeight: 500 }}>{expense.description}</div>
                      {expense.observations && (
                        <small style={{ color: 'var(--text-secondary)' }}>
                          {expense.observations}
                        </small>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{getCategoryName(expense.categoryId)}</div>
                      {expense.subcategoryId && (
                        <small style={{ color: 'var(--text-secondary)' }}>
                          {getSubcategoryName(expense.subcategoryId)}
                        </small>
                      )}
                    </div>
                  </TableCell>
                                     <TableCell>
                     <Amount>{formatCurrency(expense.amount)}</Amount>
                     {expense.isPartial && expense.partialAmount && (
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                         Resta: {formatCurrency(expense.amount - expense.partialAmount)}
                       </div>
                     )}
                   </TableCell>
                  <TableCell>{formatDate(expense.dueDate)}</TableCell>
                  <TableCell>
                    <div>{expense.bankAccountId ? getBankAccountName(expense.bankAccountId) : 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                     <StatusBadge isPaid={expense.isPaid} isPartial={expense.isPartial}>
                       {expense.isPartial ? 'Pago Parcial' : expense.isPaid ? 'Pago' : 'Pendente'}
                    </StatusBadge>
                  </TableCell>
                  
                   <TableCell>
                     {(expense.isPaid || expense.isPartial) && expense.paidDate ? formatDate(expense.paidDate) : '-'}
                   </TableCell>
                  <TableCell>
                    <ActionsCell>
                       <ActionButton 
                         title="Visualizar"
                         onClick={() => handleViewExpense(expense)}
                       >
                        <FiEye />
                      </ActionButton>
                       <ActionButton 
                         title="Editar"
                         onClick={() => handleEditExpense(expense)}
                       >
                        <FiEdit />
                      </ActionButton>
                                               {(!expense.isPaid || expense.isPartial) && (
                          <ActionButton 
                            title={expense.isPartial ? "Adicionar Pagamento" : "Registrar Pagamento"}
                            onClick={() => handleMarkAsPaid(expense)}
                            style={{ color: 'var(--success-color)' }}
                          >
                            {expense.isPartial ? "💰" : "✓"}
                          </ActionButton>
                        )}
                       <ActionButton 
                         title="Excluir"
                         onClick={() => handleDeleteExpense(expense)}
                       >
                        <FiTrash2 />
                      </ActionButton>
                    </ActionsCell>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </ExpensesList>

      <Modal isOpen={isModalOpen}>
                  <ModalContent isOpen={isModalOpen}>
          <ModalHeader>
             <ModalTitle>{editingExpense ? 'Editar Despesa' : 'Nova Despesa'}</ModalTitle>
             <CloseButton onClick={() => {
               setIsModalOpen(false);
               resetForm();
             }}>×</CloseButton>
          </ModalHeader>
          
                     <Form onSubmit={handleSubmit}>
            <FormRow>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Descrição da Despesa *
                 </label>
              <Input
                type="text"
                   placeholder="Digite a descrição da despesa"
                   value={formData.description}
                   onChange={(e) => handleInputChange('description', e.target.value)}
                fullWidth
                required
              />
               </div>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Valor *
                 </label>
              <Input
                type="number"
                   placeholder="0,00"
                   value={formData.amount}
                   onChange={(e) => handleInputChange('amount', e.target.value)}
                fullWidth
                required
                step="0.01"
                min="0"
              />
               </div>
            </FormRow>
            
            <FormRow>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Data de Vencimento *
                 </label>
              <Input
                type="date"
                   value={formData.dueDate}
                   onChange={(e) => handleInputChange('dueDate', e.target.value)}
                fullWidth
                required
              />
               </div>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Categoria *
                 </label>
                 <Select 
                   fullWidth 
                   required
                   value={formData.categoryId}
                   onChange={(e) => handleInputChange('categoryId', e.target.value)}
                 >
                <option value="">Selecione a categoria</option>
                   {expenseCategories.map(category => (
                     <option key={category.id} value={category.id}>
                       {category.name}
                     </option>
                   ))}
              </Select>
               </div>
            </FormRow>
            
            <FormRow>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Subcategoria
                 </label>
                 <Select 
                   fullWidth
                   value={formData.subcategoryId}
                   onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                 >
                <option value="">Selecione a subcategoria (opcional)</option>
                   {filteredSubcategories.map(subcategory => (
                     <option key={subcategory.id} value={subcategory.id}>
                       {subcategory.name}
                     </option>
                   ))}
              </Select>
               </div>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Tags
                 </label>
              <Input
                type="text"
                   placeholder="Tags separadas por vírgula (ex: urgente, pessoal)"
                   value={formData.tags}
                   onChange={(e) => handleInputChange('tags', e.target.value)}
                fullWidth
              />
               </div>
            </FormRow>
            
            <FormRow>
               <div>
                 <label style={{ 
                   display: 'block', 
                   marginBottom: '8px', 
                   fontWeight: '600', 
                   color: '#1e293b',
                   fontSize: '0.9rem'
                 }}>
                   Conta Bancária
                 </label>
                 <Select 
                   fullWidth
                   value={formData.bankAccountId}
                   onChange={(e) => handleInputChange('bankAccountId', e.target.value)}
                 >
                <option value="">Selecione a conta bancária (opcional)</option>
                   {bankAccounts.map(account => (
                     <option key={account.id} value={account.id}>
                       {account.name} - {account.bank}
                     </option>
                   ))}
              </Select>
               </div>
            </FormRow>
            
                                       <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: '0.9rem'
                }}>
                  Observações
                </label>
            <TextArea
                  placeholder="Digite observações adicionais sobre a despesa (opcional)"
                  value={formData.observations}
                  onChange={(e) => handleInputChange('observations', e.target.value)}
              fullWidth
            />
              </div>


             
             <SwitchContainer>
               <SwitchLabel htmlFor="isPaid">Status de Pagamento:</SwitchLabel>
                               <SwitchInput
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                />
               <Switch htmlFor="isPaid" />
               <span style={{ marginLeft: '8px', fontWeight: 500 }}>
                 {formData.isPaid ? 'Pago' : 'Pendente'}
               </span>
             </SwitchContainer>
             
                           {formData.isPaid && (
                <PaymentDateContainer>
                  <PaymentDateLabel htmlFor="paymentDate">Data do Pagamento *</PaymentDateLabel>
                  <Input
                    type="date"
                    id="paymentDate"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    fullWidth
                    required
                  />
                </PaymentDateContainer>
              )}
            
            <FormActions>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                 {editingExpense ? 'Atualizar Despesa' : 'Salvar Despesa'}
              </Button>
            </FormActions>
          </Form>
                 </ModalContent>
       </Modal>

               {/* Modal de Visualização */}
        <Modal isOpen={isViewModalOpen}>
          <ModalContent isOpen={isViewModalOpen}>
           <ModalHeader>
             <ModalTitle>Detalhes da Despesa</ModalTitle>
             <CloseButton onClick={() => {
               setIsViewModalOpen(false);
               setViewingExpense(null);
             }}>×</CloseButton>
           </ModalHeader>
           
                                                                                               {viewingExpense && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: 'calc(90vh - 120px)'
                }}>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-md)'
                  }}>
                                 {/* Valor em destaque */}
                 <div style={{
                   textAlign: 'center',
                   padding: 'var(--spacing-md)',
                   background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                   borderRadius: '16px',
                   border: '2px solid rgba(239, 68, 68, 0.1)',
                   marginBottom: 'var(--spacing-sm)'
                 }}>
                   <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600, marginBottom: '6px' }}>
                     VALOR DA DESPESA
                   </div>
                   <div style={{ 
                     fontSize: '2rem', 
                     color: '#dc2626', 
                     fontWeight: 700,
                     textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                   }}>
                     {formatCurrency(viewingExpense.amount)}
                   </div>
                 </div>

                                 {/* Grid de informações */}
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                   gap: 'var(--spacing-sm)'
                 }}>
                  <InfoCard>
                    <InfoLabel>Descrição</InfoLabel>
                    <InfoValue>{viewingExpense.description}</InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>Data de Vencimento</InfoLabel>
                    <InfoValue>{formatDate(viewingExpense.dueDate)}</InfoValue>
                  </InfoCard>

                  <InfoCard>
                    <InfoLabel>Categoria</InfoLabel>
                    <InfoValue>{getCategoryName(viewingExpense.categoryId)}</InfoValue>
                  </InfoCard>

                  {viewingExpense.subcategoryId && (
                    <InfoCard>
                      <InfoLabel>Subcategoria</InfoLabel>
                      <InfoValue>{getSubcategoryName(viewingExpense.subcategoryId)}</InfoValue>
                    </InfoCard>
                  )}

                  {viewingExpense.bankAccountId && (
                    <InfoCard>
                      <InfoLabel>Conta Bancária</InfoLabel>
                      <InfoValue>{getBankAccountName(viewingExpense.bankAccountId)}</InfoValue>
                    </InfoCard>
                  )}

                  

                                     <InfoCard>
                     <InfoLabel>Status</InfoLabel>
                     <div style={{ marginTop: '6px' }}>
                       <StatusBadge isPaid={viewingExpense.isPaid} isPartial={viewingExpense.isPartial}>
                         {viewingExpense.isPartial ? 'Pago Parcial' : viewingExpense.isPaid ? 'Pago' : 'Pendente'}
                       </StatusBadge>
                       {(viewingExpense.isPaid || viewingExpense.isPartial) && viewingExpense.paidDate && (
                         <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                           Pago em: {formatDate(viewingExpense.paidDate)}
                         </div>
                       )}
                       {viewingExpense.isPartial && viewingExpense.partialAmount && (
                         <div style={{ marginTop: '8px' }}>
                           <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>
                             Valor Pago: <span style={{ color: '#10b981', fontWeight: '600' }}>{formatCurrency(viewingExpense.partialAmount)}</span>
                           </div>
                           <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                             Valor Pendente: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{formatCurrency(viewingExpense.amount - viewingExpense.partialAmount)}</span>
                           </div>
                         </div>
                       )}
                     </div>
                   </InfoCard>
                </div>

                                        {/* Logs de Pagamento */}
       {viewingExpense.paymentLogs && viewingExpense.paymentLogs.length > 0 && (
         <div>
           <InfoLabel style={{ marginBottom: '8px' }}>Logs de Pagamento</InfoLabel>
           <div style={{
             background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
             borderRadius: '12px',
             border: '1px solid rgba(0, 0, 0, 0.05)',
             padding: 'var(--spacing-sm)',
             maxHeight: '300px',
             overflowY: 'auto'
           }}>
             {viewingExpense.paymentLogs.map((log, index) => (
               <div
                 key={index}
                 style={{
                   padding: '12px',
                   marginBottom: '8px',
                   background: 'white',
                   borderRadius: '8px',
                   border: '1px solid rgba(0, 0, 0, 0.05)',
                   fontSize: '0.8rem'
                 }}
               >
                 <div style={{ 
                   display: 'flex', 
                   justifyContent: 'space-between', 
                   alignItems: 'center',
                   marginBottom: '4px'
                 }}>
                   <div style={{ fontWeight: '600', color: '#1e293b' }}>
                     {log.description}
                   </div>
                   <div style={{ fontWeight: '600', color: '#10b981' }}>
                     {formatCurrency(log.amount)}
                   </div>
                 </div>
                 <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>
                   {formatDate(log.date)}
                 </div>
                 <div style={{ 
                   display: 'flex', 
                   justifyContent: 'space-between',
                   fontSize: '0.7rem',
                   color: '#64748b'
                 }}>
                   <span>Restava: {formatCurrency(log.remainingBefore)}</span>
                   <span>Ficou: {formatCurrency(log.remainingAfter)}</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}

                                 {/* Tags */}
                 {viewingExpense.tags && viewingExpense.tags.length > 0 && (
                   <div>
                     <InfoLabel style={{ marginBottom: '8px' }}>Tags</InfoLabel>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                       {viewingExpense.tags.map((tag, index) => (
                         <span
                           key={index}
                           style={{
                             display: 'inline-block',
                             background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                             color: 'white',
                             padding: '4px 8px',
                             borderRadius: '16px',
                             fontSize: '0.7rem',
                             fontWeight: 500,
                             boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                             animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`
                           }}
                         >
                           {tag}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                                 {/* Observações */}
                 {viewingExpense.observations && (
                   <div>
                     <InfoLabel style={{ marginBottom: '8px' }}>Observações</InfoLabel>
                     <div style={{
                       padding: 'var(--spacing-sm)',
                       background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                       borderRadius: '12px',
                       border: '1px solid rgba(0, 0, 0, 0.05)',
                       whiteSpace: 'pre-wrap',
                       lineHeight: '1.4',
                       fontSize: '0.8rem'
                     }}>
                       {viewingExpense.observations}
                     </div>
                   </div>
                 )}

                                                   </div>
                  
                  {/* Botões fixos no rodapé */}
                  <div style={{ 
                    display: 'flex', 
                    gap: 'var(--spacing-md)', 
                    justifyContent: 'flex-end',
                    padding: 'var(--spacing-lg)',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    flexShrink: 0
                  }}>
                   <Button 
                     type="button" 
                     variant="outline" 
                     onClick={() => {
                       setIsViewModalOpen(false);
                       setViewingExpense(null);
                     }}
                   >
                     Fechar
                   </Button>
                   <Button 
                     type="button"
                     onClick={() => {
                       setIsViewModalOpen(false);
                       setViewingExpense(null);
                       handleEditExpense(viewingExpense);
                     }}
                   >
                     Editar
                   </Button>
                 </div>
               </div>
             )}
                   </ModalContent>
        </Modal>

        {/* Modal de Pagamento */}
        <Modal isOpen={isPaymentModalOpen}>
          <ModalContent isOpen={isPaymentModalOpen}>
            <ModalHeader>
              <ModalTitle>Registrar Pagamento</ModalTitle>
              <CloseButton onClick={() => {
                setIsPaymentModalOpen(false);
                setPaymentExpense(null);
                setPaymentData({
                  paymentDate: '',
                  paymentType: 'full',
                  partialAmount: ''
                });
              }}>×</CloseButton>
            </ModalHeader>
            
            {paymentExpense && (
              <Form onSubmit={handlePaymentSubmit}>
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  borderRadius: '12px',
                  marginBottom: 'var(--spacing-md)',
                  border: '1px solid rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>
                    Despesa: {paymentExpense.description}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#dc2626' }}>
                    {formatCurrency(paymentExpense.amount)}
                  </div>
                  {paymentExpense.isPartial && paymentExpense.partialAmount && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#dc2626' }}>
                      <div>Já pago: <span style={{ color: '#10b981', fontWeight: '600' }}>{formatCurrency(paymentExpense.partialAmount)}</span></div>
                      <div>Resta: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{formatCurrency(paymentExpense.amount - paymentExpense.partialAmount)}</span></div>
                    </div>
                  )}
                </div>

                <FormRow>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      fontSize: '0.9rem'
                    }}>
                      Data do Pagamento *
                    </label>
                    <Input
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                      fullWidth
                      required
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      fontSize: '0.9rem'
                    }}>
                      Tipo de Pagamento *
                    </label>
                    <Select
                      value={paymentData.paymentType}
                      onChange={(e) => setPaymentData(prev => ({ 
                        ...prev, 
                        paymentType: e.target.value,
                        partialAmount: e.target.value === 'full' ? '' : prev.partialAmount
                      }))}
                      fullWidth
                      required
                    >
                      <option value="full">Pagamento Integral</option>
                      <option value="partial">Pagamento Parcial</option>
                    </Select>
                  </div>
                </FormRow>

                {paymentData.paymentType === 'partial' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      fontSize: '0.9rem'
                    }}>
                      Valor Pago *
                    </label>
                    <Input
                      type="number"
                      placeholder={`Máximo: ${formatCurrency(paymentExpense.isPartial ? (paymentExpense.amount - (paymentExpense.partialAmount || 0)) : paymentExpense.amount)}`}
                      value={paymentData.partialAmount}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, partialAmount: e.target.value }))}
                      fullWidth
                      required
                      step="0.01"
                      min="0.01"
                      max={paymentExpense.isPartial ? (paymentExpense.amount - (paymentExpense.partialAmount || 0)) : paymentExpense.amount}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Valor deve ser maior que 0 e no máximo {formatCurrency(paymentExpense.isPartial ? (paymentExpense.amount - (paymentExpense.partialAmount || 0)) : paymentExpense.amount)}
                    </small>
                  </div>
                )}

                <FormActions>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setPaymentExpense(null);
                      setPaymentData({
                        paymentDate: '',
                        paymentType: 'full',
                        partialAmount: ''
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                                     <Button type="submit">
                     {paymentData.paymentType === 'partial' ? 
                       (paymentExpense.isPartial ? 'Adicionar Pagamento' : 'Registrar Pagamento Parcial') : 
                       'Marcar como Pago'
                     }
                   </Button>
                </FormActions>
              </Form>
            )}
        </ModalContent>
      </Modal>
    </ExpensesContainer>
  );
};

export default Expenses;
