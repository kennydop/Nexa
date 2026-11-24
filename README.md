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

When no Supabase keys are set, the app runs in **demo mode**. It uses the full bundled UCC catalogue, and any posts, votes, bookmarks and uploads are kept in that browser only. A banner shows that demo mode is on.

Demo mode comes preloaded with sample discussions (MAT 105, GEN 103, GEN 105, CMS 107, ACC 101, NUR 101, ECO 101), materials, past questions and a people directory. All people are fictional. The sample files in `public/demo` (PDFs, two images and a short video) are stamped "not an official UCC document"; regenerate them with `pnpm demo-assets` (needs `ffmpeg`). In demo mode any password works:

- Any `@stu.ucc.edu.gh` address signs you in as a verified student; any `@ucc.edu.gh` address as a verified lecturer.
- `moderator@ucc.edu.gh` also opens the **moderator portal** (Me → Moderator portal, or `/moderate`).

The sample content lives only in demo mode. It is not part of `supabase/seed.sql`.

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
- **Courses**: add or remove courses in any programme's curriculum by level and semester, for the many programmes with no published list.

## In-app viewer

PDFs, images and videos open full-screen inside the app, with download and open-in-browser buttons. PDF pages render lazily with zoom. YouTube links play through `youtube-nocookie.com`. Other links open in the browser. Opened PDFs and images are cached for offline reading; videos stream and are not cached.

## Connect Supabase

1. Create a project at supabase.com.
2. Apply the schema and load the catalogue:
   ```bash
   supabase link --project-ref <ref>
   supabase db push                                    # supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql           # or paste it into the SQL editor
   ```
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In Auth settings, keep "Confirm email" on and add your site URL so confirmation emails link back to the app.
5. Make the first moderator in the SQL editor: `update profiles set is_moderator = true where id = '<user uuid>';` After that, moderators can promote others from the portal.

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
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm preview` | Develop, build, serve the production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright end-to-end tests at phone size (runs against `pnpm preview`) |
| `pnpm lint` | oxlint |
| `node scripts/generate-icons.mjs` | Regenerate PWA/iOS icons from `brand/mark.svg` |
| `pnpm demo-assets` | Regenerate the demo PDFs, images and video in `public/demo` |
| `node scripts/screens.mjs <dir>` | Screenshot key screens in light and dark |

## Renaming the app

The name is set in `src/lib/brand.ts`, `vite.config.ts` (`APP_NAME`) and `index.html`.

## Brand

`brand/logo-original.jpeg` is the supplied logo. `brand/mark.svg` is a vector redraw of its mark, used for the app icons. If an original vector exists, replace `mark.svg` with it and rerun the icon script.
