import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import ConversationService from '../../services/conversation.service';
import ChatService from '../../services/chat.service';
import MessageService from '../../services/message.service';
import UserService from '../../services/user.service';
import { supabase } from '../../lib/supabase';
import { usePullRefresh } from '../../utils/pullRefresh';

const CommunitiesScreen = ({ navigation }) => {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [segment, setSegment] = useState('all');

  const load = async () => {
    console.log('🔎 Entrando a load() de CommunitiesScreen');
    const meId = await ChatService.currentUserId();
    console.log('🔍 meId resuelto =', meId);
    if (!meId) {
      console.error('❌ No se pudo resolver meId; probablemente falta perfil en public.users o RLS bloquea');
      setConversations([]);
      setFiltered([]);
      setLoading(false);
      return;
    }
      let rows = [];
      try {
        rows = await ConversationService.listUserConversations(meId);
      } catch (e) {
        console.error('❌ Error listando conversaciones del usuario:', e);
        rows = [];
      }
      console.log('✅ Conversaciones encontradas =', rows.length);
      const items = [];
      for (const row of rows) {
        const conv = row.conversations || {};
        const cid = conv.id;
        let title = 'Chat';
        let partnerUserId = null;
        let partnerName = '';
        if (conv.type === 'direct' && conv.direct_key) {
          const [aStr, bStr] = String(conv.direct_key).split(':');
          const a = Number(aStr);
          const b = Number(bStr);
          const otherId = meId === a ? b : a;
          partnerUserId = otherId;
          const n = await UserService.getUserNameById(otherId);
          partnerName = n || 'Usuario';
          title = partnerName;
        } else if (conv.type === 'group') {
          title = 'Grupo';
          if (conv.community_id) {
            try {
              const { data: comm } = await supabase
                .from('communities')
                .select('name')
                .eq('id', conv.community_id)
                .maybeSingle();
              if (comm?.name) title = comm.name;
            } catch (e) {}
          }
        }
        let lastMessage = '';
        let time = '';
        let sortTs = 0;
        let last = [];
        try {
          last = await MessageService.listMessages(cid, { limit: 1 });
        } catch (e) {
          console.error('❌ Error obteniendo último mensaje de conversación', cid, e);
          last = [];
        }
        if (last && last.length > 0) {
          const m = last[0];
          lastMessage = m.content;
          const dt = new Date(m.created_at);
          const hh = String(dt.getHours()).padStart(2, '0');
          const mm = String(dt.getMinutes()).padStart(2, '0');
          time = `${hh}:${mm}`;
          sortTs = dt.getTime();
        }
        const lastReadAt = row.last_read_at || null;
        let unread = 0;
        try {
          unread = await MessageService.countUnread(cid, meId, lastReadAt);
        } catch (e) {
          console.error('❌ Error contando no leídos de conversación', cid, e);
          unread = 0;
        }
        const compositeId = conv.type === 'group' ? `group:${cid}` : `direct:${cid}`;
        items.push({ id: compositeId, title, lastMessage, time, unread, conversationId: cid, partnerUserId, partnerName, type: conv.type, communityId: conv.community_id || null, sortTs });
      }
      try {
        const { data: memberships, error: memErr } = await supabase
          .from('community_members')
          .select('community_id, communities:community_id(id, name)')
          .eq('user_id', meId);
        if (memErr) {
          console.error('❌ Error listando community_members para usuario:', memErr);
        }
        for (const m of memberships || []) {
          const commId = m.community_id;
          const commName = m.communities?.name || 'Grupo';
          let existing = items.find((it) => it.type === 'group' && it.communityId === commId);
          if (existing) continue;
          let conv = null;
          try {
            conv = await ConversationService.findGroupConversationByCommunity(commId);
          } catch (e) {
            conv = null;
          }
          const conversationId = conv?.id || null;
          const compositeId = conversationId ? `group:${conversationId}` : `group:community:${commId}`;
          items.push({ id: compositeId, title: commName, lastMessage: '', time: '', unread: 0, conversationId, partnerUserId: null, partnerName: '', type: 'group', communityId: commId, sortTs: 0 });
        }
      } catch (e) {
        console.error('❌ Error cargando grupos del usuario:', e);
      }

      const ordered = [...items].sort((a, b) => (b.sortTs || 0) - (a.sortTs || 0));
      setConversations(ordered);
      setFiltered(ordered);
      setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const { refreshing, refreshControl } = usePullRefresh(load);

  useEffect(() => {
    const q = search.toLowerCase();
    let res = conversations.filter((c) => c.title.toLowerCase().includes(q) || (c.lastMessage || '').toLowerCase().includes(q));
    if (segment === 'direct') res = res.filter((c) => c.type === 'direct');
    if (segment === 'group') res = res.filter((c) => c.type === 'group');
    setFiltered(res);
  }, [search, conversations, segment]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={async () => {
        if (item.partnerUserId) {
          navigation.navigate('Chat', { userId: item.partnerUserId, userName: item.partnerName });
        } else if (item.conversationId) {
          navigation.navigate('Chat', { conversationId: item.conversationId, userName: item.title });
        } else if (item.type === 'group' && item.communityId) {
          try {
            const conv = await ConversationService.findGroupConversationByCommunity(item.communityId);
            if (conv?.id) {
              navigation.navigate('Chat', { conversationId: conv.id, userName: item.title });
            } else {
              const created = await ConversationService.getOrCreateGroupConversationFromCommunity(item.communityId);
              if (created?.id) navigation.navigate('Chat', { conversationId: created.id, userName: item.title });
            }
          } catch (e) {}
        }
      }}
    >
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

  const SkeletonItem = () => (
    <View style={styles.skeletonItem}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonTime} />
      </View>
      <View style={styles.skeletonLine} />
    </View>
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
    <TextInput style={styles.searchInput} placeholder="Buscar chats, grupos..." placeholderTextColor="#8a8a8a" value={search} onChangeText={setSearch} />
  </View>

      <View style={styles.segmentRow}>
        <TouchableOpacity style={[styles.segmentChip, segment === 'all' && styles.segmentChipActive]} onPress={() => setSegment('all')}>
          <Text style={styles.segmentChipText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentChip, segment === 'direct' && styles.segmentChipActive]} onPress={() => setSegment('direct')}>
          <Text style={styles.segmentChipText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentChip, segment === 'group' && styles.segmentChipActive]} onPress={() => setSegment('group')}>
          <Text style={styles.segmentChipText}>Grupos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingHeader}>
            <ActivityIndicator color="#ffffff" size="small" />
            <Text style={styles.loadingText}>Cargando chats…</Text>
          </View>
          <FlatList
            data={[...Array(6)]}
            keyExtractor={(_, i) => String(i)}
            renderItem={SkeletonItem}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={refreshControl}
          ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes conversaciones</Text>}
        />
      )}

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
  segmentRow: {
    flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 10,
  },
  segmentChip: {
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
  },
  segmentChipActive: {
    backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF'
  },
  segmentChipText: { color: '#ffffff', fontSize: 12 },
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
  loadingContainer: {
    flex: 1,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
  },
  skeletonItem: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 14,
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skeletonTitle: {
    height: 16,
    width: '40%',
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  skeletonTime: {
    height: 12,
    width: 50,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
  skeletonLine: {
    height: 12,
    width: '70%',
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
  },
});

export default CommunitiesScreen;