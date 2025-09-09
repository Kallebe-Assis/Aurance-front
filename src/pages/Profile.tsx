import React from 'react';
import styled from 'styled-components';
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Input } from '../components/common/Input';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const Title = styled.h1`
  margin: 0;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProfileCard = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 2rem;
  font-weight: 700;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h2`
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
`;

const UserRole = styled.div`
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-transform: capitalize;
`;

const UserStats = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-md);
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  margin-bottom: var(--spacing-sm);
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--primary-color);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
`;

const InfoValue = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`;

const Profile: React.FC = () => {
  return (
    <ProfileContainer>
      <Header>
        <FiUser size={32} color="var(--primary-color)" />
        <Title>Meu Perfil</Title>
      </Header>

      <ProfileGrid>
        <ProfileCard>
          <CardHeader>
            <Avatar>JS</Avatar>
            <UserInfo>
              <UserName>João Silva</UserName>
              <UserRole>Usuário</UserRole>
              <UserStats>
                <Stat>
                  <StatValue>127</StatValue>
                  <StatLabel>Transações</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>15</StatValue>
                  <StatLabel>Categorias</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>2</StatValue>
                  <StatLabel>Cartões</StatLabel>
                </Stat>
              </UserStats>
            </UserInfo>
          </CardHeader>

          <div>
            <InfoItem>
              <InfoIcon>
                <FiMail />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>E-mail</InfoLabel>
                <InfoValue>joao@email.com</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <FiPhone />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Telefone</InfoLabel>
                <InfoValue>(11) 99999-9999</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <FiCalendar />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Membro desde</InfoLabel>
                <InfoValue>Janeiro de 2024</InfoValue>
              </InfoContent>
            </InfoItem>

            <InfoItem>
              <InfoIcon>
                <FiMapPin />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Localização</InfoLabel>
                <InfoValue>São Paulo, SP - Brasil</InfoValue>
              </InfoContent>
            </InfoItem>
          </div>
        </ProfileCard>

        <ProfileCard>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Editar Perfil</h3>
          </CardHeader>
          
          <Form>
            <FormRow>
              <Input
                type="text"
                placeholder="Nome"
                defaultValue="João"
                fullWidth
              />
              <Input
                type="text"
                placeholder="Sobrenome"
                defaultValue="Silva"
                fullWidth
              />
            </FormRow>
            
            <Input
              type="email"
              placeholder="E-mail"
              defaultValue="joao@email.com"
              fullWidth
            />
            
            <FormRow>
              <Input
                type="tel"
                placeholder="Telefone"
                defaultValue="(11) 99999-9999"
                fullWidth
              />
              <Input
                type="text"
                placeholder="Cidade"
                defaultValue="São Paulo"
                fullWidth
              />
            </FormRow>
            
            <Input
              type="text"
              placeholder="Endereço"
              defaultValue="Rua das Flores, 123"
              fullWidth
            />
            
            <FormActions>
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Alterações</Button>
            </FormActions>
          </Form>
        </ProfileCard>
      </ProfileGrid>
    </ProfileContainer>
  );
};

export default Profile;
