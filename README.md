# nodir.one

Personal site and blog. Astro, plain CSS, no framework on the client — the pages ship
zero JavaScript. Built and hosted on Cloudflare Pages, from `main`.

---

## Running it locally

You need [Node.js](https://nodejs.org) **18.20.8, 20.3.0+, or 22+** — 22 is what
`.nvmrc` pins and what the site is built with. Node 21 is not supported (sharp allows
it, Astro does not).

```bash
npm install          # once
npm run dev          # http://localhost:4321
```

`npm run dev` does **not** generate the images or copy the fonts, because it skips the
`prebuild` step. Run them once after cloning, and again whenever you replace a
photograph:

```bash
npm run prepare:fonts    # fonts  -> public/fonts/
npm run prepare:photos   # hero crops + public/og.jpg
```

To check the real production output:

```bash
npm run build        # -> dist/   (prebuild runs BOTH scripts first)
npm run preview      # serves dist/ at http://localhost:4321
```

`npm run build` is self-sufficient: a clean clone needs nothing but `npm install` before
it. Both derived-asset scripts run from `prebuild`, so the build cannot ship without its
fonts.

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

## Site structure

- `/` is the professional overview: profile, current experience, selected projects, and toolkit.
- `/about/` carries the longer background, working approach, education, certification, and languages.
- `/blog/` is the Writing index; each post keeps its own `/blog/<slug>/` page.
- `/contact/` contains the public contact channels.
- Project case studies live at `/projects/<slug>/` and remain linked from the home page.

The masthead uses real page links for About, Writing, and Contact. Work intentionally
links back to the project index on the home page.

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

The three posts currently in the repo have **no `pubDate`**, deliberately. Sorting by
date would therefore silently degrade to whatever order the file glob returned.

When every post has a real `pubDate`, switch the sort in `src/pages/blog/index.astro` to
use it, and drop `order` from the schema.

Posts with no date simply omit the metadata line. A reading time still renders when one
is provided.

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

Hosted on **Cloudflare Pages**, built from this repository on every push to `main`.

There is no deployment workflow in this repo and that is deliberate: Cloudflare builds
the site itself, so a committed CI workflow would be a second, silently divergent copy of
the build configuration.

### Cloudflare Pages build settings

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |
| Node version | 22 — read automatically from `.nvmrc` |

`npm run build` is self-sufficient. Its `prebuild` step copies the fonts into
`public/fonts/` and derives the hero crops and `public/og.jpg` from the original
photograph, both of which are gitignored. Nothing has to be run before it and no extra
build step is needed.

The build needs **Node 18.20.8, 20.3.0+, or 22+** — the intersection of what Astro and
sharp accept. Node 21 does not work: sharp allows it, Astro does not. `.nvmrc` pins 22,
and `engines` in `package.json` records the full supported range. If Cloudflare ever
ignores `.nvmrc`, set the environment variable `NODE_VERSION` to `22` in the project's
build settings.

### The three commands

```bash
git add -A
git commit -m "Update site"
git push origin main
```

---

## DNS

The `nodir.one` nameservers are already delegated to Cloudflare, so the records live in
the Cloudflare dashboard and there is nothing to configure at the registrar.

Because the zone is on Cloudflare, **you do not add DNS records by hand for this site.**
In the Pages project go to **Custom domains** → **Set up a custom domain**, add
`nodir.one`, and repeat for `www.nodir.one`. Cloudflare creates and proxies the records
itself and issues the certificate.

Two things worth knowing:

- The existing `eticket.nodir.one` tunnel is a separate record on the same zone and is not
  affected. Adding the apex and `www` does not touch it. Do not delete records you did not
  create — the tunnel's record is one of them.
- If the apex already has a record from an earlier experiment, Cloudflare will ask to
  replace it. Check what it is before agreeing.

To verify once it is live:

```bash
curl -sI https://nodir.one | head -3        # expect HTTP/2 200
curl -s https://nodir.one | grep -o "<title>[^<]*"
```

---

## Notes for later

- **Uzbek.** `astro.config.mjs` already has `i18n` configured with `en` as the only
  locale. Adding Uzbek is a routing change, not a type change: both IBM Plex faces carry
  U+02BB and U+02BC, verified from the font binaries, at no extra payload.
- **The inline data marks.** The site currently has none. The per-project coverage bar was
  cut because it was one step from a banned skill bar, and its information became the
  indentation instead. The training sparkline was cut because a single mark is not a
  system.
- **The hero photograph.** `src/data/photo-clearance.json` selects the crop variant.
  `B` is current and ships the display sharp and legible, which requires the company's
  permission covering the figures on screen. `A` caps the render so the display reads as
  texture. `C` removes the photograph entirely and promotes the headshot.
