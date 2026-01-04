import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const UpdateCard = ({ update, index, versionTag }) => {
  const contentToParse = update.content_html || update.content || '';
  const summary = contentToParse ? new DOMParser().parseFromString(contentToParse, 'text/html').body.textContent.substring(0, 150) + '...' : '';
  
  // Fallback logic in case DB migration hasn't propagated to client cache yet, though usually it's fast.
  // Ideally, all updates now have a slug.
  const targetLink = update.slug ? `/updates/${update.slug}` : `/updates`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 flex flex-col group"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <Link to={targetLink} className="hover:text-red-400 transition-colors">
            <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">{update.title}</h3>
          </Link>
          {versionTag}
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Calendar className="h-4 w-4" />
          {new Date(update.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        <p className="text-gray-300 text-sm line-clamp-3">{summary}</p>
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="outline" className="gap-2 border-white/20 hover:bg-white/10 hover:text-white group-hover:border-red-500/50 transition-all">
            <Link to={targetLink}>
                Read Full Update
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default UpdateCard;
