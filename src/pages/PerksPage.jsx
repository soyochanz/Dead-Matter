import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, Save, Share2, Trash2, Check, ChevronLeft, Target, Shield, Zap, Skull, Brain } from 'lucide-react';
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
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const barColor = isAttribute ? "from-blue-500 to-cyan-500" : "from-emerald-500 to-green-600";

    return (
        <div className="group">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-1.5">
                <span className="text-gray-400 group-hover:text-white transition-colors">{label}</span>
                <span className="text-white font-mono">{value} <span className="text-gray-600">/ {max}</span></span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                <motion.div
                    className={`bg-gradient-to-r ${barColor} h-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "outCirc" }}
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
            </div>
        </div>
    );
};

const OccupationCard = ({ occ, isSelected, onSelect }) => (
    <motion.div
        layout
        onClick={() => onSelect(occ)}
        className={`relative p-4 rounded-xl cursor-pointer border transition-all duration-300 group overflow-hidden ${isSelected
                ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/50'
                : 'bg-[#0a0a0c] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
            }`}
    >
        {isSelected && (
            <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
        )}

        <div className="flex justify-between items-start mb-2 relative z-10">
            <span className={`font-bold text-lg tracking-tight ${isSelected ? 'text-blue-400' : 'text-white group-hover:text-blue-200'} transition-colors`}>
                {occ.name}
            </span>
            <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${occ.points >= 0
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                {occ.points > 0 ? `+${occ.points}` : occ.points}
            </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed font-medium relative z-10">
            {occ.description}
        </p>

        {/* Selection Glow */}
        {isSelected && (
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        )}
    </motion.div>
);

const PerkCard = ({ perk, isSelected, onSelect, type }) => {
    const isPositive = type === 'positive';
    const baseColor = isPositive ? 'green' : 'red';
    const activeClass = isPositive
        ? 'bg-green-900/10 border-green-500/50'
        : 'bg-red-900/10 border-red-500/50';

    return (
        <motion.div
            layout
            onClick={() => onSelect(perk)}
            className={`relative p-3 rounded-lg cursor-pointer border transition-all duration-300 group ${isSelected
                    ? activeClass
                    : `bg-[#0a0a0c] border-white/5 hover:border-${baseColor}-500/30 hover:bg-white/[0.02]`
                }`}
        >
            <div className="flex justify-between items-center mb-1 relative z-10">
                <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {perk.name}
                </span>
                <span className={`font-mono text-xs font-bold ${isPositive ? 'text-red-400' : 'text-green-400'
                    }`}>
                    {isPositive ? `-${perk.points}` : `+${perk.points}`}
                </span>
            </div>
            <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-400 transition-colors relative z-10">
                {perk.description}
            </p>
        </motion.div>
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
            setLoading(false);

            const { data: occData } = await supabase.from('occupations').select('*');
            const { data: perkData } = await supabase.from('perks').select('*');
            setOccupations(occData || []);
            setPerks(perkData || []);
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
            if (selectedOccupation.effects) {
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
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error("Failed to parse preset from URL", e);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [occupations, perks]); // Added occupations and perks as dependencies

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
            <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
        </div>
    );

    const positivePerks = perks.filter(p => p.type === 'positive');
    const negativePerks = perks.filter(p => p.type === 'negative');

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-red-500/30">
            <Helmet><title>Perks Manager - Dead Matter Wiki</title></Helmet>

            {/* Technical Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="relative max-w-screen-2xl mx-auto p-4 md:p-8 z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link to="/wiki" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-2">
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Wiki
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
                            Operative <span className="text-gray-600">Builder</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Available Points</span>
                        <span className={`text-3xl font-black font-mono ${availablePoints < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {availablePoints}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Selection */}
                    <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Occupations */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                <Target className="text-blue-500" size={18} />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Occupations</h2>
                            </div>
                            <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[80vh] pr-2">
                                {occupations.map(occ => (
                                    <OccupationCard
                                        key={occ.id}
                                        occ={occ}
                                        isSelected={selectedOccupation?.id === occ.id}
                                        onSelect={handleSelectOccupation}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Perks */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Negative Perks */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                                    <Skull className="text-red-500" size={18} />
                                    <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider">Negative Perks (Add Points)</h2>
                                </div>
                                <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {negativePerks.map(perk => (
                                        <PerkCard
                                            key={perk.id}
                                            perk={perk}
                                            isSelected={selectedPerks.some(p => p.id === perk.id)}
                                            onSelect={handleSelectPerk}
                                            type="negative"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Positive Perks */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                                    <Zap className="text-green-500" size={18} />
                                    <h2 className="text-sm font-bold text-green-500 uppercase tracking-wider">Positive Perks (Cost Points)</h2>
                                </div>
                                <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {positivePerks.map(perk => (
                                        <PerkCard
                                            key={perk.id}
                                            perk={perk}
                                            isSelected={selectedPerks.some(p => p.id === perk.id)}
                                            onSelect={handleSelectPerk}
                                            type="positive"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Save */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Stats Panel */}
                        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-xl backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="text-purple-500" size={18} />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Build Statistics</h3>
                            </div>

                            <div className="space-y-6">
                                {finalStats.attributes && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase">Core Attributes</h4>
                                        <div className="space-y-2">
                                            {Object.entries(finalStats.attributes).map(([key, value]) => (
                                                <StatBar key={key} label={key} value={value} max={maxValues.attributes[key]} isAttribute />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="h-px bg-white/5" />
                                {finalStats.skills && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase">Skills Proficiency</h4>
                                        <div className="space-y-2">
                                            {Object.entries(finalStats.skills).map(([key, value]) => (
                                                <StatBar key={key} label={key} value={value} max={maxValues.skills[key]} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preset Manager */}
                        <div className="bg-white/[0.02] border border-white/10 p-5 rounded-xl backdrop-blur-md sticky top-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Save className="text-orange-500" size={18} />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preset Manager</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <Input
                                    type="text"
                                    value={presetName}
                                    onChange={e => setPresetName(e.target.value)}
                                    placeholder="Enter build name..."
                                    className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-white/20"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={savePreset} variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white hover:text-white">
                                        <Save className="mr-2 h-3 w-3" /> Save
                                    </Button>
                                    <Button onClick={copyToClipboard} disabled={availablePoints < 0} variant="outline" className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white hover:text-white">
                                        {isCopied ? <Check className="mr-2 h-3 w-3" /> : <Share2 className="mr-2 h-3 w-3" />}
                                        Share
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase">Saved Builds</h4>
                                <div className="max-h-[20vh] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {savedPresets.length > 0 ? savedPresets.map(p => (
                                        <div key={p.name} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                                            <span className="truncate flex-1 mr-2 text-xs font-medium text-gray-300">{p.name}</span>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500 hover:text-white" onClick={() => loadPreset(p)}>
                                                    <span className="sr-only">Load</span>
                                                    <Target size={12} />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-500 hover:text-red-400">
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-[#1a1a1c] border-white/10 text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete "{p.name}"?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deletePreset(p.name)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    )) : <p className="text-xs text-gray-600 italic text-center py-2">No saved presets.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerksPage;
