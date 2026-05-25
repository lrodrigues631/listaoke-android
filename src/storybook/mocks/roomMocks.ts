import type { RoomEvent, RoomSummary } from '../../types/eventTypes';
import type { QueueItem } from '../../types/queueTypes';
import type { RoomMember } from '../../types/roomTypes';

export type QueueMoveDirection = 'up' | 'down';

export type MockRoomEvent = RoomEvent & {
  message?: string;
};

type MockRoomMemberOverrides = Partial<RoomMember> & {
  is_owner?: boolean;
  is_manual?: boolean;
};

type MockQueueItemOverrides = Partial<QueueItem> & {
  position?: number;
};

export function createMember(overrides: MockRoomMemberOverrides = {}): RoomMember {
  return {
    id: 'member-1',
    room_id: 'room-1',
    name: 'Ana',
    role: 'guest',
    is_owner: false,
    is_manual: false,
    created_at: '2026-05-25T21:00:00.000Z',
    updated_at: '2026-05-25T21:00:00.000Z',
    ...overrides,
  } as RoomMember;
}

export function createQueueItem(overrides: MockQueueItemOverrides = {}): QueueItem {
  return {
    id: 'queue-item-1',
    room_id: 'room-1',
    member_id: 'member-1',
    position: 1,
    status: 'waiting',
    created_at: '2026-05-25T21:00:00.000Z',
    updated_at: '2026-05-25T21:00:00.000Z',
    ...overrides,
  } as QueueItem;
}

export function createEvent(overrides: Partial<MockRoomEvent> = {}): RoomEvent {
  return {
    id: 'event-1',
    room_id: 'room-1',
    event_type: 'mock_event',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
    payload: {},
    ...overrides,
  } as unknown as RoomEvent;
}

export function createSummary(overrides: Partial<RoomSummary> = {}): RoomSummary {
  return {
    total_performances: 0,
    total_skips: 0,
    total_queue_exits: 0,
    total_removals: 0,
    total_participants: 0,
    ranking: [],
    ...overrides,
  } as RoomSummary;
}

export const ownerMember = createMember({
  id: 'member-owner',
  name: 'Leandro',
  role: 'owner',
  is_owner: true,
});

export const currentMember = createMember({
  id: 'member-current',
  name: 'Você',
  role: 'guest',
});

export const anaMember = createMember({
  id: 'member-ana',
  name: 'Ana',
  role: 'guest',
});

export const brunoMember = createMember({
  id: 'member-bruno',
  name: 'Bruno',
  role: 'guest',
});

export const carlaMember = createMember({
  id: 'member-carla',
  name: 'Carla',
  role: 'guest',
});

export const manualMember = createMember({
  id: 'member-manual',
  name: 'Carlos sem app',
  role: 'guest',
  is_manual: true,
});

export const fullMembers: RoomMember[] = [
  ownerMember,
  currentMember,
  anaMember,
  brunoMember,
  carlaMember,
  manualMember,
];

export const ownerOnlyMembers: RoomMember[] = [ownerMember];

export const ownerAndGuestsMembers: RoomMember[] = [
  ownerMember,
  currentMember,
  anaMember,
  brunoMember,
];

export const ownerWithManualMembers: RoomMember[] = [
  ownerMember,
  currentMember,
  anaMember,
  manualMember,
];

export const onePersonQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
    status: 'waiting',
  }),
];

export const guestWaitingQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 3,
    status: 'waiting',
  }),
];

export const multiplePeopleQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 3,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-manual',
    member_id: 'member-manual',
    position: 4,
    status: 'waiting',
  }),
];

export const ownerQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-stage',
    member_id: 'member-ana',
    position: 0,
    status: 'on_stage',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-current',
    member_id: 'member-current',
    position: 2,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-manual',
    member_id: 'member-manual',
    position: 3,
    status: 'waiting',
  }),
];

export const meOnStageQueue: QueueItem[] = [
  createQueueItem({
    id: 'queue-current-stage',
    member_id: 'member-current',
    position: 0,
    status: 'on_stage',
  }),
  createQueueItem({
    id: 'queue-ana',
    member_id: 'member-ana',
    position: 1,
    status: 'waiting',
  }),
  createQueueItem({
    id: 'queue-bruno',
    member_id: 'member-bruno',
    position: 2,
    status: 'waiting',
  }),
];

export const recentEvents: RoomEvent[] = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
];

export const manyEvents: RoomEvent[] = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
  createEvent({
    id: 'event-3',
    created_at: '2026-05-25T21:08:00.000Z',
    message: 'Você entrou na fila.',
  }),
  createEvent({
    id: 'event-4',
    created_at: '2026-05-25T21:12:00.000Z',
    message: 'Carla pulou a vez.',
  }),
  createEvent({
    id: 'event-5',
    created_at: '2026-05-25T21:16:00.000Z',
    message: 'Carlos sem app foi adicionado pelo dono.',
  }),
  createEvent({
    id: 'event-6',
    created_at: '2026-05-25T21:20:00.000Z',
    message: 'Ana concluiu a música e voltou para o fim da fila.',
  }),
];

export const roomScenarioEvents: RoomEvent[] = [
  createEvent({
    id: 'event-1',
    created_at: '2026-05-25T21:00:00.000Z',
    message: 'Ana entrou na fila.',
  }),
  createEvent({
    id: 'event-2',
    created_at: '2026-05-25T21:04:00.000Z',
    message: 'Bruno começou a cantar.',
  }),
  createEvent({
    id: 'event-3',
    created_at: '2026-05-25T21:08:00.000Z',
    message: 'Você entrou na fila.',
  }),
  createEvent({
    id: 'event-4',
    created_at: '2026-05-25T21:12:00.000Z',
    message: 'Carlos sem app foi adicionado pelo dono.',
  }),
];

export const emptySummary = createSummary();

export const oneSongSummary = createSummary({
  total_performances: 1,
  total_participants: 2,
  total_skips: 0,
  total_queue_exits: 0,
  total_removals: 0,
  ranking: [
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

export const rankingSummary = createSummary({
  total_performances: 8,
  total_participants: 4,
  total_skips: 2,
  total_queue_exits: 1,
  total_removals: 0,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 3,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 2,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 2,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

export const manyParticipantsSummary = createSummary({
  total_performances: 18,
  total_participants: 9,
  total_skips: 5,
  total_queue_exits: 3,
  total_removals: 1,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 5,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 4,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 3,
    },
    {
      member_id: 'member-diego',
      name: 'Diego',
      performances: 2,
    },
    {
      member_id: 'member-elisa',
      name: 'Elisa',
      performances: 1,
    },
    {
      member_id: 'member-felipe',
      name: 'Felipe',
      performances: 1,
    },
    {
      member_id: 'member-gabi',
      name: 'Gabi',
      performances: 1,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 1,
    },
  ],
});

export const finalSummary = createSummary({
  total_performances: 9,
  total_participants: 5,
  total_skips: 2,
  total_queue_exits: 1,
  total_removals: 1,
  ranking: [
    {
      member_id: 'member-ana',
      name: 'Ana',
      performances: 3,
    },
    {
      member_id: 'member-bruno',
      name: 'Bruno',
      performances: 2,
    },
    {
      member_id: 'member-current',
      name: 'Você',
      performances: 2,
    },
    {
      member_id: 'member-carla',
      name: 'Carla',
      performances: 2,
    },
  ],
});

export function buildMembersById(members: RoomMember[]): Record<string, RoomMember> {
  return members.reduce<Record<string, RoomMember>>((accumulator, member) => {
    accumulator[member.id] = member;
    return accumulator;
  }, {});
}

export function formatMockMessage(event: RoomEvent): string {
  const mockEvent = event as MockRoomEvent;

  return mockEvent.message ?? 'Evento registrado na sala.';
}

export function formatMockTime(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}