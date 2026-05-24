import { supabase } from '../config/supabase';
import type { Room } from '../types/roomTypes';
import { normalizeRoomCode } from '../utils/normalizeRoomCode';

type CreateRoomParams = {
  name: string;
  ownerUserId: string;
};

type CloseRoomParams = {
  roomId: string;
  actorMemberId: string;
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
    .select('id, code, name, owner_user_id, status, created_at, closed_at, closed_by_user_id')
    .single();

  if (error) {
    throw new Error(`Não consegui criar a sala: ${error.message}`);
  }

  if (!data) {
    throw new Error('A sala foi criada, mas o Supabase não retornou os dados.');
  }

  return data as Room;
}

export async function findRoomByCode(code: string): Promise<Room | null> {
  const normalizedCode = normalizeRoomCode(code);

  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, name, owner_user_id, status, created_at, closed_at, closed_by_user_id')
    .eq('code', normalizedCode)
    .maybeSingle();

  if (error) {
    throw new Error(`Não consegui buscar a sala: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data as Room;
}

export async function findRoomById(roomId: string): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, code, name, owner_user_id, status, created_at, closed_at, closed_by_user_id')
    .eq('id', roomId)
    .single();

  if (error) {
    throw new Error(`Não consegui carregar a sala: ${error.message}`);
  }

  if (!data) {
    throw new Error('Sala não encontrada.');
  }

  return data as Room;
}

export async function closeRoomRpc({ roomId, actorMemberId }: CloseRoomParams): Promise<void> {
  const { error } = await supabase.rpc('close_room', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
  });

  if (error) {
    throw new Error(`Não consegui fechar a sala: ${error.message}`);
  }
}