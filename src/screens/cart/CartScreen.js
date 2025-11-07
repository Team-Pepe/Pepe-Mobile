import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { formatPriceWithSymbol } from '../../utils/formatPrice';
import { SafeAreaView } from 'react-native-safe-area-context';
const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para el carrito (mientras se implementa el backend)
  const sampleCartItems = [
    {
      id: 1,
      name: 'AMD Ryzen 9 5900X',
      price: 549990,
      quantity: 1,
      image: require('../../../assets/pepe.jpg'),
      category: 'CPU',
      seller: 'TechStore',
    },
    {
      id: 2,
      name: 'NVIDIA RTX 4080',
      price: 1199990,
      quantity: 1,
      image: require('../../../assets/pepe.jpg'),
      category: 'GPU',
      seller: 'GamingCenter',
    },
    {
      id: 3,
      name: 'Corsair 32GB DDR5',
      price: 189990,
      quantity: 2,
      image: require('../../../assets/pepe.jpg'),
      category: 'RAM',
      seller: 'MemoryStore',
    },
  ];

  useEffect(() => {
    // Simular carga del carrito
    setTimeout(() => {
      setCartItems(sampleCartItems);
      setLoading(false);
    }, 1000);
  }, []);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que quieres eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCartItems(items => items.filter(item => item.id !== itemId));
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'No hay productos en tu carrito');
      return;
    }
    
    Alert.alert(
      'Proceder al pago',
      `Total: ${formatPriceWithSymbol(getTotalPrice())}\n\n¿Deseas continuar con la compra?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // Aquí iría la lógica de pago
            Alert.alert('Éxito', 'Proceso de pago iniciado');
          },
        },
      ]
    );
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={item.image} style={styles.itemImage} />
      
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemSeller}>Vendido por {item.seller}</Text>
        <Text style={styles.itemPrice}>{formatPriceWithSymbol(item.price)}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <FontAwesome5 name="minus" size={12} color="#007AFF" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <FontAwesome5 name="plus" size={12} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <FontAwesome5 name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="shopping-cart" size={50} color="#007AFF" />
          <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito ({getTotalItems()})</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="shopping-cart" size={80} color="#555" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>Agrega productos para comenzar a comprar</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.continueButtonText}>Continuar comprando</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.cartContainer}>
            {cartItems.map(renderCartItem)}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>{formatPriceWithSymbol(getTotalPrice())}</Text>
            </View>
            
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Proceder al pago</Text>
              <FontAwesome5 name="arrow-right" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#2c2c2c',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#bdbdbd',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  cartItem: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  itemSeller: {
    fontSize: 12,
    color: '#bdbdbd',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  quantityButton: {
    padding: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#1f1f1f',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    gap: 10,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CartScreen;