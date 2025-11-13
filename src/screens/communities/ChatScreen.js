import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Keyboard, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import ChatService from '../../services/chat.service';
import MessageService from '../../services/message.service';
import UserService from '../../services/user.service';
import ConversationService from '../../services/conversation.service';
import { supabase } from '../../lib/supabase';

const getInitials = (name = '') => {
  const parts = name.split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts[1]?.[0] || '';
  return (first + last).toUpperCase();
};


const ChatScreen = ({ navigation, route }) => {
  const paramUser = route?.params?.user || null;
  const userIdParam = route?.params?.userId || null;
  const conversationIdParam = route?.params?.conversationId || null;
  const [headerName, setHeaderName] = useState(paramUser?.name || route?.params?.userName || 'Usuario');
  const [headerUsername, setHeaderUsername] = useState(paramUser?.username || route?.params?.username || 'user');
  const [conversationId, setConversationId] = useState(conversationIdParam || null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partnerReadAt, setPartnerReadAt] = useState(null);
  const [input, setInput] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const [inputBarHeight, setInputBarHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const viewabilityConfigRef = useRef({ itemVisiblePercentThreshold: 70 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const latestVisible = viewableItems.some((v) => v.index === 0);
    setShowScrollToBottom(!latestVisible);
  }).current;

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

  

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🟦 Chat init: params', { userIdParam, conversationIdParam });
        const meId = await ChatService.currentUserId();
        console.log('🟦 Usuario actual (public.users.id):', meId);
        setCurrentUserId(meId);
        if (userIdParam && !headerName) {
          const n = await UserService.getUserNameById(userIdParam);
          console.log('🟦 Nombre de cabecera resuelto:', n);
          setHeaderName(n || 'Usuario');
          setHeaderUsername(String(n || 'usuario').toLowerCase().replace(/\s+/g, ''));
        }
        let cid = conversationIdParam;
        if (!cid && userIdParam) {
          cid = await ChatService.startDirectChat(userIdParam);
          console.log('🟦 Conversación directa creada/obtenida:', cid);
          setConversationId(cid);
        }
        if (cid) {
          console.log('🟦 Cargando mensajes para conversación:', cid);
          const list = await MessageService.listMessages(cid, { limit: 50 });
          console.log('🟩 Mensajes cargados:', (list || []).length);
          const mapped = (list || []).map((m) => {
            const dt = new Date(m.created_at);
            const hh = String(dt.getHours()).padStart(2, '0');
            const mm = String(dt.getMinutes()).padStart(2, '0');
            return { id: String(m.id), from: m.user_id === meId ? 'me' : 'them', text: m.content, time: `${hh}:${mm}`, status: m.user_id === meId ? 'delivered' : undefined, createdAt: m.created_at };
          });
          setMessages(mapped);
          const mr = await MessageService.markRead(cid);
          console.log('🟩 Marcar leído resultado:', mr);
          const members = await ConversationService.listMembers(cid);
          console.log('🟦 Miembros conversación:', members);
          const partner = (members || []).find((m) => m.user_id !== meId);
          setPartnerReadAt(partner?.last_read_at || null);
          if (partner?.last_read_at) {
            const pra = new Date(partner.last_read_at).getTime();
            setMessages((prev) => prev.map((msg) => msg.from === 'me' && new Date(msg.createdAt).getTime() <= pra ? { ...msg, status: 'read' } : msg));
          }
        }
      } catch (e) {
        console.error('❌ Error en init de ChatScreen:', e?.message || e);
      }
    };
    init();
  }, [userIdParam, conversationIdParam]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    console.log('🟪 Suscribiendo canal realtime:', { conversationId, currentUserId });
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_members',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        console.log('🟨 UPDATE conversation_members recibido:', payload?.new);
        const changedUserId = payload?.new?.user_id;
        if (changedUserId === currentUserId) return;
        const newReadAt = payload?.new?.last_read_at || null;
        setPartnerReadAt(newReadAt);
        if (newReadAt) {
          const pra = new Date(newReadAt).getTime();
          setMessages((prev) => prev.map((msg) => (
            msg.from === 'me' && new Date(msg.createdAt).getTime() <= pra
              ? { ...msg, status: 'read' }
              : msg
          )));
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const m = payload?.new;
        console.log('🟨 INSERT messages recibido:', m);
        if (!m) return;
        const exists = (x) => x.id === String(m.id);
        const dt = new Date(m.created_at);
        const hh = String(dt.getHours()).padStart(2, '0');
        const mm = String(dt.getMinutes()).padStart(2, '0');
        const newMsg = {
          id: String(m.id),
          from: m.user_id === currentUserId ? 'me' : 'them',
          text: m.content,
          time: `${hh}:${mm}`,
          status: m.user_id === currentUserId ? 'delivered' : undefined,
          createdAt: m.created_at,
        };
        setMessages((prev) => {
          if (prev.some(exists)) return prev;
          const idx = prev.findIndex((p) => p.from === 'me' && p.status === 'sent' && p.text === m.content);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], id: String(m.id), time: `${hh}:${mm}`, status: 'delivered', createdAt: m.created_at };
            return copy;
          }
          return [...prev, newMsg];
        });
        if (m.user_id !== currentUserId) {
          const mr = await MessageService.markRead(conversationId);
          console.log('🟩 Mark read por INSERT de tercero:', mr);
        }
      })
      .subscribe();
    return () => {
      console.log('🟥 Eliminando canal realtime:', `chat:${conversationId}`);
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const handleSend = async () => {
    try {
      const text = input.trim();
      if (!text) return;
      let cid = conversationId;
      if (!cid && userIdParam) {
        cid = await ChatService.startDirectChat(userIdParam);
        console.log('🟦 Conversación creada en envío:', cid);
        setConversationId(cid);
      }
      if (!cid) return;
      console.log('🟪 Enviando mensaje...', { cid, textLength: text.length });
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const tempId = String(Date.now());
      const pending = { id: tempId, from: 'me', text, time, status: 'sent', createdAt: now.toISOString() };
      setMessages((prev) => [...prev, pending]);
      setInput('');
      const saved = await MessageService.sendMessage(cid, text, []);
      console.log('🟩 Mensaje guardado:', saved);
      const finalId = String(saved?.id || tempId);
    setMessages((prev) => {
      const finalStr = String(finalId);
      const already = prev.some((m) => m.id === finalStr);
      if (already) {
        return prev.filter((m) => m.id !== tempId);
      }
      return prev.map((m) => (m.id === tempId ? { ...m, id: finalStr, status: 'delivered', createdAt: saved?.created_at || m.createdAt } : m));
    });
      const members = await ConversationService.listMembers(cid);
      const partner = (members || []).find((m) => m.user_id !== currentUserId);
      const pra = partner?.last_read_at ? new Date(partner.last_read_at).getTime() : null;
      if (pra) {
        setMessages((prev) => prev.map((m) => m.id === finalId && new Date(m.createdAt).getTime() <= pra ? { ...m, status: 'read' } : m));
      }
    } catch (e) {
      console.error('❌ Error al enviar mensaje:', e?.message || e);
    }
  };

  const MessageItem = React.memo(({ item }) => {
    const isMe = item.from === 'me';
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;
    const metaOpacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(metaOpacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
      });
    }, []);
    return (
      <Animated.View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft, { opacity, transform: [{ translateY }] }]}> 
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
          <Animated.View style={[styles.metaRow, { opacity: metaOpacity }]}> 
            <Text style={styles.bubbleTime}>{item.time}</Text>
            {isMe && (
              <>
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
              </>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    );
  });

  const invertedData = useMemo(() => [...messages].reverse(), [messages]);
  const renderItem = useCallback(({ item }) => <MessageItem item={item} />, []);

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(headerName)}</Text>
          </View>
          <View>
            <Text style={styles.title}>{headerName}</Text>
            <Text style={styles.subtitle}>@{headerUsername}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={listRef}
        inverted
        data={invertedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: 0, paddingTop: inputBarHeight + keyboardOffset + Math.max(insets.bottom, 8) }
        ]}
        maintainVisibleContentPosition={{ autoscrollToTopThreshold: 1, minIndexForVisible: 1 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfigRef.current}
        keyboardShouldPersistTaps="handled"
      />

      {showScrollToBottom && (
        <TouchableOpacity
          style={[
            styles.scrollDownButton,
            { bottom: inputBarHeight + keyboardOffset + insets.bottom + 16 }
          ]}
          activeOpacity={0.8}
          onPress={() => {
            try {
              listRef.current?.scrollToIndex?.({ index: 0, animated: true });
            } catch {
              listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
            }
          }}
        >
          <FontAwesome5 name="chevron-down" size={16} color="#ffffff" />
        </TouchableOpacity>
      )}

      <View
        style={[
          styles.inputBar,
          {
            bottom: keyboardOffset + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8)
          },
        ]}
        onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity style={styles.inputIcon} activeOpacity={0.8}>
          <FontAwesome5 name="paperclip" size={16} color="#bdbdbd" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onFocus={() => { listRef.current?.scrollToOffset?.({ offset: 0, animated: true }); }}
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
  bubbleTime: { color: '#dcdcdc', fontSize: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
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
  scrollDownButton: {
    position: 'absolute', right: 16,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    zIndex: 10,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
});

export default ChatScreen;