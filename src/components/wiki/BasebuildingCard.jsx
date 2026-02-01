import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Tent, TrendingUp, Box, Info, ArrowRight } from 'lucide-react';

const BasebuildingCard = ({ item, index, onClick, showDeployed }) => {

    // Safely access properties
    const rarityColor = item.rarity?.color || '#9ca3af'; // Default gray
    const isCraftable = item.is_craftable;

    // Use generic tent icon if no image
    const isTent = item.category === 'Tents' || item.subcategory?.name?.toLowerCase().includes('tent');
    const Icon = item.subcategory?.name?.toLowerCase().includes('storage') ? Box : Tent;

    // Deployed image logic
    const hasPackedVariant = !!item.packed_image_url;
    const currentImage = (showDeployed && hasPackedVariant) ? item.image_url : (item.packed_image_url || item.image_url);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            className="group relative h-full bg-[#0a0a0c] border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-colors duration-300"
        >
            {/* Rarity Line */}
            <div
                className="absolute top-0 left-0 w-full h-[1px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: rarityColor }}
            />

            {/* Subtle Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${rarityColor}, transparent 70%)`
                }}
            />

            <div className="relative h-44 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
                {/* Technical Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={item.name}
                        className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                    />
                ) : (
                    <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/5">
                        <Icon className="w-12 h-12 text-gray-600 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 z-20 flex justify-between">
                    {item.subcategory && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 uppercase tracking-wider">
                            {item.subcategory.name}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-white/5 relative z-10 flex flex-col h-[calc(100%-11rem)]">
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors tracking-tight leading-snug line-clamp-2">
                            {item.name}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {isCraftable && (
                            <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/5 px-2 py-1 rounded border border-orange-500/10">
                                <Hammer size={12} />
                                <span className="font-medium">Craftable</span>
                            </div>
                        )}
                        {item.sell_price && (
                            <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">
                                <TrendingUp size={12} />
                                <span className="font-medium">${item.sell_price}</span>
                            </div>
                        )}
                        {item.slots > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 col-span-2">
                                <Box size={12} />
                                <span className="font-medium">Storage: {item.slots} Slots</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <span>Base Module</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-400">
                        View Specs <ArrowRight size={10} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BasebuildingCard;
