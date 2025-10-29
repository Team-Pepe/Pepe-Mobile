import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PeripheralSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    peripheral_type: '',
    connectivity: '',
    mouse_sensor: '',
    keyboard_switches: '',
    response_frequency_hz: '',
    noise_cancellation: false,
    microphone_type: ''
  });

  const handleChange = (field, value) => {
    const updatedSpecs = { ...specifications, [field]: value };
    setSpecifications(updatedSpecs);
    if (onChange) {
      onChange(updatedSpecs);
    }
  };

  const toggleBoolean = (field) => {
    handleChange(field, !specifications[field]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Periférico</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Periférico</Text>
        <Picker
          selectedValue={specifications.peripheral_type}
          onValueChange={(value) => handleChange('peripheral_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Mouse" value="mouse" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Teclado" value="keyboard" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Audífonos" value="headphones" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Micrófono" value="microphone" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Webcam" value="webcam" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Altavoces" value="speakers" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Gamepad" value="gamepad" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Tableta Gráfica" value="graphics_tablet" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Conectividad</Text>
        <Picker
          selectedValue={specifications.connectivity}
          onValueChange={(value) => handleChange('connectivity', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar conectividad..." value="" color="#999" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="USB-A" value="USB-A" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="USB-C" value="USB-C" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Bluetooth" value="Bluetooth" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Inalámbrico 2.4GHz" value="Wireless 2.4GHz" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Jack 3.5mm" value="3.5mm Jack" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="USB + Bluetooth" value="USB + Bluetooth" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Múltiple" value="Multiple" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sensor del Mouse (si aplica)</Text>
        <TextInput
          style={styles.input}
          value={specifications.mouse_sensor}
          onChangeText={(value) => handleChange('mouse_sensor', value)}
          placeholder="Ej: Óptico, Láser, PixArt PMW3360"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Switches del Teclado (si aplica)</Text>
        <TextInput
          style={styles.input}
          value={specifications.keyboard_switches}
          onChangeText={(value) => handleChange('keyboard_switches', value)}
          placeholder="Ej: Cherry MX Red, Gateron Brown, Membrane"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Frecuencia de Respuesta (Hz)</Text>
        <TextInput
          style={styles.input}
          value={specifications.response_frequency_hz}
          onChangeText={(value) => handleChange('response_frequency_hz', value)}
          placeholder="Ej: 1000"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Cancelación de Ruido</Text>
        <Switch
          value={specifications.noise_cancellation}
          onValueChange={() => toggleBoolean('noise_cancellation')}
          trackColor={{ false: '#3a3a3a', true: '#007AFF' }}
          thumbColor={specifications.noise_cancellation ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Micrófono (si aplica)</Text>
        <Picker
          selectedValue={specifications.microphone_type}
          onValueChange={(value) => handleChange('microphone_type', value)}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          <Picker.Item label="Seleccionar tipo..." value="" color="#999" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Condensador" value="Condenser" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Dinámico" value="Dynamic" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Electret" value="Electret" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Boom" value="Boom" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Integrado" value="Built-in" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="Desmontable" value="Detachable" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
          <Picker.Item label="No aplica" value="N/A" color="#ffffff" style={{backgroundColor: '#2c2c2c'}} />
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
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
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
  },
});

export default PeripheralSpecifications;