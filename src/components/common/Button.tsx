import React from 'react';
import styled, { css } from 'styled-components';
import { FiLoader } from 'react-icons/fi';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background: var(--primary-color);
        color: var(--white);
        border: 1px solid var(--primary-color);
        
        &:hover:not(:disabled) {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }
        
        &:active:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(1px);
        }
      `;
    
    case 'secondary':
      return css`
        background: var(--gray-100);
        color: var(--text-primary);
        border: 1px solid var(--gray-300);
        
        &:hover:not(:disabled) {
          background: var(--gray-200);
          border-color: var(--gray-400);
        }
        
        &:active:not(:disabled) {
          background: var(--gray-300);
          transform: translateY(1px);
        }
      `;
    
    case 'outline':
      return css`
        background: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        
        &:hover:not(:disabled) {
          background: var(--primary-color);
          color: var(--white);
        }
        
        &:active:not(:disabled) {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          transform: translateY(1px);
        }
      `;
    
    case 'ghost':
      return css`
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: var(--gray-100);
          color: var(--text-primary);
        }
        
        &:active:not(:disabled) {
          background: var(--gray-200);
          transform: translateY(1px);
        }
      `;
    
    case 'danger':
      return css`
        background: var(--error-color);
        color: var(--white);
        border: 1px solid var(--error-color);
        
        &:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
        }
        
        &:active:not(:disabled) {
          background: #b91c1c;
          transform: translateY(1px);
        }
      `;
    
    default:
      return css`
        background: var(--primary-color);
        color: var(--white);
        border: 1px solid var(--primary-color);
        
        &:hover:not(:disabled) {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }
      `;
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: var(--font-size-sm);
        border-radius: var(--radius-sm);
        min-height: 32px;
      `;
    
    case 'lg':
      return css`
        padding: var(--spacing-md) var(--spacing-xl);
        font-size: var(--font-size-lg);
        border-radius: var(--radius-lg);
        min-height: 48px;
      `;
    
    default: // md
      return css`
        padding: var(--spacing-sm) var(--spacing-lg);
        font-size: var(--font-size-base);
        border-radius: var(--radius-md);
        min-height: 40px;
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  
  ${({ variant = 'primary' }) => getVariantStyles(variant)}
  ${({ size = 'md' }) => getSizeStyles(size)}
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && <LoadingSpinner size={16} />}
      {children}
    </StyledButton>
  );
};

export default Button;
