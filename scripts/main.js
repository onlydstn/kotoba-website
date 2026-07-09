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
