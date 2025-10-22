import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthService } from '../../services/auth.service';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    doc: '', // cédula
    birthDate: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { email, password, confirmPassword, firstName, lastName, phone, doc, birthDate } = formData;
    
    if (!email || !password || !confirmPassword || !firstName || !lastName || !phone || !doc || !birthDate) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    // Validar formato de teléfono (números y espacios)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
      return false;
    }

    // Validar formato de cédula (solo números)
    const docRegex = /^\d+$/;
    if (!docRegex.test(doc)) {
      Alert.alert('Error', 'La cédula debe contener solo números');
      return false;
    }

    // Validar longitud de cédula (máximo 10 dígitos)
    if (doc.length > 10) {
      Alert.alert('Error', 'La cédula no es válida. Debe tener máximo 10 dígitos');
      return false;
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('Error', 'La fecha debe tener el formato YYYY-MM-DD');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const { email, password, firstName, lastName, phone, doc, birthDate } = formData;

      const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        doc: parseInt(doc), // Convertir a número para el ID
        birthDate
      };

      // Usar el método completo que maneja ambas tablas por separado
      const result = await AuthService.signUpComplete(userData);
      
      if (!result.success) {
        let errorMessage = result.error;
        
        // Mensajes específicos según el paso donde falló
        if (result.step === 'auth') {
          errorMessage = `Error en autenticación: ${result.error}`;
        } else if (result.step === 'profile') {
          // Mensajes más específicos para errores de perfil
          if (result.error.includes('cédula no es válida')) {
            errorMessage = result.error; // Ya es un mensaje amigable
          } else if (result.error.includes('email ya está registrado')) {
            errorMessage = result.error; // Ya es un mensaje amigable
          } else if (result.error.includes('cédula ya está registrada')) {
            errorMessage = result.error; // Ya es un mensaje amigable
          } else if (result.error.includes('No tienes permisos')) {
            errorMessage = 'Error de autorización. Por favor, intenta nuevamente';
          } else {
            errorMessage = `Error al crear perfil: ${result.error}`;
          }
          console.log('Datos de auth creados:', result.authData);
        } else {
          errorMessage = `Error inesperado: ${result.error}`;
        }
        
        Alert.alert('Error', errorMessage);
        return;
      }

      // Si llegamos aquí, ambas operaciones fueron exitosas
      Alert.alert('Éxito', 'Usuario registrado correctamente', [
        { text: 'OK', onPress: () => navigation.replace('CategorySelection') }
      ]);
      
    } catch (error) {
      console.error('Error al registrar:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al registrar el usuario');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Registro</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombres"
        placeholderTextColor="#999"
        value={formData.firstName}
        onChangeText={(value) => updateFormData('firstName', value)}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        placeholderTextColor="#999"
        value={formData.lastName}
        onChangeText={(value) => updateFormData('lastName', value)}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Cédula"
        placeholderTextColor="#999"
        value={formData.doc}
        onChangeText={(value) => updateFormData('doc', value)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#999"
        value={formData.phone}
        onChangeText={(value) => updateFormData('phone', value)}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Fecha de nacimiento (YYYY-MM-DD)"
        placeholderTextColor="#999"
        value={formData.birthDate}
        onChangeText={(value) => updateFormData('birthDate', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        value={formData.password}
        onChangeText={(value) => updateFormData('password', value)}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Contraseña"
        placeholderTextColor="#999"
        value={formData.confirmPassword}
        onChangeText={(value) => updateFormData('confirmPassword', value)}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#ffffffcc',
    marginTop: 20,
    textAlign: 'center',
  },
  socialButtonsContainer: {
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  socialButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#333333',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterScreen;