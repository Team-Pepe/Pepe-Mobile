import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const CategorySelectionScreen = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    { id: 1, name: 'Electrónica', icon: 'laptop' },
    { id: 2, name: 'Ropa', icon: 'tshirt' },
    { id: 3, name: 'Hogar', icon: 'home' },
    { id: 4, name: 'Deportes', icon: 'running' },
    { id: 5, name: 'Juguetes', icon: 'gamepad' },
    { id: 6, name: 'Libros', icon: 'book' },
    { id: 7, name: 'Jardín', icon: 'leaf' },
    { id: 8, name: 'Mascotas', icon: 'paw' },
    { id: 9, name: 'Belleza', icon: 'spa' },
    { id: 10, name: 'Alimentos', icon: 'utensils' },
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
                color={selectedCategories.includes(category.id) ? '#fff' : '#333'} 
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
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
    backgroundColor: '#fff',
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
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonActive: {
    backgroundColor: '#007AFF',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CategorySelectionScreen;