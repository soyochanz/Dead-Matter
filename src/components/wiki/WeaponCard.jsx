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
            whileHover={{ y: -8 }}
            transition={{ duration: 0.5, delay: index * 0.03 }}
            onClick={onClick}
            className="group relative cursor-pointer"
        >
            {/* Background Glow Aura */}
            <div className={`absolute -inset-[1px] rounded-[2.5rem] opacity-0 group-hover:opacity-40 blur-2xl transition-all duration-700 ${style.bgGlow}`} />

            {/* Content Container */}
            <div className={`relative h-full bg-[#08080a] rounded-[2.2rem] border border-white/5 overflow-hidden transition-all duration-500 group-hover:border-white/20 shadow-2xl`}>
                
                {/* Technical Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner Brackets */}
                    <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-white/10 group-hover:border-white/30 transition-colors" />
                    <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-white/10 group-hover:border-white/30 transition-colors" />
                    
                    {/* Scanner Line Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-[1px] w-full animate-pulse top-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
                </div>

                <div className="relative flex flex-col h-full pt-8">
                    {/* Primary Image Display */}
                    <div className="relative h-60 w-full flex items-center justify-center p-8 group-hover:p-6 transition-all duration-700 overflow-hidden">
                        {/* Blueprint Radial Glow */}
                        <div className={`absolute w-48 h-48 rounded-full blur-[60px] opacity-30 group-hover:opacity-60 transition-all duration-1000 ${style.bgGlow}`} />
                        
                        {/* Vertical Spotlight Beam */}
                        <div className="absolute bottom-0 w-40 h-full bg-gradient-to-t from-white/[0.08] via-white/[0.03] to-transparent blur-2xl" />
                        
                        {/* Inner Lighting Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,255,255,0.1),transparent_60%)] opacity-50" />

                        {weapon.image_url ? (
                            <motion.img
                                src={weapon.image_url}
                                alt={weapon.name}
                                whileHover={{ scale: 1.15, rotate: -3 }}
                                transition={{ type: "spring", stiffness: 150, damping: 15 }}
                                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] z-10"
                            />
                        ) : (
                            <div className="text-white/5 relative z-10">
                                {isMelee ? <Sword size={80} strokeWidth={1} /> : <Target size={80} strokeWidth={1} />}
                            </div>
                        )}
                    </div>

                    {/* Bottom Info Section */}
                    <div className="px-8 pb-8 mt-auto space-y-6 relative z-10">
                        {/* Rarity & Ammo Row */}
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full border border-white/5 bg-black/60 shadow-inner flex items-center gap-2`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${style.shadowPulse} ${style.text} animate-pulse`} />
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${style.text}`}>{rarity}</span>
                            </div>
                            {!isMelee && weapon.ammo && (
                                <div className="px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] flex items-center gap-2">
                                    <Zap size={10} className="text-blue-500" />
                                    <span className="text-[9px] font-bold text-gray-400 font-mono tracking-tight">{weapon.ammo}</span>
                                </div>
                            )}
                        </div>

                        {/* Title & Stats */}
                        <div className="min-h-[140px] flex flex-col">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-[0.9] group-hover:text-red-500 transition-colors duration-500 mb-6 whitespace-pre-line">
                                {weapon.name}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5 mt-auto">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{isMelee ? 'Impact' : 'Lethality'}</span>
                                        <span className="text-[11px] font-bold text-white/80">{weapon.damage || '0'}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(weapon.damage || 0, 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-red-600 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{isMelee ? 'Reach' : 'Rate of Fire'}</span>
                                        <span className="text-[11px] font-bold text-white/80">{isMelee ? (weapon.melee_range || 0) : (weapon.rate_of_fire || 0)}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((isMelee ? (weapon.melee_range || 0) * 10 : (weapon.rate_of_fire || 0)), 100)}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-blue-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Left Active Edge Indicator */}
                    <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-1 h-32 rounded-r-full transition-all duration-700 opacity-20 group-hover:opacity-100 group-hover:h-full ${style.bgGlow}`} />
                </div>
            </div>
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
