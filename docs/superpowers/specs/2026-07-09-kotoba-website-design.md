# Kotoba marketing website — design spec

**Date:** 2026-07-09
**Status:** approved, ready for implementation planning

## Summary

A one-page marketing/landing site for Kotoba (native iOS Japanese dictionary & study app),
visually matching the app: same warm ink-and-paper palette, same serif+sans type pairing, same
Liquid Glass material. Built from a Claude Design wireframe
(`https://claude.ai/design/p/5c94d565-da25-4f57-8152-f7bc5267e6d5`) and its accompanying design
system, reconciled against the actual screenshots/videos available today.

**Goal:** show the app's differentiators (word/kanji lookup, real example sentences, animated
stroke order, SRS study, offline-first) using real screen captures, not stock imagery or claimed
copy. Mobile-first, desktop supported.

**Non-goals:** no CMS, no multi-page site, no backend, no build tooling beyond static file
processing for media assets.

## Content architecture

One page, sections in this order. Desktop alternates media left/right per section (`row` /
`row-reverse`); mobile stacks everything centered.

1. **Nav** — wordmark "言葉 Kotoba" (serif type, no logo artwork exists — see Open items),
   section links (desktop only), light/dark toggle.
2. **Hero** — headline + one-line blurb + App Store CTA + Home/Dashboard screenshot.
3. **Search & Lookup**
4. **Kanji Detail & Stroke Order**
5. **Study & Review (SRS)**
6. **Kanji of the Day**
7. **Quiz Mode**
8. **Write Mode** — flagged: solid/opaque surface, not glass (the app's one deliberate exception
   to Liquid Glass, for stroke-tracing legibility — do not render this section's media frame as
   `.glass-surface`).
9. **Light & Dark, anywhere** — built around the theme-toggle demo clip.
10. **Offline-first** — icon + text callout only, no media.
11. **Footer** — licensing attribution (JMdict/KANJIDIC2, Tatoeba, KanjiVG) + links.

Sections dropped from the original wireframe (no matching media exists yet): Word Detail, Example
Sentences, Bookmarks & History. The section-loop structure in the implementation should make these
easy to add later without restructuring the page.

## Section-by-section content & media specs

All source media is 1206×2622 (≈9:19.5, iPhone screen-recording resolution) — consistent across
every screenshot and video, matching the wireframe's stated media-slot ratio.

| # | Section | Eyebrow | Headline direction | Media | Poster | Desktop layout |
|---|---|---|---|---|---|---|
| Hero | — | — | App name + one-line blurb | `1.png` (Dashboard, light) | — | centered |
| 2 | Search & Lookup | Search & Lookup | Instant word/kanji search, real results | `5.png` (SearchView) | — | row-reverse |
| 3 | Kanji Detail & Stroke Order | Kanji Detail & Stroke Order | Every kanji, broken down | `4.png` (KanjiDetailView) + `3.png` (StrokeOrderView), side by side | — | row |
| 4 | Study & Review | Study & Review (SRS) | Spaced repetition that fits your day | `video1` (DeckBrowse) + `video4` (ReviewCard) | `2.png` / `6.png` | row-reverse |
| 5 | Kanji of the Day | Kanji of the Day | A small daily habit | `video2` | — | row |
| 6 | Quiz Mode | Quiz Mode | Test what you've learned | `video5` (QuizSessionActive) | — | row-reverse |
| 7 | Write Mode | Write Mode | Trace it to know it | `video3` (WriteCard) — trim ~29s source to a representative ~8–10s loop | — | row, **solid surface** |
| 8 | Light & Dark | Light & Dark | Matches the way you read | `video6` (2s toggle animation) + `1.png`/`7.png` as before/after stills | `1.png` | row-reverse |
| 9 | Offline-first | Offline-first | No connection required | icon only | — | centered |

Final marketing copy (actual headline/body sentences) is written during implementation, in the
voice already established for Kotoba: calm, precise, editorial, sentence case, no emoji, exact
terminology (mirrors the tone documented in the Claude Design project's `readme.md`).

`2.png` (DeckDetailView) and `6.png` (StudyView) are reused as video posters rather than shown as
standalone images — deliberate, not an oversight, and it doubles as the reduced-motion fallback
(see Accessibility below).

## Technical architecture

**Stack:** plain static HTML/CSS/vanilla JS. No framework, no build step. A one-page site with a
handful of interactions (theme toggle, in-view video playback) doesn't need one, and the Claude
Design project's token CSS files were generated as drop-in static CSS for exactly this purpose.

**File structure:**

```
KOTOBA Website/
  index.html
  styles/
    tokens/colors.css        (copied 1:1 from the Claude Design project)
    tokens/typography.css
    tokens/spacing.css
    tokens/effects.css
    site.css                 (layout, nav, sections, footer — new)
  scripts/
    main.js                  (theme toggle, reduced-motion gating, in-view video play)
  media-source/               (raw screenshots/videos as captured — current `media/` folder, renamed)
  media/                      (optimized/transcoded output actually referenced by index.html)
  favicon.svg / og-image.png  (placeholder until real artwork exists — see Open items)
```

The existing `media/` folder (raw `.PNG`/`.mov` captures) is renamed to `media-source/` to keep
raw captures separate from the processed, web-ready assets that `index.html` actually references.

**Theming:** manual toggle in the nav, writes `data-theme="dark"|"light"` on `<html>`, persisted to
`localStorage`. Falls back to `prefers-color-scheme` on first visit before any toggle interaction.
`colors.css` and `effects.css` already define `[data-theme]` override blocks for this — no new
token work required, only the toggle control and a few lines of JS.

**Glass material:** `.glass-surface` utility (from `effects.css`) used for nav, cards, and section
media frames; the Write Mode section explicitly uses `.surface-solid` instead, per the app's
Liquid Glass rule (never render the drawing/writing surface as glass).

**Video loading:** `<video autoplay muted loop playsinline preload="metadata">`, gated behind an
`IntersectionObserver` so a clip only starts playing once scrolled into view — avoids six videos
decoding simultaneously on page load.

**Deploy:** static output only, no server-side build. Pushes directly to GitHub Pages from the new
repo's default branch.

## Accessibility, motion & performance

- **`prefers-reduced-motion: reduce`**: every autoplay video is skipped; the browser shows the
  file's first frame, or an explicit `poster` where one exists (`2.png`/`6.png` for the Study &
  Review videos, `1.png` for the theme-toggle clip). No motion is forced on anyone who has asked
  for less — matches the app's own Reduce Motion handling.
- **`prefers-contrast: more`**: already handled by `colors.css`'s increased-contrast token
  variants; no additional site-level work needed.
- **`backdrop-filter` fallback**: `.glass-surface` in `effects.css` already degrades to a solid
  `--color-surface` background where `backdrop-filter` isn't supported.
- **Media weight**: source videos are 5–8 MB each at full 1206×2622 recording resolution. For web,
  downscale each to its actual max display width (≈380px desktop / ≈260px mobile) and re-encode at
  a modest bitrate — target under ~1–1.5 MB per clip after compression. Screenshots get similarly
  downscaled and compressed (optimized PNG or WebP).
- **Alt text / labels**: every screenshot gets descriptive alt text (e.g. "Kotoba's kanji detail
  screen showing readings and stroke count"); video containers get an `aria-label` since `<video>`
  has no native alt equivalent.

## Testing / verification plan

No automated test suite — this is a static content site, not application logic. Verification is
manual, before considering the build complete:

- Visual QA at the wireframe's two breakpoints: 390px (mobile) and 1440px (desktop), plus a quick
  check at an intermediate width (~768px) since nothing in the design currently defines a tablet
  breakpoint explicitly.
- Light mode, dark mode (via the manual toggle), and OS-level dark mode on first visit (no stored
  preference).
- `prefers-reduced-motion: reduce` — confirm every video is static (poster/first-frame) with no
  autoplay.
- `prefers-contrast: more` — confirm text/border contrast switches to the increased-contrast token
  set.
- Backdrop-filter fallback — spot-check in a browser/mode without `backdrop-filter` support (or via
  devtools emulation) to confirm glass surfaces fall back to solid.
- Cross-browser pass: Safari, Chrome, Firefox (video codec support differs — confirm `.mp4`
  playback works everywhere the site will actually be used; add `.webm` only if a real compatibility
  gap shows up).
- Lighthouse pass for performance (media weight is the main risk) and accessibility.

## Open items / known gaps

1. **No app icon or wordmark artwork exists** — confirmed in both the iOS app repo
   (`AppIcon.appiconset` has no actual image asset) and the Claude Design project. The site renders
   "Kotoba" in `--font-serif` as the nav/hero mark, matching the design system's own fallback
   approach. Swappable later if real artwork is produced.
2. **`ffmpeg` is not installed** on the machine used for this design session — required to
   transcode/compress the six `.mov` captures to web-ready `.mp4`. Flagged as a setup dependency
   for whoever executes the implementation plan (`brew install ffmpeg`).
3. **Dropped sections** (Word Detail, Example Sentences, Bookmarks & History) have no matching
   screenshots yet. Adding them later is a content addition, not a restructure, given the page's
   repeating section pattern.
4. **Final marketing copy** is a content brief in this spec (headline direction per section), not
   final sentences — written during implementation against the documented voice rules.
