import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Home from '../src/pages/Home';
import Wiki from '../src/pages/Wiki';
import GameOverview from '../src/pages/GameOverview';
import en from '../src/locales/en.json';
import es from '../src/locales/es.json';
import pt from '../src/locales/pt.json';

export async function renderCorePage(pathname, language, page) {
  const instance = createInstance();
  await instance.init({ lng: language, fallbackLng: 'en', resources: { en: { translation: en }, es: { translation: es }, pt: { translation: pt } }, interpolation: { escapeValue: false } });
  const Component = page === 'wiki' ? Wiki : page ? GameOverview : Home;
  const body = renderToString(<I18nextProvider i18n={instance}><StaticRouter location={pathname}><div className="min-h-screen bg-[#0d0e12] text-slate-200"><main><Component /></main></div></StaticRouter></I18nextProvider>);
  const helmet = Helmet.renderStatic();
  return { body, head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(item => item.toString()).join('\n') };
}
