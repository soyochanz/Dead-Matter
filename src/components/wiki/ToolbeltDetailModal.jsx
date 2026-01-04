import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wrench, Weight, Ruler, Package, Cog, DollarSign, TrendingUp, ArrowRight, Store, Zap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';

const StatBar = ({ label, value, max, icon, color }) => {
    const percentage = max > 0 && value > 0 ? (value / max) * 100 : 0;
    const IconComponent = LucideIcons[icon] || null;

    return (
        <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    {IconComponent && <IconComponent className="w-5 h-5" style={{ color }} />}
                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{label}</span>
                </div>
                <span className="font-bold text-white text-lg">{value} / {max}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                <motion.div 
                    className="h-3 rounded-full relative"
                    style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </motion.div>
            </div>
        </div>
    );
};

const Stat = ({ icon: Icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div 
        className={`flex justify-between items-center text-sm py-3 px-4 rounded-xl transition-all duration-300 ${
            onClick ? 'cursor-pointer hover:bg-white/10 group' : 'bg-white/5'
        } ${className}`} 
        onClick={onClick}
    >
        <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
            {Icon && <Icon size={18} className="flex-shrink-0" />}
            <span className="font-medium">{label}</span>
        </div>
        <span className={`font-bold text-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
            {value}
        </span>
    </div>
);

const ToolbeltDetailModal = ({ item, onClose, onNpcSelect }) => {
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    if (!item) return null;
    
    // Función para obtener gradiente basado en rareza
    const getRarityGradient = (rarityName) => {
        const gradients = {
            'Common': 'from-gray-600 to-slate-600',
            'Uncommon': 'from-green-600 to-emerald-600',
            'Rare': 'from-blue-600 to-cyan-600',
            'Epic': 'from-purple-600 to-violet-600',
            'Legendary': 'from-orange-600 to-amber-600',
            'Mythic': 'from-red-600 to-rose-600'
        };
        return gradients[rarityName] || gradients['Common'];
    };

    const rarityGradient = getRarityGradient(item.rarity?.name);
    const rarityColor = item.rarity?.color || '#4b5563';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Efectos de fondo */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-20 rounded-3xl`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${rarityGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl`} />
                    
                    {/* Contenido principal */}
                    <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                        {/* Header con botón cerrar */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <motion.button 
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                            >
                                <X size={24} />
                            </motion.button>
                            
                            {/* Badge de rareza */}
                            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${rarityGradient} text-white font-bold text-sm shadow-lg flex items-center gap-2`}>
                                <div className="w-2 h-2 bg-white rounded-full" />
                                {item.rarity?.name || 'Common'}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Columna izquierda - Imagen y info básica */}
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="w-full aspect-square bg-black/20 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden mb-6"
                                    >
                                        {/* Efectos de fondo de imagen */}
                                        <div 
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                background: `radial-gradient(circle at 50% 50%, ${rarityColor} 0%, transparent 70%)`
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40" />
                                        
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name} 
                                                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-2xl" 
                                            />
                                        ) : (
                                            <div className={`relative z-20 p-6 rounded-2xl bg-gradient-to-br ${rarityGradient} shadow-lg`}>
                                                <Wrench className="w-24 h-24 text-white" />
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.h2 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold text-white text-center mb-3 leading-tight"
                                    >
                                        {item.name}
                                    </motion.h2>

                                    {item.description && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-gray-400 text-center leading-relaxed mb-4"
                                        >
                                            {item.description}
                                        </motion.p>
                                    )}
                                </div>
                                
                                {/* Columna derecha - Estadísticas */}
                                <div className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {/* Precios */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <Stat 
                                                icon={DollarSign} 
                                                label="Buy Price" 
                                                value={`${item.price || 0} $`} 
                                                colorClass="text-green-400" 
                                                onClick={() => setShowNpcSellers(true)}
                                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 cursor-pointer border border-green-500/20"
                                            />
                                            <Stat 
                                                icon={TrendingUp} 
                                                label="Sell Price" 
                                                value={`${item.sell_price || 'N/A'} $`} 
                                                colorClass="text-yellow-400"
                                                className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20"
                                            />
                                        </div>

                                        {/* Detalles principales */}
                                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                                <Wrench className="text-blue-400" />
                                                Toolbelt Details
                                            </h3>
                                            <div className="space-y-2">
                                                <Stat icon={Weight} label="Weight" value={`${item.weight || 0} kg`} colorClass="text-gray-300" />
                                                <Stat icon={Ruler} label="Size" value={item.size || 'N/A'} colorClass="text-gray-300" />
                                                {item.storage_capacity > 0 && (
                                                    <Stat icon={Package} label="Storage Capacity" value={`${item.storage_capacity} slots`} colorClass="text-cyan-400" />
                                                )}
                                                {item.use_function && (
                                                    <Stat icon={Cog} label="Use Function" value={item.use_function} colorClass="text-amber-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Estadísticas personalizadas */}
                                        {item.stats && item.stats.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                                className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-6"
                                            >
                                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                                    <Zap className="text-yellow-400" />
                                                    Special Attributes
                                                </h3>
                                                <div className="space-y-4">
                                                    {item.stats.map((stat, index) => (
                                                        <StatBar 
                                                            key={stat.label} 
                                                            label={stat.label} 
                                                            value={stat.value} 
                                                            max={stat.max} 
                                                            icon={stat.icon} 
                                                            color={stat.color} 
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Footer con botón de compra */}
                        <div className="p-6 border-t border-white/10 bg-black/20">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowNpcSellers(true)}
                                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-900/50 flex items-center justify-center gap-3"
                            >
                                <Store className="w-5 h-5" />
                                <span>Find NPC Sellers</span>
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            
            {/* Modal de vendedores NPC */}
            {showNpcSellers && (
                <NpcSellersModal 
                    itemType="toolbelts" 
                    itemId={item.id} 
                    onClose={() => setShowNpcSellers(false)} 
                    onNpcSelect={onNpcSelect} 
                />
            )}
        </AnimatePresence>
    );
};

export default ToolbeltDetailModal;
