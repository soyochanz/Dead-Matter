import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Weight, Box, Hammer, Info, DollarSign, TrendingUp, Tent, TentTree } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';

const StatItem = ({ icon, label, value, unit, color }) => {
    const IconComponent = icon;
    return (
        <div className="bg-black/30 p-4 rounded-lg flex items-center gap-4">
            <div className="p-2 bg-black/30 rounded-full" style={{ color }}>
                <IconComponent size={24} />
            </div>
            <div>
                <div className="text-sm text-gray-400">{label}</div>
                <div className="text-lg font-bold text-white">{value} {unit}</div>
            </div>
        </div>
    );
};

const RequirementsList = ({ requirements }) => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!requirements || requirements.length === 0) return;
            const materialIds = requirements.map(r => r.item_id);
            const { data, error } = await supabase
                .from('crafting_materials')
                .select('id, name, image_url')
                .in('id', materialIds);
            
            if (error) {
                console.error("Error fetching materials", error);
            } else {
                const materialsMap = data.reduce((acc, mat) => {
                    acc[mat.id] = mat;
                    return acc;
                }, {});
                setMaterials(materialsMap);
            }
        };
        fetchMaterials();
    }, [requirements]);

    if (!requirements || requirements.length === 0) {
        return <div className="text-gray-400">This item is not craftable.</div>;
    }

    return (
        <div className="space-y-3">
            {requirements.map((req, i) => {
                const material = materials[req.item_id];
                return (
                    <div key={i} className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
                        <img src={material?.image_url || 'https://via.placeholder.com/40'} alt={material?.name} className="w-10 h-10 object-contain rounded bg-black/30" />
                        <div className="font-semibold text-white">
                            <span className="text-red-400">{req.quantity}x</span> {material?.name || 'Loading...'}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const BasebuildingDetailModal = ({ item, onClose, onNpcSelect }) => {
    const [isUnpacked, setIsUnpacked] = useState(false);
    const [showNpcSellers, setShowNpcSellers] = useState(false);
    const isTent = item.category === 'Tents';
    const imageToShow = isTent && isUnpacked ? item.image_unpacked_url : item.image_url;
    
    const rarityColor = item.rarity?.color || '#9ca3af';
    
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }} className="bg-gradient-to-br from-gray-900 to-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-8 relative">
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"><X size={24} /></button>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Column: Image */}
                            <div className="flex flex-col">
                                <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center p-4 mb-4 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20" style={{background: `radial-gradient(circle at 50% 50%, ${rarityColor} 0%, transparent 70%)`}} />
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={imageToShow}
                                            src={imageToShow || 'https://via.placeholder.com/300'}
                                            alt={item.name}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="max-h-full max-w-full object-contain relative z-10"
                                        />
                                    </AnimatePresence>
                                </div>
                                {isTent && (
                                     <Button onClick={() => setIsUnpacked(!isUnpacked)} variant="outline" className="w-full">
                                        {isUnpacked ? <><Tent size={16} className="mr-2"/>Show Packed</> : <><TentTree size={16} className="mr-2"/>Show Unpacked</>}
                                    </Button>
                                )}
                            </div>

                            {/* Right Column: Details */}
                            <div>
                                <span className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: rarityColor }}>{item.rarity?.name || 'Common'}</span>
                                <h2 className="text-4xl font-bold text-white mt-3 mb-2">{item.name}</h2>
                                <p className="text-gray-400 mb-6">{item.description || "No description available."}</p>
                                
                                <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg mb-6">
                                    <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-white/10 p-1 rounded-md" onClick={() => setShowNpcSellers(true)}>
                                        <DollarSign className="w-5 h-5 text-red-400" />
                                        <span className="text-gray-300">Buy Price:</span>
                                        <span className="font-bold text-white">{item.price ? `$${item.price}`: 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Sell Price:</span>
                                        <span className="font-bold text-white">{item.sell_price ? `$${item.sell_price}` : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {item.health && <StatItem icon={Heart} label="Health" value={item.health} color="#22c55e" />}
                                        {item.weight && <StatItem icon={Weight} label="Weight" value={item.weight} unit="kg" color="#a8a29e" />}
                                        {item.slots && <StatItem icon={Box} label="Slots" value={item.slots} color="#3b82f6" />}
                                    </div>
                                    
                                    {item.use && (
                                        <div>
                                            <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Info size={18}/> Use</h4>
                                            <p className="text-gray-300 bg-black/20 p-4 rounded-lg">{item.use}</p>
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Hammer size={18}/> Requirements</h4>
                                        <div className="bg-black/20 p-4 rounded-lg">
                                            <RequirementsList requirements={item.requirements} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            {showNpcSellers && <NpcSellersModal itemType="basebuilding_items" itemId={item.id} onClose={() => setShowNpcSellers(false)} onNpcSelect={onNpcSelect} />}
        </AnimatePresence>
    );
};

export default BasebuildingDetailModal;
