export type QueueStatus = 'waiting' | 'on_stage' | 'skipped' | 'done' | 'removed';

export type QueueItem = {
  id: string;
  room_id: string;
  member_id: string;
  sort_order: number;
  status: QueueStatus;
  created_at: string;
  updated_at: string;
};