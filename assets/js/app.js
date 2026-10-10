/* Site-wide behaviour: language, theme, nav state, service worker.
   No framework, no build step. Everything degrades to a readable page. */

(function () {
  'use strict';

  var LANG_KEY = 'sng.lang';
  var THEME_KEY = 'sng.theme';

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); }
    catch (e) { return null; }
  }

  /* ---- Language ----------------------------------------------------- */
  /* Elements carry data-lang="en" or data-lang="ml". Both are in the HTML,
     so the page is readable and indexable with JavaScript switched off;
     we only hide one set once JS runs. */

  function applyLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    var nodes = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < nodes.length; i++) {
      var want = nodes[i].getAttribute('data-lang');
      nodes[i].hidden = (want !== lang);
    }
    var btns = document.querySelectorAll('[data-lang-toggle]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-label', lang === 'en' ? 'Switch to Malayalam' : 'Switch to English');
      var label = btns[j].querySelector('[data-lang-label]');
      if (label) label.textContent = lang === 'en' ? 'മലയാളം' : 'English';
    }
    store(LANG_KEY, lang);
  }

  function initLang() {
    var saved = store(LANG_KEY);
    var lang = saved || (/^ml\b/.test(navigator.language || '') ? 'ml' : 'en');
    applyLang(lang);
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-lang-toggle]') : null;
      if (!btn) return;
      e.preventDefault();
      applyLang(document.documentElement.getAttribute('data-lang') === 'en' ? 'ml' : 'en');
    });
  }

  /* ---- Theme -------------------------------------------------------- */

  function applyTheme(theme) {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    store(THEME_KEY, theme);
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-label', 'Change colour theme, currently ' + theme);
    }
  }

  function initTheme() {
    var saved = store(THEME_KEY);
    if (saved) applyTheme(saved);
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
      if (!btn) return;
      e.preventDefault();
      var cur = store(THEME_KEY) || 'auto';
      applyTheme(cur === 'auto' ? 'light' : cur === 'light' ? 'dark' : 'auto');
    });
  }

  /* ---- Current nav item --------------------------------------------- */

  function initNav() {
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      var p = links[i].pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
      if (p === here || (p !== '/' && here.indexOf(p) === 0)) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* ---- Tabs --------------------------------------------------------- */

  function initTabs() {
    var lists = document.querySelectorAll('[role="tablist"]');
    for (var i = 0; i < lists.length; i++) {
      (function (list) {
        var tabs = list.querySelectorAll('[role="tab"]');
        function select(tab) {
          for (var k = 0; k < tabs.length; k++) {
            var on = tabs[k] === tab;
            tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
            tabs[k].tabIndex = on ? 0 : -1;
            var panel = document.getElementById(tabs[k].getAttribute('aria-controls'));
            if (panel) panel.hidden = !on;
          }
        }
        list.addEventListener('click', function (e) {
          var t = e.target.closest('[role="tab"]');
          if (t) select(t);
        });
        list.addEventListener('keydown', function (e) {
          var idx = Array.prototype.indexOf.call(tabs, document.activeElement);
          if (idx < 0) return;
          var next = e.key === 'ArrowRight' ? idx + 1 : e.key === 'ArrowLeft' ? idx - 1 : -1;
          if (next < 0) return;
          e.preventDefault();
          var el = tabs[(next + tabs.length) % tabs.length];
          el.focus(); select(el);
        });
      })(lists[i]);
    }
  }

  /* ---- Filter chips -------------------------------------------------- */

  function initFilters() {
    var groups = document.querySelectorAll('[data-filter-group]');
    for (var i = 0; i < groups.length; i++) {
      (function (group) {
        var targetSel = group.getAttribute('data-filter-target');
        group.addEventListener('click', function (e) {
          var chip = e.target.closest('.chip');
          if (!chip) return;
          var chips = group.querySelectorAll('.chip');
          for (var k = 0; k < chips.length; k++) chips[k].setAttribute('aria-pressed', String(chips[k] === chip));
          var val = chip.getAttribute('data-filter');
          var items = document.querySelectorAll(targetSel + ' [data-facets]');
          var shown = 0;
          for (var m = 0; m < items.length; m++) {
            var ok = val === 'all' || items[m].getAttribute('data-facets').split(' ').indexOf(val) > -1;
            items[m].hidden = !ok;
            if (ok) shown++;
          }
          var count = document.querySelector('[data-filter-count]');
          if (count) count.textContent = String(shown);
        });
      })(groups[i]);
    }
  }

  /* ---- Service worker ------------------------------------------------ */

  function initSW() {
    if (!('serviceWorker' in navigator)) return;
    /* Relative builds are previews served from a sub-path; a worker scoped to
       the site root would be wrong there. */
    if (typeof window.SNG_BASE === 'string') return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* offline is a bonus, not a requirement */ });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initLang(); initTheme(); initNav(); initTabs(); initFilters(); initSW();
  });

  window.SNG = { applyLang: applyLang, applyTheme: applyTheme };
})();
