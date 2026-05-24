import { supabase } from '../config/supabase';
import type { RoomMember } from '../types/roomTypes';

type CreateOwnerMemberParams = {
  roomId: string;
  userId: string;
  name: string;
};

export async function createOwnerMember({
  roomId,
  userId,
  name,
}: CreateOwnerMemberParams): Promise<RoomMember> {
  const { data, error } = await supabase
    .from('room_members')
    .insert({
      room_id: roomId,
      user_id: userId,
      name,
      role: 'owner',
      status: 'active',
    })
    .select('id, room_id, user_id, name, role, status, created_at, left_at')
    .single();

  if (error) {
    throw new Error(`A sala foi criada, mas não consegui criar o dono: ${error.message}`);
  }

  if (!data) {
    throw new Error('O dono foi criado, mas o Supabase não retornou os dados.');
  }

  return data as RoomMember;
}