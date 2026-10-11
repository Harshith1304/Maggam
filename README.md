# Maggam | thoughts woven daily

A personal writing site by Harshith. Next.js, three.js, plain CSS.

- **Visitors** can read, leave comments, reply and like comments. They cannot write or change anything.
- **You** have a private **Studio**: notifications, comment moderation, and a composer for new threads.

## First time in a new folder (Windows, PowerShell or cmd)

Install once:

    npm install

Then bring your work across from the old folder (your threads including new ones, comments, uploaded photos and your private login):

    npm run carry -- "C:\path\to\your\old\maggam"

No old folder? Create a fresh private login instead (it prints your password once):

    npm run setup

## Running it

While you are building and writing (first page loads are slower, see below):

    npm run dev

The real, fast version, exactly how it behaves when live (builds once, then serves):

    npm run live

Then open http://localhost:3000. The Studio is at /admin/login.

### Why `npm run dev` feels slow, and `npm run live` does not

`dev` compiles each page the first time you open it (the small "Rendering..." message), watches your files, and keeps extra checking switched on. A live site never does any of that. `npm run live` shows how the site really performs. On Windows, keeping the project outside `Downloads` (for example `C:\dev\maggam`) also makes `npm install` and `npm run dev` noticeably quicker, because antivirus scans fewer files.

### Messages you may see in the terminal or browser

- `Failed to connect to MetaMask` / `MetaMask extension not found`: comes from the MetaMask browser extension, not from this site. It is now kept out of the error overlay; to remove it from the console too, open the site in a profile or window without that extension.
- `Turbopack ... waiting for the filesystem to settle`: normal right after `npm install` while Windows finishes scanning thousands of new files. It stops on its own.
- `N` badge at the bottom-left: that was the Next.js developer badge (only exists in `npm run dev`, never on a live site). It is switched off. Real errors still show in the terminal and in the browser's error overlay.
- `4 moderate severity vulnerabilities` from `npm install`: removed in this version (`npm audit` reports 0). Do not run `npm audit fix --force`.

## The Studio (owner only)

1. Go to `/admin/login` and enter your password.
2. After signing in, a **Studio** button appears in the header, with a number badge for unread comments. Visitors never see it.
3. **Notifications**: every new comment and reply with the thread it belongs to. Open and reply, mark read, or delete.
4. **Write a new thread** opens the composer, laid out like a finished thread:
   - **date**: pick it in the site's own calendar. Days that already have a thread show as woven and cannot be chosen, future days are locked, and you cannot go before September 2026
   - the **theme** (dye colour): the four built-in themes are fixed, and you can add your own (see below)
   - **cover picture**: **Change picture** (any time, new thread or existing) to pick one of the 30 illustrations or **My photos > Upload from my files**; **Adjust** to zoom and reposition
   - **text size**: a base size for the thread, and a size for every paragraph with the A− / A / A+ / A++ buttons under the paragraph you are in
   - write the text: Enter starts a new paragraph, start a line with "- " for a list
   - one or two **closing lines**; each becomes the downloadable PNG card (with your cover and signature) and a Share button
   - **Preview** shows exactly what visitors get, then **Publish thread**
5. Publishing lights a new square in the ledger and raises the thread count straight away.
6. **Your threads** lists every thread with an **Edit** button (an edited thread keeps its web address and its comments).

Command-line alternative: `npm run new -- "Title"` creates a markdown template in `content/threads/`.

## Your own themes (dyes)

The four built-in themes (Discipline, People, Self, Roots & Roads) are fixed: they cannot be renamed, recoloured or removed. You can add your own:

1. In the composer, next to the theme buttons, press **+ New theme**. Or in the Studio, open **Your themes > New theme**.
2. Type a name, then pick a colour: tap one of the 24 quick colours, or slide **Colour / Richness / Brightness** (or type a colour code). The preview shows how a cover, a card and the theme button will look.
3. **Create theme.** It now has a dot on its button, exactly like the built-in ones, and a thread using it gets that colour on its cover picture, its card, its home-page tile and its downloadable image.
4. Every theme you add can be edited any time (pencil next to its button in the composer, or **Edit** in the Studio). Renaming or recolouring it updates every thread that uses it.
5. **Remove theme** asks which built-in theme to move its threads to, then removes it. Nothing else about those threads changes.

Rules: up to 20 custom themes, names up to 24 characters, no name that is already used (including the built-in names). The text colour on every theme is chosen automatically so it stays easy to read; if your colour sits right in the middle where neither light nor dark text would be clear, it is nudged slightly.

Your themes are stored in `data/themes.json`, and each thread also remembers its theme's colour, so a thread never loses its look.

## Keeping your password private (GitHub, Vercel and any host)

Your login lives only in a file called `.env.local` on your own computer.

1. `.env.local` is already listed in `.gitignore`, so Git never uploads it. **Upload with Git, not by drag-and-drop**: dragging a folder onto the GitHub website ignores `.gitignore` and would upload the password file.
2. Before the first upload, run `git add .` then `git status` and check that `.env.local` is NOT in the list. (`.env.example` is fine; it is empty.)
3. On your host, never upload the file. Type the values into the host's own settings page instead (Environment Variables): `ADMIN_PASSWORD`, `SESSION_SECRET` (any 32+ random characters; `npm run setup` makes one) and `NEXT_PUBLIC_SITE_URL`.
4. Use a new password for the live site. The first password was shared in a chat and in a download, so replace it.
5. If a password ever reaches GitHub: change it at once everywhere. Deleting the file afterwards does not remove it from the history.

## Putting it online (important)

Comments, likes, uploaded photos and new threads are saved as files (`data/` and `content/threads/`), so the site needs a host with a **persistent disk**:

- good: your own AWS EC2 server, any VPS, Render or Railway with a disk or volume attached, Fly.io with a volume
- not suitable: Vercel or Netlify serverless hosting (files written there disappear). Using Vercel would need a database and file storage service added first.

On a server: install Node 20+, copy this folder, set the environment values above, then run `npm install`, `npm run build`, `npm start` (keep it alive with pm2 and put HTTPS in front with nginx or a load balancer). Back up `data` and `content`: they hold your readers' comments, your photos and your writing.

Set `NEXT_PUBLIC_PORTFOLIO_URL` to show a "Portfolio" link in the header and footer.

## Security notes

- There is no database and no SQL anywhere, so SQL injection does not apply. The login compares your password in constant time, is rate-limited, and sets a signed httpOnly cookie that lasts 14 days. Without that cookie, `/admin` redirects to the login page and every `/api/admin` call answers 401.
- Every owner action is re-checked on the server; hiding a button is never the only protection.
- Uploads are accepted only from you, only as PNG, JPG, WebP or GIF (checked by the file's real contents, never SVG), up to 8 MB.
- Comments are plain text (no HTML), limited in length and frequency, protected by a hidden spam trap. Nobody else can use the name "Harshith".

## Where things live

- `content/threads/*.md`  your writing, one file per thread
- `data/comments.json`    comments and likes (created on first comment)
- `data/themes.json`      your own themes (created when you add the first one)
- `data/uploads/`         the cover photos you upload (served at /media/<id>/)
- `lib/art.js`            the 30 vector illustrations (served as cached pictures at /art/)
- `lib/dyes.js`           the four natural-dye palettes
- `components/LoomBackground.jsx`  the 3D woven-cloth background
- `components/ScrollThread.jsx`    the gold thread scroll bar
- `components/ThreadArticle.jsx`   the one layout used by both the public page and the Studio preview
- `app/globals.css`       all styling
