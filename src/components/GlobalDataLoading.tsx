import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiLoader } from 'react-icons/fi';

// Animações
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Estilos
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: white;
  animation: ${slideUp} 0.5s ease-out;
`;

const LoadingIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  animation: ${spin} 1s linear infinite;
  color: white;
`;

const LoadingTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
`;

const LoadingSubtitle = styled.p`
  margin: 0 0 2rem 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 400px;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 100%;
  background: white;
  border-radius: 2px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const LoadingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

const Step = styled.div<{ completed: boolean; current: boolean }>`
  font-size: 0.875rem;
  color: ${({ completed, current }) => 
    completed ? 'white' : 
    current ? 'rgba(255, 255, 255, 0.9)' : 
    'rgba(255, 255, 255, 0.5)'
  };
  font-weight: ${({ current }) => current ? '500' : '400'};
  transition: all 0.3s ease;
`;

interface GlobalDataLoadingProps {
  message?: string;
  subtitle?: string;
  progress?: number;
  steps?: Array<{
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
  }>;
}

const GlobalDataLoading: React.FC<GlobalDataLoadingProps> = ({
  message = "Carregando seus dados",
  subtitle = "Preparando tudo para você...",
  progress = 0,
  steps = []
}) => {
  return (
    <LoadingOverlay>
      <LoadingContent>
        <LoadingIcon>
          <FiLoader />
        </LoadingIcon>
        
        <LoadingTitle>{message}</LoadingTitle>
        <LoadingSubtitle>{subtitle}</LoadingSubtitle>
        
        {progress > 0 && (
          <ProgressContainer>
            <ProgressBar progress={progress} />
          </ProgressContainer>
        )}
        
        {steps.length > 0 && (
          <LoadingSteps>
            {steps.map((step) => (
              <Step
                key={step.id}
                completed={step.completed}
                current={step.current}
              >
                {step.completed ? '✓' : step.current ? '⏳' : '○'} {step.label}
              </Step>
            ))}
          </LoadingSteps>
        )}
      </LoadingContent>
    </LoadingOverlay>
  );
};

export default GlobalDataLoading;
