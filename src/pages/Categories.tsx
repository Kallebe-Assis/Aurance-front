import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTag, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiFolder, FiFolderPlus } from 'react-icons/fi';
import { categoryService, subcategoryService } from '../services/api';
import { Category, Subcategory } from '../types';
import Button from '../components/common/Button';
import { GlobalLoading } from '../components/GlobalLoading';
import toast from 'react-hot-toast';

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

const FiltersContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  background-color: ${({ active }) => active ? 'var(--primary-color)' : 'var(--white)'};
  color: ${({ active }) => active ? 'var(--white)' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ active }) => active ? 'var(--primary-dark)' : 'var(--gray-50)'};
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
`;

const CategoryCard = styled.div`
  background-color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const CategoryIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background-color: ${({ color }) => color}20;
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const CategoryName = styled.h3`
  margin: 0;
  color: var(--text-primary);
`;

const CategoryType = styled.span<{ type: string }>`
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  background-color: ${({ type }) => type === 'expense' ? 'var(--error-color)20' : 'var(--success-color)20'};
  color: ${({ type }) => type === 'expense' ? 'var(--error-color)' : 'var(--success-color)'};
  width: fit-content;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--gray-100);
    color: var(--text-primary);
  }
`;

const SubcategoriesSection = styled.div`
  margin-top: var(--spacing-md);
`;

const SubcategoriesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--gray-50);
  }
`;

const SubcategoriesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--text-primary);
`;

const SubcategoriesCount = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  background-color: var(--gray-100);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
`;

const SubcategoriesList = styled.div<{ isExpanded: boolean }>`
  display: ${({ isExpanded }) => isExpanded ? 'flex' : 'none'};
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
`;

const SubcategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background-color: var(--gray-50);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
`;

const SubcategoryName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const SubcategoryActions = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
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
  padding: var(--spacing-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
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

const ColorPicker = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color)20;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
`;

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Estados para modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Estados para formulários
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense' as 'expense' | 'income',
    color: '#3b82f6',
    icon: 'tag'
  });
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    categoryId: ''
  });

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, subcategoriesResponse] = await Promise.all([
          categoryService.getCategories(),
          subcategoryService.getSubcategories()
        ]);
        
        setCategories(categoriesResponse.data.categories || []);
        setSubcategories(subcategoriesResponse.data.subcategories || []);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        toast.error('Erro ao carregar categorias');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar categorias
  const filteredCategories = categories.filter(category => {
    if (filter === 'all') return true;
    return category.type === filter;
  });

  // Obter subcategorias de uma categoria
  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  // Toggle expandir categoria
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Abrir modal de categoria
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        icon: 'tag'
      });
    }
    setIsCategoryModalOpen(true);
  };

  // Abrir modal de subcategoria
  const openSubcategoryModal = (categoryId: string, subcategory?: Subcategory) => {
    setSelectedCategoryId(categoryId);
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        name: subcategory.name,
        categoryId: subcategory.categoryId
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm({
        name: '',
        categoryId
      });
    }
    setIsSubcategoryModalOpen(true);
  };

  // Salvar categoria
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryForm);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoryService.createCategory(categoryForm);
        toast.success('Categoria criada com sucesso!');
      }
      
      // Recarregar dados
      const response = await categoryService.getCategories();
      setCategories(response.data.categories || []);
      
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  // Salvar subcategoria
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await subcategoryService.updateSubcategory(editingSubcategory.id, subcategoryForm);
        toast.success('Subcategoria atualizada com sucesso!');
      } else {
        await subcategoryService.createSubcategory(subcategoryForm);
        toast.success('Subcategoria criada com sucesso!');
      }
      
      // Recarregar dados
      const response = await subcategoryService.getSubcategories();
      setSubcategories(response.data.subcategories || []);
      
      setIsSubcategoryModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      toast.error('Erro ao salvar subcategoria');
    }
  };

  // Excluir categoria
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await categoryService.deleteCategory(categoryId);
      toast.success('Categoria excluída com sucesso!');
      
      // Recarregar dados
      const response = await categoryService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  // Excluir subcategoria
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta subcategoria?')) return;
    
    try {
      await subcategoryService.deleteSubcategory(subcategoryId);
      toast.success('Subcategoria excluída com sucesso!');
      
      // Recarregar dados
      const response = await subcategoryService.getSubcategories();
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      toast.error('Erro ao excluir subcategoria');
    }
  };

  if (loading) {
    return <GlobalLoading message="🏷️ Carregando Categorias" subtitle="Buscando suas categorias..." />;
  }

  return (
    <CategoriesContainer>
      <Header>
        <Title>Categorias e Subcategorias</Title>
        <Button onClick={() => openCategoryModal()}>
          <FiPlus />
          Nova Categoria
        </Button>
      </Header>

      <FiltersContainer>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          Todas
        </FilterButton>
        <FilterButton 
          active={filter === 'expense'} 
          onClick={() => setFilter('expense')}
        >
          Despesas
        </FilterButton>
        <FilterButton 
          active={filter === 'income'} 
          onClick={() => setFilter('income')}
        >
          Receitas
        </FilterButton>
      </FiltersContainer>

      {filteredCategories.length === 0 ? (
        <EmptyState>
          <FiTag size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
          <h3>Nenhuma categoria encontrada</h3>
          <p>Crie sua primeira categoria para organizar suas transações.</p>
        </EmptyState>
      ) : (
        <CategoriesGrid>
          {filteredCategories.map((category) => {
            const categorySubcategories = getSubcategoriesForCategory(category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <CategoryCard key={category.id}>
                <CategoryHeader>
                  <CategoryInfo>
                    <CategoryIcon color={category.color}>
                      <FiTag />
                    </CategoryIcon>
                    <CategoryDetails>
                      <CategoryName>{category.name}</CategoryName>
                      <CategoryType type={category.type}>
                        {category.type === 'expense' ? 'Despesa' : 'Receita'}
                      </CategoryType>
                    </CategoryDetails>
                  </CategoryInfo>
                  <CategoryActions>
                    <ActionButton 
                      title="Editar categoria"
                      onClick={() => openCategoryModal(category)}
                    >
                      <FiEdit />
                    </ActionButton>
                    <ActionButton 
                      title="Excluir categoria"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </CategoryActions>
                </CategoryHeader>

                <SubcategoriesSection>
                  <SubcategoriesHeader onClick={() => toggleCategoryExpansion(category.id)}>
                    <SubcategoriesTitle>
                      {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                      <FiFolder />
                      Subcategorias
                      <SubcategoriesCount>{categorySubcategories.length}</SubcategoriesCount>
                    </SubcategoriesTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e?.stopPropagation();
                        openSubcategoryModal(category.id);
                      }}
                    >
                      <FiFolderPlus />
                      Nova
                    </Button>
                  </SubcategoriesHeader>

                  <SubcategoriesList isExpanded={isExpanded}>
                    {categorySubcategories.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                        Nenhuma subcategoria
                      </div>
                    ) : (
                      categorySubcategories.map((subcategory) => (
                        <SubcategoryItem key={subcategory.id}>
                          <SubcategoryName>{subcategory.name}</SubcategoryName>
                          <SubcategoryActions>
                            <ActionButton 
                              title="Editar subcategoria"
                              onClick={() => openSubcategoryModal(category.id, subcategory)}
                            >
                              <FiEdit />
                            </ActionButton>
                            <ActionButton 
                              title="Excluir subcategoria"
                              onClick={() => handleDeleteSubcategory(subcategory.id)}
                            >
                              <FiTrash2 />
                            </ActionButton>
                          </SubcategoryActions>
                        </SubcategoryItem>
                      ))
                    )}
                  </SubcategoriesList>
                </SubcategoriesSection>
              </CategoryCard>
            );
          })}
        </CategoriesGrid>
      )}

      {/* Modal de Categoria */}
      <Modal isOpen={isCategoryModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </ModalTitle>
            <CloseButton onClick={() => setIsCategoryModalOpen(false)}>×</CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleSaveCategory}>
            <FormGroup>
              <Label>Nome da Categoria</Label>
              <Input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Alimentação"
                required
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label>Tipo</Label>
                <Select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'expense' | 'income' })}
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Cor</Label>
                <ColorPicker
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </FormGroup>
            </FormRow>
            
            <FormActions>
              <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCategory ? 'Atualizar' : 'Criar'} Categoria
              </Button>
            </FormActions>
          </Form>
        </ModalContent>
      </Modal>

      {/* Modal de Subcategoria */}
      <Modal isOpen={isSubcategoryModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
            </ModalTitle>
            <CloseButton onClick={() => setIsSubcategoryModalOpen(false)}>×</CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleSaveSubcategory}>
            <FormGroup>
              <Label>Nome da Subcategoria</Label>
              <Input
                type="text"
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                placeholder="Ex: Supermercado"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Categoria</Label>
              <Select
                value={subcategoryForm.categoryId}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, categoryId: e.target.value })}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.type === 'expense' ? 'Despesa' : 'Receita'})
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormActions>
              <Button variant="outline" onClick={() => setIsSubcategoryModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingSubcategory ? 'Atualizar' : 'Criar'} Subcategoria
              </Button>
            </FormActions>
          </Form>
        </ModalContent>
      </Modal>
    </CategoriesContainer>
  );
};

export default Categories;
