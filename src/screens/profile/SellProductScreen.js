import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import ProductService from '../../services/product.service';
import { getSpecificationComponent } from './components';

const SellProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [specifications, setSpecifications] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await ProductService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
      console.error('Error cargando categorías:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('Error seleccionando imagen:', error);
    }
  };

  const handleCategoryChange = (itemValue) => {
    setCategoryId(itemValue);
    
    // Encontrar la categoría seleccionada
    const category = categories.find(cat => cat.id.toString() === itemValue);
    setSelectedCategory(category);
    
    // Limpiar especificaciones cuando cambia la categoría
    setSpecifications({});
  };

  const handleSpecificationsChange = (newSpecifications) => {
    setSpecifications(newSpecifications);
  };

  const validate = () => {
    if (!name || !description || !price || !categoryId || !stock) {
      Alert.alert('Campos requeridos', 'Completa todos los campos para continuar');
      return false;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio numérico válido mayor a 0');
      return false;
    }
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Stock inválido', 'Ingresa una cantidad de stock válida');
      return false;
    }
    return true;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      let imageUrl = null;
      
      // Subir imagen si se seleccionó una
      if (selectedImage) {
        imageUrl = await ProductService.uploadProductImage(selectedImage, name);
      }

      // Crear el producto
      const productData = {
        name: name.trim(),
        description: description.trim(),
        category_id: parseInt(categoryId),
        price: parseFloat(price),
        stock: parseInt(stock),
        main_image: imageUrl,
        specifications: specifications
      };

      await ProductService.createProduct(productData);
      
      Alert.alert(
        'Producto publicado', 
        'Tu producto ha sido publicado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error publicando producto:', error);
      
      // Manejo de errores específicos con mensajes amigables
      let errorMessage = 'No se pudo publicar el producto. Intenta nuevamente.';
      
      if (error.message) {
        // Errores específicos de validación
        if (error.message.includes('longitud del cable no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('longitud de la GPU no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('capacidad de RAM no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('velocidad de RAM no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('número de módulos de RAM no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('capacidad de almacenamiento no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('velocidad de lectura no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('velocidad de escritura no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('TBW no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('Faltan campos requeridos')) {
          errorMessage = error.message;
        } else if (error.message.includes('numeric field overflow')) {
          errorMessage = 'Uno de los valores numéricos ingresados excede el límite permitido. Por favor, verifica los datos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Publicar Producto</Text>

      {/* Selector de imagen */}
      <TouchableOpacity style={styles.imageSelector} onPress={selectImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷</Text>
            <Text style={styles.imagePlaceholderSubtext}>Seleccionar imagen</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="Descripción del producto"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Precio (COP)"
        placeholderTextColor="#999"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* Selector de categoría */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Categoría</Text>
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando categorías...</Text>
          </View>
        ) : (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={categoryId}
              onValueChange={handleCategoryChange}
              style={styles.picker}
              dropdownIconColor="#007AFF"
              itemStyle={{ backgroundColor: '#2c2c2c' }}
            >
              <Picker.Item label="Selecciona una categoría" value="" color="#999" />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id.toString()}
                  color="#ffffff"
                  style={{ backgroundColor: '#2c2c2c' }}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Componente de especificaciones dinámico */}
      {selectedCategory && (() => {
        const SpecificationComponent = getSpecificationComponent(selectedCategory.name);
        return SpecificationComponent ? (
          <SpecificationComponent onChange={handleSpecificationsChange} />
        ) : null;
      })()}

      <TextInput
        style={styles.input}
        placeholder="Cantidad en stock"
        placeholderTextColor="#999"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handlePublish}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Publicar Producto</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageSelector: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    marginBottom: 5,
  },
  imagePlaceholderSubtext: {
    color: '#999',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 50,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: '#1f1f1f',
    height: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  loadingText: {
    color: '#999',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SellProductScreen;