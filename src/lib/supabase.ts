import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { FEATURES } from '../config/features';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || (FEATURES.SKIP_AUTH ? 'https://placeholder.supabase.co' : '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || (FEATURES.SKIP_AUTH ? 'placeholder-key' : '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
