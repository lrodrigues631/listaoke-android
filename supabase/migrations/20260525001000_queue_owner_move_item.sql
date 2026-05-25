create or replace function public.queue_owner_move_item(
  p_room_id uuid,
  p_actor_member_id uuid,
  p_target_queue_item_id uuid,
  p_direction text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor room_members%rowtype;
  v_target queue_items%rowtype;
  v_neighbor queue_items%rowtype;
  v_target_member_name text;
  v_room_status room_status;
begin
  select *
    into v_actor
  from room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and status = 'active'
    and role = 'owner'
  for update;

  if not found then
    raise exception 'Apenas o dono ativo da sala pode mover a fila.';
  end if;

  if v_actor.user_id is distinct from auth.uid() then
    raise exception 'Você só pode administrar a sala usando o seu próprio membro.';
  end if;

  select status
    into v_room_status
  from rooms
  where id = p_room_id;

  if not found then
    raise exception 'Sala não encontrada.';
  end if;

  if v_room_status <> 'open' then
    raise exception 'A sala está encerrada. Não dá mais para mover a fila.';
  end if;

  select *
    into v_target
  from queue_items
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status = 'waiting'
  for update;

  if not found then
    raise exception 'Só dá para mover quem está esperando na fila.';
  end if;

  if p_direction = 'up' then
    select *
      into v_neighbor
    from queue_items
    where room_id = p_room_id
      and status = 'waiting'
      and (
        sort_order < v_target.sort_order
        or (sort_order = v_target.sort_order and created_at < v_target.created_at)
      )
    order by sort_order desc, created_at desc
    limit 1
    for update;

    if not found then
      raise exception 'Essa pessoa já é a primeira da fila.';
    end if;
  elsif p_direction = 'down' then
    select *
      into v_neighbor
    from queue_items
    where room_id = p_room_id
      and status = 'waiting'
      and (
        sort_order > v_target.sort_order
        or (sort_order = v_target.sort_order and created_at > v_target.created_at)
      )
    order by sort_order asc, created_at asc
    limit 1
    for update;

    if not found then
      raise exception 'Essa pessoa já é a última da fila.';
    end if;
  else
    raise exception 'Direção inválida para mover a fila.';
  end if;

  update queue_items
  set sort_order = v_neighbor.sort_order,
      updated_at = now()
  where id = v_target.id;

  update queue_items
  set sort_order = v_target.sort_order,
      updated_at = now()
  where id = v_neighbor.id;

  select name
    into v_target_member_name
  from room_members
  where id = v_target.member_id;

  insert into room_events (
    room_id,
    actor_member_id,
    target_member_id,
    type,
    metadata
  )
  values (
    p_room_id,
    p_actor_member_id,
    v_target.member_id,
    'queue_reordered',
    jsonb_build_object(
      'actor_name', v_actor.name,
      'target_name', coalesce(v_target_member_name, 'Participante'),
      'direction', p_direction
    )
  );
end;
$$;

grant execute on function public.queue_owner_move_item(uuid, uuid, uuid, text) to authenticated;
