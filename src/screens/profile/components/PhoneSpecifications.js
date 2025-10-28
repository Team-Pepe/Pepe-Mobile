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
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
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
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Procesador</Text>
        <TextInput
          style={styles.input}
          value={specifications.processor}
          onChangeText={(value) => handleChange('processor', value)}
          placeholder="Ej: Apple A17 Pro, Snapdragon 8 Gen 3"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>RAM (GB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.ram_gb}
          onChangeText={(value) => handleChange('ram_gb', value)}
          placeholder="Ej: 8"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Almacenamiento (GB)</Text>
        <Picker
          selectedValue={specifications.storage_gb}
          onValueChange={(value) => handleChange('storage_gb', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar capacidad..." value="" />
          <Picker.Item label="64 GB" value="64" />
          <Picker.Item label="128 GB" value="128" />
          <Picker.Item label="256 GB" value="256" />
          <Picker.Item label="512 GB" value="512" />
          <Picker.Item label="1 TB" value="1024" />
          <Picker.Item label="2 TB" value="2048" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cámara Principal</Text>
        <TextInput
          style={styles.input}
          value={specifications.main_camera_mp}
          onChangeText={(value) => handleChange('main_camera_mp', value)}
          placeholder="Ej: 48MP + 12MP + 12MP"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Batería (mAh)</Text>
        <TextInput
          style={styles.input}
          value={specifications.battery_mah}
          onChangeText={(value) => handleChange('battery_mah', value)}
          placeholder="Ej: 4422"
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
          <Picker.Item label="iOS 17" value="iOS 17" />
          <Picker.Item label="iOS 16" value="iOS 16" />
          <Picker.Item label="Android 14" value="Android 14" />
          <Picker.Item label="Android 13" value="Android 13" />
          <Picker.Item label="Android 12" value="Android 12" />
          <Picker.Item label="HarmonyOS" value="HarmonyOS" />
          <Picker.Item label="One UI" value="One UI" />
          <Picker.Item label="MIUI" value="MIUI" />
          <Picker.Item label="ColorOS" value="ColorOS" />
          <Picker.Item label="OxygenOS" value="OxygenOS" />
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

export default PhoneSpecifications;