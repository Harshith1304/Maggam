# Maggam | thoughts woven daily

A personal writing site by Harshith. Short writings on discipline, people, solitude and the roads between, one thread a day. Each piece is shown exactly as written, dated and signed, on a woven-cloth design with a 3D loom background.

## Features

- **Reader site**: thread pages with bite-sized paragraphs, per-paragraph text sizes, a downloadable image card for each closing line, light and dark mode, and a month-by-month ledger calendar that shows which days a thread was written.
- **Comments**: visitors can comment, reply and like comments without an account. They cannot write or change anything else.
- **Studio (owner only)**: a private area with notifications, comment moderation, and a composer for new threads (date picker, theme, cover picture from 30 illustrations or your own photo with zoom and reposition, paragraph sizes, closing lines, live preview).
- **Your own themes**: add custom colour themes with a name and a colour. They behave like the four built-in themes, which are fixed and cannot be edited or removed.
- **No database**: threads are markdown files; comments, themes and uploads are small files on disk.

## Tech

Next.js 16 (App Router), React 19, three.js, plain CSS. Node.js 20.9 or newer is required.

## Run it locally

```
npm install
```

Create your private login (prints a password once):

```
npm run setup
```

Start it:

```
npm run dev
```

Open http://localhost:3000. The Studio is at http://localhost:3000/admin/login. For the real, fast behaviour of a live site, use `npm run live` instead of `npm run dev`.

## Environment variables

Set these in `.env.local` locally, or in your host's settings online. Never commit `.env.local`.

| Variable | Needed | Purpose |
|---|---|---|
| `ADMIN_PASSWORD` | yes | The password for the Studio login |
| `SESSION_SECRET` | yes | Any random text of 32+ characters; signs the login cookie |
| `NEXT_PUBLIC_SITE_URL` | recommended | The public address of the site |
| `NEXT_PUBLIC_PORTFOLIO_URL` | optional | Adds a Portfolio link in the header and footer |
| `DATA_DIR` | optional | Where comments, themes and uploads are stored (default `./data`) |
| `CONTENT_DIR` | optional | Where threads are stored (default `./content/threads`) |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build |
| `npm start` | Serves the production build |
| `npm run live` | Build, then serve (the real, fast version) |
| `npm run setup` | Creates `.env.local` with a random login |
| `npm run carry -- "<old folder>"` | Copies threads, data and login from an older folder |
| `npm run new -- "Title"` | Creates a markdown template for a new thread |

## Writing a thread

Sign in at `/admin/login`, open the Studio, and press **Write a new thread**. Threads are saved in `content/threads/` as markdown files with a short header (title, date, theme, cover, closing lines). To hide a thread without deleting it, add `draft: true` under its date.

## Deploying

The site runs as a small Node.js server and saves files (`content/threads`, `data/comments.json`, `data/themes.json`, `data/uploads`). It therefore needs a host with a **persistent disk**, for example a VPS or an AWS EC2 server. Serverless hosts with a read-only filesystem (such as Vercel or Netlify) can show the site but cannot save new threads, comments or uploads.

On a server: install Node 20.9+, clone the repo, create `.env.local`, then run `npm install`, `npm run build`, `npm start`. Keep it running with pm2 and serve it over HTTPS (for example nginx plus Let's Encrypt). The login cookie is secure-only in production, so the Studio needs HTTPS. If you use a reverse proxy, forward the `Host` header and allow uploads of at least 10 MB. Back up `content/` and `data/` regularly.

## Security

- There is no SQL or database, so SQL injection does not apply.
- Login is rate-limited, compares the password in constant time, and uses a signed httpOnly cookie that lasts 14 days. Every `/api/admin` route and the Studio pages re-check it on the server.
- Uploads are accepted only from the owner, only as PNG, JPG, WebP or GIF (checked by the file's real contents, never SVG), up to 8 MB.
- Comments are plain text, limited in length and frequency, and protected by a hidden spam trap. The name "Harshith" is reserved.
- The four built-in themes cannot be changed through any route.

## Project structure

```
app/            pages and API routes (public site, /admin, /api, /art, /media)
components/     interface components (ledger, composer, theme dialog, comments, 3D background)
content/        your threads (markdown)
data/           comments, themes and uploads (created at runtime, not committed)
lib/            thread loading, colour engine, illustrations, storage, auth
scripts/        setup, carry, new-thread
proxy.js        first gate in front of /admin
```
