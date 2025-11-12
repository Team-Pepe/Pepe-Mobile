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
    if (addErr1) throw addErr1;
    const { error: addErr2 } = await supabase
      .from('conversation_members')
      .insert([{ conversation_id: conversation.id, user_id: targetUserId, role: 'member' }]);
    if (addErr2) throw addErr2;
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
    const { data, error } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations:conversation_id(*), last_read_at')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

export default ConversationService;