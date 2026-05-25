create or replace function public.leave_room_member(
  p_room_id uuid,
  p_member_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member room_members%rowtype;
  v_active_members_count integer;
  v_was_on_stage boolean;
begin
  select *
    into v_member
  from room_members
  where id = p_member_id
    and room_id = p_room_id
    and status = 'active'
  for update;

  if not found then
    raise exception 'Membro ativo não encontrado.';
  end if;

  if v_member.user_id is distinct from auth.uid() then
    raise exception 'Você só pode sair da sala usando o seu próprio membro.';
  end if;

  select count(*)
    into v_active_members_count
  from room_members
  where room_id = p_room_id
    and status = 'active';

  if v_member.role = 'owner' then
    if v_active_members_count > 1 then
      raise exception 'Transfira a administração antes de sair.';
    end if;

    raise exception 'Você é o único dono da sala. Feche a sala para encerrar.';
  end if;

  select exists (
    select 1
    from queue_items
    where room_id = p_room_id
      and member_id = p_member_id
      and status = 'on_stage'
  )
    into v_was_on_stage;

  update queue_items
  set status = 'removed',
      updated_at = now()
  where room_id = p_room_id
    and member_id = p_member_id
    and status in ('waiting', 'on_stage');

  update room_members
  set status = 'left',
      left_at = now()
  where id = p_member_id
    and room_id = p_room_id
    and status = 'active';

  insert into room_events (
    room_id,
    actor_member_id,
    target_member_id,
    type,
    metadata
  )
  values (
    p_room_id,
    p_member_id,
    null,
    'member_left',
    jsonb_build_object('actor_name', v_member.name)
  );

  if v_was_on_stage then
    perform queue_auto_advance(p_room_id);
  end if;
end;
$$;

grant execute on function public.leave_room_member(uuid, uuid) to authenticated;
