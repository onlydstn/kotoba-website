# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A one-page static marketing site for **Kotoba**, a native iOS Japanese dictionary/study app. No
framework, no build step, no npm dependencies — plain HTML5, CSS3 (custom properties), and vanilla
JS ES modules. Deployed to GitHub Pages (custom domain via `CNAME`: `kotoba.onlydstn.de`).

The design tokens (`styles/tokens/*.css`) are ported 1:1 from the iOS app's own SwiftUI design
system (`KOTOBA/DesignSystem/Color+Tokens.swift`, `Typography.swift`), so the site's palette,
type, and "Liquid Glass" surface material intentionally mirror the app rather than being an
independent design.

## Commands

```bash
npm test              # runs scripts/*.test.js via node --test (unit tests for the two JS modules)
npm run preview        # python3 -m http.server 4173 — local preview server

node --test scripts/theme.test.js            # run a single test file
node --test scripts/video-autoplay.test.js
```

A local HTTP server (not `file://`) is required for preview — `scripts/main.js` loads as an ES
module, which browsers block from `file://` origins.

There is no lint/typecheck/build command; this project has none configured.

## Architecture

**Single page, section-loop structure.** `index.html` is one long page: sticky nav → hero →
repeating `.feature` sections (alternating image/text side via `.feature--reverse`) → offline-first
band → footer. Each feature section is self-contained markup following the same pattern, so adding
a new one is a copy-paste-edit of an existing `<section class="feature">` block, not a structural
change.

**Design tokens cascade through `styles/tokens.css`**, which `@import`s five files in order:
`colors.css` → `fonts.css` → `typography.css` → `spacing.css` → `effects.css`. `site.css` (loaded
after) contains all layout/component CSS and must not invent new colors, sizes, or spacing values —
everything layout-related consumes a `--color-*`, `--kotoba-size-*`, `--space-*`, `--radius-*`, or
`--shadow-*` custom property already defined in tokens.

**Theming** is manual, not just `prefers-color-scheme`: `scripts/theme.js` exports pure functions
(`resolveInitialTheme`, `nextTheme`) that `scripts/main.js` wires to the DOM — writes
`data-theme="dark"|"light"` on `<html>`, persisted to `localStorage` under `kotoba-theme`, falling
back to OS preference on first visit. `colors.css` and `effects.css` each define three parallel
blocks for every token: a bare `:root` default, a `@media (prefers-color-scheme: dark)` override,
and explicit `[data-theme="dark"]`/`[data-theme="light"]` overrides — all three must stay in sync
when adding a new color/effect token.

**Video playback is gated by `IntersectionObserver`, not the `autoplay` attribute.**
`scripts/video-autoplay.js` exports `shouldPlay(isIntersecting, prefersReducedMotion)`; `main.js`'s
`initLazyVideos()` observes every `.js-lazy-video` element and calls `.play()`/`.pause()` based on
it. This is deliberate: HTML `autoplay` doesn't consult `prefers-reduced-motion`, and the spec
requires clips to start only once scrolled into view. Any new video section must use
`<video class="js-lazy-video" muted loop playsinline preload="metadata">` — no `autoplay` attribute.

**Two logic modules have unit tests; everything else is markup verified by hand.** `theme.js` and
`video-autoplay.js` contain the only non-trivial logic (pure functions, easily testable) and each
has a co-located `*.test.js`. Layout/markup changes are verified visually (see spec's manual QA
checklist), not through automated tests — don't add a test suite for markup.

**Liquid Glass surfaces**: `.glass-surface` (translucent, blurred, from `effects.css`) is the
default for nav, cards, and media frames. The **Write Mode** section is the one deliberate
exception — its media frame uses `.surface-solid` instead, because a translucent surface would hurt
legibility of stroke-tracing. Do not "fix" this to match its sibling sections.

**Media pipeline**: `media-source/` (gitignored) holds raw, full-resolution screen captures
(1206×2622 `.PNG`/`.mov`). `media/` holds the actual web-ready assets `index.html` references —
resized PNGs (`sips --resampleWidth 700`) and transcoded/compressed `.mp4`s. When adding new
screenshots or clips, process into `media/` under a descriptive filename; never point markup at
`media-source/`.

## Reference docs

`docs/superpowers/specs/2026-07-09-kotoba-website-design.md` and
`docs/superpowers/plans/2026-07-09-kotoba-website.md` contain the original design spec and
task-by-task implementation plan — useful for the reasoning behind section order, breakpoint choice
(900px mobile→desktop switch), and accessibility requirements (`prefers-reduced-motion`,
`prefers-contrast: more`, backdrop-filter fallback) if extending the site significantly.
