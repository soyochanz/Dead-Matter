import React, { useState, useEffect, useCallback } from 'react';
import i18n from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Save, RefreshCw, Globe, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/mySupabaseClient';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import pt from '@/locales/pt.json';

const TranslationManager = () => {
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [scanning, setScanning] = useState(false);
    const [modifiedIds, setModifiedIds] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Load translations from Supabase
    const loadTranslations = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('app_translations')
            .select('*')
            .order('namespace', { ascending: true })
            .order('key', { ascending: true });

        if (error) {
            toast({ title: "Error", description: "Failed to load translations.", variant: "destructive" });
        } else {
            setTranslations(data || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        loadTranslations();
    }, [loadTranslations]);

    // Handle inline edit changes (local state only until save)
    const handleTranslationChange = (id, lang, value) => {
        setTranslations(prev => prev.map(t =>
            t.id === id ? { ...t, [lang]: value } : t
        ));
        setModifiedIds(prev => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
        });
    };

    // Save a single row
    const handleSaveRow = async (translation) => {
        const { id, en, es, pt } = translation;
        const { error } = await supabase
            .from('app_translations')
            .update({ en, es, pt, updated_at: new Date() })
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            // Update local i18n instance immediately
            const fullKey = `${translation.namespace}.${translation.key}`;
            if (en) i18n.addResource('en', 'translation', fullKey, en);
            if (es) i18n.addResource('es', 'translation', fullKey, es);
            if (pt) i18n.addResource('pt', 'translation', fullKey, pt);

            toast({ title: "Saved", description: "Translation updated successfully. Changes applied." });
            setModifiedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    // Bulk Save
    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const toSave = translations.filter(t => modifiedIds.has(t.id));
            if (toSave.length === 0) return;

            const upsertData = toSave.map(({ id, namespace, key, en, es, pt }) => ({
                id, namespace, key, en, es, pt, updated_at: new Date()
            }));

            const { error } = await supabase
                .from('app_translations')
                .upsert(upsertData, { onConflict: 'id' }); // Use ID for updates

            if (error) {
                console.error("Supabase Upsert Error:", error);
                throw error;
            }

            // Update i18n instance locally
            toSave.forEach(t => {
                const fullKey = `${t.namespace}.${t.key}`;
                if (t.en) i18n.addResource('en', 'translation', fullKey, t.en);
                if (t.es) i18n.addResource('es', 'translation', fullKey, t.es);
                if (t.pt) i18n.addResource('pt', 'translation', fullKey, t.pt);
            });

            setModifiedIds(new Set());
            toast({ title: "Success", description: `Saved ${toSave.length} translations.` });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Scan local JSONs and import missing keys
    const handleScanAndImport = async () => {
        setScanning(true);
        try {
            const updates = [];
            const timestamp = new Date();

            // Helper to recursively flatten JSON into list of { namespace, key, value }
            const flatten = (obj, prefix = '', currentNamespace = 'common') => {
                let result = [];
                for (const [k, v] of Object.entries(obj)) {
                    // Determine namespace from the top-level key if we are at root
                    const newNamespace = prefix === '' ? k : currentNamespace;
                    const newKey = prefix === '' ? k : `${prefix}.${k}`;

                    // If it's the root level, the key name effectively becomes the namespace for children
                    // But actually, the structure is usually nested. 
                    // Let's assume the top-level keys in the JSON file ARE the namespaces for simplicity,
                    // or we can treat the whole file as a flat structure but that loses context.
                    // looking at en.json structure: "wiki": { "common": ... }
                    // So keys are like "wiki.common.market_value".
                    // Let's treat the First segement as Namespace, rest as Key.

                    if (typeof v === 'object' && v !== null) {
                        // Recurse
                        result = result.concat(flatten(v, newKey, newNamespace));
                    } else {
                        // It's a leaf value
                        const parts = newKey.split('.');
                        const ns = parts[0];
                        const keyPath = parts.slice(1).join('.');

                        result.push({
                            namespace: ns,
                            key: keyPath,
                            value: v
                        });
                    }
                }
                return result;
            };

            const enFlat = flatten(en);
            const esFlat = flatten(es);
            const ptFlat = flatten(pt);

            // Group by Namespace + Key
            const merged = {};

            // Helper to merge
            const mergeIntoMap = (list, lang) => {
                list.forEach(item => {
                    const compoundKey = `${item.namespace}:${item.key}`;
                    if (!merged[compoundKey]) {
                        merged[compoundKey] = {
                            namespace: item.namespace,
                            key: item.key,
                            en: null, es: null, pt: null
                        };
                    }
                    merged[compoundKey][lang] = item.value;
                });
            };

            mergeIntoMap(enFlat, 'en');
            mergeIntoMap(esFlat, 'es');
            mergeIntoMap(ptFlat, 'pt');

            // Now upsert
            const upsertData = Object.values(merged).map(item => ({
                namespace: item.namespace,
                key: item.key,
                en: item.en,
                es: item.es,
                pt: item.pt,
                updated_at: timestamp
            }));

            // Supabase Upsert
            const { error } = await supabase
                .from('app_translations')
                .upsert(upsertData, { onConflict: 'namespace,key', ignoreDuplicates: false });

            if (error) throw error;

            toast({ title: "Scan Complete", description: `Imported/Updated ${upsertData.length} translation keys.` });
            loadTranslations();

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to scan and import.", variant: "destructive" });
        } finally {
            setScanning(false);
        }
    };

    // Filtering
    const filteredTranslations = translations.filter(t =>
        t.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.namespace.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.en && t.en.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="h-6 w-6 text-red-500" />
                        Translation Manager
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage dynamic text across the entire application.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        onClick={handleScanAndImport}
                        disabled={scanning || saving}
                        className="bg-blue-600 hover:bg-blue-700 gap-2 w-full md:w-auto"
                    >
                        <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
                        {scanning ? 'Scanning...' : 'Scan Local JSONs'}
                    </Button>
                    {modifiedIds.size > 0 && (
                        <Button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 gap-2 w-full md:w-auto animate-pulse"
                        >
                            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                            {saving ? 'Saving...' : `Save All (${modifiedIds.size})`}
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                <Search className="h-4 w-4 text-gray-400 ml-2" />
                <Input
                    className="bg-transparent border-0 focus:ring-0 focus-visible:ring-0 text-white placeholder:text-gray-500 h-8"
                    placeholder="Search keys, namespaces, or text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="bg-black/40 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Namespace / Key</th>
                                <th className="px-6 py-3 w-1/4">English (Default)</th>
                                <th className="px-6 py-3 w-1/4">Spanish</th>
                                <th className="px-6 py-3 w-1/4">Portuguese</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading translations...</td>
                                </tr>
                            ) : filteredTranslations.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No translations found. Try scanning local files.</td>
                                </tr>
                            ) : (
                                filteredTranslations.map(t => (
                                    <tr key={t.id} className="hover:bg-white/[0.02]">
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <div className="text-red-400 font-bold mb-1 flex items-center gap-2">
                                                {t.namespace}
                                                {modifiedIds.has(t.id) && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Unsaved changes" />}
                                            </div>
                                            <div className="text-gray-400">{t.key}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <textarea
                                                className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-red-500/50 rounded px-2 py-1 text-white text-xs min-h-[40px] resize-y focus:outline-none transition-colors focus:bg-white/5"
                                                value={t.en || ''}
                                                onChange={(e) => handleTranslationChange(t.id, 'en', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <textarea
                                                className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-red-500/50 rounded px-2 py-1 text-white text-xs min-h-[40px] resize-y focus:outline-none transition-colors focus:bg-white/5"
                                                value={t.es || ''}
                                                onChange={(e) => handleTranslationChange(t.id, 'es', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <textarea
                                                className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-red-500/50 rounded px-2 py-1 text-white text-xs min-h-[40px] resize-y focus:outline-none transition-colors focus:bg-white/5"
                                                value={t.pt || ''}
                                                onChange={(e) => handleTranslationChange(t.id, 'pt', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                onClick={() => handleSaveRow(t)}
                                                size="sm"
                                                variant="ghost"
                                                className="hover:bg-green-500/10 hover:text-green-500"
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TranslationManager;
