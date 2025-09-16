import React, { useState } from 'react';
import styled from 'styled-components';
import { FiRepeat, FiArrowRight, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import { transferService } from '../services/api';
import { Transfer } from '../types';
import toast from 'react-hot-toast';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
  margin: 0;
`;

const TransferCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-700);
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ArrowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  font-size: 1.5rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 2rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: var(--gray-300);
    cursor: not-allowed;
    transform: none;
  }
`;

const AccountInfo = styled.div`
  background: var(--gray-50);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
`;

const AccountName = styled.div`
  font-weight: var(--font-weight-semibold);
  color: var(--gray-800);
  margin-bottom: 0.25rem;
`;

const AccountBalance = styled.div`
  font-size: var(--font-size-sm);
  color: var(--gray-600);
`;

const HistorySection = styled.div`
  margin-top: 3rem;
`;

const HistoryTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TransferItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TransferInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const TransferDescription = styled.div`
  font-weight: var(--font-weight-semibold);
  color: var(--gray-800);
  font-size: var(--font-size-sm);
`;

const TransferDetails = styled.div`
  font-size: var(--font-size-xs);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferAmount = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--gray-800);
  text-align: right;
`;

const TransferHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const TransferFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--gray-100);
`;

const CurrentBalance = styled.div`
  font-size: var(--font-size-xs);
  color: var(--gray-500);
  background: var(--gray-50);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.25rem;
`;

const BalancePreview = styled.div`
  background: var(--gray-50);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid var(--gray-200);
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BalanceLabel = styled.span`
  font-size: var(--font-size-sm);
  color: var(--gray-600);
  font-weight: var(--font-weight-medium);
`;

const BalanceValue = styled.span<{ isPositive?: boolean }>`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: ${props => props.isPositive ? '#059669' : '#dc2626'};
`;

const TransferDate = styled.div`
  font-size: var(--font-size-xs);
  color: var(--gray-500);
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  
  &:hover {
    background: #dc2626;
    transform: scale(1.05);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray-500);
  
  h3 {
    margin-bottom: 0.5rem;
    color: var(--gray-600);
  }
`;

const Transfers: React.FC = () => {
  const { bankAccounts, transfers, addTransfer, removeTransfer, refreshBankAccounts } = useData();
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromAccountId || !toAccountId || !amount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (fromAccountId === toAccountId) {
      toast.error('Selecione contas diferentes');
      return;
    }
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    const fromAccount = bankAccounts.find(acc => acc.id === fromAccountId);
    if (!fromAccount) {
      toast.error('Conta de origem não encontrada');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Criar transferência usando o novo serviço
      const response = await transferService.createTransfer({
        fromAccountId,
        toAccountId,
        amount: transferAmount,
        description: description || '',
        transferDate: new Date()
      });
      
      // Adicionar transferência ao contexto local
      addTransfer(response.data.transfer);
      
      // Atualizar contas bancárias
      await refreshBankAccounts();
      
      toast.success('Transferência realizada com sucesso!');
      
      // Limpar formulário
      setFromAccountId('');
      setToAccountId('');
      setAmount('');
      setDescription('');
      
    } catch (error) {
      console.error('Erro ao realizar transferência:', error);
      toast.error('Erro ao realizar transferência');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!window.confirm('Tem certeza que deseja reverter esta transferência?')) {
      return;
    }
    
    try {
      await transferService.deleteTransfer(transferId);
      removeTransfer(transferId);
      await refreshBankAccounts();
      toast.success('Transferência revertida com sucesso!');
    } catch (error) {
      console.error('Erro ao reverter transferência:', error);
      toast.error('Erro ao reverter transferência');
    }
  };

  const fromAccount = bankAccounts.find(acc => acc.id === fromAccountId);
  const toAccount = bankAccounts.find(acc => acc.id === toAccountId);

  // Verificar se há contas suficientes
  if (bankAccounts.length < 2) {
    return (
      <Container>
        <Header>
          <FiRepeat size={24} color="#3b82f6" />
          <Title>Transferências</Title>
        </Header>
        <EmptyState>
          <h3>Contas insuficientes</h3>
          <p>Você precisa ter pelo menos 2 contas bancárias para realizar transferências.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <FiRepeat size={24} color="#3b82f6" />
        <Title>Transferências</Title>
      </Header>

      <TransferCard>
        <form onSubmit={handleTransfer}>
          <FormGrid>
            {/* Conta de Origem */}
            <FormGroup>
              <Label>De (Conta de Origem)</Label>
              <Select
                value={fromAccountId}
                onChange={(e) => {
                  setFromAccountId(e.target.value);
                  // Se a conta de destino for a mesma que a origem, limpar destino
                  if (e.target.value === toAccountId) {
                    setToAccountId('');
                  }
                }}
                required
              >
                <option value="">Selecione a conta</option>
                {bankAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
              {fromAccount && (
                <AccountInfo>
                  <AccountName>{fromAccount.name}</AccountName>
                  <AccountBalance>
                    Saldo: R$ {fromAccount.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {amount && parseFloat(amount) > 0 && (
                      <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                        (Após: R$ {(fromAccount.balance - parseFloat(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </span>
                    )}
                  </AccountBalance>
                </AccountInfo>
              )}
            </FormGroup>

            {/* Seta */}
            <ArrowIcon>
              <FiArrowRight />
            </ArrowIcon>

            {/* Conta de Destino */}
            <FormGroup>
              <Label>Para (Conta de Destino)</Label>
              <Select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                required
              >
                <option value="">Selecione a conta</option>
                {bankAccounts
                  .filter(account => account.id !== fromAccountId)
                  .map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </Select>
              {toAccount && (
                <AccountInfo>
                  <AccountName>{toAccount.name}</AccountName>
                  <AccountBalance>
                    Saldo: R$ {toAccount.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    {amount && parseFloat(amount) > 0 && (
                      <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                        (Após: R$ {(toAccount.balance + parseFloat(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </span>
                    )}
                  </AccountBalance>
                </AccountInfo>
              )}
            </FormGroup>
          </FormGrid>

          {/* Valor e Descrição */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '2rem' }}>
            <FormGroup>
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Descrição (opcional)</Label>
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Transferência para investimentos"
              />
            </FormGroup>
          </div>

          {/* Preview de Saldo */}
          {fromAccountId && toAccountId && amount && (
            <BalancePreview>
              <BalanceRow>
                <BalanceLabel>Saldo atual da conta origem:</BalanceLabel>
                <BalanceValue isPositive={(fromAccount?.balance || 0) >= 0}>
                  R$ {(fromAccount?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </BalanceValue>
              </BalanceRow>
              <BalanceRow>
                <BalanceLabel>Saldo atual da conta destino:</BalanceLabel>
                <BalanceValue isPositive={(toAccount?.balance || 0) >= 0}>
                  R$ {(toAccount?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </BalanceValue>
              </BalanceRow>
              <BalanceRow>
                <BalanceLabel>Saldo após transferência (origem):</BalanceLabel>
                <BalanceValue isPositive={(fromAccount?.balance || 0) - parseFloat(amount) >= 0}>
                  R$ {((fromAccount?.balance || 0) - parseFloat(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </BalanceValue>
              </BalanceRow>
              <BalanceRow>
                <BalanceLabel>Saldo após transferência (destino):</BalanceLabel>
                <BalanceValue isPositive={(toAccount?.balance || 0) + parseFloat(amount) >= 0}>
                  R$ {((toAccount?.balance || 0) + parseFloat(amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </BalanceValue>
              </BalanceRow>
            </BalancePreview>
          )}

          {/* Botão */}
          <Button type="submit" disabled={isLoading}>
            <FiRepeat />
            {isLoading ? 'Processando...' : 'Realizar Transferência'}
          </Button>
        </form>
      </TransferCard>

      {/* Histórico de Transferências */}
      <HistorySection>
        <HistoryTitle>
          <FiCalendar />
          Histórico de Transferências
        </HistoryTitle>
        
        {transfers.length === 0 ? (
          <EmptyState>
            <h3>Nenhuma transferência realizada</h3>
            <p>As transferências aparecerão aqui após serem realizadas.</p>
          </EmptyState>
        ) : (
          <TransferList>
            {transfers.map((transfer) => {
              const fromAccount = bankAccounts.find(acc => acc.id === transfer.fromAccountId);
              const toAccount = bankAccounts.find(acc => acc.id === transfer.toAccountId);
              const transferDate = new Date(transfer.transferDate);
              
              return (
                <TransferItem key={transfer.id}>
                  <TransferHeader>
                    <TransferInfo>
                      <TransferDescription>
                        {transfer.description || 'Transferência entre contas'}
                      </TransferDescription>
                      <TransferDetails>
                        <FiArrowRight />
                        {fromAccount?.name || 'Conta origem'} → {toAccount?.name || 'Conta destino'}
                      </TransferDetails>
                    </TransferInfo>
                    <TransferAmount>
                      R$ {transfer.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TransferAmount>
                  </TransferHeader>
                  
                  <TransferFooter>
                    <TransferDate>
                      {transferDate.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TransferDate>
                    <DeleteButton
                      onClick={() => handleDeleteTransfer(transfer.id)}
                      title="Reverter transferência"
                    >
                      <FiTrash2 size={16} />
                    </DeleteButton>
                  </TransferFooter>
                </TransferItem>
              );
            })}
          </TransferList>
        )}
      </HistorySection>
    </Container>
  );
};

export default Transfers;