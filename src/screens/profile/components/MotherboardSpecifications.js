import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const MotherboardSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    socket: '',
    chipset: '',
    form_factor: '',
    ram_slots: '',
    ram_type: '',
    m2_ports: '',
    sata_ports: '',
    usb_ports: '',
    audio: '',
    network: ''
  });

  const handleChange = (field, value) => {
    const newSpecs = { ...specifications, [field]: value };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones de Placa Base</Text>
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Socket (AM4/LGA1700)"
          placeholderTextColor="#999"
          value={specifications.socket}
          onChangeText={(value) => handleChange('socket', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Chipset"
          placeholderTextColor="#999"
          value={specifications.chipset}
          onChangeText={(value) => handleChange('chipset', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Factor de forma (ATX/Micro-ATX/Mini-ITX)"
        placeholderTextColor="#999"
        value={specifications.form_factor}
        onChangeText={(value) => handleChange('form_factor', value)}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Slots RAM"
          placeholderTextColor="#999"
          value={specifications.ram_slots}
          onChangeText={(value) => handleChange('ram_slots', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Tipo RAM"
          placeholderTextColor="#999"
          value={specifications.ram_type}
          onChangeText={(value) => handleChange('ram_type', value)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Puertos M.2"
          placeholderTextColor="#999"
          value={specifications.m2_ports}
          onChangeText={(value) => handleChange('m2_ports', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Puertos SATA"
          placeholderTextColor="#999"
          value={specifications.sata_ports}
          onChangeText={(value) => handleChange('sata_ports', value)}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Puertos USB (ej: 4x USB 3.0, 2x USB-C)"
        placeholderTextColor="#999"
        value={specifications.usb_ports}
        onChangeText={(value) => handleChange('usb_ports', value)}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Audio"
          placeholderTextColor="#999"
          value={specifications.audio}
          onChangeText={(value) => handleChange('audio', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Red"
          placeholderTextColor="#999"
          value={specifications.network}
          onChangeText={(value) => handleChange('network', value)}
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
});

export default MotherboardSpecifications;