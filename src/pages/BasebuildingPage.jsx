import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import BasebuildingCard from '@/components/wiki/BasebuildingCard';
import BasebuildingDetailModal from '@/components/wiki/BasebuildingDetailModal';
import NpcDetailModal from '@/pages/NpcsPage';
import { AnimatePresence } from 'framer-motion';
import WikiCategoryLayout from '@/components/wiki/WikiCategoryLayout';

const CATEGORIES = [
    { id: "Items", name: "Items" }, 
    { id: "Storage", name: "Storage" },
    { id: "Walls", name: "Walls" },
    { id: "Doors", name: "Doors" }, 
    { id: "Window", name: "Window" },
    { id: "Lighting", name: "Lighting" },
    { id: "Tents", name: "Tents" }
];

const BasebuildingPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    
    const fetchItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('basebuilding_items')
            .select('*, rarity:rarities(name, color)')
            .order('name');
        
        if (error) {
            console.error("Error fetching basebuilding items:", error);
        } else {
            setItems(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, activeCategory, searchTerm]);
    
    const handleNpcSelect = (npc) => {
        setSelectedItem(null); 
        setSelectedNpc(npc); 
    };

    return (
        <>
            <Helmet>
                <title>Basebuilding Items - Dead Matter Wiki</title>
                <meta name="description" content="Explore all basebuilding items, storage, structures, and tents available in Dead Matter." />
            </Helmet>
            <WikiCategoryLayout
                title="Basebuilding Items"
                filters={CATEGORIES}
                activeFilter={activeCategory}
                setActiveFilter={setActiveCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            >
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredItems.map((item, index) => (
                                <BasebuildingCard 
                                    key={item.id} 
                                    item={item} 
                                    index={index} 
                                    onClick={() => setSelectedItem(item)}
                                />
                            ))}
                        </div>
                        {filteredItems.length === 0 && (
                            <div className="text-center py-16 text-gray-400">
                                <h3 className="text-2xl font-bold mb-2">No items found</h3>
                                <p>Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </WikiCategoryLayout>
            
            {selectedItem && (
                <BasebuildingDetailModal 
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onNpcSelect={handleNpcSelect}
                />
            )}
            <AnimatePresence>
                {selectedNpc && <NpcDetailModal npc={selectedNpc} onClose={() => setSelectedNpc(null)} />}
            </AnimatePresence>
        </>
    );
};

export default BasebuildingPage;