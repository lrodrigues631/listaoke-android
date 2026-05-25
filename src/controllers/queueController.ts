import {
  finishOwnTurnRpc,
  joinQueueRpc,
  leaveOwnQueueRpc,
  listActiveQueueItemsByRoom,
  moveOwnTurnDownRpc,
  ownerAddManualQueueItemRpc,
  ownerFinishQueueItemRpc,
  ownerMoveQueueItemRpc,
  ownerRemoveQueueItemRpc,
  ownerSkipQueueItemRpc,
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

export async function ownerAddManualQueueItem(
  roomId: string,
  actorMemberId: string,
  name: string
): Promise<void> {
  const cleanName = name.trim();

  if (!roomId || !actorMemberId || !cleanName) {
    throw new Error('Informe o nome da pessoa para colocar na fila.');
  }

  await ownerAddManualQueueItemRpc({
    roomId,
    actorMemberId,
    name: cleanName,
  });
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

export async function ownerMoveQueueItem(
  roomId: string,
  actorMemberId: string,
  targetQueueItemId: string,
  direction: 'up' | 'down'
): Promise<void> {
  if (!roomId || !actorMemberId || !targetQueueItemId || !direction) {
    throw new Error('Não consegui identificar sala, dono, item da fila ou direção.');
  }

  await ownerMoveQueueItemRpc({
    roomId,
    actorMemberId,
    targetQueueItemId,
    direction,
  });
}

export async function ownerFinishQueueItem(
  roomId: string,
  actorMemberId: string,
  targetQueueItemId: string
): Promise<void> {
  if (!roomId || !actorMemberId || !targetQueueItemId) {
    throw new Error('Não consegui identificar sala, dono ou pessoa no palco.');
  }

  await ownerFinishQueueItemRpc({
    roomId,
    actorMemberId,
    targetQueueItemId,
  });
}

export async function ownerSkipQueueItem(
  roomId: string,
  actorMemberId: string,
  targetQueueItemId: string
): Promise<void> {
  if (!roomId || !actorMemberId || !targetQueueItemId) {
    throw new Error('Não consegui identificar sala, dono ou pessoa no palco.');
  }

  await ownerSkipQueueItemRpc({
    roomId,
    actorMemberId,
    targetQueueItemId,
  });
}