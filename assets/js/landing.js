/* Dublesh v6.9.9 — landing.js */
(function () {
'use strict';
(function () {
  var _chain = [];
  var _current = window.openTool;
  window.openTool = function (toolId) {
    if (typeof _current === 'function') _current.apply(this, arguments);
    setTimeout(function () {
      var uid = window._activeTid || '';
      if (!uid) return;
      _runAllToolPatches(toolId, uid);
    }, 120);
  };
  function _runAllToolPatches(toolId, uid) {
    if (toolId === 'protect') {
      _injectPasswordGenerator(uid);
      _injectPermissionTooltips(uid);
    }
    if (toolId === 'page-numbers') {
      _injectPositionPicker(uid);
    }
    if (toolId === 'split' || toolId === 'extract-pages') {
      _injectRangeValidation(toolId, uid);
    }
    if (toolId === 'markdown-to-pdf') {
      _injectMarkdownAutosave(uid);
    }
    if (toolId === 'redact') {
      _injectRedactWarning(uid);
    }
    if (toolId === 'pdf-to-word') {
      _injectPdfWordBanner(uid);
    }
    if (toolId === 'ai-qa' || toolId === 'aiqa') {
      _injectQaChips(uid);
    }
    if (toolId === 'ai-translate' || toolId === 'aitranslate') {
      _reorderTranslateLangs(uid);
    }
    if (toolId === 'delete-pages') {
      _injectDeleteToggle(uid);
    }
  }
  function _injectPasswordGenerator(uid) {
    if (document.getElementById('pwgen-btn-' + uid)) return;
    var pp1 = document.getElementById('pp1-' + uid);
    if (!pp1) return;
    var gb = document.createElement('button');
    gb.id = 'pwgen-btn-' + uid; gb.type = 'button'; gb.className = 'btn-s';
    gb.style.cssText = 'margin-top:.35rem;width:100%;font-size:.72rem';
    gb.innerHTML = '🎲 Generate Strong Password';
    gb.title = 'Generate a cryptographically random 16-character password and copy to clipboard';
    gb.onclick = function () {
      var chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
      var pwd = Array.from({ length: 16 }, function () {
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      var e1 = document.getElementById('pp1-' + uid);
      var e2 = document.getElementById('pp2-' + uid);
      if (e1) { e1.value = pwd; e1.type = 'text'; e1.dispatchEvent(new Event('input')); }
      if (e2) e2.value = pwd;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pwd).then(function () { window.toast('Strong password generated and copied ✓'); });
      } else {
        window.toast('Password: ' + pwd);
      }
      setTimeout(function () { if (e1) e1.type = 'password'; }, 4000);
    };
    var sl = document.getElementById('pwsl-' + uid);
    if (sl && sl.parentNode) sl.parentNode.insertBefore(gb, sl.nextSibling);
    else pp1.parentNode && pp1.parentNode.appendChild(gb);
  }
  function _injectPermissionTooltips(uid) {
    var tips = [
      ['perm-print-' + uid, 'Soft restriction — some PDF readers may still allow printing regardless.'],
      ['perm-copy-' + uid,  'Restricts text selection and copying. Not all viewers enforce this.'],
      ['perm-annot-' + uid, 'Allows adding comments, highlights and stamps to the document.'],
      ['perm-fill-' + uid,  'Allows users to fill in interactive AcroForm fields.']
    ];
    tips.forEach(function (pair) {
      var cb = document.getElementById(pair[0]);
      if (cb && !cb._tip) { cb._tip = true; var lbl = cb.closest('label'); if (lbl) lbl.title = pair[1]; }
    });
  }
  function _injectPositionPicker(uid) {
    var sel = document.getElementById('pp-' + uid);
    if (!sel || document.getElementById('pos-picker-' + uid)) return;
    sel.style.display = 'none';
    var positions = [
      { value: 'top-left',      label: 'Top Left'     },
      { value: 'top-center',    label: 'Top Center'   },
      { value: 'top-right',     label: 'Top Right'    },
      { value: 'bottom-left',   label: 'Bottom Left'  },
      { value: 'bottom-center', label: 'Bottom Center'},
      { value: 'bottom-right',  label: 'Bottom Right' }
    ];
    var picker = document.createElement('div');
    picker.id = 'pos-picker-' + uid;
    picker.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem;margin-top:.3rem';
    picker.setAttribute('role', 'radiogroup');
    picker.setAttribute('aria-label', 'Page number position');
    positions.forEach(function (pos) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.val = pos.value;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', pos.value === sel.value ? 'true' : 'false');
      btn.setAttribute('aria-label', pos.label);
      btn.style.cssText = 'padding:.3rem .15rem;border-radius:6px;border:1.5px solid var(--bd);background:var(--sf2);cursor:pointer;font-size:.6rem;color:var(--tx2);display:flex;flex-direction:column;align-items:center;gap:.12rem;transition:border-color .15s,background .15s';
      btn.title = pos.label;
      var isT = pos.value.startsWith('top'), isR = pos.value.endsWith('right'), isL = pos.value.endsWith('left');
      var dx = isL ? '18%' : isR ? '82%' : '50%', dy = isT ? '20%' : '80%';
      btn.innerHTML = '<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="1" width="28" height="38" rx="2" stroke="currentColor" stroke-width="1.5" fill="var(--sf)"/><circle cx="' + dx + '" cy="' + dy + '" r="3" fill="var(--ac)"/></svg><span>' + pos.label + '</span>';
      btn.onclick = function () {
        sel.value = pos.value;
        picker.querySelectorAll('button').forEach(function (b) {
          b.style.borderColor = 'var(--bd)';
          b.style.background = 'var(--sf2)';
          b.setAttribute('aria-checked', 'false');
        });
        btn.style.borderColor = 'var(--ac)';
        btn.style.background = 'rgba(232,65,42,.08)';
        btn.setAttribute('aria-checked', 'true');
      };
      if (pos.value === sel.value) {
        btn.style.borderColor = 'var(--ac)';
        btn.style.background = 'rgba(232,65,42,.08)';
        btn.setAttribute('aria-checked', 'true');
      }
      picker.appendChild(btn);
    });
    sel.parentNode && sel.parentNode.appendChild(picker);
  }
  function _injectRangeValidation(toolId, uid) {
    var rngEl = document.getElementById('sv-' + uid) || document.getElementById('ep-rng-' + uid);
    if (!rngEl || document.getElementById('rng-hint-' + uid)) return;
    var hint = document.createElement('div');
    hint.id = 'rng-hint-' + uid;
    hint.setAttribute('aria-live', 'polite');
    hint.style.cssText = 'font-size:.7rem;margin-top:.2rem;min-height:.85em;color:var(--tx3)';
    rngEl.parentNode && rngEl.parentNode.insertBefore(hint, rngEl.nextSibling);
    rngEl.addEventListener('input', function () {
      var val = rngEl.value.trim();
      if (!val) { hint.textContent = ''; return; }
      var pages = 0;
      var s = window.S && window.S[uid];
      if (s && s.files && s.files[0] && s.files[0]._pages) pages = s.files[0]._pages;
      if (!pages) { hint.textContent = 'Drop a PDF first to validate range.'; hint.style.color = 'var(--tx3)'; return; }
      try {
        var idx = window.parseRange(val, pages);
        if (!idx.length) throw new Error('empty');
        hint.textContent = '✓ ' + idx.length + ' page' + (idx.length > 1 ? 's' : '') + ' of ' + pages + ' selected';
        hint.style.color = 'var(--green)';
      } catch (e2) {
        hint.textContent = '✕ Invalid range — use e.g. 1-3, 5, 7 (max page: ' + pages + ')';
        hint.style.color = 'var(--ac)';
      }
    });
  }
  function _injectMarkdownAutosave(uid) {
    var ta = document.getElementById('mdi-' + uid);
    if (!ta || ta._mdp) return;
    ta._mdp = true;
    var KEY = 'pf-md-content';
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) {
        ta.value = saved;
        if (typeof window.mdPreview === 'function') window.mdPreview(uid);
        window.setSt && window.setSt(uid, '↩ Draft restored from last session.', 'inf');
      }
    } catch (e) {}
    ta.addEventListener('input', function () {
      clearTimeout(ta._mdTimer);
      ta._mdTimer = setTimeout(function () { try { localStorage.setItem(KEY, ta.value); } catch (e) {} }, 5000);
    });
    var toolbar = ta.closest && ta.closest('.md-editor') && ta.closest('.md-editor').querySelector('.md-tools');
    if (toolbar && !document.getElementById('md-imp-' + uid)) {
      var sep = document.createElement('div'); sep.className = 'md-sep';
      var imp = document.createElement('button');
      imp.id = 'md-imp-' + uid; imp.className = 'md-tb-btn';
      imp.title = 'Import .md or .txt file'; imp.innerHTML = '📂';
      imp.setAttribute('aria-label', 'Import Markdown file');
      imp.onclick = function () {
        var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.md,.txt';
        inp.onchange = function () {
          var file = inp.files[0]; if (!file) return;
          var reader = new FileReader();
          reader.onload = function (ev) {
            ta.value = ev.target.result;
            try { localStorage.setItem(KEY, ta.value); } catch (e) {}
            if (typeof window.mdPreview === 'function') window.mdPreview(uid);
            window.toast && window.toast('Markdown imported ✓');
          };
          reader.readAsText(file);
        };
        inp.click();
      };
      toolbar.appendChild(sep); toolbar.appendChild(imp);
    }
  }
  function _injectRedactWarning(uid) {
    if (document.getElementById('redact-warn-' + uid)) return;
    var mb = document.getElementById('modalBody');
    if (!mb) return;
    var w = document.createElement('div');
    w.id = 'redact-warn-' + uid;
    w.setAttribute('role', 'alert');
    w.style.cssText = 'background:#fff3cd;border:2px solid #f59e0b;border-radius:var(--rs);padding:.65rem .85rem;margin-bottom:.7rem;font-size:.78rem;color:#92400e;line-height:1.55';
    w.innerHTML = '<strong>⚠ Visual Redaction Only:</strong> This draws black boxes visually. The underlying text data remains extractable by other tools. For legal compliance, use dedicated desktop software (Adobe Acrobat Pro).';
    mb.prepend(w);
  }
  function _injectPdfWordBanner(uid) {
    if (document.getElementById('pdfword-banner-' + uid)) return;
    var mb = document.getElementById('modalBody');
    if (!mb) return;
    var b = document.createElement('div');
    b.id = 'pdfword-banner-' + uid;
    b.style.cssText = 'background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.6rem .8rem;margin-bottom:.65rem;font-size:.78rem;color:var(--tx2);line-height:1.5';
    b.innerHTML = '<strong>ℹ Plain text extraction only.</strong> This exports raw text as a .doc file — tables, columns, images and formatting are not preserved. For scanned PDFs, try <strong>OCR PDF</strong> first.';
    mb.prepend(b);
  }
  function _injectQaChips(uid) {
    var qInput = document.getElementById('aiQ-' + uid);
    if (!qInput || document.getElementById('qa-chips-' + uid)) return;
    var chips = ['What is this document about?', 'What are the key conclusions?', 'List all important dates.', 'Summarise the main points.', 'What action items are mentioned?'];
    var div = document.createElement('div');
    div.id = 'qa-chips-' + uid;
    div.setAttribute('aria-label', 'Suggested questions');
    div.style.cssText = 'display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem';
    chips.forEach(function (s) {
      var chip = document.createElement('button');
      chip.className = 'btn-s';
      chip.style.cssText = 'font-size:.68rem;padding:.2rem .55rem;border-radius:999px';
      chip.textContent = s;
      chip.setAttribute('type', 'button');
      chip.onclick = function () { qInput.value = s; qInput.focus(); div.style.display = 'none'; };
      div.appendChild(chip);
    });
    qInput.parentNode && qInput.parentNode.insertBefore(div, qInput.nextSibling);
    qInput.addEventListener('input', function () { if (qInput.value.length > 1) div.style.display = 'none'; }, { once: true });
  }
  function _reorderTranslateLangs(uid) {
    var sel = document.getElementById('aitl-' + uid);
    if (!sel || sel.dataset.reordered) return;
    var priority = ['Hindi', 'Spanish', 'French', 'Arabic', 'German', 'Portuguese', 'Chinese (Simplified)'];
    var all = Array.from(sel.options).map(function (o) { return { v: o.value, t: o.text }; });
    var first = [], rest = [];
    all.forEach(function (o) { priority.indexOf(o.v) !== -1 ? first.push(o) : rest.push(o); });
    first.sort(function (a, b) { return priority.indexOf(a.v) - priority.indexOf(b.v); });
    sel.innerHTML = '';
    first.concat(rest).forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.v; opt.text = o.t;
      if (o.v === 'Hindi') opt.selected = true;
      sel.appendChild(opt);
    });
    var sep = document.createElement('option');
    sep.disabled = true; sep.text = '──────────────'; sep.value = '';
    sel.insertBefore(sep, sel.options[first.length]);
    sel.dataset.reordered = '1';
  }
  function _injectDeleteToggle(uid) {
    var selBar = document.getElementById('sel-bar-' + uid);
    if (!selBar || document.getElementById('dp-mode-toggle-' + uid)) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem;padding:.35rem .5rem;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs)';
    wrap.innerHTML = '<span style="font-size:.74rem;font-weight:600;color:var(--tx2)">Selecting pages to:</span>' +
      '<button id="dp-mode-toggle-' + uid + '" type="button" class="btn-s" style="font-size:.72rem;padding:.2rem .6rem;background:var(--ac);color:#fff;border-color:var(--ac)" aria-pressed="false" title="Toggle between selecting pages to delete or to keep">DELETE</button>' +
      '<span id="dp-mode-hint-' + uid + '" style="font-size:.7rem;color:var(--tx3)">selected pages will be removed</span>';
    selBar.parentNode && selBar.parentNode.insertBefore(wrap, selBar);
    var _mode = 'delete';
    document.getElementById('dp-mode-toggle-' + uid).addEventListener('click', function () {
      var btn = this, hint = document.getElementById('dp-mode-hint-' + uid);
      _mode = _mode === 'delete' ? 'keep' : 'delete';
      if (_mode === 'keep') {
        btn.textContent = 'KEEP'; btn.style.background = 'var(--green)'; btn.style.borderColor = 'var(--green)';
        hint.textContent = 'all OTHER pages will be removed'; btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.textContent = 'DELETE'; btn.style.background = 'var(--ac)'; btn.style.borderColor = 'var(--ac)';
        hint.textContent = 'selected pages will be removed'; btn.setAttribute('aria-pressed', 'false');
      }
    });
  }
})();
window._cgResizeObserver = null;
var _origCgPreview = window.cgPreview;
window.cgPreview = function (id) {
  var canvas = document.getElementById('cg-prev-' + id);
  if (canvas) {
    var containerW = canvas.parentElement ? canvas.parentElement.clientWidth : 480;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
  }
  if (typeof _origCgPreview === 'function') _origCgPreview.apply(this, arguments);
};
document.addEventListener('DOMContentLoaded', function () {

  var tgrid = document.getElementById('tgrid');
  if (!tgrid) return;
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1 || !node.classList) return;
        if (!node.classList.contains('tc')) return;
        if (!node.getAttribute('onkeydown')) {
          node.setAttribute('onkeydown', "cardK(event,this)");
        }
        if (!node.getAttribute('tabindex')) {
          node.setAttribute('tabindex', '0');
        }
        if (!node.getAttribute('role')) {
          node.setAttribute('role', 'button');
        }
      });
    });
  });
  observer.observe(tgrid, { childList: true });
});
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.sk-card').forEach(function(el){ el.remove(); });
  if (typeof window.doFilter === 'function') window.doFilter();
});

})();