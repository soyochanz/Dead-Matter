import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { loadFeed, readFeedCache, UPDATE_CARD_COLUMNS } from '../src/lib/publicFeed.js';
import { news } from '../src/data/news.js';

const bundled = await build({ entryPoints: ['src/lib/commitFeed.js'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { mergeCommits, discordCommits } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

test('card projection excludes multi-megabyte article bodies', () => {
  assert.ok(!UPDATE_CARD_COLUMNS.includes('*'));
  assert.ok(!UPDATE_CARD_COLUMNS.includes('content'));
  for (const field of ['slug', 'title_en', 'title_es', 'title_pt', 'date', 'version']) assert.ok(UPDATE_CARD_COLUMNS.split(',').includes(field));
});

test('successful public feeds are cached, failures are not cached', async () => {
  const rows = [{ id: 'patch' }];
  assert.deepEqual(await loadFeed('test:success', () => ({ abortSignal: async () => ({ data: rows }) })), rows);
  await loadFeed('test:success', () => { throw new Error('Cache should prevent a request'); });
  await assert.rejects(loadFeed('test:error', () => ({ abortSignal: async () => ({ error: new Error('offline') }) })), /offline/);
  assert.equal(readFeedCache('test:error'), null);
});

test('a stalled request times out and aborts the transport', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  let requestSignal;
  const request = loadFeed('test:timeout', () => ({ abortSignal: signal => { requestSignal = signal; return new Promise(() => {}); } }));
  const rejected = assert.rejects(request, /timed out/);
  context.mock.timers.tick(10000);
  await rejected;
  assert.equal(requestSignal.aborted, true);
  assert.equal(readFeedCache('test:timeout'), null);
});

test('unmount cancellation does not cache a late response', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(loadFeed('test:cancelled', () => ({ abortSignal: async () => ({ data: [{ id: 'late' }] }) }), controller.signal), /aborted/);
  assert.equal(readFeedCache('test:cancelled'), null);
});

test('imported commits deduplicate full hashes and preserve database build links', () => {
  const commit = discordCommits[0];
  const merged = mergeCommits([{ ...commit, id: 'database-id', commit_hash: commit.id, source_url: undefined, created_at: '2026-10-26T00:00:00Z', update_micro_changes: [{ updates: { id: 'build' } }] }]);
  assert.equal(merged.length, discordCommits.length);
  const match = merged.find(item => item.id === 'database-id');
  assert.equal(match.source_url, commit.source_url);
  assert.equal(match.created_at, commit.created_at);
  assert.equal(match.update_micro_changes[0].updates.id, 'build');
  assert.ok(merged.every((item, i) => i === 0 || Date.parse(merged[i - 1].created_at) >= Date.parse(item.created_at)));
});

test('every news article and imported commit has traceable source metadata', () => {
  assert.equal(new Set(news.map(item => item.slug)).size, news.length);
  for (const item of news) {
    for (const language of ['en', 'es']) assert.ok(item.title[language] && item.summary[language] && item.body[language].length);
    assert.ok(item.sources.length);
    assert.ok(item.sourceDate <= item.date);
    for (const source of item.sources) assert.match(source.url, /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/);
  }
  assert.equal(new Set(discordCommits.map(item => item.commit_hash)).size, discordCommits.length);
  for (const item of discordCommits) {
    assert.match(item.commit_hash, /^[a-f0-9]{7}$/);
    assert.ok(item.message && item.author && Number.isFinite(Date.parse(item.created_at)));
    assert.equal(item.date_kind, 'discord_posted');
    assert.match(item.source_url, /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/);
  }
});
