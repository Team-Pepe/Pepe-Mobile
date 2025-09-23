import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const ProductDetailScreen = ({ route, navigation }) => {
  const [selectedTab, setSelectedTab] = useState('specs');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // En un caso real, estos datos vendrían de una API o base de datos
  const product = {
    name: 'AMD Ryzen 9 5900X',
    price: '549.99',
    stock: 15,
    images: ['https://via.placeholder.com/400'],
    description: 'Procesador de escritorio desbloqueado de 12 núcleos y 24 hilos',
    specifications: {
      'Núcleos': '12',
      'Hilos': '24',
      'Frecuencia Base': '3.7 GHz',
      'Frecuencia Máxima': '4.8 GHz',
      'Caché L3': '64 MB',
      'TDP': '105W',
      'Socket': 'AM4',
    },
    reviews: [
      {
        user: 'TechUser123',
        rating: 5,
        comment: 'Excelente rendimiento para gaming y trabajo profesional.',
        date: '2024-03-15',
      },
      {
        user: 'PCBuilder',
        rating: 4,
        comment: 'Muy buen procesador, aunque calienta un poco bajo carga extrema.',
        date: '2024-03-10',
      },
    ],
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, index) => (
      <FontAwesome5
        key={index}
        name="star"
        solid={index < count}
        size={16}
        color={index < count ? '#FFD700' : '#ccc'}
      />
    ));
  };

  const renderSpecifications = () => (
    <View style={styles.specContainer}>
      {Object.entries(product.specifications).map(([key, value]) => (
        <View key={key} style={styles.specRow}>
          <Text style={styles.specKey}>{key}</Text>
          <Text style={styles.specValue}>{value}</Text>
        </View>
      ))}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      <View style={styles.addReviewContainer}>
        <Text style={styles.sectionTitle}>Escribe una reseña</Text>
        <View style={styles.ratingInput}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <FontAwesome5
                name="star"
                solid={star <= rating}
                size={24}
                color={star <= rating ? '#FFD700' : '#ccc'}
                style={styles.starInput}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.reviewInput}
          placeholder="Escribe tu opinión..."
          multiline
          value={review}
          onChangeText={setReview}
        />
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Enviar Reseña</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Reseñas de usuarios</Text>
      {product.reviews.map((review, index) => (
        <View key={index} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{review.user}</Text>
            <View style={styles.starsContainer}>
              {renderStars(review.rating)}
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.images[0] }} style={styles.image} />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.stock}>Stock disponible: {product.stock} unidades</Text>
        
        <TouchableOpacity style={styles.buyButton}>
          <FontAwesome5 name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.buyButtonText}>Comprar Ahora</Text>
        </TouchableOpacity>

        <Text style={styles.description}>{product.description}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'specs' && styles.selectedTab]}
          onPress={() => setSelectedTab('specs')}
        >
          <Text style={[styles.tabText, selectedTab === 'specs' && styles.selectedTabText]}>
            Especificaciones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reviews' && styles.selectedTab]}
          onPress={() => setSelectedTab('reviews')}
        >
          <Text style={[styles.tabText, selectedTab === 'reviews' && styles.selectedTabText]}>
            Reseñas
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'specs' ? renderSpecifications() : renderReviews()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stock: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    lineHeight: 24,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  selectedTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  specContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specKey: {
    fontSize: 16,
    color: '#666',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  reviewsContainer: {
    backgroundColor: '#fff',
    padding: 15,
  },
  addReviewContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  ratingInput: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  starInput: {
    marginRight: 5,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProductDetailScreen;