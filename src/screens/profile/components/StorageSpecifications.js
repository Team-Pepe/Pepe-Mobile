import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const StorageSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    type: '',
    capacity_gb: '',
    interface: '',
    read_speed_mbs: '',
    write_speed_mbs: '',
    form_factor: '',
    nand_type: '',
    tbw: ''
  });

  const handleChange = (field, value) => {
    // Validaciones para campos numéricos
    if (['capacity_gb', 'read_speed_mbs', 'write_speed_mbs', 'tbw'].includes(field)) {
      const numValue = parseFloat(value);
      
      // Validar overflow de integer
      if (numValue > 2147483647) {
        switch (field) {
          case 'capacity_gb':
            Alert.alert('Error', 'La capacidad no puede exceder 2,147,483,647 GB');
            return;
          case 'read_speed_mbs':
            Alert.alert('Error', 'La velocidad de lectura no puede exceder 2,147,483,647 MB/s');
            return;
          case 'write_speed_mbs':
            Alert.alert('Error', 'La velocidad de escritura no puede exceder 2,147,483,647 MB/s');
            return;
          case 'tbw':
            Alert.alert('Error', 'El TBW no puede exceder 2,147,483,647');
            return;
        }
      }
      
      // Validaciones prácticas
      if (field === 'capacity_gb' && numValue > 100000) {
        Alert.alert('Advertencia', 'La capacidad parece muy alta. ¿Está seguro?');
      }
      if ((field === 'read_speed_mbs' || field === 'write_speed_mbs') && numValue > 50000) {
        Alert.alert('Advertencia', 'La velocidad parece muy alta para almacenamiento actual.');
      }
      if (field === 'tbw' && numValue > 10000) {
        Alert.alert('Advertencia', 'El TBW parece muy alto para almacenamiento típico.');
      }
    }
    
    const newSpecs = { ...specifications, [field]: value };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  const storageTypes = [
    { label: 'Seleccionar tipo', value: '' },
    { label: 'SSD', value: 'SSD' },
    { label: 'HDD', value: 'HDD' },
    { label: 'NVMe SSD', value: 'NVMe SSD' },
    { label: 'SATA SSD', value: 'SATA SSD' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones de Almacenamiento</Text>
      
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Tipo de almacenamiento</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={specifications.type}
            onValueChange={(value) => handleChange('type', value)}
            style={styles.picker}
            dropdownIconColor="#ffffff"
          >
            {storageTypes.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
        </View>
      </View>

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
          placeholder="Interfaz (SATA/PCIe)"
          placeholderTextColor="#999"
          value={specifications.interface}
          onChangeText={(value) => handleChange('interface', value)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Lectura (MB/s)"
          placeholderTextColor="#999"
          value={specifications.read_speed_mbs}
          onChangeText={(value) => handleChange('read_speed_mbs', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Escritura (MB/s)"
          placeholderTextColor="#999"
          value={specifications.write_speed_mbs}
          onChangeText={(value) => handleChange('write_speed_mbs', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Factor de forma"
          placeholderTextColor="#999"
          value={specifications.form_factor}
          onChangeText={(value) => handleChange('form_factor', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Tipo NAND"
          placeholderTextColor="#999"
          value={specifications.nand_type}
          onChangeText={(value) => handleChange('nand_type', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="TBW (Terabytes Written)"
        placeholderTextColor="#999"
        value={specifications.tbw}
        onChangeText={(value) => handleChange('tbw', value)}
        keyboardType="numeric"
      />
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    height: 60,
  },
});

export default StorageSpecifications;