-- Explicit API privileges. Newer Supabase projects no longer grant the `anon` and
-- `authenticated` roles access to new tables automatically. Row-level security
-- still decides which rows each person can read or change; these grants only
-- open the doors that the policies then guard.

grant usage on schema public to anon, authenticated;

-- Catalogue: everyone reads; moderators edit (policies restrict writes to moderators).
grant select on public.colleges, public.departments, public.programs, public.courses, public.program_courses
  to anon, authenticated;
grant insert, update on public.programs, public.courses to authenticated;
grant insert, update, delete on public.program_courses to authenticated;

-- People: public names and badges. Updates stay limited to the columns granted earlier.
grant select on public.profiles to anon, authenticated;

-- Contributions.
grant select on public.materials, public.past_questions, public.posts, public.post_votes to anon, authenticated;
grant insert, update, delete on public.materials, public.past_questions, public.posts to authenticated;
grant insert, update, delete on public.post_votes to authenticated;
grant select, insert, delete on public.bookmarks to authenticated;

-- Read models.
grant select on public.post_feed, public.course_stats to anon, authenticated;
grant select on public.moderation_feed to authenticated;

-- Functions used inside policies and by the app.
grant execute on function public.is_moderator() to anon, authenticated;
grant execute on function public.institutional_role(text) to anon, authenticated;
grant execute on function public.require_moderator() to authenticated;
