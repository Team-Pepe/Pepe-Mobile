import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const PsuSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    power_w: '',
    efficiency_certification: '',
    modular_type: '',
    form_factor: '',
    connectors: '',
    fan_size_mm: '',
    active_pfc: false
  });

  const handleChange = (field, value) => {
    const newSpecs = { ...specifications, [field]: value };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  const toggleBoolean = (field) => {
    handleChange(field, !specifications[field]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones de Fuente de Poder</Text>
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Potencia (W)"
          placeholderTextColor="#999"
          value={specifications.power_w}
          onChangeText={(value) => handleChange('power_w', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Certificación"
          placeholderTextColor="#999"
          value={specifications.efficiency_certification}
          onChangeText={(value) => handleChange('efficiency_certification', value)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Tipo modular"
          placeholderTextColor="#999"
          value={specifications.modular_type}
          onChangeText={(value) => handleChange('modular_type', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Factor de forma"
          placeholderTextColor="#999"
          value={specifications.form_factor}
          onChangeText={(value) => handleChange('form_factor', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Conectores (ej: 24-pin ATX, 8-pin CPU, 6+2-pin PCIe)"
        placeholderTextColor="#999"
        value={specifications.connectors}
        onChangeText={(value) => handleChange('connectors', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Tamaño del ventilador (mm)"
        placeholderTextColor="#999"
        value={specifications.fan_size_mm}
        onChangeText={(value) => handleChange('fan_size_mm', value)}
        keyboardType="numeric"
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={() => toggleBoolean('active_pfc')}
        >
          <View style={[styles.checkboxBox, specifications.active_pfc && styles.checkboxChecked]}>
            {specifications.active_pfc && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>PFC Activo</Text>
        </TouchableOpacity>
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
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4a4a4a',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#ffffff',
    fontSize: 14,
  },
});

export default PsuSpecifications;