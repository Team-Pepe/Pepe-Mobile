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
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="Aire" value="air" />
          <Picker.Item label="Líquido AIO" value="aio" />
          <Picker.Item label="Líquido Custom" value="custom" />
          <Picker.Item label="Pasivo" value="passive" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sockets Compatibles (separados por coma)</Text>
        <TextInput
          style={styles.input}
          value={specifications.compatible_sockets.join(', ')}
          onChangeText={handleSocketsChange}
          placeholder="Ej: AM4, AM5, LGA1700"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Altura (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.height_mm}
          onChangeText={(value) => handleChange('height_mm', value)}
          placeholder="Ej: 155"
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
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nivel de Ruido (dB)</Text>
        <TextInput
          style={styles.input}
          value={specifications.noise_level_db}
          onChangeText={(value) => handleChange('noise_level_db', value)}
          placeholder="Ej: 25.5"
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
          keyboardType="numeric"
        />
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

export default CoolerSpecifications;