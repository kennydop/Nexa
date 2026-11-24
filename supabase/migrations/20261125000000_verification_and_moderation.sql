-- Institutional-email verification, file metadata for the in-app viewer,
-- and moderator tooling (verification queue, content moderation, curriculum).

-- ---------- Verification ----------
-- is_verified now means "verified UCC member" (student or lecturer), whether by
-- a confirmed institutional email or by a moderator.
alter table public.profiles rename column is_verified_lecturer to is_verified;
alter table public.profiles
  add column verified_via text check (verified_via in ('email', 'moderator'));

-- Roles are decided by the email domain or a moderator, never by the user.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, program_id, level) on public.profiles to authenticated;

create function public.institutional_role(email text) returns text
language sql immutable set search_path = '' as $$
  select case lower(split_part(coalesce(email, ''), '@', 2))
    when 'stu.ucc.edu.gh' then 'student'
    when 'ucc.edu.gh' then 'lecturer'
    else null
  end
$$;

-- Applies (or withdraws) email-based verification once an address is confirmed.
create function public.sync_institutional_verification() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  derived text := public.institutional_role(new.email);
begin
  if new.email_confirmed_at is not null and derived is not null then
    update public.profiles
       set role = derived, is_verified = true, verified_via = 'email'
     where id = new.id;
  elsif derived is null then
    -- Email moved off a UCC domain: drop only email-based verification.
    update public.profiles
       set is_verified = false, verified_via = null
     where id = new.id and verified_via = 'email';
  end if;
  return new;
end $$;
revoke execute on function public.sync_institutional_verification() from public, anon, authenticated;

-- Runs after on_auth_user_created (trigger names fire alphabetically).
create trigger on_auth_user_verify after insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.sync_institutional_verification();

-- ---------- File metadata (lets the app pick the right in-app viewer) ----------
alter table public.materials add column mime_type text, add column size_bytes bigint;
alter table public.past_questions add column mime_type text, add column size_bytes bigint;

-- Videos play in the in-app viewer: allow them, with a 50 MB cap (files stay 25 MB in the app).
update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = allowed_mime_types || array['video/mp4', 'video/webm', 'video/quicktime']
 where id = 'course-files';

-- ---------- Moderator tooling ----------
-- Moderators manage the catalogue curriculum (many programmes have no published list).
create policy "moderators add courses" on public.courses for insert to authenticated
  with check ((select public.is_moderator()));
create policy "moderators edit courses" on public.courses for update to authenticated
  using ((select public.is_moderator()));
create policy "moderators add curriculum" on public.program_courses for insert to authenticated
  with check ((select public.is_moderator()));
create policy "moderators edit curriculum" on public.program_courses for update to authenticated
  using ((select public.is_moderator()));
create policy "moderators remove curriculum" on public.program_courses for delete to authenticated
  using ((select public.is_moderator()));

create function public.require_moderator() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_moderator() then
    raise exception 'Moderators only' using errcode = 'insufficient_privilege';
  end if;
end $$;

-- People directory for moderators (emails live in auth.users, never exposed publicly).
create function public.admin_list_people(search text default '', only_pending boolean default false)
returns table (
  id uuid, full_name text, email text, role text, is_verified boolean,
  verified_via text, is_moderator boolean, email_confirmed boolean, created_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.require_moderator();
  return query
    select p.id, p.full_name, u.email::text, p.role, p.is_verified, p.verified_via,
           p.is_moderator, u.email_confirmed_at is not null, p.created_at
      from public.profiles p
      join auth.users u on u.id = p.id
     where (coalesce(search, '') = ''
            or p.full_name ilike '%' || search || '%'
            or u.email ilike '%' || search || '%')
       and (not only_pending or (p.role in ('lecturer', 'student') and not p.is_verified))
     order by (p.role = 'lecturer' and not p.is_verified) desc, p.created_at desc
     limit 100;
end $$;

create function public.admin_set_verification(target uuid, verified boolean, new_role text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_moderator();
  if new_role not in ('student', 'lecturer', 'visitor') then
    raise exception 'Unknown role %', new_role using errcode = 'invalid_parameter_value';
  end if;
  update public.profiles
     set role = new_role,
         is_verified = verified and new_role <> 'visitor',
         verified_via = case when verified and new_role <> 'visitor' then 'moderator' end
   where id = target;
end $$;

create function public.admin_set_moderator(target uuid, value boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.require_moderator();
  if target = auth.uid() and not value then
    raise exception 'You cannot remove your own moderator access' using errcode = 'check_violation';
  end if;
  update public.profiles set is_moderator = value where id = target;
end $$;

revoke execute on function public.require_moderator() from public, anon;
revoke execute on function public.admin_list_people(text, boolean) from public, anon;
revoke execute on function public.admin_set_verification(uuid, boolean, text) from public, anon;
revoke execute on function public.admin_set_moderator(uuid, boolean) from public, anon;
grant execute on function public.admin_list_people(text, boolean) to authenticated;
grant execute on function public.admin_set_verification(uuid, boolean, text) to authenticated;
grant execute on function public.admin_set_moderator(uuid, boolean) to authenticated;

-- Moderation queue: newest contributions of every kind, including hidden ones.
create view public.moderation_feed with (security_invoker = true) as
  select 'post'::text as kind, p.id, p.course_id, p.body as title, p.status, p.created_at,
         pr.full_name as author_name, null::text as file_path, null::text as url, null::text as mime_type
    from public.posts p join public.profiles pr on pr.id = p.author_id
  union all
  select 'material', m.id, m.course_id, m.title, m.status, m.created_at,
         pr.full_name, m.file_path, m.url, m.mime_type
    from public.materials m join public.profiles pr on pr.id = m.uploaded_by
  union all
  select 'past_question', q.id, q.course_id, q.year || ' semester ' || q.semester, q.status, q.created_at,
         pr.full_name, q.file_path, null, q.mime_type
    from public.past_questions q join public.profiles pr on pr.id = q.uploaded_by;

-- Moderators can remove any uploaded file when they delete its material or past question.
create policy "moderators delete files" on storage.objects for delete to authenticated
  using (bucket_id = 'course-files' and (select public.is_moderator()));
-- Deleting through the Storage API needs SELECT as well as DELETE. Only uploaders
-- (their own folder) and moderators can see rows; nobody can list everyone's files.
create policy "see own files" on storage.objects for select to authenticated
  using (bucket_id = 'course-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "moderators see files" on storage.objects for select to authenticated
  using (bucket_id = 'course-files' and (select public.is_moderator()));
