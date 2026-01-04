import React from 'react';
import { motion } from 'framer-motion';
import { Car, Users, Package, Wrench, ArrowRight, Fuel, Gauge } from 'lucide-react';

const VehicleCard = ({ item, index, onClick }) => {
    if (!item) {
        return null;
    }

    // Safely access properties with optional chaining and provide default values.
    const isTowable = item.subcategory?.name?.toLowerCase().includes('towable') || false;
    const name = item.name || 'Unknown Vehicle';
    const imageUrl = item.image_url;
    const capacity = item.capacity;
    const inventorySlots = item.inventory_slots || 0;
    const subcategoryName = item.subcategory?.name || 'N/A';
    const useCase = item.use_case;
    const occupants = item.occupants;
    const speed = item.speed;
    const fuelCapacity = item.fuel_capacity;

    // Función para obtener los colores basados en el tipo de vehículo
    const getVehicleStyles = (vehicleType) => {
        const styles = {
            'towable': {
                gradient: 'from-purple-600 to-violet-600',
                shadow: 'shadow-purple-900/50',
                icon: Package
            },
            'car': {
                gradient: 'from-blue-600 to-cyan-600',
                shadow: 'shadow-blue-900/50',
                icon: Car
            },
            'truck': {
                gradient: 'from-orange-600 to-amber-600',
                shadow: 'shadow-orange-900/50',
                icon: Users
            },
            'default': {
                gradient: 'from-gray-600 to-slate-600',
                shadow: 'shadow-gray-900/50',
                icon: Car
            }
        };
        
        if (isTowable) return styles['towable'];
        if (subcategoryName.toLowerCase().includes('truck')) return styles['truck'];
        if (subcategoryName.toLowerCase().includes('car')) return styles['car'];
        return styles['default'];
    };

    const vehicleType = isTowable ? 'towable' : 
                       subcategoryName.toLowerCase().includes('truck') ? 'truck' :
                       subcategoryName.toLowerCase().includes('car') ? 'car' : 'default';
    
    const { gradient, shadow, icon: VehicleIcon } = getVehicleStyles(vehicleType);

    // Filtrar stats válidos para mostrar
    const validStats = [
        !isTowable && occupants != null && occupants > 0 && {
            icon: Users,
            value: occupants,
            color: 'text-green-400'
        },
        speed && speed > 0 && {
            icon: Gauge,
            value: speed,
            color: 'text-red-400'
        },
        fuelCapacity && fuelCapacity > 0 && {
            icon: Fuel,
            value: fuelCapacity,
            color: 'text-yellow-400'
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
                
                {/* Imagen del vehículo */}
                <div className="relative h-40 bg-black/20 flex items-center justify-center p-6 overflow-hidden">
                    {/* Overlay de gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
                    
                    {imageUrl ? (
                        <img 
                            className="relative z-20 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                            alt={name}
                            src={imageUrl} 
                        />
                    ) : (
                        <div className={`relative z-20 p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            <VehicleIcon className="w-16 h-16 text-white" strokeWidth={1.5} />
                        </div>
                    )}
                    
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />

                    {/* Badges superiores */}
                    <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap gap-2">
                        {isTowable && capacity && (
                            <div className="flex items-center gap-1.5 text-xs text-white bg-blue-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-blue-500/50 shadow-lg">
                                <Package size={12} />
                                <span className="font-semibold">{capacity}</span>
                            </div>
                        )}
                        {inventorySlots > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-white bg-sky-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-sky-500/50 shadow-lg">
                                <Package size={12} />
                                <span className="font-semibold">{inventorySlots}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6 flex-grow flex flex-col">
                    {/* Nombre y tipo */}
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                            {name}
                        </h3>
                        
                        {/* Badge de tipo */}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-4 bg-gradient-to-r ${gradient} text-white shadow-lg`}>
                            <div className="w-2 h-2 bg-white rounded-full mr-2" />
                            {subcategoryName}
                        </div>

                        {/* Use Case para towables */}
                        {isTowable && useCase && (
                            <div className="flex items-start gap-2 text-sm text-purple-200 mt-2 mb-3">
                                <Wrench size={14} className="flex-shrink-0 mt-0.5 text-purple-300" />
                                <p className="line-clamp-2 leading-relaxed">{useCase}</p>
                            </div>
                        )}
                    </div>

                    {/* Stats del vehículo */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 min-h-[3rem]">
                        <div className="flex items-center gap-2">
                            {validStats.length > 0 ? (
                                validStats.map((stat, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-center gap-1.5 text-sm text-white bg-white/10 px-3 py-1.5 rounded-full"
                                    >
                                        <stat.icon size={14} className={stat.color} />
                                        <span className="font-semibold">{stat.value}</span>
                                    </div>
                                ))
                            ) : (
                                // Espacio reservado para mantener la altura consistente
                                <div className="opacity-0">
                                    <div className="flex items-center gap-1.5 text-sm px-3 py-1.5">
                                        <Users size={14} />
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
                        0 25px 50px -12px ${getShadowColor(vehicleType)}
                    `
                }}
            />
        </motion.div>
    );
};

// Función auxiliar para obtener colores de sombra
const getShadowColor = (vehicleType) => {
    const shadowColors = {
        'towable': 'rgba(147, 51, 234, 0.5)',
        'car': 'rgba(37, 99, 235, 0.5)',
        'truck': 'rgba(245, 158, 11, 0.5)',
        'default': 'rgba(75, 85, 99, 0.5)'
    };
    
    return shadowColors[vehicleType] || shadowColors['default'];
};

export default VehicleCard;