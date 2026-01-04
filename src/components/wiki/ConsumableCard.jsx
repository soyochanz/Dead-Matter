import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Sparkles, HeartPulse, RefreshCw, Flame, Utensils, Coffee, ArrowRight } from 'lucide-react';
import CanOpenerIcon from '@/components/icons/CanOpenerIcon';

const ConsumableCard = ({ consumable, index, onClick }) => {
    if (!consumable) {
        return null; 
    }

    // Función para obtener los colores basados en el tipo de consumible
    const getConsumableStyles = (type, rarityName) => {
        const baseStyles = {
            'food': {
                gradient: 'from-orange-600 to-amber-600',
                shadow: 'shadow-orange-900/50',
                icon: Utensils
            },
            'drink': {
                gradient: 'from-blue-600 to-cyan-600',
                shadow: 'shadow-blue-900/50', 
                icon: Coffee
            }
        };

        // Si es raro, usar gradientes de rareza
        const rarityStyles = {
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

        const baseStyle = baseStyles[type] || baseStyles['food'];
        const rarityStyle = rarityStyles[rarityName] || rarityStyles['Common'];
        
        // Priorizar rareza sobre tipo para colores más llamativos
        return rarityName !== 'Common' ? {
            ...rarityStyle,
            icon: baseStyle.icon
        } : baseStyle;
    };

    const rarityName = consumable.rarity?.name || 'Common';
    const type = consumable.type || 'food';
    const { gradient, shadow, icon: ConsumableIcon } = getConsumableStyles(type, rarityName);
    const needsCooking = consumable.type === 'food' && !consumable.is_safe_to_eat_raw;

    // Stats válidos para mostrar
    const validStats = [
        consumable.hydration > 0 && {
            icon: Droplet,
            value: consumable.hydration,
            color: 'text-blue-400',
            label: 'Hydration'
        },
        consumable.energy > 0 && {
            icon: Sparkles,
            value: consumable.energy,
            color: 'text-yellow-400',
            label: 'Energy'
        },
        consumable.health > 0 && {
            icon: HeartPulse,
            value: consumable.health,
            color: 'text-green-400',
            label: 'Health'
        }
    ].filter(Boolean);

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
                
                {/* Imagen del consumible */}
                <div className="relative h-40 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                    {/* Overlay de gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                    
                    {consumable.image_url ? (
                        <img 
                            className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                            alt={consumable.name}
                            src={consumable.image_url} 
                        />
                    ) : (
                        <div className={`relative z-20 p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            <ConsumableIcon className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>
                    )}
                    
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />

                    {/* Badges de estado */}
                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                        {consumable.is_refillable && (
                            <div className="p-1.5 bg-blue-900/80 backdrop-blur-sm text-blue-300 rounded-full border border-blue-500/50 shadow-lg" title="Refillable">
                                <RefreshCw size={14} />
                            </div>
                        )}
                        {consumable.requires_can_opener && (
                            <div className="p-1.5 bg-yellow-900/80 backdrop-blur-sm text-yellow-300 rounded-full border border-yellow-500/50 shadow-lg" title="Requires Can Opener">
                                <CanOpenerIcon className="w-3.5 h-3.5" />
                            </div>
                        )}
                        {needsCooking && (
                            <div className="p-1.5 bg-red-900/80 backdrop-blur-sm text-red-300 rounded-full border border-red-500/50 shadow-lg" title="Needs to be cooked">
                                <Flame size={14} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6 flex-grow flex flex-col">
                    {/* Nombre y rareza */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                            {consumable.name}
                        </h3>
                        
                        {/* Badge de tipo y rareza */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                                <div className="w-2 h-2 bg-white rounded-full mr-2" />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </div>
                            {rarityName !== 'Common' && (
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/10 text-white/80">
                                    {rarityName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats del consumible */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 min-h-[3rem]">
                        <div className="flex items-center gap-2">
                            {validStats.length > 0 ? (
                                validStats.map((stat, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-1.5 text-sm text-white bg-white/10 px-3 py-1.5 rounded-full"
                                        title={stat.label}
                                    >
                                        <stat.icon size={14} className={stat.color} />
                                        <span className="font-semibold">{stat.value}</span>
                                    </div>
                                ))
                            ) : (
                                // Espacio reservado para mantener la altura consistente
                                <div className="opacity-0">
                                    <div className="flex items-center gap-1.5 text-sm px-3 py-1.5">
                                        <Droplet size={14} />
                                        <span>0</span>
                                    </div>
                                </div>
                            )}
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
                    boxShadow: `
                        0 25px 50px -12px ${getShadowColor(type, rarityName)}
                    `
                }}
            />
        </motion.div>
    );
};

// Función auxiliar para obtener colores de sombra
const getShadowColor = (type, rarityName) => {
    const typeColors = {
        'food': 'rgba(245, 158, 11, 0.5)',
        'drink': 'rgba(37, 99, 235, 0.5)'
    };

    const rarityColors = {
        'Common': 'rgba(75, 85, 99, 0.5)',
        'Uncommon': 'rgba(5, 150, 105, 0.5)',
        'Rare': 'rgba(37, 99, 235, 0.5)',
        'Epic': 'rgba(147, 51, 234, 0.5)',
        'Legendary': 'rgba(245, 158, 11, 0.5)',
        'Mythic': 'rgba(239, 68, 68, 0.5)'
    };

    return rarityColors[rarityName] || typeColors[type] || typeColors['food'];
};

export default ConsumableCard;