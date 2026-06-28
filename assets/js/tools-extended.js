/* Dublesh v6.9.9 — tools-extended.js */
(function() {
'use strict';
var _origDoAiSummarize = window.doAiSummarize;
window.doAiSummarize = async function(id) {
  await window.awaitLibs();
  if (!window._checkAiCooldown || !window._checkAiCooldown(id)) {
  }
  var f = window.S && window.S[id] && window.S[id].files;
  if (!f || !f.length) { window.setSt(id,'Please add a file first.','err'); return; }
  var _fErr = window.guardFiles(f, {types:['pdf'], maxMB:50});
  if (_fErr) { window.setSt(id, _fErr, 'err'); return; }
  var key = document.getElementById('aikey-'+id);
  if (key) key = key.value.trim(); else key = '';
  if (!key) { window.setSt(id, '⚠ Enter your Anthropic API key above', 'warn'); return; }
  window.setBusy(id, true);
  try {
    var textResults = [];
    for (var fi = 0; fi < f.length; fi++) {
      window.setPrg(id, Math.round((fi / f.length) * 80), 'Processing ' + (fi+1) + '/' + f.length + '…');
      window.setSt(id, 'Extracting text from ' + f[fi].name + '…', 'inf');
      var result = await window.extractAllText(f[fi]);
      var isScanned = result.text.trim().length < 50;
      if (isScanned) {
        window.setSt(id, '⚠ "' + f[fi].name + '" appears to be a scanned image PDF (very little text found). AI summary may be empty or inaccurate.', 'warn');
      }
      var focus = document.getElementById('aifocus-'+id) ? document.getElementById('aifocus-'+id).value.trim() : '';
      var focusMap = {
        'bullet': 'Respond with exactly 3 concise bullet points covering the main ideas.',
        'executive': 'Write a formal executive summary with: Purpose, Key Findings, Recommendations.',
        'detailed': 'Provide a detailed section-by-section analysis with subheadings.',
        'simple': 'Explain in plain simple language as if to a non-expert.',
        'legal': 'Identify key legal/technical clauses, obligations, dates and parties.'
      };
      var focusInstruction = focusMap[focus] || 'Provide a balanced overview covering main topics, key findings, and conclusions.';
      var systemPrompt = 'You are a precise document analyst. ' + focusInstruction + ' Use markdown formatting with clear sections.';
      var userMsg = 'Summarize this ' + result.numPages + '-page PDF:\n\n' + result.text.slice(0, 15000);
      window.setPrg(id, 85, 'Calling Claude AI…');
      (function() {
        var pv = document.getElementById('pvPanel-' + id);
        if (pv && !pv.querySelector('.sk-ai-wrap')) {
          var skWrap = document.createElement('div');
          skWrap.className = 'sk-ai-wrap';
          skWrap.style.cssText = 'display:flex;flex-direction:column;gap:.55rem;padding:.6rem .2rem';
          [92,78,85,60].forEach(function(w, i) {
            var ln = document.createElement('div');
            ln.className = 'sk-ai-line';
            ln.style.cssText = 'width:' + w + '%;animation-delay:' + (i * 0.15) + 's';
            skWrap.appendChild(ln);
          });
          pv.prepend(skWrap);
        }
      })();
      var reply = await window.callClaude(key, systemPrompt, userMsg);
      (function() {
        var sk = document.querySelector('#pvPanel-' + id + ' .sk-ai-wrap');
        if (sk) sk.remove();
      })();
      textResults.push({ title: f[fi].name, text: reply });
    }
    window.setPrg(id, 100, 'Done');
    window.setSt(id, '✓ Summary ready for ' + f.length + ' file(s)', 'succ');
    window.pvShowText(id, textResults);
    _injectAiCopyButtons(id, textResults);
    window.pvReady(id);
    window.addHist({ tool: 'ai-summarize', fileName: f.length + ' file(s)' });
    try { if (window.plausible) window.plausible('ai_complete', {props:{tool:'ai-summarize',files:String(f.length)}}); } catch(e) {}
    window.toast('Summary ready ✓');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '✕ ' + e.message, 'err');
    var _sk = document.querySelector('#pvPanel-' + id + ' .sk-ai-wrap');
    if (_sk) _sk.remove();
  }
  window.setBusy(id, false);
};
function _injectAiCopyButtons(id, textResults) {
  var panel = document.getElementById('pvPanel-'+id);
  if (!panel) return;
  var existingActions = document.getElementById('ai-actions-'+id);
  if (existingActions) existingActions.remove();
  var combinedText = textResults.map(function(r) {
    return (textResults.length > 1 ? '=== ' + r.title + ' ===\n' : '') + r.text;
  }).join('\n\n');
  var actDiv = document.createElement('div');
  actDiv.id = 'ai-actions-'+id;
  actDiv.style.cssText = 'display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem;';
  actDiv.innerHTML =
    '<button class="btn-s" style="font-size:.72rem" onclick="(function(){' +
      'var t=document.getElementById(\'ai-actions-text-'+id+'\').value;' +
      'if(navigator.clipboard){navigator.clipboard.writeText(t).then(function(){window.toast(\'Copied ✓\');});}' +
      'else{var ta=document.createElement(\'textarea\');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand(\'copy\');document.body.removeChild(ta);window.toast(\'Copied ✓\');}' +
    '})()">📋 Copy Result</button>' +
    '<button class="btn-s" style="font-size:.72rem" onclick="(function(){' +
      'var t=document.getElementById(\'ai-actions-text-'+id+'\').value;' +
      'var b=new Blob([t],{type:\'text/plain\'});var a=document.createElement(\'a\');' +
      'a.href=URL.createObjectURL(b);a.download=\'ai_result.txt\';a.click();' +
    '})()">⬇ Save .txt</button>';
  var hiddenTa = document.createElement('textarea');
  hiddenTa.id = 'ai-actions-text-'+id;
  hiddenTa.style.display = 'none';
  hiddenTa.value = combinedText;
  actDiv.appendChild(hiddenTa);
  if (panel.parentNode) panel.parentNode.insertBefore(actDiv, panel.nextSibling);
}
var _origDoAiQa = window.doAiQa;
window.doAiQa = async function(id) {
  await _origDoAiQa.call(this, id);
  var _tryInject = function() {
    var panel = document.getElementById('pvPanel-'+id);
    if (panel && panel.style.display !== 'none' && panel.textContent.trim()) {
      var txt = panel.textContent || '';
      _injectAiCopyButtons(id, [{title: 'Answer', text: txt}]);
    }
  };
  setTimeout(_tryInject, 300);
};
var _origDoAiTranslate = window.doAiTranslate;
window.doAiTranslate = async function(id) {
  await _origDoAiTranslate.call(this, id);
  var _tryInject = function() {
    var panel = document.getElementById('pvPanel-'+id);
    if (panel && panel.style.display !== 'none' && panel.textContent.trim()) {
      var txt = panel.textContent || '';
      _injectAiCopyButtons(id, [{title: 'Translation', text: txt}]);
    }
  };
  setTimeout(_tryInject, 300);
};
var _origOpenTool = window.openTool;
window.openTool = function(toolId) {
  _origOpenTool.apply(this, arguments);
};
function _patchToolOnOpen(toolId) {
  var uid = window._activeTid || '';
  if (!uid) return;
  if (toolId === 'ai-translate' || toolId === 'aitranslate') {
    var sel = document.getElementById('aitl-'+uid);
    if (sel && !sel.dataset.reordered) {
      var priorityLangs = ['Hindi','Spanish','French','Arabic','German','Portuguese','Chinese (Simplified)'];
      var allOptions = Array.from(sel.options).map(function(o){ return {v:o.value, t:o.text}; });
      var priority = [], rest = [];
      allOptions.forEach(function(o) {
        if (priorityLangs.indexOf(o.v) !== -1) priority.push(o);
        else rest.push(o);
      });
      priority.sort(function(a,b){ return priorityLangs.indexOf(a.v) - priorityLangs.indexOf(b.v); });
      sel.innerHTML = '';
      priority.concat(rest).forEach(function(o) {
        var opt = document.createElement('option');
        opt.value = o.v; opt.text = o.t;
        if (o.v === 'Hindi') opt.selected = true;
        sel.appendChild(opt);
      });
      var sep = document.createElement('option');
      sep.disabled = true; sep.text = '──────────────'; sep.value = '';
      sel.insertBefore(sep, sel.options[priority.length]);
      sel.dataset.reordered = '1';
    }

    var verifyBtn = document.getElementById('ai-verify-back-'+uid);
    if (!verifyBtn) {
      var actionBtn = document.getElementById('btn-'+uid);
      if (actionBtn) {
        var vb = document.createElement('button');
        vb.id = 'ai-verify-back-'+uid;
        vb.className = 'btn-s';
        vb.style.cssText = 'margin-top:.4rem;font-size:.72rem;display:none';
        vb.textContent = '🔁 Translate back to verify';
        vb.title = 'Re-translate result back to English as a sanity check';
        vb.onclick = function() {
          window.toast('Verify feature: copy your translation result and paste it into a new AI Translate session targeting English.', 'info');
        };
        actionBtn.parentNode.insertBefore(vb, actionBtn.nextSibling);
      }
    }
  }
  if (toolId === 'ai-qa' || toolId === 'aiqa') {
    var qInput = document.getElementById('aiQ-'+uid);
    if (qInput && !document.getElementById('qa-chips-'+uid)) {
      var suggestions = [
        'What is this document about?',
        'What are the key conclusions?',
        'List all important dates mentioned.',
        'Summarize the main points in bullets.',
        'What action items are mentioned?'
      ];
      var chipDiv = document.createElement('div');
      chipDiv.id = 'qa-chips-'+uid;
      chipDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem;';
      suggestions.forEach(function(s) {
        var chip = document.createElement('button');
        chip.className = 'btn-s';
        chip.style.cssText = 'font-size:.68rem;padding:.2rem .55rem;border-radius:999px;';
        chip.textContent = s;
        chip.onclick = function() {
          qInput.value = s;
          qInput.focus();
          chipDiv.style.display = 'none';
        };
        chipDiv.appendChild(chip);
      });
      qInput.parentNode.insertBefore(chipDiv, qInput.nextSibling);
      qInput.addEventListener('input', function() {
        if (qInput.value.length > 2) chipDiv.style.display = 'none';
      }, {once: true});
    }
  }

  if (toolId === 'delete-pages') {
    var selBar = document.getElementById('sel-bar-'+uid);
    if (selBar && !document.getElementById('dp-mode-toggle-'+uid)) {
      var toggleWrap = document.createElement('div');
      toggleWrap.style.cssText = 'display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;padding:.4rem .5rem;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);';
      toggleWrap.innerHTML =
        '<span style="font-size:.75rem;font-weight:600;color:var(--tx2)">Selecting pages to:</span>' +
        '<button id="dp-mode-toggle-'+uid+'" class="btn-s" style="font-size:.72rem;padding:.2rem .6rem;background:var(--ac);color:#fff;border-color:var(--ac)" ' +
          'title="Toggle between selecting pages to DELETE vs pages to KEEP">' +
          'DELETE</button>' +
        '<span id="dp-mode-hint-'+uid+'" style="font-size:.7rem;color:var(--tx3)">selected pages will be removed</span>';
      selBar.parentNode.insertBefore(toggleWrap, selBar);
      var _dpMode = 'delete';
      document.getElementById('dp-mode-toggle-'+uid).addEventListener('click', function() {
        _dpMode = _dpMode === 'delete' ? 'keep' : 'delete';
        var btn = document.getElementById('dp-mode-toggle-'+uid);
        var hint = document.getElementById('dp-mode-hint-'+uid);
        if (_dpMode === 'keep') {
          btn.textContent = 'KEEP';
          btn.style.background = 'var(--green)';
          btn.style.borderColor = 'var(--green)';
          hint.textContent = 'selected pages will be preserved (rest deleted)';
          btn.dataset.mode = 'keep';
        } else {
          btn.textContent = 'DELETE';
          btn.style.background = 'var(--ac)';
          btn.style.borderColor = 'var(--ac)';
          hint.textContent = 'selected pages will be removed';
          btn.dataset.mode = 'delete';
        }
      });
    }
  }
  if (toolId === 'redact') {
    if (!document.getElementById('redact-warn-'+uid)) {
      var modalBody = document.getElementById('modalBody');
      if (modalBody) {
        var warn = document.createElement('div');
        warn.id = 'redact-warn-'+uid;
        warn.style.cssText = 'background:#fff3cd;border:2px solid #f59e0b;border-radius:var(--rs);padding:.7rem .9rem;margin-bottom:.75rem;font-size:.78rem;color:#92400e;line-height:1.55;';
        warn.innerHTML = '<strong>⚠ Important — Visual Redaction Only:</strong> This tool draws black boxes over content visually. The <strong>underlying text data remains in the file</strong> and can be extracted by other tools. For legal or compliance redaction requiring true text removal, use dedicated desktop software such as Adobe Acrobat Pro.';
        var firstChild = modalBody.querySelector('.field, button, div');
        if (firstChild) modalBody.insertBefore(warn, firstChild);
        else modalBody.prepend(warn);
      }
    }
  }
  if (toolId === 'pdf-to-word' || toolId === 'pdftoword') {
    var mTitle = document.querySelector('#modalHeader .modal-title, #modalTitle, h2.modal-title');
    var allH2 = document.querySelectorAll('#modalBody ~ *, #modalHeader *');
    if (!document.getElementById('pdfword-banner-'+uid)) {
      var modalBodyEl = document.getElementById('modalBody');
      if (modalBodyEl) {
        var banner = document.createElement('div');
        banner.id = 'pdfword-banner-'+uid;
        banner.style.cssText = 'background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.65rem .85rem;margin-bottom:.7rem;font-size:.78rem;color:var(--tx2);line-height:1.55;';
        banner.innerHTML = '<strong>ℹ Text Extraction to .doc</strong> — This tool exports the raw text content as a plain <code>.doc</code> file. Tables, columns, images and formatting are <strong>not preserved</strong>. For scanned PDFs with no text, use AI Summarize instead.';
        modalBodyEl.prepend(banner);
      }
    }
  }
}
(function() {
  if (typeof window.TOOL_CHAINS === 'undefined') {
    var _waitChains = setInterval(function() {
      if (typeof window.TOOL_CHAINS !== 'undefined') {
        clearInterval(_waitChains);
        _extendChains();
      }
    }, 100);
  } else {
    _extendChains();
  }
  function _extendChains() {
    var extra = {
      'reorder':         ['compress','protect','sign'],
      'delete-pages':    ['compress','protect','sign'],
      'extract-pages':   ['compress','sign','watermark'],
      'jpg-to-pdf':      ['compress','watermark','protect'],
      'extract-text':    ['ai-summarize','ai-qa','ai-translate'],
      'pdf-to-word':     ['ai-summarize','extract-text'],
      'pdf-to-excel':    ['compress','protect'],
      'pdf-to-jpg':      ['jpg-to-pdf','watermark','compress'],
      'compress':        ['sign','protect','merge','watermark'],
      'watermark':       ['protect','compress','flatten'],
      'grayscale':       ['compress','protect'],
      'resize':          ['compress','protect'],
      'crop-pdf':        ['compress','watermark'],
      'add-image':       ['flatten','compress','protect'],
      'redact':          ['flatten','protect'],
      'unlock':          ['sign','merge','compress'],
      'flatten':         ['protect','compress'],
      'metadata':        ['protect','compress'],
      'word-count':      ['ai-summarize','ai-translate'],
      'compare':         ['ai-summarize'],
      'thumbnail':       ['jpg-to-pdf','watermark'],
      'blank-pdf':       ['watermark','protect','sign'],
      'markdown-to-pdf': ['compress','watermark','protect'],
      'html-to-pdf':     ['compress','watermark'],
      'form-builder':    ['protect','flatten','sign'],
      'ai-summarize':    ['ai-qa','ai-translate'],
      'ai-qa':           ['ai-summarize','ai-translate'],
      'ai-translate':    ['ai-summarize'],
      'page-numbers':    ['compress','protect','watermark'],
      'sign':            ['protect','flatten','compress'],
      'protect':         ['flatten'],
      'merge':           ['compress','sign','protect','page-numbers']
    };
    Object.keys(extra).forEach(function(k) {
      if (!window.TOOL_CHAINS[k]) {
        window.TOOL_CHAINS[k] = extra[k];
      } else {
        extra[k].forEach(function(v) {
          if (window.TOOL_CHAINS[k].indexOf(v) === -1) {
            window.TOOL_CHAINS[k].push(v);
          }
        });
      }
    });
  }
})();
var _origUpdateFileList = window.updateFileList;
if (typeof window.updateFileList === 'function') {
  window.updateFileList = function(id) {
    _origUpdateFileList.apply(this, arguments);
    if (window._activeTid && window.S && window.S[window._activeTid]) {
      var files = window.S[window._activeTid].files || [];
      var seen = {};
      var hasDupe = false;
      files.forEach(function(f) {
        var key = f.name + '|' + f.size;
        if (seen[key]) hasDupe = true;
        seen[key] = true;
      });
      var dupeWarn = document.getElementById('merge-dupe-warn');
      if (hasDupe) {
        if (!dupeWarn) {
          var w = document.createElement('div');
          w.id = 'merge-dupe-warn';
          w.className = 'smsg warn show';
          w.style.marginTop = '.4rem';
          w.innerHTML = '<span>⚠</span><span>Duplicate file detected — the same file appears more than once in the list.</span>';
          var fl = document.getElementById('fl-'+window._activeTid);
          if (fl && fl.parentNode) fl.parentNode.insertBefore(w, fl.nextSibling);
        }
      } else {
        if (dupeWarn) dupeWarn.remove();
      }
    }
  };
}
var _origDoExtractText = window.doExtractText;
if (typeof window.doExtractText === 'function') {
  window.doExtractText = async function(id) {
    await _origDoExtractText.apply(this, arguments);
    setTimeout(function() {
      var ta = document.getElementById('etR-'+id);
      if (ta && ta.value.trim().length < 50) {
        var existingWarn = document.getElementById('scan-warn-'+id);
        if (!existingWarn) {
          var w = document.createElement('div');
          w.id = 'scan-warn-'+id;
          w.className = 'smsg warn show';
          w.style.marginTop = '.5rem';
          w.innerHTML = '<span>⚠</span><span>This PDF appears to be a scanned image. Only ' +
            ta.value.trim().length + ' characters extracted. For scanned PDFs, try <strong>AI Summarize</strong> (uses vision) or add the OCR tool.</span>';
          ta.parentNode.insertBefore(w, ta);
        }
      }
    }, 500);
  };
}
(function() {
  document.querySelectorAll('[data-version], .version-tag').forEach(function(el) {
    if (el.textContent.indexOf('6.9.9') !== -1) {
      el.textContent = el.textContent.replace('6.9.9', '6.9.9');
    }
  });

  var seenKey = 'pf-seen-v6.9.9';

  if (!localStorage.getItem(seenKey)) {
    try { localStorage.setItem(seenKey, '1'); } catch(e) {}
    setTimeout(function() {
      var n = document.createElement('div');
      n.style.cssText = [
        'position:fixed;bottom:1.2rem;right:1.2rem;z-index:9999;',
        'max-width:320px;background:var(--sf);border:1px solid var(--bd);',
        'border-radius:var(--r);box-shadow:var(--sh2);padding:1rem 1.1rem;',
        'font-size:.78rem;line-height:1.55;color:var(--tx);',
        'animation:slideInUp .3s ease'
      ].join('');
      n.innerHTML = [
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">',
          '<strong style="font-size:.82rem">✨ What\'s new in v6.9.9</strong>',
          '<button onclick="this.closest(\'div[style]\').remove();localStorage.setItem(\''+seenKey+'\',\'1\')" ',
            'style="background:none;border:none;cursor:pointer;font-size:1rem;color:var(--tx3);padding:0;line-height:1">×</button>',
        '</div>',
        '<ul style="margin:0;padding-left:1.1rem;display:flex;flex-direction:column;gap:.25rem;color:var(--tx2)">',
          '<li>✨ 17 new tools: OCR, Annotate PDF, Fill Form, Certificate &amp; more</li>',
          '<li>🤖 New AI: PII Redact, TOC Generator, Invoice Extractor, Accessibility</li>',
          '<li>📋 Copy &amp; download added to all AI results</li>',
          '<li>🔒 Password generator added to Protect PDF</li>',
          '<li>🔗 Tool chains expanded to all 51 tools</li>',
        '</ul>',
        '<button onclick="this.closest(\'div[style]\').remove();localStorage.setItem(\''+seenKey+'\',\'1\')" ',
          'class="btn-s" style="margin-top:.6rem;width:100%;text-align:center;font-size:.72rem">Got it</button>'
      ].join('');
      document.body.appendChild(n);
    }, 2000);
  }
})();

})();

(function() {
'use strict';
window._jszipReady = typeof JSZip !== 'undefined';
window._jszipLoading = null;
window.awaitJSZip = function() {
  if (typeof JSZip !== 'undefined') return Promise.resolve();
  if (window._jszipLoading) return window._jszipLoading;
  window._jszipLoading = new Promise(function(res, rej) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    s.onload = function() { window._jszipReady = true; res(); };
    s.onerror = function() { rej(new Error('JSZip failed to load')); };
    document.head.appendChild(s);
  });
  return window._jszipLoading;
};
(function() {
  var SRI = {
    'pdf.min.js':     'sha384-/9+/YZFkSqLBPp5m5x6vhk6BHBvDPGNKKRWYV0lSvFiMm5u0R/VxOlmCtPbIvV/',
    'pdf-lib.min.js': 'sha384-5Jmh8XVq1HyrpWLnCnMqFBaB1HxKoLG23PGUqm7/gVsaA+AGIGBk1nJLb7BRBR3',
    'jszip.min.js':   'sha384-AAAAuhBtq/qw8NiGDZHHxX+a4qqUG7hFtbscU+HJn3rEt+1v+jJd5XBnxBaHVCa'
  };

})();
var _cancelled = {};
var _busyTimers = {};
var _origSetBusy = window.setBusy;
window.setBusy = function(id, b) {
  if (typeof _origSetBusy === 'function') _origSetBusy.call(this, id, b);
  if (b) {
    _cancelled[id] = false;
    _busyTimers[id] = setTimeout(function() {
      var cancelBtn = document.getElementById('cancel-btn-' + id);
      if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-btn-' + id;
        cancelBtn.className = 'btn-s';
        cancelBtn.style.cssText = 'color:var(--ac);border-color:var(--ac);font-size:.72rem;margin-left:.4rem';
        cancelBtn.textContent = '✕ Cancel';
        cancelBtn.onclick = function() {
          _cancelled[id] = true;
          window.setBusy(id, false);
          if (typeof window.setSt === 'function') window.setSt(id, 'Cancelled.', 'warn');
        };
        var btn = document.getElementById('btn-' + id);
        if (btn && btn.parentNode) btn.parentNode.insertBefore(cancelBtn, btn.nextSibling);
      }
      cancelBtn.style.display = 'inline-flex';
    }, 2000);
  } else {
    _cancelled[id] = false;
    clearTimeout(_busyTimers[id]);
    var cancelBtn = document.getElementById('cancel-btn-' + id);
    if (cancelBtn) cancelBtn.style.display = 'none';
  }
};
window._cancelled = _cancelled;
function _mkCard(toolId, cat, icon, name, desc, catColor, catBg) {
  return '<div class="tc vis" data-cat="' + cat + '" data-tool="' + toolId + '" ' +
    'tabindex="0" role="button" aria-label="Open ' + name + ' tool" ' +
    'style="--ic-bg:' + catBg + ';--ic-ac:' + catColor + '" ' +
    'onclick="openTool(\'' + toolId + '\')" onkeydown="cardK(event,this)">' +
    '<button class="fav-btn" onclick="toggleFav(event,\'' + toolId + '\')" aria-label="Favourite ' + name + '">♡</button>' +
    '<div class="tc-ic">' + icon + '</div>' +
    '<span class="tc-arr">↗</span>' +
    '<div class="tn">' + name + '</div>' +
    '<div class="td">' + desc + '</div></div>';
}
document.addEventListener('DOMContentLoaded', function() {
  var lastCard = document.querySelector('.tc[data-tool="ai-translate"]');
  if (!lastCard) lastCard = document.querySelector('.tc:last-of-type');
  var grid = lastCard ? lastCard.parentNode : null;
  if (!grid) return;
  var newCards = [
    _mkCard('remove-blank-pages','organize','🗑️','Remove Blank Pages','Detect and remove near-white blank pages — configurable threshold','#2563eb','rgba(37,99,235,.1)'),
    _mkCard('reverse-pages','organize','🔃','Reverse Page Order','Flip page order in one click — no config needed','#2563eb','rgba(37,99,235,.1)'),
    _mkCard('duplicate-pages','organize','📄','Duplicate Pages','Copy pages within a PDF — for templates or booklets','#2563eb','rgba(37,99,235,.1)'),
    _mkCard('page-borders','edit','🖼','Add Page Borders','Add a decorative frame to every page — colour and width control','#b45309','rgba(180,83,9,.1)'),
    _mkCard('pdf-repair','edit','🔧','PDF Repair','Rebuild and recover corrupted PDFs — permissive load mode','#b45309','rgba(180,83,9,.1)'),
    _mkCard('smart-crop','edit','✂️','Smart Crop (Auto Margins)','Auto-detect and strip white margins — pixel-level precision','#b45309','rgba(180,83,9,.1)'),
    _mkCard('ocr-pdf','convert','🔍','OCR PDF','Extract text from scanned PDFs — 8 languages, Tesseract v5','#7c3aed','rgba(124,58,237,.1)'),
    _mkCard('ai-pii-redact','ai','🛡️','AI PII Redact','Detect names, Aadhaar, PAN, email and phone — Claude AI','#4f46e5','rgba(79,70,229,.1)'),
    _mkCard('ai-invoice','ai','🧾','AI Invoice Extractor','Extract structured data from invoices and contracts — Claude AI','#4f46e5','rgba(79,70,229,.1)'),
    _mkCard('ai-toc','ai','📑','AI Table of Contents','Generate a Table of Contents from heading structure — Claude AI','#4f46e5','rgba(79,70,229,.1)'),
    _mkCard('ai-accessibility','ai','♿','AI Accessibility Check','Check WCAG 2.1 compliance — alt text, contrast, reading order','#4f46e5','rgba(79,70,229,.1)'),
    _mkCard('ai-crossref','ai','🔀','AI Cross-Reference','Compare 2–5 PDFs — find conflicts and cross-references','#4f46e5','rgba(79,70,229,.1)'),
  ];
  newCards.forEach(function(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    grid.appendChild(tmp.firstElementChild);
  });
  if (typeof window.doFilter === 'function') {
    setTimeout(function() { window.doFilter(''); }, 100);
  }
});
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.TMETA !== 'undefined') {
    Object.assign(window.TMETA, {
      'remove-blank-pages': {i:'🗑️', n:'Remove Blank Pages'},
      'reverse-pages':      {i:'🔃', n:'Reverse Pages'},
      'duplicate-pages':    {i:'📄', n:'Duplicate Pages'},
      'page-borders':       {i:'🖼',  n:'Page Borders'},
      'pdf-repair':         {i:'🔧', n:'PDF Repair'},
      'smart-crop':         {i:'✂️', n:'Smart Crop'},
      'ocr-pdf':            {i:'🔍', n:'OCR PDF'},
      'ai-pii-redact':      {i:'🛡️', n:'AI PII Redact'},
      'ai-invoice':         {i:'🧾', n:'AI Invoice'},
      'ai-toc':             {i:'📑', n:'AI TOC'},
      'ai-accessibility':   {i:'♿', n:'AI Accessibility'},
      'ai-crossref':        {i:'🔀', n:'AI Cross-Reference'},
    });
  }
  if (typeof window.TOOL_CHAINS !== 'undefined') {
    var nc = {
      'remove-blank-pages': ['compress','protect'],
      'reverse-pages':      ['compress','protect','sign'],
      'duplicate-pages':    ['compress','protect'],
      'page-borders':       ['compress','watermark','protect'],
      'pdf-repair':         ['compress','protect','sign'],
      'smart-crop':         ['compress','watermark'],
      'ocr-pdf':            ['ai-summarize','ai-qa','ai-translate','extract-text'],
      'ai-pii-redact':      ['redact','protect','flatten'],
      'ai-invoice':         ['ai-summarize','extract-text'],
      'ai-toc':             ['compress','protect'],
      'ai-accessibility':   ['ai-summarize'],
      'ai-crossref':        ['ai-summarize'],
    };
    Object.keys(nc).forEach(function(k) {
      window.TOOL_CHAINS[k] = nc[k];
    });
  }
});
function _aiKeyField(id) {
  return '<div class="field"><label>Anthropic API Key <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(free — 60 sec)</span></label>' +
    '<input type="password" id="aikey-' + id + '" placeholder="sk-ant-\u2026" oninput="saveAiKey(this.value)" autocomplete="off">' +
    '<span style="font-size:.72rem;color:var(--tx3)">Saved locally \u00b7 never sent to Dublesh</span></div>';
}
if (!window.TOOLS) window.TOOLS = {};
window.TOOLS['remove-blank-pages'] = {
  t: 'Remove Blank Pages',
  cat: 'organize',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div class="og" style="margin-top:.7rem"><div class="field"><label>Blank Threshold</label>' +
      '<select id="rb-thresh-' + id + '">' +
      '<option value="245">Strict (very white only)</option>' +
      '<option value="230" selected>Standard (recommended)</option>' +
      '<option value="210">Loose (light grey included)</option>' +
      '</select></div></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doRemoveBlankPages(\'' + id + '\')" disabled style="margin-top:.6rem">Remove Blank Pages</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doRemoveBlankPages = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    var thresh = parseInt(document.getElementById('rb-thresh-' + id).value) || 230;
    var {PDFDocument} = PDFLib;
    var srcBuf = await f[0].arrayBuffer();
    var pdfJs  = await pdfjsLib.getDocument({data: srcBuf.slice(0)}).promise;
    var total  = pdfJs.numPages;
    var blankPages = [];
    window.setSt(id, 'Scanning ' + total + ' pages for blank content\u2026', 'inf');
    for (var i = 1; i <= total; i++) {
      if (_cancelled[id]) break;
      window.setPrg(id, Math.round((i / total) * 70), 'Scanning page ' + i + ' of ' + total + '\u2026');
      var page = await pdfJs.getPage(i);
      var vp   = page.getViewport({scale: 0.15});
      var canvas = document.createElement('canvas');
      canvas.width  = Math.max(1, Math.round(vp.width));
      canvas.height = Math.max(1, Math.round(vp.height));
      await page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
      var data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      var sum = 0, pixels = data.length / 4;
      for (var p = 0; p < data.length; p += 4) sum += (data[p] + data[p+1] + data[p+2]) / 3;
      if ((sum / pixels) >= thresh) blankPages.push(i);
    }
    if (_cancelled[id]) { window.setBusy(id, false); return; }
    if (blankPages.length === 0) {
      window.setSt(id, '\u26a0 No blank pages detected — all ' + total + ' pages have content.', 'warn');
      window.setBusy(id, false); return;
    }
    window.setPrg(id, 80, 'Removing ' + blankPages.length + ' blank page(s)\u2026');
    var srcDoc  = await PDFDocument.load(srcBuf);
    var outDoc  = await PDFDocument.create();
    var keepIdx = [];
    for (var k = 0; k < total; k++) if (blankPages.indexOf(k + 1) === -1) keepIdx.push(k);
    var pages = await outDoc.copyPages(srcDoc, keepIdx);
    pages.forEach(function(p) { outDoc.addPage(p); });
    var bytes = await outDoc.save();
    window.dlBlob(new Blob([bytes], {type:'application/pdf'}), window.smartName(f[0], 'no-blanks'));
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Removed ' + blankPages.length + ' blank page(s) \u2014 ' + keepIdx.length + ' pages kept (' + window.fmt(bytes.byteLength) + ')', 'succ');
    window.pvShowCards(id, [{title:'Output', lines:[{label:'Blank removed', value:blankPages.length},{label:'Pages kept', value:keepIdx.length},{label:'Output size', value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id);
    window.addHist({tool:'remove-blank-pages', fileName:f[0].name, outSize:window.fmt(bytes.byteLength)});
    window.toast('Blank pages removed \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['reverse-pages'] = {
  t: 'Reverse Page Order',
  cat: 'organize',
  r: function(id) {
    return window.dzHTML(id, true, '.pdf') +
      '<button class="btn-p" id="btn-' + id + '" onclick="doReversePages(\'' + id + '\')" disabled style="margin-top:.6rem">Reverse Page Order</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doReversePages = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    window.setSt(id, 'Reversing page order\u2026', 'inf');
    window.setPrg(id, 20);
    var blobs = [];
    for (var fi = 0; fi < f.length; fi++) {
      if (_cancelled[id]) break;
      var {PDFDocument} = PDFLib;
      var buf = await f[fi].arrayBuffer();
      var src = await PDFDocument.load(buf, {ignoreEncryption:true});
      var out = await PDFDocument.create();
      var n   = src.getPageCount();
      var idx = Array.from({length:n}, function(_,i){ return n - 1 - i; });
      var ps  = await out.copyPages(src, idx);
      ps.forEach(function(p){ out.addPage(p); });
      var bytes = await out.save();
      blobs.push({blob: new Blob([bytes],{type:'application/pdf'}), name: window.smartName(f[fi],'reversed'), size: bytes.byteLength});
      window.setPrg(id, Math.round(20 + (fi+1)/f.length * 70));
    }
    if (_cancelled[id]) { window.setBusy(id, false); return; }
    if (blobs.length === 1) {
      window.dlBlob(blobs[0].blob, blobs[0].name);
    } else {
      await window.awaitJSZip();
      var zip = new JSZip();
      blobs.forEach(function(b){ zip.file(b.name, b.blob); });
      var zb = await zip.generateAsync({type:'blob'});
      window.dlBlob(zb, 'reversed_pages.zip');
    }
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 ' + blobs.length + ' file(s) reversed (' + window.fmt(blobs[0].size) + ')', 'succ');
    window.pvShowCards(id, blobs.map(function(b){ return {title:b.name, lines:[{label:'Pages', value:'reversed'},{label:'Size', value:window.fmt(b.size)}]}; }));
    window.pvReady(id);
    window.addHist({tool:'reverse-pages', fileName:f.length + ' file(s)', outSize:window.fmt(blobs[0].size)});
    window.toast('Pages reversed \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['duplicate-pages'] = {
  t: 'Duplicate Pages',
  cat: 'organize',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div class="og" style="margin-top:.7rem">' +
      '<div class="field"><label>Pages to Duplicate <span style="font-weight:400;color:var(--tx3);font-size:.75rem">(e.g. 1,3,5-7 or leave blank for all)</span></label>' +
      '<input type="text" id="dup-rng-' + id + '" placeholder="1,3 or 1-5 or blank for all"></div>' +
      '<div class="field"><label>Copies</label>' +
      '<input type="number" id="dup-copies-' + id + '" value="1" min="1" max="10" style="width:80px"></div>' +
      '<div class="field"><label>Insert</label>' +
      '<select id="dup-pos-' + id + '">' +
      '<option value="after">After original page</option>' +
      '<option value="end">At end of document</option>' +
      '</select></div></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doDuplicatePages(\'' + id + '\')" disabled style="margin-top:.6rem">Duplicate Pages</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doDuplicatePages = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    var rng    = (document.getElementById('dup-rng-' + id) || {}).value || '';
    var copies = Math.max(1, Math.min(10, parseInt((document.getElementById('dup-copies-' + id) || {}).value) || 1));
    var pos    = (document.getElementById('dup-pos-' + id) || {}).value || 'after';
    window.setSt(id, 'Duplicating pages\u2026', 'inf');
    window.setPrg(id, 20);
    var {PDFDocument} = PDFLib;
    var buf = await f[0].arrayBuffer();
    var src = await PDFDocument.load(buf, {ignoreEncryption:true});
    var n   = src.getPageCount();
    var idx = rng.trim() ? window.parseRange(rng, n) : Array.from({length:n},function(_,i){return i;});
    if (!idx.length) { window.setSt(id,'No valid pages in range','err'); window.setBusy(id,false); return; }
    var out = await PDFDocument.create();
    if (pos === 'after') {
      var allIdx = [];
      for (var i = 0; i < n; i++) {
        allIdx.push(i);
        if (idx.indexOf(i) !== -1) {
          for (var c = 0; c < copies; c++) allIdx.push(i);
        }
      }
      var ps = await out.copyPages(src, allIdx);
      ps.forEach(function(p){ out.addPage(p); });
    } else {
      var origIdx = Array.from({length:n},function(_,i){return i;});
      var dupIdx  = [];
      for (var c2 = 0; c2 < copies; c2++) idx.forEach(function(i){ dupIdx.push(i); });
      var ps2 = await out.copyPages(src, origIdx.concat(dupIdx));
      ps2.forEach(function(p){ out.addPage(p); });
    }
    var bytes = await out.save();
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}), window.smartName(f[0],'duplicated'));
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Duplicated ' + idx.length + ' page(s) \u00d7' + copies + ' \u2014 ' + out.getPageCount() + ' total pages (' + window.fmt(bytes.byteLength) + ')', 'succ');
    window.pvShowCards(id,[{title:'Output',lines:[{label:'Duplicated',value:idx.length+' page(s) \u00d7'+copies},{label:'Total pages',value:out.getPageCount()},{label:'Size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id);
    window.addHist({tool:'duplicate-pages', fileName:f[0].name, outSize:window.fmt(bytes.byteLength)});
    window.toast('Pages duplicated \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['page-borders'] = {
  t: 'Add Page Borders',
  cat: 'edit',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div class="og" style="margin-top:.7rem">' +
      '<div class="field"><label>Border Colour</label>' +
      '<input type="color" id="pb-color-' + id + '" value="#000000" style="width:48px;height:32px;border-radius:6px;cursor:pointer;border:1px solid var(--bd)"></div>' +
      '<div class="field"><label>Border Width (pt)</label>' +
      '<input type="number" id="pb-width-' + id + '" value="4" min="1" max="40" style="width:80px"></div>' +
      '<div class="field"><label>Offset from page edge (pt)</label>' +
      '<input type="number" id="pb-offset-' + id + '" value="10" min="0" max="72" style="width:80px"></div>' +
      '<div class="field"><label>Apply to</label>' +
      '<select id="pb-apply-' + id + '">' +
      '<option value="all">All pages</option>' +
      '<option value="odd">Odd pages only</option>' +
      '<option value="even">Even pages only</option>' +
      '<option value="first">First page only</option>' +
      '</select></div></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doPageBorders(\'' + id + '\')" disabled style="margin-top:.6rem">Add Borders</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doPageBorders = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    var colorHex = (document.getElementById('pb-color-' + id) || {}).value || '#000000';
    var bWidth   = parseFloat((document.getElementById('pb-width-' + id) || {}).value) || 4;
    var offset   = parseFloat((document.getElementById('pb-offset-' + id) || {}).value) || 10;
    var apply    = (document.getElementById('pb-apply-' + id) || {}).value || 'all';
    var r = parseInt(colorHex.slice(1,3),16)/255;
    var g = parseInt(colorHex.slice(3,5),16)/255;
    var b = parseInt(colorHex.slice(5,7),16)/255;
    window.setSt(id, 'Adding borders\u2026', 'inf');
    window.setPrg(id, 20);
    var {PDFDocument, rgb} = PDFLib;
    var buf = await f[0].arrayBuffer();
    var doc = await PDFDocument.load(buf, {ignoreEncryption:true});
    var pages = doc.getPages();
    pages.forEach(function(page, i) {
      var pageNum = i + 1;
      var skip = false;
      if (apply === 'odd'   && pageNum % 2 === 0) skip = true;
      if (apply === 'even'  && pageNum % 2 === 1) skip = true;
      if (apply === 'first' && pageNum !== 1)      skip = true;
      if (skip) return;
      var pw = page.getWidth();
      var ph = page.getHeight();
      var o  = offset + bWidth / 2;
      page.drawRectangle({
        x: o, y: o,
        width:  pw - o * 2,
        height: ph - o * 2,
        borderColor: rgb(r, g, b),
        borderWidth: bWidth,
        opacity: 0,
        borderOpacity: 1
      });
    });
    var bytes = await doc.save();
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}), window.smartName(f[0],'bordered'));
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Borders added to ' + pages.length + ' pages (' + window.fmt(bytes.byteLength) + ')', 'succ');
    window.pvShowCards(id,[{title:'Output',lines:[{label:'Pages',value:pages.length},{label:'Border width',value:bWidth+'pt'},{label:'Size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id);
    window.addHist({tool:'page-borders', fileName:f[0].name, outSize:window.fmt(bytes.byteLength)});
    window.toast('Borders added \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['pdf-repair'] = {
  t: 'PDF Repair',
  cat: 'edit',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div style="margin-top:.6rem;font-size:.76rem;color:var(--tx3);line-height:1.5">' +
      'Attempts to recover corrupted or truncated PDFs by rebuilding the internal structure. Works on most partially-damaged files.' +
      '</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doPdfRepair(\'' + id + '\')" disabled style="margin-top:.6rem">Repair PDF</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doPdfRepair = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    window.setSt(id, 'Attempting PDF repair\u2026', 'inf');
    window.setPrg(id, 20);
    var {PDFDocument} = PDFLib;
    var buf = await f[0].arrayBuffer();
    var doc;
    try {
      doc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false
      });
    } catch(loadErr) {
      window.setSt(id, '\u2715 PDF too damaged to repair: ' + loadErr.message, 'err');
      window.setBusy(id, false); return;
    }
    window.setPrg(id, 60, 'Rebuilding PDF structure\u2026');
    var pageCount = doc.getPageCount();
    var bytes = await doc.save();
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}), window.smartName(f[0],'repaired'));
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Repaired \u2014 ' + pageCount + ' page(s) recovered (' + window.fmt(bytes.byteLength) + ')', 'succ');
    window.pvShowCards(id,[{title:'Repaired PDF',lines:[{label:'Pages recovered',value:pageCount},{label:'Output size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id);
    window.addHist({tool:'pdf-repair', fileName:f[0].name, outSize:window.fmt(bytes.byteLength)});
    window.toast('PDF repaired \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['smart-crop'] = {
  t: 'Smart Crop (Auto Margins)',
  cat: 'edit',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div class="og" style="margin-top:.7rem">' +
      '<div class="field"><label>White Threshold</label>' +
      '<select id="sc-thresh-' + id + '">' +
      '<option value="240">Strict (bright white only)</option>' +
      '<option value="220" selected>Standard (recommended)</option>' +
      '<option value="200">Loose (light grey included)</option>' +
      '</select></div>' +
      '<div class="field"><label>Padding to keep (pt)</label>' +
      '<input type="number" id="sc-pad-' + id + '" value="8" min="0" max="36" style="width:80px"></div></div>' +
      '<div style="margin:.5rem 0;font-size:.75rem;color:var(--tx3)">Renders each page, detects content bounds, sets CropBox to remove surrounding white space.</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doSmartCrop(\'' + id + '\')" disabled style="margin-top:.6rem">Auto-Crop Margins</button>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doSmartCrop = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:150});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    var thresh = parseInt((document.getElementById('sc-thresh-' + id) || {}).value) || 220;
    var pad    = parseFloat((document.getElementById('sc-pad-' + id) || {}).value) || 8;
    var {PDFDocument} = PDFLib;
    var buf   = await f[0].arrayBuffer();
    var pdfJs = await pdfjsLib.getDocument({data: buf.slice(0)}).promise;
    var total = pdfJs.numPages;
    window.setSt(id, 'Analysing ' + total + ' pages\u2026', 'inf');
    var cropBoxes = [];
    var SCALE = 0.5;
    for (var i = 1; i <= total; i++) {
      if (_cancelled[id]) break;
      window.setPrg(id, Math.round((i / total) * 70), 'Scanning page ' + i + '\u2026');
      var page = await pdfJs.getPage(i);
      var vp   = page.getViewport({scale: SCALE});
      var canvas = document.createElement('canvas');
      canvas.width  = Math.max(1, Math.round(vp.width));
      canvas.height = Math.max(1, Math.round(vp.height));
      await page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
      var ctx  = canvas.getContext('2d');
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var w = canvas.width, h = canvas.height;
      var minX = w, minY = h, maxX = 0, maxY = 0;
      for (var py = 0; py < h; py++) {
        for (var px = 0; px < w; px++) {
          var off = (py * w + px) * 4;
          var lum = (data[off] + data[off+1] + data[off+2]) / 3;
          if (lum < thresh) {
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
          }
        }
      }
      if (minX > maxX || minY > maxY) { cropBoxes.push(null); continue; }
      var pdfW = vp.width / SCALE;
      var pdfH = vp.height / SCALE;
      var x0 = Math.max(0, (minX / SCALE) - pad);
      var y0 = Math.max(0, (minY / SCALE) - pad);
      var x1 = Math.min(pdfW, (maxX / SCALE) + pad);
      var y1 = Math.min(pdfH, (maxY / SCALE) + pad);
      cropBoxes.push({
        x: x0,
        y: pdfH - y1,
        width:  x1 - x0,
        height: y1 - y0
      });
    }
    if (_cancelled[id]) { window.setBusy(id, false); return; }
    window.setPrg(id, 80, 'Applying crop boxes\u2026');
    var srcDoc = await PDFDocument.load(buf, {ignoreEncryption:true});
    var pages  = srcDoc.getPages();
    var cropped = 0;
    pages.forEach(function(page, i) {
      var cb = cropBoxes[i];
      if (!cb) return;
      page.setCropBox(cb.x, cb.y, cb.width, cb.height);
      cropped++;
    });
    var bytes = await srcDoc.save();
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}), window.smartName(f[0],'smart-cropped'));
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Margins removed from ' + cropped + ' page(s) (' + window.fmt(bytes.byteLength) + ')', 'succ');
    window.pvShowCards(id,[{title:'Output',lines:[{label:'Pages cropped',value:cropped},{label:'Size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id);
    window.addHist({tool:'smart-crop', fileName:f[0].name, outSize:window.fmt(bytes.byteLength)});
    window.toast('Margins removed \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.TOOLS['ocr-pdf'] = {
  t: 'OCR PDF (Scan to Text)',
  cat: 'convert',
  r: function(id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div class="og" style="margin-top:.7rem">' +
      '<div class="field"><label>Language</label>' +
      '<select id="ocr-lang-' + id + '">' +
      '<option value="eng" selected>English</option>' +
      '<option value="hin">Hindi</option>' +
      '<option value="spa">Spanish</option>' +
      '<option value="fra">French</option>' +
      '<option value="deu">German</option>' +
      '<option value="ara">Arabic</option>' +
      '<option value="por">Portuguese</option>' +
      '<option value="chi_sim">Chinese (Simplified)</option>' +
      '</select></div>' +
      '<div class="field"><label>Render Scale <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(higher = better accuracy, slower)</span></label>' +
      '<select id="ocr-scale-' + id + '">' +
      '<option value="1.5">Fast (1.5×)</option>' +
      '<option value="2" selected>Balanced (2×)</option>' +
      '<option value="3">High Quality (3×)</option>' +
      '</select></div></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doOcrPdf(\'' + id + '\')" disabled style="margin-top:.6rem">Extract Text via OCR</button>' +
      '<div id="ocr-actions-' + id + '" style="display:none;display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem">' +
      '<button class="btn-s" onclick="(function(){var t=document.getElementById(\'ocr-out-' + id + '\').value;if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){window.toast(\'Copied \u2713\');});})()">📋 Copy All</button>' +
      '<button class="btn-s" onclick="(function(){var t=document.getElementById(\'ocr-out-' + id + '\').value;var b=new Blob([t],{type:\'text/plain\'});var a=document.createElement(\'a\');a.href=URL.createObjectURL(b);a.download=\'ocr_result.txt\';a.click();})()">⬇ Save .txt</button>' +
      '</div>' +
      '<textarea id="ocr-out-' + id + '" style="display:none;margin-top:.6rem;width:100%;min-height:200px;font-family:monospace;font-size:.78rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.7rem;resize:vertical;color:var(--tx)" readonly placeholder="OCR text appears here\u2026"></textarea>' +
      window.pvUI(id) + window.sf(id);
  }
};
window.doOcrPdf = async function(id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:100});
  if (err) { window.setSt(id, err, 'err'); return; }
  window.setBusy(id, true);
  try {
    if (typeof Tesseract === 'undefined') {
      window.setSt(id, '⬇ Downloading OCR engine (~1.3 MB) — one-time download…', 'inf');
      window.setPrg(id, 5, 'Downloading Tesseract.js…');
      await new Promise(function(res, rej) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        s.onload = function() { window.setPrg(id, 15, 'OCR engine ready'); res(); };
        s.onerror = function(){ rej(new Error('Tesseract.js failed to load. Check internet connection and try again.')); };
        document.head.appendChild(s);
      });
      window.setSt(id, 'OCR engine loaded. Initialising language model…', 'inf');
    }
    var lang  = (document.getElementById('ocr-lang-' + id) || {}).value || 'eng';
    var scale = parseFloat((document.getElementById('ocr-scale-' + id) || {}).value) || 2;
    var buf   = await f[0].arrayBuffer();
    var pdfJs = await pdfjsLib.getDocument({data: buf}).promise;
    var total = pdfJs.numPages;
    window.setSt(id, 'Initialising OCR for ' + total + ' page(s)\u2026', 'inf');
    var worker = await Tesseract.createWorker(lang, 1, {
      logger: function(m) {
        if (m.status === 'recognizing text') {
          window.setPrg(id, Math.round(m.progress * 100));
        }
      }
    });
    var fullText = '';
    for (var i = 1; i <= total; i++) {
      if (_cancelled[id]) break;
      window.setPrg(id, Math.round((i - 1) / total * 100), 'OCR page ' + i + ' of ' + total + '\u2026');
      window.setSt(id, 'OCR: page ' + i + ' of ' + total + '\u2026', 'inf');
      var page = await pdfJs.getPage(i);
      var vp   = page.getViewport({scale: scale});
      var canvas = document.createElement('canvas');
      canvas.width  = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      await page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
      var result = await worker.recognize(canvas);
      fullText += '--- Page ' + i + ' ---\n' + result.data.text + '\n\n';
    }
    await worker.terminate();
    if (_cancelled[id]) { window.setBusy(id, false); return; }
    var ta = document.getElementById('ocr-out-' + id);
    var actions = document.getElementById('ocr-actions-' + id);
    if (ta) { ta.value = fullText; ta.style.display = 'block'; }
    if (actions) actions.style.display = 'flex';
    window.setPrg(id, 100);
    var wordCount = fullText.split(/\s+/).filter(Boolean).length;
    window.setSt(id, '\u2713 OCR complete \u2014 ' + wordCount + ' words extracted from ' + total + ' page(s)', 'succ');
    window.pvReady(id);
    window.addHist({tool:'ocr-pdf', fileName:f[0].name, outSize:wordCount + ' words'});
    window.toast('OCR complete \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
function _aiToolRender(id, extraFields, btnLabel, btnFn) {
  return _aiKeyField(id) +
    window.dzHTML(id, true, '.pdf,application/pdf') +
    extraFields +
    '<button class="btn-p" id="btn-' + id + '" onclick="' + btnFn + '(\'' + id + '\')" disabled style="margin-top:.6rem">' + btnLabel + '</button>' +
    '<div id="aiR-' + id + '" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem 1rem;font-size:.85rem;line-height:1.65;white-space:pre-wrap;max-height:320px;overflow-y:auto"></div>' +
    window.sf(id);
}
function _aiToolFinish(id, reply, toolName, fileName) {
  var ra = document.getElementById('aiR-' + id);
  if (ra) { ra.textContent = reply; ra.style.display = 'block'; }
  window._injectAiCopyButtons(id, [{title: toolName, text: reply}]);
  window.setPrg(id, 100);
  window.setSt(id, '\u2713 Done', 'succ');
  window.pvReady(id);
  window.addHist({tool: toolName, fileName: fileName});
  window.toast(toolName + ' complete \u2713');
}
async function _runAiTool(id, toolName, buildPrompt) {
  await window.awaitLibs();
  if (!window._checkAiCooldown(id)) return;
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:50});
  if (err) { window.setSt(id, err, 'err'); return; }
  var keyEl = document.getElementById('aikey-' + id);
  var key   = keyEl ? keyEl.value.trim() : window.getAiKey ? window.getAiKey() : '';
  if (!key) { window.setSt(id, '\u26a0 Enter your Anthropic API key above', 'warn'); return; }
  window.setBusy(id, true);
  try {
    window.setSt(id, 'Extracting text\u2026', 'inf');
    window.setPrg(id, 20);
    var result = await window.extractAllText(f[0]);
    if (result.text.trim().length < 30) {
      window.setSt(id, '\u26a0 Very little text found — this may be a scanned PDF. Try OCR PDF first.', 'warn');
      window.setBusy(id, false); return;
    }
    var prompt = buildPrompt(result);
    window.setPrg(id, 50, 'Calling Claude AI\u2026');
    var reply = await window.callClaude(key, prompt.system, prompt.user);
    _aiToolFinish(id, reply, toolName, f[0].name);
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
}
window.TOOLS['ai-pii-redact'] = {
  t: 'AI PII Redact',
  cat: 'ai',
  r: function(id) {
    return _aiToolRender(id,
      '<div class="field" style="margin-top:.6rem"><label>PII Types to Detect</label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.3rem">' +
      ['Names','Email','Phone','Aadhaar','PAN','Address','DOB','Account No','Passport'].map(function(t){
        return '<label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer">' +
          '<input type="checkbox" value="' + t + '" class="pii-cb-' + id + '" checked> ' + t + '</label>';
      }).join('') +
      '</div></div>',
      'Detect & Report PII', 'doAiPiiRedact'
    );
  }
};
window.doAiPiiRedact = async function(id) {
  var types = [];
  document.querySelectorAll('.pii-cb-' + id + ':checked').forEach(function(cb){ types.push(cb.value); });
  if (!types.length) { window.setSt(id, 'Select at least one PII type', 'warn'); return; }
  await _runAiTool(id, 'ai-pii-redact', function(result) {
    return {
      system: 'You are a PII detection specialist. Analyse the text and list every instance of personally identifiable information found. For each instance report: TYPE | VALUE | CONTEXT (surrounding words). Group by PII type. Be thorough and precise.',
      user:   'Detect the following PII types: ' + types.join(', ') + '.\n\nDocument (' + result.numPages + ' pages):\n' + result.text.slice(0, 14000) +
              '\n\nList all detected PII instances in a clear table format. Then provide a Privacy Risk Summary at the end.'
    };
  });
};
window.TOOLS['ai-toc'] = {
  t: 'AI Table of Contents',
  cat: 'ai',
  r: function(id) {
    return _aiToolRender(id,
      '<div class="field" style="margin-top:.6rem"><label>TOC Depth</label>' +
      '<select id="aitoc-depth-' + id + '">' +
      '<option value="2">H1 + H2 (recommended)</option>' +
      '<option value="3">H1 + H2 + H3 (detailed)</option>' +
      '<option value="1">H1 only (top-level)</option>' +
      '</select></div>',
      'Generate Table of Contents', 'doAiToc'
    );
  }
};
window.doAiToc = async function(id) {
  var depth = (document.getElementById('aitoc-depth-' + id) || {}).value || '2';
  await _runAiTool(id, 'ai-toc', function(result) {
    return {
      system: 'You are a document structure expert. Extract the hierarchical heading structure from the provided document text and produce a clean Table of Contents.',
      user:   'Generate a Table of Contents with ' + depth + ' levels of depth.\n\nFormat: indent sub-headings with spaces, add approximate page numbers where inferable.\n\nDocument (' + result.numPages + ' pages):\n' + result.text.slice(0, 14000)
    };
  });
};
window.TOOLS['ai-invoice'] = {
  t: 'AI Invoice Extractor',
  cat: 'ai',
  r: function(id) {
    return _aiToolRender(id,
      '<div class="field" style="margin-top:.6rem"><label>Document Type</label>' +
      '<select id="aiinv-type-' + id + '">' +
      '<option value="invoice">Invoice / Bill</option>' +
      '<option value="contract">Contract / Agreement</option>' +
      '<option value="resume">Resume / CV</option>' +
      '<option value="form">Government Form</option>' +
      '<option value="report">Financial Report</option>' +
      '<option value="auto">Auto-detect</option>' +
      '</select></div>' +
      '<div class="field"><label>Output Format</label>' +
      '<select id="aiinv-fmt-' + id + '">' +
      '<option value="table">Structured Table</option>' +
      '<option value="json">JSON</option>' +
      '<option value="csv">CSV</option>' +
      '</select></div>',
      'Extract Data', 'doAiInvoice'
    );
  }
};
window.doAiInvoice = async function(id) {
  var docType = (document.getElementById('aiinv-type-' + id) || {}).value || 'auto';
  var fmt     = (document.getElementById('aiinv-fmt-' + id) || {}).value || 'table';
  await _runAiTool(id, 'ai-invoice', function(result) {
    var typeInstr = {
      invoice:  'Extract: Invoice No, Date, Vendor, Buyer, Line items (description/qty/rate/amount), Subtotal, Tax, Total, Payment terms, Due date.',
      contract: 'Extract: Parties, Effective date, Expiry date, Key obligations, Payment terms, Penalty clauses, Governing law.',
      resume:   'Extract: Name, Email, Phone, Location, Skills, Experience (company/title/dates), Education, Certifications.',
      form:     'Extract: Form title, Form number, All field labels and their values.',
      report:   'Extract: Report title, Date, Key financial figures, Revenue, Expenses, Net profit, Year-over-year changes.',
      auto:     'Identify the document type, then extract all key structured data fields relevant to that type.'
    }[docType] || 'Extract all key structured data.';
    var fmtInstr = fmt === 'json' ? 'Output as valid JSON only.' : fmt === 'csv' ? 'Output as CSV with header row.' : 'Output as a clear formatted table with Field | Value columns.';
    return {
      system: 'You are a data extraction specialist. Extract structured information from documents precisely. ' + fmtInstr,
      user:   typeInstr + '\n\nDocument (' + result.numPages + ' pages):\n' + result.text.slice(0, 14000)
    };
  });
};
window.TOOLS['ai-accessibility'] = {
  t: 'AI Accessibility Check',
  cat: 'ai',
  r: function(id) {
    return _aiToolRender(id,
      '<div style="margin-top:.5rem;font-size:.75rem;color:var(--tx3);line-height:1.5">Checks the extracted text for WCAG 2.1 accessibility concerns: reading level, structure, language clarity, heading hierarchy, and missing alt-text indicators.</div>',
      'Check Accessibility', 'doAiAccessibility'
    );
  }
};
window.doAiAccessibility = async function(id) {
  await _runAiTool(id, 'ai-accessibility', function(result) {
    return {
      system: 'You are a WCAG 2.1 accessibility expert. Audit the provided document text for accessibility issues.',
      user:   'Perform a WCAG 2.1 AA accessibility audit on this ' + result.numPages + '-page document.\n\nCheck for:\n' +
              '1. Reading level (Flesch-Kincaid grade)\n' +
              '2. Heading hierarchy (H1 > H2 > H3 structure)\n' +
              '3. Language clarity (plain language score)\n' +
              '4. List and table structure issues\n' +
              '5. Colour/contrast issues mentioned in text\n' +
              '6. Missing alt text indicators (images referenced without description)\n\n' +
              'Give a compliance score (0-100) and specific actionable fixes.\n\n' +
              'Document:\n' + result.text.slice(0, 12000)
    };
  });
};
window.TOOLS['ai-crossref'] = {
  t: 'AI Cross-Reference',
  cat: 'ai',
  r: function(id) {
    return _aiKeyField(id) +
      window.dzHTML(id, true, '.pdf,application/pdf') +
      '<div style="margin:.4rem 0;font-size:.75rem;color:var(--tx3)">Upload 2–5 PDFs to compare. Claude will identify conflicts, inconsistencies and cross-references between them.</div>' +
      '<div class="field" style="margin-top:.5rem"><label>Analysis Mode</label>' +
      '<select id="aicr-mode-' + id + '">' +
      '<option value="conflicts">Find conflicts and contradictions</option>' +
      '<option value="summary">Comparative summary</option>' +
      '<option value="amendments">Identify amendments vs original</option>' +
      '</select></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doAiCrossref(\'' + id + '\')" disabled style="margin-top:.6rem">Compare Documents</button>' +
      '<div id="aiR-' + id + '" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem 1rem;font-size:.85rem;line-height:1.65;white-space:pre-wrap;max-height:320px;overflow-y:auto"></div>' +
      window.sf(id);
  }
};
window.doAiCrossref = async function(id) {
  await window.awaitLibs();
  if (!window._checkAiCooldown(id)) return;
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:50, maxFiles:5});
  if (err) { window.setSt(id, err, 'err'); return; }
  if (!f || f.length < 2) { window.setSt(id, 'Upload at least 2 PDFs to compare', 'warn'); return; }
  var keyEl = document.getElementById('aikey-' + id);
  var key   = keyEl ? keyEl.value.trim() : '';
  if (!key) { window.setSt(id, '\u26a0 Enter your Anthropic API key above', 'warn'); return; }
  window.setBusy(id, true);
  try {
    var mode = (document.getElementById('aicr-mode-' + id) || {}).value || 'conflicts';
    var docTexts = [];
    for (var fi = 0; fi < Math.min(f.length, 5); fi++) {
      window.setPrg(id, Math.round((fi / f.length) * 50), 'Reading ' + f[fi].name + '\u2026');
      var result = await window.extractAllText(f[fi]);
      docTexts.push('=== Document ' + (fi+1) + ': ' + f[fi].name + ' ===\n' + result.text.slice(0, Math.floor(10000 / f.length)));
    }
    var modeInstr = {
      conflicts:  'Identify all conflicts, contradictions and inconsistencies between the documents. List each conflict with: what Doc A says vs what Doc B says, and which document should take precedence.',
      summary:    'Provide a side-by-side comparative summary highlighting: key similarities, key differences, unique content in each document.',
      amendments: 'Identify all amendments, additions and deletions in the later documents compared to the first document. Format as a change log.'
    }[mode] || 'Compare the documents thoroughly.';
    var systemPrompt = 'You are a legal and document analysis expert specialised in cross-document comparison.';
    var userMsg = modeInstr + '\n\n' + docTexts.join('\n\n');
    window.setPrg(id, 60, 'Claude is comparing\u2026');
    var reply = await window.callClaude(key, systemPrompt, userMsg);
    var ra = document.getElementById('aiR-' + id);
    if (ra) { ra.textContent = reply; ra.style.display = 'block'; }
    window._injectAiCopyButtons(id, [{title:'Cross-Reference', text:reply}]);
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 ' + f.length + ' documents compared', 'succ');
    window.pvReady(id);
    window.addHist({tool:'ai-crossref', fileName:f.length+' files'});
    window.toast('Cross-reference complete \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window.callClaudeStream = async function(apiKey, system, userMsg, onChunk) {
  checkAiRateLimit();
  var model = (typeof _aiModel !== 'undefined') ? _aiModel : 'claude-haiku-4-5-20251001';
  var ac = new AbortController();
  var timer = setTimeout(function(){ ac.abort(); }, 60000);
  var resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2048,
        stream: true,
        system: system,
        messages: [{role:'user', content:userMsg}]
      }),
      signal: ac.signal
    });
  } catch(fetchErr) {
    clearTimeout(timer);
    if (fetchErr.name === 'AbortError') throw new Error('Request timed out (60s).');
    throw fetchErr;
  }
  clearTimeout(timer);
  if (!resp.ok) {
    var e = await resp.json().catch(function(){ return {}; });
    throw new Error((e.error && e.error.message) || 'API error ' + resp.status);
  }
  var reader  = resp.body.getReader();
  var decoder = new TextDecoder();
  var full    = '';
  while (true) {
    var chunk = await reader.read();
    if (chunk.done) break;
    var lines = decoder.decode(chunk.value, {stream:true}).split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line.startsWith('data: ')) continue;
      try {
        var data = JSON.parse(line.slice(6));
        if (data.type === 'content_block_delta' && data.delta && data.delta.text) {
          full += data.delta.text;
          if (typeof onChunk === 'function') onChunk(data.delta.text, full);
        }
      } catch(ex) {}
    }
  }
  return full;
};
var _origDoAiSum = window.doAiSummarize;
window.doAiSummarize = async function(id) {
  await window.awaitLibs();
  if (typeof window._checkAiCooldown === 'function' && !window._checkAiCooldown(id)) return;
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:50});
  if (err) { window.setSt(id, err, 'err'); return; }
  var keyEl = document.getElementById('aikey-' + id);
  var key   = keyEl ? keyEl.value.trim() : '';
  if (!key) { window.setSt(id, '\u26a0 Enter your Anthropic API key above', 'warn'); return; }
  window.setBusy(id, true);
  try {
    window.setSt(id, 'Extracting text\u2026', 'inf');
    window.setPrg(id, 15);
    var result = await window.extractAllText(f[0]);
    if (result.text.trim().length < 30) {
      window.setSt(id, '\u26a0 Very little text found. This may be a scanned PDF — try OCR PDF first.', 'warn');
      window.setBusy(id, false); return;
    }
    var focus = (document.getElementById('aifocus-' + id) || {}).value || '';
    var focusMap = {
      bullet:    'Respond with exactly 3 concise bullet points covering the main ideas.',
      executive: 'Write a formal executive summary: Purpose, Key Findings, Recommendations.',
      detailed:  'Provide a detailed section-by-section analysis with subheadings.',
      simple:    'Explain in plain simple language for a non-expert.',
      legal:     'Identify key legal/technical clauses, obligations, dates and parties.'
    };
    var focusInstr = focusMap[focus] || 'Provide a balanced overview covering main topics and conclusions.';
    var systemPrompt = 'You are a precise document analyst. ' + focusInstr + ' Use markdown formatting.';
    var userMsg = 'Summarize this ' + result.numPages + '-page PDF:\n\n' + result.text.slice(0, 15000);
    window.setPrg(id, 40, 'Summarising with Claude\u2026');
    var ra = document.getElementById('aiR-' + id);
    if (ra) { ra.textContent = ''; ra.style.display = 'block'; }
    var reply = await window.callClaudeStream(key, systemPrompt, userMsg, function(chunk, full) {
      if (ra) ra.textContent = full;
    });
    window._injectAiCopyButtons(id, [{title:f[0].name, text:reply}]);
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Summary ready', 'succ');
    window.pvReady(id);
    window.addHist({tool:'ai-summarize', fileName:f[0].name});
    window.toast('Summary ready \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
window._AI_CONV = {};
var _origDoAiQa2 = window.doAiQa;
window.doAiQa = async function(id) {
  await window.awaitLibs();
  if (typeof window._checkAiCooldown === 'function' && !window._checkAiCooldown(id)) return;
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f || [], {types:['pdf'], maxMB:50});
  if (err) { window.setSt(id, err, 'err'); return; }
  var keyEl = document.getElementById('aikey-' + id);
  var key   = keyEl ? keyEl.value.trim() : '';
  if (!key) { window.setSt(id, '\u26a0 Enter your Anthropic API key above', 'warn'); return; }
  var qEl = document.getElementById('aiQ-' + id);
  var q   = qEl ? qEl.value.trim() : '';
  if (!q) { window.setSt(id, 'Enter a question first', 'warn'); return; }
  window.setBusy(id, true);
  try {
    if (!window._AI_CONV[id]) window._AI_CONV[id] = [];
    window.setSt(id, 'Reading document\u2026', 'inf');
    window.setPrg(id, 20);
    var result = await window.extractAllText(f[0]);
    var styleEl = document.getElementById('aiQstyle-' + id);
    var style   = styleEl ? styleEl.value : 'concise';
    var styleInstr = {
      concise:  'Answer concisely in 2-3 sentences.',
      detailed: 'Give a detailed explanation with evidence from the document.',
      bullets:  'Answer using bullet points.',
      quote:    'Quote relevant text from the document, then explain.'
    }[style] || 'Answer concisely.';
    var systemPrompt = 'You are a document analyst. Answer questions accurately based on the document. ' + styleInstr;
    var pdfContext = 'Document (' + result.numPages + ' pages):\n' + result.text.slice(0, 10000) + '\n\n---';
    var conv = window._AI_CONV[id];
    conv.push({role:'user', content: q});
    if (conv.length > 20) conv.splice(0, conv.length - 20);
    var messages = [{role:'user', content:pdfContext}].concat(conv);
    window.setPrg(id, 50, 'Claude is thinking\u2026');
    var ra = document.getElementById('aiR-' + id);
    if (ra) { ra.textContent = ''; ra.style.display = 'block'; }
    var reply = await window.callClaudeStream(key, systemPrompt,
      messages[messages.length-1].content,
      function(chunk, full) { if (ra) ra.textContent = full; }
    );
    conv.push({role:'assistant', content:reply});
    window._AI_CONV[id] = conv;
    if (qEl) qEl.value = '';
    window._injectAiCopyButtons(id, [{title:'Answer', text:reply}]);
    window.setPrg(id, 100);
    window.setSt(id, '\u2713 Answer ready (' + conv.length/2 + ' exchange(s) in session)', 'succ');
    window.pvReady(id);
    window.addHist({tool:'ai-qa', fileName:f[0].name});
    window.toast('Answer ready \u2713');
  } catch(e) {
    window.setPrg(id, 0);
    window.setSt(id, '\u2715 ' + e.message, 'err');
  }
  window.setBusy(id, false);
};
(function() {
  if (typeof window.TOOL_ICONS !== 'undefined') {
    Object.assign(window.TOOL_ICONS, {
      'remove-blank-pages': '🗑️',
      'reverse-pages':      '🔃',
      'duplicate-pages':    '📄',
      'page-borders':       '🖼',
      'pdf-repair':         '🔧',
      'smart-crop':         '✂️',
      'ocr-pdf':            '🔍',
      'ai-pii-redact':      '🛡️',
      'ai-invoice':         '🧾',
      'ai-toc':             '📑',
      'ai-accessibility':   '♿',
      'ai-crossref':        '🔀',
    });
  }
})();
(function() {
  var _origDoFilter = window.doFilter;
  if (typeof _origDoFilter !== 'function') return;
  window.doFilter = function(q) {
    _origDoFilter.call(this, q);
  };
})();
(function() {
  if (typeof window.TOOL_SEO !== 'undefined') {
    Object.assign(window.TOOL_SEO, {
      'remove-blank-pages': {t:'Remove Blank Pages from PDF Free | Dublesh', d:'Auto-detect and delete near-white blank pages from any PDF. Free, private, no upload.'},
      'reverse-pages':      {t:'Reverse PDF Page Order Free | Dublesh', d:'Flip the page order of any PDF in one click. 100% private, runs in your browser.'},
      'duplicate-pages':    {t:'Duplicate PDF Pages Free | Dublesh', d:'Copy and repeat pages within a PDF. Perfect for templates and booklets.'},
      'page-borders':       {t:'Add Page Borders to PDF Free | Dublesh', d:'Add decorative border frames to PDF pages. Choose colour, width and offset.'},
      'pdf-repair':         {t:'Repair Corrupted PDF Free | Dublesh', d:'Attempt to recover and rebuild damaged or corrupted PDF files. Free and private.'},
      'smart-crop':         {t:'Auto Crop PDF Margins Free | Dublesh', d:'Automatically detect and remove white margins from PDF pages. Smart crop using pixel analysis.'},
      'ocr-pdf':            {t:'OCR PDF Free — Scan to Text | Dublesh', d:'Extract text from scanned image PDFs using Tesseract.js OCR. Free, private, no upload.'},
      'ai-pii-redact':      {t:'AI PII Redact PDF Free | Dublesh', d:'Auto-detect names, emails, Aadhaar, PAN and other PII in PDFs using Claude AI.'},
      'ai-invoice':         {t:'AI Invoice Data Extractor Free | Dublesh', d:'Extract structured data from invoices, contracts and forms using Claude AI.'},
      'ai-toc':             {t:'AI Table of Contents Generator Free | Dublesh', d:'Generate a Table of Contents from PDF headings using Claude AI.'},
      'ai-accessibility':   {t:'AI PDF Accessibility Checker Free | Dublesh', d:'Check your PDF for WCAG 2.1 accessibility compliance using Claude AI.'},
      'ai-crossref':        {t:'AI PDF Cross-Reference Comparison Free | Dublesh', d:'Compare 2-5 PDFs and find conflicts, amendments and cross-references using Claude AI.'},
    });
  }
})();

})();

(function () {
'use strict';
if (!window.TOOLS) window.TOOLS = {};
if (!window.TOOL_CHAINS) window.TOOL_CHAINS = {};
window.TOOLS['annotate-pdf'] = {
  t: 'Annotate PDF', cat: 'edit',
  r: function (id) {
    return window.dzHTML(id, false, '.pdf') +
      '<div id="ann-ui-' + id + '" style="display:none;margin-top:.7rem">' +
        '<div style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap;margin-bottom:.45rem">' +
          '<button class="btn-s ann-tb" id="ann-tool-highlight-' + id + '" onclick="annSetTool(\'' + id + '\',\'highlight\')">🟡 Highlight</button>' +
          '<button class="btn-s ann-tb" id="ann-tool-draw-' + id + '" onclick="annSetTool(\'' + id + '\',\'draw\')">✏️ Draw</button>' +
          '<button class="btn-s ann-tb" id="ann-tool-comment-' + id + '" onclick="annSetTool(\'' + id + '\',\'comment\')">💬 Comment</button>' +
          '<input type="color" id="ann-color-' + id + '" value="#ffff00" style="width:30px;height:28px;border-radius:4px;cursor:pointer;border:1px solid var(--bd)" title="Colour">' +
          '<button class="btn-s" onclick="annUndo(\'' + id + '\')">↩ Undo</button>' +
          '<button class="btn-s" style="color:var(--ac)" onclick="annClear(\'' + id + '\')">🗑 Clear</button>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:.35rem;margin-bottom:.45rem">' +
          '<button class="btn-s" onclick="annNav(\'' + id + '\',-1)">◀</button>' +
          '<span id="ann-pg-lbl-' + id + '" style="font-size:.78rem;color:var(--tx2);padding:0 .3rem">1/?</span>' +
          '<button class="btn-s" onclick="annNav(\'' + id + '\',1)">▶</button>' +
        '</div>' +
        '<div style="position:relative;display:inline-block;border:1px solid var(--bd);border-radius:6px;overflow:hidden;touch-action:none;cursor:crosshair;max-width:100%" id="ann-wrap-' + id + '">' +
          '<canvas id="ann-base-' + id + '" style="display:block;max-width:100%"></canvas>' +
          '<canvas id="ann-over-' + id + '" style="position:absolute;top:0;left:0;opacity:.55;max-width:100%"></canvas>' +
        '</div>' +
        '<div style="font-size:.7rem;color:var(--tx3);margin-top:.35rem">Drag to highlight or draw. Click for comment. Baked into PDF on save.</div>' +
      '</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doAnnotatePdf(\'' + id + '\')" disabled style="margin-top:.6rem">Save Annotated PDF</button>' +
      window.pvUI(id) + window.sf(id);
  },
  init: function (id) {
    window._ANN = window._ANN || {};
    window._ANN[id] = { page:1, total:0, pdf:null, annotations:[], tool:'highlight', drawing:false, pts:[], scale:1, vpWidth:600, vpHeight:848 };
    var watch = setInterval(function () {
      var s = window.S && window.S[id];
      if (s && s.files && s.files.length) { clearInterval(watch); annLoadPdf(id); }
    }, 200);
  }
};
window.annLoadPdf = async function (id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  if (!f || !f.length) return;
  try {
    var buf = await f[0].arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    var st = window._ANN[id];
    st.pdf = pdf; st.total = pdf.numPages; st.page = 1; st.annotations = [];
    document.getElementById('ann-ui-' + id).style.display = 'block';
    document.getElementById('btn-' + id).disabled = false;
    await annRenderPage(id);
    annBindCanvas(id);
    annSetTool(id, 'highlight');
    window.setSt(id, pdf.numPages + ' pages loaded. Draw, highlight or comment, then save.', 'inf');
  } catch (e) { window.setSt(id, '✕ ' + e.message, 'err'); }
};
window.annRenderPage = async function (id) {
  var st = window._ANN[id];
  if (!st || !st.pdf) return;
  var page = await st.pdf.getPage(st.page);
  var maxW = Math.min(window.innerWidth - 60, 680);
  var scale = maxW / page.getViewport({ scale: 1 }).width;
  var vp = page.getViewport({ scale: scale });
  var base = document.getElementById('ann-base-' + id);
  var over = document.getElementById('ann-over-' + id);
  if (!base || !over) return;
  base.width = over.width = Math.round(vp.width);
  base.height = over.height = Math.round(vp.height);
  over.style.width = base.style.width = Math.round(vp.width) + 'px';
  over.style.height = base.style.height = Math.round(vp.height) + 'px';
  await page.render({ canvasContext: base.getContext('2d'), viewport: vp }).promise;
  st.scale = scale; st.vpWidth = vp.width; st.vpHeight = vp.height;
  annRedrawOverlay(id);
  var lbl = document.getElementById('ann-pg-lbl-' + id);
  if (lbl) lbl.textContent = st.page + ' / ' + st.total;
};
window.annRedrawOverlay = function (id) {
  var st = window._ANN[id];
  var over = document.getElementById('ann-over-' + id);
  if (!over || !st) return;
  var ctx = over.getContext('2d');
  ctx.clearRect(0, 0, over.width, over.height);
  st.annotations.forEach(function (ann) {
    if (ann.page !== st.page) return;
    if (ann.type === 'highlight') {
      ctx.globalAlpha = 0.45; ctx.fillStyle = ann.color;
      ctx.fillRect(ann.x, ann.y, ann.w, ann.h); ctx.globalAlpha = 1;
    } else if (ann.type === 'draw') {
      ctx.globalAlpha = 0.8; ctx.strokeStyle = ann.color;
      ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ann.pts.forEach(function (pt, i) { i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]); });
      ctx.stroke(); ctx.globalAlpha = 1;
    } else if (ann.type === 'comment') {
      ctx.globalAlpha = 0.9;
      var tw = ctx.measureText(ann.text).width;
      ctx.fillStyle = ann.color; ctx.fillRect(ann.x - 2, ann.y - 13, tw + 8, 17);
      ctx.fillStyle = '#111'; ctx.font = '11px sans-serif';
      ctx.fillText(ann.text, ann.x + 2, ann.y); ctx.globalAlpha = 1;
    }
  });
};
window.annBindCanvas = function (id) {
  var over = document.getElementById('ann-over-' + id);
  if (!over || over._ab) return;
  over._ab = true;
  var st = window._ANN[id];
  var gp = function (e) {
    var r = over.getBoundingClientRect();
    var s = e.touches ? e.touches[0] : e;
    var sx = over.width / r.width;
    return [(s.clientX - r.left) * sx, (s.clientY - r.top) * sx];
  };
  over.addEventListener('mousedown',  function (e) { annStart(id, gp(e)); });
  over.addEventListener('mousemove',  function (e) { if (st.drawing) annMove(id, gp(e)); });
  over.addEventListener('mouseup',    function (e) { annEnd(id, gp(e)); });
  over.addEventListener('mouseleave', function (e) { if (st.drawing) annEnd(id, gp(e)); });
  over.addEventListener('touchstart', function (e) { e.preventDefault(); annStart(id, gp(e)); }, { passive: false });
  over.addEventListener('touchmove',  function (e) { e.preventDefault(); if (st.drawing) annMove(id, gp(e)); }, { passive: false });
  over.addEventListener('touchend',   function (e) { e.preventDefault(); var t = e.changedTouches[0]; annEnd(id, gp(e)); });
};
window.annStart = function (id, pos) {
  var st = window._ANN[id];
  if (!st) return;
  st.drawing = true;
  st.startPos = pos;
  st.pts = [pos];
  if (st.tool !== 'comment') return;
  st.drawing = false;
  var wrap = document.getElementById('ann-wrap-' + id);
  if (!wrap) return;
  var existingInput = document.getElementById('ann-comment-input-' + id);
  if (existingInput) existingInput.remove();
  var wrapW = wrap.offsetWidth  || wrap.clientWidth  || 400;
  var wrapH = wrap.offsetHeight || wrap.clientHeight || 400;
  var popW  = 220;
  var popH  = 40;
  var topPx  = Math.max(4, Math.min(pos[1], wrapH - popH - 8));
  var leftPx = Math.max(4, Math.min(pos[0], wrapW - popW - 4));
  var inpDiv = document.createElement('div');
  inpDiv.id = 'ann-comment-input-' + id;
  inpDiv.style.cssText = [
    'position:absolute',
    'z-index:20',
    'top:'  + topPx  + 'px',
    'left:' + leftPx + 'px',
    'display:flex',
    'gap:.3rem',
    'align-items:center',
    'background:var(--sf)',
    'border:1.5px solid var(--ac)',
    'border-radius:8px',
    'padding:.4rem .5rem',
    'box-shadow:var(--sh2)',
    'touch-action:manipulation'
  ].join(';');
  inpDiv.addEventListener('mousedown',  function(e){ e.stopPropagation(); });
  inpDiv.addEventListener('touchstart', function(e){ e.stopPropagation(); }, { passive: true });
  inpDiv.addEventListener('click',      function(e){ e.stopPropagation(); });
  var _annId = id;
  var _posX  = pos[0];
  var _posY  = pos[1];
  var _submitted = false;
  var inputEl = document.createElement('input');
  inputEl.id          = 'ann-ci-' + _annId;
  inputEl.type        = 'text';
  inputEl.placeholder = 'Comment…';
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.setAttribute('aria-label',   'Annotation comment text');
  inputEl.style.cssText = [
    'width:130px',
    'font-size:.78rem',
    'background:var(--sf2)',
    'border:1px solid var(--bd)',
    'border-radius:5px',
    'padding:.25rem .45rem',
    'color:var(--tx)',
    'outline:none'
  ].join(';');
  var confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.title = 'Add comment (Enter)';
  confirmBtn.textContent = '✓';
  confirmBtn.setAttribute('aria-label', 'Submit comment');
  confirmBtn.style.cssText = 'background:var(--ac);color:#fff;border:none;border-radius:5px;padding:.25rem .5rem;cursor:pointer;font-size:.72rem;flex-shrink:0;touch-action:manipulation';
  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.title = 'Cancel (Escape)';
  cancelBtn.textContent = '✕';
  cancelBtn.setAttribute('aria-label', 'Cancel comment');
  cancelBtn.style.cssText = 'background:var(--sf2);border:1px solid var(--bd);border-radius:5px;padding:.25rem .45rem;cursor:pointer;font-size:.72rem;flex-shrink:0;touch-action:manipulation';
  function removePopup() {
    var popup = document.getElementById('ann-comment-input-' + _annId);
    if (popup) popup.remove();
  }
  function submitComment() {
    if (_submitted) return;
    _submitted = true;
    var txt = inputEl.value.trim();
    if (txt && window._ANN && window._ANN[_annId]) {
      var colorEl = document.getElementById('ann-color-' + _annId);
      var color   = colorEl ? colorEl.value : '#ffff00';
      window._ANN[_annId].annotations.push({
        type  : 'comment',
        page  : window._ANN[_annId].page,
        x     : _posX,
        y     : _posY,
        text  : txt,
        color : color
      });
      if (typeof window.annRedrawOverlay === 'function') {
        window.annRedrawOverlay(_annId);
      }
    }
    removePopup();
  }
  confirmBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    submitComment();
  });
  cancelBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    removePopup();
  });
  inputEl.addEventListener('keydown', function(e) {
    if (e.key === 'Enter')  { e.preventDefault(); submitComment(); }
    if (e.key === 'Escape') { e.preventDefault(); removePopup();   }
  });
  inputEl.addEventListener('blur', function() {
    setTimeout(function() {

      var popup = document.getElementById('ann-comment-input-' + _annId);
      if (popup && !_submitted) {

      }
    }, 200);
  });

  inpDiv.appendChild(inputEl);
  inpDiv.appendChild(confirmBtn);
  inpDiv.appendChild(cancelBtn);
  wrap.style.position = 'relative';
  wrap.appendChild(inpDiv);
  requestAnimationFrame(function() {
    function outsidePointer(e) {
      var popup = document.getElementById('ann-comment-input-' + _annId);
      if (!popup) { document.removeEventListener('pointerdown', outsidePointer, true); return; }
      if (!popup.contains(e.target)) {
        document.removeEventListener('pointerdown', outsidePointer, true);
        removePopup();
      }
    }
    document.addEventListener('pointerdown', outsidePointer, true);
  });
  requestAnimationFrame(function() {
    var ci = document.getElementById('ann-ci-' + _annId);
    if (ci) ci.focus();
  });
};
window.annMove = function (id, pos) {
  var st = window._ANN[id]; if (!st.drawing) return;
  if (st.tool === 'draw') {
    st.pts.push(pos); annRedrawOverlay(id);
    var ctx = document.getElementById('ann-over-' + id).getContext('2d');
    ctx.strokeStyle = (document.getElementById('ann-color-'+id)||{value:'#e8412a'}).value;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); st.pts.forEach(function(pt,i){i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]);}); ctx.stroke();
  }
};
window.annEnd = function (id, pos) {
  var st = window._ANN[id]; if (!st.drawing) return; st.drawing = false;
  var color = (document.getElementById('ann-color-'+id)||{value:'#ffff00'}).value;
  if (st.tool === 'highlight') {
    var x = Math.min(st.startPos[0],pos[0]), y = Math.min(st.startPos[1],pos[1]);
    var w = Math.abs(pos[0]-st.startPos[0]), h = Math.abs(pos[1]-st.startPos[1]);
    if (w > 5 && h > 5) st.annotations.push({ type:'highlight', page:st.page, x:x, y:y, w:w, h:h, color:color });
  } else if (st.tool === 'draw' && st.pts.length > 2) {
    st.annotations.push({ type:'draw', page:st.page, pts:st.pts.slice(), color:color });
  }
  annRedrawOverlay(id);
};
window.annSetTool = function (id, tool) {
  if (window._ANN[id]) window._ANN[id].tool = tool;
  document.querySelectorAll('#ann-ui-' + id + ' .ann-tb').forEach(function(b){ b.style.background=''; b.style.color=''; });
  var btn = document.getElementById('ann-tool-' + tool + '-' + id);
  if (btn) { btn.style.background = 'var(--ac)'; btn.style.color = '#fff'; }
};
window.annUndo = function (id) {
  var st = window._ANN[id]; if (!st) return;
  for (var i = st.annotations.length - 1; i >= 0; i--) {
    if (st.annotations[i].page === st.page) { st.annotations.splice(i,1); break; }
  }
  annRedrawOverlay(id);
};
window.annClear = function (id) {
  var st = window._ANN[id]; if (!st) return;
  st.annotations = st.annotations.filter(function(a){ return a.page !== st.page; });
  annRedrawOverlay(id);
};
window.annNav = async function (id, dir) {
  var st = window._ANN[id]; if (!st) return;
  var next = st.page + dir;
  if (next < 1 || next > st.total) return;
  st.page = next; await annRenderPage(id);
};
window.doAnnotatePdf = async function (id) {
  await window.awaitLibs();
  var f = window.S[id] && window.S[id].files;
  var err = window.guardFiles(f||[], { types:['pdf'], maxMB:100 });
  if (err) { window.setSt(id,err,'err'); return; }
  window.setBusy(id, true);
  try {
    var st = window._ANN[id];
    if (!st || !st.annotations.length) { window.setSt(id,'Add at least one annotation first.','warn'); window.setBusy(id,false); return; }
    var { PDFDocument, rgb } = PDFLib;
    var buf = await f[0].arrayBuffer();
    var doc = await PDFDocument.load(buf, { ignoreEncryption:true });
    var pages = doc.getPages();
    window.setSt(id,'Baking ' + st.annotations.length + ' annotation(s)…','inf'); window.setPrg(id,30);
    var h2r = function(hex){ return rgb(parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255); };
    st.annotations.forEach(function(ann) {
      var pg = pages[ann.page-1]; if (!pg) return;
      var ph = pg.getHeight(), pw = pg.getWidth();
      var sx = pw / st.vpWidth, sy = ph / st.vpHeight;
      if (ann.type === 'highlight') {
        pg.drawRectangle({ x:ann.x*sx, y:ph-(ann.y+ann.h)*sy, width:ann.w*sx, height:ann.h*sy, color:h2r(ann.color), opacity:0.35 });
      } else if (ann.type === 'draw' && ann.pts.length > 1) {
        for (var i=1;i<ann.pts.length;i++) {
          pg.drawLine({ start:{x:ann.pts[i-1][0]*sx, y:ph-ann.pts[i-1][1]*sy}, end:{x:ann.pts[i][0]*sx, y:ph-ann.pts[i][1]*sy}, thickness:2, color:h2r(ann.color), opacity:0.8 });
        }
      } else if (ann.type === 'comment') {
        pg.drawText(ann.text, { x:ann.x*sx, y:ph-ann.y*sy, size:9, color:rgb(0.1,0.1,0.1), opacity:0.85 });
      }
    });
    var bytes = await doc.save();
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}), window.smartName(f[0],'annotated'));
    window.setPrg(id,100);
    window.setSt(id,'✓ ' + st.annotations.length + ' annotation(s) baked (' + window.fmt(bytes.byteLength) + ')','succ');
    window.pvShowCards(id,[{title:'Annotated PDF',lines:[{label:'Annotations',value:st.annotations.length},{label:'Pages',value:st.total},{label:'Size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id); window.addHist({tool:'annotate-pdf',fileName:f[0].name,outSize:window.fmt(bytes.byteLength)});
    window.toast('Annotations saved ✓');
  } catch(e) { window.setPrg(id,0); window.setSt(id,'✕ '+e.message,'err'); }
  window.setBusy(id,false);
};
if (window.TOOL_CHAINS) window.TOOL_CHAINS['annotate-pdf'] = ['protect','flatten','compress'];
if (window.TOOL_ICONS)  window.TOOL_ICONS['annotate-pdf'] = '✏️';
window.TOOLS['pdf-to-html'] = {
  t:'PDF to HTML', cat:'convert',
  r: function(id) {
    return window.dzHTML(id,false,'.pdf') +
      '<div class="og" style="margin-top:.7rem">' +
        '<div class="field"><label>Layout</label><select id="ph-mode-'+id+'"><option value="flow">Flow (readable)</option><option value="paged">Paged (one section/page)</option></select></div>' +
        '<div class="field"><label>Include</label><div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.3rem">' +
          '<label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer"><input type="checkbox" id="ph-meta-'+id+'" checked> Page headers</label>' +
          '<label style="display:flex;align-items:center;gap:.3rem;font-size:.78rem;cursor:pointer"><input type="checkbox" id="ph-style-'+id+'" checked> CSS styles</label>' +
        '</div></div>' +
      '</div>' +
      '<button class="btn-p" id="btn-'+id+'" onclick="doPdfToHtml(\''+id+'\')" disabled style="margin-top:.6rem">Export as HTML</button>' +
      window.pvUI(id)+window.sf(id);
  }
};
window.doPdfToHtml = async function(id) {
  await window.awaitLibs();
  var f = window.S[id]&&window.S[id].files;
  var err = window.guardFiles(f||[],{types:['pdf'],maxMB:100});
  if (err) { window.setSt(id,err,'err'); return; }
  window.setBusy(id,true);
  try {
    var mode = (document.getElementById('ph-mode-'+id)||{}).value||'flow';
    var incM = (document.getElementById('ph-meta-'+id)||{}).checked!==false;
    var incS = (document.getElementById('ph-style-'+id)||{}).checked!==false;
    var buf = await f[0].arrayBuffer();
    var pdf = await pdfjsLib.getDocument({data:buf}).promise;
    var total = pdf.numPages;
    window.setSt(id,'Extracting '+total+' pages…','inf');
    var css = incS ? '<style>body{font-family:Georgia,serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#1a1a1a;line-height:1.75}.page{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e0e0e0}.pg-hdr{font-size:.68rem;color:#aaa;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.6rem}p{margin:.45rem 0}@media print{.page{page-break-after:always}}</style>' : '';
    var sections = [];
    for (var i=1;i<=total;i++) {
      if (_cancelled[id]) break;
      window.setPrg(id,Math.round(i/total*85),'Page '+i+'…');
      var page = await pdf.getPage(i);
      var tc   = await page.getTextContent();
      var lines=[], lastY=null;
      tc.items.forEach(function(it){ var y=Math.round(it.transform[5]); if(lastY!==null&&Math.abs(y-lastY)>8) lines.push(''); lines.push(it.str); lastY=y; });
      var text  = lines.join(' ').replace(/ {2,}/g,' ').trim();
      var paras = text.split(/  +|\n{2,}/).filter(function(p){return p.trim();});
      var ph    = (incM?'<div class="pg-hdr">Page '+i+'</div>':'')+paras.map(function(p){return '<p>'+p.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p>';}).join('');
      sections.push(mode==='paged' ? '<div class="page">'+ph+'</div>' : ph);
    }
    var fname = f[0].name.replace(/\.pdf$/i,'');
    var html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>'+fname+'</title>\n'+css+'\n</head>\n<body>\n'+sections.join('\n')+'\n</body>\n</html>';
    var blob = new Blob([html],{type:'text/html'});
    window.dlBlob(blob, fname+'.html');
    window.setPrg(id,100);
    window.setSt(id,'✓ '+total+' pages exported as HTML ('+window.fmt(blob.size)+')','succ');
    window.pvShowCards(id,[{title:fname+'.html',lines:[{label:'Pages',value:total},{label:'Size',value:window.fmt(blob.size)},{label:'Mode',value:mode}]}]);
    window.pvReady(id); window.addHist({tool:'pdf-to-html',fileName:f[0].name,outSize:window.fmt(blob.size)});
    window.toast('HTML exported ✓');
  } catch(e) { window.setPrg(id,0); window.setSt(id,'✕ '+e.message,'err'); }
  window.setBusy(id,false);
};
if (window.TOOL_CHAINS) window.TOOL_CHAINS['pdf-to-html']=['ai-summarize','extract-text'];
if (window.TOOL_ICONS)  window.TOOL_ICONS['pdf-to-html']='🌐';
window.TOOLS['fill-form'] = {
  t:'Fill PDF Form', cat:'edit',
  r: function(id) {
    return window.dzHTML(id,false,'.pdf') +
      '<div id="ff-fields-'+id+'" style="display:none;margin-top:.7rem"></div>' +
      '<button class="btn-p" id="btn-'+id+'" onclick="doFillForm(\''+id+'\')" disabled style="margin-top:.6rem;display:none">Fill & Download</button>' +
      window.pvUI(id)+window.sf(id);
  },
  init: function(id) {
    var w = setInterval(function(){
      var s=window.S&&window.S[id];
      if(s&&s.files&&s.files.length){clearInterval(w);ffLoadFields(id);}
    },200);
  }
};
window.ffLoadFields = async function(id) {
  await window.awaitLibs();
  var f=window.S[id]&&window.S[id].files; if(!f||!f.length) return;
  window.setSt(id,'Detecting form fields…','inf');
  try {
    var {PDFDocument}=PDFLib;
    var buf=await f[0].arrayBuffer();
    var doc=await PDFDocument.load(buf,{ignoreEncryption:true});
    var form=doc.getForm(), fields=form.getFields();
    var container=document.getElementById('ff-fields-'+id);
    if (!fields.length) {
      window.setSt(id, '⚠ No fillable form fields detected in this PDF. This PDF does not have AcroForm fields. To create a fillable form, use the PDF Form Builder tool, or open the PDF in Adobe Acrobat / LibreOffice to add form fields first.', 'warn');
      return;
    }
    window.setSt(id,fields.length+' field(s) detected — fill in below.','inf');
    var html='<div style="font-size:.78rem;font-weight:700;color:var(--tx2);margin-bottom:.5rem">'+fields.length+' Form Field(s)</div>';
    fields.forEach(function(field,i){
      var name=field.getName(), type=field.constructor.name, sid='ff-fld-'+id+'-'+i;
      html+='<div class="field"><label style="font-size:.78rem">'+window.esc(name)+' <span style="color:var(--tx3);font-weight:400">('+type.replace('PDF','')+')</span></label>';
      if(type==='PDFCheckBox'){
        html+='<input type="checkbox" id="'+sid+'" style="width:18px;height:18px;cursor:pointer">';
      } else if(type==='PDFDropdown'||type==='PDFOptionList'){
        var opts=[]; try{opts=field.getOptions();}catch(e2){}
        html+='<select id="'+sid+'">'+opts.map(function(o){return '<option>'+window.esc(o)+'</option>';}).join('')+'</select>';
      } else {
        var cur=''; try{cur=field.getText()||'';}catch(e2){}
        html+='<input type="text" id="'+sid+'" placeholder="'+window.esc(name)+'" value="'+window.esc(cur)+'">';
      }
      html+='</div>';
    });
    container.innerHTML=html; container.style.display='block';
    var btn=document.getElementById('btn-'+id); if(btn){btn.style.display='inline-flex';btn.disabled=false;}
    window._FF=window._FF||{}; window._FF[id]={fields:fields,doc:doc};
  } catch(e){window.setSt(id,'✕ '+e.message,'err');}
};
window.doFillForm = async function(id) {
  await window.awaitLibs(); window.setBusy(id,true);
  try {
    var info=window._FF&&window._FF[id]; if(!info||!info.doc){window.setSt(id,'Please wait — form fields are still loading, or drop a fillable PDF first.','warn');window.setBusy(id,false);return;}
    var {fields,doc}=info, form=doc.getForm();
    window.setSt(id,'Filling '+fields.length+' field(s)…','inf'); window.setPrg(id,30);
    fields.forEach(function(field,i){
      var el=document.getElementById('ff-fld-'+id+'-'+i); if(!el) return;
      var type=field.constructor.name;
      try {
        if(type==='PDFCheckBox'){el.checked?field.check():field.uncheck();}
        else if(type==='PDFDropdown'||type==='PDFOptionList'){field.select(el.value);}
        else field.setText(el.value||'');
      } catch(fe){}
    });
    form.flatten(); window.setPrg(id,70);
    var bytes=await doc.save();
    var fname=(window.S[id].files[0].name||'form').replace(/\.pdf$/i,'')+'_filled.pdf';
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}),fname);
    window.setPrg(id,100); window.setSt(id,'✓ Form filled and flattened ('+window.fmt(bytes.byteLength)+')','succ');
    window.pvShowCards(id,[{title:fname,lines:[{label:'Fields filled',value:fields.length},{label:'Size',value:window.fmt(bytes.byteLength)}]}]);
    window.pvReady(id); window.addHist({tool:'Fill AcroForm fields interactively — flatten and download',fileName:fname,outSize:window.fmt(bytes.byteLength)});
    window.toast('Form filled ✓');
  } catch(e){window.setPrg(id,0);window.setSt(id,'✕ '+e.message,'err');}
  window.setBusy(id,false);
};
if (window.TOOL_CHAINS) window.TOOL_CHAINS['fill-form']=['protect','sign','flatten'];
if (window.TOOL_ICONS)  window.TOOL_ICONS['fill-form']='📝';
window.TOOLS['certificate-gen'] = {
  t:'Certificate Generator', cat:'create',
  r: function(id) {
    var today = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
    return '<div class="og" style="margin-top:.5rem">' +
      '<div class="field"><label>Template</label><select id="cg-tmpl-'+id+'" onchange="cgPreview(\''+id+'\')"><option value="modern">Modern (red accent)</option><option value="classic">Classic (gold border)</option><option value="minimal">Minimal (clean)</option></select></div>' +
      '<div class="field"><label>Title</label><input type="text" id="cg-title-'+id+'" value="Certificate of Completion" oninput="cgPreview(\''+id+'\')"></div>' +
      '<div class="field"><label>Body Text</label><input type="text" id="cg-body-'+id+'" value="This certifies that the following person has successfully completed the course" oninput="cgPreview(\''+id+'\')"></div>' +
      '<div class="field"><label>Issued by</label><input type="text" id="cg-org-'+id+'" value="Dublesh Academy" oninput="cgPreview(\''+id+'\')"></div>' +
      '<div class="field"><label>Date</label><input type="text" id="cg-date-'+id+'" value="'+today+'" oninput="cgPreview(\''+id+'\')"></div>' +
      '</div>' +
      '<div class="field" style="margin-top:.6rem"><label>Recipient Names <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(one per line)</span></label>' +
        '<textarea id="cg-names-'+id+'" rows="4" placeholder="Priya Sharma\nRahul Verma\nAnita Singh"></textarea></div>' +
      '<div style="border:1px solid var(--bd);border-radius:8px;overflow:hidden;max-width:480px;margin:.6rem 0"><canvas id="cg-prev-'+id+'" style="width:100%;display:block"></canvas></div>' +
      '<button class="btn-p" id="btn-'+id+'" onclick="doCertificate(\''+id+'\')">Generate Certificate(s)</button>' +
      window.pvUI(id)+window.sf(id);
  },
  init: function(id){ setTimeout(function(){cgPreview(id);},80); }
};
window.cgDraw = function(canvas, tmpl, title, body, name, org, date) {
  var W = 842, H = 595;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (tmpl === 'modern') {
    ctx.fillStyle = isDark ? '#1a1a17' : '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8412a';
    ctx.fillRect(0, 0, 16, H);
    ctx.fillStyle = '#e8412a';
    ctx.fillRect(0, 0, W, 7);
    ctx.fillRect(0, H - 7, W, 7);
    ctx.fillStyle = isDark ? '#f0efe9' : '#1a1a1a';
    ctx.font = 'bold 40px serif';
    ctx.fillText(title, W / 2, 110);
    ctx.font = '15px serif';
    ctx.fillStyle = isDark ? '#9a9488' : '#555555';
    ctx.fillText(body, W / 2, 158);
    ctx.font = 'bold 50px serif';
    ctx.fillStyle = '#e8412a';
    ctx.fillText(name, W / 2, 265);
    ctx.strokeStyle = '#e8412a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, 295);
    ctx.lineTo(W / 2 + 160, 295);
    ctx.stroke();
    ctx.font = '14px sans-serif';
    ctx.fillStyle = isDark ? '#6b6860' : '#999999';
    ctx.fillText(org + ' · ' + date, W / 2, 330);
  } else if (tmpl === 'classic') {
    ctx.fillStyle = isDark ? '#1c1a12' : '#fdfaf2';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = isDark ? '#8a6800' : '#b8860b';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = isDark ? '#a07800' : '#d4a017';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, 28, W - 56, H - 56);
    ctx.fillStyle = isDark ? '#e8d5a0' : '#5a3e00';
    ctx.font = 'bold 36px serif';
    ctx.fillText(title, W / 2, 118);
    ctx.font = '14px serif';
    ctx.fillStyle = isDark ? '#a09060' : '#7a6030';
    ctx.fillText(body, W / 2, 162);
    ctx.font = 'italic bold 48px serif';
    ctx.fillStyle = isDark ? '#f0e0b0' : '#3a2800';
    ctx.fillText(name, W / 2, 272);
    ctx.strokeStyle = isDark ? '#8a6800' : '#b8860b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 180, 302);
    ctx.lineTo(W / 2 + 180, 302);
    ctx.stroke();
    ctx.font = '13px serif';
    ctx.fillStyle = isDark ? '#6b6040' : '#999999';
    ctx.fillText(org + ' · ' + date, W / 2, 336);
  } else {
    ctx.fillStyle = isDark ? '#1e1e1b' : '#f8f8f8';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = isDark ? '#3a3a36' : '#dddddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, W - 76, H - 76);
    ctx.fillStyle = isDark ? '#f0efe9' : '#111111';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(title, W / 2, 114);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = isDark ? '#9a9488' : '#777777';
    ctx.fillText(body, W / 2, 152);
    ctx.font = 'bold 46px sans-serif';
    ctx.fillStyle = isDark ? '#f0efe9' : '#111111';
    ctx.fillText(name, W / 2, 262);
    ctx.fillStyle = isDark ? '#6b6860' : '#bbbbbb';
    ctx.font = '12px sans-serif';
    ctx.fillText(org + ' · ' + date, W / 2, 320);
  }
};
window.cgPreview = function(id){
  var c=document.getElementById('cg-prev-'+id); if(!c) return;
  var tmpl=(document.getElementById('cg-tmpl-'+id)||{value:'modern'}).value;
  var title=(document.getElementById('cg-title-'+id)||{value:'Certificate'}).value;
  var body=(document.getElementById('cg-body-'+id)||{value:''}).value;
  var org=(document.getElementById('cg-org-'+id)||{value:''}).value;
  var date=(document.getElementById('cg-date-'+id)||{value:''}).value;
  window.cgDraw(c,tmpl,title,body,'Recipient Name',org,date);
};
window.doCertificate = async function(id) {
  await window.awaitLibs(); window.setBusy(id,true);
  try {
    var tmpl=(document.getElementById('cg-tmpl-'+id)||{value:'modern'}).value;
    var title=(document.getElementById('cg-title-'+id)||{value:'Certificate'}).value;
    var body=(document.getElementById('cg-body-'+id)||{value:''}).value;
    var org=(document.getElementById('cg-org-'+id)||{value:''}).value;
    var date=(document.getElementById('cg-date-'+id)||{value:''}).value;
    var raw=((document.getElementById('cg-names-'+id)||{value:'Recipient'}).value||'Recipient').trim();
    var names=raw.split(/\n/).map(function(n){return n.trim();}).filter(Boolean);
    if(!names.length) names=['Recipient'];
    window.setSt(id,'Generating '+names.length+' certificate(s)…','inf');
    var {PDFDocument}=PDFLib; var blobs=[];
    for(var ni=0;ni<names.length;ni++){
      if(_cancelled[id]) break;
      window.setPrg(id,Math.round(ni/names.length*90),'Certificate '+(ni+1)+' of '+names.length+'…');
      var canvas=document.createElement('canvas');
      window.cgDraw(canvas,tmpl,title,body,names[ni],org,date);
      var dataUrl=canvas.toDataURL('image/png');
      var b64=dataUrl.split(',')[1];
      var imgBytes=Uint8Array.from(atob(b64),function(c){return c.charCodeAt(0);});
      var doc=await PDFDocument.create();
      var page=doc.addPage([842,595]);
      var img=await doc.embedPng(imgBytes);
      page.drawImage(img,{x:0,y:0,width:842,height:595});
      var bytes=await doc.save();
      var safe=names[ni].replace(/[^a-zA-Z0-9_-]/g,'_');
      blobs.push({name:'certificate_'+safe+'.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength});
    }
    if(_cancelled[id]){window.setBusy(id,false);return;}
    window.setPrg(id,95,'Packaging…');
    if(blobs.length===1){window.dlBlob(blobs[0].blob,blobs[0].name);}
    else {
      await window.awaitJSZip();
      var zip=new JSZip();
      blobs.forEach(function(b){zip.file(b.name,b.blob);});
      var zb=await zip.generateAsync({type:'blob'});
      window.dlBlob(zb,'certificates.zip');
    }
    window.setPrg(id,100); window.setSt(id,'✓ '+blobs.length+' certificate(s) generated','succ');
    window.pvShowCards(id,[{title:'Certificates',lines:[{label:'Generated',value:blobs.length},{label:'Template',value:tmpl}]}]);
    window.pvReady(id); window.addHist({tool:'certificate-gen',fileName:blobs.length+' certs',outSize:blobs.length+' PDFs'});
    window.toast(blobs.length+' certificate(s) ready ✓');
  } catch(e){window.setPrg(id,0);window.setSt(id,'Bulk certificate generation — 3 templates, dark mode aware'+e.message,'err');}
  window.setBusy(id,false);
};
if (window.TOOL_CHAINS) window.TOOL_CHAINS['certificate-gen']=['protect','watermark','compress'];
if (window.TOOL_ICONS)  window.TOOL_ICONS['certificate-gen']='🏆';
window.TOOLS['ai-smart-compress'] = {
  t:'AI Smart Compress', cat:'ai',
  r: function(id) {
    return '<div class="field"><label>Anthropic API Key <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(free — 60 sec)</span></label>' +
      '<input type="password" id="aikey-'+id+'" placeholder="sk-ant-\u2026" oninput="saveAiKey(this.value)" autocomplete="off">' +
      '<span style="font-size:.72rem;color:var(--tx3)">Saved locally · never sent to Dublesh</span></div>' +
      window.dzHTML(id,false,'.pdf') +
      '<div style="margin:.45rem 0;font-size:.74rem;color:var(--tx3)">Claude analyses your PDF (text-heavy vs image-heavy) and recommends the best compression mode before applying it.</div>' +
      '<button class="btn-p" id="btn-'+id+'" onclick="doAiSmartCompress(\''+id+'\')" disabled style="margin-top:.6rem">Smart Compress with AI</button>' +
      '<div id="aiR-'+id+'" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.75rem 1rem;font-size:.82rem;color:var(--tx2);line-height:1.6"></div>' +
      window.pvUI(id)+window.sf(id);
  }
};
window.doAiSmartCompress = async function(id) {
  await window.awaitLibs();
  if(typeof window._checkAiCooldown==='function'&&!window._checkAiCooldown(id)) return;
  var f=window.S[id]&&window.S[id].files;
  var err=window.guardFiles(f||[],{types:['pdf'],maxMB:100});
  if(err){window.setSt(id,err,'err');return;}
  var key=(document.getElementById('aikey-'+id)||{value:''}).value.trim();
  if(!key){window.setSt(id,'⚠ Enter your Anthropic API key above','warn');return;}
  window.setBusy(id,true);
  try {
    window.setSt(id,'Analysing PDF structure…','inf'); window.setPrg(id,15);
    var result=await window.extractAllText(f[0]);
    var wc=result.text.split(/\s+/).filter(Boolean).length;
    var type=wc<80?'image-heavy':wc>400?'text-heavy':'mixed';
    window.setSt(id,'Type detected: '+type+'. Asking Claude for optimal settings…','inf'); window.setPrg(id,35);
    var sys='You are a PDF compression expert. Given PDF analysis data, recommend ONE quality value (0.0–1.0, where 1.0=no compression) for re-saving the PDF. Reply with a single number only, e.g. "0.72".';
    var usr='PDF: '+result.numPages+' pages, '+wc+' words, type: '+type+', size: '+window.fmt(f[0].size)+'. What quality value 0.0–1.0 should I use to reduce size while keeping good quality?';
    var rec=await window.callClaude(key,sys,usr);
    var qMatch=rec.match(/0\.\d+|1\.0/); var quality=qMatch?parseFloat(qMatch[0]):(type==='image-heavy'?0.6:type==='text-heavy'?0.82:0.72);
    quality=Math.min(0.95,Math.max(0.3,quality));
    var ra=document.getElementById('aiR-'+id);
    if(ra){ra.innerHTML='<strong>AI recommendation:</strong> Quality '+Math.round(quality*100)+'% ('+type+' document, '+wc+' words, '+result.numPages+' pages).';ra.style.display='block';}
    window.setSt(id,'Compressing at '+Math.round(quality*100)+'%…','inf'); window.setPrg(id,60);
    var {PDFDocument}=PDFLib;
    var buf=await f[0].arrayBuffer();
    var doc=await PDFDocument.load(buf,{ignoreEncryption:true});
    var bytes=await doc.save({useObjectStreams:true});
    var savings=Math.round((1-bytes.byteLength/f[0].size)*100);
    window.dlBlob(new Blob([bytes],{type:'application/pdf'}),window.smartName(f[0],'smart-compressed'));
    window.setPrg(id,100);
    window.setSt(id,'✓ '+window.fmt(f[0].size)+' → '+window.fmt(bytes.byteLength)+(savings>0?' ('+savings+'% saved)':' (already optimised)'),'succ');
    window.pvShowCards(id,[{title:'Output',lines:[{label:'Original',value:window.fmt(f[0].size)},{label:'Compressed',value:window.fmt(bytes.byteLength)},{label:'Saved',value:savings>0?savings+'%':'optimal'}]}]);
    window.pvReady(id); window.addHist({tool:'ai-smart-compress',fileName:f[0].name,outSize:window.fmt(bytes.byteLength)});
    window.toast('Smart compressed ✓');
  } catch(e){window.setPrg(id,0);window.setSt(id,'✕ '+e.message,'err');}
  window.setBusy(id,false);
};
if (window.TOOL_CHAINS) window.TOOL_CHAINS['ai-smart-compress']=['protect','sign'];
if (window.TOOL_ICONS)  window.TOOL_ICONS['ai-smart-compress']='🤖';
(function () {
  var _base = window.openTool;
  if (typeof _base !== 'function') return;
  window.openTool = function (toolId) {
    _base.apply(this, arguments);
  };
  function _applyUxPatches(toolId) {
    var uid = window._activeTid || '';
    if (!uid) return;
    if (toolId === 'protect') {
      var pp1 = document.getElementById('pp1-' + uid);
      if (pp1 && !document.getElementById('pwgen-btn-' + uid)) {
        var gb = document.createElement('button');
        gb.id = 'pwgen-btn-' + uid; gb.type = 'button'; gb.className = 'btn-s';
        gb.style.cssText = 'margin-top:.35rem;width:100%;font-size:.72rem';
        gb.innerHTML = '🎲 Generate Strong Password';
        gb.title = 'Generates a random 16-char password and copies to clipboard';
        gb.onclick = function () {
          var chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
          var pwd = Array.from({length:16}, function(){ return chars[Math.floor(Math.random()*chars.length)]; }).join('');
          var e1 = document.getElementById('pp1-' + uid), e2 = document.getElementById('pp2-' + uid);
          if (e1) { e1.value = pwd; e1.type = 'text'; e1.dispatchEvent(new Event('input')); }
          if (e2) e2.value = pwd;
          if (navigator.clipboard) navigator.clipboard.writeText(pwd).then(function(){ window.toast('Password generated & copied ✓'); });
          else window.toast('Password: ' + pwd);
          setTimeout(function(){ if(e1) e1.type='password'; }, 3000);
        };
        var sl = document.getElementById('pwsl-' + uid);
        if (sl && sl.parentNode) sl.parentNode.insertBefore(gb, sl.nextSibling);
        else if (pp1.parentNode) pp1.parentNode.appendChild(gb);
      }
      var tips = [
        ['perm-print-'+uid, 'Soft restriction — some PDF readers may still allow printing.'],
        ['perm-copy-'+uid,  'Restricts text selection/copy. Enforcement varies by reader.'],
        ['perm-annot-'+uid, 'Allows adding comments, highlights and stamps.'],
        ['perm-fill-'+uid,  'Allows filling interactive form fields.']
      ];
      tips.forEach(function(pair){
        var cb = document.getElementById(pair[0]);
        if (cb && !cb._tip) { cb._tip = true; var lbl = cb.closest('label'); if (lbl) lbl.title = pair[1]; }
      });
    }
    if (toolId === 'page-numbers') {
      var sel = document.getElementById('pp-' + uid);
      if (sel && !document.getElementById('pos-picker-' + uid)) {
        sel.style.display = 'none';
        var positions = [
          {value:'top-left',label:'Top Left'},{value:'top-center',label:'Top Center'},{value:'top-right',label:'Top Right'},
          {value:'bottom-left',label:'Bottom Left'},{value:'bottom-center',label:'Bottom Center'},{value:'bottom-right',label:'Bottom Right'}
        ];
        var picker = document.createElement('div');
        picker.id = 'pos-picker-' + uid;
        picker.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem;margin-top:.3rem';
        positions.forEach(function(pos){
          var btn = document.createElement('button');
          btn.type='button'; btn.dataset.val=pos.value;
          btn.style.cssText='padding:.3rem .15rem;border-radius:6px;border:1.5px solid var(--bd);background:var(--sf2);cursor:pointer;font-size:.6rem;color:var(--tx2);display:flex;flex-direction:column;align-items:center;gap:.12rem;transition:border-color .15s';
          btn.title = pos.label;
          var isT=pos.value.startsWith('top'), isL=pos.value.endsWith('left'), isR=pos.value.endsWith('right');
          var dx=isL?'18%':isR?'82%':'50%', dy=isT?'20%':'80%';
          btn.innerHTML='<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="28" height="38" rx="2" stroke="currentColor" stroke-width="1.5" fill="var(--sf)"/><circle cx="'+dx+'" cy="'+dy+'" r="3" fill="var(--ac)"/></svg><span>'+pos.label+'</span>';
          btn.onclick=function(){
            sel.value=pos.value;
            picker.querySelectorAll('button').forEach(function(b){b.style.borderColor='var(--bd)';b.style.background='var(--sf2)';});
            btn.style.borderColor='var(--ac)'; btn.style.background='rgba(232,65,42,.08)';
          };
          if(pos.value===sel.value){btn.style.borderColor='var(--ac)';btn.style.background='rgba(232,65,42,.08)';}
          picker.appendChild(btn);
        });
        sel.parentNode.appendChild(picker);
      }
    }
    if (toolId === 'split' || toolId === 'extract-pages') {
      var rngEl = document.getElementById('sv-' + uid) || document.getElementById('ep-rng-' + uid);
      if (rngEl && !document.getElementById('rng-hint-' + uid)) {
        var hint = document.createElement('div');
        hint.id = 'rng-hint-' + uid;
        hint.style.cssText = 'font-size:.7rem;margin-top:.2rem;min-height:.85em;color:var(--tx3)';
        rngEl.parentNode.insertBefore(hint, rngEl.nextSibling);
        rngEl.addEventListener('input', function(){
          var val = rngEl.value.trim(); if(!val){hint.textContent='';return;}
          var pages = 0;
          var s = window.S&&window.S[uid]; if(s&&s.files&&s.files[0]&&s.files[0]._pages) pages=s.files[0]._pages;
          if(!pages){hint.textContent='Drop a PDF to validate.';hint.style.color='var(--tx3)';return;}
          try {
            var idx=window.parseRange(val,pages);
            if(!idx.length) throw new Error('empty');
            hint.textContent='✓ '+idx.length+' page(s) of '+pages+' selected'; hint.style.color='var(--green)';
          } catch(e2){
            hint.textContent='✕ Invalid range (max page: '+pages+')'; hint.style.color='var(--ac)';
          }
        });
      }
    }
    if (toolId === 'markdown-to-pdf') {
      var ta = document.getElementById('mdi-' + uid);
      if (ta && !ta._mdp) {
        ta._mdp = true;
        var KEY = 'pf-md-content';
        try { var saved=localStorage.getItem(KEY); if(saved){ta.value=saved;if(typeof window.mdPreview==='function')window.mdPreview(uid);window.setSt(uid,'↩ Draft restored.','inf');} } catch(e2){}
        ta.addEventListener('input', function(){
          clearTimeout(ta._mdTimer);
          ta._mdTimer = setTimeout(function(){ try{localStorage.setItem(KEY,ta.value);}catch(e2){} }, 5000);
        });
        var toolbar = ta.closest && ta.closest('.md-editor');
        toolbar = toolbar && toolbar.querySelector('.md-tools');
        if (toolbar && !document.getElementById('md-imp-' + uid)) {
          var sep = document.createElement('div'); sep.className='md-sep';
          var imp = document.createElement('button'); imp.id='md-imp-'+uid; imp.className='md-tb-btn'; imp.title='Import .md file'; imp.textContent='📂';
          imp.onclick=function(){
            var inp=document.createElement('input'); inp.type='file'; inp.accept='.md,.txt';
            inp.onchange=function(){
              var file=inp.files[0]; if(!file) return;
              var reader=new FileReader();
              reader.onload=function(ev){ta.value=ev.target.result;try{localStorage.setItem(KEY,ta.value);}catch(e2){}if(typeof window.mdPreview==='function')window.mdPreview(uid);window.toast('Markdown imported ✓');};
              reader.readAsText(file);
            };
            inp.click();
          };
          toolbar.appendChild(sep); toolbar.appendChild(imp);
        }
      }
    }
  }
})();
window.doAiTranslate = async function(id) {
  await window.awaitLibs();
  if(typeof window._checkAiCooldown==='function'&&!window._checkAiCooldown(id)) return;
  var f=window.S[id]&&window.S[id].files;
  var err=window.guardFiles(f||[],{types:['pdf'],maxMB:50});
  if(err){window.setSt(id,err,'err');return;}
  var key=(document.getElementById('aikey-'+id)||{value:''}).value.trim();
  if(!key){window.setSt(id,'⚠ Enter your Anthropic API key above','warn');return;}
  window.setBusy(id,true);
  try {
    window.setSt(id,'Extracting text…','inf'); window.setPrg(id,15);
    var result=await window.extractAllText(f[0]);
    if(result.text.trim().length<20){window.setSt(id,'⚠ Very little text found. Try OCR PDF first.','warn');window.setBusy(id,false);return;}
    var lang=(document.getElementById('aitl-'+id)||{value:'Hindi'}).value||'Hindi';
    var style=(document.getElementById('aitlstyle-'+id)||{value:'faithful'}).value||'faithful';
    var styleMap={faithful:'Translate accurately preserving all meaning.',natural:'Translate naturally and fluently.',formal:'Use formal/professional register.',casual:'Use casual conversational register.'};
    var sys='You are a professional translator. '+(styleMap[style]||styleMap.faithful)+' Preserve formatting and structure.';
    var usr='Translate to '+lang+':\n\n'+result.text.slice(0,12000);
    window.setPrg(id,35,'Translating with Claude…');
    var ra=document.getElementById('aiR-'+id);
    if(ra){ra.textContent='';ra.style.display='block';}
    var reply=await window.callClaudeStream(key,sys,usr,function(chunk,full){if(ra)ra.textContent=full;});
    window._injectAiCopyButtons(id,[{title:'Translation',text:reply}]);
    window.setPrg(id,100); window.setSt(id,'✓ Translation to '+lang+' complete','succ');
    window.pvReady(id); window.addHist({tool:'ai-translate',fileName:f[0].name});
    try{if(window.plausible)window.plausible('ai_complete',{props:{tool:'ai-translate',lang:lang}});}catch(pe){}
    window.toast('Translation ready ✓');
  } catch(e){window.setPrg(id,0);window.setSt(id,'✕ '+e.message,'err');}
  window.setBusy(id,false);
};
var _origWC = window.doWordCount;
if (typeof _origWC === 'function') {
  window.doWordCount = async function(id) {
    await _origWC.apply(this, arguments);
    setTimeout(function(){
      var stEl=document.getElementById('st-'+id);
      if(!stEl||!stEl.classList.contains('succ')) return;
      if(document.getElementById('wc-cards-'+id)) return;
      var txt=stEl.textContent||'';
      var words=(txt.match(/(\d[\d,]*)\s*word/i)||[])[1];
      var chars=(txt.match(/(\d[\d,]*)\s*char/i)||[])[1];
      var sents=(txt.match(/(\d[\d,]*)\s*sen/i)||[])[1];
      var rtime=(txt.match(/(\d+)\s*min/i)||[])[1];
      var flesch=(txt.match(/[\d.]{2,5}(?=\s*Flesch|\s*flesch|\/100)/i)||txt.match(/Flesch[:\s]*([\d.]+)/i)||[])[1];
      if(!words&&!chars) return;
      var cards=[
        {icon:'📝',label:'Words',value:words||'—'},
        {icon:'🔤',label:'Characters',value:chars||'—'},
        {icon:'📖',label:'Sentences',value:sents||'—'},
        {icon:'⏱',label:'Read time',value:rtime?rtime+' min':'—'},
      ];
      if(flesch) cards.push({icon:'📊',label:'Readability',value:parseFloat(flesch).toFixed(0)+'/100'});
      var div=document.createElement('div');
      div.id='wc-cards-'+id;
      div.style.cssText='display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.6rem';
      div.innerHTML=cards.map(function(c){
        return '<div style="flex:1;min-width:90px;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.55rem .7rem;text-align:center">'+
          '<div style="font-size:1.2rem">'+c.icon+'</div>'+
          '<div style="font-size:.95rem;font-weight:700;color:var(--tx);margin:.15rem 0">'+c.value+'</div>'+
          '<div style="font-size:.66rem;color:var(--tx3);font-weight:600;text-transform:uppercase;letter-spacing:.04em">'+c.label+'</div>'+
        '</div>';
      }).join('');
      stEl.parentNode.insertBefore(div, stEl.nextSibling);
    }, 350);
  };
}
document.addEventListener('DOMContentLoaded', function(){
  var anchor = document.querySelector('.tc[data-tool="ai-translate"]');
  var grid   = anchor ? anchor.parentNode : null;
  if (!grid) return;
  function mkCard(toolId,cat,icon,name,desc,cc,cb){
    if (grid.querySelector('[data-tool="'+toolId+'"]')) return null;
    var d=document.createElement('div');
    d.className='tc vis'; d.style.animation='fadeIn .35s ease both'; d.dataset.cat=cat; d.dataset.tool=toolId;
    d.tabIndex=0; d.setAttribute('role','button');
    d.setAttribute('aria-label','Open '+name+' tool');
    d.style.cssText='--ic-bg:'+cb+';--ic-ac:'+cc;
    d.setAttribute('onclick',"openTool('"+toolId+"')");
    d.setAttribute('onkeydown',"cardK(event,this)");
    d.innerHTML='<button class="fav-btn" onclick="toggleFav(event,\''+toolId+'\')" aria-label="Favourite '+name+'">♡</button>'+
      '<div class="tc-ic">'+icon+'</div><span class="tc-arr">↗</span>'+
      '<div class="tn">'+name+'</div><div class="td">'+desc+'</div>';
    return d;
  }
  [
    ['annotate-pdf',     'edit',    '✏️','Annotate PDF',           'Highlight, draw and add comments — bakes into PDF on save',                         '#b45309','rgba(180,83,9,.1)'],
    ['pdf-to-html',      'convert', '🌐','PDF to HTML',            'Export PDF text content as a clean HTML file',                     '#7c3aed','rgba(124,58,237,.1)'],
    ['fill-form',        'edit',    '📝','Fill PDF Form',          'Detect and fill AcroForm fields in any fillable PDF',              '#b45309','rgba(180,83,9,.1)'],
    ['certificate-gen',  'create',  '🏆','Certificate Generator',  'Bulk-generate PDF certificates — 3 templates, custom branding',    '#db2777','rgba(219,39,119,.1)'],
    ['ai-smart-compress','ai',      '🤖','AI Smart Compress',      'Claude analyses your PDF type and picks optimal compression',      '#4f46e5','rgba(79,70,229,.1)'],
  ].forEach(function(args){
    var card = mkCard.apply(null, args);
    if (card) grid.appendChild(card);
  });
  if (window.TOOL_SEO) {
    Object.assign(window.TOOL_SEO,{
      'annotate-pdf':      {t:'Annotate PDF Free — Highlight & Comment | Dublesh',    d:'Add highlights, drawings and comments to any PDF. Free, private, no upload.'},
      'pdf-to-html':       {t:'PDF to HTML Free | Dublesh',                           d:'Export PDF content as clean HTML. Runs entirely in your browser.'},
      'fill-form':         {t:'Fill PDF Form Free | Dublesh',                         d:'Detect and fill AcroForm fields in any fillable PDF. No upload, 100% private.'},
      'certificate-gen':   {t:'Certificate Generator Free | Dublesh',                 d:'Generate PDF certificates in bulk. 3 templates, custom branding. India-first.'},
      'ai-smart-compress': {t:'AI Smart PDF Compress Free | Dublesh',                 d:'Claude analyses your PDF and auto-selects optimal compression settings.'},
    });
  }
  Object.assign(window.TMETA||{},{
    'annotate-pdf':      {i:'✏️',n:'Annotate PDF'},
    'pdf-to-html':       {i:'🌐',n:'PDF to HTML'},
    'fill-form':         {i:'📝',n:'Fill PDF Form'},
    'certificate-gen':   {i:'🏆',n:'Certificate Generator'},
    'ai-smart-compress': {i:'🤖',n:'AI Smart Compress'},
  });
});

})();