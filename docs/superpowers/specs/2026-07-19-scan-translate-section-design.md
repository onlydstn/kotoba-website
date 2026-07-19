# Scan & Translate section — design

**Date:** 2026-07-19
**Status:** Approved

## What

Add a new marketing section to the one-page site for Kotoba's new **Scan** feature:
point the camera at Japanese text, get a full translation, and tap any highlighted
word or kanji for its meaning and readings.

## Placement

- New `<section id="scan-translate" class="feature feature--reverse">` inserted
  directly after the Search & Lookup section, before Kanji Detail.
- `feature--reverse` keeps the alternating image/text sides consistent for this
  even-positioned section. The full alternation chain down the page is re-verified
  after insertion.
- Add a nav link `<li><a href="#scan-translate">Scan</a></li>` between Search and Study.

## Layout

Reuses the existing `feature__media-pair feature__media-pair--triptych` layout (the
same three-up grid used by the Light & Dark section). Three static PNGs inside
`.media-frame.glass-surface` frames, ordered to tell the story:

1. `media/scan-capture.png` — framing text in the capture box
2. `media/scan-translation.png` — the translation sheet
3. `media/scan-lookup.png` — highlighted text with the KANJI/WORD popover

Each `<img>` uses `width="700" height="1522" loading="lazy"`.

## Media pipeline

Raw captures (1206×2622) processed to web-ready assets in `media/` at width 700 via
`sips --resampleWidth 700` — matching every other screenshot on the site (700×1522).
No video for this section.

## Copy

- Eyebrow: **Scan & Translate**
- Headline: **Point your camera at any Japanese text**
- Body: *Capture a page, sign, or textbook and Kotoba translates it sentence by
  sentence — then tap any highlighted word or kanji to see its meaning and readings.*

## Out of scope

- No CSS changes — triptych and glass-surface classes already exist.
- No JS changes — static images, no lazy-video.
- No tests — markup-only change, per project convention (only `theme.js` and
  `video-autoplay.js` have unit tests).
