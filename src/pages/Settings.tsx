import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUser, FiShield, FiBell, FiCreditCard, FiDollarSign, FiSave, FiLogOut, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { userService } from '../services';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import toast from 'react-hot-toast';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const Title = styled.h1`
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
`;

const SettingsSection = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
`;

const SectionIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background-color: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Input = styled.input`
  padding: var(--spacing-sm);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color)20;
  }
`;

const Select = styled.select`
  padding: var(--spacing-sm);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: var(--white);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color)20;
  }
`;

const Textarea = styled.textarea`
  padding: var(--spacing-sm);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color)20;
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
`;

const SwitchLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const SwitchTitle = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const SwitchDescription = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--primary-color);
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--gray-300);
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
`;

const DangerZone = styled.div`
  background-color: var(--error-color)10;
  border: 1px solid var(--error-color)30;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
`;

const DangerTitle = styled.h3`
  color: var(--error-color);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const DangerDescription = styled.p`
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.875rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
`;

// Estilos para o botão de exclusão total
const DangerSection = styled(SettingsSection)`
  border: 2px solid var(--error-color);
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
`;

const DangerHeader = styled(SectionHeader)`
  color: var(--error-color);
  border-bottom-color: var(--error-color);
`;

const DangerButton = styled.button`
  background: linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Modal de confirmação
const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  border: 2px solid var(--error-color);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  color: var(--error-color);
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--error-color);
`;

const ModalBody = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const WarningText = styled.p`
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-relaxed);
`;

const ConfirmationInput = styled.input`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--error-color);
  }
  
  &.error {
    border-color: var(--error-color);
    background-color: #fef2f2;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: var(--gray-100);
  color: var(--text-primary);
  border: 1px solid var(--gray-300);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--gray-200);
  }
`;

const ConfirmButton = styled.button`
  background: var(--error-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
`;

const ProgressDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ active, completed }) => 
    completed ? 'var(--success-color)' : 
    active ? 'var(--error-color)' : 'var(--gray-300)'
  };
  transition: all 0.3s ease;
`;

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'BRL',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo'
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    monthlyReports: true,
    expenseReminders: true,
    goalReminders: true
  });

  // Estados para o modal de exclusão total
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Textos de confirmação
  const confirmationSteps = [
    {
      title: "⚠️ PRIMEIRA CONFIRMAÇÃO",
      message: "Você está prestes a EXCLUIR PERMANENTEMENTE todos os seus dados. Esta ação é IRREVERSÍVEL!",
      inputPlaceholder: "Digite 'EXCLUIR TUDO' para continuar",
      expectedInput: "EXCLUIR TUDO"
    },
    {
      title: "🚨 SEGUNDA CONFIRMAÇÃO",
      message: "Todos os seus dados serão PERDIDOS para sempre: despesas, receitas, contas bancárias, cartões, transferências, categorias...",
      inputPlaceholder: "Digite 'TENHO CERTEZA' para continuar",
      expectedInput: "TENHO CERTEZA"
    },
    {
      title: "💀 CONFIRMAÇÃO FINAL",
      message: "Esta é sua ÚLTIMA CHANCE de cancelar. Após clicar em 'CONFIRMAR EXCLUSÃO', não há volta. Todos os dados serão apagados do servidor permanentemente.",
      inputPlaceholder: "Digite 'CONFIRMO EXCLUSÃO' para continuar",
      expectedInput: "CONFIRMO EXCLUSÃO"
    }
  ];

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await userService.getProfile();
        setUserData(response.data.user);
        setPreferences(response.data.preferences || preferences);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updateProfile(userData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await userService.updatePreferences(preferences);
      toast.success('Preferências atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        await userService.deleteAccount();
        toast.success('Conta excluída com sucesso');
        // Redirecionar para logout
        window.location.href = '/login';
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        toast.error('Erro ao excluir conta');
      }
    }
  };

  // Funções para o modal de exclusão total
  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setConfirmationStep(0);
    setConfirmationText('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setConfirmationStep(0);
    setConfirmationText('');
    setIsDeleting(false);
  };

  const handleConfirmationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
  };

  const handleNextStep = () => {
    const currentStep = confirmationSteps[confirmationStep];
    if (confirmationText.trim() === currentStep.expectedInput) {
      if (confirmationStep < confirmationSteps.length - 1) {
        setConfirmationStep(confirmationStep + 1);
        setConfirmationText('');
      } else {
        // Última confirmação - executar exclusão
        executeTotalDeletion();
      }
    } else {
      toast.error('Texto de confirmação incorreto!');
    }
  };

  const executeTotalDeletion = async () => {
    try {
      setIsDeleting(true);
      
      let result;
      
      try {
        // Primeiro, tentar o método normal
        console.log('🔄 Tentando exclusão normal...');
        result = await userService.deleteAllData();
        console.log('✅ Resultado da exclusão normal:', result);
      } catch (normalError) {
        console.warn('⚠️ Método normal falhou, tentando método agressivo...', normalError);
        
        // Se o método normal falhar, tentar o método agressivo
        result = await userService.deleteAllDataAggressive();
        console.log('✅ Resultado da exclusão agressiva:', result);
      }
      
      // Limpar todos os dados locais
      localStorage.clear();
      sessionStorage.clear();
      
      toast.success('Todos os dados foram excluídos permanentemente!');
      
      // Redirecionar para login
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao excluir todos os dados:', error);
      toast.error('Erro ao excluir dados. Tente novamente.');
      setIsDeleting(false);
    }
  };

  const isConfirmationValid = () => {
    const currentStep = confirmationSteps[confirmationStep];
    return confirmationText.trim() === currentStep.expectedInput;
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading) {
    return <GlobalLoading message="⚙️ Carregando Configurações" subtitle="Buscando suas configurações..." />;
  }

  return (
    <SettingsContainer>
      <Header>
        <Title>Configurações</Title>
      </Header>

      <SettingsGrid>
        {/* Perfil do Usuário */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon color="var(--primary-color)">
              <FiUser />
            </SectionIcon>
            <SectionTitle>Perfil do Usuário</SectionTitle>
          </SectionHeader>
          
          <Form onSubmit={handleSaveProfile}>
            <FormRow>
              <FormGroup>
                <Label>Nome Completo</Label>
                <Input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label>Telefone</Label>
                <Input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Moeda</Label>
                <Select
                  value={userData.currency}
                  onChange={(e) => setUserData({ ...userData, currency: e.target.value })}
                >
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label>Idioma</Label>
                <Select
                  value={userData.language}
                  onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Fuso Horário</Label>
                <Select
                  value={userData.timezone}
                  onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
                >
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormActions>
              <Button type="submit" disabled={saving}>
                <FiSave />
                {saving ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </FormActions>
          </Form>
        </SettingsSection>

        {/* Preferências */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon color="var(--warning-color)">
              <FiBell />
            </SectionIcon>
            <SectionTitle>Preferências</SectionTitle>
          </SectionHeader>
          
          <div>
            <SwitchContainer>
              <SwitchLabel>
                <SwitchTitle>Notificações por E-mail</SwitchTitle>
                <SwitchDescription>Receber notificações importantes por e-mail</SwitchDescription>
              </SwitchLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                />
                <SwitchSlider />
              </Switch>
            </SwitchContainer>
            
            <SwitchContainer>
              <SwitchLabel>
                <SwitchTitle>Notificações Push</SwitchTitle>
                <SwitchDescription>Receber notificações no navegador</SwitchDescription>
              </SwitchLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                />
                <SwitchSlider />
              </Switch>
            </SwitchContainer>
            
            <SwitchContainer>
              <SwitchLabel>
                <SwitchTitle>Relatórios Mensais</SwitchTitle>
                <SwitchDescription>Receber relatórios mensais por e-mail</SwitchDescription>
              </SwitchLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={preferences.monthlyReports}
                  onChange={(e) => setPreferences({ ...preferences, monthlyReports: e.target.checked })}
                />
                <SwitchSlider />
              </Switch>
            </SwitchContainer>
            
            <SwitchContainer>
              <SwitchLabel>
                <SwitchTitle>Lembretes de Despesas</SwitchTitle>
                <SwitchDescription>Lembrar de despesas próximas do vencimento</SwitchDescription>
              </SwitchLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={preferences.expenseReminders}
                  onChange={(e) => setPreferences({ ...preferences, expenseReminders: e.target.checked })}
                />
                <SwitchSlider />
              </Switch>
            </SwitchContainer>
            
            <SwitchContainer>
              <SwitchLabel>
                <SwitchTitle>Lembretes de Metas</SwitchTitle>
                <SwitchDescription>Lembrar de atualizar progresso das metas</SwitchDescription>
              </SwitchLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={preferences.goalReminders}
                  onChange={(e) => setPreferences({ ...preferences, goalReminders: e.target.checked })}
                />
                <SwitchSlider />
              </Switch>
            </SwitchContainer>
            
            <FormActions>
              <Button onClick={handleSavePreferences} disabled={saving}>
                <FiSave />
                {saving ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </FormActions>
          </div>
        </SettingsSection>

        {/* Exclusão Total - EXTREMAMENTE PERIGOSO */}
        <DangerSection>
          <DangerHeader>
            <SectionIcon color="var(--error-color)">
              <FiAlertTriangle />
            </SectionIcon>
            <SectionTitle>⚠️ EXCLUSÃO TOTAL DE DADOS</SectionTitle>
          </DangerHeader>
          
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <WarningText>
              <strong>🚨 ATENÇÃO: ESTA AÇÃO É EXTREMAMENTE PERIGOSA! 🚨</strong>
            </WarningText>
            <WarningText>
              Esta função irá <strong>EXCLUIR PERMANENTEMENTE</strong> todos os seus dados:
            </WarningText>
            <ul style={{ margin: 'var(--spacing-md) 0', paddingLeft: 'var(--spacing-lg)' }}>
              <li>💰 Todas as despesas e receitas</li>
              <li>🏦 Todas as contas bancárias</li>
              <li>💳 Todos os cartões de crédito</li>
              <li>🔄 Todas as transferências</li>
              <li>📊 Todas as categorias e subcategorias</li>
              <li>📈 Todos os relatórios e estatísticas</li>
              <li>👤 Sua conta de usuário</li>
            </ul>
            <WarningText style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>
              ⚠️ Esta ação é <strong>IRREVERSÍVEL</strong> e não pode ser desfeita! ⚠️
            </WarningText>
          </div>
          
          <DangerButton onClick={openDeleteModal} disabled={isDeleting}>
            <FiTrash2 />
            {isDeleting ? 'EXCLUINDO...' : 'EXCLUIR TUDO PERMANENTEMENTE'}
          </DangerButton>
        </DangerSection>

        {/* Zona de Perigo */}
        <DangerZone>
          <DangerTitle>
            <FiShield />
            Zona de Perigo
          </DangerTitle>
          <DangerDescription>
            Estas ações são irreversíveis. Tenha cuidado ao executá-las.
          </DangerDescription>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={handleLogout}>
              <FiLogOut />
              Fazer Logout
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Excluir Conta
            </Button>
          </div>
        </DangerZone>
      </SettingsGrid>

      {/* Modal de Confirmação de Exclusão Total */}
      <Modal isOpen={showDeleteModal} onClick={closeDeleteModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <FiAlertTriangle size={24} />
            <ModalTitle>{confirmationSteps[confirmationStep]?.title}</ModalTitle>
          </ModalHeader>
          
          <ModalBody>
            <ProgressIndicator>
              {confirmationSteps.map((_, index) => (
                <ProgressDot
                  key={index}
                  active={index === confirmationStep}
                  completed={index < confirmationStep}
                />
              ))}
            </ProgressIndicator>
            
            <WarningText>
              {confirmationSteps[confirmationStep]?.message}
            </WarningText>
            
            <ConfirmationInput
              type="text"
              value={confirmationText}
              onChange={handleConfirmationInput}
              placeholder={confirmationSteps[confirmationStep]?.inputPlaceholder}
              className={confirmationText && !isConfirmationValid() ? 'error' : ''}
              disabled={isDeleting}
              autoFocus
            />
            
            {confirmationText && !isConfirmationValid() && (
              <WarningText style={{ color: 'var(--error-color)', fontSize: '0.875rem' }}>
                ❌ Texto incorreto! Digite exatamente: "{confirmationSteps[confirmationStep]?.expectedInput}"
              </WarningText>
            )}
          </ModalBody>
          
          <ModalActions>
            <CancelButton onClick={closeDeleteModal} disabled={isDeleting}>
              Cancelar
            </CancelButton>
            <ConfirmButton
              onClick={handleNextStep}
              disabled={!isConfirmationValid() || isDeleting}
            >
              {isDeleting ? 'EXCLUINDO...' : 
               confirmationStep === confirmationSteps.length - 1 ? 'CONFIRMAR EXCLUSÃO TOTAL' : 
               'Continuar'}
            </ConfirmButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </SettingsContainer>
  );
};

export default Settings;
