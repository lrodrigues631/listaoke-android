import { getRoomSummary, listRoomEvents } from '../models/eventModel';
import type { RoomEvent, RoomSummary } from '../types/eventTypes';

export async function loadRoomEvents(roomId: string): Promise<RoomEvent[]> {
  if (!roomId) {
    throw new Error('Sala inválida. Não consegui carregar o histórico.');
  }

  return listRoomEvents(roomId);
}

export async function loadRoomSummary(roomId: string): Promise<RoomSummary> {
  if (!roomId) {
    throw new Error('Sala inválida. Não consegui carregar o resumo.');
  }

  return getRoomSummary(roomId);
}

export function formatRoomEventMessage(event: RoomEvent): string {
  const actorName = event.metadata?.actor_name ?? 'Alguém';
  const targetName = event.metadata?.target_name ?? 'alguém';

  switch (event.type) {
    case 'room_created':
      return `${actorName} criou a sala. O palco nasceu.`;

    case 'room_closed':
      return `${actorName} encerrou a sala. Microfones descansando.`;

    case 'member_joined':
      return `${actorName} entrou na sala.`;

    case 'member_left':
      return `${actorName} saiu da sala.`;

    case 'member_removed':
      return `${actorName} removeu ${targetName}. Clima de administração.`;

    case 'member_added_to_queue':
      return `${actorName} entrou na fila.`;

    case 'member_left_queue':
      if (event.metadata?.previous_status === 'on_stage') {
        return `${actorName} parou de cantar.`;
      }

      return `${actorName} saiu da fila.`;

    case 'member_skipped_turn':
      return `${actorName} pulou a vez e voltou para o fim da fila.`;

    case 'queue_reordered':
      return `${actorName} adiou a própria vez. Estratégia ou medo, ninguém sabe.`;

    case 'performance_finished':
      return `${actorName} concluiu uma música. Palmas imaginárias.`;

    case 'owner_transferred':
      return `${actorName} passou a administração para ${targetName}.`;

    default:
      return 'Algo aconteceu na sala.';
  }
}