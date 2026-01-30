import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const UpdateCard = ({ update, index, versionTag }) => {
  const { t, i18n } = useTranslation();

  // Get localized title
  const lang = i18n.language;
  const localizedTitle = lang.startsWith('es')
    ? (update.title_es || update.title)
    : lang.startsWith('pt')
      ? (update.title_pt || update.title)
      : (update.title_en || update.title);

  // Fallback logic in case DB migration hasn't propagated to client cache yet, though usually it's fast.
  // Ideally, all updates now have a slug.
  const targetLink = update.slug ? `/updates/${update.slug}` : `/updates`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-[#0a0a0c] backdrop-blur-3xl border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 flex flex-col group shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <Link to={targetLink} className="hover:text-red-400 transition-colors">
            <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">{localizedTitle}</h3>
          </Link>
          {versionTag}
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Calendar className="h-4 w-4" />
          {new Date(update.date).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {index === 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {t('updates.latest_tag')}
            </span>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {/* Text summary fallback or removed for cleaner look if no content is fetched */}
          {t('updates.click_view', { version: update.version })}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="outline" className="gap-2 border-white/20 hover:bg-white/10 hover:text-white group-hover:border-red-500/50 transition-all">
          <Link to={targetLink}>
            {t('updates.read_full')}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default UpdateCard;
