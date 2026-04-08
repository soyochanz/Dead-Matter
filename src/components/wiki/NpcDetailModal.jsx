import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Package, Target, Search, User, ArrowRight, DollarSign, Store, Crosshair } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import { Input } from '@/components/ui/input';
import MissionDetailModal from '@/components/wiki/MissionDetailModal';

const NpcDetailModal = ({ npc, onClose }) => {
    const [missions, setMissions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMission, setSelectedMission] = useState(null);
    const [missionSearch, setMissionSearch] = useState('');
    const [inventorySearch, setInventorySearch] = useState('');
    const [activeTab, setActiveTab] = useState('missions'); // 'missions' or 'shop'

    useEffect(() => {
        const fetchNpcData = async () => {
            if (!npc?.id) return;
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
    }, [npc]);

    const filteredMissions = useMemo(() =>
        missions.filter(m => m.title.toLowerCase().includes(missionSearch.toLowerCase())),
        [missions, missionSearch]
    );

    const filteredInventory = useMemo(() =>
        inventory.filter(i => i.details?.name?.toLowerCase().includes(inventorySearch.toLowerCase())),
        [inventory, inventorySearch]
    );

    if (!npc) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[50] flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl h-[85vh] flex flex-col bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0"
                        style={{
                            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                {npc.image_url ? (
                                    <img src={npc.image_url} alt={npc.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-gray-400" size={24} />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{npc.name}</h2>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <MapPin size={12} className="text-red-400" />
                                    <span className="uppercase tracking-wider font-medium">{npc.location || 'Unknown Location'}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Layout Content */}
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden z-10">
                        {/* Sidebar (Visuals) */}
                        <div className="lg:w-1/3 bg-black/20 border-r border-white/5 p-6 flex flex-col items-center">
                            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group mb-6">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                {npc.image_url ? (
                                    <img src={npc.image_url} alt={npc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={64} className="text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 z-20 text-white">
                                    <p className="text-xs font-mono text-gray-400 mb-1">NPC ID: {npc.id.slice(0, 8)}</p>
                                    <p className="text-sm font-medium">Status: Active</p>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3">
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-400 mb-1">
                                        <Target size={16} />
                                        <span className="text-xs font-bold uppercase">Missions</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">{missions.length}</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                                        <Store size={16} />
                                        <span className="text-xs font-bold uppercase">Shop</span>
                                    </div>
                                    <span className="text-xl font-bold text-white">{inventory.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col bg-[#0a0a0c]">
                            {/* Tabs */}
                            <div className="flex border-b border-white/5">
                                <button
                                    onClick={() => setActiveTab('missions')}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'missions' ? 'border-red-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Active Missions
                                </button>
                                <button
                                    onClick={() => setActiveTab('shop')}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'shop' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                >
                                    Shop Inventory
                                </button>
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {loading ? (
                                    <div className="flex h-full items-center justify-center text-gray-500">Loading data...</div>
                                ) : (
                                    <>
                                        {activeTab === 'missions' && (
                                            <div className="space-y-4">
                                                <div className="relative mb-4">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                                                    <Input
                                                        placeholder="Search missions..."
                                                        value={missionSearch}
                                                        onChange={(e) => setMissionSearch(e.target.value)}
                                                        className="pl-9 bg-white/5 border-white/10 text-white h-10"
                                                    />
                                                </div>
                                                {filteredMissions.map((mission, idx) => (
                                                    <motion.div
                                                        key={mission.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        onClick={() => setSelectedMission(mission)}
                                                        className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer transition-all flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <h4 className="text-white font-medium group-hover:text-red-400 transition-colors mb-1">{mission.title}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${mission.difficulty === 'Easy' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                                                    mission.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                                                        'text-red-400 border-red-500/30 bg-red-500/10'
                                                                    }`}>
                                                                    {mission.difficulty}
                                                                </span>
                                                                <span className="text-xs text-gray-500 font-mono">ID: {mission.id.slice(0, 6)}</span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                                    </motion.div>
                                                ))}
                                                {filteredMissions.length === 0 && <p className="text-gray-500 text-center py-8">No missions found.</p>}
                                            </div>
                                        )}

                                        {activeTab === 'shop' && (
                                            <div className="space-y-4">
                                                <div className="relative mb-4">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                                                    <Input
                                                        placeholder="Search items..."
                                                        value={inventorySearch}
                                                        onChange={(e) => setInventorySearch(e.target.value)}
                                                        className="pl-9 bg-white/5 border-white/10 text-white h-10"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {filteredInventory.map((item, idx) => (
                                                        <motion.div
                                                            key={`${item.item_id}-${idx}`}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all group"
                                                        >
                                                            <div className="h-12 w-12 rounded-lg bg-black/40 flex items-center justify-center p-1 border border-white/5">
                                                                {item.details?.image_url ? (
                                                                    <img src={item.details.image_url} alt="" className="max-h-full max-w-full object-contain" />
                                                                ) : <Package className="text-gray-600" size={20} />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{item.details?.name || 'Unknown Item'}</p>
                                                                <p className="text-xs text-gray-500 capitalize">{item.item_type.replace('_', ' ')}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-sm font-bold text-green-400 block">${item.details?.price || '---'}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                {filteredInventory.length === 0 && <p className="text-gray-500 text-center py-8">No stock available.</p>}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <AnimatePresence>
                {selectedMission && (
                    <MissionDetailModal
                        mission={selectedMission}
                        onClose={() => setSelectedMission(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default NpcDetailModal;
