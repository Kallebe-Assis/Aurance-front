# Documentação do Frontend - Sistema Financeiro Aurance

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Componentes](#componentes)
5. [Páginas](#páginas)
6. [Dados Mock](#dados-mock)
7. [Estilos e Design](#estilos-e-design)
8. [Rotas da API (Para Backend)](#rotas-da-api-para-backend)
9. [Instalação e Execução](#instalação-e-execução)
10. [Funcionalidades Implementadas](#funcionalidades-implementadas)

## 🎯 Visão Geral

O frontend do Sistema Financeiro Aurance é uma aplicação React moderna e responsiva, desenvolvida com TypeScript e Styled Components. A aplicação oferece uma interface completa para gerenciamento financeiro pessoal, incluindo controle de despesas, receitas, cartões de crédito, relatórios e configurações.

### Características Principais:
- ✅ **Design Responsivo**: Adaptável para web e mobile
- ✅ **Interface Moderna**: Design limpo e intuitivo
- ✅ **Componentes Reutilizáveis**: Arquitetura modular
- ✅ **Dados Mock**: Funcionalidade completa com dados simulados
- ✅ **Navegação Intuitiva**: Sidebar responsiva e breadcrumbs
- ✅ **Gráficos Interativos**: Visualizações com Recharts
- ✅ **Formulários Validados**: Componentes de input padronizados

## 📁 Estrutura do Projeto

```
front/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   └── layout/
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Expenses.tsx
│   │   ├── Incomes.tsx
│   │   ├── CreditCards.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── Profile.tsx
│   ├── styles/
│   │   └── GlobalStyles.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── DOCUMENTACAO.md
```

## 🛠 Tecnologias Utilizadas

### Core
- **React 18.2.0**: Biblioteca principal para UI
- **TypeScript 4.9.5**: Tipagem estática
- **React Router DOM 6.8.1**: Roteamento

### Estilização
- **Styled Components 5.3.9**: CSS-in-JS
- **React Icons 4.8.0**: Ícones

### Gráficos e Visualização
- **Recharts 2.5.0**: Gráficos interativos
- **Date-fns 2.29.3**: Manipulação de datas

### Formulários e UX
- **React Hook Form 7.43.5**: Gerenciamento de formulários
- **React Hot Toast 2.4.0**: Notificações
- **React Datepicker 4.11.0**: Seletor de datas

## 🧩 Componentes

### Componentes Comuns (`/components/common/`)

#### Button.tsx
Componente de botão reutilizável com múltiplas variantes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `disabled`: boolean
- `loading`: boolean

**Exemplo:**
```tsx
<Button variant="primary" size="md" fullWidth>
  Salvar
</Button>
```

#### Input.tsx
Componentes de input padronizados.

**Componentes incluídos:**
- `Input`: Input de texto padrão
- `TextArea`: Área de texto
- `Select`: Select dropdown

**Props:**
- `error`: boolean
- `success`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `size`: 'sm' | 'md' | 'lg'

### Componentes de Layout (`/components/layout/`)

#### Layout.tsx
Layout principal que organiza Sidebar, Header e conteúdo.

#### Header.tsx
Header responsivo com busca e informações do usuário.

#### Sidebar.tsx
Navegação lateral responsiva com menu colapsável.

## 📄 Páginas

### Dashboard (`/`)
- Resumo financeiro com cards de estatísticas
- Gráficos de despesas por categoria
- Evolução mensal de receitas e despesas
- Lista de próximas despesas
- Transações recentes

### Despesas (`/expenses`)
- Lista de todas as despesas
- Filtros por categoria e status
- Busca por descrição
- Modal para cadastro/edição
- Ações: visualizar, editar, excluir

### Receitas (`/incomes`)
- Lista de todas as receitas
- Filtros por categoria e status
- Busca por descrição
- Modal para cadastro/edição
- Ações: visualizar, editar, excluir

### Cartões de Crédito (`/credit-cards`)
- Visualização em cards dos cartões
- Informações de limite e gastos
- Barra de progresso de uso
- Ações: editar, excluir

### Relatórios (`/reports`)
- Filtros por período e tipo
- Gráficos de pizza para categorias
- Gráficos de barras e linha
- Estatísticas resumidas
- Exportação para PDF

### Configurações (`/settings`)
- Perfil do usuário
- Configurações de notificações
- Segurança e senhas
- Backup e exportação de dados

### Perfil (`/profile`)
- Informações pessoais
- Estatísticas do usuário
- Formulário de edição

## 📊 Dados Mock

### Estrutura dos Dados (`/data/mockData.ts`)

#### Usuário
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Categorias
```typescript
interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Despesas
```typescript
interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  isPaid: boolean;
  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  observations?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Receitas
```typescript
interface Income {
  id: string;
  description: string;
  amount: number;
  expectedDate: Date;
  receivedDate?: Date;
  isReceived: boolean;
  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  observations?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Estilos e Design

### Sistema de Design (`/styles/GlobalStyles.ts`)

#### Variáveis CSS
- **Cores**: Sistema de cores consistente com variáveis CSS
- **Espaçamentos**: Escala de espaçamentos padronizada
- **Tipografia**: Sistema tipográfico responsivo
- **Sombras**: Hierarquia de sombras
- **Border Radius**: Valores padronizados

#### Responsividade
- **Breakpoints**: Mobile (480px), Tablet (768px), Desktop (1024px), Wide (1280px)
- **Grid System**: CSS Grid responsivo
- **Flexbox**: Layout flexível

#### Animações
- **Transições**: 0.2s ease para interações
- **Keyframes**: fadeIn, slideIn, pulse
- **Hover Effects**: Estados interativos

## 🔌 Rotas da API (Para Backend)

### Autenticação
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Usuários
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Categorias
```
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Subcategorias
```
GET    /api/subcategories
POST   /api/subcategories
GET    /api/subcategories/:id
PUT    /api/subcategories/:id
DELETE /api/subcategories/:id
GET    /api/categories/:categoryId/subcategories
```

### Despesas
```
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
PATCH  /api/expenses/:id/pay
GET    /api/expenses/reports
```

### Receitas
```
GET    /api/incomes
POST   /api/incomes
GET    /api/incomes/:id
PUT    /api/incomes/:id
DELETE /api/incomes/:id
PATCH  /api/incomes/:id/receive
GET    /api/incomes/reports
```

### Cartões de Crédito
```
GET    /api/credit-cards
POST   /api/credit-cards
GET    /api/credit-cards/:id
PUT    /api/credit-cards/:id
DELETE /api/credit-cards/:id
GET    /api/credit-cards/:id/expenses
```

### Relatórios
```
GET /api/reports/expenses
GET /api/reports/incomes
GET /api/reports/balance
GET /api/reports/dashboard
POST /api/reports/export-pdf
```

### Upload/Importação
```
POST /api/import/bank-statement
POST /api/import/expenses
POST /api/import/incomes
```

### Notificações
```
GET    /api/notifications
PATCH  /api/notifications/:id/read
DELETE /api/notifications/:id
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação
```bash
cd front
npm install
```

### Execução
```bash
# Desenvolvimento
npm start

# Build de produção
npm run build

# Testes
npm test
```

### Scripts Disponíveis
- `npm start`: Inicia servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm test`: Executa testes
- `npm run eject`: Eject do Create React App

## ✨ Funcionalidades Implementadas

### ✅ Completamente Implementadas
1. **Dashboard Responsivo**
   - Cards de estatísticas
   - Gráficos interativos
   - Lista de transações recentes

2. **Gestão de Despesas**
   - CRUD completo
   - Filtros avançados
   - Busca por descrição
   - Categorização

3. **Gestão de Receitas**
   - CRUD completo
   - Filtros avançados
   - Busca por descrição
   - Categorização

4. **Cartões de Crédito**
   - Visualização em cards
   - Controle de limite
   - Progresso de uso

5. **Relatórios**
   - Gráficos de pizza
   - Gráficos de barras
   - Gráficos de linha
   - Filtros por período

6. **Configurações**
   - Perfil do usuário
   - Notificações
   - Segurança
   - Backup

7. **Perfil**
   - Informações pessoais
   - Estatísticas
   - Edição de dados

### 🔄 Funcionalidades Prontas para Backend
1. **Autenticação**
   - Login/Logout
   - Registro
   - Recuperação de senha

2. **Importação/Exportação**
   - Extratos bancários
   - Relatórios PDF
   - Backup de dados

3. **Notificações**
   - Vencimentos
   - Alertas de cartão
   - Relatórios automáticos

4. **Sincronização**
   - Dados em tempo real
   - Backup automático
   - Logs de acesso

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações Mobile
- Sidebar colapsável
- Menu hambúrguer
- Cards empilhados
- Formulários em coluna única
- Tabelas com scroll horizontal

## 🎯 Próximos Passos

### Para Integração com Backend
1. **Configurar Axios/API Client**
2. **Implementar Context/Redux para estado global**
3. **Adicionar interceptors para autenticação**
4. **Implementar loading states**
5. **Adicionar tratamento de erros**

### Melhorias de UX
1. **Skeleton loading**
2. **Infinite scroll**
3. **Drag and drop para upload**
4. **Atalhos de teclado**
5. **Modo escuro**

### Funcionalidades Avançadas
1. **PWA (Progressive Web App)**
2. **Offline support**
3. **Push notifications**
4. **Análise de gastos com IA**
5. **Metas financeiras**

---

**Desenvolvido com ❤️ para o Sistema Financeiro Aurance**
