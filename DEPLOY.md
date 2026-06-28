# Dublesh v6.9.9 — Multi-File Build

## File Structure

```
dublesh/
├── index.html              (140 KB — shell, HTML, SEO markup)
├── DEPLOY.md
└── assets/
    ├── css/
    │   ├── core.css        (108 KB — design tokens, all UI components)
    │   ├── landing.css     ( 16 KB — landing page & SEO section)
    │   └── patch.css       (  1 KB — OCR, annotation, component patches)
    └── js/
        ├── init.js         (  0.5 KB — theme init, kept inline-critical)
        ├── app.js          (300 KB — MAIN: tools registry, all PDF engine logic)
        ├── ui.js           ( 13 KB — GDPR, history, whats-new, scroll behavior)
        ├── fixes.js        ( 23 KB — v6.9.9 patch fixes)
        ├── tools-extended.js (128 KB — OCR, annotations, form fill, AI tools)
        ├── landing.js      ( 16 KB — landing page onboarding, continue cards)
        └── analytics.js    (  1 KB — Plausible analytics init)
```

## Deployment

### Netlify / Vercel / Cloudflare Pages
Drop the entire `dublesh/` folder. All paths use `/assets/...` (root-relative).
Works out of the box.

### Apache / Nginx self-host
Set document root to this folder. No config changes needed.

### Custom domain subdirectory (e.g. example.com/app/)
Update all `/assets/` paths to `/app/assets/` in index.html.

## What Changed vs Single-File
- View source only shows the HTML shell (140 KB instead of 756 KB)
- Assets still load via Network tab — not "hidden", but friction is much higher
- For stronger protection, run app.js + tools-extended.js through Terser (minify+obfuscate)

## Notes
- `init.js` content is kept **inline** in index.html (prevents theme flash on load)
- Load order: core.css → landing.css → patch.css (intentional cascade)
- All scripts use `defer` — no render blocking
