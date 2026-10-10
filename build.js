#!/usr/bin/env node
/* Builds the static site into dist/ from the JSON files in content/.
   No dependencies. Run with: node build.js  */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const SITE = {
  name: 'Sree Narayana Guru',
  nameMl: 'ശ്രീനാരായണഗുരു',
  // Change this to the domain you deploy to. It is used for canonical links,
  // the sitemap and social cards.
  origin: process.env.SITE_ORIGIN || 'https://example.org',
  owner: '[Site owner]',
  year: new Date().getFullYear()
};

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));
const works = read('works.json');
const timeline = read('timeline.json');
const places = read('places.json');
const lessons = read('lessons.json');
const library = read('library.json');

/* ---------- helpers ---------- */

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Both languages are written into the HTML; app.js hides one.
   That keeps the page readable and indexable without JavaScript. */
const bi = (en, ml, tag = 'span', cls = '') => {
  const c = cls ? ` class="${esc(cls)}"` : '';
  const mlc = cls ? ` class="${esc(cls)} ml"` : ' class="ml"';
  if (!ml) return `<${tag}${c}>${esc(en)}</${tag}>`;
  return `<${tag}${c} data-lang="en">${esc(en)}</${tag}><${tag}${mlc} data-lang="ml" lang="ml">${esc(ml)}</${tag}>`;
};

/* RELATIVE=1 produces a build that works from any sub-path or from file://:
   root-absolute URLs become relative, and directory links get an explicit
   index.html so it does not depend on the host serving directory indexes. */
const RELATIVE = process.env.RELATIVE === '1';
const HTML_PAGES = [];

const write = (rel, body) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  if (rel.endsWith('.html')) HTML_PAGES.push(rel);
};

function makeRelative() {
  for (const rel of HTML_PAGES) {
    const depth = rel.split('/').length - 1;
    const prefix = depth === 0 ? '.' : new Array(depth).fill('..').join('/');
    const file = path.join(OUT, rel);
    let html = fs.readFileSync(file, 'utf8');

    html = html.replace(/(href|src)="\/([^"]*)"/g, (m, attr, p) => {
      if (p === '') return `${attr}="${prefix}/index.html"`;
      if (p.endsWith('/')) return `${attr}="${prefix}/${p}index.html"`;
      if (p.startsWith('search/?')) return `${attr}="${prefix}/search/index.html?${p.slice(8)}"`;
      return `${attr}="${prefix}/${p}"`;
    });
    html = html.replace(/action="\/search\/"/g, `action="${prefix}/search/index.html"`);
    html = html.replace('<link rel="manifest"', `<script>window.SNG_BASE=${JSON.stringify(prefix)};</script>\n<link rel="manifest"`);

    fs.writeFileSync(file, html);
  }
  console.log(`  rewritten ${HTML_PAGES.length} pages for relative paths`);
}

const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
};

const langLabel = { malayalam: 'Malayalam', sanskrit: 'Sanskrit', tamil: 'Tamil' };
const langLabelMl = { malayalam: 'മലയാളം', sanskrit: 'സംസ്കൃതം', tamil: 'തമിഴ്' };

const workUrl = (w) => `/krithis/${w.id}/`;
const hasText = (w) => w.verses && w.verses.some((v) => v.ml && v.ml.trim());
const hasAudio = (w) => w.audio && w.audio.length > 0;

/* ---------- shell ---------- */

const ICON = `<svg class="brand__mark" width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
<circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
<circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" stroke-width="2"/>
<circle cx="20" cy="20" r="4" fill="currentColor"/></svg>`;

const NAV = [
  ['/life/', 'Life', 'ജീവിതം'],
  ['/krithis/', 'Krithis', 'കൃതികൾ'],
  ['/listen/', 'Listen', 'കേൾക്കാം'],
  ['/learn/', 'Learn', 'പഠിക്കാം'],
  ['/places/', 'Places', 'സ്ഥലങ്ങൾ'],
  ['/library/', 'Library', 'ഗ്രന്ഥശാല']
];

function head(title, desc, url, extraCss = '') {
  return `<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(SITE.origin + url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(SITE.origin + url)}">
<meta name="theme-color" content="#0F2E2B">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/assets/img/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;1,400&family=Work+Sans:wght@400;500;600&family=Noto+Serif+Malayalam:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">${extraCss}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-head">
<div class="wrap site-head__in">
<a class="brand" href="/">${ICON}<span class="brand__name"><span class="brand__en">Sree Narayana Guru</span><span class="brand__ml" lang="ml">ശ്രീനാരായണഗുരു</span></span></a>
<nav class="nav" aria-label="Main">
${NAV.map(([href, en, ml]) => `<a href="${href}">${bi(en, ml)}</a>`).join('\n')}
</nav>
<div class="head-tools">
<button class="pill" type="button" data-lang-toggle aria-label="Switch to Malayalam"><span data-lang-label>മലയാളം</span></button>
<button class="pill" type="button" data-theme-toggle aria-label="Change colour theme">
<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2v12a6 6 0 0 1 0-12z"/></svg>
</button>
</div>
</div>
</header>
<main id="main">`;
}

function foot(scripts = '') {
  return `</main>
<footer class="site-foot">
<div class="wrap site-foot__in">
<div class="site-foot__cols">
<div class="site-foot__brand">
<strong style="font-family:var(--serif); font-size:24px">Sree Narayana Guru</strong>
<p>${esc('An open study site. Every text, recording and photograph carries its source and its licence. Corrections are welcome.')}</p>
<form class="subscribe" action="#" method="post">
<label class="sr" for="nl">Email address</label>
<input id="nl" name="email" type="email" placeholder="you@example.com" required>
<button class="btn btn--primary" type="submit">Subscribe</button>
</form>
<p class="small">[Connect this form to your mailing list provider before launch.]</p>
</div>
<div class="site-foot__col"><strong>Explore</strong>
<a href="/krithis/">Krithis</a><a href="/listen/">Listen</a><a href="/learn/">Learn</a><a href="/places/">Places</a>
</div>
<div class="site-foot__col"><strong>About</strong>
<a href="/about/">Sources and licences</a><a href="/contribute/">Contribute a recording</a><a href="/learn/#teachers">For teachers</a><a href="/search/">Search</a>
</div>
</div>
<div class="site-foot__fine">
${esc(SITE.owner)} · ${SITE.year} · This site is independent and is not an official publication of any Sree Narayana institution unless stated. Texts by Sree Narayana Guru (1856–1928) are in the public domain in India.
</div>
</div>
</footer>
<script src="/assets/js/app.js" defer></script>${scripts}
</body>
</html>`;
}

const waveBars = (n = 56) => {
  let out = '';
  for (let i = 0; i < n; i++) {
    const h = Math.round(12 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) * 40);
    out += `<span style="height:${h}px"></span>`;
  }
  return out;
};

const searchForm = (big) => `<form class="searchbar" role="search" action="/search/">
<label for="q">${big ? bi('Search the Guru’s words', 'ഗുരുവിന്റെ വാക്കുകൾ തിരയുക') : 'Search'}</label>
<input class="field" id="q" name="q" type="search" data-search-input
 placeholder="A verse, a work, a place or a year" autocomplete="off">
<button class="btn btn--primary" type="submit">Search</button>
</form>`;

/* ---------- home ---------- */

function buildHome() {
  const featured = works.works.filter((w) => w.featured).slice(0, 6);
  const doors = [
    ['01', 'Krithis', 'കൃതികൾ', 'Every composition, with transliteration, meaning and commentary. Sixty works catalogued.', '/krithis/', 'Read the works'],
    ['02', 'Listen', 'കേൾക്കാം', 'A recording for each krithi, with verse-by-verse following and a slow mode for learning to chant.', '/listen/', 'Open the player'],
    ['03', 'Learn', 'പഠിക്കാം', 'Guided paths, quizzes and classroom material for children, students and adults.', '/learn/', 'Start a path'],
    ['04', 'Life', 'ജീവിതം', 'The story told through the people, the reforms and the institutions around him.', '/life/', 'Walk the timeline'],
    ['05', 'Places', 'സ്ഥലങ്ങൾ', 'Sivagiri, Aruvippuram, Aluva and Chempazhanthy, with maps and visiting notes.', '/places/', 'Explore the map'],
    ['06', 'Library', 'ഗ്രന്ഥശാല', 'Books, archives and scholarship, each with a clear source.', '/library/', 'Browse the library']
  ];

  const body = `
<section class="wrap hero">
<div class="hero__text">
<div class="eyebrow">1856 – 1928 · Chempazhanthy to Varkala</div>
<h1>${bi('Everything the Guru gave us, in one place.', 'ഗുരു നൽകിയതെല്ലാം ഒരിടത്ത്.')}</h1>
<p class="hero__lede">${bi('His works with their meanings, recordings as they are made, lessons for every age, and the places that keep his memory.', 'കൃതികളും അവയുടെ അർഥവും, ലഭ്യമാകുന്ന മുറയ്ക്ക് ശബ്ദരേഖകൾ, എല്ലാ പ്രായക്കാർക്കുമുള്ള പാഠങ്ങൾ, ഓർമ നിലനിർത്തുന്ന സ്ഥലങ്ങൾ.')}</p>
<div class="hero__actions">
<a class="btn btn--primary" href="/krithis/">${bi('Browse the krithis', 'കൃതികൾ കാണുക')}</a>
<a class="btn btn--ghost" href="/learn/">${bi('Begin learning', 'പഠനം തുടങ്ങുക')}</a>
</div>
</div>
<div class="hero__fig">
<div class="portrait"><span class="portrait__note">[Portrait: add a public-domain archival photograph here, with its source credit]</span></div>
</div>
</section>

<section class="band"><div class="wrap">${searchForm(true)}</div></section>

<section class="quote"><div class="wrap quote__in">
<div class="quote__ml" lang="ml">ഒരു ജാതി ഒരു മതം ഒരു ദൈവം മനുഷ്യന്</div>
<div class="quote__en">One caste, one religion, one god for humankind.</div>
<div class="quote__who">Sree Narayana Guru</div>
</div></section>

<section class="wrap section">
<div class="section__head">
<h2>${bi('Six doors into one life’s work', 'ഒരു ജീവിതത്തിലേക്ക് ആറു വാതിലുകൾ')}</h2>
<p>${bi('Start wherever you are curious. Every page links to the others, so a verse leads to its recording, its meaning and the lesson built on it.', 'കൗതുകം തോന്നുന്നിടത്തു നിന്നു തുടങ്ങുക. ഓരോ താളും മറ്റുള്ളവയുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു.')}</p>
</div>
<div class="grid">
${doors.map(([n, en, ml, body, href, cta]) => `<a class="card" href="${href}">
<span class="card__num">${n}</span>
<h3>${bi(en, ml)}</h3>
<p>${esc(body)}</p>
<span class="card__more">${esc(cta)} &rarr;</span>
</a>`).join('\n')}
</div>
</section>

<section class="band"><div class="wrap section">
<div class="split">
<div class="split__main">
<div class="eyebrow">${bi('Start here', 'ഇവിടെ തുടങ്ങുക')}</div>
<h2 style="font-size:clamp(28px,3.6vw,36px)">${bi('The best known works', 'ഏറ്റവും അറിയപ്പെടുന്ന കൃതികൾ')}</h2>
<div class="worklist" style="margin-top:8px">
${featured.map((w) => workRow(w)).join('\n')}
</div>
<a class="card__more" href="/krithis/" style="padding-top:8px">${bi('Browse all ' + works.works.length + ' works', 'എല്ലാ കൃതികളും കാണുക')} &rarr;</a>
</div>
<div class="split__side">
<div class="panel">
<h2>${bi('A life in brief', 'ജീവിതം ചുരുക്കത്തിൽ')}</h2>
<dl>
${timeline.events.filter((e) => e.major).slice(0, 5).map((e) => `<div class="panel__row panel__row--stack"><dt>${esc(e.year)}</dt><dd>${esc(e.titleEn)}</dd></div>`).join('\n')}
</dl>
<a href="/life/">${bi('The full timeline', 'പൂർണ കാലരേഖ')} &rarr;</a>
</div>
<div class="panel">
<h2>${bi('Help build this', 'ഇത് പണിയാൻ സഹായിക്കുക')}</h2>
<p class="small muted">${esc('Texts need proofreading against printed editions, and most works have no recording yet. Both are jobs for people who know this material.')}</p>
<a href="/contribute/">${bi('How to contribute', 'എങ്ങനെ സംഭാവന ചെയ്യാം')} &rarr;</a>
</div>
</div>
</div>
</div></section>
`;
  write('index.html',
    head(`${SITE.name} — works, recordings and teaching`,
      'The works of Sree Narayana Guru with meanings and recordings, his life and places, and free teaching material in Malayalam and English.',
      '/') + body + foot('\n<script src="/assets/js/search.js" defer></script>'));
}

function workRow(w) {
  const meta = [];
  if (w.verseCount) meta.push(w.verseCount + ' verses');
  meta.push(langLabel[w.language] || '');
  if (w.year) meta.push(w.year);
  return `<a class="workrow" href="${workUrl(w)}" data-facets="${esc(w.language + ' ' + w.category + (hasText(w) ? ' hastext' : '') + (hasAudio(w) ? ' hasaudio' : ''))}">
<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style="flex:0 0 auto" fill="none" stroke="currentColor" stroke-width="1.5">
<circle cx="11" cy="11" r="9.25"/><path d="M9 7 L15 11 L9 15 Z" fill="currentColor" stroke="none"/></svg>
<span class="workrow__titles">
<span class="workrow__en">${esc(w.titleEn)}</span>
<span class="workrow__ml" lang="ml">${esc(w.titleMl)}</span>
</span>
<span class="workrow__meta">${esc(meta.filter(Boolean).join(' · '))}${hasAudio(w) ? ' <span class="tag tag--audio">audio</span>' : ''}</span>
</a>`;
}

/* ---------- krithis index ---------- */

function buildKrithisIndex() {
  const byCat = {};
  for (const w of works.works) (byCat[w.category] = byCat[w.category] || []).push(w);
  const order = ['philosophy', 'devotional', 'translation', 'prose'];
  const withText = works.works.filter(hasText).length;
  const withAudio = works.works.filter(hasAudio).length;

  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Krithis</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<div class="eyebrow">${works.works.length} ${bi('works catalogued', 'കൃതികൾ')}</div>
<h2>${bi('The krithis', 'കൃതികൾ')}</h2>
<p>${bi('Everything he wrote, in Malayalam, Sanskrit and Tamil. Each page carries the text, a transliteration, a plain-language meaning and a recording where one exists.', 'മലയാളത്തിലും സംസ്കൃതത്തിലും തമിഴിലും അദ്ദേഹം എഴുതിയതെല്ലാം.')}</p>
</div>

<div class="notice" style="margin-bottom:28px">
<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L19 18 H1 Z M10 7 v5 M10 14.5 v1"/></svg>
<div><strong>This catalogue is complete; the texts are not.</strong>
${withText} of ${works.works.length} works have text entered so far, and ${withAudio} have a recording.
Nothing has been invented to fill the gaps: a work with no verified text says so.
<a href="/contribute/">Help add one</a>.</div>
</div>

<div class="filters" data-filter-group data-filter-target="#worklist">
<button class="chip" type="button" data-filter="all" aria-pressed="true">All</button>
<button class="chip" type="button" data-filter="malayalam" aria-pressed="false">Malayalam</button>
<button class="chip" type="button" data-filter="sanskrit" aria-pressed="false">Sanskrit</button>
<button class="chip" type="button" data-filter="tamil" aria-pressed="false">Tamil</button>
<button class="chip" type="button" data-filter="philosophy" aria-pressed="false">Philosophy</button>
<button class="chip" type="button" data-filter="devotional" aria-pressed="false">Devotional</button>
<button class="chip" type="button" data-filter="translation" aria-pressed="false">Translations</button>
<button class="chip" type="button" data-filter="hastext" aria-pressed="false">Has text</button>
<button class="chip" type="button" data-filter="hasaudio" aria-pressed="false">Has audio</button>
</div>

<div id="worklist">
${order.filter((c) => byCat[c]).map((c) => `
<h3 style="font-size:26px; margin:34px 0 14px">${bi(works.categories[c].en, works.categories[c].ml)}</h3>
<div class="worklist">
${byCat[c].sort((a, b) => a.titleEn.localeCompare(b.titleEn)).map(workRow).join('\n')}
</div>`).join('\n')}
</div>
</section>`;
  write('krithis/index.html',
    head('Krithis — all the works of Sree Narayana Guru',
      'The complete catalogue of Sree Narayana Guru’s works in Malayalam, Sanskrit and Tamil, with text, meaning and recordings.',
      '/krithis/') + body + foot());
}

/* ---------- one krithi ---------- */

function buildWorkPage(w, prev, next) {
  const statusNotice = w.textStatus === 'draft'
    ? `<div class="notice">
<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L19 18 H1 Z M10 7 v5 M10 14.5 v1"/></svg>
<div><strong>Text not yet verified.</strong>
${esc(w.textNote || 'This text has been entered but not checked against a printed edition. Do not treat it as authoritative or quote it until it has been verified.')}
<a href="/contribute/">Help verify it</a>.</div></div>`
    : w.textStatus === 'none'
      ? `<div class="notice">
<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L19 18 H1 Z M10 7 v5 M10 14.5 v1"/></svg>
<div><strong>The text has not been added yet.</strong>
This page holds what is known about the work. The verses themselves need transcribing from a printed edition by someone who reads ${esc(langLabel[w.language] || 'the language')}.
<a href="/contribute/">Offer to transcribe it</a>.</div></div>`
      : '';

  /* Only verses that actually have text get a card. The rest are summarised in
     one line, so a mostly-empty work does not become a wall of empty boxes. */
  const filled = (w.verses || []).filter((v) => v.ml && v.ml.trim());
  const missing = (w.verses || []).filter((v) => !(v.ml && v.ml.trim())).map((v) => v.n);

  const verses = filled.map((v) => `
<article class="verse" data-verse="${v.n}"${v.start != null ? ` data-start="${v.start}"` : ''}${v.end != null ? ` data-end="${v.end}"` : ''}>
<div class="verse__head">
<span class="verse__n">${bi('Verse ' + v.n, 'ശ്ലോകം ' + v.n)}</span>
${hasAudio(w) && v.start != null ? `<button class="iconbtn" type="button" data-play-verse aria-label="Play verse ${v.n}">
<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3 L15 9 L5 15 Z"/></svg></button>` : ''}
</div>
<div class="verse__ml" lang="ml">${esc(v.ml)}</div>
${v.translit ? `<div class="verse__translit">${esc(v.translit)}</div>` : ''}
${v.en ? `<div class="verse__en">${esc(v.en)}</div>` : ''}
</article>`).join('\n')
    + (missing.length && filled.length ? `
<article class="verse" style="align-items:flex-start">
<span class="verse__n">${missing.length === 1 ? 'Verse ' + missing[0] : 'Verses ' + missing[0] + ' to ' + missing[missing.length - 1]}</span>
<p class="verse__empty">Not transcribed yet. <a href="/contribute/">Add them from a printed edition</a>.</p>
</article>` : '');

  const meta = [
    ['Language', langLabel[w.language], 'ഭാഷ', langLabelMl[w.language]],
    ['Form', w.subtitleEn, 'രൂപം', ''],
    ['Verses', w.verseCount ? String(w.verseCount) : 'Not recorded', 'ശ്ലോകങ്ങൾ', ''],
    ['Composed', w.year ? String(w.year) : 'Date not recorded', 'രചിച്ചത്', ''],
    ['Text source', w.textSource || 'Not yet sourced', 'പാഠ സ്രോതസ്സ്', '']
  ];

  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / <a href="/krithis/">Krithis</a> / ${esc(w.titleEn)}</div>

<section class="wrap" style="padding-block:22px 34px">
<div class="row" style="justify-content:space-between; align-items:flex-end; gap:24px 40px">
<div style="flex:1 1 440px; min-width:0; display:flex; flex-direction:column; gap:8px">
<div class="eyebrow">${esc([works.categories[w.category].en, langLabel[w.language], w.verseCount ? w.verseCount + ' verses' : ''].filter(Boolean).join(' · '))}</div>
<h1 class="ml" lang="ml" style="font-size:clamp(36px,6vw,58px); line-height:1.25">${esc(w.titleMl)}</h1>
<div style="font-family:var(--serif); font-size:clamp(20px,2.6vw,27px); color:var(--fg-2)">${esc(w.titleEn)}${w.subtitleEn ? ', ' + esc(w.subtitleEn.toLowerCase()) : ''}</div>
</div>
<div class="row" style="flex:0 1 300px">
<button class="btn btn--ghost" type="button" onclick="window.print()">Print</button>
<a class="btn btn--ghost" href="/contribute/">Suggest a correction</a>
</div>
</div>
</section>

<section class="wrap" style="padding-bottom:34px">
<div class="player" data-player data-sources='${esc(JSON.stringify(w.audio || []))}'>
<div class="player__row">
<button class="iconbtn" type="button" data-prev aria-label="Previous verse">
<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M15 4 L7 10 L15 16 Z M5 4 H7 V16 H5 Z"/></svg></button>
<button class="iconbtn iconbtn--play" type="button" data-play aria-label="Play">
<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M7 4 L21 13 L7 22 Z"/></svg></button>
<button class="iconbtn" type="button" data-next aria-label="Next verse">
<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4 L13 10 L5 16 Z M13 4 H15 V16 H13 Z"/></svg></button>
<label class="sr" for="scrub-${w.id}">Seek</label>
<input class="scrub" id="scrub-${w.id}" type="range" min="0" max="1000" value="0" data-scrub>
<span class="player__time" data-time>0:00 / --:--</span>
</div>
<div class="wave" aria-hidden="true" data-wave>${waveBars()}</div>
${hasAudio(w) ? `<div class="player__meta">
<strong style="color:inherit">Version</strong>
${w.audio.map((a, i) => `<button class="chip" type="button" data-version-index="${i}" aria-pressed="${i === 0}">${esc(a.label || 'Recording ' + (i + 1))}</button>`).join('\n')}
<span data-credit style="flex-basis:100%"></span>
</div>` : `<div class="nolink">
<strong>There is no recording of this work yet.</strong>
Recordings of the Guru’s works are almost all under copyright, so they cannot simply be copied from elsewhere.
This site adds chanting that is newly recorded under an open licence, or used with written permission.
<a href="/contribute/">Offer a recording</a>.
</div>`}
</div>
</section>

<section class="wrap" style="padding-bottom:64px">
<div class="split">
<div class="split__main">
${statusNotice}
${verses || ''}
${(!verses && w.textStatus === 'none') ? '' : ''}
</div>
<aside class="split__side">
<div class="panel">
<h2>${bi('About this work', 'ഈ കൃതിയെക്കുറിച്ച്')}</h2>
<p class="small">${bi(w.summaryEn, w.summaryMl, 'span')}</p>
</div>
<div class="panel">
<h2>${bi('Details', 'വിവരങ്ങൾ')}</h2>
<dl>
${meta.filter(([, v]) => v).map(([k, v]) => `<div class="panel__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
</dl>
</div>
<div class="panel">
<h2>${bi('Go deeper', 'കൂടുതൽ')}</h2>
<a href="/learn/">Lessons built on this work</a>
<a href="/listen/">All recordings</a>
<a href="/krithis/">Every work</a>
<a href="/about/">Sources and licences</a>
</div>
</aside>
</div>
</section>

<div class="wrap"><nav class="pager" aria-label="Works">
${prev ? `<a href="${workUrl(prev)}">&larr; ${esc(prev.titleEn)}</a>` : '<span></span>'}
${next ? `<a href="${workUrl(next)}">${esc(next.titleEn)} &rarr;</a>` : '<span></span>'}
</nav></div>`;

  write(`krithis/${w.id}/index.html`,
    head(`${w.titleEn} (${w.titleMl}) — Sree Narayana Guru`,
      w.summaryEn.slice(0, 180),
      workUrl(w)) + body + foot('\n<script src="/assets/js/player.js" defer></script>'));
}

/* ---------- listen ---------- */

function buildListen() {
  const withAudio = works.works.filter(hasAudio);
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Listen</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<h2>${bi('Listen', 'കേൾക്കാം')}</h2>
<p>${bi('Chanting of the krithis, with the text following along. Every recording names its singers, its year and its licence.', 'കൃതികളുടെ പാരായണം, പാഠം ഒപ്പം കാണാം. ഓരോ ശബ്ദരേഖയ്ക്കും ഗായകർ, വർഷം, അനുമതി എന്നിവ രേഖപ്പെടുത്തിയിരിക്കുന്നു.')}</p>
</div>

${withAudio.length === 0 ? `
<div class="notice" style="margin-bottom:30px">
<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1 L19 18 H1 Z M10 7 v5 M10 14.5 v1"/></svg>
<div><strong>No recordings have been added yet.</strong>
The player is built and waiting. What is missing is audio that this site is actually allowed to publish.</div>
</div>

<div class="grid grid--2">
<div class="card"><span class="card__num">A</span><h3>Record new chanting</h3>
<p>Commission choirs, schools or individual singers and release the recordings under a licence you control. This is the cleanest route and the only one that scales to sixty works.</p></div>
<div class="card"><span class="card__num">B</span><h3>Ask for permission</h3>
<p>Write to the Sivagiri Mutt, the Narayana Gurukula and music publishers for permission to host existing recordings. Keep every permission in writing.</p></div>
<div class="card"><span class="card__num">C</span><h3>Check the archives</h3>
<p>Some older material may already be out of copyright. Each item has to be checked individually; age alone is not proof.</p></div>
<div class="card"><span class="card__num">D</span><h3>Credit everything</h3>
<p>Singer, year, licence and source are stored with every file and shown on the page. A recording without that record does not go up.</p></div>
</div>

<h3 style="font-size:26px; margin:44px 0 14px">${bi('Works waiting for a recording', 'ശബ്ദരേഖ കാത്തിരിക്കുന്ന കൃതികൾ')}</h3>
<div class="worklist">
${works.works.filter((w) => w.featured).map(workRow).join('\n')}
</div>
<p class="small muted" style="margin-top:16px">Showing the best known works. <a href="/krithis/">See all ${works.works.length}</a>.</p>
` : `<div class="worklist">${withAudio.map(workRow).join('\n')}</div>`}
</section>`;
  write('listen/index.html',
    head('Listen — recordings of the krithis',
      'Recordings of Sree Narayana Guru’s krithis, each with its singers, year and licence.',
      '/listen/') + body + foot());
}

/* ---------- learn ---------- */

function buildLearn() {
  const paths = lessons.paths;
  const classroom = paths.find((p) => p.id === 'classroom');
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Learn</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<div class="eyebrow">${bi('Learn', 'പഠിക്കാം')}</div>
<h2 style="font-size:clamp(32px,5vw,52px)">${bi('Study the Guru’s message, step by step.', 'ഗുരുവിന്റെ സന്ദേശം ഘട്ടം ഘട്ടമായി പഠിക്കാം.')}</h2>
<p>${bi('Pick the path that fits you. Every lesson ties back to the original verses and their recordings.', 'നിങ്ങൾക്കു ചേരുന്ന വഴി തിരഞ്ഞെടുക്കുക. ഓരോ പാഠവും മൂല ശ്ലോകങ്ങളുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു.')}</p>
</div>
<div class="grid">
${paths.map((p) => `<div class="card">
<span class="card__num">${bi(p.audienceEn, p.audienceMl)}${p.durationEn ? ' · ' + esc(p.durationEn) : ''}</span>
<h3>${bi(p.titleEn, p.titleMl)}</h3>
<p>${bi(p.summaryEn, p.summaryMl, 'span')}</p>
<a class="card__more" href="#${esc(p.id)}">${bi('See what is in it', 'ഉള്ളടക്കം കാണുക')} &rarr;</a>
</div>`).join('\n')}
</div>
</section>

<section class="band"><div class="wrap section" id="meet-the-guru">
<div class="split">
<div class="split__main">
<div class="eyebrow">${bi('Featured path', 'പ്രധാന പഠനവഴി')}</div>
<h2 style="font-size:clamp(28px,4vw,38px)">${bi(paths[0].titleEn, paths[0].titleMl)}</h2>
<p style="color:var(--fg-2)">${bi(paths[0].summaryEn, paths[0].summaryMl, 'span')}</p>
<div class="worklist" style="margin-top:10px">
${paths[0].lessons.map((l, i) => `<div class="workrow">
<span style="flex:0 0 auto; width:34px; height:34px; border-radius:50%; background:${i === 0 ? 'var(--accent)' : 'var(--bg-2)'}; border:1.5px solid var(--fg); display:flex; align-items:center; justify-content:center; font-weight:600; font-size:14px; color:${i === 0 ? '#0F2E2B' : 'inherit'}">${i + 1}</span>
<span class="workrow__titles"><span class="workrow__en">${bi(l.titleEn, l.titleMl)}</span><span class="small muted">${esc(l.bodyEn)}</span></span>
<span class="workrow__meta">${esc(l.kind)}</span>
</div>`).join('\n')}
</div>
<p class="small muted" style="margin-top:14px">[Lesson content is scaffolded here. Write the readings and wire the quiz before launch.]</p>
</div>
<div class="split__side">
<div class="panel">
<h2>${bi('What a lesson looks like', 'ഒരു പാഠം എങ്ങനെയിരിക്കും')}</h2>
<p class="small">One screen, four parts.</p>
<dl>
<div class="panel__row"><dt>1</dt><dd>Listen to the verses chanted</dd></div>
<div class="panel__row"><dt>2</dt><dd>Read the text and its meaning</dd></div>
<div class="panel__row"><dt>3</dt><dd>Sit with one question</dd></div>
<div class="panel__row"><dt>4</dt><dd>Check with three quick questions</dd></div>
</dl>
</div>
<div class="panel">
<h2>${bi('Try a quiz now', 'ഒരു ക്വിസ് പരീക്ഷിക്കൂ')}</h2>
<p class="small muted">Five questions on his life, with the reason for each answer.</p>
<a href="#quiz">Go to the quiz &rarr;</a>
</div>
</div>
</div>
</div></section>

<section class="wrap section" id="quiz">
<div class="section__head"><h2>${bi('The life: five questions', 'ജീവിതം: അഞ്ചു ചോദ്യങ്ങൾ')}</h2>
<p>${bi('Answers show the reason, not just a tick.', 'ഉത്തരത്തോടൊപ്പം കാരണവും കാണാം.')}</p></div>
<div class="stack" data-quiz='${esc(JSON.stringify(lessons.quizzes[0].questions))}' id="quizbox">
<noscript><p class="muted">The quiz needs JavaScript. The questions and answers are in the printable classroom pack.</p></noscript>
</div>
</section>

<section class="quote" id="teachers"><div class="wrap section" style="padding-block:64px">
<div class="section__head" style="margin-bottom:28px">
<h2 style="color:inherit">${bi('For teachers and schools', 'അധ്യാപകർക്കും വിദ്യാലയങ്ങൾക്കും')}</h2>
<p style="color:var(--on-dark-2)">${bi('Free to print and share, in Malayalam and English, with the source of every text shown.', 'അച്ചടിക്കാനും പങ്കുവെക്കാനും സൗജന്യം, മലയാളത്തിലും ഇംഗ്ലീഷിലും.')}</p>
</div>
<div class="grid">
${classroom.resources.map((r) => `<div style="border:1px solid var(--teal-mid); border-radius:var(--radius); padding:22px 24px; display:flex; flex-direction:column; gap:7px">
<strong style="font-family:var(--serif); font-size:21px">${bi(r.titleEn, r.titleMl)}</strong>
<span style="color:var(--on-dark-2); font-size:15px">${esc(r.bodyEn)}</span>
<span style="color:var(--on-dark-2); font-size:13px">${r.file ? '<a href="' + esc(r.file) + '">Download</a>' : '[File to be added]'}</span>
</div>`).join('\n')}
</div>
</div></section>`;

  write('learn/index.html',
    head('Learn — guided study and classroom material',
      'Guided paths through Sree Narayana Guru’s works, quizzes, and free classroom material in Malayalam and English.',
      '/learn/') + body + foot('\n<script src="/assets/js/quiz.js" defer></script>'));
}

/* ---------- life ---------- */

function buildLife() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Life</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<div class="eyebrow">1856 – 1928</div>
<h2 style="font-size:clamp(32px,5vw,52px)">${bi('A life that changed how Kerala thought', 'കേരളത്തിന്റെ ചിന്തയെ മാറ്റിയ ജീവിതം')}</h2>
<p>${bi('From a village teacher called Nanu Asan to the man whose one sentence about caste is carved across the state. Dates follow the published accounts; where sources disagree the page says so.', 'നാണു ആശാൻ എന്ന നാട്ടിൻപുറത്തെ അധ്യാപകനിൽ നിന്ന് കേരളമാകെ ആലേഖനം ചെയ്യപ്പെട്ട വാക്യത്തിന്റെ ഉടമയിലേക്ക്.')}</p>
</div>
<div class="timeline">
${timeline.events.map((e) => `<div class="tl-item" data-major="${!!e.major}">
<span class="tl-item__date">${esc(e.date)}</span>
<span class="tl-item__year">${esc(e.year)}</span>
<h3>${bi(e.titleEn, e.titleMl, 'span')}</h3>
<p>${bi(e.bodyEn, e.bodyMl, 'span')}</p>
${e.note ? `<p class="tl-item__note">${esc(e.note)}</p>` : ''}
<p class="small">
${e.place ? `<a href="/places/#${esc(e.place)}">See the place</a>` : ''}
${e.work ? ` ${e.place ? '·' : ''} <a href="/krithis/${esc(e.work)}/">Read the work</a>` : ''}
</p>
</div>`).join('\n')}
</div>
</section>`;
  write('life/index.html',
    head('Life — a timeline of Sree Narayana Guru',
      'A dated timeline of Sree Narayana Guru’s life, from Chempazhanthy in 1856 to Sivagiri in 1928.',
      '/life/') + body + foot());
}

/* ---------- places ---------- */

function buildPlaces() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Places</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<h2>${bi('Places', 'സ്ഥലങ്ങൾ')}</h2>
<p>${bi('The hill, the river and the ashrams where this life happened. Visiting details are left blank rather than guessed; fill them in from the institutions themselves.', 'ഈ ജീവിതം നടന്ന കുന്നും പുഴയും ആശ്രമങ്ങളും.')}</p>
</div>
<div class="grid">
${places.places.map((p) => `<div class="card" id="${esc(p.id)}">
<span class="card__num">${esc(p.district)}</span>
<h3>${bi(p.nameEn, p.nameMl)}</h3>
<p>${bi(p.summaryEn, p.summaryMl, 'span')}</p>
<dl style="margin:0; display:flex; flex-direction:column; gap:7px; font-size:14px">
<div class="panel__row"><dt>Visiting</dt><dd>${esc(p.visitingEn || '[To be confirmed]')}</dd></div>
<div class="panel__row"><dt>Festival</dt><dd>${esc(p.festivalEn || '[To be confirmed]')}</dd></div>
</dl>
<a class="card__more" href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=15/${p.lat}/${p.lng}" rel="noopener">Open in a map &rarr;</a>
</div>`).join('\n')}
</div>
<p class="small muted" style="margin-top:26px">Coordinates are approximate and should be checked on the ground. An interactive map can replace these cards once the coordinates are confirmed.</p>
</section>`;
  write('places/index.html',
    head('Places — Sivagiri, Aruvippuram, Aluva and more',
      'The places connected with Sree Narayana Guru, with maps and visiting notes.',
      '/places/') + body + foot());
}

/* ---------- library ---------- */

function buildLibrary() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Library</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head">
<h2>${bi('Library', 'ഗ്രന്ഥശാല')}</h2>
<p>${bi('Where to read further, and which archives hold the primary material.', 'കൂടുതൽ വായിക്കാനുള്ള ഇടങ്ങളും പ്രാഥമിക രേഖകൾ സൂക്ഷിക്കുന്ന ശേഖരങ്ങളും.')}</p>
</div>

<h3 style="font-size:26px; margin-bottom:14px">${bi('Sayings', 'വചനങ്ങൾ')}</h3>
<div class="grid grid--2">
${library.sayings.map((s) => `<div class="card">
${s.ml ? `<div class="ml" lang="ml" style="font-size:22px; line-height:1.7">${esc(s.ml)}</div>` : ''}
<p style="font-family:var(--serif); font-style:italic; font-size:18px; color:var(--fg)">${esc(s.en)}</p>
<span class="small muted">${esc(s.sourceEn)}</span>
${s.status !== 'verified' ? '<span class="tag">Not yet verified</span>' : ''}
</div>`).join('\n')}
</div>

<h3 style="font-size:26px; margin:44px 0 14px">${bi('Books and commentaries', 'ഗ്രന്ഥങ്ങളും വ്യാഖ്യാനങ്ങളും')}</h3>
<div class="worklist">
${library.books.map((b) => `<a class="workrow" href="${esc(b.url)}" rel="noopener">
<span class="workrow__titles"><span class="workrow__en">${esc(b.titleEn)}</span><span class="small muted">${esc(b.author)} — ${esc(b.noteEn)}</span></span>
</a>`).join('\n')}
</div>

<h3 style="font-size:26px; margin:44px 0 14px">${bi('Archives', 'രേഖാശേഖരങ്ങൾ')}</h3>
<div class="grid">
${library.archives.map((a) => `<a class="card" href="${esc(a.url)}" rel="noopener">
<h3>${esc(a.titleEn)}</h3><p>${esc(a.noteEn)}</p><span class="card__more">Visit &rarr;</span></a>`).join('\n')}
</div>
</section>`;
  write('library/index.html',
    head('Library — books, sayings and archives',
      'Books, commentaries and archives on Sree Narayana Guru, with sources.',
      '/library/') + body + foot());
}

/* ---------- search, about, contribute ---------- */

function buildSearch() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Search</div>
<section class="wrap section" style="padding-top:28px">
<div class="section__head"><h2>${bi('Search', 'തിരയുക')}</h2>
<p>${bi('Searches titles, verses, summaries, places and the timeline. Type in Malayalam or in English.', 'തലക്കെട്ടുകൾ, ശ്ലോകങ്ങൾ, സ്ഥലങ്ങൾ, കാലരേഖ എന്നിവയിൽ തിരയുന്നു.')}</p></div>
<form role="search" onsubmit="return false">
<label class="sr" for="q">Search</label>
<input class="field" style="width:100%; max-width:640px" id="q" name="q" type="search" data-search-input
 placeholder="Daivadashakam, Aruvippuram, 1888, ദൈവദശകം" autocomplete="off">
</form>
<p class="sr" aria-live="polite" data-search-status></p>
<div class="results" data-search-results></div>
</section>`;
  write('search/index.html',
    head('Search', 'Search the works, life and places of Sree Narayana Guru.', '/search/')
    + body + foot('\n<script src="/assets/js/search.js" defer></script>'));
}

function buildAbout() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / About</div>
<section class="wrap section" style="padding-top:28px; max-width:860px">
<div class="section__head"><h2>${bi('Sources and licences', 'സ്രോതസ്സുകളും അനുമതികളും')}</h2></div>
<div class="stack" style="gap:26px">
<div>
<h3 style="font-size:24px; margin-bottom:8px">The Guru's own writing</h3>
<p style="color:var(--fg-2)">Sree Narayana Guru died in September 1928. Under the Indian Copyright Act the term for a literary work runs for sixty years from the beginning of the year after the author's death, so his original works have been in the public domain in India since 1 January 1989. They can be published here freely. What still matters is accuracy: every text on this site names the printed edition it was transcribed from, and a text that has not been checked against one says so on its own page.</p>
</div>
<div>
<h3 style="font-size:24px; margin-bottom:8px">Translations, commentaries and photographs</h3>
<p style="color:var(--fg-2)">These are a different matter. Modern translations and commentaries are the work of living authors or recent estates and remain under copyright. The same is true of almost every photograph and nearly all existing recordings. Nothing of that kind is copied onto this site from elsewhere. Where such material appears, it is either used with written permission, which is recorded, or it is newly made for this site.</p>
</div>
<div>
<h3 style="font-size:24px; margin-bottom:8px">Recordings</h3>
<p style="color:var(--fg-2)">Each recording carries the singers' names, the year, the licence and the source. A file without that record does not go up. The aim is a complete set of newly recorded chanting released under an open licence, so that schools and families can use it without asking anyone.</p>
</div>
<div>
<h3 style="font-size:24px; margin-bottom:8px">What this site is not</h3>
<p style="color:var(--fg-2)">This is an independent study site. It is not an official publication of the Sivagiri Mutt, the SNDP Yogam, the Narayana Gurukula or any other institution, unless a page says otherwise. Where those institutions have published something, this site links to them rather than reproducing their work.</p>
</div>
<div>
<h3 style="font-size:24px; margin-bottom:8px">Corrections</h3>
<p style="color:var(--fg-2)">Mistakes in a text like this one matter more than usual. If something here is wrong, please say so and it will be fixed and the change noted. <a href="/contribute/">How to get in touch</a>.</p>
</div>
<div>
<h3 style="font-size:24px; margin-bottom:8px">Where the facts came from</h3>
<ul style="color:var(--fg-2); padding-left:20px; display:flex; flex-direction:column; gap:7px">
<li>The catalogue of works, with dates and verse counts, follows <a href="https://sngm.org/index.php/guru/works-of-guru/works-of-narayana-guru" rel="noopener">the list published by the Sree Narayana Guru Mission</a>.</li>
<li>The life dates follow <a href="https://en.wikipedia.org/wiki/Narayana_Guru" rel="noopener">the Wikipedia article on Narayana Guru</a>, cross-checked against the Mission's account.</li>
<li>Background on the literary works draws on <a href="https://www.keralatourism.org/sreenarayanaguru/" rel="noopener">Kerala Tourism's Sree Narayana Guru portal</a>.</li>
<li>Archival material is held by the Narayana Guru Digital Research Resource Platform, led by IIT Bombay, part of which is on <a href="https://www.jstor.org/site/south-asia-open-archives/" rel="noopener">JSTOR through South Asia Open Archives</a>.</li>
</ul>
</div>
</div>
</section>`;
  write('about/index.html',
    head('Sources and licences', 'Where the texts, facts and recordings on this site come from, and how they are licensed.', '/about/')
    + body + foot());
}

function buildContribute() {
  const body = `
<div class="wrap crumbs"><a href="/">Home</a> / Contribute</div>
<section class="wrap section" style="padding-top:28px; max-width:860px">
<div class="section__head">
<h2>${bi('Contribute', 'സംഭാവന ചെയ്യുക')}</h2>
<p>${bi('This site is a frame waiting to be filled. Three kinds of help matter most.', 'ഈ സൈറ്റ് നിറയ്ക്കാൻ കാത്തിരിക്കുന്ന ഒരു ചട്ടക്കൂടാണ്.')}</p>
</div>
<div class="grid">
<div class="card"><span class="card__num">01</span><h3>Transcribe a text</h3>
<p>Most works have no text on the site yet. If you can read Malayalam, Sanskrit or Tamil and have a printed edition in hand, a transcription with the edition named is the single most useful thing you can give.</p></div>
<div class="card"><span class="card__num">02</span><h3>Verify a text</h3>
<p>Texts marked "not yet verified" have been typed in but not checked against print. Checking one against a reliable edition, line by line, turns it into something people can quote.</p></div>
<div class="card"><span class="card__num">03</span><h3>Record chanting</h3>
<p>If you or your school chants these works, a clean recording released under an open licence fills the largest gap on the site. Guidance on recording is below.</p></div>
</div>

<h3 style="font-size:26px; margin:44px 0 12px">Recording notes</h3>
<ul style="color:var(--fg-2); padding-left:20px; display:flex; flex-direction:column; gap:8px; max-width:70ch">
<li>A quiet room and a phone held still is enough. A hard floor and bare walls cause echo, so a room with curtains or cushions is better.</li>
<li>Record each work as one take if you can, and say the work's name at the start of the file.</li>
<li>Send the original file rather than a WhatsApp copy, which is compressed heavily.</li>
<li>Tell us who sang, where, and in which month and year, and confirm in writing that it may be published under an open licence.</li>
</ul>

<h3 style="font-size:26px; margin:44px 0 12px">Get in touch</h3>
<p style="color:var(--fg-2); max-width:70ch">[Add a contact address or a form here before launch. If you keep this site in a Git repository, link the repository too so that corrections can come as pull requests.]</p>
</section>`;
  write('contribute/index.html',
    head('Contribute', 'How to help: transcribe a text, verify one, or record chanting.', '/contribute/')
    + body + foot());
}

function build404() {
  const body = `<section class="wrap section center" style="padding-block:110px">
<h2 style="font-size:46px">Page not found</h2>
<p class="muted" style="margin:14px 0 26px">That page is not here. It may have moved.</p>
<a class="btn btn--primary" href="/">Go to the home page</a>
</section>`;
  write('404.html', head('Page not found', 'Page not found.', '/404.html') + body + foot());
}

/* ---------- search index ---------- */

function buildSearchIndex() {
  const out = [];
  for (const w of works.works) {
    out.push({
      kind: 'Krithi',
      title: w.titleEn,
      titleMl: w.titleMl,
      translit: w.titleTranslit || '',
      summary: w.summaryEn,
      text: (w.verses || []).map((v) => [v.ml, v.translit, v.en].filter(Boolean).join(' ')).join(' ').slice(0, 4000),
      url: workUrl(w)
    });
  }
  for (const e of timeline.events) {
    out.push({ kind: 'Life', title: e.year + ': ' + e.titleEn, titleMl: e.titleMl, translit: '', summary: e.bodyEn, text: e.bodyMl, url: '/life/' });
  }
  for (const p of places.places) {
    out.push({ kind: 'Place', title: p.nameEn, titleMl: p.nameMl, translit: '', summary: p.summaryEn, text: p.summaryMl, url: '/places/#' + p.id });
  }
  for (const s of library.sayings) {
    out.push({ kind: 'Saying', title: s.en, titleMl: s.ml, translit: s.translit, summary: s.sourceEn, text: '', url: '/library/' });
  }
  for (const p of lessons.paths) {
    out.push({ kind: 'Lesson', title: p.titleEn, titleMl: p.titleMl, translit: '', summary: p.summaryEn, text: '', url: '/learn/#' + p.id });
  }
  write('search-index.json', JSON.stringify(out));
}

/* ---------- static extras ---------- */

function buildExtras() {
  const urls = ['/', '/krithis/', '/listen/', '/learn/', '/life/', '/places/', '/library/', '/about/', '/contribute/', '/search/']
    .concat(works.works.map(workUrl));
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${SITE.origin}${u}</loc></url>`).join('\n')}
</urlset>`);

  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE.origin}/sitemap.xml\n`);

  write('manifest.webmanifest', JSON.stringify({
    name: 'Sree Narayana Guru',
    short_name: 'SN Guru',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F2',
    theme_color: '#0F2E2B',
    description: 'The works, life and teaching of Sree Narayana Guru.',
    icons: [{ src: '/assets/img/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
  }, null, 2));

  write('assets/img/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
<rect width="40" height="40" fill="#0F2E2B"/>
<circle cx="20" cy="20" r="15" fill="none" stroke="#FAF8F2" stroke-width="2"/>
<circle cx="20" cy="20" r="9" fill="none" stroke="#E0A526" stroke-width="2"/>
<circle cx="20" cy="20" r="3.5" fill="#FAF8F2"/></svg>`);

  /* Cache the shell; always go to the network first for pages so corrections
     to a text are never served stale from a visitor's device. */
  write('sw.js', `const CACHE = 'sng-v1';
const SHELL = ['/', '/assets/css/site.css', '/assets/js/app.js', '/assets/js/search.js', '/search-index.json', '/404.html'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/audio/')) return;      // never cache large audio
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((m) => m || caches.match('/404.html')))
  );
});`);

  write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: geolocation=(), camera=(), microphone=()
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/audio/*
  Cache-Control: public, max-age=31536000, immutable
/search-index.json
  Cache-Control: public, max-age=3600
`);
}

/* ---------- quiz script ---------- */

function buildQuizScript() {
  write('assets/js/quiz.js', `/* Renders the quiz from the data-quiz attribute. Self-marking, no server. */
(function () {
  'use strict';
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function ready(fn){ if(document.readyState!=='loading')fn(); else document.addEventListener('DOMContentLoaded',fn); }
  ready(function () {
    var box = document.querySelector('[data-quiz]');
    if (!box) return;
    var qs; try { qs = JSON.parse(box.getAttribute('data-quiz')); } catch (e) { return; }
    var html = '';
    qs.forEach(function (q, i) {
      html += '<fieldset style="border:1px solid var(--border); border-radius:var(--radius); padding:22px 24px; background:var(--card)">' +
        '<legend style="font-family:var(--serif); font-size:20px; font-weight:600; padding:0 8px">' + esc(q.q) + '</legend>' +
        '<div class="stack" style="gap:8px; margin-top:10px">' +
        q.options.map(function (o, k) {
          return '<label style="display:flex; gap:11px; align-items:flex-start; min-height:44px; padding:8px 0; cursor:pointer">' +
            '<input type="radio" name="q' + i + '" value="' + k + '" style="margin-top:5px; width:19px; height:19px; accent-color:var(--accent)">' +
            '<span>' + esc(o) + '</span></label>';
        }).join('') +
        '</div><p class="small" data-why="' + i + '" hidden style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border)"></p></fieldset>';
    });
    html += '<div class="row"><button class="btn btn--primary" type="button" data-check>Check my answers</button>' +
      '<span class="muted" data-score aria-live="polite"></span></div>';
    box.innerHTML = html;

    box.querySelector('[data-check]').addEventListener('click', function () {
      var right = 0;
      qs.forEach(function (q, i) {
        var picked = box.querySelector('input[name="q' + i + '"]:checked');
        var why = box.querySelector('[data-why="' + i + '"]');
        if (!picked) { why.hidden = false; why.textContent = 'Not answered. ' + q.why; why.style.color = 'var(--fg-3)'; return; }
        var ok = Number(picked.value) === q.answer;
        if (ok) right++;
        why.hidden = false;
        why.textContent = (ok ? 'Correct. ' : 'Not quite. ') + q.why;
        why.style.color = ok ? 'var(--fg-2)' : 'var(--accent-text)';
      });
      box.querySelector('[data-score]').textContent = right + ' of ' + qs.length + ' correct';
    });
  });
})();`);
}

/* ---------- run ---------- */

function run() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  copyDir(path.join(ROOT, 'audio'), path.join(OUT, 'audio'));

  buildHome();
  buildKrithisIndex();
  const list = works.works;
  list.forEach((w, i) => buildWorkPage(w, list[i - 1], list[i + 1]));
  buildListen();
  buildLearn();
  buildLife();
  buildPlaces();
  buildLibrary();
  buildSearch();
  buildAbout();
  buildContribute();
  build404();
  buildQuizScript();
  buildSearchIndex();
  buildExtras();
  if (RELATIVE) makeRelative();

  const pages = list.length + 10;
  console.log(`Built ${pages} pages into dist/`);
  console.log(`  ${list.length} works, ${list.filter(hasText).length} with text, ${list.filter(hasAudio).length} with audio`);
  console.log(`  origin: ${SITE.origin}  (set SITE_ORIGIN to change)`);
}

run();
