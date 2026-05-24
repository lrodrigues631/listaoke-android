import { supabase } from '../config/supabase';
import type { RoomEvent, RoomSummary, RoomSummaryRankingItem } from '../types/eventTypes';

export async function listRoomEvents(roomId: string): Promise<RoomEvent[]> {
  const { data, error } = await supabase
    .from('room_events')
    .select('id, room_id, actor_member_id, target_member_id, type, metadata, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Não consegui carregar o histórico: ${error.message}`);
  }

  return (data ?? []) as RoomEvent[];
}

export async function getRoomSummary(roomId: string): Promise<RoomSummary> {
  const { data, error } = await supabase.rpc('get_room_summary', {
    p_room_id: roomId,
  });

  if (error) {
    throw new Error(`Não consegui carregar o resumo da sala: ${error.message}`);
  }

  const rawSummary = data as Partial<RoomSummary> | null;
  const rawRanking = Array.isArray(rawSummary?.ranking) ? rawSummary.ranking : [];

  const ranking: RoomSummaryRankingItem[] = rawRanking.map((item) => ({
    member_id: typeof item.member_id === 'string' ? item.member_id : null,
    name: typeof item.name === 'string' ? item.name : 'Participante',
    performances: Number(item.performances ?? 0),
  }));

  return {
    total_performances: Number(rawSummary?.total_performances ?? 0),
    total_skips: Number(rawSummary?.total_skips ?? 0),
    total_queue_exits: Number(rawSummary?.total_queue_exits ?? 0),
    total_removals: Number(rawSummary?.total_removals ?? 0),
    total_participants: Number(rawSummary?.total_participants ?? 0),
    ranking,
  };
}

export async function logRoomCreatedEvent(roomId: string, actorMemberId: string): Promise<void> {
  const { error } = await supabase.rpc('log_room_created', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
  });

  if (error) {
    throw new Error(`Não consegui registrar criação da sala: ${error.message}`);
  }
}

export async function logMemberJoinedEvent(roomId: string, actorMemberId: string): Promise<void> {
  const { error } = await supabase.rpc('log_member_joined', {
    p_room_id: roomId,
    p_actor_member_id: actorMemberId,
  });

  if (error) {
    throw new Error(`Não consegui registrar entrada na sala: ${error.message}`);
  }
}