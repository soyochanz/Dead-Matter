import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Sparkles, HeartPulse, RefreshCw, Flame, Utensils, Coffee } from 'lucide-react';
import CanOpenerIcon from '@/components/icons/CanOpenerIcon';

const ConsumableCard = ({ consumable, index, onClick }) => {
    if (!consumable) {
        return null;
    }

    // Función para obtener los colores basados en el tipo de consumible
    // Función para obtener los colores basados en la rareza (estilo premium)
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

    const rarityName = consumable.rarity?.name || 'Common';
    const rarityColor = getRarityColor(rarityName);
    const type = consumable.type || 'food';
    const ConsumableIcon = type === 'drink' ? Coffee : Utensils;
    const needsCooking = consumable.type === 'food' && !consumable.is_safe_to_eat_raw;

    // Stats válidos para mostrar
    const validStats = [
        consumable.hydration > 0 && { icon: Droplet, value: consumable.hydration, color: 'text-blue-400', label: 'Hydration' },
        consumable.energy > 0 && { icon: Sparkles, value: consumable.energy, color: 'text-yellow-400', label: 'Energy' },
        consumable.health > 0 && { icon: HeartPulse, value: consumable.health, color: 'text-green-400', label: 'Health' }
    ].filter(Boolean);

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
                <div className="relative h-64 bg-black/40 flex items-center justify-center p-2 overflow-hidden group-hover:bg-black/60 transition-colors">
                    {/* Rarity Aura */}
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 blur-[60px] transition-opacity duration-500"
                        style={{ backgroundColor: rarityColor }}
                    />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {consumable.image_url ? (
                        <div className="w-full h-full flex items-center justify-center p-1">
                            <motion.img
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="relative z-10 max-h-[90%] max-w-[90%] object-contain transition-transform duration-700 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                                alt={consumable.name}
                                src={consumable.image_url}
                            />
                        </div>
                    ) : (
                        <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-red-500/30 transition-colors">
                            <ConsumableIcon className="w-16 h-16 text-gray-500 group-hover:text-red-500 transition-colors" />
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                        {consumable.is_refillable && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-blue-500/30 text-blue-500 text-[9px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <RefreshCw size={10} />
                                <span>REFILLABLE</span>
                            </div>
                        )}
                        {needsCooking && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-red-500/30 text-red-500 text-[9px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <Flame size={10} />
                                <span>UNCOOKED</span>
                            </div>
                        )}
                        {consumable.requires_can_opener && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-yellow-500/30 text-yellow-500 text-[9px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <CanOpenerIcon className="w-2.5 h-2.5" />
                                <span>SEALED</span>
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
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">ID: {consumable.id.substring(0, 6)}</span>
                        </div>

                        <h3 className="text-lg font-medium text-white leading-tight uppercase tracking-tight group-hover:text-red-500 transition-colors duration-300">
                            {consumable.name}
                        </h3>
                    </div>

                    {/* Stats Footer */}
                    <div className="mt-6 flex items-center justify-between pt-5 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                            {validStats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/20 transition-all duration-300" title={stat.label}>
                                    <stat.icon size={12} className={`${stat.color} opacity-80`} />
                                    <span className="text-[10px] font-mono font-bold text-white tracking-widest">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Bottom Bar */}
                <div className="h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left opacity-0 group-hover:opacity-100" />
            </div>

            {/* Efecto de sombra exterior */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    boxShadow: `
                        0 25px 50px -12px ${getShadowColor(type, rarityName)}
                    `
                }}
            />
        </motion.div>
    );
};

// Función auxiliar para obtener colores de sombra
const getShadowColor = (type, rarityName) => {
    const typeColors = {
        'food': 'rgba(245, 158, 11, 0.5)',
        'drink': 'rgba(37, 99, 235, 0.5)'
    };

    const rarityColors = {
        'Common': 'rgba(75, 85, 99, 0.5)',
        'Uncommon': 'rgba(5, 150, 105, 0.5)',
        'Rare': 'rgba(37, 99, 235, 0.5)',
        'Epic': 'rgba(147, 51, 234, 0.5)',
        'Legendary': 'rgba(245, 158, 11, 0.5)',
        'Mythic': 'rgba(239, 68, 68, 0.5)'
    };

    return rarityColors[rarityName] || typeColors[type] || typeColors['food'];
};

export default ConsumableCard;
