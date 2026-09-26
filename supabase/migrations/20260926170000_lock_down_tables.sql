-- Lock down tables that the public anon key (shipped to every browser) could read and write freely.
-- The app only touches these from the server (API routes use the service role, which bypasses RLS)
-- and from middleware.ts (as the logged-in user, reading only their own profile).
-- Apply AFTER deploying the middleware.ts change that sends the user's token with the profile query.

-- access codes: anyone could list every unused code or mark codes used. Server-only from now on.
alter table public.access_codes enable row level security;
revoke all on public.access_codes from anon, authenticated;

-- profiles: anyone could set their own (or anyone's) access_until and skip paying.
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
revoke insert, update, delete, truncate on public.profiles from authenticated;
create policy "Users can read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

-- flashcards: readable by everyone, writable by no client.
alter table public.flashcards enable row level security;
revoke insert, update, delete, truncate on public.flashcards from anon, authenticated;
create policy "Flashcards are viewable by everyone" on public.flashcards
  for select using (true);

-- storage: anyone, even logged out, could upload files into the public "resources" bucket.
drop policy if exists "Public Upload" on storage.objects;

-- signup trigger: pin search_path (it only uses schema-qualified names)
alter function public.handle_new_user() set search_path = '';
