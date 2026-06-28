/* Dublesh v6.9.9 — fixes.js */
(function(){
'use strict';
var _cropState = {};
window.initCropPreview = function(id) {
  awaitLibs().then(function() {
    var f = S[id] && S[id].files;
    if (!f || !f.length) return;
    var wrap = document.getElementById('crop-preview-wrap-' + id);
    if (wrap) wrap.style.display = 'block';
    f[0].arrayBuffer().then(function(buf) {
      return pdfjsLib.getDocument({data: buf}).promise;
    }).then(function(pdf) {
      _cropState[id] = {pdf: pdf, dragging: false, sx:0, sy:0, ex:100, ey:100, x1:0, y1:0, x2:1, y2:1};
      _renderCropBg(id);
      _bindCropDrag(id);
    }).catch(function(){});
  });
};
function _renderCropBg(id) {
  var st = _cropState[id];
  if (!st || !st.pdf) return;
  st.pdf.getPage(1).then(function(page) {
    var bgCanvas = document.getElementById('crop-bg-' + id);
    var ovCanvas = document.getElementById('crop-ov-' + id);
    if (!bgCanvas || !ovCanvas) return;
    var wrap = document.getElementById('crop-canvaswrap-' + id);
    var maxW = (wrap ? wrap.clientWidth : 420) || 420;
    var vp0 = page.getViewport({scale:1});
    var sc = maxW / vp0.width;
    var vp = page.getViewport({scale: sc});
    bgCanvas.width = ovCanvas.width = vp.width;
    bgCanvas.height = ovCanvas.height = vp.height;
    page.render({canvasContext: bgCanvas.getContext('2d'), viewport: vp}).promise.then(function() {
      _drawCropOverlay(id);
    });
  });
}
function _drawCropOverlay(id) {
  var st = _cropState[id];
  var bgCanvas = document.getElementById('crop-bg-' + id);
  var ovCanvas = document.getElementById('crop-ov-' + id);
  if (!ovCanvas || !bgCanvas) return;
  var ctx = ovCanvas.getContext('2d');
  var W = ovCanvas.width, H = ovCanvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  var lv = parseFloat(document.getElementById('crop-l-' + id).value)||0;
  var rv = parseFloat(document.getElementById('crop-r-' + id).value)||0;
  var tv = parseFloat(document.getElementById('crop-t-' + id).value)||0;
  var bv = parseFloat(document.getElementById('crop-b-' + id).value)||0;
  var bgW = bgCanvas.width, bgH = bgCanvas.height;
  var sx = Math.round(lv / 297 * bgW);
  var sy = Math.round(tv / 210 * bgH);
  var ex = bgW - Math.round(rv / 297 * bgW);
  var ey = bgH - Math.round(bv / 210 * bgH);
  sx = Math.max(0, Math.min(sx, bgW)); sy = Math.max(0, Math.min(sy, bgH));
  ex = Math.max(sx+4, Math.min(ex, bgW)); ey = Math.max(sy+4, Math.min(ey, bgH));
  ctx.fillRect(0, 0, bgW, sy);
  ctx.fillRect(0, ey, bgW, bgH - ey);
  ctx.fillRect(0, sy, sx, ey - sy);
  ctx.fillRect(ex, sy, bgW - ex, ey - sy);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx, sy, ex - sx, ey - sy);
  [[sx,sy],[ex,sy],[sx,ey],[ex,ey]].forEach(function(p) {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(p[0]-5, p[1]-5, 10, 10);
  });
}
function _bindCropDrag(id) {
  var ovCanvas = document.getElementById('crop-ov-' + id);
  if (!ovCanvas) return;
  var dragging = false, handle = null, startX, startY, startVals;
  ovCanvas.addEventListener('mousedown', function(e) {
    dragging = true;
    startX = e.offsetX; startY = e.offsetY;
    startVals = {
      l: parseFloat(document.getElementById('crop-l-'+id).value)||0,
      r: parseFloat(document.getElementById('crop-r-'+id).value)||0,
      t: parseFloat(document.getElementById('crop-t-'+id).value)||0,
      b: parseFloat(document.getElementById('crop-b-'+id).value)||0
    };
  });
  ovCanvas.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var dx = e.offsetX - startX, dy = e.offsetY - startY;
    var W = ovCanvas.width, H = ovCanvas.height;
    var dxMm = dx / W * 297;
    var dyMm = dy / H * 210;
    var lEl = document.getElementById('crop-l-'+id);
    var rEl = document.getElementById('crop-r-'+id);
    var tEl = document.getElementById('crop-t-'+id);
    var bEl = document.getElementById('crop-b-'+id);
    if (lEl) lEl.value = Math.max(0, Math.round(startVals.l + dxMm));
    if (rEl) rEl.value = Math.max(0, Math.round(startVals.r - dxMm));
    if (tEl) tEl.value = Math.max(0, Math.round(startVals.t + dyMm));
    if (bEl) bEl.value = Math.max(0, Math.round(startVals.b - dyMm));
    _drawCropOverlay(id);
  });
  ovCanvas.addEventListener('mouseup', function() { dragging = false; });
  ovCanvas.addEventListener('mouseleave', function() { dragging = false; });
}
window.cropUpdatePreview = function(id) {
  if (_cropState[id]) _drawCropOverlay(id);
};
window.cropResetToDefault = function(id) {
  ['crop-l','crop-r','crop-t','crop-b'].forEach(function(k) {
    var el = document.getElementById(k+'-'+id);
    if (el) el.value = 10;
  });
  _drawCropOverlay(id);
};
var _origInitSig = window.initSig;
window.initSig = function(id) {
  if (typeof _origInitSig === 'function') _origInitSig(id);
  setTimeout(function() {
    var panel = document.getElementById('sig-draw-panel-' + id);
    if (!panel) return;

    if (document.getElementById('sig-page-preview-' + id)) return;
    var hint = document.createElement('div');
    hint.id = 'sig-page-preview-' + id;
    hint.style.cssText = 'margin-top:.75rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.65rem .85rem;font-size:.75rem;color:var(--tx2);line-height:1.5';
    hint.innerHTML = '<strong style="color:var(--tx)">📄 Placement tip:</strong> Use the <em>Position</em> dropdown below to choose where your signature lands on the page (bottom-right, center, etc.). The exact X/Y offset will be added in a future update.';
    var sigParent = panel.parentNode;
    if (sigParent) sigParent.insertBefore(hint, panel.nextSibling);
  }, 200);
};
var _origDoCompress = window.doCompress;
window.doCompress = function(id) {
  var f = S[id] && S[id].files;
  if (f && f.length) {
    var firstFile = f[0];
    firstFile.arrayBuffer().then(function(buf) {
      var header = new Uint8Array(buf.slice(0, 2048));
      var headerStr = String.fromCharCode.apply(null, header);
      if (headerStr.indexOf('/Encrypt') !== -1) {
        toast('⚠ This PDF is password-protected. Compression may reduce encryption. Proceeding anyway.', 'w', 4500);
      }
    }).catch(function(){});
  }
  return _origDoCompress.call(this, id);
};
var _origPvShowCards = window.pvShowCards;
window.pvShowCards = function(id, cards) {
  if (typeof _origPvShowCards === 'function') _origPvShowCards(id, cards);

  setTimeout(function() {
    var pv = document.getElementById('pv-' + id);
    if (!pv) return;
    pv.querySelectorAll('.pv-card-row').forEach(function(row) {
      var label = row.querySelector('.pv-label');
      var val = row.querySelector('.pv-val');
      if (!label || !val) return;
      if (label.textContent.trim() === 'Saved') {
        var pct = parseFloat(val.textContent);
        if (pct >= 20) { val.style.color = 'var(--green)'; val.style.fontWeight = '700'; }
        else if (pct > 0) { val.style.color = 'var(--amber)'; }
        else { val.style.color = 'var(--tx3)'; val.textContent = '±0% — already optimised'; }
      }
    });
  }, 100);
};
var _origLoadReorder = window.loadReorder;
window.loadReorder = function(id) {
  awaitLibs().then(function() {
    var f = S[id] && S[id].files;
    if (!f || !f.length) return;
    f[0].arrayBuffer().then(function(buf) {
      return pdfjsLib.getDocument({data: buf}).promise;
    }).then(function(pdf) {
      var list = document.getElementById('rl-' + id);
      if (!list) return;
      list.innerHTML = '';
      setSt(id, 'Loading ' + pdf.numPages + ' pages…', 'inf');
      for (var i = 1; i <= pdf.numPages; i++) {
        (function(pageNum) {
          var item = document.createElement('div');
          item.className = 'ritem';
          item.draggable = true;
          item.dataset.idx = pageNum - 1;
          item.innerHTML = '<span class="rh">⠿</span>' +
            '<div class="rth" id="rth-' + id + '-' + pageNum + '" style="background:var(--sf3);border-radius:4px;width:48px;height:64px;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:.65rem">' + pageNum + '</div>' +
            '<span class="rname">Page ' + pageNum + '</span>' +
            '<span class="rnumx">#' + pageNum + '</span>' +
            '<div class="r-mv"><button class="rmv-btn" onclick="rMove(\'' + id + '\',' + (pageNum-1) + ',-1)">↑</button><button class="rmv-btn" onclick="rMove(\'' + id + '\',' + (pageNum-1) + ',1)">↓</button></div>';
          item.addEventListener('dragstart', function() { window.dragSrc = parseInt(item.dataset.idx); item.classList.add('dragging'); });
          item.addEventListener('dragend', function() { item.classList.remove('dragging'); document.querySelectorAll('.ritem').forEach(function(el){ el.classList.remove('dov'); }); });
          item.addEventListener('dragover', function(e) { e.preventDefault(); item.classList.add('dov'); });
          item.addEventListener('dragleave', function() { item.classList.remove('dov'); });
          item.addEventListener('drop', function(e) {
            e.preventDefault(); item.classList.remove('dov');
            var dst = parseInt(item.dataset.idx);
            if (window.dragSrc === null || window.dragSrc === dst) return;
            var srcEl = list.querySelector('[data-idx="' + window.dragSrc + '"]');
            if (dst > window.dragSrc) list.insertBefore(srcEl, item.nextSibling);
            else list.insertBefore(srcEl, item);
            window.reindexReorder && window.reindexReorder(list);
            window.dragSrc = null;
          });
          list.appendChild(item);
        })(i);
      }
      document.getElementById('btn-' + id).disabled = false;
      setSt(id, pdf.numPages + ' pages — drag to reorder', 'inf');
      var BATCH = 8;
      function renderBatch(start) {
        var end = Math.min(start + BATCH, pdf.numPages + 1);
        var tasks = [];
        for (var p = start; p < end; p++) {
          tasks.push((function(pageNum) {
            return pdf.getPage(pageNum).then(function(page) {
              var vp = page.getViewport({scale: 0.17});
              var c = document.createElement('canvas');
              c.width = vp.width; c.height = vp.height;
              return page.render({canvasContext: c.getContext('2d'), viewport: vp}).promise.then(function() {
                var placeholder = document.getElementById('rth-' + id + '-' + pageNum);
                if (placeholder) { placeholder.innerHTML = ''; placeholder.style = ''; placeholder.appendChild(c); }
                page.cleanup();
              });
            });
          })(p));
        }
        Promise.all(tasks).then(function() {
          if (end <= pdf.numPages) {
            if (window.requestIdleCallback) {
              requestIdleCallback(function() { renderBatch(end); }, {timeout: 500});
            } else {
              setTimeout(function() { renderBatch(end); }, 50);
            }
          }
        });
      }
      renderBatch(1);
    }).catch(function(e) { setSt(id, '✕ ' + e.message, 'err'); });
  });
};
(function() {
  var FALLBACK_TIMEOUT = 10000;
  setTimeout(function() {
    var missing = [];
    if (typeof PDFLib === 'undefined') missing.push({
      id: 'fb-pdflib',
      src: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js'
    });
    if (typeof pdfjsLib === 'undefined') missing.push({
      id: 'fb-pdfjs',
      src: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js'
    });
    if (typeof JSZip === 'undefined') missing.push({
      id: 'fb-jszip',
      src: 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
    });
    missing.forEach(function(lib) {
      if (!document.getElementById(lib.id)) {
        var s = document.createElement('script');
        s.id = lib.id;
        s.src = lib.src;
        s.crossOrigin = 'anonymous';
        document.head.appendChild(s);
        console.warn('[Dublesh] CDN fallback loaded:', lib.src);
      }
    });
  }, FALLBACK_TIMEOUT);
})();
var TAB_TOOLTIPS = {
  organize: 'Merge · Split · Rotate · Reorder · Delete · Extract pages',
  convert:  'PDF to JPG · Image to PDF · PDF to Text · PDF to Word · PDF to Excel',
  edit:     'Compress · Watermark · Page Numbers · Resize · Grayscale · Redact · Crop · Add Image',
  security: 'Protect · Unlock · Sign · Flatten',
  analyze:  'Edit Metadata · Word Count · Compare PDFs · Page Thumbnails',
  create:   'Blank PDF · Markdown→PDF · HTML→PDF · Form Builder',
  ai:       'AI Summarize · AI Q&A · AI Translate — powered by Claude'
};
document.querySelectorAll('.tab[data-cat]').forEach(function(tab) {
  var cat = tab.getAttribute('data-cat');
  if (TAB_TOOLTIPS[cat]) tab.title = TAB_TOOLTIPS[cat];
});
var mobileStyle = document.createElement('style');
mobileStyle.textContent = [
  '@media(max-width:420px){',
  '  .tgrid{grid-template-columns:1fr!important;gap:.35rem!important}',
  '  .tc{display:flex!important;flex-direction:row!important;align-items:flex-start!important;',
  '      gap:.55rem!important;padding:.65rem .75rem!important;border-left-width:3px!important}',
  '  .tc-ic{font-size:1.25rem!important;min-width:2rem!important;text-align:center;flex-shrink:0;margin-top:.1rem}',
  '  .tn{font-size:.8rem!important;margin-bottom:.2rem}',
  '  .td{font-size:.67rem!important;white-space:normal!important;',
  '      overflow:visible!important;-webkit-line-clamp:unset!important;',
  '      text-overflow:clip!important;max-width:100%;line-height:1.4!important;',
  '      display:block!important}',
  '  .tc-arr{display:none!important}',
  '  .fav-btn{top:.35rem!important;right:.35rem!important}',
  '}'
].join('');
document.head.appendChild(mobileStyle);
var TOOL_CHAINS = {
  merge:          ['compress','sign','protect'],
  split:          ['compress','rotate','watermark'],
  compress:       ['sign','protect','merge'],
  'pdf-to-jpg':   ['jpg-to-pdf','watermark'],
  sign:           ['protect','flatten','compress'],
  protect:        ['flatten'],
  rotate:         ['compress','split'],
  watermark:      ['protect','compress'],
  'extract-pages':['compress','sign'],
  'page-numbers': ['compress','protect']
};window.TOOL_CHAINS = TOOL_CHAINS;
TOOL_CHAINS['delete-pages']        = ['compress','protect','sign'];
TOOL_CHAINS['extract-text']        = ['ai-summarize','ai-qa','ai-translate'];
TOOL_CHAINS['pdf-to-word']         = ['ai-summarize','extract-text'];
TOOL_CHAINS['pdf-to-excel']        = ['compress','protect'];
TOOL_CHAINS['grayscale']           = ['compress','protect'];
TOOL_CHAINS['resize']              = ['compress','protect'];
TOOL_CHAINS['redact']              = ['flatten','protect'];
TOOL_CHAINS['crop-pdf']            = ['compress','watermark'];
TOOL_CHAINS['add-image']           = ['flatten','compress'];
TOOL_CHAINS['unlock']              = ['sign','merge','compress'];
TOOL_CHAINS['flatten']             = ['protect','compress'];
TOOL_CHAINS['metadata']            = ['protect','compress'];
TOOL_CHAINS['word-count']          = ['ai-summarize','ai-translate'];
TOOL_CHAINS['compare']             = ['ai-summarize'];
TOOL_CHAINS['thumbnail']           = ['jpg-to-pdf'];
TOOL_CHAINS['blank-pdf']           = ['watermark','sign','protect'];
TOOL_CHAINS['markdown-to-pdf']     = ['compress','watermark','protect'];
TOOL_CHAINS['html-to-pdf']         = ['compress','watermark'];
TOOL_CHAINS['form-builder']        = ['protect','flatten','sign'];
TOOL_CHAINS['ai-summarize']        = ['ai-qa','ai-translate'];
TOOL_CHAINS['ai-qa']               = ['ai-summarize','ai-translate'];
TOOL_CHAINS['ai-translate']        = ['ai-summarize'];
TOOL_CHAINS['reorder']             = ['compress','protect','sign'];
TOOL_CHAINS['remove-blank-pages']  = ['compress','protect'];
TOOL_CHAINS['reverse-pages']       = ['compress','protect','sign'];
TOOL_CHAINS['duplicate-pages']     = ['compress','protect'];
TOOL_CHAINS['page-borders']        = ['compress','watermark','protect'];
TOOL_CHAINS['pdf-repair']          = ['compress','protect','sign'];
TOOL_CHAINS['smart-crop']          = ['compress','watermark'];
TOOL_CHAINS['ocr-pdf']             = ['ai-summarize','ai-qa','ai-translate'];
TOOL_CHAINS['ai-pii-redact']       = ['redact','protect','flatten'];
TOOL_CHAINS['ai-invoice']          = ['ai-summarize','extract-text'];
TOOL_CHAINS['ai-toc']              = ['compress','protect'];
TOOL_CHAINS['ai-accessibility']    = ['ai-summarize'];
TOOL_CHAINS['ai-crossref']         = ['ai-summarize'];
TOOL_CHAINS['annotate-pdf']        = ['protect','flatten','compress'];
TOOL_CHAINS['pdf-to-html']         = ['ai-summarize','extract-text'];
TOOL_CHAINS['fill-form']           = ['protect','sign','flatten'];
TOOL_CHAINS['certificate-gen']     = ['protect','watermark','compress'];
TOOL_CHAINS['ai-smart-compress']   = ['protect','sign'];
var _origPvReady = window.pvReady;
window.pvReady = function(id) {
  if (typeof _origPvReady === 'function') _origPvReady(id);
  var tool = typeof _activeTid !== 'undefined' ? _activeTid : null;
  var chains = tool ? TOOL_CHAINS[tool] : null;
  if (!chains || !chains.length) return;
  var container = document.getElementById('pv-' + id + '-chain');
  if (!container) return;
  if (container.querySelector('.chain-chips')) return;
  var TOOL_LABELS = {
    compress:'🗜️ Compress', sign:'✍️ Sign', protect:'🔒 Protect',
    flatten:'📌 Flatten', watermark:'💧 Watermark', merge:'🔗 Merge',
    rotate:'🔄 Rotate', split:'✂️ Split', 'jpg-to-pdf':'📷 Image to PDF',
    'page-numbers':'🔢 Page Numbers', 'extract-pages':'📤 Extract Pages'
  };
  container.innerHTML = '<div class="chain-chips" style="margin-top:.7rem;border-top:1px solid var(--bd);padding-top:.6rem">' +
    '<div style="font-size:.68rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem">Use output in another tool</div>' +
    '<div style="display:flex;gap:.35rem;flex-wrap:wrap">' +
    chains.map(function(t) {
      return '<button class="btn-s" style="font-size:.72rem;padding:.25rem .7rem" onclick="openTool(\'' + t + '\')">' + (TOOL_LABELS[t]||t) + '</button>';
    }).join('') +
    '</div></div>';
};

var heroStyle = document.createElement('style');
heroStyle.textContent = [
  '.dub-landing .hero{min-height:clamp(220px,32vh,340px)!important;padding-top:clamp(1.5rem,3vw,2.5rem)!important;padding-bottom:clamp(1rem,2vw,1.8rem)!important}',
  '.hero-badge{margin-bottom:.5rem!important}',
  '.hero h1{font-size:clamp(1.6rem,4.5vw,3rem)!important;margin-bottom:.5rem!important}',
  '.hero-sub{font-size:clamp(.78rem,1.5vw,.92rem)!important;margin-bottom:.8rem!important}',
  '.dub-cta-row{margin-top:.7rem!important}',
  '.dub-share{margin-top:.5rem!important}',
  '.dub-stat{padding:1rem 1.25rem!important}',
  '.dub-why{padding:1.25rem clamp(1.25rem,4vw,2.5rem)!important}',
  '.dub-why-card{padding:1rem!important}'
].join('\n');
document.head.appendChild(heroStyle);
var focusStyle = document.createElement('style');
focusStyle.textContent = [
  '.modal-body :focus-visible{outline:2px solid var(--ac)!important;outline-offset:2px!important}',
  '.tab:focus-visible{outline:2px solid var(--ac)!important;outline-offset:2px!important}',
  '.tc:focus-visible{outline:2px solid var(--ac)!important;outline-offset:2px!important;border-radius:var(--r)!important}',
  '.btn-p:focus-visible,.btn-s:focus-visible{outline:2px solid var(--ac)!important;outline-offset:2px!important}'
].join('\n');
document.head.appendChild(focusStyle);
function reorderGridByUsage() {
  try {
    var hist = JSON.parse(localStorage.getItem('pf-hist') || '[]');
    if (!hist.length) return;
    var counts = {};
    hist.forEach(function(h) { counts[h.tool] = (counts[h.tool]||0) + 1; });
    var sorted = Object.keys(counts).sort(function(a,b){ return counts[b]-counts[a]; });
    var grid = document.getElementById('tgrid');
    if (!grid) return;
    sorted.slice(0, 6).forEach(function(toolId) {
      var card = grid.querySelector('[data-tool="' + toolId + '"]');
      if (card) grid.insertBefore(card, grid.firstChild);
    });

    var first = grid.querySelector('.tc');
    if (first && !first.querySelector('.tc-used')) {
      var badge = document.createElement('span');
      badge.className = 'tc-used';
      badge.textContent = 'Recently used';
      badge.style.cssText = 'position:absolute;bottom:.35rem;left:.5rem;font-size:.5rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.04em;font-family:"JetBrains Mono",monospace;opacity:.6';
      first.appendChild(badge);
    }
  } catch(e) {}
}
setTimeout(reorderGridByUsage, 300);
var _origSplitModeChange = window.splitModeChange;
window.splitModeChange = function(id) {
  if (typeof _origSplitModeChange === 'function') _origSplitModeChange(id);
};
var _origOpenTool = window.openTool;
window.openTool = function(toolId) {
  var result = _origOpenTool ? _origOpenTool.apply(this, arguments) : undefined;
  if (toolId === 'split') {
    setTimeout(function() {
      var activeId = typeof _activeTid !== 'undefined' ? _activeTid : null;
      if (!activeId) return;
      var sel = document.getElementById('sm-' + activeId);
      if (sel && sel.value === 'all') {

        sel.value = 'range';
        if (typeof splitModeChange === 'function') splitModeChange(activeId);
        var svWrap = document.getElementById('sv-wrap-' + activeId);
        if (svWrap) svWrap.style.display = '';
        var svLbl = document.getElementById('sv-lbl-' + activeId);
        if (svLbl) svLbl.textContent = 'Pages (e.g. 1-3 or 5)';
        var sv = document.getElementById('sv-' + activeId);
        if (sv) sv.placeholder = 'e.g. 1-5';
      }
    }, 100);
  }
  return result;
};
var _origSetSt = window.setSt;
window.setSt = function(id, msg, type) {
  if (typeof _origSetSt === 'function') _origSetSt(id, msg, type);
};
var _origOnFI = window.onFI;
window.onFI = function(e, id, multi, cb) {
  if (typeof _origOnFI === 'function') _origOnFI.apply(this, arguments);
  setTimeout(function() {
    var tool = typeof _activeTid !== 'undefined' ? _activeTid : null;
    if (tool !== 'merge') return;
    var fl = document.getElementById('fl-' + id);
    if (!fl) return;
    var files = S[id] && S[id].files;
    if (!files || !files.length) return;
    Array.from(files).forEach(function(file, idx) {
      file.arrayBuffer().then(function(buf) {
        return pdfjsLib.getDocument({data: buf}).promise;
      }).then(function(pdf) {
        var chips = fl.querySelectorAll('.fc, .file-chip, [class*="fc"]');
        if (chips[idx]) {
          var badge = chips[idx].querySelector('.pg-badge');
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'pg-badge';
            badge.style.cssText = 'display:inline-block;background:var(--ac-dim);color:var(--ac);border-radius:4px;padding:1px 6px;font-size:.6rem;font-weight:700;font-family:"JetBrains Mono",monospace;margin-left:.3rem';
            chips[idx].appendChild(badge);
          }
          badge.textContent = pdf.numPages + 'p';
          pdf.destroy();
        }
      }).catch(function(){});
    });
  }, 300);
};
})();