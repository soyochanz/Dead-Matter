import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Weight, Backpack, Swords, Zap, Flame, Droplets, Tally1, Ruler, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import Wiki3DViewer from './Wiki3DViewer';

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
    const modelViewerRef = React.useRef(null);

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
    const rarityColor = gear.rarity?.color || '#4b5563';

    const handleNpcSelect = (npc) => {
        onNpcSelect(npc);
    };

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
                    className="bg-[#050505] border border-white/5 rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    <div className="p-8 md:p-12 overflow-y-auto relative z-10 custom-scrollbar">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all bg-white/5 p-3 rounded-2xl hover:bg-red-600/20 hover:text-red-500 border border-white/5 z-20"
                        >
                            <X size={24} />
                        </motion.button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            {/* Left Column - Visuals */}
                            <div className="space-y-8">
                                <div className="relative group/image">
                                    <div className="w-full aspect-square bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden shadow-inner">
                                        {/* Rarity Glow */}
                                        <div className="absolute inset-0 opacity-10 blur-[80px] pointer-events-none" style={{ backgroundColor: rarityColor }} />

                                        {viewMode === '3d' && hasModel ? (
                                            <Wiki3DViewer
                                                src={gear.model_url}
                                                alt={gear.name}
                                                exposure={gear.name === 'School Backpack' ? 3 : 1}
                                            />
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

                                        {gear.audio_url && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={playAudio}
                                                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${isPlaying ? 'bg-red-600 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <LucideIcons.Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {isPlaying ? t('wiki.weapon.playing_sfx') : t('wiki.weapon.play_sfx')}
                                                </span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Stat icon={DollarSign} label={t('wiki.common.market_value')} value={`${gear.price || 0} $`} colorClass="text-red-500" className="border-red-500/10 hover:border-red-500/40 shadow-lg" onClick={() => setShowNpcSellers(true)} />
                                    <Stat icon={TrendingUp} label={t('wiki.common.resale_factor')} value={`${gear.sell_price || 'N/A'} $`} colorClass="text-green-500" />
                                </div>
                            </div>

                            {/* Right Column - Intelligence */}
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
                                            CAT: {gear.subcategory?.name.toUpperCase() || 'CLASSIFIED'}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                        {gear.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                        ))}
                                    </h2>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2">
                                        {gear.description || "Experimental survival infrastructure engineered for extreme environmental conditions and storage capability."}
                                    </p>

                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-inner relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                            <Backpack size={100} className="text-red-500" />
                                        </div>

                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/50 mb-6 flex items-center gap-3">
                                            <div className="w-8 h-px bg-red-500/20" /> {t('wiki.weapon.performance_analysis')}
                                        </h4>

                                        <div className="space-y-6">
                                            <CustomStatBar icon="Weight" label={t('wiki.common.weight')} value={gear.weight || 0} max={100} color="#f59e0b" />
                                            <CustomStatBar icon="Ruler" label={t('wiki.common.size')} value={gear.inventory_slots || 0} max={100} color="#3b82f6" />
                                            <div className="grid grid-cols-2 gap-4 mt-8">
                                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">{t('wiki.gear.armor_value')}</span>
                                                    <span className="text-xl font-mono font-black text-white">{gear.armor_value || 0}</span>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col gap-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">{t('wiki.gear.slots')}</span>
                                                    <span className="text-xl font-mono font-black text-white">{gear.inventory_slots || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aesthetic Accents */}
                    <div className="h-2 bg-[#0a0a0c] border-t border-white/5 flex">
                        <div className="w-1/3 h-full bg-red-600" />
                        <div className="w-2/3 h-full flex justify-between px-6">
                            {[...Array(15)].map((_, i) => (
                                <div key={i} className="w-px h-full bg-white/[0.03]" />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {showNpcSellers && (
                <NpcSellersModal
                    itemType="gear"
                    itemId={gear.id}
                    onClose={() => setShowNpcSellers(false)}
                    onNpcSelect={handleNpcSelect}
                />
            )}
        </AnimatePresence>
    );
};

export default GearDetailModal;
