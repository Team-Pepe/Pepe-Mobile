import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CaseSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    motherboard_formats: [],
    bays_35: '',
    bays_25: '',
    expansion_slots: '',
    max_gpu_length_mm: '',
    max_cooler_height_mm: '',
    psu_type: '',
    included_fans: '',
    material: ''
  });

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const handleFormatsChange = (value) => {
    // Convertir string separado por comas a array
    const formatsArray = value.split(',').map(format => format.trim()).filter(format => format);
    handleChange('motherboard_formats', formatsArray);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Gabinete</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Formatos de Motherboard (separados por coma)</Text>
        <TextInput
          style={styles.input}
          value={specifications.motherboard_formats.join(', ')}
          onChangeText={handleFormatsChange}
          placeholder="Ej: ATX, Micro-ATX, Mini-ITX"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bahías 3.5"</Text>
        <TextInput
          style={styles.input}
          value={specifications.bays_35}
          onChangeText={(value) => handleChange('bays_35', value)}
          placeholder="Ej: 2"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bahías 2.5"</Text>
        <TextInput
          style={styles.input}
          value={specifications.bays_25}
          onChangeText={(value) => handleChange('bays_25', value)}
          placeholder="Ej: 4"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Slots de Expansión</Text>
        <TextInput
          style={styles.input}
          value={specifications.expansion_slots}
          onChangeText={(value) => handleChange('expansion_slots', value)}
          placeholder="Ej: 7"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Longitud Máxima GPU (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.max_gpu_length_mm}
          onChangeText={(value) => handleChange('max_gpu_length_mm', value)}
          placeholder="Ej: 330"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Altura Máxima Cooler (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.max_cooler_height_mm}
          onChangeText={(value) => handleChange('max_cooler_height_mm', value)}
          placeholder="Ej: 165"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de PSU</Text>
        <Picker
          selectedValue={specifications.psu_type}
          onValueChange={(value) => handleChange('psu_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="ATX" value="ATX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="SFX" value="SFX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="SFX-L" value="SFX-L" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="TFX" value="TFX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ventiladores Incluidos</Text>
        <TextInput
          style={styles.input}
          value={specifications.included_fans}
          onChangeText={(value) => handleChange('included_fans', value)}
          placeholder="Ej: 3"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Material</Text>
        <TextInput
          style={styles.input}
          value={specifications.material}
          onChangeText={(value) => handleChange('material', value)}
          placeholder="Ej: Acero, Aluminio, Vidrio templado"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ffffff',
    textAlign: 'center',
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
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 45,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  picker: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
});

export default CaseSpecifications;