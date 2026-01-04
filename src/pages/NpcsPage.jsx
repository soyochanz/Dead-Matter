import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, User, MapPin, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
        window.history.replaceState({}, document.title)
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredNpcs.map((npc, index) => (
                                <motion.div
                                    key={npc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    onClick={() => setSelectedNpc(npc)}
                                    className="group relative h-full bg-[#0a0a0c] border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-colors duration-300"
                                >
                                    {/* Subtle Glow */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at center, #ef4444, transparent 70%)`
                                        }}
                                    />

                                    <div className="relative h-44 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
                                        {/* Technical Grid Background */}
                                        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                        {npc.image_url ? (
                                            <img
                                                className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                                                alt={npc.name}
                                                src={npc.image_url}
                                            />
                                        ) : (
                                            <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/5">
                                                <User className="w-12 h-12 text-gray-600 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 border-t border-white/5 relative z-10 flex flex-col h-[calc(100%-11rem)]">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-white group-hover:text-red-200 transition-colors tracking-tight leading-snug mb-2">
                                                {npc.name}
                                            </h3>

                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 uppercase tracking-wider font-medium">
                                                <MapPin size={12} className="text-red-500" />
                                                <span>{npc.location || 'Roaming'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                                            <span>Interact</span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-400">
                                                View Missions <ArrowRight size={10} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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

            {selectedNpc && <NpcDetailModal npc={selectedNpc} onClose={handleCloseModal} />}
        </>
    );
};

export default NpcsPage;
