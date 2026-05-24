import { supabase } from '../config/supabase';
import type { QueueItem } from '../types/queueTypes';

type QueueMemberParams = {
  roomId: string;
  memberId: string;
};

export async function listActiveQueueItemsByRoom(roomId: string): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('id, room_id, member_id, sort_order, status, created_at, updated_at')
    .eq('room_id', roomId)
    .in('status', ['waiting', 'on_stage'])
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Não consegui carregar a fila: ${error.message}`);
  }

  return (data ?? []) as QueueItem[];
}

export async function findMemberActiveQueueItem({
  roomId,
  memberId,
}: QueueMemberParams): Promise<QueueItem | null> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('id, room_id, member_id, sort_order, status, created_at, updated_at')
    .eq('room_id', roomId)
    .eq('member_id', memberId)
    .in('status', ['waiting', 'on_stage'])
    .maybeSingle();

  if (error) {
    throw new Error(`Não consegui verificar sua posição na fila: ${error.message}`);
  }

  return (data ?? null) as QueueItem | null;
}

export async function addMemberToQueue({
  roomId,
  memberId,
}: QueueMemberParams): Promise<QueueItem> {
  const existingQueueItem = await findMemberActiveQueueItem({ roomId, memberId });

  if (existingQueueItem) {
    throw new Error('Você já está na fila. Calma, superstar.');
  }

  const queueItems = await listActiveQueueItemsByRoom(roomId);

  const lastSortOrder = queueItems.reduce((highestOrder, item) => {
    return item.sort_order > highestOrder ? item.sort_order : highestOrder;
  }, 0);

  const { data, error } = await supabase
    .from('queue_items')
    .insert({
      room_id: roomId,
      member_id: memberId,
      sort_order: lastSortOrder + 1,
      status: 'waiting',
    })
    .select('id, room_id, member_id, sort_order, status, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Não consegui te colocar na fila: ${error.message}`);
  }

  if (!data) {
    throw new Error('Você entrou na fila, mas o Supabase não retornou os dados.');
  }

  return data as QueueItem;
}

export async function removeMemberFromQueue({
  roomId,
  memberId,
}: QueueMemberParams): Promise<void> {
  const queueItem = await findMemberActiveQueueItem({ roomId, memberId });

  if (!queueItem) {
    throw new Error('Você não está na fila. Não dá para sair de onde você nem entrou.');
  }

  if (queueItem.status === 'on_stage') {
    throw new Error('Você está no palco. Agora é terminar a apresentação, não fugir pela cortina.');
  }

  const { error } = await supabase
    .from('queue_items')
    .update({
      status: 'removed',
    })
    .eq('id', queueItem.id)
    .eq('status', 'waiting');

  if (error) {
    throw new Error(`Não consegui tirar você da fila: ${error.message}`);
  }
}

export async function moveNextWaitingMemberToStage(roomId: string): Promise<QueueItem> {
  const activeQueueItems = await listActiveQueueItemsByRoom(roomId);

  const currentOnStage = activeQueueItems.find((item) => item.status === 'on_stage');

  if (currentOnStage) {
    throw new Error('Já tem alguém no palco. Conclua a apresentação atual antes de chamar o próximo.');
  }

  const nextWaiting = activeQueueItems.find((item) => item.status === 'waiting');

  if (!nextWaiting) {
    throw new Error('A fila está vazia. Coragem, alguém precisa começar.');
  }

  const { data, error } = await supabase
    .from('queue_items')
    .update({
      status: 'on_stage',
    })
    .eq('id', nextWaiting.id)
    .eq('status', 'waiting')
    .select('id, room_id, member_id, sort_order, status, created_at, updated_at')
    .single();

  if (error) {
    throw new Error(`Não consegui chamar o próximo para o palco: ${error.message}`);
  }

  if (!data) {
    throw new Error('O próximo foi chamado, mas o Supabase não retornou os dados.');
  }

  return data as QueueItem;
}

export async function finishOnStageQueueItem(roomId: string): Promise<void> {
  const activeQueueItems = await listActiveQueueItemsByRoom(roomId);

  const currentOnStage = activeQueueItems.find((item) => item.status === 'on_stage');

  if (!currentOnStage) {
    throw new Error('Não tem ninguém cantando agora.');
  }

  const { error } = await supabase
    .from('queue_items')
    .update({
      status: 'done',
    })
    .eq('id', currentOnStage.id)
    .eq('status', 'on_stage');

  if (error) {
    throw new Error(`Não consegui concluir a apresentação: ${error.message}`);
  }
}

export async function finishOwnOnStageQueueItem({
  roomId,
  memberId,
}: QueueMemberParams): Promise<void> {
  const queueItem = await findMemberActiveQueueItem({ roomId, memberId });

  if (!queueItem || queueItem.status !== 'on_stage') {
    throw new Error('Você não está no palco agora.');
  }

  const { error } = await supabase
    .from('queue_items')
    .update({
      status: 'done',
    })
    .eq('id', queueItem.id)
    .eq('status', 'on_stage');

  if (error) {
    throw new Error(`Não consegui concluir sua apresentação: ${error.message}`);
  }
}