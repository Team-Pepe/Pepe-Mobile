import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para mostrar la interfaz
  const mockProducts = [
    { id: '1', title: 'Laptop HP Pavilion', price: '899.99', status: 'active', image: require('../../../assets/pepe.jpg') },
    { id: '2', title: 'Monitor Samsung 24"', price: '199.99', status: 'active', image: require('../../../assets/pepe.jpg') },
    { id: '3', title: 'Teclado Mecánico RGB', price: '79.99', status: 'pending', image: require('../../../assets/pepe.jpg') },
    { id: '4', title: 'Mouse Gamer Logitech', price: '49.99', status: 'active', image: require('../../../assets/pepe.jpg') },
  ];

  useEffect(() => {
    // Aquí se cargarían los productos del usuario desde la API
    // Por ahora usamos datos de ejemplo
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
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
          onPress: () => {
            // Aquí iría la llamada a la API para eliminar
            // Por ahora solo actualizamos el estado local
            setProducts(products.filter(p => p.id !== productId));
            Alert.alert('Producto eliminado', 'El producto ha sido eliminado correctamente');
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