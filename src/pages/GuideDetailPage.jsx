import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, ThumbsUp, MessageSquare, User, Calendar, ShieldAlert, Send, ArrowLeft, BookOpen, Clock, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const GuideDetailPage = () => {
  // Change guideId to slug as per new routing
  const { slug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const turnstileRef = useRef();

  const [guide, setGuide] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [reportReason, setReportReason] = useState('');
  const [isReportDialogOpen, setReportDialogOpen] = useState(false);

  const [captchaToken, setCaptchaToken] = useState('');

  const fetchGuideAndComments = useCallback(async () => {
    setLoading(true);

    // First fetch the guide by slug
    const { data: guideData, error: guideError } = await supabase
      .from('guides')
      .select('*, author:profiles(username)')
      .eq('slug', slug) // Use slug for lookup
      .eq('status', 'approved')
      .single();

    if (guideError || !guideData) {
      console.error('Error fetching guide:', guideError);
      setLoading(false);
      return;
    }

    setGuide(guideData);
    setLikeCount(guideData.likes_count || 0);

    // Use the retrieved guide.id for related data like comments and likes
    const { data: commentsData, error: commentsError } = await supabase
      .from('guide_comments')
      .select('*, author:profiles(username)')
      .eq('guide_id', guideData.id)
      .order('created_at', { ascending: true });

    if (!commentsError) setComments(commentsData);

    if (user) {
      const { data: likeData } = await supabase
        .from('guide_likes')
        .select('*')
        .eq('guide_id', guideData.id)
        .eq('user_id', user.id)
        .single();

      if (likeData) setIsLiked(true);
    }

    setLoading(false);
  }, [slug, user]); // Depend on slug instead of guideId

  useEffect(() => {
    fetchGuideAndComments();
  }, [fetchGuideAndComments]);

  const handleLike = async () => {
    if (!user || !guide) {
      toast({ variant: 'destructive', title: 'Login required', description: 'You must be logged in to like a guide.' });
      return;
    }

    if (isLiked) {
      await supabase.from('guide_likes').delete().match({ guide_id: guide.id, user_id: user.id });
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      await supabase.from('guide_likes').insert({ guide_id: guide.id, user_id: user.id });
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (!user || !guide) {
      toast({ variant: 'destructive', title: 'Login required' });
      return;
    }

    if (!captchaToken) {
      return toast({ variant: 'destructive', title: 'CAPTCHA Required', description: 'Please complete the CAPTCHA.' });
    }

    const { error } = await supabase.from('guide_comments').insert({
      guide_id: guide.id,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Error posting comment' });
    } else {
      setNewComment('');
      setCaptchaToken('');
      turnstileRef.current?.reset();
      fetchGuideAndComments();
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) return;
    if (!user || !guide) {
      toast({ variant: "destructive", title: "Login required" });
      return;
    }

    const { error } = await supabase.from('guide_reports').insert({
      guide_id: guide.id,
      reported_by: user.id,
      reason: reportReason,
    });

    if (!error) {
      toast({ title: 'Report submitted', description: 'An admin will review this guide.' });
      setReportDialogOpen(false);
      setReportReason('');
    } else {
      toast({ variant: 'destructive', title: 'Error submitting report' });
    }
  };

  const getGuideColor = (title) => {
    const colors = [
      'from-red-600 to-orange-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-emerald-600',
      'from-purple-600 to-pink-600',
      'from-yellow-600 to-amber-600',
      'from-indigo-600 to-purple-600'
    ];
    const index = title?.length % colors.length || 0;
    return colors[index];
  };

  const getLocalizedContent = () => {
    if (!guide) return {};
    const lang = i18n.language;

    if (lang.startsWith('es')) {
      return {
        title: guide.title_es || guide.title,
        description: guide.description_es || guide.description,
        content: guide.content_es || guide.content_html
      };
    } else if (lang.startsWith('pt')) {
      return {
        title: guide.title_pt || guide.title,
        description: guide.description_pt || guide.description,
        content: guide.content_pt || guide.content_html
      };
    }

    // Default: English (main columns)
    return {
      title: guide.title,
      description: guide.description,
      content: guide.content_html
    };
  };

  const localized = getLocalizedContent();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading survival guide...</p>
        </div>
      </div>
    );

  if (!guide)
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-20">
          <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Guide Not Found</h3>
            <p className="text-gray-400 mb-6">This guide may have been removed or is not approved yet.</p>
            <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600">
              <Link to="/guides">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guides
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <Helmet>
        <title>{localized.title} - Dead Matter Wiki</title>
        <meta name="description" content={localized.description || 'Community guide for Dead Matter'} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5">
            <Link to="/guides">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${getGuideColor(guide.title)} opacity-10 rounded-3xl -z-10`} />

          <div className="relative overflow-hidden rounded-2xl mb-8">
            {guide.image_url && (
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                <div className={`absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10`} />
                <img
                  className="w-full h-full object-cover"
                  alt={guide.title}
                  src={guide.image_url}
                />
                <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-20`} />
              </div>
            )}

            <div className="relative z-30 px-8 -mt-20">
              <div className="bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/5 rounded-[1.5rem] p-8 shadow-2xl">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {localized.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <User size={16} className="text-red-400" />
                    <span className="font-medium">{guide.author?.username || 'Anonymous'}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <Calendar size={16} className="text-blue-400" />
                    <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <ThumbsUp size={16} className="text-green-400" />
                    <span>{likeCount} likes</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <MessageSquare size={16} className="text-purple-400" />
                    <span>{comments.length} comments</span>
                  </div>
                </div>

                {/* Hashtags Display */}
                {guide.hashtags && Array.isArray(guide.hashtags) && guide.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.hashtags.map((tag, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {localized.description && (
                  <p className="text-gray-400 text-lg leading-relaxed border-t border-white/10 pt-4">
                    {localized.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0a0a0c]/50 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-8 mb-8 shadow-xl"
          >
            <div className="prose prose-invert prose-lg max-w-none">
              <div
                className="guide-content"
                dangerouslySetInnerHTML={{ __html: localized.content }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-between items-center gap-4 mb-12 p-8 bg-[#0a0a0c] border border-white/5 rounded-[2rem] shadow-xl"
          >
            <Button
              onClick={handleLike}
              className={`flex items-center gap-3 ${isLiked
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
            >
              <ThumbsUp size={20} />
              <span>{isLiked ? 'Liked' : 'Like This Guide'} ({likeCount})</span>
            </Button>

            <Dialog open={isReportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-300">
                  <ShieldAlert size={18} className="mr-2" /> Report Guide
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Report Guide</DialogTitle>
                </DialogHeader>
                <Textarea
                  placeholder="Please explain why you're reporting this guide..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="bg-gray-800 border-white/20 text-white"
                />
                <DialogFooter>
                  <Button variant="destructive" onClick={handleReportSubmit}>
                    Submit Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-xl bg-gradient-to-r ${getGuideColor(guide.title)}`}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Community Comments</h2>
              <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                {comments.length}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4 items-start group"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${getGuideColor(comment.author?.username)} flex items-center justify-center font-bold text-white text-lg`}>
                      {comment.author?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-[1.5rem] p-6 group-hover:border-white/20 transition-all duration-300 shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-white">{comment.author?.username || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Comments Yet</h3>
                  <p className="text-gray-400">Be the first to share your thoughts on this guide!</p>
                </div>
              )}
            </div>

            {user ? (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                onSubmit={handleCommentSubmit}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 group hover:border-white/20 transition-all duration-300"
              >
                <Textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or provide feedback..."
                  className="bg-transparent border-0 focus-visible:ring-0 p-0 text-white placeholder:text-gray-400 text-lg min-h-[120px] resize-none"
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey="0x4AAAAAACBDztgzMpZW91QL"
                    onSuccess={setCaptchaToken}
                    onExpire={() => setCaptchaToken('')}
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 shadow-lg"
                    disabled={!captchaToken}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Post Comment
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl"
              >
                <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Join the Discussion</h3>
                <p className="text-gray-400 mb-6">Log in to share your thoughts and connect with other survivors.</p>
                <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600">
                  <Link to="/login">Login or Register</Link>
                </Button>
              </motion.div>
            )}
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center border-t border-white/10 pt-8"
          >
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
              <Link to="/guides">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Guides
              </Link>
            </Button>
          </motion.div>
        </motion.article>
      </div>
    </>
  );
};

export default GuideDetailPage;
