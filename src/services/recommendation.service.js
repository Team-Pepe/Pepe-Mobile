import { supabase } from '../lib/supabase';
import ProductService from './product.service';
import CategoryService from './category.service';

class RecommendationService {
  // Detecta categorías de componentes de PC por nombre
  static async getPcCategoryIds() {
    const cats = await CategoryService.getCategories();
    const needles = ['cpu', 'procesador', 'gpu', 'gráfica', 'tarjeta', 'video', 'ram', 'memoria', 'motherboard', 'placa', 'mainboard', 'almacenamiento', 'ssd', 'hdd', 'disco', 'psu', 'fuente', 'power', 'gabinete', 'case', 'cooler', 'refrigeración', 'cooling'];
    return (cats || [])
      .filter((c) => needles.some((n) => (c.name || '').toLowerCase().includes(n)))
      .map((c) => c.id);
  }

  // Recomendaciones iniciales: últimos publicados en stock de categorías PC
  static async getRecommendedForUser(userId = null, { limit = 12 } = {}) {
    const pcIds = await this.getPcCategoryIds();

    if (!pcIds || pcIds.length === 0) {
      // Fallback: usa el catálogo completo
      const all = await ProductService.getAllProducts();
      return (all || []).slice(0, limit);
    }

    let query = supabase
      .from('products')
      .select(`*, categories(id, name)`) // join de categoría
      .in('category_id', pcIds)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Búsqueda global: todos los componentes publicados (en stock)
  static async searchAll(query, { limit = 100 } = {}) {
    const filters = {};
    if (query && query.trim()) filters.search = query.trim();
    const data = await ProductService.getAllProducts(filters);
    return (data || []).slice(0, limit);
  }

  // Listado completo para catálogo general
  static async listAll({ limit = 100 } = {}) {
    const data = await ProductService.getAllProducts();
    return (data || []).slice(0, limit);
  }
}

export default RecommendationService;