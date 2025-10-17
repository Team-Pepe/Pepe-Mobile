import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthService } from '../services/auth.service';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { user: currentUser, error } = await AuthService.getCurrentUser();
    if (error || !currentUser) {
      navigation.replace('Login');
    } else {
      setUser(currentUser);
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
  const categories = [
    { id: 1, name: 'Procesadores', icon: 'microchip' },
    { id: 2, name: 'Tarjetas Gráficas', icon: 'tv' },
    { id: 3, name: 'Memoria RAM', icon: 'memory' },
    { id: 4, name: 'Almacenamiento', icon: 'hdd' },
    { id: 5, name: 'Placas Base', icon: 'server' },
    { id: 6, name: 'Periféricos', icon: 'keyboard' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'AMD Ryzen 9 5900X',
      price: '549.99',
      image: require('../../assets/pepe.jpg'),
      discount: '15%',
    },
    {
      id: 2,
      name: 'NVIDIA RTX 4080',
      price: '1199.99',
      image: require('../../assets/pepe.jpg'),
      discount: '10%',
    },
    {
      id: 3,
      name: 'Corsair 32GB DDR5',
      price: '189.99',
      image: require('../../assets/pepe.jpg'),
      discount: '20%',
    },
  ];

  const recommendedProducts = [
    {
      id: 4,
      name: 'ASUS ROG STRIX B550-F',
      price: '179.99',
      image: require('../../assets/pepe.jpg'),
      rating: 4.7,
    },
    {
      id: 5,
      name: 'Samsung 2TB NVMe SSD',
      price: '199.99',
      image: require('../../assets/pepe.jpg'),
      rating: 4.9,
    },
    {
      id: 6,
      name: 'Corsair RM850x PSU',
      price: '149.99',
      image: require('../../assets/pepe.jpg'),
      rating: 4.8,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Barra de búsqueda */}
      <TouchableOpacity style={styles.searchBar}>
        <FontAwesome5 name="search" size={16} color="#666" />
        <Text style={styles.searchText}>Buscar productos...</Text>
      </TouchableOpacity>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <FontAwesome5 name={category.icon} size={24} color="#007AFF" />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ofertas destacadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ofertas destacadas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}</Text>
              </View>
              <Image 
                source={product.image} // Quitar el {uri: }
                style={styles.productImage} 
              />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Productos recomendados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recomendados para ti</Text>
        <View style={styles.recommendedGrid}>
          {recommendedProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.recommendedCard}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <Image 
                source={product.image} // Quitar el {uri: }
                style={styles.productImage}
              />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" solid size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
});

export default HomeScreen;