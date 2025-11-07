import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import UserService from './user.service';

class FavoritesService {
  // Inserta un favorito para el usuario actual evitando duplicados
  static async addFavorite(productId) {
    try {
      if (!productId) throw new Error('productId es requerido');

      const { user, error: authError } = await AuthService.getCurrentUser();
      if (authError || !user) throw new Error('Usuario no autenticado');

      const userId = await UserService.getUserIdByEmail(user.email);
      if (!userId) throw new Error('No se pudo resolver user_id');

      // Verificar si ya existe
      const { data: existing, error: existsErr } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      if (existsErr) throw existsErr;
      if (existing) return { added: false, already: true };

      const { data, error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, product_id: productId }])
        .select();
      if (error) throw error;
      return { added: true, data };
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      return { added: false, error: error.message };
    }
  }

  // Elimina un favorito (opcional para toggle)
  static async removeFavorite(productId) {
    try {
      const { user, error: authError } = await AuthService.getCurrentUser();
      if (authError || !user) throw new Error('Usuario no autenticado');
      const userId = await UserService.getUserIdByEmail(user.email);
      if (!userId) throw new Error('No se pudo resolver user_id');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return { removed: true };
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      return { removed: false, error: error.message };
    }
  }

  // Lista IDs de productos favoritos del usuario actual
  static async listFavoriteProductIds() {
    try {
      const { user, error: authError } = await AuthService.getCurrentUser();
      if (authError || !user) throw new Error('Usuario no autenticado');
      const userId = await UserService.getUserIdByEmail(user.email);
      if (!userId) throw new Error('No se pudo resolver user_id');

      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r) => r.product_id);
    } catch (error) {
      console.error('Error listando IDs de favoritos:', error);
      return [];
    }
  }

  // Lista los productos completos de los favoritos
  static async listFavoriteProducts() {
    try {
      const ids = await this.listFavoriteProductIds();
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories ( id, name )`)
        .in('id', ids);
      if (error) throw error;
      // Mantener orden por created_at de favorites: ordenar según ids
      const orderMap = new Map(ids.map((id, idx) => [id, idx]));
      return (data || []).sort((a, b) => (orderMap.get(a.id) - orderMap.get(b.id)));
    } catch (error) {
      console.error('Error listando productos favoritos:', error);
      return [];
    }
  }

  // Chequear si un producto es favorito
  static async isFavorite(productId) {
    try {
      const { user, error: authError } = await AuthService.getCurrentUser();
      if (authError || !user) return false;
      const userId = await UserService.getUserIdByEmail(user.email);
      if (!userId) return false;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();
      if (error) return false;
      return !!data;
    } catch (e) {
      return false;
    }
  }
}

export default FavoritesService;