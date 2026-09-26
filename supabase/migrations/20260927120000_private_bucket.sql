-- Lecture PDFs were downloadable by anyone: the bucket was public and every file URL ships in the
-- home page bundle. Files are now served by app/api/file as short-lived signed URLs, only after
-- middleware.ts has checked login + active access. Apply AFTER that code is deployed.
update storage.buckets set public = false where id = 'resources';

-- handle_new_user is only a signup trigger; nobody should call it over the REST API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
