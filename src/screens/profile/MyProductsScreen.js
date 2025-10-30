import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductService from '../../services/product.service';

const MyProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos del usuario
  const loadUserProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando productos del usuario...');
      
      const userProducts = await ProductService.getUserProducts();
      
      // Formatear los productos para que coincidan con la estructura esperada
      const formattedProducts = userProducts.map(product => ({
        id: product.id.toString(),
        title: product.name,
        price: product.price.toString(),
        status: 'active', // Por ahora todos los productos están activos
        image: product.main_image ? { uri: product.main_image } : require('../../../assets/pepe.jpg'),
        category: product.categories?.name || 'Sin categoría',
        description: product.description,
        stock: product.stock,
        created_at: product.created_at
      }));
      
      console.log('✅ Productos formateados:', formattedProducts);
      setProducts(formattedProducts);
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProducts();
  }, []);

  const handleAddProduct = () => {
    navigation.navigate('SellProduct');
  };

  const handleEditProduct = (product) => {
    // Navegar a la pantalla de edición con los datos del producto
    navigation.navigate('SellProduct', { product });
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Solicitando eliminación de producto:', productId);
              await ProductService.deleteProduct(productId);
              // Actualizar estado local
              setProducts(prev => prev.filter(p => p.id !== productId));
              Alert.alert('Producto eliminado', 'El producto y su imagen han sido eliminados');
            } catch (err) {
              console.error('❌ Error eliminando producto:', err);
              Alert.alert('Error', err.message || 'No se pudo eliminar el producto');
            }
          }
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image 
        source={item.image}
        style={styles.productImage} 
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#4CD964' : '#FFCC00' }]} />
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Activo' : 'Pendiente'}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProduct(item)}
        >
          <FontAwesome5 name="edit" size={16} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <FontAwesome5 name="trash" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Productos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <FontAwesome5 name="plus" size={16} color="#ffffff" />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando tus productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome5 name="exclamation-triangle" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>Error al cargar productos</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={loadUserProducts}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="box-open" size={60} color="#666666" />
          <Text style={styles.emptyText}>No tienes productos publicados</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleAddProduct}
          >
            <Text style={styles.buttonText}>Publicar mi primer producto</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listContent: {
    padding: 15,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#bbbbbb',
  },
  actionButtons: {
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#bbbbbb',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 14,
    color: '#bbbbbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#bbbbbb',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MyProductsScreen;