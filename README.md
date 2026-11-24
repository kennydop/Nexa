# Nexa · UCC learning hub

An installable progressive web app (PWA) for the University of Cape Coast. It lists every programme with its levels and courses, and gives each course its own learning materials, past questions and discussion. Anyone can browse without an account: students, lecturers and people outside UCC. Signing in is only needed to post, rate, vote, save courses or upload.

## Stack

| Concern | Choice |
| --- | --- |
| App | React 19 + TypeScript, Vite 8, React Router |
| PWA | `vite-plugin-pwa` (Workbox): offline shell, cached catalogue, cached course files |
| Backend | Supabase (Postgres, Auth, Storage, row-level security) |
| Data fetching | TanStack Query (caching, optimistic votes and bookmarks) |
| Components | Radix primitives (Tabs, Select, Toggle Group, Avatar, Label), Vaul bottom sheets, Sonner toasts |
| Icons | Phosphor, duotone weight app-wide |
| Styling | Tailwind CSS v4 with design tokens in `src/index.css`, Bricolage Grotesque + Manrope (self-hosted) |
| Motion | Motion (Framer Motion); respects reduced-motion |
| In-app viewer | PDF.js for PDFs (lazy-loaded), native image and video, YouTube embeds |

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

With `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`, the app uses Supabase. Without them it runs offline against the bundled catalogue and sample content, keeping changes in the browser (handy for development; nothing in the UI announces it).

## Sample content

`src/data/seed/content.ts` holds the sample discussions (59 threads, 161 posts, weighted towards CMS 107/108, ILT 101, MAT 101 and PHY 101), materials and past questions, written by 22 fictional people. The same file feeds both the offline mode and the Supabase seed:

- `pnpm db:sql` regenerates `supabase/seed-content.sql` and `supabase/setup.sql`.
- Sample accounts use the reserved domain `@sample.nexa.invalid`, so no real person can own those addresses and nobody can sign in as them.
- `supabase/remove-sample-content.sql` deletes every sample account and everything they posted.
- The sample files live in `public/samples` (regenerate with `pnpm sample-files`, needs `ffmpeg`). Each one says it is not an official UCC document, because the questions are invented.

## Verification

People are verified by their institutional email address:

| Email | Result after the address is confirmed |
| --- | --- |
| `…@stu.ucc.edu.gh` | Verified student ("UCC student" badge) |
| `…@ucc.edu.gh` | Verified lecturer ("Lecturer" badge) |
| anything else | Visitor; can say they are a UCC student or lecturer, which puts them in the moderators' review queue |

The domain must match exactly, so lookalikes such as `ucc.edu.gh.evil.com` are rejected. Verification happens in a database trigger when Supabase marks the email confirmed, so **"Confirm email" must stay on** in Supabase Auth settings. Users cannot change their own role or verification; only the trigger and moderators can.

## Moderator portal

`/moderate`, linked from the Me tab for moderators:

- **People**: review queue for people who say they are UCC staff or students without a UCC email. Verify, decline, change roles, and grant or remove moderator access (you cannot remove your own).
- **Content**: every post, material and past question, newest first. Open files in the viewer, hide or unhide, or delete permanently.
- **Upload**: find any course and add materials (files, videos, YouTube links) or past questions.
- **Catalogue**: create new programmes (college, department, award, levels) and add or remove courses in any programme by level and semester.

## In-app viewer

PDFs, images and videos open full-screen inside the app, with download and open-in-browser buttons. PDF pages render lazily with zoom. YouTube links play through `youtube-nocookie.com`. Other links open in the browser. Opened PDFs and images are cached for offline reading; videos stream and are not cached.

## Connect Supabase

1. In the Supabase dashboard, open **SQL Editor**, paste all of `supabase/setup.sql` and run it once. It creates the schema, loads the UCC catalogue and the sample content. (With the Supabase CLI you can instead run `supabase db push` for `supabase/migrations`, then the two seed files.)
2. Put the project URL and publishable key in `.env.local` (see `.env.example`).
3. In **Authentication → Sign In / Providers → Email**, keep "Confirm email" on. Verification depends on it.
4. In **Authentication → URL Configuration**, set the Site URL to the deployed address and add it to Redirect URLs.
5. Sign up in the app, then make yourself the first moderator in the SQL editor:
   ```sql
   update public.profiles set is_moderator = true
   where id = (select id from auth.users where email = 'you@ucc.edu.gh');
   ```
   After that, moderators promote others from the portal.
6. Supabase's built-in email sender only sends a few emails an hour. Before launch, add your own SMTP server under **Authentication → Emails**.

## Deploy to Vercel

Import the GitHub repository in Vercel (framework: Vite; `vercel.json` sets the build, SPA routing, cache rules and security headers including a strict Content Security Policy). Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables, deploy, then put the Vercel address into Supabase's URL Configuration (step 4 above).

The CSP allows the inline theme script in `index.html` by hash. If you edit that script, update the hash in `vercel.json`; `tests/csp.test.ts` fails until you do.

### Security model

- The catalogue tables can be read by everyone and written only with the service role.
- Contributions can be read by everyone when `published`. Signed-in users can insert rows as themselves, and can delete only their own rows.
- Storage bucket `course-files` (PDF/Office/images up to 25 MB, MP4/WebM/MOV video up to 50 MB): each user can write and delete only inside `<their uid>/…`, moderators can delete any file, and nobody can list other people's files.
- Users can update only their name, programme and level. Role, verification and moderator status are set by the email trigger or by moderator-only `security definer` functions (`admin_list_people`, `admin_set_verification`, `admin_set_moderator`).
- Hidden content leaves public lists, but an uploaded file stays reachable at its public storage URL until a moderator deletes the item, which also removes the file.
- Each person can rate a course once. Replies are one level deep and must be in the same course; a trigger enforces this.
- An uploaded file's path must sit in the uploader's own folder.
- These rules were tested against Postgres 18 with Supabase's `auth` and `storage` schemas stubbed out.

## UCC catalogue data

`data/ucc-catalog.json` was researched from UCC's official admissions catalogue (admissions.ucc.edu.gh/catalogue). Its `sources` and `notes` fields record where each part came from and any caveats. It contains 5 colleges plus university-wide units, 109 departments, 533 programmes (undergraduate, postgraduate and diploma) and 752 course entries.

Only some programmes have published course lists. These have full Level 100–400 lists: Computer Engineering, Nursing, Applied Economics, BA Arts, Economics with Finance and Accounting. Programmes without a published list show an honest "not published yet" state. To add more:

```bash
# edit data/ucc-catalog.json, then regenerate both outputs:
node scripts/build-catalog.mjs   # → src/data/demo/catalog.json + supabase/seed.sql
pnpm db:sql                      # → supabase/setup.sql
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Develop, build, serve the production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright end-to-end tests at phone size, always in offline mode with production headers |
| `pnpm lint` | oxlint |
| `node scripts/generate-icons.mjs` | Regenerate PWA/iOS icons from `brand/mark.svg` |
| `pnpm sample-files` | Regenerate the sample PDFs, images and video in `public/samples` |
| `pnpm db:sql` | Regenerate `supabase/seed-content.sql` and `supabase/setup.sql` |
| `node scripts/screens.mjs <dir>` | Screenshot key screens in light and dark |

## Renaming the app

The name is set in `src/lib/brand.ts`, `vite.config.ts` (`APP_NAME`) and `index.html`.

## Brand

`brand/logo-original.jpeg` is the supplied logo. `brand/mark.svg` is a vector redraw of its mark, used for the app icons. If an original vector exists, replace `mark.svg` with it and rerun the icon script.
