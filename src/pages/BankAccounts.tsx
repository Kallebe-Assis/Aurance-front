import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiDollarSign, FiTrendingUp, FiEdit, FiTrash2, FiEye, FiX, FiCreditCard } from 'react-icons/fi';
import { bankAccountService, categoryService } from '../services';
import { BankAccount, Category } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

const BankAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
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
  color: var(--text-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const StatCard = styled.div`
  background: white;
  padding: var(--spacing-lg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--primary-color);
`;

const StatTitle = styled.h3`
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
`;

const StatChange = styled.div`
  font-size: 0.9rem;
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
`;

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-lg);
`;

const AccountCard = styled.div<{ accountColor?: string }>`
  background: white;
  padding: var(--spacing-lg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.accountColor || 'var(--primary-color)'};
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const AccountIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.color}, ${props => props.color}dd);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`;

const AccountDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const AccountName = styled.h3`
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
`;

const AccountType = styled.span`
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--border-color);
  padding: 2px 8px;
  border-radius: 12px;
`;

const AccountStatus = styled.span<{ active: boolean }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.active ? 'var(--success-color)' : 'var(--danger-color)'};
  color: white;
`;

const AccountBalance = styled.div`
  margin: var(--spacing-md) 0;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const BalanceLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
`;

const BalanceValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
`;

const AccountActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-md);
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
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: scale(1.05);
    border-color: #a0aec0;
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

const BankAccounts: React.FC = () => {
  // Usar dados do contexto global
  const { 
    bankAccounts, 
    isLoading: globalLoading,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    refreshBankAccounts
  } = useData();
  
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalBalance: 0,
    activeAccounts: 0,
    totalTransactions: 0
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    agency: '',
    accountType: 'checking',
    initialBalance: '',
    color: '#3B82F6',
    isActive: true,
    description: '',
    limit: '',
    interestRate: ''
  });

  useEffect(() => {
    calculateStats();
  }, [bankAccounts]);

  const calculateStats = () => {
    const totalBalance = bankAccounts.reduce((sum: number, account: BankAccount) => sum + (account.balance || 0), 0);
    const activeAccounts = bankAccounts.filter((account: BankAccount) => account.isActive).length;

    setStats({
      totalAccounts: bankAccounts.length,
      totalBalance,
      activeAccounts,
      totalTransactions: 0 // Será implementado quando tivermos transações
    });
  };

  const openModal = (type: 'create' | 'edit' | 'view', account?: BankAccount) => {
    setModalType(type);
    setSelectedAccount(account || null);
    
    if (type === 'create') {
      setFormData({
        name: '',
        bank: '',
        accountNumber: '',
        agency: '',
        accountType: 'checking',
        initialBalance: '',
        color: '#3B82F6',
        isActive: true,
        description: '',
        limit: '',
        interestRate: ''
      });
    } else if (account) {
      setFormData({
        name: account.name || '',
        bank: account.bank || '',
        accountNumber: account.accountNumber || '',
        agency: account.agency || '',
        accountType: account.accountType || 'checking',
        initialBalance: account.balance?.toString() || '',
        color: account.color || '#3B82F6',
        isActive: account.isActive !== false,
        description: account.description || '',
        limit: account.limit?.toString() || '',
        interestRate: account.interestRate?.toString() || ''
      });
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
    setFormData({
      name: '',
      bank: '',
      accountNumber: '',
      agency: '',
      accountType: 'checking',
      initialBalance: '',
      color: '#3B82F6',
      isActive: true,
      description: '',
      limit: '',
      interestRate: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const accountData = {
        name: formData.name,
        bank: formData.bank,
        accountNumber: formData.accountNumber,
        agency: formData.agency,
        accountType: formData.accountType,
        balance: parseFloat(formData.initialBalance) || 0,
        color: formData.color,
        isActive: formData.isActive,
        description: formData.description,
        limit: formData.limit ? parseFloat(formData.limit) : undefined,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined
      };

      if (modalType === 'create') {
        const response = await bankAccountService.createBankAccount(accountData);
        toast.success('Conta bancária criada com sucesso!');
        
        // Adicionar conta ao contexto global
        addBankAccount(response.data);
      } else if (modalType === 'edit' && selectedAccount) {
        const response = await bankAccountService.updateBankAccount(selectedAccount.id, accountData);
        toast.success('Conta bancária atualizada com sucesso!');
        
        // Atualizar conta no contexto global
        updateBankAccount(response.data);
      }

      closeModal();
    } catch (error) {
      console.error('Erro ao salvar conta bancária:', error);
      toast.error('Erro ao salvar conta bancária');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta conta bancária?')) {
      try {
        await bankAccountService.deleteBankAccount(accountId);
        toast.success('Conta bancária deletada com sucesso!');
        
        // Remover conta do contexto global
        removeBankAccount(accountId);
      } catch (error) {
        console.error('Erro ao deletar conta bancária:', error);
        toast.error('Erro ao deletar conta bancária');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Conta Poupança';
      case 'investment': return 'Conta Investimento';
      case 'credit': return 'Cartão de Crédito';
      default: return type;
    }
  };

  if (globalLoading) {
    return <GlobalLoading message="🏦 Carregando Contas" subtitle="Buscando suas contas bancárias..." />;
  }

  return (
    <BankAccountsContainer>
      <Header>
        <Title>Contas Bancárias</Title>
        <HeaderActions>
          <Button onClick={() => openModal('create')}>
            <FiPlus />
            Nova Conta
          </Button>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatTitle>Total de Contas</StatTitle>
          <StatValue>{stats.totalAccounts}</StatValue>
          <StatChange>
            <FiDollarSign />
            Contas cadastradas
          </StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>Saldo Total</StatTitle>
          <StatValue>{formatCurrency(stats.totalBalance)}</StatValue>
          <StatChange>
            <FiDollarSign />
            Saldo consolidado
          </StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>Contas Ativas</StatTitle>
          <StatValue>{stats.activeAccounts}</StatValue>
          <StatChange>
            <FiTrendingUp />
            Contas ativas
          </StatChange>
        </StatCard>

        <StatCard>
          <StatTitle>Total Transações</StatTitle>
          <StatValue>{stats.totalTransactions}</StatValue>
          <StatChange>
            <FiCreditCard />
            Transações realizadas
          </StatChange>
        </StatCard>
      </StatsGrid>

      {bankAccounts.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <FiDollarSign />
          </EmptyIcon>
          <h3>Nenhuma conta bancária encontrada</h3>
          <p>Adicione sua primeira conta bancária para começar a controlar suas finanças.</p>
          <Button onClick={() => openModal('create')}>
            <FiPlus />
            Adicionar Conta
          </Button>
        </EmptyState>
      ) : (
        <AccountsGrid>
          {bankAccounts.map((account) => (
            <AccountCard key={account.id} accountColor={account.color}>
              <AccountHeader>
                <AccountInfo>
                  <AccountIcon color={account.color || '#3B82F6'}>
                    {account.name?.charAt(0)?.toUpperCase() || '?'}
                  </AccountIcon>
                  <AccountDetails>
                    <AccountName>{account.name || 'Nome não informado'}</AccountName>
                    <AccountType>{getAccountTypeLabel(account.accountType)}</AccountType>
                  </AccountDetails>
                </AccountInfo>
                <AccountStatus active={account.isActive}>
                  {account.isActive ? 'Ativa' : 'Inativa'}
                </AccountStatus>
              </AccountHeader>

              <AccountBalance>
                <BalanceLabel>Saldo Atual</BalanceLabel>
                <BalanceValue>{formatCurrency(account.balance || 0)}</BalanceValue>
                <BalanceLabel style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                  Saldo Inicial: {formatCurrency(account.initialBalance || 0)}
                </BalanceLabel>
              </AccountBalance>

              <AccountActions>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openModal('view', account)}
                >
                  <FiEye />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openModal('edit', account)}
                >
                  <FiEdit />
                </Button>
                <DeleteButton 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                >
                  <FiTrash2 />
                </DeleteButton>
              </AccountActions>
            </AccountCard>
          ))}
        </AccountsGrid>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'create' && (
                  <>
                    <FiDollarSign />
                    Nova Conta Bancária
                  </>
                )}
                {modalType === 'edit' && (
                  <>
                    <FiEdit />
                    Editar Conta Bancária
                  </>
                )}
                {modalType === 'view' && (
                  <>
                    <FiEye />
                    Detalhes da Conta
                  </>
                )}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            {modalType === 'view' && selectedAccount ? (
              <div style={{ padding: 'var(--spacing-xl)' }}>
                <DetailRow>
                  <DetailLabel>Nome:</DetailLabel>
                  <DetailValue>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AccountIcon color={selectedAccount.color || '#3B82F6'}>
                        {selectedAccount.name?.charAt(0)?.toUpperCase() || '?'}
                      </AccountIcon>
                      {selectedAccount.name || 'Nome não informado'}
                    </div>
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Banco:</DetailLabel>
                  <DetailValue>{selectedAccount.bank || 'Não informado'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Agência:</DetailLabel>
                  <DetailValue>{selectedAccount.agency || 'Não informado'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Número da Conta:</DetailLabel>
                  <DetailValue>{selectedAccount.accountNumber || 'Não informado'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Tipo de Conta:</DetailLabel>
                  <DetailValue>{getAccountTypeLabel(selectedAccount.accountType)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Saldo Atual:</DetailLabel>
                  <DetailValue>{formatCurrency(selectedAccount.balance || 0)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Saldo Inicial:</DetailLabel>
                  <DetailValue>{formatCurrency(selectedAccount.initialBalance || 0)}</DetailValue>
                </DetailRow>
                {selectedAccount.limit && (
                  <DetailRow>
                    <DetailLabel>Limite:</DetailLabel>
                    <DetailValue>{formatCurrency(selectedAccount.limit)}</DetailValue>
                  </DetailRow>
                )}
                {selectedAccount.interestRate && (
                  <DetailRow>
                    <DetailLabel>Taxa de Juros:</DetailLabel>
                    <DetailValue>{(selectedAccount.interestRate).toFixed(2)}%</DetailValue>
                  </DetailRow>
                )}
                <DetailRow>
                  <DetailLabel>Status:</DetailLabel>
                  <DetailValue>{selectedAccount.isActive ? 'Ativa' : 'Inativa'}</DetailValue>
                </DetailRow>
                {selectedAccount.description && (
                  <DetailRow>
                    <DetailLabel>Descrição:</DetailLabel>
                    <DetailValue>{selectedAccount.description}</DetailValue>
                  </DetailRow>
                )}
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                {/* Seção: Informações Básicas */}
                <FormSection>
                  <SectionTitle>
                    <FiDollarSign />
                    Informações Básicas
                  </SectionTitle>
                  
                  <FormGroup>
                    <Label htmlFor="name" className="required">Nome da Conta</Label>
                    <StyledInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      placeholder="Ex: Conta Principal, Poupança..."
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="bank" className="required">Banco</Label>
                      <StyledInput
                        type="text"
                        id="bank"
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                        required
                        maxLength={50}
                        placeholder="Nome do banco"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="accountType" className="required">Tipo de Conta</Label>
                      <StyledSelect
                        id="accountType"
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="checking">Conta Corrente</option>
                        <option value="savings">Conta Poupança</option>
                        <option value="investment">Conta Investimento</option>
                        <option value="credit">Cartão de Crédito</option>
                      </StyledSelect>
                    </FormGroup>
                  </FormRow>
                </FormSection>

                {/* Seção: Dados da Conta */}
                <FormSection>
                  <SectionTitle>
                    <FiCreditCard />
                    Dados da Conta
                  </SectionTitle>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="agency">Agência</Label>
                      <StyledInput
                        type="text"
                        id="agency"
                        name="agency"
                        value={formData.agency}
                        onChange={handleInputChange}
                        maxLength={20}
                        placeholder="Número da agência"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="accountNumber">Número da Conta</Label>
                      <StyledInput
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        maxLength={20}
                        placeholder="Número da conta"
                      />
                    </FormGroup>
                  </FormRow>
                </FormSection>

                {/* Seção: Configurações Financeiras */}
                <FormSection>
                  <SectionTitle>
                    <FiDollarSign />
                    Configurações Financeiras
                  </SectionTitle>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="initialBalance" className="required">Saldo Inicial</Label>
                      <StyledInput
                        type="number"
                        id="initialBalance"
                        name="initialBalance"
                        value={formData.initialBalance}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="color">Cor da Conta</Label>
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

                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="limit">Limite (se aplicável)</Label>
                      <StyledInput
                        type="number"
                        id="limit"
                        name="limit"
                        value={formData.limit}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="interestRate">Taxa de Juros (%)</Label>
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
                  </FormRow>
                </FormSection>

                {/* Seção: Configurações Gerais */}
                <FormSection>
                  <SectionTitle>
                    <FiTrendingUp />
                    Configurações Gerais
                  </SectionTitle>
                  
                  <FormGroup>
                    <Label htmlFor="description">Descrição</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição adicional da conta"
                      rows={3}
                      style={{
                        padding: 'var(--spacing-sm)',
                        border: '2px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        minHeight: '80px',
                        fontFamily: 'inherit',
                        background: '#fafbfc',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="isActive">Status da Conta</Label>
                    <SwitchContainer>
                      <SwitchInput
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <Switch htmlFor="isActive" />
                      <span style={{ marginLeft: '8px', fontWeight: 500, fontSize: '0.85rem' }}>
                        {formData.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </SwitchContainer>
                  </FormGroup>
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
                        Criar Conta
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
            )}
          </Modal>
        </ModalOverlay>
      )}
    </BankAccountsContainer>
  );
};

export default BankAccounts;
