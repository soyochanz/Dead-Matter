import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Backpack, Sword, Tally1, Droplets, Zap, Weight } from 'lucide-react';

const StatDisplay = ({ icon: Icon, value, title, color = "text-white" }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/20 transition-all duration-300`} title={title}>
        <Icon size={12} className={`${color} opacity-80`} />
        <span className="text-[10px] font-mono font-bold text-white tracking-widest">{value}</span>
    </div>
);

const GearCard = ({ gear, index, onClick }) => {
    // Función para obtener los colores basados en la rareza
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

    const rarityName = gear.rarity?.name || 'Common';
    const rarityColor = getRarityColor(rarityName);
    const isBackpack = gear.subcategory?.name?.toLowerCase().includes('backpack');
    const weaponSlotType = isBackpack && gear.weapon_slot_type && gear.weapon_slot_type !== 'None' ? gear.weapon_slot_type : null;

    const renderSecondaryStat = () => {
        if (gear.inventory_slots != null && gear.inventory_slots > 0) {
            return <StatDisplay icon={Backpack} value={gear.inventory_slots} title="Inventory Slots" color="text-cyan-400" />;
        }
        if (gear.blunt_protection != null && gear.blunt_protection > 0) {
            return <StatDisplay icon={Tally1} value={gear.blunt_protection} title="Blunt Protection" color="text-yellow-400" />;
        }
        if (gear.bleed_protection != null && gear.bleed_protection > 0) {
            return <StatDisplay icon={Droplets} value={gear.bleed_protection} title="Bleed Protection" color="text-red-400" />;
        }
        if (gear.insulation != null && gear.insulation > 0) {
            return <StatDisplay icon={Zap} value={gear.insulation} title="Insulation" color="text-purple-400" />;
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="relative group cursor-pointer h-full"
        >
            {/* Gear Card Interior */}
            <div className="relative bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:border-red-500/30 group-hover:shadow-[0_20px_50px_-15px_rgba(239,68,68,0.15)] h-full flex flex-col shadow-2xl backdrop-blur-3xl">

                {/* Image Section */}
                <div className="relative h-48 bg-black/40 flex items-center justify-center p-8 overflow-hidden group-hover:bg-black/60 transition-colors">
                    {/* Rarity Aura */}
                    <div
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 blur-[60px] transition-opacity duration-500"
                        style={{ backgroundColor: rarityColor }}
                    />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                    {gear.image_url ? (
                        <img
                            className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
                            alt={gear.name}
                            src={gear.image_url}
                        />
                    ) : (
                        <Shield className="relative z-10 w-20 h-20 text-gray-800" strokeWidth={1} />
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                        {gear.armor_rating > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-green-500/30 text-green-500 text-[10px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <Shield size={12} />
                                <span>{gear.armor_rating}</span>
                            </div>
                        )}
                        {weaponSlotType && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/80 border border-blue-500/30 text-blue-500 text-[10px] font-black tracking-widest uppercase shadow-lg backdrop-blur-md">
                                <Sword size={12} />
                                <span>{weaponSlotType} SLOT</span>
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
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">ID: {gear.id.substring(0, 6)}</span>
                        </div>

                        <h3 className="text-lg font-medium text-white leading-tight uppercase tracking-tight group-hover:text-red-500 transition-colors duration-300">
                            {gear.name}
                        </h3>
                    </div>

                    {/* Stats Footer */}
                    <div className="mt-6 flex items-center justify-between pt-5 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                            {gear.weight > 0 && (
                                <StatDisplay icon={Weight} value={`${gear.weight}KG`} title="Item Weight" color="text-gray-400" />
                            )}
                            {renderSecondaryStat()}
                        </div>
                    </div>
                </div>

                {/* Interactive Bottom Bar */}
                <div className="h-1 bg-red-600/0 group-hover:bg-red-600 transition-all duration-500" />
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

export default GearCard;
