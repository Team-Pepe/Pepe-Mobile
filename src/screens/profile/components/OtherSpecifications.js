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
            onChangeText={(value) => addCommonField('marca', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Modelo"
            onChangeText={(value) => addCommonField('modelo', value)}
          />
        </View>
        
        <View style={styles.quickFieldRow}>
          <TextInput
            style={styles.quickInput}
            placeholder="Color"
            onChangeText={(value) => addCommonField('color', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Peso (kg)"
            keyboardType="numeric"
            onChangeText={(value) => addCommonField('peso_kg', value)}
          />
        </View>
        
        <View style={styles.quickFieldRow}>
          <TextInput
            style={styles.quickInput}
            placeholder="Dimensiones"
            onChangeText={(value) => addCommonField('dimensiones', value)}
          />
          <TextInput
            style={styles.quickInput}
            placeholder="Material"
            onChangeText={(value) => addCommonField('material', value)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Especificaciones Completas (JSON)</Text>
        <Text style={styles.helpText}>
          Puedes editar directamente el JSON o usar los campos rápidos arriba.
          Ejemplo: {`{"marca": "Ejemplo", "modelo": "ABC123", "garantia": "2 años"}`}
        </Text>
        <TextInput
          style={styles.jsonInput}
          value={jsonInput}
          onChangeText={handleJsonChange}
          placeholder='{"especificacion": "valor", "otra_especificacion": "otro_valor"}'
          multiline
          numberOfLines={8}
        />
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Vista Previa:</Text>
        <Text style={styles.previewText}>
          {Object.keys(specifications.general_specifications || {}).length > 0 
            ? JSON.stringify(specifications.general_specifications, null, 2)
            : 'No hay especificaciones definidas'}
        </Text>
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  jsonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  previewContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#495057',
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6c757d',
  },
});

export default OtherSpecifications;