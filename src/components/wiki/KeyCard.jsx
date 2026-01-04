import React from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';

const KeyCard = ({ item, index, onClick }) => {
    const rarityColor = item.rarity?.color || '#4b5563';

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

            {/* Subtle Gradient Glow (Reduced) */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${rarityColor}, transparent 70%)`
                }}
            />

            <div className="relative h-40 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
                {/* Technical Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                    />
                ) : (
                    <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/5">
                        <Key className="w-12 h-12 text-gray-600 group-hover:text-gray-400 transition-colors" strokeWidth={1.5} />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/5 relative z-10">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors tracking-tight leading-snug">
                        {item.name}
                    </h3>
                    {item.rarity && (
                        <div
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                            style={{ backgroundColor: rarityColor }}
                        />
                    )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 font-mono uppercase tracking-wider">
                    <span>Key Item</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                        View Data
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default KeyCard;
