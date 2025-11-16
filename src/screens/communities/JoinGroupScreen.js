import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import CommunityService from '../../services/community.service';
import ConversationService from '../../services/conversation.service';
import ChatService from '../../services/chat.service';
import { isValidJoinCode, normalizeJoinCode } from '../../utils/groupCode';

const JoinGroupScreen = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const canJoin = code.trim().length > 0 && isValidJoinCode(normalizeJoinCode(code));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Unirse a grupo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Código de invitación</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Ej. AB12-CD34"
            placeholderTextColor="#8a8a8a"
          />
        </View>
        {error ? (
          <Text style={[styles.helper, { color: '#ff6b6b' }]}>{error}</Text>
        ) : success ? (
          <Text style={[styles.helper, { color: '#34C759' }]}>Te has unido correctamente</Text>
        ) : (
          <Text style={styles.helper}>Ingresa el código de 8 caracteres</Text>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryButton, (!canJoin || joining) && styles.primaryButtonDisabled]}
          activeOpacity={canJoin && !joining ? 0.8 : 1}
          onPress={async () => {
            setError('');
            setSuccess(false);
            const normalized = normalizeJoinCode(code);
            if (!isValidJoinCode(normalized)) {
              setError('Formato inválido. Usa 4 letras + 4 números');
              return;
            }
            try {
              setJoining(true);
              const community = await CommunityService.findByJoinCode(normalized);
              if (!community) {
                setError('Código no encontrado');
                return;
              }
              const meId = await ChatService.currentUserId();
              if (!meId) {
                setError('Usuario no autenticado');
                return;
              }
              await CommunityService.addMember(community.id, meId, 'member');
              const conv = await ConversationService.getOrCreateGroupConversationFromCommunity(community.id);
              if (conv) await ConversationService.addMember(conv.id, meId, 'member');
              setSuccess(true);
            } catch (e) {
              setError(e?.message || 'Error al unirse');
            } finally {
              setJoining(false);
            }
          }}
        >
          <FontAwesome5 name="key" size={14} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{joining ? 'Uniendo…' : 'Unirse'}</Text>
        </TouchableOpacity>
      </View>
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
  inputBox: {
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { color: '#ffffff', fontSize: 14 },
  helper: { color: '#bdbdbd', fontSize: 12, marginTop: 12 },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1f1f1f',
    borderTopWidth: 1, borderColor: '#333333', padding: 16,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 12,
  },
  primaryButtonDisabled: { backgroundColor: '#2e9f4a', opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default JoinGroupScreen;