import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, X, User } from 'lucide-react';

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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-white">Sold By</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-red-500 h-8 w-8" />
                        </div>
                    ) : sellers.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {sellers.map(npc => (
                                <div
                                    key={npc.id}
                                    onClick={() => handleNpcClick(npc)}
                                    className="flex items-center gap-4 bg-black/20 hover:bg-black/40 p-3 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-black/30 overflow-hidden flex-shrink-0">
                                        {npc.image_url ? (
                                            <img src={npc.image_url} alt={npc.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-full h-full text-gray-500 p-2" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{npc.name}</p>
                                        <p className="text-sm text-gray-400">{npc.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-8">This item is not sold by any known NPC.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NpcSellersModal;