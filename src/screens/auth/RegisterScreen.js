import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthService } from '../../services/auth.service';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    try {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }

      const { data, error } = await AuthService.signUp({ email, password });
      
      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data.user) {
        navigation.replace('CategorySelection');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      Alert.alert('Error', 'Ocurrió un error al registrar el usuario');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => alert('Registro con Google - Próximamente')}>
          <View style={styles.iconContainer}>
            <FontAwesome name="google" size={20} color="#DB4437" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.socialButtonText}>Registrarse con Google</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => alert('Registro con Facebook - Próximamente')}>
          <View style={styles.iconContainer}>
            <FontAwesome name="facebook" size={20} color="#4267B2" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.socialButtonText}>Registrarse con Facebook</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    marginTop: 15,
  },
  socialButtonsContainer: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  socialButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 50, // Para compensar el ancho del iconContainer y centrar el texto
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;