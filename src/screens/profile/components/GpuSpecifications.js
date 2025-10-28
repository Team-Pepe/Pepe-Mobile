import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const GpuSpecifications = ({ onChange }) => {
  const [specifications, setSpecifications] = useState({
    vram_gb: '',
    vram_type: '',
    cuda_cores: '',
    base_frequency_mhz: '',
    boost_frequency_mhz: '',
    bandwidth_gbs: '',
    power_connectors: '',
    length_mm: '',
    video_outputs: ''
  });

  const handleChange = (field, value) => {
    const newSpecs = { ...specifications, [field]: value };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones de la Tarjeta Gráfica</Text>
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="VRAM (GB)"
          placeholderTextColor="#999"
          value={specifications.vram_gb}
          onChangeText={(value) => handleChange('vram_gb', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Tipo VRAM"
          placeholderTextColor="#999"
          value={specifications.vram_type}
          onChangeText={(value) => handleChange('vram_type', value)}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="CUDA Cores / Stream Processors"
        placeholderTextColor="#999"
        value={specifications.cuda_cores}
        onChangeText={(value) => handleChange('cuda_cores', value)}
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Freq. Base (MHz)"
          placeholderTextColor="#999"
          value={specifications.base_frequency_mhz}
          onChangeText={(value) => handleChange('base_frequency_mhz', value)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Freq. Boost (MHz)"
          placeholderTextColor="#999"
          value={specifications.boost_frequency_mhz}
          onChangeText={(value) => handleChange('boost_frequency_mhz', value)}
          keyboardType="numeric"
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ancho de banda (GB/s)"
        placeholderTextColor="#999"
        value={specifications.bandwidth_gbs}
        onChangeText={(value) => handleChange('bandwidth_gbs', value)}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Conectores de alimentación (ej: 8-pin)"
        placeholderTextColor="#999"
        value={specifications.power_connectors}
        onChangeText={(value) => handleChange('power_connectors', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Longitud (mm)"
        placeholderTextColor="#999"
        value={specifications.length_mm}
        onChangeText={(value) => handleChange('length_mm', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Salidas de video (ej: 3x DP, 1x HDMI)"
        placeholderTextColor="#999"
        value={specifications.video_outputs}
        onChangeText={(value) => handleChange('video_outputs', value)}
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
});

export default GpuSpecifications;