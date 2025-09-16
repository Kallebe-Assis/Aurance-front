import React, { ReactNode } from 'react';
import { FinancialDataProvider, useFinancialData } from './FinancialDataContext';
import { ReferenceDataProvider, useReferenceData } from './ReferenceDataContext';
import { UIStateProvider, useUIState } from './UIStateContext';

// Re-exportar hooks dos contextos especializados
export { useFinancialData } from './FinancialDataContext';
export { useReferenceData } from './ReferenceDataContext';
export { useUIState } from './UIStateContext';

// Hook combinado para compatibilidade com código existente
export const useData = () => {
  const financialData = useFinancialData();
  const referenceData = useReferenceData();
  const uiState = useUIState();

  return {
    // Dados financeiros
    expenses: financialData.expenses,
    incomes: financialData.incomes,
    transfers: financialData.transfers,
    
    // Dados de referência
    categories: referenceData.categories,
    subcategories: referenceData.subcategories,
    bankAccounts: referenceData.bankAccounts,
    creditCards: referenceData.creditCards,
    
    // Estados
    isLoading: financialData.isLoading || referenceData.isLoading,
    lastUpdated: financialData.lastUpdated || referenceData.lastUpdated,
    
    // Métodos de refresh
    refreshAllData: async () => {
      await Promise.all([
        financialData.refreshAllFinancialData(),
        referenceData.refreshAllReferenceData()
      ]);
    },
    refreshExpenses: financialData.refreshExpenses,
    refreshIncomes: financialData.refreshIncomes,
    refreshTransfers: financialData.refreshTransfers,
    refreshCategories: referenceData.refreshCategories,
    refreshSubcategories: referenceData.refreshSubcategories,
    refreshBankAccounts: referenceData.refreshBankAccounts,
    refreshCreditCards: referenceData.refreshCreditCards,
    
    // Métodos de atualização local
    addExpense: financialData.addExpense,
    updateExpense: financialData.updateExpense,
    removeExpense: financialData.removeExpense,
    addIncome: financialData.addIncome,
    updateIncome: financialData.updateIncome,
    removeIncome: financialData.removeIncome,
    addTransfer: financialData.addTransfer,
    removeTransfer: financialData.removeTransfer,
    addCategory: referenceData.addCategory,
    updateCategory: referenceData.updateCategory,
    removeCategory: referenceData.removeCategory,
    addSubcategory: referenceData.addSubcategory,
    updateSubcategory: referenceData.updateSubcategory,
    removeSubcategory: referenceData.removeSubcategory,
    addBankAccount: referenceData.addBankAccount,
    updateBankAccount: referenceData.updateBankAccount,
    removeBankAccount: referenceData.removeBankAccount,
    addCreditCard: referenceData.addCreditCard,
    updateCreditCard: referenceData.updateCreditCard,
    removeCreditCard: referenceData.removeCreditCard
  };
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  return (
    <UIStateProvider>
      <ReferenceDataProvider>
        <FinancialDataProvider>
          {children}
        </FinancialDataProvider>
      </ReferenceDataProvider>
    </UIStateProvider>
  );
};