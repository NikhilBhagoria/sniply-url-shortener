const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeUrl, isValidHttpUrl } = require('../utils/url');

test('normalizes common URLs and rejects malformed values', () => {
  assert.equal(normalizeUrl('example.com'), 'http://example.com/');
  assert.equal(normalizeUrl('https://example.com/path?q=1'), 'https://example.com/path?q=1');
  assert.equal(normalizeUrl('   https://example.com   '), 'https://example.com/');
  assert.equal(isValidHttpUrl('example.com'), true);
  assert.equal(isValidHttpUrl('https://example.com'), true);
  assert.equal(isValidHttpUrl('not a url'), false);
  assert.equal(isValidHttpUrl('http://'), false);
});
