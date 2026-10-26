import WikiSearch from '@/components/wiki/WikiSearch';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import * as Icons from 'lucide-react';
import CoreSeo, { useCoreLanguage } from '@/components/CoreSeo';
import GameResources from '@/components/GameResources';
import CategoryTile from '@/components/CategoryTile';

const WikiCategoryCard = ({ category, itemCount, language }) => {
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(language);
  const IconComponent = Icons[category.icon_name] || Icons.HelpCircle;
  const isTool = ['Perks', 'NPCs', 'Meds', 'Basebuilding'].includes(category.name);
  const isDisabled = itemCount === 0 && !isTool;
  const path = `${language === 'en' ? '' : '/' + language}/wiki/${category.name.toLowerCase().replace(' ', '-')}`;

  return <CategoryTile
    category={category.name}
    title={t(`home.shortcuts.${category.name.toLowerCase()}`, category.name)}
    icon={IconComponent}
    to={path}
    description={t(`category_descriptions.${category.name.toLowerCase()}`, t('category_descriptions.default'))}
    status={itemCount == null ? t('wiki_page.explore') : isDisabled ? t('wiki_page.coming_soon') : itemCount > 0 ? t('wiki_page.item_count_plural', { count: itemCount }) : t('wiki_page.available')}
    action={t('wiki_page.explore')}
    disabled={isDisabled}
  />;
};

const Wiki = () => {
  const language = useCoreLanguage();
  const { i18n } = useTranslation();
  const t = i18n.getFixedT(language);
  const [categories, setCategories] = useState(() => ['Weapons', 'Gear', 'Toolbelts', 'Consumables', 'Meds', 'Keys', 'Vehicles', 'NPCs', 'Perks', 'Basebuilding'].map((name, id) => ({ id: `initial-${id}`, name, icon_name: { Weapons: 'Sword', Gear: 'Shirt', Toolbelts: 'Wrench', Consumables: 'Apple', Meds: 'HeartPulse', Keys: 'Key', Vehicles: 'Car', NPCs: 'Users', Perks: 'Sparkles', Basebuilding: 'Hammer' }[name] })));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('wiki_categories')
        .select('id, name, icon_name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setLoading(false);
        return;
      }

      const additionalCategories = [
        { id: 'dynamic-toolbelts', name: 'Toolbelts', icon_name: 'Wrench' },
        { id: 'dynamic-basebuilding', name: 'Basebuilding', icon_name: 'Hammer' }
      ];

      const finalCategoriesData = [...categoriesData];
      for (const newCat of additionalCategories) {
        if (!categoriesData.some(cat => cat.name === newCat.name)) {
          finalCategoriesData.push(newCat);
        }
      }

      const categoryTableMap = {
        'Weapons': ['weapons'],
        'Gear': ['gear'],
        'Toolbelts': ['toolbelts'],
        'Consumables': ['consumables'],
        'Accessories': ['accessories'],
        'Keys': ['keys'],
        'Meds': [],
        'Vehicles': ['vehicles'],
        'Perks': ['perks'],
        'NPCs': ['npcs'],
        'Basebuilding': ['basebuilding_items'],
      };

      const countPromises = finalCategoriesData.map(async (cat) => {
        if (cat.name === 'Meds') {
          const [{ count: medicinesCount }, { count: diseasesCount }] = await Promise.all([
            supabase.from('medicines').select('id', { count: 'exact', head: true }),
            supabase.from('diseases').select('id', { count: 'exact', head: true })
          ]);
          return { ...cat, itemCount: (medicinesCount || 0) + (diseasesCount || 0) };
        }

        const tablesToCount = categoryTableMap[cat.name] || [];
        
        if (['Perks', 'NPCs', 'Basebuilding'].includes(cat.name)) {
          if (tablesToCount.length > 0) {
            const counts = await Promise.all(
              tablesToCount.map(table => supabase.from(table).select('id', { count: 'exact', head: true }))
            );
            const totalCount = counts.reduce((acc, { count }) => acc + (count || 0), 0);
            return { ...cat, itemCount: totalCount };
          }
          const { count } = await supabase.from(cat.name.toLowerCase().replace(' ', '_')).select('id', { count: 'exact', head: true });
          return { ...cat, itemCount: count || 0 };
        }

        if (tablesToCount.length > 0) {
          const counts = await Promise.all(
            tablesToCount.map(table => {
              let query = supabase.from(table).select('id', { count: 'exact', head: true });
              if (cat.name === 'Consumables') {
                query = query.in('type', ['food', 'drink']);
              }
              return query;
            })
          );
          const totalCount = counts.reduce((acc, { count }) => acc + (count || 0), 0);
          return { ...cat, itemCount: totalCount };
        }

        return { ...cat, itemCount: 0 };
      });

      const categoriesWithCounts = await Promise.all(countPromises);

      const uniqueCategories = [];
      const seenNames = new Set();
      for (const cat of categoriesWithCounts) {
        if (!seenNames.has(cat.name)) {
          uniqueCategories.push(cat);
          seenNames.add(cat.name);
        }
      }

      const order = ['Weapons', 'Gear', 'Toolbelts', 'Consumables', 'Meds', 'Accessories', 'Keys', 'Vehicles', 'NPCs', 'Perks', 'Basebuilding'];
      uniqueCategories.sort((a, b) => {
        const aIndex = order.indexOf(a.name);
        const bIndex = order.indexOf(b.name);
        if (aIndex > -1 && bIndex > -1) return aIndex - bIndex;
        if (aIndex > -1) return -1;
        if (bIndex > -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setCategories(uniqueCategories);
      setLoading(false);
    };

    fetchCategoriesAndCounts();
  }, []);

  return (
    <>
      <CoreSeo page="wiki" language={language} />

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header estilo Home Hero */}
          <div className="text-center mb-14 space-y-6">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase">
              Dead Matter <span className="text-red-500">Wiki</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('wiki_page.description')}
            </p>
          </div>

          <WikiSearch language={language} />
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">{t('wiki_page.loading')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map(category => (
                <WikiCategoryCard
                  key={category.id}
                  category={category}
                  language={language}
                  itemCount={category.itemCount}
                />
              ))}
            </div>
          )}
          <GameResources language={language} compact />
        </motion.div>
      </div>
    </>
  );
};

export default Wiki;
