import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('EXPO_PUBLIC_SUPABASE_URL não foi carregada.');
}

if (!supabaseAnonKey) {
  throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY não foi carregada.');
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`URL do Supabase inválida: ${supabaseUrl}`);
}

export const supabaseDebugInfo = {
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  url: supabaseUrl,
  urlStartsWithHttps: supabaseUrl.startsWith('https://'),
  anonKeyLength: supabaseAnonKey.length,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});