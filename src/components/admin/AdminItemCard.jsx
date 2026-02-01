import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Zap, Target, DollarSign, Weight, Package, Droplet, Sparkles, HeartPulse, Edit, Trash2, Link2, Truck, Gauge, Fuel, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getRarityStyles = (rarityName) => {
    const styles = {
        'Common': { border: 'border-gray-500/20', text: 'text-gray-400', bg: 'bg-gray-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(107,114,128,0.3)]', via: 'via-gray-500/50' },
        'Uncommon': { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]', via: 'via-emerald-500/50' },
        'Rare': { border: 'border-blue-500/20', text: 'text-blue-400', bg: 'bg-blue-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(59,130,246,0.3)]', via: 'via-blue-500/50' },
        'Epic': { border: 'border-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(168,85,247,0.3)]', via: 'via-purple-500/50' },
        'Legendary': { border: 'border-orange-500/20', text: 'text-orange-400', bg: 'bg-orange-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]', via: 'via-orange-500/50' },
        'Mythic': { border: 'border-red-500/20', text: 'text-red-400', bg: 'bg-red-500/5', shadowPulse: 'shadow-[0_0_8px_rgba(239,68,68,0.3)]', via: 'via-red-500/50' }
    };
    return styles[rarityName] || styles['Common'];
};

const StatBadge = ({ icon: Icon, label, value, color = "text-gray-400" }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
        <div className="flex flex-col p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{label}</span>
            <div className="flex items-center gap-1.5">
                <Icon size={12} className={color} />
                <span className="text-xs font-bold text-white leading-none">{value}</span>
            </div>
        </div>
    );
};

export const AdminItemCard = ({ item, type, onEdit, onDelete, onLink, index = 0 }) => {
    const rarityName = item.rarity?.name || 'Common';
    const style = getRarityStyles(rarityName);
    const isMelee = type === 'weapon' && item.subcategory?.name?.toLowerCase().includes('melee');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="group relative flex flex-col h-full bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all"
        >
            {/* Header / Image Area */}
            <div className="relative h-40 w-full p-4 flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
                {/* Rarity Glow */}
                <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${style.bg}`} />

                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-30">
                        {type === 'weapon' ? <Sword size={32} /> : type === 'vehicle' ? <Truck size={32} /> : <Package size={32} />}
                    </div>
                )}

                {/* Top Badge: Rarity */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded bg-black/40 border ${style.border} flex items-center gap-1.5 backdrop-blur-md`}>
                        <div className={`w-1 h-1 rounded-full bg-current ${style.text} ${style.shadowPulse} animate-pulse`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${style.text}`}>{rarityName}</span>
                    </div>
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                    {onLink && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white backdrop-blur-md border border-red-500/20 rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0)] hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                            onClick={() => onLink(item)}
                            title="Hardware Sync"
                        >
                            <Link2 className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/5 hover:bg-white/10 backdrop-blur-md text-gray-400 hover:text-white border border-white/5 rounded-lg transition-all"
                        onClick={() => onEdit(item)}
                        title="Calibrate"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 bg-white/5 hover:bg-red-500/20 backdrop-blur-md text-gray-400 hover:text-red-500 border border-white/5 rounded-lg transition-all"
                        onClick={() => onDelete(item)}
                        title="Purge"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-grow flex flex-col">
                <div className="mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-red-500 transition-colors leading-tight line-clamp-1 truncate uppercase tracking-tight">
                        {item.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                        {item.subcategory?.name || 'GENERIC'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {type === 'weapon' && (
                        <>
                            <StatBadge icon={Zap} label="Damage" value={item.damage} color="text-yellow-500" />
                            <StatBadge icon={Target} label="Ammo" value={item.ammo} color="text-blue-500" />
                            <StatBadge icon={Package} label="Size" value={item.size} />
                            <StatBadge icon={Weight} label="Weight" value={item.weight + ' kg'} />
                        </>
                    )}
                    {type === 'consumable' && (
                        <>
                            <StatBadge icon={Droplet} label="Water" value={item.hydration} color="text-blue-400" />
                            <StatBadge icon={Sparkles} label="Energy" value={item.energy} color="text-yellow-500" />
                            <StatBadge icon={HeartPulse} label="Health" value={item.health} color="text-red-500" />
                            <StatBadge icon={Package} label="Type" value={item.type} />
                        </>
                    )}
                    {type === 'gear' && (
                        <>
                            <StatBadge icon={Shield} label="Armor" value={item.armor_rating} color="text-emerald-500" />
                            <StatBadge icon={Package} label="Slots" value={item.inventory_slots} color="text-blue-500" />
                            <StatBadge icon={Package} label="Size" value={item.size} />
                            <StatBadge icon={Weight} label="Weight" value={item.weight + ' kg'} />
                        </>
                    )}
                    {type === 'accessory' && (
                        <>
                            <StatBadge icon={Zap} label="Dmg Mod" value={item.damage_modifier > 0 ? `+${item.damage_modifier}` : item.damage_modifier} color="text-yellow-500" />
                            <StatBadge icon={Target} label="Accuracy" value={item.accuracy_modifier > 0 ? `+${item.accuracy_modifier}` : item.accuracy_modifier} color="text-blue-500" />
                            <StatBadge icon={Sparkles} label="RoF Mod" value={item.rate_of_fire_modifier > 0 ? `+${item.rate_of_fire_modifier}` : item.rate_of_fire_modifier} color="text-orange-500" />
                            <StatBadge icon={Package} label="Type" value={item.type} />
                        </>
                    )}
                    {type === 'vehicle' && (
                        <>
                            <StatBadge icon={Gauge} label="Speed" value={item.speed + ' km/h'} color="text-yellow-500" />
                            <StatBadge icon={HeartPulse} label="Health" value={item.health} color="text-red-500" />
                            <StatBadge icon={Fuel} label="Fuel" value={item.fuel_capacity + ' L'} color="text-orange-400" />
                            <StatBadge icon={Users} label="Seats" value={item.occupants} color="text-blue-400" />
                        </>
                    )}
                    {type === 'toolbelt' && (
                        <>
                            <StatBadge icon={Package} label="Capacity" value={item.storage_capacity} color="text-blue-500" />
                            <StatBadge icon={Weight} label="Weight" value={item.weight + ' kg'} />
                            <StatBadge icon={Package} label="Size" value={item.size} />
                            <StatBadge icon={Zap} label="Function" value={item.use_function} color="text-yellow-500" />
                        </>
                    )}
                    {type === 'crafting_material' && (
                        <>
                            <div className="col-span-2">
                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed italic border-l-2 border-red-500/30 pl-3">
                                    {item.description || 'Raw material asset without calibration notes.'}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Price Info */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Buy</span>
                            <span className="text-xs font-black text-white">💰 {item.price || 0}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-3">
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Sell</span>
                            <span className="text-xs font-black text-gray-400">💰 {item.sell_price || 0}</span>
                        </div>
                    </div>
                    {/* ID Indicator */}
                    <span className="text-[8px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded uppercase">ID: {item.id ? item.id.toString().slice(0, 4) : 'NEW'}</span>
                </div>
            </div>

            {/* Bottom Glow Line */}
            <div className={`h-[2px] w-full bg-gradient-to-r from-transparent ${style.via} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
        </motion.div>
    );
};
