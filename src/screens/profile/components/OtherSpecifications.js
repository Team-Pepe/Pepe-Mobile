import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const OtherSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    general_specifications: {}
  });

  const [jsonInput, setJsonInput] = useState('{}');

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const handleJsonChange = (value) => {
    setJsonInput(value);
    try {
      const parsedJson = JSON.parse(value);
      handleChange('general_specifications', parsedJson);
    } catch (error) {
      // Si no es JSON válido, mantener el valor anterior
      console.log('JSON inválido:', error.message);
    }
  };

  // Función para agregar campos comunes
  const addCommonField = (key, value) => {
    const currentSpecs = specifications.general_specifications || {};
    const updatedSpecs = { ...currentSpecs, [key]: value };
    const jsonString = JSON.stringify(updatedSpecs, null, 2);
    setJsonInput(jsonString);
    handleChange('general_specifications', updatedSpecs);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones Generales</Text>
      
      <Text style={styles.subtitle}>Campos Comunes Rápidos:</Text>
      
      <View style={styles.quickFieldsContainer}>
        <View style={styles.quickFieldRow}>
          <TextInput
            style={styles.quickInput}
            placeholder="Marca"
            placeholderTextColor="#999"
            onChangeText={(value) => addCommonField('marca', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Modelo"
            placeholderTextColor="#999"
            onChangeText={(value) => addCommonField('modelo', value)}
          />
        </View>
        
        <View style={styles.quickFieldRow}>
          <TextInput
            style={styles.quickInput}
            placeholder="Color"
            placeholderTextColor="#999"
            onChangeText={(value) => addCommonField('color', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Peso (kg)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            onChangeText={(value) => addCommonField('peso_kg', value)}
          />
        </View>
        
        <View style={styles.quickFieldRow}>
          <TextInput
            style={styles.quickInput}
            placeholder="Dimensiones"
            placeholderTextColor="#999"
            onChangeText={(value) => addCommonField('dimensiones', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Material"
            placeholderTextColor="#999"
            onChangeText={(value) => addCommonField('material', value)}
          />
        </View>
      </View>



      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Especificaciones Guardadas:</Text>
        <View style={styles.specsList}>
          {Object.keys(specifications.general_specifications || {}).length > 0 ? (
            Object.entries(specifications.general_specifications).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key}:</Text>
                <Text style={styles.specValue}>{String(value)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSpecsText}>No hay especificaciones definidas</Text>
          )}
        </View>
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
    marginBottom: 15,
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#ffffff',
  },
  quickFieldsContainer: {
    marginBottom: 20,
  },
  quickFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 45,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    marginHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#ffffff',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  jsonInput: {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4a4a4a',
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  previewContainer: {
    backgroundColor: '#2c2c2c',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4a4a4a',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ffffff',
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#999',
  },
  specsList: {
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
    minWidth: 100,
  },
  specValue: {
    fontSize: 14,
    color: '#cccccc',
    flex: 1,
  },
  noSpecsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default OtherSpecifications;