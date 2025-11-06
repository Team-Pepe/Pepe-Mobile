import FavoritesService from '../services/favorites.service';

// Ejecuta una acción solo si el producto está en favoritos.
// onNotFavorite puede mostrar feedback (Alert/Toast) cuando no lo está.
export async function runIfFavorite(productId, action, { onNotFavorite } = {}) {
  try {
    const isFav = await FavoritesService.isFavorite(productId);
    if (isFav) {
      return await action();
    }
    if (typeof onNotFavorite === 'function') onNotFavorite();
    return null;
  } catch (e) {
    if (typeof onNotFavorite === 'function') onNotFavorite();
    return null;
  }
}

// Quita un producto de favoritos solo si actualmente está en favoritos.
export async function removeIfFavorite(productId) {
  try {
    const isFav = await FavoritesService.isFavorite(productId);
    if (!isFav) return { removed: false, reason: 'not_favorite' };
    return await FavoritesService.removeFavorite(productId);
  } catch (e) {
    return { removed: false, error: e?.message || 'unknown_error' };
  }
}