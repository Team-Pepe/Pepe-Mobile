import { supabase } from '../lib/supabase';

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
  static async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          category_id: productData.category_id,
          price: parseFloat(productData.price),
          stock: parseInt(productData.stock) || 0,
          main_image: productData.main_image || null
        }])
        .select();

      if (error) {
        console.error('Error creando producto:', error);
        throw error;
      }

      const product = data[0];

      // Si hay especificaciones, guardarlas en la tabla correspondiente
      if (productData.specifications && Object.keys(productData.specifications).length > 0) {
        await this.saveProductSpecifications(product.id, productData.category_id, productData.specifications);
      }

      return product;
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  }

  // Guardar especificaciones del producto en la tabla correspondiente
  static async saveProductSpecifications(productId, categoryId, specifications) {
    try {
      // Mapeo de categorías a tablas de especificaciones
      const categoryTableMap = {
        1: 'cpu_specifications',
        2: 'gpu_specifications', 
        3: 'ram_specifications',
        4: 'motherboard_specifications',
        5: 'storage_specifications',
        6: 'psu_specifications',
        7: 'case_specifications',
        8: 'cooler_specifications',
        9: 'monitor_specifications',
        10: 'peripheral_specifications',
        11: 'cable_specifications',
        12: 'laptop_specifications',
        13: 'phone_specifications'
      };

      const tableName = categoryTableMap[categoryId];
      
      if (!tableName) {
        // Si no hay tabla específica, usar other_specifications
        const specData = {
          product_id: productId,
          general_specifications: specifications
        };

        const { data, error } = await supabase
          .from('other_specifications')
          .insert([specData]);

        if (error) {
          console.error('Error guardando especificaciones generales:', error);
          throw error;
        }

        return data;
      }

      // Preparar los datos de especificaciones con el product_id
      const specData = {
        product_id: productId,
        ...specifications
      };

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

      // Insertar las especificaciones
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