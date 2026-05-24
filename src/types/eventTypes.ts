export type EventType =
  | 'room_created'
  | 'room_closed'
  | 'member_joined'
  | 'member_left'
  | 'member_removed'
  | 'member_added_to_queue'
  | 'member_left_queue'
  | 'member_skipped_turn'
  | 'queue_reordered'
  | 'performance_finished'
  | 'owner_transferred';

export type RoomEventMetadata = {
  actor_name?: string;
  target_name?: string;
  previous_status?: string;
  removed_from?: string;
  direction?: string;
};

export type RoomEvent = {
  id: string;
  room_id: string;
  actor_member_id: string | null;
  target_member_id: string | null;
  type: EventType;
  metadata: RoomEventMetadata;
  created_at: string;
};

export type RoomSummaryRankingItem = {
  member_id: string | null;
  name: string;
  performances: number;
};

export type RoomSummary = {
  total_performances: number;
  total_skips: number;
  total_queue_exits: number;
  total_removals: number;
  total_participants: number;
  ranking: RoomSummaryRankingItem[];
};