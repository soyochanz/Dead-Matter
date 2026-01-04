import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Zap, Shield, Gem, Crosshair, Grip, Puzzle, Wind, Loader2, Box, Ban, DollarSign, Tag, Ruler, Weight, Swords, TrendingUp, Hand, Clock, Lightbulb as Bolt, SlidersHorizontal } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { supabase } from '@/lib/mySupabaseClient';
import * as LucideIcons from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';

const StatBar = ({ icon, label, value, max = 100, unit = '', higherIsBetter = true, baseValue, showModifier = false, color }) => {
    const clampedValue = Math.min(value, max);
    const percentage = max > 0 && clampedValue > 0 ? (clampedValue / max) * 100 : 0;
    const modifier = (baseValue !== undefined) ? value - baseValue : 0;
    let modifierColor = 'text-gray-400';

    if (modifier !== 0) {
        if (higherIsBetter) modifierColor = modifier > 0 ? 'text-green-400' : 'text-red-400';
        else modifierColor = modifier < 0 ? 'text-green-400' : 'text-red-400';
    }

    const IconComponent = LucideIcons[icon] || icon;

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
                    {showModifier && modifier !== 0 && (
                        <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className={`text-[10px] font-black tracking-tighter ${modifierColor}`}>
                            [{modifier > 0 ? `+${modifier.toFixed(1)}` : modifier.toFixed(1)}]
                        </motion.span>
                    )}
                    <span className="font-mono text-xs font-bold text-white tracking-widest">
                        {clampedValue.toFixed(clampedValue % 1 === 0 ? 0 : 1)}
                        <span className="text-[10px] text-gray-500 ml-1 font-sans">{unit}</span>
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
                {/* Segmented effect */}
                <div className="absolute inset-0 flex justify-between px-0.5">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-px h-full bg-black/40" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const SimpleStat = ({ icon: Icon, label, value, unit, onClick, className = "", valueClassName = "" }) => (
    <div
        className={`flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group/simple cursor-default hover:bg-white/10 transition-all duration-300 ${className}`}
        onClick={onClick}
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0a0a0c] border border-white/5 text-gray-500 group-hover/simple:text-white transition-colors shadow-inner">
                {Icon && <Icon className="w-4 h-4" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover/simple:text-gray-400">{label}</span>
        </div>
        <span className={`font-mono text-sm font-bold text-white tracking-widest ${valueClassName}`}>
            {value} <span className="text-[10px] text-gray-500 font-sans">{unit}</span>
        </span>
    </div>
);

const AccessorySlot = ({ id, type, equippedAccessory, onRemove, isCompatibleDrop, activeId }) => {
    const { isOver, setNodeRef } = useDroppable({ id, data: { type } });
    const rarityColor = equippedAccessory?.rarity?.color || 'transparent';

    let baseClasses = 'w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 relative p-1 group/slot overflow-hidden';
    let stateClasses = 'bg-[#0a0a0c] border border-white/5';

    if (equippedAccessory) stateClasses = 'bg-black border-white/10 shadow-2xl';
    else if (isOver && activeId) stateClasses = isCompatibleDrop ? 'bg-green-500/20 border-green-500 border-solid scale-110 z-10' : 'bg-red-500/20 border-red-500 border-solid';

    const Icon = { 'Sights': Crosshair, 'Muzzle': Wind, 'Grip': Grip, 'Magazine': Box, 'Stock': Puzzle }[type] || Puzzle;

    return (
        <div ref={setNodeRef} className={`${baseClasses} ${stateClasses}`} style={{
            borderColor: equippedAccessory ? rarityColor : (isOver ? (isCompatibleDrop ? 'rgb(34 197 94)' : 'rgb(239 68 68)') : ''),
            boxShadow: equippedAccessory ? `0 0 20px ${rarityColor}20` : ''
        }}>
            {/* Background scanner track */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-px bg-white/20 absolute top-1/2 -translate-y-1/2" />
                <div className="w-px h-full bg-white/20 absolute left-1/2 -translate-x-1/2" />
            </div>

            {equippedAccessory ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full cursor-pointer relative flex flex-col items-center justify-center text-center z-10"
                    onClick={onRemove}
                >
                    <img src={equippedAccessory.image_url} alt={equippedAccessory.name} className="flex-grow w-auto h-auto max-w-[85%] max-h-[70%] object-contain p-1 drop-shadow-2xl" />
                    <span className="text-[9px] font-black uppercase tracking-tighter text-white/50 group-hover/slot:text-white transition-colors truncate w-full px-2 mb-1">{equippedAccessory.name}</span>
                    <div className="absolute inset-0 bg-red-600/90 flex flex-col items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all duration-300">
                        <X size={24} className="text-white mb-1" />
                        <span className="text-[8px] font-black uppercase text-white tracking-widest">Remove</span>
                    </div>
                </motion.div>
            ) : (<>
                <div className="flex flex-col items-center justify-center text-gray-700 group-hover/slot:text-gray-400 transition-colors z-10">
                    <Icon className="w-8 h-8 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{type}</span>
                </div>
                {isOver && !isCompatibleDrop && activeId && <Ban className="w-10 h-10 text-red-500 absolute z-20" />}
            </>)}

            {/* Technical corners */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/10" />
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/10" />
        </div>
    );
};

const DraggableAccessory = ({ accessory }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: accessory.id, data: { accessory } });
    const rarityColor = accessory.rarity?.color || '#ffffff20';
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{ borderColor: `${rarityColor}40`, boxShadow: `0 4px 15px -5px ${rarityColor}20` }}
            className="w-24 h-24 p-2 rounded-2xl bg-[#0a0a0c] border border-white/5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center hover:bg-[#121214] hover:border-white/10 transition-all group/drag shadow-xl"
        >
            <div className="flex-grow flex items-center justify-center w-full">
                <img className="max-w-[90%] max-h-[90%] object-contain pointer-events-none drop-shadow-xl group-hover/drag:scale-110 transition-transform duration-500" alt={accessory.name} src={accessory.image_url} />
            </div>
            <span className="text-[8px] font-black uppercase text-gray-500 group-hover/drag:text-white transition-colors truncate w-full px-1 tracking-widest">{accessory.name}</span>
            <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: rarityColor }} />
        </div>
    );
};

const AmmoWeaponsModal = ({ ammo, onClose }) => {
    const [weapons, setWeapons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeapons = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('weapons').select('id, name, image_url, subcategory:wiki_subcategories(name), rarity:rarities(color, name)').eq('ammo', ammo);
            if (error) console.error(error); else setWeapons(data);
            setLoading(false);
        };
        fetchWeapons();
    }, [ammo]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[70] flex items-center justify-center p-4" onClick={onClose}>
            {/* Background Noise/Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <motion.div initial={{ scale: 0.9, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 50, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="bg-[#050505] border border-white/5 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/50">Ballistic Registry</span>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter shrink-0">Compatible with <span className="text-blue-500">{ammo}</span></h3>
                        </div>
                        <button onClick={onClose} className="p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5"><X size={20} /></button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500 h-10 w-10" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Scanning Armory Database...</span>
                        </div>
                    ) : weapons.length > 0 ? (
                        <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {weapons.map(w => (
                                <motion.div
                                    key={w.id}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-5 bg-white/5 border border-white/5 p-4 rounded-2xl transition-all hover:bg-white/10 hover:border-blue-500/20 group cursor-default"
                                >
                                    <div className="w-24 h-16 rounded-xl bg-[#0a0a0c] border border-white/5 overflow-hidden flex-shrink-0 relative group-hover:border-blue-500/40 transition-colors p-2">
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src={w.image_url} alt={w.name} className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                {w.rarity?.name || 'COMMON'}
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
                                                {w.subcategory?.name || 'Classified'}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">{w.name}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No matching ballistic data</p>
                            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Module Synchronization Unvavailable</p>
                        </div>
                    )}
                </div>

                {/* Bottom Accents */}
                <div className="h-1 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0 opacity-30" />
            </motion.div>
        </motion.div>
    )
}

const WeaponDetailModal = ({ weapon, onClose, onNpcSelect }) => {
    const [availableAttachments, setAvailableAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [equipped, setEquipped] = useState({});
    const [activeId, setActiveId] = useState(null);
    const [showAmmoModal, setShowAmmoModal] = useState(false);
    const [showNpcSellers, setShowNpcSellers] = useState(false);

    const isMelee = useMemo(() => weapon.subcategory.name.toLowerCase().includes('melee'), [weapon]);
    const slots = ['Sights', 'Muzzle', 'Grip', 'Magazine', 'Stock'];

    useEffect(() => {
        setEquipped({});
        if (!isMelee) {
            const fetchAttachments = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('weapon_attachments').select('slot_type, accessories(*, rarity:rarities(*), damage_modifier, rate_of_fire_modifier, accuracy_modifier, capacity_modifier)').eq('weapon_id', weapon.id);
                if (error) console.error("Error fetching attachments", error); else setAvailableAttachments(data || []);
                setLoading(false);
            };
            fetchAttachments();
        } else { setLoading(false); setAvailableAttachments([]); }
    }, [weapon.id, isMelee]);

    const calculatedStats = useMemo(() => {
        const base = {
            damage: weapon.damage || 0,
            rate_of_fire: weapon.rate_of_fire || 0,
            accuracy: weapon.accuracy || 0,
            handling: weapon.handling || 0,
            capacity: weapon.capacity || 0,
            melee_range: weapon.melee_range || 0,
            attack_speed: weapon.attack_speed || 0,
            stamina_efficiency: weapon.stamina_efficiency || 0,
        };

        if (isMelee) {
            return base;
        }

        const modified = Object.values(equipped).reduce((stats, accessory) => {
            if (!accessory) return stats;
            const accessoryDetails = availableAttachments.find(a => a.accessories.id === accessory.id)?.accessories;
            if (!accessoryDetails) return stats;
            return {
                ...stats,
                damage: stats.damage + (accessoryDetails.damage_modifier || 0),
                rate_of_fire: stats.rate_of_fire + (accessoryDetails.rate_of_fire_modifier || 0),
                accuracy: stats.accuracy + (accessoryDetails.accuracy_modifier || 0),
                capacity: stats.capacity + (accessoryDetails.capacity_modifier || 0)
            };
        }, base);

        return {
            ...modified,
            damage: Math.min(modified.damage, 100),
            rate_of_fire: Math.min(modified.rate_of_fire, 1200),
            accuracy: Math.min(modified.accuracy, 100),
            handling: Math.min(modified.handling, 100),
        };

    }, [weapon, equipped, availableAttachments, isMelee]);

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        const { over, active } = event;
        setActiveId(null);
        if (over && active.data.current?.accessory) {
            const { accessory } = active.data.current;
            const slotType = over.data.current?.type;
            const isCompatible = availableAttachments.some(att => att.accessories.id === accessory.id && att.slot_type === slotType);
            if (isCompatible) setEquipped(prev => ({ ...prev, [slotType]: accessory }));
        }
    };

    const handleRemoveAccessory = (slotType) => setEquipped(prev => { const newEquipped = { ...prev }; delete newEquipped[slotType]; return newEquipped; });

    const activeAccessoryData = activeId ? availableAttachments.find(a => a.accessories.id === activeId) : null;
    const activeAccessory = activeAccessoryData ? activeAccessoryData.accessories : null;
    const rarityColor = weapon.rarity?.color || 'transparent';

    const mainContent = isMelee ? (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <SimpleStat icon={Ruler} label="Size" value={weapon.size || 'N/A'} unit="" />
                <SimpleStat icon={Weight} label="Weight" value={weapon.weight || 0} unit="kg" />
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Swords size={60} className="text-red-500" />
                </div>

                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/50 mb-6 flex items-center gap-3">
                    <div className="w-8 h-px bg-red-500/20" /> Performance Analysis
                </h4>

                <StatBar icon={Target} label="Lethality" value={calculatedStats.damage} max={100} unit="pt" color="#ef4444" />
                <StatBar icon={Hand} label="Melee Range" value={calculatedStats.melee_range} max={10} unit="m" color="#3b82f6" />
                <StatBar icon={Clock} label="Attack Speed" value={calculatedStats.attack_speed} max={100} unit="%" color="#10b981" />
                <StatBar icon={Bolt} label="Stamina Efficiency" value={calculatedStats.stamina_efficiency} max={100} unit="%" color="#f59e0b" />
                {weapon.stats?.map(stat => <StatBar key={stat.label} label={stat.label} value={stat.value} max={stat.max} icon={stat.icon} color={stat.color} />)}
            </div>
        </div>
    ) : (
        <div className="space-y-8">
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Integrated Systems</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {slots.map(slotType => {
                        const isSlotAvailable = availableAttachments.some(att => att.slot_type === slotType);
                        if (!isSlotAvailable) return null;
                        const isCompatibleDrop = activeId ? availableAttachments.some(a => a.accessories.id === activeId && a.slot_type === slotType) : false;
                        return (<AccessorySlot key={slotType} id={slotType} type={slotType} equippedAccessory={equipped[slotType]} onRemove={() => handleRemoveAccessory(slotType)} isCompatibleDrop={isCompatibleDrop} activeId={activeId} />);
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <SimpleStat icon={Ruler} label="Size" value={weapon.size || 'N/A'} unit="" />
                <SimpleStat icon={Weight} label="Weight" value={weapon.weight || 0} unit="kg" />
                <SimpleStat icon={Shield} label="Ammo Type" value={weapon.ammo || 'N/A'} unit="" onClick={() => setShowAmmoModal(true)} className="cursor-pointer border-blue-500/20 hover:border-blue-500/50" valueClassName="text-blue-400" />
                <SimpleStat icon={Box} label="Capacity" value={calculatedStats.capacity} unit="rnd" />
            </div>

            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target size={60} className="text-red-500" />
                </div>

                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/50 mb-6 flex items-center gap-3">
                    <div className="w-8 h-px bg-red-500/20" /> Ballistic Performance
                </h4>

                <StatBar icon={Target} label="Lethality" value={calculatedStats.damage} baseValue={weapon.damage} max={100} unit="pt" showModifier={true} color="#ef4444" />
                <StatBar icon={Zap} label="Rate of Fire" value={calculatedStats.rate_of_fire} baseValue={weapon.rate_of_fire} max={1200} unit="rpm" showModifier={true} color="#3b82f6" />
                <StatBar icon={Crosshair} label="Accuracy" value={calculatedStats.accuracy} baseValue={weapon.accuracy} max={100} unit="%" showModifier={true} color="#10b981" />
                <StatBar icon={SlidersHorizontal} label="Handling" value={calculatedStats.handling} baseValue={weapon.handling} max={100} unit="%" showModifier={true} color="#f59e0b" />
                {weapon.stats?.map(stat => <StatBar key={stat.label} label={stat.label} value={stat.value} max={stat.max} icon={stat.icon} color={stat.color} />)}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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

                        <div className="p-8 md:p-12 overflow-y-auto relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-all bg-white/5 p-3 rounded-2xl hover:bg-red-600/20 hover:text-red-500 border border-white/5 z-20"
                            >
                                <X size={24} />
                            </motion.button>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <div className="relative group/image">
                                        <div className="w-full aspect-[4/3] bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden shadow-inner">
                                            {/* Rarity Glow */}
                                            <div className="absolute inset-0 opacity-10 blur-[80px] pointer-events-none" style={{ backgroundColor: rarityColor }} />
                                            <div className="absolute top-0 left-0 p-8 opacity-20 group-hover/image:opacity-40 transition-opacity">
                                                <Target size={120} className="text-white/5" />
                                            </div>

                                            <motion.img
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.8 }}
                                                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-[0_25px_25px_rgba(0,0,0,0.8)]"
                                                alt={weapon.name}
                                                src={weapon.image_url}
                                            />
                                        </div>
                                        {/* Technical Label for Image */}
                                        <div className="absolute bottom-6 right-8 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_#ef4444]" />
                                            <span className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest">Visual Confirm</span>
                                        </div>
                                    </div>

                                    {!isMelee && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Inventory Attachments</h4>
                                                {loading && <Loader2 className="w-4 h-4 animate-spin text-red-500" />}
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4 bg-black/40 border border-white/5 rounded-[2rem] min-h-[140px] shadow-inner relative">
                                                {!loading && availableAttachments.length === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-700 pointer-events-none">
                                                        <span className="text-[8px] font-black uppercase tracking-widest">No Mods Available</span>
                                                    </div>
                                                )}
                                                {availableAttachments.filter(att => !Object.values(equipped).some(eq => eq && eq.id === att.accessories.id)).map(att => <DraggableAccessory key={att.accessories.id} accessory={att.accessories} />)}
                                            </div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-center text-gray-600">Drag items to install modules</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="flex items-center gap-2 mb-4"
                                        >
                                            <span className="text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg border border-red-500/20" style={{ backgroundColor: `${weapon.rarity.color}20`, color: weapon.rarity.color }}>
                                                {weapon.rarity.name} GRADE
                                            </span>
                                        </motion.div>

                                        <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                            {weapon.name.split(' ').map((word, i) => (
                                                <span key={i} className={i === 0 ? "block" : "text-red-600 block"}>{word}</span>
                                            ))}
                                        </h2>

                                        <p className="text-gray-400 text-lg leading-relaxed font-medium mb-8 border-l-2 border-red-600/20 pl-6 py-2">
                                            {weapon.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-12">
                                            <SimpleStat icon={DollarSign} label="Market Value" value={weapon.price || 0} unit="$" valueClassName="text-red-500" className="cursor-pointer border-red-500/10 hover:border-red-500/40 shadow-lg" onClick={() => setShowNpcSellers(true)} />
                                            <SimpleStat icon={TrendingUp} label="Resale Factor" value={weapon.sell_price || 'N/A'} unit="$" valueClassName="text-green-500" />
                                        </div>

                                        {mainContent}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Decoration */}
                        <div className="h-2 bg-[#0a0a0c] border-t border-white/5 flex">
                            <div className="w-1/3 h-full bg-red-600" />
                            <div className="w-2/3 h-full flex justify-between px-4">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-px h-full bg-white/5" />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
                {!isMelee &&
                    <DragOverlay>
                        {activeId && activeAccessory ?
                            <div style={{ borderColor: activeAccessory.rarity?.color || '#FF0000' }} className="w-24 h-24 p-1 rounded-lg bg-gray-800/80 backdrop-blur-sm border-2 flex flex-col items-center justify-center cursor-grabbing shadow-2xl shadow-red-500/50 text-center">
                                <img className="flex-grow w-auto h-auto max-w-full max-h-[70%] object-contain" src={activeAccessory.image_url} />
                                <span className="text-white text-xs mt-1 truncate w-full px-1">{activeAccessory.name}</span>
                            </div>
                            : null}
                    </DragOverlay>}
                {showAmmoModal && <AmmoWeaponsModal ammo={weapon.ammo} onClose={() => setShowAmmoModal(false)} />}
                {showNpcSellers && <NpcSellersModal itemType="weapons" itemId={weapon.id} onClose={() => setShowNpcSellers(false)} onNpcSelect={onNpcSelect} />}
            </DndContext>
        </AnimatePresence>
    );
};

export default WeaponDetailModal;
