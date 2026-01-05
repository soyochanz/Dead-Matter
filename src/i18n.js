import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/lib/mySupabaseClient';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            pt: { translation: pt }
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

// Load dynamic translations from Supabase
const loadDynamicTranslations = async () => {
    try {
        const { data } = await supabase.from('app_translations').select('*');
        if (data) {
            data.forEach(t => {
                // We load everything into the default 'translation' namespace to ensure overrides work
                // against the static JSON files.
                const fullKey = `${t.namespace}.${t.key}`;
                if (t.en) i18n.addResource('en', 'translation', fullKey, t.en);
                if (t.es) i18n.addResource('es', 'translation', fullKey, t.es);
                if (t.pt) i18n.addResource('pt', 'translation', fullKey, t.pt);
            });
        }
    } catch (e) {
        console.error("Failed to load dynamic translations", e);
    }
};

loadDynamicTranslations();

// Subscribe to real-time updates
supabase
    .channel('public:app_translations')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_translations' }, (payload) => {
        const t = payload.new;
        const fullKey = `${t.namespace}.${t.key}`;
        if (t.en) i18n.addResource('en', 'translation', fullKey, t.en);
        if (t.es) i18n.addResource('es', 'translation', fullKey, t.es);
        if (t.pt) i18n.addResource('pt', 'translation', fullKey, t.pt);
        // Force a re-render of components using these keys
        // i18n.emit('loaded', [t.namespace]); // or just let react-i18next handle it via events
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_translations' }, (payload) => {
        const t = payload.new;
        const fullKey = `${t.namespace}.${t.key}`;
        if (t.en) i18n.addResource('en', 'translation', fullKey, t.en);
        if (t.es) i18n.addResource('es', 'translation', fullKey, t.es);
        if (t.pt) i18n.addResource('pt', 'translation', fullKey, t.pt);
    })
    .subscribe();

export default i18n;
