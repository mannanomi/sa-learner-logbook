-- Lets an authenticated user delete their own auth.users row (and, via FK
-- cascade, their profile/supervisors/driving_sessions). SECURITY DEFINER is
-- required because deleting from auth.users needs elevated privileges, but
-- the function only ever acts on auth.uid() — it cannot delete anyone else.
create or replace function public.delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer set search_path = public, auth;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
