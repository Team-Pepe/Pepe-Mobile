import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthService } from '../../services/auth.service';
import ReviewsService from '../../services/reviews.service';

const UserReviewsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { user, error } = await AuthService.getCurrentUser();
      if (error || !user) {
        navigation.replace('Login');
        return;
      }
      const rows = await ReviewsService.listUserReviews();
      setReviews(rows);
    } catch (e) {
      console.error('Error cargando reseñas del usuario:', e);
      Alert.alert('Error', e?.message || 'No se pudieron cargar tus opiniones');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (review) => {
    navigation.navigate('EditReview', { review });
  };

  const handleDelete = async (review) => {
    Alert.alert(
      'Eliminar opinión',
      '¿Seguro que deseas eliminar esta opinión? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
            const res = await ReviewsService.deleteReview(review.id);
            if (!res.deleted) {
              Alert.alert('Error', res.error || 'No se pudo eliminar');
            } else {
              setReviews(prev => prev.filter(r => r.id !== review.id));
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const images = Array.isArray(item?.content?.images) ? item.content.images : [];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            {item?.product?.main_image ? (
              <Image source={{ uri: item.product.main_image }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, styles.imagePlaceholder]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item?.product?.name || `Producto #${item.product_id}`}</Text>
              <Text style={styles.meta}>Puntuación: {item.rating} · {new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
              <FontAwesome5 name="edit" size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#8b0000' }]} onPress={() => handleDelete(item)}>
              <FontAwesome5 name="trash" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.comment}>{item.comment_text}</Text>
        {images.length > 0 && (
          <FlatList
            data={images}
            keyExtractor={(uri, idx) => uri + idx}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10 }}
            renderItem={({ item: uri }) => (
              <Image source={{ uri }} style={styles.reviewImage} />
            )}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: '#fff', marginTop: 12 }}>Cargando tus opiniones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reviews.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <FontAwesome5 name="comment-slash" size={36} color="#bdbdbd" />
          <Text style={{ color: '#bdbdbd', marginTop: 10 }}>Aún no has publicado opiniones.</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    padding: 16,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#333',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: '#bdbdbd',
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  comment: {
    color: '#fff',
    marginTop: 8,
    lineHeight: 20,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#333',
  },
});

export default UserReviewsScreen;