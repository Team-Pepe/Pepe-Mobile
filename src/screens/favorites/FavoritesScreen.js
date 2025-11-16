import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import FavoritesService from '../../services/favorites.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';
import { removeIfFavorite } from '../../utils/favoriteGuard';
import { usePullRefresh } from '../../utils/pullRefresh';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingIds, setRemovingIds] = useState([]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const products = await FavoritesService.listFavoriteProducts();
      setFavorites(products || []);
    } catch (e) {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', loadFavorites);
    loadFavorites();
    return () => unsubscribe && unsubscribe();
  }, [navigation]);

  const handleRemoveFavorite = async (productId) => {
    if (!productId) return;
    setRemovingIds((prev) => [...prev, productId]);
    try {
      const res = await removeIfFavorite(productId);
      if (res?.removed) {
        setFavorites((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (e) {
      // Silencioso; el servicio ya loguea
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const { refreshing, onRefresh } = usePullRefresh(loadFavorites);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={["#007AFF"]} /> }>
      <Text style={styles.sectionTitle}>¡Se que lo Quieres</Text>
      {loading ? (
        <Text style={styles.loadingText}>Cargando favoritos…</Text>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.subtitle}>Aún no tienes productos favoritos.</Text>
          <Text style={styles.subtitle}>Pulsa el corazón en un producto para guardarlo.</Text>
        </View>
      ) : (
        <View style={styles.allList}>
          {favorites.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.allItem}
              onPress={() => navigation.navigate('ProductDetail', { product: p })}
            >
              {p.main_image ? (
                <Image source={{ uri: p.main_image }} style={styles.allImage} />
              ) : (
                <Image source={require('../../../assets/pepe.jpg')} style={styles.allImage} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.allName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.allMeta} numberOfLines={1}>
                  {p.categories?.name || 'Componente'}
                </Text>
              </View>
              <View style={styles.rightActions}>
                <Text style={styles.allPrice}>{formatPriceWithSymbol(p.price)}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleRemoveFavorite(p.id);
                  }}
                  accessibilityLabel={'Quitar de favoritos'}
                >
                  {removingIds.includes(p.id) ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <FontAwesome5 name="heart" solid size={16} color="#FF3B30" />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    color: '#ffffff',
  },
  loadingText: {
    color: '#bdbdbd',
    marginHorizontal: 15,
  },
  emptyState: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
  },
  allList: {
    paddingHorizontal: 15,
    gap: 10,
  },
  allItem: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  allImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  allName: {
    color: '#ffffff',
    fontWeight: '600',
  },
  allMeta: {
    color: '#bdbdbd',
    fontSize: 12,
    marginTop: 2,
  },
  allPrice: {
    color: '#007AFF',
    fontWeight: '700',
  },
  rightActions: {
    alignItems: 'center',
    gap: 6,
  },
  removeButton: {
    backgroundColor: '#3a3a3a',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FavoritesScreen;