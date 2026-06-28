/* Dublesh v6.9.9 — app.js */

'use strict';
// ── FILE/DZ HELPERS ──
function dzO(e,id){e.preventDefault();var el=document.getElementById(id);if(el){el.classList.add('ov');el.classList.add('drag-over');}}
function dzL(id,e){if(e&&e.relatedTarget){var _c=document.getElementById(id);if(_c&&_c.contains(e.relatedTarget))return;}var el=document.getElementById(id);if(el){el.classList.remove('ov');el.classList.remove('drag-over');}}
function dzD(e,id,multi){e.preventDefault();dzL('dz-'+id);addFiles(id,Array.from(e.dataTransfer.files),multi);}
async function addFiles(id,files,multi,cb=null){
  await awaitLibs();
  if(!files||!files.length)return;
  if(!S[id])S[id]={files:[],tid:id,_blobs:[]};
  // Validate BEFORE modifying S[id].files
  for(var _vi=0;_vi<files.length;_vi++){
    var _vf=files[_vi];
    if(!_vf)continue;
    if(_vf.size===0){setSt(id,'"'+_vf.name+'" is empty — choose a valid file.','err');return;}
    if(_vf.name.toLowerCase().endsWith('.pdf')&&_vf.size<67){setSt(id,'"'+_vf.name+'" is not a valid PDF.','err');return;}
  }
  if(multi)S[id].files.push(...files);
  else S[id].files=[files[0]].filter(Boolean);
  // Read page count for display (non-fatal if it fails)
  for(const f of S[id].files){
    if(f.name.toLowerCase().endsWith('.pdf')&&!f._pages){
      try{
        const buf=await f.arrayBuffer();
        const pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf)}).promise;
        f._pages=pdf.numPages;
      }catch(e){f._pages=null;}
    }
  }
  renderFL(id);
  const dz=document.getElementById('dz-'+id);
  if(dz)dz.classList.toggle('ok',S[id].files.length>0);
  const btn=document.getElementById('btn-'+id);
  if(btn)btn.disabled=S[id].files.length===0;
  // Clear any prior error status
  var _stEl=document.getElementById('st-'+id);
  if(_stEl&&_stEl.classList.contains('err'))setSt(id,'');
  if(id==='pdf-to-excel'||id.startsWith('pdf-to-excel')){
    if(PX&&PX[id])PX[id].results=[];
    var prevBtn=document.getElementById('pxprev-'+id);
    if(prevBtn)prevBtn.style.display=S[id].files.length>0?'inline-flex':'none';
    var pxp=document.getElementById('pxpanel-'+id);
    if(pxp)pxp.style.display='none';
  }
  if(cb&&S[id].files.length>0)cb();
}
function onFI(e,id,multi,cb=null){addFiles(id,Array.from(e.target.files),multi,cb);e.target.value='';}
// ── File-list drag-to-reorder ─────────────────────────────────────────────────
let flDragIdx=null,flDragId=null;
function flDS(e,id,idx){flDragIdx=idx;flDragId=id;e.dataTransfer.effectAllowed='move';}
function flDO(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.style.background='var(--ac-dim)';}
function flDP(e,id,toIdx){
  e.preventDefault();
  e.currentTarget.style.background='';
  if(flDragIdx===null||flDragIdx===toIdx||flDragId!==id)return;
  const files=S[id].files;
  const moved=files.splice(flDragIdx,1)[0];
  files.splice(toIdx,0,moved);
  flDragIdx=null;flDragId=null;
  renderFL(id);
}
function rmFile(id,idx){
  if(!S[id])return;
  S[id].files.splice(idx,1);
  renderFL(id);
  const btn=document.getElementById('btn-'+id);
  if(btn)btn.disabled=S[id].files.length===0;
  const dz=document.getElementById('dz-'+id);
  if(dz)dz.classList.toggle('ok',S[id].files.length>0);
}
function renderFL(id){
  const fl=document.getElementById('fl-'+id);
  if(!fl)return;
  fl.innerHTML=S[id].files.map((f,i)=>`<div class="fitem" draggable="true" data-flidx="${i}" ondragstart="flDS(event,'${id}',${i})" ondragover="flDO(event)" ondrop="flDP(event,'${id}',${i})" ondragleave="this.style.background=''" style="cursor:default"><span class="fi-ic" style="cursor:grab;color:var(--tx3);font-size:.9rem;user-select:none" title="Drag to reorder">☰</span><span class="fi-ic">${f.name.match(/\.pdf$/i)?'📄':'🖼️'}</span><div style="flex:1;min-width:0"><div class="fi-n" title="${esc(f.name)}">${esc(f.name)}</div></div><div class="fi-meta">${f._pages?`<span class="fi-pg">${f._pages}p</span>`:''}<span>${fmt(f.size)}</span></div><button class="fi-rm" onclick="rmFile('${id}',${i})" title="Remove">✕</button></div>`).join('');
}
function selAll(id,v){document.querySelectorAll(`#tg-${id} .titem`).forEach(el=>el.classList.toggle('sel',v));updateSelCount(id);}
function copyText(t){navigator.clipboard.writeText(t).then(()=>toast('Copied!'));}
function updateSelCount(id){const sc=document.getElementById('sel-count-'+id);if(!sc)return;const n=document.querySelectorAll(`#tg-${id} .titem.sel`).length,tot=document.querySelectorAll(`#tg-${id} .titem`).length;sc.textContent=n?`${n} of ${tot} selected`:`${tot} pages — tap to select`;}

const TOOL_ICONS={"merge":"🔗","jpgtopdf":"📷","pagenumbers":"🔢","markdowntopdf":"📝","split":"✂️","rotate":"🔄","reorder":"📋","deletepages":"🗑️","extractpages":"📤","pdftojpg":"🖼️","imgtopdf":"🗂️","extracttext":"📝","compress":"🗜️","watermark":"💧","pagenums":"🔢","resize":"📐","grayscale":"⚫","protect":"🔒","unlock":"🔓","sign":"✍️","flatten":"📌","metadata":"📊","wordcount":"🔤","compare":"🔀","blankpdf":"📄","markdown":"🖊️","htmltopdf":"🌐","thumbnail":"🖼️","redact":"⬛","pdftoword":"📝","pdftoexcel":"📊","formbuilder":"📋","aisummarize":"✨","aiqa":"🤖","aitranslate":"🌍","word-count":"📊","pdf-to-jpg":"🖼️","jpg-to-pdf":"📷","extract-text":"📄","html-to-pdf":"🌐","markdown-to-pdf":"📝","page-numbers":"🔢","blank-pdf":"📄","delete-pages":"🗑️","extract-pages":"📤","pdf-to-word":"📝","pdf-to-excel":"📊","form-builder":"📋","ai-summarize":"🤖","ai-qa":"💬","ai-translate":"🌍"};
window.TOOL_ICONS = TOOL_ICONS; // expose for patch layers


// ── Global error safety net ──────────────────────────────────────
window.addEventListener('unhandledrejection', function(ev) {
  if (ev.reason && ev.reason.name === 'AbortError') { ev.preventDefault(); return; }
  console.error('[Dublesh] Unhandled rejection:', ev.reason);
  // BA rec 6.3: error telemetry to Plausible (anonymous, no file data)
  try { if(window.plausible) window.plausible('js_error',{props:{type:'rejection',msg:String(ev.reason).slice(0,80)}}); } catch(e) {}
});
window.addEventListener('error', function(ev) {
  console.error('[Dublesh] Uncaught error:', ev.message, 'at', ev.filename + ':' + ev.lineno);
  // BA rec 6.3: error telemetry
  try { if(window.plausible) window.plausible('js_error',{props:{type:'uncaught',msg:String(ev.message).slice(0,80)}}); } catch(e) {}
});

// ── LIBRARY READINESS GUARD ─────────────────────────────────────────────────
function _libsReady() {
  return typeof PDFLib    !== 'undefined' &&
         typeof pdfjsLib  !== 'undefined' &&
         typeof JSZip     !== 'undefined';
}
function _ensureWorker() {
  if (typeof pdfjsLib !== 'undefined' &&
      pdfjsLib.GlobalWorkerOptions &&
      !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}
function awaitLibs() {
  _ensureWorker();
  if (_libsReady()) return Promise.resolve();
  return new Promise(function(resolve, reject) {
    var elapsed = 0;
    // Show "loading" message in any open modal status area
    var tid = typeof _activeTid !== 'undefined' ? _activeTid : null;
    var _libMsgs = ['⏳ Loading PDF renderer…', '⏳ Loading PDF engine…', '⏳ Loading tools…'];
    var _libMsgIdx = 0;
    if (tid) setSt(tid, _libMsgs[0], 'inf');
    var _libMsgTimer = setInterval(function() {
      _libMsgIdx = Math.min(_libMsgIdx + 1, _libMsgs.length - 1);
      if (tid) setSt(tid, _libMsgs[_libMsgIdx], 'inf');
    }, 1500);
    var poll = setInterval(function() {
      elapsed += 50;
      _ensureWorker();
      if (_libsReady()) {
        clearInterval(poll);
        if (tid) setSt(tid, '', ''); clearInterval(_libMsgTimer); // clear loading message
        resolve();
      } else if (elapsed >= 15000) {
        clearInterval(poll);
        var msg = 'PDF libraries failed to load. Please check your internet connection and refresh the page.';
        toast(msg, 'e', 8000);
        reject(new Error(msg));
      }
    }, 50);
  });
}
// Set workerSrc once libraries are confirmed loaded
// workerSrc managed by _ensureWorker() inside awaitLibs

// ── INPUT VALIDATION & FILE GUARDS ──────────────────────────────────────────
const MAX_FILE_MB = 150;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

function guardFiles(files, opts) {
  // opts: { maxFiles, maxMB, types }
  if (!files || !files.length) { return 'Please add at least one file.'; }
  const maxF = opts.maxFiles || 50;
  if (files.length > maxF) return `Too many files — max ${maxF}.`;
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var limitBytes = (opts.maxMB || MAX_FILE_MB) * 1024 * 1024;
    if (f.size > limitBytes) return `"${f.name}" is ${fmt(f.size)} — max ${opts.maxMB || MAX_FILE_MB} MB per file.`;
    if (f.size === 0) return `"${f.name}" is empty (0 bytes) — please select a valid file.`;
    if (opts.types && opts.types.includes('pdf') && f.size < 68) return `"${f.name}" is too small to be a valid PDF.`;
    if (f.size === 0) return `"${f.name}" is empty.`;
    if (opts.types && opts.types.length) {
      var ext = f.name.split('.').pop().toLowerCase();
      if (!opts.types.includes(ext)) return `"${f.name}" is not a supported type (${opts.types.join(', ')}).`;
    }
  }
  return null; // OK
}

function safeInt(val, fallback, min, max) {
  var n = parseInt(val, 10);
  if (isNaN(n) || !isFinite(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function safeFloat(val, fallback, min, max) {
  var n = parseFloat(val);
  if (isNaN(n) || !isFinite(n)) return fallback;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function sanitizeHTML(str) {
  // Strip all tags — used before injecting user text into innerHTML contexts
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

const PSZ={a4:[595,842],letter:[612,792],a3:[842,1190],a5:[420,595],legal:[612,1008],b5:[499,709]};

// THEME
(()=>{const t=localStorage.getItem('pf-theme')||'light';document.documentElement.setAttribute('data-theme',t);document.getElementById('themeBtn').textContent=t==='dark'?'☀':'☾';})();
function toggleTheme(){const d=document.documentElement.getAttribute('data-theme')==='dark';const n=d?'light':'dark';document.documentElement.setAttribute('data-theme',n);document.getElementById('themeBtn').textContent=n==='dark'?'☀':'☾';localStorage.setItem('pf-theme',n);}

// TOAST
function toast(msg,type='s',dur=3200){
  const tc=document.getElementById('tc');
  while(tc&&tc.children.length>=3){
    const old=tc.firstChild;
    if(old){old.style.opacity='0';setTimeout(()=>{try{old.remove();}catch(e){}},180);tc.removeChild(old);}
    else break;
  }
  const el=document.createElement('div');
  el.className='toast toast-'+(type||'s');
  el.dataset.type=(type||'s');
  el.title='Click to dismiss';
  el.style.cursor='pointer';
  el.innerHTML=`<span>${{s:'✓',e:'✕',i:'ℹ',w:'⚠'}[type]||'✓'}</span><span>${msg}</span>`;
  const _dismiss=()=>{el.style.opacity='0';el.style.transform='translateY(6px) scale(.95)';setTimeout(()=>{try{el.remove();}catch(e){}},180);};
  el.addEventListener('click',_dismiss);
  tc&&tc.appendChild(el);
  setTimeout(_dismiss,dur);
}

// SCROLL
window.addEventListener('scroll',()=>{var inTools=document.body.classList.contains('dub-tools-view');document.getElementById('tabsWrap').classList.toggle('up',inTools&&scrollY>20);},{passive:true});

// KEYBOARD
// Fix safe-area header height for notch devices (iPhone X+)
(function(){
  function updateSafeArea(){
    var sai = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sai')||'0')||0;
    document.documentElement.style.setProperty('--hdr-total',(64+sai)+'px');
  }
  // Create a sentinel to read env(safe-area-inset-top)
  var s = document.createElement('div');
  s.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0px);left:0;width:0;height:0;pointer-events:none;';
  document.documentElement.appendChild(s);
  function applyFromSentinel(){
    var top = parseFloat(getComputedStyle(s).top)||0;
    document.documentElement.style.setProperty('--hdr-total',(64+top)+'px');
    document.documentElement.style.setProperty('--sai-px',top+'px');
  }
  // Defer first read to next rAF — avoids forced reflow after appendChild
  requestAnimationFrame(applyFromSentinel);
  window.addEventListener('resize', function() {
    requestAnimationFrame(applyFromSentinel);
  });

})();

document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();focusSearch();}if(e.key==='Escape')closeModal();});


// ── HAPTIC FEEDBACK ──────────────────────────────────────────────
// 10ms vibration on key actions for mobile tactile confirmation

function cqSetTargetLabel(id, kb) {
  var lbl = document.getElementById('cqtarglbl-' + id);
  if (!lbl) return;
  var n = parseFloat(kb);
  if (!n || n < 1) { lbl.textContent = ''; return; }
  if (n < 1024) lbl.textContent = '(' + n.toFixed(0) + ' KB)';
  else lbl.textContent = '(' + (n/1024).toFixed(1) + ' MB)';
}

function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern || 10); } catch(e) {}
}

// ── VISUAL VIEWPORT KEYBOARD HANDLER ─────────────────────────────
// When iOS/Android soft keyboard opens, shrink modal body so inputs stay visible
(function() {
  if (!window.visualViewport) return;
  var _lastVVH = window.visualViewport.height;
  var _vvRafPending = false;
  function _onVVResize() {
    if (_vvRafPending) return;
    _vvRafPending = true;
    // Batch read+write in a single rAF — eliminates forced layout mid-event
    requestAnimationFrame(function() {
      _vvRafPending = false;
      var vvh = window.visualViewport.height; // READ
      var diff = _lastVVH - vvh;
      _lastVVH = vvh;
      var modalBody = document.querySelector('.modal-body');
      if (!modalBody) return;
      var overlay = document.getElementById('overlay');
      if (!overlay || !overlay.classList.contains('open')) return;
      if (diff > 80) {
        // Keyboard appeared — reduce modal body max-height (WRITE)
        modalBody.style.maxHeight = Math.max(200, vvh - 120) + 'px';
        setTimeout(function() {
          var active = document.activeElement;
          if (active && active !== document.body) {
            active.scrollIntoView({behavior: 'smooth', block: 'center'});
          }
        }, 100);
      } else if (diff < -80) {
        modalBody.style.maxHeight = ''; // WRITE
      }
    });
  }
  window.visualViewport.addEventListener('resize', _onVVResize);
  window.visualViewport.addEventListener('scroll', _onVVResize);
})();

// ── SEARCH HELPERS ──────────────────────────────────────────────

// _openSearch: expand search bar on small phones (≤380px)
function _openSearch() {
  var wrap = document.querySelector('.hdr-search-inline');
  var top  = document.querySelector('.hdr-top');
  var inp  = document.getElementById('searchIn');
  if (!wrap || !inp) return;

  wrap.classList.add('search-open');
  if (top) top.classList.add('search-active');

  // Small delay so CSS transition finishes before focus (prevents iOS scroll-jump)
  requestAnimationFrame(function() {
    inp.removeAttribute('disabled');
    inp.style.pointerEvents = 'auto';
    setTimeout(function() {
      try { inp.focus(); } catch(e) {}
    }, 30);
  });

  // Collapse when user taps outside
  function _collapse(ev) {
    if (!wrap.contains(ev.target)) {
      _closeSearch();
      document.removeEventListener('touchstart', _collapse, true);
      document.removeEventListener('mousedown',  _collapse, true);
    }
  }
  setTimeout(function() {
    document.addEventListener('touchstart', _collapse, true);
    document.addEventListener('mousedown',  _collapse, true);
  }, 120);
}

function _closeSearch() {
  var wrap = document.querySelector('.hdr-search-inline');
  var top  = document.querySelector('.hdr-top');
  var inp  = document.getElementById('searchIn');
  if (wrap) wrap.classList.remove('search-open');
  if (top)  top.classList.remove('search-active');
  if (inp && !inp.value) inp.style.pointerEvents = '';
}

// srchBoxTap: fired when user taps the circular icon or the box
function srchBoxTap(e) {
  var inp = document.getElementById('searchIn');
  if (!inp) return;
  // If click came from the input or clear button, let it through naturally
  if (e && e.target && (e.target === inp || e.target.id === 'searchClear')) return;

  var isCompact = window.innerWidth <= 380;
  var wrap = document.querySelector('.hdr-search-inline');
  if (isCompact && wrap && !wrap.classList.contains('search-open')) {
    e && e.preventDefault();
    e && e.stopPropagation();
    _openSearch();
  } else if (!isCompact) {
    // Normal size: just focus the input directly
    try { inp.focus(); inp.select(); } catch(er) {}
  }
}

// focusSearch: called by ⌘K, Search button, keyboard shortcut '/'
function focusSearch() {
  var el = document.getElementById('searchIn');
  if (!el) return;

  var inToolsView = document.body.classList.contains('dub-tools-view');
  if (!inToolsView) {
    // Still on landing — scroll to tools first
    var main = document.getElementById('main');
    if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(function() { _doFocus(); }, 300);
  } else {
    _doFocus();
  }

  function _doFocus() {
    var isCompact = window.innerWidth <= 380;
    var wrap = document.querySelector('.hdr-search-inline');
    if (isCompact && wrap && !wrap.classList.contains('search-open')) {
      _openSearch();
    } else {
      try { el.focus(); el.select(); } catch(er) {}
    }
  }
}

// RECENT
const TMETA={merge:{i:'🔗',n:'Merge PDF'},split:{i:'✂️',n:'Split PDF'},rotate:{i:'🔄',n:'Rotate Pages'},reorder:{i:'📋',n:'Reorder Pages'},'delete-pages':{i:'🗑️',n:'Delete Pages'},'extract-pages':{i:'📤',n:'Extract Pages'},'pdf-to-jpg':{i:'🖼️',n:'PDF to JPG'},'jpg-to-pdf':{i:'📷',n:'Image to PDF'},'extract-text':{i:'🔤',n:'PDF to Text'},'markdown-to-pdf':{i:'📝',n:'Markdown→PDF'},'html-to-pdf':{i:'🌐',n:'HTML→PDF'},compress:{i:'🗜️',n:'Compress'},watermark:{i:'💧',n:'Watermark'},'page-numbers':{i:'🔢',n:'Page Numbers'},resize:{i:'📐',n:'Resize'},grayscale:{i:'⚫',n:'Grayscale'},protect:{i:'🔒',n:'Protect'},unlock:{i:'🔓',n:'Unlock'},sign:{i:'✍️',n:'Sign PDF'},flatten:{i:'📌',n:'Flatten'},metadata:{i:'📊',n:'Metadata'},'word-count':{i:'📈',n:'Word Count'},compare:{i:'🔀',n:'Compare'},'blank-pdf':{i:'📄',n:'Blank PDF'},thumbnail:{i:'🖼️',n:'Thumbnails'},'redact':{i:'⬛',n:'Redact PDF'},'pdf-to-word':{i:'📝',n:'PDF to Word'},'form-builder':{i:'📋',n:'Form Builder'},'ai-summarize':{i:'🤖',n:'AI Summarize'},'ai-qa':{i:'💬',n:'Ask PDF'},'ai-translate':{i:'🌍',n:'AI Translate'},'pdf-to-excel':{i:'📊',n:'PDF to Excel'}};
window.TMETA = TMETA; // expose for patch layers
// Missing TMETA entries for BA4 tools (crop-pdf, add-image) and v6.9.9 tools
TMETA['crop-pdf']         = {i:'✂️',n:'Crop PDF'};
TMETA['add-image']        = {i:'🖼️',n:'Add Image'};
TMETA['annotate-pdf']     = {i:'✏️',n:'Annotate PDF'};
TMETA['pdf-to-html']      = {i:'🌐',n:'PDF to HTML'};
TMETA['fill-form']        = {i:'📝',n:'Fill PDF Form'};
TMETA['certificate-gen']  = {i:'🏆',n:'Certificate Generator'};
TMETA['ai-smart-compress']= {i:'🤖',n:'AI Smart Compress'};

let recent=JSON.parse(localStorage.getItem('pf-recent')||'[]');
function addRecent(tid){recent=[tid,...recent.filter(r=>r!==tid)].slice(0,6);localStorage.setItem('pf-recent',JSON.stringify(recent));renderRecent();}
function renderRecent(){
  var bar=document.getElementById('recentBar'),list=document.getElementById('recentList');
  if(!bar||!list)return;
  if(!recent.length){bar.classList.remove('on');_syncHdrH();return;}
  bar.classList.add('on');
  list.innerHTML=recent.map(function(t){
    var m=TMETA[t]||{i:'',n:t};
    return '<button class="recent-chip" onclick="openTool(\x27'+t+'\x27)">'+(m.i?m.i+' ':'')+m.n+'</button>';
  }).join('');
  _syncHdrH();
}
function _syncHdrH(){
  var h=document.getElementById('appHeader');
  if(h && document.body.classList.contains('dub-tools-view')) document.documentElement.style.setProperty('--hdr-total',h.offsetHeight+'px');
}
renderRecent();
setTimeout(_syncHdrH,50);

// FILTER
let activeTab='all';
let _dfTimer=null;
function setTab(el){activeTab=el.dataset.cat;document.querySelectorAll('.tab').forEach(t=>{t.classList.remove('active');t.setAttribute('aria-selected','false');});el.classList.add('active');el.setAttribute('aria-selected','true');el.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});document.getElementById('searchIn').value='';document.getElementById('searchClear').classList.remove('show');document.getElementById('srchKbd').style.display='';doFilter();_renderFavBtns();}
function tabK(e,el){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}}
function cardK(e,el){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}}
function doFilter(){
  const q=document.getElementById('searchIn').value.toLowerCase().trim();
  const hasQ=q.length>0;
  document.getElementById('searchClear').classList.toggle('show',hasQ);
  const srchKbd=document.getElementById('srchKbd');
  if(srchKbd) srchKbd.style.display=hasQ?'none':'';

  // BA rec 5.2: synonym map — expand query with aliases
  const SYNONYMS={
    'combine':'merge','join':'merge','unite':'merge',
    'shrink':'compress','reduce':'compress','minify':'compress','optimise':'compress','optimize':'compress','smaller':'compress',
    'password':'protect unlock','encrypt':'protect','lock':'protect','secure':'protect',
    'decrypt':'unlock','remove password':'unlock','open':'unlock',
    'picture':'jpg image','photo':'jpg image','image':'jpg',
    'text':'extract','extract':'extract text','copy text':'extract text',
    'sign':'sign','signature':'sign','esign':'sign',
    'stamp':'watermark','logo':'watermark','brand':'watermark',
    'number':'page numbers','pagination':'page numbers',
    'size':'resize','resize':'resize','dimensions':'resize',
    'black white':'grayscale','grayscale':'grayscale','grey':'grayscale','bw':'grayscale',
    'delete':'delete pages','remove pages':'delete pages',
    'reorder':'reorder','rearrange':'reorder','sort pages':'reorder',
    'rotate':'rotate','flip':'rotate','turn':'rotate',
    'blank':'blank pdf','empty':'blank pdf','new pdf':'blank pdf',
    'form':'form builder','fillable':'form builder','fields':'form builder',
    'ai':'ai summarize ask translate','claude':'ai summarize',
    'summarize':'ai summarize','summary':'ai summarize',
    'translate':'ai translate','translation':'ai translate',
    'question':'ai qa','ask':'ai qa','chat':'ai qa',
    'metadata':'metadata','author':'metadata','title':'metadata','properties':'metadata',
    'compare':'compare','diff':'compare','difference':'compare',
    'word count':'word count','count words':'word count','statistics':'word count',
    'thumbnail':'thumbnail','preview':'thumbnail',
    'html':'html to pdf','markdown':'markdown to pdf','md':'markdown to pdf',
    'split':'split','separate':'split','break':'split',
    'extract':'extract pages',
    'flatten':'flatten','bake':'flatten'
  };
  // Expand query through synonym map
  var expandedQ = q;
  Object.keys(SYNONYMS).forEach(function(k){
    if(q.includes(k)) expandedQ += ' ' + SYNONYMS[k];
  });

  const grid=document.getElementById('tgrid');
  if(!grid) return;

  const allCards=[...grid.querySelectorAll('.tc[data-tool]')];

  // Cache search text in dataset on first run
  allCards.forEach(c=>{
    if(!c.dataset.srch){
      const nm=(c.querySelector('.tn')||{}).textContent||'';
      const nd=(c.querySelector('.td')||{}).textContent||'';
      c.dataset.srch=(nm+' '+nd+' '+(c.dataset.tool||'')+' '+(c.dataset.cat||'')).toLowerCase();
    }
  });

  const match=[];
  const noMatch=[];
  // Check against expanded query terms
  const terms = expandedQ.split(' ').filter(Boolean);

  allCards.forEach(c=>{
    const catOk = activeTab==='all' || activeTab===c.dataset.cat || activeTab==='favs';
    // For favs tab: only show favourited tools
    if(activeTab==='favs'){
      var favs=[];try{favs=JSON.parse(localStorage.getItem('pf-favs')||'[]');}catch(e){}
      var isFav=favs.indexOf(c.dataset.tool)>-1;
      if(!isFav){noMatch.push(c);return;}
    }
    const srch=c.dataset.srch;
    const ok = (activeTab!=='favs'?catOk:true) && (!hasQ || terms.some(function(t){return srch.includes(t);}));
    if(ok) match.push(c); else noMatch.push(c);
  });

  // Batch DOM moves in rAF to avoid layout thrashing
  requestAnimationFrame(()=>{
    match.forEach(c => grid.appendChild(c));
    noMatch.forEach(c => grid.appendChild(c));
    match.forEach((c,i) => {
      c.classList.add('vis');
      c.style.setProperty('animation-delay', (Math.min(i * 0.02, 0.22)) + 's');
    });
    noMatch.forEach(c => { c.classList.remove('vis'); c.style.removeProperty('animation-delay'); });
  // Empty-state message
  (function() {
    var noRes = document.getElementById('no-search-results');
    if (!noRes) return;
    noRes.style.display = (hasQ && match.length === 0) ? 'block' : 'none';
  })();
  });

  // Result info
  const ri = document.getElementById('resInfo');
  if(ri){
    if(hasQ || activeTab!=='all'){
      ri.textContent = match.length + ' of ' + allCards.length;
      ri.classList.add('on');
    } else {
      ri.classList.remove('on');
    }
  }
  const empty = document.getElementById('empty');
  if(empty) empty.classList.toggle('on', match.length===0);

  // Attach blur and ESC handlers to input once
  var inp2 = document.getElementById('searchIn');
  if (inp2 && !inp2._blurSet) {
    inp2._blurSet = true;
    inp2.addEventListener('blur', function() {
      // At ≤380px: collapse only if input is empty
      if (window.innerWidth <= 380 && !inp2.value) {
        setTimeout(function() {
          if (document.activeElement !== inp2) _closeSearch();
        }, 200);
      }
    });
    inp2.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        clearSearch();
        inp2.blur();
        _closeSearch();
      }
    });
  }
}
// End doFilter
function clearSearch(){
  var inp = document.getElementById('searchIn');
  if (inp) inp.value = '';
  doFilter();
  var sc = document.getElementById('searchClear');
  if (sc) sc.classList.remove('show');
  var kbd = document.getElementById('srchKbd');
  if (kbd) kbd.style.display = '';
  if (inp) {
    inp.focus();
    // Keep search open at ≤380px so user can type new query
    if (window.innerWidth <= 380) _openSearch();
  }
}

// STATE + MODAL
const S={};const RD={};const FB={};let dragSrc=null;
// Focus trap for modal accessibility
var _prevFocus = null;
var _trapFn = null;
function trapFocus(el) {
  if (_trapFn) { el.removeEventListener('keydown', _trapFn); _trapFn = null; }
  var focusable = el.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])');
  var first = focusable[0], last = focusable[focusable.length - 1];
  _trapFn = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last && last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first && first.focus(); } }
  };
  el.addEventListener('keydown', _trapFn);
}

// A11Y FIX: Associate <label> elements with their <select>/<input> siblings
// Runs once after tool renders (hooked into openTool via requestAnimationFrame)
function _fixA11yLabels(container) {
  if (!container) return;
  var fields = container.querySelectorAll('.field');
  fields.forEach(function(field) {
    var label = field.querySelector('label');
    var control = field.querySelector('select, input:not([type=file]):not([type=checkbox]):not([type=radio]), textarea');
    if (!label || !control) return;
    // Already labeled
    if (control.id && label.htmlFor === control.id) return;
    if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;
    // Generate id if missing
    if (!control.id) {
      control.id = 'a11y-ctrl-' + Math.random().toString(36).slice(2,8);
    }
    if (!label.htmlFor) {
      label.setAttribute('for', control.id);
    }
  });
}

function openTool(tid) {
  var cfg = TOOLS[tid];
  if (!cfg) { toast('Coming soon!', 'i'); return; }
  // BA 1.1: Track tool open — critical baseline analytics
  try { if(window.plausible) window.plausible('tool_open',{props:{tool:tid,cat:cfg.cat||'unknown'}}); } catch(e) {}
  _prevFocus = document.activeElement;
  var _scrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + _scrollY + 'px';
  document.body.style.width = '100%';
  S[tid] = {files: [], tid: tid, _blobs: []};
  _activeTid = tid; // FIX 5: track so closeModal can destroy PDF.js instances
  addRecent(tid);
  // SEO FIX: sync clean URL when tool opens (/merge-pdf/ instead of #merge)
  if (window._TOOL_SLUGS && window._TOOL_SLUGS[tid]) {
    var _sp = '/' + window._TOOL_SLUGS[tid] + '/';
    if (location.pathname !== _sp) {
      try { history.pushState({tool:tid}, (TOOLS[tid]&&TOOLS[tid].t||tid)+' — Dublesh', _sp); } catch(e){}
    }
  }
  document.getElementById('modalTitle').textContent = cfg.t;
  var _mIcon=document.getElementById('modalIcon');
  if(_mIcon){var _tkey=tid.replace(/-/g,'');_mIcon.textContent=cfg.ic||TOOL_ICONS[_tkey]||'';}
  // Show skeleton loader immediately — gives instant visual feedback
  document.getElementById('modalBody').innerHTML =
    '<div class="modal-loading">' +
    '<div class="ml-shimmer"></div>' +
    '<div class="ml-shimmer ml-s2"></div>' +
    '<div class="ml-shimmer ml-s3"></div>' +
    '<div class="ml-shimmer ml-s4"></div>' +
    '</div>';
  var overlay = document.getElementById('overlay');
  overlay.classList.add('open');
  overlay.dataset.tid = tid; // needed by paste handler
  // Render real tool content after skeleton has painted
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var mb = document.getElementById('modalBody');
      if (!mb) return;
      mb.innerHTML = cfg.r(tid);
      if (cfg.init) { try { cfg.init(tid); } catch(e2) { console.warn('Tool init:', e2); } }
      _fixA11yLabels(mb);
    });
  });
  if(typeof updateShareBtn==='function') updateShareBtn();
  // Focus first interactive element after render
  setTimeout(function() {
    var modal = document.getElementById('modal');
    var first = modal.querySelector('button:not([disabled]),input,select,textarea');
    if (first) first.focus();
    trapFocus(modal);
    // Swipe-to-dismiss on handle bar (mobile)
    var handle = modal.querySelector('.modal-handle');
    if (handle) {
      var _sy = null, _startScroll = 0;
      handle.addEventListener('touchstart', function(e) {
        _sy = e.touches[0].clientY;
        _startScroll = modal.querySelector('.modal-body')?.scrollTop || 0;
      }, {passive: true});
      handle.addEventListener('touchmove', function(e) {
        if (_sy === null) return;
        var dy = e.touches[0].clientY - _sy;
        if (dy > 0) { modal.style.transform = 'translateY(' + Math.min(dy, 280) + 'px)'; modal.style.transition = 'none'; }
      }, {passive: true});
      handle.addEventListener('touchend', function(e) {
        if (_sy === null) return;
        var dy = e.changedTouches[0].clientY - _sy;
        modal.style.transition = '';
        modal.style.transform = '';
        if (dy > 80) closeModal(); // swipe down > 80px = close
        _sy = null;
      }, {passive: true});
    }
  }, 60);
}
// FIX 5: closeModal now fully cleans up memory — destroys PDF.js docs, revokes all tracked blob URLs,
// and clears RD/FB/PX state for the closing tool, not just the S file buffers.
var _activeTid = null; // track which tool is currently open

function _cleanupToolState(tid) {
  if (!tid) return;
  // Destroy PDF.js document instances stored in RD, FB, PX
  try { if (RD[tid] && RD[tid].pdf) { RD[tid].pdf.destroy(); } delete RD[tid]; } catch(e) {}
  try { if (FB[tid] && FB[tid].pdf) { FB[tid].pdf.destroy(); } delete FB[tid]; } catch(e) {}
  try { delete PX[tid]; } catch(e) {}
  try { delete cmpF[tid + 'a']; delete cmpF[tid + 'b']; } catch(e) {}
  // Revoke any tracked blob URLs from preview images
  try {
    if (S[tid] && S[tid]._blobs) {
      S[tid]._blobs.forEach(function(u){ try{URL.revokeObjectURL(u);}catch(e){} });
    }
  } catch(e) {}
}

function closeModal() {
  // Revoke all blob URLs in the overlay DOM (covers img src, a href)
  document.querySelectorAll('#overlay [src^="blob:"], #overlay [href^="blob:"]').forEach(function(el){
    try{URL.revokeObjectURL(el.src || el.href);}catch(e){}
    if (el.src !== undefined) el.src = '';
    if (el.href !== undefined) el.href = '';
  });
  // FIX 5: Clean up the active tool's PDF.js instances and sub-state objects
  _cleanupToolState(_activeTid);
  // Prune S state — keep only last 3 entries to prevent accumulation
  try {
    var keys = Object.keys(S);
    if (keys.length > 3) {
      keys.slice(0, keys.length - 3).forEach(function(k){
        if (S[k]) { S[k].files = []; delete S[k]; }
      });
    }
  } catch(e) {}
  _activeTid = null;
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('modalBody').innerHTML = '';
  var _top = document.body.style.top;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  if (_top) window.scrollTo(0, -parseInt(_top || '0'));
  if (_trapFn) {
    var _modal = document.getElementById('modal');
    try { if (_modal) _modal.removeEventListener('keydown', _trapFn); } catch(e) {}
    _trapFn = null;
  }
  if (_prevFocus) { try { _prevFocus.focus(); } catch(e) {} _prevFocus = null; }
  // SEO FIX: restore homepage URL when tool closes
  if (location.pathname !== '/' && window._TOOL_SLUGS) {
    try { history.pushState({}, 'Dublesh — Free PDF Tools', '/'); } catch(e) {}
    var _cn = document.querySelector('link[rel="canonical"]');
    if (_cn) _cn.href = 'https://www.dublesh.com/';
    var _og = document.querySelector('meta[property="og:url"]');
    if (_og) _og.setAttribute('content','https://www.dublesh.com/');
    document.title = 'Dublesh — 51 Free PDF Tools. No Uploads.';
  }
}
function bgClose(e) { if (e.target === document.getElementById('overlay')) closeModal(); }

// ── ENCRYPTED PDF GUARD ─────────────────────────────────────────
// Checks if PDF is encrypted before processing tools that don't support it
async function _checkEncrypted(id, fileBuffer) {
  try {
    const {PDFDocument} = PDFLib;
    const doc = await PDFDocument.load(fileBuffer, {ignoreEncryption: true});
    if (doc.isEncrypted) {
      setSt(id, '🔒 This PDF is password-protected. Please use <strong>Unlock PDF</strong> first, then try again.', 'warn');
      setBusy(id, false);
      return true; // is encrypted — caller should return
    }
    return false;
  } catch(e) { return false; } // if check fails, let tool handle it
}

function setBusy(id,b){
  const btn=document.getElementById('btn-'+id);
  if(btn){btn.classList.toggle('busy',b);btn.disabled=b;}
  const dz=document.getElementById('dz-'+id);
  if(dz){dz.style.pointerEvents=b?'none':'';dz.style.opacity=b?'0.55':'';}
}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmt(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(1)+'KB';return(b/1048576).toFixed(2)+'MB';}
function pwaInstallClick() {
  if (!_pwaPrompt) return;
  _pwaPrompt.prompt();
  _pwaPrompt.userChoice.then(function(r) {
    if (r.outcome === 'accepted') {
      var el = document.getElementById('pwaInstall');
      if (el) el.classList.remove('show');
    }
    _pwaPrompt = null;
  });
}
function pwaDismiss() {
  var el = document.getElementById('pwaInstall');
  if (el) el.classList.remove('show');
  try { sessionStorage.setItem('pwa-dismissed','1'); } catch(e) {}
}

function dlBlob(blob,name){
  // BA 1.1: Track download event with tool context and file extension
  try {
    var ext = name.split('.').pop().toLowerCase();
    var activeTool = _activeTid || 'unknown';
    if(window.plausible) window.plausible('download',{props:{tool:activeTool,format:ext}});
  } catch(e) {}
  const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),6000);
}
function parseRange(str,total){const idx=new Set();(str||'').split(',').forEach(p=>{p=p.trim();if(!p)return;if(p.includes('-')){const[a,b]=p.split('-').map(n=>parseInt(n)-1);for(let i=Math.max(0,a);i<=Math.min(b,total-1);i++)idx.add(i);}else{const n=parseInt(p)-1;if(n>=0&&n<total)idx.add(n);}});return[...idx].sort((a,b)=>a-b);}
function setSt(id,msg,type='inf'){const e=document.getElementById('st-'+id);if(!e)return;if(!msg){e.className='smsg';e.innerHTML='';return;}e.className=`smsg ${type} show`;e.innerHTML=msg;}

// ── SMART OUTPUT FILENAME ────────────────────────────────────
function smartName(file,suffix,ext){
  ext=ext||'.pdf';
  if(!file)return suffix+ext;
  var base=file.name.replace(/\.[^.]+$/,'');
  return base+'_'+suffix+ext;
}

// ── FAVOURITE TOOLS ──────────────────────────────────────────
// _favTools: legacy — replaced by _getFavs()/_saveFavs() in v6.9.9
// toggleFav: defined below (v6.9.9 implementation)
// _renderFavBtns: defined below (v6.9.9)
function setPrg(id,pct,lbl='Processing…'){
  const pw=document.getElementById('pw-'+id);
  if(!pw)return;
  pw.classList.add('show');
  const pf=document.getElementById('pf-'+id);
  if(pf)pf.style.width=pct+'%';
  const pl=document.getElementById('pl-'+id);
  if(pl)pl.textContent=lbl;
  const pp=document.getElementById('pp-'+id);
  if(pp)pp.textContent=Math.round(pct)+'%';
  if(pct>=100){
    clearTimeout(pw._hideT);
    pw._hideT=setTimeout(()=>{
      if(pf)pf.style.width='0%';
      pw.classList.remove('show');
    },1600);
  }
}
function sf(id){return`<div class="smsg" id="st-${id}"></div><div class="pw" id="pw-${id}"><div class="plbl"><span id="pl-${id}">Processing…</span><span id="pp-${id}">0%</span></div><div class="pb"><div class="pf" id="pf-${id}"></div></div></div>`;}
function _dzAcceptLabel(accept){
  if(!accept) return 'FILE';
  if(accept.includes('image/*')) return 'JPG · PNG · WEBP';
  var s = accept.replace(/application\/pdf/gi,'').replace(/\.pdf/gi,'PDF').replace(/,+/g,' · ').replace(/^\s*·\s*|\s*·\s*$/g,'').trim().toUpperCase();
  return s || 'PDF';
}
function dzHTML(id,multi,accept,cb=''){const cbStr=cb?`,()=>${cb}('${id}')`:', null';
  const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  const dropTxt=isTouch?(multi?'Tap to select files':'Tap to select a file'):(multi?'Drop files here':'Drop a file here');
  const orTxt=isTouch?'':'or <em>click to browse</em>';
  return`<div class="dz" id="dz-${id}" ondragover="dzO(event,'dz-${id}')" ondragleave="dzL('dz-${id}',event)" ondrop="dzD(event,'${id}',${multi})"><div class="dz-ic">📂</div><div class="dz-tx"><strong>${dropTxt}</strong>${orTxt?`<span class="dz-or">${orTxt}</span>`:''}<small>${_dzAcceptLabel(accept)}</small><small style="margin-top:.18rem;color:var(--tx3);opacity:.7">📎 Max 150 MB · On iOS: tap then choose <strong>Browse</strong> for Files app</small></div><input type="file" accept="${accept}" ${multi?'multiple':''} onchange="onFI(event,'${id}',${multi}${cbStr})" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;z-index:10"></div><div class="flist" id="fl-${id}"></div>`;}
async function extractAllText(file){try{const buf=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf}).promise;let text='';for(let i=1;i<=pdf.numPages;i++){const p=await pdf.getPage(i);const c=await p.getTextContent();text+=c.items.map(it=>it.str).join(' ')+'\n';}return{text,numPages:pdf.numPages};}catch(e){throw new Error('Text extraction failed: '+e.message);}}
function wrapText(text,font,size,maxW){const words=text.split(' ');const lines=[];let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w;try{if(font.widthOfTextAtSize(t,size)<=maxW){cur=t;return;}}catch{}if(cur)lines.push(cur);cur=w;});if(cur)lines.push(cur);return lines;}

// TOOLS DEFINITIONS — v6.9.9 Enhanced: all 51 tools with full options
const TOOLS={
  merge:{t:'Merge PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Output Filename</label><input type="text" id="mg-name-${id}" placeholder="merged.pdf" value="merged.pdf"></div><div class="field"><label>Merge Mode</label><select id="mg-mode-${id}"><option value="seq">Sequential (1,2,3…)</option><option value="interleave">Interleave pages (A1,B1,A2…)</option><option value="reverse">Reverse order</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doMerge('${id}')" disabled>Merge &amp; Download</button>${pvUI(id)}${sf(id)}`},
  split:{t:'Split PDF',r:id=>`${dzHTML(id,false,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Mode</label><select id="sm-${id}" onchange="splitModeChange('${id}')"><option value="all">Each page as separate file</option><option value="range">Specific page range</option><option value="every">Every N pages</option><option value="half">Split in half</option></select></div><div class="field" id="sv-wrap-${id}"><label id="sv-lbl-${id}">Value</label><input type="text" id="sv-${id}" placeholder="e.g. 1-5 or 3"></div></div><div class="og"><div class="field"><label>Filename Prefix</label><input type="text" id="sp-pfx-${id}" placeholder="page" value="page"></div><div class="field"><label>Download As</label><select id="sp-dl-${id}"><option value="zip">ZIP archive</option><option value="individual">Individual files</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doSplit('${id}')" disabled>Split &amp; Download</button>${pvUI(id)}${sf(id)}`},
  rotate:{t:'Rotate Pages',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Angle</label><select id="ra-${id}"><option value="90">90° Clockwise ↻</option><option value="180">180° Flip ↕</option><option value="270">90° Counter-clockwise ↺</option></select></div><div class="field"><label>Apply to</label><select id="rm-${id}" onchange="rotModeChange('${id}')"><option value="all">All pages</option><option value="odd">Odd pages only</option><option value="even">Even pages only</option><option value="range">Specific pages</option></select></div></div><div class="field" id="rr-wrap-${id}" style="display:none;margin-top:.2rem"><label>Pages (e.g. 1,3,5-7)</label><input type="text" id="rr-${id}" placeholder="1,3,5-7"></div><button class="btn-p" id="btn-${id}" onclick="doRotate('${id}')" disabled>Rotate &amp; Download</button>${pvUI(id)}${sf(id)}`},
  reorder:{t:'Reorder Pages',r:id=>`${dzHTML(id,false,'.pdf','loadReorder')}<div id="rl-${id}" class="rlist"></div><div class="brow" style="margin-top:.5rem;flex-wrap:wrap;gap:.4rem"><button class="btn-s" onclick="rReverseAll('${id}')">↕ Reverse All</button><button class="btn-s" onclick="rSortAsc('${id}')">↑ Ascending</button><button class="btn-s" onclick="rSortDesc('${id}')">↓ Descending</button></div><button class="btn-p" id="btn-${id}" onclick="doReorder('${id}')" disabled style="margin-top:.6rem">Save Order &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'delete-pages':{t:'Delete Pages',r:id=>`${dzHTML(id,false,'.pdf','loadThumbsSel')}<div id="sel-bar-${id}" class="sel-bar" style="display:none"><span class="sel-count" id="sel-count-${id}">Loading…</span><div class="sel-actions"><button class="sel-btn" onclick="selAll('${id}',true)">Select All</button><button class="sel-btn" onclick="selAll('${id}',false)">Deselect All</button><button class="sel-btn" onclick="selInvert('${id}')">Invert</button></div></div><div id="tg-${id}" class="tg"></div><div class="field" style="margin-top:.7rem"><label>Or delete by range</label><input type="text" id="dp-range-${id}" placeholder="e.g. 2,4,6-8 (leave blank to use selected)"></div><button class="btn-p" id="btn-${id}" onclick="doDeletePages('${id}')" disabled style="margin-top:.6rem">Delete &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'extract-pages':{t:'Extract Pages',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Page Range (e.g. 1-3, 5, 7-9)</label><input type="text" id="ep-${id}" placeholder="e.g. 1-3 or 1,4,7"></div><div class="field"><label>Output Mode</label><select id="ep-mode-${id}"><option value="single">Single combined PDF</option><option value="each">Each page separately</option></select></div></div><div class="field"><label>Output Filename</label><input type="text" id="ep-name-${id}" placeholder="extracted.pdf" value="extracted.pdf"></div><button class="btn-p" id="btn-${id}" onclick="doExtractPages('${id}')" disabled>Extract &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'pdf-to-jpg':{t:'PDF to JPG',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Format</label><select id="pjfmt-${id}"><option value="jpeg">JPEG (smaller)</option><option value="png">PNG (lossless)</option><option value="webp">WebP (modern)</option></select></div><div class="field"><label>Resolution</label><select id="pjs-${id}"><option value="1.0">72 dpi — Screen</option><option value="1.5">150 dpi — Web</option><option value="2" selected>144 dpi — High</option><option value="3.0">216 dpi — Print</option><option value="4.0">300 dpi — Ultra</option></select></div><div class="field"><label>JPEG Quality</label><select id="pjq-${id}"><option value="0.7">70% — Compact</option><option value="0.85" selected>85% — Balanced</option><option value="0.95">95% — High</option><option value="1.0">100% — Max</option></select></div><div class="field"><label>Pages</label><select id="pjm-${id}" onchange="pjModeChange('${id}')"><option value="all">All pages</option><option value="range">Specific range</option></select></div></div><div class="field" id="pjr-wrap-${id}" style="display:none"><label>Range (e.g. 1-3,5)</label><input type="text" id="pjr-${id}" placeholder="e.g. 1-3,5"></div><button class="btn-p" id="btn-${id}" onclick="doPdfToJpg('${id}')" disabled>Convert &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'jpg-to-pdf':{t:'Image to PDF',r:id=>`${dzHTML(id,true,'image/*,.jpg,.jpeg,.png,.webp')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Page Size</label><select id="is-${id}"><option value="fit">Fit to image</option><option value="a4">A4 (210×297mm)</option><option value="letter">US Letter</option><option value="a3">A3</option><option value="a5">A5</option></select></div><div class="field"><label>Orientation</label><select id="io-${id}"><option value="auto">Auto-detect</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div><div class="field"><label>Margin (pt)</label><input type="number" id="im-${id}" value="20" min="0" max="120"></div><div class="field"><label>Image Fit</label><select id="ifit-${id}"><option value="contain">Contain (keep ratio)</option><option value="stretch">Stretch to fill</option><option value="center">Center, no scale</option></select></div></div><div class="field"><label>PDF Title (optional)</label><input type="text" id="ititl-${id}" placeholder="My Document"></div><button class="btn-p" id="btn-${id}" onclick="doImgToPdf('${id}')" disabled>Convert &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'extract-text':{t:'PDF to Text',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.7rem"><div class="field"><label>Output Mode</label><select id="et-mode-${id}"><option value="combined">All pages combined</option><option value="pages">Per-page sections</option></select></div><div class="field"><label>Line Separator</label><select id="et-sep-${id}"><option value="\n">Newline</option><option value="\n\n">Double newline</option><option value=" ">Space (flow text)</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doExtractText('${id}')" disabled>Extract Text</button><div id="etA-${id}" class="brow" style="display:none;margin-top:.6rem;flex-wrap:wrap;gap:.35rem"><button class="btn-s" onclick="copyText(document.getElementById('etR-${id}').value)">📋 Copy All</button><button class="btn-s" onclick="dlTxt('${id}')">⬇ Save .txt</button><button class="btn-s" onclick="(function(){var t=document.getElementById('etR-${id}').value;var b=new Blob([t],{type:'text/plain'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='extracted.txt';a.click();})()">⬇ Download</button></div><textarea id="etR-${id}" style="display:none;margin-top:.6rem;width:100%;min-height:180px;font-family:monospace;font-size:.78rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.7rem;resize:vertical;color:var(--tx)" readonly placeholder="Extracted text appears here…"></textarea>${pvUI(id)}${sf(id)}`},
  compress:{t:'Compress PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="field" style="margin-top:.9rem"><div style="display:flex;justify-content:space-between;align-items:center"><label style="margin:0">Quality</label><span id="cqlbl-${id}" style="color:var(--ac);font-weight:700;font-size:.82rem">High (82%)</span></div><input type="range" id="cq-${id}" min="0.3" max="1" step="0.05" value="0.82" aria-label="Compression quality" aria-valuetext="High quality 82%" style="width:100%;accent-color:var(--ac)" oninput="var v=parseFloat(this.value);var lbl=v>=0.9?'Max':v>=0.75?'High':v>=0.55?'Medium':'Low';var hint=v>=0.9?'Best for print & archive':v>=0.75?'Good for email & web':v>=0.55?'Smaller — some quality loss':'Smallest — significant quality loss';document.getElementById('cqlbl-${id}').textContent=lbl+' ('+(v*100).toFixed(0)+'%)';this.setAttribute('aria-valuetext',lbl+' quality '+(v*100).toFixed(0)+'%');var h=document.getElementById('cqhint-${id}');if(h)h.textContent=hint;"><div id="cqhint-${id}" style="font-size:.68rem;color:var(--tx3);margin-top:3px;min-height:1em">Good for email &amp; web</div><div id="cqtb-${id}" style="display:none;margin:.4rem 0"><div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap"><label style="font-size:.75rem;font-weight:600;color:var(--tx2)">Target size:</label><input type="number" id="cqtargkb-${id}" placeholder="e.g. 500" min="50" max="50000" style="width:80px;font-size:.82rem;padding:4px 8px;border:1.5px solid var(--bd);border-radius:6px;background:var(--bg);color:var(--tx)" oninput="cqSetTargetLabel('${id}',this.value)"><span style="font-size:.78rem;color:var(--tx3)">KB</span><span id="cqtarglbl-${id}" style="font-size:.72rem;color:var(--tx3);font-style:italic"></span></div></div><label style="display:flex;align-items:center;gap:.35rem;font-size:.74rem;color:var(--tx2);cursor:pointer;margin-bottom:.4rem"><input type="checkbox" id="cqtarget-${id}" style="width:13px;height:13px" onchange="var tb=document.getElementById('cqtb-${id}');if(tb)tb.style.display=this.checked?'block':'none'"> Use target file size instead of quality slider</label></div><div class="og" style="margin-top:.7rem"><div class="field"><label>Compress Images</label><select id="cq-img-${id}"><option value="yes" selected>Yes — re-render pages as images</option><option value="no">No — metadata optimisation only</option></select></div><div class="field"><label>Also Remove</label><select id="cq-rm-${id}"><option value="none">Nothing extra</option><option value="meta">Embedded metadata</option><option value="annots">Annotations</option><option value="all">Metadata + Annotations</option></select></div></div><div class='cq-warn' id='cq-warn-${id}' style='display:none'>⚠️ Re-rendering pages as images — text becomes non-selectable.</div><div style="margin-top:.85rem;padding:.65rem .8rem;background:linear-gradient(135deg,rgba(255,153,0,.08),rgba(19,136,8,.06));border:1px solid rgba(255,153,0,.25);border-radius:var(--rs);display:flex;align-items:center;gap:.6rem;flex-wrap:wrap"><span style="font-size:.95rem">🇮🇳</span><div style="flex:1;min-width:0"><div style="font-size:.75rem;font-weight:700;color:var(--tx)">Aadhaar / PAN / Govt Portal Preset</div><div style="font-size:.7rem;color:var(--tx3)">Sets quality to 40% — compresses to under 2MB for UIDAI &amp; government uploads</div></div><button onclick="(function(){var q=document.getElementById('cq-${id}');if(q){q.value='0.4';var e=new Event('input');q.dispatchEvent(e);}var img=document.getElementById('cq-img-${id}');if(img)img.value='yes';})()" style="flex-shrink:0;background:#ff9900;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:.72rem;font-weight:700;cursor:pointer;white-space:nowrap">Apply Preset</button></div><button class="btn-p" id="btn-${id}" onclick="doCompress('${id}')" disabled>Compress &amp; Download</button>${pvUI(id)}${sf(id)}`},
  watermark:{t:'Add Watermark',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Watermark Text</label><input type="text" id="wt-${id}" value="CONFIDENTIAL" placeholder="CONFIDENTIAL" maxlength="200"></div><div class="field"><label>Color</label><input type="color" id="wc-${id}" value="#cc0000"></div><div class="field"><label>Opacity — <span id="wov-${id}">0.20</span></label><input type="range" min=".05" max=".9" step=".05" value=".2" id="wo-${id}" oninput="document.getElementById('wov-${id}').textContent=parseFloat(this.value).toFixed(2)"></div><div class="field"><label>Font Size (pt)</label><input type="number" id="ws-${id}" value="60" min="10" max="300"></div><div class="field"><label>Position</label><select id="wp-${id}"><option value="center">Center diagonal</option><option value="top">Top center</option><option value="bottom">Bottom center</option><option value="tiled">Tiled (repeat)</option></select></div><div class="field"><label>Rotation (°)</label><input type="number" id="wa-${id}" value="35" min="-180" max="180"></div><div class="field"><label>Apply to</label><select id="wpa-${id}"><option value="all">All pages</option><option value="first">First page only</option><option value="last">Last page only</option><option value="odd">Odd pages</option><option value="even">Even pages</option></select></div><div class="field"><label>Layer</label><select id="wlyr-${id}"><option value="over">Over content</option><option value="under">Under content</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doWatermark('${id}')" disabled>Apply &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'page-numbers':{t:'Add Page Numbers',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Position</label><select id="pp-${id}"><option value="bottom-center">Bottom Center</option><option value="bottom-right">Bottom Right</option><option value="bottom-left">Bottom Left</option><option value="top-center">Top Center</option><option value="top-right">Top Right</option><option value="top-left">Top Left</option></select></div><div class="field"><label>Format</label><select id="pfm-${id}" onchange="document.getElementById('pn-custom-${id}').style.display=this.value==='custom'?'grid':'none'"><option value="n">1, 2, 3…</option><option value="pn">Page 1 of N</option><option value="dash">— 1 —</option><option value="custom">Custom prefix/suffix</option></select></div><div class="field"><label>Start Number</label><input type="number" id="ps-${id}" value="1" min="0"></div><div class="field"><label>Skip First N Pages</label><input type="number" id="psk-${id}" value="0" min="0" title="e.g. skip cover page"></div><div class="field"><label>Font Size (pt)</label><input type="number" id="pfs-${id}" value="11" min="6" max="36"></div><div class="field"><label>Color</label><input type="color" id="pc-${id}" value="#333333"></div></div><div class="og" id="pn-custom-${id}" style="display:none"><div class="field"><label>Prefix text</label><input type="text" id="pnpfx-${id}" placeholder="Page "></div><div class="field"><label>Suffix text</label><input type="text" id="pnsfx-${id}" placeholder=""></div></div><button class="btn-p" id="btn-${id}" onclick="doPageNums('${id}')" disabled>Add Numbers &amp; Download</button>${pvUI(id)}${sf(id)}`},
  resize:{t:'Resize Pages',r:id=>`${dzHTML(id,false,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Target Size</label><select id="rss-${id}" onchange="togCust('${id}')"><option value="a4">A4 (210×297mm)</option><option value="letter">US Letter (8.5×11")</option><option value="a3">A3 (297×420mm)</option><option value="a5">A5 (148×210mm)</option><option value="legal">Legal (8.5×14")</option><option value="b5">B5 (176×250mm)</option><option value="custom">Custom (mm)</option></select></div><div class="field"><label>Orientation</label><select id="rso-${id}"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div><div class="field"><label>Content Scaling</label><select id="rssc-${id}"><option value="fit">Scale to fit page</option><option value="keep">Keep original size</option><option value="fill">Fill page (may crop)</option></select></div></div><div class="og" id="rsc-wrap-${id}" style="display:none"><div class="field" id="rsw-${id}"><label>Width (mm)</label><input type="number" id="rswv-${id}" value="210" min="1"></div><div class="field" id="rsh-${id}"><label>Height (mm)</label><input type="number" id="rshv-${id}" value="297" min="1"></div></div><button class="btn-p" id="btn-${id}" onclick="doResize('${id}')" disabled>Resize &amp; Download</button>${pvUI(id)}${sf(id)}`},
  grayscale:{t:'Grayscale PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Color Mode</label><select id="gs-mode-${id}"><option value="gray">Grayscale (black &amp; white)</option><option value="sepia">Sepia (warm vintage)</option></select></div><div class="field"><label>Render Quality</label><select id="gs-${id}"><option value="1">Normal — faster</option><option value="2" selected>High quality</option><option value="3">Ultra — best output</option></select></div></div><div class="smsg warn show" style="margin-top:.7rem">Pages are re-rendered as images. Text will not be selectable in the output. Batch: drop multiple PDFs.</div><button class="btn-p" id="btn-${id}" onclick="doGrayscale('${id}')" disabled>Convert &amp; Download</button>${pvUI(id)}${sf(id)}`},
  protect:{t:'Protect PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Password</label><div style="position:relative"><input type="password" id="pp1-${id}" placeholder="Enter password" autocomplete="new-password" oninput="pwStrength('${id}',this.value)" style="padding-right:2.4rem"><button type="button" onclick="var i=document.getElementById('pp1-${id}');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'👁':'🔒'" style="position:absolute;right:.5rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:.85rem;color:var(--tx3)" aria-label="Toggle password visibility">👁</button></div><div style="margin-top:3px;height:3px;border-radius:2px;background:var(--bd);overflow:hidden"><div id="pwsb-${id}" style="height:100%;width:0;border-radius:2px;transition:width .3s,background .3s"></div></div><div id="pwsl-${id}" style="font-size:.65rem;color:var(--tx3);min-height:.9em"></div></div><div class="field"><label>Confirm Password</label><input type="password" id="pp2-${id}" placeholder="Confirm password" autocomplete="new-password"></div></div><div style="margin:.7rem 0 .4rem;font-size:.72rem;font-weight:700;color:var(--tx2)">Permissions (what can be done without owner password):</div><div class="og" style="grid-template-columns:1fr 1fr;gap:.4rem"><label style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;cursor:pointer"><input type="checkbox" id="perm-print-${id}" checked> Allow printing</label><label style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;cursor:pointer"><input type="checkbox" id="perm-copy-${id}"> Allow copying text</label><label style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;cursor:pointer"><input type="checkbox" id="perm-annot-${id}" checked> Allow annotations</label><label style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;cursor:pointer"><input type="checkbox" id="perm-fill-${id}" checked> Allow form filling</label></div><div class="smsg inf show" style="margin-top:.7rem">🔒 Applies AES-128 encryption — your PDF will require a password to open. Note: AES-128 is standard browser-side encryption; for AES-256 use Adobe Acrobat.</div><button class="btn-p" id="btn-${id}" onclick="doProtect('${id}')" disabled>Encrypt &amp; Download</button>${pvUI(id)}${sf(id)}`},
  unlock:{t:'Unlock PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="field" style="margin-top:.9rem"><label>Password (if password-protected)</label><input type="password" id="up-${id}" placeholder="Leave blank to try without password" autocomplete="current-password"></div><div class="smsg inf show" style="margin-top:.5rem">Removes encryption and copy/print restrictions. Supports batch — drop multiple PDFs at once.</div><button class="btn-p" id="btn-${id}" onclick="doUnlock('${id}')" disabled>Unlock &amp; Download</button>${pvUI(id)}${sf(id)}`},
  sign:{t:'Sign PDF',r:id=>`${dzHTML(id,false,'.pdf,application/pdf')}<div style="margin-top:.9rem"><div class="brow" style="margin-bottom:.6rem"><button class="btn-s stab" id="stab-draw-${id}" style="background:var(--ac);color:#fff;border-color:var(--ac)" onclick="sigSetTab('${id}','draw')">✍ Draw</button><button class="btn-s stab" id="stab-type-${id}" onclick="sigSetTab('${id}','type')">⌨ Type</button><button class="btn-s stab" id="stab-upload-${id}" onclick="sigSetTab('${id}','upload')">🖼 Upload</button></div><div id="sig-draw-panel-${id}"><div class="sigwrap"><canvas id="sigC-${id}" height="140"></canvas><div class="sigph" id="sigPH-${id}">✍ Sign here with mouse or finger</div></div><div class="brow" style="margin-top:.5rem"><button class="btn-s" onclick="clearSig('${id}')">Clear</button><button class="btn-s" onclick="saveSigToStorage('${id}')" title="Save for next time">💾 Save</button><div class="field" style="flex:1;margin:0"><input type="color" id="sc-${id}" value="#00008b" title="Pen color" style="height:36px"></div><div class="field" style="flex:1;margin:0"><label style="font-size:.68rem">Pen width</label><input type="range" id="sw-${id}" min="1" max="6" value="2.5" step="0.5" style="accent-color:var(--ac)"></div></div></div><div id="sig-type-panel-${id}" style="display:none"><div class="field"><label>Type your name</label><input type="text" id="sigT-${id}" placeholder="Your Name" oninput="sigPreview('${id}')" style="font-size:1.3rem;font-family:Georgia,serif"></div></div><div id="sig-upload-panel-${id}" style="display:none"><div class="field"><label>Upload signature image (PNG transparent bg recommended)</label><input type="file" accept="image/*" id="sigImg-${id}" onchange="sigLoadImg('${id}',this)"></div><canvas id="sigIC-${id}" height="100" style="display:none;max-width:100%;border:1px solid var(--bd);border-radius:6px;margin-top:.3rem"></canvas></div></div><div class="og" style="margin-top:.7rem"><div class="field"><label>Apply to</label><select id="sp-${id}"><option value="last">Last page</option><option value="first">First page</option><option value="all">All pages</option></select></div><div class="field"><label>Position</label><select id="spos-${id}"><option value="br">Bottom Right</option><option value="bl">Bottom Left</option><option value="bc">Bottom Center</option><option value="tr">Top Right</option></select></div><div class="field"><label>Signature Width (pt)</label><input type="number" id="ssz-${id}" value="180" min="40" max="400"></div><div class="field"><label>Date Stamp</label><select id="sdate-${id}"><option value="no">None</option><option value="below">Below signature</option><option value="right">Right of signature</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doSign('${id}')" disabled>Sign &amp; Download</button>${pvUI(id)}${sf(id)}`,init:id=>initSig(id)},
  flatten:{t:'Flatten PDF',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="smsg inf show" style="margin-top:.7rem">Merges form fields, annotations and comments permanently into page content — making them uneditable. Ideal before sharing or printing.</div><div class="og" style="margin-top:.7rem"><div class="field"><label>Flatten</label><select id="fl-mode-${id}"><option value="all">Everything (forms + annotations)</option><option value="forms">Form fields only</option><option value="annots">Annotations only</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doFlatten('${id}')" disabled>Flatten &amp; Download</button>${pvUI(id)}${sf(id)}`},
  metadata:{t:'Edit Metadata',r:id=>`${dzHTML(id,false,'.pdf','loadMeta')}<div id="metapanel-${id}" style="display:none"><div class="og" style="margin-top:.9rem"><div class="field"><label>Title</label><input type="text" id="mti-${id}" placeholder="Document title"></div><div class="field"><label>Author</label><input type="text" id="mau-${id}" placeholder="Author name"></div><div class="field"><label>Subject</label><input type="text" id="msu-${id}" placeholder="Document subject"></div><div class="field"><label>Keywords</label><input type="text" id="mke-${id}" placeholder="keyword1, keyword2…"></div><div class="field"><label>Creator App</label><input type="text" id="mcr-${id}" placeholder="Application name"></div><div class="field"><label>Producer</label><input type="text" id="mpr-${id}" placeholder="PDF producer"></div></div><div class="brow" style="margin-top:.6rem"><button class="btn-s" onclick="['mti','mau','msu','mke','mcr','mpr'].forEach(function(f){var el=document.getElementById(f+'-'+'${id}');if(el)el.value='';})">✕ Clear All Fields</button></div><button class="btn-p" id="btn-${id}" onclick="doMetadata('${id}')">Save Metadata &amp; Download</button></div>${pvUI(id)}${sf(id)}`},
  'word-count':{t:'Word Count & Stats',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="og" style="margin-top:.7rem"><div class="field"><label>Analysis Depth</label><select id="wc-depth-${id}"><option value="basic">Basic (words, chars, pages)</option><option value="full" selected>Full (reading time, top words, sentences)</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doWordCount('${id}')" disabled>Analyze Document</button><div id="wcR-${id}" style="margin-top:.8rem"></div>${pvUI(id)}${sf(id)}`},
  compare:{t:'Compare Two PDFs',r:id=>`<div class="cmpcols"><div><div style="font-size:.67rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;font-family:'JetBrains Mono',monospace;margin-bottom:.45rem">PDF 1 — Original</div><div class="cmp-dz" id="cmp-a-${id}" ondragover="dzO(event,'cmp-a-${id}')" ondragleave="dzL('cmp-a-${id}',event)" ondrop="cmpDrop(event,'${id}','a')"><input type="file" accept=".pdf" onchange="cmpLoad(event,'${id}','a')"><div style="font-size:1.4rem;pointer-events:none">📄</div><div style="font-size:.74rem;color:var(--tx2);margin-top:.28rem;pointer-events:none">Drop or click</div></div><div class="cmp-name" id="cn-${id}-a"></div></div><div><div style="font-size:.67rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;font-family:'JetBrains Mono',monospace;margin-bottom:.45rem">PDF 2 — Modified</div><div class="cmp-dz" id="cmp-b-${id}" ondragover="dzO(event,'cmp-b-${id}')" ondragleave="dzL('cmp-b-${id}',event)" ondrop="cmpDrop(event,'${id}','b')"><input type="file" accept=".pdf" onchange="cmpLoad(event,'${id}','b')"><div style="font-size:1.4rem;pointer-events:none">📄</div><div style="font-size:.74rem;color:var(--tx2);margin-top:.28rem;pointer-events:none">Drop or click</div></div><div class="cmp-name" id="cn-${id}-b"></div></div></div><div class="og" style="margin-top:.8rem"><div class="field"><label>Compare By</label><select id="cmp-mode-${id}"><option value="words">Word similarity (fast)</option><option value="sentences">Sentence-level diff</option><option value="chars">Character-level (detailed)</option></select></div><div class="field"><label>Ignore</label><select id="cmp-ign-${id}"><option value="none">Nothing</option><option value="case">Case differences</option><option value="ws">Whitespace</option><option value="both">Case + Whitespace</option></select></div></div><button class="btn-p" id="btn-${id}" onclick="doCompare('${id}')" disabled style="margin-top:.9rem">Compare Documents</button><div id="cmpR-${id}" style="margin-top:.7rem"></div>${pvUI(id)}${sf(id)}`},
  thumbnail:{t:'Page Thumbnails',r:id=>`${dzHTML(id,false,'.pdf','loadThumbsOnly')}<div class="og" style="margin-top:.7rem"><div class="field"><label>Export Format</label><select id="tn-fmt-${id}"><option value="jpeg" selected>JPEG (smaller)</option><option value="png">PNG (lossless)</option></select></div><div class="field"><label>Thumbnail Size</label><select id="tn-sz-${id}"><option value="0.5">Small (72dpi)</option><option value="1.0">Medium (144dpi)</option><option value="1.5" selected>Large (216dpi)</option><option value="2.0">XL (288dpi)</option></select></div><div class="field"><label>JPEG Quality</label><select id="tn-q-${id}"><option value="0.75">75% — Compact</option><option value="0.92" selected>92% — Balanced</option><option value="1.0">100% — Maximum</option></select></div></div><div id="tg-${id}" class="tg"></div><div class="brow" style="margin-top:.5rem;flex-wrap:wrap;gap:.4rem"><button class="btn-p" id="btn-${id}" onclick="doThumbnail('${id}')" disabled>⬇ Download All</button><button class="btn-s" id="btn-pg-${id}" onclick="doThumbnailPage('${id}')" disabled style="display:none">⬇ Selected Only</button></div>${pvUI(id)}${sf(id)}`},
  'blank-pdf':{t:'Create Blank PDF',r:id=>`<div class="og" style="margin-top:.25rem"><div class="field"><label>Page Size</label><select id="bps-${id}"><option value="a4">A4 (210×297mm)</option><option value="letter">US Letter</option><option value="a3">A3</option><option value="a5">A5</option><option value="legal">Legal</option><option value="b5">B5</option></select></div><div class="field"><label>Orientation</label><select id="bpo-${id}"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div><div class="field"><label>Number of Pages</label><input type="number" id="bpp-${id}" value="1" min="1" max="500"></div><div class="field"><label>Background Color</label><input type="color" id="bpb-${id}" value="#ffffff"></div><div class="field"><label>Ruling / Grid</label><select id="bpgrid-${id}"><option value="none">Blank</option><option value="lined">Lined (ruled)</option><option value="grid">Grid</option><option value="dot">Dot grid</option></select></div><div class="field"><label>Rule/Grid Color</label><input type="color" id="bplc-${id}" value="#cccccc"></div></div><button class="btn-p" style="margin-top:.9rem" onclick="doBlankPdf('${id}')">Generate &amp; Download</button>${pvUI(id)}${sf(id)}`},
  'markdown-to-pdf':{t:'Markdown → PDF',r:id=>`<div class="md-editor" id="mde-${id}"><div class="md-toolbar"><span class="md-tool-lbl">Markdown Editor</span><div class="md-tools"><button class="md-tb-btn" title="Bold" onclick="mdWrap('${id}','**','**')"><b>B</b></button><button class="md-tb-btn" title="Italic" onclick="mdWrap('${id}','*','*')"><i>I</i></button><button class="md-tb-btn" title="Heading" onclick="mdInsert('${id}','## ')">H</button><button class="md-tb-btn" title="Link" onclick="mdWrap('${id}','[','](url)')">🔗</button><button class="md-tb-btn" title="Code" onclick="mdWrapCode('${id}')">⌨</button><button class="md-tb-btn" title="Bullet" onclick="mdInsert('${id}','- ')">≡</button><button class="md-tb-btn" title="Numbered list" onclick="mdInsert('${id}','1. ')">①</button><button class="md-tb-btn" title="Table" onclick="mdInsert('${id}','| Col1 | Col2 |\n| --- | --- |\n| A | B |\n')">⊞</button><div class="md-sep"></div><button class="md-tb-btn md-view-btn active" id="mdv-edit-${id}" onclick="mdSetView('${id}','edit')" title="Editor">✏️</button><button class="md-tb-btn md-view-btn" id="mdv-split-${id}" onclick="mdSetView('${id}','split')" title="Split">⬛⬜</button><button class="md-tb-btn md-view-btn" id="mdv-prev-${id}" onclick="mdSetView('${id}','preview')" title="Preview">👁</button></div></div><div class="md-panes" id="mdp-${id}" data-view="edit"><textarea class="md-raw" id="mdi-${id}" spellcheck="false" oninput="mdPreview('${id}')"># Hello from Dublesh\n\nThis is **bold** and *italic* text.\n\n## Features\n\n- 100% private — zero uploads\n- Works on all devices\n- Always free\n\n> Your documents stay on your device.</textarea><div class="md-preview" id="mdpv-${id}"></div></div></div><div class="og" style="margin-top:.7rem"><div class="field"><label>Page Size</label><select id="mds-${id}"><option value="a4">A4</option><option value="letter">US Letter</option><option value="a5">A5</option></select></div><div class="field"><label>Base Font Size (pt)</label><input type="number" id="mdfs-${id}" value="12" min="8" max="24"></div><div class="field"><label>Margin (pt)</label><input type="number" id="mdmg-${id}" value="50" min="10" max="120"></div><div class="field"><label>Theme</label><select id="mdtheme-${id}"><option value="default">Default</option><option value="modern">Modern (accent headings)</option><option value="minimal">Minimal (compact)</option></select></div></div><button class="btn-p" style="margin-top:.9rem" onclick="doMarkdown('${id}')">Export as PDF</button>${pvUI(id)}${sf(id)}`,init:id=>{mdPreview(id);}},
  'html-to-pdf':{t:'HTML → PDF',r:id=>`<div class="field"><label>HTML Content</label><textarea id="hti-${id}" rows="10">&lt;h1 style="color:#e8412a;font-family:sans-serif"&gt;Hello from Dublesh&lt;/h1&gt;\n&lt;p style="font-family:sans-serif;line-height:1.6"&gt;This is &lt;strong&gt;bold&lt;/strong&gt; and &lt;em&gt;italic&lt;/em&gt;.&lt;/p&gt;\n&lt;ul style="font-family:sans-serif"&gt;\n  &lt;li&gt;Zero uploads&lt;/li&gt;\n  &lt;li&gt;Always free&lt;/li&gt;\n&lt;/ul&gt;</textarea></div><div class="og" style="margin-top:.7rem"><div class="field"><label>Page Size</label><select id="ht-sz-${id}"><option value="a4">A4</option><option value="letter">US Letter</option><option value="a5">A5</option></select></div><div class="field"><label>Margin (pt)</label><input type="number" id="ht-mg-${id}" value="40" min="0" max="120"></div><div class="field"><label>Base Font Size (pt)</label><input type="number" id="ht-fs-${id}" value="11" min="6" max="24"></div></div><button class="btn-p" style="margin-top:.9rem" onclick="doHtmlToPdf('${id}')">Export as PDF</button>${pvUI(id)}${sf(id)}`},
  pdftoword:{t:'PDF to Word',cat:'convert',r:id=>`${dzHTML(id,true,'.pdf,application/pdf')}<div class="smsg warn show" style="margin:.6rem 0 .4rem;line-height:1.5">⚠️ <strong>Text extraction only:</strong> Outputs a .doc (RTF) file with plain text. Images, tables, columns, and complex formatting are not preserved.</div><button class="btn-p" id="btn-${id}" onclick="doPdfToWord('${id}')" disabled style="margin-top:.4rem">Extract Text &amp; Download .doc</button>${pvUI(id)}${sf(id)}`},
  pdftoexcel:{t:'PDF to Excel',cat:'convert',r:id=>`${dzHTML(id,false,'.pdf','pxShowPreview')}<div class="og" style="margin-top:.9rem"><div class="field"><label>Delimiter</label><select id="pxd-${id}"><option value="," selected>Comma (CSV)</option><option value="&#9;">Tab (TSV)</option><option value=";">Semicolon</option></select></div><div class="field"><label>Header Row</label><select id="pxh-${id}"><option value="auto" selected>Auto-detect</option><option value="yes">First row is header</option><option value="no">No header</option></select></div><div class="field" style="flex-direction:row;align-items:center;gap:.5rem;padding-top:.8rem"><input type="checkbox" id="pxz-${id}" style="width:auto;margin:0"><label for="pxz-${id}" style="margin:0;font-weight:400">One CSV per page (ZIP)</label></div></div><button class="btn-s" id="pxprev-${id}" style="display:none;margin-top:.5rem" onclick="pxShowPreview('${id}')">👁 Preview Table</button><button class="btn-p" id="btn-${id}" onclick="doPdfToExcel('${id}')" disabled style="margin-top:.6rem">Extract &amp; Download CSV</button><div id="pxpanel-${id}" style="display:none;margin-top:.8rem"><div id="pxnav-${id}" style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;flex-wrap:wrap"></div><div id="pxtable-${id}" class="pxtable-wrap" style="overflow-x:auto;max-height:280px;border:1px solid var(--bd);border-radius:8px;font-size:.72rem"></div></div>${sf(id)}`},
  redact:{t:'Redact PDF',cat:'edit',r:id=>`${dzHTML(id,false,'.pdf','initRedact')}<div class="smsg warn show" style="margin-top:.7rem;line-height:1.5">⚠️ <strong>Visual redaction only:</strong> This draws black boxes over content. The underlying text in the PDF stream is <strong>not removed</strong>. For sensitive documents requiring legal-grade redaction, use Adobe Acrobat Pro.</div><div id="rdui-${id}" style="display:none;margin-top:.8rem"><p style="font-size:.78rem;color:var(--tx2);margin:0 0 .5rem;line-height:1.5">Draw boxes over areas to black out. Use arrows to switch pages.</p><div class="brow" style="margin-bottom:.5rem;flex-wrap:wrap;gap:.35rem"><button class="btn-s" onclick="RD['${id}'].pg=Math.max(1,RD['${id}'].pg-1);rdRender('${id}')">&#9664; Prev</button><span id="rdpg-${id}" style="font-size:.8rem;color:var(--tx2)">Page 1</span><button class="btn-s" onclick="RD['${id}'].pg=Math.min(RD['${id}'].pdf.numPages,RD['${id}'].pg+1);rdRender('${id}')">Next &#9654;</button><button class="btn-s" style="color:var(--ac)" onclick="rdClear('${id}')">Clear Page</button><button class="btn-s" onclick="RD['${id}'].boxes={};rdRender('${id}')">Clear All</button></div><div style="position:relative;display:inline-block;border:1px solid var(--bd);border-radius:8px;overflow:hidden;max-width:100%"><canvas id="rdC-${id}" style="display:block;max-width:100%;cursor:crosshair"></canvas><canvas id="rdO-${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair"></canvas></div></div><button class="btn-p" id="btn-${id}" onclick="doRedact('${id}')" disabled style="margin-top:.8rem">Apply Redactions &amp; Download</button>${sf(id)}`},
  formbuilder:{t:'PDF Form Builder',cat:'create',r:id=>`${dzHTML(id,false,'.pdf','initFormBuilder')}<div id="fbui-${id}" style="display:none;margin-top:.8rem"><div class="brow" style="margin-bottom:.5rem;flex-wrap:wrap;gap:.4rem"><span style="font-size:.75rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.05em">Add field:</span><button class="btn-s" onclick="FB['${id}'].tool='text';fbSetActive('${id}','text',this)" style="background:var(--ac);color:#fff;border-color:var(--ac)" id="fbt-text-${id}">✏ Text</button><button class="btn-s" onclick="FB['${id}'].tool='checkbox';fbSetActive('${id}','checkbox',this)" id="fbt-checkbox-${id}">☑ Checkbox</button><button class="btn-s" onclick="FB['${id}'].tool='drop';fbSetActive('${id}','drop',this)" id="fbt-drop-${id}">▾ Dropdown</button><button class="btn-s" onclick="FB['${id}'].pg=Math.max(1,FB['${id}'].pg-1);fbRender('${id}')">&#9664;</button><span id="fbpg-${id}" style="font-size:.8rem;color:var(--tx2)">Pg 1</span><button class="btn-s" onclick="FB['${id}'].pg=Math.min(FB['${id}'].pdf.numPages,FB['${id}'].pg+1);fbRender('${id}')">&#9654;</button><button class="btn-s" style="color:var(--ac)" onclick="fbDel('${id}')">🗑 Delete</button></div><div style="position:relative;display:inline-block;border:1px solid var(--bd);border-radius:8px;overflow:hidden;max-width:100%"><canvas id="fbc-${id}" style="display:block;max-width:100%"></canvas><div id="fbfields-${id}" style="position:absolute;inset:0"></div></div><p style="font-size:.75rem;color:var(--tx3);margin:.4rem 0 0">Click on the PDF preview to place a field. Click placed field to select, click again to delete.</p></div><button class="btn-p" id="btn-${id}" onclick="doFormBuilder('${id}')" disabled style="margin-top:.8rem">Export Fillable PDF</button>${sf(id)}`,init:function(id){initFormBuilder(id);}},
  aisummarize:{t:'AI Summarize',cat:'ai',r:id=>`<div class="field"><label>Anthropic API Key <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(free to get — takes 60 seconds)</span></label><input type="password" id="aikey-${id}" placeholder="sk-ant-…" oninput="saveAiKey(this.value)" autocomplete="off"><span style="font-size:.72rem;color:var(--tx3)">Saved locally · never sent to Dublesh servers</span><details style="margin-top:.55rem"><summary style="font-size:.74rem;font-weight:700;color:var(--ac);cursor:pointer;user-select:none;list-style:none;display:flex;align-items:center;gap:.3rem">▶ Don't have a key? Get one free in 60 seconds</summary><div style="margin-top:.55rem;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.75rem .9rem;font-size:.78rem;color:var(--tx2);line-height:1.6"><div style="font-weight:700;color:var(--green);margin-bottom:.45rem">✨ New accounts get free API credits — enough for ~2,000 PDF summaries</div><ol style="margin:0;padding-left:1.25rem;display:flex;flex-direction:column;gap:.3rem"><li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style="color:var(--ac);font-weight:600">console.anthropic.com</a> and create a free account</li><li>Click <strong>API Keys</strong> in the left sidebar</li><li>Click <strong>Create Key</strong>, give it any name, copy it</li><li>Paste it into the field above and you're ready</li></ol><div style="margin-top:.45rem;font-size:.72rem;color:var(--tx3)">Your key is stored in your browser only — Dublesh never sees it.</div></div></details></div><div class="field"><label>Summary Style</label><select id="aifocus-${id}"><option value="">Balanced overview</option><option value="bullet">3 key bullet points</option><option value="executive">Executive summary</option><option value="detailed">Detailed analysis</option><option value="simple">Plain language (ELI5)</option><option value="legal">Legal/technical summary</option></select></div>${dzHTML(id,true,'.pdf,application/pdf')}<button class="btn-p" id="btn-${id}" onclick="doAiSummarize('${id}')" disabled style="margin-top:.6rem">Summarize with AI</button><div id="aiR-${id}" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem 1rem;font-size:.85rem;line-height:1.65;white-space:pre-wrap;max-height:320px;overflow-y:auto"></div>${sf(id)}`},
  aiqa:{t:'AI Q&A',cat:'ai',r:id=>`<div class="field"><label>Anthropic API Key <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(free — 60 sec)</span></label><input type="password" id="aikey-${id}" placeholder="sk-ant-…" oninput="saveAiKey(this.value)" autocomplete="off"><span style="font-size:.72rem;color:var(--tx3)">Saved locally · never sent to Dublesh</span><details style="margin-top:.5rem"><summary style="font-size:.74rem;font-weight:700;color:var(--ac);cursor:pointer;list-style:none;user-select:none">▶ Don't have a key? Get one free in 60 seconds</summary><div style="margin-top:.5rem;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.7rem .85rem;font-size:.77rem;color:var(--tx2);line-height:1.6"><div style="font-weight:700;color:var(--green);margin-bottom:.35rem">✨ New accounts get free API credits</div><ol style="margin:0;padding-left:1.2rem;display:flex;flex-direction:column;gap:.25rem"><li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style="color:var(--ac);font-weight:600">console.anthropic.com</a> → create free account</li><li>Click <strong>API Keys</strong> → <strong>Create Key</strong></li><li>Copy the key and paste it above</li></ol></div></details></div>${dzHTML(id,true,'.pdf,application/pdf')}<div class="field" style="margin-top:.6rem"><label>Your Question</label><input type="text" id="aiQ-${id}" placeholder="What is the main conclusion of this document?"></div><div class="field"><label>Answer Style</label><select id="aiQstyle-${id}"><option value="concise">Concise answer</option><option value="detailed">Detailed explanation</option><option value="bullets">Bullet points</option><option value="quote">Quote from document + explanation</option></select></div><button class="btn-p" id="btn-${id}" onclick="doAiQa('${id}')" disabled style="margin-top:.6rem">Ask AI</button><div id="aiR-${id}" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem 1rem;font-size:.85rem;line-height:1.65;white-space:pre-wrap;max-height:320px;overflow-y:auto"></div>${sf(id)}`},
  aitranslate:{t:'AI Translate',cat:'ai',r:id=>`<div class="field"><label>Anthropic API Key <span style="font-weight:400;color:var(--tx3);font-size:.72rem">(free — 60 sec)</span></label><input type="password" id="aikey-${id}" placeholder="sk-ant-…" oninput="saveAiKey(this.value)" autocomplete="off"><span style="font-size:.72rem;color:var(--tx3)">Saved locally · never sent to Dublesh</span><details style="margin-top:.5rem"><summary style="font-size:.74rem;font-weight:700;color:var(--ac);cursor:pointer;list-style:none;user-select:none">▶ Don't have a key? Get one free in 60 seconds</summary><div style="margin-top:.5rem;background:var(--sf2);border:1px solid var(--bd);border-radius:var(--rs);padding:.7rem .85rem;font-size:.77rem;color:var(--tx2);line-height:1.6"><div style="font-weight:700;color:var(--green);margin-bottom:.35rem">✨ New accounts get free API credits</div><ol style="margin:0;padding-left:1.2rem;display:flex;flex-direction:column;gap:.25rem"><li>Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style="color:var(--ac);font-weight:600">console.anthropic.com</a> → create free account</li><li>Click <strong>API Keys</strong> → <strong>Create Key</strong></li><li>Copy the key and paste it above</li></ol></div></details></div><div class="field"><label>Translate to</label><select id="aitl-${id}"><option value="Spanish">Spanish</option><option value="French">French</option><option value="German">German</option><option value="Italian">Italian</option><option value="Portuguese">Portuguese</option><option value="Dutch">Dutch</option><option value="Russian">Russian</option><option value="Chinese (Simplified)">Chinese (Simplified)</option><option value="Chinese (Traditional)">Chinese (Traditional)</option><option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Arabic">Arabic</option><option value="Hindi">Hindi</option><option value="Turkish">Turkish</option><option value="Polish">Polish</option><option value="Swedish">Swedish</option><option value="Danish">Danish</option><option value="Norwegian">Norwegian</option><option value="Finnish">Finnish</option><option value="Greek">Greek</option><option value="Hebrew">Hebrew</option><option value="Thai">Thai</option><option value="Vietnamese">Vietnamese</option><option value="Indonesian">Indonesian</option><option value="Malay">Malay</option><option value="Swahili">Swahili</option><option value="Ukrainian">Ukrainian</option></select></div><div class="field"><label>Translation Style</label><select id="aitlstyle-${id}"><option value="faithful">Faithful (accurate)</option><option value="natural">Natural (fluent)</option><option value="formal">Formal register</option><option value="casual">Casual register</option></select></div>${dzHTML(id,true,'.pdf,application/pdf')}<button class="btn-p" id="btn-${id}" onclick="doAiTranslate('${id}')" disabled style="margin-top:.6rem">Translate with AI</button><div id="aiR-${id}" style="display:none;margin-top:.8rem;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem 1rem;font-size:.85rem;line-height:1.65;white-space:pre-wrap;max-height:320px;overflow-y:auto"></div>${sf(id)}`}
};window.TOOLS = TOOLS; // expose for patch layers

// SEO routing tables — tool ID ↔ clean URL slug
window._TOOL_SLUGS = {
    'merge': 'merge-pdf',
    'split': 'split-pdf',
    'rotate': 'rotate-pdf',
    'reorder': 'reorder-pdf-pages',
    'compress': 'compress-pdf',
    'watermark': 'add-watermark-pdf',
    'resize': 'resize-pdf',
    'grayscale': 'grayscale-pdf',
    'protect': 'protect-pdf',
    'unlock': 'unlock-pdf',
    'sign': 'sign-pdf',
    'flatten': 'flatten-pdf',
    'metadata': 'edit-pdf-metadata',
    'compare': 'compare-pdf',
    'thumbnail': 'pdf-thumbnails',
    'pdftoword': 'pdf-to-word',
    'pdftoexcel': 'pdf-to-excel',
    'redact': 'redact-pdf',
    'formbuilder': 'pdf-form-builder',
    'aisummarize': 'ai-summarize-pdf',
    'aiqa': 'ask-pdf-ai',
    'aitranslate': 'ai-translate-pdf',
    'pdf-to-jpg': 'pdf-to-jpg',
    'jpg-to-pdf': 'jpg-to-pdf',
    'extract-text': 'extract-text',
    'delete-pages': 'delete-pages',
    'extract-pages': 'extract-pages',
    'page-numbers': 'page-numbers',
    'crop-pdf': 'crop-pdf',
    'add-image': 'add-image',
    'blank-pdf': 'blank-pdf',
    'word-count': 'word-count',
    'markdown-to-pdf': 'markdown-to-pdf',
    'html-to-pdf': 'html-to-pdf',
    'remove-blank-pages': 'remove-blank-pages',
    'reverse-pages': 'reverse-pages',
    'duplicate-pages': 'duplicate-pages',
    'page-borders': 'page-borders',
    'pdf-repair': 'pdf-repair',
    'smart-crop': 'smart-crop',
    'ocr-pdf': 'ocr-pdf',
    'ai-pii-redact': 'ai-pii-redact',
    'ai-toc': 'ai-toc',
    'ai-invoice': 'ai-invoice',
    'ai-accessibility': 'ai-accessibility',
    'ai-crossref': 'ai-crossref',
    'annotate-pdf': 'annotate-pdf',
    'pdf-to-html': 'pdf-to-html',
    'fill-form': 'fill-form',
    'certificate-gen': 'certificate-gen',
    'ai-smart-compress': 'ai-smart-compress'
};
window._SLUG_TO_ID = {
    'merge-pdf': 'merge',
    'split-pdf': 'split',
    'rotate-pdf': 'rotate',
    'reorder-pdf-pages': 'reorder',
    'compress-pdf': 'compress',
    'add-watermark-pdf': 'watermark',
    'resize-pdf': 'resize',
    'grayscale-pdf': 'grayscale',
    'protect-pdf': 'protect',
    'unlock-pdf': 'unlock',
    'sign-pdf': 'sign',
    'flatten-pdf': 'flatten',
    'edit-pdf-metadata': 'metadata',
    'compare-pdf': 'compare',
    'pdf-thumbnails': 'thumbnail',
    'pdf-to-word': 'pdftoword',
    'pdf-to-excel': 'pdftoexcel',
    'redact-pdf': 'redact',
    'pdf-form-builder': 'formbuilder',
    'ai-summarize-pdf': 'aisummarize',
    'ask-pdf-ai': 'aiqa',
    'ai-translate-pdf': 'aitranslate',
    'pdf-to-jpg': 'pdf-to-jpg',
    'jpg-to-pdf': 'jpg-to-pdf',
    'extract-text': 'extract-text',
    'delete-pages': 'delete-pages',
    'extract-pages': 'extract-pages',
    'page-numbers': 'page-numbers',
    'crop-pdf': 'crop-pdf',
    'add-image': 'add-image',
    'blank-pdf': 'blank-pdf',
    'word-count': 'word-count',
    'markdown-to-pdf': 'markdown-to-pdf',
    'html-to-pdf': 'html-to-pdf',
    'remove-blank-pages': 'remove-blank-pages',
    'reverse-pages': 'reverse-pages',
    'duplicate-pages': 'duplicate-pages',
    'page-borders': 'page-borders',
    'pdf-repair': 'pdf-repair',
    'smart-crop': 'smart-crop',
    'ocr-pdf': 'ocr-pdf',
    'ai-pii-redact': 'ai-pii-redact',
    'ai-toc': 'ai-toc',
    'ai-invoice': 'ai-invoice',
    'ai-accessibility': 'ai-accessibility',
    'ai-crossref': 'ai-crossref',
    'annotate-pdf': 'annotate-pdf',
    'pdf-to-html': 'pdf-to-html',
    'fill-form': 'fill-form',
    'certificate-gen': 'certificate-gen',
    'ai-smart-compress': 'ai-smart-compress'
};


// NOTE: hyphenated aliases ('ai-qa', 'pdf-to-word' etc.) are assigned below after the object is fully constructed


// ── HYPHENATED ID ALIASES — safely resolved after TOOLS is fully constructed ──
// Pattern: TOOLS['x'] = TOOLS['x'] || TOOLS['camelCase'] || TOOLS['altKey']
// This preserves any already-defined hyphenated entries and only fills gaps.
TOOLS['blank-pdf']       = TOOLS['blank-pdf']       || TOOLS['blankpdf'];
TOOLS['delete-pages']    = TOOLS['delete-pages']    || TOOLS['deletepages'];
TOOLS['extract-pages']   = TOOLS['extract-pages']   || TOOLS['extractpages'];
TOOLS['extract-text']    = TOOLS['extract-text']    || TOOLS['extracttext'];
TOOLS['html-to-pdf']     = TOOLS['html-to-pdf']     || TOOLS['htmltopdf'];
TOOLS['jpg-to-pdf']      = TOOLS['jpg-to-pdf']      || TOOLS['jpgtopdf']     || TOOLS['imgtopdf'];
TOOLS['img-to-pdf']      = TOOLS['img-to-pdf']      || TOOLS['imgtopdf']     || TOOLS['jpgtopdf'];
TOOLS['markdown-to-pdf'] = TOOLS['markdown-to-pdf'] || TOOLS['markdowntopdf']|| TOOLS['markdown'];
TOOLS['page-numbers']    = TOOLS['page-numbers']    || TOOLS['pagenumbers']  || TOOLS['pagenums'];
TOOLS['pdf-to-jpg']      = TOOLS['pdf-to-jpg']      || TOOLS['pdftojpg'];
TOOLS['word-count']      = TOOLS['word-count']      || TOOLS['wordcount'];
TOOLS['ai-summarize']    = TOOLS['ai-summarize']    || TOOLS['aisummarize'];
TOOLS['ai-qa']           = TOOLS['ai-qa']           || TOOLS['aiqa'];
TOOLS['ai-translate']    = TOOLS['ai-translate']    || TOOLS['aitranslate'];

// ── BA 4: New tools — Crop PDF + Add Image to PDF ──────────────
TOOLS['crop-pdf'] = {t:'Crop PDF',cat:'edit',r:id=>`
${dzHTML(id,false,'.pdf,application/pdf','initCropPreview')}
<div class="field" style="margin-top:.9rem"><label>Preset Margins</label>
<select id="crop-preset-${id}" onchange="applyCropPreset('${id}')">
  <option value="custom">Custom (enter values below)</option>
  <option value="5">Trim 5mm — remove thin white border</option>
  <option value="10">Trim 10mm — standard border removal</option>
  <option value="15">Trim 15mm — aggressive crop</option>
  <option value="aadhaar">Aadhaar / ID card — crop to content</option>
</select></div>
<div class="og" style="margin-top:.7rem">
  <div class="field"><label>Left (mm)</label><input type="number" id="crop-l-${id}" value="10" min="0" max="200" oninput="cropUpdatePreview('${id}')"></div>
  <div class="field"><label>Right (mm)</label><input type="number" id="crop-r-${id}" value="10" min="0" max="200" oninput="cropUpdatePreview('${id}')"></div>
  <div class="field"><label>Top (mm)</label><input type="number" id="crop-t-${id}" value="10" min="0" max="200" oninput="cropUpdatePreview('${id}')"></div>
  <div class="field"><label>Bottom (mm)</label><input type="number" id="crop-b-${id}" value="10" min="0" max="200" oninput="cropUpdatePreview('${id}')"></div>
</div>
<div id="crop-preview-wrap-${id}" style="display:none;margin-top:.75rem">
  <div style="font-size:.72rem;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem">Preview (page 1) — drag the blue overlay to adjust</div>
  <div style="position:relative;display:inline-block;border:1px solid var(--bd);border-radius:8px;overflow:hidden;max-width:100%;cursor:crosshair" id="crop-canvaswrap-${id}">
    <canvas id="crop-bg-${id}" style="display:block;max-width:100%"></canvas>
    <canvas id="crop-ov-${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;cursor:crosshair"></canvas>
  </div>
  <div style="display:flex;gap:.5rem;margin-top:.4rem;flex-wrap:wrap;align-items:center">
    <span style="font-size:.68rem;color:var(--tx3)">💡 Drag inside the preview to set crop region visually</span>
    <button class="btn-s" style="margin-left:auto;font-size:.68rem;padding:.2rem .6rem" onclick="cropResetToDefault('${id}')">Reset</button>
  </div>
</div>
<div class="field" style="margin-top:.7rem"><label>Apply to</label>
<select id="crop-pages-${id}">
  <option value="all">All pages</option>
  <option value="odd">Odd pages only</option>
  <option value="even">Even pages only</option>
  <option value="first">First page only</option>
</select></div>
<button class="btn-p" id="btn-${id}" onclick="doCropPdf('${id}')" disabled>Crop &amp; Download</button>
${pvUI(id)}${sf(id)}`};

TOOLS['add-image'] = {t:'Add Image to PDF',cat:'edit',r:id=>`
${dzHTML(id,false,'.pdf,application/pdf')}
<div class="field" style="margin-top:.9rem">
  <label>Image to Stamp (PNG, JPG, WebP)</label>
  <div class="dz" id="imgdz-${id}" style="min-height:80px;padding:1rem" onclick="document.getElementById('imgfile-${id}').click()">
    <input type="file" id="imgfile-${id}" accept="image/png,image/jpeg,image/webp" style="display:none" onchange="loadStampImg('${id}',this.files[0])">
    <div class="dz-ic" style="font-size:1.5rem">🖼️</div>
    <div class="dz-tx"><strong>Click to choose image</strong><small id="imgname-${id}">PNG, JPG or WebP</small></div>
  </div>
</div>
<div class="og" style="margin-top:.7rem">
  <div class="field"><label>Width (mm)</label><input type="number" id="img-w-${id}" value="40" min="5" max="200"></div>
  <div class="field"><label>Height (mm)</label><input type="number" id="img-h-${id}" value="20" min="5" max="200"></div>
</div>
<div class="og">
  <div class="field"><label>X from left (mm)</label><input type="number" id="img-x-${id}" value="10" min="0" max="500"></div>
  <div class="field"><label>Y from bottom (mm)</label><input type="number" id="img-y-${id}" value="10" min="0" max="500"></div>
</div>
<div class="og">
  <div class="field"><label>Apply to</label>
  <select id="img-pages-${id}">
    <option value="all">All pages</option>
    <option value="first">First page only</option>
    <option value="last">Last page only</option>
  </select></div>
  <div class="field"><label>Opacity</label>
  <select id="img-opacity-${id}">
    <option value="1">100% — fully opaque</option>
    <option value="0.75">75%</option>
    <option value="0.5">50% — semi-transparent</option>
    <option value="0.25">25% — subtle</option>
  </select></div>
</div>
<div class="smsg inf show" style="margin-top:.6rem">💡 Tip: Use this to stamp a logo, signature image, or watermark graphic onto your PDF.</div>
<button class="btn-p" id="btn-${id}" onclick="doAddImage('${id}')" disabled>Stamp Image &amp; Download</button>
${pvUI(id)}${sf(id)}`};
TOOLS['pdf-to-word']     = TOOLS['pdf-to-word']     || TOOLS['pdftoword'];
TOOLS['pdf-to-excel']    = TOOLS['pdf-to-excel']    || TOOLS['pdftoexcel'];
TOOLS['form-builder']    = TOOLS['form-builder']    || TOOLS['formbuilder'];
TOOLS['reorder']         = TOOLS['reorder']         || TOOLS['reorderPages'];
TOOLS['thumbnail']       = TOOLS['thumbnail']       || TOOLS['thumbnails'];
TOOLS['compare']         = TOOLS['compare']         || TOOLS['comparePdfs'];
TOOLS['metadata']        = TOOLS['metadata']        || TOOLS['editMetadata'];
TOOLS['flatten']         = TOOLS['flatten']         || TOOLS['flattenPdf'];
// Verify all 51 tool cards have a TOOLS entry
(function(){
  var cards = document.querySelectorAll('.tc[data-tool]');
  cards.forEach(function(c){
    var tid = c.dataset.tool;
    if (!TOOLS[tid]) console.warn('Dublesh: no TOOLS entry for data-tool="' + tid + '"');
  });
})();

// CONDITIONAL TOGGLES
function splitModeChange(id){const m=document.getElementById('sm-'+id).value,wrap=document.getElementById('sv-wrap-'+id),lbl=document.getElementById('sv-lbl-'+id),inp=document.getElementById('sv-'+id);if(m==='all'){wrap.style.display='none';}else if(m==='range'){wrap.style.display='';lbl.textContent='Page range (e.g. 2-5)';inp.placeholder='e.g. 2-5';}else{wrap.style.display='';lbl.textContent='Pages per chunk';inp.placeholder='e.g. 5';}}
function rotModeChange(id){document.getElementById('rr-wrap-'+id).style.display=document.getElementById('rm-'+id).value==='range'?'block':'none';}
function pjModeChange(id){document.getElementById('pjr-wrap-'+id).style.display=document.getElementById('pjm-'+id).value==='range'?'block':'none';}
function togCust(id){const c=document.getElementById('rss-'+id).value==='custom';document.getElementById('rsw-'+id).style.display=c?'block':'none';document.getElementById('rsh-'+id).style.display=c?'block':'none';}

// IMPLEMENTATIONS
// ── doMerge: handles sequential, interleave, reverse modes + custom filename
async function doMerge(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    setSt(id,'Merging PDFs…','inf');setPrg(id,5);
    const{PDFDocument}=PDFLib;
    const mode=(document.getElementById('mg-mode-'+id)||{}).value||'seq';
    const outName=((document.getElementById('mg-name-'+id)||{}).value||'merged').replace(/\.pdf$/i,'')+'.pdf';
    const out=await PDFDocument.create();
    // Load all source docs
    const docs=[];
    for(let i=0;i<f.length;i++){
      setPrg(id,5+(i/f.length)*60,`Loading ${i+1}/${f.length}…`);
      const d=await PDFDocument.load(await f[i].arrayBuffer(),{ignoreEncryption:true});
      docs.push(d);
    }
    if(mode==='interleave'&&docs.length>1){
      // Interleave: A1,B1,A2,B2,...
      const maxPg=Math.max(...docs.map(d=>d.getPageCount()));
      for(let p=0;p<maxPg;p++){
        for(let d=0;d<docs.length;d++){
          if(p<docs[d].getPageCount()){
            const[pg]=await out.copyPages(docs[d],[p]);
            out.addPage(pg);
          }
        }
      }
    } else if(mode==='reverse'){
      // Reverse order of files, then merge
      for(let i=docs.length-1;i>=0;i--){
        setPrg(id,65+(i/docs.length)*30,`Adding ${i+1}…`);
        const ps=await out.copyPages(docs[i],docs[i].getPageIndices());
        ps.forEach(p=>out.addPage(p));
      }
    } else {
      // Sequential (default)
      for(let i=0;i<docs.length;i++){
        setPrg(id,65+(i/docs.length)*30,`Merging ${i+1}/${docs.length}…`);
        const ps=await out.copyPages(docs[i],docs[i].getPageIndices());
        ps.forEach(p=>out.addPage(p));
      }
    }
    const bytes=await out.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),outName);
    setPrg(id,100,'Done');
    setSt(id,`✓ Merged ${f.length} files → ${fmt(bytes.byteLength)}`,'succ');
    toast(`Merged ${f.length} PDFs`);
    pvShowCards(id,[{title:outName,lines:[{label:'Files merged',value:f.length},{label:'Total pages',value:out.getPageCount()},{label:'Size',value:fmt(bytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'merge',fileName:f.length+' files',outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doSplit: handles all, range, every N, half modes + filename prefix + ZIP
async function doSplit(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    const{PDFDocument}=PDFLib;
    const mode=document.getElementById('sm-'+id).value;
    const val=(document.getElementById('sv-'+id)||{}).value||'';
    const pfx=((document.getElementById('sp-pfx-'+id)||{}).value||'page').trim()||'page';
    const src=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});
    const total=src.getPageCount();
    setSt(id,`Splitting ${total} pages…`,'inf');setPrg(id,5);
    const blobs=[];
    const save=async(idx,name)=>{
      const d=await PDFDocument.create();
      const ps=await d.copyPages(src,idx);
      ps.forEach(p=>d.addPage(p));
      const b=new Blob([await d.save()],{type:'application/pdf'});
      blobs.push({name,blob:b});
    };
    if(mode==='all'){
      for(let i=0;i<total;i++){setPrg(id,(i/total)*90,`Page ${i+1}/${total}`);await save([i],`${pfx}_${String(i+1).padStart(3,'0')}.pdf`);}
    } else if(mode==='range'){
      await save(parseRange(val||`1-${total}`,total),pfx+'_extracted.pdf');
    } else if(mode==='half'){
      const half=Math.floor(total/2);
      await save(Array.from({length:half},(_,i)=>i),pfx+'_part1.pdf');
      await save(Array.from({length:total-half},(_,i)=>i+half),pfx+'_part2.pdf');
    } else {
      const n=Math.max(1,parseInt(val)||1);
      let pt=1;
      for(let i=0;i<total;i+=n,pt++){setPrg(id,(i/total)*90,`Part ${pt}…`);await save(Array.from({length:Math.min(n,total-i)},(_,k)=>i+k),`${pfx}_part${pt}.pdf`);}
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('sp-dl-'+id)||{}).value||'individual';
    if(dlMode==='zip'||blobs.length>1){
      const sz=await batchZip(blobs,'split_'+f[0].name.replace(/\.pdf$/i,'')+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} parts → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} parts zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}
      setPrg(id,100);setSt(id,`✓ ${blobs.length} part(s) downloaded`,'succ');toast(`${blobs.length} part(s) downloaded`);
    }
    pvShowCards(id,blobs.map(function(b,i){return{title:b.name,lines:[{label:'Size',value:fmt(b.blob.size)},{label:'Part',value:(i+1)+' of '+blobs.length}]};}));
    pvReady(id);
    addHist({tool:'split',fileName:f[0].name,outSize:blobs.length+' parts'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doRotate: handles all, odd, even, range modes across batch files
async function doRotate(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    const{PDFDocument,degrees}=PDFLib;
    const ang=safeInt(document.getElementById('ra-'+id).value,90,0,360);
    const mode=document.getElementById('rm-'+id).value;
    const rng=(document.getElementById('rr-'+id)||{}).value||'';
    const blobs=[];
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      setSt(id,'Rotating…','inf');
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      const pages=doc.getPages();
      let idx;
      if(mode==='all') idx=pages.map((_,i)=>i);
      else if(mode==='odd') idx=pages.map((_,i)=>i).filter(i=>i%2===0); // 0-based: page 1,3,5 = index 0,2,4
      else if(mode==='even') idx=pages.map((_,i)=>i).filter(i=>i%2===1);
      else idx=parseRange(rng,pages.length);
      idx.forEach(i=>{if(pages[i])pages[i].setRotation(degrees(ang));});
      const bytes=await doc.save();
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_rotated.pdf',blob:new Blob([bytes],{type:'application/pdf'}),outSize:bytes.byteLength,pages:idx.length});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){
      const sz=await batchZip(blobs,'rotated_'+Date.now()+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) rotated → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) rotated (${ang}°)`,'succ');toast('Pages rotated');
    }
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Pages rotated',value:b.pages},{label:'Output size',value:fmt(b.outSize)},{label:'Angle',value:ang+'°'}]})));
    pvReady(id);
    addHist({tool:'rotate',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

async function loadReorder(id){await awaitLibs();try{const f=S[id].files;if(!f.length)return;const pdf=await pdfjsLib.getDocument({data:await f[0].arrayBuffer()}).promise;
  if(pdf.numPages>500){setSt(id,`⚠ PDF has ${pdf.numPages} pages — max 500 for performance. Use Extract Pages for large files.`,'warn');return;}
  const list=document.getElementById('rl-'+id);list.innerHTML='';setSt(id,`Rendering ${pdf.numPages} pages…`,'inf');for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const vp=page.getViewport({scale:.17});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const item=document.createElement('div');item.className='ritem';item.draggable=true;item.dataset.idx=i-1;item.innerHTML=`<span class="rh">⠿</span><div class="rth"></div><span class="rname">Page ${i}</span><span class="rnumx">#${i}</span><div class="r-mv"><button class="rmv-btn" onclick="rMove('${id}',${i-1},-1)">↑</button><button class="rmv-btn" onclick="rMove('${id}',${i-1},1)">↓</button></div>`;item.querySelector('.rth').appendChild(c);item.addEventListener('dragstart',()=>{dragSrc=parseInt(item.dataset.idx);item.classList.add('dragging');});item.addEventListener('dragend',()=>{item.classList.remove('dragging');document.querySelectorAll('.ritem').forEach(el=>el.classList.remove('dov'));});item.addEventListener('dragover',e=>{e.preventDefault();item.classList.add('dov');});item.addEventListener('dragleave',()=>item.classList.remove('dov'));item.addEventListener('drop',e=>{e.preventDefault();item.classList.remove('dov');const dst=parseInt(item.dataset.idx);if(dragSrc===null||dragSrc===dst)return;const src=list.querySelector(`[data-idx="${dragSrc}"]`);if(dst>dragSrc)list.insertBefore(src,item.nextSibling);else list.insertBefore(src,item);reindexReorder(list);dragSrc=null;});list.appendChild(item);}document.getElementById('btn-'+id).disabled=false;setSt(id,`${pdf.numPages} pages — drag to reorder`,'inf');}catch(e){setSt(id,'Render failed: '+e.message,'err');}}
function reindexReorder(list){[...list.children].forEach((el,j)=>el.dataset.idx=j);}
function rMove(id,idx,dir){const list=document.getElementById('rl-'+id);const item=[...list.children].find(el=>parseInt(el.dataset.idx)===idx);if(!item)return;if(dir===-1&&item.previousElementSibling)list.insertBefore(item,item.previousElementSibling);else if(dir===1&&item.nextElementSibling)list.insertBefore(item.nextElementSibling,item);reindexReorder(list);}
async function doReorder(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}setBusy(id,true);try{const{PDFDocument}=PDFLib;const order=[...document.getElementById('rl-'+id).children].map(el=>parseInt(el.dataset.idx));setSt(id,'Reordering…','inf');setPrg(id,30);const src=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});const out=await PDFDocument.create();const ps=await out.copyPages(src,order);ps.forEach(p=>out.addPage(p));const bytes=await out.save();const blob=new Blob([bytes],{type:'application/pdf'});const dlMode=document.getElementById('pvDl-'+id)?.value||'individual';dlBlob(blob,smartName(f[0],'reordered'));setPrg(id,100,'Done');setSt(id,`✓ Reordered ${order.length} pages (${fmt(bytes.byteLength)})`,'succ');toast('PDF reordered');pvShowCards(id,[{title:'reordered.pdf',lines:[{label:'Pages',value:order.length},{label:'Output size',value:fmt(bytes.byteLength)}]}]);pvReady(id);addHist({tool:'reorder',fileName:f[0].name,outSize:fmt(bytes.byteLength)});}catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}setBusy(id,false);}

async function loadThumbsInto(id,grid,selectable){await awaitLibs();const f=S[id].files;if(!f.length)return;grid.innerHTML='';setSt(id,'Rendering previews…','inf');try{const pdf=await pdfjsLib.getDocument({data:await f[0].arrayBuffer()}).promise;
  const maxPages=Math.min(pdf.numPages,300);
  if(pdf.numPages>300)setSt(id,`⚠ Showing first 300 of ${pdf.numPages} pages for performance`,'warn');
  for(let i=1;i<=maxPages;i++){const page=await pdf.getPage(i);const vp=page.getViewport({scale:.23});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;const item=document.createElement('div');item.className='titem';item.dataset.page=i;item.innerHTML=`<div class="pck">✓</div><div class="pn">Page ${i}</div>`;item.prepend(c);if(selectable){item.onclick=()=>{item.classList.toggle('sel');updateSelCount(id);};}grid.appendChild(item);}document.getElementById('st-'+id).classList.remove('show');if(selectable){document.getElementById('sel-bar-'+id).style.display='flex';updateSelCount(id);document.getElementById('btn-'+id).disabled=false;}}catch(e){setSt(id,'✕ '+e.message,'err');}}
function loadThumbsSel(id){loadThumbsInto(id,document.getElementById('tg-'+id),true);}
function loadThumbs(id){loadThumbsInto(id,document.getElementById('tg-'+id),true);}  // alias
function loadThumbsOnly(id){
  loadThumbsInto(id,document.getElementById('tg-'+id),false).then(function(){
    var btn=document.getElementById('btn-'+id);
    if(btn) btn.disabled=false;
  }).catch(function(){});
}

// ── doDeletePages: handles visual selection OR range text input
async function doDeletePages(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');return;}
  // Get pages from range field if filled, else from visual selection
  const rangeInput=((document.getElementById('dp-range-'+id)||{}).value||'').trim();
  let sel;
  if(rangeInput){
    const{PDFDocument:PD}=PDFLib;
    const src2=await PD.load(await f[0].arrayBuffer(),{ignoreEncryption:true});
    sel=parseRange(rangeInput,src2.getPageCount());
  } else {
    sel=[...document.querySelectorAll(`#tg-${id} .titem.sel`)].map(el=>parseInt(el.dataset.page)-1);
  }
  if(!sel.length){setSt(id,'Select pages to delete or enter a range','warn');return;}
  setBusy(id,true);
  try{
    const{PDFDocument}=PDFLib;
    setSt(id,'Removing pages…','inf');setPrg(id,30);
    const src=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});
    const total=src.getPageCount();
    const keep=Array.from({length:total},(_,i)=>i).filter(i=>!sel.includes(i));
    if(!keep.length){setSt(id,'Cannot remove all pages','err');setBusy(id,false);return;}
    const out=await PDFDocument.create();
    const ps=await out.copyPages(src,keep);
    ps.forEach(p=>out.addPage(p));
    const bytes=await out.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),smartName(f[0],'pages_deleted'));
    setPrg(id,100,'Done');
    setSt(id,`✓ Deleted ${sel.length} page(s), ${keep.length} remaining`,'succ');
    toast(`Deleted ${sel.length} page(s)`);
    pvShowCards(id,[{title:'Output',lines:[{label:'Deleted',value:sel.length+' pages'},{label:'Remaining',value:keep.length+' pages'},{label:'Size',value:fmt(bytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'delete-pages',fileName:f[0].name,outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doExtractPages: handles single PDF or each page separately, custom filename
async function doExtractPages(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');return;}
  const rng=document.getElementById('ep-'+id).value.trim();
  if(!rng){setSt(id,'Enter a page range first','warn');return;}
  const mode=(document.getElementById('ep-mode-'+id)||{}).value||'single';
  const outName=((document.getElementById('ep-name-'+id)||{}).value||'extracted').replace(/\.pdf$/i,'');
  const blobs=[];
  setBusy(id,true);
  try{
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*85),`File ${fi+1}/${f.length}…`);
      const{PDFDocument}=PDFLib;
      const src=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      const idx=parseRange(rng,src.getPageCount());
      if(!idx.length){setSt(id,'No valid pages in range','err');setBusy(id,false);return;}
      if(mode==='each'){
        for(let pi=0;pi<idx.length;pi++){
          const out=await PDFDocument.create();
          const[pg]=await out.copyPages(src,[idx[pi]]);
          out.addPage(pg);
          const bytes=await out.save();
          blobs.push({name:`${outName}_p${idx[pi]+1}.pdf`,blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
        }
      } else {
        const out=await PDFDocument.create();
        const ps=await out.copyPages(src,idx);
        ps.forEach(p=>out.addPage(p));
        const bytes=await out.save();
        const fname=f.length>1?f[fi].name.replace(/\.pdf$/i,'')+'_'+outName+'.pdf':outName+'.pdf';
        blobs.push({name:fname,blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
      }
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){
      const sz=await batchZip(blobs,'extract-pages_'+Date.now()+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) extracted`,'succ');toast('Pages extracted');
    }
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Output size',value:fmt(b.size)}]})));
    pvReady(id);
    addHist({tool:'extract-pages',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doPdfToJpg: handles JPEG/PNG/WebP formats, quality, DPI scale
async function doPdfToJpg(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    const scale=safeFloat((document.getElementById('pjs-'+id)||{}).value,2,0.5,4.0);
    const fmt_out=(document.getElementById('pjfmt-'+id)||{}).value||'jpeg';
    const quality=safeFloat((document.getElementById('pjq-'+id)||{}).value,0.85,0.1,1.0);
    const mode=(document.getElementById('pjm-'+id)||{}).value||'all';
    const rng=(document.getElementById('pjr-'+id)||{}).value||'';
    const mimeType=fmt_out==='png'?'image/png':fmt_out==='webp'?'image/webp':'image/jpeg';
    const ext=fmt_out==='png'?'.png':fmt_out==='webp'?'.webp':'.jpg';
    setSt(id,'Rendering…','inf');
    const blobs=[],previews=[];
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*85),`File ${fi+1}/${f.length}…`);
      const pdf=await pdfjsLib.getDocument({data:await f[fi].arrayBuffer()}).promise;
      const total=pdf.numPages;
      const indices=mode==='all'?Array.from({length:total},(_,i)=>i+1):parseRange(rng,total).map(i=>i+1);
      const base=f[fi].name.replace(/\.pdf$/i,'');
      for(let n=0;n<indices.length;n++){
        setPrg(id,Math.round((fi/f.length)*85+(n/indices.length)*15),`Page ${n+1}/${indices.length}`);
        const page=await pdf.getPage(indices[n]);
        const vp=page.getViewport({scale});
        const c=document.createElement('canvas');
        c.width=vp.width;c.height=vp.height;
        const ctx=c.getContext('2d');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const q=fmt_out==='png'?undefined:quality;
        const blob=await new Promise(res=>c.toBlob(b=>res(b),mimeType,q));
        const name=f.length>1?`${base}_p${indices[n]}${ext}`:`page_${String(indices[n]).padStart(3,'0')}${ext}`;
        blobs.push({name,blob});
        previews.push({src:URL.createObjectURL(blob),label:`p.${indices[n]}`});
        page.cleanup();
      }
      pdf.destroy();
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){
      const sz=await batchZip(blobs,'pages_'+f[0].name.replace(/\.pdf$/i,'')+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} images → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} images zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,150));}
      setPrg(id,100);setSt(id,`✓ ${blobs.length} image(s) downloaded`,'succ');toast(`${blobs.length} image(s) downloaded`);
    }
    pvShowImages(id,previews);pvReady(id);
    addHist({tool:'pdf-to-jpg',fileName:f[0].name,outSize:blobs.length+' images'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

async function doImgToPdf(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;const _fErr=guardFiles(f,{types:['jpg','jpeg','png','webp','gif'],maxMB:50,maxFiles:30});if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}setBusy(id,true);
  // Helper: convert any image type to embeddable PNG/JPG bytes
  async function _toEmbeddable(file){
    const type=file.type||'';
    if(type==='image/png'){return{bytes:await file.arrayBuffer(),isPng:true};}
    if(type==='image/jpeg'||type==='image/jpg'){return{bytes:await file.arrayBuffer(),isPng:false};}
    // WebP, GIF, BMP, TIFF, AVIF → canvas → PNG
    return new Promise(function(res,rej){
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=function(){
        const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
        c.getContext('2d').drawImage(img,0,0);
        URL.revokeObjectURL(url);
        c.toBlob(function(blob){blob.arrayBuffer().then(function(buf){res({bytes:buf,isPng:true});}).catch(rej);},'image/png');
      };
      img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('Cannot read image: '+file.name));};
      img.src=url;
    });
  }
  try{const{PDFDocument}=PDFLib;const sKey=document.getElementById('is-'+id).value;const orient=document.getElementById('io-'+id).value;const margin=safeInt(document.getElementById('im-'+id).value,0,0,200);const sizes={a4:[595,842],letter:[612,792],a3:[842,1190],a5:[420,595]};setSt(id,'Converting…','inf');const doc=await PDFDocument.create();for(let i=0;i<f.length;i++){setPrg(id,Math.round((i/f.length)*90),`Image ${i+1}/${f.length}…`);const{bytes,isPng}=await _toEmbeddable(f[i]);let img;if(isPng)img=await doc.embedPng(bytes);else img=await doc.embedJpg(bytes);const{width:iw,height:ih}=img;let[pw,ph]=sKey==='fit'?[iw,ih]:(sizes[sKey]||[iw,ih]);const useO=orient==='auto'?(iw>ih?'landscape':'portrait'):orient;if(useO==='landscape'&&sKey!=='fit')[pw,ph]=[ph,pw];const page=doc.addPage([pw,ph]);const usW=pw-margin*2,usH=ph-margin*2;// Scale image to fit page: for named sizes (a4/letter etc) allow upscaling to fill page
        // For 'fit' mode use native image dimensions (no upscaling, no cropping)
        const sc = sKey === 'fit' ? Math.min(usW/iw, usH/ih, 1) : Math.min(usW/iw, usH/ih);
        page.drawImage(img,{x:margin+(usW-iw*sc)/2,y:margin+(usH-ih*sc)/2,width:iw*sc,height:ih*sc});}const bytes=await doc.save();dlBlob(new Blob([bytes],{type:'application/pdf'}),'images.pdf');setPrg(id,100,'Done');setSt(id,`✓ ${f.length} image(s) → PDF`,'succ');toast('Images → PDF ✓');pvShowCards(id,[{title:'images.pdf',lines:[{label:'Images',value:f.length},{label:'Output size',value:fmt(bytes.byteLength)}]}]);pvReady(id);addHist({tool:'jpg-to-pdf',fileName:f.length+' image(s)',outSize:fmt(bytes.byteLength)});}catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}setBusy(id,false);}

async function doExtractText(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}setBusy(id,true);
  try{
    const etMode=(document.getElementById('et-mode-'+id)||{}).value||'combined';
    const etSep=(document.getElementById('et-sep-'+id)||{}).value||'\n';
    setSt(id,'Extracting…','inf');
    let allText='';let totalPages=0;let totalWords=0;
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      const{text,numPages}=await extractAllText(f[fi]);
      totalPages+=numPages;
      const words=(text.match(/\S+/g)||[]).length;totalWords+=words;
      if(f.length>1)allText+=(allText?'\n\n--- '+f[fi].name+' ---\n\n':'')+text.trim();
      else allText=text.trim();
    }
    setPrg(id,100,'Done');
    let finalText=allText;
    if(etMode!=='pages'){finalText=allText.split(/\n\s*\n/).filter(Boolean).join(etSep==='\n\n'?'\n\n':etSep==='\n'?'\n':' ').trim();}
    const el=document.getElementById('etR-'+id);el.value=finalText;el.style.display='block';
    document.getElementById('etA-'+id).style.display='flex';
    setSt(id,`✓ ${totalWords.toLocaleString()} words from ${totalPages} page(s) across ${f.length} file(s)`,'succ');
    toast('Text extracted ✓');
    pvShowCards(id,[{title:'extracted.txt',lines:[{label:'Words',value:totalWords.toLocaleString()},{label:'Pages',value:totalPages},{label:'Files',value:f.length}]}]);
    pvReady(id);
    addHist({tool:'extract-text',fileName:f.length>1?f.length+' files':f[0].name,outSize:totalWords.toLocaleString()+' words'});
    S[id]._text=finalText;
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}
function dlTxt(id){if(!S[id]._text)return;dlBlob(new Blob([S[id]._text],{type:'text/plain'}),'extracted.txt');}

// ── doCompress: reads compress-images and also-remove options
async function doCompress(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  const quality=safeFloat((document.getElementById('cq-'+id)||{}).value,0.82,0.3,1.0);
  const imgMode=(document.getElementById('cq-img-'+id)||{}).value||'yes';
  const rmMode=(document.getElementById('cq-rm-'+id)||{}).value||'none';
  const cqw=document.getElementById('cq-warn-'+id);
  if(cqw) cqw.style.display=(imgMode==='yes')?'block':'none';
  const blobs=[];
  try{
    for(let fi=0;fi<f.length;fi++){
      const origSize=f[fi].size;
      setSt(id,`Compressing file ${fi+1}/${f.length}…`,'inf');
      setPrg(id,Math.round((fi/f.length)*10));
      const buf=await f[fi].arrayBuffer();
      const{PDFDocument}=PDFLib;
      if(imgMode==='no'){
        // Metadata-only optimisation — load, strip extras, re-save
        const doc=await PDFDocument.load(buf,{ignoreEncryption:true});
        if(rmMode==='meta'||rmMode==='all'){doc.setTitle('');doc.setAuthor('');doc.setSubject('');doc.setKeywords([]);doc.setCreator('');doc.setProducer('');}
        if(rmMode==='annots'||rmMode==='all'){
          doc.getPages().forEach(pg=>{try{pg.node.delete(PDFLib.PDFName.of('Annots'));}catch{}});
        }
        const bytes=await doc.save();
        const sav=((1-bytes.byteLength/origSize)*100).toFixed(1);
        blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_compressed.pdf',blob:new Blob([bytes],{type:'application/pdf'}),origSize,outSize:bytes.byteLength,saving:sav});
      } else {
        // Full re-render as JPEG
        const pdfSrc=await pdfjsLib.getDocument({data:buf}).promise;
        const outDoc=await PDFDocument.create();
        const total=pdfSrc.numPages;
        for(let i=1;i<=total;i++){
          setPrg(id,Math.round((fi/f.length)*90+(i/total)*(90/f.length)),`File ${fi+1}/${f.length} · p.${i}/${total}`);
          const page=await pdfSrc.getPage(i);
          const vp=page.getViewport({scale:1.5});
          const canvas=document.createElement('canvas');
          canvas.width=vp.width;canvas.height=vp.height;
          const ctx=canvas.getContext('2d');
          await page.render({canvasContext:ctx,viewport:vp}).promise;
          const jpgBytes=Uint8Array.from(atob(canvas.toDataURL('image/jpeg',quality).split(',')[1]),c=>c.charCodeAt(0));
          const jpgImg=await outDoc.embedJpg(jpgBytes);
          const pdfPage=outDoc.addPage([vp.width,vp.height]);
          pdfPage.drawImage(jpgImg,{x:0,y:0,width:vp.width,height:vp.height});
          page.cleanup();
        }
        pdfSrc.destroy();
        const bytes=await outDoc.save();
        const sav=((1-bytes.byteLength/origSize)*100).toFixed(1);
        blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_compressed.pdf',blob:new Blob([bytes],{type:'application/pdf'}),origSize,outSize:bytes.byteLength,saving:sav});
      }
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){
      const sz=await batchZip(blobs,'compressed_'+Date.now()+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) compressed → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}
      const avgSav=(blobs.reduce((a,b)=>a+parseFloat(b.saving||0),0)/blobs.length).toFixed(1);
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) — avg ${avgSav}% smaller`,'succ');toast('Compressed');
    }
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Before',value:fmt(b.origSize)},{label:'After',value:fmt(b.outSize)},{label:'Saved',value:parseFloat(b.saving)>0?'-'+b.saving+'%':'±0%'}]})));
    pvReady(id);
    addHist({tool:'compress',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}


// ── doWatermark: handles tiled, odd/even/last targets, layer (over/under)
async function doWatermark(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  const blobs=[];setBusy(id,true);
  try{
    const{PDFDocument,rgb,degrees}=PDFLib;
    const text=(document.getElementById('wt-'+id)||{}).value||'WATERMARK';
    const hex=(document.getElementById('wc-'+id)||{}).value||'#cc0000';
    const opacity=safeFloat((document.getElementById('wo-'+id)||{}).value,0.2,0.05,1.0);
    const size=safeInt((document.getElementById('ws-'+id)||{}).value,60,8,300);
    const pos=(document.getElementById('wp-'+id)||{}).value||'center';
    const angle=safeInt((document.getElementById('wa-'+id)||{}).value,35,-180,180);
    const pagesOpt=(document.getElementById('wpa-'+id)||{}).value||'all';
    const layerMode=(document.getElementById('wlyr-'+id)||{}).value||'over';
    const[r,g,b]=[1,3,5].map(o=>parseInt(hex.slice(o,o+2),16)/255);
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      setSt(id,'Adding watermark…','inf');
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      const font=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const allPages=doc.getPages();
      // Determine target pages
      let target;
      if(pagesOpt==='first') target=[allPages[0]];
      else if(pagesOpt==='last') target=[allPages[allPages.length-1]];
      else if(pagesOpt==='odd') target=allPages.filter((_,i)=>i%2===0);
      else if(pagesOpt==='even') target=allPages.filter((_,i)=>i%2===1);
      else target=allPages;
      target.forEach(page=>{
        const{width,height}=page.getSize();
        const tw=font.widthOfTextAtSize(text,size);
        if(pos==='tiled'){
          // Tile across the whole page
          const stepX=tw+40, stepY=size+40;
          for(let ty=0;ty<height+stepY;ty+=stepY){
            for(let tx=-tw;tx<width+tw;tx+=stepX){
              page.drawText(text,{x:tx,y:ty,size,font,color:rgb(r,g,b),opacity:layerMode==='under'?opacity*0.55:opacity,rotate:degrees(angle)});
            }
          }
        } else {
          let x,y,rot=degrees(pos==='center'?angle:0);
          if(pos==='center'){x=(width-tw)/2;y=(height-size)/2;}
          else if(pos==='top'){x=(width-tw)/2;y=height-size-20;}
          else{x=(width-tw)/2;y=20;}
          page.drawText(text,{x,y,size,font,color:rgb(r,g,b),opacity:layerMode==='under'?opacity*0.55:opacity,rotate:rot});
        }
      });
      const bytes=await doc.save();
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_watermarked.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'watermark_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
    else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) watermarked`,'succ');toast('Watermark added');}
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Text',value:text.slice(0,20)},{label:'Output size',value:fmt(b.size)}]})));
    pvReady(id);
    addHist({tool:'watermark',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doPageNums: handles skip, dash format, custom prefix/suffix, all positions
async function doPageNums(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  const blobs=[];setBusy(id,true);
  try{
    const{PDFDocument,rgb}=PDFLib;
    const pos=(document.getElementById('pp-'+id)||{}).value||'bottom-center';
    const startNum=safeInt((document.getElementById('ps-'+id)||{}).value,1,0,9999);
    const skipN=safeInt((document.getElementById('psk-'+id)||{}).value,0,0,999);
    const fontSize=safeInt((document.getElementById('pfs-'+id)||{}).value,11,6,72);
    const hex=(document.getElementById('pc-'+id)||{}).value||'#333333';
    const fmtS=(document.getElementById('pfm-'+id)||{}).value||'n';
    const prefix=(document.getElementById('pnpfx-'+id)||{}).value||'';
    const suffix=(document.getElementById('pnsfx-'+id)||{}).value||'';
    const[r,g,b]=[1,3,5].map(o=>parseInt(hex.slice(o,o+2),16)/255);
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*88),`File ${fi+1}/${f.length}…`);
      setSt(id,'Numbering…','inf');
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      const pages=doc.getPages();
      const total=pages.length;
      const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      pages.forEach((page,i)=>{
        if(i<skipN) return; // skip first N pages (cover etc.)
        const{width,height}=page.getSize();
        const dispNum=startNum+(i-skipN);
        const totalDisp=total-skipN;
        let label;
        if(fmtS==='pn') label=`Page ${dispNum} of ${totalDisp}`;
        else if(fmtS==='dash') label=`— ${dispNum} —`;
        else if(fmtS==='custom') label=`${prefix}${dispNum}${suffix}`;
        else label=String(dispNum);
        const tw=font.widthOfTextAtSize(label,fontSize);
        const[vpart,hpart]=pos.split('-');
        const pad=18;
        const x=hpart==='right'?width-tw-pad:hpart==='left'?pad:(width-tw)/2;
        const y=vpart==='top'?height-fontSize-pad:pad;
        page.drawText(label,{x,y,size:fontSize,font,color:rgb(r,g,b)});
      });
      const bytes=await doc.save();
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_numbered.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size,pages:total-skipN});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'page-numbers_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
    else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) numbered`,'succ');toast('Page numbers added');}
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Pages numbered',value:b.pages},{label:'Format',value:fmtS},{label:'Output size',value:fmt(b.size)}]})));
    pvReady(id);
    addHist({tool:'page-numbers',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doResize: handles A5/B5, custom mm→pt conversion, fill/keep/fit scaling
async function doResize(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  const blobs=[];setBusy(id,true);
  try{
    const{PDFDocument}=PDFLib;
    const sKey=(document.getElementById('rss-'+id)||{}).value||'a4';
    const orient=(document.getElementById('rso-'+id)||{}).value||'portrait';
    const scaleMode=(document.getElementById('rssc-'+id)||{}).value||'fit';
    // Extended PSZ includes A5/B5
    const PSZ_EXT=Object.assign({a5:[420,595],b5:[499,709]},PSZ||{});
    let pw,ph;
    if(sKey==='custom'){
      // Input is mm — convert to pt (1mm = 2.8346pt)
      const wmm=safeInt((document.getElementById('rswv-'+id)||{}).value,210,10,5000);
      const hmm=safeInt((document.getElementById('rshv-'+id)||{}).value,297,10,5000);
      pw=Math.round(wmm*2.8346);ph=Math.round(hmm*2.8346);
    } else {
      [pw,ph]=PSZ_EXT[sKey]||[595,842];
    }
    if(orient==='landscape')[pw,ph]=[ph,pw];
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*88),`File ${fi+1}/${f.length}…`);
      setSt(id,'Resizing…','inf');
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      doc.getPages().forEach(page=>{
        const{width:ow,height:oh}=page.getSize();
        if(scaleMode==='fit'){
          const s=Math.min(pw/ow,ph/oh);
          page.scaleContent(s,s);
          page.translateContent((pw-ow*s)/2,(ph-oh*s)/2);
        } else if(scaleMode==='fill'){
          const s=Math.max(pw/ow,ph/oh);
          page.scaleContent(s,s);
          page.translateContent((pw-ow*s)/2,(ph-oh*s)/2);
        }
        // 'keep' = just resize the page box, no content scaling
        page.setSize(pw,ph);
      });
      const bytes=await doc.save();
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_resized.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'resize_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
    else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) resized (${sKey.toUpperCase()})`,'succ');toast('PDF resized');}
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Target',value:sKey.toUpperCase()+' '+orient},{label:'Scale',value:scaleMode},{label:'Output size',value:fmt(b.size)}]})));
    pvReady(id);
    addHist({tool:'resize',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doGrayscale: supports grayscale and sepia modes
async function doGrayscale(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  const blobs=[];setBusy(id,true);
  try{
    const colorMode=(document.getElementById('gs-mode-'+id)||{}).value||'gray';
    const scale=safeFloat((document.getElementById('gs-'+id)||{}).value,1.5,0.5,4.0);
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      const{PDFDocument}=PDFLib;
      const pdfjs=await pdfjsLib.getDocument({data:await f[fi].arrayBuffer()}).promise;
      const doc=await PDFDocument.create();
      for(let i=1;i<=pdfjs.numPages;i++){
        setPrg(id,(i/pdfjs.numPages)*85,`Page ${i}/${pdfjs.numPages}`);
        const page=await pdfjs.getPage(i);
        const vp=page.getViewport({scale});
        const c=document.createElement('canvas');
        c.width=vp.width;c.height=vp.height;
        const ctx=c.getContext('2d');
        ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const imgData=ctx.getImageData(0,0,c.width,c.height);
        for(let j=0;j<imgData.data.length;j+=4){
          const lum=Math.round(0.299*imgData.data[j]+0.587*imgData.data[j+1]+0.114*imgData.data[j+2]);
          if(colorMode==='sepia'){
            imgData.data[j]=Math.min(255,lum*1.08+30);   // R
            imgData.data[j+1]=Math.min(255,lum*0.86+10); // G
            imgData.data[j+2]=Math.min(255,lum*0.66);    // B
          } else {
            imgData.data[j]=imgData.data[j+1]=imgData.data[j+2]=lum;
          }
        }
        ctx.putImageData(imgData,0,0);
        const pngBuf=await new Promise(res=>c.toBlob(async b=>{res(await b.arrayBuffer());},'image/png'));
        const img=await doc.embedPng(pngBuf);
        const{width:iw,height:ih}=img;
        const pg=doc.addPage([iw,ih]);
        pg.drawImage(img,{x:0,y:0,width:iw,height:ih});
        page.cleanup();
      }
      pdfjs.destroy();
      const bytes=await doc.save();
      const suffix=colorMode==='sepia'?'_sepia.pdf':'_grayscale.pdf';
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+suffix,blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'grayscale_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
    else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) converted (${colorMode})`,'succ');toast(colorMode==='sepia'?'Sepia PDF ✓':'Grayscale PDF ✓');}
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Mode',value:colorMode},{label:'Output size',value:fmt(b.size)},{label:'Input size',value:fmt(b.origSize)}]})));
    pvReady(id);
    addHist({tool:'grayscale',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doProtect: reads permission checkboxes + AES-128 encryption
async function doProtect(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');return;}
  const p1=(document.getElementById('pp1-'+id).value||'').trim();
  const p2=(document.getElementById('pp2-'+id).value||'').trim();
  if(!p1){setSt(id,'Enter a password','warn');return;}
  if(p1.length<4){setSt(id,'Password must be at least 4 characters','warn');return;}
  if(p1!==p2){setSt(id,'Passwords do not match','err');return;}
  // Read permission checkboxes
  const allowPrint=!!(document.getElementById('perm-print-'+id)||{checked:true}).checked;
  const allowCopy=!!(document.getElementById('perm-copy-'+id)||{checked:false}).checked;
  const allowAnnot=!!(document.getElementById('perm-annot-'+id)||{checked:true}).checked;
  const allowFill=!!(document.getElementById('perm-fill-'+id)||{checked:true}).checked;
  const blobs=[];
  setBusy(id,true);
  try{
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      const{PDFDocument}=PDFLib;
      setSt(id,'Encrypting…','inf');setPrg(id,40);
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      const bytes=await doc.save({
        userPassword:p1,
        ownerPassword:p1,
        permissions:{
          printing:allowPrint?'highResolution':'none',
          modifying:false,
          copying:allowCopy,
          annotating:allowAnnot,
          fillingForms:allowFill,
          contentAccessibility:true,
          documentAssembly:false
        }
      });
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_protected.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
      toast('PDF encrypted');
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){
      const sz=await batchZip(blobs,'protect_'+Date.now()+'.zip');
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) encrypted → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}
      setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) encrypted`,'succ');toast('PDF encrypted ✓');
    }
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Encryption',value:'AES-128'},{label:'Print',value:allowPrint?'✓':'✕'},{label:'Copy text',value:allowCopy?'✓':'✕'},{label:'Output size',value:fmt(b.size)}]})));
    pvReady(id);
    addHist({tool:'protect',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

async function doUnlock(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}const blobs=[];setBusy(id,true);try{
  for(let fi=0;fi<f.length;fi++){
  setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
  const{PDFDocument}=PDFLib;const pw=document.getElementById('up-'+id).value.trim();setSt(id,'Unlocking…','inf');setPrg(id,40);const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true,password:pw});const bytes=await doc.save();blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_unlocked.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});setPrg(id,100,'Done');setSt(id,'✓ PDF unlocked — '+fmt(bytes.byteLength),'succ');toast('PDF unlocked');
  }
  
  setPrg(id,95,'Packaging…');
  const dlMode=document.getElementById('pvDl-'+id)?.value||'individual';
  if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'unlock_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
  else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) unlocked`,'succ');toast('PDF unlocked ✓');}
  pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Output size',value:fmt(b.size)},{label:'Input size',value:fmt(b.origSize)}]})));
  pvReady(id);
  addHist({tool:'unlock',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
}
catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}setBusy(id,false);}


// ── SIGNATURE PERSISTENCE ─────────────────────────────────────────
// Save drawn signature to localStorage so it persists across sessions
function saveSigToStorage(id) {
  var canvas = document.getElementById('sigC-' + id);
  if (!canvas) return;
  try {
    var dataUrl = canvas.toDataURL('image/png');
    // Only save if canvas has something drawn (not blank white)
    var tempCtx = canvas.getContext('2d');
    var pxData = tempCtx.getImageData(0, 0, 10, 10).data;
    var hasContent = Array.from(pxData).some(function(v, i) { return i % 4 !== 3 && v > 0; });
    if (hasContent) {
      localStorage.setItem('pf-sig', dataUrl);
      toast('Signature saved for next time ✓', 's', 2000);
    }
  } catch(e) {}
}

function loadSigFromStorage(id) {
  try {
    var saved = localStorage.getItem('pf-sig');
    if (!saved) return false;
    var canvas = document.getElementById('sigC-' + id);
    if (!canvas) return false;
    var img = new Image();
    img.onload = function() {
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      var ph = document.getElementById('sigPH-' + id);
      if (ph) ph.style.opacity = '0';
    };
    img.src = saved;
    return true;
  } catch(e) { return false; }
}

function initSig(id){const canvas=document.getElementById('sigC-'+id);if(!canvas)return;const dpr=window.devicePixelRatio||1;const rect=canvas.getBoundingClientRect();canvas.width=(rect.width||300)*dpr;canvas.height=140*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';let drawing=false;const getPt=e=>{const r=canvas.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-r.left,y:src.clientY-r.top};};const start=e=>{e.preventDefault();drawing=true;ctx.strokeStyle=document.getElementById('sc-'+id)?.value||'#00008b';const{x,y}=getPt(e);ctx.beginPath();ctx.moveTo(x,y);const ph=document.getElementById('sigPH-'+id);if(ph)ph.style.opacity='0';};const move=e=>{e.preventDefault();if(!drawing)return;const{x,y}=getPt(e);ctx.lineTo(x,y);ctx.stroke();};const end=()=>{drawing=false;};canvas.addEventListener('mousedown',start);canvas.addEventListener('mousemove',move);canvas.addEventListener('mouseup',end);canvas.addEventListener('mouseleave',end);canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
  // Restore saved signature if available
  setTimeout(function() { loadSigFromStorage(id); }, 50);
  // Ensure draw tab is active on open
  sigSetTab(id,'draw');
}
function clearSig(id){const c=document.getElementById('sigC-'+id);if(!c)return;const dpr=window.devicePixelRatio||1;c.getContext('2d').clearRect(0,0,c.width/dpr,c.height/dpr);const ph=document.getElementById('sigPH-'+id);if(ph)ph.style.opacity='1';}
// ── doSign: supports draw, type, upload tabs + size control + date stamp
async function doSign(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    const{PDFDocument,rgb}=PDFLib;
    const canvas=document.getElementById('sigC-'+id);
    // Check if canvas has anything drawn
    const ctx=canvas.getContext('2d');
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const isEmpty=!data.some((v,i)=>i%4===3&&v>10);
    if(isEmpty){setSt(id,'Please draw or type your signature first','warn');setBusy(id,false);return;}
    const sigBuf=await(await fetch(canvas.toDataURL('image/png'))).arrayBuffer();
    setSt(id,'Stamping signature…','inf');setPrg(id,40);
    const doc=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});
    const sigImg=await doc.embedPng(sigBuf);
    const pages=doc.getPages();
    const pageSel=(document.getElementById('sp-'+id)||{}).value||'last';
    const posSel=(document.getElementById('spos-'+id)||{}).value||'br';
    const sw=safeInt((document.getElementById('ssz-'+id)||{}).value,180,40,500);
    const sh=Math.round(sw*(canvas.height/canvas.width));
    const dateMode=(document.getElementById('sdate-'+id)||{}).value||'no';
    const stamp=page=>{
      const{width,height}=page.getSize();
      const pad=20;
      const xM={br:width-sw-pad,bl:pad,bc:(width-sw)/2,tr:width-sw-pad};
      const yM={br:pad,bl:pad,bc:pad,tr:height-sh-pad};
      const x=xM[posSel]||pad, y=yM[posSel]||pad;
      page.drawImage(sigImg,{x,y,width:sw,height:sh});
      if(dateMode!=='no'){
        const today=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
        const font=PDFLib.StandardFonts&&doc.embedFont?null:null; // use default
        const dx=dateMode==='right'?x+sw+6:x;
        const dy=dateMode==='right'?y+sh/2-5:y-14;
        page.drawText(today,{x:Math.min(dx,width-100),y:Math.max(dy,4),size:9,color:rgb(0.3,0.3,0.3)});
      }
    };
    if(pageSel==='all')pages.forEach(stamp);
    else if(pageSel==='first')stamp(pages[0]);
    else stamp(pages[pages.length-1]);
    const bytes=await doc.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),smartName(f[0],'signed'));
    setPrg(id,100,'Done');setSt(id,'✓ Signature applied — '+pages.length+' page PDF, '+fmt(bytes.byteLength),'succ');toast('PDF signed');
    pvShowCards(id,[{title:smartName(f[0],'signed'),lines:[{label:'Output size',value:fmt(bytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'sign',fileName:f[0].name,outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doFlatten: respects fl-mode (all / forms only / annotations only)
async function doFlatten(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  const blobs=[];setBusy(id,true);
  try{
    const flatMode=(document.getElementById('fl-mode-'+id)||{}).value||'all';
    for(let fi=0;fi<f.length;fi++){
      setPrg(id,Math.round((fi/f.length)*90),`File ${fi+1}/${f.length}…`);
      const{PDFDocument}=PDFLib;
      setSt(id,'Flattening…','inf');setPrg(id,40);
      const doc=await PDFDocument.load(await f[fi].arrayBuffer(),{ignoreEncryption:true});
      if(flatMode==='all'||flatMode==='forms'){try{doc.getForm().flatten();}catch(e){}}
      if(flatMode==='all'||flatMode==='annots'){
        doc.getPages().forEach(pg=>{try{pg.node.delete(PDFLib.PDFName.of('Annots'));}catch(e){}});
      }
      const bytes=await doc.save();
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'_flattened.pdf',blob:new Blob([bytes],{type:'application/pdf'}),size:bytes.byteLength,origSize:f[fi].size});
    }
    setPrg(id,95,'Packaging…');
    const dlMode=(document.getElementById('pvDl-'+id)||{}).value||'individual';
    if(dlMode==='zip'&&blobs.length>1){const sz=await batchZip(blobs,'flatten_'+Date.now()+'.zip');setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) → ZIP (${fmt(sz)})`,'succ');toast(`${blobs.length} PDFs zipped`);}
    else{for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(r=>setTimeout(r,200));}setPrg(id,100);setSt(id,`✓ ${blobs.length} file(s) flattened (${flatMode})`,'succ');toast('PDF flattened');}
    pvShowCards(id,blobs.map(b=>({title:b.name,lines:[{label:'Flattened',value:flatMode},{label:'Output size',value:fmt(b.size)},{label:'Input size',value:fmt(b.origSize)}]})));
    pvReady(id);
    addHist({tool:'flatten',fileName:f.length+' file(s)',outSize:blobs.length+' PDFs'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

async function loadMeta(id){await awaitLibs();const f=S[id].files;if(!f.length)return;try{const{PDFDocument}=PDFLib;const doc=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});document.getElementById('mti-'+id).value=doc.getTitle()||'';document.getElementById('mau-'+id).value=doc.getAuthor()||'';document.getElementById('msu-'+id).value=doc.getSubject()||'';document.getElementById('mke-'+id).value=(doc.getKeywords()||[]).join(', ');document.getElementById('mcr-'+id).value=doc.getCreator()||'';document.getElementById('mpr-'+id).value=doc.getProducer()||'';document.getElementById('metapanel-'+id).style.display='block';setSt(id,'Metadata loaded — edit then save','inf');}catch(e){setSt(id,'✕ '+e.message,'err');}}
async function doMetadata(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});if(_fErr){setSt(id,_fErr,'err');return;}try{const{PDFDocument}=PDFLib;const doc=await PDFDocument.load(await f[0].arrayBuffer(),{ignoreEncryption:true});doc.setTitle(document.getElementById('mti-'+id).value);doc.setAuthor(document.getElementById('mau-'+id).value);doc.setSubject(document.getElementById('msu-'+id).value);doc.setKeywords([document.getElementById('mke-'+id).value]);doc.setCreator(document.getElementById('mcr-'+id).value);doc.setProducer(document.getElementById('mpr-'+id).value);const bytes=await doc.save();dlBlob(new Blob([bytes],{type:'application/pdf'}),'metadata_updated.pdf');setSt(id,'✓ Metadata saved — '+fmt(bytes.byteLength),'succ');toast('Metadata updated');pvShowCards(id,[{title:'metadata_updated.pdf',lines:[{label:'Output size',value:fmt(bytes.byteLength)}]}]);pvReady(id);addHist({tool:'metadata',fileName:f[0].name,outSize:fmt(bytes.byteLength)});}catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}}

// ── doWordCount: basic stats + full mode with top words + reading level
async function doWordCount(id){await awaitLibs();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  const f=S[id].files;
  const _fErr=guardFiles(f,{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  try{
    setSt(id,'Analyzing…','inf');setPrg(id,15);
    const{text,numPages}=await extractAllText(f[0]);
    setPrg(id,100,'Done');
    const wordList=(text.match(/[a-zA-Z]{3,}/g)||[]);
    const words=wordList.length;
    const chars=text.replace(/\s/g,'').length;
    const charsWS=text.replace(/\n/g,' ').length;
    const sentences=text.split(/[.!?]+/).filter(s=>s.trim()).length;
    const paras=text.split(/\n\s*\n/).filter(s=>s.trim()).length;
    const readTime=Math.max(1,Math.ceil(words/200));
    const avgSentLen=sentences?Math.round(words/sentences):0;
    const syllables=wordList.reduce((s,w)=>s+Math.max(1,(w.toLowerCase().match(/[aeiouy]+/g)||[]).length),0);
    const fk=sentences&&words?Math.round(0.39*(words/sentences)+11.8*(syllables/words)-15.59):0;
    const level=fk<30?'Very Hard':fk<50?'Hard':fk<60?'Medium':fk<70?'Standard':fk<80?'Easy':'Very Easy';
    const depth=(document.getElementById('wc-depth-'+id)||{}).value||'full';
    const cards=[
      ['Words',words.toLocaleString()],['Characters (no spaces)',chars.toLocaleString()],
      ['Characters (with spaces)',charsWS.toLocaleString()],['Sentences',sentences.toLocaleString()],
      ['Paragraphs',paras.toLocaleString()],['Pages',numPages],
      ['Read time','∼'+readTime+' min'],['Avg words/sentence',avgSentLen],
      ['Avg words/page',numPages?Math.round(words/numPages):0]
    ];
    if(depth==='full'){
      cards.push(['Reading level',level]);
      const STOP=new Set(['the','and','for','that','this','with','are','was','not','but','from','have','had','they','you','been','has','its','will','more','also','into','than','then','when','what','each','which','there','their','were']);
      const freq={};
      wordList.forEach(w=>{const lw=w.toLowerCase();if(!STOP.has(lw))freq[lw]=(freq[lw]||0)+1;});
      const topWords=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w,c])=>w+' ('+c+')').join(', ');
      cards.push(['Top 10 words',topWords||'—']);
    }
    document.getElementById('wcR-'+id).innerHTML=`<div class="rgrid">${cards.map(([l,v])=>`<div class="rcard"><div class="rl">${l}</div><div class="rv" style="font-size:${String(v).length>12?'.8rem':'1.1rem'}">${v}</div></div>`).join('')}</div>`;
    setSt(id,`✓ Analysis complete — ${words.toLocaleString()} words, ${numPages} page(s)`,'succ');
    toast('Analysis complete ✓');
    pvShowCards(id,[{title:f[0].name,lines:[{label:'Words',value:words.toLocaleString()},{label:'Pages',value:numPages},{label:'Read time',value:'∼'+readTime+' min'},{label:'Level',value:level}]}]);
    pvReady(id);
    addHist({tool:'word-count',fileName:f[0].name,outSize:words.toLocaleString()+' words'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}


const cmpF={};
function cmpLoad(e,id,w){const f=e.target.files[0];if(!f)return;cmpF[id+w]=f;document.getElementById('cn-'+id+'-'+w).textContent='✓ '+f.name;checkCmp(id);}
function cmpDrop(e,id,w){e.preventDefault();dzL('cmp-'+w+'-'+id);const f=e.dataTransfer.files[0];if(!f)return;cmpF[id+w]=f;document.getElementById('cn-'+id+'-'+w).textContent='✓ '+f.name;checkCmp(id);}
function checkCmp(id){if(cmpF[id+'a']&&cmpF[id+'b'])document.getElementById('btn-'+id).disabled=false;}

// ── doCompare: uses compare mode (word/sentence/char) and ignore (case/ws) options
async function doCompare(id){await awaitLibs();
  if(!cmpF[id+'a']||!cmpF[id+'b']){setSt(id,'Add both PDFs above to compare','warn');return;}
  var _eA=guardFiles([cmpF[id+'a']],{types:['pdf'],maxMB:150});
  var _eB=guardFiles([cmpF[id+'b']],{types:['pdf'],maxMB:150});
  if(_eA||_eB){setSt(id,_eA||_eB,'err');return;}
  var cmpMode=(document.getElementById('cmp-mode-'+id)||{value:'words'}).value||'words';
  var ignMode=(document.getElementById('cmp-ign-'+id)||{value:'none'}).value||'none';
  setBusy(id,true);
  try{
    setSt(id,'Extracting text…','inf');setPrg(id,20);
    const[r1,r2]=await Promise.all([extractAllText(cmpF[id+'a']),extractAllText(cmpF[id+'b'])]);
    setPrg(id,70,'Computing diff…');
    // Apply ignore settings
    const normalize=t=>{
      if(ignMode==='case'||ignMode==='both') t=t.toLowerCase();
      if(ignMode==='ws'||ignMode==='both') t=t.replace(/\s+/g,' ').trim();
      return t;
    };
    const t1=normalize(r1.text), t2=normalize(r2.text);
    // Tokenize based on mode
    let tokens1,tokens2;
    if(cmpMode==='chars'){
      tokens1=new Set(t1.split('').filter(c=>c.trim()));
      tokens2=new Set(t2.split('').filter(c=>c.trim()));
    } else if(cmpMode==='sentences'){
      tokens1=new Set(t1.split(/[.!?]+/).map(s=>s.trim()).filter(s=>s.length>5));
      tokens2=new Set(t2.split(/[.!?]+/).map(s=>s.trim()).filter(s=>s.length>5));
    } else {
      const tok=t=>new Set(t.split(/\s+/).filter(w=>w.length>2&&/[a-zA-Z]/.test(w)));
      tokens1=tok(t1); tokens2=tok(t2);
    }
    const only1=[...tokens1].filter(w=>!tokens2.has(w)).slice(0,50);
    const only2=[...tokens2].filter(w=>!tokens1.has(w)).slice(0,50);
    const common=[...tokens1].filter(w=>tokens2.has(w)).length;
    const sim=((common/Math.max(tokens1.size,tokens2.size,1))*100).toFixed(1);
    const simColor=parseFloat(sim)>80?'#16a34a':parseFloat(sim)>50?'#d97706':'#dc2626';
    document.getElementById('cmpR-'+id).innerHTML=
      `<div class="rgrid" style="margin-bottom:.7rem">
        <div class="rcard"><div class="rl">PDF 1 ${cmpMode==='chars'?'Chars':'Terms'}</div><div class="rv">${tokens1.size.toLocaleString()}</div></div>
        <div class="rcard"><div class="rl">PDF 2 ${cmpMode==='chars'?'Chars':'Terms'}</div><div class="rv">${tokens2.size.toLocaleString()}</div></div>
        <div class="rcard"><div class="rl">Shared</div><div class="rv">${common.toLocaleString()}</div></div>
        <div class="rcard"><div class="rl">Similarity</div><div class="rv" style="color:${simColor}">${sim}%</div></div>
        <div class="rcard"><div class="rl">PDF 1 Pages</div><div class="rv">${r1.numPages}</div></div>
        <div class="rcard"><div class="rl">PDF 2 Pages</div><div class="rv">${r2.numPages}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
        <div style="background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.18);border-radius:8px;padding:.8rem">
          <div style="font-size:.6rem;color:#dc2626;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem">Only in PDF 1 (${only1.length})</div>
          <div style="font-size:.74rem;color:var(--tx2);line-height:2">${only1.join(', ')||'No unique terms'}</div>
        </div>
        <div style="background:rgba(22,163,74,.06);border:1px solid rgba(22,163,74,.18);border-radius:8px;padding:.8rem">
          <div style="font-size:.6rem;color:#16a34a;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem">Only in PDF 2 (${only2.length})</div>
          <div style="font-size:.74rem;color:var(--tx2);line-height:2">${only2.join(', ')||'No unique terms'}</div>
        </div>
      </div>`;
    setPrg(id,100,'Done');
    setSt(id,`✓ ${sim}% similarity · mode: ${cmpMode} · ignore: ${ignMode}`,'succ');
    toast(`${sim}% similar`);
    pvReady(id);
    addHist({tool:'compare',fileName:'2 PDFs',outSize:sim+'% similar'});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// ── doBlankPdf: supports blank, lined, grid, and dot ruling options
async function doBlankPdf(id){await awaitLibs();
  try{
    const{PDFDocument,rgb}=PDFLib;
    const sKey=(document.getElementById('bps-'+id)||{}).value||'a4';
    const orient=(document.getElementById('bpo-'+id)||{}).value||'portrait';
    let[pw,ph]=PSZ[sKey]||[595,842];
    if(orient==='landscape')[pw,ph]=[ph,pw];
    const numP=safeInt((document.getElementById('bpp-'+id)||{}).value,1,1,500);
    const bgHex=(document.getElementById('bpb-'+id)||{}).value||'#ffffff';
    const gridType=(document.getElementById('bpgrid-'+id)||{}).value||'none';
    const lineHex=(document.getElementById('bplc-'+id)||{}).value||'#cccccc';
    // Parse colors
    const hexToRgb=h=>[1,3,5].map(o=>parseInt(h.slice(o,o+2),16)/255);
    const[br,bg,bb]=hexToRgb(bgHex);
    const[lr,lg,lb]=hexToRgb(lineHex);
    const lineColor=rgb(lr,lg,lb);
    setSt(id,'Creating…','inf');setPrg(id,20);
    const doc=await PDFDocument.create();
    for(let i=0;i<numP;i++){
      const page=doc.addPage([pw,ph]);
      // Background
      if(!(br>.99&&bg>.99&&bb>.99)){
        page.drawRectangle({x:0,y:0,width:pw,height:ph,color:rgb(br,bg,bb)});
      }
      // Ruling
      if(gridType==='lined'){
        const spacing=28.35; // ~1cm
        for(let y=ph%(spacing);y<ph;y+=spacing){
          page.drawLine({start:{x:36,y},end:{x:pw-36,y},thickness:0.4,color:lineColor,opacity:0.6});
        }
      } else if(gridType==='grid'){
        const spacing=28.35;
        for(let y=ph%(spacing);y<ph;y+=spacing)
          page.drawLine({start:{x:0,y},end:{x:pw,y},thickness:0.3,color:lineColor,opacity:0.5});
        for(let x=pw%(spacing);x<pw;x+=spacing)
          page.drawLine({start:{x,y:0},end:{x,y:ph},thickness:0.3,color:lineColor,opacity:0.5});
      } else if(gridType==='dot'){
        const spacing=28.35;
        for(let y=ph%(spacing);y<ph;y+=spacing)
          for(let x=pw%(spacing);x<pw;x+=spacing)
            page.drawCircle({x,y,size:0.7,color:lineColor,opacity:0.6});
      }
    }
    const bytes=await doc.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),`blank_${sKey}_${numP}p.pdf`);
    setPrg(id,100,'Done');
    setSt(id,`✓ Created ${numP} page(s) — ${sKey.toUpperCase()} ${gridType}`,'succ');
    toast('Blank PDF created');
    addHist({tool:'blank-pdf',fileName:numP+'p '+sKey,outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
}

// ── doMarkdown: reads margin, theme, A5 page size
async function doMarkdown(id){await awaitLibs();
  const md=(document.getElementById('mdi-'+id)||{}).value||'';
  const sKey=(document.getElementById('mds-'+id)||{}).value||'a4';
  const fontSize=safeInt((document.getElementById('mdfs-'+id)||{}).value,12,6,72);
  const margin=safeInt((document.getElementById('mdmg-'+id)||{}).value,50,10,120);
  const theme=(document.getElementById('mdtheme-'+id)||{}).value||'default';
  const PSZ_ALL=Object.assign({a5:[420,595]},PSZ||{a4:[595,842],letter:[612,792]});
  const[pw,ph]=PSZ_ALL[sKey]||[595,842];
  try{
    setSt(id,'Generating PDF…','inf');setPrg(id,30);
    const{PDFDocument,rgb}=PDFLib;
    const doc=await PDFDocument.create();
    const font=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    const bold=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const italic=await doc.embedFont(PDFLib.StandardFonts.HelveticaOblique);
    const maxW=pw-margin*2;
    // Theme color sets
    const themes={
      default:{h1:[.08,.04,.01],h2:[.12,.06,.02],h3:[.16,.08,.03],body:[.15,.15,.15],quote:[.4,.4,.5],bullet:[.18,.18,.18]},
      modern:{h1:[.878,.255,.165],h2:[.227,.416,.749],h3:[.067,.565,.439],body:[.1,.1,.1],quote:[.4,.4,.5],bullet:[.15,.15,.15]},
      minimal:{h1:[.08,.08,.08],h2:[.15,.15,.15],h3:[.22,.22,.22],body:[.2,.2,.2],quote:[.5,.5,.5],bullet:[.25,.25,.25]}
    };
    const t=themes[theme]||themes.default;
    const lines=[];
    md.split('\n').forEach(raw=>{
      if(/^# /.test(raw)) lines.push({text:raw.slice(2),f:bold,size:fontSize+10,sp:16,color:t.h1});
      else if(/^## /.test(raw)) lines.push({text:raw.slice(3),f:bold,size:fontSize+6,sp:12,color:t.h2});
      else if(/^### /.test(raw)) lines.push({text:raw.slice(4),f:bold,size:fontSize+3,sp:8,color:t.h3});
      else if(/^> /.test(raw)) lines.push({text:'  '+raw.slice(2),f:italic,size:fontSize,sp:4,color:t.quote,indent:12});
      else if(/^[-*] /.test(raw)) lines.push({text:'• '+raw.slice(2),f:font,size:fontSize,sp:3,color:t.bullet});
      else if(/^\d+\. /.test(raw)) lines.push({text:raw,f:font,size:fontSize,sp:3,color:t.bullet});
      else if(raw.trim()==='') lines.push({text:'',f:font,size:6,sp:0,color:[0,0,0]});
      else{
        const clean=raw.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1').replace(/`(.*?)`/g,'$1');
        lines.push({text:clean,f:font,size:fontSize,sp:3,color:t.body});
      }
    });
    let page=doc.addPage([pw,ph]);
    let y=ph-margin;
    const newPage=()=>{page=doc.addPage([pw,ph]);y=ph-margin;};
    lines.forEach(ln=>{
      if(!ln.text){y-=(ln.size||6);return;}
      const wrapped=wrapText(ln.text,ln.f,ln.size,maxW-(ln.indent||0));
      wrapped.forEach(chunk=>{
        if(y<margin+18)newPage();
        page.drawText(chunk,{x:margin+(ln.indent||0),y,size:ln.size,font:ln.f,color:rgb(...ln.color)});
        y-=ln.size+5;
      });
      y-=(ln.sp||0);
    });
    const bytes=await doc.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),'document.pdf');
    setPrg(id,100,'Done');
    setSt(id,'✓ PDF exported — '+fmt(bytes.byteLength),'succ');
    toast('Markdown → PDF ✓');
    addHist({tool:'markdown-to-pdf',fileName:'document.pdf',outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
}

// ── doHtmlToPdf: reads page size, margin, base font size from UI
async function doHtmlToPdf(id){await awaitLibs();
  const html=(document.getElementById('hti-'+id)||{}).value||'';
  if(!html.trim()){setSt(id,'Please enter some HTML content.','err');return;}
  const szKey=(document.getElementById('ht-sz-'+id)||{}).value||'a4';
  const margin=safeInt((document.getElementById('ht-mg-'+id)||{}).value,40,0,120);
  const baseFontSize=safeInt((document.getElementById('ht-fs-'+id)||{}).value,11,6,24);
  const PSZ_ALL=Object.assign({a5:[420,595]},PSZ||{a4:[595,842],letter:[612,792]});
  const[pw,ph]=PSZ_ALL[szKey]||[595,842];
  try{
    setSt(id,'Rendering HTML…','inf');setPrg(id,20);
    const _dp=new DOMParser();
    const _parsed=_dp.parseFromString(html,'text/html');
    const tmp=_parsed.body;
    const{PDFDocument,rgb}=PDFLib;
    const doc=await PDFDocument.create();
    const fontH=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const fontR=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    let page=doc.addPage([pw,ph]);
    let y=ph-margin;
    const usableW=pw-margin*2;
    const newPage=()=>{page=doc.addPage([pw,ph]);y=ph-margin;};
    const drawT=(text,font,size,col)=>{
      const chunks=wrapText(text,font,size,usableW);
      chunks.forEach(chunk=>{if(y<margin+10)newPage();page.drawText(chunk,{x:margin,y,size,font,color:rgb(...col)});y-=size+5;});
    };
    const walk=node=>{
      if(node.nodeType===3){const t=node.textContent.trim();if(t)drawT(t,fontR,baseFontSize,[.15,.15,.15]);}
      else if(node.nodeType===1){
        const tag=node.tagName.toLowerCase();
        if(tag==='h1'){y-=4;drawT(node.textContent,fontH,baseFontSize+9,[.1,.05,.02]);y-=6;}
        else if(tag==='h2'){y-=2;drawT(node.textContent,fontH,baseFontSize+5,[.1,.05,.02]);y-=4;}
        else if(tag==='h3'){drawT(node.textContent,fontH,baseFontSize+2,[.12,.07,.03]);y-=3;}
        else if(tag==='p'){drawT(node.textContent,fontR,baseFontSize,[.15,.15,.15]);y-=5;}
        else if(tag==='li'){drawT('• '+node.textContent,fontR,baseFontSize,[.18,.18,.18]);}
        else if(tag==='hr'){if(y>margin+20){page.drawLine({start:{x:margin,y},end:{x:pw-margin,y},thickness:0.5,color:rgb(.8,.8,.8)});y-=14;}}
        else if(tag==='br'){y-=baseFontSize+3;}
        else{node.childNodes.forEach(walk);}
      }
    };
    tmp.childNodes.forEach(walk);
    const bytes=await doc.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}),'html.pdf');
    setPrg(id,100,'Done');setSt(id,'✓ HTML exported as PDF — '+fmt(bytes.byteLength),'succ');toast('HTML → PDF ✓');
    addHist({tool:'html-to-pdf',fileName:'html.pdf',outSize:fmt(bytes.byteLength)});
  }catch(e){setPrg(id,0);setSt(id,'✕ '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
}



// ── doThumbnail: reads format (jpeg/png), scale/DPI, and quality from UI
async function doThumbnail(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:150});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  setBusy(id, true);
  try {
    var fmt_out = (document.getElementById('tn-fmt-'+id)||{value:'jpeg'}).value||'jpeg';
    var scale = safeFloat((document.getElementById('tn-sz-'+id)||{value:'1.5'}).value,1.5,0.3,4.0);
    var quality = safeFloat((document.getElementById('tn-q-'+id)||{value:'0.92'}).value,0.92,0.1,1.0);
    var mimeType = fmt_out==='png' ? 'image/png' : 'image/jpeg';
    var ext = fmt_out==='png' ? '.png' : '.jpg';
    setSt(id, 'Rendering thumbnails…', 'inf');
    var pdf = await pdfjsLib.getDocument({data: await f[0].arrayBuffer()}).promise;
    var total = pdf.numPages;
    var blobs = [], previews = [];
    for (var i = 1; i <= total; i++) {
      setPrg(id, (i/total)*90, 'Page ' + i + '/' + total);
      var page = await pdf.getPage(i);
      var vp = page.getViewport({scale: scale});
      var canvas = document.createElement('canvas');
      canvas.width = vp.width; canvas.height = vp.height;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({canvasContext: ctx, viewport: vp}).promise;
      var q = fmt_out==='png' ? undefined : quality;
      var blob = await new Promise(function(res){ canvas.toBlob(function(b){ res(b); }, mimeType, q); });
      var name = 'page_' + String(i).padStart(2,'0') + ext;
      blobs.push({name: name, blob: blob});
      previews.push({src: URL.createObjectURL(blob), label: 'p.' + i});
      page.cleanup();
    }
    pdf.destroy();
    setPrg(id, 95, 'Packaging…');
    var dlMode = (document.getElementById('pvDl-'+id)||{value:'individual'}).value||'individual';
    if (dlMode === 'zip' && blobs.length > 1) {
      var sz = await batchZip(blobs, 'thumbs_' + f[0].name.replace(/\.pdf$/i,'') + '.zip');
      setPrg(id, 100); setSt(id, '✓ ' + blobs.length + ' thumbnails → ZIP (' + fmt(sz) + ')', 'succ');
      toast(blobs.length + ' thumbnails zipped');
    } else {
      for (var j = 0; j < blobs.length; j++) { dlBlob(blobs[j].blob, blobs[j].name); if(j>0) await new Promise(function(r){setTimeout(r,150);}); }
      setPrg(id, 100); setSt(id, '✓ ' + blobs.length + ' thumbnail(s) downloaded', 'succ');
      toast(blobs.length + ' thumbnails downloaded');
    }
    pvShowImages(id, previews);
    pvReady(id);
    addHist({tool:'thumbnail', fileName:f[0].name, outSize:total+' images'});
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); toast(e.message, 'e'); }
  setBusy(id, false);
}

// ── v6.9.9 ADDITIONS ─────────────────────────────────────────

// HISTORY
var histLog = [];
var _histDirty = true; // track if re-render is needed
try { histLog = JSON.parse(localStorage.getItem('pf-hist') || '[]'); } catch(e) {}
function addHist(entry) {
  haptic([10, 30, 10]); // success vibration
  // BA 1.1: Track tool completion — the most critical analytics event
  try {
    if(window.plausible) window.plausible('tool_complete',{props:{tool:entry.tool||'unknown',outSize:entry.outSize||''}});
  } catch(e) {}
  histLog.unshift(Object.assign({}, entry, {t: Date.now()}));
  histLog = histLog.slice(0, 50);
  _histDirty = true;
  try { localStorage.setItem('pf-hist', JSON.stringify(histLog)); } catch(e) {
    toast('⚠ Storage full — history not saved. Clear browser storage to fix.', 'w', 5000);
  }
}
function renderHist() {
  _histDirty = false;
  var list = document.getElementById('histList');
  if (!list) return;
  if (!histLog.length) {
    list.innerHTML = '<div style="color:var(--tx3);font-size:.8rem;padding:2rem 0;text-align:center">No history yet.<br>Process a PDF to get started.</div>';
    return;
  }
  var icons = {merge:'🔗',split:'✂️',compress:'🗜️',rotate:'🔄',watermark:'💧',sign:'✍️',flatten:'📌',protect:'🔒',unlock:'🔓',redact:'⬛','pdf-to-word':'📝','form-builder':'📋','ai-summarize':'🤖','ai-qa':'💬','ai-translate':'🌍'};
  list.innerHTML = histLog.map(function(h) {
    var age = Math.round((Date.now() - h.t) / 60000);
    var ageStr = age < 1 ? 'just now' : age < 60 ? age + 'm ago' : Math.round(age/60) + 'h ago';
    var icon = icons[h.tool] || '📄';
    var toolName = (h.tool||'').replace(/-/g,' ').replace(/\b\w/g, function(c){return c.toUpperCase();});
    var filePart = h.fileName ? '<span style="opacity:.6">' + h.fileName.slice(0,28) + (h.fileName.length>28?'…':'') + '</span> · ' : '';
    var sizePart = h.outSize ? ' · ' + h.outSize : '';
    return '<div class="hist-item" style="display:flex;align-items:center;gap:.5rem"><div style="flex:1"><div class="hist-item-tool">' + icon + ' ' + toolName + '</div><div class="hist-item-meta">' + filePart + ageStr + sizePart + '</div></div><button class="btn-s" style="font-size:.68rem;padding:2px 8px;flex-shrink:0" onclick="openTool(\'' + (h.tool||'') + '\');document.getElementById(\'histPanel\')?.classList.remove(\'open\')" title="Re-open this tool">↗ Re-open</button></div>';
  }).join('');
}
function openHist() {
  // Don't open history on top of a tool modal
  if (document.getElementById('overlay')?.classList.contains('open')) return;
  if (_histDirty) renderHist();
  document.getElementById('histPanel').style.display = 'block';
  document.getElementById('histBackdrop').style.display = 'block';
}
function closeHist() {
  document.getElementById('histPanel').style.display = 'none';
  document.getElementById('histBackdrop').style.display = 'none';
}
function clearHist() {
  if (!histLog.length) return;
  _histDirty = true;
  // Keep a one-step backup for undo
  var _backup = histLog.slice();
  histLog = [];
  try { localStorage.removeItem('pf-hist'); } catch(e) {}
  renderHist();
  // Show undo toast using safe DOM methods — no innerHTML injection of backup data
  var toastEl = document.createElement('div');
  toastEl.className = 'toast';
  var _iconSpan = document.createElement('span'); _iconSpan.textContent = '✓';
  var _msgSpan = document.createElement('span'); _msgSpan.textContent = 'History cleared';
  var _undoBtn = document.createElement('button');
  _undoBtn.textContent = 'Undo';
  _undoBtn.style.cssText = 'margin-left:.6rem;background:none;border:1px solid rgba(255,255,255,.4);color:inherit;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:.75rem';
  var _capturedBackup = _backup; // safe closure
  _undoBtn.addEventListener('click', function() { undoHist(_undoBtn, _capturedBackup); });
  toastEl.appendChild(_iconSpan); toastEl.appendChild(_msgSpan); toastEl.appendChild(_undoBtn);
  var tc = document.getElementById('tc');
  if (tc) tc.appendChild(toastEl);
  setTimeout(function(){ toastEl.style.opacity='0'; setTimeout(function(){ toastEl.remove(); }, 200); }, 5000);
}
function undoHist(btn, backup) {
  histLog = backup;
  try { localStorage.setItem('pf-hist', JSON.stringify(histLog)); } catch(e) {}
  renderHist();
  var t = btn.closest('.toast');
  if (t) { t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 200); }
  toast('History restored');
}

// REDACT TOOL DEFINITION
TOOLS['redact'] = {
  t: 'Redact PDF',
  r: function(id) {
    return dzHTML(id, false, '.pdf') +
      '<div id="rdui-' + id + '" style="display:none">' +
        '<p style="font-size:.74rem;color:var(--tx3);margin:.5rem 0">Draw boxes over areas to redact. Use prev/next to navigate pages.</p>' +
        '<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.5rem">' +
          '<button class="btn-s" onclick="rdPrev(\'' + id + '\')">← Prev</button>' +
          '<span id="rdpg-' + id + '" style="font-size:.8rem;flex:1;text-align:center;color:var(--tx2)"></span>' +
          '<button class="btn-s" onclick="rdNext(\'' + id + '\')">Next →</button>' +
          '<button class="btn-s" onclick="rdClear(\'' + id + '\')">Clear Page</button>' +
        '</div>' +
        '<div style="position:relative;border:1px solid var(--bd);border-radius:6px;overflow:hidden;cursor:crosshair;user-select:none" id="rdwrap-' + id + '">' +
          '<canvas id="rdc-' + id + '" style="display:block;width:100%;max-height:60vh"></canvas>' +
          '<div id="rdboxes-' + id + '" style="position:absolute;inset:0"></div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doRedact(\'' + id + '\')" disabled>Apply Redactions &amp; Download</button>' +
      pvUI(id) + sf(id);
  },
  init: function(id) { initRedact(id); }
};

// PDF-TO-WORD TOOL DEFINITION
TOOLS['pdf-to-word'] = {
  t: 'PDF to Word',
  r: function(id) {
    return dzHTML(id, true, '.pdf') +
      '<div class="smsg warn show" style="margin:.6rem 0 .4rem;line-height:1.5">⚠️ <strong>Text extraction only:</strong> Outputs a .doc (RTF) file with plain text. Images, tables, columns, and complex formatting are not preserved. For full layout fidelity use Adobe Acrobat or a dedicated converter.</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doPdfToWord(\'' + id + '\')" disabled>Extract Text &amp; Download .doc</button>' +
      pvUI(id) + sf(id);
  }
};

// FORM BUILDER TOOL DEFINITION
TOOLS['form-builder'] = {
  t: 'PDF Form Builder',
  r: function(id) {
    return dzHTML(id, false, '.pdf') +
      '<div id="fbui-' + id + '" style="display:none">' +
        '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin:.7rem 0">' +
          '<button class="btn-s" onclick="fbTool(\'' + id + '\',\'text\')">✏ Text Field</button>' +
          '<button class="btn-s" onclick="fbTool(\'' + id + '\',\'check\')">☑ Checkbox</button>' +
          '<button class="btn-s" onclick="fbTool(\'' + id + '\',\'drop\')">▾ Dropdown</button>' +
          '<button class="btn-s" onclick="fbDel(\'' + id + '\')">🗑 Delete Selected</button>' +
        '</div>' +
        '<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:.4rem">' +
          '<button class="btn-s" onclick="fbPrev(\'' + id + '\')">← Prev</button>' +
          '<span id="fbpg-' + id + '" style="font-size:.8rem;flex:1;text-align:center;color:var(--tx2)"></span>' +
          '<button class="btn-s" onclick="fbNext(\'' + id + '\')">Next →</button>' +
        '</div>' +
        '<div style="position:relative;border:1px solid var(--bd);border-radius:6px;overflow:hidden;cursor:crosshair" id="fbwrap-' + id + '">' +
          '<canvas id="fbc-' + id + '" style="display:block;width:100%;max-height:60vh"></canvas>' +
          '<div id="fbfields-' + id + '" style="position:absolute;inset:0"></div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doFormBuilder(\'' + id + '\')" disabled>Save Form &amp; Download</button>' +
      pvUI(id) + sf(id);
  },
  init: function(id) { initFormBuilder(id); }
};

// AI TOOLS DEFINITIONS
// FIX 1: Helper that renders the API key field with session-only notice and opt-in persist checkbox
function _aiKeyField(id) {
  var k = (typeof getAiKey==='function') ? getAiKey() : '';
  var persisted = false;
  try { persisted = !!localStorage.getItem('pf-aikey'); } catch(e) {}
  return '<div class="field" style="margin-bottom:.3rem">' +
    '<label>Anthropic API Key</label>' +
    '<input type="password" id="aikey-' + id + '" placeholder="sk-ant-…" value="' + k + '" oninput="saveAiKey(this.value)" autocomplete="off">' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;flex-wrap:wrap">' +
      '<label style="display:flex;align-items:center;gap:.35rem;font-size:.72rem;color:var(--tx3);cursor:pointer">' +
        '<input type="checkbox" id="aiKeyPersist" style="width:14px;height:14px;cursor:pointer" ' + (persisted?' checked':'') + ' onchange="if(!this.checked){clearAiKey();toast(\'API key cleared from storage\',\'s\');}else if(document.getElementById(\'aikey-\'+\'' + id + '\').value){saveAiKey(document.getElementById(\'aikey-\'+\'' + id + '\').value);toast(\'Key saved to localStorage\',\'s\');}">' +
        'Remember key on this device' +
      '</label>' +
      '<span style="font-size:.68rem;color:var(--tx3)">· Session-only by default · Never sent to our servers</span>' +
    '</div>' +
    '<div class="smsg warn show" style="margin-bottom:.6rem;font-size:.7rem;padding:.4rem .7rem">🔒 Your key is stored in this browser only. <strong>Do not use on shared or public computers.</strong></div>';
}
TOOLS['ai-summarize'] = {
  t: 'AI Summarize PDF',
  r: function(id) {
    var mdl = (typeof _aiModel!=='undefined') ? _aiModel : 'claude-haiku-4-5-20251001';
    return _aiKeyField(id) +
      '<div class="field" style="margin-bottom:.7rem"><label>Model</label><select id="model-sel-' + id + '" style="width:100%" onchange="setAiModel(this.value)"><option value="claude-haiku-4-5-20251001"' + (mdl==='claude-haiku-4-5-20251001'?' selected':'') + '>⚡ Haiku — Fast &amp; cheap</option><option value="claude-sonnet-4-6"' + (mdl==='claude-sonnet-4-6'?' selected':'') + '>&#x1F9E0; Sonnet — Balanced</option><option value="claude-opus-4-6"' + (mdl==='claude-opus-4-6'?' selected':'') + '>&#x1F3C6; Opus — Most capable</option></select></div>' +
      dzHTML(id, false, '.pdf') +
      '<div class="field" style="margin-top:.7rem"><label>Focus on (optional)</label><input type="text" id="aifocus-' + id + '" placeholder="e.g. key findings, action items…"></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doAiSummarize(\'' + id + '\')" disabled>Summarize with AI</button>' +
      '<div class="rarea" id="aiR-' + id + '" style="display:none;margin-top:.9rem;white-space:pre-wrap;font-size:.82rem;line-height:1.6"></div>' +
      pvUI(id) + sf(id);
  }
};
TOOLS['ai-qa'] = {
  t: 'Ask PDF',
  r: function(id) {
    var mdl = (typeof _aiModel!=='undefined') ? _aiModel : 'claude-haiku-4-5-20251001';
    return _aiKeyField(id) +
      '<div class="field" style="margin-bottom:.7rem"><label>Model</label><select id="model-sel-' + id + '" style="width:100%" onchange="setAiModel(this.value)"><option value="claude-haiku-4-5-20251001"' + (mdl==='claude-haiku-4-5-20251001'?' selected':'') + '>⚡ Haiku — Fast &amp; cheap</option><option value="claude-sonnet-4-6"' + (mdl==='claude-sonnet-4-6'?' selected':'') + '>&#x1F9E0; Sonnet — Balanced</option><option value="claude-opus-4-6"' + (mdl==='claude-opus-4-6'?' selected':'') + '>&#x1F3C6; Opus — Most capable</option></select></div>' +
      dzHTML(id, false, '.pdf') +
      '<div class="field" style="margin-top:.7rem"><label>Your Question</label><input type="text" id="aiQ-' + id + '" placeholder="What is this document about?"></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doAiQa(\'' + id + '\')" disabled>Ask AI</button>' +
      '<div class="rarea" id="aiR-' + id + '" style="display:none;margin-top:.9rem;white-space:pre-wrap;font-size:.82rem;line-height:1.6"></div>' +
      pvUI(id) + sf(id);
  }
};
TOOLS['ai-translate'] = {
  t: 'AI Translate PDF',
  r: function(id) {
    var mdl = (typeof _aiModel!=='undefined') ? _aiModel : 'claude-haiku-4-5-20251001';
    return _aiKeyField(id) +
      '<div class="field" style="margin-bottom:.7rem"><label>Model</label><select id="model-sel-' + id + '" style="width:100%" onchange="setAiModel(this.value)"><option value="claude-haiku-4-5-20251001"' + (mdl==='claude-haiku-4-5-20251001'?' selected':'') + '>⚡ Haiku — Fast &amp; cheap</option><option value="claude-sonnet-4-6"' + (mdl==='claude-sonnet-4-6'?' selected':'') + '>&#x1F9E0; Sonnet — Balanced</option><option value="claude-opus-4-6"' + (mdl==='claude-opus-4-6'?' selected':'') + '>&#x1F3C6; Opus — Most capable</option></select></div>' +
      dzHTML(id, false, '.pdf') +
      '<div class="field" style="margin-top:.7rem"><label>Translate to</label><select id="aitl-' + id + '"><option>Spanish</option><option>French</option><option>German</option><option>Italian</option><option>Portuguese</option><option>Chinese (Simplified)</option><option>Japanese</option><option>Korean</option><option>Arabic</option><option>Hindi</option></select></div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doAiTranslate(\'' + id + '\')" disabled>Translate with AI</button>' +
      '<div class="rarea" id="aiR-' + id + '" style="display:none;margin-top:.9rem;white-space:pre-wrap;font-size:.82rem;line-height:1.6"></div>' +
      pvUI(id) + sf(id);
  }
};

// REDACT IMPLEMENTATION
function initRedact(id) {
  RD[id] = {boxes:{}, pg:1, pdf:null};
  var f = S[id] && S[id].files;
  if (!f || !f.length) return;
  setSt(id, 'Loading PDF…', 'inf');
  f[0].arrayBuffer().then(function(buf) {
    return pdfjsLib.getDocument({data:buf}).promise;
  }).then(function(pdf) {
    RD[id].pdf = pdf;
    document.getElementById('rdui-' + id).style.display = 'block';
    document.getElementById('btn-' + id).disabled = false;
    setSt(id, 'Draw boxes over areas to redact · ' + pdf.numPages + ' page(s)', 'inf');
    rdRender(id);
  }).catch(function(e) { setSt(id, '✕ ' + e.message, 'err'); });
}
function rdRender(id) {
  var rd = RD[id];
  if (!rd || !rd.pdf) return;
  var wrap = document.getElementById('rdwrap-' + id);
  var canvas = document.getElementById('rdc-' + id);
  var boxLayer = document.getElementById('rdboxes-' + id);
  rd.pdf.getPage(rd.pg).then(function(page) {
    var vp = page.getViewport({scale:1});
    var sc = (wrap.clientWidth || 400) / vp.width;
    var rvp = page.getViewport({scale: sc});
    canvas.width = rvp.width;
    canvas.height = rvp.height;
    page.render({canvasContext: canvas.getContext('2d'), viewport: rvp}).promise.then(function() {
      rdDrawBoxes(id);
    });
    document.getElementById('rdpg-' + id).textContent = 'Page ' + rd.pg + ' / ' + rd.pdf.numPages;
    // Reset event listeners by cloning
    var newLayer = boxLayer.cloneNode(false);
    boxLayer.parentNode.replaceChild(newLayer, boxLayer);
    var layer = newLayer;
    var drawing = false, sx = 0, sy = 0, preview = null;
    layer.onmousedown = function(e) {
      var r = layer.getBoundingClientRect();
      sx = (e.clientX - r.left) / r.width * 100;
      sy = (e.clientY - r.top) / r.height * 100;
      drawing = true;
    };
    layer.onmousemove = function(e) {
      if (!drawing) return;
      var r = layer.getBoundingClientRect();
      var ex = (e.clientX - r.left) / r.width * 100;
      var ey = (e.clientY - r.top) / r.height * 100;
      if (!preview) {
        preview = document.createElement('div');
        preview.style.cssText = 'position:absolute;background:rgba(0,0,0,.5);border:2px dashed #fff;pointer-events:none;box-sizing:border-box';
        layer.appendChild(preview);
      }
      preview.style.left = Math.min(sx,ex) + '%';
      preview.style.top = Math.min(sy,ey) + '%';
      preview.style.width = Math.abs(ex-sx) + '%';
      preview.style.height = Math.abs(ey-sy) + '%';
    };
    layer.onmouseup = function(e) {
      if (!drawing) return;
      drawing = false;
      var r = layer.getBoundingClientRect();
      var ex = (e.clientX - r.left) / r.width * 100;
      var ey = (e.clientY - r.top) / r.height * 100;
      if (preview) { preview.remove(); preview = null; }
      if (Math.abs(ex-sx) > 1 && Math.abs(ey-sy) > 1) {
        if (!rd.boxes[rd.pg]) rd.boxes[rd.pg] = [];
        rd.boxes[rd.pg].push({x:Math.min(sx,ex), y:Math.min(sy,ey), w:Math.abs(ex-sx), h:Math.abs(ey-sy)});
        rdDrawBoxes(id);
      }
    };
    rdDrawBoxes(id);
  });
}
function rdDrawBoxes(id) {
  var rd = RD[id];
  var layer = document.getElementById('rdboxes-' + id);
  if (!layer) return;
  Array.from(layer.querySelectorAll('.rdbox')).forEach(function(el) { el.remove(); });
  (rd.boxes[rd.pg] || []).forEach(function(b, i) {
    var el = document.createElement('div');
    el.className = 'rdbox';
    el.style.cssText = 'position:absolute;background:#000;left:'+b.x+'%;top:'+b.y+'%;width:'+b.w+'%;height:'+b.h+'%;cursor:pointer;box-sizing:border-box';
    el.title = 'Click to remove';
    el.onclick = function() {
      rd.boxes[rd.pg].splice(i, 1);
      rdDrawBoxes(id);
    };
    layer.appendChild(el);
  });
}
function rdPrev(id) { if (RD[id] && RD[id].pg > 1) { RD[id].pg--; rdRender(id); } }
function rdNext(id) { var rd=RD[id]; if (rd && rd.pdf && rd.pg < rd.pdf.numPages) { rd.pg++; rdRender(id); } }
/* rdClear defined below with toast notification */
async function doRedact(id) {await awaitLibs();
  if(!confirm('⚠️ Redaction is permanent and cannot be undone.\n\nAre you sure you want to continue?'))return;
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:150});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  setBusy(id, true);
  try {
    var rd = RD[id];
    var total = Object.values(rd.boxes).reduce(function(s,a){return s+a.length;}, 0);
    if (!total) { setSt(id, '⚠ Draw at least one box to redact', 'warn'); setBusy(id, false); return; }
    setSt(id, 'Applying ' + total + ' redaction(s)…', 'inf');
    setPrg(id, 20);
    var doc = await PDFLib.PDFDocument.load(await f[0].arrayBuffer(), {ignoreEncryption:true});
    var pages = doc.getPages();
    Object.keys(rd.boxes).forEach(function(pgStr) {
      var page = pages[parseInt(pgStr)-1];
      if (!page) return;
      var sz = page.getSize();
      rd.boxes[pgStr].forEach(function(b) {
        var px = b.x/100*sz.width;
        var pw = b.w/100*sz.width;
        var ph = b.h/100*sz.height;
        var py = sz.height - (b.y/100*sz.height) - ph;
        page.drawRectangle({x:px, y:py, width:pw, height:ph, color:PDFLib.rgb(0,0,0)});
      });
    });
    var bytes = await doc.save();
    dlBlob(new Blob([bytes], {type:'application/pdf'}), f[0].name.replace(/\.pdf$/i,'') + '_redacted.pdf');
    setPrg(id, 100, 'Done');
    setSt(id, '✓ ' + total + ' area(s) redacted — ' + fmt(bytes.byteLength), 'succ');
    pvShowCards(id,[{title:'redacted.pdf',lines:[{label:'Areas redacted',value:total},{label:'Output size',value:fmt(bytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'redact', fileName:f[0].name, outSize:fmt(bytes.byteLength)});
    toast('Redacted successfully');
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); toast(e.message, 'e'); }
  setBusy(id, false);
}

// PDF TO WORD IMPLEMENTATION
async function doPdfToWord(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:150});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  setBusy(id, true);
  var blobs = [];
  try {
    for (var fi=0; fi<f.length; fi++) {
      setSt(id, 'Extracting '+f[fi].name+'...', 'inf');
      setPrg(id, Math.round((fi/f.length)*85), 'File '+(fi+1)+'/'+f.length+'...');
      var result = await extractAllText(f[fi]);
      var lines = result.text.split('\n').filter(function(l){return l.trim();});
      var rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}}{\\colortbl;\\red0\\green0\\blue0;}\\f0\\fs24\\sa200 ';
      rtf += lines.map(function(line){
        var t=line.trim(); if(!t)return '\\par ';
        var e=t.replace(/\\/g,'\\\\').replace(/\{/g,'\\{').replace(/\}/g,'\\}').replace(/[^\x00-\x7F]/g,function(c){return '\\u'+c.charCodeAt(0)+'?';});
        var isH=t.length<80&&!t.endsWith('.')&&t===t.toUpperCase()&&t.replace(/\s/g,'').length>3;
        return isH?'{\\b\\f0\\fs28 '+e+'}\\par\\par ':e+'\\par ';
      }).join('');
      rtf += '}';
      var blob = new Blob([rtf],{type:'application/msword'});
      blobs.push({name:f[fi].name.replace(/\.pdf$/i,'')+'.doc', blob:blob, size:blob.size, pages:result.numPages});
    }
    setPrg(id,95,'Packaging...');
    var dlMode = (document.getElementById('pvDl-'+id)||{}).value || 'individual';
    if (dlMode==='zip' && blobs.length>1) {
      var sz=await batchZip(blobs,'word_docs_'+Date.now()+'.zip');
      setPrg(id,100); setSt(id,'✓ '+blobs.length+' .doc(s) -> ZIP ('+fmt(sz)+')','succ'); toast(blobs.length+' .docs zipped');
    } else {
      for(let i=0;i<blobs.length;i++){dlBlob(blobs[i].blob,blobs[i].name);if(i>0)await new Promise(function(r){setTimeout(r,200);});}
      setPrg(id,100); setSt(id,'✓ '+blobs.length+' .doc file(s) downloaded','succ'); toast('PDF → Word ✓');
    }
    pvShowCards(id,blobs.map(function(b){return{title:b.name,lines:[{label:'Pages',value:b.pages},{label:'Doc size',value:fmt(b.size)}]};}));
    pvReady(id);
    addHist({tool:'pdf-to-word', fileName:f.length+' file(s)', outSize:blobs.length+' .docs'});
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); toast(e.message, 'e'); }
  setBusy(id, false);
}

// PDF TO EXCEL TOOL DEFINITION
TOOLS['pdf-to-excel'] = {
  t: 'PDF to Excel / CSV',
  r: function(id) {
    return '<div style="background:rgba(5,150,105,.07);border:1px solid rgba(5,150,105,.2);border-radius:var(--rs);padding:.7rem .9rem;margin-bottom:.85rem;font-size:.76rem;line-height:1.6;color:var(--tx2)">' +
      '<strong style="color:var(--green)">📊 How PDF to Excel works:</strong><br>' +
      '1. Drop your PDF &nbsp;·&nbsp; 2. Choose output format (.xlsx / CSV / TSV / JSON) &nbsp;·&nbsp; 3. Click <strong>Extract &amp; Download</strong><br>' +
      '<span style="font-size:.69rem;color:var(--tx3)">Uses a 5-phase column-detection engine — works on bank statements, invoices, and structured tables. All processing is 100% in your browser.</span>' +
    '</div>' +
    dzHTML(id, true, '.pdf') +
      '<div class="og" style="margin-top:.9rem">' +
        '<div class="field"><label>Output Format</label>' +
          '<select id="pxfmt-' + id + '" onchange="pxFmtChange(\'' + id + '\')">' +
            '<option value="xlsx" selected>Excel (.xlsx) — opens in MS Excel, Google Sheets</option>' +
            '<option value="csv">CSV — comma separated</option>' +
            '<option value="tsv">TSV — tab separated</option>' +
            '<option value="json">JSON — structured data</option>' +
          '</select>' +
        '</div>' +
        '<div class="field" id="pxdelim-wrap-' + id + '" style="display:none"><label>CSV Delimiter</label>' +
          '<select id="pxd-' + id + '">' +
            '<option value="," selected>Comma ( , )</option>' +
            '<option value=";">Semicolon ( ; )</option>' +
            '<option value="|">Pipe ( | )</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="og">' +
        '<div class="field"><label>Table Detection</label>' +
          '<select id="pxtd-' + id + '">' +
            '<option value="smart" selected>Smart (auto-detect tables)</option>' +
            '<option value="all">All text as rows</option>' +
            '<option value="dense">Dense tables only</option>' +
          '</select>' +
        '</div>' +
        '<div class="field"><label>Sheets / Output</label>' +
          '<select id="pxsheets-' + id + '">' +
            '<option value="one" selected>One sheet (all pages combined)</option>' +
            '<option value="perpage">One sheet per page</option>' +
            '<option value="perfile">One file per PDF</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="og">' +
        '<div class="field"><label>Header Row</label>' +
          '<select id="pxh-' + id + '">' +
            '<option value="auto" selected>Auto-detect</option>' +
            '<option value="yes">First row is always header</option>' +
            '<option value="no">No header row</option>' +
          '</select>' +
        '</div>' +
        '<div class="field"><label>Download As</label>' +
          '<select id="pxzip-' + id + '">' +
            '<option value="individual" selected>Individual files</option>' +
            '<option value="zip">ZIP archive</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div id="pxxlsx-opts-' + id + '">' +
        '<div class="og">' +
          '<div class="field"><label>Excel Styling</label>' +
            '<select id="pxstyle-' + id + '">' +
              '<option value="styled" selected>Styled headers + alternating rows</option>' +
              '<option value="plain">Plain (no styling)</option>' +
            '</select>' +
          '</div>' +
          '<div class="field"><label>Auto Column Width</label>' +
            '<select id="pxcolw-' + id + '">' +
              '<option value="yes" selected>Yes — fit content</option>' +
              '<option value="no">No — default width</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="brow" style="margin-top:.7rem;gap:.4rem;flex-wrap:wrap">' +
        '<button class="btn-s" id="pxprev-' + id + '" style="display:none" onclick="pxShowPreview(\'' + id + '\')">👁 Preview Data</button>' +
        '<button class="btn-s" id="pxclr-' + id + '" style="display:none;color:var(--ac)" onclick="PX[\'' + id + '\']=null;document.getElementById(\'pxpanel-\'+\'' + id + '\').style.display=\'none\';document.getElementById(\'pxprev-\'+\'' + id + '\').style.display=\'none\';setSt(\'' + id + '\',\'\',\'inf\')">↺ Reset</button>' +
      '</div>' +
      '<div id="pxpanel-' + id + '" style="display:none;margin-top:.8rem">' +
        '<div id="pxnav-' + id + '" style="display:flex;align-items:center;gap:.4rem;margin-bottom:.5rem;flex-wrap:wrap"></div>' +
        '<div id="pxinfo-' + id + '" style="font-size:.7rem;color:var(--tx3);font-family:\'JetBrains Mono\',monospace;margin-bottom:.4rem"></div>' +
        '<div id="pxtable-' + id + '" class="pxtable-wrap" style="overflow-x:auto;max-height:300px;border:1px solid var(--bd);border-radius:8px"></div>' +
      '</div>' +
      '<button class="btn-p" id="btn-' + id + '" onclick="doPdfToExcel(\'' + id + '\')" disabled style="margin-top:.7rem">Extract &amp; Download</button>' +
      pvUI(id) + sf(id);
  }
};

// ── PDF TO EXCEL v3 — Column-Detection Engine (bank-statement grade) ──────────
// Root causes of v2 failure on bank statements:
//  1. No column detection — just Y-buckets, completely misses right-aligned numbers
//  2. Word-merge gap (3px) destroyed column boundaries
//  3. No distinction between intra-column gaps vs inter-column gaps
//  4. Numbers left as strings — Excel cannot sort/sum them
//  5. No header/footer filtering — account numbers mixed into data rows
//  6. Uniform normalisation broke variable-column-count rows
//
// v3 Solution — 5-phase pipeline:
//  Phase 1: Group items into rows by tight Y-bucket
//  Phase 2: Detect column zones via gap-frequency analysis across all rows
//  Phase 3: Assign each item to its column zone
//  Phase 4: Parse cell values — numbers, dates, currency, CR/DR
//  Phase 5: Smart column-count normalisation (modal not max)
// ─────────────────────────────────────────────────────────────────────────────

var PX = {};

function pxFmtChange(id) {
  var fmt = (document.getElementById('pxfmt-' + id) || {}).value || 'xlsx';
  var delimWrap = document.getElementById('pxdelim-wrap-' + id);
  var xlsxOpts  = document.getElementById('pxxlsx-opts-' + id);
  if (delimWrap) delimWrap.style.display = (fmt === 'csv') ? '' : 'none';
  if (xlsxOpts)  xlsxOpts.style.display  = (fmt === 'xlsx') ? '' : 'none';
  if (PX[id]) PX[id] = null;
}

// Phase 1 — Group text items into rows using tight Y-bucket
function pxGroupIntoRows(items) {
  if (!items || !items.length) return [];
  var heights = items.map(function(it){
    return Math.abs(it.transform[0]) || it.height || 10;
  }).filter(function(h){return h>2;}).sort(function(a,b){return a-b;});
  var medH = heights[Math.floor(heights.length/2)] || 10;
  // Tight bucket = 55% of median line height keeps distinct lines separate
  var bucket = Math.max(3, medH * 0.55);
  var rowMap={}, yKeys=[];
  items.forEach(function(item){
    if (!item.str || !item.str.trim()) return;
    var y = Math.round(item.transform[5] / bucket) * bucket;
    if (!rowMap[y]){rowMap[y]=[];yKeys.push(y);}
    rowMap[y].push({
      x: item.transform[4],
      y: item.transform[5],
      w: item.width || (item.str.length * medH * 0.55),
      h: Math.abs(item.transform[0]) || medH,
      text: item.str
    });
  });
  yKeys.sort(function(a,b){return b-a;});
  return yKeys.map(function(y){
    return rowMap[y].sort(function(a,b){return a.x-b.x;});
  });
}

// Phase 2 — Detect column zone boundaries via gap-frequency analysis
function pxDetectColumns(rows, pageWidth) {
  if (!rows.length) return null;
  pageWidth = pageWidth || 600;
  var GAP_THRESHOLD = 10;
  var gapHisto = {};
  rows.forEach(function(row){
    for (var i=0;i<row.length-1;i++){
      var right = row[i].x + row[i].w;
      var left  = row[i+1].x;
      var gap   = left - right;
      if (gap >= GAP_THRESHOLD){
        var mid = Math.round((right + gap/2) / 4) * 4;
        gapHisto[mid] = (gapHisto[mid]||0) + 1;
      }
    }
  });
  var minCount = Math.max(2, rows.length * 0.18);
  var boundaries = Object.keys(gapHisto)
    .filter(function(x){return gapHisto[x]>=minCount;})
    .map(Number)
    .sort(function(a,b){return a-b;});
  if (!boundaries.length) return null;
  // Merge close boundaries
  var merged = [boundaries[0]];
  for (var i=1;i<boundaries.length;i++){
    if (boundaries[i] - merged[merged.length-1] > 15){
      merged.push(boundaries[i]);
    } else if (gapHisto[boundaries[i]] > gapHisto[merged[merged.length-1]]){
      merged[merged.length-1] = boundaries[i];
    }
  }
  // Build zones
  var zones=[], prev=0;
  merged.forEach(function(b){zones.push([prev,b]);prev=b;});
  zones.push([prev, pageWidth+50]);
  return zones;
}

// Phase 3 — Assign items to column zones
function pxAssignToColumns(row, zones) {
  if (!zones) return pxMergeProximity(row);
  var cells = zones.map(function(){return [];});
  row.forEach(function(item){
    var mid = item.x + item.w/2;
    var best = 0, bestDist = Infinity;
    for (var zi=0;zi<zones.length;zi++){
      if (mid>=zones[zi][0] && mid<zones[zi][1]){best=zi;bestDist=0;break;}
      var zm = (zones[zi][0]+zones[zi][1])/2;
      var d  = Math.abs(mid-zm);
      if (d<bestDist){bestDist=d;best=zi;}
    }
    cells[best].push(item);
  });
  return cells.map(function(colItems){
    if (!colItems.length) return '';
    colItems.sort(function(a,b){return a.x-b.x;});
    return colItems.map(function(it){return it.text.trim();}).join(' ').trim();
  });
}

function pxMergeProximity(row) {
  if (!row.length) return [];
  var COL_GAP = 18;
  var groups  = [[row[0]]];
  for (var i=1;i<row.length;i++){
    var prev = groups[groups.length-1];
    var last = prev[prev.length-1];
    if (row[i].x - (last.x+last.w) <= COL_GAP){
      prev.push(row[i]);
    } else {
      groups.push([row[i]]);
    }
  }
  return groups.map(function(g){return g.map(function(it){return it.text.trim();}).join(' ').trim();});
}

// Phase 4 — Parse cell value: detect numbers, currency, dates, CR/DR
function pxParseCell(raw) {
  if (!raw || !raw.trim()) return '';
  var s = raw.trim();
  // Strip leading currency symbols
  var stripped = s.replace(/^[\u00a3\u0024\u20ac\u00a5\u20b9\u20a9\u00a2\s]+/,'').replace(/[\u00a3\u0024\u20ac\u00a5\u20b9\u20a9\u00a2\s]+$/,'').trim();
  var isCr = /\s*CR\s*$/i.test(stripped);
  var isDr = /\s*DR\s*$/i.test(stripped);
  var numStr = stripped.replace(/\s*(CR|DR)\s*$/i,'').trim();
  // Strip thousand separators (commas) and try parse
  var cleaned = numStr.replace(/,/g,'');
  if (/^-?[\d.]+$/.test(cleaned) && cleaned !== '' && cleaned !== '-'){
    var num = parseFloat(cleaned);
    if (!isNaN(num)) return isDr ? -Math.abs(num) : num;
  }
  // Date patterns
  if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(s)) return s;
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4}$/.test(s)) return s;
  return s;
}

// Phase 5 — Filter metadata rows (headers, footers, account info)
function pxIsMetaRow(cells) {
  if (!cells||!cells.length) return true;
  var j = cells.map(function(c){return String(c);}).join(' ').toLowerCase();
  return [
    /^page\s+\d+/,/continued on/,/continued from/,
    /account (number|no\.?|:)/i,/sort code/i,/statement (date|period|for)/i,
    /opening balance/i,/closing balance/i,/brought forward/i,/carried forward/i,
    /this is not a/i,/branch:/i,/bank plc/i,/registered in/i,
    /customer (no|ref|id)/i,/dear\s+/i
  ].some(function(p){return p.test(j);});
}

// Smart normalise — use modal column count, not max
function pxSmartNormalise(rows) {
  if (!rows.length) return rows;
  var freq={};
  rows.forEach(function(r){freq[r.length]=(freq[r.length]||0)+1;});
  var threshold = rows.length * 0.2;
  var dataCols = parseInt(
    Object.keys(freq)
      .filter(function(k){return freq[k]>=threshold;})
      .sort(function(a,b){return freq[b]-freq[a];})[0]
    || Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];})[0]
  );
  return rows.map(function(row){
    var r=row.slice();
    while(r.length<dataCols) r.push('');
    return r;
  });
}

// Header row detection
function pxIsHeader(row) {
  if (!row||!row.length) return false;
  var strCells = row.filter(function(c){
    var s=String(c).trim();
    return s.length>0 && typeof c==='string' && isNaN(parseFloat(s.replace(/,/g,'')));
  });
  return strCells.length >= Math.ceil(row.length*0.6);
}

// CSV helper
function pxRowsToCSV(rows, delim) {
  delim = delim||',';
  return rows.map(function(row){
    return row.map(function(cell){
      var s=String(cell==null?'':cell).replace(/"/g,'""');
      if (s.indexOf(delim)!==-1||s.indexOf('"')!==-1||s.indexOf('\n')!==-1||s.indexOf('\r')!==-1) s='"'+s+'"';
      return s;
    }).join(delim);
  }).join('\r\n');
}

// JSON helper
function pxRowsToJSON(rows, hasHeader) {
  if (!rows.length) return '[]';
  var keys = hasHeader ? rows[0] : rows[0].map(function(_,i){return 'col'+(i+1);});
  return JSON.stringify((hasHeader?rows.slice(1):rows).map(function(row){
    var obj={};
    keys.forEach(function(k,i){obj[String(k)||('col'+(i+1))]=row[i]!==undefined?row[i]:'';});
    return obj;
  }), null, 2);
}

// XLSX builder with proper number formatting
function pxBuildXlsx(sheets, options) {
  if (typeof XLSX==='undefined') throw new Error('SheetJS not loaded — please wait and try again.');
  var wb = XLSX.utils.book_new();
  sheets.forEach(function(sheet){
    var rows = sheet.rows;
    if (!rows||!rows.length){
      var ws=XLSX.utils.aoa_to_sheet([['No data detected']]);
      XLSX.utils.book_append_sheet(wb,ws,(sheet.name||'Sheet1').slice(0,31));
      return;
    }
    var ws = XLSX.utils.aoa_to_sheet(rows,{raw:false});
    if (options.autoWidth){
      var cw=[];
      rows.forEach(function(row){row.forEach(function(c,ci){var l=c!==null&&c!==undefined?String(c).length:0;cw[ci]=Math.max(cw[ci]||6,Math.min(l+3,55));});});
      ws['!cols']=cw.map(function(w){return{wch:w};});
    }
    if (options.hasHeader&&rows.length>1) ws['!freeze']={xSplit:0,ySplit:1,topLeftCell:'A2',activePane:'bottomLeft'};
    if (options.styled&&rows.length>0){
      var range=XLSX.utils.decode_range(ws['!ref']||'A1');
      for (var C=range.s.c;C<=range.e.c;C++){
        var hAddr=XLSX.utils.encode_cell({r:0,c:C});
        if (ws[hAddr]) ws[hAddr].s={font:{bold:true,color:{rgb:'FFFFFF'},sz:10,name:'Calibri'},fill:{fgColor:{rgb:'1E3A5F'}},alignment:{horizontal:'center',vertical:'center'},border:{bottom:{style:'medium',color:{rgb:'2563EB'}}}};
        for (var R=1;R<=range.e.r;R++){
          var cAddr=XLSX.utils.encode_cell({r:R,c:C});
          if (!ws[cAddr]) continue;
          var isNum=typeof ws[cAddr].v==='number';
          ws[cAddr].s={fill:{fgColor:{rgb:R%2===0?'EEF4FB':'FFFFFF'}},font:{sz:10,name:'Calibri'},alignment:{horizontal:isNum?'right':'left',vertical:'center'},border:{bottom:{style:'thin',color:{rgb:'DBEAFE'}}}};
          if (isNum&&Math.abs(ws[cAddr].v)<10000000) ws[cAddr].z='#,##0.00';
        }
      }
      var rh=[{hpt:20}];
      for (var R2=1;R2<=range.e.r;R2++) rh.push({hpt:16});
      ws['!rows']=rh;
    }
    XLSX.utils.book_append_sheet(wb,ws,(sheet.name||'Sheet1').replace(/[\\\/\?\*\[\]:]/g,'_').slice(0,31));
  });
  return XLSX.write(wb,{bookType:'xlsx',type:'array',cellStyles:true});
}

// Main extraction — called per-page with phase pipeline
async function pxExtractPage(pdfPage, mode, pageWidth) {
  var tc = await pdfPage.getTextContent({normalizeWhitespace:false,disableCombineTextItems:false});
  var items = tc.items;
  if (!items||!items.length) return [];
  var rawRows = pxGroupIntoRows(items);
  if (!rawRows.length) return [];
  var zones = (mode!=='all') ? pxDetectColumns(rawRows, pageWidth) : null;
  var tableRows = [];
  rawRows.forEach(function(row){
    var cells = pxAssignToColumns(row, zones);
    var hasContent = cells.some(function(c){return c!=='';});
    if (!hasContent) return;
    var parsed = cells.map(function(c){return pxParseCell(c);});
    if (mode==='smart' && pxIsMetaRow(parsed.map(function(c){return String(c);}))) return;
    tableRows.push(parsed);
  });
  return tableRows;
}

// Process all files
async function pxProcess(id) {
  var f = S[id]&&S[id].files;
  var _fErr = guardFiles(f||[],{types:['pdf'],maxMB:150});
  if (_fErr){setSt(id,_fErr,'err');return false;}
  PX[id]={results:[],pg:0};
  var mode       = (document.getElementById('pxtd-'+id)||{}).value||'smart';
  var sheetsMode = (document.getElementById('pxsheets-'+id)||{}).value||'one';
  var hdrMode    = (document.getElementById('pxh-'+id)||{}).value||'auto';
  setSt(id,'Extracting tables…','inf');
  for (var fi=0;fi<f.length;fi++){
    setPrg(id,Math.round((fi/f.length)*85),'File '+(fi+1)+'/'+f.length+'…');
    try{
      var buf=await f[fi].arrayBuffer();
      var pdf=await pdfjsLib.getDocument({data:buf}).promise;
      var pageData=[];
      for (var p=1;p<=pdf.numPages;p++){
        setPrg(id,Math.round((fi/f.length)*85+(p/pdf.numPages)*(85/f.length)),'Page '+p+'/'+pdf.numPages);
        var pdfPage=await pdf.getPage(p);
        var vp=pdfPage.getViewport({scale:1});
        var rows=await pxExtractPage(pdfPage,mode,vp.width);
        pageData.push({pageNum:p,rows:rows});
        pdfPage.cleanup();
      }
      pdf.destroy();
      var allRows=[];
      pageData.forEach(function(pd){allRows=allRows.concat(pd.rows);});
      allRows=pxSmartNormalise(allRows);
      var hasHeader=hdrMode==='yes'?true:hdrMode==='no'?false:pxIsHeader(allRows[0]);
      PX[id].results.push({name:f[fi].name.replace(/\.pdf$/i,''),fileName:f[fi].name,pageData:pageData,allRows:allRows,hasHeader:hasHeader,pages:pdf.numPages||pageData.length});
    }catch(e){
      PX[id].results.push({name:f[fi].name,fileName:f[fi].name,pageData:[],allRows:[],hasHeader:false,pages:0,error:e.message});
    }
  }
  setPrg(id,95,'Done');
  return true;
}

// Preview
async function pxShowPreview(id) {
  try{
    if (!PX[id]||!PX[id].results||!PX[id].results.length){
      setSt(id,'Processing…','inf');setBusy(id,true);
      var ok=await pxProcess(id);setBusy(id,false);
      if(!ok)return;
    }
    var panel=document.getElementById('pxpanel-'+id);
    var nav=document.getElementById('pxnav-'+id);
    if(panel)panel.style.display='block';
    PX[id].pg=0;pxRenderPreview(id);
    if(nav){
      nav.innerHTML=PX[id].results.map(function(r,i){
        var lbl=r.name.slice(0,18)+(r.name.length>18?'…':'');
        return '<button class="btn-s px-nav-btn" style="font-size:.7rem;padding:3px 10px" onclick="PX[\''+id+'\'].pg='+i+';pxRenderPreview(\''+id+'\')">'+esc(lbl)+'</button>';
      }).join('');
    }
    pxHighlightNav(id);
  }catch(e){setSt(id,'Preview error: '+e.message,'err');}
}

function pxHighlightNav(id){
  var nav=document.getElementById('pxnav-'+id);
  if(!nav||!PX[id])return;
  Array.from(nav.querySelectorAll('.px-nav-btn')).forEach(function(b,i){
    var a=i===PX[id].pg;
    b.style.background=a?'var(--ac)':'';b.style.color=a?'#fff':'';b.style.borderColor=a?'var(--ac)':'';
  });
}

function pxRenderPreview(id){
  var r=PX[id]&&PX[id].results[PX[id].pg];
  var container=document.getElementById('pxtable-'+id);
  var infoEl=document.getElementById('pxinfo-'+id);
  if(!container)return;
  if(!r){container.innerHTML='<p style="padding:.8rem;color:var(--tx3)">No file selected.</p>';return;}
  if(r.error){container.innerHTML='<p style="padding:.8rem;color:var(--ac)">Error: '+esc(r.error)+'</p>';return;}
  if(!r.allRows.length){container.innerHTML='<p style="padding:.8rem;color:var(--tx3)">No structured data detected.<br><small>Try <strong>All text as rows</strong> mode.</small></p>';return;}
  var preview=r.allRows.slice(0,80);
  var maxCols=Math.max.apply(null,preview.map(function(row){return row.length;}));
  var isH=r.hasHeader&&preview.length>1;
  if(infoEl) infoEl.textContent=r.allRows.length+' rows \xd7 '+maxCols+' cols \xb7 '+r.pages+' page(s) \xb7 header '+(isH?'detected \u2713':'not detected');
  var hdrRow=preview[0];
  var bodyRows=isH?preview.slice(1):preview;
  var thead='<tr>'+hdrRow.map(function(c){return '<th style="background:var(--sf3);font-weight:700;font-size:.68rem;white-space:nowrap;position:sticky;top:0">'+esc(String(c||''))+'</th>';}).join('')+'</tr>';
  var tbody=bodyRows.map(function(row,ri){
    while(row.length<maxCols)row.push('');
    var bg=ri%2===1?'background:rgba(0,0,0,.025)':'';
    return '<tr style="'+bg+'">'+row.map(function(c){
      var val=c!==undefined&&c!==null?c:'';
      var isNum=typeof val==='number';
      var display=isNum?val.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}):esc(String(val));
      var align=isNum?'text-align:right;font-family:"JetBrains Mono",monospace;':'';
      return '<td style="'+align+'">'+display+'</td>';
    }).join('')+'</tr>';
  }).join('');
  var more=r.allRows.length>80?'<p style="padding:.4rem .8rem;color:var(--tx3);font-size:.7rem">Showing 80 of '+r.allRows.length+' rows</p>':'';
  container.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:.72rem;white-space:nowrap"><thead style="position:sticky;top:0;z-index:1">'+thead+'</thead><tbody>'+tbody+'</tbody></table>'+more;
  container.querySelectorAll('th,td').forEach(function(el){el.style.cssText+=';border:1px solid var(--bd);padding:4px 8px;max-width:240px;overflow:hidden;text-overflow:ellipsis;vertical-align:middle';});
  pxHighlightNav(id);
}

// Download handler
async function doPdfToExcel(id){await awaitLibs();await awaitXLSX();
  if(!S[id]||!S[id].files||!S[id].files.length){setSt(id,'Please add a file first.','err');setBusy(id,false);return;}
  
  var f=S[id]&&S[id].files;
  var _fErr=guardFiles(f||[],{types:['pdf'],maxMB:150});
  if(_fErr){setSt(id,_fErr,'err');setBusy(id,false);return;}
  setBusy(id,true);
  if(!PX[id]||!PX[id].results||!PX[id].results.length){
    var ok=await pxProcess(id);if(!ok){setBusy(id,false);return;}
  }
  var fmtVal    =(document.getElementById('pxfmt-'+id)||{}).value||'xlsx';
  var delim     =(document.getElementById('pxd-'+id)||{}).value||',';
  var zipMode   =(document.getElementById('pxzip-'+id)||{}).value==='zip';
  var sheetsMode=(document.getElementById('pxsheets-'+id)||{}).value||'one';
  var styled    =(document.getElementById('pxstyle-'+id)||{value:'styled'}).value!=='plain';
  var autoW     =(document.getElementById('pxcolw-'+id)||{value:'yes'}).value!=='no';
  setPrg(id,96,'Building output…');
  try{
    var outputs=[],results=PX[id].results;
    for(var fi=0;fi<results.length;fi++){
      var r=results[fi];
      if(r.error){setSt(id,'⚠ '+r.fileName+': '+r.error,'warn');continue;}
      if(!r.allRows.length){setSt(id,'⚠ '+r.fileName+': no data found','warn');continue;}
      var baseName=r.name;
      if(fmtVal==='xlsx'){
        var sheets=[];
        if(sheetsMode==='perpage'){
          r.pageData.forEach(function(pd){if(pd.rows&&pd.rows.length>1)sheets.push({name:'Page '+pd.pageNum,rows:pxSmartNormalise(pd.rows)});});
          if(!sheets.length)sheets.push({name:'Sheet1',rows:r.allRows});
        }else{sheets=[{name:'Sheet1',rows:r.allRows}];}
        var xlsxData=pxBuildXlsx(sheets,{styled:styled,autoWidth:autoW,hasHeader:r.hasHeader});
        outputs.push({name:baseName,ext:'xlsx',blob:new Blob([xlsxData],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})});
      }else if(fmtVal==='csv'){
        var csvRows=r.allRows.map(function(row){return row.map(function(c){return String(c===null||c===undefined?'':c);});});
        if(sheetsMode==='perpage'){
          r.pageData.forEach(function(pd){if(pd.rows&&pd.rows.length){var csv=pxRowsToCSV(pd.rows.map(function(row){return row.map(function(c){return String(c||'');});}),delim);outputs.push({name:baseName+'_p'+pd.pageNum,ext:'csv',blob:new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})});}});
        }else{var csv=pxRowsToCSV(csvRows,delim);outputs.push({name:baseName,ext:'csv',blob:new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})});}
      }else if(fmtVal==='tsv'){
        outputs.push({name:baseName,ext:'tsv',blob:new Blob([pxRowsToCSV(r.allRows.map(function(row){return row.map(function(c){return String(c||'');});}),'\t')],{type:'text/tab-separated-values;charset=utf-8'})});
      }else if(fmtVal==='json'){
        outputs.push({name:baseName,ext:'json',blob:new Blob([pxRowsToJSON(r.allRows,r.hasHeader)],{type:'application/json;charset=utf-8'})});
      }
    }
    if(!outputs.length){setSt(id,'No structured data found in any file','err');setBusy(id,false);return;}
    if(zipMode&&outputs.length>1){
      var zip=new JSZip();
      outputs.forEach(function(o){zip.file(o.name+'.'+o.ext,o.blob);});
      var zipBlob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
      dlBlob(zipBlob,'pdf_tables_'+Date.now()+'.zip');
      setPrg(id,100);setSt(id,'✓ '+outputs.length+' file(s) \u2192 ZIP ('+fmt(zipBlob.size)+')','succ');toast(outputs.length+' file(s) zipped');
    }else{
      for(var oi=0;oi<outputs.length;oi++){dlBlob(outputs[oi].blob,outputs[oi].name+'.'+outputs[oi].ext);if(oi>0)await new Promise(function(res){setTimeout(res,350);});}
      setPrg(id,100);
      var fmtLabel={xlsx:'Excel .xlsx',csv:'CSV',tsv:'TSV',json:'JSON'}[fmtVal]||fmtVal.toUpperCase();
      setSt(id,'✓ '+outputs.length+' '+fmtLabel+' file(s) downloaded','succ');toast(outputs.length+' '+fmtLabel+' file(s) ready');
    }
    var prevBtn=document.getElementById('pxprev-'+id);
    var clrBtn=document.getElementById('pxclr-'+id);
    if(prevBtn)prevBtn.style.display='inline-flex';
    if(clrBtn)clrBtn.style.display='inline-flex';
    addHist({tool:'pdf-to-excel',fileName:results.length+' PDF(s)',outSize:outputs.length+' '+fmtVal+' file(s)'});
  }catch(e){setPrg(id,0);setSt(id,'\u2715 '+e.message,'err');toast(e.message,'e');setBusy(id,false);}
  setBusy(id,false);
}

// File processing hooks active


// ── ZIP + PREVIEW SHARED HELPERS ────────────────────────────────
async function batchZip(blobs, zipName) {
  // Guard: estimate total size before creating ZIP
  var totalBytes = blobs.reduce(function(s,b){ return s + (b.size||b.blob.size||0); }, 0);
  var GB2 = 2 * 1024 * 1024 * 1024;
  if (totalBytes > GB2 * 0.9) {
    throw new Error('Combined output (' + Math.round(totalBytes/1024/1024) + ' MB) is too large to ZIP. Process files in smaller batches.');
  }
  try {
    var zip = new JSZip();
    blobs.forEach(function(b){ zip.file(b.name, b.blob); });
    var zb = await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
    dlBlob(zb, zipName);
    return zb.size;
  } catch(e) { console.error('batchZip',e); throw e; }
}
function pvToggle(id) {
  var p = document.getElementById('pvPanel-'+id);
  if (!p) return;
  var open = p.style.display !== 'none';
  p.style.display = open ? 'none' : 'block';
  var btn = document.getElementById('pvBtn-'+id);
  if (btn) btn.textContent = open ? '👁 Preview' : '👁 Hide Preview';
}
function pvShowCards(id, cards) {
  var p = document.getElementById('pvPanel-'+id);
  if (!p) return;
  p.innerHTML = '<div class="pv-cards-row" id="pv-'+id+'">' +
    cards.map(function(c){
      return '<div class="pv-card-item" style="flex:1;min-width:160px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.65rem .85rem">' +
        '<div class="pv-card-title" style="font-weight:700;font-size:.73rem;color:var(--tx2);margin-bottom:.35rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(c.title)+'">'+esc(c.title)+'</div>' +
        c.lines.map(function(l){
          // Savings row — add color coding inline for compress %
          var valStr = esc(String(l.value));
          var extraStyle = '';
          if (l.label === 'Saved') {
            var pct = parseFloat(l.value);
            if (pct >= 20) extraStyle = 'color:var(--green);font-weight:800';
            else if (pct > 0) extraStyle = 'color:var(--amber);font-weight:700';
            else { valStr = '±0% — already optimised'; extraStyle = 'color:var(--tx3)'; }
          }
          return '<div class="pv-card-row" style="display:flex;justify-content:space-between;font-size:.69rem;padding:1px 0">'+
            '<span class="pv-label" style="color:var(--tx3)">'+esc(l.label)+'</span>'+
            '<span class="pv-val" style="font-weight:600;'+extraStyle+'">'+valStr+'</span>'+
          '</div>';
        }).join('') +
      '</div>';
    }).join('') + '</div>';
  p.style.display = 'block';
  var btn = document.getElementById('pvBtn-'+id);
  if (btn) btn.textContent = '👁 Hide Preview';
}
function pvShowImages(id, imgs) {
  var p = document.getElementById('pvPanel-'+id);
  if (!p) return;
  p.innerHTML = '<div class="pv-img-grid">' +
    imgs.map(function(img){
      return '<div class="pv-img-item">' +
        '<img src="'+img.src+'" alt="PDF page '+img.label+' preview" loading="lazy">' +
        '<div style="font-size:.62rem;color:var(--tx3);margin-top:2px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(img.label)+'</div>' +
      '</div>';
    }).join('') + '</div>';
  p.style.display = 'block';
  var btn = document.getElementById('pvBtn-'+id);
  if (btn) btn.textContent = '👁 Hide Preview';
}
function pvShowText(id, results) {
  var p = document.getElementById('pvPanel-'+id);
  if (!p) return;
  if (results.length === 1) {
    p.innerHTML = '<div style="max-height:220px;overflow-y:auto;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem;font-size:.72rem;white-space:pre-wrap;word-break:break-word;color:var(--tx2)">'+esc(results[0].text.slice(0,4000))+(results[0].text.length>4000?'\n\u2026(truncated)':'')+'</div>';
  } else {
    var tabs = results.map(function(r,i){ return '<button class="btn-s pvtab" style="font-size:.68rem;padding:2px 9px" onclick="pvSwitchTab(\''+id+'\','+i+')">'+esc(r.title.slice(0,16))+'</button>'; }).join('');
    var panels = results.map(function(r,i){ return '<div class="pvtabpanel" id="pvtp-'+id+'-'+i+'" style="display:'+(i===0?'block':'none')+';max-height:200px;overflow-y:auto;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:.8rem;font-size:.72rem;white-space:pre-wrap;word-break:break-word;color:var(--tx2)">'+esc(r.text.slice(0,4000))+(r.text.length>4000?'\n\u2026(truncated)':'')+'</div>'; }).join('');
    p.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.4rem">'+tabs+'</div>'+panels;
    var first = p.querySelector('.pvtab');
    if (first){first.style.background='var(--ac)';first.style.color='#fff';first.style.borderColor='var(--ac)';}
  }
  p.style.display = 'block';
  var btn = document.getElementById('pvBtn-'+id);
  if (btn) btn.textContent = '👁 Hide Preview';
}
function pvSwitchTab(id, idx) {
  var p = document.getElementById('pvPanel-'+id);
  if (!p) return;
  p.querySelectorAll('.pvtabpanel').forEach(function(el,i){ el.style.display = i===idx?'block':'none'; });
  p.querySelectorAll('.pvtab').forEach(function(b,i){ b.style.background=i===idx?'var(--ac)':''; b.style.color=i===idx?'#fff':''; b.style.borderColor=i===idx?'var(--ac)':''; });
}
function pvUI(id) {
  return '<div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:.7rem 0 0">' +
    '<button class="btn-s" id="pvBtn-'+id+'" style="display:none" onclick="pvToggle(\''+id+'\')">👁 Preview</button>' +
    '<select id="pvDl-'+id+'" style="font-size:.73rem;padding:4px 8px;border-radius:6px;border:1px solid var(--bd);background:var(--sf2);color:var(--tx2);cursor:pointer;display:none">' +
      '<option value="individual">Download individually</option>' +
      '<option value="zip">Download as ZIP</option>' +
    '</select></div>' +
    '<div id="pvPanel-'+id+'" style="display:none;margin-top:.5rem"></div>' +
    '<div id="pv-'+id+'-chain"></div>';
}
function pvReady(id) {
  var btn = document.getElementById('pvBtn-'+id);
  var sel = document.getElementById('pvDl-'+id);
  if (btn) btn.style.display = 'inline-flex';
  if (sel) sel.style.display = 'inline-block';
}
// ── END ZIP + PREVIEW HELPERS ────────────────────────────────────
// FORM BUILDER IMPLEMENTATION
function initFormBuilder(id) {
  FB[id] = {fields:[], pg:1, pdf:null, tool:'text', sel:null};
  var f = S[id] && S[id].files;
  if (!f || !f.length) return;
  f[0].arrayBuffer().then(function(buf) {
    return pdfjsLib.getDocument({data:buf}).promise;
  }).then(function(pdf) {
    FB[id].pdf = pdf;
    document.getElementById('fbui-' + id).style.display = 'block';
    document.getElementById('btn-' + id).disabled = false;
    fbRender(id);
  }).catch(function(e) { setSt(id, '✕ ' + e.message, 'err'); });
}
function fbRender(id) {
  var fb = FB[id];
  if (!fb || !fb.pdf) return;
  var wrap = document.getElementById('fbwrap-' + id);
  var canvas = document.getElementById('fbc-' + id);
  fb.pdf.getPage(fb.pg).then(function(page) {
    var vp = page.getViewport({scale:1});
    var sc = (wrap.clientWidth || 400) / vp.width;
    var rvp = page.getViewport({scale:sc});
    canvas.width = rvp.width;
    canvas.height = rvp.height;
    page.render({canvasContext:canvas.getContext('2d'), viewport:rvp});
    document.getElementById('fbpg-' + id).textContent = 'Page ' + fb.pg + ' / ' + fb.pdf.numPages;
    fbDrawFields(id);
    // Click to add fields
    var overlay = document.getElementById('fbfields-' + id);
    var newOverlay = overlay.cloneNode(false);
    overlay.parentNode.replaceChild(newOverlay, overlay);
    newOverlay.onclick = function(e) {
      if (e.target !== newOverlay) return;
      var r = newOverlay.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * 100;
      var y = (e.clientY - r.top) / r.height * 100;
      fb.fields.push({id:Date.now(), type:fb.tool, pg:fb.pg, x:x, y:y, w:22, h:4.5});
      fbDrawFields(id);
    };
  });
}
function fbDrawFields(id) {
  var fb = FB[id];
  var overlay = document.getElementById('fbfields-' + id);
  if (!overlay) return;
  Array.from(overlay.querySelectorAll('.fbf')).forEach(function(el){el.remove();});
  fb.fields.filter(function(f){return f.pg===fb.pg;}).forEach(function(field) {
    var el = document.createElement('div');
    el.className = 'fbf';
    var label = field.type === 'check' ? '☑ Checkbox' : field.type === 'drop' ? '▾ Dropdown' : '✏ Text Field';
    el.style.cssText = 'position:absolute;border:2px solid #2563eb;background:rgba(37,99,235,.13);border-radius:3px;cursor:pointer;box-sizing:border-box;left:'+field.x+'%;top:'+field.y+'%;width:'+field.w+'%;height:'+field.h+'%;display:flex;align-items:center;justify-content:center;font-size:.58rem;color:#2563eb;font-weight:700;white-space:nowrap;overflow:hidden';
    el.textContent = label;
    el.title = 'Click to select/delete';
    el.onclick = function(e) {
      e.stopPropagation();
      if (fb.sel === field.id) {
        // double select = delete
        fb.fields = fb.fields.filter(function(f){return f.id!==field.id;});
        fb.sel = null;
        fbDrawFields(id);
      } else {
        fb.sel = field.id;
        Array.from(overlay.querySelectorAll('.fbf')).forEach(function(x){x.style.borderColor='#2563eb';});
        el.style.borderColor = '#dc2626';
      }
    };
    overlay.appendChild(el);
  });
}
function fbTool(id, t) { if (FB[id]) FB[id].tool = t; }
function fbDel(id) {
  var fb = FB[id];
  if (!fb) return;
  if (fb.sel) {
    fb.fields = fb.fields.filter(function(f){return f.id!==fb.sel;});
    fb.sel = null;
  } else {
    fb.fields = fb.fields.filter(function(f){return f.pg!==fb.pg;});
  }
  fbDrawFields(id);
}
function fbPrev(id) { if (FB[id] && FB[id].pg>1) { FB[id].pg--; fbRender(id); } }
function fbNext(id) { var fb=FB[id]; if (fb && fb.pdf && fb.pg<fb.pdf.numPages) { fb.pg++; fbRender(id); } }
async function doFormBuilder(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:150});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  var fb = FB[id];
  if (!fb || !fb.fields.length) { setSt(id, '⚠ Click on the PDF preview to add fields first', 'warn'); return; }
  setBusy(id, true);
  try {
    setSt(id, 'Building form…', 'inf');
    setPrg(id, 30);
    var doc = await PDFLib.PDFDocument.load(await f[0].arrayBuffer(), {ignoreEncryption:true});
    var form = doc.getForm();
    var pages = doc.getPages();
    fb.fields.forEach(function(field, i) {
      var page = pages[field.pg-1];
      if (!page) return;
      var sz = page.getSize();
      var x = field.x/100*sz.width;
      var w = field.w/100*sz.width;
      var h = field.h/100*sz.height;
      var y = sz.height - (field.y/100*sz.height) - h;
      var name = field.type + '_field_' + (i+1);
      try {
        if (field.type === 'check') {
          var cb = form.createCheckBox(name);
          cb.addToPage(page, {x:x, y:y, width:Math.min(w,h), height:Math.min(w,h)});
        } else if (field.type === 'drop') {
          var dd = form.createDropdown(name);
          dd.addOptions(['Option 1', 'Option 2', 'Option 3']);
          dd.addToPage(page, {x:x, y:y, width:w, height:h});
        } else {
          var tf = form.createTextField(name);
          tf.addToPage(page, {x:x, y:y, width:w, height:h});
        }
      } catch(fieldErr) { /* skip duplicate names */ }
    });
    var bytes = await doc.save();
    dlBlob(new Blob([bytes],{type:'application/pdf'}), f[0].name.replace(/\.pdf$/i,'') + '_form.pdf');
    setPrg(id, 100, 'Done');
    setSt(id, '✓ Form with ' + fb.fields.length + ' field(s) created · ' + fmt(bytes.byteLength), 'succ');
    addHist({tool:'form-builder', fileName:f[0].name, outSize:fmt(bytes.byteLength)});
    toast('Form PDF ready');
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); toast(e.message, 'e'); }
  setBusy(id, false);
}

// AI TOOLS IMPLEMENTATION
async function callClaude(apiKey, system, userMsg) {
  try {
    checkAiRateLimit();
    var model = (typeof _aiModel !== 'undefined') ? _aiModel : 'claude-haiku-4-5-20251001';
    var _ac = new AbortController();
    var _timer = setTimeout(function(){ _ac.abort(); }, 30000);
    var resp;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({ model:model, max_tokens:2048, system:system, messages:[{role:'user',content:userMsg}] }),
        signal: _ac.signal
      });
    } catch(fetchErr) {
      clearTimeout(_timer);
      if (fetchErr.name === 'AbortError') throw new Error('Request timed out (30s). Check your connection and try again.');
      throw fetchErr;
    }
    clearTimeout(_timer);
    if (!resp.ok) { var e=await resp.json().catch(function(){return{};}); throw new Error((e.error&&e.error.message)||'API error '+resp.status); }
    var data = await resp.json();
    return (data.content&&data.content[0]&&data.content[0].text)||'';
  } catch(e) { throw new Error('Claude API: '+e.message); }
}
// AI rate limiting — prevent rapid successive calls
var _aiLastCall = 0;
var _AI_COOLDOWN_MS = 3000; // 3 second minimum between calls

function _checkAiCooldown(id) {
  var now = Date.now();
  var elapsed = now - _aiLastCall;
  if (_aiLastCall > 0 && elapsed < _AI_COOLDOWN_MS) {
    var wait = Math.ceil((_AI_COOLDOWN_MS - elapsed) / 1000);
    setSt(id, '⏳ Please wait ' + wait + 's before making another AI request', 'warn');
    return false;
  }
  _aiLastCall = now;
  return true;
}

async function doAiSummarize(id) {
  await awaitLibs();
  if (!_checkAiCooldown(id)) return;
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:50});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  var key = document.getElementById('aikey-'+id).value.trim();
  if (!key) { setSt(id, '⚠ Enter your Anthropic API key above', 'warn'); return; }
  setBusy(id, true);
  try {
    var textResults = [];
    for (var fi=0; fi<f.length; fi++) {
      setPrg(id, Math.round((fi/f.length)*90), 'File '+(fi+1)+'/'+f.length+'...');
      setSt(id, 'Processing '+f[fi].name+'...', 'inf');
      var chunks = await extractAndChunk(f[fi], 12000);
      var focus=document.getElementById('aifocus-'+id)?document.getElementById('aifocus-'+id).value.trim():'';var systemPrompt='You are a precise document analyst. Provide structured summaries with clear sections. Use markdown formatting.';
      var userMsg='Summarize this '+result.numPages+'-page PDF'+(focus?', focusing on: '+focus:'')+'.\n\n'+result.text.slice(0,15000);
      var reply = await callClaude(key, systemPrompt, userMsg);
      textResults.push({title:f[fi].name, text:reply});
    }
    setPrg(id, 100, 'Done');
    setSt(id, '✓ Summary complete for '+f.length+' file(s)', 'succ');
    pvShowText(id, textResults);
    pvReady(id);
    addHist({tool:'ai-summarize', fileName:f.length+' file(s)'});
    try{if(window.plausible)window.plausible('ai_complete',{props:{tool:'ai-summarize',files:String(f.length)}});}catch(e){}
    toast('Summary ready ✓');
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); }
  setBusy(id, false);
}
async function doAiQa(id) {
  await awaitLibs();
  if (!_checkAiCooldown(id)) return;
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:50});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  var key = document.getElementById('aikey-'+id).value.trim();
  if (!key) { setSt(id, '⚠ Enter your Anthropic API key above', 'warn'); return; }
  setBusy(id, true);
  try {
    var textResults = [];
    for (var fi=0; fi<f.length; fi++) {
      setPrg(id, Math.round((fi/f.length)*90), 'File '+(fi+1)+'/'+f.length+'...');
      setSt(id, 'Processing '+f[fi].name+'...', 'inf');
      var result = await extractAllText(f[fi]);
      var q=document.getElementById('aiQ-'+id)?document.getElementById('aiQ-'+id).value.trim():'What are the main points?';var systemPrompt='You are a document analyst. Answer questions accurately based solely on the document content.';
      var userMsg='Document ('+result.numPages+' pages):\n'+result.text.slice(0,12000)+'\n\nQuestion: '+q;
      var reply = await callClaude(key, systemPrompt, userMsg);
      textResults.push({title:f[fi].name, text:reply});
    }
    setPrg(id, 100, 'Done');
    setSt(id, '✓ Answer complete for '+f.length+' file(s)', 'succ');
    pvShowText(id, textResults);
    pvReady(id);
    addHist({tool:'ai-qa', fileName:f.length+' file(s)'});
    try{if(window.plausible)window.plausible('ai_complete',{props:{tool:'ai-qa',files:String(f.length)}});}catch(e){}
    toast('Answer ready ✓');
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); }
  setBusy(id, false);
}
async function doAiTranslate(id) {
  await awaitLibs();
  if (!_checkAiCooldown(id)) return;
  var f = S[id] && S[id].files;
  var _fErr = guardFiles(f||[], {types:['pdf'],maxMB:50});
  if (_fErr) { setSt(id,_fErr,'err'); return; }
  var key = document.getElementById('aikey-'+id).value.trim();
  if (!key) { setSt(id, '⚠ Enter your Anthropic API key above', 'warn'); return; }
  setBusy(id, true);
  try {
    var textResults = [];
    for (var fi=0; fi<f.length; fi++) {
      setPrg(id, Math.round((fi/f.length)*90), 'File '+(fi+1)+'/'+f.length+'...');
      setSt(id, 'Processing '+f[fi].name+'...', 'inf');
      var result = await extractAllText(f[fi]);
      var lang=document.getElementById('aitl-'+id)?document.getElementById('aitl-'+id).value:'Spanish';var systemPrompt='You are a professional translator. Translate accurately, preserving structure.';
      var userMsg='Translate the following text to '+lang+':\n\n'+result.text.slice(0,12000);
      var reply = await callClaude(key, systemPrompt, userMsg);
      textResults.push({title:f[fi].name, text:reply});
    }
    setPrg(id, 100, 'Done');
    setSt(id, '✓ Translation complete for '+f.length+' file(s)', 'succ');
    pvShowText(id, textResults);
    pvReady(id);
    addHist({tool:'ai-translate', fileName:f.length+' file(s)'});
    try{if(window.plausible){var _lang=document.getElementById('aitl-'+id)?document.getElementById('aitl-'+id).value:'unknown';window.plausible('ai_complete',{props:{tool:'ai-translate',lang:_lang}});};}catch(e){}
    toast('Translation ready ✓');
  } catch(e) {setPrg(id,0); setSt(id, '✕ ' + e.message, 'err'); }
  setBusy(id, false);
}



// ── AI TEXT CHUNKER ──────────────────────────────────────────────
// Split large PDFs into chunks for Claude API (avoids silent truncation)
async function extractAndChunk(file, maxChars) {
  maxChars = maxChars || 12000;
  var result = await extractAllText(file);
  var text = result.text;
  var numPages = result.numPages;
  if (text.length <= maxChars) return [{text: text, pages: '1-'+numPages, isChunk: false}];
  // Split into chunks preserving paragraph boundaries
  var chunks = [];
  var chunkSize = maxChars;
  var start = 0;
  var chunkNum = 1;
  var pagesPerChunk = Math.ceil(numPages / Math.ceil(text.length / maxChars));
  while (start < text.length) {
    var end = Math.min(start + chunkSize, text.length);
    // Try to break at paragraph boundary
    if (end < text.length) {
      var breakAt = text.lastIndexOf('\n\n', end);
      if (breakAt > start + chunkSize * 0.5) end = breakAt;
    }
    var startPage = Math.min(Math.ceil((start / text.length) * numPages) + 1, numPages);
    var endPage = Math.min(Math.ceil((end / text.length) * numPages), numPages);
    chunks.push({
      text: text.slice(start, end),
      pages: startPage + '-' + endPage,
      isChunk: true,
      chunkNum: chunkNum
    });
    start = end;
    chunkNum++;
  }
  return chunks;
}

// ── LAZY XLSX LOADER ─────────────────────────────────────────────
// SheetJS is 900KB — only load it when PDF→Excel tool is actually opened
var _xlsxLoaded = false;
var _xlsxLoading = null;
function awaitXLSX() {
  if (typeof XLSX !== 'undefined') return Promise.resolve();
  if (_xlsxLoading) return _xlsxLoading;
  _xlsxLoading = new Promise(function(resolve, reject) {
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = function() { _xlsxLoaded = true; resolve(); };
    s.onerror = function() { reject(new Error('SheetJS failed to load. Check internet connection.')); };
    document.head.appendChild(s);
  });
  return _xlsxLoading;
}

// ESC closes history panel
(function() {
  var origKeydown = document.onkeydown;
  document.addEventListener('keydown', function(e) {
    var tag = (document.activeElement.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (e.key === 'Escape') {
      closeHist();
      document.getElementById('shcut').classList.remove('on');
    }
    if (typing) return;
    if (e.key === '?' || e.key === '/' ) {
      e.preventDefault();
      document.getElementById('shcut').classList.toggle('on');
    }
    if ((e.key === 'd' || e.key === 'D') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      toggleTheme();
    }
    // Tab shortcuts: 1=All, 2=Organize, 3=Convert, 4=Edit, 5=Security, 6=Analyze, 7=Create, 8=AI, 9=Favourites
    var _tabKeys = {'1':'all','2':'organize','3':'convert','4':'edit','5':'security','6':'analyze','7':'create','8':'ai','9':'favs'};
    if (_tabKeys[e.key] && !e.metaKey && !e.ctrlKey) {
      var tabEl = document.querySelector('.tab[data-cat="'+_tabKeys[e.key]+'"]');
      if (tabEl && tabEl.style.display !== 'none') tabEl.click();
    }
    if ((e.key === 'h' || e.key === 'H') && !e.metaKey && !e.ctrlKey) {
      // openHist() already blocks when modal is open
      var histOpen = document.getElementById('histPanel').style.display !== 'none';
      histOpen ? closeHist() : openHist();
    }
  });
})();

// ── Markdown Editor Helpers ──────────────────────────────────────
function mdRender(src) {
  // Simple but solid markdown renderer
  // URL sanitizer — only allow safe schemes
  function _safeUrl(url) {
    var u = url.trim();
    if (/^(https?:|mailto:|\/|#|\.\.?\/)/i.test(u)) return u;
    return '#'; // Block javascript:, data:, vbscript:, etc.
  }
  var h = src
    // Escape HTML first
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // Code blocks (``` ... ```)
    .replace(/```([\s\S]*?)```/g, function(_,c){return '<pre><code>'+c.trim()+'</code></pre>';})
    // Inline code
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    // Bold+italic
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    // HR
    .replace(/^---+$/gm,'<hr>')
    // Headings
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
    // Unordered list items — group them
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g,function(m){return '<ul>'+m+'</ul>';})
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm,'<li>$1</li>')
    // Links [text](url) — sanitized href, noopener noreferrer
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(_,text,url){
      return '<a href="'+_safeUrl(url)+'" target="_blank" rel="noopener noreferrer">'+text+'</a>';
    })
    // Paragraphs — wrap lines not already in a block tag
    .split('\n\n')
    .map(function(block) {
      if (/^<(h[1-6]|ul|ol|li|pre|blockquote|hr)/.test(block.trim())) return block;
      var trimmed = block.trim();
      if (!trimmed) return '';
      return '<p>' + trimmed.replace(/\n/g,'<br>') + '</p>';
    })
    .join('\n');
  return h;
}

function mdPreview(id) {
  var ta = document.getElementById('mdi-'+id);
  var pv = document.getElementById('mdpv-'+id);
  if (ta && pv) pv.innerHTML = mdRender(ta.value);
}

function mdSetView(id, view) {
  var panes = document.getElementById('mdp-'+id);
  if (!panes) return;
  panes.dataset.view = view;
  ['edit','split','preview'].forEach(function(v) {
    var btn = document.getElementById('mdv-'+v+'-'+id);
    if (btn) btn.classList.toggle('active', v === view);
  });
  if (view === 'preview' || view === 'split') mdPreview(id);
}

function mdWrapCode(id) { mdWrap(id, '`', '`'); }

function mdWrap(id, before, after) {
  var ta = document.getElementById('mdi-'+id);
  if (!ta) return;
  var s = ta.selectionStart, e = ta.selectionEnd;
  var sel = ta.value.slice(s, e) || 'text';
  ta.value = ta.value.slice(0,s) + before + sel + after + ta.value.slice(e);
  ta.selectionStart = s + before.length;
  ta.selectionEnd = s + before.length + sel.length;
  ta.focus();
  mdPreview(id);
}

function mdInsert(id, prefix) {
  var ta = document.getElementById('mdi-'+id);
  if (!ta) return;
  var s = ta.selectionStart;
  var lineStart = ta.value.lastIndexOf('\n', s-1) + 1;
  ta.value = ta.value.slice(0,lineStart) + prefix + ta.value.slice(lineStart);
  ta.selectionStart = ta.selectionEnd = lineStart + prefix.length;
  ta.focus();
  mdPreview(id);
}


// ── PWA SERVICE WORKER ───────────────────────────────────────────────────────
// Registers an inline SW using a data: URI (works in Chrome/Edge/Firefox).
// Blob URL registration is blocked by many browsers — this approach is safe.
// Falls back silently — the app works fully without a SW.
(function(){
  if (!('serviceWorker' in navigator)) return;

  // Only register when served over http/https (not file://, blob://, etc.)
  var proto = location.protocol;
  if (proto !== 'http:' && proto !== 'https:') return;

  var swCode = [
    "const CACHE='dublesh-v6.9.9';",
    "const CDNS=['https://cdnjs.cloudflare.com','https://fonts.googleapis.com','https://fonts.gstatic.com'];",
    "self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll([])));});",
    "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});",
    "self.addEventListener('fetch',e=>{",
    "  var url=e.request.url;",
    "  var isCDN=CDNS.some(cdn=>url.startsWith(cdn));",
    "  if(isCDN){e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(resp=>{if(resp&&resp.status===200){var clone=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return resp;}).catch(()=>cached);}));return;}",
    "  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(resp=>{if(resp&&resp.status===200){var clone=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return resp;}).catch(()=>caches.match(e.request)));}",
    "});"
  ].join('\n');

  // Try data: URI first (works in Chrome 71+, Firefox, Edge)
  // Fall back to blob: URI for older Chrome
  function tryRegister(url) {
    return navigator.serviceWorker.register(url, {scope: './'})
      .then(function(reg) {
        reg.addEventListener('updatefound', function() {
          var nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', function() {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              if (typeof toast === 'function') toast('App updated — reload for latest version', 'i', 5000);
            }
          });
        });
      });
  }

  var dataUrl = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(swCode);
  tryRegister(dataUrl).catch(function() {
    // data: URI failed — try blob: (works on some older browsers)
    try {
      var blobUrl = URL.createObjectURL(new Blob([swCode], {type: 'text/javascript'}));
      tryRegister(blobUrl).catch(function() {
        URL.revokeObjectURL(blobUrl);
        // Both failed — app still works fully without SW, no need to warn user
      });
    } catch(e) {
      // Blob creation failed — ignore silently
    }
  });
})();


// ════════════════════════════════════════════════════════════════
// LAUNCH IMPROVEMENTS — v6.9.9
// ════════════════════════════════════════════════════════════════

// ── AI SETTINGS (model selector + localStorage key persistence) ──
var _aiModel = (function(){ try { return localStorage.getItem('pf-aimodel') || 'claude-haiku-4-5-20251001'; } catch(e) { return 'claude-haiku-4-5-20251001'; } })();
function setAiModel(m) { _aiModel = m; try { localStorage.setItem('pf-aimodel', m); } catch(e) {} }

// FIX 1: API key is stored in sessionStorage only by default (cleared on tab close).
// localStorage persistence is opt-in via the "Remember key" checkbox shown in the AI tools UI.
// This prevents permanent key exposure via DevTools, browser extensions, or future XSS.
function getAiKey() {
  try {
    return localStorage.getItem('pf-aikey') || sessionStorage.getItem('pf-aikey') || '';
  } catch(e) { return ''; }
}
function saveAiKey(k) {
  if (!k) return;
  // BA 1.2: Track AI key entry — measures drop-off at API key step
  try { if(window.plausible && k.length > 10) window.plausible('ai_key_entered'); } catch(e) {}
  try {
    // Default: persist to localStorage (BA rec 6.2) — user can uncheck to session-only
    var persist = document.getElementById('aiKeyPersist');
    var usePersist = persist && persist.checked === true; // default false — session-only by default
    sessionStorage.setItem('pf-aikey', k);
    if (usePersist) localStorage.setItem('pf-aikey', k);
    _updateAiReadyIndicator();
  } catch(e) {}
}
function clearAiKey() {
  try { sessionStorage.removeItem('pf-aikey'); localStorage.removeItem('pf-aikey'); } catch(e) {}
  _updateAiReadyIndicator();
}
function _updateAiReadyIndicator() {
  var hasKey = !!getAiKey();
  var ind = document.getElementById('aiReadyInd');
  if (ind) { ind.style.display = hasKey ? 'flex' : 'none'; }
}

// ── AI RATE LIMIT GUARD (FIX 7: now uses sessionStorage rolling window, survives across tool opens) ──
var _AI_RATE_WINDOW = 60000; // 1 minute
var _AI_RATE_MAX    = 15;    // max calls per minute
function checkAiRateLimit() {
  var now = Date.now();
  var log = [];
  try { log = JSON.parse(sessionStorage.getItem('pf-ai-rlog') || '[]'); } catch(e) {}
  // Prune entries older than the window
  log = log.filter(function(t){ return now - t < _AI_RATE_WINDOW; });
  if (log.length >= _AI_RATE_MAX) {
    var oldest = log[0];
    var wait = Math.ceil((_AI_RATE_WINDOW - (now - oldest)) / 1000);
    throw new Error('Rate limit: ' + _AI_RATE_MAX + ' requests/min reached. Wait ' + wait + 's.');
  }
  log.push(now);
  try { sessionStorage.setItem('pf-ai-rlog', JSON.stringify(log)); } catch(e) {}
}

// ── PASSWORD STRENGTH METER ──────────────────────────────────────
function pwStrength(id, pw) {
  var bar = document.getElementById('pwsb-'+id);
  var lbl = document.getElementById('pwsl-'+id);
  if (!bar || !lbl) return;
  var score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  var levels = [{},{pct:'20%',bg:'#ef4444',label:'Very weak'},{pct:'40%',bg:'#f97316',label:'Weak'},{pct:'60%',bg:'#eab308',label:'Fair'},{pct:'80%',bg:'#22c55e',label:'Strong'},{pct:'100%',bg:'#16a34a',label:'Very strong'}];
  var l = levels[score] || {};
  bar.style.width = pw.length ? (l.pct||'0%') : '0%';
  bar.style.background = l.bg || 'var(--bd)';
  lbl.textContent = pw.length ? (l.label||'') : '';
  lbl.style.color = l.bg || 'var(--tx3)';
}

// ── WEB SHARE API ────────────────────────────────────────────────
function shareTool() {
  var title = (document.getElementById('modalTitle')||{}).textContent || 'Dublesh';
  var tweetText = 'Just used ' + title + ' — free, private PDF tool that runs 100% in your browser. No uploads ever! 🔒 dublesh.com via @mydublesh';
  var shareUrl = 'https://dublesh.com/';
  // BA 6.2: Use tool-specific shareable URL with settings
  if (typeof _activeTid !== 'undefined' && _activeTid) {
    shareUrl = _makeShareUrl(_activeTid);
  }
  var data = { title: 'Dublesh — ' + title, text: 'Free, private PDF tool — runs 100% in your browser. No uploads.', url: shareUrl };
  if (navigator.share) {
    navigator.share(data).catch(function(){});
  } else {
    // Show share picker popup
    var picker = document.createElement('div');
    picker.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:1rem;animation:ovIn .2s ease';
    picker.innerHTML='<div style="background:var(--sf);border-radius:20px 20px 0 0;padding:1.4rem 1.6rem 2rem;max-width:440px;width:100%;box-shadow:0 -8px 40px rgba(0,0,0,.2)">'
      +'<div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--tx3);margin-bottom:1rem">Share this tool</div>'
      +'<div style="display:flex;gap:.7rem;margin-bottom:1.1rem">'
      +'<a href="https://twitter.com/intent/tweet?text='+encodeURIComponent(tweetText)+'" target="_blank" rel="noopener noreferrer" style="flex:1;display:flex;align-items:center;justify-content:center;gap:.5rem;background:#000;color:#fff;border-radius:10px;padding:.65rem;text-decoration:none;font-size:.8rem;font-weight:700">𝕏 Tweet</a>'
      +'<a href="https://wa.me/?text='+encodeURIComponent(tweetText)+'" target="_blank" rel="noopener noreferrer" style="flex:1;display:flex;align-items:center;justify-content:center;gap:.5rem;background:#25d366;color:#fff;border-radius:10px;padding:.65rem;text-decoration:none;font-size:.8rem;font-weight:700">WhatsApp</a>'
      +'<a href="https://linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(shareUrl)+'" target="_blank" rel="noopener noreferrer" style="flex:1;display:flex;align-items:center;justify-content:center;gap:.5rem;background:#0077b5;color:#fff;border-radius:10px;padding:.65rem;text-decoration:none;font-size:.8rem;font-weight:700">LinkedIn</a>'
      +'</div>'
      +'<button onclick="if(navigator.clipboard)navigator.clipboard.writeText(\''+shareUrl+'\').then(function(){toast(\'Link copied!\');});this.closest(\'[data-picker]\').remove();" style="width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:.65rem;font-size:.82rem;font-weight:600;cursor:pointer;color:var(--tx);font-family:inherit">📋 Copy link — dublesh.com</button>'
      +'<button onclick="this.closest(\'[data-picker]\').remove();" style="width:100%;background:none;border:none;margin-top:.5rem;padding:.5rem;font-size:.8rem;color:var(--tx3);cursor:pointer;font-family:inherit">Cancel</button>'
      +'</div>';
    picker.dataset.picker='1';
    picker.addEventListener('click',function(e){if(e.target===picker)picker.remove();});
    document.body.appendChild(picker);
  }
  // Fire Plausible event
  try{ if(window.plausible) window.plausible('share',{props:{tool:((document.getElementById('modalTitle')||{}).textContent||'unknown')}}); }catch(e){}
}
function updateShareBtn() {
  var btn = document.getElementById('shareBtn');
  if (btn) btn.style.display = 'inline-flex'; // Always show — BA rec 2.2
}

// ── KEYBOARD SHORTCUT OVERLAY ────────────────────────────────────
var _shortcutOverlay = null;
function showShortcuts() {
  if (_shortcutOverlay) { _shortcutOverlay.remove(); _shortcutOverlay = null; return; }
  var div = document.createElement('div');
  div.setAttribute('role','dialog'); div.setAttribute('aria-modal','true');
  div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
  var shortcuts = [['/', 'Search tools'],['Esc', 'Close overlay'],['Tab', 'Navigate tools'],['?', 'Keyboard shortcuts'],['D', 'Toggle dark/light'],['H', 'History panel']];
  div.innerHTML = '<div style="background:var(--sf);border:1px solid var(--bd);border-radius:16px;padding:1.6rem 2rem;max-width:400px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.3)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.1rem"><h2 style="margin:0;font-size:1rem;font-weight:700">Keyboard Shortcuts</h2><button onclick="showShortcuts()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--tx3)">✕</button></div>' +
    shortcuts.map(function(s){ return '<div style="display:flex;justify-content:space-between;padding:.3rem 0;border-bottom:1px solid var(--bd);font-size:.82rem"><span style="color:var(--tx2)">'+s[1]+'</span><kbd style="background:var(--sf2);border:1px solid var(--bd);border-radius:5px;padding:1px 8px;font-size:.75rem;font-family:monospace">'+s[0]+'</kbd></div>'; }).join('') +
    '</div>';
  document.body.appendChild(div);
  _shortcutOverlay = div;
  div.addEventListener('click', function(e){ if(e.target===div) showShortcuts(); });
}

// ── FEEDBACK ──────────────────────────────────────────────────────
function openFeedback() {
  window.open('mailto:feedback@dublesh.com?subject=Dublesh+Feedback&body=Hi+Nilesh%2C%0A%0AFeedback+for+Dublesh%3A%0A%0A', '_blank');
}

// ── BA 4: Crop PDF — uses pdf-lib CropBox (mediabox trim) ─────────
function applyCropPreset(id) {
  var preset = document.getElementById('crop-preset-'+id);
  if (!preset) return;
  var v = preset.value;
  var mm = parseFloat(v);
  if (!isNaN(mm)) {
    ['l','r','t','b'].forEach(function(s){ var el=document.getElementById('crop-'+s+'-'+id); if(el) el.value=mm; });
  } else if (v === 'aadhaar') {
    document.getElementById('crop-l-'+id).value = 8;
    document.getElementById('crop-r-'+id).value = 8;
    document.getElementById('crop-t-'+id).value = 12;
    document.getElementById('crop-b-'+id).value = 12;
  }
}

async function doCropPdf(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  var err = guardFiles(f, {types:['pdf'],maxMB:150});
  if (err) { setSt(id,err,'err'); return; }
  var MM2PT = 2.835;
  var l = parseFloat(document.getElementById('crop-l-'+id).value||0) * MM2PT;
  var r = parseFloat(document.getElementById('crop-r-'+id).value||0) * MM2PT;
  var t = parseFloat(document.getElementById('crop-t-'+id).value||0) * MM2PT;
  var b = parseFloat(document.getElementById('crop-b-'+id).value||0) * MM2PT;
  var pages_sel = document.getElementById('crop-pages-'+id).value;
  setBusy(id,true); setPrg(id,20,'Loading PDF…');
  try {
    var buf = await f[0].arrayBuffer();
    var doc = await PDFLib.PDFDocument.load(buf, {ignoreEncryption:true});
    var pages = doc.getPages();
    pages.forEach(function(pg, i) {
      var include = pages_sel==='all' || (pages_sel==='odd'&&(i+1)%2===1) ||
                    (pages_sel==='even'&&(i+1)%2===0) || (pages_sel==='first'&&i===0);
      if (!include) return;
      var mb = pg.getMediaBox();
      pg.setCropBox(mb.x+l, mb.y+b, mb.width-l-r, mb.height-t-b);
    });
    setPrg(id,80,'Saving…');
    var bytes = await doc.save();
    var outName = f[0].name.replace(/\.pdf$/i,'')+'_cropped.pdf';
    dlBlob(new Blob([bytes],{type:'application/pdf'}), outName);
    setSt(id,'✓ Cropped successfully — '+fmt(bytes.byteLength),'succ');
    pvShowCards(id,[{title:outName,lines:[{label:'Pages cropped',value:pages_sel==='all'?pages.length:'selected'},{label:'Output size',value:fmt(bytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'crop-pdf',fileName:f[0].name,outSize:fmt(bytes.byteLength)});
    setPrg(id,100); toast('Cropped ✓');
  } catch(e) { setPrg(id,0); setSt(id,'✕ '+e.message,'err'); toast(e.message,'e'); }
  finally { setBusy(id,false); }
}

// ── BA 4: Add Image to PDF — embeds raster image via pdf-lib ──────
var _stampImgData = {};

async function loadStampImg(id, file) {
  if (!file) return;
  document.getElementById('imgname-'+id).textContent = file.name + ' (' + fmt(file.size) + ')';
  var reader = new FileReader();
  reader.onload = function(e) { _stampImgData[id] = {data: e.target.result, type: file.type}; };
  reader.readAsDataURL(file);
  var btn = document.getElementById('btn-'+id);
  if (btn && S[id] && S[id].files && S[id].files.length) btn.disabled = false;
}

async function doAddImage(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  var err = guardFiles(f, {types:['pdf'],maxMB:150});
  if (err) { setSt(id,err,'err'); return; }
  var imgInfo = _stampImgData[id];
  if (!imgInfo) { setSt(id,'Please choose an image to stamp','err'); return; }
  var MM2PT = 2.835;
  var imgW = parseFloat(document.getElementById('img-w-'+id).value||40) * MM2PT;
  var imgH = parseFloat(document.getElementById('img-h-'+id).value||20) * MM2PT;
  var imgX = parseFloat(document.getElementById('img-x-'+id).value||10) * MM2PT;
  var imgY = parseFloat(document.getElementById('img-y-'+id).value||10) * MM2PT;
  var pages_sel = document.getElementById('img-pages-'+id).value;
  var opacity = parseFloat(document.getElementById('img-opacity-'+id).value||1);
  setBusy(id,true); setPrg(id,20,'Loading…');
  try {
    var buf = await f[0].arrayBuffer();
    var doc = await PDFLib.PDFDocument.load(buf, {ignoreEncryption:true});
    // Convert dataURL to Uint8Array
    var b64 = imgInfo.data.split(',')[1];
    var binStr = atob(b64);
    var bytes_img = new Uint8Array(binStr.length);
    for (var i=0;i<binStr.length;i++) bytes_img[i]=binStr.charCodeAt(i);
    var embeddedImg;
    if (imgInfo.type === 'image/png') {
      embeddedImg = await doc.embedPng(bytes_img);
    } else {
      embeddedImg = await doc.embedJpg(bytes_img);
    }
    var pages = doc.getPages();
    pages.forEach(function(pg, i) {
      var include = pages_sel==='all' || (pages_sel==='first'&&i===0) || (pages_sel==='last'&&i===pages.length-1);
      if (!include) return;
      pg.drawImage(embeddedImg, {x:imgX, y:imgY, width:imgW, height:imgH, opacity:opacity});
    });
    setPrg(id,85,'Saving…');
    var outBytes = await doc.save();
    var outName = f[0].name.replace(/\.pdf$/i,'')+'_stamped.pdf';
    dlBlob(new Blob([outBytes],{type:'application/pdf'}), outName);
    setSt(id,'✓ Image stamped successfully — '+fmt(outBytes.byteLength),'succ');
    pvShowCards(id,[{title:outName,lines:[{label:'Pages stamped',value:pages_sel==='all'?pages.length:1},{label:'Output size',value:fmt(outBytes.byteLength)}]}]);
    pvReady(id);
    addHist({tool:'add-image',fileName:f[0].name,outSize:fmt(outBytes.byteLength)});
    setPrg(id,100); toast('Image stamped ✓');
  } catch(e) { setPrg(id,0); setSt(id,'✕ '+e.message,'err'); toast(e.message,'e'); }
  finally { setBusy(id,false); }
}

// ── BA 4: Wire up add-image file button enable logic ──────────────
(function() {
  var origAddFiles = window.addFiles;
  if (origAddFiles) {
    window.addFiles = function(id, files, multi, cb) {
      origAddFiles(id, files, multi, cb);
      if (id.startsWith('add-image')) {
        var btn = document.getElementById('btn-'+id);
        if (btn && _stampImgData[id]) btn.disabled = false;
      }
    };
  }
})();

// ── BA 5.2: "Continue where you left off" — return-visit history cards ──
function _renderContinueBar() {
  var bar = document.getElementById('continueBar');
  var cardsEl = document.getElementById('continueCards');
  var badge = document.getElementById('useCountBadge');
  if (!bar || !cardsEl) return;

  // BA 5.4: Usage counter
  var totalOps = parseInt(localStorage.getItem('pf-total-ops') || '0');
  if (totalOps >= 2 && badge) {
    badge.style.display = 'block';
    badge.textContent = totalOps + ' operations total';
  }

  // Only show on return visits (not first visit)
  var visits = parseInt(localStorage.getItem('pf-visits') || '0') + 1;
  localStorage.setItem('pf-visits', visits);
  if (visits < 2) return;

  // Get last 3 unique tools from history
  try {
    var hist = JSON.parse(localStorage.getItem('pf-hist') || '[]');
    if (!hist.length) return;
    var seen = {}; var recent = [];
    for (var i = 0; i < hist.length && recent.length < 3; i++) {
      var tid = hist[i].tool || hist[i].tid;
      if (tid && !seen[tid] && TOOLS[tid]) { seen[tid] = 1; recent.push({tid:tid,entry:hist[i]}); }
    }
    if (!recent.length) return;

    cardsEl.innerHTML = recent.map(function(r) {
      var cfg = TOOLS[r.tid] || {};
      var icon = TOOL_ICONS[r.tid] || '📄';
      var fname = (r.entry.fileName || r.entry.file) ? (r.entry.fileName || r.entry.file).replace(/\.pdf$/i,'') : '';
      var ago = r.entry.t ? _timeAgo(r.entry.t) : '';
      return '<button onclick="openTool(\''+r.tid+'\')" style="'
        +'display:flex;align-items:center;gap:.5rem;background:var(--sf);border:1px solid var(--bd);'
        +'border-radius:var(--rm);padding:.45rem .8rem;cursor:pointer;font-family:inherit;transition:all .14s;'
        +'text-align:left;flex:1;min-width:0;max-width:220px" '
        +'onmouseover="this.style.borderColor=\'var(--ac)\';this.style.background=\'var(--ac-dim)\'" '
        +'onmouseout="this.style.borderColor=\'var(--bd)\';this.style.background=\'var(--sf)\'">'
        +'<span style="font-size:1.1rem;flex-shrink:0">'+icon+'</span>'
        +'<div style="min-width:0;flex:1">'
        +'<div style="font-size:.78rem;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+cfg.t+'</div>'
        +(fname ? '<div style="font-size:.66rem;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+fname+'</div>' : '')
        +(ago ? '<div style="font-size:.63rem;color:var(--tx3)">'+ago+'</div>' : '')
        +'</div>'
        +'<span style="color:var(--tx3);font-size:.8rem;flex-shrink:0;margin-left:.25rem">↗</span>'
        +'</button>';
    }).join('');
    bar.style.display = 'block';
  } catch(e) {}
}

function _timeAgo(ts) {
  var diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

// BA 5.4: Increment usage counter on every tool completion
// BA 5.5: Inject "use in another tool" bar after operations
// FIX 6: Enrich batch filenames from S state
// NOTE: All addHist patches unified here to avoid triple-firing
(function(){
  var _base = addHist;
  addHist = function(entry) {
    // Enrich fileNames for batch entries that say "N file(s)"
    if (entry && entry.fileName && /^\d+ file/.test(entry.fileName)) {
      var toolId = typeof _activeTid !== 'undefined' ? _activeTid : null;
      if (toolId && S[toolId] && S[toolId].files && S[toolId].files.length) {
        var names = Array.from(S[toolId].files).map(function(f){ return f.name; });
        entry.fileName = names.slice(0,3).join(', ') + (names.length > 3 ? ' (+' + (names.length-3) + ' more)' : '');
      }
    }
    // Call original addHist
    _base(entry);
    // Usage counter badge
    try {
      var c = parseInt(localStorage.getItem('pf-total-ops') || '0') + 1;
      localStorage.setItem('pf-total-ops', c);
      var badge = document.getElementById('useCountBadge');
      if (badge && c >= 2) { badge.style.display = 'block'; badge.textContent = c + ' operations total'; }
    } catch(e) {}
    // "Use in another tool" bar
    if (entry && entry.tool) {
      setTimeout(function(){ _injectUseInTool(entry.tool); }, 300);
    }
  };
})();

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() { _renderContinueBar(); });

// ── BA 4: Register new tools in TOOL_ICONS ────────────────────────
TOOL_ICONS['crop-pdf']   = '✂️';
TOOL_ICONS['add-image']  = '🖼️';

// ── GDPR NOTICE (cookie-free, info only) ─────────────────────────
function dismissGdpr() {
  var bar = document.getElementById('gdprBar');
  if (bar) { bar.style.transform = 'translateY(120%)'; document.documentElement.style.setProperty('--gdpr-h', '0px'); var sp=document.getElementById('gdpr-spacer'); if(sp) sp.style.height='0'; setTimeout(function(){ bar.remove(); }, 400); }
  try { localStorage.setItem('pf-gdpr','1'); } catch(e) {}
}

// ── WHAT'S NEW MODAL ─────────────────────────────────────────────
function closeWhatsNew() {
  var el = document.getElementById('whatsNewOverlay');
  if (el) { el.style.opacity = '0'; setTimeout(function(){ el.style.display = 'none'; }, 200); }
  try { localStorage.setItem('pf-seen-v6.9.9','1'); } catch(e) {}
}

// ── EXTRA KEYBOARD SHORTCUTS ─────────────────────────────────────
document.addEventListener('keydown', function(e) {
  var tag = document.activeElement && document.activeElement.tagName;
  var noInput = tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT';
  var noModal = !document.getElementById('overlay')?.classList.contains('open');
  if (e.key === '?' && noInput) { e.preventDefault(); showShortcuts(); }
  if (e.key === 'D' && noInput && noModal && !e.metaKey && !e.ctrlKey) { toggleTheme(); }
}); // bubble phase only — no capture (was: true)

// ── INIT ON DOM READY ─────────────────────────────────────────────

// ── Paste files from clipboard (Ctrl+V anywhere on page) ─────────
document.addEventListener('paste', function(ev) {
  var items = ev.clipboardData && ev.clipboardData.items;
  if (!items) return;
  var files = [];
  for (var i = 0; i < items.length; i++) {
    if (items[i].kind === 'file') {
      var f = items[i].getAsFile();
      if (f) files.push(f);
    }
  }
  if (!files.length) return;
  // Find the active open modal's tool id
  var overlay = document.querySelector('.overlay.open');
  if (!overlay) return;
  var tid = overlay.dataset.tid;
  if (!tid || !S[tid]) return;
  ev.preventDefault();
  addFiles(tid, files, true);
  toast('Pasted ' + files.length + ' file(s)', 's');
});

function rdClear(id){if(!RD[id])return;var pg=RD[id].pg;RD[id].boxes[pg]=[];rdRender(id);toast('Page '+pg+' cleared');}
function fbSetActive(id,tool,btn){FB[id].tool=tool;['text','checkbox','signature'].forEach(function(t){var b=document.getElementById('fbt-'+t+'-'+id);if(!b)return;b.style.background=t===tool?'var(--ac)':'';b.style.color=t===tool?'#fff':'';b.style.borderColor=t===tool?'var(--ac)':'';});}
// FIX: sigSetTab now handles all 3 tabs: draw, type, upload
function sigSetTab(id,tab){
  ['draw','type','upload'].forEach(function(t){
    var p=document.getElementById('sig-'+t+'-panel-'+id);
    var b=document.getElementById('stab-'+t+'-'+id);
    if(p)p.style.display=t===tab?'block':'none';
    if(b){b.style.background=t===tab?'var(--ac)':'';b.style.color=t===tab?'#fff':'';b.style.borderColor=t===tab?'var(--ac)':'var(--bd2)';}
  });
}

// FIX: Load uploaded signature image onto the hidden canvas
function sigLoadImg(id, input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var canvas = document.getElementById('sigIC-'+id);
  if (!canvas) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var dpr = window.devicePixelRatio || 1;
      var maxW = 300, maxH = 100;
      var sc = Math.min(maxW/img.width, maxH/img.height, 1);
      canvas.width = img.width * sc * dpr;
      canvas.height = img.height * sc * dpr;
      canvas.style.width = (img.width * sc) + 'px';
      canvas.style.height = (img.height * sc) + 'px';
      canvas.style.display = 'block';
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, img.width * sc, img.height * sc);
      ctx.drawImage(img, 0, 0, img.width * sc, img.height * sc);
      // Copy to main sigC canvas so doSign can read it
      var sigC = document.getElementById('sigC-'+id);
      if (sigC) {
        sigC.width = canvas.width;
        sigC.height = canvas.height;
        sigC.getContext('2d').drawImage(canvas, 0, 0);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// FIX: Invert page selection in delete-pages tool
function selInvert(id) {
  document.querySelectorAll('#tg-'+id+' .titem').forEach(function(el){
    el.classList.toggle('sel');
  });
  updateSelCount(id);
}

// FIX: Sort reorder list ascending (page 1,2,3...)
function rSortAsc(id) {
  var list = document.getElementById('rl-'+id);
  if (!list) return;
  var items = Array.from(list.children).sort(function(a,b){
    return parseInt(a.dataset.idx) - parseInt(b.dataset.idx);
  });
  items.forEach(function(el){ list.appendChild(el); });
  reindexReorder(list);
}

// FIX: Sort reorder list descending (last page first)
function rSortDesc(id) {
  var list = document.getElementById('rl-'+id);
  if (!list) return;
  var items = Array.from(list.children).sort(function(a,b){
    return parseInt(b.dataset.idx) - parseInt(a.dataset.idx);
  });
  items.forEach(function(el){ list.appendChild(el); });
  reindexReorder(list);
}
document.addEventListener('DOMContentLoaded', function() {
  _renderFavBtns();


  // ── PWA install prompt ────────────────────────────────────────────
  var _pwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    _pwaPrompt = e;
    setTimeout(function() {
      var el = document.getElementById('pwaInstall');
      if (el) el.classList.add('show');
    }, 4000);
  });
  window.addEventListener('appinstalled', function() {
    var el = document.getElementById('pwaInstall');
    if (el) el.classList.remove('show');
    _pwaPrompt = null;
  });

  // ── Header scroll shadow ──────────────────────────────────────────
  var _hdrEl = document.getElementById('appHeader') || document.querySelector('header');
  if (_hdrEl) {
    window.addEventListener('scroll', function() {
      if(!document.body.classList.contains('dub-tools-view')) return;
      _hdrEl.classList.toggle('hdr-scrolled', window.scrollY > 8);
    }, {passive: true});
  }

  // ── Scroll-to-top ──────────────────────────────────────────────
  var _sttBtn = document.getElementById('scrollTop');
  if (_sttBtn) {
    window.addEventListener('scroll', function() {
      _sttBtn.classList.toggle('show', window.scrollY > 300);
    }, {passive: true});
  }

  // ── Label focus highlight ───────────────────────────────────────
  document.addEventListener('focusin', function(e) {
    var f = e.target.closest('.field');
    if (f) { var l = f.querySelector('label'); if (l) l.style.color = 'var(--ac)'; }
  }, true);
  document.addEventListener('focusout', function(e) {
    var f = e.target.closest('.field');
    if (f) { var l = f.querySelector('label'); if (l) l.style.color = ''; }
  }, true);


  // ── UX: Ripple effect on primary buttons ───────────────────────────
  document.addEventListener('pointerdown', function(e) {
    var btn = e.target.closest('.btn-p');
    if (!btn || btn.disabled || btn.classList.contains('busy')) return;
    var r = btn.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 1.6;
    var x = e.clientX - r.left - size / 2;
    var y = e.clientY - r.top - size / 2;
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = 'width:'+size+'px;height:'+size+'px;left:'+x+'px;top:'+y+'px';
    btn.appendChild(ripple);
    setTimeout(function(){ if(ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 600);
  });

  // ── UX: Auto-expand og groups on small screens ─────────────────────
  function checkOgLayout() {
    document.querySelectorAll('.og').forEach(function(og) {
      if (window.innerWidth < 400) og.style.gridTemplateColumns = '1fr';
      else og.style.gridTemplateColumns = '';
    });
  }
  checkOgLayout();
  window.addEventListener('resize', checkOgLayout, {passive:true});

  // ── UX: Smooth label transition on input focus ─────────────────────
  document.addEventListener('focusin', function(e) {
    var field = e.target.closest('.field');
    if (field) {
      var label = field.querySelector('label');
      if (label) label.style.color = 'var(--ac)';
    }
  });
  document.addEventListener('focusout', function(e) {
    var field = e.target.closest('.field');
    if (field) {
      var label = field.querySelector('label');
      if (label) label.style.color = '';
    }
  });

  // GDPR notice
  try { if (!localStorage.getItem('pf-gdpr')) setTimeout(function(){
    var bar = document.getElementById('gdprBar');
    if (bar) { bar.style.display='flex'; requestAnimationFrame(()=>{ bar.classList.add('gdpr-active'); }); setTimeout(function(){ var h = bar.offsetHeight || 60; document.documentElement.style.setProperty('--gdpr-h', h + 'px'); var sp=document.getElementById('gdpr-spacer'); if(sp) sp.style.height=h+'px'; }, 50); setTimeout(dismissGdpr,12000); _syncToastPos(); }
  }, 1500); } catch(e) {}
  
  // What's New modal — disabled in v6.9.9+ (replaced by compact toast in patch layer)
  // The whatsNewOverlay HTML element still exists for backward compat but is never shown.
  try { localStorage.setItem('pf-seen-v6.9.9','1'); } catch(e) {}
});


// ── SERVICE WORKER ────────────────────────────────────────────────
// NOTE (v6.9.9): Blob-URL SW registration is blocked by browsers per
// the Service Worker spec (must be same-origin HTTPS script, not blob:).
// SW is disabled here — enable by serving a real sw.js from your domain.
// (function() { /* SW requires an external sw.js file */ })();

// openTool share button wiring handled in updateShareBtn()

// ═══════════════════════════════════════════════════════════════
// BA RECOMMENDATIONS — v6.9.9 IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

// ── BA 2.4: FAVOURITES SYSTEM ─────────────────────────────────
function _getFavs() {
  try { return JSON.parse(localStorage.getItem('pf-favs') || '[]'); } catch(e) { return []; }
}
function _saveFavs(arr) {
  try { localStorage.setItem('pf-favs', JSON.stringify(arr)); } catch(e) {}
}
function toggleFav(e, tid) {
  e.stopPropagation();
  var favs = _getFavs();
  var idx = favs.indexOf(tid);
  if (idx > -1) {
    favs.splice(idx, 1);
    toast('Removed from favourites');
  } else {
    favs.push(tid);
    toast('⭐ Added to favourites');
    try { if(window.plausible) window.plausible('favourite',{props:{tool:tid}}); } catch(e2) {}
  }
  _saveFavs(favs);
  _renderFavBtns();
  _updateFavTab();
}
function _renderFavBtns() {
  var favs = _getFavs();
  document.querySelectorAll('.fav-btn').forEach(function(btn) {
    var card = btn.closest('.tc');
    var tid = card && card.dataset.tool;
    var active = tid && favs.indexOf(tid) > -1;
    btn.classList.toggle('active', active);
    btn.textContent = active ? '♥' : '♡';
    btn.setAttribute('aria-label', (active ? 'Remove from' : 'Add to') + ' favourites');
  });
}
function _updateFavTab() {
  var favs = _getFavs();
  var tab = document.getElementById('favTab');
  var cnt = document.getElementById('favCount');
  if (!tab) return;
  tab.style.display = favs.length > 0 ? '' : 'none';
  if (cnt) cnt.textContent = favs.length;
}

// ── BA 5.1: ONBOARDING BANNER ──────────────────────────────────
function dismissOnboard() {
  var el = document.getElementById('onboardBanner');
  if (el) { el.style.opacity='0'; el.style.transform='translateY(-8px)'; setTimeout(function(){ el.style.display='none'; },200); }
  try { localStorage.setItem('pf-onboard','1'); } catch(e) {}
}
function _initOnboard() {
  try {
    if (!localStorage.getItem('pf-onboard')) {
      // Only show if user has no operation history (true first-timer)
      var _hist = [];
      try { _hist = JSON.parse(localStorage.getItem('pf-hist') || '[]'); } catch(e) {}
      if (_hist.length === 0) {
        var el = document.getElementById('onboardBanner');
        if (el) {
          el.style.display = 'flex';
          el.style.transition = 'opacity .3s,transform .3s';
          requestAnimationFrame(function(){ el.style.opacity='1'; });
        }
      }
    }
  } catch(e) {}
}

// ── BA 2.1: EMAIL CAPTURE SUBMIT ──────────────────────────────
function footEmailSubmit() {
  var inp = document.getElementById('footEmail');
  var val = inp && inp.value.trim();
  if (!val || !val.includes('@')) { toast('Please enter a valid email address','w'); return; }
  // Open mailto as fallback — replace with Mailchimp/Buttondown API when ready
  window.open('mailto:nilesh@dublesh.com?subject=Subscribe+to+Dublesh+updates&body=Please+add+me+to+the+Dublesh+newsletter.+My+email:+'+encodeURIComponent(val),'_blank');
  inp.value = '';
  toast('✓ Thank you! We\'ll be in touch.');
  try { if(window.plausible) window.plausible('email_subscribe'); } catch(e) {}
}

// ── BA 3.1: URL HASH → TOOL OPEN + DYNAMIC META ───────────────
var TOOL_META = {
  'merge':        {t:'Merge PDF Free — Combine PDFs Online | Dublesh', d:'Merge multiple PDF files into one instantly. No uploads, no account. Free forever.'},
  'split':        {t:'Split PDF Free — Extract Pages Online | Dublesh', d:'Split a PDF into individual pages or ranges. Runs 100% in your browser.'},
  'compress':     {t:'Compress PDF Free — Reduce PDF Size Online | Dublesh', d:'Reduce PDF file size online for free. No upload needed. Works offline.'},
  'pdf-to-jpg':   {t:'PDF to JPG Free — Convert PDF to Image | Dublesh', d:'Convert PDF pages to JPEG, PNG or WebP. Up to 300 dpi. No uploads.'},
  'jpg-to-pdf':   {t:'Image to PDF Free — JPG to PDF Converter | Dublesh', d:'Combine JPG, PNG and WebP images into a PDF. Free, private, no account.'},
  'pdf-to-word':  {t:'PDF to Word Free — Convert PDF to DOC Online | Dublesh', d:'Extract text from PDFs as a Word-compatible file. Free and private.'},
  'pdf-to-excel': {t:'PDF to Excel Free — Convert PDF to XLSX | Dublesh', d:'Export PDF tables to real .xlsx Excel files. Free, in-browser, no uploads.'},
  'protect':      {t:'Protect PDF Free — Password Protect PDF Online | Dublesh', d:'Add AES-128 password encryption to your PDF. Runs entirely in your browser.'},
  'unlock':       {t:'Unlock PDF Free — Remove PDF Password Online | Dublesh', d:'Remove password protection from PDFs instantly. No upload, 100% private.'},
  'sign':         {t:'Sign PDF Free — eSign PDF Online | Dublesh', d:'Draw, type or upload a signature and stamp it on your PDF. Free and private.'},
  'watermark':    {t:'Add Watermark to PDF Free | Dublesh', d:'Stamp text watermarks on PDFs with custom opacity and position. No uploads.'},
  'rotate':       {t:'Rotate PDF Free — Rotate PDF Pages Online | Dublesh', d:'Rotate all, odd, even or specific pages in your PDF. 100% in-browser.'},
  'reorder':      {t:'Reorder PDF Pages Free | Dublesh', d:'Drag and drop to reorder PDF pages. Free, offline-capable, no uploads.'},
  'grayscale':    {t:'Grayscale PDF Free — Convert PDF to Black and White | Dublesh', d:'Convert PDFs to grayscale or sepia. High-quality rendering, no uploads.'},
  'redact':       {t:'Redact PDF Free — Redact PDF Online | Dublesh', d:'Draw redaction boxes over sensitive content in your PDF. 100% private.'},
  'ai-summarize': {t:'AI PDF Summarizer Free — Summarize PDF with Claude | Dublesh', d:'Generate instant PDF summaries powered by Claude AI. BYOK, no data stored.'},
  'ai-qa':        {t:'Ask PDF Questions Free — AI PDF Q&A | Dublesh', d:'Ask anything about your PDF and get accurate answers from Claude AI.'},
  'ai-translate': {t:'Translate PDF Free — AI PDF Translator | Dublesh', d:'Translate PDF content into 27+ languages using Claude AI. Free, private.'}
};
function _getToolSettings(tid) {
  // BA 6.2: Collect current tool's shareable settings as URL params
  var params = {};
  var qualEl = document.getElementById('cq-' + tid);
  if (qualEl) params.quality = Math.round(parseFloat(qualEl.value) * 100);
  var smEl = document.getElementById('sm-' + tid);
  if (smEl) params.mode = smEl.value;
  var aitlEl = document.getElementById('aitl-' + tid);
  if (aitlEl) params.lang = aitlEl.value;
  return Object.keys(params).length ? params : null;
}

function _applyUrlSettings(tid) {
  // BA 6.2: Apply settings from URL hash params
  var hash = window.location.hash.slice(1);
  var qIdx = hash.indexOf('?');
  if (qIdx === -1) return;
  var qs = hash.slice(qIdx + 1);
  var pairs = qs.split('&');
  pairs.forEach(function(pair) {
    var kv = pair.split('=');
    var k = kv[0], v = decodeURIComponent(kv[1] || '');
    if (k === 'quality') {
      var el = document.getElementById('cq-' + tid);
      if (el) { el.value = parseFloat(v) / 100; el.dispatchEvent(new Event('input')); }
    }
    if (k === 'mode') {
      var el = document.getElementById('sm-' + tid);
      if (el) { el.value = v; el.dispatchEvent(new Event('change')); }
    }
    if (k === 'lang') {
      var el = document.getElementById('aitl-' + tid);
      if (el) el.value = v;
    }
  });
}

function _makeShareUrl(tid) {
  // BA 6.2: Build shareable URL for current tool with settings
  var base = 'https://dublesh.com/#' + tid;
  var settings = _getToolSettings(tid);
  if (!settings) return base;
  var qs = Object.keys(settings).map(function(k) {
    return k + '=' + encodeURIComponent(settings[k]);
  }).join('&');
  return base + '?' + qs;
}

function _handleHash() {
  var fullHash = window.location.hash.replace('#','');
  if (!fullHash) return;
  // BA 6.2: Strip query params from hash for tool ID
  var qIdx = fullHash.indexOf('?');
  var hash = qIdx >= 0 ? fullHash.slice(0, qIdx) : fullHash;
  // Update meta for SEO crawlers
  var m = TOOL_META[hash];
  if (m) {
    document.title = m.t;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', m.d);
  }
  // SEO FIX: update canonical + og:url for hash-based navigation
  if (window._TOOL_SLUGS && window._TOOL_SLUGS[hash]) {
    var _tu = 'https://www.dublesh.com/' + window._TOOL_SLUGS[hash] + '/';
    var _lc = document.querySelector('link[rel="canonical"]');
    if (_lc) _lc.href = _tu;
    var _ou = document.querySelector('meta[property="og:url"]');
    if (_ou) _ou.setAttribute('content', _tu);
  }
  // Auto-open tool on hash — then apply any URL settings
  if (TOOLS && TOOLS[hash]) {
    setTimeout(function(){
      openTool(hash);
      // BA 6.2: Apply settings from URL after modal renders
      setTimeout(function(){ _applyUrlSettings(hash); }, 200);
    }, 400);
  }
}
// SEO FIX: popstate — back/forward button support for clean URLs
window.addEventListener('popstate', function(e) {
  var path = location.pathname.replace(/^\/|\/$/, 'g').split('/').filter(Boolean).join('/');
  var tid = window._SLUG_TO_ID && window._SLUG_TO_ID[path];
  if (tid && window.TOOLS && window.TOOLS[tid]) {
    openTool(tid);
  } else if (location.pathname === '/') {
    // Returning to homepage — close modal if open
    var ov = document.getElementById('overlay');
    if (ov && ov.classList.contains('open')) closeModal();
  }
});

function _hookHashLinks() {
  // Make tool cards update hash on click
  document.querySelectorAll('.tc[data-tool]').forEach(function(card) {
    var tid = card.dataset.tool;
    card.addEventListener('click', function() {
      try { history.replaceState(null,'','#'+tid); } catch(e) {}
    });
  });
}

// ── BA 5.5: USE-IN-ANOTHER-TOOL CTA ──────────────────────────
// Related tool suggestions per tool
var USE_IN_MAP = {
  'compress':     [['sign','✍️ Sign'],['watermark','💧 Watermark'],['protect','🔒 Protect']],
  'merge':        [['compress','🗜️ Compress'],['sign','✍️ Sign'],['pdf-to-jpg','🖼️ to JPG']],
  'split':        [['compress','🗜️ Compress'],['pdf-to-jpg','🖼️ to JPG'],['extract-text','🔤 to Text']],
  'pdf-to-jpg':   [['jpg-to-pdf','📷 Back to PDF'],['compress','🗜️ Compress']],
  'jpg-to-pdf':   [['compress','🗜️ Compress'],['sign','✍️ Sign'],['protect','🔒 Protect']],
  'rotate':       [['merge','🔗 Merge'],['compress','🗜️ Compress'],['sign','✍️ Sign']],
  'protect':      [['sign','✍️ Sign'],['watermark','💧 Watermark']],
  'unlock':       [['protect','🔒 Re-protect'],['compress','🗜️ Compress'],['sign','✍️ Sign']],
  'watermark':    [['protect','🔒 Protect'],['compress','🗜️ Compress']],
  'sign':         [['protect','🔒 Protect'],['compress','🗜️ Compress'],['flatten','📌 Flatten']],
  'extract-text': [['ai-summarize','🤖 AI Summarize'],['ai-qa','💬 Ask PDF']],
  'pdf-to-word':  [['ai-summarize','🤖 AI Summarize'],['extract-text','🔤 to Text']],
  'ai-summarize': [['ai-qa','💬 Ask PDF'],['ai-translate','🌍 Translate']],
  'ai-qa':        [['ai-summarize','🤖 Summarize'],['ai-translate','🌍 Translate']],
  'ai-translate': [['ai-summarize','🤖 Summarize'],['ai-qa','💬 Ask PDF']],
  'reorder':      [['compress','🗜️ Compress'],['sign','✍️ Sign']],
  'grayscale':    [['compress','🗜️ Compress'],['pdf-to-jpg','🖼️ to JPG']],
  'redact':       [['protect','🔒 Protect'],['flatten','📌 Flatten']]
};
function _injectUseInTool(id) {
  var suggestions = USE_IN_MAP[id];
  if (!suggestions || !suggestions.length) return;
  var existing = document.getElementById('useInBar-'+id);
  if (existing) return;
  var bar = document.createElement('div');
  bar.className = 'use-in-tool-bar';
  bar.id = 'useInBar-'+id;
  bar.innerHTML = '<span>Use result in:</span><div class="use-in-tool-picks">'
    + suggestions.map(function(s){
        return '<button class="use-in-chip" onclick="closeModal();setTimeout(function(){openTool(\''+s[0]+'\')},150)">'+s[1]+'</button>';
      }).join('')
    + '</div>';
  var pvBlock = document.getElementById('pvBlock-'+id);
  var mb = document.getElementById('modalBody');
  if (pvBlock) pvBlock.parentNode.insertBefore(bar, pvBlock);
  else if (mb) mb.appendChild(bar);
}

// ── BA 6.2: AI KEY INIT ON LOAD ───────────────────────────────
function _initAiReady() {
  _updateAiReadyIndicator();
}

// ── WIRE IT ALL INTO DOM READY ─────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  _renderFavBtns();
  _updateFavTab();
  _initOnboard();
  _initAiReady();
  _handleHash();
  setTimeout(_hookHashLinks, 800);
});

// addHist patches unified above (see BA 5.4/5.5/FIX 6 block)


/* NEW badge 14-day expiry */
(function(){
  var TTL=14*864e5,now=Date.now();
  function expireBadges(){
    document.querySelectorAll(".tc-badge").forEach(function(b){
      var card=b.closest(".tc");if(!card)return;
      var tid=card.dataset&&card.dataset.tool;if(!tid)return;
      try{
        var k="pf-new-"+tid,f=localStorage.getItem(k);
        if(!f){localStorage.setItem(k,now);return;}
        if(now-+f>TTL)b.remove();
      }catch(e){}
    });
  }
  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",expireBadges);
  else expireBadges();
})();

function _syncToastPos(){var tc=document.getElementById("tc"),bar=document.getElementById("gdprBar");if(!tc)return;if(bar&&bar.style.display!=="none"&&bar.offsetHeight>0){tc.style.bottom=(bar.offsetHeight+8)+"px";}else{tc.style.bottom="";}}

(function(){var mac=/Mac|iPhone|iPod|iPad/.test(navigator.platform||navigator.userAgent||"");var m=document.getElementById("kbdMod");if(m&&!mac)m.textContent="Ctrl";})();

/* Header scroll shadow handled by .hdr-scrolled CSS class above */

// ── SIGN: Typed signature preview ─────────────────────────────────
function sigPreview(id) {
  var text = (document.getElementById('sigT-'+id)||{}).value || '';
  var c = document.getElementById('sigTC-'+id);
  if (!c) return;
  c.style.display = text ? 'block' : 'none';
  var dpr = window.devicePixelRatio || 1;
  c.width = (c.parentElement.clientWidth || 300) * dpr;
  c.height = 80 * dpr;
  var ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.scale(dpr, dpr);
  ctx.font = '36px Georgia, "Times New Roman", serif';
  ctx.fillStyle = '#00008b';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 10, 40);
}

// ── REORDER: Reverse all pages ─────────────────────────────────────
function rReverseAll(id) {
  var list = document.getElementById('rl-'+id);
  if (!list) return;
  var items = Array.from(list.children).reverse();
  items.forEach(function(el) { list.appendChild(el); });
  reindexReorder(list);
  toast('Pages reversed');
}

// ── THUMBNAIL: Download selected page ──────────────────────────────
async function doThumbnailPage(id) {await awaitLibs();
  var f = S[id] && S[id].files;
  if (!f || !f.length) return;
  // Get visible thumbnails — pick the first one if none selected
  var thumbs = document.querySelectorAll('#tg-'+id+' canvas');
  if (!thumbs.length) return;
  var canvas = thumbs[0];
  var blob = await new Promise(function(res){ canvas.toBlob(function(b){ res(b); }, 'image/jpeg', 0.92); });
  dlBlob(blob, 'page_01.jpg');
  toast('Page downloaded');
}

// ── SIGN: Override doSign to support typed mode ────────────────────
// doSign is already defined above — the type tab is handled
// by rendering to sigC canvas before the original function runs.
// We patch it safely here after the original is confirmed to exist.
(function() {
  var _baseDoSign = typeof doSign === 'function' ? doSign : null;
  if (!_baseDoSign) return;
  window.doSign = async function(id) {
    var typePanel = document.getElementById('sig-type-panel-'+id);
    if (typePanel && typePanel.style.display !== 'none') {
      var text = (document.getElementById('sigT-'+id)||{}).value || '';
      if (!text.trim()) { setSt(id, '⚠ Type your name above', 'warn'); return; }
      var sigC = document.getElementById('sigC-'+id);
      if (sigC) {
        var dpr = window.devicePixelRatio || 1;
        var w = (sigC.parentElement ? sigC.parentElement.clientWidth : 300);
        sigC.width = (w || 300) * dpr;
        sigC.height = 140 * dpr;
        var ctx = sigC.getContext('2d');
        ctx.clearRect(0, 0, sigC.width, sigC.height);
        ctx.scale(dpr, dpr);
        ctx.font = '44px Georgia, "Times New Roman", serif';
        ctx.fillStyle = '#00008b';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 10, 55);
      }
    }
    await _baseDoSign(id);
  };
})();

