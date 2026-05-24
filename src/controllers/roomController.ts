import { createOwnerMember } from '../models/memberModel';
import { createRoomRecord } from '../models/roomModel';
import type { CurrentRoom } from '../types/roomTypes';

type CreateRoomFlowParams = {
  roomName: string;
  ownerName: string;
  userId: string;
};

export async function createRoomFlow({
  roomName,
  ownerName,
  userId,
}: CreateRoomFlowParams): Promise<CurrentRoom> {
  const cleanRoomName = roomName.trim();
  const cleanOwnerName = ownerName.trim();

  if (!cleanRoomName) {
    throw new Error('Dá um nome para a sala. “Karaokê aleatório” até vale, mas precisa ter nome.');
  }

  if (!cleanOwnerName) {
    throw new Error('Coloca seu nome ou apelido. O microfone precisa saber quem manda.');
  }

  if (!userId) {
    throw new Error('Ainda não identifiquei seu usuário anônimo. Tenta de novo em alguns segundos.');
  }

  const room = await createRoomRecord({
    name: cleanRoomName,
    ownerUserId: userId,
  });

  const member = await createOwnerMember({
    roomId: room.id,
    userId,
    name: cleanOwnerName,
  });

  return {
    roomId: room.id,
    roomCode: room.code,
    roomName: room.name,
    roomStatus: room.status,
    memberId: member.id,
    memberName: member.name,
    memberRole: member.role,
  };
}