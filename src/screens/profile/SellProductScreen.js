import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

const SellProductScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!title || !description || !price || !category || !condition) {
      Alert.alert('Campos requeridos', 'Completa todos los campos para continuar');
      return false;
    }
    if (isNaN(Number(price))) {
      Alert.alert('Precio inválido', 'Ingresa un precio numérico válido');
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // Aquí iría la llamada al backend para crear el listado
      // Por ahora, simulamos el éxito
      await new Promise(res => setTimeout(res, 1200));
      Alert.alert('Publicado', 'Tu producto ha sido enviado para revisión');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'No se pudo publicar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Publicar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Título del producto"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 120 } ]}
        placeholder="Descripción"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Precio"
        placeholderTextColor="#999"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría (ej. Smartphones, Laptops)"
        placeholderTextColor="#999"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Condición (Nuevo, Usado, etc.)"
        placeholderTextColor="#999"
        value={condition}
        onChangeText={setCondition}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handlePublish}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Publicar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
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
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SellProductScreen;