import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { Routes, Route } from 'react-router-dom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Helmet } from 'react-helmet';
import WikiCatalogPage from '../src/pages/WikiCatalogPage';

export async function renderWikiPage(pathname, language) {
  const i18n = createInstance();
  await i18n.init({ lng: language, fallbackLng: 'en', resources: {}, interpolation: { escapeValue: false } });
  const body = renderToString(<I18nextProvider i18n={i18n}><StaticRouter location={pathname}><main className="min-h-screen bg-[#0d0e12] text-slate-200 p-4 md:p-8"><Routes>{['', 'es/', 'pt/'].map(prefix => <Route key={prefix} path={`/${prefix}wiki/:categoryName/:itemSlug?`} element={<WikiCatalogPage />} />)}</Routes></main></StaticRouter></I18nextProvider>);
  const helmet = Helmet.renderStatic();
  return { body, head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(item => item.toString()).join('\n') };
}
