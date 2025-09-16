import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/layout/Layout';
import InitialLoading from './components/InitialLoading';

// Lazy loading de componentes
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Incomes = lazy(() => import('./pages/Incomes'));
const CreditCards = lazy(() => import('./pages/CreditCards'));
const CreditCardsDashboard = lazy(() => import('./pages/CreditCardsDashboard'));
const BankAccounts = lazy(() => import('./pages/BankAccounts'));
const Categories = lazy(() => import('./pages/Categories'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Transfers = lazy(() => import('./pages/Transfers'));

// Componente de loading para Suspense
const PageLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--gray-200)'
  }}>
    <InitialLoading />
  </div>
);

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
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Expenses />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/incomes" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Incomes />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/credit-cards" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <CreditCards />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/credit-cards-dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <CreditCardsDashboard />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/bank-accounts" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <BankAccounts />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Categories />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/transfers" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Transfers />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Calendar />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Settings />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoading />}>
                  <Profile />
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Redirecionar rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
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
