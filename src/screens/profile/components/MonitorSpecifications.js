import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MonitorSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    screen_inches: '',
    resolution: '',
    refresh_rate_hz: '',
    panel_type: '',
    response_time_ms: '',
    connectors: {},
    curved: false
  });

  const handleChange = (field, value) => {
    // Validar y limpiar valores numéricos
    let processedValue = value;
    
    // Campos numéricos enteros con límites específicos
    if (['refresh_rate_hz', 'response_time_ms'].includes(field)) {
      // Remover caracteres no numéricos
      processedValue = value.replace(/[^0-9]/g, '');
      
      // Aplicar límites específicos por campo
      const numValue = parseInt(processedValue) || 0;
      switch(field) {
        case 'refresh_rate_hz':
          processedValue = Math.min(numValue, 1000).toString(); // Máximo 1000Hz
          break;
        case 'response_time_ms':
          processedValue = Math.min(numValue, 100).toString(); // Máximo 100ms
          break;
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

  const handleConnectorsChange = (value) => {
    try {
      // Intentar parsear como JSON, si falla, crear objeto simple
      const connectorsObj = value ? JSON.parse(value) : {};
      handleChange('connectors', connectorsObj);
    } catch (error) {
      // Si no es JSON válido, crear objeto con el valor como string
      const connectorsObj = { description: value };
      handleChange('connectors', connectorsObj);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Monitor</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tamaño de Pantalla (pulgadas)</Text>
        <TextInput
          style={styles.input}
          value={specifications.screen_inches}
          onChangeText={(value) => handleChange('screen_inches', value)}
          placeholder="Ej: 27"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resolución</Text>
        <Picker
          selectedValue={specifications.resolution}
          onValueChange={(value) => handleChange('resolution', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar resolución..." value="" />
          <Picker.Item label="1920x1080 (Full HD)" value="1920x1080" />
          <Picker.Item label="2560x1440 (2K/QHD)" value="2560x1440" />
          <Picker.Item label="3840x2160 (4K/UHD)" value="3840x2160" />
          <Picker.Item label="1366x768 (HD)" value="1366x768" />
          <Picker.Item label="3440x1440 (Ultrawide QHD)" value="3440x1440" />
          <Picker.Item label="2560x1080 (Ultrawide FHD)" value="2560x1080" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Frecuencia de Actualización (Hz)</Text>
        <TextInput
          style={styles.input}
          value={specifications.refresh_rate_hz}
          onChangeText={(value) => handleChange('refresh_rate_hz', value)}
          placeholder="Ej: 144"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Panel</Text>
        <Picker
          selectedValue={specifications.panel_type}
          onValueChange={(value) => handleChange('panel_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="IPS" value="IPS" />
          <Picker.Item label="TN" value="TN" />
          <Picker.Item label="VA" value="VA" />
          <Picker.Item label="OLED" value="OLED" />
          <Picker.Item label="QLED" value="QLED" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tiempo de Respuesta (ms)</Text>
        <TextInput
          style={styles.input}
          value={specifications.response_time_ms}
          onChangeText={(value) => handleChange('response_time_ms', value)}
          placeholder="Ej: 1"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Conectores (JSON o descripción)</Text>
        <TextInput
          style={styles.input}
          value={typeof specifications.connectors === 'object' ? 
            JSON.stringify(specifications.connectors) : specifications.connectors}
          onChangeText={handleConnectorsChange}
          placeholder='Ej: {"HDMI": 2, "DisplayPort": 1, "USB-C": 1}'
          multiline
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Monitor Curvo</Text>
        <Switch
          value={specifications.curved}
          onValueChange={() => toggleBoolean('curved')}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={specifications.curved ? '#f5dd4b' : '#f4f3f4'}
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

export default MonitorSpecifications;