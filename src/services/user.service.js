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
}

export default UserService;