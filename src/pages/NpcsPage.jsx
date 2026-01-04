import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, X, MapPin, Package, Target, Search, User, ArrowRight, DollarSign, Shield, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import WikiCategoryLayout from '@/components/wiki/WikiCategoryLayout';

const MissionDetailModal = ({ mission, onClose }) => {
    const difficultyColors = {
        'Easy': 'from-green-600 to-emerald-600',
        'Medium': 'from-yellow-600 to-amber-600', 
        'Hard': 'from-red-600 to-orange-600'
    };

    const gradient = difficultyColors[mission.difficulty] || 'from-gray-600 to-slate-600';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Efectos de fondo */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-3xl`} />
                    
                    <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <motion.button 
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                            >
                                <X size={24} />
                            </motion.button>
                            
                            {/* Badge de dificultad */}
                            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white font-bold text-sm shadow-lg flex items-center gap-2`}>
                                <Target className="w-4 h-4" />
                                {mission.difficulty}
                            </div>
                        </div>

                        <div className="p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-4 mb-6"
                            >
                                <div className={`p-3 rounded-2xl bg-gradient-to-r ${gradient} shadow-lg`}>
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">{mission.title}</h2>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-red-400 prose-img:rounded-xl prose-strong:text-white max-w-none prose-lg"
                                dangerouslySetInnerHTML={{ __html: mission.content_html || mission.content || '' }}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const NpcDetailModal = ({ npc, onClose }) => {
    const [missions, setMissions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMission, setSelectedMission] = useState(null);
    const [missionSearch, setMissionSearch] = useState('');
    const [inventorySearch, setInventorySearch] = useState('');

    useEffect(() => {
        const fetchNpcData = async () => {
            setLoading(true);
            
            const [missionsRes, inventoryRes] = await Promise.all([
                supabase.from('missions').select('*').eq('npc_id', npc.id),
                supabase.from('npc_inventory').select('item_type, item_id').eq('npc_id', npc.id)
            ]);

            if (missionsRes.data) setMissions(missionsRes.data);
            
            if (inventoryRes.data) {
                const itemsWithDetails = await Promise.all(
                    inventoryRes.data.map(async (item) => {
                        const { data } = await supabase
                            .from(item.item_type)
                            .select('id, name, image_url, price, rarity:rarities(name, color)')
                            .eq('id', item.item_id)
                            .single();
                        return { ...item, details: data };
                    })
                );
                setInventory(itemsWithDetails.filter(i => i.details));
            }

            setLoading(false);
        };

        fetchNpcData();
    }, [npc.id]);

    const filteredMissions = useMemo(() => 
        missions.filter(m => m.title.toLowerCase().includes(missionSearch.toLowerCase())),
        [missions, missionSearch]
    );

    const filteredInventory = useMemo(() =>
        inventory.filter(i => i.details?.name?.toLowerCase().includes(inventorySearch.toLowerCase())),
        [inventory, inventorySearch]
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Efectos de fondo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-3xl" />
                    
                    <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <motion.button 
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                            >
                                <X size={24} />
                            </motion.button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Columna izquierda - Información del NPC */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="lg:col-span-1"
                                >
                                    <div className="w-full aspect-square bg-black/20 rounded-2xl flex items-center justify-center p-8 mb-6 relative overflow-hidden">
                                        {/* Efecto de fondo */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40" />
                                        
                                        {npc.image_url ? (
                                            <img 
                                                src={npc.image_url} 
                                                alt={npc.name} 
                                                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-2xl rounded-2xl" 
                                            />
                                        ) : (
                                            <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 shadow-lg">
                                                <User className="w-24 h-24 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <motion.h2 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold text-white mb-3 text-center lg:text-left"
                                    >
                                        {npc.name}
                                    </motion.h2>
                                    
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex items-center justify-center lg:justify-start gap-3 text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/10"
                                    >
                                        <MapPin className="text-red-400" size={20} />
                                        <span className="font-semibold">{npc.location}</span>
                                    </motion.div>
                                </motion.div>

                                {/* Columna derecha - Misiones e Inventario */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="lg:col-span-2 space-y-8"
                                >
                                    {/* Misiones */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                Available Missions
                                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {missions.length}
                                                </span>
                                            </h3>
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input 
                                                    placeholder="Search missions..." 
                                                    value={missionSearch} 
                                                    onChange={e => setMissionSearch(e.target.value)} 
                                                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                        
                                        {loading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="animate-spin text-red-500 w-8 h-8" />
                                            </div>
                                        ) : filteredMissions.length > 0 ? (
                                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                                {filteredMissions.map((mission, index) => (
                                                    <motion.div
                                                        key={mission.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 * index }}
                                                        onClick={() => setSelectedMission(mission)}
                                                        className="bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                                    >
                                                        <div className="flex justify-between items-start gap-4">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white text-lg group-hover:text-red-400 transition-colors mb-2">
                                                                    {mission.title}
                                                                </h4>
                                                                <p className="text-gray-400 text-sm line-clamp-2">
                                                                    {mission.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                                                </p>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                                                                mission.difficulty === 'Easy' ? 'from-green-600 to-emerald-600' :
                                                                mission.difficulty === 'Medium' ? 'from-yellow-600 to-amber-600' :
                                                                'from-red-600 to-orange-600'
                                                            } text-white shadow-lg`}>
                                                                {mission.difficulty}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No missions found</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Inventario */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
                                                    <Package className="w-6 h-6 text-white" />
                                                </div>
                                                Items for Sale
                                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {inventory.length}
                                                </span>
                                            </h3>
                                            <div className="relative w-full sm:w-64">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                <Input 
                                                    placeholder="Search items..." 
                                                    value={inventorySearch} 
                                                    onChange={e => setInventorySearch(e.target.value)} 
                                                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                        
                                        {loading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="animate-spin text-red-500 w-8 h-8" />
                                            </div>
                                        ) : filteredInventory.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-2">
                                                {filteredInventory.map((item, index) => (
                                                    <motion.div
                                                        key={`${item.item_type}-${item.item_id}-${index}`}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.05 * index }}
                                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                                                    >
                                                        <div className="h-20 bg-black/20 rounded-lg flex items-center justify-center mb-3 p-2">
                                                            {item.details?.image_url ? (
                                                                <img 
                                                                    src={item.details.image_url} 
                                                                    alt={item.details.name} 
                                                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" 
                                                                />
                                                            ) : (
                                                                <Package className="w-8 h-8 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <h5 className="font-bold text-white text-sm truncate mb-1 group-hover:text-blue-400 transition-colors">
                                                            {item.details?.name}
                                                        </h5>
                                                        <p className="text-xs text-gray-400 capitalize mb-2">
                                                            {item.item_type.replace('_', ' ')}
                                                        </p>
                                                        {item.details?.price != null && (
                                                            <div className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                                                                <DollarSign className="w-3 h-3" />
                                                                <span>${item.details.price}</span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-400">
                                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No items found</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} />}
        </AnimatePresence>
    );
};

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
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    whileHover={{ 
                                        y: -8, 
                                        scale: 1.02,
                                        transition: { duration: 0.3, ease: "easeOut" }
                                    }}
                                    transition={{ 
                                        duration: 0.5, 
                                        delay: index * 0.05,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    onClick={() => setSelectedNpc(npc)}
                                    className="relative overflow-hidden group cursor-pointer h-full"
                                >
                                    {/* Efecto de fondo */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl" />
                                    
                                    <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-sm rounded-2xl group-hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                                        
                                        {/* Imagen del NPC */}
                                        <div className="relative h-48 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                                            
                                            {npc.image_url ? (
                                                <img 
                                                    className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl rounded-2xl"
                                                    alt={npc.name}
                                                    src={npc.image_url} 
                                                />
                                            ) : (
                                                <div className="relative z-20 p-4 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 shadow-lg">
                                                    <User className="w-16 h-16 text-white" strokeWidth={1.5} />
                                                </div>
                                            )}
                                            
                                            {/* Efecto de brillo en hover */}
                                            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />
                                        </div>

                                        {/* Contenido de la tarjeta */}
                                        <div className="p-6 flex-grow flex flex-col">
                                            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                                                {npc.name}
                                            </h3>
                                            
                                            <div className="flex items-center gap-2 text-gray-400 mb-4">
                                                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                                                <span className="text-sm truncate">{npc.location}</span>
                                            </div>

                                            {/* Footer con acción */}
                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <User size={16} className="text-blue-400" />
                                                    <span>NPC</span>
                                                </div>
                                                
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileHover={{ opacity: 1, x: 0 }}
                                                    className="flex items-center text-white/80 group-hover:text-white transition-colors duration-300"
                                                >
                                                    <span className="text-sm font-semibold mr-2">View</span>
                                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Efecto de hover en la parte inferior */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                    </div>

                                    {/* Efecto de sombra exterior */}
                                    <div className="absolute inset-0 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-red-900/50" />
                                </motion.div>
                            ))}
                        </div>
                        
                        {!loading && filteredNpcs.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                                    <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No NPCs Found</h3>
                                    <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
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