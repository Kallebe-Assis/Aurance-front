import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { Input } from '../components/common/Input';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: var(--spacing-md);
`;

const RegisterCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-3xl);
  width: 100%;
  max-width: 450px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  margin-bottom: var(--spacing-sm);
`;

const LogoTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
`;

const LogoSubtitle = styled.p`
  color: var(--text-secondary);
  margin: var(--spacing-xs) 0 0 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  z-index: 1;
`;

const StyledInput = styled(Input)`
  padding-left: calc(var(--spacing-md) + 20px);
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--text-secondary);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: var(--spacing-lg) 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--gray-200);
  }
  
  span {
    padding: 0 var(--spacing-md);
    color: var(--text-tertiary);
    font-size: 0.875rem;
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: var(--spacing-lg);
  
  span {
    color: var(--text-secondary);
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      });
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      // Erro já tratado no interceptor do axios
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <LogoImage src="/LOGO8.png" alt="Aurance Logo" />
          <LogoTitle>Aurance</LogoTitle>
          <LogoSubtitle>Criar nova conta</LogoSubtitle>
        </Logo>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputWrapper>
              <InputIcon>
                <FiUser size={20} />
              </InputIcon>
              <StyledInput
                type="text"
                placeholder="Seu nome completo"
                fullWidth
                {...register('name', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres'
                  }
                })}
                error={!!errors.name}
              />
            </InputWrapper>
            {errors.name && (
              <small style={{ color: 'var(--error-color)', marginTop: 'var(--spacing-xs)' }}>
                {errors.name.message}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <InputWrapper>
              <InputIcon>
                <FiMail size={20} />
              </InputIcon>
              <StyledInput
                type="email"
                placeholder="Seu email"
                fullWidth
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                error={!!errors.email}
              />
            </InputWrapper>
            {errors.email && (
              <small style={{ color: 'var(--error-color)', marginTop: 'var(--spacing-xs)' }}>
                {errors.email.message}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <InputWrapper>
              <InputIcon>
                <FiPhone size={20} />
              </InputIcon>
              <StyledInput
                type="tel"
                placeholder="Seu telefone (opcional)"
                fullWidth
                {...register('phone')}
              />
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <InputWrapper>
              <InputIcon>
                <FiLock size={20} />
              </InputIcon>
              <StyledInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                fullWidth
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
                error={!!errors.password}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </PasswordToggle>
            </InputWrapper>
            {errors.password && (
              <small style={{ color: 'var(--error-color)', marginTop: 'var(--spacing-xs)' }}>
                {errors.password.message}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <InputWrapper>
              <InputIcon>
                <FiLock size={20} />
              </InputIcon>
              <StyledInput
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar senha"
                fullWidth
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: value => value === password || 'Senhas não coincidem'
                })}
                error={!!errors.confirmPassword}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </PasswordToggle>
            </InputWrapper>
            {errors.confirmPassword && (
              <small style={{ color: 'var(--error-color)', marginTop: 'var(--spacing-xs)' }}>
                {errors.confirmPassword.message}
              </small>
            )}
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Form>

        <Divider>
          <span>ou</span>
        </Divider>

        <LoginLink>
          <span>Já tem uma conta? </span>
          <Link to="/login">Fazer login</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
