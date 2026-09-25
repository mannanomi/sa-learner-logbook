-- SA Learner Logbook: initial schema
-- Every table is scoped to auth.uid() via Row Level Security; a learner can
-- only ever read/write their own rows. No table here is readable by another
-- learner under any policy.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users, learner permit info
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  state text not null default 'SA',
  permit_date date,
  target_licence_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- supervisors: reusable supervisor profiles, owned by a learner
-- ---------------------------------------------------------------------------
create table if not exists public.supervisors (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  licence_number text,
  licence_state text,
  relationship text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supervisors_learner_id_idx on public.supervisors (learner_id);

alter table public.supervisors enable row level security;

create policy "supervisors_select_own" on public.supervisors
  for select using (auth.uid() = learner_id);
create policy "supervisors_insert_own" on public.supervisors
  for insert with check (auth.uid() = learner_id);
create policy "supervisors_update_own" on public.supervisors
  for update using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "supervisors_delete_own" on public.supervisors
  for delete using (auth.uid() = learner_id);

-- ---------------------------------------------------------------------------
-- driving_sessions: the logbook entries
-- ---------------------------------------------------------------------------
create table if not exists public.driving_sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references auth.users (id) on delete cascade,
  supervisor_id uuid references public.supervisors (id) on delete set null,

  session_date date not null,
  start_time time not null,
  end_time time not null,

  -- Denormalised, always derived from calculateDrivingSegments() — never
  -- entered by hand and never recomputed anywhere else.
  total_minutes integer not null check (total_minutes >= 0),
  day_minutes integer not null check (day_minutes >= 0),
  night_minutes integer not null check (night_minutes >= 0),

  starting_location text not null,
  destination text not null,
  weather_condition text not null,
  road_condition text not null,
  traffic_condition text not null,
  notes text,

  learner_confirmed boolean not null default false,
  supervisor_confirmed boolean not null default false,

  -- Offline-sync bookkeeping
  client_id uuid not null default gen_random_uuid(),
  sync_status text not null default 'synced' check (sync_status in ('synced', 'pending', 'conflict', 'error')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists driving_sessions_learner_client_id_idx
  on public.driving_sessions (learner_id, client_id);
create index if not exists driving_sessions_learner_id_idx on public.driving_sessions (learner_id);
create index if not exists driving_sessions_session_date_idx on public.driving_sessions (session_date);

alter table public.driving_sessions enable row level security;

create policy "driving_sessions_select_own" on public.driving_sessions
  for select using (auth.uid() = learner_id);
create policy "driving_sessions_insert_own" on public.driving_sessions
  for insert with check (auth.uid() = learner_id);
create policy "driving_sessions_update_own" on public.driving_sessions
  for update using (auth.uid() = learner_id) with check (auth.uid() = learner_id);
create policy "driving_sessions_delete_own" on public.driving_sessions
  for delete using (auth.uid() = learner_id);

-- A supervisor referenced by a session must belong to the same learner.
create or replace function public.check_supervisor_ownership()
returns trigger as $$
begin
  if new.supervisor_id is not null then
    if not exists (
      select 1 from public.supervisors
      where id = new.supervisor_id and learner_id = new.learner_id
    ) then
      raise exception 'supervisor does not belong to learner';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists driving_sessions_check_supervisor on public.driving_sessions;
create trigger driving_sessions_check_supervisor
  before insert or update on public.driving_sessions
  for each row execute function public.check_supervisor_ownership();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists supervisors_set_updated_at on public.supervisors;
create trigger supervisors_set_updated_at before update on public.supervisors
  for each row execute function public.set_updated_at();

drop trigger if exists driving_sessions_set_updated_at on public.driving_sessions;
create trigger driving_sessions_set_updated_at before update on public.driving_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- new-user bootstrap: create a profile row when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
