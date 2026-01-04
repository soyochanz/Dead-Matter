import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Zap, Target, ArrowRight } from 'lucide-react';

const WeaponCard = ({ weapon, index, onClick }) => {
    const isMelee = weapon.subcategory?.name?.toLowerCase().includes('melee');

    const getRarityStyles = (rarityName) => {
        const styles = {
            'Common': { color: 'gray', from: 'from-gray-500/20', to: 'to-slate-600/20', border: 'border-gray-500/20', hoverBorder: 'group-hover:border-gray-500/50', text: 'text-gray-400', glow: 'shadow-gray-500/10', accent: 'via-gray-500/50', bgGlow: 'bg-gray-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(107,114,128,0.5)]' },
            'Uncommon': { color: 'emerald', from: 'from-emerald-500/20', to: 'to-green-600/20', border: 'border-emerald-500/20', hoverBorder: 'group-hover:border-emerald-500/50', text: 'text-emerald-400', glow: 'shadow-emerald-500/10', accent: 'via-emerald-500/50', bgGlow: 'bg-emerald-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
            'Rare': { color: 'blue', from: 'from-blue-500/20', to: 'to-cyan-600/20', border: 'border-blue-500/20', hoverBorder: 'group-hover:border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/10', accent: 'via-blue-500/50', bgGlow: 'bg-blue-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
            'Epic': { color: 'purple', from: 'from-purple-500/20', to: 'to-violet-600/20', border: 'border-purple-500/20', hoverBorder: 'group-hover:border-purple-500/50', text: 'text-purple-400', glow: 'shadow-purple-500/10', accent: 'via-purple-500/50', bgGlow: 'bg-purple-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
            'Legendary': { color: 'orange', from: 'from-orange-500/20', to: 'to-amber-600/20', border: 'border-orange-500/20', hoverBorder: 'group-hover:border-orange-500/50', text: 'text-orange-400', glow: 'shadow-orange-500/10', accent: 'via-orange-500/50', bgGlow: 'bg-orange-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
            'Mythic': { color: 'red', from: 'from-red-500/20', to: 'to-rose-600/20', border: 'border-red-500/20', hoverBorder: 'group-hover:border-red-500/50', text: 'text-red-400', glow: 'shadow-red-500/10', accent: 'via-red-500/50', bgGlow: 'bg-red-500/20', shadowPulse: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]' }
        };
        return styles[rarityName] || styles['Common'];
    };

    const rarity = weapon.rarity?.name || 'Common';
    const style = getRarityStyles(rarity);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            {/* Background Layer with Scanlines */}
            <div className={`absolute inset-0 bg-[#0a0a0c] rounded-3xl border border-white/5 transition-all duration-500 ${style.hoverBorder} group-hover:${style.glow} overflow-hidden`}>
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                <div className={`absolute inset-0 bg-gradient-to-br ${style.from} ${style.to} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            </div>

            <div className="relative p-1">
                {/* Image Container */}
                <div className="relative h-56 w-full flex items-center justify-center p-8 bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-[1.4rem] overflow-hidden">
                    {/* Subtle Glow Behind Item */}
                    <div className={`absolute w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${style.bgGlow}`} />

                    {weapon.image_url ? (
                        <motion.img
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            src={weapon.image_url}
                            alt={weapon.name}
                            className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                        />
                    ) : (
                        <div className={`relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 transition-colors ${style.hoverBorder}`}>
                            {isMelee ? <Sword className={`w-12 h-12 ${style.text}`} /> : <Target className={`w-12 h-12 ${style.text}`} />}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                    {/* Metadata Row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className={`px-2.5 py-1 rounded-md bg-white/5 border border-white/5 flex items-center gap-1.5`}>
                            <div className={`w-1.5 h-1.5 rounded-full bg-current ${style.text} ${style.shadowPulse} animate-pulse`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${style.text}`}>{rarity}</span>
                        </div>
                        {weapon.caliber && (
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-sm">
                                {weapon.caliber}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-red-500 transition-colors line-clamp-2 min-h-[3.5rem] tracking-tight">
                        {weapon.name}
                    </h3>

                    {/* Technical Stats */}
                    <div className="grid grid-cols-1 gap-2 pt-4 border-t border-white/5">
                        {isMelee ? (
                            weapon.damage > 0 && (
                                <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-red-500/20 transition-all">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Impact</span>
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} className="text-yellow-500" />
                                        <span className="text-sm font-black text-white">{weapon.damage} <span className="text-[10px] text-gray-500">DMG</span></span>
                                    </div>
                                </div>
                            )
                        ) : (
                            weapon.ammo && (
                                <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-blue-500/20 transition-all">
                                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Ammo</span>
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-blue-500" />
                                        <span className="text-sm font-black text-white">{weapon.ammo}</span>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Accent Border Bottom */}
            <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent ${style.accent} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700`} />

        </motion.div>
    );
};

// Función auxiliar para obtener colores de sombra
const getShadowColor = (rarityName) => {
    const shadowColors = {
        'Common': 'rgba(75, 85, 99, 0.5)',
        'Uncommon': 'rgba(5, 150, 105, 0.5)',
        'Rare': 'rgba(37, 99, 235, 0.5)',
        'Epic': 'rgba(147, 51, 234, 0.5)',
        'Legendary': 'rgba(245, 158, 11, 0.5)',
        'Mythic': 'rgba(239, 68, 68, 0.5)'
    };

    return shadowColors[rarityName] || shadowColors['Common'];
};

export default WeaponCard;
