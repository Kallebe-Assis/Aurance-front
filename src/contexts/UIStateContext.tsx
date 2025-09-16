import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos para o contexto de estado da UI
interface UIStateContextType {
  // Estados de loading global
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
  
  // Estados de modais
  showRecalculateModal: boolean;
  setShowRecalculateModal: (show: boolean) => void;
  
  // Estados de filtros
  currentFilters: Record<string, any>;
  setCurrentFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
  
  // Estados de notificações
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Estados de sidebar
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Estados de tema
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

interface UIStateProviderProps {
  children: ReactNode;
}

export const UIStateProvider: React.FC<UIStateProviderProps> = ({ children }) => {
  // Estados de loading
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  
  // Estados de modais
  const [showRecalculateModal, setShowRecalculateModal] = useState(false);
  
  // Estados de filtros
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  
  // Estados de notificações
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  
  // Estados de sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estados de tema
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Funções para notificações
  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = {
      id,
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Funções para filtros
  const clearFilters = () => {
    setCurrentFilters({});
  };

  // Funções para sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Funções para tema
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value: UIStateContextType = {
    // Estados de loading
    isGlobalLoading,
    setGlobalLoading: setIsGlobalLoading,
    
    // Estados de modais
    showRecalculateModal,
    setShowRecalculateModal,
    
    // Estados de filtros
    currentFilters,
    setCurrentFilters,
    clearFilters,
    
    // Estados de notificações
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Estados de sidebar
    isSidebarOpen,
    setSidebarOpen: setIsSidebarOpen,
    toggleSidebar,
    
    // Estados de tema
    isDarkMode,
    setDarkMode: setIsDarkMode,
    toggleDarkMode
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

// Hook para usar o contexto de estado da UI
export const useUIState = (): UIStateContextType => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState deve ser usado dentro de um UIStateProvider');
  }
  return context;
};
