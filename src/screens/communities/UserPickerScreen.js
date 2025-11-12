import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const toDisplayName = (row) => {
  const first = (row?.first_name || '').trim();
  const last = (row?.last_name || '').trim();
  const full = `${first} ${last}`.trim();
  return full || row?.email || 'Usuario';
};

const getInitials = (name) => {
  const parts = name.split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const SkeletonRow = () => (
  <View style={styles.skeletonRow}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonText}>
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineSmall} />
    </View>
  </View>
);

const EmptyState = ({ onClear }) => (
  <View style={styles.emptyContainer}>
    <FontAwesome5 name="users" size={48} color="#555555" />
    <Text style={styles.emptyTitle}>Sin resultados</Text>
    <Text style={styles.emptyDesc}>Prueba con otro nombre o usuario</Text>
    <TouchableOpacity style={styles.emptyButton} onPress={onClear}>
      <Text style={styles.emptyButtonText}>Limpiar búsqueda</Text>
    </TouchableOpacity>
  </View>
);

const UserPickerScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true });
      if (!error) {
        const mapped = (data || []).map((row) => ({
          id: String(row.id),
          name: toDisplayName(row),
          email: row.email,
        }));
        setUsers(mapped);
        setFiltered(mapped);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      const lower = search.toLowerCase();
      const res = users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          (u.email || '').toLowerCase().includes(lower)
      );
      setFiltered(res);
    }
  }, [search, loading, users]);

  const renderItem = ({ item }) => {
    const selected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[styles.item, selected && styles.itemSelected]}
        onPress={() => setSelectedId(item.id)}
      >
        <View style={styles.itemLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          {selected ? (
            <View style={styles.checkCircleSelected}>
              <FontAwesome5 name="check" size={12} color="#ffffff" />
            </View>
          ) : (
            <View style={styles.checkCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const clearSearch = () => setSearch('');

  const handleStartChat = () => {
    if (!selectedId) return;
    const user = users.find((u) => u.id === selectedId);
    if (!user) return;
    navigation.navigate('Chat', { userId: parseInt(user.id), userName: user.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Seleccionar usuario</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBar}>
        <FontAwesome5 name="search" size={14} color="#bdbdbd" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o usuario"
          placeholderTextColor="#8a8a8a"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <FontAwesome5 name="times" size={14} color="#bdbdbd" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <FlatList
          data={[...Array(6)]}
          keyExtractor={(_, i) => String(i)}
          renderItem={SkeletonRow}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<EmptyState onClear={clearSearch} />}
        />
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.primaryButton, !selectedId && styles.primaryButtonDisabled]} activeOpacity={selectedId ? 0.8 : 1} onPress={handleStartChat}>
          <FontAwesome5 name="paper-plane" size={14} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Iniciar chat</Text>
        </TouchableOpacity>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    marginBottom: 10,
  },
  itemSelected: {
    borderColor: '#007AFF',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemRight: {
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  name: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  meta: {
    color: '#bdbdbd',
    fontSize: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#555555',
  },
  checkCircleSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f1f1f',
    borderTopWidth: 1,
    borderColor: '#333333',
    padding: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: '#2a6fd0',
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Skeleton styles
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    marginBottom: 10,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3a3a3a',
  },
  skeletonText: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    height: 16,
    width: '60%',
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  skeletonLineSmall: {
    height: 12,
    width: '40%',
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyDesc: {
    marginTop: 4,
    fontSize: 14,
    color: '#bdbdbd',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UserPickerScreen;