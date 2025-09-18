import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard, 
  FiSettings,
  FiMenu,
  FiX,
  FiTag,
  FiCalendar,
  FiRepeat,
  FiUser
} from 'react-icons/fi';

const BottomNavbarContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
  z-index: 1000;
  display: none;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const NavList = styled.div`
  display: flex;
  width: 100%;
  height: 60px;
`;

const NavItem = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    color: var(--primary-color);
    background: var(--gray-50);
  }
  
  &.active {
    color: var(--primary-color);
    background: var(--primary-color)10;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: var(--primary-color);
      border-radius: 0 0 3px 3px;
    }
  }
  
  svg {
    width: 20px;
    height: 20px;
    transition: transform var(--transition-fast);
  }
  
  &.active svg {
    transform: scale(1.1);
  }
`;

const NavLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  transition: all var(--transition-fast);
  
  ${NavItem}.active & {
    font-weight: 600;
  }
`;

// Menu expandido
const ExpandedMenu = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: var(--white);
  border-top: 1px solid var(--gray-200);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform var(--transition-normal);
  max-height: 50vh;
  overflow-y: auto;
`;

const ExpandedMenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
`;

const ExpandedMenuItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--spacing-mobile-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  border-right: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  
  &:nth-child(even) {
    border-right: none;
  }
  
  &:hover {
    background: var(--gray-50);
    color: var(--primary-color);
  }
  
  &.active {
    background: var(--primary-color)10;
    color: var(--primary-color);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ExpandedMenuLabel = styled.span`
  font-size: 10px;
  font-weight: 500;
  text-align: center;
`;

// Itens de navegação principais para mobile
const mobileNavigationItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/expenses', icon: FiDollarSign, label: 'Despesas' },
  { path: '/incomes', icon: FiTrendingUp, label: 'Receitas' },
  { path: '/credit-cards', icon: FiCreditCard, label: 'Cartões' }
];

// Itens do menu expandido
const expandedMenuItems = [
  { path: '/bank-accounts', icon: FiDollarSign, label: 'Contas' },
  { path: '/transfers', icon: FiRepeat, label: 'Transferências' },
  { path: '/categories', icon: FiTag, label: 'Categorias' },
  { path: '/calendar', icon: FiCalendar, label: 'Calendário' },
  { path: '/profile', icon: FiUser, label: 'Perfil' },
  { path: '/settings', icon: FiSettings, label: 'Configurações' }
];

const BottomNavbar: React.FC = () => {
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);

  return (
    <>
      <BottomNavbarContainer>
        <NavList>
          {mobileNavigationItems.map((item) => (
            <NavItem key={item.path} to={item.path}>
              <item.icon />
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          ))}
          <NavItem 
            as="button" 
            onClick={() => setIsExpandedOpen(!isExpandedOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isExpandedOpen ? <FiX /> : <FiMenu />}
            <NavLabel>Mais</NavLabel>
          </NavItem>
        </NavList>
      </BottomNavbarContainer>
      
      <ExpandedMenu isOpen={isExpandedOpen}>
        <ExpandedMenuGrid>
          {expandedMenuItems.map((item) => (
            <ExpandedMenuItem key={item.path} to={item.path}>
              <item.icon />
              <ExpandedMenuLabel>{item.label}</ExpandedMenuLabel>
            </ExpandedMenuItem>
          ))}
        </ExpandedMenuGrid>
      </ExpandedMenu>
    </>
  );
};

export default BottomNavbar;
