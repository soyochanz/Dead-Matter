import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, Sparkles, HeartPulse, ShieldAlert, Flame, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import CanOpenerIcon from '@/components/icons/CanOpenerIcon';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import { useNavigate } from 'react-router-dom';

const StatDisplay = ({ icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div className={`flex items-center justify-between bg-black/20 p-3 rounded-lg ${className}`} onClick={onClick}>
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className={`font-bold text-lg ${colorClass}`}>{value}</span>
    </div>
);

const CookButton = ({ onCook }) => {
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
             <p className="text-sm text-gray-400 mt-2">Hold to cook</p>
        </div>
    )
}

const ConsumableDetailModal = ({ consumable, onClose }) => {
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-8 relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center p-4">
                                    <motion.img 
                                        key={currentItem.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-full w-full object-contain" 
                                        alt={currentItem.name} 
                                        src={currentItem.image_url} 
                                    />
                                </div>
                                { cookedVersion && !isCooked && <CookButton onCook={handleCook} /> }
                            </div>

                            <div>
                                <motion.h2 key={currentItem.id + 'h2'} initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-3xl font-bold text-white mb-2">{currentItem.name}</motion.h2>
                                <motion.p key={currentItem.id + 'p'} initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} className="text-gray-400 mb-6 text-sm">{currentItem.description}</motion.p>
                                
                                <div className="space-y-3">
                                    <StatDisplay icon={<Droplet size={20} className="text-blue-400"/>} label="Hydration" value={currentItem.hydration || 0} colorClass={currentItem.hydration >= 0 ? 'text-blue-300' : 'text-red-400'}/>
                                    <StatDisplay icon={<Sparkles size={20} className="text-yellow-400"/>} label="Energy" value={currentItem.energy || 0} colorClass={currentItem.energy >= 0 ? 'text-yellow-300' : 'text-red-400'} />
                                    <StatDisplay icon={<HeartPulse size={20} className="text-green-400"/>} label="Health" value={currentItem.health || 0} colorClass={currentItem.health >= 0 ? 'text-green-300' : 'text-red-400'} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-black/20 p-2 rounded-lg my-6">
                                    <StatDisplay icon={<DollarSign size={20} />} label="Buy" value={`${currentItem.price || 0} $`} colorClass="text-red-400" onClick={() => setShowNpcSellers(true)} className="cursor-pointer hover:bg-white/10" />
                                    <StatDisplay icon={<TrendingUp size={20} />} label="Sell" value={`${currentItem.sell_price || 'N/A'} $`} colorClass="text-green-400" />
                                </div>
                                
                                {hasSideEffects && (
                                     <div className="mt-6 space-y-2">
                                        <h4 className="font-semibold text-gray-300 flex items-center gap-2"><AlertTriangle className="text-yellow-400" size={18}/> Side Effects</h4>
                                        <div className="bg-black/20 p-3 rounded-lg space-y-1">
                                            {Object.entries(currentItem.side_effects).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="font-bold text-yellow-400">{key}:</span>
                                                    <span className="text-gray-400 ml-2">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 space-y-3">
                                     {currentItem.type === 'food' && (
                                        <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${currentItem.is_safe_to_eat_raw ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <ShieldAlert size={18} />
                                            <span>{currentItem.is_safe_to_eat_raw ? 'Safe to eat' : 'Not safe to eat'}</span>
                                        </div>
                                     )}
                                     {currentItem.requires_can_opener && (
                                         <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-yellow-500/10 text-yellow-400">
                                            <CanOpenerIcon className="w-5 h-5" />
                                             <span>Requires can opener</span>
                                         </div>
                                     )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            {showNpcSellers && <NpcSellersModal itemType="consumables" itemId={currentItem.id} onClose={() => setShowNpcSellers(false)} onNpcSelect={handleNpcSelect} />}
        </AnimatePresence>
    );
};

export default ConsumableDetailModal;
