import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Weight, Backpack, Swords, Zap, Flame, Droplets, Tally1, Ruler, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';

const Stat = ({ icon: Icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div
        className={`flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/stat-row cursor-default hover:bg-white/10 transition-all duration-300 ${className}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/5 text-gray-500 group-hover/stat-row:text-white transition-colors shadow-inner">
                {Icon && <Icon className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/stat-row:text-gray-400">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold text-white tracking-widest whitespace-nowrap ${colorClass}`}>
            {value}
        </span>
    </div>
);

const CustomStatBar = ({ label, value, max, icon, color }) => {
    const percentage = max > 0 && value > 0 ? (value / max) * 100 : 0;
    const IconComponent = LucideIcons[icon] || null;

    return (
        <div className="group/stat">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover/stat:border-red-500/30 transition-colors">
                        {IconComponent && <IconComponent className="w-4 h-4" style={{ color: color || '#ef4444' }} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/stat:text-gray-300 transition-colors">{label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-bold text-white tracking-widest">
                        {value}
                        <span className="text-[10px] text-gray-500 ml-1 font-sans">/ {max}</span>
                    </span>
                </div>
            </div>
            <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${color || '#ef4444'} 0%, #000 100%)`,
                        boxShadow: `0 0 10px ${color || '#ef4444'}40`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </div>
        </div>
    );
};

const GearDetailModal = ({ gear, onClose, onNpcSelect }) => {
    const { t } = useTranslation();
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    const [viewMode, setViewMode] = useState('static'); // 'static' or '3d'
    const [audio] = useState(gear?.audio_url ? new Audio(gear.audio_url) : null);
    const [isPlaying, setIsPlaying] = useState(false);

    React.useEffect(() => {
        if (audio) {
            audio.onended = () => setIsPlaying(false);
        }
        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        };
    }, [audio]);

    if (!gear) return null;

    const playAudio = (e) => {
        e.stopPropagation();
        if (audio) {
            if (isPlaying) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
            } else {
                audio.play();
                setIsPlaying(true);
            }
        }
    };

    const hasModel = !!gear.model_url;
    const hasAudio = !!gear.audio_url;

    // Función para obtener gradiente basado en rareza
    const getRarityGradient = (rarityName) => {
        const gradients = {
            'Common': 'from-gray-600 to-slate-600',
            'Uncommon': 'from-green-600 to-emerald-600',
            'Rare': 'from-blue-600 to-cyan-600',
            'Epic': 'from-purple-600 to-violet-600',
            'Legendary': 'from-orange-600 to-amber-600',
            'Mythic': 'from-red-600 to-rose-600'
        };
        return gradients[rarityName] || gradients['Common'];
    };

    const rarityGradient = getRarityGradient(gear.rarity?.name);
    const rarityColor = gear.rarity?.color || '#4b5563';

    const weaponSlotText = {
        'small': t('wiki.gear.small_weapon_slot'),
        'large': t('wiki.gear.large_weapon_slot'),
    }[gear.weapon_slot_type];

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
                    className="bg-[#050505] border border-white/5 rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    <div className="p-8 md:p-12 overflow-y-auto relative z-10 flex-grow">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all bg-white/5 p-3 rounded-2xl hover:bg-red-600/20 hover:text-red-500 border border-white/5 z-20"
                        >
                            <X size={24} />
                        </motion.button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left Side - Visuals */}
                            <div className="space-y-8">
                                <div className="relative group/image">
                                    <div className="w-full aspect-square bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden shadow-inner">
                                        {/* Rarity Glow */}
                                        <div className="absolute inset-0 opacity-10 blur-[80px] pointer-events-none" style={{ backgroundColor: rarityColor }} />

                                        {viewMode === '3d' && hasModel ? (
                                            <model-viewer
                                                src={gear.model_url}
                                                alt={gear.name}
                                                auto-rotate
                                                camera-controls
                                                shadow-intensity="0.2"
                                                shadow-softness="1"
                                                exposure="1"
                                                environment-image="neutral"
                                                tone-mapping="neutral"
                                                render-scale="2"
                                                field-of-view="35deg"
                                                interaction-prompt="none"
                                                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                                                className="relative z-10"
                                            ></model-viewer>
                                        ) : (
                                            <motion.img
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.8 }}
                                                src={gear.image_url}
                                                alt={gear.name}
                                                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]"
                                            />
                                        )}
                                    </div>

                                    {/* View Toggles & Technical Labels */}
                                    <div className="absolute bottom-6 right-8 left-8 flex items-center justify-between z-20">
                                        <div className="flex items-center gap-4">
                                            {/* 2D/3D Toggle if model exists */}
                                            {hasModel && (
                                                <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1 border border-white/5">
                                                    <button
                                                        onClick={() => setViewMode('static')}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'static' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                                                    >
                                                        2D
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode('3d')}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-gray-500 hover:text-white'}`}
                                                    >
                                                        3D
                                                    </button>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]" />
                                                <span className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest">
                                                    {viewMode === '3d' ? "3D Visual" : t('wiki.weapon.visual_confirm')}
                                                </span>
                                            </div>
                                        </div>

                                        {hasAudio && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={playAudio}
                                                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-500 font-black uppercase tracking-widest text-[10px] shadow-lg backdrop-blur-md ${isPlaying
                                                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse'
                                                    : 'bg-black/60 border-white/5 text-gray-400 hover:text-white hover:border-red-500/50'
                                                    }`}
                                            >
                                                <LucideIcons.Volume2 size={16} />
                                                <span>{isPlaying ? t('wiki.weapon.playing_sfx') : t('wiki.weapon.play_sfx')}</span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Secondary Technical Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Stat icon={DollarSign} label={t('wiki.common.market_value')} value={`${gear.price || 0} $`} colorClass="text-red-500" className="border-red-500/10 hover:border-red-500/40" onClick={() => setShowNpcSellers(true)} />
                                    <Stat icon={TrendingUp} label={t('wiki.common.resale_factor')} value={`${gear.sell_price || 'N/A'} $`} colorClass="text-green-500" />
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
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg border border-red-500/20" style={{ backgroundColor: `${rarityColor}20`, color: rarityColor }}>
                                            {gear.rarity?.name || 'COMMON'} {t('wiki.common.grade')}
                                        </span>
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase bg-white/5 text-gray-500 border border-white/5">
                                            {t('wiki.common.class')}: {gear.subcategory?.name || 'N/A'}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-5xl md:text-6xl font-semibold text-white uppercase tracking-tighter mb-4 leading-none">
                                        {gear.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                        ))}
                                    </h2>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2">
                                        {gear.description}
                                    </p>

                                    {/* Technical Specs Grid */}
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <Shield size={80} className="text-red-500" />
                                        </div>


                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Stat icon={Shield} label={t('wiki.gear.stats.armor_rating')} value={gear.armor_rating || 0} colorClass="text-blue-400" />
                                            <Stat icon={Zap} label={t('wiki.gear.stats.insulation')} value={gear.insulation || 0} colorClass="text-purple-400" />
                                            <Stat icon={Droplets} label={t('wiki.gear.stats.bleed_prot')} value={gear.bleed_protection || 0} colorClass="text-red-400" />
                                            <Stat icon={Tally1} label={t('wiki.gear.stats.blunt_prot')} value={gear.blunt_protection || 0} colorClass="text-yellow-400" />
                                            <Stat icon={Flame} label={t('wiki.gear.stats.fire_prot')} value={gear.fire_protection || 0} colorClass="text-orange-400" />
                                            <Stat icon={Backpack} label={t('wiki.gear.stats.inv_slots')} value={gear.inventory_slots || 0} colorClass="text-cyan-400" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <Stat icon={Weight} label={t('wiki.common.weight')} value={`${gear.weight || 0} kg`} />
                                            <Stat icon={Ruler} label={t('wiki.common.frame')} value={gear.size || 'N/A'} />
                                        </div>

                                        {/* Custom Stats if any */}
                                        {gear.stats && gear.stats.length > 0 && (
                                            <div className="space-y-6 pt-6 border-t border-white/5">
                                                {gear.stats.map(stat => (
                                                    <CustomStatBar key={stat.label} label={stat.label} value={stat.value} max={stat.max} icon={stat.icon} color={stat.color} />
                                                ))}
                                            </div>
                                        )}
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

            {/* Modal de vendedores NPC */}
            {showNpcSellers && (
                <NpcSellersModal
                    itemType="gear"
                    itemId={gear.id}
                    onClose={() => setShowNpcSellers(false)}
                    onNpcSelect={onNpcSelect}
                />
            )}
        </AnimatePresence>
    );
};

export default GearDetailModal;
