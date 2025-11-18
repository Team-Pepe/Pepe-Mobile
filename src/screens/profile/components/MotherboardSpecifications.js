import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Opciones de socket (mismo listado que en CpuSpecifications)
const socketOptions = [
  { label: 'Selecciona un socket', value: '' },
  { label: 'LGA 1151', value: 'LGA 1151' },
  { label: 'LGA 1200', value: 'LGA 1200' },
  { label: 'LGA 1700', value: 'LGA 1700' },
  { label: 'LGA 2066', value: 'LGA 2066' },
  { label: 'AM4', value: 'AM4' },
  { label: 'AM5', value: 'AM5' },
  { label: 'TR4', value: 'TR4' },
  { label: 'sTRX4', value: 'sTRX4' },
  { label: 'LGA 4094', value: 'LGA 4094' },
  { label: 'PGA 988', value: 'PGA 988' },
  { label: 'PGA FM2+', value: 'PGA FM2+' },
  { label: 'BGA', value: 'BGA' },
  { label: 'Otro', value: 'Otro' }
];

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
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Socket</Text>
        <Picker
          selectedValue={specifications.socket}
          onValueChange={(value) => handleChange('socket', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          {socketOptions.map((option, index) => (
            <Picker.Item
              key={index}
              label={option.label}
              value={option.value}
              color={option.value === '' ? '#999' : '#ffffff'}
              style={{ backgroundColor: '#2c2c2c' }}
            />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Chipset"
        placeholderTextColor="#999"
        value={specifications.chipset}
        onChangeText={(value) => handleChange('chipset', value)}
      />

      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Factor de forma</Text>
        <Picker
          selectedValue={specifications.form_factor}
          onValueChange={(value) => handleChange('form_factor', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Selecciona factor de forma" value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="ATX" value="ATX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Micro-ATX" value="Micro-ATX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Mini-ITX" value="Mini-ITX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="Otro" value="Otro" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

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
  pickerWrapper: {
    marginBottom: 12,
  },
  pickerLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  picker: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
});

export default MotherboardSpecifications;