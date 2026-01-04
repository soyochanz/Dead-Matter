import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/mySupabaseClient';
import {
    X,
    Loader2,
    Info,
    ArrowLeft,
    Skull,
    Droplet,
    Sparkles,
    HeartPulse,
    AlertTriangle,
    ArrowRight,
    Shield,
    Crosshair,
    Zap,
    Activity,
    Search,
    Filter,
    Grid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

const StatDisplay = ({ icon, label, value, colorClass = 'text-white', className = '' }) => (
    <div className={`flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/stat-row cursor-default hover:bg-white/10 transition-all duration-300 ${className}`}>
        <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/5 text-gray-500 group-hover/stat-row:text-white transition-colors shadow-inner">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/stat-row:text-gray-400">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold text-white tracking-widest ${colorClass}`}>
            {value}
        </span>
    </div>
);

const InfoModal = ({ item, open, onOpenChange }) => {
    if (!item) return null;
    const isMedicine = 'health' in item || 'hydration' in item || 'energy' in item;
    const hasSideEffects = item.side_effects && Object.keys(item.side_effects).length > 0;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                    onClick={() => onOpenChange(false)}
                >
                    {/* Background Noise/Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-[#050505] border border-white/5 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Technical Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                        <div className="p-8 md:p-12 overflow-y-auto relative z-10 flex-grow">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onOpenChange(false)}
                                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all bg-white/5 p-3 rounded-2xl hover:bg-red-600/20 hover:text-red-500 border border-white/5 z-20"
                            >
                                <X size={24} />
                            </motion.button>

                            <div className="space-y-8">
                                <div>
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-2 mb-4"
                                    >
                                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg border border-red-500/20 bg-red-500/10 text-red-500`}>
                                            {isMedicine ? 'MEDICINE' : 'DISEASE'}
                                        </span>
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase bg-white/5 text-gray-500 border border-white/5">
                                            ID: {(item.id || 'N/A').substring(0, 8).toUpperCase()}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-4xl md:text-5xl font-semibold text-white uppercase tracking-tighter mb-4 leading-none">
                                        {item.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                        ))}
                                    </h2>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2 italic text-balance">
                                        {item.description}
                                    </p>

                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-6 shadow-inner relative overflow-hidden">
                                        {isMedicine ? (
                                            <>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {(item.health !== 0) && (
                                                        <StatDisplay icon={<HeartPulse size={16} className="text-green-400" />} label="Vital Recovery" value={item.health > 0 ? `+${item.health}` : item.health} colorClass={item.health > 0 ? 'text-green-400' : 'text-red-400'} />
                                                    )}
                                                    {(item.hydration !== 0) && (
                                                        <StatDisplay icon={<Droplet size={16} className="text-blue-400" />} label="Hydration" value={item.hydration > 0 ? `+${item.hydration}` : item.hydration} colorClass={item.hydration > 0 ? 'text-blue-400' : 'text-red-400'} />
                                                    )}
                                                    {(item.energy !== 0) && (
                                                        <StatDisplay icon={<Sparkles size={16} className="text-yellow-400" />} label="Energy Stasis" value={item.energy > 0 ? `+${item.energy}` : item.energy} colorClass={item.energy > 0 ? 'text-yellow-400' : 'text-red-400'} />
                                                    )}
                                                </div>

                                                {hasSideEffects && (
                                                    <div className="space-y-4 pt-6 border-t border-white/5">
                                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                            <AlertTriangle size={14} className="text-yellow-500" /> Bio-hazard / Toxicity
                                                        </h5>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {Object.entries(item.side_effects).map(([key, value]) => (
                                                                <div key={key} className="p-3 rounded-xl bg-black/40 border border-white/5 group/side">
                                                                    <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest block mb-1">{key}</span>
                                                                    <span className="text-sm font-medium text-gray-300 italic">"{value}"</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                {item.is_lethal && (
                                                    <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                                        <div className="p-2.5 rounded-xl bg-red-600 shadow-lg shadow-red-900/50">
                                                            <Skull size={20} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block">Threat Classification</span>
                                                            <span className="text-lg font-black text-white uppercase tracking-tight">LETHAL PATHOGEN</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Clinical Analysis</span>
                                                    <p className="text-sm font-medium text-gray-300 leading-relaxed italic">
                                                        Current database indicates this condition requires immediate stabilization or specific medicine treatment.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Aesthetic Detail */}
                        <div className="h-1 flex">
                            <div className="w-1/4 h-full bg-red-600" />
                            <div className="w-3/4 h-full bg-[#0a0a0c]" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const MedsPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: medData } = await supabase.from('medicines').select('*, rarity:rarities(name, color)').order('name');
            const { data: diseaseData } = await supabase.from('diseases').select('*').order('name');
            const { data: relationData } = await supabase.from('medicine_treats_disease').select('*');

            setMedicines(medData || []);
            setDiseases(diseaseData || []);
            setRelations(relationData || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item.id === selectedItem?.id ? null : item);
        setSelectedDisease(null);
    };

    const handleDiseaseClick = (disease) => {
        setSelectedDisease(disease.id === selectedDisease?.id ? null : disease);
        setSelectedItem(null);
    };

    const openInfoModal = (item) => {
        setModalContent(item);
        setInfoModalOpen(true);
    };

    const getTreatedDiseases = (medId) => {
        const diseaseIds = relations.filter(r => r.medicine_id === medId).map(r => r.disease_id);
        return diseases.filter(d => diseaseIds.includes(d.id));
    };

    const getCuringMedicines = (diseaseId) => {
        const medIds = relations.filter(r => r.disease_id === diseaseId).map(r => r.medicine_id);
        return medicines.filter(m => medIds.includes(m.id));
    };

    const highlightedMedicines = selectedDisease ? getCuringMedicines(selectedDisease.id) : [];
    const highlightedDiseases = selectedItem ? getTreatedDiseases(selectedItem.id) : [];

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredDiseases = diseases.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading medical database...</p>
            </div>
        </div>
    );

    const noSelectionActive = !selectedItem && !selectedDisease;

    return (
        <div className="relative min-h-screen pb-20">
            {/* Technical background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] z-0" />
            <Helmet>
                <title>Medical Guide - Dead Matter Wiki</title>
                <meta name="description" content="Complete medical guide for diseases and medicines in Dead Matter" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-[2px] w-8 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Wiki</span>
                                </div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="text-5xl md:text-7xl font-black text-white tracking-tighter"
                                >
                                    <span className="text-white">Medical </span>
                                    <span className="text-white/20">Guide</span>
                                </motion.h1>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Button asChild variant="outline" className="h-12 border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl px-6">
                                    <Link to="/wiki">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Return to Wiki
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-gray-400 text-lg max-w-3xl font-medium"
                        >
                            Explore the <span className="text-white italic">medical database</span> of Dead Matter. Identify pathogens, infections, and discover clinical solutions to survive the waste.
                        </motion.p>
                    </div>

                    {/* Filters and Search Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 mb-12 shadow-2xl"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex flex-col gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <Filter className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Medical Analysis</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                                        Clinical Database
                                    </div>
                                    <div className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-500 border border-white/5">
                                        {medicines.length} Treatments
                                    </div>
                                    <div className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-500 border border-white/5">
                                        {diseases.length} Pathogens
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-auto flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <Search className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Search Database</span>
                                </div>
                                <div className="relative group min-w-[320px]">
                                    <Input
                                        type="text"
                                        placeholder="Search clinical records..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-12 bg-white/5 border-white/5 pl-6 pr-4 py-2 text-white font-bold placeholder:text-gray-600 
                                                  rounded-xl focus:bg-white/10 focus:border-red-500/50 focus:ring-0
                                                  transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Diseases Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/section"
                        >
                            {/* Grid highlight effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[100px] pointer-events-none group-hover/section:bg-red-600/10 transition-colors duration-700" />

                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                        <Skull className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Diseases</h2>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/50 mt-1 block">Bio-Hazardous Analysis</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block">Status</span>
                                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Critical</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredDiseases.map((disease, index) => {
                                        const isSelected = selectedDisease?.id === disease.id;
                                        const isHighlighted = highlightedDiseases.some(d => d.id === disease.id);
                                        const isDimmed = !noSelectionActive && !isSelected && !isHighlighted;

                                        return (
                                            <motion.div
                                                key={disease.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`relative group cursor-pointer transition-all duration-500 ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100 grayscale-0'}`}
                                                onClick={() => handleDiseaseClick(disease)}
                                            >
                                                <div className={`relative overflow-hidden rounded-[1.5rem] bg-[#0a0a0c] border transition-all duration-300 h-full flex flex-col ${isSelected
                                                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                    : isHighlighted
                                                        ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                                        : 'border-white/5 hover:border-red-500/30'
                                                    }`}>
                                                    {/* Background Glow */}
                                                    <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${isSelected ? 'bg-blue-500' : isHighlighted ? 'bg-green-500' : 'bg-transparent'}`} />

                                                    {/* Scanline Effect */}
                                                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                                    <div className="p-4 relative z-10 flex flex-col items-center">
                                                        <div className="h-28 w-full flex items-center justify-center p-2 mb-4">
                                                            <img
                                                                src={disease.image_url}
                                                                alt={disease.name}
                                                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                                                            />
                                                        </div>

                                                        <h3 className="text-center text-xs font-medium text-white uppercase tracking-tight truncate w-full">
                                                            {disease.name}
                                                        </h3>

                                                        <div className="absolute top-3 left-3 flex gap-1">
                                                            {disease.is_lethal && (
                                                                <div className="bg-red-500/20 backdrop-blur-md p-1.5 rounded-lg border border-red-500/30">
                                                                    <Skull className="h-3 w-3 text-red-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openInfoModal(disease); }}
                                                            className="absolute top-3 right-3 bg-white/5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/20 hover:text-red-500 border border-white/5"
                                                        >
                                                            <Info className="h-3 w-3 " />
                                                        </button>
                                                    </div>

                                                    {/* Bottom Indicator */}
                                                    <div className={`h-1 transform transition-transform duration-500 origin-left ${isSelected ? 'bg-blue-500 scale-x-100' : isHighlighted ? 'bg-green-500 scale-x-100' : 'bg-red-600 scale-x-0 group-hover:scale-x-100'}`} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Medicines Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group/section"
                        >
                            {/* Grid highlight effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-600/5 blur-[100px] pointer-events-none group-hover/section:bg-green-600/10 transition-colors duration-700" />

                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                        <HeartPulse className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">Medicines</h2>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/50 mt-1 block">Clinical Solutions</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block">Availability</span>
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Stable</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <AnimatePresence mode="popLayout">
                                    {filteredMedicines.map((med, index) => {
                                        const isSelected = selectedItem?.id === med.id;
                                        const isHighlighted = highlightedMedicines.some(m => m.id === med.id);
                                        const isDimmed = !noSelectionActive && !isSelected && !isHighlighted;
                                        const rarityColor = med.rarity?.color || '#4b5563';

                                        return (
                                            <motion.div
                                                key={med.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`relative group cursor-pointer transition-all duration-500 ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100 grayscale-0'}`}
                                                onClick={() => handleItemClick(med)}
                                            >
                                                <div className={`relative overflow-hidden rounded-[1.5rem] bg-[#0a0a0c] border transition-all duration-300 h-full flex flex-col ${isSelected
                                                    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                                    : isHighlighted
                                                        ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                                        : 'border-white/5 hover:border-red-500/30'
                                                    }`}>
                                                    {/* Rarity Aura */}
                                                    <div
                                                        className="absolute inset-0 opacity-10 transition-opacity duration-500"
                                                        style={{ backgroundColor: rarityColor }}
                                                    />

                                                    {/* Background Glow during selection */}
                                                    <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isSelected ? 'bg-blue-500' : isHighlighted ? 'bg-green-500' : 'bg-transparent'}`} />

                                                    {/* Scanline Effect */}
                                                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                                    <div className="p-4 relative z-10 flex flex-col items-center">
                                                        <div className="h-28 w-full flex items-center justify-center p-2 mb-4">
                                                            <img
                                                                src={med.image_url}
                                                                alt={med.name}
                                                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                                                            />
                                                        </div>

                                                        <div className="text-center w-full">
                                                            <h3 className="text-xs font-medium text-white uppercase tracking-tight truncate mb-2">
                                                                {med.name}
                                                            </h3>
                                                            {med.rarity && (
                                                                <span
                                                                    className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded border"
                                                                    style={{
                                                                        borderColor: `${rarityColor}30`,
                                                                        color: rarityColor,
                                                                        backgroundColor: `${rarityColor}10`
                                                                    }}
                                                                >
                                                                    {med.rarity.name}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); openInfoModal(med); }}
                                                            className="absolute top-3 right-3 bg-white/5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/20 hover:text-red-500 border border-white/5"
                                                        >
                                                            <Info className="h-3 w-3 " />
                                                        </button>
                                                    </div>

                                                    {/* Bottom Indicator */}
                                                    <div className={`h-1 transform transition-transform duration-500 origin-left ${isSelected ? 'bg-blue-500 scale-x-100' : isHighlighted ? 'bg-green-500 scale-x-100' : 'bg-red-600 scale-x-0 group-hover:scale-x-100'}`} />
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Selection Info */}
                    {selectedItem || selectedDisease ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 bg-[#0a0a0c] border border-red-500/20 rounded-[2rem] p-10 relative overflow-hidden"
                        >
                            {/* Technical accents */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                            <div className="absolute top-0 right-0 p-4">
                                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Active Relationship Data</span>
                                </div>

                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                                    {selectedItem ? selectedItem.name : selectedDisease.name}
                                </h4>

                                <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                                    {selectedItem
                                        ? `Clinical analysis indicates that ${selectedItem.name} provides stabilization for ${highlightedDiseases.length} identified pathogen${highlightedDiseases.length !== 1 ? 's' : ''}.`
                                        : `Pathological data confirms that ${selectedDisease.name} can be effectively treated with ${highlightedMedicines.length} clinical solution${highlightedMedicines.length !== 1 ? 's' : ''}.`
                                    }
                                </p>

                                <button
                                    onClick={() => { setSelectedItem(null); setSelectedDisease(null); }}
                                    className="mt-8 flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:text-white transition-colors group"
                                >
                                    <X size={12} className="group-hover:rotate-90 transition-transform" />
                                    Terminate Selection Loop
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-12 flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-[2rem] bg-white/[0.01]"
                        >
                            <Grid className="w-8 h-8 text-white/10 mb-4" />
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-[0.2em]">Select an entry to analyze relationships</p>
                        </motion.div>
                    )}

                    {/* Bottom Navigation */}
                    <div className="flex justify-center mt-20 pt-12 border-t border-white/5">
                        <Button asChild variant="outline" className="h-12 border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl px-8">
                            <Link to="/wiki">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Return to Archive
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>

            <InfoModal item={modalContent} open={infoModalOpen} onOpenChange={setInfoModalOpen} />
        </div>
    );
};

export default MedsPage;
