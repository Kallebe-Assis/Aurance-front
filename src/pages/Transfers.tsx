import React, { useState } from 'react';
import styled from 'styled-components';
import { FiRepeat, FiArrowRight } from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import { bankAccountService } from '../services/api';
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

const Transfers: React.FC = () => {
  const { bankAccounts, updateBankAccount, refreshBankAccounts } = useData();
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
    
    if (fromAccount.balance < transferAmount) {
      toast.error('Saldo insuficiente na conta de origem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Atualizar conta de origem (subtrair)
      const fromResponse = await bankAccountService.updateBalance(
        fromAccountId, 
        fromAccount.balance - transferAmount
      );
      
      // Atualizar conta de destino (somar)
      const toAccount = bankAccounts.find(acc => acc.id === toAccountId);
      if (toAccount) {
        const toResponse = await bankAccountService.updateBalance(
          toAccountId, 
          toAccount.balance + transferAmount
        );
        
        // Atualizar dados locais com as respostas da API
        updateBankAccount(toResponse.data);
      }
      
      // Atualizar dados locais da conta de origem
      updateBankAccount(fromResponse.data);
      
      // Forçar refresh dos dados para garantir sincronização
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

  const fromAccount = bankAccounts.find(acc => acc.id === fromAccountId);
  const toAccount = bankAccounts.find(acc => acc.id === toAccountId);

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

          {/* Botão */}
          <Button type="submit" disabled={isLoading}>
            <FiRepeat />
            {isLoading ? 'Processando...' : 'Realizar Transferência'}
          </Button>
        </form>
      </TransferCard>
    </Container>
  );
};

export default Transfers;