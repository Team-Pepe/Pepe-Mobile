import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CategorySelectionScreen from '../screens/auth/CategorySelectionScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#2c2c2c' }, // fondo gris oscuro en header
          headerTintColor: '#ffffff', // color de íconos y back
          headerTitleStyle: { color: '#ffffff' }, // color del título
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen 
          name="CategorySelection" 
          component={CategorySelectionScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: false 
          }} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            headerTitle: 'Marketplace',
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 15 }}>
                <FontAwesome5 name="shopping-cart" size={20} color="#007AFF" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            title: 'Detalle del Producto',
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 15 }}>
                <FontAwesome5 name="shopping-cart" size={20} color="#007AFF" />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;