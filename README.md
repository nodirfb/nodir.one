# nodir.one

Personal site and blog. Astro, plain CSS, no framework on the client — the pages ship
zero JavaScript. Deployed to GitHub Pages on every push to `main`.

---

## Running it locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install          # once
npm run dev          # http://localhost:4321
```

`npm run dev` does **not** generate the images or copy the fonts. Run those once after
cloning, and again whenever you replace a photograph:

```bash
node scripts/copy-fonts.mjs      # fonts -> public/fonts/
node scripts/prepare-photos.mjs  # hero crops + public/og.jpg
```

To check the real production output:

```bash
npm run build        # -> dist/   (runs prepare-photos automatically)
npm run preview      # serves dist/ at http://localhost:4321
```

### What the two scripts are for

**`copy-fonts.mjs`** copies four `.woff2` files out of `node_modules` into
`public/fonts/`. Astro fingerprints bundled assets, which makes their URLs unknowable
when you need to write `<link rel="preload">` — and these faces set text that appears
above the fold, so they must be preloaded. Only the basic `latin` subset ships: the
Uzbek characters `oʻ` `gʻ` (U+02BB) and `ʼ` (U+02BC) live in `latin`, **not** in
`latin-ext`, so no extra file is needed.

**`prepare-photos.mjs`** turns `src/assets/wallboard.jpg` into the two hero crops and
`public/og.jpg`. It exists because the original is stored *landscape* with EXIF
orientation 6 and is an MPO multi-frame JPEG. `sharp` does not apply EXIF orientation
unless `.rotate()` is called, and `astro:assets` gives you nowhere to call it — so
without this step the hero ships on its side. The script rotates once, asserts the
post-rotation dimensions (and fails the build if they change), and writes upright files
with no orientation tag.

If you replace the photograph, the crop rectangles in that file will be wrong. The
assertion will tell you.

---

## Adding a blog post

Create `src/content/blog/my-post-slug.md`. The filename becomes the URL:
`/blog/my-post-slug/`.

```markdown
---
title: What the post is called
description: One sentence. Also used as the page's meta description. Max 160 characters.
order: 4
pubDate: 2026-05-02
readingMinutes: 7
---

Body in Markdown. `## Headings` become section headings.
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | |
| `description` | yes | max 160 characters — it is the meta description |
| `order` | **yes** | **controls the order of the index. Lowest number first.** |
| `pubDate` | no | omit until the post is real |
| `readingMinutes` | no | omit until the post is real |
| `draft` | no | `true` hides it from the site entirely |

### Why ordering is manual

The index is sorted by `order`, not by date and not by filename.

The three posts currently in the repo have **no `pubDate`**, deliberately: they are
drafts, and a placeholder date would ship a fabricated timeline that looks real. Sorting
by date would therefore have silently degraded to whatever order the file glob returned,
and "three most recent" on the home page would have stopped being true without anything
appearing to break.

When every post has a real `pubDate`, switch the sort in `src/pages/index.astro` and
`src/pages/blog/index.astro` to use it, and drop `order` from the schema.

Posts with no date render `[TO'LDIR — date]` where the date would go, so an undated post
is visible rather than silently blank.

---

## Adding a project

Create `src/content/projects/my-project.md` → `/projects/my-project/`. It appears on the
home page automatically, sorted by `order`.

```markdown
---
title: Internal operations platform
summary: One line. Max 120 characters — it is the index row.
layers:
  store: SQL Server · schema · procs
  move: Python · scheduled jobs
  read: dashboards · exports
  write: the platform · approvals
stack: [SQL Server, T-SQL, Python]
order: 1
---

## Context
## Problem
## What I built
## What changed
```

**`layers` is the design.** The four keys — `store`, `move`, `read`, `write` — are the
stages of the data chain, and each one is indented one step further than the last. Omit a
key that the project genuinely did not touch: the missing line is the signal, and it is
the reason the Power BI project shows `STORE` then `READ` with nothing between them.

Each layer string is capped at **32 characters** by the schema, and the build fails if you
exceed it. That number is not arbitrary: at 360px the deepest layer line is 39 monospace
characters wide and the label column takes 7. Longer strings wrap, and a wrapped layer
line destroys the one thing the layout depends on — that a line's left edge is readable at
a glance.

---

## Deploying

Pushing to `main` builds and publishes automatically via
`.github/workflows/deploy.yml`.

The three commands:

```bash
git add -A
git commit -m "Update site"
git push origin main
```

**One-time setup in GitHub:** repository → **Settings** → **Pages** → under *Build and
deployment*, set **Source** to **GitHub Actions**. Without this the workflow runs and
succeeds but nothing is published.

`public/CNAME` contains `nodir.one` and must stay there — it is what tells GitHub Pages to
serve the custom domain.

---

## DNS at Porkbun

You need five records: four `A` records that point the bare domain at GitHub, and one
`CNAME` that points `www` at your GitHub Pages address. Nothing here costs anything.

### Step by step

1. Sign in at [porkbun.com](https://porkbun.com) and go to **Domain Management**.
2. Find `nodir.one` and click **DNS** (sometimes shown as *Edit DNS Records*).
3. You will see a list of existing records. **Delete any existing `A` or `ALIAS` record
   whose Host is blank or `@`**, and any `CNAME` whose host is `www`. Porkbun adds
   parking records when you buy a domain and they will conflict with these.
4. Add the five records below, one at a time.

### The records

Leave **Host** completely empty for the four `A` records. Porkbun treats an empty host as
the bare domain, `nodir.one`.

| Type | Host | Answer / Value | TTL |
| --- | --- | --- | --- |
| A | *(leave empty)* | `185.199.108.153` | 600 |
| A | *(leave empty)* | `185.199.109.153` | 600 |
| A | *(leave empty)* | `185.199.110.153` | 600 |
| A | *(leave empty)* | `185.199.111.153` | 600 |
| CNAME | `www` | `USERNAME.github.io` | 600 |

Replace `USERNAME` with your GitHub username, and keep the trailing `.github.io`. Do not
put the repository name in it. If your username is `nodirf`, the value is
`nodirf.github.io`.

All four `A` records are correct and all four are needed — they are GitHub's four Pages
servers, and listing them all is what keeps the site up if one is unavailable.

### Then, back in GitHub

1. Repository → **Settings** → **Pages**.
2. Under **Custom domain**, enter `nodir.one` and press **Save**.
3. Wait for the **DNS check** to pass. This usually takes ten to thirty minutes, and can
   take up to a few hours the first time. It is normal to see a red warning in that
   window — it means "not yet", not "wrong".
4. Once the check passes, tick **Enforce HTTPS**. This box is greyed out until GitHub has
   issued the certificate, which happens automatically after the DNS check passes. If it
   is still greyed out after a few hours, remove the custom domain, save, re-add it, and
   save again — that re-triggers certificate issuance.

### Checking it yourself

```bash
nslookup nodir.one          # should list the four 185.199.x.x addresses
nslookup www.nodir.one      # should show USERNAME.github.io
```

If `nslookup` still shows old values, your computer has cached them. Wait, or try from a
phone on mobile data.

---

## Notes for later

- **Uzbek.** `astro.config.mjs` already has `i18n` configured with `en` as the only
  locale. Adding Uzbek is a routing change, not a type change: both IBM Plex faces carry
  U+02BB and U+02BC, verified from the font binaries, at no extra payload.
- **The inline data marks.** The site currently has none. The per-project coverage bar was
  cut because it was one step from a banned skill bar, and its information became the
  indentation instead. The training sparkline was cut because a single mark is not a
  system. The month dot strip returns automatically in the Writing index once there are
  five or more posts — below that, a near-empty track would be a graphic whose real
  content is "he rarely writes".
- **The hero photograph.** `src/data/photo-clearance.json` selects the crop variant.
  `B` is current and ships the display sharp and legible, which requires the company's
  permission covering the figures on screen. `A` caps the render so the display reads as
  texture. `C` removes the photograph entirely and promotes the headshot.
