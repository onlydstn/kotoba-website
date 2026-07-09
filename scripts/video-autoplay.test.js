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
