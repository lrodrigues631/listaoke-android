import { supabase } from '../config/supabase';
import type { RoomMember } from '../types/roomTypes';

type CreateOwnerMemberParams = {
  roomId: string;
  userId: string;
  name: string;
};

type CreateGuestMemberParams = {
  roomId: string;
  userId: string;
  name: string;
};

type FindActiveMemberParams = {
  roomId: string;
  userId: string;
};

type TransferRoomOwnershipParams = {
  roomId: string;
  actorMemberId: string;
  newOwnerMemberId: string;
};

type RemoveRoomMemberParams = {
  roomId: string;
  actorMemberId: string;
  targetMemberId: string;
};

type LeaveRoomMemberParams = {
  roomId: string;
  memberId: string;
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

export async function createGuestMember({
  roomId,
  userId,
  name,
}: CreateGuestMemberParams): Promise<RoomMember> {
  const { data, error } = await supabase
    .from('room_members')
    .insert({
      room_id: roomId,
      user_id: userId,
      name,
      role: 'guest',
      status: 'active',
    })
    .select('id, room_id, user_id, name, role, status, created_at, left_at')
    .single();

  if (error) {
    throw new Error(`Não consegui colocar você na sala: ${error.message}`);
  }

  if (!data) {
    throw new Error('Você entrou na sala, mas o Supabase não retornou seus dados.');
  }

  return data as RoomMember;
}

export async function findActiveMemberByRoomAndUser({
  roomId,
  userId,
}: FindActiveMemberParams): Promise<RoomMember | null> {
  const { data, error } = await supabase
    .from('room_members')
    .select('id, room_id, user_id, name, role, status, created_at, left_at')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(`Não consegui verificar sua entrada na sala: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data as RoomMember;
}

export async function listActiveMembersByRoom(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabase
    .from('room_members')
    .select('id, room_id, user_id, name, role, status, created_at, left_at')
    .eq('room_id', roomId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Não consegui carregar os membros da sala: ${error.message}`);
  }

  return (data ?? []) as RoomMember[];
}

export async function transferRoomOwnershipRpc({
  roomId,
  actorMemberId,
  newOwnerMemberId,
}: TransferRoomOwnershipParams): Promise<void> {
  const { error } = await supabase.rpc('transfer_room_ownership_with_event', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_new_owner_member_id: newOwnerMemberId,
  });

  if (error) {
    throw new Error(`Não consegui transferir a sala: ${error.message}`);
  }
}

export async function removeRoomMemberRpc({
  roomId,
  actorMemberId,
  targetMemberId,
}: RemoveRoomMemberParams): Promise<void> {
  const { error } = await supabase.rpc('remove_room_member', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_target_member_id: targetMemberId,
  });

  if (error) {
    throw new Error(`Não consegui remover o membro da sala: ${error.message}`);
  }
}

export async function leaveRoomMemberRpc({
  roomId,
  memberId,
}: LeaveRoomMemberParams): Promise<void> {
  const { error } = await supabase.rpc('leave_room_member', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui sair da sala: ${error.message}`);
  }
}
