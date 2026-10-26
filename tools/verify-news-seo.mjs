import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import { news, localizeNews } from '../src/data/news.js';
import { newsPath, newsTopics, tagsFor, relatedNews } from '../src/data/newsTopics.js';
import { SITE_URL, jsonLd } from '../src/lib/newsSeo.js';

for (const language of ['en', 'es']) {
  for (const article of [null, ...news]) {
    const route = newsPath(language, article?.slug);
    test(`${route}: crawlable HTML, unique metadata and reciprocal language links`, async () => {
      const html = await fs.readFile(`dist${route}/index.html`, 'utf8');
      assert.ok(html.includes(`<html lang="${language}">`));
      for (const pattern of [/<title\b/g, /<h1\b/g, /rel="canonical"/g, /name="description"/g, /property="og:title"/g, /property="og:url"/g]) assert.equal((html.match(pattern) || []).length, 1, String(pattern));
      assert.ok(html.includes(`href="${SITE_URL + route}"`));
      for (const alternative of ['en', 'es', 'x-default']) {
        assert.match(html, new RegExp(`href[Ll]ang="${alternative}"`));
        assert.ok(html.includes(SITE_URL + newsPath(alternative === 'es' ? 'es' : 'en', article?.slug)));
      }
      const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
      assert.equal(scripts.length, 1);
      const entity = scripts[0]['@graph'][0];
      assert.equal(entity.inLanguage, language);
      assert.equal(entity.url, SITE_URL + route);
      if (article) {
        assert.equal(entity['@type'], 'NewsArticle');
        assert.equal(entity.headline, localizeNews(article.title, language));
        assert.equal(entity.articleBody, localizeNews(article.body, language).join('\n\n'));
        assert.deepEqual(entity.citation, article.sources.map(source => source.url));
        const body = html.split('<body>')[1];
        assert.ok(body.includes('<article'));
        assert.ok(body.includes(localizeNews(article.body, language)[0].slice(0, 35)));
        for (const tag of tagsFor(article)) assert.ok(body.includes(`?tag=${tag}`));
      } else assert.equal(entity.mainEntity.itemListElement.length, news.length);
    });
  }
}

test('sitemap and RSS cover every article in both languages', async () => {
  const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(locations.length, new Set(locations).size);
  assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
  for (const language of ['en', 'es']) {
    const rss = await fs.readFile(`dist/news-feed${language === 'es' ? '-es' : ''}.xml`, 'utf8');
    assert.equal((rss.match(/<item>/g) || []).length, news.length);
    for (const article of news) {
      const url = SITE_URL + newsPath(language, article.slug);
      assert.ok(locations.includes(url));
      assert.ok(rss.includes(`<link>${url}</link>`));
    }
  }
});

test('topics are real, related stories exclude self, JSON-LD escapes script termination', () => {
  for (const article of news) {
    for (const tag of tagsFor(article)) assert.ok(newsTopics[tag].en && newsTopics[tag].es);
    assert.ok(relatedNews(article, news).every(item => item.slug !== article.slug));
  }
  assert.ok(!jsonLd({ headline: '</script><script>alert(1)</script>' }).includes('<'));
});
