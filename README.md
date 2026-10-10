# Sree Narayana Guru — website

A static site covering the works, life, places and teaching of Sree Narayana Guru
(1856–1928), in Malayalam and English.

Everything is generated from the JSON files in `content/`. There is no database,
no CMS and no runtime dependency. Adding a text or a recording is an edit to a
JSON file and a rebuild.

## Build and run

```bash
node build.js                 # writes dist/
npx serve dist                # or any static file server
```

There are no npm dependencies for the build. Node 18 or later.

Set the real domain before deploying, so canonical links and the sitemap are right:

```bash
SITE_ORIGIN=https://your-domain.org node build.js
```

## Deploy to Cloudflare Pages

Your DNS is already on Cloudflare, so this is the shortest route.

**Option A — connect a Git repository (recommended).** In the Cloudflare
dashboard: Workers & Pages → Create → Pages → Connect to Git. Settings:

| Field | Value |
|---|---|
| Build command | `SITE_ORIGIN=https://your-domain.org node build.js` |
| Build output directory | `dist` |
| Node version | set env var `NODE_VERSION` to `20` |

Every push rebuilds. Corrections arrive as pull requests, which is the right
workflow for a text that needs review.

**Option B — direct upload.** Run `node build.js` locally and drag `dist/` into
Workers & Pages → Create → Pages → Upload assets. Fine for a first look, but you
lose the review trail.

Then Custom domains → add your domain. `_headers` is already in `dist/` and
Cloudflare applies it automatically.

## Adding content

### A text

Open `content/works.json`, find the work, and fill in its `verses` array:

```json
{ "n": 2,
  "ml": "line one\nline two",
  "translit": "line one\nline two",
  "en": "A plain-language meaning, not a literal gloss." }
```

Then set the provenance fields on the work:

```json
"textStatus": "verified",
"textSource": "Sree Narayana Guru Sampoorna Kruthikal, <publisher>, <year>, p. <n>",
"textNote": ""
```

`textStatus` is the honest bit, and the site behaves differently for each value:

- `none` — no text. The page says the text needs transcribing and offers a link to help.
- `draft` — typed in but not checked against print. The page shows an amber caution
  banner telling readers not to quote it.
- `verified` — checked line by line against the edition named in `textSource`.
  No banner.

**Do not set `verified` without actually checking against a printed edition.** The
banner is the only thing standing between a typo and a misquoted scripture.

### A recording

Put the file in `audio/` and add an entry to the work's `audio` array:

```json
"audio": [
  { "file": "/audio/daiva-dasakam-choir.mp3",
    "label": "Choir, 2026",
    "credit": "Sung by <names>, recorded at <place>, 2026. CC BY-SA 4.0." }
]
```

Multiple entries become version buttons in the player (choir, solo, slow for
learners). To make the text follow the audio, add `start` and `end` in seconds to
each verse:

```json
{ "n": 1, "start": 0, "end": 14.5, "ml": "…" }
```

With timings the player highlights the verse being sung and the previous/next
buttons jump between verses. Without them it skips 15 seconds at a time, and
nothing is highlighted — which is correct rather than wrong.

### Life events, places, lessons, library

`content/timeline.json`, `content/places.json`, `content/lessons.json` and
`content/library.json`, all the same shape: edit, rebuild.

## What is deliberately not here

- **No invented Malayalam.** Only one verse has text, and it is marked `draft`
  because it was entered from common recitation rather than from print. Fifty-eight
  works have no text at all. The site says so on every page rather than
  filling the space with something that looks right.
- **No audio.** The player is finished and waiting. What is missing is recordings
  this site is allowed to publish — see `audio/README.md`.
- **No photographs.** Portraits and place photographs are placeholders. Almost
  every photograph of the Guru is still in copyright.
- **No fabricated visiting hours or festival dates.** `places.json` leaves them
  blank for you to confirm with the institutions.

## Before launch

- [ ] Proofread the Daivadashakam verse against a printed edition, or remove it
- [ ] Set `SITE_ORIGIN`
- [ ] Replace `[Site owner]` in `build.js` (`SITE.owner`)
- [ ] Confirm the independence line in the footer is accurate for your situation
- [ ] Add a contact address on `/contribute/`
- [ ] Connect the newsletter form to a provider, or remove it
- [ ] Check the life dates against a printed biography, in particular the
      All Religions Conference, which sources date to both 1923 and 1924
- [ ] Confirm the place coordinates

## Structure

```
content/        JSON: works, timeline, places, lessons, library
assets/css/     one stylesheet
assets/js/      app.js (language, theme, tabs, filters)
                player.js (audio, verse following)
                search.js (client-side search)
                quiz.js (generated by the build)
audio/          mp3 files, copied to dist/ as they are
build.js        generates dist/
dist/           the built site — do not edit by hand
```

## Notes on the build

- Both languages are written into the HTML and one is hidden by JavaScript, so
  pages stay readable and indexable with scripting off.
- The service worker caches the shell but always goes to the network first for
  pages, so a corrected text is never served stale from someone's device. Audio
  is never cached by the worker.
- `search-index.json` is generated at build time and searched in the browser.
  It folds diacritics, so `atmopadesa` finds `Ātmōpadēśa`, and it matches
  Malayalam directly.
