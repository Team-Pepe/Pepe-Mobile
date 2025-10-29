import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CableSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    cable_type: '',
    length_m: '',
    connectors: '',
    version: '',
    shielded: false
  });

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const toggleBoolean = (field) => {
    handleChange(field, !specifications[field]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Cable</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Cable</Text>
        <Picker
          selectedValue={specifications.cable_type}
          onValueChange={(value) => handleChange('cable_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="HDMI" value="HDMI" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="DisplayPort" value="DisplayPort" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="USB-A" value="USB-A" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="USB-C" value="USB-C" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="USB-B" value="USB-B" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Ethernet" value="Ethernet" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Audio 3.5mm" value="Audio 3.5mm" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="VGA" value="VGA" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="DVI" value="DVI" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Thunderbolt" value="Thunderbolt" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="SATA" value="SATA" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Alimentación" value="Power" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Coaxial" value="Coaxial" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Longitud (metros)</Text>
        <TextInput
          style={styles.input}
          value={specifications.length_m}
          onChangeText={(value) => handleChange('length_m', value)}
          placeholder="Ej: 1.5"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Conectores</Text>
        <TextInput
          style={styles.input}
          value={specifications.connectors}
          onChangeText={(value) => handleChange('connectors', value)}
          placeholder="Ej: USB-A a USB-C, HDMI Macho a Macho"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Versión/Estándar</Text>
        <TextInput
          style={styles.input}
          value={specifications.version}
          onChangeText={(value) => handleChange('version', value)}
          placeholder="Ej: HDMI 2.1, USB 3.0, Cat6"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Cable Blindado</Text>
        <Switch
          value={specifications.shielded}
          onValueChange={() => toggleBoolean('shielded')}
          trackColor={{ false: '#3a3a3a', true: '#007AFF' }}
          thumbColor={specifications.shielded ? '#ffffff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});

export default CableSpecifications;