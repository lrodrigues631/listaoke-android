


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."event_type" AS ENUM (
    'room_created',
    'room_closed',
    'member_joined',
    'member_left',
    'member_removed',
    'member_added_to_queue',
    'member_left_queue',
    'member_skipped_turn',
    'queue_reordered',
    'performance_finished',
    'owner_transferred'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."member_role" AS ENUM (
    'owner',
    'guest'
);


ALTER TYPE "public"."member_role" OWNER TO "postgres";


CREATE TYPE "public"."member_status" AS ENUM (
    'active',
    'left',
    'removed'
);


ALTER TYPE "public"."member_status" OWNER TO "postgres";


CREATE TYPE "public"."queue_status" AS ENUM (
    'waiting',
    'on_stage',
    'skipped',
    'done',
    'removed'
);


ALTER TYPE "public"."queue_status" OWNER TO "postgres";


CREATE TYPE "public"."room_status" AS ENUM (
    'open',
    'closed'
);


ALTER TYPE "public"."room_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_room"("p_room_id" "uuid", "p_actor_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
begin
  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode encerrar o karaokê.';
  end if;

  update public.rooms
  set
    status = 'closed',
    closed_at = now(),
    closed_by_user_id = auth.uid()
  where id = p_room_id
    and status = 'open';

  if not found then
    raise exception 'Essa sala já foi encerrada.';
  end if;

  update public.queue_items
  set
    status = 'removed',
    updated_at = now()
  where room_id = p_room_id
    and status in ('waiting', 'on_stage');

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    p_actor_member_id,
    'room_closed',
    jsonb_build_object(
      'actor_name', v_actor_name
    )
  );
end;
$$;


ALTER FUNCTION "public"."close_room"("p_room_id" "uuid", "p_actor_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_room_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid", "p_type" "public"."event_type", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_event_id uuid;
begin
  insert into public.room_events (
    room_id,
    actor_member_id,
    target_member_id,
    type,
    metadata
  )
  values (
    p_room_id,
    p_actor_member_id,
    p_target_member_id,
    p_type,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;


ALTER FUNCTION "public"."create_room_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid", "p_type" "public"."event_type", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_member_id"("p_room_id" "uuid") RETURNS "uuid"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select rm.id
  from public.room_members rm
  where rm.room_id = p_room_id
    and rm.user_id = auth.uid()
    and rm.status = 'active'
  limit 1;
$$;


ALTER FUNCTION "public"."current_member_id"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_room_code"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_code text;
  v_attempts integer := 0;
begin
  loop
    v_code := lpad(floor(random() * 10000)::integer::text, 4, '0');
    v_attempts := v_attempts + 1;

    exit when not exists (
      select 1
      from public.rooms
      where code = v_code
    );

    if v_attempts >= 100 then
      raise exception 'Não foi possível gerar um código de sala disponível.';
    end if;
  end loop;

  return v_code;
end;
$$;


ALTER FUNCTION "public"."generate_room_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_room_summary"("p_room_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_summary jsonb;
begin
  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
  ) then
    raise exception 'Você não faz parte desta sala.';
  end if;

  select jsonb_build_object(
    'total_performances',
      (
        select count(*)
        from public.room_events
        where room_id = p_room_id
          and type = 'performance_finished'
      ),
    'total_skips',
      (
        select count(*)
        from public.room_events
        where room_id = p_room_id
          and type = 'member_skipped_turn'
      ),
    'total_queue_exits',
      (
        select count(*)
        from public.room_events
        where room_id = p_room_id
          and type = 'member_left_queue'
      ),
    'total_removals',
      (
        select count(*)
        from public.room_events
        where room_id = p_room_id
          and type = 'member_removed'
      ),
    'total_participants',
      (
        select count(*)
        from public.room_members
        where room_id = p_room_id
      ),
    'ranking',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'member_id', ranked.member_id,
              'name', ranked.name,
              'performances', ranked.performances
            )
            order by ranked.performances desc, ranked.name asc
          )
          from (
            select
              e.actor_member_id as member_id,
              coalesce(max(m.name), 'Participante') as name,
              count(*) as performances
            from public.room_events e
            left join public.room_members m on m.id = e.actor_member_id
            where e.room_id = p_room_id
              and e.type = 'performance_finished'
            group by e.actor_member_id
          ) ranked
        ),
        '[]'::jsonb
      )
  )
  into v_summary;

  return v_summary;
end;
$$;


ALTER FUNCTION "public"."get_room_summary"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_room_member"("p_room_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.room_members rm
    where rm.room_id = p_room_id
      and rm.user_id = auth.uid()
      and rm.status = 'active'
  );
$$;


ALTER FUNCTION "public"."is_room_member"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_room_owner"("p_room_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.owner_user_id = auth.uid()
      and r.status = 'open'
  );
$$;


ALTER FUNCTION "public"."is_room_owner"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_room_member"("p_room_id" "uuid", "p_name" "text") RETURNS TABLE("id" "uuid", "room_id" "uuid", "user_id" "uuid", "name" "text", "role" "public"."member_role", "status" "public"."member_status", "created_at" timestamp with time zone, "left_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_room_status room_status;
  v_member_id uuid;
  v_clean_name text;
begin
  v_clean_name := nullif(trim(p_name), '');

  if v_clean_name is null then
    raise exception 'Coloca seu nome ou apelido. A fila precisa saber quem é você.';
  end if;

  select r.status
  into v_room_status
  from public.rooms r
  where r.id = p_room_id;

  if v_room_status is null then
    raise exception 'Sala não encontrada.';
  end if;

  if v_room_status = 'closed'::room_status then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select rm.id
  into v_member_id
  from public.room_members rm
  where rm.room_id = p_room_id
    and rm.user_id = auth.uid()
  limit 1
  for update;

  if v_member_id is null then
    insert into public.room_members (
      room_id,
      user_id,
      name,
      role,
      status
    )
    values (
      p_room_id,
      auth.uid(),
      v_clean_name,
      'guest'::member_role,
      'active'::member_status
    )
    returning room_members.id into v_member_id;
  else
    update public.room_members rm
    set
      name = v_clean_name,
      status = 'active'::member_status,
      left_at = null,
      role = case
        when rm.status = 'active'::member_status and rm.role = 'owner'::member_role
          then 'owner'::member_role
        else 'guest'::member_role
      end
    where rm.id = v_member_id;
  end if;

  return query
  select
    rm.id,
    rm.room_id,
    rm.user_id,
    rm.name,
    rm.role,
    rm.status,
    rm.created_at,
    rm.left_at
  from public.room_members rm
  where rm.id = v_member_id;
end;
$$;


ALTER FUNCTION "public"."join_room_member"("p_room_id" "uuid", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."leave_room_member"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_member_role member_role;
  v_member_name text;
  v_active_members_count integer;
  v_had_on_stage boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select role, name
  into v_member_role, v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active'
  for update;

  if v_member_role is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  select count(*)
  into v_active_members_count
  from public.room_members
  where room_id = p_room_id
    and status = 'active';

  if v_member_role = 'owner' then
    if v_active_members_count > 1 then
      raise exception 'Transfira a administração antes de sair.';
    end if;

    raise exception 'Você é o único dono da sala. Feche a sala para encerrar.';
  end if;

  select exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and member_id = p_member_id
      and status = 'on_stage'
  )
  into v_had_on_stage;

  update public.queue_items
  set
    status = 'removed',
    updated_at = now()
  where room_id = p_room_id
    and member_id = p_member_id
    and status in ('waiting', 'on_stage');

  update public.room_members
  set
    status = 'left',
    left_at = now()
  where id = p_member_id
    and room_id = p_room_id
    and status = 'active';

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'member_left',
    jsonb_build_object(
      'actor_name', v_member_name
    )
  );

  if v_had_on_stage then
    perform public.queue_auto_advance(p_room_id);
  end if;
end;
$$;


ALTER FUNCTION "public"."leave_room_member"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_member_joined"("p_room_id" "uuid", "p_actor_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
begin
  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    p_actor_member_id,
    'member_joined',
    jsonb_build_object(
      'actor_name', v_actor_name
    )
  );
end;
$$;


ALTER FUNCTION "public"."log_member_joined"("p_room_id" "uuid", "p_actor_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_room_created"("p_room_id" "uuid", "p_actor_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
begin
  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    p_actor_member_id,
    'room_created',
    jsonb_build_object(
      'actor_name', v_actor_name
    )
  );
end;
$$;


ALTER FUNCTION "public"."log_room_created"("p_room_id" "uuid", "p_actor_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."owner_add_manual_queue_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
  v_clean_name text;
  v_manual_member_id uuid;
  v_next_sort_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  v_clean_name := nullif(trim(p_name), '');

  if v_clean_name is null then
    raise exception 'Digite o nome da pessoa para colocar na fila.';
  end if;

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode adicionar pessoas manualmente.';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select id
  into v_manual_member_id
  from public.room_members
  where room_id = p_room_id
    and is_manual = true
    and lower(name) = lower(v_clean_name)
    and status = 'active'
  order by created_at asc
  limit 1
  for update;

  if v_manual_member_id is null then
    insert into public.room_members (
      room_id,
      user_id,
      name,
      role,
      status,
      is_manual
    )
    values (
      p_room_id,
      null,
      v_clean_name,
      'guest'::member_role,
      'active'::member_status,
      true
    )
    returning id into v_manual_member_id;

    perform public.create_room_event(
      p_room_id,
      p_actor_member_id,
      v_manual_member_id,
      'member_joined',
      jsonb_build_object(
        'actor_name', v_clean_name,
        'added_by_name', v_actor_name,
        'manual', true
      )
    );
  end if;

  if exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and member_id = v_manual_member_id
      and status in ('waiting', 'on_stage')
  ) then
    raise exception 'Essa pessoa já está na fila.';
  end if;

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage');

  insert into public.queue_items (
    room_id,
    member_id,
    sort_order,
    status
  )
  values (
    p_room_id,
    v_manual_member_id,
    v_next_sort_order,
    'waiting'::queue_status
  );

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    v_manual_member_id,
    'member_added_to_queue',
    jsonb_build_object(
      'actor_name', v_clean_name,
      'added_by_name', v_actor_name,
      'manual', true
    )
  );

  if not exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and status = 'on_stage'
  ) then
    perform public.queue_auto_advance(p_room_id);
  end if;

  return v_manual_member_id;
end;
$$;


ALTER FUNCTION "public"."owner_add_manual_queue_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_auto_advance"("p_room_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_next_queue_item_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  if not exists (
    select 1
    from public.room_members
    where room_id = p_room_id
      and user_id = auth.uid()
      and status = 'active'
  ) then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  if exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and status = 'on_stage'
  ) then
    return;
  end if;

  select id
  into v_next_queue_item_id
  from public.queue_items
  where room_id = p_room_id
    and status = 'waiting'
  order by sort_order asc, created_at asc
  limit 1
  for update skip locked;

  if v_next_queue_item_id is not null then
    update public.queue_items
    set
      status = 'on_stage',
      updated_at = now()
    where id = v_next_queue_item_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."queue_auto_advance"("p_room_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_finish_own"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_queue_item_id uuid;
  v_next_sort_order integer;
  v_member_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_member_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  select id
  into v_queue_item_id
  from public.queue_items
  where room_id = p_room_id
    and member_id = p_member_id
    and status = 'on_stage'
  limit 1
  for update;

  if v_queue_item_id is null then
    raise exception 'Você não está no palco agora.';
  end if;

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'performance_finished',
    jsonb_build_object(
      'actor_name', v_member_name
    )
  );

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage')
    and id <> v_queue_item_id;

  update public.queue_items
  set
    status = 'waiting',
    sort_order = v_next_sort_order,
    updated_at = now()
  where id = v_queue_item_id;

  perform public.queue_auto_advance(p_room_id);
end;
$$;


ALTER FUNCTION "public"."queue_finish_own"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_join"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_next_sort_order integer;
  v_member_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select name
  into v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_member_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  if exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and member_id = p_member_id
      and status in ('waiting', 'on_stage')
  ) then
    raise exception 'Você já está na fila. Calma, superstar.';
  end if;

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage');

  insert into public.queue_items (
    room_id,
    member_id,
    sort_order,
    status
  )
  values (
    p_room_id,
    p_member_id,
    v_next_sort_order,
    'waiting'
  );

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'member_added_to_queue',
    jsonb_build_object(
      'actor_name', v_member_name
    )
  );

  if not exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and status = 'on_stage'
  ) then
    perform public.queue_auto_advance(p_room_id);
  end if;
end;
$$;


ALTER FUNCTION "public"."queue_join"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_leave_own"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_queue_item_id uuid;
  v_queue_status queue_status;
  v_member_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_member_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  select id, status
  into v_queue_item_id, v_queue_status
  from public.queue_items
  where room_id = p_room_id
    and member_id = p_member_id
    and status in ('waiting', 'on_stage')
  order by sort_order asc
  limit 1
  for update;

  if v_queue_item_id is null then
    raise exception 'Você não está na fila.';
  end if;

  update public.queue_items
  set
    status = 'removed',
    updated_at = now()
  where id = v_queue_item_id;

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'member_left_queue',
    jsonb_build_object(
      'actor_name', v_member_name,
      'previous_status', v_queue_status
    )
  );

  if v_queue_status = 'on_stage' then
    perform public.queue_auto_advance(p_room_id);
  end if;
end;
$$;


ALTER FUNCTION "public"."queue_leave_own"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_move_own_down"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_my_queue_item_id uuid;
  v_my_sort_order integer;
  v_next_queue_item_id uuid;
  v_next_sort_order integer;
  v_member_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_member_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  select id, sort_order
  into v_my_queue_item_id, v_my_sort_order
  from public.queue_items
  where room_id = p_room_id
    and member_id = p_member_id
    and status = 'waiting'
  order by sort_order asc
  limit 1
  for update;

  if v_my_queue_item_id is null then
    raise exception 'Você só pode adiar sua vez enquanto está esperando na fila.';
  end if;

  select id, sort_order
  into v_next_queue_item_id, v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status = 'waiting'
    and sort_order > v_my_sort_order
  order by sort_order asc
  limit 1
  for update;

  if v_next_queue_item_id is null then
    raise exception 'Você já está no fim da fila.';
  end if;

  update public.queue_items
  set
    sort_order = v_next_sort_order,
    updated_at = now()
  where id = v_my_queue_item_id;

  update public.queue_items
  set
    sort_order = v_my_sort_order,
    updated_at = now()
  where id = v_next_queue_item_id;

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'queue_reordered',
    jsonb_build_object(
      'actor_name', v_member_name,
      'direction', 'down'
    )
  );
end;
$$;


ALTER FUNCTION "public"."queue_move_own_down"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_owner_finish_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
  v_target_member_id uuid;
  v_target_name text;
  v_next_sort_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode concluir a vez de outra pessoa.';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select q.member_id, m.name
  into v_target_member_id, v_target_name
  from public.queue_items q
  join public.room_members m on m.id = q.member_id
  where q.id = p_target_queue_item_id
    and q.room_id = p_room_id
    and q.status = 'on_stage'
  for update of q;

  if v_target_member_id is null then
    raise exception 'Essa pessoa não está no palco agora.';
  end if;

  perform public.create_room_event(
    p_room_id,
    v_target_member_id,
    v_target_member_id,
    'performance_finished',
    jsonb_build_object(
      'actor_name', v_target_name,
      'controlled_by_name', v_actor_name
    )
  );

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage')
    and id <> p_target_queue_item_id;

  update public.queue_items
  set
    status = 'waiting'::queue_status,
    sort_order = v_next_sort_order,
    updated_at = now()
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status = 'on_stage'::queue_status;

  perform public.queue_auto_advance(p_room_id);
end;
$$;


ALTER FUNCTION "public"."queue_owner_finish_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_owner_move_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid", "p_direction" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
  v_target_member_id uuid;
  v_target_name text;

  v_target_sort_order integer;

  v_swap_queue_item_id uuid;
  v_swap_sort_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  if p_direction not in ('up', 'down') then
    raise exception 'Direção inválida para mover a fila.';
  end if;

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode reorganizar a fila.';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select member_id, sort_order
  into v_target_member_id, v_target_sort_order
  from public.queue_items
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status = 'waiting'
  for update;

  if v_target_member_id is null then
    raise exception 'Esse participante não está esperando na fila.';
  end if;

  select name
  into v_target_name
  from public.room_members
  where id = v_target_member_id
    and room_id = p_room_id;

  if p_direction = 'up' then
    select id, sort_order
    into v_swap_queue_item_id, v_swap_sort_order
    from public.queue_items
    where room_id = p_room_id
      and status = 'waiting'
      and sort_order < v_target_sort_order
    order by sort_order desc, created_at desc
    limit 1
    for update;

    if v_swap_queue_item_id is null then
      raise exception 'Essa pessoa já está no começo da fila.';
    end if;
  end if;

  if p_direction = 'down' then
    select id, sort_order
    into v_swap_queue_item_id, v_swap_sort_order
    from public.queue_items
    where room_id = p_room_id
      and status = 'waiting'
      and sort_order > v_target_sort_order
    order by sort_order asc, created_at asc
    limit 1
    for update;

    if v_swap_queue_item_id is null then
      raise exception 'Essa pessoa já está no fim da fila.';
    end if;
  end if;

  update public.queue_items
  set
    sort_order = v_swap_sort_order,
    updated_at = now()
  where id = p_target_queue_item_id;

  update public.queue_items
  set
    sort_order = v_target_sort_order,
    updated_at = now()
  where id = v_swap_queue_item_id;

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    v_target_member_id,
    'queue_reordered',
    jsonb_build_object(
      'actor_name', v_actor_name,
      'target_name', coalesce(v_target_name, 'Participante'),
      'direction', p_direction
    )
  );
end;
$$;


ALTER FUNCTION "public"."queue_owner_move_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid", "p_direction" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_owner_remove_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_target_status queue_status;
  v_actor_name text;
  v_target_member_id uuid;
  v_target_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode remover outras pessoas da fila.';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select status, member_id
  into v_target_status, v_target_member_id
  from public.queue_items
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status in ('waiting', 'on_stage')
  for update;

  if v_target_status is null then
    raise exception 'Esse item não está mais ativo na fila.';
  end if;

  select name
  into v_target_name
  from public.room_members
  where id = v_target_member_id
    and room_id = p_room_id;

  update public.queue_items
  set
    status = 'removed',
    updated_at = now()
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status in ('waiting', 'on_stage');

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    v_target_member_id,
    'member_removed',
    jsonb_build_object(
      'actor_name', v_actor_name,
      'target_name', coalesce(v_target_name, 'Participante'),
      'removed_from', v_target_status
    )
  );

  if v_target_status = 'on_stage' then
    perform public.queue_auto_advance(p_room_id);
  end if;
end;
$$;


ALTER FUNCTION "public"."queue_owner_remove_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_owner_skip_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
  v_target_member_id uuid;
  v_target_name text;
  v_next_sort_order integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode pular a vez de outra pessoa.';
  end if;

  if not exists (
    select 1
    from public.rooms
    where id = p_room_id
      and status = 'open'
  ) then
    raise exception 'Essa sala já foi encerrada. O karaokê dessa turma acabou por hoje.';
  end if;

  select q.member_id, m.name
  into v_target_member_id, v_target_name
  from public.queue_items q
  join public.room_members m on m.id = q.member_id
  where q.id = p_target_queue_item_id
    and q.room_id = p_room_id
    and q.status = 'on_stage'
  for update of q;

  if v_target_member_id is null then
    raise exception 'Essa pessoa não está no palco agora.';
  end if;

  perform public.create_room_event(
    p_room_id,
    v_target_member_id,
    v_target_member_id,
    'member_skipped_turn',
    jsonb_build_object(
      'actor_name', v_target_name,
      'controlled_by_name', v_actor_name
    )
  );

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage')
    and id <> p_target_queue_item_id;

  update public.queue_items
  set
    status = 'waiting'::queue_status,
    sort_order = v_next_sort_order,
    updated_at = now()
  where id = p_target_queue_item_id
    and room_id = p_room_id
    and status = 'on_stage'::queue_status;

  perform public.queue_auto_advance(p_room_id);
end;
$$;


ALTER FUNCTION "public"."queue_owner_skip_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."queue_skip_own"("p_room_id" "uuid", "p_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_queue_item_id uuid;
  v_next_sort_order integer;
  v_member_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_member_name
  from public.room_members
  where id = p_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active';

  if v_member_name is null then
    raise exception 'Você não é membro ativo desta sala.';
  end if;

  select id
  into v_queue_item_id
  from public.queue_items
  where room_id = p_room_id
    and member_id = p_member_id
    and status = 'on_stage'
  limit 1
  for update;

  if v_queue_item_id is null then
    raise exception 'Você não está no palco agora.';
  end if;

  perform public.create_room_event(
    p_room_id,
    p_member_id,
    p_member_id,
    'member_skipped_turn',
    jsonb_build_object(
      'actor_name', v_member_name
    )
  );

  select coalesce(max(sort_order), 0) + 1
  into v_next_sort_order
  from public.queue_items
  where room_id = p_room_id
    and status in ('waiting', 'on_stage')
    and id <> v_queue_item_id;

  update public.queue_items
  set
    status = 'waiting',
    sort_order = v_next_sort_order,
    updated_at = now()
  where id = v_queue_item_id;

  perform public.queue_auto_advance(p_room_id);
end;
$$;


ALTER FUNCTION "public"."queue_skip_own"("p_room_id" "uuid", "p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."remove_room_member"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_target_role member_role;
  v_had_on_stage boolean := false;
  v_actor_name text;
  v_target_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono da sala pode remover membros.';
  end if;

  if p_actor_member_id = p_target_member_id then
    raise exception 'O dono não pode remover a si mesmo. Transfira a sala antes de sair.';
  end if;

  select role, name
  into v_target_role, v_target_name
  from public.room_members
  where id = p_target_member_id
    and room_id = p_room_id
    and status = 'active'
  for update;

  if v_target_role is null then
    raise exception 'Esse membro não está ativo na sala.';
  end if;

  if v_target_role = 'owner' then
    raise exception 'Não dá para remover o dono atual. Transfira a sala primeiro.';
  end if;

  select exists (
    select 1
    from public.queue_items
    where room_id = p_room_id
      and member_id = p_target_member_id
      and status = 'on_stage'
  )
  into v_had_on_stage;

  update public.queue_items
  set
    status = 'removed',
    updated_at = now()
  where room_id = p_room_id
    and member_id = p_target_member_id
    and status in ('waiting', 'on_stage');

  update public.room_members
  set
    status = 'left',
    left_at = now()
  where id = p_target_member_id
    and room_id = p_room_id
    and status = 'active';

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    p_target_member_id,
    'member_removed',
    jsonb_build_object(
      'actor_name', v_actor_name,
      'target_name', v_target_name,
      'removed_from', 'room'
    )
  );

  if v_had_on_stage then
    perform public.queue_auto_advance(p_room_id);
  end if;
end;
$$;


ALTER FUNCTION "public"."remove_room_member"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_queue_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_queue_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transfer_room_ownership"("p_room_id" "uuid", "p_new_owner_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_current_owner_user_id uuid;
  v_new_owner_user_id uuid;
  v_actor_member_id uuid;
begin
  -- Buscar sala e validar dono atual
  select owner_user_id
  into v_current_owner_user_id
  from public.rooms
  where id = p_room_id
    and status = 'open';

  if v_current_owner_user_id is null then
    raise exception 'Sala não encontrada ou encerrada.';
  end if;

  if v_current_owner_user_id <> auth.uid() then
    raise exception 'Apenas o dono atual pode transferir a sala.';
  end if;

  -- Buscar membro atual do dono
  select id
  into v_actor_member_id
  from public.room_members
  where room_id = p_room_id
    and user_id = auth.uid()
    and status = 'active'
  limit 1;

  if v_actor_member_id is null then
    raise exception 'Dono atual não encontrado como membro ativo.';
  end if;

  -- Buscar novo dono
  select user_id
  into v_new_owner_user_id
  from public.room_members
  where id = p_new_owner_member_id
    and room_id = p_room_id
    and status = 'active';

  if v_new_owner_user_id is null then
    raise exception 'Novo dono precisa ser um membro ativo da sala.';
  end if;

  if v_new_owner_user_id = auth.uid() then
    raise exception 'Você já é o dono da sala.';
  end if;

  -- Atualizar sala
  update public.rooms
  set owner_user_id = v_new_owner_user_id
  where id = p_room_id;

  -- Rebaixar todos para guest
  update public.room_members
  set role = 'guest'
  where room_id = p_room_id;

  -- Promover novo dono
  update public.room_members
  set role = 'owner'
  where id = p_new_owner_member_id
    and room_id = p_room_id;

  -- Registrar evento
  insert into public.room_events (
    room_id,
    actor_member_id,
    target_member_id,
    type,
    metadata
  )
  values (
    p_room_id,
    v_actor_member_id,
    p_new_owner_member_id,
    'owner_transferred',
    jsonb_build_object('message', 'Sala transferida para outro membro')
  );
end;
$$;


ALTER FUNCTION "public"."transfer_room_ownership"("p_room_id" "uuid", "p_new_owner_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transfer_room_ownership_with_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_new_owner_member_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_name text;
  v_target_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 0));

  select name
  into v_actor_name
  from public.room_members
  where id = p_actor_member_id
    and room_id = p_room_id
    and user_id = auth.uid()
    and role = 'owner'
    and status = 'active';

  if v_actor_name is null then
    raise exception 'Só o dono atual pode transferir a sala.';
  end if;

  if p_actor_member_id = p_new_owner_member_id then
    raise exception 'Você já é o dono da sala.';
  end if;

  select name
  into v_target_name
  from public.room_members
  where id = p_new_owner_member_id
    and room_id = p_room_id
    and status = 'active';

  if v_target_name is null then
    raise exception 'O novo dono precisa estar ativo na sala.';
  end if;

  perform public.transfer_room_ownership(p_room_id, p_new_owner_member_id);

  perform public.create_room_event(
    p_room_id,
    p_actor_member_id,
    p_new_owner_member_id,
    'owner_transferred',
    jsonb_build_object(
      'actor_name', v_actor_name,
      'target_name', v_target_name
    )
  );
end;
$$;


ALTER FUNCTION "public"."transfer_room_ownership_with_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_new_owner_member_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."queue_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "sort_order" integer NOT NULL,
    "status" "public"."queue_status" DEFAULT 'waiting'::"public"."queue_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."queue_items" REPLICA IDENTITY FULL;


ALTER TABLE "public"."queue_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "actor_member_id" "uuid",
    "target_member_id" "uuid",
    "type" "public"."event_type" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE ONLY "public"."room_events" REPLICA IDENTITY FULL;


ALTER TABLE "public"."room_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "role" "public"."member_role" DEFAULT 'guest'::"public"."member_role" NOT NULL,
    "status" "public"."member_status" DEFAULT 'active'::"public"."member_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "left_at" timestamp with time zone,
    "is_manual" boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY "public"."room_members" REPLICA IDENTITY FULL;


ALTER TABLE "public"."room_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "status" "public"."room_status" DEFAULT 'open'::"public"."room_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    "closed_by_user_id" "uuid"
);

ALTER TABLE ONLY "public"."rooms" REPLICA IDENTITY FULL;


ALTER TABLE "public"."rooms" OWNER TO "postgres";


ALTER TABLE ONLY "public"."queue_items"
    ADD CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_events"
    ADD CONSTRAINT "room_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_unique_user_per_room" UNIQUE ("room_id", "user_id");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "queue_items_one_active_per_member" ON "public"."queue_items" USING "btree" ("room_id", "member_id") WHERE ("status" = ANY (ARRAY['waiting'::"public"."queue_status", 'on_stage'::"public"."queue_status"]));



CREATE OR REPLACE TRIGGER "trg_queue_updated_at" BEFORE UPDATE ON "public"."queue_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_queue_updated_at"();



ALTER TABLE ONLY "public"."queue_items"
    ADD CONSTRAINT "queue_items_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."room_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."queue_items"
    ADD CONSTRAINT "queue_items_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_events"
    ADD CONSTRAINT "room_events_actor_member_id_fkey" FOREIGN KEY ("actor_member_id") REFERENCES "public"."room_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."room_events"
    ADD CONSTRAINT "room_events_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_events"
    ADD CONSTRAINT "room_events_target_member_id_fkey" FOREIGN KEY ("target_member_id") REFERENCES "public"."room_members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_members"
    ADD CONSTRAINT "room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "events_insert_if_room_member" ON "public"."room_events" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_room_member"("room_id"));



CREATE POLICY "events_select_if_room_member" ON "public"."room_events" FOR SELECT TO "authenticated" USING ("public"."is_room_member"("room_id"));



CREATE POLICY "members_insert_self_guest_or_owner" ON "public"."room_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (("role" = 'guest'::"public"."member_role") OR (EXISTS ( SELECT 1
   FROM "public"."rooms" "r"
  WHERE (("r"."id" = "room_members"."room_id") AND ("r"."owner_user_id" = "auth"."uid"()) AND ("room_members"."role" = 'owner'::"public"."member_role")))))));



CREATE POLICY "members_select_if_room_member_or_open_room" ON "public"."room_members" FOR SELECT TO "authenticated" USING (("public"."is_room_member"("room_id") OR (EXISTS ( SELECT 1
   FROM "public"."rooms" "r"
  WHERE (("r"."id" = "room_members"."room_id") AND ("r"."status" = 'open'::"public"."room_status"))))));



CREATE POLICY "members_update_owner_or_self_guest" ON "public"."room_members" FOR UPDATE TO "authenticated" USING (("public"."is_room_owner"("room_id") OR ("user_id" = "auth"."uid"()))) WITH CHECK (("public"."is_room_owner"("room_id") OR (("user_id" = "auth"."uid"()) AND ("role" = 'guest'::"public"."member_role"))));



CREATE POLICY "queue_insert_owner_or_self" ON "public"."queue_items" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_room_owner"("room_id") OR ("member_id" = "public"."current_member_id"("room_id"))));



ALTER TABLE "public"."queue_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "queue_select_if_room_member" ON "public"."queue_items" FOR SELECT TO "authenticated" USING ("public"."is_room_member"("room_id"));



CREATE POLICY "queue_update_owner_or_self" ON "public"."queue_items" FOR UPDATE TO "authenticated" USING (("public"."is_room_owner"("room_id") OR ("member_id" = "public"."current_member_id"("room_id")))) WITH CHECK (("public"."is_room_owner"("room_id") OR ("member_id" = "public"."current_member_id"("room_id"))));



ALTER TABLE "public"."room_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."room_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rooms_insert_own" ON "public"."rooms" FOR INSERT TO "authenticated" WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "rooms_select_open_or_member" ON "public"."rooms" FOR SELECT TO "authenticated" USING ((("status" = 'open'::"public"."room_status") OR "public"."is_room_member"("id")));



CREATE POLICY "rooms_update_owner" ON "public"."rooms" FOR UPDATE TO "authenticated" USING (("owner_user_id" = "auth"."uid"())) WITH CHECK (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."close_room"("p_room_id" "uuid", "p_actor_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."create_room_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid", "p_type" "public"."event_type", "p_metadata" "jsonb") TO "authenticated";



GRANT ALL ON FUNCTION "public"."generate_room_code"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_room_summary"("p_room_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."join_room_member"("p_room_id" "uuid", "p_name" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."leave_room_member"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."log_member_joined"("p_room_id" "uuid", "p_actor_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."log_room_created"("p_room_id" "uuid", "p_actor_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."owner_add_manual_queue_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_name" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_auto_advance"("p_room_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_finish_own"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_join"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_leave_own"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_move_own_down"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_owner_finish_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_owner_move_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid", "p_direction" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_owner_remove_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_owner_skip_item"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_queue_item_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."queue_skip_own"("p_room_id" "uuid", "p_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."remove_room_member"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_target_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."transfer_room_ownership"("p_room_id" "uuid", "p_new_owner_member_id" "uuid") TO "authenticated";



GRANT ALL ON FUNCTION "public"."transfer_room_ownership_with_event"("p_room_id" "uuid", "p_actor_member_id" "uuid", "p_new_owner_member_id" "uuid") TO "authenticated";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_items" TO "anon";
GRANT ALL ON TABLE "public"."queue_items" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."queue_items" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_events" TO "anon";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_events" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_events" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_members" TO "anon";
GRANT ALL ON TABLE "public"."room_members" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_members" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."rooms" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";







