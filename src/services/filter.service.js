import ProductService from './product.service';

// Servicio de filtración por categoría
// Envuelve ProductService.getAllProducts para consultas por category_id y búsqueda opcional
const FilterService = {
  listByCategory: async (category_id, options = {}) => {
    if (!category_id) return [];
    const params = { category_id, ...options };
    return ProductService.getAllProducts(params);
  },

  searchByCategory: async (category_id, query, options = {}) => {
    if (!category_id || !query || !query.trim()) return [];
    const params = { category_id, search: query.trim(), ...options };
    return ProductService.getAllProducts(params);
  },
};

export default FilterService;