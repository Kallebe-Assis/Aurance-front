// Tipos principais do sistema financeiro

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  amount: number;
  date: Date;
  type: 'full' | 'partial' | 'final';
  totalPaidAfter: number;
}

export interface PaymentLog {
  date: Date;
  amount: number;
  remainingBefore: number;
  remainingAfter: number;
  type: 'full' | 'partial' | 'final';
  description: string;
}

// INTERFACE UNIFICADA PARA TODAS AS TRANSAÇÕES
export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'creditCard';
  description: string;
  amount: number;
  dueDate: Date | string; // Aceitar tanto Date quanto string para flexibilidade
  paidDate?: Date | string;
  isPaid: boolean;
  isPartial?: boolean;
  partialAmount?: number;
  paymentHistory?: PaymentRecord[];
  paymentLogs?: PaymentLog[];
  categoryId: string;
  subcategoryId?: string;
  tags?: string[]; // Tornar opcional para compatibilidade
  observations?: string;
  isCreditCard?: boolean;
  creditCardId?: string;
  referenceMonth?: string; // Para cartões de crédito
  bankAccountId?: string;
  isInstallment?: boolean;
  installments?: number;
  installmentNumber?: number;
  totalInstallments?: number;
  originalAmount?: number;
  isRecurring?: boolean;
  recurringType?: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Manter interfaces antigas para compatibilidade (deprecated)
export interface Expense extends Transaction {
  type: 'expense';
}

export interface ExpenseCard extends Transaction {
  type: 'creditCard';
  creditCardId: string;
}

// Tipos para dados do Firebase
export interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds?: number;
}

export interface FirebaseDate {
  toDate(): Date;
}

export type FirebaseDateType = FirebaseTimestamp | FirebaseDate | Date | string;

export interface Income {
  id: string;
  description: string;
  amount: number;
  receivedDate: FirebaseDateType;
  paymentDate?: FirebaseDateType;
  isReceived: boolean;
  isPartial?: boolean;
  partialAmount?: number;
  paymentHistory?: PaymentRecord[];
  paymentLogs?: PaymentLog[];
  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  observations?: string;
  bankAccountId?: string;
  isRecurring?: boolean;
  recurringType?: string;
  userId: string;
  createdAt: FirebaseDateType;
  updatedAt: FirebaseDateType;
}

// Tipos para cartões de crédito
export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  accountNumber?: string;
  agency?: string;
  accountType: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  initialBalance: number;
  color?: string;
  isActive: boolean;
  description?: string;
  limit?: number;
  interestRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCard {
  id: string;
  name: string;
  brand?: string;
  limit: number; // LIMITE TOTAL
  currentBalance: number; // Mantido para compatibilidade
  availableLimit: number; // LIMITE DISPONÍVEL
  currentBill: number; // FATURA ATUAL
  totalSpent: number; // TOTAL GASTO
  dueDate: number; // Dia do vencimento
  closingDate: number; // Dia do fechamento
  color: string;
  bank?: string;
  lastFourDigits?: string;
  interestRate: number; // Taxa de juros mensal
  installmentInterestRate: number; // Taxa de juros para parcelamento
  advanceDiscountRate: number; // Desconto por adiantamento
  annualFee: number; // Taxa anual
  isActive: boolean;
  paidMonths: string[]; // Array de meses pagos (formato YYYY-MM)
  userId: string;
  // Campos calculados
  usagePercentage?: number;
  nextClosingDate?: Date;
  nextDueDate?: Date;
  daysUntilClosing?: number;
  daysUntilDue?: number;
  minimumPayment?: number;
  totalWithInterest?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para transações de cartão de crédito
export type TransactionType = 'purchase' | 'payment' | 'advance' | 'refund' | 'installment' | 'interest' | 'fee';

export interface CreditCardTransaction {
  id: string;
  creditCardId: string;
  type: TransactionType;
  description: string;
  amount: number;
  originalAmount: number; // Valor original antes de descontos
  installments: number; // Número de parcelas
  currentInstallment: number; // Parcela atual
  installmentAmount: number; // Valor da parcela
  interestAmount: number; // Juros cobrados
  discountAmount: number; // Desconto aplicado
  categoryId?: string;
  subcategoryId?: string;
  transactionDate: Date;
  dueDate?: Date; // Data de vencimento da parcela
  paymentDate?: Date; // Data do pagamento
  isPaid: boolean;
  isPartial?: boolean;
  partialAmount?: number;
  paymentHistory?: PaymentRecord[];
  paymentLogs?: PaymentLog[];
  tags: string[];
  observations?: string;
  receiptUrl?: string; // URL do comprovante
  merchant?: string; // Estabelecimento
  location?: string; // Localização da transação
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para estatísticas de cartões
export interface CreditCardStats {
  totalCards: number;
  totalLimit: number;
  totalBalance: number;
  totalAvailable: number;
  totalInterest: number;
  averageUsage: number;
  cards: CreditCard[];
}

// Tipos para estatísticas de transações
export interface TransactionStats {
  total: number;
  purchases: number;
  payments: number;
  advances: number;
  refunds: number;
  installments: number;
  interest: number;
  fees: number;
  paid: number;
  unpaid: number;
  count: number;
}

export interface CategoryStats {
  [categoryId: string]: {
    total: number;
    count: number;
    paid: number;
    unpaid: number;
  };
}

// Tipos para paginação
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Tipos para filtros de transações
export interface TransactionFilters {
  type?: TransactionType;
  isPaid?: boolean;
  creditCardId?: string;
  categoryId?: string;
  subcategoryId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// Tipos para formulários
export interface ExpenseFormData {
  description: string;
  amount: number;
  dueDate: Date;
  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  observations?: string;
}

export interface IncomeFormData {
  description: string;
  amount: number;
  receivedDate: Date;
  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  observations?: string;
  isReceived?: boolean;
  isRecurring?: boolean;
  recurringType?: string;
}

export interface CreditCardFormData {
  name: string;
  limit: number;
  closingDate: number;
  dueDate: number;
  color?: string;
  bank?: string;
  lastFourDigits?: string;
  interestRate?: number;
  installmentInterestRate?: number;
  advanceDiscountRate?: number;
  annualFee?: number;
}

export interface TransactionFormData {
  type: TransactionType;
  description: string;
  amount: number;
  installments?: number;
  categoryId?: string;
  subcategoryId?: string;
  transactionDate?: Date;
  merchant?: string;
  location?: string;
  tags?: string[];
  observations?: string;
}

export interface AdvancePaymentFormData {
  amount: number;
  advanceDays: number;
}

export interface ExpenseCard {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  isPaid: boolean;
  isPartial?: boolean;
  partialAmount?: number;
  paymentHistory?: PaymentRecord[];
  paymentLogs?: PaymentLog[];
  categoryId: string;
  subcategoryId?: string;
  creditCardId: string; // Referência ao cartão
  isInstallment?: boolean;
  installments?: number;
  installmentNumber?: number;
  totalInstallments?: number;
  originalAmount?: number;
  referenceMonth?: string; // MÊS DE REFERÊNCIA (formato YYYY-MM)
  tags?: string[];
  observations?: string;
  isRecurring?: boolean;
  recurringType?: string;
  installment?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefundFormData {
  originalTransactionId: string;
  refundAmount: number;
  reason: string;
}

// Tipos para filtros
export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  subcategoryId?: string;
  tags?: string[];
  isPaid?: boolean;
  isReceived?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

// Tipos para gráficos
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardData {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: ChartData[];
  incomeByCategory: ChartData[];
  monthlyExpenses: ChartData[];
  monthlyIncome: ChartData[];
  upcomingExpenses: Expense[];
  recentTransactions: (Expense | Income)[];
  creditCardStats?: CreditCardStats;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  status: 'not_started' | 'in_progress' | 'completed';
  deadline?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para notificações
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  userId: string;
  createdAt: Date;
}

