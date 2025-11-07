import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const mockConversations = [
  { id: '1', title: 'Chat con vendedor: Juan', lastMessage: '¿Te interesa aún?', time: '10:24', unread: 2 },
  { id: '2', title: 'Grupo: Ofertas Laptops', lastMessage: 'Nuevo descuento en Dell', time: 'Ayer', unread: 0 },
  { id: '3', title: 'Difusión: Anuncios PepePlace', lastMessage: 'Actualización de la app', time: 'Lun', unread: 1 },
];

const CommunitiesScreen = ({ navigation }) => {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemMessage}>{item.lastMessage}</Text>
        {item.unread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Comunidades</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setShowTypeSelector(true)}>
          <FontAwesome5 name="plus" size={16} color="#ffffff" />
          <Text style={styles.newButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <FontAwesome5 name="search" size={14} color="#bdbdbd" />
        <TextInput style={styles.searchInput} placeholder="Buscar chats, grupos..." placeholderTextColor="#8a8a8a" />
      </View>

      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes conversaciones</Text>}
      />

      <Modal
        visible={showTypeSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypeSelector(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowTypeSelector(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Crear</Text>
          <View style={styles.sheetOptions}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => { setShowTypeSelector(false); navigation.navigate('UserPicker'); }}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: 'rgba(0,122,255,0.15)' }]}> 
                  <FontAwesome5 name="user" size={16} color="#007AFF" />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Chat individual</Text>
                  <Text style={styles.optionDesc}>Conversación 1 a 1</Text>
                </View>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="#bdbdbd" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={() => { setShowTypeSelector(false); navigation.navigate('GroupAccess'); }}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: 'rgba(52,199,89,0.15)' }]}> 
                  <FontAwesome5 name="users" size={16} color="#34C759" />
                </View>
                <View>
                  <Text style={styles.optionTitle}>Grupo</Text>
                  <Text style={styles.optionDesc}>Conversación entre varias personas</Text>
                </View>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="#bdbdbd" />
            </TouchableOpacity>
          </View>

          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTypeSelector(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
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
  },
  item: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemTime: {
    color: '#bdbdbd',
    fontSize: 12,
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMessage: {
    color: '#bdbdbd',
    fontSize: 13,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#bdbdbd',
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    marginBottom: 8,
  },
  sheetTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sheetOptions: {
    gap: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionDesc: {
    color: '#bdbdbd',
    fontSize: 12,
  },
  sheetActions: {
    marginTop: 12,
  },
  cancelButton: {
    alignSelf: 'stretch',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CommunitiesScreen;