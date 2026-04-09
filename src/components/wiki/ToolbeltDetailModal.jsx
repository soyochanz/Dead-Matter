import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Weight, Ruler, Package, Cog, DollarSign, TrendingUp, Zap } from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import { useNavigate } from 'react-router-dom';

const StatDisplay = ({ icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div
        className={`flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/stat-row cursor-default hover:bg-white/10 transition-all duration-300 ${className}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/5 text-gray-500 group-hover/stat-row:text-white transition-colors shadow-inner">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/stat-row:text-gray-400">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold text-white tracking-widest whitespace-nowrap ${colorClass}`}>
            {value}
        </span>
    </div>
);

const ToolbeltDetailModal = ({ item, onClose }) => {
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    const navigate = useNavigate();

    if (!item) return null;

    const handleNpcSelect = (npc) => {
        navigate('/wiki/npcs', { state: { openNpcId: npc.id } });
    };

    const rarityColor = item.rarity?.color || '#4b5563';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Background Noise/Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <motion.div
                    initial={{ scale: 0.9, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 50, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-[#050505] border border-white/5 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    <div className="p-8 md:p-12 overflow-y-auto relative z-10 flex-grow">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-8 right-8 text-gray-500 transition-all bg-white/5 p-3 rounded-2xl hover:bg-red-600/20 hover:text-red-500 border border-white/5 z-20"
                        >
                            <X size={24} />
                        </motion.button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left Side - Visuals */}
                            <div className="space-y-8">
                                <div className="relative group/image">
                                    <div className="w-full aspect-square bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden shadow-inner">
                                        {/* Background Decoration */}
                                        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center rotate-45">
                                            <Zap size={200} className="text-white" />
                                        </div>

                                            <motion.img
                                                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.6 }}
                                                src={item.image_url}
                                                alt={item.name}
                                                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]"
                                            />
                                    </div>
                                </div>

                                {/* Secondary Specs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <StatDisplay icon={<DollarSign size={16} />} label="Market Value" value={`${item.price || 0} $`} colorClass="text-red-500" className="border-red-500/10 hover:border-red-500/40" onClick={() => setShowNpcSellers(true)} />
                                    <StatDisplay icon={<TrendingUp size={16} />} label="Resale Factor" value={`${item.sell_price || 'N/A'} $`} colorClass="text-green-500" />
                                </div>
                            </div>

                            {/* Right Side - Intelligence */}
                            <div className="space-y-8">
                                <div>
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center gap-2 mb-4"
                                    >
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg border border-red-500/20 bg-red-500/10 text-red-500">
                                            TOOLBELT
                                        </span>
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase bg-white/5 text-gray-500 border border-white/5">
                                            ID: {item.id.substring(0, 8).toUpperCase()}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-5xl md:text-6xl font-semibold text-white uppercase tracking-tighter mb-4 leading-none">
                                        {item.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                        ))}
                                    </h2>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2">
                                        {item.description || "Experimental survival gear engineered for utility efficiency and storage optimization in hostile environments."}
                                    </p>

                                    {/* Specifications Grid */}
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-inner relative overflow-hidden">
                                        <div className="grid grid-cols-1 gap-4">
                                            <StatDisplay icon={<Weight size={16} />} label="Weight" value={`${item.weight || 0} kg`} />
                                            <StatDisplay icon={<Ruler size={16} />} label="Operational Size" value={item.size || 'N/A'} />
                                            {item.inventory_slots > 0 && (
                                                <StatDisplay icon={<Package size={16} />} label="Expansion Slots" value={`${item.inventory_slots}`} colorClass="text-cyan-400" />
                                            )}
                                            {item.use_function && (
                                                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                                                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2 flex items-center gap-2">
                                                        <Cog size={14} /> Core Functionality
                                                    </span>
                                                    <p className="text-sm font-medium text-gray-300 leading-relaxed italic">
                                                        "{item.use_function}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
            {showNpcSellers && (
                <NpcSellersModal
                    itemType="toolbelts"
                    itemId={item.id}
                    onClose={() => setShowNpcSellers(false)}
                    onNpcSelect={handleNpcSelect}
                />
            )}
        </AnimatePresence>
    );
};

export default ToolbeltDetailModal;
