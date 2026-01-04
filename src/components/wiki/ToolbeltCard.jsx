import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Info, ArrowRight, Zap, Package } from 'lucide-react';

const ToolbeltCard = ({ item, index, onClick }) => {
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

    const rarityName = item.rarity?.name || 'Common';
    const { gradient, shadow } = getRarityStyles(rarityName);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={onClick}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-red-500/50 relative"
        >
            {/* Badges superiores similares a los vehicles */}
            <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap gap-2">
                {/* Badge de rareza */}
                <div className={`flex items-center gap-1.5 text-xs text-white bg-gradient-to-r ${gradient} backdrop-blur-sm px-2 py-1 rounded-full border border-white/20`} title="Rarity">
                    <Zap size={12} />
                    <span>{rarityName}</span>
                </div>
                
                {/* Badge de inventory slots si existe */}
                {item.inventory_slots > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-sky-300 bg-sky-900/50 backdrop-blur-sm px-2 py-1 rounded-full border border-sky-500/50" title="Inventory Slots">
                        <Package size={12} />
                        <span>{item.inventory_slots} Slots</span>
                    </div>
                )}
            </div>
            
            {/* Imagen del toolbelt */}
            <div className="h-48 bg-black/20 flex items-center justify-center overflow-hidden p-4 relative z-10">
                {item.image_url ? (
                    <img 
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        alt={item.name}
                        src={item.image_url} 
                    />
                ) : (
                    <Wrench className="w-24 h-24 text-gray-500 group-hover:scale-110 transition-transform"/>
                )}
            </div>

            {/* Contenido de la tarjeta */}
            <div className="p-4 relative z-10">
                <h3 className="text-lg font-bold text-white truncate mb-2">{item.name}</h3>
                
                {/* Sección use_function con el mismo estilo que use_case en vehicles */}
                {item.use_function && (
                    <div className="flex items-start gap-2 text-xs text-purple-300 mt-2 mb-3">
                        <Wrench size={14} className="flex-shrink-0 mt-px text-purple-400" />
                        <p className="line-clamp-2">{item.use_function}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">Toolbelt</span>
                    <div className="flex items-center gap-3">
                        {/* Puedes agregar más información aquí si es necesario */}
                        {item.capacity && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-300 bg-white/10 px-2 py-1 rounded-full" title="Capacity">
                                <Package size={14} />
                                <span>{item.capacity}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Efecto de hover en la parte inferior */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
        </motion.div>
    );
};

export default ToolbeltCard;