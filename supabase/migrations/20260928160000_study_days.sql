-- Daily study streak, saved per account (was per-browser localStorage).
-- One row per user per local calendar day on which they opened a lecture or quiz.
create table public.study_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

alter table public.study_days enable row level security;
revoke all on public.study_days from anon, authenticated;
grant select, insert on public.study_days to authenticated;

create policy "Users read their own study days" on public.study_days
  for select to authenticated using ((select auth.uid()) = user_id);

-- the day comes from the user's local clock, so allow up to tomorrow (time zones);
-- past days are allowed so a streak kept in the browser can be moved onto the account
create policy "Users add their own study days" on public.study_days
  for insert to authenticated
  with check ((select auth.uid()) = user_id and day <= current_date + 1);
