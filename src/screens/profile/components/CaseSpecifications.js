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
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bahías 3.5"</Text>
        <TextInput
          style={styles.input}
          value={specifications.bays_35}
          onChangeText={(value) => handleChange('bays_35', value)}
          placeholder="Ej: 2"
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
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de PSU</Text>
        <Picker
          selectedValue={specifications.psu_type}
          onValueChange={(value) => handleChange('psu_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="ATX" value="ATX" />
          <Picker.Item label="SFX" value="SFX" />
          <Picker.Item label="SFX-L" value="SFX-L" />
          <Picker.Item label="TFX" value="TFX" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ventiladores Incluidos</Text>
        <TextInput
          style={styles.input}
          value={specifications.included_fans}
          onChangeText={(value) => handleChange('included_fans', value)}
          placeholder="Ej: 3"
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

export default CaseSpecifications;