import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';

export const AuthService = {
  // MÉTODO 1: Solo autenticación en auth.users (tabla de Supabase Auth)
  async signUp({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // MÉTODO 2: Solo insertar en tabla users del schema público (completamente independiente)
  async createUserProfile({ id, email, firstName, lastName, phone, birthDate }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: parseInt(id), // Convertir a entero
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            birth_date: birthDate
          }
        ])
        .select();

      if (error) {
        // Manejo específico de errores
        if (error.code === '23514') {
          // Error de constraint CHECK
          if (error.message.includes('users_id_check')) {
            throw new Error('La cédula no es válida. Debe ser menor o igual a 10');
          }
        }
        if (error.code === '23505') {
          // Error de duplicado (UNIQUE constraint)
          if (error.message.includes('email')) {
            throw new Error('Este email ya está registrado');
          }
          if (error.message.includes('id')) {
            throw new Error('Esta cédula ya está registrada');
          }
        }
        if (error.code === 'PGRST116') {
          // Error de autorización
          throw new Error('No tienes permisos para crear el perfil. Verifica tu sesión');
        }
        // Error genérico
        throw new Error(`Error al crear perfil: ${error.message}`);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Limpiar sesión y tokens
  async clearSession() {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error) {
      console.log('Error clearing session:', error);
      return { success: false, error: error.message };
    }
  },

  // MÉTODO 3: Registro completo (orquesta ambas operaciones)
  async signUpComplete({ email, password, firstName, lastName, phone, doc, birthDate }) {
    try {
      // Paso 0: Limpiar cualquier sesión previa para evitar conflictos de tokens
      await this.clearSession();

      // Paso 1: Crear usuario en auth.users
      const authResult = await this.signUp({ email, password });
      
      if (authResult.error) {
        return { 
          success: false, 
          error: authResult.error, 
          step: 'auth' 
        };
      }

      // Paso 2: Crear perfil en tabla users (schema público)
      const profileResult = await this.createUserProfile({
        id: doc,
        email,
        firstName,
        lastName,
        phone,
        birthDate
      });

      if (profileResult.error) {
        return { 
          success: false, 
          error: profileResult.error, 
          step: 'profile',
          authData: authResult.data // Incluir datos de auth para debugging
        };
      }

      return { 
        success: true, 
        authData: authResult.data,
        profileData: profileResult.data,
        error: null 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message, 
        step: 'unknown' 
      };
    }
  },

  // Autenticación con Facebook
  async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${Constants.expoConfig.scheme}://`
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Inicio de sesión
  async signIn({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Obtener sesión actual
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error.message };
    }
  }
  ,
  // Actualizar email del usuario autenticado (schema auth)
  async updateEmail(newEmail) {
    try {
      if (!newEmail) throw new Error('Email requerido');
      const { data, error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Actualizar contraseña del usuario autenticado (schema auth)
  async updatePassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Orquestador: actualiza email y/o contraseña en auth
  async updateAuthCredentials({ email, password }) {
    const result = { success: true, steps: {} };
    try {
      if (email) {
        const r = await this.updateEmail(email);
        result.steps.email = r;
        if (!r.success) result.success = false;
      }
      if (password) {
        const r = await this.updatePassword(password);
        result.steps.password = r;
        if (!r.success) result.success = false;
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};