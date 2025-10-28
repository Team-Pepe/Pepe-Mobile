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
      // Obtener el nombre de la categoría para determinar la tabla de especificaciones
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        console.error('Error obteniendo categoría:', categoryError);
        throw categoryError;
      }

      // Mapear nombre de categoría a tabla de especificaciones
      const specificationTableMap = {
        'cpu': 'cpu_specifications',
        'gpu': 'gpu_specifications',
        'ram': 'ram_specifications',
        'storage': 'storage_specifications',
        'motherboard': 'motherboard_specifications',
        'psu': 'psu_specifications',
        'cooler': 'cooler_specifications',
        'case': 'case_specifications',
        'monitor': 'monitor_specifications',
        'laptop': 'laptop_specifications',
        'phone': 'phone_specifications',
        'peripheral': 'peripheral_specifications',
        'cable': 'cable_specifications',
        'other': 'other_specifications'
      };

      const tableName = specificationTableMap[categoryData.name.toLowerCase()];
      
      if (!tableName) {
        console.warn(`No se encontró tabla de especificaciones para la categoría: ${categoryData.name}`);
        return;
      }

      // Preparar los datos de especificaciones con el product_id
      const specData = {
        product_id: productId,
        ...specifications
      };

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
      const filePath = `products/${fileName}`;

      // Convertir la URI de la imagen a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Subir la imagen
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo imagen:', error);
        throw error;
      }

      // Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
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