-- Run this after supabase_admin_security.sql in Supabase SQL Editor.
-- Replace the email below with the email used for your CampusCart account.
-- Keep the replacement in Supabase SQL Editor; do not commit a personalized copy.

do $$
declare
  owner_user_id uuid;
begin
  select id into owner_user_id
  from auth.users
  where lower(email) = lower('oniolamide999@gmail.com');

  if owner_user_id is null then
    raise exception 'No Supabase Auth user found for the supplied email';
  end if;

  insert into public.admin_users (user_id)
  values (owner_user_id)
  on conflict (user_id) do nothing;
end;
$$;
