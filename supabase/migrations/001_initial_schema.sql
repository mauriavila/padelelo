-- supabase/migrations/001_initial_schema.sql

-- ========== PROFILES ==========
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null,
  elo         int not null default 1000,
  division    int not null default 3,
  wins        int not null default 0,
  losses      int not null default 0,
  created_at  timestamptz not null default now()
);

-- Trigger: actualizar division cuando cambia elo
create or replace function public.update_division()
returns trigger as $$
begin
  new.division := case
    when new.elo < 800   then 1
    when new.elo < 1000  then 2
    when new.elo < 1200  then 3
    when new.elo < 1400  then 4
    when new.elo < 1600  then 5
    when new.elo < 1800  then 6
    else 7
  end;
  return new;
end;
$$ language plpgsql;

create trigger trg_update_division
  before insert or update of elo on public.profiles
  for each row execute function public.update_division();

-- Trigger: crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== MATCHES ==========
create table public.matches (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references public.profiles(id) on delete cascade,
  location      text not null,
  scheduled_at  timestamptz not null,
  spots_total   int not null default 4,
  spots_taken   int not null default 0,
  division      int,
  is_public     boolean not null default true,
  invite_code   text,
  status        text not null default 'open' check (status in ('open','full','finished','cancelled')),
  created_at    timestamptz not null default now()
);

-- ========== MATCH_PLAYERS ==========
create table public.match_players (
  match_id    uuid not null references public.matches(id) on delete cascade,
  player_id   uuid not null references public.profiles(id) on delete cascade,
  team        int,
  joined_at   timestamptz not null default now(),
  primary key (match_id, player_id)
);

-- Trigger: actualizar spots_taken cuando alguien se une/sale
create or replace function public.update_spots_taken()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.matches
    set spots_taken = spots_taken + 1,
        status = case when spots_taken + 1 >= spots_total then 'full' else 'open' end
    where id = new.match_id;
  elsif TG_OP = 'DELETE' then
    update public.matches
    set spots_taken = spots_taken - 1,
        status = 'open'
    where id = old.match_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_update_spots
  after insert or delete on public.match_players
  for each row execute function public.update_spots_taken();

-- ========== MATCH_RESULTS (fase 2) ==========
create table public.match_results (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references public.matches(id) on delete cascade,
  winner_team   int not null check (winner_team in (1, 2)),
  reported_by   uuid not null references public.profiles(id),
  confirmed     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_results enable row level security;

-- Profiles: cualquiera puede leer, solo el dueño puede editar
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Matches: públicas son visibles para todos; privadas solo con invite_code
create policy "matches_select_public" on public.matches
  for select using (is_public = true or creator_id = auth.uid());

create policy "matches_insert" on public.matches
  for insert with check (auth.uid() = creator_id);

create policy "matches_update_own" on public.matches
  for update using (auth.uid() = creator_id);

-- Match players: cualquiera puede ver, usuarios autenticados pueden insertarse
create policy "match_players_select" on public.match_players for select using (true);
create policy "match_players_insert" on public.match_players
  for insert with check (auth.uid() = player_id);
create policy "match_players_delete" on public.match_players
  for delete using (auth.uid() = player_id);

-- Habilitar Realtime en matches y match_players
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_players;
