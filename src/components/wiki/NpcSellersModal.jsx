import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, X, User, ArrowRight } from 'lucide-react';

const NpcSellersModal = ({ itemType, itemId, onClose, onNpcSelect }) => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSellers = async () => {
            setLoading(true);
            const { data: inventoryLinks, error: linkError } = await supabase
                .from('npc_inventory')
                .select('npc_id')
                .eq('item_type', itemType)
                .eq('item_id', itemId);

            if (linkError || !inventoryLinks || inventoryLinks.length === 0) {
                setSellers([]);
                setLoading(false);
                return;
            }

            const npcIds = inventoryLinks.map(link => link.npc_id);
            const { data: npcs, error: npcError } = await supabase
                .from('npcs')
                .select('*')
                .in('id', npcIds);

            if (npcError) {
                console.error("Error fetching NPCs:", npcError);
                setSellers([]);
            } else {
                setSellers(npcs);
            }
            setLoading(false);
        };

        fetchSellers();
    }, [itemType, itemId]);

    const handleNpcClick = (npc) => {
        onNpcSelect(npc);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[70] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Background Noise/Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-[#050505] border border-white/5 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                <div className="p-8 relative z-10 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600/50">Market Intelligence</span>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Verified Sellers</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-red-500 h-10 w-10" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Accessing Database...</span>
                        </div>
                    ) : sellers.length > 0 ? (
                        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {sellers.map(npc => (
                                <motion.div
                                    key={npc.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleNpcClick(npc)}
                                    className="flex items-center gap-5 bg-white/5 border border-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:bg-white/10 hover:border-red-500/20 group"
                                >
                                    <div className="w-16 h-16 rounded-xl bg-[#0a0a0c] border border-white/5 overflow-hidden flex-shrink-0 relative group-hover:border-red-500/40 transition-colors">
                                        <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {npc.image_url ? (
                                            <img src={npc.image_url} alt={npc.name} className="w-full h-full object-cover relative z-10" />
                                        ) : (
                                            <User className="w-full h-full text-gray-700 p-4 transition-colors group-hover:text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">{npc.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{npc.location || 'Unknown Coordinates'}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-lg bg-black/40 text-gray-600 group-hover:text-red-500 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No merchant records found</p>
                            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Protocol Search Failure</p>
                        </div>
                    )}
                </div>

                {/* Bottom Accents */}
                <div className="h-1 bg-gradient-to-r from-red-600/0 via-red-600 to-red-600/0 opacity-30" />
            </motion.div>
        </motion.div>
    );
};

export default NpcSellersModal;
