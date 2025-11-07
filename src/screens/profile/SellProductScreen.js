import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Keyboard, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ProductService from '../../services/product.service';
import { getSpecificationComponent } from './components';

const SellProductScreen = ({ navigation, route }) => {
  const MAX_SUPPORT_IMAGES = 10;
  const product = route?.params?.product || null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [formattedPrice, setFormattedPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [supportImages, setSupportImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [specifications, setSpecifications] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Efecto para manejar eventos del teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  // Prefill si estamos en modo edición (debe estar dentro del componente)
  useEffect(() => {
    if (product) {
      console.log('✏️ Modo edición - producto:', product);
      setName(product.title || product.name || '');
      setDescription(product.description || '');
      const productPrice = product.price !== undefined ? String(product.price) : '';
      setPrice(productPrice);
      // Formatear el precio inicial si existe
      if (productPrice && !isNaN(parseInt(productPrice, 10))) {
        const formatted = new Intl.NumberFormat('es-CO', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(parseInt(productPrice, 10));
        setFormattedPrice(formatted);
      } else {
        setFormattedPrice('');
      }
      setCategoryId(product.category_id ? String(product.category_id) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '');
      if (product.main_image) {
        setSelectedImage(product.main_image);
      }
      if (Array.isArray(product.additional_images)) {
        setSupportImages(product.additional_images);
      }
    }
  }, [product]);

  // Ajustar categoría seleccionada cuando cargan categorías o cambia categoryId
  useEffect(() => {
    if (categories.length && categoryId) {
      const category = categories.find(cat => cat.id.toString() === categoryId);
      setSelectedCategory(category || null);
    }
  }, [categories, categoryId]);

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

  const addSupportImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const remaining = Math.max(0, MAX_SUPPORT_IMAGES - supportImages.length);
      if (remaining <= 0) {
        Alert.alert('Límite alcanzado', `Solo puedes agregar hasta ${MAX_SUPPORT_IMAGES} fotos adicionales.`);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        allowsEditing: false,
        quality: 0.8
      });

      if (!result.canceled && Array.isArray(result.assets)) {
        const newUris = result.assets.map(a => a.uri).filter(Boolean);
        setSupportImages(prev => {
          const merged = [...prev, ...newUris];
          // Quitar duplicados simples por URI y limitar a MAX
          const unique = Array.from(new Set(merged)).slice(0, MAX_SUPPORT_IMAGES);
          return unique;
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('Error seleccionando imagen de apoyo:', error);
    }
  };

  const removeSupportImage = (index) => {
    setSupportImages(prev => prev.filter((_, i) => i !== index));
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

  // Función para formatear el precio mientras se escribe
  const handlePriceChange = (text) => {
    // Eliminar todo excepto números
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Si no hay valor, limpiar ambos estados
    if (!numericValue) {
      setPrice('');
      setFormattedPrice('');
      return;
    }
    
    // Convertir a número y validar
    const number = parseInt(numericValue, 10);
    if (isNaN(number)) {
      setPrice('');
      setFormattedPrice('');
      return;
    }
    
    // Guardar el valor numérico sin formato para operaciones internas
    setPrice(numericValue);
    
    // Formatear con separadores de miles
    const formatted = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
    
    setFormattedPrice(formatted);
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
      const isEditing = !!product;
      let imageUrl = null;
      const existingImageUrl = product?.main_image || null;
      
      // Subir imagen si se seleccionó una nueva local (no URL remota)
      const isRemoteUrl = typeof selectedImage === 'string' && selectedImage.startsWith('http');
      if (selectedImage && !isRemoteUrl) {
        imageUrl = await ProductService.uploadProductImage(selectedImage, name);
      } else if (isEditing) {
        imageUrl = existingImageUrl; // mantener imagen actual
      }

      // Subir imágenes de apoyo y obtener sus URLs públicas (mantener remotas tal cual)
      const supportUrls = await ProductService.uploadSupportImages(supportImages, name);

      // Crear el producto
      const productData = {
        name: name.trim(),
        description: description.trim(),
        category_id: parseInt(categoryId),
        price: parseFloat(price),
        stock: parseInt(stock),
        main_image: imageUrl,
        specifications: specifications,
        additional_images: supportUrls
      };

      if (isEditing) {
        await ProductService.updateProduct(product.id || parseInt(product.id), productData);
      } else {
        await ProductService.createProduct(productData);
      }
      
      Alert.alert(
        isEditing ? 'Producto actualizado' : 'Producto publicado', 
        isEditing ? 'Tu producto ha sido actualizado exitosamente' : 'Tu producto ha sido publicado exitosamente',
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
        } else if (error.message.includes('potencia de la PSU no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('tamaño del ventilador no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('número de bahías 3.5" no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('número de bahías 2.5" no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('número de slots de expansión no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('longitud máxima de GPU no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('altura máxima del cooler no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('número de ventiladores incluidos no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('frecuencia de actualización no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('tiempo de respuesta no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('frecuencia de respuesta no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('cantidad de RAM no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('capacidad de la batería no puede exceder')) {
          errorMessage = error.message;
        } else if (error.message.includes('capacidad de almacenamiento no puede exceder')) {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingBottom: keyboardOffset }]}>
          <ScrollView 
          contentContainerStyle={[styles.content, Platform.OS === 'ios' && styles.contentIOS]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{product ? 'Editar Producto' : 'Publicar Producto'}</Text>

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
        value={formattedPrice}
        onChangeText={handlePriceChange}
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
          <View style={[styles.pickerWrapper, Platform.OS === 'ios' && styles.pickerWrapperIOS]}>
            <Picker
              selectedValue={categoryId}
              onValueChange={handleCategoryChange}
              style={[styles.picker, Platform.OS === 'ios' && { height: 90 }]}
              dropdownIconColor="#007AFF"
              itemStyle={Platform.OS === 'ios' ? { height: 90, backgroundColor: '#2c2c2c' } : { backgroundColor: '#2c2c2c' }}
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

      {/* Sección de fotos adicionales */}
      <View style={styles.supportHeaderRow}>
        <Text style={styles.supportSectionTitle}>Fotos adicionales</Text>
        <Text style={styles.supportCounter}>{supportImages.length}/{MAX_SUPPORT_IMAGES}</Text>
      </View>
      <View style={styles.supportGrid}>
        {supportImages.map((uri, idx) => (
          <View key={`${uri}-${idx}`} style={styles.supportCard}>
            <Image source={{ uri }} style={styles.supportThumb} />
            <TouchableOpacity style={styles.supportDelete} onPress={() => removeSupportImage(idx)}>
              <Text style={styles.supportDeleteText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        {supportImages.length < MAX_SUPPORT_IMAGES && (
          <TouchableOpacity style={styles.addSupportCard} onPress={addSupportImage}>
            <Text style={styles.addSupportIcon}>＋</Text>
            <Text style={styles.addSupportText}>Agregar fotos</Text>
          </TouchableOpacity>
        )}
      </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handlePublish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>{product ? 'Actualizar Producto' : 'Publicar Producto'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  content: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  contentIOS: {
    paddingTop: 3,
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
  supportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 8,
  },
  supportSectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  supportCounter: {
    color: '#999',
    fontSize: 14,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  supportCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1f1f1f',
  },
  supportThumb: {
    width: '100%',
    height: '100%',
  },
  supportDelete: {
    position: 'absolute',
    top: 4,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  supportDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addSupportCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181818',
  },
  addSupportIcon: {
    color: '#007AFF',
    fontSize: 24,
    marginBottom: 4,
  },
  addSupportText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 12,
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
    height: Platform.OS === 'ios' ? 180 : 60,
  },
  pickerWrapperIOS: {
    backgroundColor: '#1f1f1f',
    marginTop: 4,
    paddingVertical: 8,
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