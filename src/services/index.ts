// Re-exportar todos os serviços
export { authService } from './auth';
export { expenseService } from './expenses';
export { incomeService } from './incomes';
export { categoryService, subcategoryService } from './categories';
export { bankAccountService } from './bankAccounts';
export { creditCardService } from './creditCards';
export { transferService } from './transfers';
export { 
  dashboardService, 
  userService, 
  goalService, 
  reportService, 
  searchService 
} from './dashboard';

// Exportar instância da API
export { default as api } from './api';
