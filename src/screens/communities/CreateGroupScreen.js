import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import CommunityService from '../../services/community.service';
import ConversationService from '../../services/conversation.service';
import ChatService from '../../services/chat.service';
import { generateJoinCode } from '../../utils/groupCode';
import UserService from '../../services/user.service';

const CreateGroupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState(['Ofertas', 'Tecnología', 'Gaming']);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [createdConvId, setCreatedConvId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [membersLoading, setMembersLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Ingresa un nombre';
    if (!['private','public'].includes(privacy)) e.privacy = 'Privacidad inválida';
    if ((description || '').trim().length < 0) e.description = 'Min. 0 caracteres';
    return e;
  };
  const canCreate = Object.keys(validate()).length === 0;

  useEffect(() => {
    const load = async () => {
      const mapped = await UserService.listBasicUsers();
      setUsers(mapped);
      setFilteredUsers(mapped);
      setMembersLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!membersLoading) {
      const lower = memberSearch.toLowerCase();
      const res = users.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          (u.email || '').toLowerCase().includes(lower)
      );
      setFilteredUsers(res);
    }
  }, [memberSearch, membersLoading, users]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Crear grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        {/* Avatar del grupo (placeholder UI) */}
        <Text style={styles.label}>Avatar del grupo</Text>
        <View style={styles.avatarRow}>
          <View style={styles.groupAvatar}>
            <FontAwesome5 name="users" size={22} color="#bdbdbd" />
          </View>
          <TouchableOpacity style={styles.changeAvatarButton} activeOpacity={0.8}>
            <FontAwesome5 name="camera" size={12} color="#ffffff" />
            <Text style={styles.changeAvatarText}>Cambiar imagen</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre del grupo</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Ofertas Laptops"
            placeholderTextColor="#8a8a8a"
          />
        </View>
        {errors.name && <Text style={{ color: '#ff6b6b', fontSize: 12 }}>{errors.name}</Text>}

        <Text style={[styles.label, { marginTop: 16 }]}>Descripción</Text>
        <View style={[styles.inputBox, { minHeight: 90 }] }>
          <TextInput
            style={[styles.input, { height: 70 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Cuenta de qué trata el grupo"
            placeholderTextColor="#8a8a8a"
            multiline
          />
        </View>
        {errors.description && <Text style={{ color: '#ff6b6b', fontSize: 12 }}>{errors.description}</Text>}

        <Text style={[styles.label, { marginTop: 16 }]}>Privacidad</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, privacy === 'private' && styles.chipActive]}
            onPress={() => setPrivacy('private')}
          >
            <Text style={styles.chipText}>Privado</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, privacy === 'public' && styles.chipActive]}
            onPress={() => setPrivacy('public')}
          >
            <Text style={styles.chipText}>Público</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Temas</Text>
        <View style={styles.chipsWrap}>
          {topics.map((t) => {
            const active = selectedTopics.includes(t);
            return (
              <TouchableOpacity
                key={t}
                style={[styles.chipSm, active && styles.chipSmActive]}
                onPress={() => {
                  setSelectedTopics((prev) =>
                    prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                  );
                }}
              >
                <Text style={styles.chipSmText}>{t}</Text>
              </TouchableOpacity>
            );
          })}
          {/* Chip para añadir nuevos temas (UI) */}
          <TouchableOpacity style={styles.chipAdd} activeOpacity={0.8}>
            <FontAwesome5 name="plus" size={10} color="#ffffff" />
            <Text style={styles.chipAddText}>Añadir</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>Miembros</Text>
        <View style={styles.searchBar}> 
          <FontAwesome5 name="search" size={14} color="#bdbdbd" />
          <TextInput
            style={styles.searchInput}
            value={memberSearch}
            onChangeText={setMemberSearch}
            placeholder="Buscar por nombre o email"
            placeholderTextColor="#8a8a8a"
          />
          {memberSearch.length > 0 && (
            <TouchableOpacity onPress={() => setMemberSearch('')}>
              <FontAwesome5 name="times" size={14} color="#bdbdbd" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ marginTop: 8 }}>
          {membersLoading ? (
            <Text style={styles.helper}>Cargando usuarios…</Text>
          ) : (
            <>
              <FlatList
                data={filteredUsers}
                keyExtractor={(u) => u.id}
                renderItem={({ item: u }) => {
                  const selected = selectedUserIds.includes(u.id);
                  return (
                    <View style={styles.userRow}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>{(u.name[0] || '?').toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{u.name}</Text>
                        <Text style={styles.userEmail}>{u.email}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.chip, selected ? styles.chipActive : null]}
                        onPress={() => {
                          setSelectedUserIds((prev) =>
                            selected ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                          );
                        }}
                      >
                        <Text style={styles.chipText}>{selected ? 'Quitar' : 'Añadir'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                scrollEnabled={false}
                style={styles.userList}
                contentContainerStyle={{ paddingBottom: 4 }}
                keyboardShouldPersistTaps="handled"
              />
              {selectedUserIds.length > 0 && (
                <View style={styles.selectedWrap}>
                  {selectedUserIds.map((id) => {
                    const u = users.find((x) => x.id === id);
                    if (!u) return null;
                    return (
                      <TouchableOpacity
                        key={id}
                        style={[styles.chipSm, styles.chipSmActive]}
                        onPress={() => setSelectedUserIds((prev) => prev.filter((x) => x !== id))}
                      >
                        <Text style={styles.chipSmText}>{u.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>

        <Text style={styles.helper}>Completa los campos para crear tu grupo</Text>
        {errors.form && <Text style={[styles.helper, { color: '#ff6b6b' }]}>{errors.form}</Text>}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryButton, (!canCreate || creating) && styles.primaryButtonDisabled]}
          activeOpacity={canCreate && !creating ? 0.8 : 1}
          onPress={async () => {
            console.log('CreateGroup pressed');
            const v = validate();
            setErrors(v);
            if (Object.keys(v).length > 0) return;
            try {
              setCreating(true);
              let code = generateJoinCode();
              console.log('Generated code:', code);
              for (let i = 0; i < 5; i++) {
                const exists = await CommunityService.findByJoinCode(code);
                if (!exists) break;
                code = generateJoinCode();
                console.log('Code collision, regenerated:', code);
              }
              console.log('Creating community with code:', code);
              const community = await CommunityService.createCommunity({ name: name.trim(), description: description.trim(), privacy, topics: selectedTopics, join_code: code });
              console.log('Community created:', community);
              const meId = await ChatService.currentUserId();
              console.log('currentUserId:', meId);
              if (meId) await CommunityService.addMember(community.id, meId, 'admin');
              const conv = await ConversationService.getOrCreateGroupConversationFromCommunity(community.id);
              if (conv && meId) await ConversationService.addMember(conv.id, meId, 'admin');
              for (const id of selectedUserIds) {
                if (meId && String(meId) === String(id)) continue;
                await CommunityService.addMember(community.id, parseInt(id), 'member');
                if (conv) await ConversationService.addMember(conv.id, parseInt(id), 'member');
              }
              navigation.replace('GroupCreated', { community, code, conversationId: conv?.id || null });
            } catch (e) {
              console.error('CreateGroup error:', e);
              setErrors({ form: e?.message || 'Error creando grupo' });
            } finally {
              setCreating(false);
            }
          }}
        >
          <FontAwesome5 name="plus" size={14} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{creating ? 'Creando…' : 'Crear'}</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={creating} transparent animationType="fade">
        <View style={styles.modalOverlay} />
        <View style={styles.modalCenter}>
          <ActivityIndicator color="#ffffff" size="small" />
          <Text style={styles.loadingText}>Creando grupo…</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f1f1f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#2c2c2c',
    borderBottomWidth: 1, borderBottomColor: '#333333',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  form: { paddingHorizontal: 16, paddingTop: 16 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  groupAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    alignItems: 'center', justifyContent: 'center',
  },
  changeAvatarButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  changeAvatarText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  inputBox: {
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { color: '#ffffff', fontSize: 14 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12,
  },
  chipActive: { backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF' },
  chipText: { color: '#ffffff', fontSize: 12 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chipSm: {
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333',
    borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipSmActive: { backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF' },
  chipSmText: { color: '#ffffff', fontSize: 12 },
  chipAdd: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#007AFF', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  chipAddText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  helper: { color: '#bdbdbd', fontSize: 12, marginTop: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { color: '#ffffff', fontSize: 14, flex: 1 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#333333',
  },
  userList: { maxHeight: 280 },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#2c2c2c',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333333',
  },
  userAvatarText: { color: '#bdbdbd', fontSize: 12, fontWeight: 'bold' },
  userName: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  userEmail: { color: '#8a8a8a', fontSize: 12 },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1f1f1f',
    borderTopWidth: 1, borderColor: '#333333', padding: 16,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 12,
  },
  primaryButtonDisabled: { backgroundColor: '#2a6fd0', opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  modalOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#ffffff', fontSize: 12, marginTop: 8 },
});

export default CreateGroupScreen;