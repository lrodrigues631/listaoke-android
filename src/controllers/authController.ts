import { supabase } from '../config/supabase';
import type { AnonymousAuthResult } from '../types/authTypes';

export async function startAnonymousSession(): Promise<AnonymousAuthResult> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error('Não consegui recuperar sua sessão. Tenta abrir o app de novo.');
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
      'Não consegui criar sua sessão anônima. Confere sua internet e tenta de novo.'
    );
  }

  if (!data.user?.id) {
    throw new Error('A sessão foi criada, mas o usuário não voltou corretamente.');
  }

  return {
    userId: data.user.id,
    message: 'Usuário anônimo criado. Bora montar essa fila.',
  };
}