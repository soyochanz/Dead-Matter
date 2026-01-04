import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hammer, Tent, TrendingUp, Box, Info, Lock, Store, Activity, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
// Tooltip imports removed

const StatDisplay = ({ icon: Icon, label, value, subValue, color = "text-white", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-white/20 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${color.replace('text-', 'bg-')}/10`}>
                <Icon size={16} className={color} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">{label}</span>
            </div>
        </div>
        <div className="text-right">
            <span className="block text-lg font-medium text-white tracking-tight">{value}</span>
            {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
    </motion.div>
);

const RequirementsList = ({ requirements }) => (
    <div className="mt-8 pt-6 border-t border-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Hammer size={14} className="text-orange-500" />
            Crafting Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {requirements.map((req, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                >
                    <div className="h-8 w-8 rounded bg-black/40 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                        {req.image_url ? (
                            <img src={req.image_url} alt={req.component_name} className="w-full h-full object-cover" />
                        ) : (
                            <Box size={14} className="text-gray-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-300 font-medium truncate block">{req.component_name || 'Unknown Component'}</span>
                    </div>
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 whitespace-nowrap">
                        x{req.quantity}
                    </span>
                </motion.div>
            ))}
        </div>
    </div>
);

const BasebuildingDetailModal = ({ item, onClose, onNpcSelect }) => {
    const [requirements, setRequirements] = useState([]);
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    const [isPacked, setIsPacked] = useState(false);

    useEffect(() => {
        const fetchRequirements = async () => {
            if (!item?.requirements?.length) {
                setRequirements([]);
                return;
            }

            // Extract material IDs from JSON requirements
            const materialIds = item.requirements.map(req => req.item_id);

            // Fetch material names and images
            const { data: materials, error } = await supabase
                .from('crafting_materials')
                .select('id, name, image_url')
                .in('id', materialIds);

            if (error || !materials) {
                console.error("Error fetching materials:", error);
                // Fallback: show requirements without names
                setRequirements(item.requirements.map(req => ({ ...req, component_name: 'Unknown Material' })));
                return;
            }

            // Map names back to requirements
            const enrichedRequirements = item.requirements.map(req => {
                const mat = materials.find(m => m.id === req.item_id);
                return {
                    ...req,
                    component_name: mat ? mat.name : 'Unknown Material',
                    image_url: mat ? mat.image_url : null
                };
            });

            setRequirements(enrichedRequirements);
        };
        fetchRequirements();
    }, [item]);

    if (!item) return null;

    const rarityColor = item.rarity?.color || '#9ca3af';

    // Image logic for tents
    const displayImage = isPacked && item.packed_image_url ? item.packed_image_url : item.image_url;
    const hasPackedVariant = !!item.packed_image_url;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                {/* Backdrop with Blur */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div
                        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none rounded-full blur-[100px]"
                        style={{ background: `radial-gradient(circle, ${rarityColor}, transparent 70%)` }}
                    />

                    {/* Header */}
                    <div className="flex justify-between items-start p-6 md:p-8 pb-0 z-10">
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                {item.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/5 uppercase tracking-wider">
                                    Base Module
                                </span>
                                {item.subcategory && (
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-white/5 border-white/10 text-gray-400"
                                    >
                                        {item.subcategory.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 z-10 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {/* Left Column - Image & Quick Stats */}
                            <div className="space-y-6">
                                <div className="relative aspect-square rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-8 overflow-hidden group">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent)]" />
                                    {displayImage ?
                                        <motion.img
                                            key={displayImage}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            src={displayImage}
                                            alt={item.name}
                                            className="max-h-full max-w-full object-contain drop-shadow-2xl relative z-10"
                                        /> :
                                        <div className="relative z-10 p-8 rounded-full bg-white/5">
                                            <Box className="w-16 h-16 text-gray-600" />
                                        </div>
                                    }
                                    {/* Tents Toggle */}
                                    {hasPackedVariant && (
                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                            <button
                                                onClick={() => setIsPacked(false)}
                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${!isPacked ? 'bg-white text-black border-white' : 'bg-black/50 text-gray-400 border-white/10 hover:bg-black/70'}`}
                                            >
                                                DEPLOYED
                                            </button>
                                            <button
                                                onClick={() => setIsPacked(true)}
                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${isPacked ? 'bg-white text-black border-white' : 'bg-black/50 text-gray-400 border-white/10 hover:bg-black/70'}`}
                                            >
                                                PACKED
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Main Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {item.price && (
                                        <StatDisplay icon={DollarSign} label="Buy Price" value={`$${item.price}`} color="text-red-400" />
                                    )}
                                    {item.sell_price && (
                                        <StatDisplay icon={TrendingUp} label="Sell Price" value={`$${item.sell_price}`} color="text-green-400" />
                                    )}
                                    {item.health && (
                                        <StatDisplay icon={Activity} label="Health" value={item.health} subValue="HP" color="text-orange-500" />
                                    )}
                                    {item.slots > 0 && (
                                        <StatDisplay icon={Box} label="Storage" value={item.slots} subValue="Slots" color="text-blue-400" />
                                    )}
                                </div>

                                {item.sell_price && (
                                    <button
                                        onClick={() => setShowNpcSellers(true)}
                                        className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-all uppercase tracking-wide group"
                                    >
                                        <Store size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                                        Locate Sellers
                                    </button>
                                )}
                            </div>

                            {/* Right Column - Info & Crafting */}
                            <div className="space-y-6">
                                {item.description && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Info size={14} className="text-blue-500" />
                                            Overview
                                        </h3>
                                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-gray-300 leading-relaxed font-mono">
                                            {item.description}
                                        </div>
                                    </div>
                                )}

                                {item.use && !item.description && (
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Info size={14} className="text-blue-500" />
                                            Usage
                                        </h3>
                                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-gray-300 leading-relaxed font-mono">
                                            {item.use}
                                        </div>
                                    </div>
                                )}

                                {requirements.length > 0 ? (
                                    <RequirementsList requirements={requirements} />
                                ) : (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm italic">
                                            <Lock size={14} />
                                            <span>No crafting blueprint available.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {showNpcSellers && (
                <NpcSellersModal
                    itemType="basebuilding"
                    itemId={item.id}
                    onClose={() => setShowNpcSellers(false)}
                    onNpcSelect={onNpcSelect}
                />
            )}
        </AnimatePresence>
    )
};

export default BasebuildingDetailModal;
