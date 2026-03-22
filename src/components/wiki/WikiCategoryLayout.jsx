import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const WikiCategoryLayout = ({
  title,
  children,
  filters,
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm,
  renderExtra,
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative max-w-7xl mx-auto px-4 py-8">
      {/* Technical background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[2px] w-8 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Link to="/wiki" className="text-white/40 hover:text-white transition-colors">Wiki</Link>
                  <span className="text-white/20">/</span>
                  <span className="text-red-500">{title}</span>
                </nav>
              </div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter"
              >
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i === 0 ? 'text-white' : 'text-white/20'}>{word} </span>
                ))}
                <span className="sr-only">Dead Matter {title} Wiki</span>
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button asChild variant="outline" className="h-12 border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl px-6">
                <Link to="/wiki">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('wiki_layout.return_to_wiki')}
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-400 text-lg max-w-3xl font-medium"
          >
            Browse and discover detailed information about <span className="text-white italic">{title.toLowerCase()}</span> within the Dead Matter universe.
          </motion.p>
        </div>

        {/* Filters and Search Section */}
        {(filters && filters.length > 0) || setSearchTerm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              {/* Filters */}
              {filters && filters.length > 0 && (
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Filter className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('wiki_layout.filter')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`
                        px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500
                        ${activeFilter === 'all'
                          ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                          : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      {t('wiki_layout.all_types')}
                    </button>
                    {filters.map((filter, index) => (
                      <motion.button
                        key={filter.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`
                          px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500
                          ${activeFilter === filter.id
                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                          }
                        `}
                      >
                        {filter.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              {setSearchTerm && (
                <div className="w-full lg:w-auto flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-3 h-3 text-red-500" />
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('wiki_layout.search')}</span>
                  </div>
                  <div className="relative group min-w-[320px]">
                    <Input
                      type="text"
                      placeholder={t('wiki_layout.search_placeholder', { title: title.toLowerCase() })}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 bg-white/5 border-white/10 pl-6 pr-4 py-2 text-white font-bold placeholder:text-gray-600 
                                rounded-xl focus:bg-white/10 focus:border-red-500/50 focus:ring-0
                                transition-all duration-500"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Active Filters Info */}
            {(activeFilter !== 'all' || searchTerm) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10"
              >
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{t('wiki_layout.active_filters')}</span>
                <div className="flex flex-wrap gap-2">
                  {activeFilter !== 'all' && (
                    <span className="bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      Category: {filters?.find(f => f.id === activeFilter)?.name}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      Search: {searchTerm}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchTerm?.('');
                  }}
                  className="ml-auto text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                  {t('wiki_layout.clear_filters')} [X]
                </button>
              </motion.div>
            )}

            {renderExtra && (
              <div className="mt-8 pt-6 border-t border-white/5">
                {renderExtra()}
              </div>
            )}
          </motion.div>
        ) : null}

        {/* Content Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {children}
        </motion.div>

        {/* Bottom Navigation */}

      </motion.div>
    </div>
  );
};

export default WikiCategoryLayout;
