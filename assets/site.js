// sicklab.it — lingua, menu, comparse, hero, video, temi, prima/dopo, passi, numeri.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // ---------- language ----------
  function saved() { try { return localStorage.getItem('lang'); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem('lang', l); } catch (e) {} }
  var q = new URLSearchParams(location.search).get('lang');
  var lang = q === 'it' || q === 'en' ? q : saved() || ((navigator.language || '').toLowerCase().indexOf('it') === 0 ? 'it' : 'en');
  function setLang(l) {
    lang = l; root.setAttribute('data-lang', l); root.setAttribute('lang', l); save(l);
    $$('[data-src-en]').forEach(function (el) { var s = el.getAttribute('data-src-' + l); if (el.getAttribute('src') !== s) el.setAttribute('src', s); });
    $$('video[data-video-en]').forEach(function (v) {
      var s = v.getAttribute('data-video-' + l);
      if (v.getAttribute('src') !== s) { var playing = !v.paused; v.setAttribute('src', s); v.setAttribute('poster', v.getAttribute('data-poster-' + l)); v.load(); if (playing) v.play().catch(function () {}); }
    });
    $$('[data-ph-en]').forEach(function (el) { el.setAttribute('placeholder', el.getAttribute('data-ph-' + l)); });
    var t = $('meta[name="title-' + l + '"]'); if (t) document.title = t.content;
    document.dispatchEvent(new CustomEvent('langchange'));
  }
  setLang(lang);

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]'); if (b) return setLang(b.getAttribute('data-set'));
    if (e.target.closest('.menu-btn')) return $('.nav .links').classList.toggle('open');
    if (e.target.closest('.nav .links a')) $('.nav .links').classList.remove('open');
  });

  // ---------- reveal on scroll ----------
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); ro.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('.rv').forEach(function (el) { ro.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  // play looping clips only while visible
  if ('IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (x) { var v = x.target; if (x.isIntersecting) v.play().catch(function () {}); else v.pause(); });
    }, { threshold: 0.15 });
    $$('video.loop').forEach(function (v) { vo.observe(v); });
  }

  // ---------- scroll-driven: hero tilt, statement words, steps ----------
  var mac = $('.stage .mac'), car = $('.stage .car'), stage = $('.stage');
  // the statement lights up word by word while you scroll
  $$('.big-statement > [lang]').forEach(function (s) {
    s.innerHTML = s.textContent.split(/(\s+)/).map(function (w) { return /\s/.test(w) || !w ? w : '<span class="w">' + w + '</span>'; }).join('');
  });
  function words() { return $$('.big-statement > [lang="' + lang + '"] .w'); }
  document.addEventListener('langchange', function () { onScroll(); });
  var stepsEl = $('.steps2'), stepItems = $$('.steps2 li'), stepShots = $$('.steps2 .shot img'), bar = $('.steps2 .progress i');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = innerHeight;
    if (stage && !reduce) {
      var r = stage.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, 1 - (r.top - vh * 0.15) / (vh * 0.75)));
      mac.style.transform = 'rotateX(' + (18 * (1 - p)).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * p).toFixed(4) + ')';
      if (car) car.style.transform = 'translateY(' + (60 * (1 - p)).toFixed(1) + 'px)';
    }
    var ws = words();
    if (ws.length) {
      var s = $('.big-statement').getBoundingClientRect();
      var k = Math.min(1, Math.max(0, (vh * 0.8 - s.top) / (s.height + vh * 0.3)));
      var n = reduce ? ws.length : Math.round(k * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
    }
    if (stepsEl) {
      var best = 0, bestD = 1e9;
      stepItems.forEach(function (li, i) {
        var b = li.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - vh * 0.45);
        if (d < bestD) { bestD = d; best = i; }
      });
      stepItems.forEach(function (li, i) { li.classList.toggle('on', i === best); li.classList.toggle('done', i < best); });
      stepShots.forEach(function (im, i) { im.classList.toggle('on', i === best); });
      if (bar) bar.style.width = ((best + 1) / stepItems.length * 100) + '%';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();

  // ---------- the film ----------
  $$('.film').forEach(function (f) {
    var v = $('video', f);
    f.addEventListener('click', function () {
      if (v.paused) { v.muted = false; v.controls = true; v.play(); f.classList.add('playing'); }
    });
    v.addEventListener('ended', function () { f.classList.remove('playing'); v.controls = false; });
  });

  // ---------- try a theme ----------
  var tester = $('.tester');
  if (tester) {
    var chips = $$('.chip', tester), layers = $$('.screen > *', tester), src = $('.src', tester), timer = null, auto = true;
    function show(i, byUser) {
      chips.forEach(function (c, j) { c.classList.toggle('on', i === j); c.classList.toggle('auto', auto && i === j); });
      layers.forEach(function (l, j) {
        l.classList.toggle('on', i === j);
        if (l.tagName === 'VIDEO') { if (i === j) { l.currentTime = 0; l.play().catch(function () {}); } else l.pause(); }
      });
      var c = chips[i];
      src.innerHTML = (lang === 'it' ? 'Fonte: ' : 'Source: ') + '<a href="https://github.com/' + c.getAttribute('data-repo') + '" rel="noopener">github.com/' + c.getAttribute('data-repo') + '</a>' + (c.getAttribute('data-lic') ? ' · ' + c.getAttribute('data-lic') : '');
      clearTimeout(timer);
      if (auto && !reduce) timer = setTimeout(function () { if (inView) show((i + 1) % chips.length); else waiting = true; }, 3200);
      cur = i;
    }
    var cur = 0, inView = false, waiting = false;
    chips.forEach(function (c, i) { c.addEventListener('click', function () { auto = false; show(i, true); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      inView = es[0].isIntersecting; if (inView && waiting) { waiting = false; show((cur + 1) % chips.length); }
    }, { threshold: 0.3 }).observe(tester);
    document.addEventListener('langchange', function () { show(cur); });
    show(0);
  }

  // ---------- before / after ----------
  $$('.ba').forEach(function (ba) {
    var drag = false;
    function at(x) { var r = ba.getBoundingClientRect(); ba.style.setProperty('--p', Math.min(100, Math.max(0, (x - r.left) / r.width * 100)) + '%'); }
    ba.addEventListener('pointerdown', function (e) { drag = true; ba.setPointerCapture(e.pointerId); at(e.clientX); });
    ba.addEventListener('pointermove', function (e) { if (drag) at(e.clientX); });
    ba.addEventListener('pointerup', function () { drag = false; });
    ba.addEventListener('keydown', function (e) {
      var p = parseFloat(getComputedStyle(ba).getPropertyValue('--p')) || 50;
      if (e.key === 'ArrowLeft') ba.style.setProperty('--p', Math.max(0, p - 5) + '%');
      if (e.key === 'ArrowRight') ba.style.setProperty('--p', Math.min(100, p + 5) + '%');
    });
    // a gentle hint the first time it comes into view
    if ('IntersectionObserver' in window && !reduce) {
      var once = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; once.disconnect();
        var t0 = performance.now();
        (function anim(t) {
          var k = Math.min(1, (t - t0) / 1800), p = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k);
          if (!drag) ba.style.setProperty('--p', p + '%');
          if (k < 1) requestAnimationFrame(anim);
        })(t0);
      }, { threshold: 0.6 });
      once.observe(ba);
    }
  });

  // ---------- counters ----------
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return; co.unobserve(x.target);
        var el = x.target, to = parseFloat(el.getAttribute('data-to')), t0 = performance.now();
        if (reduce) { el.textContent = to; return; }
        (function tick(t) { var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: 0.6 });
    $$('[data-to]').forEach(function (el) { co.observe(el); });
  }

  // ---------- guide: chapter in view ----------
  var links = $$('.doc aside a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting && map[x.target.id]) { links.forEach(function (a) { a.classList.remove('on'); }); map[x.target.id].classList.add('on'); } });
    }, { rootMargin: '-80px 0px -70% 0px' });
    $$('.doc article section[id]').forEach(function (s) { so.observe(s); });
  }

  // ---------- help: search ----------
  var box = $('.search');
  if (box) box.addEventListener('input', function () {
    var w = box.value.trim().toLowerCase();
    $$('.prob').forEach(function (p) { p.style.display = !w || p.textContent.toLowerCase().indexOf(w) >= 0 ? '' : 'none'; });
  });
})();
