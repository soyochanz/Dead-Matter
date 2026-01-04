import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Backpack, Sword, Tally1, Droplets, Zap, Weight, ArrowRight } from 'lucide-react';

const StatDisplay = ({ icon: Icon, value, title, color = "text-white" }) => (
    <div className={`flex items-center gap-1.5 text-sm ${color} bg-white/10 px-3 py-1.5 rounded-full group-hover:bg-white/20 transition-all duration-300`} title={title}>
        <Icon size={14} className="flex-shrink-0" />
        <span className="font-semibold">{value}</span>
    </div>
);

const GearCard = ({ gear, index, onClick }) => {
    // Función para obtener los colores basados en la rareza
    const getRarityStyles = (rarityName) => {
        const styles = {
            'Common': {
                gradient: 'from-gray-600 to-slate-600',
                shadow: 'shadow-gray-900/50'
            },
            'Uncommon': {
                gradient: 'from-green-600 to-emerald-600',
                shadow: 'shadow-green-900/50'
            },
            'Rare': {
                gradient: 'from-blue-600 to-cyan-600',
                shadow: 'shadow-blue-900/50'
            },
            'Epic': {
                gradient: 'from-purple-600 to-violet-600',
                shadow: 'shadow-purple-900/50'
            },
            'Legendary': {
                gradient: 'from-orange-600 to-amber-600',
                shadow: 'shadow-orange-900/50'
            },
            'Mythic': {
                gradient: 'from-red-600 to-rose-600',
                shadow: 'shadow-red-900/50'
            }
        };
        
        return styles[rarityName] || styles['Common'];
    };

    const rarityName = gear.rarity?.name || 'Common';
    const { gradient, shadow } = getRarityStyles(rarityName);
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
            }}
            transition={{ 
                duration: 0.5, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
            }}
            onClick={onClick}
            className="relative overflow-hidden group cursor-pointer h-full"
        >
            {/* Efecto de fondo con gradiente */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />
            
            {/* Efecto de borde luminoso */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm group-hover:blur-md`} />
            
            <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-sm rounded-2xl group-hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                
                {/* Imagen del gear */}
                <div className="relative h-40 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                    {/* Overlay de gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                    
                    {gear.image_url ? (
                        <img 
                            className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                            alt={gear.name}
                            src={gear.image_url} 
                        />
                    ) : (
                        <div className={`relative z-20 p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>
                    )}
                    
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />
                    
                    {/* Badges superiores */}
                    <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
                        {gear.armor_rating > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-green-300 bg-green-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-500/50 shadow-lg" title="Armor Rating">
                                <Shield size={14} className="flex-shrink-0" />
                                <span className="font-bold">{gear.armor_rating}</span>
                            </div>
                        )}
                        {weaponSlotType && (
                            <div className="flex items-center gap-1.5 text-sm text-amber-300 bg-amber-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-500/50 shadow-lg" title="Weapon Slot Type">
                                <Sword size={14} className="flex-shrink-0" />
                                <span className="font-bold capitalize">{weaponSlotType} Slot</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6 flex-grow flex flex-col">
                    {/* Nombre y rareza */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                            {gear.name}
                        </h3>
                        
                        {/* Badge de rareza */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                            <div className="w-2 h-2 bg-white rounded-full mr-2" />
                            {rarityName}
                        </div>
                    </div>

                    {/* Stats del gear */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            {/* Peso */}
                            {gear.weight > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-white bg-white/10 px-3 py-1.5 rounded-full">
                                    <Weight size={14} className="text-gray-400" />
                                    <span className="font-semibold">{gear.weight}kg</span>
                                </div>
                            )}
                            
                            {/* Stat secundario */}
                            {renderSecondaryStat()}
                        </div>
                        
                        {/* Indicador de acción */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="flex items-center text-white/80 group-hover:text-white transition-colors duration-300"
                        >
                            <span className="text-sm font-semibold mr-2">View</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                        </motion.div>
                    </div>
                </div>

                {/* Efecto de hover en la parte inferior */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            </div>

            {/* Efecto de sombra exterior */}
            <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    boxShadow: `0 25px 50px -12px ${getShadowColor(rarityName)}`
                }}
            />
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