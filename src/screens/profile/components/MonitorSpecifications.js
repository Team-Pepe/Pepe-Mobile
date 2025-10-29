import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
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

  // Tipos de conectores comunes en monitores con límites realistas
  const availableConnectors = [
    { type: 'HDMI', maxCount: 4 },
    { type: 'DisplayPort', maxCount: 2 },
    { type: 'USB-C', maxCount: 2 },
    { type: 'DVI', maxCount: 2 },
    { type: 'VGA', maxCount: 1 },
    { type: 'Thunderbolt', maxCount: 2 },
    { type: 'USB-A', maxCount: 4 },
    { type: 'Audio Jack', maxCount: 2 }
  ];

  const handleChange = (field, value) => {
    // Validar y limpiar valores numéricos
    let processedValue = value;
    
    // Campos numéricos enteros con límites específicos
    if (['refresh_rate_hz', 'response_time_ms'].includes(field)) {
      // Remover caracteres no numéricos
      processedValue = value.replace(/[^0-9]/g, '');
      
      // Validar overflow de PostgreSQL integer (2,147,483,647)
      const numValue = parseInt(processedValue) || 0;
      if (numValue > 2147483647) {
        Alert.alert(
          'Valor demasiado grande',
          `El valor para ${field === 'refresh_rate_hz' ? 'frecuencia de actualización' : 'tiempo de respuesta'} no puede exceder 2,147,483,647`
        );
        return;
      }
      
      // Aplicar límites específicos por campo y alertas para valores inusuales
      switch(field) {
        case 'refresh_rate_hz':
          if (numValue > 1000) {
            Alert.alert(
              'Valor inusual',
              'La frecuencia de actualización parece muy alta. ¿Estás seguro?'
            );
          }
          processedValue = numValue.toString();
          break;
        case 'response_time_ms':
          if (numValue > 100) {
            Alert.alert(
              'Valor inusual',
              'El tiempo de respuesta parece muy alto. ¿Estás seguro?'
            );
          }
          processedValue = numValue.toString();
          break;
      }
    }
    
    // Campo numérico decimal (screen_inches)
    if (field === 'screen_inches') {
      // Permitir números decimales
      processedValue = value.replace(/[^0-9.]/g, '');
      
      // Validar que solo haya un punto decimal
      const parts = processedValue.split('.');
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      const numValue = parseFloat(processedValue) || 0;
      if (numValue > 999) {
        Alert.alert(
          'Valor inusual',
          'El tamaño de pantalla parece muy grande. ¿Estás seguro?'
        );
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

  // Función para actualizar la cantidad de un conector específico
  const updateConnectorCount = (connectorType, change) => {
    const currentConnectors = { ...specifications.connectors };
    const currentCount = currentConnectors[connectorType] || 0;
    const newCount = Math.max(0, currentCount + change);
    
    // Encontrar el límite máximo para este tipo de conector
    const connectorInfo = availableConnectors.find(c => c.type === connectorType);
    const maxCount = connectorInfo ? connectorInfo.maxCount : 4;
    
    if (newCount > maxCount) {
      Alert.alert(
        'Límite alcanzado',
        `Un monitor típicamente no tiene más de ${maxCount} conectores ${connectorType}`
      );
      return;
    }
    
    if (newCount === 0) {
      delete currentConnectors[connectorType];
    } else {
      currentConnectors[connectorType] = newCount;
    }
    
    handleChange('connectors', currentConnectors);
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
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Resolución</Text>
        <Picker
          selectedValue={specifications.resolution}
          onValueChange={(value) => handleChange('resolution', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar resolución..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="1920x1080 (Full HD)" value="1920x1080" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="2560x1440 (2K/QHD)" value="2560x1440" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="3840x2160 (4K/UHD)" value="3840x2160" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="1366x768 (HD)" value="1366x768" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="3440x1440 (Ultrawide QHD)" value="3440x1440" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="2560x1080 (Ultrawide FHD)" value="2560x1080" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Frecuencia de Actualización (Hz)</Text>
        <TextInput
          style={styles.input}
          value={specifications.refresh_rate_hz}
          onChangeText={(value) => handleChange('refresh_rate_hz', value)}
          placeholder="Ej: 144"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Panel</Text>
        <Picker
          selectedValue={specifications.panel_type}
          onValueChange={(value) => handleChange('panel_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="IPS" value="IPS" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="TN" value="TN" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="VA" value="VA" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="OLED" value="OLED" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="QLED" value="QLED" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tiempo de Respuesta (ms)</Text>
        <TextInput
          style={styles.input}
          value={specifications.response_time_ms}
          onChangeText={(value) => handleChange('response_time_ms', value)}
          placeholder="Ej: 1"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Conectores del Monitor</Text>
        <Text style={styles.helpText}>Selecciona la cantidad de cada tipo de conector</Text>
        
        <View style={styles.connectorsContainer}>
          {availableConnectors.map((connector) => {
            const currentCount = specifications.connectors[connector.type] || 0;
            return (
              <View key={connector.type} style={styles.connectorRow}>
                <Text style={styles.connectorLabel}>{connector.type}</Text>
                <View style={styles.connectorControls}>
                  <TouchableOpacity
                    style={[styles.connectorButton, currentCount === 0 && styles.disabledButton]}
                    onPress={() => updateConnectorCount(connector.type, -1)}
                    disabled={currentCount === 0}
                  >
                    <Text style={[styles.connectorButtonText, currentCount === 0 && styles.disabledButtonText]}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.connectorCount}>{currentCount}</Text>
                  
                  <TouchableOpacity
                    style={[styles.connectorButton, currentCount >= connector.maxCount && styles.disabledButton]}
                    onPress={() => updateConnectorCount(connector.type, 1)}
                    disabled={currentCount >= connector.maxCount}
                  >
                    <Text style={[styles.connectorButtonText, currentCount >= connector.maxCount && styles.disabledButtonText]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
        
        {Object.keys(specifications.connectors).length > 0 && (
          <View style={styles.connectorsPreview}>
            <Text style={styles.previewTitle}>Conectores seleccionados:</Text>
            {Object.entries(specifications.connectors).map(([type, count]) => (
              <Text key={type} style={styles.previewItem}>• {type}: {count}</Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Pantalla Curva</Text>
        <Switch
          value={specifications.curved}
          onValueChange={() => toggleBoolean('curved')}
          trackColor={{ false: '#3a3a3a', true: '#007AFF' }}
          thumbColor={specifications.curved ? '#ffffff' : '#f4f3f4'}
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
    color: '#ffffff',
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
  picker: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  connectorsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  connectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  connectorLabel: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
  },
  connectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectorButton: {
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#3a3a3a',
  },
  connectorButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#666',
  },
  connectorCount: {
    fontSize: 16,
    color: '#ffffff',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  connectorsPreview: {
    backgroundColor: '#2c2c2c',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  previewItem: {
    fontSize: 13,
    color: '#cccccc',
    marginBottom: 2,
  },
});

export default MonitorSpecifications;