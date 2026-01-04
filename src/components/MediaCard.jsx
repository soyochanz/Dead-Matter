import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, User, Video, Play, Calendar } from 'lucide-react';

const MediaCard = ({ item, index, onPreview }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group cursor-pointer bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-300 h-96 flex flex-col" // Altura fija de 96 (384px)
      onClick={() => onPreview(item)}
    >
      {/* Imagen/Video Container - Tamaño fijo */}
      <div className="relative h-48 overflow-hidden bg-gray-900 flex items-center justify-center">
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={item.thumbnail || item.url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-500/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Play className="h-5 w-5 text-white ml-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Overlay con efectos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge de tipo */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
          {item.type === 'image' ? (
            <ImageIcon className="h-4 w-4 text-blue-400" />
          ) : (
            <Video className="h-4 w-4 text-red-400" />
          )}
        </div>
      </div>

      {/* Content Container - Altura fija */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Título */}
          <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
            {item.title}
          </h3>

          {/* Descripción */}
          {item.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Metadata footer */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            {item.author ? (
              <>
                <User className="h-4 w-4 text-orange-500" />
                <span className="text-orange-400 font-semibold text-sm">by {item.author}</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-500 text-sm">Unknown</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-xs">
            {item.created_at && (
              <>
                <Calendar className="h-3 w-3" />
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
};

export default MediaCard;
