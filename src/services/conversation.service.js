import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import UserService from './user.service';

class ConversationService {
  static async getOrCreateDirectConversation(targetUserId) {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('Usuario no autenticado');
    const currentUserId = await UserService.getUserIdByEmail(user.email);
    if (!currentUserId) throw new Error('No se pudo resolver user_id actual');
    if (!targetUserId) throw new Error('targetUserId requerido');
    const a = Math.min(currentUserId, targetUserId);
    const b = Math.max(currentUserId, targetUserId);
    const directKey = `${a}:${b}`;
    console.log('🔍 getOrCreateDirectConversation: direct_key =', directKey);
    const { data: existing, error: findErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'direct')
      .eq('direct_key', directKey)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing) return existing;
    const { data: convRows, error: createErr } = await supabase
      .from('conversations')
      .insert([{ type: 'direct', direct_key: directKey }])
      .select();
    if (createErr) throw createErr;
    const conversation = convRows?.[0];
    if (!conversation) throw new Error('No se pudo crear conversación');
    const { error: addErr1 } = await supabase
      .from('conversation_members')
      .insert([{ conversation_id: conversation.id, user_id: currentUserId, role: 'member' }]);
    if (addErr1) {
      console.error('❌ Error insertando tu membresía en conversación:', addErr1);
      throw addErr1;
    }
    const { error: addErr2 } = await supabase
      .from('conversation_members')
      .insert([{ conversation_id: conversation.id, user_id: targetUserId, role: 'member' }]);
    if (addErr2) {
      console.error('❌ Error insertando membresía del otro usuario:', addErr2);
      throw addErr2;
    }
    return conversation;
  }

  static async getOrCreateGroupConversationFromCommunity(communityId) {
    if (!communityId) throw new Error('communityId requerido');
    const { data: existing, error: findErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'group')
      .eq('community_id', communityId)
      .maybeSingle();
    if (findErr) throw findErr;
    if (existing) return existing;
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ type: 'group', community_id: communityId }])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  }

  static async findGroupConversationByCommunity(communityId) {
    if (!communityId) throw new Error('communityId requerido');
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('type', 'group')
      .eq('community_id', communityId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  static async addMember(conversationId, userId, role = 'member') {
    if (!conversationId || !userId) throw new Error('conversationId y userId requeridos');
    const { data: exists, error: existsErr } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle();
    if (existsErr) throw existsErr;
    if (exists) return { added: false };
    const { error } = await supabase
      .from('conversation_members')
      .insert([{ conversation_id: conversationId, user_id: userId, role }]);
    if (error) throw error;
    return { added: true };
  }

  static async removeMember(conversationId, userId) {
    if (!conversationId || !userId) throw new Error('conversationId y userId requeridos');
    const { error } = await supabase
      .from('conversation_members')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    if (error) throw error;
    return { removed: true };
  }

  static async listUserConversations(userId) {
    if (!userId) throw new Error('userId requerido');
    console.log('🔍 listUserConversations: user_id =', userId);
    const { data, error } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations:conversation_id(*), last_read_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    if (error) {
      console.error('❌ Error listUserConversations:', error);
      throw error;
    }
    let rows = data || [];
    console.log('✅ listUserConversations: filas membership =', rows.length);
    try {
      const orClause = `direct_key.like.${userId}:%,direct_key.like.%:${userId}`;
      const { data: directConvs, error: directErr } = await supabase
        .from('conversations')
        .select('id,type,community_id,direct_key')
        .eq('type', 'direct')
        .or(orClause);
      if (directErr) throw directErr;
      console.log('🔍 directConvs fallback por direct_key =', (directConvs || []).length);
      const existingIds = new Set(rows.map((r) => r.conversation_id));
      for (const c of directConvs || []) {
        if (!existingIds.has(c.id)) {
          rows.push({ conversation_id: c.id, conversations: c, last_read_at: null });
        }
      }
    } catch (e) {
      console.error('❌ Error listando direct conversations por direct_key:', e);
    }
    try {
      const { data: myMsgs, error: msgErr } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('user_id', userId);
      if (msgErr) throw msgErr;
      const msgConvIds = Array.from(new Set((myMsgs || []).map((m) => m.conversation_id).filter(Boolean)));
      console.log('🔍 fallback por mensajes: convIds =', msgConvIds.length);
      const existingIds2 = new Set(rows.map((r) => r.conversation_id));
      const toFetch = msgConvIds.filter((id) => !existingIds2.has(id));
      if (toFetch.length) {
        const { data: convsByMsgs, error: convErr } = await supabase
          .from('conversations')
          .select('id,type,community_id,direct_key')
          .in('id', toFetch);
        if (convErr) throw convErr;
        for (const c of convsByMsgs || []) {
          rows.push({ conversation_id: c.id, conversations: c, last_read_at: null });
        }
      }
    } catch (e) {
      console.error('❌ Error agregando conversaciones desde mensajes del usuario:', e);
    }
    console.log('✅ listUserConversations: filas total =', rows.length);
    return rows;
  }

  static async listMembers(conversationId) {
    if (!conversationId) throw new Error('conversationId requerido');
    const { data, error } = await supabase
      .from('conversation_members')
      .select('user_id, last_read_at, role')
      .eq('conversation_id', conversationId);
    if (error) throw error;
    return data || [];
  }
}

export default ConversationService;