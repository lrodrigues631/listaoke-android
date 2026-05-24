import { supabase } from '../config/supabase';
import type { Room } from '../types/roomTypes';

type CreateRoomParams = {
  name: string;
  ownerUserId: string;
};

export async function generateRoomCode(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_room_code');

  if (error) {
    throw new Error(`Não consegui gerar o código da sala: ${error.message}`);
  }

  if (!data || typeof data !== 'string') {
    throw new Error('O Supabase não retornou um código de sala válido.');
  }

  return data;
}

export async function createRoomRecord({
  name,
  ownerUserId,
}: CreateRoomParams): Promise<Room> {
  const code = await generateRoomCode();

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      code,
      name,
      owner_user_id: ownerUserId,
      status: 'open',
    })
    .select(
      'id, code, name, owner_user_id, status, created_at, closed_at, closed_by_user_id'
    )
    .single();

  if (error) {
    throw new Error(`Não consegui criar a sala: ${error.message}`);
  }

  if (!data) {
    throw new Error('A sala foi criada, mas o Supabase não retornou os dados.');
  }

  return data as Room;
}