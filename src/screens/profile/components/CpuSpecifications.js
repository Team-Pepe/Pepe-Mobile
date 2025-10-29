import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CpuSpecifications = ({ onChange }) => {
  // Lista de opciones de socket para procesadores
  const socketOptions = [
    { label: 'Selecciona un socket', value: '' },
    // Sockets LGA (Intel)
    { label: 'LGA 1151', value: 'LGA 1151' },
    { label: 'LGA 1200', value: 'LGA 1200' },
    { label: 'LGA 1700', value: 'LGA 1700' },
    { label: 'LGA 2066', value: 'LGA 2066' },
    // Sockets AMD
    { label: 'AM4', value: 'AM4' },
    { label: 'AM5', value: 'AM5' },
    { label: 'TR4', value: 'TR4' },
    { label: 'sTRX4', value: 'sTRX4' },
    { label: 'LGA 4094', value: 'LGA 4094' },
    // Sockets PGA
    { label: 'PGA 988', value: 'PGA 988' },
    { label: 'PGA FM2+', value: 'PGA FM2+' },
    // Sockets BGA
    { label: 'BGA', value: 'BGA' },
    // Otros
    { label: 'Otro', value: 'Otro' }
  ];

  const [specifications, setSpecifications] = useState({
    socket: '',
    cores: '',
    threads: '',
    base_frequency_ghz: '',
    boost_frequency_ghz: '',
    cache_l3: '',
    tdp: '',
    integrated_graphics: '',
    fabrication_technology_nm: ''
  });

  const handleChange = (field, value) => {
    // Validar y limpiar valores numéricos
    let processedValue = value;
    
    // Campos numéricos enteros con límites específicos
    if (['cores', 'threads', 'cache_l3', 'tdp', 'fabrication_technology_nm'].includes(field)) {
      // Remover caracteres no numéricos
      processedValue = value.replace(/[^0-9]/g, '');
      
      // Aplicar límites específicos por campo
      const numValue = parseInt(processedValue) || 0;
      switch(field) {
        case 'cores':
        case 'threads':
          processedValue = Math.min(numValue, 128).toString(); // Máximo 128 cores/threads
          break;
        case 'cache_l3':
          processedValue = Math.min(numValue, 512).toString(); // Máximo 512MB cache
          break;
        case 'tdp':
          processedValue = Math.min(numValue, 1000).toString(); // Máximo 1000W TDP
          break;
        case 'fabrication_technology_nm':
          processedValue = Math.min(numValue, 1000).toString(); // Máximo 1000nm
          break;
      }
    }
    
    // Campos decimales (frecuencias)
    if (['base_frequency_ghz', 'boost_frequency_ghz'].includes(field)) {
      // Permitir solo números y un punto decimal
      processedValue = value.replace(/[^0-9.]/g, '');
      
      // Asegurar solo un punto decimal
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limitar a 2 decimales y valor máximo
      const numValue = parseFloat(processedValue) || 0;
      if (numValue > 10) { // Máximo 10 GHz
        processedValue = '10.00';
      } else if (processedValue.includes('.')) {
        const [integer, decimal] = processedValue.split('.');
        processedValue = integer + '.' + (decimal || '').substring(0, 2);
      }
    }
    
    const newSpecs = { ...specifications, [field]: processedValue };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Procesador</Text>
      
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

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Núcleos"
          placeholderTextColor="#999"
          value={specifications.cores}
          onChangeText={(value) => handleChange('cores', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Hilos"
          placeholderTextColor="#999"
          value={specifications.threads}
          onChangeText={(value) => handleChange('threads', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Freq. Base (GHz)"
          placeholderTextColor="#999"
          value={specifications.base_frequency_ghz}
          onChangeText={(value) => handleChange('base_frequency_ghz', value)}
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Freq. Boost (GHz)"
          placeholderTextColor="#999"
          value={specifications.boost_frequency_ghz}
          onChangeText={(value) => handleChange('boost_frequency_ghz', value)}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Cache L3 (MB)"
          placeholderTextColor="#999"
          value={specifications.cache_l3}
          onChangeText={(value) => handleChange('cache_l3', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="TDP (W)"
          placeholderTextColor="#999"
          value={specifications.tdp}
          onChangeText={(value) => handleChange('tdp', value)}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Gráficos integrados (opcional)"
        placeholderTextColor="#999"
        value={specifications.integrated_graphics}
        onChangeText={(value) => handleChange('integrated_graphics', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Tecnología de fabricación (nm)"
        placeholderTextColor="#999"
        value={specifications.fabrication_technology_nm}
        onChangeText={(value) => handleChange('fabrication_technology_nm', value)}
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
  pickerWrapper: {
    marginBottom: 12,
  },
  pickerLabel: {
    color: '#ffffff',
    fontSize: 16,
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

export default CpuSpecifications;