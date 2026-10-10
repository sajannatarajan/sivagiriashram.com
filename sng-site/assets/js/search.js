/* Client-side search over a JSON index built at deploy time.

   Matches Malayalam, English and romanised transliteration in one query.
   The index is small enough (a few tens of KB) to fetch once and keep. */

(function () {
  'use strict';

  var index = null;
  var loading = null;
  /* Set on pages built in relative mode (file:// or a sub-path host). */
  var BASE = (typeof window.SNG_BASE === 'string') ? window.SNG_BASE : '';
  var SEARCH_PAGE = BASE ? BASE + '/search/index.html' : '/search/';

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(BASE + '/search-index.json')
      .then(function (r) { if (!r.ok) throw new Error('index'); return r.json(); })
      .then(function (data) { index = data; return index; });
    return loading;
  }

  /* Fold romanised diacritics so "atmopadesa" finds "Ātmōpadēśa". */
  function fold(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-̣̱ͯ̄]/g, '')
      .replace(/[^a-z0-9ഀ-ൿ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function score(entry, terms) {
    var hay = entry._f || (entry._f = fold([entry.title, entry.titleMl, entry.translit, entry.text, entry.summary].join(' ')));
    var titleHay = entry._ft || (entry._ft = fold([entry.title, entry.titleMl, entry.translit].join(' ')));
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) continue;
      if (titleHay.indexOf(t) > -1) total += 10;
      else if (hay.indexOf(t) > -1) total += 3;
      else return 0;
      if (titleHay.split(' ').indexOf(t) > -1) total += 6;
    }
    return total;
  }

  function snippet(entry, terms) {
    var src = entry.text || entry.summary || '';
    if (!src) return '';
    var folded = fold(src);
    var at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = folded.indexOf(terms[i]);
    var start = at > 60 ? at - 60 : 0;
    var cut = src.slice(start, start + 190);
    return (start > 0 ? '…' : '') + cut + (start + 190 < src.length ? '…' : '');
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function render(list, terms, out, q) {
    if (!q) { out.innerHTML = ''; return; }
    if (!list.length) {
      out.innerHTML = '<p class="muted">Nothing found for ' + esc(q) +
        '. Try a title, a verse, a place or a year.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < Math.min(list.length, 30); i++) {
      var e = list[i];
      html += '<a class="result" href="' + esc(e.url) + '">' +
        '<span class="result__kind">' + esc(e.kind) + '</span>' +
        '<strong>' + esc(e.title) + (e.titleMl ? ' <span class="ml muted">' + esc(e.titleMl) + '</span>' : '') + '</strong>' +
        (snippet(e, terms) ? '<span class="small muted">' + esc(snippet(e, terms)) + '</span>' : '') +
        '</a>';
    }
    out.innerHTML = html;
  }

  function wire(input, out, status) {
    var timer;
    function run() {
      var q = input.value.trim();
      if (!q) { render([], [], out, ''); if (status) status.textContent = ''; return; }
      load().then(function (data) {
        var terms = fold(q).split(' ').filter(Boolean);
        var hits = [];
        for (var i = 0; i < data.length; i++) {
          var s = score(data[i], terms);
          if (s > 0) hits.push({ e: data[i], s: s });
        }
        hits.sort(function (a, b) { return b.s - a.s; });
        var list = hits.map(function (h) { return h.e; });
        render(list, terms, out, q);
        if (status) status.textContent = list.length + ' result' + (list.length === 1 ? '' : 's') + ' for ' + q;
      }).catch(function () {
        out.innerHTML = '<p class="muted">Search is unavailable right now.</p>';
      });
    }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 140); });
    input.addEventListener('search', run);
    var form = input.closest('form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    if (input.value) run();
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var input = document.querySelector('[data-search-input]');
    var out = document.querySelector('[data-search-results]');
    if (!input) return;

    /* The header search box on other pages sends you to /search/ */
    if (!out) {
      var form = input.closest('form');
      if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        location.href = SEARCH_PAGE + '?q=' + encodeURIComponent(input.value.trim());
      });
      return;
    }

    var params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    wire(input, out, document.querySelector('[data-search-status]'));
    input.focus();
  });
})();
