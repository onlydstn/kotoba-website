export function resolveInitialTheme(storedTheme, prefersDark) {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(currentTheme) {
  return currentTheme === 'dark' ? 'light' : 'dark';
}
