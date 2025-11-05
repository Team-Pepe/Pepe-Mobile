import { supabase } from '../lib/supabase';
import { normalizeName } from './category.service';

class ImageService {
  static async uploadProductImage(imageUri, productName) {
    try {
      const timestamp = Date.now();
      const fileName = `${(productName || 'producto').replace(/\s+/g, '_')}_${timestamp}.jpg`;
      const filePath = `img/${fileName}`;

      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('image-producs')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        if (error.message && error.message.includes('row-level security policy')) {
          throw new Error('Error de permisos: revisa políticas RLS de Supabase Storage.');
        }
        if (error.message && error.message.includes('Bucket not found')) {
          throw new Error('Error: El bucket image-producs no existe en Supabase Storage.');
        }
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('image-producs')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error en ImageService.uploadProductImage:', error);
      throw error;
    }
  }

  static async uploadSupportImages(imageUris = [], productName = '') {
    try {
      if (!Array.isArray(imageUris) || imageUris.length === 0) return [];
      const name = normalizeName(productName || 'producto');
      const results = [];

      for (let i = 0; i < imageUris.length; i++) {
        const uri = imageUris[i];
        const isRemote = typeof uri === 'string' && uri.startsWith('http');
        if (isRemote) { results.push(uri); continue; }

        const timestamp = Date.now();
        const fileName = `${name}_${timestamp}_${i}.jpg`;
        const filePath = `id-imgs/${name}/${fileName}`;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from('image-producs')
          .upload(filePath, arrayBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          });
        if (uploadError) {
          console.error('Error subiendo imagen de apoyo:', uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('image-producs')
          .getPublicUrl(filePath);
        results.push(publicUrlData.publicUrl);
      }

      return results;
    } catch (error) {
      console.error('Error en ImageService.uploadSupportImages:', error);
      throw error;
    }
  }

  static extractStoragePathFromPublicUrl(publicUrl) {
    try {
      if (!publicUrl || typeof publicUrl !== 'string') return null;
      const marker = '/object/public/image-producs/';
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return null;
      const filePath = publicUrl.substring(idx + marker.length);
      return filePath || null;
    } catch (e) {
      console.error('Error en ImageService.extractStoragePathFromPublicUrl:', e);
      return null;
    }
  }

  static async deleteImageByPublicUrl(publicUrl) {
    try {
      const filePath = ImageService.extractStoragePathFromPublicUrl(publicUrl);
      if (!filePath) return { deleted: false };
      const { data, error } = await supabase.storage
        .from('image-producs')
        .remove([filePath]);
      if (error) {
        console.error('Error eliminando imagen del bucket:', error);
        return { deleted: false };
      }
      return { deleted: true, data };
    } catch (e) {
      console.error('Error en ImageService.deleteImageByPublicUrl:', e);
      return { deleted: false };
    }
  }
}

export default ImageService;