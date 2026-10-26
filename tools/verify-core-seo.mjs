import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import { corePath, coreLanguage, isCorePath, languages, gameGuide } from '../src/data/gameGuide.js';

const site = 'https://deadmatterwiki.com';
for (const language of languages) for (const page of ['', 'wiki', 'dead-matter-game']) {
  const route = corePath(language, page);
  test(`${route}: indexable content and consistent language metadata without JavaScript`, async () => {
    const html = await fs.readFile(`dist${route === '/' ? '' : route}/index.html`, 'utf8');
    assert.ok(html.includes(`<html lang="${language}">`));
    for (const pattern of [/<h1\b/g, /<title\b/g, /rel="canonical"/g, /name="description"/g, /property="og:title"/g]) assert.equal((html.match(pattern) || []).length, 1);
    assert.ok(html.includes(`href="${site + route}"`));
    assert.ok(html.includes(gameGuide[language].intro));
    for (const alternate of [...languages, 'x-default']) {
      const href = site + corePath(alternate === 'x-default' ? 'en' : alternate, page);
      assert.match(html, new RegExp(`href[Ll]ang="${alternate}" href="${href}"`));
    }
    for (const href of ['/map', '/wiki/weapons', '/wiki/vehicles', '/guides']) assert.ok(html.includes(`href="${href}"`));
    const data = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.equal(data.length, 1);
    const entity = data[0]['@graph'].find(item => ['WebPage', 'CollectionPage'].includes(item['@type']));
    assert.equal(entity.url, site + route);
    assert.equal(entity.inLanguage, language);
    assert.ok(!html.includes('SearchAction'));
    assert.ok(!html.includes('opacity:0'));
    assert.equal(coreLanguage(route), language);
    assert.ok(isCorePath(route));
  });
}

test('sitemap contains unique canonical routes and SPA shell has no homepage body', async () => {
  const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, new Set(urls).size);
  for (const lang of languages) for (const page of ['', 'wiki', 'dead-matter-game']) assert.ok(urls.includes(site + corePath(lang, page)));
  const shell = await fs.readFile('dist/spa.html', 'utf8');
  assert.ok(shell.includes('<div id="root"></div>'));
  assert.ok(!shell.includes('<h1'));
  assert.equal(isCorePath('/eswiki'), false);
  assert.equal(isCorePath('/wiki/weapons'), false);
  assert.equal(isCorePath('/es/news'), false);
});
