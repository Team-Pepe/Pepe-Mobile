import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const getInitials = (name = '') => {
  const parts = name.split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};

const initialMessages = [
  { id: '1', from: 'them', text: '¡Hola! ¿Te interesa el producto?', time: '10:20' },
  { id: '2', from: 'me', text: 'Sí, ¿tiene garantía?', time: '10:22', status: 'read' },
  { id: '3', from: 'them', text: 'Claro, 12 meses.', time: '10:23' },
];

const ChatScreen = ({ navigation, route }) => {
  const user = route?.params?.user || { name: 'Usuario', username: 'user' };
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const insets = useSafeAreaInsets();

  // Teclado dinámico: desplaza todo el contenido hacia arriba y eleva la barra de entrada
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      setKeyboardOffset(height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const id = String(Date.now());
    const msg = { id, from: 'me', text, time, status: 'sent' };
    setMessages((prev) => [...prev, msg]);
    setInput('');

    // Simulación de progresión de estados: enviado -> entregado -> leído
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'delivered' } : m)));
    }, 800);
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m)));
    }, 1800);
  };

  const renderItem = ({ item }) => {
    const isMe = item.from === 'me';
    return (
      <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Text style={styles.bubbleTime}>{item.time}</Text>
          {isMe && (
            <View style={styles.statusRow}>
              {item.status === 'sent' && (
                <View style={styles.statusBadge}>
                  <FontAwesome5 name="check" size={10} color="#dcdcdc" />
                  <Text style={styles.statusText}> Enviado</Text>
                </View>
              )}
              {item.status === 'delivered' && (
                <View style={styles.statusBadge}>
                  <FontAwesome5 name="check" size={10} color="#dcdcdc" />
                  <FontAwesome5 name="check" size={10} color="#dcdcdc" style={{ marginLeft: 2 }} />
                  <Text style={styles.statusText}> Entregado</Text>
                </View>
              )}
              {item.status === 'read' && (
                <View style={styles.statusBadge}>
                  <FontAwesome5 name="check" size={10} color="#ffffff" />
                  <FontAwesome5 name="check" size={10} color="#ffffff" style={{ marginLeft: 2 }} />
                  <Text style={[styles.statusText, { color: '#ffffff' }]}> Leído</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <View>
            <Text style={styles.title}>{user.name}</Text>
            <Text style={styles.subtitle}>@{user.username}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: 90 + keyboardOffset + Math.max(insets.bottom, 8) }
        ]}
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={[
          styles.inputBar,
          {
            bottom: keyboardOffset + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8)
          }
        ]}
      >
        <TouchableOpacity style={styles.inputIcon} activeOpacity={0.8}>
          <FontAwesome5 name="paperclip" size={16} color="#bdbdbd" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje"
          placeholderTextColor="#8a8a8a"
        />
        <TouchableOpacity style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} onPress={handleSend} activeOpacity={input.trim() ? 0.8 : 1}>
          <FontAwesome5 name="paper-plane" size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f1f1f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#2c2c2c',
    borderBottomWidth: 1, borderBottomColor: '#333333',
  },
  backButton: { padding: 8 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#3a3a3a', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  title: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#bdbdbd', fontSize: 12 },

  listContainer: { padding: 16, paddingBottom: 90 },
  messageRow: { marginBottom: 8 },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '80%', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1,
  },
  bubbleThem: { backgroundColor: '#2c2c2c', borderColor: '#333333' },
  bubbleMe: { backgroundColor: '#007AFF', borderColor: '#2a6fd0' },
  bubbleText: { color: '#ffffff', fontSize: 14 },
  bubbleTime: { color: '#dcdcdc', fontSize: 10, marginTop: 4, textAlign: 'right' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { color: '#dcdcdc', fontSize: 10, marginLeft: 4 },

  inputBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1f1f1f', borderTopWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  inputIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
  },
  input: {
    flex: 1, color: '#ffffff', fontSize: 14,
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  sendButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#007AFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  sendButtonDisabled: { backgroundColor: '#2a6fd0', opacity: 0.6 },
});

export default ChatScreen;