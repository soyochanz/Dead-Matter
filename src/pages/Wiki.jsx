import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Sword, Car, Backpack, Hammer, Soup, Stethoscope, Users, Package, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

const WikiCategoryCard = ({ category, itemCount, index }) => {
  const { t } = useTranslation();
  const IconComponent = Icons[category.icon_name] || Icons.HelpCircle;
  const isTool = ['Perks', 'NPCs', 'Meds', 'Basebuilding'].includes(category.name);
  const isDisabled = itemCount === 0 && !isTool;
  const path = `/wiki/${category.name.toLowerCase().replace(' ', '-')}`;

  const getCategoryColor = (name) => {
    const colors = {
      'Weapons': 'text-red-500',
      'Vehicles': 'text-blue-500',
      'Gear': 'text-emerald-500',
      'Basebuilding': 'text-orange-500',
      'Consumables': 'text-yellow-500',
      'Meds': 'text-pink-500',
      'NPCs': 'text-purple-500',
      'Keys': 'text-slate-400',
    };
    return colors[name] || 'text-slate-400';
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isDisabled ? { y: -5, scale: 1.02 } : {}}
      className={`relative group flex flex-col h-full p-8 rounded-[2.5rem] bg-[#0a0a0c] border border-white/10 transition-all duration-500 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 hover:border-white/20 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]'
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="flex flex-col items-center gap-4 text-center h-full">
        <div className={`p-4 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300 ${getCategoryColor(category.name)}`}>
          <IconComponent size={32} />
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors uppercase tracking-tight">
            {t(`home.shortcuts.${category.name.toLowerCase()}`, category.name)}
          </h3>

          <div className={`text-xs font-bold uppercase tracking-wider ${isDisabled ? 'text-slate-500' : 'text-slate-400'}`}>
            {isTool ? (
              <span className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                {t('wiki_page.available')}
              </span>
            ) : itemCount > 0 ? (
              <span>{t('wiki_page.item_count_plural', { count: itemCount })}</span>
            ) : (
              t('wiki_page.coming_soon')
            )}
          </div>
        </div>

        {!isDisabled && (
          <div className="mt-4 flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {t('wiki_page.explore')} <ArrowRight size={10} />
          </div>
        )}
      </div>
    </motion.div>
  );

  return isDisabled ? (
    <div className="h-full">{cardContent}</div>
  ) : (
    <Link to={path} className="h-full block">{cardContent}</Link>
  );
};

const Wiki = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      setLoading(true);
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
          const { count: medicinesCount } = await supabase.from('medicines').select('id', { count: 'exact', head: true });
          const { count: diseasesCount } = await supabase.from('diseases').select('id', { count: 'exact', head: true });
          return { ...cat, itemCount: (medicinesCount || 0) + (diseasesCount || 0) };
        }

        if (['Perks', 'NPCs', 'Basebuilding'].includes(cat.name)) {
          const tablesToCount = categoryTableMap[cat.name];
          if (tablesToCount && tablesToCount.length > 0) {
            let totalCount = 0;
            for (const table of tablesToCount) {
              const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
              totalCount += count || 0;
            }
            return { ...cat, itemCount: totalCount };
          }
          const { count } = await supabase.from(cat.name.toLowerCase().replace(' ', '_')).select('id', { count: 'exact', head: true });
          return { ...cat, itemCount: count || 0 };
        }

        const tablesToCount = categoryTableMap[cat.name] || [];
        let totalCount = 0;

        for (const table of tablesToCount) {
          let query = supabase.from(table).select('id', { count: 'exact', head: true });

          if (cat.name === 'Consumables') {
            query = query.in('type', ['food', 'drink']);
          }

          const { count, error } = await query;
          if (!error && count) {
            totalCount += count;
          }
        }
        return { ...cat, itemCount: totalCount };
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
      <Helmet>
        <title>Dead Matter Items | Weapons, Gear, Consumables, Vehicles, NPCs & Full Wiki Database</title>

        <meta
          name="description"
          content="Explore the complete Dead Matter item database: weapons, gear, consumables, crafting items, accessories, toolbelts, vehicles, NPCs, perks, basebuilding items and more. All categories from the Dead Matter wiki in one place."
        />

        <link rel="canonical" href="https://deadmatterwiki.com/wiki" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header estilo Home Hero */}
          <div className="text-center mb-24 space-y-6">
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase">
              {t('wiki_page.title')} <span className="text-red-500">{t('wiki_page.title_suffix')}</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
              {t('wiki_page.description')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">{t('wiki_page.loading')}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <WikiCategoryCard
                  key={category.id}
                  category={category}
                  itemCount={category.itemCount}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Wiki;
