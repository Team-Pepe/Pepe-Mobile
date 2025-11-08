import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import UserService from './user.service';

/**
 * Servicio para crear y listar reseñas, incluyendo subida de imágenes
 * al bucket `image-producs` (carpeta `img-review/`) de Supabase Storage.
 */
class ReviewsService {
  /**
   * Sube hasta 5 imágenes de una reseña al bucket `image-producs`.
   * Crea una "carpeta" virtual con la ruta: img-review/<productId>/<userId>/<stamp>/
   * @param {string[]} imageUris - URIs locales de imágenes (máx 5)
   * @param {number|string} productId
   * @param {number|string} userId
   * @returns {Promise<string[]>} URLs públicas de las imágenes subidas
   */
  static async uploadReviewImages(imageUris = [], productId, userId) {
    try {
      const MAX_PHOTOS = 5;
      const uris = Array.isArray(imageUris) ? imageUris.slice(0, MAX_PHOTOS) : [];
      if (!uris.length) return [];
      if (!productId || !userId) throw new Error('productId y userId son requeridos para subir imágenes');

      const stamp = Date.now();
      const publicUrls = [];
      console.log('📎 [ReviewsService] Iniciando subida de imágenes de reseña', {
        productId,
        userId,
        count: uris.length,
      });

      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        // Intentar deducir extensión; por defecto jpg
        const ext = uri && typeof uri === 'string' && uri.match(/\.(png|jpg|jpeg|webp)$/i)
          ? uri.match(/\.(png|jpg|jpeg|webp)$/i)[1].toLowerCase()
          : 'jpg';
        const contentType =
          ext === 'png' ? 'image/png' :
          ext === 'webp' ? 'image/webp' : 'image/jpeg';

        const fileName = `img_${i + 1}.${ext}`;
        const filePath = `img-review/${productId}/${userId}/${stamp}/${fileName}`;
        console.log('⬆️ [ReviewsService] Subiendo imagen', { index: i, bucket: 'image-producs', filePath });

        const { error: uploadError } = await supabase.storage
          .from('image-producs')
          .upload(filePath, arrayBuffer, {
            contentType,
            upsert: false,
          });
        if (uploadError) {
          if (uploadError.message && uploadError.message.includes('Bucket not found')) {
            throw new Error('El bucket image-producs no existe en Supabase Storage.');
          }
          throw uploadError;
        }

        const { data: publicUrlData } = await supabase.storage
          .from('image-producs')
          .getPublicUrl(filePath);
        publicUrls.push(publicUrlData.publicUrl);
        console.log('✅ [ReviewsService] Imagen subida y URL pública obtenida', publicUrlData.publicUrl);
      }

      console.log('✅ [ReviewsService] Subida de imágenes completada', { urlsCount: publicUrls.length });
      return publicUrls;
    } catch (error) {
      console.error('Error en ReviewsService.uploadReviewImages:', error);
      throw error;
    }
  }

  /**
   * Crea una reseña en la tabla `reviews` y opcionalmente sube imágenes.
   * Guarda las URLs en el campo JSON `content` como { images: string[] }.
   * @param {number|string} productId
   * @param {{ rating:number, commentText:string, imageUris?:string[] }} payload
   * @returns {Promise<{ created: boolean, data?: any, error?: string }>}
   */
  static async addReview(productId, { rating, commentText, imageUris = [] }) {
    try {
      console.log('📝 [ReviewsService] addReview inicio', { productId, rating, hasImages: Array.isArray(imageUris) && imageUris.length });
      if (!productId) throw new Error('productId es requerido');
      const r = parseInt(rating, 10);
      if (!r || r < 1 || r > 5) throw new Error('rating debe estar entre 1 y 5');
      const comment = (commentText || '').trim();
      if (!comment) throw new Error('commentText es requerido');

      const { user, error: authError } = await AuthService.getCurrentUser();
      if (authError || !user) throw new Error('Usuario no autenticado');

      const userId = await UserService.getUserIdByEmail(user.email);
      if (!userId) throw new Error('No se pudo resolver user_id');
      console.log('👤 [ReviewsService] user_id resuelto', { userId });

      // Limitar imágenes y subir si existen
      const uris = Array.isArray(imageUris) ? imageUris.slice(0, 5) : [];
      console.log('📎 [ReviewsService] Adjuntos a subir', { count: uris.length });
      const imageUrls = uris.length
        ? await this.uploadReviewImages(uris, productId, userId)
        : [];

      const content = { images: imageUrls };

      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: userId,
            product_id: productId,
            rating: r,
            comment_text: comment,
            content,
          },
        ])
        .select();

      if (error) throw error;
      const createdRow = data && data[0] ? data[0] : null;
      console.log('✅ [ReviewsService] Reseña creada', createdRow);
      return { created: true, data: createdRow };
    } catch (error) {
      // Encapsular error de duplicado: solo una reseña por producto por usuario
      let message = error?.message || 'Error creando reseña';
      if (error?.code === '23505' || (message && message.includes('duplicate key value'))) {
        message = 'Solo puedes comentar una vez por producto.';
      }
      console.error('❌ [ReviewsService] Error en addReview:', { code: error?.code, message: error?.message });
      return { created: false, error: message };
    }
  }

  /**
   * Lista reseñas de un producto.
   * @param {number|string} productId
   * @returns {Promise<any[]>}
   */
  static async listProductReviews(productId) {
    try {
      if (!productId) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const rows = data || [];
      const userIds = Array.from(new Set(rows.map(r => r.user_id).filter(Boolean)));
      let namesMap = {};
      try {
        namesMap = await UserService.getUserNamesByIds(userIds);
      } catch (e) {
        namesMap = {};
      }
      return rows.map(r => ({ ...r, user_name: namesMap[r.user_id] || null }));
    } catch (error) {
      console.error('Error en ReviewsService.listProductReviews:', error);
      return [];
    }
  }
}

export default ReviewsService;