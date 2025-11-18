import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import UserService from './user.service';

class MessageService {
  static async listMessages(conversationId, { limit = 50, before } = {}) {
    if (!conversationId) throw new Error('conversationId requerido');
    let q = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) q = q.lt('created_at', before);
    const { data, error } = await q;
    if (error) {
      console.error('❌ Error listMessages:', { conversationId, error });
      throw error;
    }
    console.log('✅ listMessages:', { conversationId, count: (data || []).length });
    return (data || []).reverse();
  }

  static async sendMessage(conversationId, content, attachments = []) {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('Usuario no autenticado');
    const userId = await UserService.getUserIdByEmail(user.email);
    if (!userId) throw new Error('No se pudo resolver user_id');
    console.log('🔍 sendMessage:', { conversationId, userId });
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, user_id: userId, content, attachments }])
      .select();
    if (error) {
      console.error('❌ Error sendMessage:', error);
      throw error;
    }
    return data?.[0] || null;
  }

  static async markRead(conversationId, timestamp = new Date().toISOString()) {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError || !user) throw new Error('Usuario no autenticado');
    const userId = await UserService.getUserIdByEmail(user.email);
    if (!userId) throw new Error('No se pudo resolver user_id');
    const { error } = await supabase
      .from('conversation_members')
      .update({ last_read_at: timestamp })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
    if (error) throw error;
    return { updated: true };
  }

  static async deleteMessage(messageId) {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
    return { deleted: true };
  }

  static async editMessage(messageId, content) {
    const { data, error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  }

  static async countUnread(conversationId, userId, since) {
    if (!conversationId) throw new Error('conversationId requerido');
    let q = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);
    if (since) q = q.gt('created_at', since);
    if (userId) q = q.neq('user_id', userId);
    const { count, error } = await q;
    if (error) {
      console.error('❌ Error countUnread:', { conversationId, userId, error });
      throw error;
    }
    console.log('✅ countUnread:', { conversationId, userId, count });
    return count || 0;
  }
}

export default MessageService;