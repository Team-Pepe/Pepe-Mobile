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
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="Mouse" value="mouse" />
          <Picker.Item label="Teclado" value="keyboard" />
          <Picker.Item label="Audífonos" value="headphones" />
          <Picker.Item label="Micrófono" value="microphone" />
          <Picker.Item label="Webcam" value="webcam" />
          <Picker.Item label="Altavoces" value="speakers" />
          <Picker.Item label="Gamepad" value="gamepad" />
          <Picker.Item label="Tableta Gráfica" value="graphics_tablet" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Conectividad</Text>
        <Picker
          selectedValue={specifications.connectivity}
          onValueChange={(value) => handleChange('connectivity', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar conectividad..." value="" />
          <Picker.Item label="USB-A" value="USB-A" />
          <Picker.Item label="USB-C" value="USB-C" />
          <Picker.Item label="Bluetooth" value="Bluetooth" />
          <Picker.Item label="Inalámbrico 2.4GHz" value="Wireless 2.4GHz" />
          <Picker.Item label="Jack 3.5mm" value="3.5mm Jack" />
          <Picker.Item label="USB + Bluetooth" value="USB + Bluetooth" />
          <Picker.Item label="Múltiple" value="Multiple" />
        </Picker>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sensor del Mouse (si aplica)</Text>
        <TextInput
          style={styles.input}
          value={specifications.mouse_sensor}
          onChangeText={(value) => handleChange('mouse_sensor', value)}
          placeholder="Ej: Óptico, Láser, PixArt PMW3360"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Switches del Teclado (si aplica)</Text>
        <TextInput
          style={styles.input}
          value={specifications.keyboard_switches}
          onChangeText={(value) => handleChange('keyboard_switches', value)}
          placeholder="Ej: Cherry MX Red, Gateron Brown, Membrane"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Frecuencia de Respuesta (Hz)</Text>
        <TextInput
          style={styles.input}
          value={specifications.response_frequency_hz}
          onChangeText={(value) => handleChange('response_frequency_hz', value)}
          placeholder="Ej: 1000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.switchGroup}>
        <Text style={styles.label}>Cancelación de Ruido</Text>
        <Switch
          value={specifications.noise_cancellation}
          onValueChange={() => toggleBoolean('noise_cancellation')}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={specifications.noise_cancellation ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de Micrófono (si aplica)</Text>
        <Picker
          selectedValue={specifications.microphone_type}
          onValueChange={(value) => handleChange('microphone_type', value)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar tipo..." value="" />
          <Picker.Item label="Condensador" value="Condenser" />
          <Picker.Item label="Dinámico" value="Dynamic" />
          <Picker.Item label="Electret" value="Electret" />
          <Picker.Item label="Boom" value="Boom" />
          <Picker.Item label="Integrado" value="Built-in" />
          <Picker.Item label="Desmontable" value="Detachable" />
          <Picker.Item label="No aplica" value="N/A" />
        </Picker>
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

export default PeripheralSpecifications;