import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Componentes estilizados
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const IconContainer = styled.div<{ variant: 'success' | 'error' | 'warning' | 'info' }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  animation: ${pulse} 2s infinite;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        `;
      case 'error':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        `;
      case 'info':
        return `
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
        `;
    }
  }}
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-align: center;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `;
    } else {
      return `
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
        
        &:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }
      `;
    }
  }}
`;

// Props do componente
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
  showCloseButton?: boolean;
}

// Componente principal
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'success',
  buttonText = 'OK',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '✅';
    }
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <IconContainer variant={variant}>
              <span style={{ fontSize: '1.5rem' }}>{getIcon()}</span>
            </IconContainer>
            <Title>{title}</Title>
          </div>
        </ModalHeader>
        
        <Message>{message}</Message>
        
        {showCloseButton && (
          <ButtonContainer>
            <Button variant="primary" onClick={onClose}>
              {buttonText}
            </Button>
          </ButtonContainer>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;
