import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://dpwcarbfpetjhoagaave.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwd2NhcmJmcGV0amhvYWdhYXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mzk2MTMsImV4cCI6MjA3NjAxNTYxM30.99OUzoEIs7pAT39wZVRUwzypB1sufrGVeYV0N2ld538';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});