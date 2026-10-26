import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const records = JSON.parse(await fs.readFile('src/data/wikiCatalog.json', 'utf8'));
const languages = ['en', 'es', 'pt'];
const categories = [...new Set(records.map(item => item.category))];
const route = (category, slug, language) => `${language === 'en' ? '' : `/${language}`}/wiki/${category}${slug ? '/' + slug : ''}`;
const site = 'https://deadmatterwiki.com';
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');

test('specialized sections preserve vehicle parts, cooking, prices and extended stats', async () => {
  for (const item of records) {
    const html = await fs.readFile(`dist${route(item.category, item.slug, 'en')}/index.html`, 'utf8');
    for (const stat of item.details?.performance || []) assert.ok(html.includes(escape(stat.label)), item.name + ': performance');
    for (const [key,value] of Object.entries(item.details?.sideEffects || {})) {
      assert.ok(html.includes(escape(key)), item.name + ': side effect');
      assert.ok(html.includes(escape(value)));
    }
    if ('price' in item.attributes) assert.ok(html.includes('Trading'), item.name + ': prices');
  }
  const kart = await fs.readFile('dist/wiki/vehicles/go-kart/index.html','utf8');
  assert.ok(kart.includes('Vehicle specifications') && kart.includes('Required components') && kart.includes('Spark Plug'));
  const bacon = await fs.readFile('dist/wiki/consumables/bacon/index.html','utf8');
  assert.ok(bacon.includes('Nutrition &amp; effects') && bacon.includes('Preparation &amp; safety') && bacon.includes('Cooked Bacon'));
});

for (const category of categories) test(`${category}: every public record has complete HTML in all three languages`, async () => {
  for (const language of languages) {
    const index = await fs.readFile(`dist${route(category, '', language)}/index.html`, 'utf8');
    for (const item of records.filter(item => item.category === category)) {
      const pathname = route(category, item.slug, language);
      const html = await fs.readFile(`dist${pathname}/index.html`, 'utf8');
      assert.ok(index.includes(`href="${pathname}"`), `Category must link to ${pathname}`);
      assert.ok(html.includes(`<html lang="${language}">`));
      for (const pattern of [/<h1\b/g, /<title\b/g, /name="description"/g, /rel="canonical"/g, /property="og:title"/g]) assert.equal((html.match(pattern) || []).length, 1, pathname + pattern);
      assert.ok(html.includes(`href="${site + pathname}"`));
      assert.ok(html.includes(`${escape(item.name)} — Dead Matter</h1>`));
      assert.ok(!html.includes('noindex') && !html.includes('deadmatter.wiki'));
      if (item.description) assert.ok(html.includes(escape(item.description)));
      for (const link of item.relations) assert.ok(html.includes(`href="${route(link.category, link.slug, language)}"`));
      for (const code of [...languages, 'x-default']) assert.ok(html.includes(`hrefLang="${code}" href="${site + route(category, item.slug, code === 'x-default' ? 'en' : code)}"`));
      const data = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
      assert.equal(data.length, 1);
      assert.equal(data[0]['@graph'][0].url, site + pathname);
      assert.equal(data[0]['@graph'][0].inLanguage, language);
      assert.ok(urls.includes(site + pathname));
    }
  }
});

test('unique record URLs, valid relation targets and sitemap without duplicates', () => {
  assert.equal(new Set(records.map(item => `${item.category}/${item.slug}`)).size, records.length);
  assert.equal(new Set(urls).size, urls.length);
  for (const item of records) for (const link of item.relations) assert.ok(records.some(target => target.category === link.category && target.slug === link.slug), `${item.name}: ${link.name}`);
  const mp5 = records.find(item => item.category === 'weapons' && item.slug === 'mp5');
  assert.equal(mp5.name, 'MP5');
  assert.equal(mp5.attributes.ammo, '9x19');
  assert.ok(mp5.relations.some(link => link.kind === 'sellers'));
});

test('missing entries are noindex and the server provides an actual 404 rule', async () => {
  const { renderWikiPage } = await import(pathToFileURL(path.resolve('node_modules/.cache/wiki-prerender.mjs')).href);
  const result = await renderWikiPage('/wiki/weapons/not-a-real-weapon', 'en');
  assert.ok(result.head.includes('noindex,follow'));
  assert.ok(result.body.includes('Wiki entry not found'));
  assert.ok(!result.head.includes('application/ld+json'));
  const htaccess = await fs.readFile('dist/.htaccess', 'utf8');
  assert.ok(htaccess.includes('[R=404,L]'));
  assert.ok(htaccess.indexOf('$1/index.html [L]') < htaccess.indexOf('[R=404,L]'));
  assert.ok((await fs.readFile('dist/404.html', 'utf8')).includes('noindex,follow'));
});
