-- Run this once in Supabase SQL Editor before deploying the admin access changes.
-- Admin membership is managed only by a trusted database administrator.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read their own admin membership" on public.admin_users;
create policy "Admins can read their own admin membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    -- New signups cannot assign themselves administrator, editor, or author roles.
    if not exists (select 1 from public.admin_users where user_id = new.id)
       and new.role not in ('customer', 'seller') then
      new.role := 'customer';
    end if;
  elsif new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only the project administrator can change account roles';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_role_insert on public.profiles;
create trigger profiles_guard_role_insert
  before insert on public.profiles
  for each row execute function public.guard_profile_role();

drop trigger if exists profiles_guard_role_update on public.profiles;
create trigger profiles_guard_role_update
  before update of role on public.profiles
  for each row execute function public.guard_profile_role();

