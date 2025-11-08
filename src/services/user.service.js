import { supabase } from "../lib/supabase";

export class UserService {
  static async getUserIdByEmail(email) {
    if (!email) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching user ID:", error.message);
      return null;
    }
    return data?.id ?? null;
  }

  static async getUserNameById(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Error fetching user name:", error.message);
      return null;
    }
    const first = (data?.first_name || "").trim();
    const last = (data?.last_name || "").trim();
    const full = `${first} ${last}`.trim();
    const fallback = (data?.email || null);
    return full || fallback || null;
  }

  static async getUserNamesByIds(ids = []) {
    const list = Array.isArray(ids) ? Array.from(new Set(ids.filter(Boolean))) : [];
    if (!list.length) return {};
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", list);
    if (error) {
      console.error("Error fetching user names by ids:", error.message);
      return {};
    }
    const map = {};
    for (const row of data || []) {
      const first = (row?.first_name || "").trim();
      const last = (row?.last_name || "").trim();
      const full = `${first} ${last}`.trim();
      const fallback = (row?.email || null);
      if (row?.id) map[row.id] = full || fallback || null;
    }
    return map;
  }

  // Obtener perfil completo por email
  static async getUserProfileByEmail(email) {
    if (!email) return null;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, birth_date')
      .eq('email', email)
      .single();
    if (error) {
      console.error('Error fetching user profile by email:', error.message);
      return null;
    }
    return data || null;
  }

  // Actualizar perfil en public.users. Permite cambiar email, nombres, phone, birth_date.
  static async updateUserProfile({ currentEmail, newEmail, firstName, lastName, phone, birthDate }) {
    try {
      // Resolver fila actual por email
      const profile = await this.getUserProfileByEmail(currentEmail);
      if (!profile) throw new Error('Perfil no encontrado');
      const currentId = profile.id;

      const payload = {
        email: newEmail || profile.email,
        first_name: typeof firstName !== 'undefined' ? firstName : profile.first_name,
        last_name: typeof lastName !== 'undefined' ? lastName : profile.last_name,
        phone: typeof phone !== 'undefined' ? phone : profile.phone,
        birth_date: typeof birthDate !== 'undefined' ? birthDate : profile.birth_date,
      };

      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', currentId)
        .select();
      if (error) throw error;

      return { success: true, data: data?.[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default UserService;