import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// Estados posibles: entregado, en_camino, devuelto, pendiente, cancelado
const STATUS_META = {
  entregado: { label: 'Entregado', color: '#34C759', icon: 'check-circle' },
  en_camino: { label: 'En camino', color: '#FFCC00', icon: 'truck' },
  devuelto: { label: 'Devuelto', color: '#FF3B30', icon: 'undo' },
  pendiente: { label: 'Pendiente', color: '#007AFF', icon: 'clock' },
  cancelado: { label: 'Cancelado', color: '#8E8E93', icon: 'times-circle' },
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Reemplazar con servicio real cuando exista (OrdersService)
    const mock = [
      {
        id: 'PO-1024',
        date: '2025-11-05T14:22:00Z',
        location: 'Bogotá, Calle 123 #45-67',
        status: 'en_camino',
        total: 1599000,
        itemsCount: 3,
      },
      {
        id: 'PO-1025',
        date: '2025-10-28T10:15:00Z',
        location: 'Medellín, Cra 10 #20-30',
        status: 'entregado',
        total: 389000,
        itemsCount: 1,
      },
      {
        id: 'PO-1026',
        date: '2025-10-20T09:40:00Z',
        location: 'Cali, Av. 6N #14-55',
        status: 'devuelto',
        total: 249000,
        itemsCount: 2,
      },
    ];
    setTimeout(() => {
      setOrders(mock);
      setLoading(false);
    }, 400);
  }, []);

  const renderOrder = ({ item }) => {
    const meta = STATUS_META[item.status] || STATUS_META.pendiente;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: meta.color + '22', borderColor: meta.color }]}>
            <FontAwesome5 name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <FontAwesome5 name="calendar-alt" size={14} color="#bbbbbb" style={styles.rowIcon} />
          <Text style={styles.rowText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.row}>
          <FontAwesome5 name="map-marker-alt" size={14} color="#bbbbbb" style={styles.rowIcon} />
          <Text style={styles.rowText}>{item.location}</Text>
        </View>
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
          <Text style={styles.metaText}>{item.itemsCount} artículos</Text>
          <Text style={styles.totalText}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.total)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.detailsBtn]}>
            <Text style={styles.actionText}>Ver detalle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.trackBtn]}>
            <Text style={styles.actionText}>Rastrear</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis pedidos</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <FontAwesome5 name="spinner" size={20} color="#007AFF" />
          <Text style={styles.loadingText}>Cargando pedidos…</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="clipboard-list" size={48} color="#666" />
          <Text style={styles.emptyText}>Aún no tienes pedidos</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c2c2c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rowIcon: {
    marginRight: 8,
  },
  rowText: {
    color: '#bbbbbb',
    fontSize: 14,
  },
  metaText: {
    color: '#bbbbbb',
    fontSize: 13,
  },
  totalText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailsBtn: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  trackBtn: {
    backgroundColor: '#007AFF',
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
  },
  loadingText: {
    color: '#bbbbbb',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: '#bbbbbb',
    marginTop: 10,
    fontSize: 16,
  },
});

export default OrdersScreen;