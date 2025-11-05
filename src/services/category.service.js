import { supabase } from '../lib/supabase';

// Normaliza nombres para coincidencia robusta (minúsculas, sin acentos, espacios únicos)
function normalizeName(name = '') {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Resuelve la tabla por nombre de categoría (incluye sinónimos en español)
export function resolveSpecTableByCategoryName(rawName = '') {
  const n = normalizeName(rawName);

  // Motherboard
  if (/\b(mother ?board|placa ?base|placa ?madre|motherboards|placas ?bases|placas ?madres)\b/.test(n)) {
    return 'motherboard_specifications';
  }
  // GPU / Tarjeta gráfica
  if (/\b(gpu|tarjeta(s)? grafica(s)?|grafica|graficas|video)\b/.test(n)) {
    return 'gpu_specifications';
  }
  // RAM
  if (/\b(ram|memoria ram|memoria)\b/.test(n)) {
    return 'ram_specifications';
  }
  // CPU
  if (/\b(cpu|procesador|cpus|procesadores)\b/.test(n)) {
    return 'cpu_specifications';
  }
  // Almacenamiento
  if (/\b(storage|almacenamiento|disco|ssd|hdd)\b/.test(n)) {
    return 'storage_specifications';
  }
  // Fuente de poder
  if (/\b(psu|fuente de poder|fuente|power supply)\b/.test(n)) {
    return 'psu_specifications';
  }
  // Refrigeración
  if (/\b(cooler|disipador|refrigeracion|ventilador|heatsink|liquida)\b/.test(n)) {
    return 'cooler_specifications';
  }
  // Gabinete
  if (/\b(case|gabinete|torre|chasis)\b/.test(n)) {
    return 'case_specifications';
  }
  // Monitor
  if (/\b(monitor|pantalla|display)\b/.test(n)) {
    return 'monitor_specifications';
  }
  // Portátil
  if (/\b(laptop|portatil|notebook)\b/.test(n)) {
    return 'laptop_specifications';
  }
  // Teléfono
  if (/\b(phone|telefono|smartphone|movil|celular)\b/.test(n)) {
    return 'phone_specifications';
  }
  // Periférico
  if (/\b(peripheral|periferico|teclado|mouse|raton|audifonos|auriculares)\b/.test(n)) {
    return 'peripheral_specifications';
  }
  // Cable
  if (/\b(cable|cables)\b/.test(n)) {
    return 'cable_specifications';
  }
  // Fallback
  return 'other_specifications';
}

class CategoryService {
  // Obtener todas las categorías disponibles
  static async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name');

      if (error) {
        console.error('Error obteniendo categorías:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en getCategories:', error);
      throw error;
    }
  }
}

export default CategoryService;