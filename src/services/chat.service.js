import ConversationService from './conversation.service';
import MessageService from './message.service';
import { AuthService } from './auth.service';
import UserService from './user.service';

class ChatService {
  static async startDirectChat(targetUserId) {
    const conv = await ConversationService.getOrCreateDirectConversation(targetUserId);
    return conv?.id || null;
  }

  static async startGroupChat(communityId) {
    const conv = await ConversationService.getOrCreateGroupConversationFromCommunity(communityId);
    return conv?.id || null;
  }

  static async getConversation(conversationId) {
    return conversationId;
  }

  static async listMessages(conversationId, opts) {
    return MessageService.listMessages(conversationId, opts);
  }

  static async sendMessage(conversationId, content, attachments = []) {
    return MessageService.sendMessage(conversationId, content, attachments);
  }

  static async currentUserId() {
    const { user, error: authError } = await AuthService.getCurrentUser();
    if (authError) {
      console.error('❌ Auth error en currentUserId:', authError);
      return null;
    }
    if (!user) {
      console.error('❌ No hay usuario autenticado en currentUserId');
      return null;
    }
    console.log('🔍 currentUserId: email autenticado =', user.email);
    const uid = await UserService.getUserIdByEmail(user.email);
    console.log('🔍 currentUserId: user_id resuelto en public.users =', uid);
    if (!uid) {
      console.error('❌ No se encontró perfil en public.users para ese email');
    }
    return uid;
  }
}

export default ChatService;