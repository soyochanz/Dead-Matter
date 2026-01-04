import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

const WikiCategoryCard = ({ category, itemCount, index }) => {
  const IconComponent = Icons[category.icon_name] || Icons.HelpCircle;
  const isTool = ['Perks', 'NPCs', 'Meds', 'Basebuilding'].includes(category.name);
  const isDisabled = itemCount === 0 && !isTool;
  const path = `/wiki/${category.name.toLowerCase().replace(' ', '-')}`;

  // Colores temáticos para cada categoría
  const getCategoryColor = (categoryName) => {
    const colors = {
      'Weapons': 'from-red-600 to-orange-600',
      'Gear': 'from-blue-600 to-cyan-600',
      'Toolbelts': 'from-yellow-600 to-amber-600',
      'Consumables': 'from-green-600 to-emerald-600',
      'Accessories': 'from-purple-600 to-pink-600',
      'Keys': 'from-gray-600 to-slate-600',
      'Meds': 'from-green-500 to-teal-500',
      'Vehicles': 'from-orange-600 to-red-600',
      'Perks': 'from-purple-600 to-indigo-600',
      'NPCs': 'from-rose-600 to-pink-600',
      'Basebuilding': 'from-stone-600 to-neutral-600'
    };
    return colors[categoryName] || 'from-gray-600 to-slate-600';
  };

  const cardContent = (
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
      className={`relative overflow-hidden group cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
      {/* Efecto de fondo con gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(category.name)} opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />

      {/* Efecto de borde luminoso */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryColor(category.name)} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm group-hover:blur-md`} />

      <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-sm rounded-2xl group-hover:border-white/20 transition-all duration-300 h-full">
        {/* Partícula decorativa */}
        <div className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-r ${getCategoryColor(category.name)} rounded-full opacity-60 group-hover:scale-150 group-hover:opacity-100 transition-all duration-300`} />

        <div className="p-8 flex flex-col items-center text-center h-full justify-between">
          {/* Icono con efecto */}
          <div className={`relative mb-6 p-4 rounded-2xl bg-gradient-to-br ${getCategoryColor(category.name)} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <IconComponent
              className="w-16 h-16 text-white"
              strokeWidth={1.5}
            />
            {/* Efecto de brillo en el icono */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Contenido de texto */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
              {category.name}
            </h3>

            {/* Badge de cantidad */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${isDisabled
                ? 'bg-gray-700/50 text-gray-400'
                : `bg-gradient-to-r ${getCategoryColor(category.name)} text-white shadow-lg`
              }`}>
              <span className="flex items-center gap-2">
                {isTool ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Available
                  </>
                ) : itemCount > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </>
                ) : (
                  'No items'
                )}
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          {!isDisabled && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center mt-4 text-white/80 group-hover:text-white transition-colors duration-300"
            >
              <span className="text-sm font-semibold mr-2">Explore</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </motion.div>
          )}
        </div>

        {/* Efecto de hover en la parte inferior */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getCategoryColor(category.name)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
      </div>

      {/* Efecto de sombra exterior */}
      <div className={`absolute inset-0 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDisabled ? '' : `shadow-${getCategoryColor(category.name).split('-')[1]}-900/50`
        }`} />
    </motion.div>
  );

  return isDisabled ? (
    <div className="h-full">{cardContent}</div>
  ) : (
    <Link to={path} className="h-full block">{cardContent}</Link>
  );
};

const Wiki = () => {
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

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header mejorado */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Dead Matter Item Categories
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Browse every category in the Dead Matter Wiki including weapons, gear, consumables, toolbelts, accessories, vehicles, NPCs, perks and more.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading survival database...</p>
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