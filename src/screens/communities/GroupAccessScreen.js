import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const GroupAccessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selecciona una opción</Text>

        <View style={styles.options}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CreateGroup')}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(0,122,255,0.15)' }]}> 
                <FontAwesome5 name="plus" size={16} color="#007AFF" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Crear grupo</Text>
                <Text style={styles.cardDesc}>Define nombre, privacidad y miembros</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#bdbdbd" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JoinGroup')}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(52,199,89,0.15)' }]}> 
                <FontAwesome5 name="key" size={16} color="#34C759" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Unirse a grupo</Text>
                <Text style={styles.cardDesc}>Ingresa un código de invitación</Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={14} color="#bdbdbd" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2c2c2c',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  options: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardDesc: {
    color: '#bdbdbd',
    fontSize: 12,
  },
});

export default GroupAccessScreen;