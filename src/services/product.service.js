import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';

// Campos válidos por tabla de especificaciones (alineado al esquema SQL)
const validFieldsMap = {
  cpu_specifications: [
    'socket', 'cores', 'threads', 'base_frequency_ghz', 'boost_frequency_ghz', 
    'cache_l3', 'tdp', 'integrated_graphics', 'fabrication_technology_nm'
  ],
  gpu_specifications: [
    'vram_gb', 'vram_type', 'cuda_cores', 'base_frequency_mhz', 'boost_frequency_mhz', 
    'bandwidth_gbs', 'power_connectors', 'length_mm', 'video_outputs'
  ],
  ram_specifications: [
    'capacity_gb', 'type', 'speed_mhz', 'latency', 'modules', 'voltage', 'heat_spreader', 'rgb_lighting'
  ],
  motherboard_specifications: [
    'socket', 'chipset', 'form_factor', 'ram_slots', 'ram_type', 'm2_ports', 'sata_ports', 'usb_ports', 'audio', 'network'
  ],
  storage_specifications: [
    'type', 'capacity_gb', 'interface', 'read_speed_mbs', 'write_speed_mbs', 'form_factor', 'nand_type', 'tbw'
  ],
  psu_specifications: [
    'power_w', 'efficiency_certification', 'modular_type', 'form_factor', 'connectors', 'fan_size_mm', 'active_pfc'
  ],
  case_specifications: [
    'motherboard_formats', 'bays_35', 'bays_25', 'expansion_slots', 'max_gpu_length_mm', 'max_cooler_height_mm', 'psu_type', 'included_fans', 'material'
  ],
  cooler_specifications: [
    'cooler_type', 'compatible_sockets', 'height_mm', 'rpm_range', 'noise_level_db', 'tdp_w'
  ],
  monitor_specifications: [
    'screen_inches', 'resolution', 'refresh_rate_hz', 'panel_type', 'response_time_ms', 'connectors', 'curved'
  ],
  peripheral_specifications: [
    'peripheral_type', 'connectivity', 'mouse_sensor', 'keyboard_switches', 'response_frequency_hz', 'noise_cancellation', 'microphone_type'
  ],
  cable_specifications: [
    'cable_type', 'length_m', 'connectors', 'version', 'shielded'
  ],
  laptop_specifications: [
    'processor', 'ram_gb', 'storage', 'screen_inches', 'resolution', 'graphics_card', 'weight_kg', 'battery_wh', 'operating_system'
  ],
  phone_specifications: [
    'screen_inches', 'resolution', 'processor', 'ram_gb', 'storage_gb', 'main_camera_mp', 'battery_mah', 'operating_system'
  ],
  other_specifications: [
    'general_specifications'
  ]
};

// Campos requeridos por tabla (respeta NOT NULL en SQL)
const requiredFieldsMap = {
  cpu_specifications: ['socket', 'cores', 'threads', 'base_frequency_ghz'],
  gpu_specifications: ['vram_gb', 'length_mm'],
  motherboard_specifications: ['socket', 'chipset', 'form_factor', 'ram_slots'],
  psu_specifications: ['power_w'],
  ram_specifications: ['capacity_gb', 'type', 'speed_mhz'],
  storage_specifications: ['type', 'capacity_gb'],
  cooler_specifications: ['cooler_type'],
  cable_specifications: ['cable_type']
};

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
function resolveSpecTableByCategoryName(rawName = '') {
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

class ProductService {
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

  // Crear un nuevo producto
  // Obtener el user_id de public.users usando el email del usuario autenticado
  static async getUserIdByEmail(email) {
    try {
      console.log('🔍 Buscando user_id para email:', email);
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Error obteniendo user_id:', error);
        throw error;
      }

      console.log('✅ User_id encontrado:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error en getUserIdByEmail:', error);
      throw error;
    }
  }

  static async createProduct(productData) {
    try {
      console.log('🚀 Iniciando creación de producto...');
      
      // Obtener el usuario autenticado
      const { user, error: authError } = await AuthService.getCurrentUser();
      
      console.log('👤 Usuario autenticado:', user ? user.email : 'No encontrado');
      
      if (authError || !user) {
        console.error('❌ Error de autenticación:', authError);
        throw new Error('Usuario no autenticado');
      }

      // Obtener el user_id de public.users usando el email
      const userId = await this.getUserIdByEmail(user.email);
      
      console.log('📝 Datos del producto a insertar:', {
        name: productData.name,
        category_id: productData.category_id,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock) || 0,
        user_id: userId
      });

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock) || 0,
          main_image: productData.main_image || null,
          user_id: userId // Agregar el user_id del usuario autenticado
        }])
        .select();

      if (error) {
        console.error('❌ Error creando producto en BD:', error);
        throw error;
      }

      const product = data[0];
      console.log('✅ Producto creado exitosamente:', product);

      // Si hay especificaciones, guardarlas en la tabla correspondiente
      if (productData.specifications && Object.keys(productData.specifications).length > 0) {
        console.log('📋 Guardando especificaciones...');
        await this.saveProductSpecifications(product.id, productData.category_id, productData.specifications);
      }

      return product;
    } catch (error) {
      console.error('❌ Error completo en createProduct:', error);
      throw error;
    }
  }

  // Guardar especificaciones del producto en la tabla correspondiente
  static async saveProductSpecifications(productId, categoryId, specifications) {
    try {
      // 1) Resolver nombre de la categoría en BD y obtener la tabla
      const { data: categoryRows, error: catErr } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .limit(1);

      if (catErr) {
        console.error('Error obteniendo categoría para especificaciones:', catErr);
        throw catErr;
      }
      const categoryName = categoryRows && categoryRows[0] ? categoryRows[0].name : '';
      const tableName = resolveSpecTableByCategoryName(categoryName);

      // 2) Construir y filtrar datos según la tabla
      const specDataRaw = { product_id: productId, ...specifications };
      const validFields = validFieldsMap[tableName] || [];
      const specData = Object.keys(specDataRaw)
        .filter((key) => key === 'product_id' || validFields.includes(key))
        .reduce((acc, key) => {
          acc[key] = specDataRaw[key];
          return acc;
        }, {});

      // Limpiar campos vacíos o undefined y convertir números grandes
      Object.keys(specData).forEach(key => {
        if (specData[key] === '' || specData[key] === undefined || specData[key] === null) {
          delete specData[key];
        } else if (typeof specData[key] === 'number') {
          // Limitar números muy grandes que pueden causar overflow
          if (specData[key] > 999999999) {
            specData[key] = Math.floor(specData[key] / 1000000); // Convertir a millones
          }
          // Redondear decimales a máximo 2 decimales
          if (specData[key] % 1 !== 0) {
            specData[key] = Math.round(specData[key] * 100) / 100;
          }
        } else if (typeof specData[key] === 'string') {
          // Intentar convertir strings numéricos y aplicar las mismas reglas
          const numValue = parseFloat(specData[key]);
          if (!isNaN(numValue)) {
            // Validación especial para length_m en cables (máximo 9.99)
            if (key === 'length_m' && tableName === 'cable_specifications' && numValue > 9.99) {
              throw new Error('La longitud del cable no puede exceder 9.99 metros');
            }
            
            // Validación especial para length_mm en GPUs (máximo 999 para evitar overflow)
            if (key === 'length_mm' && tableName === 'gpu_specifications' && numValue > 999) {
              throw new Error('La longitud de la GPU no puede exceder 999 mm');
            }
            
            // Validaciones especiales para RAM (evitar overflow en campos integer)
            if (tableName === 'ram_specifications') {
              if (key === 'capacity_gb' && numValue > 2147483647) { // Límite integer en PostgreSQL
                throw new Error('La capacidad de RAM no puede exceder 2,147,483,647 GB');
              }
              if (key === 'speed_mhz' && numValue > 2147483647) {
                throw new Error('La velocidad de RAM no puede exceder 2,147,483,647 MHz');
              }
              if (key === 'modules' && numValue > 2147483647) {
                throw new Error('El número de módulos de RAM no puede exceder 2,147,483,647');
              }
            }
            
            // Validaciones especiales para Storage (evitar overflow en campos integer)
            if (tableName === 'storage_specifications') {
              if (key === 'capacity_gb' && numValue > 2147483647) {
                throw new Error('La capacidad de almacenamiento no puede exceder 2,147,483,647 GB');
              }
              if (key === 'read_speed_mbs' && numValue > 2147483647) {
                throw new Error('La velocidad de lectura no puede exceder 2,147,483,647 MB/s');
              }
              if (key === 'write_speed_mbs' && numValue > 2147483647) {
                throw new Error('La velocidad de escritura no puede exceder 2,147,483,647 MB/s');
              }
              if (key === 'tbw' && numValue > 2147483647) {
                throw new Error('El TBW no puede exceder 2,147,483,647');
              }
            }
            
            // Validaciones especiales para PSU (evitar overflow en campos integer)
            if (tableName === 'psu_specifications') {
              if (key === 'power_w' && numValue > 2147483647) {
                throw new Error('La potencia de la PSU no puede exceder 2,147,483,647 W');
              }
              if (key === 'fan_size_mm' && numValue > 2147483647) {
                throw new Error('El tamaño del ventilador no puede exceder 2,147,483,647 mm');
              }
            }
            
            // Validaciones especiales para Case (evitar overflow en campos integer)
            if (tableName === 'case_specifications') {
              if (key === 'bays_35' && numValue > 2147483647) {
                throw new Error('El número de bahías 3.5" no puede exceder 2,147,483,647');
              }
              if (key === 'bays_25' && numValue > 2147483647) {
                throw new Error('El número de bahías 2.5" no puede exceder 2,147,483,647');
              }
              if (key === 'expansion_slots' && numValue > 2147483647) {
                throw new Error('El número de slots de expansión no puede exceder 2,147,483,647');
              }
              if (key === 'max_gpu_length_mm' && numValue > 2147483647) {
                throw new Error('La longitud máxima de GPU no puede exceder 2,147,483,647 mm');
              }
              if (key === 'max_cooler_height_mm' && numValue > 2147483647) {
                throw new Error('La altura máxima del cooler no puede exceder 2,147,483,647 mm');
              }
              if (key === 'included_fans' && numValue > 2147483647) {
                throw new Error('El número de ventiladores incluidos no puede exceder 2,147,483,647');
              }
            }
            
            // Validaciones especiales para Monitor (evitar overflow en campos integer)
            if (tableName === 'monitor_specifications') {
              if (key === 'refresh_rate_hz' && numValue > 2147483647) {
                throw new Error('La frecuencia de actualización no puede exceder 2,147,483,647 Hz');
              }
              if (key === 'response_time_ms' && numValue > 2147483647) {
                throw new Error('El tiempo de respuesta no puede exceder 2,147,483,647 ms');
              }
            }
            
            // Validaciones especiales para Peripheral (evitar overflow en campos integer)
            if (tableName === 'peripheral_specifications') {
              if (key === 'response_frequency_hz' && numValue > 2147483647) {
                throw new Error('La frecuencia de respuesta no puede exceder 2,147,483,647 Hz');
              }
            }
            
            // Validaciones especiales para Laptop (evitar overflow en campos integer)
            if (tableName === 'laptop_specifications') {
              if (key === 'ram_gb' && numValue > 2147483647) {
                throw new Error('La cantidad de RAM no puede exceder 2,147,483,647 GB');
              }
              if (key === 'battery_wh' && numValue > 2147483647) {
                throw new Error('La capacidad de la batería no puede exceder 2,147,483,647 Wh');
              }
            }
            
            // Validaciones especiales para Phone (evitar overflow en campos integer)
            if (tableName === 'phone_specifications') {
              if (key === 'ram_gb' && numValue > 2147483647) {
                throw new Error('La cantidad de RAM no puede exceder 2,147,483,647 GB');
              }
              if (key === 'storage_gb' && numValue > 2147483647) {
                throw new Error('La capacidad de almacenamiento no puede exceder 2,147,483,647 GB');
              }
              if (key === 'battery_mah' && numValue > 2147483647) {
                throw new Error('La capacidad de la batería no puede exceder 2,147,483,647 mAh');
              }
            }
            
            if (numValue > 999999999) {
              specData[key] = Math.floor(numValue / 1000000);
            } else if (numValue % 1 !== 0) {
              specData[key] = Math.round(numValue * 100) / 100;
            } else {
              specData[key] = numValue;
            }
          }
        }
      });

      // 3) Validar campos obligatorios según tabla
      const required = requiredFieldsMap[tableName] || [];
      const missing = required.filter((key) => specData[key] === undefined || specData[key] === null || specData[key] === '');
      if (missing.length > 0) {
        throw new Error(`Faltan campos requeridos para ${tableName}: ${missing.join(', ')}`);
      }

      // 4) Insertar las especificaciones
      const { data, error } = await supabase
        .from(tableName)
        .insert([specData]);

      if (error) {
        console.error('Error guardando especificaciones:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en saveProductSpecifications:', error);
      throw error;
    }
  }

  // Subir imagen a Supabase Storage
  static async uploadProductImage(imageUri, productName) {
    try {
      // Generar un nombre único para la imagen
      const timestamp = Date.now();
      const fileName = `${productName.replace(/\s+/g, '_')}_${timestamp}.jpg`;
      const filePath = `img/${fileName}`;  // Guardar en carpeta 'img'

      // Leer el archivo como ArrayBuffer para React Native
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      // Subir la imagen usando ArrayBuffer
      const { data, error } = await supabase.storage
        .from('image-producs')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        
        // Manejo específico para errores de RLS
        if (error.message && error.message.includes('row-level security policy')) {
          throw new Error('Error de permisos: Las políticas de seguridad de Supabase Storage impiden subir imágenes. Verifica que las políticas RLS estén configuradas correctamente para usuarios autenticados.');
        }
        
        // Manejo específico para errores de bucket no encontrado
        if (error.message && error.message.includes('Bucket not found')) {
          throw new Error('Error: El bucket image-producs no existe en Supabase Storage. Verifica la configuración.');
        }
        
        throw error;
      }

      // Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('image-producs')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error en uploadProductImage:', error);
      throw error;
    }
  }

  // Obtener productos del usuario (para futuras funcionalidades)
  static async getUserProducts(userId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo productos del usuario:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en getUserProducts:', error);
      throw error;
    }
  }

  // Obtener todos los productos (para el catálogo)
  static async getAllProducts(filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `);

      // Aplicar filtros si existen
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .gt('stock', 0) // Solo productos en stock
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo productos:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }
}

export default ProductService;