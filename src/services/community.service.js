import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import UserService from './user.service';

class CommunityService {
  static async createCommunity({ name, description, privacy = 'private', topics = [], join_code }) {
    const { user } = await AuthService.getCurrentUser();
    const creatorId = user?.email ? await UserService.getUserIdByEmail(user.email) : null;
    const payload = {
      name,
      description,
      privacy,
      topics,
      join_code,
      created_by: creatorId || undefined,
    };
    console.log('createCommunity(payload):', payload);
    console.log('createCommunity current auth user:', user?.email, 'creatorId:', creatorId);
    const { data, error } = await supabase
      .from('communities')
      .insert([payload])
      .select();
    if (error) {
      console.error('createCommunity error:', error);
      throw error;
    }
    console.log('createCommunity result:', data);
    return data?.[0] || null;
  }

  static async findByJoinCode(code) {
    console.log('findByJoinCode:', code);
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('join_code', code)
      .maybeSingle();
    if (error) {
      console.error('findByJoinCode error:', error);
      throw error;
    }
    console.log('findByJoinCode result:', data);
    return data || null;
  }

  static async addMember(communityId, userId, role = 'member') {
    console.log('addMember:', { communityId, userId, role });
    const { data: exists, error: existsErr } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .maybeSingle();
    if (existsErr) {
      console.error('addMember existsErr:', existsErr);
      throw existsErr;
    }
    if (exists) return { added: false };
    const { error } = await supabase
      .from('community_members')
      .insert([{ community_id: communityId, user_id: userId, role }]);
    if (error) {
      console.error('addMember insert error:', error);
      throw error;
    }
    console.log('addMember insert ok');
    return { added: true };
  }
}

export default CommunityService;