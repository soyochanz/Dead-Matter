import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import { ArrowLeft, Calendar, Tag, Loader2, Share2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UpdateDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdate = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('updates')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Update not found');

        setUpdate(data);
      } catch (err) {
        console.error('Error fetching update:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdate();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading update...</p>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-500/10 p-6 rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Update Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The update you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/updates">Back to Updates</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{update.title} - Dead Matter Updates</title>
        <meta name="description" content={`Read the full patch notes for ${update.title}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button 
                asChild 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover:bg-white/5 gap-2 pl-0"
            >
              <Link to="/updates">
                <ArrowLeft className="h-4 w-4" />
                Back to Updates
              </Link>
            </Button>
          </div>

          {/* Main Content Card */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
             {/* Hero / Header Section */}
             <div className="relative p-8 md:p-12 border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/5 z-0" />
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
                            <Calendar className="h-3.5 w-3.5 text-red-400" />
                            {new Date(update.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </span>
                        {update.version && (
                            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-sm text-blue-400 font-medium">
                                <Tag className="h-3.5 w-3.5" />
                                {update.version}
                            </span>
                        )}
                        {update.category && (
                             <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 capitalize">
                                {update.category}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                        {update.title}
                    </h1>
                </div>
             </div>

             {/* Content Body */}
             <div className="p-8 md:p-12 bg-black/20">
                <div 
                    className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-red-400 prose-li:text-gray-300 prose-strong:text-white prose-img:rounded-xl prose-video:rounded-xl max-w-none prose-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: update.content }}
                />
             </div>

             {/* Footer Actions */}
             <div className="p-6 border-t border-white/10 bg-white/5 flex justify-center">
                 <Button 
                    variant="outline" 
                    className="gap-2 border-white/20 hover:bg-white/10"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // Could add a toast here if imported
                    }}
                >
                    <Share2 className="h-4 w-4" />
                    Share Update
                 </Button>
             </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UpdateDetailPage;
