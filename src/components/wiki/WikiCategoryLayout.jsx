import React from 'react';
import { Link } from 'react-router-dom';
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
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
            >
              {title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button asChild variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                <Link to="/wiki">
                  <ArrowLeft className="mr-2 h-4 w-4" /> 
                  Back to Categories
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Browse and discover all available {title.toLowerCase()} in the Dead Matter universe
          </motion.p>
        </div>

        {/* Filters and Search Section */}
        {(filters && filters.length > 0) || setSearchTerm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Filters */}
              {filters && filters.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Filter className="w-4 h-4 text-red-400" />
                    <span>Filter by:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeFilter === 'all' ? 'default' : 'outline'}
                      onClick={() => setActiveFilter('all')}
                      className={`
                        ${activeFilter === 'all' 
                          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-lg' 
                          : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }
                        transition-all duration-300
                      `}
                    >
                      All
                    </Button>
                    {filters.map((filter, index) => (
                      <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                      >
                        <Button
                          variant={activeFilter === filter.id ? 'default' : 'outline'}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`
                            ${activeFilter === filter.id 
                              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-lg' 
                              : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                            }
                            transition-all duration-300
                          `}
                        >
                          {filter.name}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search */}
              {setSearchTerm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="relative w-full lg:w-auto lg:min-w-[300px]"
                >
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-red-400 transition-colors duration-300 z-10" size={20} />
                    <Input
                      type="text"
                      placeholder={`Search ${title.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border-white/10 pl-10 pr-4 py-2 text-white placeholder:text-gray-400 
                                focus:bg-white/10 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50
                                transition-all duration-300 group-hover:border-white/20"
                    />
                    
                    {/* Efecto de gradiente en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Active Filters Info */}
            {(activeFilter !== 'all' || searchTerm) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10 text-sm text-gray-400"
              >
                <Filter className="w-4 h-4" />
                <span>Active filters:</span>
                {activeFilter !== 'all' && (
                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
                    {filters?.find(f => f.id === activeFilter)?.name}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    Search: "{searchTerm}"
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchTerm?.('');
                  }}
                  className="ml-auto text-xs text-gray-400 hover:text-white"
                >
                  Clear all
                </Button>
              </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex justify-center mt-12 pt-8 border-t border-white/10"
        >
          <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
            <Link to="/wiki">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wiki Categories
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WikiCategoryLayout;