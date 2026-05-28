import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type QueueItem = {
  id: string;
  room_id: string;
  member_id: string;
  status: string;
  position?: number | null;
  queue_position?: number | null;
  order_index?: number | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type RoomMember = {
  id: string;
  room_id: string;
  user_id: string | null;
  name: string;
  is_manual?: boolean | null;
};

type PushToken = {
  id: string;
  user_id: string;
  expo_push_token: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getRoomIdFromWebhookPayload(payload: any) {
  return (
    payload?.record?.room_id ??
    payload?.old_record?.room_id ??
    payload?.room_id ??
    null
  );
}

function getQueueOrderValue(item: QueueItem) {
  return (
    item.position ??
    item.queue_position ??
    item.order_index ??
    item.sort_order ??
    999999
  );
}

function sortWaitingQueue(items: QueueItem[]) {
  return [...items].sort((a, b) => {
    const orderA = getQueueOrderValue(a);
    const orderB = getQueueOrderValue(b);

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const dateA = new Date(a.created_at ?? a.updated_at ?? 0).getTime();
    const dateB = new Date(b.created_at ?? b.updated_at ?? 0).getTime();

    return dateA - dateB;
  });
}

async function sendExpoPushNotification(tokens: PushToken[], nextMemberName: string) {
  const messages = tokens.map((token) => ({
    to: token.expo_push_token,
    title: 'Sua vez esta chegando',
    body: `${nextMemberName}, voce e o proximo da fila. Nao some agora.`,
    channelId: 'next-singer',
    sound: 'default',
    priority: 'high',
    data: {
      type: 'next_singer',
    },
  }));

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const result = await response.json();

  return {
    ok: response.ok,
    result,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, reason: 'method_not_allowed' }, 405);
  }

  const url = new URL(request.url);
  const receivedSecret = url.searchParams.get('secret');
  const expectedSecret = Deno.env.get('NEXT_SINGER_WEBHOOK_SECRET');

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, reason: 'unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        ok: false,
        reason: 'missing_supabase_env',
      },
      500
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let payload: any = null;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, reason: 'invalid_json' }, 400);
  }

  const roomId = getRoomIdFromWebhookPayload(payload);

  if (!roomId) {
    return jsonResponse({ ok: false, reason: 'missing_room_id' }, 400);
  }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, status')
    .eq('id', roomId)
    .maybeSingle();

  if (roomError) {
    return jsonResponse({ ok: false, reason: 'room_query_error', error: roomError.message }, 500);
  }

  if (!room || room.status === 'closed') {
    return jsonResponse({ ok: true, sent: false, reason: 'room_closed_or_not_found' });
  }

  const { data: queueItems, error: queueError } = await supabase
    .from('queue_items')
    .select('*')
    .eq('room_id', roomId);

  if (queueError) {
    return jsonResponse({ ok: false, reason: 'queue_query_error', error: queueError.message }, 500);
  }

  const typedQueueItems = (queueItems ?? []) as QueueItem[];

  const currentOnStage = typedQueueItems.find((item) => item.status === 'on_stage') ?? null;
  const waitingQueue = sortWaitingQueue(
    typedQueueItems.filter((item) => item.status === 'waiting')
  );

  const nextQueueItem = waitingQueue[0] ?? null;

  if (!currentOnStage || !nextQueueItem) {
    return jsonResponse({
      ok: true,
      sent: false,
      reason: 'no_current_singer_or_no_next_singer',
    });
  }

  const { data: previousNotification, error: previousNotificationError } = await supabase
    .from('room_next_singer_notifications')
    .select('room_id, current_member_id, next_member_id, sent_at')
    .eq('room_id', roomId)
    .maybeSingle();

  if (previousNotificationError) {
    return jsonResponse(
      {
        ok: false,
        reason: 'notification_state_query_error',
        error: previousNotificationError.message,
      },
      500
    );
  }

  const alreadyNotified =
    previousNotification?.current_member_id === currentOnStage.member_id &&
    previousNotification?.next_member_id === nextQueueItem.member_id;

  if (alreadyNotified) {
    return jsonResponse({
      ok: true,
      sent: false,
      reason: 'already_notified_for_current_pair',
    });
  }

  const { data: nextMember, error: nextMemberError } = await supabase
    .from('room_members')
    .select('id, room_id, user_id, name, is_manual')
    .eq('id', nextQueueItem.member_id)
    .maybeSingle();

  if (nextMemberError) {
    return jsonResponse(
      {
        ok: false,
        reason: 'next_member_query_error',
        error: nextMemberError.message,
      },
      500
    );
  }

  const typedNextMember = nextMember as RoomMember | null;

  if (!typedNextMember || typedNextMember.is_manual || !typedNextMember.user_id) {
    return jsonResponse({
      ok: true,
      sent: false,
      reason: 'next_member_manual_or_without_user',
    });
  }

  const { data: pushTokens, error: pushTokensError } = await supabase
    .from('push_tokens')
    .select('id, user_id, expo_push_token')
    .eq('user_id', typedNextMember.user_id);

  if (pushTokensError) {
    return jsonResponse(
      {
        ok: false,
        reason: 'push_tokens_query_error',
        error: pushTokensError.message,
      },
      500
    );
  }

  const typedPushTokens = (pushTokens ?? []) as PushToken[];

  if (typedPushTokens.length === 0) {
    return jsonResponse({
      ok: true,
      sent: false,
      reason: 'no_push_tokens_for_next_member',
    });
  }

  const pushResult = await sendExpoPushNotification(typedPushTokens, typedNextMember.name);

  const sentSuccessfully = Array.isArray(pushResult.result?.data)
    ? pushResult.result.data.some((ticket: any) => ticket.status === 'ok')
    : pushResult.result?.data?.status === 'ok';

  if (!pushResult.ok || !sentSuccessfully) {
    return jsonResponse(
      {
        ok: false,
        sent: false,
        reason: 'expo_push_error',
        result: pushResult.result,
      },
      500
    );
  }

  const { error: upsertNotificationError } = await supabase
    .from('room_next_singer_notifications')
    .upsert(
      {
        room_id: roomId,
        current_member_id: currentOnStage.member_id,
        next_member_id: nextQueueItem.member_id,
        sent_at: new Date().toISOString(),
      },
      {
        onConflict: 'room_id',
      }
    );

  if (upsertNotificationError) {
    return jsonResponse(
      {
        ok: false,
        sent: true,
        reason: 'sent_but_failed_to_save_notification_state',
        error: upsertNotificationError.message,
      },
      500
    );
  }

  return jsonResponse({
    ok: true,
    sent: true,
    room_id: roomId,
    current_member_id: currentOnStage.member_id,
    next_member_id: nextQueueItem.member_id,
    next_member_name: typedNextMember.name,
    tokens_count: typedPushTokens.length,
    result: pushResult.result,
  });
});