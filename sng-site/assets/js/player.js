/* Audio player for a krithi page.

   The player is built around the fact that for most works there is no
   recording yet. When a work has no audio the controls are disabled and the
   page says plainly what is missing and how to contribute one, rather than
   presenting a play button that does nothing.

   Markup contract (see the generated krithi pages):
     [data-player]            wrapper, carries data-sources='[{...}]'
     [data-play]              play / pause button
     [data-prev] [data-next]  previous / next verse
     [data-scrub]             <input type="range">
     [data-time]              "0:00 / 3:12"
     [data-wave] span         bars, filled to show progress
     [data-credit]            recording credit line
     [data-versions]          version buttons, each data-version-index
     [data-verse="N"]         a verse block, optionally data-start / data-end
*/

(function () {
  'use strict';

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function init(root) {
    var sources;
    try { sources = JSON.parse(root.getAttribute('data-sources') || '[]'); }
    catch (e) { sources = []; }

    var playBtn = root.querySelector('[data-play]');
    var prevBtn = root.querySelector('[data-prev]');
    var nextBtn = root.querySelector('[data-next]');
    var scrub = root.querySelector('[data-scrub]');
    var timeEl = root.querySelector('[data-time]');
    var creditEl = root.querySelector('[data-credit]');
    var bars = root.querySelectorAll('[data-wave] span');
    var verses = document.querySelectorAll('[data-verse]');

    /* No recording: say so and stop. */
    if (!sources.length) {
      [playBtn, prevBtn, nextBtn, scrub].forEach(function (el) {
        if (el) { el.disabled = true; el.setAttribute('aria-disabled', 'true'); }
      });
      if (timeEl) timeEl.textContent = '';
      return;
    }

    var current = 0;
    var audio = new Audio();
    audio.preload = 'metadata';

    function load(i) {
      current = i;
      var src = sources[i];
      audio.src = src.file;
      if (creditEl) creditEl.textContent = src.credit || '';
      var vbtns = root.querySelectorAll('[data-version-index]');
      for (var k = 0; k < vbtns.length; k++) {
        vbtns[k].setAttribute('aria-pressed', String(Number(vbtns[k].getAttribute('data-version-index')) === i));
      }
    }

    function setPlayIcon(playing) {
      if (!playBtn) return;
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      var icon = playBtn.querySelector('svg');
      if (icon) {
        icon.innerHTML = playing
          ? '<rect x="6" y="4" width="5" height="18" /><rect x="15" y="4" width="5" height="18" />'
          : '<path d="M7 4 L21 13 L7 22 Z" />';
      }
    }

    function paint() {
      var d = audio.duration;
      var pct = (d && isFinite(d)) ? audio.currentTime / d : 0;
      if (scrub && document.activeElement !== scrub) scrub.value = String(Math.round(pct * 1000));
      if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + (isFinite(d) ? fmt(d) : '--:--');
      var cut = Math.round(pct * bars.length);
      for (var i = 0; i < bars.length; i++) bars[i].classList.toggle('on', i < cut);
      highlight();
    }

    /* Verse highlighting works when a verse carries data-start.
       Without timings nothing is highlighted, which is correct rather than wrong. */
    function highlight() {
      var t = audio.currentTime, found = null;
      for (var i = 0; i < verses.length; i++) {
        var s = parseFloat(verses[i].getAttribute('data-start'));
        var e = parseFloat(verses[i].getAttribute('data-end'));
        if (isFinite(s) && t >= s && (!isFinite(e) || t < e)) { found = verses[i]; }
      }
      for (var j = 0; j < verses.length; j++) {
        verses[j].setAttribute('data-active', String(verses[j] === found));
      }
    }

    function jump(dir) {
      var t = audio.currentTime, marks = [];
      for (var i = 0; i < verses.length; i++) {
        var s = parseFloat(verses[i].getAttribute('data-start'));
        if (isFinite(s)) marks.push(s);
      }
      if (!marks.length) { audio.currentTime = Math.max(0, t + dir * 15); return; }
      marks.sort(function (a, b) { return a - b; });
      var target = dir < 0 ? 0 : marks[marks.length - 1];
      if (dir < 0) {
        for (var k = marks.length - 1; k >= 0; k--) if (marks[k] < t - 1.5) { target = marks[k]; break; }
      } else {
        for (var m = 0; m < marks.length; m++) if (marks[m] > t + 0.2) { target = marks[m]; break; }
      }
      audio.currentTime = target;
    }

    if (playBtn) playBtn.addEventListener('click', function () {
      if (audio.paused) audio.play().catch(function () {
        if (timeEl) timeEl.textContent = 'This recording could not be played';
      });
      else audio.pause();
    });
    if (prevBtn) prevBtn.addEventListener('click', function () { jump(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { jump(1); });

    if (scrub) scrub.addEventListener('input', function () {
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = (Number(scrub.value) / 1000) * audio.duration;
      }
    });

    root.addEventListener('click', function (e) {
      var vb = e.target.closest('[data-version-index]');
      if (vb) {
        var wasPlaying = !audio.paused;
        load(Number(vb.getAttribute('data-version-index')));
        if (wasPlaying) audio.play().catch(function () {});
      }
    });

    /* Per-verse play buttons */
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-play-verse]');
      if (!b) return;
      var block = b.closest('[data-verse]');
      var s = parseFloat(block && block.getAttribute('data-start'));
      if (isFinite(s)) audio.currentTime = s;
      audio.play().catch(function () {});
    });

    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('loadedmetadata', paint);
    audio.addEventListener('play', function () { setPlayIcon(true); });
    audio.addEventListener('pause', function () { setPlayIcon(false); });
    audio.addEventListener('ended', function () { setPlayIcon(false); });
    audio.addEventListener('error', function () {
      if (timeEl) timeEl.textContent = 'Recording not found';
    });

    load(0);
    setPlayIcon(false);
    paint();
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var roots = document.querySelectorAll('[data-player]');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  });
})();
