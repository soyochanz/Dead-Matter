import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Zap, Target, ArrowRight } from 'lucide-react';

const WeaponCard = ({ weapon, index, onClick }) => {
    const isMelee = weapon.subcategory?.name?.toLowerCase().includes('melee');

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

    const rarityName = weapon.rarity?.name || 'Common';
    const { gradient, shadow } = getRarityStyles(rarityName);

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
                
                {/* Imagen del arma */}
                <div className="relative h-40 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                    {/* Overlay de gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                    
                    {weapon.image_url ? (
                        <img 
                            className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                            alt={weapon.name}
                            src={weapon.image_url} 
                        />
                    ) : (
                        <div className={`relative z-20 p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            {isMelee ? (
                                <Sword className="w-16 h-16 text-white" strokeWidth={1.5} />
                            ) : (
                                <Target className="w-16 h-16 text-white" strokeWidth={1.5} />
                            )}
                        </div>
                    )}
                    
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6 flex-grow flex flex-col">
                    {/* Nombre y rareza */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                            {weapon.name}
                        </h3>
                        
                        {/* Badge de rareza */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                            <div className="w-2 h-2 bg-white rounded-full mr-2" />
                            {rarityName}
                        </div>
                    </div>

                    {/* Stats del arma */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                            {/* Daño para melee */}
                            {isMelee && weapon.damage > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-white bg-white/10 px-3 py-1.5 rounded-full">
                                    <Zap size={14} className="text-yellow-400" />
                                    <span className="font-semibold">{weapon.damage}</span>
                                    <span className="text-xs text-gray-300">DMG</span>
                                </div>
                            )}
                            
                            {/* Munición para ranged */}
                            {!isMelee && weapon.ammo && (
                                <div className="flex items-center gap-1.5 text-sm text-white bg-white/10 px-3 py-1.5 rounded-full">
                                    <Shield size={14} className="text-blue-400" />
                                    <span className="font-semibold">{weapon.ammo}</span>
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

            {/* Efecto de sombra exterior - usando style para colores dinámicos */}
            <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    boxShadow: `
                        0 25px 50px -12px ${getShadowColor(rarityName)}
                    `
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

export default WeaponCard;