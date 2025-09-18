import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiPlus, FiDollarSign, FiTrendingUp, FiCreditCard, FiRepeat } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Animações
const rotateIn = keyframes`
  from {
    transform: rotate(0deg);
    opacity: 0;
  }
  to {
    transform: rotate(45deg);
    opacity: 1;
  }
`;

const rotateOut = keyframes`
  from {
    transform: rotate(45deg);
    opacity: 1;
  }
  to {
    transform: rotate(0deg);
    opacity: 0;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(20px) scale(0.8);
    opacity: 0;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
`;

// Estilos
const FloatingContainer = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    bottom: 5.5rem; /* Mais próximo da quina */
    right: 1rem; /* Mais próximo da lateral */
  }
`;

const MenuContainer = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  animation: ${({ isOpen }) => isOpen ? slideIn : slideOut} 0.3s ease-in-out;
  animation-fill-mode: both;
`;

const MenuItem = styled.button<{ delay: number; isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 160px;
  animation: ${({ isOpen }) => isOpen ? slideIn : slideOut} 0.3s ease-in-out;
  animation-delay: ${({ delay }) => delay * 0.1}s;
  animation-fill-mode: both;
  
  &:hover {
    transform: translateX(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-color);
  }
  
  &:active {
    transform: translateX(-2px) scale(0.98);
  }
`;

const MenuIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${({ color }) => color}20;
  color: ${({ color }) => color};
  font-size: 1rem;
`;

const MainButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    color: white;
    font-size: 1.25rem;
    transition: transform 0.3s ease;
    transform: ${({ isOpen }) => isOpen ? 'rotate(45deg)' : 'rotate(0deg)'};
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  z-index: 1000;
`;

// Tipos
interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'expense',
      label: 'Nova Despesa',
      icon: <FiDollarSign />,
      color: 'var(--error-color)',
      path: '/expenses'
    },
    {
      id: 'income',
      label: 'Nova Receita',
      icon: <FiTrendingUp />,
      color: 'var(--success-color)',
      path: '/incomes'
    },
    {
      id: 'bank-account',
      label: 'Nova Conta',
      icon: <FiCreditCard />,
      color: 'var(--primary-color)',
      path: '/bank-accounts'
    },
    {
      id: 'transfer',
      label: 'Transferência',
      icon: <FiRepeat />,
      color: 'var(--warning-color)',
      path: '/transfers'
    }
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: QuickAction) => {
    setIsOpen(false);
    
    // Navegar para páginas com parâmetros para abrir modais automaticamente
    if (action.id === 'expense') {
      navigate('/expenses?openModal=true');
    } else if (action.id === 'income') {
      navigate('/incomes?openModal=true');
    } else {
      // Navegar para outras páginas normalmente
      navigate(action.path);
    }
  };

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={handleOverlayClick} />
      
      <FloatingContainer>
        <MenuContainer isOpen={isOpen}>
          {quickActions.map((action, index) => (
            <MenuItem
              key={action.id}
              delay={index}
              isOpen={isOpen}
              onClick={() => handleActionClick(action)}
            >
              <MenuIcon color={action.color}>
                {action.icon}
              </MenuIcon>
              {action.label}
            </MenuItem>
          ))}
        </MenuContainer>
        
        <MainButton isOpen={isOpen} onClick={handleToggle}>
          <FiPlus />
        </MainButton>
      </FloatingContainer>
    </>
  );
};

export default FloatingActionButton;
