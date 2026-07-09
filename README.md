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
