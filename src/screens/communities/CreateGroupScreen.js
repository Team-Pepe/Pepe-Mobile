import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const CreateGroupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState(['Ofertas', 'Tecnología', 'Gaming']);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const canCreate = name.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Crear grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        {/* Avatar del grupo (placeholder UI) */}
        <Text style={styles.label}>Avatar del grupo</Text>
        <View style={styles.avatarRow}>
          <View style={styles.groupAvatar}>
            <FontAwesome5 name="users" size={22} color="#bdbdbd" />
          </View>
          <TouchableOpacity style={styles.changeAvatarButton} activeOpacity={0.8}>
            <FontAwesome5 name="camera" size={12} color="#ffffff" />
            <Text style={styles.changeAvatarText}>Cambiar imagen</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre del grupo</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Ofertas Laptops"
            placeholderTextColor="#8a8a8a"
          />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Descripción</Text>
        <View style={[styles.inputBox, { minHeight: 90 }] }>
          <TextInput
            style={[styles.input, { height: 70 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Cuenta de qué trata el grupo"
            placeholderTextColor="#8a8a8a"
            multiline
          />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Privacidad</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, privacy === 'private' && styles.chipActive]}
            onPress={() => setPrivacy('private')}
          >
            <Text style={styles.chipText}>Privado</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, privacy === 'public' && styles.chipActive]}
            onPress={() => setPrivacy('public')}
          >
            <Text style={styles.chipText}>Público</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Temas</Text>
        <View style={styles.chipsWrap}>
          {topics.map((t) => {
            const active = selectedTopics.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chipSm, active && styles.chipSmActive]}
                onPress={() => {
                  setSelectedTopics((prev) =>
                    prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                  );
                }}
              >
                <Text style={styles.chipSmText}>{t}</Text>
              </TouchableOpacity>
            );
          })}
          {/* Chip para añadir nuevos temas (UI) */}
          <TouchableOpacity style={styles.chipAdd} activeOpacity={0.8}>
            <FontAwesome5 name="plus" size={10} color="#ffffff" />
            <Text style={styles.chipAddText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helper}>Esta pantalla es solo UI. No crea grupos aún.</Text>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.primaryButton, !canCreate && styles.primaryButtonDisabled]} activeOpacity={canCreate ? 0.8 : 1}>
          <FontAwesome5 name="plus" size={14} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Crear</Text>
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
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  groupAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    alignItems: 'center', justifyContent: 'center',
  },
  changeAvatarButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  changeAvatarText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  inputBox: {
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { color: '#ffffff', fontSize: 14 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
  },
  chipActive: { backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF' },
  chipText: { color: '#ffffff', fontSize: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipSm: {
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipSmActive: { backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF' },
  chipSmText: { color: '#ffffff', fontSize: 12 },
  chipAdd: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#007AFF', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipAddText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  helper: { color: '#bdbdbd', fontSize: 12, marginTop: 12 },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1f1f1f',
    borderTopWidth: 1, borderColor: '#333333', padding: 16,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 12,
  },
  primaryButtonDisabled: { backgroundColor: '#2a6fd0', opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default CreateGroupScreen;