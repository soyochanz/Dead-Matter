import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, User, MapPin, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import WikiCategoryLayout from '@/components/wiki/WikiCategoryLayout';
import NpcDetailModal from '@/components/wiki/NpcDetailModal';

const NpcsPage = () => {
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [filters, setFilters] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNpcs = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('npcs').select('*').order('name');
            if (error) {
                console.error(error);
            } else {
                setNpcs(data);
                const locations = [...new Set(data.map(npc => npc.location).filter(Boolean))];
                setFilters(locations.map(loc => ({ id: loc, name: loc })));

                if (location.state?.openNpcId) {
                    const npcToOpen = data.find(npc => npc.id === location.state.openNpcId);
                    if (npcToOpen) {
                        setSelectedNpc(npcToOpen);
                    }
                }
            }
            setLoading(false);
        };

        fetchNpcs();
    }, [location.state]);

    const filteredNpcs = useMemo(() => {
        let results = npcs;
        if (activeFilter !== 'all') {
            results = results.filter(npc => npc.location === activeFilter);
        }
        if (searchTerm) {
            results = results.filter(npc => npc.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return results;
    }, [npcs, activeFilter, searchTerm]);

    const handleCloseModal = () => {
        setSelectedNpc(null);
        navigate('/wiki/npcs', { replace: true });
    };

    return (
        <>
            <Helmet>
                <title>NPCs - Dead Matter Wiki</title>
                <meta name="description" content="Browse NPCs, their missions and items for sale in Dead Matter" />
            </Helmet>

            <WikiCategoryLayout
                title="NPCs"
                filters={filters}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            >
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Loading NPC database...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {filteredNpcs.map((npc, index) => {
                                const style = { 
                                    text: 'text-red-400', 
                                    bgGlow: 'bg-red-500/20', 
                                    shadowPulse: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                                };

                                return (
                                    <motion.div
                                        key={npc.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.5, delay: index * 0.03 }}
                                        onClick={() => setSelectedNpc(npc)}
                                        className="group relative cursor-pointer"
                                    >
                                        <div className={`absolute -inset-[1px] rounded-[2.5rem] opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 ${style.bgGlow}`} />

                                        <div className={`relative h-full bg-[#08080a] rounded-[2.2rem] border border-white/5 overflow-hidden transition-all duration-500 group-hover:border-white/20 shadow-2xl`}>
                                            
                                            <div className="absolute inset-0 pointer-events-none">
                                                <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-white/10 group-hover:border-white/30 transition-colors" />
                                                <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-white/10 group-hover:border-white/30 transition-colors" />
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
                                            </div>

                                            <div className="relative flex flex-col h-full pt-8">
                                                <div className="relative h-60 w-full flex items-center justify-center p-8 group-hover:p-6 transition-all duration-700 overflow-hidden">
                                                    <div className={`absolute w-48 h-48 rounded-full blur-[60px] opacity-30 group-hover:opacity-60 transition-all duration-1000 ${style.bgGlow}`} />
                                                    <div className="absolute bottom-0 w-40 h-full bg-gradient-to-t from-white/[0.08] via-white/[0.03] to-transparent blur-2xl" />
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.1),transparent_60%)] opacity-50" />

                                                    {npc.image_url ? (
                                                        <motion.img
                                                            src={npc.image_url}
                                                            alt={npc.name}
                                                            whileHover={{ scale: 1.15, rotate: -3 }}
                                                            transition={{ type: "spring", stiffness: 150, damping: 15 }}
                                                            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] z-10"
                                                        />
                                                    ) : (
                                                        <div className="text-white/5 relative z-10">
                                                            <User size={80} strokeWidth={1} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="px-8 pb-8 mt-auto space-y-6 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-3 py-1 rounded-full border border-white/5 bg-black/60 shadow-inner flex items-center gap-2`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${style.shadowPulse} ${style.text} animate-pulse`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${style.text}`}>PERSONNEL</span>
                                                        </div>
                                                    </div>

                                                    <div className="min-h-[140px] flex flex-col">
                                                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-[0.9] group-hover:text-red-500 transition-colors duration-500 mb-6 whitespace-pre-line">
                                                            {npc.name}
                                                        </h3>
                                                        
                                                        <div className="grid grid-cols-1 gap-6 pt-6 border-t border-white/5 mt-auto">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">CURRENT LOCATION</span>
                                                                    <span className="text-[11px] font-bold text-white/80">{npc.location || 'Roaming'}</span>
                                                                </div>
                                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: "100%" }}
                                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                                        className="h-full bg-red-600 rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-1 h-32 rounded-r-full transition-all duration-700 opacity-20 group-hover:opacity-100 group-hover:h-full ${style.bgGlow}`} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {!loading && filteredNpcs.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                                    <User className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No NPCs Found</h3>
                                    <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </WikiCategoryLayout>

            <AnimatePresence>
                {selectedNpc && <NpcDetailModal npc={selectedNpc} onClose={handleCloseModal} />}
            </AnimatePresence>
        </>
    );
};

export default NpcsPage;
