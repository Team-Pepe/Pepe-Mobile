import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import ReviewsService from '../../services/reviews.service';

const EditReviewScreen = ({ route, navigation }) => {
  const { review } = route.params || {};
  const [commentText, setCommentText] = useState(review?.comment_text || '');
  const [rating, setRating] = useState(String(review?.rating || ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const r = parseInt(rating, 10);
      const res = await ReviewsService.updateReview(review.id, { rating: r, commentText });
      if (!res.updated) {
        Alert.alert('Error', res.error || 'No se pudo actualizar la opinión');
        return;
      }
      Alert.alert('Éxito', 'Tu opinión fue actualizada');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar la opinión');
    } finally {
      setSaving(false);
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

      <Text style={styles.label}>Puntuación (1-5)</Text>
      <TextInput
        style={styles.input}
        value={rating}
        onChangeText={setRating}
        keyboardType="number-pad"
        placeholder="5"
        placeholderTextColor="#888"
        maxLength={1}
      />

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