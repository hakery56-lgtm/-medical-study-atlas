-- Visitors get an anonymous "guest" account while login is off; number them Guest 1, Guest 2, ...
create sequence if not exists public.guest_number_seq;
revoke all on sequence public.guest_number_seq from public, anon, authenticated;

alter table public.profiles add column if not exists guest_number bigint unique;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, access_until, guest_number)
  values (
    new.id,
    new.email,
    now(),
    case when new.is_anonymous then nextval('public.guest_number_seq') end
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
