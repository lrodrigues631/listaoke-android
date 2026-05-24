import { supabase } from '../config/supabase';

type SubscribeToRoomParams = {
  roomId: string;
  onChange: () => void;
};

type SubscribeToRoomMembersParams = {
  roomId: string;
  onChange: () => void;
};

type SubscribeToRoomQueueParams = {
  roomId: string;
  onChange: () => void;
};

export function subscribeToRoom({ roomId, onChange }: SubscribeToRoomParams) {
  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoomMembers({ roomId, onChange }: SubscribeToRoomMembersParams) {
  const channel = supabase
    .channel(`room-members-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToRoomQueue({ roomId, onChange }: SubscribeToRoomQueueParams) {
  const channel = supabase
    .channel(`room-queue-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue_items',
        filter: `room_id=eq.${roomId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}