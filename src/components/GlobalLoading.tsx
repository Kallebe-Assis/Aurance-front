import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiDollarSign } from 'react-icons/fi';

// Animações para o loading
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

// Componente de Loading Animado
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 2rem;
  background: transparent;
  padding: 2rem;
`;

const LoadingTitle = styled.h2`
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const LoadingSubtitle = styled.p`
  color: #6B7280;
  font-size: 1rem;
  margin: 0;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite 0.5s;
`;

const MoneySpinner = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  animation: ${spin} 3s linear infinite;
`;

const Coin = styled.div<{ delay: number; size: number; color: string }>`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.size * 0.4}px;
  color: white;
  font-weight: bold;
  animation: ${float} 2s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const DollarSign = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: #FFD700;
  font-weight: bold;
  animation: ${bounce} 1.5s ease-in-out infinite;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

interface GlobalLoadingProps {
  message?: string;
  subtitle?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({ 
  message = "💰 Carregando...", 
  subtitle = "Analisando suas finanças..." 
}) => (
  <LoadingContainer>
    <MoneySpinner>
      <Coin delay={0} size={30} color="#FFD700" style={{ top: '10px', left: '45px' }}>
        R$
      </Coin>
      <Coin delay={0.3} size={25} color="#FFA500" style={{ top: '45px', right: '10px' }}>
        $
      </Coin>
      <Coin delay={0.6} size={28} color="#FFD700" style={{ bottom: '10px', left: '45px' }}>
        R$
      </Coin>
      <Coin delay={0.9} size={22} color="#FFA500" style={{ top: '45px', left: '10px' }}>
        $
      </Coin>
      <DollarSign>
        <FiDollarSign />
      </DollarSign>
    </MoneySpinner>
    
    <LoadingTitle>{message}</LoadingTitle>
    <LoadingSubtitle>{subtitle}</LoadingSubtitle>
  </LoadingContainer>
);
