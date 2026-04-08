import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, ArrowLeft, Image, Video, Filter, X, Play, Expand, User, Calendar, Download, ExternalLink, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { generateVideoThumbnail, dataURLtoBlob } from '@/lib/videoUtils';



// Componente Modal para vista ampliada
const MediaModal = ({ item, onClose }) => {
    if (!item) return null;

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYouTubeVideo = item.type === 'video' && extractYouTubeId(item.url);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-6xl max-h-[95vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Efectos de fondo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-3xl" />

                    <div className="relative bg-[#0a0a0c] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                        {/* Header */}
                        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                                >
                                    <X size={24} />
                                </motion.button>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {item.author && (
                                    <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                                        <User className="h-4 w-4 text-orange-400" />
                                        <span className="text-orange-300 font-semibold text-sm">by {item.author}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-gray-300">
                                    {item.type === 'image' ? (
                                        <Image className="h-4 w-4 text-blue-400" />
                                    ) : (
                                        <Video className="h-4 w-4 text-red-400" />
                                    )}
                                    <span className="text-sm capitalize">{item.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenido con Scroll */}
                        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                            {item.type === 'image' ? (
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    src={item.url}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                                />
                            ) : isYouTubeVideo ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full max-w-4xl aspect-video"
                                >
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(item.url)}?autoplay=1&rel=0&modestbranding=1`}
                                        title={item.title}
                                        className="w-full h-full rounded-2xl shadow-2xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full max-w-4xl"
                                >
                                    <video
                                        controls
                                        className="w-full rounded-2xl shadow-2xl"
                                        poster={item.thumbnail}
                                        autoPlay
                                    >
                                        <source src={item.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer con metadatos */}
                        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-white/10 bg-gray-900/50">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                {item.created_at && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                )}
                                {isYouTubeVideo && (
                                    <a
                                        href={item.video_url || item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-red-400 hover:text-red-300"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Watch on YouTube
                                    </a>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                                onClick={() => window.open(item.url, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Original
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Componente Formulario para Admin
const MediaForm = ({ item, onSave, onCancel }) => {
    const { profile } = useAuth();
    const [formData, setFormData] = useState(
        item || {
            title: '',
            type: 'image',
            url: '',
            description: '',
            image_path: '',
            meta_name: '',
            author: profile?.username || '',
            thumbnail: ''
        }
    );
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    const { toast } = useToast();

    const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

    // Extraer ID de video de YouTube
    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Generar thumbnail de YouTube
    const getYouTubeThumbnail = (url) => {
        const videoId = extractYouTubeId(url);
        if (!videoId) return '';
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Procesamiento de videos
        if (formData.type === 'video') {
            const videoId = extractYouTubeId(formData.url);

            if (videoId) {
                // Es video de YouTube
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                const thumbnail = getYouTubeThumbnail(formData.url);

                const processedData = {
                    ...formData,
                    url: embedUrl,
                    video_url: formData.url,
                    video_id: videoId,
                    thumbnail: formData.thumbnail || thumbnail
                };

                onSave(processedData);
                return;
            } else {
                // Es video directo (Discord, etc.)
                onSave(formData);
                return;
            }
        }

        onSave(formData);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `public/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({
                ...prev,
                url: publicUrl,
                image_path: filePath,
                thumbnail: file.type.startsWith('video/') ? '' : publicUrl
            }));
        }
        setUploading(false);
    };

    const handleUrlChange = async (url) => {
        let thumbnail = '';

        // Si es YouTube URL, generar thumbnail automáticamente
        if (formData.type === 'video' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            thumbnail = getYouTubeThumbnail(url);
            setFormData(prev => ({
                ...prev,
                url: url,
                thumbnail: thumbnail || prev.thumbnail
            }));
        } else if (formData.type === 'video' && (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm') || url.toLowerCase().includes('.mov') || url.includes('discordapp.net') || url.includes('cdn.discordapp.com'))) {

            // Es un video directo, intentar generar thumbnail
            setFormData(prev => ({ ...prev, url }));
            setUploading(true);
            try {
                const generatedThumbnailDataUrl = await generateVideoThumbnail(url);
                if (generatedThumbnailDataUrl) {
                    // Convertir a blob y subir a Storage
                    const blob = dataURLtoBlob(generatedThumbnailDataUrl);
                    const fileName = `thumb_${Date.now()}.jpg`;
                    const filePath = `public/thumbnails/${fileName}`;

                    const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, blob, {
                        contentType: 'image/jpeg'
                    });

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);

                    setFormData(prev => ({
                        ...prev,
                        thumbnail: prev.thumbnail || publicUrl
                    }));
                }
            } catch (err) {
                console.error("Failed to generate/upload thumbnail:", err);
                let detailedError = "Failed to generate video thumbnail. CORS might be restricted by the host.";
                if (err.message && err.message.includes("CORS")) {
                    detailedError = "CORS Error: Video host (e.g. Discord) is blocking frame capture. Please upload a manual thumbnail.";
                } else if (err.message && err.message.includes("timed out")) {
                    detailedError = "Timeout: Video took too long to load for thumbnail capture.";
                }

                toast({
                    title: "Thumbnail Warning",
                    description: detailedError,
                    variant: "default" // Using default instead of destructive to not look like a crash
                });
            } finally {
                setUploading(false);
            }
        } else {


            setFormData(prev => ({
                ...prev,
                url: url
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={formInputClass} required />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Name</label>
                <input type="text" value={formData.meta_name} onChange={(e) => setFormData({ ...formData, meta_name: e.target.value })} className={formInputClass} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className={formInputClass} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, url: '', thumbnail: '' })} className={formInputClass}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media</label>
                {formData.type === 'image' && (
                    <div className="flex items-center gap-4 mb-2">
                        <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2"><Upload /> Upload Image</Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>
                )}

                {formData.type === 'video' && (
                    <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-2">Paste YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)</p>
                    </div>
                )}

                <input
                    type="url"
                    placeholder={
                        formData.type === 'image'
                            ? "Or paste image URL"
                            : "Paste YouTube URL"
                    }
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={formInputClass}
                    required
                />

                {/* Vista previa */}
                {(formData.url || formData.thumbnail) && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                        {formData.type === 'image' ? (
                            <img
                                src={formData.url}
                                alt="Preview"
                                className="h-48 w-auto object-cover rounded-md bg-gray-700 border border-white/10"
                            />
                        ) : formData.type === 'video' && (formData.thumbnail || formData.url) ? (
                            <div className="relative">
                                <img
                                    src={formData.thumbnail || formData.url}
                                    alt="Video Thumbnail"
                                    className="h-48 w-full object-cover rounded-md bg-gray-700 border border-white/10"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Video className="w-12 h-12 text-white/50" />
                                </div>
                                <div className="mt-2 text-sm text-gray-400">
                                    {extractYouTubeId(formData.url) ? 'YouTube video detected' : 'Direct video detected'}
                                </div>
                            </div>

                        ) : formData.type === 'video' && formData.url ? (
                            <div className="h-48 bg-gray-800 rounded-md border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin text-red-500" />
                                        <p className="text-sm font-medium">Processing video...</p>
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-12 h-12 text-gray-600 mb-2" />
                                        <p className="text-gray-400 text-sm">Video URL detected.</p>
                                        {!formData.thumbnail && (
                                            <p className="text-xs text-orange-400 mt-2">
                                                Note: Some hosts block automatic thumbnails. <br />You may need to provide one manually below.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : null}

                    </div>
                )}
            </div>

            {/* Campo para thumbnail personalizado (opcional) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL (Optional)
                    <span className="text-xs text-gray-400 ml-2">Override auto-generated thumbnail</span>
                </label>
                <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className={formInputClass}
                    placeholder="Custom thumbnail URL"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${formInputClass} min-h-[100px]`} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={uploading}>
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (item ? 'Update' : 'Create')}
                </Button>
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>

        </form>
    );
};

// Componente principal Media
const Media = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const filters = [
        { key: 'all', label: 'All Media', icon: Filter, count: mediaItems.length },
        { key: 'image', label: 'Screenshots', icon: Image, count: mediaItems.filter(item => item.type === 'image').length },
        { key: 'video', label: 'Videos', icon: Video, count: mediaItems.filter(item => item.type === 'video').length }
    ];

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const loadItems = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('media_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching media items:', error);
            toast({ title: "Error", description: "Could not load media items.", variant: "destructive" });
        } else {
            const processedItems = (data || []).map(item => ({
                ...item,
                author: item.author || 'Community Member',
                thumbnail: item.thumbnail || (item.type === 'image' ? item.url : (item.type === 'video' ? `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg` : ''))
            }));
            setMediaItems(processedItems);
            setFilteredItems(processedItems);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    useEffect(() => {
        let filtered = mediaItems;
        if (activeFilter !== 'all') filtered = filtered.filter(item => item.type === activeFilter);
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.title?.toLowerCase().includes(query) || 
                item.description?.toLowerCase().includes(query) || 
                item.author?.toLowerCase().includes(query)
            );
        }
        setFilteredItems(filtered);
    }, [activeFilter, searchQuery, mediaItems]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
        hover: { y: -5, transition: { duration: 0.2 } }
    };

    const MediaCard = ({ item, index }) => {
        const isYouTubeVideo = item.type === 'video' && extractYouTubeId(item.url);

        return (
            <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={() => setSelectedMedia(item)}
                className="group relative cursor-pointer bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden hover:border-red-500/30 transition-all duration-500 shadow-2xl"
            >
                <div className="relative overflow-hidden aspect-video">
                    {item.type === 'image' ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <div className="relative w-full h-full">
                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                <div className="p-3 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform">
                                    <Video className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                        <h3 className="text-white font-black text-xl leading-tight mb-1">{item.title}</h3>
                        <div className="flex items-center gap-2 text-white/60 text-xs">
                            <User className="w-3 h-3" /> <span>{item.author}</span>
                            <span className="opacity-30">•</span>
                            <Calendar className="w-3 h-3" /> <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${
                            item.type === 'image' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                            {item.type}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen pb-20 bg-black">
            <Helmet>
                <title>Dead Matter Gallery - Screenshots, Videos & Clips</title>
                <meta name="description" content="Explore the latest Dead Matter screenshots, gameplay videos, and cinematic trailers. Join our community and browse high-quality game media." />
            </Helmet>

            <div className="max-w-[1600px] mx-auto px-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                    <div className="pt-12 mb-16 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group uppercase text-[10px] font-black tracking-[0.3em]">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Database
                        </Link>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-none mb-6">
                            MEDIA <span className="text-red-600">GALLERY</span>
                        </h1>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium leading-relaxed">
                            Browse the latest Dead Matter screenshots, gameplay clips, and developer trailers from our community.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto mb-16 space-y-8">
                        <div className="flex flex-wrap justify-center gap-3">
                            {filters.map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                        activeFilter === filter.key ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    {filter.label} <span className="ml-2 opacity-50">{filter.count}</span>
                                </button>
                            ))}
                        </div>
                        <div className="relative max-w-lg mx-auto group">
                            <input
                                type="text"
                                placeholder="Search content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 px-4 py-3 text-center text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition-all text-lg font-medium"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 text-red-600 animate-spin" /></div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
                            <p className="text-gray-600 font-black uppercase tracking-widest">No matching media files found</p>
                        </div>
                    ) : (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                            {filteredItems.map((item, index) => (
                                <MediaCard key={item.id} item={item} index={index} />
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            </div>
            <MediaModal item={selectedMedia} onClose={() => setSelectedMedia(null)} />
        </div>
    );
};

export default Media;
