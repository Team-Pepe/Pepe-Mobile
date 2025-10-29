import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const RamSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    capacity_gb: '',
    type: '',
    speed_mhz: '',
    latency: '',
    modules: '',
    voltage: '',
    heat_spreader: false,
    rgb_lighting: false
  });

  const handleChange = (field, value) => {
    // Validar y limpiar valores numéricos
    let processedValue = value;
    
    // Campos numéricos enteros con límites específicos
    if (['capacity_gb', 'speed_mhz', 'modules'].includes(field)) {
      // Remover caracteres no numéricos
      processedValue = value.replace(/[^0-9]/g, '');
      
      // Aplicar límites específicos por campo
      const numValue = parseInt(processedValue) || 0;
      switch(field) {
        case 'capacity_gb':
          if (numValue > 2147483647) {
            Alert.alert('Error', 'La capacidad de RAM no puede exceder 2,147,483,647 GB');
            processedValue = '2147483647';
          } else {
            processedValue = Math.min(numValue, 1024).toString(); // Límite práctico 1TB RAM
          }
          break;
        case 'speed_mhz':
          if (numValue > 2147483647) {
            Alert.alert('Error', 'La velocidad de RAM no puede exceder 2,147,483,647 MHz');
            processedValue = '2147483647';
          } else {
            processedValue = Math.min(numValue, 10000).toString(); // Límite práctico 10000 MHz
          }
          break;
        case 'modules':
          if (numValue > 2147483647) {
            Alert.alert('Error', 'El número de módulos no puede exceder 2,147,483,647');
            processedValue = '2147483647';
          } else {
            processedValue = Math.min(numValue, 16).toString(); // Límite práctico 16 módulos
          }
          break;
      }
    }
    
    // Campos decimales (voltaje)
    if (field === 'voltage') {
      // Permitir solo números y un punto decimal
      processedValue = value.replace(/[^0-9.]/g, '');
      
      // Asegurar solo un punto decimal
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limitar a 2 decimales y valor máximo
      const numValue = parseFloat(processedValue) || 0;
      if (numValue > 5) { // Máximo 5V
        processedValue = '5.00';
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