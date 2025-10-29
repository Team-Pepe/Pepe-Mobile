import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const CaseSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    motherboard_formats: [],
    bays_35: '',
    bays_25: '',
    expansion_slots: '',
    max_gpu_length_mm: '',
    max_cooler_height_mm: '',
    psu_type: '',
    included_fans: '',
    material: ''
  });

  const handleChange = (field, value) => {
    let processedValue = value;
    
    // Validación para campos numéricos
    if (['bays_35', 'bays_25', 'expansion_slots', 'max_gpu_length_mm', 'max_cooler_height_mm', 'included_fans'].includes(field)) {
      // Permitir solo números
      processedValue = value.replace(/[^0-9]/g, '');
      
      const numValue = parseInt(processedValue) || 0;
      
      // Validación de overflow (límite de integer en PostgreSQL)
      if (numValue > 2147483647) {
        let fieldName = '';
        switch(field) {
          case 'bays_35': fieldName = 'bahías 3.5"'; break;
          case 'bays_25': fieldName = 'bahías 2.5"'; break;
          case 'expansion_slots': fieldName = 'slots de expansión'; break;
          case 'max_gpu_length_mm': fieldName = 'longitud máxima de GPU'; break;
          case 'max_cooler_height_mm': fieldName = 'altura máxima del cooler'; break;
          case 'included_fans': fieldName = 'ventiladores incluidos'; break;
        }
        Alert.alert('Valor muy alto', `El número de ${fieldName} no puede exceder 2,147,483,647`);
        return; // No actualizar si excede el límite
      }
      
      // Validación de límites prácticos
      if (field === 'bays_35' && numValue > 20) {
        Alert.alert('Valor inusual', 'El número de bahías 3.5" parece muy alto. ¿Estás seguro?');
      } else if (field === 'bays_25' && numValue > 50) {
        Alert.alert('Valor inusual', 'El número de bahías 2.5" parece muy alto. ¿Estás seguro?');
      } else if (field === 'expansion_slots' && numValue > 20) {
        Alert.alert('Valor inusual', 'El número de slots de expansión parece muy alto. ¿Estás seguro?');
      } else if (field === 'max_gpu_length_mm' && numValue > 1000) {
        Alert.alert('Valor inusual', 'La longitud máxima de GPU parece muy alta. ¿Estás seguro?');
      } else if (field === 'max_cooler_height_mm' && numValue > 500) {
        Alert.alert('Valor inusual', 'La altura máxima del cooler parece muy alta. ¿Estás seguro?');
      } else if (field === 'included_fans' && numValue > 20) {
        Alert.alert('Valor inusual', 'El número de ventiladores incluidos parece muy alto. ¿Estás seguro?');
      }
      
      processedValue = numValue.toString();
    }
    
    const updatedSpecs = { ...specifications, [field]: processedValue };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const handleFormatsChange = (value) => {
    // Convertir string separado por comas a array
    const formatsArray = value.split(',').map(format => format.trim()).filter(format => format);
    handleChange('motherboard_formats', formatsArray);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Gabinete</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Formatos de Motherboard (separados por coma)</Text>
        <TextInput
          style={styles.input}
          value={specifications.motherboard_formats.join(', ')}
          onChangeText={handleFormatsChange}
          placeholder="Ej: ATX, Micro-ATX, Mini-ITX"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bahías 3.5"</Text>
        <TextInput
          style={styles.input}
          value={specifications.bays_35}
          onChangeText={(value) => handleChange('bays_35', value)}
          placeholder="Ej: 2"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bahías 2.5"</Text>
        <TextInput
          style={styles.input}
          value={specifications.bays_25}
          onChangeText={(value) => handleChange('bays_25', value)}
          placeholder="Ej: 4"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Slots de Expansión</Text>
        <TextInput
          style={styles.input}
          value={specifications.expansion_slots}
          onChangeText={(value) => handleChange('expansion_slots', value)}
          placeholder="Ej: 7"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Longitud Máxima GPU (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.max_gpu_length_mm}
          onChangeText={(value) => handleChange('max_gpu_length_mm', value)}
          placeholder="Ej: 330"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Altura Máxima Cooler (mm)</Text>
        <TextInput
          style={styles.input}
          value={specifications.max_cooler_height_mm}
          onChangeText={(value) => handleChange('max_cooler_height_mm', value)}
          placeholder="Ej: 165"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de PSU</Text>
        <Picker
          selectedValue={specifications.psu_type}
          onValueChange={(value) => handleChange('psu_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="ATX" value="ATX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="SFX" value="SFX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="SFX-L" value="SFX-L" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
          <Picker.Item label="TFX" value="TFX" color="#ffffff" style={{ backgroundColor: '#2c2c2c' }} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ventiladores Incluidos</Text>
        <TextInput
          style={styles.input}
          value={specifications.included_fans}
          onChangeText={(value) => handleChange('included_fans', value)}
          placeholder="Ej: 3"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Material</Text>
        <TextInput
          style={styles.input}
          value={specifications.material}
          onChangeText={(value) => handleChange('material', value)}
          placeholder="Ej: Acero, Aluminio, Vidrio templado"
          placeholderTextColor="#999"
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
    marginBottom: 15,
    color: '#ffffff',
    textAlign: 'center',
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
});

export default CaseSpecifications;