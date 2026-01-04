import React from 'react';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';

const KeyCard = ({ item, index, onClick }) => {
    const rarityColor = item.rarity?.color || '#4b5563';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={onClick}
            className="relative overflow-hidden group cursor-pointer h-full bg-gray-900/90 border border-white/10 rounded-2xl"
        >
             {/* Rarity colored border bottom */}
             <div 
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-20"
                style={{ backgroundColor: rarityColor }}
            />

            {/* Background gradient effect */}
            <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(to bottom right, ${rarityColor}40, transparent)`
                }}
            />

            <div className="relative h-40 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                 
                 {item.image_url ? (
                    <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl" 
                    />
                 ) : (
                    <div className="relative z-20 p-4 rounded-2xl bg-white/5 shadow-lg backdrop-blur-sm">
                        <Key className="w-16 h-16 text-gray-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                 )}
                 
                 {/* Hover shine effect */}
                 <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />
            </div>

            <div className="p-6 relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-white transition-colors">
                    {item.name}
                </h3>
                {item.rarity && (
                    <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 border border-white/10"
                        style={{ color: rarityColor, borderColor: `${rarityColor}40` }}
                    >
                        {item.rarity.name}
                    </span>
                )}
            </div>
            
            {/* Outer shadow on hover */}
            <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    boxShadow: `0 10px 40px -10px ${rarityColor}40`
                }}
            />
        </motion.div>
    );
};

export default KeyCard;