import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CategorySelectionScreen from '../screens/auth/CategorySelectionScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import VersusScreen from '../screens/comparison/VersusScreen';
import MyPCScreen from '../screens/pc-builder/MyPCScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Componente para el TabNavigator (menú inferior)
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'Favorites') {
            iconName = 'heart';
          } else if (route.name === 'Versus') {
            iconName = 'exchange-alt';
          } else if (route.name === 'MyPC') {
            iconName = 'desktop';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#bdbdbd',
        tabBarStyle: {
          backgroundColor: '#1f1f1f',
          borderTopColor: '#333333',
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 95,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          elevation: 8,
          shadowOpacity: 0.3,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -4 },
        },
        headerStyle: { 
          backgroundColor: '#2c2c2c',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: { 
          color: '#ffffff',
        },
        // Protección para el header
        headerSafeAreaInsets: { top: Platform.OS === 'ios' ? 10 : 0 },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          title: 'Inicio',
          headerTitle: 'PepePlace',
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 15 }}>
              <FontAwesome5 name="shopping-cart" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          title: 'Favoritos',
        }}
      />
      <Tab.Screen 
        name="Versus" 
        component={VersusScreen}
        options={{
          title: 'Versus',
        }}
      />
      <Tab.Screen 
        name="MyPC" 
        component={MyPCScreen}
        options={{
          title: 'Mi PC',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Mi Cuenta',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: { backgroundColor: '#2c2c2c' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { color: '#ffffff' },
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
          component={TabNavigator}
          options={{
            headerShown: false,
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
    </SafeAreaProvider>
  );
};

export default AppNavigator;