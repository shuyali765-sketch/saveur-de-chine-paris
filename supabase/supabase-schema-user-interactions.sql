-- À coller dans Supabase → SQL Editor → New query → Run.
-- Ne supprime aucune table existante.
--
-- Ton erreur 42703 signifie : public.restaurants n’a PAS de colonne id.
-- Ce script lit la vraie clé primaire, puis crée user_favori et user_comments.

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
    raise exception 'La table public.restaurants n’a pas de clé primaire. Ajoute-en une dans Table Editor, ou envoie-moi la liste des colonnes.';
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
    raise exception 'La clé primaire de restaurants a plusieurs colonnes (%). Envoie-moi une capture de Table Editor.', pk_col;
  end if;

  raise notice 'Clé primaire de restaurants : % (%)', pk_col, pk_type;

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

create index if not exists user_favori_user_id_idx
  on public.user_favori (user_id);

create index if not exists user_comments_restaurant_id_idx
  on public.user_comments (restaurant_id);

alter table public.restaurants enable row level security;
alter table public.user_favori enable row level security;
alter table public.user_comments enable row level security;

drop policy if exists "restaurants_select_public" on public.restaurants;
create policy "restaurants_select_public"
on public.restaurants
for select
to anon, authenticated
using (true);

drop policy if exists "user_profiles_select_names" on public.user_profiles;
create policy "user_profiles_select_names"
on public.user_profiles
for select
to anon, authenticated
using (true);

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

grant select, insert, delete on public.user_favori to authenticated;
grant select on public.user_comments to anon, authenticated;
grant insert, update, delete on public.user_comments to authenticated;

select
  c.relname as table_name,
  a.attname as primary_key,
  format_type(a.atttypid, a.atttypmod) as primary_key_type
from pg_index i
join pg_attribute a
  on a.attrelid = i.indrelid
 and a.attnum = any (i.indkey)
join pg_class c on c.oid = i.indrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'restaurants'
  and i.indisprimary;
