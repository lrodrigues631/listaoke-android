import {
  finishOwnTurnRpc,
  joinQueueRpc,
  leaveOwnQueueRpc,
  listActiveQueueItemsByRoom,
  moveOwnTurnDownRpc,
  ownerRemoveQueueItemRpc,
  skipOwnTurnRpc,
} from '../models/queueModel';
import type { QueueItem } from '../types/queueTypes';

export async function loadRoomQueue(roomId: string): Promise<QueueItem[]> {
  if (!roomId) {
    throw new Error('Sala inválida. Não consegui carregar a fila.');
  }

  return listActiveQueueItemsByRoom(roomId);
}

export async function joinQueue(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await joinQueueRpc({ roomId, memberId });
}

export async function leaveQueue(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await leaveOwnQueueRpc({ roomId, memberId });
}

export async function skipMyTurn(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await skipOwnTurnRpc({ roomId, memberId });
}

export async function finishMyTurn(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await finishOwnTurnRpc({ roomId, memberId });
}

export async function moveMyTurnDown(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await moveOwnTurnDownRpc({ roomId, memberId });
}

export async function ownerRemoveFromQueue(
  roomId: string,
  actorMemberId: string,
  targetQueueItemId: string
): Promise<void> {
  if (!roomId || !actorMemberId || !targetQueueItemId) {
    throw new Error('Não consegui identificar sala, dono ou item da fila.');
  }

  await ownerRemoveQueueItemRpc({
    roomId,
    actorMemberId,
    targetQueueItemId,
  });
}