import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const RamSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    capacity_gb: '',
    type: '',
    speed_mhz: '',
    latency: '',
    modules: '2',
    voltage: '',
    heat_spreader: false,
    rgb_lighting: false
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
      <Text style={styles.title}>Especificaciones de Memoria RAM</Text>
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Capacidad (GB)"
          placeholderTextColor="#999"
          value={specifications.capacity_gb}
          onChangeText={(value) => handleChange('capacity_gb', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Tipo (DDR4/DDR5)"
          placeholderTextColor="#999"
          value={specifications.type}
          onChangeText={(value) => handleChange('type', value)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Velocidad (MHz)"
          placeholderTextColor="#999"
          value={specifications.speed_mhz}
          onChangeText={(value) => handleChange('speed_mhz', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Latencia (ej: CL16)"
          placeholderTextColor="#999"
          value={specifications.latency}
          onChangeText={(value) => handleChange('latency', value)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Módulos"
          placeholderTextColor="#999"
          value={specifications.modules}
          onChangeText={(value) => handleChange('modules', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Voltaje (V)"
          placeholderTextColor="#999"
          value={specifications.voltage}
          onChangeText={(value) => handleChange('voltage', value)}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.checkboxContainer}>
        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={() => toggleBoolean('heat_spreader')}
        >
          <View style={[styles.checkboxBox, specifications.heat_spreader && styles.checkboxChecked]}>
            {specifications.heat_spreader && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Disipador de calor</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={() => toggleBoolean('rgb_lighting')}
        >
          <View style={[styles.checkboxBox, specifications.rgb_lighting && styles.checkboxChecked]}>
            {specifications.rgb_lighting && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Iluminación RGB</Text>
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

export default RamSpecifications;