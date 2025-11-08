import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, FlatList, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ReviewsService from '../../services/reviews.service';

const EditReviewScreen = ({ route, navigation }) => {
  const { review } = route.params || {};
  const [commentText, setCommentText] = useState(review?.comment_text || '');
  const [rating, setRating] = useState(Number(review?.rating || 0));
  const [images, setImages] = useState(Array.isArray(review?.content?.images) ? review.content.images : []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const MAX_TOTAL = 5;

  const handleSave = async () => {
    try {
      setSaving(true);
      const r = parseInt(String(rating), 10);
      const res = await ReviewsService.updateReview(review.id, { rating: r, commentText });
      if (!res.updated) {
        Alert.alert('Error', res.error || 'No se pudo actualizar la opinión');
        return;
      }
      // Actualizar imágenes si hubo cambios
      const imgRes = await ReviewsService.updateReviewImages(review.id, images);
      if (!imgRes.updated) {
        Alert.alert('Aviso', 'Comentario actualizado, pero no se pudieron actualizar las imágenes');
      }
      Alert.alert('Éxito', 'Tu opinión fue actualizada');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar la opinión');
    } finally {
      setSaving(false);
    }
  };

  const setStar = (value) => {
    setRating(value);
  };

  const handleRemoveImage = async (uri) => {
    const confirmed = await new Promise((resolve) => {
      Alert.alert('Eliminar imagen', '¿Deseas eliminar esta imagen de la opinión?', [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
    if (!confirmed) return;
    const res = await ReviewsService.removeReviewImage(review.id, uri);
    if (!res.deleted) {
      Alert.alert('Error', res.error || 'No se pudo eliminar la imagen');
      return;
    }
    setImages((prev) => prev.filter((u) => u !== uri));
  };

  const handleAddImages = async () => {
    try {
      if (images.length >= MAX_TOTAL) {
        Alert.alert('Límite alcanzado', `Solo puedes tener ${MAX_TOTAL} imágenes por opinión.`);
        return;
      }
      const remaining = MAX_TOTAL - images.length;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.9,
      });
      if (res?.canceled) return;
      let uris = Array.isArray(res?.assets) ? res.assets.map(a => a?.uri).filter(Boolean) : [];
      if (!uris.length) return;
      if (uris.length > remaining) {
        Alert.alert('Aviso', `Se añadirán solo ${remaining} imagen(es) para respetar el límite de ${MAX_TOTAL}.`);
        uris = uris.slice(0, remaining);
      }
      setUploading(true);
      const addRes = await ReviewsService.appendReviewImages(review.id, uris);
      if (!addRes.updated) {
        Alert.alert('Error', addRes.error || 'No se pudieron subir las imágenes');
        setUploading(false);
        return;
      }
      const nextImages = Array.isArray(addRes?.data?.content?.images) ? addRes.data.content.images : images;
      setImages(nextImages);
      Alert.alert('Éxito', 'Imágenes agregadas');
      setUploading(false);
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudieron subir las imágenes');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Comentario</Text>
      <TextInput
        style={styles.input}
        multiline
        value={commentText}
        onChangeText={setCommentText}
        placeholder="Escribe tu comentario"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Puntuación</Text>
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map((v) => (
          <TouchableOpacity key={v} onPress={() => setStar(v)} style={styles.starBtn}>
            <FontAwesome5 name={v <= rating ? 'star' : 'star'} size={22} color={v <= rating ? '#FFD700' : '#666'} solid={v <= rating} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Imágenes</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity style={[styles.addBtn, (uploading || images.length >= MAX_TOTAL) && { opacity: 0.6 }]} onPress={handleAddImages} disabled={uploading || images.length >= MAX_TOTAL}>
          <FontAwesome5 name="plus" size={14} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 6 }}>Agregar imágenes</Text>
        </TouchableOpacity>
        <Text style={{ color: '#bdbdbd', marginLeft: 12 }}>
          {images.length >= MAX_TOTAL ? 'Límite de imágenes alcanzado' : `Puedes añadir ${MAX_TOTAL - images.length} más`}
        </Text>
        {uploading && (
          <View style={{ marginLeft: 12, flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 6 }}>Subiendo imágenes...</Text>
          </View>
        )}
      </View>
      {images.length === 0 ? (
        <Text style={{ color: '#bdbdbd', marginBottom: 8 }}>No hay imágenes adjuntas.</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(uri, idx) => uri + idx}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.imageItem}>
              <Image source={{ uri: item }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveImage(item)}>
                <FontAwesome5 name="times" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      <TouchableOpacity style={[styles.button, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    padding: 16,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 10,
    padding: 12,
    minHeight: 44,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starBtn: {
    marginRight: 8,
  },
  imageItem: {
    marginRight: 8,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EditReviewScreen;