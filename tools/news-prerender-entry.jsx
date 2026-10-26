import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { Routes, Route } from 'react-router-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Helmet } from 'react-helmet';
import News from '../src/pages/News';
import en from '../src/locales/en.json';
import es from '../src/locales/es.json';

export async function renderNewsPage(pathname, language) {
  const instance = createInstance();
  await instance.init({ lng: language, fallbackLng: 'en', resources: { en: { translation: en }, es: { translation: es } }, interpolation: { escapeValue: false } });
  const body = renderToString(
    <I18nextProvider i18n={instance}>
      <StaticRouter location={pathname}>
        <div className="min-h-screen bg-[#0d0e12] text-slate-200 p-6 md:p-12">
          <a href="/" className="text-white font-bold">DEAD MATTER WIKI</a>
          <main><Routes><Route path="/news/:slug?" element={<News />} /><Route path="/es/news/:slug?" element={<News />} /></Routes></main>
        </div>
      </StaticRouter>
    </I18nextProvider>
  );
  const helmet = Helmet.renderStatic();
  return { body, head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(item => item.toString()).join('\n') };
}
