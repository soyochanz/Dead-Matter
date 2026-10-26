import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { news, localizeNews } from '../src/data/news.js';
import { newsPath, tagsFor, newsTopics } from '../src/data/newsTopics.js';
import { SITE_URL } from '../src/lib/newsSeo.js';

const root = process.cwd();
const output = path.join(root, 'dist');
const bundle = path.join(root, 'node_modules/.cache/news-prerender.mjs');
await fs.mkdir(path.dirname(bundle), { recursive: true });
await build({ entryPoints: ['tools/news-prerender-entry.jsx'], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: bundle, alias: { '@': path.join(root, 'src') } });
const { renderNewsPage } = await import(pathToFileURL(bundle).href);
const template = (await fs.readFile(path.join(output, 'index.html'), 'utf8'))
  .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
  .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
  .replace(/<link\b[^>]*rel=["'](?:canonical|alternate)["'][^>]*>/gi, '')
  .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

const escapeXml = value => String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
const paths = [];
for (const language of ['en', 'es']) {
  for (const article of [null, ...news]) {
    const route = newsPath(language, article?.slug);
    const { body, head } = await renderNewsPage(route, language);
    const html = template.replace(/<html\b[^>]*>/, `<html lang="${language}">`).replace('</head>', `${head}\n</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    if (!html.includes('<h1') || !html.includes('rel="canonical"')) throw new Error(`Incomplete prerender: ${route}`);
    const directory = path.join(output, route.slice(1));
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), html);
    paths.push({ route, article });
  }
  const items = news.map(article => `<item><title>${escapeXml(localizeNews(article.title, language))}</title><link>${SITE_URL + newsPath(language, article.slug)}</link><guid isPermaLink="true">${SITE_URL + newsPath(language, article.slug)}</guid><description>${escapeXml(localizeNews(article.summary, language))}</description><pubDate>${new Date(`${article.date}T00:00:00+04:00`).toUTCString()}</pubDate>${tagsFor(article).map(tag => `<category>${escapeXml(localizeNews(newsTopics[tag], language))}</category>`).join('')}</item>`).join('\n');
  await fs.writeFile(path.join(output, `news-feed${language === 'es' ? '-es' : ''}.xml`), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Dead Matter News</title><link>${SITE_URL + newsPath(language)}</link><description>${language === 'es' ? 'Noticias del juego y la comunidad' : 'Game development and community news'}</description><language>${language}</language>${items}</channel></rss>`);
}

const originalSitemap = await fs.readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
const newsEntries = paths.map(({ route, article }) => `<url><loc>${SITE_URL + route}</loc><lastmod>${article?.modified || article?.date || news.map(item => item.modified || item.date).sort().at(-1)}</lastmod>${['en', 'es', 'x-default'].map(language => `<xhtml:link rel="alternate" hreflang="${language}" href="${SITE_URL + newsPath(language === 'es' ? 'es' : 'en', article?.slug)}"/>`).join('')}</url>`).join('\n');
await fs.writeFile(path.join(output, 'sitemap.xml'), originalSitemap.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ').replace('</urlset>', `${newsEntries}\n</urlset>`));
console.log(`Prerendered ${paths.length} English/Spanish news pages, sitemap entries and two RSS feeds.`);
