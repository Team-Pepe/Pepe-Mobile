import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthService } from '../../services/auth.service';
import RecommendationService from '../../services/recommendation.service';
import ProductService from '../../services/product.service';
import FilterService from '../../services/filter.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';
import { usePullRefresh } from '../../utils/pullRefresh';
import FavoritesService from '../../services/favorites.service';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favLoadingIds, setFavLoadingIds] = useState([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { user: currentUser, error } = await AuthService.getCurrentUser();
    if (error || !currentUser) {
      navigation.replace('Login');
    } else {
      setUser(currentUser);
      // Cargar recomendaciones iniciales y catálogo
      try {
        const [recs, all] = await Promise.all([
          RecommendationService.getRecommendedForUser(currentUser.id),
          RecommendationService.listAll({ limit: 20 }),
        ]);
        setRecommended(recs || []);
        setAllProducts(all || []);
      } catch (e) {
        console.error('Error cargando recomendaciones/catálogo:', e);
      }
    }
  };

  // Cargar IDs de favoritos y mantenerlos actualizados al enfocarse la pantalla
  const loadFavoriteIds = async () => {
    try {
      const ids = await FavoritesService.listFavoriteProductIds();
      setFavoriteIds(ids || []);
    } catch (e) {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', loadFavoriteIds);
    loadFavoriteIds();
    return () => unsub && unsub();
  }, [navigation]);

  const isFavorite = (id) => favoriteIds.includes(id);
  const toggleFavorite = async (id) => {
    if (!id) return;
    setFavLoadingIds((prev) => [...prev, id]);
    try {
      if (isFavorite(id)) {
        const res = await FavoritesService.removeFavorite(id);
        if (res?.removed) setFavoriteIds((prev) => prev.filter((pid) => pid !== id));
      } else {
        const res = await FavoritesService.addFavorite(id);
        if (res?.added || res?.already) setFavoriteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
    } catch (e) {
      // ya loguea el servicio
    } finally {
      setFavLoadingIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleLogout = async () => {
    const { error } = await AuthService.signOut();
    if (error) {
      Alert.alert('Error', error);
    } else {
      navigation.replace('Login');
    }
  };
  // Mapeo de categorías alineado con tu tabla (id -> nombre)
  const categories = [
    { id: 1, key: 'cpu', name: 'CPU', icon: 'microchip' },
    { id: 4, key: 'gpu', name: 'GPU', icon: 'tv' },
    { id: 3, key: 'motherboard', name: 'Motherboard', icon: 'server' },
    { id: 2, key: 'ram', name: 'RAM', icon: 'memory' },
    { id: 5, key: 'storage', name: 'Almacenamiento', icon: 'hdd' },
    { id: 6, key: 'psu', name: 'PSU', icon: 'plug' },
    { id: 7, key: 'cooler', name: 'Cooler', icon: 'snowflake' },
    { id: 8, key: 'case', name: 'Gabinete', icon: 'box' },
    { id: 9, key: 'monitor', name: 'Monitor', icon: 'desktop' },
    { id: 10, key: 'peripheral', name: 'Periféricos', icon: 'keyboard' },
    { id: 11, key: 'cable', name: 'Cable', icon: 'link' },
    { id: 12, key: 'laptop', name: 'Laptop', icon: 'laptop' },
    { id: 13, key: 'phone', name: 'Teléfono', icon: 'mobile-alt' },
    { id: 14, key: 'other', name: 'Otros', icon: 'boxes' },
  ];

  const onSelectCategory = async (id) => {
    // Toggle: si se vuelve a tocar la misma categoría, se limpia el filtro
    const next = selectedCategoryId === id ? null : id;
    setSelectedCategoryId(next);
  };

 

  // Búsqueda en tiempo real (global o por categoría si hay filtro)
  useEffect(() => {
    const loadSearch = async () => {
      const q = searchQuery.trim();
      if (q.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        let res;
        if (selectedCategoryId) {
          res = await FilterService.searchByCategory(selectedCategoryId, q, { limit: 20 });
        } else {
          res = await RecommendationService.searchAll(q, { limit: 20 });
        }
        setSearchResults(res || []);
      } catch (e) {
        console.error('Error en búsqueda global:', e);
      } finally {
        setSearchLoading(false);
      }
    };
    loadSearch();
  }, [searchQuery, selectedCategoryId]);

  // Carga del catálogo según la categoría seleccionada (o todo si no hay filtro)
  useEffect(() => {
    const loadCatalog = async () => {
      setCategoryLoading(true);
      try {
        if (selectedCategoryId) {
          const res = await FilterService.listByCategory(selectedCategoryId, { limit: 20 });
          setAllProducts(res || []);
        } else {
          const all = await RecommendationService.listAll({ limit: 20 });
          setAllProducts(all || []);
        }
      } catch (e) {
        console.error('Error cargando catálogo por categoría:', e);
      } finally {
        setCategoryLoading(false);
      }
    };
    // Solo recargar catálogo cuando no hay una búsqueda activa
    if (searchQuery.trim().length < 2) {
      loadCatalog();
    }
  }, [selectedCategoryId]);

  const loadHome = async () => {
    try {
      let uid = null;
      try {
        const { user: currentUser } = await AuthService.getCurrentUser();
        uid = currentUser?.id || null;
      } catch {}
      if (uid) {
        try {
          const recs = await RecommendationService.getRecommendedForUser(uid);
          setRecommended(recs || []);
        } catch {}
      }
      const q = searchQuery.trim();
      if (q.length >= 2) {
        try {
          let res;
          if (selectedCategoryId) {
            res = await FilterService.searchByCategory(selectedCategoryId, q, { limit: 20 });
          } else {
            res = await RecommendationService.searchAll(q, { limit: 20 });
          }
          setSearchResults(res || []);
        } catch {}
      } else {
        try {
          if (selectedCategoryId) {
            const res = await FilterService.listByCategory(selectedCategoryId, { limit: 20 });
            setAllProducts(res || []);
          } else {
            const all = await RecommendationService.listAll({ limit: 20 });
            setAllProducts(all || []);
          }
        } catch {}
      }
      await loadFavoriteIds();
    } catch {}
  };

  const { refreshing, onRefresh } = usePullRefresh(loadHome);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={["#007AFF"]} /> }>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <FontAwesome5 name="search" size={16} color="#666" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar componentes de PC"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategoryId === category.id && { borderColor: '#007AFF', borderWidth: 1 },
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <FontAwesome5 name={category.icon} size={24} color="#007AFF" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recomendados para ti (dinámico) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendados para ti</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recommended.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { product: p })}
            >
              <TouchableOpacity
                style={styles.cardFavButton}
                onPress={(e) => { e.stopPropagation?.(); toggleFavorite(p.id); }}
                accessibilityLabel={isFavorite(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {favLoadingIds.includes(p.id) ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <FontAwesome5 name="heart" solid={isFavorite(p.id)} size={16} color={isFavorite(p.id) ? '#FF3B30' : '#fff'} />
                )}
              </TouchableOpacity>
              {p.main_image ? (
                <Image source={{ uri: p.main_image }} style={styles.productImage} />
              ) : (
                <Image source={require('../../../assets/pepe.jpg')} style={styles.productImage} />
              )}
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productPrice}>{formatPriceWithSymbol(p.price)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Todos los componentes (búsqueda global / catálogo) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {searchQuery.trim().length >= 2
            ? 'Resultados de búsqueda'
            : selectedCategoryId
            ? `Componentes: ${categories.find(c => c.id === selectedCategoryId)?.name || ''}`
            : 'Todos los componentes'}
        </Text>
        {searchLoading || categoryLoading ? (
          <Text style={styles.loadingText}>Buscando…</Text>
        ) : (
          <View style={styles.allList}>
            {(searchQuery.trim().length >= 2 ? searchResults : allProducts).map((p) => (
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
                  <Text style={styles.allName}>{p.name}</Text>
                  <Text style={styles.allMeta}>{p?.categories?.name || 'Sin categoría'}</Text>
                </View>
                <View style={styles.rightActions}>
                  <Text style={styles.allPrice}>{formatPriceWithSymbol(p.price)}</Text>
                  <TouchableOpacity
                    style={styles.favButtonSmall}
                    onPress={(e) => { e.stopPropagation?.(); toggleFavorite(p.id); }}
                    accessibilityLabel={isFavorite(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    {favLoadingIds.includes(p.id) ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <FontAwesome5 name="heart" solid={isFavorite(p.id)} size={16} color={isFavorite(p.id) ? '#FF3B30' : '#fff'} />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c', // fondo oscuro
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f', // barra de búsqueda oscura
    margin: 15,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  searchText: {
    marginLeft: 10,
    color: '#bdbdbd',
  },
  searchInput: {
    marginLeft: 10,
    color: '#ffffff',
    flex: 1,
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
    color: '#ffffff',
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: '#1f1f1f', // tarjeta categoría oscura
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
    minWidth: 80,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
    color: '#ffffff',
  },
  section: {
    marginVertical: 15,
  },
  productCard: {
    backgroundColor: '#1f1f1f', // tarjeta producto oscura
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 8,
    marginLeft: 15,
    width: 150,
    elevation: 2,
  },
  cardFavButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#000000',
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
    color: '#ffffff',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  recommendedCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '48%',
    elevation: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#bdbdbd',
  },
  loadingText: {
    color: '#bdbdbd',
    marginHorizontal: 15,
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
  favButtonSmall: {
    backgroundColor: '#3a3a3a',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;