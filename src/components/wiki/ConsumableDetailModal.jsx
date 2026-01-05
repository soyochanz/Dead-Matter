import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Sparkles, HeartPulse, ShieldAlert, Flame, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import CanOpenerIcon from '@/components/icons/CanOpenerIcon';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import { useNavigate } from 'react-router-dom';

const StatDisplay = ({ icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div
        className={`flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/stat-row cursor-default hover:bg-white/10 transition-all duration-300 ${className}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#0a0a0c] border border-white/5 text-gray-500 group-hover/stat-row:text-white transition-colors shadow-inner">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/stat-row:text-gray-400">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold text-white tracking-widest whitespace-nowrap ${colorClass}`}>
            {value}
        </span>
    </div>
);

const CookButton = ({ onCook }) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const intervalRef = useRef(null);

    const handleInteractionStart = () => {
        if (timerRef.current) return;
        timerRef.current = setTimeout(() => {
            onCook();
            reset();
        }, 3000);
        intervalRef.current = setInterval(() => {
            setProgress(p => Math.min(p + 100 / (3000 / 30), 100));
        }, 30);
    };

    const handleInteractionEnd = () => {
        reset();
    };

    const reset = () => {
        clearTimeout(timerRef.current);
        clearInterval(intervalRef.current);
        timerRef.current = null;
        intervalRef.current = null;
        setProgress(0);
    };

    return (
        <div className="relative flex flex-col items-center">
            <button
                onMouseDown={handleInteractionStart}
                onMouseUp={handleInteractionEnd}
                onMouseLeave={handleInteractionEnd}
                onTouchStart={handleInteractionStart}
                onTouchEnd={handleInteractionEnd}
                className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-orange-500 hover:bg-gray-700 active:bg-orange-900 transition-colors select-none"
            >
                <Flame size={48} />
            </button>
            <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50" />
                    <motion.circle
                        className="text-red-500"
                        strokeWidth="4"
                        strokeDasharray="301.59"
                        strokeDashoffset={301.59}
                        stroke="currentColor"
                        fill="transparent"
                        r="48"
                        cx="50"
                        cy="50"
                        style={{ strokeLinecap: 'round', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        animate={{ strokeDashoffset: 301.59 - (progress / 100) * 301.59 }}
                        transition={{ duration: 0.05, ease: 'linear' }}
                    />
                </svg>
            </div>
            <p className="text-sm text-gray-400 mt-2">{t('wiki.consumable.hold_to_cook')}</p>
        </div>
    )
}

const ConsumableDetailModal = ({ consumable, onClose }) => {
    const { t } = useTranslation();
    const [currentItem, setCurrentItem] = useState(consumable);
    const [isCooked, setIsCooked] = useState(false);
    const [cookedVersion, setCookedVersion] = useState(null);
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setCurrentItem(consumable);
        setIsCooked(false);
        setCookedVersion(null);

        const fetchCookedVersion = async () => {
            if (consumable.cooked_version_id) {
                const { data } = await supabase.from('consumables').select('*').eq('id', consumable.cooked_version_id).single();
                setCookedVersion(data);
            }
        };
        fetchCookedVersion();
    }, [consumable]);

    const handleCook = () => {
        if (cookedVersion) {
            setCurrentItem(cookedVersion);
            setIsCooked(true);
        }
    };

    const handleNpcSelect = (npc) => {
        navigate('/wiki/npcs', { state: { openNpcId: npc.id } });
    };

    const hasSideEffects = currentItem.side_effects && Object.keys(currentItem.side_effects).length > 0;

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
                    className="bg-[#050505] border border-white/5 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col"
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
                                        {/* Background Decoration */}
                                        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center rotate-45">
                                            <Sparkles size={200} className="text-white" />
                                        </div>

                                        <motion.img
                                            key={currentItem.id}
                                            initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.6 }}
                                            src={currentItem.image_url}
                                            alt={currentItem.name}
                                            className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]"
                                        />
                                    </div>
                                </div>

                                {cookedVersion && !isCooked && (
                                    <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4 border-dashed">
                                        <CookButton onCook={handleCook} />
                                    </div>
                                )}

                                {/* Secondary Specs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <StatDisplay icon={<DollarSign size={16} />} label={t('wiki.common.market_value')} value={`${currentItem.price || 0} $`} colorClass="text-red-500" className="border-red-500/10 hover:border-red-500/40" onClick={() => setShowNpcSellers(true)} />
                                    <StatDisplay icon={<TrendingUp size={16} />} label={t('wiki.common.resale_factor')} value={`${currentItem.sell_price || 'N/A'} $`} colorClass="text-green-500" />
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
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg border border-red-500/20 bg-red-500/10 text-red-500">
                                            {t('wiki.consumable.consumable_label')}
                                        </span>
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase bg-white/5 text-gray-500 border border-white/5">
                                            {t('wiki.consumable.type')}: {currentItem.type?.toUpperCase() || 'N/A'}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-5xl md:text-6xl font-semibold text-white uppercase tracking-tighter mb-4 leading-none">
                                        {currentItem.name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                        ))}
                                    </h2>

                                    <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2">
                                        {currentItem.description}
                                    </p>

                                    {/* Nutritional & Effect Grid */}
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-inner relative overflow-hidden">

                                        <div className="grid grid-cols-1 gap-4">
                                            <StatDisplay icon={<Droplet size={16} className="text-blue-400" />} label={t('wiki.consumable.stats.hydration')} value={currentItem.hydration || 0} colorClass={currentItem.hydration >= 0 ? 'text-blue-400' : 'text-red-400'} />
                                            <StatDisplay icon={<Sparkles size={16} className="text-yellow-400" />} label={t('wiki.consumable.stats.energy')} value={currentItem.energy || 0} colorClass={currentItem.energy >= 0 ? 'text-yellow-400' : 'text-red-400'} />
                                            <StatDisplay icon={<HeartPulse size={16} className="text-green-400" />} label={t('wiki.consumable.stats.health')} value={currentItem.health || 0} colorClass={currentItem.health >= 0 ? 'text-green-400' : 'text-red-400'} />
                                        </div>

                                        {hasSideEffects && (
                                            <div className="space-y-4 pt-6 border-t border-white/5">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-yellow-500" /> {t('wiki.consumable.toxicity_side_effects')}
                                                </h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(currentItem.side_effects).map(([key, value]) => (
                                                        <div key={key} className="p-3 rounded-xl bg-black/40 border border-white/5">
                                                            <span className="text-[10px] font-black uppercase text-yellow-500 tracking-widest block mb-1">{key}</span>
                                                            <span className="text-sm font-medium text-gray-400">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 pt-6 border-t border-white/5">
                                            {currentItem.type === 'food' && (
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${currentItem.is_safe_to_eat_raw ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                                    <ShieldAlert size={14} />
                                                    {currentItem.is_safe_to_eat_raw ? t('wiki.consumable.safe_bio_integrity') : t('wiki.consumable.bio_hazardous_raw')}
                                                </div>
                                            )}
                                            {currentItem.requires_can_opener && (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                                                    <CanOpenerIcon className="w-4 h-4" />
                                                    {t('wiki.consumable.extraction_tool_required')}
                                                </div>
                                            )}
                                        </div>
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
            {showNpcSellers && (
                <NpcSellersModal
                    itemType="consumables"
                    itemId={currentItem.id}
                    onClose={() => setShowNpcSellers(false)}
                    onNpcSelect={handleNpcSelect}
                />
            )}
        </AnimatePresence>
    );
};

export default ConsumableDetailModal;
