-- Moderators can add programmes to the catalogue, and seeded sample content can
-- point at the sample files the web app ships in /samples.

create policy "moderators add programmes" on public.programs for insert to authenticated
  with check ((select public.is_moderator()));
create policy "moderators edit programmes" on public.programs for update to authenticated
  using ((select public.is_moderator()));

-- Materials: an uploaded file, an https link, or one of the app's own sample files.
alter table public.materials drop constraint materials_check;
alter table public.materials add constraint materials_source_check
  check (file_path is not null or (url is not null and url ~ '^(https://|/samples/)'));

-- Past questions: an uploaded file, or (sample content only) one of the app's sample files.
alter table public.past_questions alter column file_path drop not null;
alter table public.past_questions add column url text;
alter table public.past_questions add constraint past_questions_source_check
  check (file_path is not null or (url is not null and url ~ '^/samples/[a-z0-9-]+\.(pdf|webp|png|jpg)$'));

-- The moderation queue shows the sample file when there is no upload.
create or replace view public.moderation_feed with (security_invoker = true) as
  select 'post'::text as kind, p.id, p.course_id, p.body as title, p.status, p.created_at,
         pr.full_name as author_name, null::text as file_path, null::text as url, null::text as mime_type
    from public.posts p join public.profiles pr on pr.id = p.author_id
  union all
  select 'material', m.id, m.course_id, m.title, m.status, m.created_at,
         pr.full_name, m.file_path, m.url, m.mime_type
    from public.materials m join public.profiles pr on pr.id = m.uploaded_by
  union all
  select 'past_question', q.id, q.course_id, q.year || ' semester ' || q.semester, q.status, q.created_at,
         pr.full_name, q.file_path, q.url, q.mime_type
    from public.past_questions q join public.profiles pr on pr.id = q.uploaded_by;
