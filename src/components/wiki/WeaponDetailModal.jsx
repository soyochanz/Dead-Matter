import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Zap, Shield, Gem, Crosshair, Grip, Puzzle, Wind, Loader2, Box, Ban, DollarSign, Tag, Ruler, Weight, Swords, TrendingUp, Hand, Clock, Lightbulb as Bolt, SlidersHorizontal } from 'lucide-react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { supabase } from '@/lib/customSupabaseClient';
import * as LucideIcons from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';

const StatBar = ({ icon, label, value, max = 100, unit = '', higherIsBetter = true, baseValue, showModifier = false, color }) => {
    const clampedValue = Math.min(value, max);
    const percentage = max > 0 && clampedValue > 0 ? (clampedValue / max) * 100 : 0;
    const modifier = (baseValue !== undefined) ? value - baseValue : 0;
    let modifierColor = 'text-gray-400';
    
    if(modifier !== 0) {
        if(higherIsBetter) modifierColor = modifier > 0 ? 'text-green-400' : 'text-red-400';
        else modifierColor = modifier < 0 ? 'text-green-400' : 'text-red-400';
    }

    const IconComponent = LucideIcons[icon] || icon;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="w-5 h-5" style={{ color }} />}
                    <span className="text-sm text-gray-300">{label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    {showModifier && modifier !== 0 && (
                        <motion.span initial={{opacity: 0}} animate={{opacity: 1}} className={`text-xs font-bold ${modifierColor}`}>
                            ({modifier > 0 ? `+${modifier.toFixed(2)}`: modifier.toFixed(2)})
                        </motion.span>
                    )}
                    <span className="font-bold text-white text-sm">{clampedValue.toFixed(clampedValue % 1 === 0 ? 0 : 2)} {unit}</span>
                </div>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2.5">
                <motion.div 
                    className="h-2.5 rounded-full" 
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

const SimpleStat = ({ icon: Icon, label, value, unit, onClick, className="", valueClassName="" }) => (
    <div className={`flex items-center gap-2 text-sm ${className}`} onClick={onClick}>
        <div className="flex items-center gap-2 text-gray-300">
            {Icon && <Icon className="w-5 h-5" />}
            <span>{label}</span>
        </div>
        <span className={`font-bold text-white ${valueClassName}`}>{value} {unit}</span>
    </div>
);

const AccessorySlot = ({ id, type, equippedAccessory, onRemove, isCompatibleDrop, activeId }) => {
    const { isOver, setNodeRef } = useDroppable({ id, data: { type } });
    const rarityColor = equippedAccessory?.rarity?.color || 'transparent';
    
    let baseClasses = 'w-24 h-24 rounded-lg flex items-center justify-center transition-all duration-200 relative p-1';
    let stateClasses = 'bg-black/40 border-dashed border-white/10';
    
    if (equippedAccessory) stateClasses = 'bg-black/60 border-solid';
    else if (isOver && activeId) stateClasses = isCompatibleDrop ? 'bg-green-500/20 border-green-500 border-solid' : 'bg-red-500/20 border-red-500 border-solid';

    const Icon = { 'Sights': Crosshair, 'Muzzle': Wind, 'Grip': Grip, 'Magazine': Box, 'Stock': Puzzle }[type] || Puzzle;

    return (
        <div ref={setNodeRef} className={`${baseClasses} ${stateClasses}`} style={{borderColor: equippedAccessory ? rarityColor : (isOver ? (isCompatibleDrop ? 'rgb(34 197 94)' : 'rgb(239 68 68)') : '#ffffff1a')}}>
            {equippedAccessory ? (
                 <motion.div className="w-full h-full cursor-pointer relative flex flex-col items-center justify-center text-center" onClick={onRemove}>
                     <img src={equippedAccessory.image_url} alt={equippedAccessory.name} className="flex-grow w-auto h-auto max-w-full max-h-[70%] object-contain p-1"/>
                     <span className="text-white text-xs mt-1 truncate w-full px-1">{equippedAccessory.name}</span>
                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X className="w-8 h-8 text-red-500"/></div>
                 </motion.div>
            ) : (<>
                <Icon className="w-8 h-8 text-gray-500" />
                {isOver && !isCompatibleDrop && activeId && <Ban className="w-10 h-10 text-red-500 absolute" />}
            </>)}
        </div>
    );
};

const DraggableAccessory = ({ accessory }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({ id: accessory.id, data: { accessory } });
    const rarityColor = accessory.rarity?.color || '#ffffff20';
    return (
        <div ref={setNodeRef} {...listeners} {...attributes} style={{borderColor: rarityColor}} className="w-24 h-24 p-1 rounded-lg bg-gray-800/50 border-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing text-center">
            <img className="flex-grow w-auto h-auto max-w-full max-h-[70%] object-contain pointer-events-none" alt={accessory.name} src={accessory.image_url} />
            <span className="text-white text-xs mt-1 truncate w-full px-1">{accessory.name}</span>
        </div>
    );
};

const AmmoWeaponsModal = ({ ammo, onClose }) => {
    const [weapons, setWeapons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeapons = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('weapons').select('id, name, image_url, subcategory:wiki_subcategories(name), rarity:rarities(color)').eq('ammo', ammo);
            if (error) console.error(error); else setWeapons(data);
            setLoading(false);
        };
        fetchWeapons();
    }, [ammo]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Weapons using <span className="text-red-400">{ammo}</span></h3>
                    {loading ? <Loader2 className="animate-spin text-red-500 mx-auto" /> :
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {weapons.map(w => (
                                <div key={w.id} className="flex items-center gap-4 bg-black/20 p-2 rounded-lg" style={{borderLeft: `4px solid ${w.rarity?.color || 'transparent'}`}}>
                                    <img src={w.image_url} alt={w.name} className="w-20 h-12 object-contain bg-black/20 rounded"/>
                                    <div><p className="font-bold text-white">{w.name}</p><p className="text-sm text-gray-400">{w.subcategory?.name}</p></div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
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
        if(!isMelee){
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
        <div className="space-y-4 bg-white/5 p-6 rounded-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                 <SimpleStat icon={Ruler} label="Size" value={weapon.size || 'N/A'} unit="" />
                 <SimpleStat icon={Weight} label="Weight" value={weapon.weight || 0} unit="kg" />
            </div>
            <StatBar icon={Target} label="Damage" value={calculatedStats.damage} max={100} unit="" color="#ef4444" />
            <StatBar icon={Hand} label="Melee Range" value={calculatedStats.melee_range} max={100} unit="" color="#ef4444" />
            <StatBar icon={Clock} label="Attack Speed" value={calculatedStats.attack_speed} max={100} color="#ef4444" />
            <StatBar icon={Bolt} label="Stamina Efficiency" value={calculatedStats.stamina_efficiency} max={100} color="#ef4444" />
            {weapon.stats?.map(stat => <StatBar key={stat.label} label={stat.label} value={stat.value} max={stat.max} icon={stat.icon} color={stat.color} />)}
        </div>
    ) : (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {slots.map(slotType => {
                const isSlotAvailable = availableAttachments.some(att => att.slot_type === slotType);
                if (!isSlotAvailable) return null;
                const isCompatibleDrop = activeId ? availableAttachments.some(a => a.accessories.id === activeId && a.slot_type === slotType) : false;
                return (<AccessorySlot key={slotType} id={slotType} type={slotType} equippedAccessory={equipped[slotType]} onRemove={() => handleRemoveAccessory(slotType)} isCompatibleDrop={isCompatibleDrop} activeId={activeId} />);
            })}
        </div>
        <div className="space-y-4 bg-white/5 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4">
                 <SimpleStat icon={Ruler} label="Size" value={weapon.size || 'N/A'} unit="" />
                 <SimpleStat icon={Weight} label="Weight" value={weapon.weight || 0} unit="kg" />
                 <SimpleStat icon={Shield} label="Ammo" value={weapon.ammo || 'N/A'} unit="" onClick={() => setShowAmmoModal(true)} className="cursor-pointer hover:bg-white/10 p-1 rounded-md" />
                 <SimpleStat icon={Box} label="Capacity" value={calculatedStats.capacity} unit="" />
            </div>
            <StatBar icon={Target} label="Damage" value={calculatedStats.damage} baseValue={weapon.damage} max={100} unit="" showModifier={true} color="#ef4444" />
            <StatBar icon={Zap} label="Rate of Fire" value={calculatedStats.rate_of_fire} baseValue={weapon.rate_of_fire} max={1200} unit="RPM" showModifier={true} color="#ef4444" />
            <StatBar icon={Crosshair} label="Accuracy" value={calculatedStats.accuracy} baseValue={weapon.accuracy} max={100} showModifier={true} color="#ef4444" />
            <StatBar icon={SlidersHorizontal} label="Handling" value={calculatedStats.handling} baseValue={weapon.handling} max={100} showModifier={true} color="#ef4444" />
            {weapon.stats?.map(stat => <StatBar key={stat.label} label={stat.label} value={stat.value} max={stat.max} icon={stat.icon} color={stat.color} />)}
        </div>
        </>
    );

    return (
        <AnimatePresence>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                    <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }} className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 relative">
                            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"><X size={24} /></button>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div>
                                    <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center p-4 mb-8 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-20" style={{background: `radial-gradient(circle at 50% 50%, ${rarityColor} 0%, transparent 70%)`}} />
                                        <img className="max-h-full max-w-full object-contain relative z-10" alt={weapon.name} src={weapon.image_url} />
                                    </div>
                                    {!isMelee && (<>
                                        <h4 className="font-bold text-white mb-3">Available Attachments</h4>
                                        {loading ? <Loader2 className="animate-spin text-red-500"/> :
                                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 bg-black/20 rounded-lg min-h-[120px]">
                                                {availableAttachments.filter(att => !Object.values(equipped).some(eq => eq && eq.id === att.accessories.id)).map(att => <DraggableAccessory key={att.accessories.id} accessory={att.accessories} />)}
                                            </div>
                                        }
                                    </>)}
                                </div>
                                <div>
                                    <span className="text-sm font-bold px-3 py-1.5 rounded" style={{ backgroundColor: weapon.rarity.color, color: '#fff' }}>{weapon.rarity.name}</span>
                                    <h2 className="text-4xl font-bold text-white mt-3 mb-2">{weapon.name}</h2>
                                    <p className="text-gray-400 mb-2">{weapon.subcategory.name}</p>
                                    <p className="text-gray-400 mb-6">{weapon.description}</p>
                                    <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg mb-6">
                                        <SimpleStat icon={DollarSign} label="Buy Price" value={weapon.price || 0} unit="$" valueClassName="text-red-400" className="cursor-pointer hover:bg-white/10 p-1 rounded-md" onClick={() => setShowNpcSellers(true)} />
                                        <SimpleStat icon={TrendingUp} label="Sell Price" value={weapon.sell_price || 'N/A'} unit="$" valueClassName="text-green-400" />
                                    </div>
                                    {mainContent}
                                </div>
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