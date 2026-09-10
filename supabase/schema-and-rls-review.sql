-- =============================================================================
-- Tâche 7 — Relecture schéma + RLS
-- À coller manuellement dans Supabase → SQL Editor, après lecture.
--
-- Ce script :
--   - n’utilise PAS service_role
--   - ne DROP aucune table
--   - ne TRUNCATE / DELETE aucune ligne
--   - ne vide aucune donnée
--   - peut DROP POLICY (les policies, pas les données) puis les recréer
--   - ajoute seulement les contraintes / index / grants manquants
--
-- Si ADD CONSTRAINT échoue (doublons, type incompatible), le script s’arrête.
-- Inspecte alors les lignes concernées : ne pas supprimer en masse sans relecture.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Tables : créer seulement si elles n’existent pas encore
--    restaurants est déjà créée dans le projet ; on ne la recrée pas.
-- -----------------------------------------------------------------------------

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  email text
);

-- user_favori / user_comments : création alignée sur database.types.ts
-- et sur la clé primaire réelle de restaurants (restaurant_id uuid).

do $$
declare
  pk_col text;
  pk_type text;
  pk_count integer;
begin
  if to_regclass('public.restaurants') is null then
    raise exception 'La table public.restaurants est introuvable.';
  end if;

  select count(*)
  into pk_count
  from pg_index i
  join pg_class c on c.oid = i.indrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'restaurants'
    and i.indisprimary;

  if pk_count = 0 then
    raise exception 'public.restaurants n’a pas de clé primaire.';
  end if;

  select a.attname, format_type(a.atttypid, a.atttypmod)
  into pk_col, pk_type
  from pg_index i
  join pg_attribute a
    on a.attrelid = i.indrelid
   and a.attnum = any (i.indkey)
  join pg_class c on c.oid = i.indrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'restaurants'
    and i.indisprimary;

  if pk_count > 1 then
    raise exception 'La clé primaire de restaurants a plusieurs colonnes.';
  end if;

  raise notice 'PK restaurants = % (%)', pk_col, pk_type;

  execute format(
    'create table if not exists public.user_favori (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users (id) on delete cascade,
      restaurant_id %s not null references public.restaurants (%I) on delete cascade,
      created_at timestamptz not null default now(),
      constraint user_favori_user_restaurant_unique unique (user_id, restaurant_id)
    )',
    pk_type,
    pk_col
  );

  execute format(
    'create table if not exists public.user_comments (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users (id) on delete cascade,
      restaurant_id %s not null references public.restaurants (%I) on delete cascade,
      content text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint user_comments_content_not_blank check (char_length(trim(content)) > 0)
    )',
    pk_type,
    pk_col
  );
end
$$;

-- -----------------------------------------------------------------------------
-- 2) Contraintes manquantes si les tables existaient déjà
--    (CREATE TABLE IF NOT EXISTS ne répare pas une table trop ancienne)
-- -----------------------------------------------------------------------------

do $$
declare
  pk_col text;
  pk_type text;
begin
  select a.attname, format_type(a.atttypid, a.atttypmod)
  into pk_col, pk_type
  from pg_index i
  join pg_attribute a
    on a.attrelid = i.indrelid
   and a.attnum = any (i.indkey)
  join pg_class c on c.oid = i.indrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'restaurants'
    and i.indisprimary;

  -- user_profiles.id → auth.users(id) ON DELETE CASCADE
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%auth.users%'
  ) then
    alter table public.user_profiles
      add constraint user_profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  end if;

  -- user_favori.user_id → auth.users(id) ON DELETE CASCADE
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_favori'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%auth.users%'
  ) then
    alter table public.user_favori
      add constraint user_favori_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;

  -- user_favori.restaurant_id → restaurants(PK) ON DELETE CASCADE
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_favori'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%restaurants%'
  ) then
    execute format(
      'alter table public.user_favori
         add constraint user_favori_restaurant_id_fkey
         foreign key (restaurant_id) references public.restaurants (%I) on delete cascade',
      pk_col
    );
  end if;

  -- UNIQUE(user_id, restaurant_id) : un utilisateur ne peut favoriser qu’une fois
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_favori'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) ilike '%user_id%'
      and pg_get_constraintdef(oid) ilike '%restaurant_id%'
  ) then
    alter table public.user_favori
      add constraint user_favori_user_restaurant_unique
      unique (user_id, restaurant_id);
  end if;

  -- user_comments.user_id → auth.users(id) ON DELETE CASCADE
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_comments'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%auth.users%'
  ) then
    alter table public.user_comments
      add constraint user_comments_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
  end if;

  -- user_comments.restaurant_id → restaurants(PK) ON DELETE CASCADE
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_comments'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) ilike '%restaurants%'
  ) then
    execute format(
      'alter table public.user_comments
         add constraint user_comments_restaurant_id_fkey
         foreign key (restaurant_id) references public.restaurants (%I) on delete cascade',
      pk_col
    );
  end if;
end
$$;

create index if not exists user_favori_user_id_idx
  on public.user_favori (user_id);

create index if not exists user_comments_restaurant_id_idx
  on public.user_comments (restaurant_id);

create index if not exists user_comments_user_id_idx
  on public.user_comments (user_id);

-- -----------------------------------------------------------------------------
-- 3) Activer RLS sur les 4 tables
-- -----------------------------------------------------------------------------

alter table public.restaurants enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_favori enable row level security;
alter table public.user_comments enable row level security;

-- -----------------------------------------------------------------------------
-- 4) Policies
--    DROP POLICY n’efface pas les lignes. On unifie les policies des 2 fichiers
--    SQL précédents (user_profile_trigger.sql + supabase-schema-user-interactions.sql).
-- -----------------------------------------------------------------------------

-- restaurants : lecture publique. Pas d’INSERT / UPDATE / DELETE côté anon/authenticated.
drop policy if exists "restaurants_select_public" on public.restaurants;
create policy "restaurants_select_public"
on public.restaurants
for select
to anon, authenticated
using (true);

-- user_profiles
-- SELECT public nécessaire pour afficher le prénom des auteurs d’avis.
-- RLS est au niveau ligne : un client pourrait aussi demander email.
-- L’app ne sélectionne email que pour le profil connecté.
drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_select_names" on public.user_profiles;
drop policy if exists "user_profiles_select_public" on public.user_profiles;
create policy "user_profiles_select_public"
on public.user_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- user_favori : uniquement ses propres lignes. Pas d’UPDATE (l’app insert/delete).
drop policy if exists "user_favori_select_own" on public.user_favori;
create policy "user_favori_select_own"
on public.user_favori
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_favori_insert_own" on public.user_favori;
create policy "user_favori_insert_own"
on public.user_favori
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_favori_delete_own" on public.user_favori;
create policy "user_favori_delete_own"
on public.user_favori
for delete
to authenticated
using (auth.uid() = user_id);

-- user_comments : lecture publique ; écriture uniquement de ses propres avis.
drop policy if exists "user_comments_select_all" on public.user_comments;
create policy "user_comments_select_all"
on public.user_comments
for select
to anon, authenticated
using (true);

drop policy if exists "user_comments_insert_own" on public.user_comments;
create policy "user_comments_insert_own"
on public.user_comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_comments_update_own" on public.user_comments;
create policy "user_comments_update_own"
on public.user_comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_comments_delete_own" on public.user_comments;
create policy "user_comments_delete_own"
on public.user_comments
for delete
to authenticated
using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5) Grants (pas de service_role)
-- -----------------------------------------------------------------------------

grant select on public.restaurants to anon, authenticated;
revoke insert, update, delete on public.restaurants from anon, authenticated;

grant select on public.user_profiles to anon, authenticated;
grant insert, update on public.user_profiles to authenticated;

grant select, insert, delete on public.user_favori to authenticated;

grant select on public.user_comments to anon, authenticated;
grant insert, update, delete on public.user_comments to authenticated;

-- -----------------------------------------------------------------------------
-- 6) Vérification en lecture seule (à relire dans les résultats)
-- -----------------------------------------------------------------------------

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('restaurants', 'user_profiles', 'user_favori', 'user_comments')
order by c.relname;

select
  conrelid::regclass as table_name,
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (
  'public.restaurants'::regclass,
  'public.user_profiles'::regclass,
  'public.user_favori'::regclass,
  'public.user_comments'::regclass
)
order by table_name, contype, conname;

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname = 'public'
  and tablename in ('restaurants', 'user_profiles', 'user_favori', 'user_comments')
order by tablename, cmd, policyname;
