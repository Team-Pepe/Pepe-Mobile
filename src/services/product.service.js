import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import CategoryService, { normalizeName } from './category.service';
import SpecificationService from './specification.service';
import ImageService from './image.service';
import UserService from './user.service';


class ProductService {
  // Obtener todas las categorías disponibles
  static async getCategories() {
    return CategoryService.getCategories();
  }

  // Crear un nuevo producto
  // (delegado) obtener user_id por email

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
      const userId = await UserService.getUserIdByEmail(user.email);
      
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
      const userId = await UserService.getUserIdByEmail(user.email);
      
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
        await SpecificationService.saveProductSpecifications(product.id, productData.category_id, productData.specifications);
      }

      return product;
    } catch (error) {
      console.error('❌ Error completo en createProduct:', error);
      throw error;
    }
  }

  // Guardar especificaciones del producto en la tabla correspondiente
  static async saveProductSpecifications(productId, categoryId, specifications) {
    // Delegar en el nuevo módulo de especificaciones
    return SpecificationService.saveProductSpecifications(productId, categoryId, specifications);
  }

  // Subir imagen a Supabase Storage
  static async uploadProductImage(imageUri, productName) {
    return ImageService.uploadProductImage(imageUri, productName);
  }

  // Subir múltiples imágenes de apoyo al bucket en carpeta id-imgs/<producto>
  static async uploadSupportImages(imageUris = [], productName = '') {
    return ImageService.uploadSupportImages(imageUris, productName);
  }

  // Helper: extraer ruta de storage desde URL pública
  static extractStoragePathFromPublicUrl(publicUrl) {
    return ImageService.extractStoragePathFromPublicUrl(publicUrl);
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
      const userId = await UserService.getUserIdByEmail(user.email);
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
        const delRes = await ImageService.deleteImageByPublicUrl(productRow.main_image);
        if (!delRes.deleted) {
          console.log('ℹ️ No se pudo eliminar imagen del bucket o no se encontró ruta');
        } else {
          console.log('✅ Imagen eliminada del bucket:', delRes.data);
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
      const userId = await UserService.getUserIdByEmail(user.email);
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
    // Delegar completamente al módulo de especificaciones
    return SpecificationService.getProductSpecifications(productId, categoryName);
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