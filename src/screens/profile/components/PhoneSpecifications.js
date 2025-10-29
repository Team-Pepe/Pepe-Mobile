import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PhoneSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    screen_inches: '',
    resolution: '',
    processor: '',
    ram_gb: '',
    storage_gb: '',
    main_camera_mp: '',
    battery_mah: '',
    operating_system: ''
  });

  const handleChange = (field, value) => {
    // Validar y limpiar valores numéricos
    let processedValue = value;
    
    // Validaciones para campos numéricos
    if (['ram_gb', 'storage_gb', 'battery_mah', 'screen_inches'].includes(field)) {
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
        if (numValue > 32) {
          Alert.alert('Advertencia', 'La cantidad de RAM parece inusualmente alta para un teléfono. ¿Está seguro?');
        }
      }
      
      if (field === 'storage_gb') {
        // Solo números enteros para almacenamiento
        processedValue = processedValue.replace(/\./g, '');
        const numValue = parseInt(processedValue) || 0;
        
        // Validación de overflow PostgreSQL
        if (numValue > 2147483647) {
          Alert.alert('Error', 'La capacidad de almacenamiento no puede exceder 2,147,483,647 GB');
          processedValue = '2147483647';
        }
        
        // Alerta para valores inusuales
        if (numValue > 2048) {
          Alert.alert('Advertencia', 'La capacidad de almacenamiento parece inusualmente alta. ¿Está seguro?');
        }
      }
      
      if (field === 'battery_mah') {
        // Solo números enteros para batería
        processedValue = processedValue.replace(/\./g, '');
        const numValue = parseInt(processedValue) || 0;
        
        // Validación de overflow PostgreSQL
        if (numValue > 2147483647) {
          Alert.alert('Error', 'La capacidad de la batería no puede exceder 2,147,483,647 mAh');
          processedValue = '2147483647';
        }
        
        // Alerta para valores inusuales
        if (numValue > 10000) {
          Alert.alert('Advertencia', 'La capacidad de la batería parece inusualmente alta para un teléfono. ¿Está seguro?');
        }
      }
      
      if (field === 'screen_inches') {
        // Permitir decimales para tamaño de pantalla
        const parts = processedValue.split('.');
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        const numValue = parseFloat(processedValue) || 0;
        if (numValue > 20) {
          Alert.alert('Advertencia', 'El tamaño de pantalla parece inusualmente grande para un teléfono. ¿Está seguro?');
        }
        
        // Limitar a 1 decimal
        if (processedValue.includes('.')) {
          const [integer, decimal] = processedValue.split('.');
          processedValue = integer + '.' + (decimal || '').substring(0, 1);
        }
      }
    }
    
    const newSpecs = { ...specifications, [field]: processedValue };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Teléfono</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tamaño de Pantalla (pulgadas)</Text>
        <TextInput
          style={styles.input}
          value={specifications.screen_inches}
          onChangeText={(value) => handleChange('screen_inches', value)}
          placeholder="Ej: 6.7"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resolución</Text>
        <TextInput
          style={styles.input}
          value={specifications.resolution}
          onChangeText={(value) => handleChange('resolution', value)}
          placeholder="Ej: 2778x1284"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Procesador</Text>
        <TextInput
          style={styles.input}
          value={specifications.processor}
          onChangeText={(value) => handleChange('processor', value)}
          placeholder="Ej: Apple A17 Pro, Snapdragon 8 Gen 3"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RAM (GB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.ram_gb}
          onChangeText={(value) => handleChange('ram_gb', value)}
          placeholder="Ej: 8"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Almacenamiento (GB)</Text>
        <Picker
          selectedValue={specifications.storage_gb}
          onValueChange={(value) => handleChange('storage_gb', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar capacidad..." value="" color="#999" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="64 GB" value="64" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="128 GB" value="128" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="256 GB" value="256" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="512 GB" value="512" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="1 TB" value="1024" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="2 TB" value="2048" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cámara Principal</Text>
        <TextInput
          style={styles.input}
          value={specifications.main_camera_mp}
          onChangeText={(value) => handleChange('main_camera_mp', value)}
          placeholder="Ej: 48MP + 12MP + 12MP"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Batería (mAh)</Text>
        <TextInput
          style={styles.input}
          value={specifications.battery_mah}
          onChangeText={(value) => handleChange('battery_mah', value)}
          placeholder="Ej: 4422"
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
          <Picker.Item label="Seleccionar SO..." value="" color="#999" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="iOS 17" value="iOS 17" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="iOS 16" value="iOS 16" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Android 14" value="Android 14" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Android 13" value="Android 13" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Android 12" value="Android 12" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="HarmonyOS" value="HarmonyOS" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="One UI" value="One UI" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="MIUI" value="MIUI" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="ColorOS" value="ColorOS" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="OxygenOS" value="OxygenOS" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
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

export default PhoneSpecifications;