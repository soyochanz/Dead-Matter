import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const WikiCard = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <BookOpen className="h-8 w-8 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
          <p className="text-gray-400 text-sm mb-3">{item.description}</p>
          {item.category && (
            <span className="inline-block px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs">
              {item.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WikiCard;
