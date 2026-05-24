import { listActiveMembersByRoom } from '../models/memberModel';
import type { RoomMember } from '../types/roomTypes';

export async function loadRoomMembers(roomId: string): Promise<RoomMember[]> {
  if (!roomId) {
    throw new Error('Sala inválida. Não consegui carregar os membros.');
  }

  return listActiveMembersByRoom(roomId);
}