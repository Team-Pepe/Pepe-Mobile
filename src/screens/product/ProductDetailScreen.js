import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import ProductService from '../../services/product.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';
import FavoritesService from '../../services/favorites.service';
import * as ImagePicker from 'expo-image-picker';
import ReviewsService from '../../services/reviews.service';

const ProductDetailScreen = ({ route, navigation }) => {
  const [selectedTab, setSelectedTab] = useState('specs');
  // Se eliminan estados de formulario de comentarios para mantener solo visual
  const [productSpecifications, setProductSpecifications] = useState({});
  const [loadingSpecs, setLoadingSpecs] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [attachedImages, setAttachedImages] = useState([]); // URIs locales (máx 5)
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // Obtener el producto desde los parámetros de navegación o usar datos de demo
  const productFromRoute = route.params?.product;
  const product = productFromRoute || {
    name: 'AMD Ryzen 9 5900X',
    price: '549.99',
    stock: 15,
    main_image: require('../../../assets/pepe.jpg'),
    additional_images: [],
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

  // Inicializar reseñas según el producto actual (base similar al archivo raíz)
  useEffect(() => {
    const safeReviews = Array.isArray(product?.reviews) ? product.reviews : [];
    setReviews(safeReviews);
  }, [productFromRoute]);

  // Estado inicial de favorito
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        if (productFromRoute?.id) {
          const fav = await FavoritesService.isFavorite(productFromRoute.id);
          setIsFavorite(!!fav);
        } else {
          setIsFavorite(false);
        }
      } catch (e) {
        setIsFavorite(false);
      }
    };
    checkFavorite();
  }, [productFromRoute?.id]);

  // Cargar reseñas desde BD para el producto actual
  useEffect(() => {
    const loadReviews = async () => {
      try {
        if (productFromRoute?.id) {
          const rows = await ReviewsService.listProductReviews(productFromRoute.id);
          // Mapear a estructura simple usada en la UI
          const mapped = (rows || []).map((r) => ({
            user: 'Usuario',
            rating: r.rating,
            comment: r.comment_text,
            date: (r.created_at || '').slice(0, 10),
            images: Array.isArray(r.content?.images) ? r.content.images : [],
          }));
          setReviews(mapped);
        }
      } catch (e) {
        // noop
      }
    };
    loadReviews();
  }, [productFromRoute?.id]);

  const toggleFavorite = async () => {
    if (!productFromRoute?.id || favLoading) return;
    try {
      setFavLoading(true);
      if (isFavorite) {
        const res = await FavoritesService.removeFavorite(productFromRoute.id);
        if (res?.removed) setIsFavorite(false);
      } else {
        const res = await FavoritesService.addFavorite(productFromRoute.id);
        if (res?.added || res?.already) setIsFavorite(true);
      }
    } catch (e) {
      // noop; ya se registró en el servicio
    } finally {
      setFavLoading(false);
    }
  };

  // Preparar las imágenes para mostrar (soporta URL string y require local)
  const mainImageSource =
    typeof product.main_image === 'string'
      ? { uri: product.main_image }
      : (product.main_image || require('../../../assets/pepe.jpg'));
  const additionalImageSources = (product.additional_images || [])
    .map(img => (typeof img === 'string' ? { uri: img } : img))
    .filter(Boolean);
  const allImages = [mainImageSource, ...additionalImageSources];

  // Carrusel de imágenes
  const screenWidth = Dimensions.get('window').width;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef(null);

  const onCarouselScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    setCurrentImageIndex(index);
  };

  const goToImage = (index) => {
    if (!carouselRef.current) return;
    const clamped = Math.max(0, Math.min(index, allImages.length - 1));
    carouselRef.current.scrollToIndex({ index: clamped, animated: true });
    setCurrentImageIndex(clamped);
  };

  // Cargar especificaciones del producto desde la base de datos
  useEffect(() => {
    const loadProductSpecifications = async () => {
      console.log('Effect para cargar especificaciones activado.');
      console.log('Product from route:', JSON.stringify(productFromRoute, null, 2));

      if (productFromRoute && productFromRoute.id) {
        try {
          setLoadingSpecs(true);
          console.log(`Iniciando carga de especificaciones para producto ID: ${productFromRoute.id}`);
          
          const categoryName =
            productFromRoute?.categories?.name ||
            productFromRoute?.category ||
            productFromRoute?.category_name ||
            '';
          
          console.log(`Categoría detectada: '${categoryName}'`);

          const specs = await ProductService.getProductSpecifications(
            productFromRoute.id,
            categoryName
          );
          
          console.log('Especificaciones recibidas del servicio:', JSON.stringify(specs, null, 2));
          setProductSpecifications(specs);

        } catch (error) {
          console.error('Error crítico al cargar especificaciones:', error.message, error.stack);
          setProductSpecifications({});
        } finally {
          console.log('Finalizando carga de especificaciones.');
          setLoadingSpecs(false);
        }
      } else {
        console.log('No hay producto en la ruta o falta el ID. Usando datos de demo.');
        setProductSpecifications(product.specifications || {});
        setLoadingSpecs(false);
      }
    };

    loadProductSpecifications();
  }, [productFromRoute]);

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

  // Formatear valores de especificaciones para evitar renderizar objetos directamente
  const formatSpecValue = (value, key) => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      try {
        // Convertir objeto a texto legible "clave: valor"
        const parts = Object.entries(value)
          .filter(([k, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => `${k}: ${v}`);
        
        // Si es el campo 'connectors', mostrar como lista vertical
        if (key === 'connectors') {
          return parts.length ? parts.join('\n') : JSON.stringify(value);
        }
        
        return parts.length ? parts.join(' | ') : JSON.stringify(value);
      } catch (e) {
        return JSON.stringify(value);
      }
    }
    return String(value);
  };

  // (Se revierte el renderer en tabla; se usará listado simple)

  


  const renderSpecifications = () => (
    <View style={styles.specContainer}>
      {loadingSpecs ? (
        <Text style={styles.loadingText}>Cargando especificaciones...</Text>
      ) : Object.keys(productSpecifications).length > 0 ? (
        Object.entries(productSpecifications).map(([key, value]) => (
          <View key={key} style={styles.specRow}>
            <Text style={styles.specKey}>{key}</Text>
            <Text style={styles.specValue}>{formatSpecValue(value, key)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noSpecsText}>No hay especificaciones disponibles</Text>
      )}
    </View>
  );

  // Tabla de especificaciones con etiquetas y orden detectado
  const renderSpecificationsTable = () => (
    <View style={styles.specContainer}>
      {loadingSpecs ? (
        <Text style={styles.loadingText}>Cargando especificaciones...</Text>
      ) : (() => {
        const entries = Object.entries(productSpecifications || {}).filter(([key, value]) => (
          key !== 'general_specifications' && key !== 'id' && key !== 'product_id' && value !== null && value !== undefined && value !== ''
        ));

        // Fallback: si no hay entradas, pero sí hay general_specifications, muéstralas.
        if (!entries.length) {
          const generalSpecs = productSpecifications?.general_specifications;
          if (generalSpecs && typeof generalSpecs === 'object') {
            return Object.entries(generalSpecs).map(([key, value]) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</Text>
                <Text style={styles.specValue}>{String(value)}</Text>
              </View>
            ));
          }
          return <Text style={styles.noSpecsText}>No hay especificaciones disponibles</Text>;
        }

        // Helpers locales para etiquetas, orden y formato con unidades
        const specLabelMap = {
          socket: 'Socket', cores: 'Núcleos', threads: 'Hilos',
          base_frequency_ghz: 'Frecuencia Base', boost_frequency_ghz: 'Frecuencia Máxima',
          cache_l3: 'Caché L3', tdp: 'TDP', integrated_graphics: 'Gráficos Integrados', fabrication_technology_nm: 'Proceso (nm)',
          vram_gb: 'VRAM', vram_type: 'Tipo de VRAM', cuda_cores: 'CUDA Cores', base_frequency_mhz: 'Frecuencia Base', boost_frequency_mhz: 'Frecuencia Máxima',
          bandwidth_gbs: 'Ancho de banda', power_connectors: 'Conectores de poder', length_mm: 'Longitud', video_outputs: 'Salidas de video',
          capacity_gb: 'Capacidad', type: 'Tipo', speed_mhz: 'Frecuencia', latency: 'Latencia', modules: 'Módulos', voltage: 'Voltaje', heat_spreader: 'Disipador térmico', rgb_lighting: 'RGB',
          form_factor: 'Formato', ram_slots: 'Slots RAM', ram_type: 'Tipo de RAM', m2_ports: 'Puertos M.2', sata_ports: 'Puertos SATA', usb_ports: 'Puertos USB', audio: 'Audio', network: 'Red',
          interface: 'Interfaz', read_speed_mbs: 'Lectura', write_speed_mbs: 'Escritura', nand_type: 'Tipo de NAND', tbw: 'TBW',
          power_w: 'Potencia', efficiency_certification: 'Certificación', modular_type: 'Modular', connectors: 'Conectores', fan_size_mm: 'Ventilador', active_pfc: 'PFC Activo',
          motherboard_formats: 'Formatos de Placa', bays_35: 'Bahías 3.5"', bays_25: 'Bahías 2.5"', expansion_slots: 'Slots de expansión', max_gpu_length_mm: 'GPU máx.', max_cooler_height_mm: 'Altura cooler máx.', psu_type: 'Tipo PSU', included_fans: 'Ventiladores incluidos', material: 'Material',
          cooler_type: 'Tipo de cooler', compatible_sockets: 'Sockets compatibles', height_mm: 'Altura', rpm_range: 'RPM', noise_level_db: 'Ruido', tdp_w: 'TDP',
          screen_inches: 'Pulgadas', resolution: 'Resolución', refresh_rate_hz: 'Frecuencia', panel_type: 'Panel', response_time_ms: 'Tiempo de respuesta',
          peripheral_type: 'Tipo', connectivity: 'Conectividad', mouse_sensor: 'Sensor del mouse', keyboard_switches: 'Switches del teclado', response_frequency_hz: 'Frecuencia de respuesta', noise_cancellation: 'Cancelación de ruido', microphone_type: 'Tipo de micrófono',
          cable_type: 'Tipo de cable', length_m: 'Longitud', version: 'Versión', shielded: 'Blindado',
          processor: 'Procesador', storage: 'Almacenamiento', graphics_card: 'Gráfica', weight_kg: 'Peso', battery_wh: 'Batería', operating_system: 'Sistema operativo',
          storage_gb: 'Almacenamiento', main_camera_mp: 'Cámara principal', battery_mah: 'Batería'
        };
        const titleize = (key) => key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
        const getLabelForKey = (key) => specLabelMap[key] || titleize(key);
        const specFieldOrderMap = {
          cpu_specifications: ['cores','threads','base_frequency_ghz','boost_frequency_ghz','cache_l3','tdp','socket','integrated_graphics','fabrication_technology_nm'],
          gpu_specifications: ['vram_gb','vram_type','cuda_cores','base_frequency_mhz','boost_frequency_mhz','bandwidth_gbs','length_mm','power_connectors','video_outputs'],
          ram_specifications: ['capacity_gb','type','speed_mhz','latency','modules','voltage','heat_spreader','rgb_lighting'],
          motherboard_specifications: ['socket','chipset','form_factor','ram_slots','ram_type','m2_ports','sata_ports','usb_ports','audio','network'],
          storage_specifications: ['type','capacity_gb','interface','read_speed_mbs','write_speed_mbs','form_factor','nand_type','tbw'],
          psu_specifications: ['power_w','efficiency_certification','modular_type','form_factor','connectors','fan_size_mm','active_pfc'],
          case_specifications: ['motherboard_formats','bays_35','bays_25','expansion_slots','max_gpu_length_mm','max_cooler_height_mm','psu_type','included_fans','material'],
          cooler_specifications: ['cooler_type','compatible_sockets','tdp_w','height_mm','rpm_range','noise_level_db'],
          monitor_specifications: ['screen_inches','resolution','refresh_rate_hz','panel_type','response_time_ms','connectors','curved'],
          peripheral_specifications: ['peripheral_type','connectivity','response_frequency_hz','mouse_sensor','keyboard_switches','noise_cancellation','microphone_type'],
          cable_specifications: ['cable_type','length_m','connectors','version','shielded'],
          laptop_specifications: ['processor','ram_gb','storage','screen_inches','resolution','graphics_card','weight_kg','battery_wh','operating_system'],
          phone_specifications: ['screen_inches','resolution','processor','ram_gb','storage_gb','main_camera_mp','battery_mah','operating_system']
        };
        const detectSpecTableByKeys = (specs) => {
          const keys = Object.keys(specs || {}).filter(k => k !== 'general_specifications');
          let best = { table: 'other_specifications', score: 0 };
          Object.entries(specFieldOrderMap).forEach(([tbl, fields]) => {
            const score = fields.reduce((acc,f) => acc + (keys.includes(f) ? 1 : 0), 0);
            if (score > best.score) best = { table: tbl, score };
          });
          return best.table;
        };
        const formatWithUnits = (value, key) => {
          if (value === null || value === undefined) return '-';
          if (typeof value === 'boolean') return value ? 'Sí' : 'No';
          const unitByKey = {
            cache_l3: ' MB', tdp: ' W', tdp_w: ' W', vram_gb: ' GB', capacity_gb: ' GB', ram_gb: ' GB', storage_gb: ' GB',
            power_w: ' W', length_mm: ' mm', max_gpu_length_mm: ' mm', max_cooler_height_mm: ' mm', fan_size_mm: ' mm',
            screen_inches: ' pulgadas', battery_wh: ' Wh', battery_mah: ' mAh', bandwidth_gbs: ' GB/s', response_time_ms: ' ms'
          };
          const suffixUnits = [
            { test: /_ghz$/i, unit: ' GHz' }, { test: /_mhz$/i, unit: ' MHz' }, { test: /_hz$/i, unit: ' Hz' },
            { test: /_mm$/i, unit: ' mm' }, { test: /_ms$/i, unit: ' ms' }, { test: /_w$/i, unit: ' W' },
            { test: /_gb$/i, unit: ' GB' }, { test: /_mah$/i, unit: ' mAh' }, { test: /_wh$/i, unit: ' Wh' }
          ];
          if (Array.isArray(value)) return value.join(', ');
          if (typeof value === 'object') {
            try {
              const parts = Object.entries(value)
                .filter(([k, v]) => v !== null && v !== undefined && v !== '')
                .map(([k, v]) => `${k}: ${v}`);
              
              // Si es el campo 'connectors', mostrar como lista vertical
              if (key === 'connectors') {
                return parts.length ? parts.join('\n') : JSON.stringify(value);
              }
              
              return parts.length ? parts.join(' | ') : JSON.stringify(value);
            } catch (e) { return JSON.stringify(value); }
          }
          let str = String(value);
          if (key && unitByKey[key]) return `${str}${unitByKey[key]}`;
          if (key) {
            const match = suffixUnits.find((s) => s.test.test(key));
            if (match) return `${str}${match.unit}`;
          }
          return str;
        };

        const table = detectSpecTableByKeys(productSpecifications);
        const order = specFieldOrderMap[table] || [];
        const keysToRender = (order.length ? order : entries.map(([k]) => k))
          .filter((k) => productSpecifications[k] !== null && productSpecifications[k] !== undefined && productSpecifications[k] !== '');

        return (
          <>
            {keysToRender.map((key) => (
              <View key={key} style={styles.specRow}>
                <Text style={styles.specKey}>{getLabelForKey(key)}</Text>
                <Text style={styles.specValue}>{formatWithUnits(productSpecifications[key], key)}</Text>
              </View>
            ))}
          </>
        );
      })()}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContainer}>
      <Text style={styles.sectionTitle}>Reseñas de usuarios</Text>
      {/* Formulario para nueva reseña (diseño original) */}
      <View style={styles.addReviewContainer}>
        <Text style={styles.sectionTitle}>Escribe una reseña</Text>
        <View style={styles.ratingInput}>
          {[0,1,2,3,4].map(i => (
            <TouchableOpacity key={i} style={styles.starInput} onPress={() => setNewRating(i+1)}>
              <FontAwesome5
                name="star"
                solid={i < newRating}
                size={24}
                color={i < newRating ? '#FFD700' : '#ccc'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.reviewInput}
          multiline
          placeholder="Escribe tu opinión..."
          placeholderTextColor="#bdbdbd"
          value={newComment}
          onChangeText={setNewComment}
        />
        {/* Botón tipo pin para adjuntar fotos (cámara/galería) */}
        <View style={styles.attachRow}>
          <TouchableOpacity
            style={styles.pinButton}
            onPress={async () => {
              try {
                const remaining = Math.max(0, 5 - attachedImages.length);
                if (remaining <= 0) {
                  Alert.alert('Límite alcanzado', 'Puedes adjuntar máximo 5 fotos.');
                  return;
                }

                const addFromGallery = async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
                    return;
                  }
                  console.log('📷 [ProductDetail] Abriendo galería, límite:', remaining);
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsMultipleSelection: true,
                    selectionLimit: remaining,
                    allowsEditing: false,
                    quality: 0.8,
                  });
                  if (!result.canceled && Array.isArray(result.assets)) {
                    const newUris = result.assets.map(a => a.uri).filter(Boolean);
                    console.log('📎 [ProductDetail] Imágenes seleccionadas de galería:', newUris);
                    setAttachedImages(prev => {
                      const merged = [...prev, ...newUris];
                      const unique = Array.from(new Set(merged)).slice(0, 5);
                      return unique;
                    });
                  }
                };

                const addFromCamera = async () => {
                  if (Platform.OS === 'web') {
                    return addFromGallery();
                  }
                  const { status } = await ImagePicker.requestCameraPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permisos requeridos', 'Se necesitan permisos para usar la cámara');
                    return;
                  }
                  console.log('📷 [ProductDetail] Abriendo cámara');
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false,
                    quality: 0.8,
                  });
                  if (!result.canceled && Array.isArray(result.assets)) {
                    const newUris = result.assets.map(a => a.uri).filter(Boolean);
                    console.log('📎 [ProductDetail] Imagen capturada de cámara:', newUris);
                    setAttachedImages(prev => {
                      const merged = [...prev, ...newUris];
                      const unique = Array.from(new Set(merged)).slice(0, 5);
                      return unique;
                    });
                  }
                };

                if (Platform.OS === 'web') {
                  await addFromGallery();
                } else {
                  Alert.alert(
                    'Adjuntar foto',
                    'Elige una opción',
                    [
                      { text: 'Cámara', onPress: addFromCamera },
                      { text: 'Galería', onPress: addFromGallery },
                      { text: 'Cancelar', style: 'cancel' },
                    ]
                  );
                }
              } catch (err) {
                console.error('❌ [ProductDetail] Error adjuntando fotos:', err);
              }
            }}
          >
            <FontAwesome5 name="map-pin" size={20} color="#fff" />
            <Text style={styles.pinButtonText}>Añadir foto</Text>
          </TouchableOpacity>
          <Text style={styles.attachInfo}>Máx 5 fotos</Text>
        </View>

        {/* Vista previa de imágenes adjuntadas */}
        {attachedImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
            {attachedImages.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={styles.previewItem}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.previewRemove} onPress={() => {
                  setAttachedImages(prev => prev.filter((_, i) => i !== idx));
                }}>
                  <FontAwesome5 name="times" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <TouchableOpacity
          style={styles.submitButton}
          disabled={submittingReview}
          onPress={async () => {
            if (!newRating || !newComment.trim()) return;
            if (!productFromRoute?.id) { alert('Producto inválido'); return; }
            try {
              setSubmittingReview(true);
              console.log('📝 [ProductDetail] Publicando reseña...', {
                productId: productFromRoute.id,
                rating: newRating,
                commentLength: newComment.trim().length,
                imagesCount: attachedImages.length,
              });
              const res = await ReviewsService.addReview(productFromRoute.id, {
                rating: newRating,
                commentText: newComment.trim(),
                imageUris: attachedImages,
              });
              if (res?.created) {
                const created = res.data;
                console.log('✅ [ProductDetail] Reseña publicada', created);
                const newRow = {
                  user: 'Tú',
                  rating: created?.rating || newRating,
                  comment: created?.comment_text || newComment.trim(),
                  date: (created?.created_at || new Date().toISOString()).slice(0,10),
                  images: Array.isArray(created?.content?.images) ? created.content.images : [],
                };
                setReviews(prev => [newRow, ...prev]);
                setNewRating(0);
                setNewComment('');
                setAttachedImages([]);
                Alert.alert('Reseña publicada', 'Tu comentario se ha guardado correctamente');
              } else {
                console.log('⚠️ [ProductDetail] Falla al publicar reseña:', res?.error);
                Alert.alert('Error', res?.error || 'No se pudo publicar la reseña');
              }
            } catch (e) {
              console.error('❌ [ProductDetail] Error publicando reseña:', e);
              Alert.alert('Error', e?.message || 'Error publicando reseña');
            } finally {
              setSubmittingReview(false);
            }
          }}
        >
          <Text style={styles.submitButtonText}>{submittingReview ? 'Enviando...' : 'Enviar reseña'}</Text>
        </TouchableOpacity>
      </View>
      {(Array.isArray(reviews) ? reviews : []).map((review, index) => (
        <View key={index} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewUser}>{review.user}</Text>
            <View style={styles.starsContainer}>{renderStars(review.rating)}</View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Carrusel de imágenes (estilo Instagram/MercadoLibre) */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={carouselRef}
          data={allImages}
          keyExtractor={(_, idx) => `img-${idx}`}
          renderItem={({ item }) => (
            <Image source={item} style={[styles.carouselImage, { width: screenWidth }]} />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onCarouselScrollEnd}
          getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        />

        {/* Botón de favorito en esquina superior derecha */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}
          disabled={favLoading || !productFromRoute?.id}
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          {favLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <FontAwesome5
              name="heart"
              solid={isFavorite}
              size={20}
              color={isFavorite ? '#FF3B30' : '#fff'}
            />
          )}
        </TouchableOpacity>

        {allImages.length > 1 && (
          <>
            <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={() => goToImage(currentImageIndex - 1)}>
              <Text style={styles.navIcon}>{'‹'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={() => goToImage(currentImageIndex + 1)}>
              <Text style={styles.navIcon}>{'›'}</Text>
            </TouchableOpacity>
          </>
        )}

        {allImages.length > 1 && (
          <View style={styles.dotsContainer}>
            {allImages.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === currentImageIndex && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name || product.title || product.productName || 'Producto'}</Text>
        <Text style={styles.price}>{formatPriceWithSymbol(product.price)}</Text>
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

      {selectedTab === 'specs' ? renderSpecificationsTable() : renderReviews()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c', // fondo oscuro
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#1f1f1f', // fondo de la imagen en tarjeta oscura
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#1f1f1f',
    marginBottom: 10,
  },
  carouselImage: {
    height: 300,
    resizeMode: 'cover',
  },
  navButton: {
    position: 'absolute',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: { left: 10 },
  navButtonRight: { right: 10 },
  navIcon: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 22,
    fontWeight: 'bold',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#777',
    marginHorizontal: 4,
    opacity: 0.6,
  },
  dotActive: {
    backgroundColor: '#fff',
    opacity: 1,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#1f1f1f',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
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
    color: '#bdbdbd',
    marginTop: 15,
    lineHeight: 24,
  },
  buyButton: {
    backgroundColor: '#007AFF', // botón azul
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#222',
  },
  selectedTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#bdbdbd',
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  specContainer: {
    backgroundColor: '#1f1f1f',
    padding: 15,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  specKey: {
    fontSize: 16,
    color: '#bdbdbd',
  },
  specValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flexShrink: 1,
    textAlign: 'right',
  },
  reviewsContainer: {
    backgroundColor: '#1f1f1f',
    padding: 15,
  },
  addReviewContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#111111',
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
    backgroundColor: '#474646ff', // gris claro (no blanco)
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#e6e6e6', // texto en gris claro para contraste
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
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c6c6c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pinButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  attachInfo: {
    color: '#bdbdbd',
    fontSize: 12,
  },
  previewScroll: {
    marginBottom: 10,
  },
  previewItem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  reviewCard: {
    backgroundColor: '#111111',
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
    color: '#ffffff',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#bdbdbd',
    marginVertical: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  additionalImagesContainer: {
    backgroundColor: '#1f1f1f',
    padding: 15,
    marginBottom: 10,
  },
  additionalImagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  additionalImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  loadingText: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
    padding: 20,
  },
  noSpecsText: {
    fontSize: 16,
    color: '#bdbdbd',
    textAlign: 'center',
    padding: 20,
  },
});

export default ProductDetailScreen;