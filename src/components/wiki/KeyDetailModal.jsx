import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, DollarSign, TrendingUp, MapPin, ArrowRight, DoorOpen } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

const KeyDetailModal = ({ item, onClose, onNpcSelect }) => {
    const [doors, setDoors] = useState([]);
    const [selectedDoorImage, setSelectedDoorImage] = useState(null);
    const [showNpcSellers, setShowNpcSellers] = useState(false);

    useEffect(() => {
        const fetchDoors = async () => {
            const { data } = await supabase.from('key_doors').select('*').eq('key_id', item.id);
            setDoors(data || []);
        };
        fetchDoors();
    }, [item.id]);

    if (!item) return null;

    const rarityColor = item.rarity?.color || '#4b5563';

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
                    className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
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
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                                {item.name.split(' ').map((word, i) => (
                                    <span key={i} className={i === 0 ? "text-white" : "text-white/60"}>
                                        {word} {' '}
                                    </span>
                                ))}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/5 uppercase tracking-wider">
                                    Keycard ID: {item.id.slice(0, 8)}
                                </span>
                                {item.rarity && (
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                                        style={{ color: rarityColor, borderColor: `${rarityColor}40`, backgroundColor: `${rarityColor}10` }}
                                    >
                                        {item.rarity.name}
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
                                    {item.image_url ?
                                        <motion.img
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            src={item.image_url}
                                            alt={item.name}
                                            className="max-h-full max-w-full object-contain drop-shadow-2xl relative z-10"
                                        /> :
                                        <Key className="w-32 h-32 text-gray-700 relative z-10" />
                                    }
                                    {/* Scanline */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] w-full animate-scan pointer-events-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowNpcSellers(true)}
                                        className="col-span-1 bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-green-500/30 hover:bg-green-500/5 transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-green-500/10 text-green-500">
                                                <DollarSign size={14} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 group-hover:text-green-400">Buy</span>
                                        </div>
                                        <span className="font-bold text-white text-sm">${item.price || '-'}</span>
                                    </button>
                                    <div className="col-span-1 bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-blue-500/10 text-blue-500">
                                                <TrendingUp size={14} />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400">Sell</span>
                                        </div>
                                        <span className="font-bold text-white text-sm">${item.sell_price || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Info & Locations */}
                            <div className="space-y-6">
                                {/* Spawn Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <MapPin size={14} className="text-red-500" />
                                        Location Data
                                    </h3>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-gray-300 leading-relaxed font-mono">
                                        {item.spawn_locations || 'No specific location data available.'}
                                    </div>
                                </div>

                                {/* Doors Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <DoorOpen size={14} className="text-purple-500" />
                                            Target Access
                                        </h3>
                                        <span className="text-[10px] font-mono text-gray-500">{doors.length} TARGETS FOUND</span>
                                    </div>

                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                        {doors.length > 0 ? (
                                            doors.map(d => (
                                                <div
                                                    key={d.id}
                                                    onClick={() => d.door_image_url && setSelectedDoorImage(d.door_image_url)}
                                                    className={`group w-full text-left p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-between transition-all ${d.door_image_url ? 'hover:bg-white/5 hover:border-white/10 cursor-pointer' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 group-hover:bg-purple-400 transition-colors" />
                                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                                                            {d.door_description}
                                                        </span>
                                                    </div>
                                                    {d.door_image_url && (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-white/40 group-hover:text-purple-400 transition-colors bg-white/5 px-2 py-1 rounded">
                                                            IMG <ArrowRight size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl text-xs text-gray-600 font-mono">
                                                NO ACCESS DATA AVAILABLE
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Door Image Dialog */}
            <Dialog open={!!selectedDoorImage} onOpenChange={() => setSelectedDoorImage(null)}>
                <DialogContent className="p-0 bg-transparent border-none max-w-5xl w-auto h-auto shadow-2xl overflow-hidden flex items-center justify-center outline-none">
                    {selectedDoorImage && (
                        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/90">
                            <img src={selectedDoorImage} alt="Door Location" className="max-w-[90vw] max-h-[85vh] object-contain" />
                            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                            <button
                                onClick={() => setSelectedDoorImage(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-white/20 transition-colors border border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {showNpcSellers && <NpcSellersModal itemType="keys" itemId={item.id} onClose={() => setShowNpcSellers(false)} onNpcSelect={onNpcSelect} />}
        </AnimatePresence>
    )
};

export default KeyDetailModal;
