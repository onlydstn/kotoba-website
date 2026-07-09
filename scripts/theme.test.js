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
