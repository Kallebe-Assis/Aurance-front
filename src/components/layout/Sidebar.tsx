import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard, 
  FiTag,
  FiCalendar, 
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: var(--white);
  border-right: 1px solid var(--gray-200);
  z-index: var(--z-fixed);
  transition: transform var(--transition-normal);
  box-shadow: var(--shadow-lg);
  
  @media (max-width: 768px) {
    transform: translateX(${({ isOpen }) => isOpen ? '0' : '-100%'});
  }
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const LogoImage = styled.img`
  height: 32px;
  width: auto;
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--gray-100);
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Nav = styled.nav`
  padding: var(--spacing-lg) 0;
  flex: 1;
  overflow-y: auto;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  border-right: 3px solid transparent;
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
  }
  
  &.active {
    background: var(--primary-color);
    color: var(--white);
    border-right-color: var(--primary-dark);
  }
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const NavText = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
`;

const SidebarFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 600;
  font-size: 0.75rem;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
`;

const navigationItems = [
  { path: '/', icon: FiHome, label: 'Dashboard' },
  { path: '/expenses', icon: FiDollarSign, label: 'Despesas' },
  { path: '/incomes', icon: FiTrendingUp, label: 'Receitas' },
  { path: '/credit-cards', icon: FiCreditCard, label: 'Cartões' },
      { path: '/bank-accounts', icon: FiDollarSign, label: 'Contas Bancárias' },
  { path: '/categories', icon: FiTag, label: 'Categorias' },
  { path: '/calendar', icon: FiCalendar, label: 'Calendário' },
  { path: '/settings', icon: FiSettings, label: 'Configurações' }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo>
          <LogoImage src="/LOGO8.png" alt="Aurance Logo" />
          <LogoText>Aurance</LogoText>
        </Logo>
        <CloseButton onClick={onToggle}>
          <FiX size={20} />
        </CloseButton>
      </SidebarHeader>

      <Nav>
        <NavList>
          {navigationItems.map((item) => (
            <NavItem key={item.path}>
              <NavLinkStyled 
                to={item.path}
                onClick={() => {
                  // Fechar sidebar no mobile após clicar em um link
                  if (window.innerWidth <= 768) {
                    onToggle();
                  }
                }}
              >
                <item.icon />
                <NavText>{item.label}</NavText>
              </NavLinkStyled>
            </NavItem>
          ))}
        </NavList>
      </Nav>

      <SidebarFooter>
        <UserInfo>
          <UserAvatar>U</UserAvatar>
          <UserDetails>
            <UserName>Usuário</UserName>
            <UserRole>user</UserRole>
          </UserDetails>
        </UserInfo>
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
