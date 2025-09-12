import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/layout/Layout';
import InitialLoading from './components/InitialLoading';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import CreditCards from './pages/CreditCards';
import CreditCardsDashboard from './pages/CreditCardsDashboard';
import BankAccounts from './pages/BankAccounts';
import Categories from './pages/Categories';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Transfers from './pages/Transfers';

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <InitialLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente principal da aplicação
const AppContent: React.FC = () => {
  return (
    <Router>
      <GlobalStyles />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/expenses" element={
          <ProtectedRoute>
            <Layout>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/incomes" element={
          <ProtectedRoute>
            <Layout>
              <Incomes />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/credit-cards" element={
          <ProtectedRoute>
            <Layout>
              <CreditCards />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/credit-cards-dashboard" element={
          <ProtectedRoute>
            <Layout>
              <CreditCardsDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/bank-accounts" element={
          <ProtectedRoute>
            <Layout>
              <BankAccounts />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/categories" element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/transfers" element={
          <ProtectedRoute>
            <Layout>
              <Transfers />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <Calendar />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirecionar rotas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--white)',
            color: 'var(--text-primary)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'var(--success-color)',
              secondary: 'var(--white)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--error-color)',
              secondary: 'var(--white)',
            },
          },
        }}
      />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
