import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CoolerSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    cooler_type: '',
    compatible_sockets: [],
    height_mm: '',
    rpm_range: '',
    noise_level_db: '',
    tdp_w: ''
  });

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const handleSocketsChange = (value) => {
    // Convertir string separado por comas a array
    const socketsArray = value.split(',').map(socket => socket.trim()).filter(socket => socket);
    handleChange('compatible_sockets', socketsArray);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Cooler</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Cooler</Text>
        <Picker
          selectedValue={specifications.cooler_type}
          onValueChange={(value) => handleChange('cooler_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Aire" value="air" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Líquido AIO" value="aio" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Líquido Custom" value="custom" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Pasivo" value="passive" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sockets Compatibles (separados por coma)</Text>
        <TextInput
          style={styles.input}
          value={specifications.compatible_sockets.join(', ')}
          onChangeText={handleSocketsChange}
          placeholder="Ej: AM4, AM5, LGA1700"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Altura (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.height_mm}
          onChangeText={(value) => handleChange('height_mm', value)}
          placeholder="Ej: 155"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Rango de RPM</Text>
        <TextInput
          style={styles.input}
          value={specifications.rpm_range}
          onChangeText={(value) => handleChange('rpm_range', value)}
          placeholder="Ej: 800-2000"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nivel de Ruido (dB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.noise_level_db}
          onChangeText={(value) => handleChange('noise_level_db', value)}
          placeholder="Ej: 25.5"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>TDP Máximo (W)</Text>
        <TextInput
          style={styles.input}
          value={specifications.tdp_w}
          onChangeText={(value) => handleChange('tdp_w', value)}
          placeholder="Ej: 180"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
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

export default CoolerSpecifications;