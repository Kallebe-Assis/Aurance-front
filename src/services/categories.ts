import api from './api';

// Serviços de categorias
export const categoryService = {
  // Listar categorias
  getCategories: async (type?: 'expense' | 'income') => {
    const response = await api.get('/categories', { params: { type } });
    return response.data;
  },

  // Criar categoria
  createCategory: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Atualizar categoria
  updateCategory: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Deletar categoria
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

// Serviços de subcategorias
export const subcategoryService = {
  // Listar subcategorias
  getSubcategories: async (categoryId?: string) => {
    const response = await api.get('/subcategories', { params: { categoryId } });
    return response.data;
  },

  // Criar subcategoria
  createSubcategory: async (subcategoryData: any) => {
    const response = await api.post('/subcategories', subcategoryData);
    return response.data;
  },

  // Atualizar subcategoria
  updateSubcategory: async (id: string, subcategoryData: any) => {
    const response = await api.put(`/subcategories/${id}`, subcategoryData);
    return response.data;
  },

  // Deletar subcategoria
  deleteSubcategory: async (id: string) => {
    const response = await api.delete(`/subcategories/${id}`);
    return response.data;
  }
};
