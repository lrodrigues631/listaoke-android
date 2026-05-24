import { supabase } from '../config/supabase';
import type { AnonymousAuthResult } from '../types/authTypes';

export async function startAnonymousSession(): Promise<AnonymousAuthResult> {
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
    throw new Error(`Erro ao criar usuário anônimo: ${error.message}`);
  }

  if (!data.user?.id) {
    throw new Error('O Supabase criou a sessão, mas não retornou o usuário.');
  }

  return {
    userId: data.user.id,
    message: 'Usuário anônimo criado. Bora montar essa fila.',
  };
}