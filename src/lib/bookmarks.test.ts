import assert from 'node:assert/strict';
import test from 'node:test';

import { formatBookmark, nextSlug, normalizeUrl, parseBookmarks } from './bookmarks.ts';

test('normalizes equivalent URLs with and without https:// to the same value', () => {
  assert.equal(normalizeUrl('example.com/docs'), normalizeUrl('https://example.com/docs'));
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  const invalidValues = [
    null,
    '',
    '{not-json',
    JSON.stringify({ url: 'https://example.com/', slug: 'mona-1' }),
    JSON.stringify([{ link: 'https://example.com/', alias: 'legacy' }]),
  ];

  for (const value of invalidValues) {
    assert.doesNotThrow(() => parseBookmarks(value));
    assert.deepEqual(parseBookmarks(value), []);
  }
});

test('drops malformed entries while retaining valid bookmarks', () => {
  const validBookmark = { url: 'https://example.com/', slug: 'mona-7fk2' };
  const rawValue = JSON.stringify([
    validBookmark,
    { url: 42, slug: 'mona-2' },
    { url: 'https://example.org/', slug: 'wrong-prefix' },
    { url: 'javascript:alert(1)', slug: 'mona-3' },
  ]);

  assert.deepEqual(parseBookmarks(rawValue), [validBookmark]);
});

test('generates a unique mona-prefixed base62 slug locally', () => {
  const bookmarks = [
    { url: 'https://example.com/', slug: 'mona-2' },
    { url: 'https://example.org/', slug: 'mona-3' },
  ];

  assert.equal(nextSlug(bookmarks), 'mona-4');
});

test('formats a bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://example.com/', slug: 'mona-7fk2' }),
    'https://example.com/ :: mona-7fk2',
  );
});
