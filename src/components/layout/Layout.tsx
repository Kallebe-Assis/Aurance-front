import React, { useState } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import BottomNavbar from './BottomNavbar';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: var(--gray-200);
`;

const MainContent = styled.main`
  margin-left: 280px;
  padding: var(--spacing-md);
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: var(--spacing-sm);
    padding-bottom: 80px; /* Espaço para a navbar inferior */
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal-backdrop);
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} onToggle={handleMenuToggle} />
      <Overlay isOpen={sidebarOpen} onClick={handleOverlayClick} />
      <MainContent>
        {children}
      </MainContent>
      <BottomNavbar />
    </LayoutContainer>
  );
};

export default Layout;
