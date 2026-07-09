# Kotoba Marketing Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the one-page Kotoba marketing website as static HTML/CSS/JS, matching the design spec at `docs/superpowers/specs/2026-07-09-kotoba-website-design.md`.

**Architecture:** A single `index.html` with sticky nav, hero, eight feature sections (alternating media left/right), an offline-first callout, and a footer. Styling is the Claude Design project's token CSS (colors/fonts/typography/spacing/effects, copied verbatim) plus a new `site.css` for layout. Two small vanilla-JS modules (theme resolution, video autoplay gating) carry real logic and get unit tests via Node's built-in test runner; everything else is static markup verified by hand.

**Tech Stack:** Plain HTML5, CSS3 (custom properties), vanilla JS (ES modules), Node.js built-in test runner (`node --test`) for the two logic modules, Python's `http.server` for local preview. No frameworks, no bundler, no npm dependencies.

## Global Constraints

- No build step, no framework, no third-party JS/CSS dependencies (per spec's Technical Architecture).
- Mobile-first; desktop layout switches at a **900px** breakpoint (spec referenced the wireframe's 390px/1440px artboards as reference sizes, not literal CSS breakpoints — 900px is this plan's concrete choice for the mobile→desktop switch).
- Every glass surface uses the `.glass-surface` utility from `effects.css`; the Write Mode section's media frame uses `.surface-solid` instead — never glass (Liquid Glass rule: the drawing/writing surface is the one deliberate solid exception).
- Videos: `muted loop playsinline preload="metadata"`, **no `autoplay` HTML attribute** — playback is entirely JS-controlled via `IntersectionObserver` so a clip only plays once scrolled into view, and is skipped entirely under `prefers-reduced-motion: reduce`.
- Theme state lives in `data-theme` on `<html>`, persisted to `localStorage` under the key `kotoba-theme`, falling back to `prefers-color-scheme` on first visit.
- **This plan does not transcode video.** The six `.mov` captures in `media-source/` are the user's responsibility to convert later. Every `<video>` element in this plan references its final expected filename in `media/` (e.g. `media/study-review-deck-browse.mp4`) so the site works as soon as those files land — until then, the box shows its `poster` image (or a blank video element where no poster exists yet, per Task 7's mapping table).
- Repo: standalone git repo at `/Users/onlydstn/Developer/KOTOBA Website`, already initialized; spec is committed at `5ce96bc`.
- Footer must carry licensing attribution for JMdict/KANJIDIC2, Tatoeba, and KanjiVG (non-negotiable per spec).

---

### Task 1: Repo scaffold, design tokens, base page shell

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `styles/tokens/colors.css`
- Create: `styles/tokens/fonts.css`
- Create: `styles/tokens/typography.css`
- Create: `styles/tokens/spacing.css`
- Create: `styles/tokens/effects.css`
- Create: `styles/tokens.css`
- Create: `styles/site.css`
- Create: `index.html`
- Modify: `media/` → renamed to `media-source/` (shell rename, not a file edit)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: every custom property defined in `styles/tokens.css` (via its five imports) — `--color-*`, `--font-*`, `--kotoba-size-*`, `--weight-*`, `--leading-*`, `--tracking-eyebrow`, `--space-*`, `--page-margin`, `--section-gap`, `--radius-*`, `--glass-*`, `--shadow-*`, `--ease-glass`, `--duration-*`. Produces `.container` (CSS). Produces `index.html` with named insertion points `<!-- NAV -->`, `<!-- HERO -->`, `<!-- FEATURES -->`, `<!-- OFFLINE -->`, `<!-- FOOTER -->` that later tasks fill in. Produces `package.json` with `"type": "module"`, which every later JS task depends on for ES module syntax to work both in the browser and under `node --test`.

- [ ] **Step 1: Rename the raw media folder so processed output and raw captures don't collide**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
mv media media-source
mkdir media
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "kotoba-website",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test scripts",
    "preview": "python3 -m http.server 4173"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
.DS_Store
media-source/
```

Raw screen recordings/screenshots (`media-source/`) stay local only — they're large, and the site only ever references the optimized files in `media/`.

- [ ] **Step 4: Create the five token files, copied verbatim from the Claude Design project**

Create `styles/tokens/colors.css`:

```css
/* ============================================================
   Kotoba — Color tokens
   Ported 1:1 from KOTOBA/DesignSystem/Color+Tokens.swift.
   Semantic, not raw-hex: sumi/washi (ink/paper) for text & background,
   ai/shu/moss for brand + accent roles. Every token is a light/dark
   pair; increased-contrast variants are included via prefers-contrast.
   ============================================================ */

:root {
  color-scheme: light dark;

  /* ---- Brand palette (ai / shu / moss) ---- */
  --color-ai: #B8562F;
  --color-shu: #C6402B;
  --color-moss: #62785A;
  --color-moss-background: rgb(98 120 90 / 0.14);

  /* ---- Text roles (sumi ink / washi paper — not system gray) ---- */
  --color-text-primary: #1B1815;
  --color-text-secondary: #6E665A;
  --color-text-tertiary: #9A8F7D;
  --color-text-placeholder: #B3A896;

  /* ---- Background & surface roles ---- */
  --color-app-background: #F5EFE3;
  --color-surface: #FFFFFF;
  --color-chip-background: #EFE8D8;
  --color-separator: #E4DCC8;

  --color-on-brand: #FFFFFF;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-ai: #E8916D;
    --color-shu: #FF6B4E;
    --color-moss: #8FAE82;
    --color-moss-background: rgb(143 174 130 / 0.14);

    --color-text-primary: #F5EFE3;
    --color-text-secondary: #A79E8F;
    --color-text-tertiary: #7A7266;
    --color-text-placeholder: #6E665A;

    --color-app-background: #1B1815;
    --color-surface: #252017;
    --color-chip-background: #2E2A22;
    --color-separator: #3A352C;

    --color-on-brand: #1B1815;
  }
}

[data-theme="dark"] {
  --color-ai: #E8916D;
  --color-shu: #FF6B4E;
  --color-moss: #8FAE82;
  --color-moss-background: rgb(143 174 130 / 0.14);
  --color-text-primary: #F5EFE3;
  --color-text-secondary: #A79E8F;
  --color-text-tertiary: #7A7266;
  --color-text-placeholder: #6E665A;
  --color-app-background: #1B1815;
  --color-surface: #252017;
  --color-chip-background: #2E2A22;
  --color-separator: #3A352C;
  --color-on-brand: #1B1815;
}
[data-theme="light"] {
  --color-ai: #B8562F;
  --color-shu: #C6402B;
  --color-moss: #62785A;
  --color-moss-background: rgb(98 120 90 / 0.14);
  --color-text-primary: #1B1815;
  --color-text-secondary: #6E665A;
  --color-text-tertiary: #9A8F7D;
  --color-text-placeholder: #B3A896;
  --color-app-background: #F5EFE3;
  --color-surface: #FFFFFF;
  --color-chip-background: #EFE8D8;
  --color-separator: #E4DCC8;
  --color-on-brand: #FFFFFF;
}

@media (prefers-contrast: more) {
  :root {
    --color-ai: #7A3618;
    --color-shu: #8F2A1A;
    --color-moss: #435A3D;
    --color-text-primary: #1B1815;
    --color-text-secondary: #453F35;
    --color-text-tertiary: #6E665A;
    --color-separator: #B9AE92;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --color-ai: #F5B294;
      --color-shu: #FF8A6B;
      --color-moss: #B3CBA8;
      --color-text-primary: #F5EFE3;
      --color-text-secondary: #D8D0C2;
      --color-text-tertiary: #A79E8F;
      --color-separator: #55503F;
    }
  }
}
```

Create `styles/tokens/fonts.css`:

```css
/* ============================================================
   Kotoba — Webfonts
   New York (serif) → Source Serif 4 + Noto Serif JP.
   San Francisco (sans) → -apple-system stack + Noto Sans JP.
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=Noto+Serif+JP:wght@500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap');
```

Create `styles/tokens/typography.css`:

```css
/* ============================================================
   Kotoba — Typography tokens
   Ported from KOTOBA/DesignSystem/Typography.swift.
   ============================================================ */

:root {
  --font-serif: "Source Serif 4", "Noto Serif JP", Georgia, serif;
  --font-serif-jp: "Noto Serif JP", "Source Serif 4", serif;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Noto Sans JP",
    "Hiragino Sans", "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", "SFMono-Regular", Menlo, Consolas, monospace;

  --kotoba-size-large-title: clamp(2.5rem, 6vw, 4rem);
  --kotoba-size-title: clamp(1.5rem, 3vw, 1.875rem);
  --kotoba-size-headline: 1.0625rem;

  --kotoba-size-japanese-headline: clamp(2.5rem, 6vw, 4rem);
  --kotoba-size-japanese-body: 1.25rem;

  --kotoba-size-body: 1.0625rem;
  --kotoba-size-callout: 1rem;
  --kotoba-size-caption: 0.8125rem;
  --kotoba-size-caption2: 0.75rem;
  --kotoba-size-eyebrow: 0.8125rem;

  --kotoba-size-ruby: 0.625rem;

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  --tracking-eyebrow: 0.06em;
}
```

Create `styles/tokens/spacing.css`:

```css
/* ============================================================
   Kotoba — Spacing tokens
   ============================================================ */

:root {
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 6px;
  --space-4: 8px;
  --space-5: 10px;
  --space-6: 12px;
  --space-7: 14px;
  --space-8: 16px;
  --space-9: 18px;
  --space-10: 20px;
  --space-12: 24px;
  --space-14: 28px;
  --space-16: 32px;
  --space-20: 40px;
  --space-24: 48px;
  --space-32: 64px;
  --space-40: 80px;
  --space-48: 96px;
  --space-64: 128px;

  --page-margin: clamp(20px, 4vw, 64px);
  --section-gap: clamp(64px, 10vw, 128px);
}
```

Create `styles/tokens/effects.css`:

```css
/* ============================================================
   Kotoba — Effects: Liquid Glass, radii, shadows
   ============================================================ */

:root {
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 18px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --glass-blur: 20px;
  --glass-saturation: 1.5;
  --glass-tint: rgb(255 255 255 / 0.55);
  --glass-border: rgb(255 255 255 / 0.5);
  --glass-specular: rgb(255 255 255 / 0.65);
  --glass-shadow: 0 1px 2px rgb(27 24 21 / 0.04), 0 8px 24px rgb(27 24 21 / 0.08);

  --shadow-card: 0 1px 2px rgb(27 24 21 / 0.05), 0 6px 16px rgb(27 24 21 / 0.06);
  --shadow-raised: 0 2px 6px rgb(27 24 21 / 0.08), 0 16px 40px rgb(27 24 21 / 0.10);

  --ease-glass: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 160ms;
  --duration-normal: 280ms;
  --duration-slow: 480ms;
}

@media (prefers-color-scheme: dark) {
  :root {
    --glass-tint: rgb(37 32 23 / 0.55);
    --glass-border: rgb(245 239 227 / 0.12);
    --glass-specular: rgb(245 239 227 / 0.14);
    --glass-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 8px 24px rgb(0 0 0 / 0.35);
    --shadow-card: 0 1px 2px rgb(0 0 0 / 0.3), 0 6px 16px rgb(0 0 0 / 0.3);
    --shadow-raised: 0 2px 6px rgb(0 0 0 / 0.35), 0 16px 40px rgb(0 0 0 / 0.4);
  }
}
[data-theme="dark"] {
  --glass-tint: rgb(37 32 23 / 0.55);
  --glass-border: rgb(245 239 227 / 0.12);
  --glass-specular: rgb(245 239 227 / 0.14);
  --glass-shadow: 0 1px 2px rgb(0 0 0 / 0.3), 0 8px 24px rgb(0 0 0 / 0.35);
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.3), 0 6px 16px rgb(0 0 0 / 0.3);
  --shadow-raised: 0 2px 6px rgb(0 0 0 / 0.35), 0 16px 40px rgb(0 0 0 / 0.4);
}
[data-theme="light"] {
  --glass-tint: rgb(255 255 255 / 0.55);
  --glass-border: rgb(255 255 255 / 0.5);
  --glass-specular: rgb(255 255 255 / 0.65);
  --glass-shadow: 0 1px 2px rgb(27 24 21 / 0.04), 0 8px 24px rgb(27 24 21 / 0.08);
  --shadow-card: 0 1px 2px rgb(27 24 21 / 0.05), 0 6px 16px rgb(27 24 21 / 0.06);
  --shadow-raised: 0 2px 6px rgb(27 24 21 / 0.08), 0 16px 40px rgb(27 24 21 / 0.10);
}

.glass-surface {
  background: var(--glass-tint);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow), inset 0 1px 0 var(--glass-specular);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
}
@media (prefers-reduced-motion: reduce) {
  .glass-surface { -webkit-backdrop-filter: none; backdrop-filter: none; background: var(--color-surface); }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-surface { background: var(--color-surface); }
}

.surface-solid {
  background: var(--color-surface);
  border: 1px solid var(--color-separator);
  box-shadow: var(--shadow-card);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
```

- [ ] **Step 5: Create the token aggregator `styles/tokens.css`**

```css
@import url("tokens/colors.css");
@import url("tokens/fonts.css");
@import url("tokens/typography.css");
@import url("tokens/spacing.css");
@import url("tokens/effects.css");
```

- [ ] **Step 6: Create `styles/site.css` with the base reset and container**

```css
/* ============================================================
   Kotoba marketing site — layout
   Built entirely on the tokens in tokens.css. No new colors or
   sizes are invented here — only layout and component structure.
   ============================================================ */

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--color-app-background);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: var(--kotoba-size-body);
  line-height: var(--leading-normal);
}

img, video {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
}

.container {
  max-width: 1180px;
  margin-inline: auto;
  padding-inline: var(--page-margin);
}
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kotoba — a Japanese dictionary that feels like a well-made reference book</title>
  <meta name="description" content="Look up any Japanese word or kanji and get its meaning, readings, real example sentences, animated stroke order, and native audio — fully offline.">
  <link rel="stylesheet" href="styles/tokens.css">
  <link rel="stylesheet" href="styles/site.css">
</head>
<body>
  <header class="site-nav">
    <!-- NAV -->
  </header>

  <main>
    <section class="hero">
      <!-- HERO -->
    </section>

    <!-- FEATURES -->

    <section class="offline-band">
      <!-- OFFLINE -->
    </section>
  </main>

  <footer class="site-footer">
    <!-- FOOTER -->
  </footer>
</body>
</html>
```

- [ ] **Step 8: Verify the token files parse and the page renders with the right base styling**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
grep -c -- "--color-ai:" styles/tokens/colors.css
grep -c -- "--kotoba-size-body:" styles/tokens/typography.css
grep -c "container" styles/site.css
open index.html
```

Expected: both `grep -c` calls print `2` (light + dark block each define `--color-ai`; typography's `--kotoba-size-body` is defined once, so that one prints `1`), the third prints at least `1`. In the browser, the page should be a solid warm paper background (`#F5EFE3`) with no visible content yet (nav/hero/features are still empty comments) — confirms the token cascade and body base styles are wired correctly.

- [ ] **Step 9: Commit**

```bash
git add package.json .gitignore styles/ index.html
git commit -m "Scaffold site shell and port design tokens from Claude Design"
```

---

### Task 2: Process source screenshots into optimized media assets

**Files:**
- Create: `media/hero-dashboard.png`
- Create: `media/search-lookup.png`
- Create: `media/kanji-detail.png`
- Create: `media/stroke-order.png`
- Create: `media/study-review-deck-browse-poster.png`
- Create: `media/study-review-review-session-poster.png`
- Create: `media/dashboard-dark.png`

**Interfaces:**
- Consumes: `media-source/1.PNG` … `media-source/7.PNG` (raw 1206×2622 screen captures, produced by Task 1's rename).
- Produces: seven 700px-wide PNGs in `media/`, at the exact filenames every later task's `<img>`/`poster` attributes reference.

- [ ] **Step 1: Resize each screenshot to a 700px-wide asset (2x headroom for the largest 260–350px CSS display width used anywhere on the site)**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
sips --resampleWidth 700 media-source/1.PNG --out media/hero-dashboard.png
sips --resampleWidth 700 media-source/5.PNG --out media/search-lookup.png
sips --resampleWidth 700 media-source/4.PNG --out media/kanji-detail.png
sips --resampleWidth 700 media-source/3.PNG --out media/stroke-order.png
sips --resampleWidth 700 media-source/2.PNG --out media/study-review-deck-browse-poster.png
sips --resampleWidth 700 media-source/6.PNG --out media/study-review-review-session-poster.png
sips --resampleWidth 700 media-source/7.PNG --out media/dashboard-dark.png
```

- [ ] **Step 2: Verify dimensions and file size**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
sips -g pixelWidth -g pixelHeight media/*.png
du -h media/*.png
```

Expected: every file reports `pixelWidth: 700` (height ≈1522, preserving the 1206:2622 source ratio), and each file is well under 1MB (source files were 0.4–1.4MB at full 1206px width; a 700px re-encode should land roughly 40–60% smaller).

- [ ] **Step 3: Commit**

```bash
git add media/
git commit -m "Add optimized screenshot assets for the marketing site"
```

---

### Task 3: Theme toggle module and nav

**Files:**
- Create: `scripts/theme.js`
- Create: `scripts/theme.test.js`
- Create: `scripts/main.js`
- Modify: `index.html` (replace `<!-- NAV -->`, add `<script type="module">` before `</body>`)
- Modify: `styles/site.css` (append nav + theme-toggle rules)

**Interfaces:**
- Consumes: `--color-ai`, `--kotoba-size-title`, `--kotoba-size-callout`, `--space-*`, `--radius-pill`, `--font-serif-jp`, `.glass-surface` (all from Task 1's tokens). Consumes `package.json`'s `"type": "module"` (Task 1).
- Produces: `resolveInitialTheme(storedTheme: string | null, prefersDark: boolean): 'light' | 'dark'`, `nextTheme(currentTheme: 'light' | 'dark'): 'light' | 'dark'` (exported from `scripts/theme.js`, imported by `scripts/main.js` and by every later task's video-gating logic doesn't touch these — but Task 6 imports the same `scripts/main.js` entry point to add a second `init*()` call). Produces the `.js-theme-toggle` class and `data-theme` attribute contract other tasks rely on for anything theme-aware.

- [ ] **Step 1: Write the failing tests for the pure theme-resolution logic**

Create `scripts/theme.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveInitialTheme, nextTheme } from './theme.js';

test('resolveInitialTheme uses the stored theme when present', () => {
  assert.equal(resolveInitialTheme('dark', false), 'dark');
  assert.equal(resolveInitialTheme('light', true), 'light');
});

test('resolveInitialTheme falls back to the OS preference when nothing is stored', () => {
  assert.equal(resolveInitialTheme(null, true), 'dark');
  assert.equal(resolveInitialTheme(null, false), 'light');
});

test('resolveInitialTheme ignores an invalid stored value and falls back to OS preference', () => {
  assert.equal(resolveInitialTheme('sepia', true), 'dark');
});

test('nextTheme flips between light and dark', () => {
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('light'), 'dark');
});
```

- [ ] **Step 2: Run the tests and confirm they fail because `theme.js` doesn't exist yet**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
node --test scripts/theme.test.js
```

Expected: FAIL — `Cannot find module './theme.js'`.

- [ ] **Step 3: Implement `scripts/theme.js`**

```js
export function resolveInitialTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}
```

- [ ] **Step 4: Run the tests again and confirm they pass**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
node --test scripts/theme.test.js
```

Expected: PASS — 4 tests, 0 failures.

- [ ] **Step 5: Create `scripts/main.js` wiring theme state to the DOM**

```js
import { resolveInitialTheme, nextTheme } from './theme.js';

const THEME_STORAGE_KEY = 'kotoba-theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const toggle = document.querySelector('.js-theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

function initTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(resolveInitialTheme(stored, prefersDark));

  const toggle = document.querySelector('.js-theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(nextTheme(current));
    });
  }
}

initTheme();
```

- [ ] **Step 6: Wire the module into the page**

Modify `index.html` — replace:

```html
</body>
```

with:

```html
  <script type="module" src="scripts/main.js"></script>
</body>
```

- [ ] **Step 7: Add the nav markup**

Modify `index.html` — replace:

```html
  <header class="site-nav">
    <!-- NAV -->
  </header>
```

with:

```html
  <header class="site-nav glass-surface">
    <a class="site-nav__mark" href="#top">言葉 Kotoba</a>
    <nav aria-label="Primary">
      <ul class="site-nav__links">
        <li><a href="#search-lookup">Search</a></li>
        <li><a href="#study-review">Study</a></li>
        <li><a href="#offline">Offline</a></li>
      </ul>
    </nav>
    <button type="button" class="theme-toggle js-theme-toggle" aria-pressed="false" aria-label="Toggle color theme">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
      </svg>
    </button>
  </header>
```

- [ ] **Step 8: Add nav + theme-toggle CSS**

Append to `styles/site.css`:

```css
/* === NAV === */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) var(--page-margin);
}

.site-nav__mark {
  font-family: var(--font-serif-jp);
  font-size: var(--kotoba-size-title);
  font-weight: var(--weight-semibold);
  text-decoration: none;
  color: var(--color-text-primary);
}

.site-nav__links {
  display: none;
  gap: var(--space-16);
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-nav__links a {
  text-decoration: none;
  font-size: var(--kotoba-size-callout);
  color: var(--color-text-secondary);
}

.theme-toggle {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-pill);
  display: grid;
  place-items: center;
  color: var(--color-text-primary);
}

@media (min-width: 900px) {
  .site-nav__links {
    display: flex;
  }
}
```

- [ ] **Step 9: Manually verify theme persistence**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173` in a browser. Click the toggle button in the nav: confirm the page background flips between the light paper tone (`#F5EFE3`) and the dark ink tone (`#1B1815`), the button's `aria-pressed` attribute flips in devtools, and reloading the page keeps the chosen theme (check `localStorage.kotoba-theme` in devtools). Stop the server with Ctrl-C when done.

- [ ] **Step 10: Commit**

```bash
git add scripts/theme.js scripts/theme.test.js scripts/main.js index.html styles/site.css
git commit -m "Add theme toggle with tested resolution logic and site nav"
```

---

### Task 4: Hero section

**Files:**
- Modify: `index.html` (replace `<!-- HERO -->`)
- Modify: `styles/site.css` (append hero + button + media-frame rules)

**Interfaces:**
- Consumes: `media/hero-dashboard.png` (Task 2), `.glass-surface` (Task 1), `--color-ai`, `--kotoba-size-large-title`, `--kotoba-size-callout`, `--font-serif` (Task 1).
- Produces: `.media-frame` and `.button` — both reused by every later feature section and the footer/nav respectively is not needed for button, but `.media-frame` is the shared component every remaining task builds on.

- [ ] **Step 1: Add the hero markup**

Modify `index.html` — replace:

```html
    <section class="hero">
      <!-- HERO -->
    </section>
```

with:

```html
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <h1 class="hero__headline">Kotoba</h1>
          <p class="hero__blurb">A Japanese dictionary that feels like a well-made reference book — meanings, readings, real example sentences, animated stroke order, and native audio, fully offline.</p>
          <a class="button button--primary" href="#">Download on the App Store</a>
        </div>
        <div class="media-frame media-frame--hero glass-surface">
          <img src="media/hero-dashboard.png" alt="Kotoba's home screen showing recent searches and a kanji of the day card" width="700" height="1522" loading="eager">
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Add hero, button, and media-frame CSS**

Append to `styles/site.css`:

```css
/* === HERO === */
.hero {
  padding-block: var(--space-32) var(--space-40);
}

.hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-24);
  text-align: center;
}

.hero__headline {
  font-family: var(--font-serif);
  font-size: var(--kotoba-size-large-title);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  margin: 0;
}

.hero__blurb {
  max-width: 32rem;
  color: var(--color-text-secondary);
  font-size: var(--kotoba-size-callout);
  margin: 0;
}

/* === BUTTON === */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-14);
  border-radius: var(--radius-pill);
  text-decoration: none;
  font-size: var(--kotoba-size-callout);
  font-weight: var(--weight-medium);
}

.button--primary {
  border: 2px solid var(--color-ai);
  color: var(--color-ai);
}

/* === MEDIA FRAME (shared by every feature section) === */
.media-frame {
  border-radius: var(--radius-xl);
  overflow: hidden;
  flex: none;
}

.media-frame--hero {
  width: min(260px, 70vw);
}

@media (min-width: 900px) {
  .hero__inner {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
    gap: var(--space-32);
  }
  .hero__copy {
    max-width: 34rem;
  }
  .hero__blurb {
    max-width: none;
  }
}
```

- [ ] **Step 3: Verify visually**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173`. Confirm: the hero headline "Kotoba" renders in serif, the blurb and CTA pill appear below it, and the dashboard screenshot appears in a rounded glass-bordered frame. Resize the browser past 900px width — the layout should switch from stacked/centered to a two-column row with text on the left, image on the right.

- [ ] **Step 4: Commit**

```bash
git add index.html styles/site.css
git commit -m "Add hero section"
```

---

### Task 5: Static screenshot feature sections (Search & Lookup, Kanji Detail & Stroke Order)

**Files:**
- Modify: `index.html` (fill `<!-- FEATURES -->` with the first two sections)
- Modify: `styles/site.css` (append the reusable `.feature` component)

**Interfaces:**
- Consumes: `.media-frame`, `.glass-surface` (Task 1/4), `media/search-lookup.png`, `media/kanji-detail.png`, `media/stroke-order.png` (Task 2).
- Produces: `.feature`, `.feature__inner`, `.feature__eyebrow`, `.feature__headline`, `.feature__body`, `.feature--reverse`, `.feature__media-pair` — the component every remaining feature section (Task 7) and the offline band (Task 8) build on.

- [ ] **Step 1: Add the two sections' markup**

Modify `index.html` — replace:

```html
    <!-- FEATURES -->
```

with:

```html
    <section id="search-lookup" class="feature">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Search &amp; Lookup</p>
          <h2 class="feature__headline">Instant word and kanji search, real results</h2>
          <p class="feature__body">Type in kana, kanji, or romaji and get ranked matches straight from the bundled dictionary corpus — no network round trip.</p>
        </div>
        <div class="media-frame glass-surface">
          <img src="media/search-lookup.png" alt="Kotoba's search screen showing live results for a partially typed query" width="700" height="1522" loading="lazy">
        </div>
      </div>
    </section>

    <section id="kanji-detail" class="feature feature--reverse">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Kanji Detail &amp; Stroke Order</p>
          <h2 class="feature__headline">Every kanji, broken down</h2>
          <p class="feature__body">Readings, meaning, grade, and jōyō status alongside every recorded stroke path — the same data KanjiVG ships, not a simplified summary.</p>
        </div>
        <div class="feature__media-pair">
          <div class="media-frame glass-surface">
            <img src="media/kanji-detail.png" alt="Kotoba's kanji detail screen showing readings, grade, and stroke count" width="700" height="1522" loading="lazy">
          </div>
          <div class="media-frame glass-surface">
            <img src="media/stroke-order.png" alt="Kotoba's stroke order screen showing a kanji's recorded stroke paths" width="700" height="1522" loading="lazy">
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES:VIDEO -->
```

The `<!-- FEATURES:VIDEO -->` marker is a new anchor Task 7 will replace — it's inserted now so Task 7 has an exact insertion point after these two static sections.

- [ ] **Step 2: Add the shared `.feature` component CSS**

Append to `styles/site.css`:

```css
/* === FEATURE SECTIONS === */
.feature {
  border-top: 1px solid var(--color-separator);
  padding-block: var(--space-32);
}

.feature__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-20);
  text-align: center;
}

.feature__eyebrow {
  font-family: var(--font-sans);
  font-size: var(--kotoba-size-eyebrow);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--color-ai);
  margin: 0 0 var(--space-4);
}

.feature__headline {
  font-family: var(--font-serif);
  font-size: var(--kotoba-size-title);
  font-weight: var(--weight-semibold);
  margin: 0 0 var(--space-6);
}

.feature__body {
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 34rem;
}

.feature .media-frame {
  width: min(220px, 60vw);
}

.feature__media-pair {
  display: flex;
  gap: var(--space-8);
}

.feature__media-pair .media-frame {
  width: min(150px, 40vw);
}

@media (min-width: 900px) {
  .feature__inner {
    flex-direction: row;
    text-align: left;
    justify-content: space-between;
    gap: var(--space-32);
  }
  .feature--reverse .feature__inner {
    flex-direction: row-reverse;
  }
  .feature__copy {
    max-width: 30rem;
  }
  .feature .media-frame,
  .feature__media-pair .media-frame {
    width: 220px;
  }
}
```

- [ ] **Step 3: Verify visually**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173`. Confirm both sections render below the hero: Search & Lookup with text left / image right on desktop, Kanji Detail & Stroke Order with image left / text right (the `--reverse` variant) and two screenshots side by side. Confirm both stack centered on a narrow (390px) viewport via devtools responsive mode.

- [ ] **Step 4: Commit**

```bash
git add index.html styles/site.css
git commit -m "Add Search & Lookup and Kanji Detail & Stroke Order sections"
```

---

### Task 6: Video autoplay-gating module

**Files:**
- Create: `scripts/video-autoplay.js`
- Create: `scripts/video-autoplay.test.js`
- Modify: `scripts/main.js` (add `initLazyVideos`)

**Interfaces:**
- Consumes: `package.json`'s `"type": "module"` (Task 1).
- Produces: `shouldPlay(isIntersecting: boolean, prefersReducedMotion: boolean): boolean` (exported from `scripts/video-autoplay.js`). Produces the `.js-lazy-video` class contract: any `<video class="js-lazy-video">` in the DOM is automatically observed and play/pause-gated once this task's `initLazyVideos()` runs. Task 7 is the first task that adds actual `<video class="js-lazy-video">` elements.

- [ ] **Step 1: Write the failing tests for the pure gating logic**

Create `scripts/video-autoplay.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlay } from './video-autoplay.js';

test('plays when the video is in view and motion is not reduced', () => {
  assert.equal(shouldPlay(true, false), true);
});

test('does not play when the video is out of view', () => {
  assert.equal(shouldPlay(false, false), false);
});

test('never plays when reduced motion is requested, even in view', () => {
  assert.equal(shouldPlay(true, true), false);
  assert.equal(shouldPlay(false, true), false);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
node --test scripts/video-autoplay.test.js
```

Expected: FAIL — `Cannot find module './video-autoplay.js'`.

- [ ] **Step 3: Implement `scripts/video-autoplay.js`**

```js
export function shouldPlay(isIntersecting, prefersReducedMotion) {
  return isIntersecting && !prefersReducedMotion;
}
```

- [ ] **Step 4: Run the tests again and confirm they pass**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
node --test scripts/video-autoplay.test.js
```

Expected: PASS — 3 tests, 0 failures.

- [ ] **Step 5: Wire the gating logic into `scripts/main.js`**

Modify `scripts/main.js` — replace:

```js
import { resolveInitialTheme, nextTheme } from './theme.js';
```

with:

```js
import { resolveInitialTheme, nextTheme } from './theme.js';
import { shouldPlay } from './video-autoplay.js';
```

Modify `scripts/main.js` — replace:

```js
initTheme();
```

with:

```js
function initLazyVideos() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = document.querySelectorAll('.js-lazy-video');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    videos.forEach((video) => video.pause());
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (shouldPlay(entry.isIntersecting, prefersReducedMotion)) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.35 }
  );

  videos.forEach((video) => observer.observe(video));
}

initTheme();
initLazyVideos();
```

- [ ] **Step 6: Run the full test suite**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
npm test
```

Expected: PASS — 7 tests total (4 from `theme.test.js`, 3 from `video-autoplay.test.js`), 0 failures.

- [ ] **Step 7: Commit**

```bash
git add scripts/video-autoplay.js scripts/video-autoplay.test.js scripts/main.js
git commit -m "Add tested video autoplay-gating module"
```

---

### Task 7: Video feature sections (Study & Review, Kanji of the Day, Quiz Mode, Write Mode, Light & Dark)

**Files:**
- Modify: `index.html` (replace `<!-- FEATURES:VIDEO -->`)
- Modify: `styles/site.css` (append triptych media-pair variant)

**Interfaces:**
- Consumes: `.feature`, `.feature--reverse`, `.feature__media-pair`, `.media-frame`, `.glass-surface`, `.surface-solid` (Tasks 1, 4, 5), `.js-lazy-video` wiring (Task 6), `media/study-review-deck-browse-poster.png`, `media/study-review-review-session-poster.png`, `media/dashboard-dark.png`, `media/hero-dashboard.png` (Task 2).
- Produces: five more `<section>` elements. Also documents the exact `.mp4` filenames the user must place in `media/` later:

| Section | Video element `src` | Poster (exists now) |
|---|---|---|
| Study & Review | `media/study-review-deck-browse.mp4` | `media/study-review-deck-browse-poster.png` |
| Study & Review | `media/study-review-review-session.mp4` | `media/study-review-review-session-poster.png` |
| Kanji of the Day | `media/kanji-of-the-day.mp4` | none yet |
| Quiz Mode | `media/quiz-mode.mp4` | none yet |
| Write Mode | `media/write-mode.mp4` | none yet |
| Light & Dark | `media/theme-toggle.mp4` | `media/hero-dashboard.png` |

Until the user drops the `.mp4` files into `media/`, sections with a poster show that still image; the three with no poster yet (Kanji of the Day, Quiz Mode, Write Mode) show an empty video box — expected interim state, not a bug.

- [ ] **Step 1: Add the five sections' markup**

Modify `index.html` — replace:

```html
    <!-- FEATURES:VIDEO -->
```

with:

```html
    <section id="study-review" class="feature">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Study &amp; Review</p>
          <h2 class="feature__headline">Spaced repetition that fits your day</h2>
          <p class="feature__body">Build decks from anything you've looked up, then review on a schedule tuned to what you actually remember.</p>
        </div>
        <div class="feature__media-pair">
          <div class="media-frame glass-surface">
            <video class="js-lazy-video" muted loop playsinline preload="metadata" poster="media/study-review-deck-browse-poster.png" aria-label="Kotoba's deck browsing screen, scrolling through study decks">
              <source src="media/study-review-deck-browse.mp4" type="video/mp4">
            </video>
          </div>
          <div class="media-frame glass-surface">
            <video class="js-lazy-video" muted loop playsinline preload="metadata" poster="media/study-review-review-session-poster.png" aria-label="Kotoba's review session screen grading a flashcard">
              <source src="media/study-review-review-session.mp4" type="video/mp4">
            </video>
          </div>
        </div>
      </div>
    </section>

    <section id="kanji-of-the-day" class="feature feature--reverse">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Kanji of the Day</p>
          <h2 class="feature__headline">A small daily habit</h2>
          <p class="feature__body">One kanji, every day, with its readings and meaning surfaced the moment you open the app.</p>
        </div>
        <div class="media-frame glass-surface">
          <video class="js-lazy-video" muted loop playsinline preload="metadata" aria-label="Kotoba's kanji of the day card">
            <source src="media/kanji-of-the-day.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </section>

    <section id="quiz-mode" class="feature">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Quiz Mode</p>
          <h2 class="feature__headline">Test what you've learned</h2>
          <p class="feature__body">Multiple-choice and recall quizzes pulled from your own decks — a quick check, not a chore.</p>
        </div>
        <div class="media-frame glass-surface">
          <video class="js-lazy-video" muted loop playsinline preload="metadata" aria-label="Kotoba's quiz session in progress">
            <source src="media/quiz-mode.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </section>

    <section id="write-mode" class="feature feature--reverse">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Write Mode</p>
          <h2 class="feature__headline">Trace it to know it</h2>
          <p class="feature__body">Draw each stroke yourself and get immediate feedback against the kanji's real stroke order.</p>
        </div>
        <div class="media-frame surface-solid">
          <video class="js-lazy-video" muted loop playsinline preload="metadata" aria-label="Kotoba's write mode, tracing a kanji's strokes by hand">
            <source src="media/write-mode.mp4" type="video/mp4">
          </video>
        </div>
      </div>
    </section>

    <section id="light-dark" class="feature">
      <div class="container feature__inner">
        <div class="feature__copy">
          <p class="feature__eyebrow">Light &amp; Dark</p>
          <h2 class="feature__headline">Matches the way you read</h2>
          <p class="feature__body">Every screen, every glass surface, and every ink tone has a considered dark counterpart — not an inverted filter.</p>
        </div>
        <div class="feature__media-pair feature__media-pair--triptych">
          <div class="media-frame glass-surface">
            <img src="media/hero-dashboard.png" alt="Kotoba's home screen in light mode" width="700" height="1522" loading="lazy">
          </div>
          <div class="media-frame glass-surface">
            <video class="js-lazy-video" muted loop playsinline preload="metadata" poster="media/hero-dashboard.png" aria-label="Kotoba's home screen animating from light mode to dark mode">
              <source src="media/theme-toggle.mp4" type="video/mp4">
            </video>
          </div>
          <div class="media-frame glass-surface">
            <img src="media/dashboard-dark.png" alt="Kotoba's home screen in dark mode" width="700" height="1522" loading="lazy">
          </div>
        </div>
      </div>
    </section>
```

Note: the Write Mode section's media frame uses `surface-solid`, not `glass-surface` — this is intentional (see Global Constraints) and must not be "fixed" to match its siblings.

- [ ] **Step 2: Add the triptych layout variant**

Append to `styles/site.css`:

```css
/* === LIGHT & DARK TRIPTYCH === */
.feature__media-pair--triptych .media-frame {
  width: min(110px, 30vw);
}

@media (min-width: 900px) {
  .feature__media-pair--triptych .media-frame {
    width: 160px;
  }
}
```

- [ ] **Step 3: Verify visually and confirm reduced-motion behavior**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173`. Confirm all five sections render in order, alternating layout direction, with the Write Mode media frame visibly opaque (no blur/translucency) compared to its glass siblings. In Chrome devtools, open the Rendering tab and set "Emulate CSS media feature `prefers-reduced-motion`" to `reduce`, reload — confirm no video attempts to play (posters or blank boxes only, no motion).

- [ ] **Step 4: Commit**

```bash
git add index.html styles/site.css
git commit -m "Add Study & Review, Kanji of the Day, Quiz Mode, Write Mode, and Light & Dark sections"
```

---

### Task 8: Offline-first band and footer

**Files:**
- Modify: `index.html` (replace `<!-- OFFLINE -->` and `<!-- FOOTER -->`)
- Modify: `styles/site.css` (append offline-band and footer rules)

**Interfaces:**
- Consumes: `.feature__eyebrow`, `.feature__headline`, `.feature__body`, `.container` (Tasks 1, 5).
- Produces: `.offline-band`, `.site-footer` — final two sections of the page.

- [ ] **Step 1: Add the offline-band markup**

Modify `index.html` — replace:

```html
    <section class="offline-band">
      <!-- OFFLINE -->
    </section>
```

with:

```html
    <section id="offline" class="offline-band">
      <div class="container offline-band__inner">
        <svg class="offline-band__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <p class="feature__eyebrow">Offline-first</p>
        <h2 class="feature__headline">No connection required</h2>
        <p class="feature__body">The full dictionary — JMdict, KANJIDIC2, example sentences, and stroke data — ships on-device. Look things up on a plane, underground, or anywhere else the network doesn't reach.</p>
      </div>
    </section>
```

- [ ] **Step 2: Add the footer markup**

Modify `index.html` — replace:

```html
  <footer class="site-footer">
    <!-- FOOTER -->
  </footer>
```

with:

```html
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p class="site-footer__attribution">Dictionary data: JMdict &amp; KANJIDIC2 (CC BY-SA 4.0, EDRDG), Tatoeba (CC BY 2.0 FR), KanjiVG (CC BY-SA 3.0, U. Apel).</p>
      <ul class="site-footer__links">
        <li><a href="#">App Store</a></li>
        <li><a href="#">Acknowledgements</a></li>
      </ul>
    </div>
  </footer>
```

- [ ] **Step 3: Add offline-band and footer CSS**

Append to `styles/site.css`:

```css
/* === OFFLINE BAND === */
.offline-band {
  border-top: 1px solid var(--color-separator);
  background: var(--color-chip-background);
  padding-block: var(--space-32);
}

.offline-band__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-6);
}

.offline-band__icon {
  color: var(--color-ai);
  margin-bottom: var(--space-4);
}

/* === FOOTER === */
.site-footer {
  padding-block: var(--space-16);
}

.site-footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  align-items: center;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--kotoba-size-caption);
}

.site-footer__links {
  display: flex;
  gap: var(--space-16);
  list-style: none;
  margin: 0;
  padding: 0;
}

.site-footer__links a {
  text-decoration: none;
  color: var(--color-text-secondary);
}

@media (min-width: 900px) {
  .site-footer__inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
```

- [ ] **Step 4: Verify visually**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173`, scroll to the bottom. Confirm the offline band has a distinct (chip-background) tint from the surrounding sections, and the footer shows the full licensing attribution sentence plus two links, side-by-side on desktop and stacked/centered on mobile.

- [ ] **Step 5: Commit**

```bash
git add index.html styles/site.css
git commit -m "Add offline-first band and footer with licensing attribution"
```

---

### Task 9: Head metadata and favicon

**Files:**
- Create: `favicon.svg`
- Modify: `index.html` (append meta tags and favicon link inside `<head>`)

**Interfaces:**
- Consumes: `--color-ai` value (`#B8562F`) for the favicon background, matching the app's brand anchor color.
- Produces: nothing consumed by later tasks — this is a leaf task.

- [ ] **Step 1: Create the favicon**

No app icon/wordmark artwork exists yet (per spec's Open Items) — this is a minimal placeholder using the brand color and the serif "言" glyph, swappable later.

Create `favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#B8562F"/>
  <text x="16" y="23" font-family="Georgia, 'Noto Serif JP', serif" font-size="20" font-weight="700" fill="#FFFFFF" text-anchor="middle">言</text>
</svg>
```

- [ ] **Step 2: Add favicon link and remaining meta tags**

Modify `index.html` — replace:

```html
  <meta name="description" content="Look up any Japanese word or kanji and get its meaning, readings, real example sentences, animated stroke order, and native audio — fully offline.">
  <link rel="stylesheet" href="styles/tokens.css">
```

with:

```html
  <meta name="description" content="Look up any Japanese word or kanji and get its meaning, readings, real example sentences, animated stroke order, and native audio — fully offline.">
  <meta name="theme-color" content="#F5EFE3" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1B1815" media="(prefers-color-scheme: dark)">
  <meta property="og:title" content="Kotoba — a Japanese dictionary that feels like a reference book">
  <meta property="og:description" content="Look up any Japanese word or kanji and get its meaning, readings, real example sentences, animated stroke order, and native audio — fully offline.">
  <meta property="og:type" content="website">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="styles/tokens.css">
```

- [ ] **Step 3: Verify**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
python3 -m http.server 4173
```

Open `http://localhost:4173` and check the browser tab shows the terracotta favicon with the "言" glyph. View page source and confirm all the new meta tags are present inside `<head>`.

- [ ] **Step 4: Commit**

```bash
git add favicon.svg index.html
git commit -m "Add favicon and page metadata"
```

---

### Task 10: Final verification pass and local-preview README

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: the completed site from Tasks 1–9.
- Produces: `README.md` documenting local preview and how to finish the video pipeline.

- [ ] **Step 1: Create `README.md`**

```markdown
# Kotoba marketing website

Static one-page marketing site for Kotoba. No build step — plain HTML, CSS, and JS.

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. A local server is required (not `file://`) because
`scripts/main.js` loads as an ES module.

## Running tests

```bash
npm test
```

Runs the two logic modules' unit tests (`scripts/theme.test.js`, `scripts/video-autoplay.test.js`)
via Node's built-in test runner. No dependencies to install.

## Adding the feature-demo videos

The six raw screen recordings in `media-source/` (gitignored) still need transcoding to web-ready
`.mp4` before the video sections show motion instead of a poster/blank frame. Convert each and
drop it into `media/` under the exact filename the markup already expects:

| Raw file | Web filename |
|---|---|
| `media-source/video1.mov` (DeckBrowse) | `media/study-review-deck-browse.mp4` |
| `media-source/video4.mov` (ReviewCard) | `media/study-review-review-session.mp4` |
| `media-source/video2.mov` (KanjiOfTheDay) | `media/kanji-of-the-day.mp4` |
| `media-source/video5.mov` (QuizSessionActive) | `media/quiz-mode.mp4` |
| `media-source/video3.mov` (WriteCard) | `media/write-mode.mp4` |
| `media-source/video6.mov` (dark-mode toggle) | `media/theme-toggle.mp4` |

Once a file lands at the right path, no HTML/JS changes are needed — the `<video>` elements
already reference these filenames and the in-view/reduced-motion gating in `scripts/main.js`
picks them up automatically.
```

- [ ] **Step 2: Run the full manual verification checklist from the spec**

```bash
cd "/Users/onlydstn/Developer/KOTOBA Website"
npm test
python3 -m http.server 4173
```

With the server running, walk through:
- **Breakpoints**: resize to 390px, ~768px, and 1440px in devtools responsive mode — confirm sections stack on mobile and go two-column on desktop with no horizontal scrollbar at any width.
- **Light / dark**: toggle via the nav button; separately, clear `localStorage` and reload with the OS set to dark — confirm the page opens in dark mode with no toggle click needed.
- **Reduced motion**: enable the devtools "prefers-reduced-motion: reduce" emulation — confirm no video plays.
- **Increased contrast**: enable the devtools "prefers-contrast: more" emulation — confirm text and borders visibly darken/lighten further.
- **Backdrop-filter fallback**: in the devtools Rendering tab, disable backdrop-filter support (or check the CSS `@supports not` fallback by reading `styles/tokens/effects.css`) — confirm glass surfaces still show a readable solid card rather than a broken transparent box.
- **Cross-browser**: open the same `localhost:4173` URL in Safari and Firefox (if available) — confirm layout and fonts render consistently.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add README with local preview and video pipeline instructions"
```

---

## Self-Review Notes

- **Spec coverage**: every section in the spec's content table (Hero through Footer) has a task; the theming, video-gating, and reduced-motion/contrast requirements from the Accessibility section are implemented in Tasks 3, 6, 7 and verified in Task 10; the Testing/verification plan's manual checklist is reproduced directly in Task 10, Step 2.
- **Placeholder scan**: no TBD/TODO markers; every step has complete, runnable code.
- **Type consistency**: `resolveInitialTheme`/`nextTheme` signatures introduced in Task 3 are used unchanged in Task 3 Step 5 and never redefined; `shouldPlay` introduced in Task 6 is used unchanged in Task 6 Step 5. The `.js-lazy-video`, `.media-frame`, `.glass-surface`/`.surface-solid`, and `.feature*` class names are introduced once each and reused verbatim across later tasks.
- **Deviation from spec worth flagging explicitly**: the spec's Technical Architecture section shows `<video autoplay muted loop playsinline preload="metadata">` as illustrative markup. This plan omits the `autoplay` HTML attribute and drives playback entirely from `scripts/main.js`'s `IntersectionObserver`, because keeping `autoplay` in markup would fight the same section's own requirement that clips "only start once scrolled into view" and the Accessibility section's reduced-motion requirement — an HTML `autoplay` attribute doesn't consult `prefers-reduced-motion` on its own. This is a more correct implementation of the same stated intent, not a scope change.
