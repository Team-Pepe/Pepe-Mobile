import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';
import ProductService from '../../services/product.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';

const VersusScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');

  const [leftResults, setLeftResults] = useState([]);
  const [rightResults, setRightResults] = useState([]);

  const [leftProduct, setLeftProduct] = useState(null);
  const [rightProduct, setRightProduct] = useState(null);

  const [leftSpecs, setLeftSpecs] = useState({});
  const [rightSpecs, setRightSpecs] = useState({});

  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);



  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await ProductService.getCategories();
        setCategories(cats || []);
        if (cats && cats.length > 0) setSelectedCategoryId(cats[0].id);
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const searchLeftProducts = async () => {
      if (!selectedCategoryId || leftSearch.trim().length < 2) {
        setLeftResults([]);
        return;
      }
      setLoadingLeft(true);
      try {
        const results = await ProductService.getAllProducts({
          category_id: selectedCategoryId,
          search: leftSearch.trim(),
        });
        setLeftResults(results || []);
      } catch (e) {
        console.error('Error buscando productos (izquierda):', e);
      } finally {
        setLoadingLeft(false);
      }
    };
    searchLeftProducts();
  }, [leftSearch, selectedCategoryId]);

  useEffect(() => {
    const searchRightProducts = async () => {
      if (!selectedCategoryId || rightSearch.trim().length < 2) {
        setRightResults([]);
        return;
      }
      setLoadingRight(true);
      try {
        const results = await ProductService.getAllProducts({
          category_id: selectedCategoryId,
          search: rightSearch.trim(),
        });
        setRightResults(results || []);
      } catch (e) {
        console.error('Error buscando productos (derecha):', e);
      } finally {
        setLoadingRight(false);
      }
    };
    searchRightProducts();
  }, [rightSearch, selectedCategoryId]);

  const selectLeftProduct = async (product) => {
    setLeftProduct(product);
    setLeftResults([]);
    setLeftSearch(product?.name || '');
    setLeftSpecs({});
    try {
      const categoryName = product?.categories?.name || '';
      const specs = await ProductService.getProductSpecifications(product.id, categoryName);
      setLeftSpecs(specs || {});
    } catch (e) {
      console.error('Error obteniendo especificaciones (izquierda):', e);
      setLeftSpecs({});
    }
  };

  const selectRightProduct = async (product) => {
    setRightProduct(product);
    setRightResults([]);
    setRightSearch(product?.name || '');
    setRightSpecs({});
    try {
      const categoryName = product?.categories?.name || '';
      const specs = await ProductService.getProductSpecifications(product.id, categoryName);
      setRightSpecs(specs || {});
    } catch (e) {
      console.error('Error obteniendo especificaciones (derecha):', e);
      setRightSpecs({});
    }
  };

  const comparisonKeys = useMemo(() => {
    const keys = new Set([...
      Object.keys(leftSpecs || {}),
      ...Object.keys(rightSpecs || {}),
    ]);
    return Array.from(keys).sort();
  }, [leftSpecs, rightSpecs]);

  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'number') return `${val}`;
    return String(val);
  };

  // Utilidades para la gráfica de radar
  // Sólo acepta valores numéricos puros o con unidades conocidas (evita "LGA 1700", "Intel UHD 770", etc.)
  const toNumber = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      const m = s.match(/^\s*([0-9]+(?:\.[0-9]+)?)\s*(ghz|mhz|gb|mb|nm|mah|in|inch|inches|%)?\s*$/);
      if (m) return parseFloat(m[1]);
      // también aceptamos sólo dígitos
      const m2 = s.match(/^\s*([0-9]+(?:\.[0-9]+)?)\s*$/);
      if (m2) return parseFloat(m2[1]);
      return null;
    }
    return null;
  };

  const prettify = (k) => k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  // Ejes por categoría (ajústalo a tus nombres reales de specs)
  const CATEGORY_AXES = {
    cpu: [
      'cores',
      'threads',
      'base_frequency_ghz',
      'boost_frequency_ghz',
      'tdp',
      'cache_l3',
      'fabrication_technology_nm',
    ],
    gpu: [
      'memory_size_gb',
      'boost_clock_mhz',
      'tdp',
      'memory_bus_bits',
    ],
    ram: [
      'capacity_gb',
      'speed_mhz',
    ],
    laptop: [
      'ram_gb',
      'storage',          // ← nuevo (se parsea a GB)
      'screen_inches',
      'resolution',       // ← nuevo (se parsea a megapíxeles)
      'battery_wh',       // ← nuevo (inverso)
      'weight_kg',        // ya existía
    ],
    phone: [
      'display_size_inch',
      'battery_mah',
      'ram_gb',
      'storage_gb',
    ],
  };

  const LABELS = {
  // Case / Chasis (case_specifications)
  motherboard_formats: 'Formatos de Motherboard',
  bays_35: 'Bahías 3.5"',
  bays_25: 'Bahías 2.5"',
  expansion_slots: 'Slots de Expansión',
  max_gpu_length_mm: 'Largo Máx. GPU (mm)',
  max_cooler_height_mm: 'Altura Máx. Cooler (mm)',
  psu_type: 'Tipo de Fuente',
  included_fans: 'Ventiladores Incluidos',
  material: 'Material',

  // CPU (cpu_specifications)
  socket: 'Socket',
  cores: 'Núcleos',
  threads: 'Hilos',
  base_frequency_ghz: 'Frecuencia Base (GHz)',
  boost_frequency_ghz: 'Frecuencia Boost (GHz)',
  cache_l3: 'Cache L3 (MB)',
  tdp: 'TDP (W)',
  integrated_graphics: 'Gráficos Integrados',
  fabrication_technology_nm: 'Tecnología de Fabricación (nm)',

  // GPU (gpu_specifications)
  vram_gb: 'VRAM (GB)',
  vram_type: 'Tipo de VRAM',
  cuda_cores: 'CUDA Cores',
  base_frequency_mhz: 'Frecuencia Base (MHz)',
  boost_frequency_mhz: 'Frecuencia Boost (MHz)',
  bandwidth_gbs: 'Ancho de Banda (GB/s)',
  power_connectors: 'Conectores de Energía',
  length_mm: 'Largo (mm)',
  video_outputs: 'Salidas de Video',

  // RAM (ram_specifications)
  capacity_gb: 'Capacidad (GB)',
  type: 'Tipo de RAM',
  speed_mhz: 'Velocidad (MHz)',
  latency: 'Latencia (CAS)',
  modules: 'Módulos',
  voltage: 'Voltaje (V)',
  heat_spreader: 'Disipador de Calor',
  rgb_lighting: 'Iluminación RGB',

  // Storage (storage_specifications)
  // Nota: usa las columnas EXACTAS con sufijos _gb y _mbs como aparecen en tu DB
  type: 'Tipo',
  capacity_gb: 'Capacidad (GB)',
  interface: 'Interfaz',
  read_speed_mbs: 'Velocidad de Lectura (MB/s)',
  write_speed_mbs: 'Velocidad de Escritura (MB/s)',
  form_factor: 'Factor de Forma',
  nand_type: 'Tipo de NAND',
  tbw: 'TBW (TB escritos)',

  // Motherboard (motherboard_specifications)
  chipset: 'Chipset',
  form_factor: 'Factor de Forma',
  ram_slots: 'Slots de RAM',
  ram_type: 'Tipo de RAM',
  m2_ports: 'Puertos M.2',
  sata_ports: 'Puertos SATA',
  usb_ports: 'Puertos USB',
  audio: 'Audio',
  network: 'Red',

  // Cooler (cooler_specifications)
  cooler_type: 'Tipo de Cooler',
  compatible_sockets: 'Sockets Compatibles',
  height_mm: 'Altura (mm)',
  rpm_range: 'Rango de RPM',
  noise_level_db: 'Nivel de Ruido (dB)',
  tdp_w: 'TDP Máximo (W)',

  // Monitor (monitor_specifications)
  screen_inches: 'Tamaño Pantalla (pulgadas)',
  resolution: 'Resolución',
  refresh_rate_hz: 'Frecuencia de Refresco (Hz)',
  response_time_ms: 'Tiempo de Respuesta (ms)',
  panel_type: 'Tipo de Panel',
  connectors: 'Conectores',
  curved: 'Curvo',

  // Laptop (laptop_specifications)
  processor: 'Procesador',
  ram_gb: 'RAM (GB)',
  storage: 'Almacenamiento',
  screen_inches: 'Pantalla (pulgadas)',
  resolution: 'Resolución',
  graphics_card: 'Gráficos',
  weight_kg: 'Peso (kg)',
  battery_wh: 'Batería (Wh)',
  operating_system: 'Sistema Operativo',

  // Phone (phone_specifications)
  screen_inches: 'Pantalla (pulgadas)',
  resolution: 'Resolución',
  processor: 'Procesador',
  ram_gb: 'RAM (GB)',
  storage_gb: 'Almacenamiento (GB)',
  main_camera_mp: 'Cámara Principal (MP)',
  battery_mah: 'Batería (mAh)',
  operating_system: 'Sistema Operativo',

  // Peripheral (peripheral_specifications)
  peripheral_type: 'Tipo de Periférico',
  connectivity: 'Conectividad',
  mouse_sensor: 'Sensor del Ratón',
  keyboard_switches: 'Switches de Teclado',
  response_frequency_hz: 'Frecuencia de Respuesta (Hz)',
  noise_cancellation: 'Cancelación de Ruido',
  microphone_type: 'Tipo de Micrófono',

  // Otros / genéricos
  general_specifications: 'Especificaciones Generales',
  price: 'Precio',
  // weight_kg ya se mapea arriba en laptop; si lo usas en otras categorías, también aplica
};


  // Métricas donde un valor menor es mejor (se invierten al normalizar)
  const LOWER_IS_BETTER = new Set([
    'tdp',
    'fabrication_technology_nm',
    'weight_kg',
    'battery_wh',
  ]);

  // Opcional: máximos fijos por métrica (descomentar para forzar dominios)
  // const MAX_BY_METRIC = {
  //   cores: 64, threads: 128, base_frequency_ghz: 6, boost_frequency_ghz: 7,
  //   cache_l3: 256, tdp: 300, fabrication_technology_nm: 10,
  // };

  const getCategoryKey = (name) => {
    const s = (name || '').trim().toLowerCase();
    if (!s) return null;
    if (s.includes('cpu') || s.includes('procesador')) return 'cpu';
    if (s.includes('gpu') || s.includes('tarjeta') || s.includes('video') || s.includes('gráfica')) return 'gpu';
    if (s.includes('ram') || s.includes('memoria')) return 'ram';
    if (s.includes('laptop') || s.includes('notebook')) return 'laptop';
    if (s.includes('celular') || s.includes('phone') || s.includes('smartphone')) return 'phone';
    return null;
  };

  const pickAxes = (aSpecs, bSpecs, categoryName, maxAxes = 8) => {
    const catKey = getCategoryKey(categoryName);
    const allKeys = Array.from(new Set([
      ...Object.keys(aSpecs || {}),
      ...Object.keys(bSpecs || {}),
    ]));

    if (catKey && CATEGORY_AXES[catKey]) {
      const allowed = CATEGORY_AXES[catKey].filter((k) => allKeys.includes(k));
      if (allowed.length > 0) {
        return allowed.slice(0, maxAxes).map((key) => ({ key, label: LABELS[key] || prettify(key) }));
      }
    }

    // Fallback: ejes numéricos detectados automáticamente
    const numeric = allKeys.filter((k) => toNumber(aSpecs[k]) !== null || toNumber(bSpecs[k]) !== null);
    return numeric.slice(0, maxAxes).map((key) => ({ key, label: LABELS[key] || prettify(key) }));
  };

  const RadarChart = ({ aSpecs, bSpecs, category, size = 300 }) => {
    const axes = pickAxes(aSpecs, bSpecs, category);
    if (!axes || axes.length === 0) {
      return (
        <View style={styles.noRadarBox}>
          <Text style={styles.noData}>No hay especificaciones numéricas para graficar.</Text>
        </View>
      );
    }

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38; // margen para etiquetas
    const angleStep = (Math.PI * 2) / axes.length;

    // Rangos por eje: usamos 0..max (max calculado entre ambos productos, con mínimo 1 para evitar división por cero)
    const ranges = axes.map(({ key }) => {
      const va = toNumber(aSpecs[key]);
      const vb = toNumber(bSpecs[key]);
      const max = Math.max(va ?? 0, vb ?? 0, 1);
      return { key, min: 0, max };
    });

    const toPoint = (val, index) => {
      const angle = -Math.PI / 2 + index * angleStep; // empieza arriba
      const r = Math.max(0, Math.min(1, val)) * radius;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    };

    const norm = (v, range, key) => {
      const num = toNumber(v);
      if (num === null) return 0;
      const clamped = Math.max(range.min, Math.min(num, range.max));
      const denom = (range.max - range.min) || 1;
      const ratio = (clamped - range.min) / denom;
      return LOWER_IS_BETTER.has(key) ? 1 - ratio : ratio;
    };

  const aPoints = axes.map((ax, i) => toPoint(norm(aSpecs[ax.key], ranges[i], ax.key), i));
  const bPoints = axes.map((ax, i) => toPoint(norm(bSpecs[ax.key], ranges[i], ax.key), i));
    const aStr = aPoints.map(([x, y]) => `${x},${y}`).join(' ');
    const bStr = bPoints.map(([x, y]) => `${x},${y}`).join(' ');

    const gridLevels = 4;
    const labels = axes.map((ax, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const lx = cx + (radius + 16) * Math.cos(angle);
      const ly = cy + (radius + 16) * Math.sin(angle);
      return { x: lx, y: ly, text: ax.label };
    });

    return (
      <View style={styles.radarContainer}>
        <Svg width={size} height={size}>
          {/* Grid concéntrico */}
          {[...Array(gridLevels)].map((_, i) => (
            <Circle
              key={`g${i}`}
              cx={cx}
              cy={cy}
              r={radius * ((i + 1) / gridLevels)}
              stroke="#4a4a4a"
              strokeWidth={1}
              fill="none"
            />
          ))}

          {/* Ejes radiales */}
          {axes.map((_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const x2 = cx + radius * Math.cos(angle);
            const y2 = cy + radius * Math.sin(angle);
            return <Line key={`l${i}`} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#4a4a4a" strokeWidth={1} />;
          })}

          {/* Área A (azul) */}
          <Polygon points={aStr} fill="rgba(59,130,246,0.35)" stroke="#3b82f6" strokeWidth={2} />
          {/* Área B (naranja) */}
          <Polygon points={bStr} fill="rgba(245,158,11,0.35)" stroke="#f59e0b" strokeWidth={2} />

          {/* Etiquetas */}
          {labels.map((l, i) => (
            <SvgText key={`t${i}`} x={l.x} y={l.y} fill="#e5e5e5" fontSize={12} textAnchor="middle">
              {l.text}
            </SvgText>
          ))}
        </Svg>

        {/* Leyenda */}
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>Producto A</Text>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b', marginLeft: 14 }]} />
          <Text style={styles.legendText}>Producto B</Text>
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item }, side = 'left') => (
    <TouchableOpacity
      key={item.id}
      style={styles.resultItem}
      onPress={() => (side === 'left' ? selectLeftProduct(item) : selectRightProduct(item))}
    >
      <View style={styles.resultRow}>
        {item?.main_image ? (
          <Image source={{ uri: item.main_image }} style={styles.resultImage} />
        ) : (
          <View style={styles.resultPlaceholder} />
        )}
        <View style={styles.resultTextBlock}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultMeta}>
            #{item.id} • {item?.categories?.name || 'Sin categoría'} • {formatPriceWithSymbol(item.price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} nestedScrollEnabled>
      <Text style={styles.title}>Versus</Text>
      <Text style={styles.subtitle}>Compara componentes de PC, laptops y celulares</Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.sectionLabel}>Categoría</Text>
        <Picker
          selectedValue={selectedCategoryId}
          style={styles.picker}
          onValueChange={(val) => setSelectedCategoryId(val)}
        >
          {categories.map((cat) => (
            <Picker.Item label={cat.name} value={cat.id} key={cat.id} />
          ))}
        </Picker>
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.sectionLabel}>Producto A</Text>
          <TextInput
            value={leftSearch}
            onChangeText={setLeftSearch}
            placeholder="Buscar producto"
            placeholderTextColor="#9e9e9e"
            style={styles.input}
          />
          {loadingLeft ? (
            <Text style={styles.loadingText}>Buscando…</Text>
          ) : (
            <View style={styles.resultsList}>
              {leftResults.map((item) => renderProductItem({ item }, 'left'))}
            </View>
          )}

          {leftProduct && (
            <View style={styles.selectedBox}>
              <Text style={styles.selectedTitle}>{leftProduct.name}</Text>
              <Text style={styles.selectedMeta}>{leftProduct?.categories?.name || 'Sin categoría'}</Text>
            </View>
          )}
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionLabel}>Producto B</Text>
          <TextInput
            value={rightSearch}
            onChangeText={setRightSearch}
            placeholder="Buscar producto"
            placeholderTextColor="#9e9e9e"
            style={styles.input}
          />
          {loadingRight ? (
            <Text style={styles.loadingText}>Buscando…</Text>
          ) : (
            <View style={styles.resultsList}>
              {rightResults.map((item) => renderProductItem({ item }, 'right'))}
            </View>
          )}

          {rightProduct && (
            <View style={styles.selectedBox}>
              <Text style={styles.selectedTitle}>{rightProduct.name}</Text>
              <Text style={styles.selectedMeta}>{rightProduct?.categories?.name || 'Sin categoría'}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Comparación</Text>
      <View style={styles.table}>
        {comparisonKeys.length === 0 ? (
          <Text style={styles.noData}>
            Selecciona dos productos con especificaciones para ver la comparación.
          </Text>
        ) : (
          comparisonKeys.map((key) => (
            <View style={styles.row} key={key}>
              <Text style={styles.cellKey}>{LABELS[key] || prettify(key)}</Text>
              <Text style={styles.cellVal}>{formatValue(leftSpecs[key])}</Text>
              <Text style={styles.cellVal}>{formatValue(rightSpecs[key])}</Text>
            </View>
          ))
        )}
      </View>

      {/* Gráfica de radar */}
      <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Gráfica</Text>
      <RadarChart
        aSpecs={leftSpecs}
        bSpecs={rightSpecs}
        category={leftProduct?.categories?.name || rightProduct?.categories?.name || ''}
        size={300}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c2c2c',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#bdbdbd',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerWrapper: {
    marginBottom: 12,
    backgroundColor: '#383838',
    borderRadius: 8,
  },
  picker: {
    color: '#ffffff',
  },
  sectionLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginHorizontal: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  columns: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
  },
  input: {
    backgroundColor: '#383838',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resultsList: {
    marginTop: 8,
  },
  resultItem: {
    backgroundColor: '#3f3f3f',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultImage: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#494949',
  },
  resultPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: '#494949',
  },
  resultTextBlock: {
    flex: 1,
  },
  resultName: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultMeta: {
    color: '#bdbdbd',
    fontSize: 12,
    marginTop: 2,
  },
  selectedBox: {
    marginTop: 8,
    backgroundColor: '#3f3f3f',
    padding: 10,
    borderRadius: 8,
  },
  selectedTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  selectedMeta: {
    color: '#bdbdbd',
    fontSize: 12,
    marginTop: 2,
  },
  loadingText: {
    color: '#bdbdbd',
    marginTop: 8,
  },
  table: {
    marginTop: 8,
    backgroundColor: '#383838',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
    paddingVertical: 8,
  },
  cellKey: {
    flex: 1,
    color: '#ffffff',
    fontWeight: '600',
    paddingRight: 8,
  },
  cellVal: {
    flex: 1,
    color: '#e5e5e5',
  },
  noData: {
    color: '#bdbdbd',
    padding: 12,
    textAlign: 'center',
  },
  radarContainer: {
    backgroundColor: '#383838',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#e5e5e5',
    marginLeft: 6,
    fontSize: 12,
  },
  noRadarBox: {
    backgroundColor: '#383838',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
});

export default VersusScreen;