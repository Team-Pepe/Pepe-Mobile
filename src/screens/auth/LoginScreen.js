import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthService } from '../../services/auth.service';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // añadido
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true); // mostrar loader
    try {
      const { data, error } = await AuthService.signIn({ email, password });
      
      if (error) {
        // Verificar si el error es de autenticación (contraseña o correo)
        if (error.includes('password') || error.includes('credentials') || error.includes('Invalid') || 
            error.includes('email') || error.includes('user') || error.includes('not found')) {
          Alert.alert('Error de acceso', 'Contraseña o correo incorrecto');
        } else {
          Alert.alert('Error', error);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        navigation.replace('Home');
        return;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false); // ocultar loader si la pantalla no fue reemplazada
    }
  };

  return (
    <View style={[styles.keyboardAvoidingContainer, { paddingBottom: keyboardOffset }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#bdbdbd"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#bdbdbd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading} // desactivar mientras carga
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Login con Google - Próximamente')}>
              <View style={styles.iconContainer}>
                <FontAwesome name="google" size={20} color="#DB4437" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.socialButtonText}>Continuar con Google</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Login con Facebook - Próximamente')}>
              <View style={styles.iconContainer}>
                <FontAwesome name="facebook" size={20} color="#4267B2" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.socialButtonText}>Continuar con Facebook</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#2c2c2c', // fondo gris oscuro
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#2c2c2c',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2c2c2c', // fondo gris oscuro
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff', // texto en blanco para contraste
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1f1f1f', // input más oscuro
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    color: '#ffffff', // texto del input en blanco
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF', // mantener azul para el botón
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8, // feedback visual cuando está deshabilitado
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ffffffcc', // enlace en blanco con opacidad
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
    backgroundColor: '#333333', // botón social oscuro
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
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
    marginRight: 50,
  },
  socialButtonText: {
    color: '#ffffff', // texto blanco en botones sociales
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;