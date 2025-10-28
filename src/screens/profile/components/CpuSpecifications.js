import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const CpuSpecifications = ({ onChange }) => {
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
    const newSpecs = { ...specifications, [field]: value };
    setSpecifications(newSpecs);
    if (onChange) {
      onChange(newSpecs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especificaciones del Procesador</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Socket (ej: AM4, LGA1700)"
        placeholderTextColor="#999"
        value={specifications.socket}
        onChangeText={(value) => handleChange('socket', value)}
      />

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
});

export default CpuSpecifications;