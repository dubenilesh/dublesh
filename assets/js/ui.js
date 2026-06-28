/* Dublesh v6.9.9 — ui.js */
(function() {
  'use strict';
  function Carousel(config) {
    var self    = this;
    self.total  = config.total;
    self.cur    = 0;
    var trackEl = document.getElementById(config.trackId);
    var dotsEl  = document.getElementById(config.dotsId);
    var prevEl  = document.getElementById(config.prevId);
    var nextEl  = document.getElementById(config.nextId);
    var tabsSel = config.tabSelector;
    var vpEl    = document.getElementById(config.viewportId);
    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      for (var i = 0; i < self.total; i++) {
        var b = document.createElement('button');
        b.className = 'seo-cats-dot' + (i === 0 ? ' active' : '');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.dataset.slide = i;
        (function(idx) {
          b.onclick = function() { self.goto(idx); };
        })(i);
        dotsEl.appendChild(b);
      }
    }
    function syncUI() {
      if (trackEl) trackEl.style.transform = 'translateX(-' + self.cur + '00%)';
      document.querySelectorAll(tabsSel).forEach(function(t, i) {
        t.classList.toggle('active', i === self.cur);
        t.setAttribute('aria-selected', i === self.cur ? 'true' : 'false');
      });
      dotsEl && dotsEl.querySelectorAll('.seo-cats-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === self.cur);
        d.setAttribute('aria-pressed', i === self.cur ? 'true' : 'false');
      });
      if (prevEl) { prevEl.disabled = self.cur === 0; }
      if (nextEl) { nextEl.disabled = self.cur === self.total - 1; }
    }
    self.goto = function(idx) {
      self.cur = Math.max(0, Math.min(self.total - 1, idx));
      syncUI();
    };
    self.nav = function(dir) { self.goto(self.cur + dir); };
    if (vpEl) {
      vpEl.setAttribute('tabindex', '0');
      vpEl.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); self.nav(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); self.nav(1); }
        if (e.key === 'Home')       { e.preventDefault(); self.goTo(0); }
        if (e.key === 'End')        { e.preventDefault(); self.goTo(self.total - 1); }
      });
    }
    var _startX = null, _startY = null;
    function onTouchStart(e) {
      _startX = e.touches[0].clientX;
      _startY = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
      if (_startX === null) return;
      var dx = e.changedTouches[0].clientX - _startX;
      var dy = e.changedTouches[0].clientY - _startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        self.nav(dx < 0 ? 1 : -1);
      }
      _startX = _startY = null;
    }
    if (vpEl) {
      vpEl.addEventListener('touchstart', onTouchStart, { passive: true });
      vpEl.addEventListener('touchend',   onTouchEnd,   { passive: true });
    }
    buildDots();
    syncUI();
  }
  document.addEventListener('DOMContentLoaded', function() {
    var catCarousel = new Carousel({
      total:      6,
      trackId:    'seoCatsTrack',
      dotsId:     'seoDots',
      prevId:     'seoPrev',
      nextId:     'seoNext',
      viewportId: 'seoCatsViewport',
      tabSelector: '#seoCatsTabs .seo-cat-tab'
    });
    window.seoCatGoto = function(idx) { catCarousel.goto(idx); };
    window.seoCatNav  = function(dir) { catCarousel.nav(dir); };
    var whyCarousel = new Carousel({
      total:      6,
      trackId:    'seoWhyTrack',
      dotsId:     'whyDots',
      prevId:     'whyPrev',
      nextId:     'whyNext',
      viewportId: 'seoWhyViewport',
      tabSelector: '#seoWhyTabs .seo-cat-tab'
    });
    window.seoWhyGoto = function(idx) { whyCarousel.goto(idx); };
    window.seoWhyNav  = function(dir) { whyCarousel.nav(dir); };
  });
})();

(function() {
  'use strict';
  var _cur = 0;
  var _total = 6;
  var _searching = false;
  function track()  { return document.getElementById('faqTrack'); }
  function dots()   { return document.getElementById('faqDots'); }
  function tabs()   { return document.querySelectorAll('.faq-tab'); }
  function chip()   { return document.getElementById('faqChip'); }
  function buildDots() {
    var el = dots();
    if (!el) return;
    el.innerHTML = '';
    for (var i = 0; i < _total; i++) {
      var b = document.createElement('button');
      b.className = 'faq-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      (function(idx) { b.onclick = function() { faqGoto(idx); }; })(i);
      el.appendChild(b);
    }
  }
  function syncUI() {
    if (_searching) return;
    var t = track();
    if (t) t.style.transform = 'translateX(-' + _cur + '00%)';
    tabs().forEach(function(tb, i) {
      tb.classList.toggle('active', i === _cur);
      tb.setAttribute('aria-selected', i === _cur ? 'true' : 'false');
    });
    dots() && dots().querySelectorAll('.faq-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === _cur);
      d.setAttribute('aria-pressed', i === _cur ? 'true' : 'false');
    });
    var prev = document.getElementById('faqPrev');
    var next = document.getElementById('faqNext');
    if (prev) prev.disabled = _cur === 0;
    if (next) next.disabled = _cur === _total - 1;
  }
  window.faqGoto = function(idx) {
    _cur = Math.max(0, Math.min(_total - 1, idx));
    _searching = false;
    document.querySelectorAll('.faq-item').forEach(function(el) {
      el.style.display = '';
    });
    document.querySelectorAll('.faq-slide').forEach(function(sl) {
      sl.style.display = '';
    });
    document.querySelector('.faq-empty') && (document.querySelector('.faq-empty').classList.remove('on'));
    var searchEl = document.getElementById('faqSearch');
    if (searchEl) searchEl.value = '';
    var c = chip();
    if (c) c.classList.remove('on');
    syncUI();
  };
  window.faqNav = function(dir) { faqGoto(_cur + dir); };
  window.faqFilterQ = function(q) {
    q = (q || '').toLowerCase().trim();
    if (!q) { faqGoto(_cur); return; }
    _searching = true;
    var t = track();
    if (t) t.style.transform = 'translateX(0)';
    var slides = document.querySelectorAll('.faq-slide');
    var allItems = document.querySelectorAll('.faq-item');
    var matched = 0;
    slides.forEach(function(sl) { sl.style.display = 'block'; sl.style.flex = '0 0 100%'; });
    if (t) { t.style.flexWrap = 'wrap'; t.style.transform = 'none'; }
    allItems.forEach(function(item) {
      var text = (item.textContent || '').toLowerCase();
      var topic = (item.closest('.faq-slide') ? item.closest('.faq-slide').dataset.ftopic || '' : '').toLowerCase();
      var show = text.includes(q) || topic.includes(q);
      item.style.display = show ? '' : 'none';
      if (show) matched++;
    });
    slides.forEach(function(sl) {
      var visible = Array.from(sl.querySelectorAll('.faq-item')).some(function(el) {
        return el.style.display !== 'none';
      });
      sl.style.display = visible ? 'block' : 'none';
    });
    var c = chip();
    if (c) {
      c.textContent = matched + ' result' + (matched !== 1 ? 's' : '');
      c.classList.toggle('on', true);
    }
    var emptyEl = document.querySelector('.faq-empty');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.className = 'faq-empty';
      var vp = document.querySelector('.faq-viewport');
      if (vp) vp.appendChild(emptyEl);
    }
    if (matched === 0) {
      emptyEl.innerHTML = '🔍 No FAQs match <strong>"' + q.slice(0, 40).replace(/</g,'&lt;') + '"</strong><br><span style="font-size:.8rem;color:var(--tx3)">Try a shorter or different term</span>';
      emptyEl.classList.add('on');
    } else {
      emptyEl.classList.remove('on');
    }
  };
  document.addEventListener('DOMContentLoaded', function() {
    buildDots();
    syncUI();
    var vp = document.getElementById('faqViewport');
    if (vp) {
      vp.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); faqNav(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); faqNav(1); }
        if (e.key === 'Home')       { e.preventDefault(); faqGoto(0); }
        if (e.key === 'End')        { e.preventDefault(); faqGoto(document.querySelectorAll('.faq-slide').length - 1); }
      });
      var _sx = null, _sy = null;
      vp.addEventListener('touchstart', function(e) {
        _sx = e.touches[0].clientX; _sy = e.touches[0].clientY;
      }, {passive: true});
      vp.addEventListener('touchend', function(e) {
        if (_sx === null) return;
        var dx = e.changedTouches[0].clientX - _sx;
        var dy = e.changedTouches[0].clientY - _sy;
        if (!_searching && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          faqNav(dx < 0 ? 1 : -1);
        }
        _sx = _sy = null;
      }, {passive: true});
    }
  });
})();


// ── LIBRARY LOAD STATUS ─────────────────────────────────────────
(function(){
  var bar = document.createElement('div');
  bar.id = 'lib-status-bar';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#1e40af;color:#fff;font-size:.75rem;font-weight:600;padding:.45rem 1rem;text-align:center;transform:translateY(100%);transition:transform .3s;pointer-events:none';
  bar.textContent = '⏳ Loading PDF libraries…';
  document.body.appendChild(bar);
  
  var checkInterval = setInterval(function(){
    if(typeof PDFLib !== 'undefined' && typeof pdfjsLib !== 'undefined' && typeof JSZip !== 'undefined'){
      clearInterval(checkInterval);
      bar.textContent = '✓ Ready';
      bar.style.background = '#16a34a';
      bar.style.transform = 'translateY(0)';
      setTimeout(function(){ bar.style.transform = 'translateY(100%)'; }, 1200);
    }
  }, 100);
  
  // Show bar after 800ms if libs still not loaded
  setTimeout(function(){
    if(!(typeof PDFLib !== 'undefined' && typeof pdfjsLib !== 'undefined')){
      bar.style.transform = 'translateY(0)';
    }
  }, 800);
  
  // After 15s show error
  setTimeout(function(){
    if(typeof PDFLib === 'undefined' || typeof pdfjsLib === 'undefined'){
      bar.style.background = '#dc2626';
      bar.textContent = '⚠ PDF libraries failed to load — check internet connection and refresh';
      bar.style.transform = 'translateY(0)';
      bar.style.pointerEvents = 'auto';
    }
  }, 15000);
})();


(function() {
  'use strict';
  var landing   = document.querySelector('.dub-landing');
  var dubNav    = document.getElementById('dubNav');
  var appHeader = document.getElementById('appHeader');
  function onScroll() {
    if (!landing) return;
    var landingBottom = landing.getBoundingClientRect().bottom;
    var pastLanding   = landingBottom <= 0;
    var wasPast = document.body.classList.contains('dub-tools-view');
    // READ layout before writing class — eliminates forced reflow
    var hh = (pastLanding && appHeader) ? (appHeader.offsetHeight || 60) : 0;
    document.body.classList.toggle('dub-tools-view', pastLanding); // WRITE class
    if (pastLanding && appHeader) {
      document.documentElement.style.setProperty('--hdr-total', hh + 'px');
      document.querySelectorAll('.tabs-wrap').forEach(function(t) {
        t.style.top = hh + 'px';
      });
    } else {
      document.documentElement.style.setProperty('--hdr-total', '0px');
      document.querySelectorAll('.tabs-wrap').forEach(function(t) {
        t.style.top = '';
        t.style.position = '';
      });
    }
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();
  document.querySelectorAll('a[href="#about"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('about') || document.querySelector('.seo-section');
      if (target) target.scrollIntoView({behavior: 'smooth'});
    });
  });
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusSearch();
    }
  });
  var searchIn = document.getElementById('searchIn');
  var sclear   = document.querySelector('.hdr-search-inline .sclear');
  var srchKbd  = document.querySelector('.hdr-search-inline .srch-kbd');
  if (searchIn && sclear) {
    searchIn.addEventListener('input', function() {
      var hasVal = searchIn.value.length > 0;
      sclear.classList.toggle('show', hasVal);
      if (srchKbd) srchKbd.style.display = hasVal ? 'none' : '';
    });
    sclear.addEventListener('click', function() {
      clearSearch();
      sclear.classList.remove('show');
      if (srchKbd) srchKbd.style.display = '';
      searchIn.focus();
    });
  }
})();