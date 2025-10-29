import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
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
    let processedValue = value;
    
    // Validaciones para campos numéricos
    if (['ram_gb', 'battery_wh', 'screen_inches', 'weight_kg'].includes(field)) {
      // Limpiar entrada para permitir solo números y punto decimal
      processedValue = value.replace(/[^0-9.]/g, '');
      
      // Validaciones específicas por campo
      if (field === 'ram_gb') {
        // Solo números enteros para RAM
        processedValue = processedValue.replace(/\./g, '');
        const numValue = parseInt(processedValue) || 0;
        
        // Validación de overflow PostgreSQL
        if (numValue > 2147483647) {
          Alert.alert('Error', 'La cantidad de RAM no puede exceder 2,147,483,647 GB');
          processedValue = '2147483647';
        }
        
        // Alerta para valores inusuales
        if (numValue > 1024) {
          Alert.alert('Advertencia', 'La cantidad de RAM parece inusualmente alta. ¿Está seguro?');
        }
      }
      
      if (field === 'battery_wh') {
        // Solo números enteros para batería
        processedValue = processedValue.replace(/\./g, '');
        const numValue = parseInt(processedValue) || 0;
        
        // Validación de overflow PostgreSQL
        if (numValue > 2147483647) {
          Alert.alert('Error', 'La capacidad de la batería no puede exceder 2,147,483,647 Wh');
          processedValue = '2147483647';
        }
        
        // Alerta para valores inusuales
        if (numValue > 200) {
          Alert.alert('Advertencia', 'La capacidad de la batería parece inusualmente alta. ¿Está seguro?');
        }
      }
      
      if (field === 'screen_inches') {
        // Permitir decimales para tamaño de pantalla
        const parts = processedValue.split('.');
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        const numValue = parseFloat(processedValue) || 0;
        if (numValue > 999) {
          Alert.alert('Advertencia', 'El tamaño de pantalla parece inusualmente grande. ¿Está seguro?');
        }
        
        // Limitar a 1 decimal
        if (processedValue.includes('.')) {
          const [integer, decimal] = processedValue.split('.');
          processedValue = integer + '.' + (decimal || '').substring(0, 1);
        }
      }
      
      if (field === 'weight_kg') {
        // Permitir decimales para peso
        const parts = processedValue.split('.');
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        const numValue = parseFloat(processedValue) || 0;
        if (numValue > 50) {
          Alert.alert('Advertencia', 'El peso parece inusualmente alto para un laptop. ¿Está seguro?');
        }
        
        // Limitar a 2 decimales
        if (processedValue.includes('.')) {
          const [integer, decimal] = processedValue.split('.');
          processedValue = integer + '.' + (decimal || '').substring(0, 2);
        }
      }
    }
    
    const updatedSpecs = { ...specifications, [field]: processedValue };
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
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RAM (GB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.ram_gb}
          onChangeText={(value) => handleChange('ram_gb', value)}
          placeholder="Ej: 16"
          placeholderTextColor="#999"
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
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tamaño de Pantalla (pulgadas)</Text>
        <TextInput
          style={styles.input}
          value={specifications.screen_inches}
          onChangeText={(value) => handleChange('screen_inches', value)}
          placeholder="Ej: 15.6"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resolución</Text>
        <Picker
          selectedValue={specifications.resolution}
          onValueChange={(value) => handleChange('resolution', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar resolución..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="1920x1080 (Full HD)" value="1920x1080" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="2560x1440 (2K/QHD)" value="2560x1440" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="3840x2160 (4K/UHD)" value="3840x2160" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="1366x768 (HD)" value="1366x768" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="2880x1800 (Retina)" value="2880x1800" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tarjeta Gráfica</Text>
        <TextInput
          style={styles.input}
          value={specifications.graphics_card}
          onChangeText={(value) => handleChange('graphics_card', value)}
          placeholder="Ej: NVIDIA RTX 4060 8GB"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={specifications.weight_kg}
          onChangeText={(value) => handleChange('weight_kg', value)}
          placeholder="Ej: 2.1"
          placeholderTextColor="#999"
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
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sistema Operativo</Text>
        <Picker
          selectedValue={specifications.operating_system}
          onValueChange={(value) => handleChange('operating_system', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar SO..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Windows 11 Home" value="Windows 11 Home" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Windows 11 Pro" value="Windows 11 Pro" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Windows 10 Home" value="Windows 10 Home" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Windows 10 Pro" value="Windows 10 Pro" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="macOS" value="macOS" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Ubuntu Linux" value="Ubuntu Linux" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Chrome OS" value="Chrome OS" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Sin SO" value="No OS" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
});

export default LaptopSpecifications;