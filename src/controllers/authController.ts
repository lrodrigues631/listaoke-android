import { supabase, supabaseDebugInfo } from '../config/supabase';
import type { AnonymousAuthResult } from '../types/authTypes';

async function testSupabaseConnection(): Promise<void> {
  const url = `${supabaseDebugInfo.url}/auth/v1/settings`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase respondeu HTTP ${response.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no fetch';

    throw new Error(
      [
        'Falha no teste direto com o Supabase.',
        `URL carregada: ${supabaseDebugInfo.hasUrl ? 'sim' : 'não'}`,
        `URL usada: ${supabaseDebugInfo.url}`,
        `URL começa com https: ${supabaseDebugInfo.urlStartsWithHttps ? 'sim' : 'não'}`,
        `Anon key carregada: ${supabaseDebugInfo.hasAnonKey ? 'sim' : 'não'}`,
        `Tamanho da anon key: ${supabaseDebugInfo.anonKeyLength}`,
        `Erro real: ${errorMessage}`,
      ].join('\n')
    );
  }
}

export async function startAnonymousSession(): Promise<AnonymousAuthResult> {
  await testSupabaseConnection();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Erro ao recuperar sessão: ${sessionError.message}`);
  }

  if (sessionData.session?.user) {
    return {
      userId: sessionData.session.user.id,
      message: 'Sessão anônima recuperada. O karaokê ainda vive.',
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(
      [
        `Erro ao criar usuário anônimo: ${error.message}`,
        `URL usada: ${supabaseDebugInfo.url}`,
        `Anon key carregada: ${supabaseDebugInfo.hasAnonKey ? 'sim' : 'não'}`,
      ].join('\n')
    );
  }

  if (!data.user?.id) {
    throw new Error('O Supabase criou a sessão, mas não retornou o usuário.');
  }

  return {
    userId: data.user.id,
    message: 'Usuário anônimo criado. Bora montar essa fila.',
  };
}