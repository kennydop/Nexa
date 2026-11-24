-- UCC learning platform: catalogue, learning materials, past questions,
-- course discussions, bookmarks and profiles.
-- Anyone (including signed-out visitors) can read; signed-in users contribute.

create extension if not exists pg_trgm;

-- ---------- Catalogue ----------
create table public.colleges (
  id text primary key,
  name text not null,
  short text not null,
  color text not null check (color in ('ember','lime','sky','violet','rose','gold','mint')),
  sort int not null default 0
);

create table public.departments (
  id text primary key,
  college_id text not null references public.colleges(id) on delete cascade,
  faculty text not null,
  name text not null
);
create index departments_college_idx on public.departments(college_id);

create table public.programs (
  id text primary key,
  department_id text not null references public.departments(id) on delete cascade,
  college_id text not null references public.colleges(id) on delete cascade,
  name text not null,
  degree text not null,
  award_level text not null check (award_level in ('diploma','undergraduate','postgraduate')),
  levels int[] not null default '{100,200,300,400}'
);
create index programs_college_idx on public.programs(college_id);
create index programs_department_idx on public.programs(department_id);
create index programs_name_trgm on public.programs using gin (name gin_trgm_ops);

create table public.courses (
  id text primary key,
  code text not null unique,
  title text not null,
  credit_hours int,
  description text
);
create index courses_title_trgm on public.courses using gin (title gin_trgm_ops);
create index courses_code_trgm on public.courses using gin (code gin_trgm_ops);

create table public.program_courses (
  program_id text not null references public.programs(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  level int not null check (level between 100 and 900),
  semester smallint not null check (semester in (1,2)),
  primary key (program_id, course_id)
);
create index program_courses_course_idx on public.program_courses(course_id);

-- ---------- People ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  role text not null default 'visitor' check (role in ('student','lecturer','visitor')),
  program_id text references public.programs(id) on delete set null,
  level int check (level between 100 and 900),
  is_moderator boolean not null default false,
  -- Set by moderators only; the "Lecturer" badge is shown only when true.
  is_verified_lecturer boolean not null default false,
  created_at timestamptz not null default now()
);

-- A profile row is created with every sign-up; name comes from sign-up metadata.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- Never let a bad name abort the sign-up: fall back and clamp to the check's bounds.
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    (select left(rpad(n, greatest(length(n), 2), '.'), 80) from coalesce(
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'UCC learner') as n),
    case when new.raw_user_meta_data->>'role' in ('student','lecturer','visitor')
         then new.raw_user_meta_data->>'role' else 'visitor' end
  );
  return new;
end $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create index profiles_program_idx on public.profiles(program_id);

-- ---------- Contributions ----------
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  kind text not null check (kind in ('slides','notes','book','video','link')),
  title text not null check (char_length(title) between 3 and 140),
  file_path text,
  url text,
  uploaded_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  check (file_path is not null or (url is not null and url ~ '^https://'))
);
create index materials_course_idx on public.materials(course_id, created_at desc);
create index materials_uploader_idx on public.materials(uploaded_by);

create table public.past_questions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  year int not null check (year between 1962 and 2100),
  semester smallint not null check (semester in (1,2)),
  exam_type text not null check (exam_type in ('end_of_semester','mid_semester','quiz')),
  file_path text not null,
  uploaded_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);
create index past_questions_course_idx on public.past_questions(course_id, year desc);
create index past_questions_uploader_idx on public.past_questions(uploaded_by);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  parent_id uuid references public.posts(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  rating smallint check (rating between 1 and 5),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now(),
  check (parent_id is null or rating is null)
);
create index posts_course_idx on public.posts(course_id, created_at desc) where parent_id is null;
create index posts_parent_idx on public.posts(parent_id, created_at);
create index posts_author_idx on public.posts(author_id);
-- One rating per person per course, so averages can't be stuffed.
create unique index posts_one_rating on public.posts(course_id, author_id) where rating is not null;

create table public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, user_id)
);
create index post_votes_user_idx on public.post_votes(user_id);

create table public.bookmarks (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
create index bookmarks_course_idx on public.bookmarks(course_id);

-- Replies are one level deep, in the same course, under a visible post.
-- (A trigger rather than a policy: a posts policy that queries posts recurses.)
create function public.check_reply_parent() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.posts p
    where p.id = new.parent_id and p.course_id = new.course_id
      and p.parent_id is null and p.status = 'published'
  ) then
    raise exception 'Replies must answer a visible top-level post in the same course'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;
revoke execute on function public.check_reply_parent() from public, anon, authenticated;

create trigger posts_reply_parent before insert or update of parent_id, course_id on public.posts
  for each row execute function public.check_reply_parent();

-- ---------- Read models ----------
create view public.post_feed with (security_invoker = true) as
select
  p.id, p.course_id, p.parent_id, p.body, p.rating, p.created_at,
  pr.full_name as author_name, pr.role as author_role, pr.is_verified_lecturer as author_verified,
  coalesce((select sum(v.value) from public.post_votes v where v.post_id = p.id), 0)::int as score,
  coalesce((select v.value from public.post_votes v where v.post_id = p.id and v.user_id = auth.uid()), 0)::int as my_vote,
  (select count(*) from public.posts r where r.parent_id = p.id and r.status = 'published')::int as reply_count
from public.posts p
join public.profiles pr on pr.id = p.author_id
where p.status = 'published';

create view public.course_stats with (security_invoker = true) as
select
  c.id as course_id,
  (select count(*) from public.materials m where m.course_id = c.id and m.status = 'published')::int as materials,
  (select count(*) from public.past_questions q where q.course_id = c.id and q.status = 'published')::int as past_questions,
  (select count(*) from public.posts p where p.course_id = c.id and p.parent_id is null and p.status = 'published')::int as posts,
  (select avg(p.rating) from public.posts p where p.course_id = c.id and p.parent_id is null and p.rating is not null and p.status = 'published')::float as avg_rating,
  (select count(p.rating) from public.posts p where p.course_id = c.id and p.parent_id is null and p.status = 'published')::int as rating_count
from public.courses c;

-- ---------- Row level security ----------
create function public.is_moderator() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_moderator from public.profiles where id = auth.uid()), false)
$$;

alter table public.colleges enable row level security;
alter table public.departments enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.program_courses enable row level security;
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.past_questions enable row level security;
alter table public.posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.bookmarks enable row level security;

-- Catalogue: public read; writes only via service role / SQL editor.
create policy "catalogue readable" on public.colleges for select using (true);
create policy "catalogue readable" on public.departments for select using (true);
create policy "catalogue readable" on public.programs for select using (true);
create policy "catalogue readable" on public.courses for select using (true);
create policy "catalogue readable" on public.program_courses for select using (true);

create policy "profiles readable" on public.profiles for select using (true);
create policy "own profile editable" on public.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Users may only change these columns; is_moderator / is_verified_lecturer stay admin-only.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, role, program_id, level) on public.profiles to authenticated;

-- Contributions: everyone reads published rows; authors manage their own; moderators hide.
create policy "published readable" on public.materials for select
  using (status = 'published' or uploaded_by = (select auth.uid()) or (select public.is_moderator()));
create policy "signed-in can add" on public.materials for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and status = 'published'
  and (file_path is null or (split_part(file_path, '/', 1) = (select auth.uid())::text
       and file_path !~ '(^|/)\.\.(/|$)')));
create policy "author or moderator deletes" on public.materials for delete
  using (uploaded_by = (select auth.uid()) or (select public.is_moderator()));
create policy "moderator updates" on public.materials for update using ((select public.is_moderator()));

create policy "published readable" on public.past_questions for select
  using (status = 'published' or uploaded_by = (select auth.uid()) or (select public.is_moderator()));
create policy "signed-in can add" on public.past_questions for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and status = 'published'
  and (file_path is null or (split_part(file_path, '/', 1) = (select auth.uid())::text
       and file_path !~ '(^|/)\.\.(/|$)')));
create policy "author or moderator deletes" on public.past_questions for delete
  using (uploaded_by = (select auth.uid()) or (select public.is_moderator()));
create policy "moderator updates" on public.past_questions for update using ((select public.is_moderator()));

create policy "published readable" on public.posts for select
  using (status = 'published' or author_id = (select auth.uid()) or (select public.is_moderator()));
create policy "signed-in can post" on public.posts for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'published');
create policy "author or moderator deletes" on public.posts for delete
  using (author_id = (select auth.uid()) or (select public.is_moderator()));
create policy "moderator updates" on public.posts for update using ((select public.is_moderator()));

create policy "votes readable" on public.post_votes for select using (true);
create policy "own votes" on public.post_votes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own bookmarks" on public.bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-files', 'course-files', true, 26214400, array[
  'application/pdf','image/png','image/jpeg','image/webp',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint','application/msword'
])
on conflict (id) do nothing;

-- Files live under <user id>/<course id>/<file>; users write only inside their own folder.
-- The bucket is public, so downloads need no SELECT policy; omitting it stops file listing.
create policy "upload into own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'course-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
