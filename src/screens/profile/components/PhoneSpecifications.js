import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
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
    
    // Campos numéricos enteros con límites específicos
    if (field === 'battery_mah') {
      // Remover caracteres no numéricos
      processedValue = value.replace(/[^0-9]/g, '');
      
      // Aplicar límite específico
      const numValue = parseInt(processedValue) || 0;
      processedValue = Math.min(numValue, 50000).toString(); // Máximo 50,000 mAh
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