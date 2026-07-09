import { resolveInitialTheme, nextTheme } from './theme.js';
import { shouldPlay } from './video-autoplay.js';

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
