import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthService } from '../services/auth.service';

const ProfileScreen = ({ navigation }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <FontAwesome5 name="user-circle" size={80} color="#007AFF" />
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome5 name="user-edit" size={20} color="#007AFF" />
          <Text style={styles.menuText}>Editar Perfil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome5 name="shopping-bag" size={20} color="#007AFF" />
          <Text style={styles.menuText}>Mis Pedidos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <FontAwesome5 name="cog" size={20} color="#007AFF" />
          <Text style={styles.menuText}>Configuración</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#FF3B30" />
          <Text style={[styles.menuText, { color: '#FF3B30' }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 30,
  },
  email: {
    fontSize: 18,
    color: '#ffffff',
    marginTop: 10,
  },
  menuContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 15,
  },
});

export default ProfileScreen;