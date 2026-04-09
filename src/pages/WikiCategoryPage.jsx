import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2 } from 'lucide-react';
import WeaponCard from '@/components/wiki/WeaponCard';
import WeaponDetailModal from '@/components/wiki/WeaponDetailModal';
import ConsumableCard from '@/components/wiki/ConsumableCard';
import ConsumableDetailModal from '@/components/wiki/ConsumableDetailModal';
import GearCard from '@/components/wiki/GearCard';
import GearDetailModal from '@/components/wiki/GearDetailModal';
import ToolbeltCard from '@/components/wiki/ToolbeltCard';
import ToolbeltDetailModal from '@/components/wiki/ToolbeltDetailModal';
import VehicleCard from '@/components/wiki/VehicleCard';
import VehicleDetailModal from '@/components/wiki/VehicleDetailModal';
import KeyCard from '@/components/wiki/KeyCard';
import KeyDetailModal from '@/components/wiki/KeyDetailModal';
import NpcDetailModal from '@/pages/NpcsPage';
import WikiCategoryLayout from '@/components/wiki/WikiCategoryLayout';
import { slugify } from '@/utils/slugify';


const WikiCategoryPage = ({ category, customTitle, customSubtitle, customDescription, extraHeadElements }) => {
    const { t } = useTranslation();
    const { categoryName: paramCategoryName, itemSlug } = useParams();
    const navigate = useNavigate();

    // Prefer prop 'category', fallback to url param
    const activeCategory = category || paramCategoryName;

    const [pageTitle, setPageTitle] = useState(customTitle || '');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedNpc, setSelectedNpc] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!activeCategory) return;

            setLoading(true);
            setActiveFilter('all');
            setSearchTerm('');

            const normalizedCategoryName = activeCategory.toLowerCase().replace('-', ' ');
            const title = normalizedCategoryName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            if (!customTitle) {
                // Try to get translation, fallback to formatted title
                const translatedTitle = t(`home.shortcuts.${activeCategory.toLowerCase()}`, title);
                setPageTitle(translatedTitle);
            }

            let catData, catError;

            const dynamicCats = ['toolbelts', 'basebuilding'];

            if (dynamicCats.includes(activeCategory.toLowerCase())) {
                catData = { name: title, wiki_subcategories: [] };
                catError = null;
            } else {
                ({ data: catData, error: catError } = await supabase
                    .from('wiki_categories')
                    .select(`name, wiki_subcategories(id, name)`)
                    .ilike('name', title)
                    .single());
            }

            if (catError && catError.code !== 'PGRST116') { // Ignore "No rows found"
                console.error("Error fetching category", catError);
            }

            const fetchedSubcategories = catData?.wiki_subcategories || [];

            let fetchedItems = [];
            let queryError = null;

            const tables = {
                weapons: '*, rarity:rarities(*), subcategory:wiki_subcategories(id, name)',
                gear: '*, rarity:rarities(*), subcategory:wiki_subcategories(id, name)',
                toolbelts: '*, rarity:rarities(*)',
                keys: '*, rarity:rarities(*)',
                vehicles: '*, subcategory:wiki_subcategories(id, name)',
                consumables: '*, rarity:rarities(*)',
                accessories: '*, rarity:rarities(*), subcategory:wiki_subcategories(id, name)',
            };

            const tableName = tables[activeCategory.toLowerCase()] ? activeCategory.toLowerCase() : null;

            if (tableName) {
                let query = supabase.from(tableName).select(tables[tableName]);
                if (activeCategory.toLowerCase() === 'consumables') {
                    query = query.in('type', ['food', 'drink']);
                    const { data: cookedItemsData } = await supabase.from('consumables').select('cooked_version_id').not('cooked_version_id', 'is', null);
                    const cookedItemIds = cookedItemsData?.map(item => item.cooked_version_id) || [];
                    if (cookedItemIds.length > 0) query = query.not('id', 'in', `(${cookedItemIds.join(',')})`);

                    if (fetchedSubcategories.length === 0) {
                        setSubcategories([{ id: 'food', name: 'Food' }, { id: 'drink', name: 'Drinks' }]);
                    }
                }
                else {
                    setSubcategories(fetchedSubcategories);
                }

                const { data, error } = await query;
                if (error) queryError = error; else fetchedItems = data.map(i => ({ ...i, itemType: activeCategory.toLowerCase() }));
            } else {
                // For pages like meds, npcs, perks that have their own dedicated page component, 
                // if we ended up here without a dedicated component prop usage
                if (!category) {
                    navigate(`/wiki/${activeCategory.toLowerCase()}`);
                }
                return;
            }

            if (queryError) console.error(queryError);
            setItems(fetchedItems);

            // AUTO SELECT ITEM FROM SLUG FOR SEO
            if (itemSlug && fetchedItems.length > 0) {
                const itemBySlug = fetchedItems.find(i => 
                    (i.slug || slugify(i.name) || i.id.toString()) === itemSlug
                );
                if (itemBySlug) setSelectedItem(itemBySlug);
            }
            setLoading(false);
        };

        fetchData();
    }, [activeCategory, navigate, customTitle, category, itemSlug, t]);

    const handleNpcSelect = (npc) => {
        setSelectedItem(null);
        setSelectedNpc(npc);
    };

    const filteredItems = useMemo(() => {
        let categoryFiltered = [];
        if (activeFilter === 'all') {
            categoryFiltered = items;
        } else {
            if (activeCategory.toLowerCase() === 'consumables') {
                categoryFiltered = items.filter(item => item.type === activeFilter);
            } else {
                const subcategoryIdField = activeCategory.toLowerCase() === 'accessories' ? 'type' : 'subcategory.id';
                const filterValue = activeCategory.toLowerCase() === 'accessories' ? subcategories.find(s => s.id === activeFilter)?.name : activeFilter;

                categoryFiltered = items.filter(item => {
                    const itemValue = subcategoryIdField.split('.').reduce((o, i) => o ? o[i] : null, item);
                    return itemValue === filterValue;
                });
            }
        }
        if (!searchTerm) return categoryFiltered;
        return categoryFiltered.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, activeFilter, searchTerm, activeCategory, subcategories]);

    const itemComponents = {
        weapons: { Card: WeaponCard, Modal: WeaponDetailModal },
        gear: { Card: GearCard, Modal: GearDetailModal },
        consumables: { Card: ConsumableCard, Modal: ConsumableDetailModal },
        keys: { Card: KeyCard, Modal: KeyDetailModal },
        toolbelts: { Card: ToolbeltCard, Modal: ToolbeltDetailModal },
        vehicles: { Card: VehicleCard, Modal: VehicleDetailModal },
        accessories: { Card: WeaponCard, Modal: WeaponDetailModal }, // Re-using for now, can be specific later
    };

    // Default to a generic card if specific one is not found
    const { Card, Modal } = itemComponents[activeCategory.toLowerCase()] || { Card: () => null, Modal: () => null };

    const cardItemProp = {
        weapons: 'weapon',
        gear: 'gear',
        consumables: 'consumable',
        accessories: 'weapon', // accessories use weapon card
        vehicles: 'item',
        keys: 'item',
        toolbelts: 'item'
    }[activeCategory.toLowerCase()] || 'item';

    // ─── SEO LOGIC ───────────────────────────────────────────────────────────
    const currentItemTitle = selectedItem?.name || pageTitle;
    const finalHelmetTitle = selectedItem 
        ? `${currentItemTitle} - Dead Matter ${pageTitle} Wiki & Stats`
        : `Dead Matter ${pageTitle} Wiki - Full Item List & Stats`;

    const metaDescription = selectedItem 
        ? `Detailed stats, info and locations for ${currentItemTitle} in Dead Matter. ${selectedItem.description?.substring(0, 100)}...`
        : customDescription || (activeCategory.toLowerCase() === 'weapons'
            ? t('wiki_category_page.meta_weapons_desc', { defaultValue: 'Explore all Dead Matter weapons including rifles, pistols, and melee stats.' })
            : t('wiki_category_page.meta_generic_desc', { title: pageTitle, defaultValue: `All ${pageTitle} available in Dead Matter. Stats, locations and wiki guide.` }));

    return (
        <>
            <Helmet>
                <title>{finalHelmetTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={finalHelmetTitle} />
                <meta property="og:description" content={metaDescription} />
                {selectedItem?.image_url && <meta property="og:image" content={selectedItem.image_url} />}
                {/* Render extraHeadElements directly as children, not inside a fragment if possible, though React 18 usually handles arrays fine. */}
                {extraHeadElements}
            </Helmet>
            <WikiCategoryLayout
                title={pageTitle}
                filters={subcategories}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            >
                {customSubtitle && (
                    <div className="mb-8 -mt-4 text-lg text-gray-400 font-medium text-center">
                        {customSubtitle}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {Card && filteredItems.map((item, index) => (
                                <Card 
                                    key={item.id} 
                                    {...{ [cardItemProp]: item }} 
                                    index={index} 
                                    onClick={() => {
                                        setSelectedItem(item);
                                        const itemSlugUrl = item.slug || slugify(item.name) || item.id;
                                        navigate(`/wiki/${activeCategory.toLowerCase()}/${itemSlugUrl}`);
                                    }} 
                                />
                            ))}
                        </div>
                        {!loading && filteredItems.length === 0 && (
                            <p className="text-gray-400 text-center py-10">{t('wiki_category_page.no_items')}</p>
                        )}
                    </>
                )}
            </WikiCategoryLayout>

            <AnimatePresence>
                {selectedItem && Modal && (
                    <Modal
                        {...{ [cardItemProp]: selectedItem }}
                        onClose={() => {
                            setSelectedItem(null);
                            navigate(`/wiki/${activeCategory.toLowerCase()}`);
                        }}
                        onNpcSelect={handleNpcSelect}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedNpc && <NpcDetailModal npc={selectedNpc} onClose={() => setSelectedNpc(null)} />}
            </AnimatePresence>
        </>
    );
};

export default WikiCategoryPage;
