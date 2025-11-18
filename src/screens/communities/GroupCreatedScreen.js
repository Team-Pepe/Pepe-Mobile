import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';

const GroupCreatedScreen = ({ navigation, route }) => {
  const { community, code, conversationId } = route.params || {};

  const name = community?.name || 'Grupo';
  const description = community?.description || '';
  const privacy = community?.privacy || 'private';
  const topics = Array.isArray(community?.topics) ? community.topics : [];

  const handleCopy = async () => {
    if (code) await Clipboard.setStringAsync(code);
  };

  const handleShare = async () => {
    if (code) await Share.share({ message: `Únete a ${name}: código ${code}` });
  };

  const goToChat = () => {
    if (conversationId) {
      navigation.replace('Chat', { conversationId, userName: name });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Grupo creado</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="users" size={18} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{name}</Text>
              <Text style={styles.cardDesc}>{description}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <FontAwesome5 name={privacy === 'private' ? 'lock' : 'unlock'} size={12} color="#ffffff" />
              <Text style={styles.metaText}>{privacy === 'private' ? 'Privado' : 'Público'}</Text>
            </View>
            {topics.map((t) => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Código de invitación</Text>
          <Text style={styles.codeText}>{code || ''}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.button, styles.buttonDark]} onPress={handleCopy}>
              <FontAwesome5 name="copy" size={14} color="#ffffff" />
              <Text style={styles.buttonText}>Copiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonDark]} onPress={handleShare}>
              <FontAwesome5 name="share" size={14} color="#ffffff" />
              <Text style={styles.buttonText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryButton]} onPress={goToChat}>
          <FontAwesome5 name="comments" size={16} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Ir al chat</Text>
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
  body: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  card: {
    backgroundColor: '#2c2c2c', borderRadius: 12, borderWidth: 1, borderColor: '#333333',
    padding: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.15)',
  },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  cardDesc: { color: '#bdbdbd', fontSize: 12, marginTop: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2c2c2c',
    borderWidth: 1, borderColor: '#333333', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  metaText: { color: '#ffffff', fontSize: 12 },
  topicChip: {
    backgroundColor: 'rgba(0,122,255,0.15)', borderColor: '#007AFF', borderWidth: 1,
    borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10,
  },
  topicText: { color: '#ffffff', fontSize: 12 },
  sectionTitle: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  codeText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  button: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
  },
  buttonDark: { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#333333' },
  buttonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#34C759', borderRadius: 12, paddingVertical: 12,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
});

export default GroupCreatedScreen;