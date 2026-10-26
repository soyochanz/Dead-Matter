import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const records = JSON.parse(await fs.readFile('src/data/wikiCatalog.json', 'utf8'));
const site = 'https://deadmatterwiki.com';
const languages = ['en', 'es', 'pt'];
const routeFor = (category, slug, language) => `${language === 'en' ? '' : `/${language}`}/wiki/${category}${slug ? `/${slug}` : ''}`;
const bundle = path.resolve('node_modules/.cache/wiki-prerender.mjs');
await build({ entryPoints: ['tools/wiki-prerender-entry.jsx'], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: bundle, alias: { '@': path.resolve('src') } });
const { renderWikiPage } = await import(pathToFileURL(bundle).href);
const template = await fs.readFile('dist/spa.html', 'utf8');
let sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
const entries = [...new Set(records.map(item => item.category))].map(category => ({ category, slug: '' })).concat(records);
let count = 0;
for (const entry of entries) for (const language of languages) {
  const route = routeFor(entry.category, entry.slug, language);
  const { body, head } = await renderWikiPage(route, language);
  const html = template.replace(/<html\b[^>]*>/, `<html lang="${language}">`).replace('</head>', `${head}\n</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  if ((html.match(/<h1\b/g) || []).length !== 1 || !html.includes('rel="canonical"')) throw new Error(`Incomplete wiki page: ${route}`);
  const directory = path.join('dist', route.slice(1));
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html);
  const url = site + route;
  const node = `<url><loc>${url}</loc>${[...languages, 'x-default'].map(code => `<xhtml:link rel="alternate" hreflang="${code}" href="${site + routeFor(entry.category, entry.slug, code === 'x-default' ? 'en' : code)}"/>`).join('')}</url>`;
  const existing = new RegExp(`<url>\\s*<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`);
  sitemap = existing.test(sitemap) ? sitemap.replace(existing, node) : sitemap.replace('</urlset>', `${node}\n</urlset>`);
  count++;
}
await fs.writeFile('dist/sitemap.xml', sitemap);
await fs.writeFile('dist/404.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Wiki entry not found | Dead Matter Wiki</title></head><body style="background:#0d0e12;color:#e2e8f0;font:18px system-ui;padding:4rem"><h1>Wiki entry not found</h1><p>This entry is not in the published catalogue.</p><a style="color:#fca5a5" href="/wiki">Browse Dead Matter Wiki</a></body></html>');
console.log(`Prerendered ${count} wiki pages (${records.length} records), with item links and language alternates.`);
