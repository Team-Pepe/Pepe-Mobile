import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const categories = [
    { id: 1, name: 'Electrónica', icon: 'laptop' },
    { id: 2, name: 'Ropa', icon: 'tshirt' },
    { id: 3, name: 'Hogar', icon: 'home' },
    { id: 4, name: 'Deportes', icon: 'running' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Smartphone XYZ',
      price: '599.99',
      image: 'https://via.placeholder.com/150',
      discount: '20%',
    },
    {
      id: 2,
      name: 'Laptop Pro',
      price: '999.99',
      image: 'https://via.placeholder.com/150',
      discount: '15%',
    },
    {
      id: 3,
      name: 'Auriculares Wireless',
      price: '89.99',
      image: 'https://via.placeholder.com/150',
      discount: '30%',
    },
  ];

  const recommendedProducts = [
    {
      id: 4,
      name: 'Smart TV 55"',
      price: '699.99',
      image: 'https://via.placeholder.com/150',
      rating: 4.5,
    },
    {
      id: 5,
      name: 'Tablet Ultra',
      price: '299.99',
      image: 'https://via.placeholder.com/150',
      rating: 4.8,
    },
    {
      id: 6,
      name: 'Cámara Digital',
      price: '449.99',
      image: 'https://via.placeholder.com/150',
      rating: 4.3,
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
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}</Text>
              </View>
              <Image source={{ uri: product.image }} style={styles.productImage} />
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
            <TouchableOpacity key={product.id} style={styles.recommendedCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
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
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  searchText: {
    marginLeft: 10,
    color: '#666',
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    elevation: 2,
    minWidth: 80,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
  },
  section: {
    marginVertical: 15,
  },
  productCard: {
    backgroundColor: '#fff',
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
  },
  productName: {
    fontSize: 14,
    marginBottom: 4,
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
    backgroundColor: '#fff',
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
    color: '#666',
  },
});

export default HomeScreen;