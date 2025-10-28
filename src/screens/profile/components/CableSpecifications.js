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
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="HDMI" value="HDMI" />
          <Picker.Item label="DisplayPort" value="DisplayPort" />
          <Picker.Item label="USB-A" value="USB-A" />
          <Picker.Item label="USB-C" value="USB-C" />
          <Picker.Item label="USB-B" value="USB-B" />
          <Picker.Item label="Ethernet" value="Ethernet" />
          <Picker.Item label="Audio 3.5mm" value="Audio 3.5mm" />
          <Picker.Item label="VGA" value="VGA" />
          <Picker.Item label="DVI" value="DVI" />
          <Picker.Item label="Thunderbolt" value="Thunderbolt" />
          <Picker.Item label="SATA" value="SATA" />
          <Picker.Item label="Alimentación" value="Power" />
          <Picker.Item label="Coaxial" value="Coaxial" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Longitud (metros)</Text>
        <TextInput
          style={styles.input}
          value={specifications.length_m}
          onChangeText={(value) => handleChange('length_m', value)}
          placeholder="Ej: 1.5"
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
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Versión/Estándar</Text>
        <TextInput
          style={styles.input}
          value={specifications.version}
          onChangeText={(value) => handleChange('version', value)}
          placeholder="Ej: HDMI 2.1, USB 3.0, Cat6"
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Cable Blindado</Text>
        <Switch
          value={specifications.shielded}
          onValueChange={() => toggleBoolean('shielded')}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={specifications.shielded ? '#f5dd4b' : '#f4f3f4'}
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default CableSpecifications;