import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
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
    birthDate: '',
    birthDay: '',
    birthMonth: '',
    birthYear: ''
  });
  
  // Estados para los modales de selección de fecha
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const updateFormData = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    // Si se actualiza algún componente de la fecha, actualizar birthDate
    if (field === 'birthDay' || field === 'birthMonth' || field === 'birthYear') {
      const { birthDay, birthMonth, birthYear } = newFormData;
      if (birthDay && birthMonth && birthYear) {
        // Formato YYYY-MM-DD
        newFormData.birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      }
    }
    
    setFormData(newFormData);
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
      <Text style={styles.title}>Crear Cuenta</Text>
      
      {/* Email - Campo importante en fila completa */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={formData.email}
        onChangeText={(value) => updateFormData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Datos personales en dos columnas */}
      <View style={styles.row}>
        <TextInput
          style={styles.inputHalf}
          placeholder="Nombres"
          placeholderTextColor="#999"
          value={formData.firstName}
          onChangeText={(value) => updateFormData('firstName', value)}
          autoCapitalize="words"
        />
        
        <TextInput
          style={styles.inputHalf}
          placeholder="Apellidos"
          placeholderTextColor="#999"
          value={formData.lastName}
          onChangeText={(value) => updateFormData('lastName', value)}
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.row}>
        <TextInput
          style={styles.inputHalf}
          placeholder="Cédula"
          placeholderTextColor="#999"
          value={formData.doc}
          onChangeText={(value) => updateFormData('doc', value)}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.inputHalf}
          placeholder="Teléfono"
          placeholderTextColor="#999"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
        />
      </View>
      
      <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
      <View style={styles.dateRow}>
        {/* Selector de Día */}
        <TouchableOpacity 
          style={styles.pickerContainer}
          onPress={() => setShowDayPicker(true)}
        >
          <Text style={[styles.pickerText, {color: formData.birthDay ? '#ffffff' : '#999'}]}>
            {formData.birthDay || 'Día'}
          </Text>
        </TouchableOpacity>
        
        {/* Selector de Mes */}
        <TouchableOpacity 
          style={styles.pickerContainer}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text style={[styles.pickerText, {color: formData.birthMonth ? '#ffffff' : '#999'}]}>
            {formData.birthMonth ? 
              ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][parseInt(formData.birthMonth)-1] : 
              'Mes'}
          </Text>
        </TouchableOpacity>
        
        {/* Selector de Año */}
        <TouchableOpacity 
          style={styles.pickerContainer}
          onPress={() => setShowYearPicker(true)}
        >
          <Text style={[styles.pickerText, {color: formData.birthYear ? '#ffffff' : '#999'}]}>
            {formData.birthYear || 'Año'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar día */}
      <Modal
        visible={showDayPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el día</Text>
            <FlatList
              data={Array.from({length: 31}, (_, i) => String(i + 1))}
              contentContainerStyle={styles.flatListContent}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItemTouchable}
                  onPress={() => {
                    updateFormData('birthDay', item);
                    setShowDayPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDayPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal para seleccionar mes */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el mes</Text>
            <FlatList
              data={[
                {name: 'Enero', value: '01'},
                {name: 'Febrero', value: '02'},
                {name: 'Marzo', value: '03'},
                {name: 'Abril', value: '04'},
                {name: 'Mayo', value: '05'},
                {name: 'Junio', value: '06'},
                {name: 'Julio', value: '07'},
                {name: 'Agosto', value: '08'},
                {name: 'Septiembre', value: '09'},
                {name: 'Octubre', value: '10'},
                {name: 'Noviembre', value: '11'},
                {name: 'Diciembre', value: '12'}
              ]}
              contentContainerStyle={styles.flatListContent}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItemTouchable}
                  onPress={() => {
                    updateFormData('birthMonth', item.value);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.value}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMonthPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal para seleccionar año */}
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el año</Text>
            <FlatList
              data={Array.from({length: 100}, (_, i) => String(new Date().getFullYear() - i))}
              contentContainerStyle={styles.flatListContent}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.modalItemTouchable}
                  onPress={() => {
                    updateFormData('birthYear', item);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowYearPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Contraseñas - Campos importantes en filas completas */}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 65,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  inputHalf: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 65,
    width: '48%',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  inputHalfSmall: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 65,
    width: '100%',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    fontSize: 12,
    marginBottom: 15,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#1b1b1b',
    borderRadius: 12,
    padding: 12,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dateLabel: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  pickerContainer: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 10,
    height: 50,
    width: '32%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: '#ffffff',
  },
  flatListContent: {
    paddingVertical: 6,
  },
  modalItemTouchable: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#232323',
  },
  modalItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#333333',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default RegisterScreen;