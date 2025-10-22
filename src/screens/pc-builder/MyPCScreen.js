import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyPCScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi PC</Text>
      <Text style={styles.subtitle}>Arma tu PC con los mejores componentes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdbdbd',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default MyPCScreen;