import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const LaptopSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    processor: '',
    ram_gb: '',
    storage: '',
    screen_inches: '',
    resolution: '',
    graphics_card: '',
    weight_kg: '',
    battery_wh: '',
    operating_system: ''
  });

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Laptop</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Procesador</Text>
        <TextInput
          style={styles.input}
          value={specifications.processor}
          onChangeText={(value) => handleChange('processor', value)}
          placeholder="Ej: Intel Core i7-12700H"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RAM (GB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.ram_gb}
          onChangeText={(value) => handleChange('ram_gb', value)}
          placeholder="Ej: 16"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Almacenamiento</Text>
        <TextInput
          style={styles.input}
          value={specifications.storage}
          onChangeText={(value) => handleChange('storage', value)}
          placeholder="Ej: 512GB SSD NVMe"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tamaño de Pantalla (pulgadas)</Text>
        <TextInput
          style={styles.input}
          value={specifications.screen_inches}
          onChangeText={(value) => handleChange('screen_inches', value)}
          placeholder="Ej: 15.6"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resolución</Text>
        <Picker
          selectedValue={specifications.resolution}
          onValueChange={(value) => handleChange('resolution', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar resolución..." value="" />
          <Picker.Item label="1920x1080 (Full HD)" value="1920x1080" />
          <Picker.Item label="2560x1440 (2K/QHD)" value="2560x1440" />
          <Picker.Item label="3840x2160 (4K/UHD)" value="3840x2160" />
          <Picker.Item label="1366x768 (HD)" value="1366x768" />
          <Picker.Item label="2880x1800 (Retina)" value="2880x1800" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tarjeta Gráfica</Text>
        <TextInput
          style={styles.input}
          value={specifications.graphics_card}
          onChangeText={(value) => handleChange('graphics_card', value)}
          placeholder="Ej: NVIDIA RTX 4060 8GB"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={specifications.weight_kg}
          onChangeText={(value) => handleChange('weight_kg', value)}
          placeholder="Ej: 2.1"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Batería (Wh)</Text>
        <TextInput
          style={styles.input}
          value={specifications.battery_wh}
          onChangeText={(value) => handleChange('battery_wh', value)}
          placeholder="Ej: 80"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sistema Operativo</Text>
        <Picker
          selectedValue={specifications.operating_system}
          onValueChange={(value) => handleChange('operating_system', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar SO..." value="" />
          <Picker.Item label="Windows 11 Home" value="Windows 11 Home" />
          <Picker.Item label="Windows 11 Pro" value="Windows 11 Pro" />
          <Picker.Item label="Windows 10 Home" value="Windows 10 Home" />
          <Picker.Item label="Windows 10 Pro" value="Windows 10 Pro" />
          <Picker.Item label="macOS" value="macOS" />
          <Picker.Item label="Ubuntu Linux" value="Ubuntu Linux" />
          <Picker.Item label="Chrome OS" value="Chrome OS" />
          <Picker.Item label="Sin SO" value="No OS" />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default LaptopSpecifications;