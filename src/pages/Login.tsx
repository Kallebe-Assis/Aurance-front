import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import { Input } from '../components/common/Input';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: var(--spacing-md);
`;

const LoginCard = styled.div`
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-3xl);
  width: 100%;
  max-width: 400px;
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

const ForgotPassword = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: right;
  padding: 0;
  margin-top: var(--spacing-xs);
  
  &:hover {
    text-decoration: underline;
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

const RegisterLink = styled.div`
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

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      // Mostrar erro específico se disponível
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoImage src="/LOGO8.png" alt="Aurance Logo" />
          <LogoTitle>Aurance</LogoTitle>
          <LogoSubtitle>Sistema Financeiro</LogoSubtitle>
        </Logo>

        <Form onSubmit={handleSubmit(onSubmit)}>
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
            <ForgotPassword type="button">
              Esqueceu sua senha?
            </ForgotPassword>
          </FormGroup>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>

        <Divider>
          <span>ou</span>
        </Divider>

        <RegisterLink>
          <span>Não tem uma conta? </span>
          <Link to="/register">Cadastre-se</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
