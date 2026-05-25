import { supabase } from '../config/supabase';
import type { QueueItem } from '../types/queueTypes';

type QueueMemberParams = {
  roomId: string;
  memberId: string;
};

type OwnerAddManualQueueItemParams = {
  roomId: string;
  actorMemberId: string;
  name: string;
};

type OwnerRemoveQueueItemParams = {
  roomId: string;
  actorMemberId: string;
  targetQueueItemId: string;
};

type OwnerMoveQueueItemParams = {
  roomId: string;
  actorMemberId: string;
  targetQueueItemId: string;
  direction: 'up' | 'down';
};

type OwnerControlQueueItemParams = {
  roomId: string;
  actorMemberId: string;
  targetQueueItemId: string;
};

export async function listActiveQueueItemsByRoom(roomId: string): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('queue_items')
    .select('id, room_id, member_id, sort_order, status, created_at, updated_at')
    .eq('room_id', roomId)
    .in('status', ['waiting', 'on_stage'])
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Não consegui carregar a fila: ${error.message}`);
  }

  return (data ?? []) as QueueItem[];
}

export async function joinQueueRpc({ roomId, memberId }: QueueMemberParams): Promise<void> {
  const { error } = await supabase.rpc('queue_join', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui te colocar na fila: ${error.message}`);
  }
}

export async function leaveOwnQueueRpc({ roomId, memberId }: QueueMemberParams): Promise<void> {
  const { error } = await supabase.rpc('queue_leave_own', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui tirar você da fila: ${error.message}`);
  }
}

export async function skipOwnTurnRpc({ roomId, memberId }: QueueMemberParams): Promise<void> {
  const { error } = await supabase.rpc('queue_skip_own', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui pular sua vez: ${error.message}`);
  }
}

export async function finishOwnTurnRpc({ roomId, memberId }: QueueMemberParams): Promise<void> {
  const { error } = await supabase.rpc('queue_finish_own', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui concluir sua apresentação: ${error.message}`);
  }
}

export async function moveOwnTurnDownRpc({ roomId, memberId }: QueueMemberParams): Promise<void> {
  const { error } = await supabase.rpc('queue_move_own_down', {
    p_room_id: roomId,
    p_member_id: memberId,
  });

  if (error) {
    throw new Error(`Não consegui adiar sua vez: ${error.message}`);
  }
}

export async function ownerAddManualQueueItemRpc({
  roomId,
  actorMemberId,
  name,
}: OwnerAddManualQueueItemParams): Promise<void> {
  const { error } = await supabase.rpc('owner_add_manual_queue_item', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_name: name,
  });

  if (error) {
    throw new Error(`Não consegui adicionar essa pessoa na fila: ${error.message}`);
  }
}

export async function ownerRemoveQueueItemRpc({
  roomId,
  actorMemberId,
  targetQueueItemId,
}: OwnerRemoveQueueItemParams): Promise<void> {
  const { error } = await supabase.rpc('queue_owner_remove_item', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_target_queue_item_id: targetQueueItemId,
  });

  if (error) {
    throw new Error(`Não consegui remover da fila: ${error.message}`);
  }
}

export async function ownerMoveQueueItemRpc({
  roomId,
  actorMemberId,
  targetQueueItemId,
  direction,
}: OwnerMoveQueueItemParams): Promise<void> {
  const { error } = await supabase.rpc('queue_owner_move_item', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_target_queue_item_id: targetQueueItemId,
    p_direction: direction,
  });

  if (error) {
    throw new Error(`Não consegui mover na fila: ${error.message}`);
  }
}

export async function ownerFinishQueueItemRpc({
  roomId,
  actorMemberId,
  targetQueueItemId,
}: OwnerControlQueueItemParams): Promise<void> {
  const { error } = await supabase.rpc('queue_owner_finish_item', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_target_queue_item_id: targetQueueItemId,
  });

  if (error) {
    throw new Error(`Não consegui concluir essa apresentação: ${error.message}`);
  }
}

export async function ownerSkipQueueItemRpc({
  roomId,
  actorMemberId,
  targetQueueItemId,
}: OwnerControlQueueItemParams): Promise<void> {
  const { error } = await supabase.rpc('queue_owner_skip_item', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
    p_target_queue_item_id: targetQueueItemId,
  });

  if (error) {
    throw new Error(`Não consegui pular essa vez: ${error.message}`);
  }
}