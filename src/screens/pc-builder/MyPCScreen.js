import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import ProductService from '../../services/product.service';
import { formatPriceWithSymbol } from '../../utils/formatPrice';

const SLOT_NAMES = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'Motherboard',
  ram: 'RAM',
  psu: 'PSU',
  storage: 'Almacenamiento',
  case: 'Gabinete',
  cooler: 'Cooling',
};

const MyPCScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState({});

  const [search, setSearch] = useState({
    cpu: '', gpu: '', motherboard: '', ram: '', psu: '', storage: '', case: '', cooler: '',
  });
  const [results, setResults] = useState({
    cpu: [], gpu: [], motherboard: [], ram: [], psu: [], storage: [], case: [], cooler: [],
  });
  const [loading, setLoading] = useState({
    cpu: false, gpu: false, motherboard: false, ram: false, psu: false, storage: false, case: false, cooler: false,
  });
  const [selected, setSelected] = useState({
    cpu: null, gpu: null, motherboard: null, ram: null, psu: null, storage: null, case: null, cooler: null,
  });
  const [specs, setSpecs] = useState({
    cpu: {}, gpu: {}, motherboard: {}, ram: {}, psu: {}, storage: {}, case: {}, cooler: {},
  });

  // Cargar categorías y mapear ids para slots por nombre
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await ProductService.getCategories();
        setCategories(cats || []);
        const byName = (nameLikeArr) => {
          const found = cats?.find((c) => nameLikeArr.some((s) => (c.name || '').toLowerCase().includes(s)));
          return found?.id || null;
        };
        setCategoryIds({
          cpu: byName(['cpu', 'procesador']),
          gpu: byName(['gpu', 'gráfica', 'tarjeta', 'video']),
          motherboard: byName(['motherboard', 'placa', 'mainboard']),
          ram: byName(['ram', 'memoria']),
          psu: byName(['psu', 'fuente', 'power']),
          storage: byName(['almacenamiento', 'ssd', 'hdd', 'disco']),
          case: byName(['gabinete', 'case']),
          cooler: byName(['cooler', 'refrigeración', 'cooling']),
        });
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    };
    loadCategories();
  }, []);

  const onSearchChange = (slot, value) => {
    setSearch((prev) => ({ ...prev, [slot]: value }));
  };

  const fetchResults = async (slot) => {
    const q = (search[slot] || '').trim();
    const catId = categoryIds[slot];
    if (!catId || q.length < 2) {
      setResults((prev) => ({ ...prev, [slot]: [] }));
      return;
    }
    setLoading((prev) => ({ ...prev, [slot]: true }));
    try {
      const res = await ProductService.getAllProducts({ category_id: catId, search: q });
      setResults((prev) => ({ ...prev, [slot]: res || [] }));
    } catch (e) {
      console.error(`Error buscando ${slot}:`, e);
    } finally {
      setLoading((prev) => ({ ...prev, [slot]: false }));
    }
  };

  useEffect(() => { fetchResults('cpu'); }, [search.cpu, categoryIds.cpu]);
  useEffect(() => { fetchResults('gpu'); }, [search.gpu, categoryIds.gpu]);
  useEffect(() => { fetchResults('motherboard'); }, [search.motherboard, categoryIds.motherboard]);
  useEffect(() => { fetchResults('ram'); }, [search.ram, categoryIds.ram]);
  useEffect(() => { fetchResults('psu'); }, [search.psu, categoryIds.psu]);
  useEffect(() => { fetchResults('storage'); }, [search.storage, categoryIds.storage]);
  useEffect(() => { fetchResults('case'); }, [search.case, categoryIds.case]);
  useEffect(() => { fetchResults('cooler'); }, [search.cooler, categoryIds.cooler]);

  const selectProduct = async (slot, product) => {
    setSelected((prev) => ({ ...prev, [slot]: product }));
    setResults((prev) => ({ ...prev, [slot]: [] }));
    setSearch((prev) => ({ ...prev, [slot]: product?.name || '' }));
    setSpecs((prev) => ({ ...prev, [slot]: {} }));
    try {
      const categoryName = product?.categories?.name || '';
      const s = await ProductService.getProductSpecifications(product.id, categoryName);
      setSpecs((prev) => ({ ...prev, [slot]: s || {} }));
    } catch (e) {
      console.error(`Error obteniendo especificaciones (${slot}):`, e);
    }
  };

  // Helpers numéricos
  const toNum = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const m = v.trim().toLowerCase().match(/^\s*([0-9]+(?:\.[0-9]+)?)\s*(w|watt|watts|ghz|mhz|gb|mb|nm|mah|mm|cm|inch|in)?\s*$/);
      if (m) return parseFloat(m[1]);
      const m2 = v.trim().match(/^\s*([0-9]+(?:\.[0-9]+)?)\s*$/);
      if (m2) return parseFloat(m2[1]);
      return null;
    }
    return null;
  };

  // Cálculo de consumo energético
  const power = useMemo(() => {
    const cpuTdp = toNum(specs.cpu.tdp) ?? 0;
    const gpuTdp = toNum(specs.gpu.tdp) ?? toNum(specs.gpu.power) ?? 0;
    const ramW = specs.ram && (toNum(specs.ram.modules) || toNum(specs.ram.capacity_gb)) ? 5 : 0; // aprox.
    const storageW = specs.storage && Object.keys(specs.storage).length ? (String(specs.storage.type || '').toLowerCase().includes('hdd') ? 9 : 5) : 0;
    const misc = 30; // ventiladores, chipset, leds
    const estimate = cpuTdp + gpuTdp + ramW + storageW + misc;
    const recommended = Math.ceil(estimate * 1.5);
    const psuW = toNum(specs.psu.wattage) ?? toNum(specs.psu.power) ?? 0;
    const ok = psuW ? psuW >= recommended : false;
    return { estimate, recommended, psuW, ok };
  }, [specs]);

  // Compatibilidad
  const compatibility = useMemo(() => {
    const issues = [];
    const warn = (msg) => issues.push(msg);

    const cpuSock = (specs.cpu.socket || specs.cpu.socket_type || '').toString().toLowerCase();
    const mbSock = (specs.motherboard.socket || specs.motherboard.cpu_socket || '').toString().toLowerCase();
    if (cpuSock && mbSock && cpuSock !== mbSock) warn(`CPU y Motherboard con socket distinto: ${cpuSock} vs ${mbSock}`);

    const ramType = (specs.ram.memory_type || specs.ram.type || '').toString().toLowerCase();
    const mbRamType = (specs.motherboard.memory_type || '').toString().toLowerCase();
    if (ramType && mbRamType && !mbRamType.includes(ramType)) warn(`RAM (${ramType}) no coincide con Motherboard (${mbRamType})`);

    const ramSpeed = toNum(specs.ram.speed_mhz);
    const mbMaxSpeed = toNum(specs.motherboard.max_memory_speed_mhz);
    if (ramSpeed && mbMaxSpeed && ramSpeed > mbMaxSpeed) warn(`Velocidad RAM ${ramSpeed}MHz supera el máximo de la placa ${mbMaxSpeed}MHz`);

    const mbForm = (specs.motherboard.form_factor || '').toString().toLowerCase();
    const caseForm = (specs.case.form_factor_supported || specs.case.form_factor || '').toString().toLowerCase();
    if (mbForm && caseForm && !caseForm.includes(mbForm)) warn(`Gabinete no soporta el factor de forma de la placa (${mbForm})`);

    const gpuLen = toNum(specs.gpu.length_mm);
    const caseMaxGpuLen = toNum(specs.case.max_gpu_length_mm);
    if (gpuLen && caseMaxGpuLen && gpuLen > caseMaxGpuLen) warn(`GPU (${gpuLen}mm) excede largo máximo del gabinete (${caseMaxGpuLen}mm)`);

    const coolerSockets = (specs.cooler.sockets_supported || '').toString().toLowerCase();
    if (coolerSockets && cpuSock && !coolerSockets.includes(cpuSock)) warn(`Cooler no indica soporte para socket ${cpuSock}`);

    const storageIf = (specs.storage.interface || '').toString().toLowerCase();
    const mbM2 = toNum(specs.motherboard.m2_slots);
    const mbSata = toNum(specs.motherboard.sata_ports);
    if (storageIf.includes('m.2') && mbM2 !== null && mbM2 <= 0) warn('Motherboard sin slots M.2 para almacenamiento seleccionado');
    if (storageIf.includes('sata') && mbSata !== null && mbSata <= 0) warn('Motherboard sin puertos SATA disponibles');

    return issues;
  }, [specs]);

  const renderSlot = (slot) => (
    <View style={styles.slotBox} key={slot}>
      <Text style={styles.slotTitle}>{SLOT_NAMES[slot]}</Text>
      <TextInput
        value={search[slot]}
        onChangeText={(v) => onSearchChange(slot, v)}
        placeholder={`Buscar ${SLOT_NAMES[slot]}`}
        placeholderTextColor="#9e9e9e"
        style={styles.input}
      />
      {loading[slot] ? (
        <Text style={styles.loadingText}>Buscando…</Text>
      ) : (
        <View style={styles.resultsList}>
          {results[slot].map((item) => (
            <View key={item.id} style={styles.resultItem}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => selectProduct(slot, item)}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultMeta}>#{item.id} • {(item?.categories?.name) || 'Sin categoría'} • {formatPriceWithSymbol(item.price)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                <Text style={styles.detailBtnText}>Ver</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {selected[slot] && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>{selected[slot].name}</Text>
          <Text style={styles.selectedMeta}>{selected[slot]?.categories?.name || 'Sin categoría'}</Text>
          <View style={{ marginTop: 8 }}>
            <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('ProductDetail', { product: selected[slot] })}>
              <Text style={styles.detailBtnText}>Ver detalle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi PC</Text>
      <Text style={styles.subtitle}>Pre-ensamblaje con cálculo de consumo y compatibilidad</Text>

      <View style={styles.grid}> 
        {Object.keys(SLOT_NAMES).map((slot) => renderSlot(slot))}
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Consumo energético</Text>
      <View style={styles.powerBox}>
        <Text style={styles.powerText}>Estimado: {power.estimate} W</Text>
        <Text style={styles.powerText}>Recomendado PSU: {power.recommended} W</Text>
        <Text style={[styles.powerText, { color: power.ok ? '#34d399' : '#f87171' }]}>PSU seleccionada: {power.psuW || '—'} W {power.psuW ? (power.ok ? '(OK)' : '(Insuficiente)') : ''}</Text>
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Compatibilidad</Text>
      <View style={styles.compatBox}>
        {compatibility.length === 0 ? (
          <Text style={styles.compatOk}>Sin problemas detectados con la información disponible.</Text>
        ) : (
          compatibility.map((msg, idx) => (
            <Text style={styles.compatWarn} key={idx}>• {msg}</Text>
          ))
        )}
      </View>
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
  grid: {
    gap: 12,
  },
  slotBox: {
    backgroundColor: '#383838',
    borderRadius: 8,
    padding: 12,
  },
  slotTitle: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#3f3f3f',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resultsList: {
    marginTop: 8,
  },
  resultItem: {
    backgroundColor: '#404040',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
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
  detailBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: 'center',
  },
  detailBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
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
  sectionLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginHorizontal: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  powerBox: {
    backgroundColor: '#383838',
    borderRadius: 8,
    padding: 12,
  },
  powerText: {
    color: '#e5e5e5',
    marginBottom: 4,
  },
  compatBox: {
    backgroundColor: '#383838',
    borderRadius: 8,
    padding: 12,
  },
  compatOk: {
    color: '#34d399',
  },
  compatWarn: {
    color: '#fca5a5',
    marginBottom: 4,
  },
});

export default MyPCScreen;