import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const CategorySelectionScreen = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    { id: 1, name: 'Procesadores', icon: 'microchip' },
    { id: 2, name: 'Tarjetas Gráficas', icon: 'tv' },
    { id: 3, name: 'Memoria RAM', icon: 'memory' },
    { id: 4, name: 'Almacenamiento', icon: 'hdd' },
    { id: 5, name: 'Placas Base', icon: 'server' },
    { id: 6, name: 'Fuentes de Poder', icon: 'plug' },
    { id: 7, name: 'Periféricos', icon: 'keyboard' },
    { id: 8, name: 'Laptops', icon: 'laptop' },
    { id: 9, name: 'Smartphones', icon: 'mobile-alt' },
    { id: 10, name: 'Monitores', icon: 'desktop' },
  ];

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleContinue = () => {
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Qué te interesa?</Text>
      <Text style={styles.subtitle}>Selecciona las categorías que más te gusten</Text>
      
      <ScrollView style={styles.categoriesContainer}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategories.includes(category.id) && styles.selectedCategory
              ]}
              onPress={() => toggleCategory(category.id)}
            >
              <FontAwesome5 
                name={category.icon} 
                size={24} 
                color={selectedCategories.includes(category.id) ? '#fff' : '#007AFF'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategories.includes(category.id) && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[
          styles.continueButton,
          selectedCategories.length > 0 && styles.continueButtonActive
        ]} 
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    padding: 20,
    justifyContent: 'center',
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
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  categoryItem: {
    width: '48%',
    padding: 15,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategorySelectionScreen;