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
      
      if (!email) {
        console.error('❌ Email es undefined o vacío');
        throw new Error('Email no proporcionado');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error) {
        console.error('❌ Error obteniendo user_id:', error);
        if (error.code === 'PGRST116') {
          throw new Error(`Usuario con email ${email} no encontrado en la base de datos`);
        }
        throw error;
      }

      if (!data || !data.id) {
        console.error('❌ No se encontró user_id para el email:', email);
        throw new Error(`No se encontró user_id para el email ${email}`);
      }

      console.log('✅ User_id encontrado:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error en getUserIdByEmail:', error);
      throw error;
    }
  }

  // Obtener productos del usuario autenticado
  static async getUserProducts() {
    try {
      console.log('🔍 Obteniendo productos del usuario autenticado...');
      
      // Obtener el usuario autenticado
      const authResult = await AuthService.getCurrentUser();
      console.log('🔍 Resultado completo de getCurrentUser:', authResult);
      
      const { user, error: authError } = authResult;
      
      console.log('👤 Usuario autenticado:', user ? user.email : 'No encontrado');
      console.log('👤 Objeto usuario completo:', user);
      
      if (authError) {
        console.error('❌ Error de autenticación:', authError);
        throw new Error(`Error de autenticación: ${authError}`);
      }
      
      if (!user) {
        console.error('❌ Usuario no autenticado - user es null/undefined');
        throw new Error('Usuario no autenticado');
      }
      
      if (!user.email) {
        console.error('❌ Usuario no tiene email - email es:', user.email);
        throw new Error('Usuario no tiene email asociado');
      }

      console.log('✅ Usuario válido encontrado, procediendo a buscar user_id...');

      // Obtener el user_id de public.users usando el email
      const userId = await this.getUserIdByEmail(user.email);
      
      console.log('🔍 Buscando productos para user_id:', userId);

      // Obtener productos del usuario con información de categoría e imágenes adicionales
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo productos del usuario:', error);
        throw error;
      }

      console.log('✅ Productos encontrados:', data.length);
      console.log('📦 Productos:', data);

      return data;
    } catch (error) {
      console.error('❌ Error completo en getUserProducts:', error);
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
          additional_images: productData.additional_images || [],
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

  // Subir múltiples imágenes de apoyo al bucket en carpeta id-imgs/<producto>
  static async uploadSupportImages(imageUris = [], productName = '') {
    try {
      if (!Array.isArray(imageUris) || imageUris.length === 0) return [];

      const normalizedName = normalizeName(productName || 'producto');
      const results = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const isRemoteUrl = typeof uri === 'string' && uri.startsWith('http');
        if (isRemoteUrl) {
          results.push(uri);
          continue;
        }

        try {
          const timestamp = Date.now();
          const fileName = `${normalizedName}_${timestamp}_${i}.jpg`;
          const filePath = `id-imgs/${normalizedName}/${fileName}`;

          const response = await fetch(uri);
          const arrayBuffer = await response.arrayBuffer();

          const { error: uploadError } = await supabase.storage
            .from('image-producs')
            .upload(filePath, arrayBuffer, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (uploadError) {
            console.error('Error subiendo imagen de apoyo:', uploadError);
            throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from('image-producs')
            .getPublicUrl(filePath);

          results.push(publicUrlData.publicUrl);
        } catch (innerErr) {
          console.error('Error en una imagen de apoyo:', innerErr);
          throw innerErr;
        }
      }

      return results;
    } catch (error) {
      console.error('Error en uploadSupportImages:', error);
      throw error;
    }
  }

  // Helper: extraer ruta de storage desde URL pública
  static extractStoragePathFromPublicUrl(publicUrl) {
    try {
      if (!publicUrl || typeof publicUrl !== 'string') return null;
      // Ejemplo: https://<proj>/storage/v1/object/public/image-producs/img/file.jpg
      const marker = '/object/public/image-producs/';
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return null;
      const filePath = publicUrl.substring(idx + marker.length);
      console.log('🧩 Ruta de storage extraída:', filePath);
      return filePath || null;
    } catch (e) {
      console.error('❌ Error extrayendo ruta de storage:', e);
      return null;
    }
  }

  // Eliminar producto: borra imagen del bucket, especificaciones y fila en products
  static async deleteProduct(productId) {
    try {
      console.log('🗑️ Iniciando eliminación de producto:', productId);

      // Verificar usuario autenticado y obtener su user_id
      const authResult = await AuthService.getCurrentUser();
      const { user, error: authError } = authResult;
      if (authError || !user) {
        console.error('❌ Error de autenticación al eliminar:', authError);
        throw new Error('Usuario no autenticado');
      }
      const userId = await this.getUserIdByEmail(user.email);
      console.log('👤 user_id autenticado:', userId);

      // Traer el producto para validar propietario y obtener main_image
      const { data: productRow, error: fetchErr } = await supabase
        .from('products')
        .select('id, user_id, main_image, category_id')
        .eq('id', productId)
        .single();
      if (fetchErr) {
        console.error('❌ Error obteniendo producto a eliminar:', fetchErr);
        throw fetchErr;
      }
      if (!productRow) {
        console.error('❌ Producto no encontrado:', productId);
        throw new Error('Producto no encontrado');
      }
      if (productRow.user_id !== userId) {
        console.error('🚫 El usuario no es dueño del producto');
        throw new Error('No autorizado para eliminar este producto');
      }

      // Borrar imagen principal del bucket si existe
      if (productRow.main_image) {
        const filePath = this.extractStoragePathFromPublicUrl(productRow.main_image);
        if (filePath) {
          console.log('🗂️ Eliminando imagen del bucket image-producs:', filePath);
          const { data: delImg, error: delImgErr } = await supabase.storage
            .from('image-producs')
            .remove([filePath]);
          if (delImgErr) {
            console.error('⚠️ Error eliminando imagen del bucket:', delImgErr);
          } else {
            console.log('✅ Imagen eliminada del bucket:', delImg);
          }
        } else {
          console.log('ℹ️ No se pudo extraer ruta de imagen, se omite borrado de storage');
        }
      }

      // Borrar especificaciones en todas las tablas por product_id (solo una tendrá filas)
      const specTables = [
        'cpu_specifications',
        'gpu_specifications',
        'ram_specifications',
        'motherboard_specifications',
        'storage_specifications',
        'psu_specifications',
        'case_specifications',
        'cooler_specifications',
        'monitor_specifications',
        'peripheral_specifications',
        'cable_specifications',
        'laptop_specifications',
        'phone_specifications',
        'other_specifications'
      ];
      console.log('🧹 Eliminando especificaciones asociadas...');
      for (const table of specTables) {
        const { error: delSpecErr } = await supabase
          .from(table)
          .delete()
          .eq('product_id', productId);
        if (delSpecErr) {
          console.error(`⚠️ Error eliminando especificaciones en ${table}:`, delSpecErr);
        }
      }

      // Borrar fila del producto
      const { error: delProdErr } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (delProdErr) {
        console.error('❌ Error eliminando producto en BD:', delProdErr);
        throw delProdErr;
      }

      console.log('✅ Producto eliminado correctamente:', productId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error completo en deleteProduct:', error);
      throw error;
    }
  }

  // Actualizar producto: permite cambiar datos y reemplazar imagen
  static async updateProduct(productId, productData) {
    try {
      console.log('✏️ Iniciando actualización de producto...', { productId, productData });

      // Verificar usuario autenticado y obtener su user_id
      const authResult = await AuthService.getCurrentUser();
      const { user, error: authError } = authResult;
      if (authError || !user) {
        console.error('❌ Error de autenticación al actualizar:', authError);
        throw new Error('Usuario no autenticado');
      }
      const userId = await this.getUserIdByEmail(user.email);
      console.log('👤 user_id autenticado:', userId);

      // Traer producto actual para validar propietario y conocer imagen previa
      const { data: current, error: fetchErr } = await supabase
        .from('products')
        .select('id, user_id, main_image')
        .eq('id', productId)
        .single();
      if (fetchErr) {
        console.error('❌ Error obteniendo producto a actualizar:', fetchErr);
        throw fetchErr;
      }
      if (!current || current.user_id !== userId) {
        console.error('🚫 No autorizado para actualizar este producto');
        throw new Error('No autorizado para actualizar este producto');
      }

      // Si se proporciona nueva imagen y es diferente, eliminar la anterior
      if (productData.main_image && current.main_image && productData.main_image !== current.main_image) {
        const oldPath = this.extractStoragePathFromPublicUrl(current.main_image);
        if (oldPath) {
          console.log('🗂️ Eliminando imagen anterior del bucket:', oldPath);
          const { error: delOldErr } = await supabase.storage
            .from('image-producs')
            .remove([oldPath]);
          if (delOldErr) {
            console.error('⚠️ Error eliminando imagen anterior:', delOldErr);
          }
        }
      }

      const updatePayload = {
        name: productData.name,
        description: productData.description,
        category_id: productData.category_id,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock) || 0,
        // Si no se pasa main_image, mantener la existente
        ...(productData.main_image ? { main_image: productData.main_image } : {}),
        ...(productData.additional_images ? { additional_images: productData.additional_images } : {})
      };

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', productId)
        .select();
      if (error) {
        console.error('❌ Error actualizando producto en BD:', error);
        throw error;
      }

      const updated = data && data[0] ? data[0] : null;
      console.log('✅ Producto actualizado:', updated);
      return updated;
    } catch (error) {
      console.error('❌ Error completo en updateProduct:', error);
      throw error;
    }
  }

  // Obtener especificaciones de un producto según su categoría
  static async getProductSpecifications(productId, categoryName = '') {
    try {
      console.log('🔍 Obteniendo especificaciones para producto:', productId, 'categoría:', categoryName);
      
      // Resolver la tabla de especificaciones según el nombre de la categoría
      const tableName = resolveSpecTableByCategoryName(categoryName);
      console.log('📊 Tabla de especificaciones inicial:', tableName);

      // Helper para filtrar campos válidos
      const filterSpecs = (row) => {
        const filtered = {};
        if (!row) return filtered;
        Object.entries(row).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '' && key !== 'product_id' && key !== 'id') {
            filtered[key] = value;
          }
        });
        return filtered;
      };

      // Intenta primero con la tabla resuelta
      const tryFetchFromTable = async (tbl) => {
        try {
          const { data, error } = await supabase
            .from(tbl)
            .select('*')
            .eq('product_id', productId)
            .single();

          if (error) {
            if (error.code === 'PGRST116') return null; // sin resultados
            console.error(`❌ Error consultando ${tbl}:`, error);
            return null;
          }
          return data || null;
        } catch (err) {
          console.error(`❌ Excepción consultando ${tbl}:`, err);
          return null;
        }
      };

      let row = await tryFetchFromTable(tableName);

      // Fallback: si no hay datos o la categoría es desconocida, probar todas las tablas conocidas
      if (!row || tableName === 'other_specifications') {
        console.log('🔁 Intentando fallback en todas las tablas de especificaciones...');
        const tablesToTry = Object.keys(validFieldsMap).filter(t => t !== 'other_specifications');
        for (const tbl of tablesToTry) {
          const r = await tryFetchFromTable(tbl);
          if (r) {
            console.log('✅ Especificaciones encontradas en tabla:', tbl);
            row = r;
            break;
          }
        }
      }

      const filteredSpecs = filterSpecs(row);
      console.log('✅ Especificaciones obtenidas:', filteredSpecs);
      return filteredSpecs;
    } catch (error) {
      console.error('❌ Error en getProductSpecifications:', error);
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