import { clearSavedCurrentRoom, saveCurrentRoom } from '../models/currentRoomStorageModel';
import { logMemberJoinedEvent, logRoomCreatedEvent } from '../models/eventModel';
import {
  createGuestMember,
  createOwnerMember,
  findActiveMemberByRoomAndUser,
} from '../models/memberModel';
import { closeRoomRpc, createRoomRecord, findRoomByCode, findRoomById } from '../models/roomModel';
import type { CurrentRoom, Room } from '../types/roomTypes';
import { normalizeRoomCode } from '../utils/normalizeRoomCode';

type CreateRoomFlowParams = {
  roomName: string;
  ownerName: string;
  userId: string;
};

type JoinRoomFlowParams = {
  roomCode: string;
  guestName: string;
  userId: string;
};

type RestoreRoomFlowParams = {
  roomId: string;
  userId: string;
};

function buildCurrentRoom(room: Room, member: {
  id: string;
  name: string;
  role: CurrentRoom['memberRole'];
}): CurrentRoom {
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

  await logRoomCreatedEvent(room.id, member.id);
  await saveCurrentRoom(room.id);

  return buildCurrentRoom(room, member);
}

export async function joinRoomFlow({
  roomCode,
  guestName,
  userId,
}: JoinRoomFlowParams): Promise<CurrentRoom> {
  const cleanRoomCode = normalizeRoomCode(roomCode);
  const cleanGuestName = guestName.trim();

  if (!cleanRoomCode) {
    throw new Error('Digite o código da sala. Sem código, sem karaokê.');
  }

  if (!cleanGuestName) {
    throw new Error('Coloca seu nome ou apelido. A fila precisa saber quem é você.');
  }

  if (!userId) {
    throw new Error('Ainda não identifiquei seu usuário anônimo. Tenta de novo em alguns segundos.');
  }

  const room = await findRoomByCode(cleanRoomCode);

  if (!room) {
    throw new Error('Não encontrei essa sala. Confere o código, porque alguém pode ter cantado ele errado.');
  }

  if (room.status === 'closed') {
    throw new Error('Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.');
  }

  const existingMember = await findActiveMemberByRoomAndUser({
    roomId: room.id,
    userId,
  });

  const member =
    existingMember ??
    (await createGuestMember({
      roomId: room.id,
      userId,
      name: cleanGuestName,
    }));

  if (!existingMember) {
    await logMemberJoinedEvent(room.id, member.id);
  }

  await saveCurrentRoom(room.id);

  return buildCurrentRoom(room, member);
}

export async function restoreRoomFlow({
  roomId,
  userId,
}: RestoreRoomFlowParams): Promise<CurrentRoom | null> {
  if (!roomId || !userId) {
    await clearSavedCurrentRoom();
    return null;
  }

  const room = await findRoomById(roomId);

  const member = await findActiveMemberByRoomAndUser({
    roomId: room.id,
    userId,
  });

  if (!member) {
    await clearSavedCurrentRoom();
    return null;
  }

  await saveCurrentRoom(room.id);

  return buildCurrentRoom(room, member);
}

export async function loadRoom(roomId: string): Promise<Room> {
  if (!roomId) {
    throw new Error('Sala inválida.');
  }

  return findRoomById(roomId);
}

export async function closeRoom(roomId: string, actorMemberId: string): Promise<void> {
  if (!roomId || !actorMemberId) {
    throw new Error('Não consegui identificar a sala ou o dono.');
  }

  await closeRoomRpc({
    roomId,
    actorMemberId,
  });
}

export async function clearCurrentRoomSession(): Promise<void> {
  await clearSavedCurrentRoom();
}