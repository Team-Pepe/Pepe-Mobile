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
}

export default UserService;