import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Save, Share2, Trash2, Copy, Check, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StatBar = ({ label, value, max, isAttribute = false }) => {
    const percentage = (value / max) * 100;
    const barColor = isAttribute ? "from-sky-500 to-sky-700" : "from-red-600 to-red-800";
    return (
        <div>
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="font-bold text-white">{value}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
                <motion.div 
                    className={`bg-gradient-to-r ${barColor} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
};

const PerksPage = () => {
    const [occupations, setOccupations] = useState([]);
    const [perks, setPerks] = useState([]);
    const [initialStats, setInitialStats] = useState({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [selectedOccupation, setSelectedOccupation] = useState(null);
    const [selectedPerks, setSelectedPerks] = useState([]);
    const [presetName, setPresetName] = useState('');
    const [savedPresets, setSavedPresets] = useState([]);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            const { data: attributes } = await supabase.from('attributes').select('name,max_value');
            const { data: skills } = await supabase.from('skills').select('name,max_value');
            const { data: stats } = await supabase.from('stats').select('name,max_value');
            
            const baseStats = {
                attributes: Object.fromEntries(attributes.map(a => [a.name, a.max_value / 2])),
                skills: Object.fromEntries(skills.map(s => [s.name, s.max_value / 4])),
                stats: Object.fromEntries(stats.map(st => [st.name, st.max_value])),
            };
            setInitialStats(baseStats);

            const { data: occData } = await supabase.from('occupations').select('*');
            const { data: perkData } = await supabase.from('perks').select('*');
            setOccupations(occData || []);
            setPerks(perkData || []);
            setLoading(false);
        };
        fetchInitialData();
        const localPresets = JSON.parse(localStorage.getItem('dm_perk_presets') || '[]');
        setSavedPresets(localPresets);
    }, []);

    const handleSelectOccupation = (occ) => {
        setSelectedOccupation(occ.id === selectedOccupation?.id ? null : occ);
    };

    const handleSelectPerk = (perk) => {
        setSelectedPerks(prev => 
            prev.find(p => p.id === perk.id) 
            ? prev.filter(p => p.id !== perk.id) 
            : [...prev, perk]
        );
    };

    const { finalStats, availablePoints, maxValues } = useMemo(() => {
        if (loading) return { finalStats: {}, availablePoints: 0, maxValues: {} };

        let points = 0;
        let currentStats = JSON.parse(JSON.stringify(initialStats));
        
        const maxVals = {
            attributes: Object.fromEntries(Object.entries(initialStats.attributes).map(([key]) => [key, 10])),
            skills: Object.fromEntries(Object.entries(initialStats.skills).map(([key]) => [key, 100])),
            stats: Object.fromEntries(Object.entries(initialStats.stats).map(([key]) => [key, 100])),
        };

        if (selectedOccupation) {
            points += selectedOccupation.points;
            if(selectedOccupation.effects) {
                for (const [category, effects] of Object.entries(selectedOccupation.effects)) {
                    if (currentStats[category]) {
                        for (const [stat, value] of Object.entries(effects)) {
                            currentStats[category][stat] = (currentStats[category][stat] || 0) + value;
                        }
                    }
                }
            }
        }

        selectedPerks.forEach(perk => {
            points -= perk.points;
            if (perk.effects) {
                for (const [category, effects] of Object.entries(perk.effects)) {
                    if (currentStats[category]) {
                        for (const [stat, value] of Object.entries(effects)) {
                           currentStats[category][stat] = (currentStats[category][stat] || 0) + value;
                        }
                    }
                }
            }
        });
        
        Object.keys(currentStats.attributes).forEach(key => currentStats.attributes[key] = Math.max(0, Math.min(maxVals.attributes[key], currentStats.attributes[key])));
        Object.keys(currentStats.skills).forEach(key => currentStats.skills[key] = Math.max(0, Math.min(maxVals.skills[key], currentStats.skills[key])));
        Object.keys(currentStats.stats).forEach(key => currentStats.stats[key] = Math.max(0, Math.min(maxVals.stats[key], currentStats.stats[key])));

        return { finalStats: currentStats, availablePoints: points, maxValues: maxVals };
    }, [initialStats, selectedOccupation, selectedPerks, loading]);

    const generateShareLink = useCallback(() => {
        if (availablePoints < 0) return '';
        const occId = selectedOccupation ? selectedOccupation.id : 'null';
        const perkIds = selectedPerks.map(p => p.id).join(',');
        const base64 = btoa(`${occId}:${perkIds}`);
        return `${window.location.origin}${window.location.pathname}?preset=${base64}`;
    }, [selectedOccupation, selectedPerks, availablePoints]);

    const copyToClipboard = () => {
        if (availablePoints < 0) {
            toast({ title: "Cannot Share", description: "You must have 0 or more available points.", variant: "destructive" });
            return;
        }
        const link = generateShareLink();
        navigator.clipboard.writeText(link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({ title: "Copied to clipboard!", description: "Share your build with others." });
    };

    const savePreset = () => {
        if (!presetName) {
            toast({ title: "Error", description: "Please enter a name for your preset.", variant: "destructive" });
            return;
        }
        if (availablePoints < 0) {
            toast({ title: "Cannot Save", description: "You must have 0 or more available points.", variant: "destructive" });
            return;
        }
        const newPreset = { name: presetName, occupationId: selectedOccupation?.id, perkIds: selectedPerks.map(p => p.id) };
        const updatedPresets = [...savedPresets.filter(p => p.name !== presetName), newPreset];
        localStorage.setItem('dm_perk_presets', JSON.stringify(updatedPresets));
        setSavedPresets(updatedPresets);
        toast({ title: "Preset Saved!", description: `"${presetName}" has been saved.` });
    };

    const loadPreset = (presetToLoad) => {
        setSelectedOccupation(occupations.find(o => o.id === presetToLoad.occupationId) || null);
        setSelectedPerks(perks.filter(p => presetToLoad.perkIds.includes(p.id)));
        setPresetName(presetToLoad.name);
        toast({ title: "Preset Loaded!", description: `"${presetToLoad.name}" has been loaded.` });
    };

    const deletePreset = (presetNameToDelete) => {
        const updatedPresets = savedPresets.filter(p => p.name !== presetNameToDelete);
        localStorage.setItem('dm_perk_presets', JSON.stringify(updatedPresets));
        setSavedPresets(updatedPresets);
        toast({ title: "Preset Deleted!", description: `"${presetNameToDelete}" has been deleted.`, variant: "destructive" });
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const presetData = params.get('preset');
        if (presetData && occupations.length > 0 && perks.length > 0) {
            try {
                const decoded = atob(presetData);
                const [occId, perkIdsStr] = decoded.split(':');
                const perkIds = perkIdsStr ? perkIdsStr.split(',').filter(id => id) : [];
                
                if (occId && occId !== 'null') {
                    setSelectedOccupation(occupations.find(o => o.id === occId) || null);
                } else {
                    setSelectedOccupation(null);
                }
                setSelectedPerks(perks.filter(p => perkIds.includes(String(p.id))));
                toast({ title: "Shared Preset Loaded!", description: "A build shared via link has been loaded." });
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error("Failed to parse preset from URL", e);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [occupations, perks]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-16 h-16 text-red-500 animate-spin" /></div>;

    const positivePerks = perks.filter(p => p.type === 'positive');
    const negativePerks = perks.filter(p => p.type === 'negative');

    return (
        <>
            <Helmet><title>Perks Manager - Dead Matter Wiki</title></Helmet>
            <div className="max-w-screen-2xl mx-auto p-4 md:p-8 text-white">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold">Perks Manager</h1>
                    <Button asChild variant="outline">
                        <Link to="/wiki">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Wiki
                        </Link>
                    </Button>
                </div>
                <p className="text-center text-2xl mb-8">Available Points: <span className={availablePoints < 0 ? 'text-red-500' : 'text-green-500'}>{availablePoints}</span></p>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-3">
                            <h2 className="text-2xl font-bold mb-2">OCCUPATIONS</h2>
                            {occupations.map(occ => (
                                <motion.div key={occ.id} layout onClick={() => handleSelectOccupation(occ)}
                                    className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedOccupation?.id === occ.id ? 'bg-red-800/50 border-red-500' : 'bg-gray-800/50 border-transparent hover:border-white/50'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{occ.name}</span>
                                        <span className={`font-bold ${occ.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>{occ.points > 0 ? `+${occ.points}`: occ.points}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{occ.description}</p>
                                </motion.div>
                            ))}
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-red-400">NEGATIVE PERKS</h2>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                    {negativePerks.map(perk => (
                                        <motion.div key={perk.id} layout onClick={() => handleSelectPerk(perk)}
                                            className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedPerks.some(p => p.id === perk.id) ? 'bg-red-800/50 border-red-500' : 'bg-red-900/30 border-transparent hover:border-red-500/50'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{perk.name}</span>
                                                <span className="font-bold text-green-400">+{perk.points}</span>
                                            </div>
                                             <p className="text-xs text-gray-400 mt-1">{perk.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2 text-green-400">POSITIVE PERKS</h2>
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                                    {positivePerks.map(perk => (
                                        <motion.div key={perk.id} layout onClick={() => handleSelectPerk(perk)}
                                            className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${selectedPerks.some(p => p.id === perk.id) ? 'bg-green-800/50 border-green-500' : 'bg-green-900/30 border-transparent hover:border-green-500/50'}`}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">{perk.name}</span>
                                                <span className="font-bold text-red-400">-{perk.points}</span>
                                            </div>
                                             <p className="text-xs text-gray-400 mt-1">{perk.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        {finalStats.attributes && <div className="bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-3">ATTRIBUTES</h3>
                            <div className="space-y-2">
                                {Object.entries(finalStats.attributes).map(([key, value]) => <StatBar key={key} label={key} value={value} max={maxValues.attributes[key]} isAttribute />)}
                            </div>
                        </div>}
                        {finalStats.skills && <div className="bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-3">SKILLS</h3>
                            <div className="space-y-2">
                                {Object.entries(finalStats.skills).map(([key, value]) => <StatBar key={key} label={key} value={value} max={maxValues.skills[key]} />)}
                            </div>
                        </div>}
                        {finalStats.stats && <div className="bg-gray-800/50 p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-3">STATS</h3>
                            <div className="space-y-2">
                                {Object.entries(finalStats.stats).map(([key, value]) => <StatBar key={key} label={key} value={value} max={maxValues.stats[key]} />)}
                            </div>
                        </div>}
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 sticky top-8">
                            <h3 className="text-xl font-bold mb-3">MY PRESET</h3>
                            <Input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset Name" />
                            <div className="flex gap-2">
                                <Button onClick={savePreset} className="w-full bg-green-600 hover:bg-green-700"><Save className="mr-2 h-4 w-4"/> Save</Button>
                                <Button onClick={copyToClipboard} className="w-full bg-blue-600 hover:bg-blue-700" disabled={availablePoints < 0}>
                                    {isCopied ? <Check className="mr-2 h-4 w-4"/> : <Share2 className="mr-2 h-4 w-4"/>}
                                    Share
                                </Button>
                            </div>
                            <div className="space-y-2 pt-4">
                                <h4 className="font-bold">Saved Presets</h4>
                                <div className="max-h-[20vh] overflow-y-auto pr-2">
                                {savedPresets.length > 0 ? savedPresets.map(p => (
                                    <div key={p.name} className="flex items-center justify-between bg-gray-900/50 p-2 rounded mb-2">
                                        <span className="truncate flex-1 mr-2">{p.name}</span>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" onClick={() => loadPreset(p)}>Load</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePreset(p.name)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No presets saved yet.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PerksPage;