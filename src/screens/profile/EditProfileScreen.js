import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { AuthService } from '../../services/auth.service';
import UserService from '../../services/user.service';

const EditProfileScreen = ({ navigation }) => {
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialProfile, setInitialProfile] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [mode, setMode] = useState('perfil'); // 'perfil' | 'password'

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    password: '',
    confirmPassword: '',
  });

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { user, error } = await AuthService.getCurrentUser();
      if (error || !user) {
        navigation.replace('Login');
        return;
      }
      setAuthUser(user);
      const profile = await UserService.getUserProfileByEmail(user.email);
      setInitialProfile(profile);
      if (profile) {
        const bd = profile.birth_date || '';
        const [y, m, d] = bd ? bd.split('-') : ['', '', ''];
        setFormData({
          email: profile.email || user.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          phone: profile.phone || '',
          birthDate: bd || '',
          birthDay: d || '',
          birthMonth: m || '',
          birthYear: y || '',
          password: '',
          confirmPassword: '',
        });
      }
    })();
  }, [navigation]);

  const updateFormData = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    if (field === 'birthDay' || field === 'birthMonth' || field === 'birthYear') {
      const { birthDay, birthMonth, birthYear } = { ...newFormData };
      if (birthDay && birthMonth && birthYear) {
        newFormData.birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
      }
    }
    setFormData(newFormData);
  };

  const validateProfile = () => {
    const { firstName, lastName, phone, birthDate } = formData;
    if (!firstName || !lastName || !phone || !birthDate) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return false;
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('Error', 'La fecha debe tener el formato YYYY-MM-DD');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Debes ingresar y confirmar la nueva contraseña');
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
    return true;
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      if (!validateProfile()) {
        setLoading(false);
        return;
      }
      const { firstName, lastName, phone, birthDate } = formData;
      const currentEmail = authUser.email;
      // Actualizar perfil en public.users (sin editar correo)
      const profileUpdate = await UserService.updateUserProfile({
        currentEmail,
        firstName,
        lastName,
        phone,
        birthDate,
      });
      if (!profileUpdate.success) {
        Alert.alert('Error', profileUpdate.error || 'Error al actualizar perfil');
        setLoading(false);
        return;
      }
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      if (!validatePassword()) {
        setLoading(false);
        return;
      }
      const { password } = formData;
      const result = await AuthService.updatePassword(password);
      if (!result.success) {
        Alert.alert('Error', result.error || 'No se pudo cambiar la contraseña');
        setLoading(false);
        return;
      }
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Editar Perfil</Text>

        {/* Selector de modo */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'perfil' ? styles.modeButtonActive : null]}
            onPress={() => setMode('perfil')}
          >
            <Text style={[styles.modeButtonText, mode === 'perfil' ? styles.modeButtonTextActive : null]}>Datos del usuario</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'password' ? styles.modeButtonActive : null]}
            onPress={() => setMode('password')}
          >
            <Text style={[styles.modeButtonText, mode === 'password' ? styles.modeButtonTextActive : null]}>Contraseña</Text>
          </TouchableOpacity>
        </View>

        {mode === 'perfil' && (
          <>
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

            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />

            <Text style={styles.dateLabel}>Fecha de nacimiento</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowDayPicker(true)}>
                <Text style={[styles.pickerText, {color: formData.birthDay ? '#ffffff' : '#999'}]}>
                  {formData.birthDay || 'Día'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowMonthPicker(true)}>
                <Text style={[styles.pickerText, {color: formData.birthMonth ? '#ffffff' : '#999'}]}>
                  {formData.birthMonth ? ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(formData.birthMonth)-1] : 'Mes'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerContainer} onPress={() => setShowYearPicker(true)}>
                <Text style={[styles.pickerText, {color: formData.birthYear ? '#ffffff' : '#999'}]}>
                  {formData.birthYear || 'Año'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modales de selección de fecha */}
        <Modal visible={showDayPicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona el día</Text>
              <FlatList
                data={Array.from({length: 31}, (_, i) => String(i + 1))}
                contentContainerStyle={styles.flatListContent}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.modalItemTouchable} onPress={() => {updateFormData('birthDay', item); setShowDayPicker(false);}}>
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowDayPicker(false)}>
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showMonthPicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona el mes</Text>
              <FlatList
                data={[
                  { name: 'Enero', value: '01' },
                  { name: 'Febrero', value: '02' },
                  { name: 'Marzo', value: '03' },
                  { name: 'Abril', value: '04' },
                  { name: 'Mayo', value: '05' },
                  { name: 'Junio', value: '06' },
                  { name: 'Julio', value: '07' },
                  { name: 'Agosto', value: '08' },
                  { name: 'Septiembre', value: '09' },
                  { name: 'Octubre', value: '10' },
                  { name: 'Noviembre', value: '11' },
                  { name: 'Diciembre', value: '12' },
                ]}
                contentContainerStyle={styles.flatListContent}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.modalItemTouchable} onPress={() => {updateFormData('birthMonth', item.value); setShowMonthPicker(false);}}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.value}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowMonthPicker(false)}>
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showYearPicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona el año</Text>
              <FlatList
                data={Array.from({length: 100}, (_, i) => String(new Date().getFullYear() - i))}
                contentContainerStyle={styles.flatListContent}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.modalItemTouchable} onPress={() => {updateFormData('birthYear', item); setShowYearPicker(false);}}>
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
              />
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowYearPicker(false)}>
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {mode === 'password' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={mode === 'perfil' ? handleSaveProfile : handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>{mode === 'perfil' ? 'Guardar Cambios' : 'Cambiar Contraseña'}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c2c2c' },
  contentContainer: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 30, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  input: { backgroundColor: '#1f1f1f', color: '#ffffff', borderRadius: 10, paddingHorizontal: 15, height: 65, marginBottom: 15, borderWidth: 1, borderColor: '#3a3a3a' },
  inputHalf: { backgroundColor: '#1f1f1f', color: '#ffffff', borderRadius: 10, paddingHorizontal: 15, height: 65, width: '48%', borderWidth: 1, borderColor: '#3a3a3a' },
  button: { backgroundColor: '#007AFF', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 },
  buttonDisabled: { opacity: 0.8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modeButton: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#3a3a3a', backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  modeButtonActive: { borderColor: '#007AFF' },
  modeButtonText: { color: '#bdbdbd', fontSize: 14, fontWeight: '600' },
  modeButtonTextActive: { color: '#ffffff' },
  dateLabel: { color: '#ffffff', marginBottom: 8, fontSize: 14 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  pickerContainer: { backgroundColor: '#1f1f1f', borderWidth: 1, borderColor: '#3a3a3a', borderRadius: 10, height: 50, width: '32%', justifyContent: 'center', alignItems: 'center' },
  pickerText: { fontSize: 14, color: '#ffffff' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', maxHeight: '70%', backgroundColor: '#1b1b1b', borderRadius: 12, padding: 12 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  flatListContent: { paddingVertical: 6 },
  modalItemTouchable: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginVertical: 6, backgroundColor: '#232323' },
  modalItemText: { color: '#ffffff', fontSize: 16 },
  modalCloseButton: { marginTop: 12, padding: 12, backgroundColor: '#333333', borderRadius: 8, alignItems: 'center' },
  modalCloseButtonText: { color: '#ffffff', fontSize: 16 },
});

export default EditProfileScreen;