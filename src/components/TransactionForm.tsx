import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction, Category, CreditCard, BankAccount } from '../types';

interface TransactionFormProps {
  transaction?: Transaction;
  type?: 'expense' | 'income' | 'creditCard';
  creditCardId?: string;
  onSuccess?: (transaction: Transaction) => void;
  onCancel?: () => void;
  categories?: Category[];
  creditCards?: CreditCard[];
  bankAccounts?: BankAccount[];
}

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color)20;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color)20;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color)20;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-hover);
    }
    
    &:disabled {
      background: var(--gray-400);
      cursor: not-allowed;
    }
  ` : `
    background: var(--gray-100);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background: var(--gray-200);
    }
  `}
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

/**
 * COMPONENTE UNIFICADO PARA FORMULÁRIOS DE TRANSAÇÃO
 * Substitui todos os formulários duplicados em diferentes páginas
 * Suporta: Despesas, receitas, despesas de cartão, parcelamentos
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  type = 'expense',
  creditCardId,
  onSuccess,
  onCancel,
  categories = [],
  creditCards = [],
  bankAccounts = []
}) => {
  const { createTransaction, updateTransaction, creating, updating, error } = useTransactions();
  
  const [formData, setFormData] = useState({
    type: type,
    description: '',
    amount: '',
    dueDate: '',
    categoryId: '',
    subcategoryId: '',
    isCreditCard: type === 'creditCard',
    creditCardId: creditCardId || '',
    isInstallment: false,
    installments: 1,
    tags: '',
    observations: '',
    isRecurring: false,
    recurringType: 'monthly',
    bankAccountId: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type || type,
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        dueDate: transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '',
        categoryId: transaction.categoryId || '',
        subcategoryId: transaction.subcategoryId || '',
        isCreditCard: transaction.isCreditCard || false,
        creditCardId: transaction.creditCardId || creditCardId || '',
        isInstallment: transaction.isInstallment || false,
        installments: transaction.installments || 1,
        tags: transaction.tags?.join(', ') || '',
        observations: transaction.observations || '',
        isRecurring: transaction.isRecurring || false,
        recurringType: transaction.recurringType || 'monthly',
        bankAccountId: transaction.bankAccountId || ''
      });
    }
  }, [transaction, type, creditCardId]);

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro de validação quando usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Data é obrigatória';
    }

    if (formData.type === 'expense' && !formData.categoryId) {
      errors.categoryId = 'Categoria é obrigatória';
    }

    if (formData.isCreditCard && !formData.creditCardId) {
      errors.creditCardId = 'Cartão é obrigatório';
    }

    if (formData.isInstallment && (!formData.installments || formData.installments < 2)) {
      errors.installments = 'Número de parcelas deve ser pelo menos 2';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const transactionData: Partial<Transaction> = {
        type: formData.type as 'expense' | 'income' | 'creditCard',
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        dueDate: new Date(formData.dueDate).toISOString(),
        categoryId: formData.categoryId || undefined,
        subcategoryId: formData.subcategoryId || undefined,
        isCreditCard: formData.isCreditCard,
        creditCardId: formData.creditCardId || undefined,
        isInstallment: formData.isInstallment,
        installments: formData.isInstallment ? formData.installments : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        observations: formData.observations.trim() || undefined,
        isRecurring: formData.isRecurring,
        recurringType: formData.isRecurring ? formData.recurringType : undefined,
        bankAccountId: formData.bankAccountId || undefined
      };

      let result: Transaction;
      
      if (transaction) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      onSuccess?.(result);
    } catch (err) {
      console.error('Erro ao salvar transação:', err);
    }
  };

  const isSubmitting = creating || updating;

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* Tipo de transação */}
        <FormGroup>
          <Label>Tipo</Label>
          <Select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            disabled={!!transaction}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
            <option value="creditCard">Despesa de Cartão</option>
          </Select>
        </FormGroup>

        {/* Descrição */}
        <FormGroup>
          <Label>Descrição *</Label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Ex: Supermercado, Salário, etc."
            maxLength={200}
          />
          {validationErrors.description && (
            <ErrorMessage>{validationErrors.description}</ErrorMessage>
          )}
        </FormGroup>

        {/* Valor */}
        <FormGroup>
          <Label>Valor *</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0,00"
          />
          {validationErrors.amount && (
            <ErrorMessage>{validationErrors.amount}</ErrorMessage>
          )}
        </FormGroup>

        {/* Data */}
        <FormGroup>
          <Label>Data *</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />
          {validationErrors.dueDate && (
            <ErrorMessage>{validationErrors.dueDate}</ErrorMessage>
          )}
        </FormGroup>

        {/* Categoria (apenas para despesas) */}
        {formData.type === 'expense' && (
          <FormGroup>
            <Label>Categoria *</Label>
            <Select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            {validationErrors.categoryId && (
              <ErrorMessage>{validationErrors.categoryId}</ErrorMessage>
            )}
          </FormGroup>
        )}

        {/* Cartão de crédito */}
        {formData.isCreditCard && (
          <FormGroup>
            <Label>Cartão de Crédito *</Label>
            <Select
              value={formData.creditCardId}
              onChange={(e) => handleInputChange('creditCardId', e.target.value)}
            >
              <option value="">Selecione um cartão</option>
              {creditCards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </Select>
            {validationErrors.creditCardId && (
              <ErrorMessage>{validationErrors.creditCardId}</ErrorMessage>
            )}
          </FormGroup>
        )}

        {/* Parcelamento */}
        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={formData.isInstallment}
              onChange={(e) => handleInputChange('isInstallment', e.target.checked)}
            />
            <Label>É parcelado?</Label>
          </CheckboxContainer>
        </FormGroup>

        {formData.isInstallment && (
          <FormGroup>
            <Label>Número de Parcelas</Label>
            <Input
              type="number"
              min="2"
              max="12"
              value={formData.installments}
              onChange={(e) => handleInputChange('installments', parseInt(e.target.value))}
            />
            {validationErrors.installments && (
              <ErrorMessage>{validationErrors.installments}</ErrorMessage>
            )}
          </FormGroup>
        )}

        {/* Conta bancária */}
        {formData.type === 'income' && (
          <FormGroup>
            <Label>Conta Bancária</Label>
            <Select
              value={formData.bankAccountId}
              onChange={(e) => handleInputChange('bankAccountId', e.target.value)}
            >
              <option value="">Selecione uma conta</option>
              {bankAccounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        )}

        {/* Tags */}
        <FormGroup>
          <Label>Tags</Label>
          <Input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="Ex: urgente, trabalho, pessoal"
          />
        </FormGroup>

        {/* Observações */}
        <FormGroup>
          <Label>Observações</Label>
          <TextArea
            value={formData.observations}
            onChange={(e) => handleInputChange('observations', e.target.value)}
            placeholder="Observações adicionais..."
            maxLength={500}
          />
        </FormGroup>

        {/* Recorrência */}
        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
            />
            <Label>É recorrente?</Label>
          </CheckboxContainer>
        </FormGroup>

        {formData.isRecurring && (
          <FormGroup>
            <Label>Tipo de Recorrência</Label>
            <Select
              value={formData.recurringType}
              onChange={(e) => handleInputChange('recurringType', e.target.value)}
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </Select>
          </FormGroup>
        )}

        {/* Mensagem de erro geral */}
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}

        {/* Botões */}
        <ButtonGroup>
          {onCancel && (
            <Button type="button" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};
