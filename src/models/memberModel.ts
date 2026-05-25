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

const roomMemberSelect =
  'id, room_id, user_id, name, role, status, is_manual, created_at, left_at';

function normalizeRoomMember(member: RoomMember): RoomMember {
  return {
    ...member,
    is_manual: Boolean(member.is_manual),
  };
}

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
      is_manual: false,
    })
    .select(roomMemberSelect)
    .single();

  if (error) {
    throw new Error(`A sala foi criada, mas não consegui criar o dono: ${error.message}`);
  }

  if (!data) {
    throw new Error('O dono foi criado, mas o Supabase não retornou os dados.');
  }

  return normalizeRoomMember(data as RoomMember);
}

export async function createGuestMember({
  roomId,
  name,
}: CreateGuestMemberParams): Promise<RoomMember> {
  const { data, error } = await supabase.rpc('join_room_member', {
    p_room_id: roomId,
    p_name: name,
  });

  if (error) {
    throw new Error(`Não consegui colocar você na sala: ${error.message}`);
  }

  const memberData = Array.isArray(data) ? data[0] : data;

  if (!memberData) {
    throw new Error('Você entrou na sala, mas o Supabase não retornou seus dados.');
  }

  return normalizeRoomMember(memberData as RoomMember);
}

export async function findActiveMemberByRoomAndUser({
  roomId,
  userId,
}: FindActiveMemberParams): Promise<RoomMember | null> {
  const { data, error } = await supabase
    .from('room_members')
    .select(roomMemberSelect)
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

  return normalizeRoomMember(data as RoomMember);
}

export async function listActiveMembersByRoom(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabase
    .from('room_members')
    .select(roomMemberSelect)
    .eq('room_id', roomId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Não consegui carregar os membros da sala: ${error.message}`);
  }

  return ((data ?? []) as RoomMember[]).map(normalizeRoomMember);
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