/* Dublesh v6.9.9 — analytics.js */
'use strict';

// SEO ROUTE HANDLER — open tool when user lands on clean URL like /merge-pdf/
(function() {
  'use strict';
  var path = location.pathname.replace(/\/+/g, '/').replace(/^\/|\/$|/g, '');
  if (!path || path === '') return; // homepage — do nothing
  var tid = window._SLUG_TO_ID && window._SLUG_TO_ID[path];
  if (tid && typeof openTool === 'function' && window.TOOLS && window.TOOLS[tid]) {
    // Wait for DOM ready then open the tool
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { openTool(tid); });
    } else {
      openTool(tid);
    }
  }
  // Also handle closing modal restores canonical URL
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && window._TOOL_SLUGS) {
      var ov = document.getElementById('overlay');
      if (!ov || !ov.classList.contains('open')) {
        if (location.pathname !== '/') history.pushState({}, 'Dublesh — Free PDF Tools', '/');
        var _c = document.querySelector('link[rel="canonical"]');
        if (_c) _c.href = 'https://www.dublesh.com/';
        var _o = document.querySelector('meta[property="og:url"]');
        if (_o) _o.setAttribute('content', 'https://www.dublesh.com/');
        document.title = 'Dublesh — 51 Free PDF Tools. No Uploads.';
      }
    }
  });
})();
