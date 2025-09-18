import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiPlus, FiEye, FiEdit, FiTrash2, FiDollarSign, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp, FiFilter,
  FiTag, FiHome, FiShoppingBag, FiTruck, FiCreditCard, FiTrendingUp, FiTrendingDown,
  FiCoffee, FiShoppingCart, FiZap, FiWifi, FiPhone, FiMonitor, FiActivity, FiBook,
  FiMusic, FiCamera, FiHeart, FiGift, FiBriefcase, FiUsers, FiUser, FiMail,
  FiCalendar, FiClock, FiMapPin, FiGlobe, FiShield, FiSettings, FiTool,
  FiSun, FiMoon, FiCloud, FiCloudRain, FiWind, FiThermometer, FiUmbrella, FiStar,
  FiAward, FiTarget, FiFlag, FiLayers, FiGrid, FiBox, FiPackage,
  FiNavigation, FiNavigation2, FiBarChart, FiPieChart, FiFileText, FiImage
} from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { incomeService } from '../services/incomes';
import { Income, FirebaseDateType, FirebaseTimestamp, FirebaseDate } from '../types';
import Button from '../components/common/Button';
import { Input, Select, TextArea } from '../components/common/Input';
import { GlobalLoading } from '../components/GlobalLoading';
import { useData } from '../contexts/DataContext';
import toast from 'react-hot-toast';

// Lista de ícones disponíveis para categorias
const AVAILABLE_ICONS = [
  { name: 'tag', component: FiTag },
  { name: 'home', component: FiHome },
  { name: 'shopping-bag', component: FiShoppingBag },
  { name: 'truck', component: FiTruck },
  { name: 'credit-card', component: FiCreditCard },
  { name: 'dollar-sign', component: FiDollarSign },
  { name: 'trending-up', component: FiTrendingUp },
  { name: 'trending-down', component: FiTrendingDown },
  { name: 'coffee', component: FiCoffee },
  { name: 'shopping-cart', component: FiShoppingCart },
  { name: 'zap', component: FiZap },
  { name: 'wifi', component: FiWifi },
  { name: 'phone', component: FiPhone },
  { name: 'monitor', component: FiMonitor },
  { name: 'activity', component: FiActivity },
  { name: 'book', component: FiBook },
  { name: 'music', component: FiMusic },
  { name: 'camera', component: FiCamera },
  { name: 'heart', component: FiHeart },
  { name: 'gift', component: FiGift },
  { name: 'briefcase', component: FiBriefcase },
  { name: 'users', component: FiUsers },
  { name: 'user', component: FiUser },
  { name: 'mail', component: FiMail },
  { name: 'calendar', component: FiCalendar },
  { name: 'clock', component: FiClock },
  { name: 'map-pin', component: FiMapPin },
  { name: 'globe', component: FiGlobe },
  { name: 'shield', component: FiShield },
  { name: 'settings', component: FiSettings },
  { name: 'tool', component: FiTool },
  { name: 'sun', component: FiSun },
  { name: 'moon', component: FiMoon },
  { name: 'cloud', component: FiCloud },
  { name: 'cloud-rain', component: FiCloudRain },
  { name: 'wind', component: FiWind },
  { name: 'thermometer', component: FiThermometer },
  { name: 'umbrella', component: FiUmbrella },
  { name: 'star', component: FiStar },
  { name: 'award', component: FiAward },
  { name: 'target', component: FiTarget },
  { name: 'flag', component: FiFlag },
  { name: 'layers', component: FiLayers },
  { name: 'grid', component: FiGrid },
  { name: 'box', component: FiBox },
  { name: 'package', component: FiPackage },
  { name: 'navigation', component: FiNavigation },
  { name: 'navigation2', component: FiNavigation2 },
  { name: 'bar-chart', component: FiBarChart },
  { name: 'pie-chart', component: FiPieChart },
  { name: 'file-text', component: FiFileText },
  { name: 'image', component: FiImage }
];

// Função para renderizar o ícone selecionado
const renderIcon = (iconName: string, size: number = 18) => {
  const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
  if (iconData) {
    const IconComponent = iconData.component;
    return <IconComponent size={size} />;
  }
  return <FiTag size={size} />; // Fallback para tag
};

// Função utilitária para converter datas do Firebase
const convertFirebaseDate = (date: FirebaseDateType): Date => {
  if (!date) {
    throw new Error('Data inválida');
  }

  // Se for um objeto do Firebase com _seconds
  if (typeof date === 'object' && '_seconds' in date) {
    const timestamp = date as FirebaseTimestamp;
    return new Date(timestamp._seconds * 1000);
  }
  
  // Se for um objeto do Firebase com toDate()
  if (typeof date === 'object' && 'toDate' in date) {
    const firebaseDate = date as FirebaseDate;
    return firebaseDate.toDate();
  }
  
  // Se for uma string
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  // Se já for uma instância de Date
  if (date instanceof Date) {
    return date;
  }
  
  throw new Error('Formato de data não suportado');
};

const IncomesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    gap: var(--spacing-mobile-lg);
    padding: var(--spacing-mobile-md);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-mobile-md);
  }
`;

const Title = styled.h1`
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: var(--spacing-mobile-sm);
    justify-content: stretch;
    
    button {
      flex: 1;
      min-width: 0;
    }
  }
`;

const FiltersSection = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  
  @media (max-width: 768px) {
    padding: var(--spacing-mobile-md);
    border-radius: var(--radius-md);
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
`;


const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const IncomesList = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  overflow: hidden;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
  background-color: var(--gray-50);
`;

const ListTitle = styled.h3`
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHeader = styled.thead`
  background-color: var(--gray-50);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--gray-200);
  
  &:hover {
    background-color: var(--gray-50);
  }
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const TableHeaderCellCenter = styled.th`
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: center;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
`;

const TableCellStatus = styled.td`
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
  text-align: center;
`;

const TableCellCenter = styled.td`
  padding: var(--spacing-md) var(--spacing-lg);
  vertical-align: middle;
  text-align: center;
`;



const StatusBadge = styled.span<{ isReceived: boolean; isPartial?: boolean }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${({ isReceived, isPartial }) => {
    if (isPartial) return 'var(--warning-color)20';
    return isReceived ? 'var(--success-color)20' : 'var(--warning-color)20';
  }};
  color: ${({ isReceived, isPartial }) => {
    if (isPartial) return 'var(--warning-color)';
    return isReceived ? 'var(--success-color)' : 'var(--warning-color)';
  }};
`;

const Amount = styled.span`
  font-weight: 600;
  color: var(--success-color);
`;

const ActionsCell = styled.div`
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 1.1rem;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  
  @media (max-width: 768px) {
    width: 95%;
    max-width: none;
    max-height: 95vh;
    padding: var(--spacing-mobile-lg);
    border-radius: var(--radius-md);
    margin: var(--spacing-mobile-md);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
`;

const ModalTitle = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-mobile-sm);
  }
`;

const DashboardSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-mobile-sm);
    margin-bottom: var(--spacing-mobile-lg);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-mobile-sm);
  }
`;

const DashboardCard = styled.div`
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-50) 100%);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  text-align: center;
  min-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: var(--spacing-mobile-xs);
    min-height: 60px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const DashboardTitle = styled.h3`
  margin: 0 0 2px 0;
  font-size: 0.55rem;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
    margin: 0 0 1px 0;
  }
`;

const DashboardValue = styled.div<{ variant: string }>`
  font-size: 0.95rem;
  font-weight: bold;
  margin-bottom: 2px;
  color: ${({ variant }) => {
    switch (variant) {
      case 'success': return 'var(--success-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--primary-color)';
      default: return 'var(--text-primary)';
    }
  }};
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 1px;
  }
`;

const DashboardSubtitle = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-mobile-sm);
    margin-bottom: var(--spacing-mobile-md);
  }
`;

const FiltersRow2 = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-mobile-sm);
  }
`;

const ClearFiltersButton = styled.button`
  background: none;
  border: 1px solid var(--gray-300);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    border-color: var(--gray-400);
  }
`;

// Navegação por mês
const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--white);
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--gray-100);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--gray-200);
    color: var(--text-primary);
  }
`;

const MonthDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
`;

const FiltersToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px 0;
  font-size: 14px;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const FiltersTitle = styled.span`
  font-weight: 500;
`;

const FiltersContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 12px;
`;

// Cards Mobile Compactos
const MobileIncomeCard = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background: var(--white);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--gray-100);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const MobileCardInfo = styled.div`
  flex: 1;
  margin-right: 32px; /* Espaço para o menu de três pontos */
`;

const MobileCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: var(--gray-100);
  margin-right: 12px;
  flex-shrink: 0;
  color: var(--text-secondary);
`;

const MobileCardTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  margin-right: 12px;
  line-height: 1.2;
`;

const MobileCardCategory = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 2px;
`;

const MobileCardDate = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`;

const MobileCardRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-right: 8px;
`;

const MobileCardAmount = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: var(--success-color);
`;

const MobileCardStatus = styled.span<{ isReceived: boolean }>`
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-block;
  margin-top: 2px;
  background-color: ${props => props.isReceived ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.isReceived ? '#166534' : '#dc2626'};
`;

const MobileCardMenu = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  font-size: 16px;
  line-height: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const MobileMenuDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MobileMenuItem = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;


const Incomes: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Usar dados do contexto global
  const { 
    incomes, 
    categories, 
    subcategories, 
    bankAccounts, 
    isLoading: globalLoading,
    addIncome,
    updateIncome,
    removeIncome,
    refreshIncomes
  } = useData();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    receivedDate: '',
    isPartial: false
  });
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    receivedDate: new Date().toISOString().split('T')[0], // Data atual como padrão
    categoryId: '',
    subcategoryId: '',
    tags: '',
    observations: '',
    isReceived: false,
    bankAccountId: ''
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    description: '',
    categoryId: '',
    subcategoryId: '',
    minAmount: '',
    maxAmount: '',
    dueDate: '',
    isReceived: '',
    selectedMonth: ''
  });

  // Estados para navegação por mês e menu
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Abrir modal automaticamente se o parâmetro openModal estiver presente
  useEffect(() => {
    if (searchParams.get('openModal') === 'true') {
      setIsModalOpen(true);
      // Remover o parâmetro da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('openModal');
      window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    }
  }, [searchParams]);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Filtrar categorias para mostrar apenas categorias de receitas
  const incomeCategories = useMemo(() => {
    return categories.filter((category: any) => category.type === 'income');
  }, [categories]);

  // Filtrar subcategorias baseado na categoria selecionada
  const filteredSubcategories = useMemo(() => {
    if (!formData.categoryId) return [];
    return subcategories.filter((sub: any) => sub.categoryId === formData.categoryId);
  }, [subcategories, formData.categoryId]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((income: any) => {
      // Filtro por descrição
      const matchesDescription = !filters.description || 
        income.description.toLowerCase().includes(filters.description.toLowerCase()) ||
        income.observations?.toLowerCase().includes(filters.description.toLowerCase());
      
      // Filtro por categoria
      const matchesCategory = !filters.categoryId || income.categoryId === filters.categoryId;
      
      // Filtro por subcategoria
      const matchesSubcategory = !filters.subcategoryId || income.subcategoryId === filters.subcategoryId;
      
      // Filtro por valor mínimo
      const matchesMinAmount = !filters.minAmount || income.amount >= parseFloat(filters.minAmount);
      
      // Filtro por valor máximo
      const matchesMaxAmount = !filters.maxAmount || income.amount <= parseFloat(filters.maxAmount);
      
      // Filtro por data
      const matchesDueDate = !filters.dueDate || 
        (income.receivedDate && convertFirebaseDate(income.receivedDate).toISOString().split('T')[0] === filters.dueDate);
      
      // Filtro por status
      const matchesStatus = !filters.isReceived || 
        (filters.isReceived === 'received' && income.isReceived && !income.isPartial) ||
        (filters.isReceived === 'partial' && income.isPartial) ||
        (filters.isReceived === 'pending' && !income.isReceived && !income.isPartial);
      
      // Filtro por mês
      const matchesMonth = !filters.selectedMonth || (() => {
        const incomeDate = convertFirebaseDate(income.receivedDate || income.dueDate);
        const [year, month] = filters.selectedMonth.split('-');
        return incomeDate.getFullYear() === parseInt(year) &&
               incomeDate.getMonth() === (parseInt(month) - 1); // getMonth() retorna 0-11
      })();
      
      return matchesDescription && matchesCategory && matchesSubcategory && 
             matchesMinAmount && matchesMaxAmount && matchesDueDate && matchesStatus && matchesMonth;
    });
  }, [incomes, filters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: FirebaseDateType | null | undefined) => {
    if (!date) return '-';
    
    try {
      const dateObj = convertFirebaseDate(date);
      
      // Verificar se a data é válida
      if (isNaN(dateObj.getTime())) {
        return '-';
      }
      
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data no Incomes:', error, date);
      return '-';
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      receivedDate: new Date().toISOString().split('T')[0], // Data atual como padrão
      categoryId: '',
      subcategoryId: '',
      tags: '',
      observations: '',
      isReceived: false,
      bankAccountId: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ajustar as datas para o fuso horário local
      const adjustDateForTimezone = (dateString: string) => {
        if (!dateString) return dateString;
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
      };

             const incomeData = {
         description: formData.description,
         amount: parseFloat(formData.amount),
         receivedDate: adjustDateForTimezone(formData.receivedDate),
         categoryId: formData.categoryId,
         subcategoryId: formData.subcategoryId || '',
         tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
         observations: formData.observations,
         isReceived: formData.isReceived,
         bankAccountId: formData.bankAccountId
       };

             if (editingIncome) {
         // Atualizar receita existente
         const response = await incomeService.updateIncome(editingIncome.id, incomeData);
         toast.success('Receita atualizada com sucesso!');
         
         // Atualizar dados localmente com conta bancária atualizada
         updateIncome(response.data.income, response.data.updatedBankAccount);
      } else {
        // Criar nova receita
        const response = await incomeService.createIncome(incomeData);
        toast.success('Receita criada com sucesso!');
        
        // Atualizar dados localmente
        addIncome(response.data.income);
      }
      
             // Limpar formulário e fechar modal
       resetForm();
       setEditingIncome(null);
       setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
         }
   };

   const handleEditIncome = (income: Income) => {
     setEditingIncome(income);
     
    // Preencher o formulário com os dados da receita
    const formatDateForInput = (date: FirebaseDateType | null | undefined) => {
      if (!date) return '';
      
      try {
        const dateObj = convertFirebaseDate(date);
        
        // Verificar se a data é válida
        if (isNaN(dateObj.getTime())) {
          return '';
        }
        
        return dateObj.toISOString().split('T')[0];
      } catch (error) {
        console.error('Erro ao formatar data para input:', error, date);
        return '';
      }
    };
     
     setFormData({
       description: income.description,
       amount: income.amount.toString(),
       receivedDate: formatDateForInput(income.receivedDate),
       categoryId: income.categoryId,
       subcategoryId: income.subcategoryId || '',
       tags: income.tags ? income.tags.join(', ') : '',
       observations: income.observations || '',
       isReceived: income.isReceived,
       bankAccountId: income.bankAccountId || ''
     });
     
     setIsModalOpen(true);
   };

   const handleViewIncome = (income: Income) => {
     setViewingIncome(income);
     setIsViewModalOpen(true);
   };

   const handleDeleteIncome = async (income: Income) => {
     if (window.confirm(`Tem certeza que deseja excluir a receita "${income.description}"?`)) {
       try {
         await incomeService.deleteIncome(income.id);
         
        // Atualizar dados localmente
        removeIncome(income.id);
        
        toast.success('Receita excluída com sucesso!');
       } catch (error) {
         console.error('Erro ao excluir receita:', error);
         toast.error('Erro ao excluir receita');
       }
         }
  };

  const handleReceivePayment = (income: Income) => {
    // Se a conta já está totalmente recebida, mostrar mensagem rápida
    if (income.isReceived && !income.isPartial) {
      toast.success('Esta conta já foi totalmente recebida!', { duration: 3000 });
      return;
    }
    
    // Se a conta está parcialmente recebida ou pendente, abrir modal de recebimento
    setViewingIncome(income);
    
    // Calcular o valor padrão (valor restante)
    const remainingAmount = income.amount - (income.partialAmount || 0);
    
    setPaymentData({
      amount: remainingAmount.toString(), // Valor integral restante como padrão
      receivedDate: new Date().toISOString().split('T')[0], // Data atual como padrão
      isPartial: false
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!viewingIncome) return;
    
    try {
      const paymentAmount = parseFloat(paymentData.amount);
      const remainingAmount = viewingIncome.amount - (viewingIncome.partialAmount || 0);
      
      if (paymentAmount > remainingAmount) {
        toast.error(`O valor não pode ser maior que ${formatCurrency(remainingAmount)}`);
        return;
      }
      
      const adjustDateForTimezone = (dateString: string) => {
        if (!dateString) return dateString;
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toISOString().split('T')[0];
      };
      
      const paymentInfo = {
        amount: paymentAmount,
        receivedDate: adjustDateForTimezone(paymentData.receivedDate),
        isPartial: paymentData.isPartial
      };
      
      const response = await incomeService.markAsReceived(viewingIncome.id, paymentInfo);
      
      // Atualizar dados localmente
      updateIncome(response.data.income);
      
      toast.success('Recebimento registrado com sucesso!');
      
      // Fechar modal e limpar dados
      setIsPaymentModalOpen(false);
      setPaymentData({
        amount: '',
        receivedDate: '',
        isPartial: false
      });
      setViewingIncome(null);
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      toast.error('Erro ao registrar recebimento');
    }
  };

  // Funções para filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      description: '',
      categoryId: '',
      subcategoryId: '',
      minAmount: '',
      maxAmount: '',
      dueDate: '',
      isReceived: '',
      selectedMonth: ''
    });
    setCurrentMonth(new Date());
  };

  // Funções para navegação de mês
  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    
    // Atualizar o filtro de mês automaticamente
    const monthString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setFilters(prev => ({ ...prev, selectedMonth: monthString }));
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    
    // Atualizar o filtro de mês automaticamente
    const monthString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setFilters(prev => ({ ...prev, selectedMonth: monthString }));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    
    // Definir o mês atual no filtro
    const monthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setFilters(prev => ({ ...prev, selectedMonth: monthString }));
  };

  const toggleMenu = (incomeId: string) => {
    setOpenMenuId(openMenuId === incomeId ? null : incomeId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };

  const getCategoryName = (categoryId: string) => {
    if (!categoryId) return 'Sem categoria';
    
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const getCategoryIcon = (categoryId: string) => {
    if (!categoryId) return renderIcon('tag');
    
    const category = categories.find(cat => cat.id === categoryId);
    return renderIcon(category?.icon || 'tag');
  };

  // Função para obter nome da subcategoria
  const getSubcategoryName = (subcategoryId: string) => {
    if (!subcategoryId) return '';
    
    const subcategory = subcategories.find((sub: any) => sub.id === subcategoryId);
    return subcategory ? subcategory.name : '';
  };

  // Calcular estatísticas dos filtros
  const dashboardStats = useMemo(() => {
    const totalIncomes = filteredIncomes.length;
    const receivedIncomes = filteredIncomes.filter((income: any) => income.isReceived).length;
    const partialIncomes = filteredIncomes.filter((income: any) => income.isPartial).length;
    const pendingIncomes = filteredIncomes.filter((income: any) => !income.isReceived && !income.isPartial).length;
    
    const totalAmount = filteredIncomes.reduce((sum: number, income: any) => sum + income.amount, 0);
    
    // Valor total recebido: receitas totalmente recebidas + valores parciais das receitas parciais
    const receivedAmount = filteredIncomes
      .filter((income: any) => income.isReceived)
      .reduce((sum: number, income: any) => sum + income.amount, 0) +
      filteredIncomes
        .filter((income: any) => income.isPartial)
        .reduce((sum: number, income: any) => sum + (income.partialAmount || 0), 0);
    
    // Valor total em recebimentos parciais
    const partialAmount = filteredIncomes
      .filter((income: any) => income.isPartial)
      .reduce((sum: number, income: any) => sum + (income.partialAmount || 0), 0);
    
    // Valor total pendente: receitas não recebidas + valores restantes das receitas parciais
    const pendingAmount = filteredIncomes
      .filter((income: any) => !income.isReceived && !income.isPartial)
      .reduce((sum: number, income: any) => sum + income.amount, 0) +
      filteredIncomes
        .filter((income: any) => income.isPartial)
        .reduce((sum: number, income: any) => sum + (income.amount - (income.partialAmount || 0)), 0);
    
    return {
      totalIncomes,
      receivedIncomes,
      partialIncomes,
      pendingIncomes,
      totalAmount,
      receivedAmount,
      partialAmount,
      pendingAmount
    };
  }, [filteredIncomes]);

  if (globalLoading) {
    return <GlobalLoading message="💰 Carregando Receitas" subtitle="Buscando suas receitas..." />;
  }

  return (
    <IncomesContainer>
      <Header>
        <Title>Receitas</Title>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus />
          Nova Receita
        </Button>
      </Header>

      {/* Navegação por mês */}
      <MonthNavigation>
        <NavigationButton onClick={goToPreviousMonth}>
          <FiChevronLeft />
        </NavigationButton>
        
        <MonthDisplay>
          <span>{formatMonthYear(currentMonth)}</span>
          <NavigationButton onClick={goToToday}>
            Hoje
          </NavigationButton>
        </MonthDisplay>
        
        <NavigationButton onClick={goToNextMonth}>
          <FiChevronRight />
        </NavigationButton>
      </MonthNavigation>

      <DashboardSection>
        <DashboardCard>
          <DashboardTitle>Total de Receitas</DashboardTitle>
          <DashboardValue variant="info">{dashboardStats.totalIncomes}</DashboardValue>
          <DashboardSubtitle>{formatCurrency(dashboardStats.totalAmount)}</DashboardSubtitle>
        </DashboardCard>
        
        <DashboardCard>
          <DashboardTitle>Valor Total Recebido</DashboardTitle>
          <DashboardValue variant="success">{dashboardStats.receivedIncomes + dashboardStats.partialIncomes}</DashboardValue>
          <DashboardSubtitle>{formatCurrency(dashboardStats.receivedAmount)}</DashboardSubtitle>
        </DashboardCard>
        
        <DashboardCard>
          <DashboardTitle>Valor em Recebimentos Parciais</DashboardTitle>
          <DashboardValue variant="warning">{dashboardStats.partialIncomes}</DashboardValue>
          <DashboardSubtitle>{formatCurrency(dashboardStats.partialAmount)}</DashboardSubtitle>
        </DashboardCard>
        
        <DashboardCard>
          <DashboardTitle>Valor Total Pendente</DashboardTitle>
          <DashboardValue variant="warning">{dashboardStats.pendingIncomes}</DashboardValue>
          <DashboardSubtitle>{formatCurrency(dashboardStats.pendingAmount)}</DashboardSubtitle>
        </DashboardCard>
      </DashboardSection>

      <FiltersSection>
        <FiltersToggle onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
          <FiFilter />
          <FiltersTitle>Filtros</FiltersTitle>
          {isFiltersOpen ? <FiChevronUp /> : <FiChevronDown />}
        </FiltersToggle>
        
        <FiltersContent isOpen={isFiltersOpen}>
          <FiltersRow>
            <Select
              value={filters.categoryId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('categoryId', e.target.value)}
              fullWidth
            >
              <option value="">Todas as categorias</option>
              {incomeCategories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={filters.isReceived}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('isReceived', e.target.value)}
              fullWidth
            >
              <option value="">Todos os status</option>
              <option value="received">Recebido</option>
              <option value="partial">Recebido Parcial</option>
              <option value="pending">Pendente</option>
            </Select>
          </FiltersRow>
           
          <FiltersRow2>
            <Input
              type="number"
              placeholder="Valor mínimo"
              value={filters.minAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('minAmount', e.target.value)}
              fullWidth
              step="0.01"
              min="0"
            />
            
            <Input
              type="number"
              placeholder="Valor máximo"
              value={filters.maxAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('maxAmount', e.target.value)}
              fullWidth
              step="0.01"
              min="0"
            />
            
            <Input
              type="date"
              placeholder="Data de recebimento"
              value={filters.dueDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('dueDate', e.target.value)}
              fullWidth
            />
            
            <Input
              type="text"
              placeholder="Pesquisar receitas..."
              value={filters.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('description', e.target.value)}
              fullWidth
            />
          </FiltersRow2>
          
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <ClearFiltersButton 
              type="button" 
              onClick={clearFilters}
            >
              Limpar Filtros
            </ClearFiltersButton>
          </div>
        </FiltersContent>
      </FiltersSection>

      <IncomesList>
        <ListHeader>
          <ListTitle>Lista de Receitas ({filteredIncomes.length})</ListTitle>
        </ListHeader>

        {filteredIncomes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Nenhuma receita encontrada
          </div>
        ) : (
          <Table>
            <TableHeader>
                             <TableRow>
                 <TableHeaderCell>Descrição</TableHeaderCell>
                 <TableHeaderCell>Categoria</TableHeaderCell>
                 <TableHeaderCellCenter>Valor</TableHeaderCellCenter>
                 <TableHeaderCellCenter>Data Recebimento</TableHeaderCellCenter>
                 <TableHeaderCellCenter>Status</TableHeaderCellCenter>
                 <TableHeaderCellCenter>Conta Bancária</TableHeaderCellCenter>
                 <TableHeaderCellCenter>Ações</TableHeaderCellCenter>
               </TableRow>
            </TableHeader>
            <tbody>npm 
              {filteredIncomes.map((income: any) => (
                <TableRow key={income.id}>
                                    <TableCell>
                    <div>
                      <div style={{ fontWeight: 500 }}>{income.description}</div>
                      {income.observations && (
                        <small style={{ color: 'var(--text-secondary)' }}>
                          {income.observations}
                        </small>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{categories.find((cat: any) => cat.id === income.categoryId)?.name || income.categoryId}</div>
                      {income.subcategoryId && (
                        <small style={{ color: 'var(--text-secondary)' }}>
                          {getSubcategoryName(income.subcategoryId)}
                        </small>
                      )}
                    </div>
                  </TableCell>
                                                                                                                 <TableCellCenter>
                       <div>
                         <Amount>{formatCurrency(income.amount)}</Amount>
                         {income.isPartial && income.partialAmount && (
                           <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginTop: '2px' }}>
                             Restante: {formatCurrency(income.amount - income.partialAmount)}
                           </div>
                         )}
                       </div>
                     </TableCellCenter>
                                         <TableCellCenter>{formatDate(income.receivedDate)}</TableCellCenter>
                                                                              <TableCellStatus>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                                                   <StatusBadge isReceived={income.isReceived} isPartial={income.isPartial}>
                             {income.isPartial ? 'Recebido Parcial' : 
                              income.isReceived ? 'Recebido' : 'Pendente'}
                           </StatusBadge>

                        </div>
                                        </TableCellStatus>
                  <TableCellCenter>
                    <div>
                      {income.bankAccountId ? 
                        bankAccounts.find((acc: any) => acc.id === income.bankAccountId)?.name || 'N/A' : 
                        'Não informado'
                      }
                    </div>
                  </TableCellCenter>
                  <TableCellCenter>
                      <ActionsCell>
                        <ActionButton 
                          title={income.isReceived && !income.isPartial ? 'Conta Já Recebida' : 'Receber Pagamento'}
                          onClick={() => handleReceivePayment(income)}
                          style={{ 
                            color: income.isReceived && !income.isPartial ? 'var(--text-secondary)' : 'var(--success-color)',
                            opacity: income.isReceived && !income.isPartial ? 0.6 : 1
                          }}
                        >
                          <FiDollarSign />
                        </ActionButton>
                        <ActionButton 
                          title="Visualizar"
                          onClick={() => handleViewIncome(income)}
                        >
                          <FiEye />
                        </ActionButton>
                        <ActionButton 
                          title="Editar"
                          onClick={() => handleEditIncome(income)}
                        >
                          <FiEdit />
                        </ActionButton>
                        <ActionButton 
                          title="Excluir"
                          onClick={() => handleDeleteIncome(income)}
                        >
                          <FiTrash2 />
                        </ActionButton>
                      </ActionsCell>
                    </TableCellCenter>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
        
        {/* Cards Mobile */}
        <div className="mobile-only">
          {filteredIncomes.map((income: any) => (
            <MobileIncomeCard 
              key={income.id}
              onClick={() => handleViewIncome(income)}
            >
              <MobileCardHeader>
                <MobileCardIcon>
                  {getCategoryIcon(income.categoryId)}
                </MobileCardIcon>
                <MobileCardInfo>
                  <MobileCardTitle>{income.description}</MobileCardTitle>
                  <MobileCardCategory>{getCategoryName(income.categoryId)}</MobileCardCategory>
                  <MobileCardDate>{formatDate(income.receivedDate || income.dueDate)}</MobileCardDate>
                </MobileCardInfo>
                <MobileCardRight>
                  <MobileCardAmount>{formatCurrency(income.amount)}</MobileCardAmount>
                  <MobileCardStatus isReceived={income.isReceived || false}>
                    {income.isPartial ? 'Parcial' : 
                     income.isReceived ? 'Recebido' : 'Pendente'}
                  </MobileCardStatus>
                </MobileCardRight>
              </MobileCardHeader>
              
              <MobileCardMenu>
                <MobileMenuButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(income.id);
                  }}
                >
                  ⋮
                </MobileMenuButton>
                <MobileMenuDropdown isOpen={openMenuId === income.id}>
                  <MobileMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditIncome(income);
                      closeMenu();
                    }}
                  >
                    <FiEdit style={{ marginRight: '8px' }} />
                    Editar
                  </MobileMenuItem>
                  <MobileMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIncome(income);
                      closeMenu();
                    }}
                    style={{ color: 'var(--error-color)' }}
                  >
                    <FiTrash2 style={{ marginRight: '8px' }} />
                    Excluir
                  </MobileMenuItem>
                </MobileMenuDropdown>
              </MobileCardMenu>
            </MobileIncomeCard>
          ))}
        </div>
      </IncomesList>

             <Modal isOpen={isModalOpen}>
         <ModalContent>
           <ModalHeader>
             <ModalTitle>{editingIncome ? 'Editar Receita' : 'Nova Receita'}</ModalTitle>
                           <CloseButton onClick={() => {
                setIsModalOpen(false);
                resetForm();
                setEditingIncome(null);
              }}>×</CloseButton>
           </ModalHeader>
           
                       <Form onSubmit={handleSubmit}>
              <FormRow>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Descrição da Receita *
                  </label>
                  <Input
                    type="text"
                    placeholder="Descrição da receita"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Valor *
                  </label>
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={formData.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('amount', e.target.value)}
                    fullWidth
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
              </FormRow>
             
                           <FormRow>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Data de Recebimento *
                  </label>
                  <Input
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('receivedDate', e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Categoria *
                  </label>
                  <Select 
                    value={formData.categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('categoryId', e.target.value)}
                    fullWidth 
                    required
                  >
                    <option value="">Selecione a categoria</option>
                    {incomeCategories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </FormRow>
             
                           <FormRow>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Subcategoria
                  </label>
                  <Select 
                    value={formData.subcategoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('subcategoryId', e.target.value)}
                    fullWidth
                  >
                    <option value="">Selecione a subcategoria (opcional)</option>
                    {filteredSubcategories.map((subcategory: any) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Conta Bancária
                  </label>
                  <Select 
                    value={formData.bankAccountId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('bankAccountId', e.target.value)}
                    fullWidth
                  >
                    <option value="">Selecione a conta bancária (opcional)</option>
                    {bankAccounts.map((account: any) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </FormRow>
             
              <FormRow>
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                    Tags
                  </label>
                  <Input
                    type="text"
                    placeholder="Tags (separadas por vírgula)"
                    value={formData.tags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tags', e.target.value)}
                    fullWidth
                  />
                </div>
              </FormRow>
             
                           <FormRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <input
                    type="checkbox"
                    id="isReceived"
                    checked={formData.isReceived}
                    onChange={(e) => handleInputChange('isReceived', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isReceived" style={{ margin: 0, cursor: 'pointer' }}>
                    Receita já foi recebida
                  </label>
                </div>
              </FormRow>
              
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                  Observações
                </label>
                <TextArea
                  placeholder="Observações (opcional)"
                  value={formData.observations}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('observations', e.target.value)}
                  fullWidth
                />
              </div>
             
             <FormActions>
                               <Button variant="outline" onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                  setEditingIncome(null);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIncome ? 'Atualizar Receita' : 'Salvar Receita'}
                </Button>
             </FormActions>
           </Form>
                   </ModalContent>
        </Modal>

        {/* Modal de Visualização */}
        <Modal isOpen={isViewModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Detalhes da Receita</ModalTitle>
              <CloseButton onClick={() => {
                setIsViewModalOpen(false);
                setViewingIncome(null);
              }}>×</CloseButton>
            </ModalHeader>
            
                         {viewingIncome && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                 {/* Header com valor e status */}
                 <div style={{ 
                   background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
                   color: 'white',
                   padding: 'var(--spacing-lg)',
                   borderRadius: 'var(--radius-lg)',
                   textAlign: 'center'
                 }}>
                   <h3 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '1.5rem' }}>
                     {viewingIncome.description}
                   </h3>
                   <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
                     {formatCurrency(viewingIncome.amount)}
                   </div>
                                       <StatusBadge isReceived={viewingIncome.isReceived} isPartial={viewingIncome.isPartial} style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontSize: '0.875rem',
                      padding: 'var(--spacing-sm) var(--spacing-md)'
                    }}>
                      {viewingIncome.isPartial ? 'Recebido Parcial' : 
                       viewingIncome.isReceived ? 'Recebido' : 'Pendente'}
                    </StatusBadge>
                 </div>

                                   {/* Informações detalhadas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Data de Recebimento
                      </h4>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                        {formatDate(viewingIncome.receivedDate)}
                      </p>
                    </div>
                    
                    {viewingIncome.isPartial && viewingIncome.partialAmount && (
                      <div>
                        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Valor Recebido / Restante
                        </h4>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                          {formatCurrency(viewingIncome.partialAmount)} / {formatCurrency(viewingIncome.amount - viewingIncome.partialAmount)}
                        </p>
                      </div>
                    )}
                   
                   <div>
                     <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                       Categoria
                     </h4>
                     <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                       {categories.find((cat: any) => cat.id === viewingIncome.categoryId)?.name || viewingIncome.categoryId}
                     </p>
                   </div>
                   
                   {viewingIncome.subcategoryId && (
                     <div>
                       <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                         Subcategoria
                       </h4>
                       <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                         {subcategories.find((sub: any) => sub.id === viewingIncome.subcategoryId)?.name || viewingIncome.subcategoryId}
                       </p>
                     </div>
                   )}
                   
                   <div>
                     <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                       Conta Bancária
                     </h4>
                     <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                       {viewingIncome.bankAccountId ? 
                         bankAccounts.find((acc: any) => acc.id === viewingIncome.bankAccountId)?.name || 'N/A' : 
                         'Não informado'
                       }
                     </p>
                   </div>
                   
                   {viewingIncome.tags && viewingIncome.tags.length > 0 && (
                     <div>
                       <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                         Tags
                       </h4>
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                         {viewingIncome.tags.map((tag, index) => (
                           <span key={index} style={{
                             background: 'var(--gray-100)',
                             color: 'var(--text-secondary)',
                             padding: 'var(--spacing-xs) var(--spacing-sm)',
                             borderRadius: 'var(--radius-full)',
                             fontSize: '0.75rem'
                           }}>
                             {tag}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

                 {/* Observações */}
                 {viewingIncome.observations && (
                   <div>
                     <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                       Observações
                     </h4>
                     <p style={{ 
                       margin: 0, 
                       padding: 'var(--spacing-md)', 
                       background: 'var(--gray-50)', 
                       borderRadius: 'var(--radius-md)',
                       border: '1px solid var(--gray-200)'
                     }}>
                       {viewingIncome.observations}
                     </p>
                   </div>
                 )}

                                   {/* Histórico de recebimentos */}
                  {viewingIncome.paymentLogs && viewingIncome.paymentLogs.length > 0 && (
                    <div>
                      <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Histórico de Recebimentos
                      </h4>
                      <div style={{ 
                        background: 'var(--gray-50)', 
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-200)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {viewingIncome.paymentLogs.map((payment, index) => (
                          <div key={index} style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderBottom: index < viewingIncome.paymentLogs!.length - 1 ? '1px solid var(--gray-200)' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>
                                {formatCurrency(payment.amount)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {formatDate(payment.date)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Restante antes: {formatCurrency(payment.remainingBefore)} | 
                                Restante depois: {formatCurrency(payment.remainingAfter)}
                              </div>
                            </div>
                            <StatusBadge isReceived={true} style={{ fontSize: '0.75rem' }}>
                              {payment.type === 'full' ? 'Recebido Total' : 
                               payment.type === 'partial' ? 'Recebido Parcial' : 'Recebido Final'}
                            </StatusBadge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                 
                 <FormActions>
                   <Button variant="outline" onClick={() => {
                     setIsViewModalOpen(false);
                     setViewingIncome(null);
                   }}>
                     Fechar
                   </Button>
                 </FormActions>
               </div>
             )}
          </ModalContent>
                 </Modal>

        {/* Modal de Recebimento */}
        <Modal isOpen={isPaymentModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Registrar Recebimento</ModalTitle>
              <CloseButton onClick={() => {
                setIsPaymentModalOpen(false);
                setPaymentData({
                  amount: '',
                  receivedDate: '',
                  isPartial: false
                });
                setViewingIncome(null);
              }}>×</CloseButton>
            </ModalHeader>
            
            {viewingIncome && (
              <div>
                <div style={{ 
                  background: 'var(--gray-50)', 
                  padding: 'var(--spacing-md)', 
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-secondary)' }}>
                    Receita: {viewingIncome.description}
                  </h4>
                                     <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                     Valor Total: {formatCurrency(viewingIncome.amount)}
                   </div>
                   {viewingIncome.isPartial && viewingIncome.partialAmount && viewingIncome.partialAmount > 0 && (
                     <div style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                       Já recebido: {formatCurrency(viewingIncome.partialAmount)}
                     </div>
                   )}
                   {viewingIncome.isPartial && viewingIncome.partialAmount && viewingIncome.partialAmount > 0 && (
                     <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--warning-color)' }}>
                       Restante: {formatCurrency(viewingIncome.amount - viewingIncome.partialAmount)}
                     </div>
                   )}
                </div>

                <Form onSubmit={handlePaymentSubmit}>
                  <FormRow>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                        Valor a Receber *
                      </label>
                      <Input
                        type="number"
                        placeholder="Valor"
                        value={paymentData.amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({
                          ...prev,
                          amount: e.target.value
                        }))}
                        fullWidth
                        required
                        step="0.01"
                        min="0"
                        max={viewingIncome.amount - (viewingIncome.partialAmount || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: '500' }}>
                        Data de Recebimento *
                      </label>
                      <Input
                        type="date"
                        value={paymentData.receivedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({
                          ...prev,
                          receivedDate: e.target.value
                        }))}
                        fullWidth
                        required
                      />
                    </div>
                  </FormRow>

                  <FormRow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <input
                        type="checkbox"
                        id="isPartial"
                        checked={paymentData.isPartial}
                        onChange={(e) => setPaymentData(prev => ({
                          ...prev,
                          isPartial: e.target.checked
                        }))}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <label htmlFor="isPartial" style={{ margin: 0, cursor: 'pointer' }}>
                        Recebimento parcial
                      </label>
                    </div>
                  </FormRow>

                  <FormActions>
                    <Button variant="outline" onClick={() => {
                      setIsPaymentModalOpen(false);
                      setPaymentData({
                        amount: '',
                        receivedDate: '',
                        isPartial: false
                      });
                      setViewingIncome(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Registrar Recebimento
                    </Button>
                  </FormActions>
                </Form>
              </div>
            )}
          </ModalContent>
        </Modal>
      </IncomesContainer>
    );
  };

export default Incomes;
