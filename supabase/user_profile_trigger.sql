-- À exécuter dans Supabase → SQL Editor.
-- Ne supprime aucune donnée existante.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profile (id, first_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.user_profile enable row level security;

drop policy if exists "user_profile_select_own" on public.user_profile;
create policy "user_profile_select_own"
on public.user_profile
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "user_profile_update_own" on public.user_profile;
create policy "user_profile_update_own"
on public.user_profile
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
