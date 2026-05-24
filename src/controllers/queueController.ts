import {
  addMemberToQueue,
  finishOnStageQueueItem,
  finishOwnOnStageQueueItem,
  listActiveQueueItemsByRoom,
  moveNextWaitingMemberToStage,
  removeMemberFromQueue,
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

  await addMemberToQueue({ roomId, memberId });
}

export async function leaveQueue(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await removeMemberFromQueue({ roomId, memberId });
}

export async function callNextToStage(roomId: string): Promise<void> {
  if (!roomId) {
    throw new Error('Não consegui identificar a sala.');
  }

  await moveNextWaitingMemberToStage(roomId);
}

export async function finishCurrentPerformance(roomId: string): Promise<void> {
  if (!roomId) {
    throw new Error('Não consegui identificar a sala.');
  }

  await finishOnStageQueueItem(roomId);
}

export async function finishMyPerformance(roomId: string, memberId: string): Promise<void> {
  if (!roomId || !memberId) {
    throw new Error('Não consegui identificar sua sala ou seu membro.');
  }

  await finishOwnOnStageQueueItem({ roomId, memberId });
}