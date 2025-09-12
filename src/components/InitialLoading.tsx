import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';

// Animações para o loading inicial
const logoFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg) scale(1); 
  }
  25% { 
    transform: translateY(-20px) rotate(5deg) scale(1.05); 
  }
  50% { 
    transform: translateY(-10px) rotate(-3deg) scale(1.1); 
  }
  75% { 
    transform: translateY(-15px) rotate(2deg) scale(1.05); 
  }
`;

const logoPulse = keyframes`
  0%, 100% { 
    opacity: 1; 
    filter: brightness(1) drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));
  }
  50% { 
    opacity: 0.8; 
    filter: brightness(1.2) drop-shadow(0 0 30px rgba(59, 130, 246, 0.6));
  }
`;

const textGlow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    letter-spacing: 2px;
  }
  50% { 
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4);
    letter-spacing: 3px;
  }
`;

const backgroundShimmer = keyframes`
  0% { 
    background-position: -200% 0; 
  }
  100% { 
    background-position: 200% 0; 
  }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
  background-size: 200% 200%;
  animation: ${backgroundShimmer} 3s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: ${logoFloat} 4s ease-in-out infinite;
`;

const IconsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const LogoImage = styled.img`
  height: 100px;
  width: auto;
  animation: ${logoPulse} 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
`;

const MoneyIcon = styled.img`
  height: 80px;
  width: auto;
  animation: ${logoPulse} 2s ease-in-out infinite 0.5s;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.5));
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.1);
  padding: 10px;
`;

const FallbackIcon = styled.div`
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${logoPulse} 2s ease-in-out infinite 0.5s;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.5));
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
  font-size: 2rem;
`;

const LogoText = styled.h1`
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin: 0;
  text-align: center;
  animation: ${textGlow} 2.5s ease-in-out infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const LoadingSubtext = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-align: center;
  font-weight: 300;
  letter-spacing: 1px;
  animation: ${textGlow} 2.5s ease-in-out infinite 0.5s;
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 2rem;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ffffff, #e0e7ff, #ffffff);
  background-size: 200% 100%;
  border-radius: 2px;
  animation: ${backgroundShimmer} 1.5s ease-in-out infinite;
  width: 100%;
`;

interface InitialLoadingProps {
  message?: string;
  subtitle?: string;
}

export const InitialLoading: React.FC<InitialLoadingProps> = ({ 
  message = "AURANCE", 
  subtitle = "Sistema Financeiro Inteligente" 
}) => (
  <LoadingContainer>
    <LogoContainer>
      <IconsContainer>
        <LogoImage 
          src="/LOGO8-SF.png" 
          alt="Aurance Logo"
          onError={(e) => {
            console.log('Erro ao carregar LOGO8-SF.png');
            e.currentTarget.style.display = 'none';
          }}
        />
        <MoneyIcon 
          src="/ICONE-MONEY.png" 
          alt="Money Icon"
          onError={(e) => {
            console.log('Erro ao carregar ICONE-MONEY.png');
            e.currentTarget.style.display = 'none';
          }}
        />
        <FallbackIcon>
          <FiDollarSign />
        </FallbackIcon>
      </IconsContainer>
      <LogoText>{message}</LogoText>
      <LoadingSubtext>{subtitle}</LoadingSubtext>
    </LogoContainer>
    
    <ProgressBar>
      <ProgressFill />
    </ProgressBar>
  </LoadingContainer>
);

export default InitialLoading;
