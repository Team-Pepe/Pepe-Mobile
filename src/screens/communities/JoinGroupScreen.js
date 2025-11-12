import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const JoinGroupScreen = ({ navigation }) => {
  const [code, setCode] = useState('');
  const canJoin = code.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Unirse a grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Código de invitación</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ej. AB12-CD34"
            placeholderTextColor="#8a8a8a"
          />
        </View>
        <Text style={styles.helper}>Interfaz visual. No valida ni une aún.</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.primaryButton, !canJoin && styles.primaryButtonDisabled]} activeOpacity={canJoin ? 0.8 : 1}>
          <FontAwesome5 name="key" size={14} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Unirse</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f1f1f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#2c2c2c',
    borderBottomWidth: 1, borderBottomColor: '#333333',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  form: { paddingHorizontal: 16, paddingTop: 16 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  inputBox: {
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { color: '#ffffff', fontSize: 14 },
  helper: { color: '#bdbdbd', fontSize: 12, marginTop: 12 },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1f1f1f',
    borderTopWidth: 1, borderColor: '#333333', padding: 16,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 12,
  },
  primaryButtonDisabled: { backgroundColor: '#2e9f4a', opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default JoinGroupScreen;