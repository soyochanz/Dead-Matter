import React from 'react';
import { motion } from 'framer-motion';
import { Hammer, Tent, TrendingUp, Box, Info } from 'lucide-react';

const BasebuildingCard = ({ item, index, onClick }) => {
    const isCraftable = item.requirements && item.requirements.length > 0;
    const isTent = item.category === 'Tents';
    const rarityColor = item.rarity?.color || '#9ca3af'; // Default to gray for common/null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={onClick}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-red-500/50"
            style={{ borderBottom: `4px solid ${rarityColor}` }}
        >
            <div className="h-40 bg-black/20 flex items-center justify-center p-4 relative">
                {item.image_url ? (
                    <img 
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        alt={item.name}
                        src={item.image_url} 
                    />
                ) : (
                    <div className="w-20 h-20 text-gray-500 flex items-center justify-center">?</div>
                )}
                 {isCraftable && (
                    <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full" title="Craftable">
                        <Hammer size={16} className="text-amber-400" />
                    </div>
                )}
                {isTent && (
                     <div className={`absolute top-2 ${isCraftable ? 'right-10' : 'right-2'} bg-black/50 p-1.5 rounded-full`} title="Tent">
                        <Tent size={16} className="text-green-400" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>

                {(item.slots && item.slots > 0) ? (
                    <div className="flex items-center gap-2 text-xs text-blue-300 mt-2">
                        <Box size={14} className="flex-shrink-0 text-blue-400" />
                        <p className="line-clamp-1">{item.slots} Slots</p>
                    </div>
                ) : item.use ? (
                     <div className="flex items-start gap-2 text-xs text-amber-300 mt-2">
                        <Info size={14} className="flex-shrink-0 mt-px text-amber-400" />
                        <p className="line-clamp-1">{item.use}</p>
                    </div>
                ) : null}

                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold" style={{color: rarityColor}}>{item.rarity?.name || 'Common'}</span>
                    {item.sell_price && (
                         <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full" title="Sell Price">
                            <TrendingUp size={12} />
                            ${item.sell_price}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default BasebuildingCard;