import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    /* Cores principais */
    --primary-color: rgb(0, 66, 134);
    --primary-dark: rgb(0, 52, 107);
    --primary-light: rgb(51, 102, 153);
    --primary-lighter: rgb(102, 153, 204);
    
    /* Cores de fundo */
    --white: #ffffff;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    /* Cores de texto */
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --text-tertiary: #9ca3af;
    
    /* Cores de status */
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    --info-color: #3b82f6;
    
    /* Espaçamentos */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    --spacing-3xl: 4rem;
    
    /* Bordas */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    
    /* Sombras */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    /* Z-index */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
    
    /* Tipografia - Sistema padronizado com fontes menores */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    
    /* Tamanhos de fonte menores e padronizados */
    --font-size-xs: 0.625rem;    /* 10px - Texto muito pequeno */
    --font-size-sm: 0.75rem;     /* 12px - Texto pequeno */
    --font-size-base: 0.875rem;  /* 14px - Texto base (reduzido de 16px) */
    --font-size-md: 1rem;        /* 16px - Texto médio */
    --font-size-lg: 1.125rem;    /* 18px - Texto grande */
    --font-size-xl: 1.25rem;     /* 20px - Título pequeno */
    --font-size-2xl: 1.375rem;   /* 22px - Título médio (reduzido de 24px) */
    --font-size-3xl: 1.5rem;     /* 24px - Título grande (reduzido de 30px) */
    --font-size-4xl: 1.75rem;    /* 28px - Título extra grande (reduzido de 36px) */
    
    /* Pesos de fonte padronizados */
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;
    
    /* Alturas de linha padronizadas */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
    
    /* Transições */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.2s ease;
    --transition-slow: 0.3s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    background-color: var(--gray-200);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--gray-100);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: var(--radius-sm);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  /* Seleção de texto */
  ::selection {
    background-color: var(--primary-color);
    color: var(--white);
  }

  /* Links */
  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--primary-dark);
  }

  /* Botões */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all var(--transition-fast);
  }

  /* Inputs */
  input, textarea, select {
    font-family: inherit;
    outline: none;
    transition: all var(--transition-fast);
  }

  /* Focus states */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* Utilitários */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Animações */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Classes de animação */
  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }

  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Classes de tipografia padronizadas */
  .text-xs {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-tight);
  }

  .text-sm {
    font-size: var(--font-size-sm);
    line-height: var(--line-height-tight);
  }

  .text-base {
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
  }

  .text-md {
    font-size: var(--font-size-md);
    line-height: var(--line-height-normal);
  }

  .text-lg {
    font-size: var(--font-size-lg);
    line-height: var(--line-height-normal);
  }

  .text-xl {
    font-size: var(--font-size-xl);
    line-height: var(--line-height-tight);
  }

  .text-2xl {
    font-size: var(--font-size-2xl);
    line-height: var(--line-height-tight);
  }

  .text-3xl {
    font-size: var(--font-size-3xl);
    line-height: var(--line-height-tight);
  }

  .text-4xl {
    font-size: var(--font-size-4xl);
    line-height: var(--line-height-tight);
  }

  /* Pesos de fonte */
  .font-light { font-weight: var(--font-weight-light); }
  .font-normal { font-weight: var(--font-weight-normal); }
  .font-medium { font-weight: var(--font-weight-medium); }
  .font-semibold { font-weight: var(--font-weight-semibold); }
  .font-bold { font-weight: var(--font-weight-bold); }
  .font-extrabold { font-weight: var(--font-weight-extrabold); }

  /* Títulos padronizados */
  h1, .h1 {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  h2, .h2 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  h3, .h3 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  h4, .h4 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  h5, .h5 {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  h6, .h6 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
  }

  /* Texto de corpo */
  p, .text-body {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--text-primary);
    margin: 0 0 1rem 0;
  }

  /* Texto secundário */
  .text-secondary {
    color: var(--text-secondary);
  }

  .text-tertiary {
    color: var(--text-tertiary);
  }
`;
