import React, { forwardRef } from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
  error?: boolean;
  success?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
  error?: boolean;
  success?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  fullWidth?: boolean;
  error?: boolean;
  success?: boolean;
}

const StyledInput = styled.input<InputProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgb(0 66 134 / 0.1);
  }
  
  &:disabled {
    background: var(--gray-50);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ error }) => error && `
    border-color: var(--error-color);
    
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  `}
  
  ${({ success }) => success && `
    border-color: var(--success-color);
    
    &:focus {
      border-color: var(--success-color);
      box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1);
    }
  `}
`;

const StyledTextArea = styled.textarea<TextAreaProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  resize: vertical;
  min-height: 80px;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgb(0 66 134 / 0.1);
  }
  
  &:disabled {
    background: var(--gray-50);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ error }) => error && `
    border-color: var(--error-color);
    
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  `}
  
  ${({ success }) => success && `
    border-color: var(--success-color);
    
    &:focus {
      border-color: var(--success-color);
      box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1);
    }
  `}
`;

const StyledSelect = styled.select<SelectProps>`
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  background: var(--white);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
  cursor: pointer;
  
  &:hover {
    border-color: var(--gray-400);
  }
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgb(0 66 134 / 0.1);
  }
  
  &:disabled {
    background: var(--gray-50);
    color: var(--text-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ error }) => error && `
    border-color: var(--error-color);
    
    &:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
    }
  `}
  
  ${({ success }) => success && `
    border-color: var(--success-color);
    
    &:focus {
      border-color: var(--success-color);
      box-shadow: 0 0 0 3px rgb(16 185 129 / 0.1);
    }
  `}
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ fullWidth = false, error = false, success = false, ...props }, ref) => {
    return (
      <StyledInput
        ref={ref}
        fullWidth={fullWidth}
        error={error}
        success={success}
        {...props}
      />
    );
  }
);

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ fullWidth = false, error = false, success = false, ...props }, ref) => {
    return (
      <StyledTextArea
        ref={ref}
        fullWidth={fullWidth}
        error={error}
        success={success}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ fullWidth = false, error = false, success = false, children, ...props }, ref) => {
    return (
      <StyledSelect
        ref={ref}
        fullWidth={fullWidth}
        error={error}
        success={success}
        {...props}
      >
        {children}
      </StyledSelect>
    );
  }
);

Input.displayName = 'Input';
TextArea.displayName = 'TextArea';
Select.displayName = 'Select';

export default Input;
