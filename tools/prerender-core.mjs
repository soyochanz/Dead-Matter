import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { corePath, languages } from '../src/data/gameGuide.js';
import { SITE_URL } from '../src/lib/newsSeo.js';

const output = path.resolve('dist');
const bundle = path.resolve('node_modules/.cache/core-prerender.mjs');
await build({ entryPoints: ['tools/core-prerender-entry.jsx'], bundle: true, packages: 'external', platform: 'node', format: 'esm', outfile: bundle, alias: { '@': path.resolve('src') }, loader: { '.css': 'empty' }, plugins: [{
  name: 'public-build-without-browser-client',
  setup(build) {
    build.onResolve({ filter: /mySupabaseClient$/ }, () => ({ path: 'supabase', namespace: 'public-ssr' }));
    // Effects do not run during static rendering. Fail loudly if a render starts querying.
    build.onLoad({ filter: /.*/, namespace: 'public-ssr' }, () => ({ contents: 'export const supabase = new Proxy({}, { get() { throw new Error("Database access during static render"); } }); export default supabase;', loader: 'js' }));
  }
}] });
const { renderCorePage } = await import(pathToFileURL(bundle).href);
const template = (await fs.readFile(path.join(output, 'index.html'), 'utf8'))
  .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
  .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
  .replace(/<link\b[^>]*rel=["'](?:canonical|alternate)["'][^>]*>/gi, '')
  .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
// Keep an empty SPA shell for routes without generated HTML; never serve homepage content as an item page.
await fs.writeFile(path.join(output, 'spa.html'), template);
let sitemap = await fs.readFile(path.join(output, 'sitemap.xml'), 'utf8');
for (const page of ['', 'wiki', 'dead-matter-game']) {
  for (const language of languages) {
    const route = corePath(language, page);
    const { body, head } = await renderCorePage(route, language, page);
    const html = template.replace(/<html\b[^>]*>/, `<html lang="${language}">`).replace('</head>', `${head}\n</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    if (!html.includes('<h1') || !html.includes('rel="canonical"')) throw new Error(`Incomplete core prerender: ${route}`);
    const directory = path.join(output, route.slice(1));
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'index.html'), html);
    const url = SITE_URL + route;
    const entry = `<url><loc>${url}</loc>${[...languages, 'x-default'].map(code => `<xhtml:link rel="alternate" hreflang="${code}" href="${SITE_URL + corePath(code === 'x-default' ? 'en' : code, page)}"/>`).join('')}</url>`;
    const existing = new RegExp(`<url>\\s*<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`);
    sitemap = existing.test(sitemap) ? sitemap.replace(existing, entry) : sitemap.replace('</urlset>', `${entry}\n</urlset>`);
  }
}
await fs.writeFile(path.join(output, 'sitemap.xml'), sitemap);
console.log('Prerendered 9 core pages in English, Spanish and Portuguese.');
