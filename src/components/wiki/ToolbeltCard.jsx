import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Package, Zap } from 'lucide-react';

const ToolbeltCard = ({ item, index, onClick }) => {
    // Función para obtener los colores basados en la rareza
    const getRarityColor = (rarityName) => {
        const colors = {
            'Common': '#94a3b8',
            'Uncommon': '#22c55e',
            'Rare': '#3b82f6',
            'Epic': '#a855f7',
            'Legendary': '#f59e0b',
            'Mythic': '#ef4444'
        };
        return colors[rarityName] || colors['Common'];
    };

    const rarityName = item.rarity?.name || 'Common';
    const rarityColor = getRarityColor(rarityName);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="relative group cursor-pointer h-full"
        >
            {/* Card Interior */}
            <div className="relative bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:border-red-500/30 group-hover:shadow-[0_20px_50px_-15px_rgba(239,68,68,0.15)] h-full flex flex-col shadow-2xl backdrop-blur-3xl">

                {/* Image Section */}
                <div className="relative h-48 bg-black/40 flex items-center justify-center p-8 overflow-hidden group-hover:bg-black/60 transition-colors">
                    {/* Rarity Aura */}
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 blur-[60px] transition-opacity duration-500"
                        style={{ backgroundColor: rarityColor }}
                    />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {item.image_url ? (
                        <img
                            className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
                            alt={item.name}
                            src={item.image_url}
                        />
                    ) : (
                        <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-red-500/30 transition-colors">
                            <Wrench className="w-12 h-12 text-gray-500 group-hover:text-red-500 transition-colors" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                        {item.inventory_slots > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-blue-500/30 text-blue-500 text-[10px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <Package size={12} />
                                <span>{item.inventory_slots} SLOTS</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-grow flex flex-col relative">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                            <span
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-colors"
                                style={{
                                    borderColor: `${rarityColor}30`,
                                    color: rarityColor,
                                    backgroundColor: `${rarityColor}10`
                                }}
                            >
                                {rarityName}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">ID: {item.id.substring(0, 6)}</span>
                        </div>

                        <h3 className="text-lg font-medium text-white leading-tight uppercase tracking-tight group-hover:text-red-500 transition-colors duration-300">
                            {item.name}
                        </h3>
                    </div>

                    {/* Footer Stats summary if needed */}
                    {item.use_function && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                            <Zap size={14} className="text-yellow-500/50 mt-0.5" />
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight line-clamp-1">{item.use_function}</p>
                        </div>
                    )}
                </div>

                {/* Interactive Bottom Bar */}
                <div className="h-1 bg-red-600/0 group-hover:bg-red-600 transition-all duration-500" />
            </div>
        </motion.div>
    );
};

export default ToolbeltCard;
