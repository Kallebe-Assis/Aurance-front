import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiMenu, FiBell, FiSearch, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuToggle: () => void;
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  height: 60px;
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 768px) {
    left: 0;
    padding: 0 var(--spacing-sm);
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex: 1;
    margin: 0 var(--spacing-md);
  }
`;

const SearchInput = styled.input`
  width: 250px;
  padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 2rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  background-color: var(--gray-50);
  font-size: 0.75rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: var(--white);
    box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: var(--spacing-xs);
  color: var(--gray-400);
  font-size: 0.875rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background-color: var(--error-color);
  border-radius: 50%;
  border: 2px solid var(--white);
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: var(--gray-100);
  }
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 600;
  font-size: 0.75rem;
`;

const UserInfo = styled.div`
  display: none;
  flex-direction: column;
  align-items: flex-start;
  
  @media (min-width: 1024px) {
    display: flex;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.75rem;
`;

const UserRole = styled.span`
  font-size: 0.65rem;
  color: var(--text-tertiary);
  text-transform: capitalize;
`;

const UserDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: var(--z-dropdown);
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transform: ${({ isOpen }) => isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  margin-top: var(--spacing-xs);
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: var(--text-primary);
  
  &:hover {
    background-color: var(--gray-50);
  }
  
  &:first-child {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    border-top: 1px solid var(--gray-200);
    color: var(--error-color);
    
    &:hover {
      background-color: var(--error-color);
      color: var(--white);
    }
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background-color: var(--gray-200);
  margin: var(--spacing-xs) 0;
`;

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onMenuToggle}>
          <FiMenu />
        </MenuButton>
        
        <SearchContainer>
          <SearchIcon />
          <SearchInput 
            type="text" 
            placeholder="Pesquisar transações, categorias..." 
          />
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <NotificationButton>
          <FiBell />
          <NotificationBadge />
        </NotificationButton>
        
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <UserButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <UserAvatar>
              {user && user.name ? getInitials(user.name) : 'U'}
            </UserAvatar>
            <UserInfo>
              <UserName>{user?.name || 'Usuário'}</UserName>
              <UserRole>{user?.role || 'user'}</UserRole>
            </UserInfo>
          </UserButton>
          
          <UserDropdown isOpen={isDropdownOpen}>
            <DropdownItem onClick={() => window.location.href = '/profile'}>
              <FiUser size={16} />
              Meu Perfil
            </DropdownItem>
            
            <DropdownItem onClick={() => window.location.href = '/settings'}>
              <FiSettings size={16} />
              Configurações
            </DropdownItem>
            
            <DropdownDivider />
            
            <DropdownItem onClick={handleLogout}>
              <FiLogOut size={16} />
              Sair
            </DropdownItem>
          </UserDropdown>
        </div>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
