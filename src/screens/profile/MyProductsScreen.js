import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductService from '../../services/product.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';

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
        created_at: product.created_at,
        main_image: product.main_image,
        additional_images: product.additional_images || []
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

  const handleOpenProduct = (product) => {
    // Navegar al detalle de la publicación con los datos del producto
    navigation.navigate('ProductDetail', { product });
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
    <TouchableOpacity style={styles.productItem} activeOpacity={0.85} onPress={() => handleOpenProduct(item)}>
      <Image 
        source={item.image}
        style={styles.productImage} 
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>{formatPriceWithSymbol(item.price)}</Text>
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Productos</Text>
        <TouchableOpacity 
          onPress={handleAddProduct}
          style={styles.newButton}
        >
        <FontAwesome5 name="plus" size={16} color="#ffffff" />
          <Text style={styles.newButtonText}>Nuevo</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  listContent: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#bbbbbb',
  },
  actionButtons: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorMessage: {
    color: '#bbbbbb',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#bbbbbb',
    fontSize: 16,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyProductsScreen;