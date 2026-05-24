import {
  listActiveMembersByRoom,
  removeRoomMemberRpc,
  transferRoomOwnershipRpc,
} from '../models/memberModel';
import type { RoomMember } from '../types/roomTypes';

export async function loadRoomMembers(roomId: string): Promise<RoomMember[]> {
  if (!roomId) {
    throw new Error('Sala inválida. Não consegui carregar os membros.');
  }

  return listActiveMembersByRoom(roomId);
}

export async function transferRoomOwnership(
  roomId: string,
  actorMemberId: string,
  newOwnerMemberId: string
): Promise<void> {
  if (!roomId || !actorMemberId || !newOwnerMemberId) {
    throw new Error('Não consegui identificar a sala, o dono atual ou o novo dono.');
  }

  await transferRoomOwnershipRpc({
    roomId,
    actorMemberId,
    newOwnerMemberId,
  });
}

export async function removeRoomMember(
  roomId: string,
  actorMemberId: string,
  targetMemberId: string
): Promise<void> {
  if (!roomId || !actorMemberId || !targetMemberId) {
    throw new Error('Não consegui identificar sala, dono ou membro.');
  }

  await removeRoomMemberRpc({
    roomId,
    actorMemberId,
    targetMemberId,
  });
}