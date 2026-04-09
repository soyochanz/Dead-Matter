import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Video, Image } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { generateVideoThumbnail, dataURLtoBlob } from '@/lib/videoUtils';


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
  const fileInputRef = useRef(null);
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

    // Si es YouTube URL, generar thumbnail y metadatos automáticamente
    if (formData.type === 'video' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      thumbnail = getYouTubeThumbnail(url);
      
      // Actualizar URL y thumbnail inmediatamente
      setFormData(prev => ({
        ...prev,
        url: url,
        thumbnail: thumbnail || prev.thumbnail
      }));

      // Intentar obtener metadatos adicionales (Título y Autor)
      try {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (response.ok) {
            const data = await response.json();
            setFormData(prev => ({
              ...prev,
              title: prev.title || data.title || '',
              author: prev.author || data.author_name || '',
              thumbnail: data.thumbnail_url || thumbnail || prev.thumbnail
            }));
            
            toast({
              title: "YouTube Data Detected",
              description: `Title and Author populated automatically.`,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch YouTube metadata:", err);
      }

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
          variant: "default"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={formInputClass} required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
          <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className={formInputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Meta Name</label>
          <input type="text" value={formData.meta_name} onChange={(e) => setFormData({ ...formData, meta_name: e.target.value })} className={formInputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, url: '', thumbnail: '' })} className={formInputClass}>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Media URL</label>
        {formData.type === 'image' && (
          <div className="flex items-center gap-4 mb-2">
            <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2"><Upload /> Upload Image</Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
        )}
        <input
          type="url"
          placeholder={formData.type === 'image' ? "Or paste image URL" : "Paste YouTube or direct video URL"}
          value={formData.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={formInputClass}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail URL (Optional)</label>
        <input
          type="url"
          placeholder="Custom thumbnail URL (auto-generated for videos)"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          className={formInputClass}
        />
      </div>

      {formData.url && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/5">
          <label className="block text-sm font-medium text-gray-400 mb-2">Preview</label>
          <div className="relative aspect-video max-w-sm rounded-md overflow-hidden bg-gray-900 border border-white/10">
            {formData.type === 'image' ? (
              <img src={formData.url} alt="Preview" className="w-full h-full object-cover" />
            ) : formData.thumbnail || formData.url ? (
              <>
                <img src={formData.thumbnail || formData.url} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center p-2">
                  <Video className="w-12 h-12 text-white/50 mb-2" />
                  {!formData.thumbnail && (
                    <span className="text-[10px] text-orange-400 bg-black/60 px-2 py-1 rounded">
                      Generation Failed (CORS)
                    </span>
                  )}
                </div>
              </>
            ) : (

              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-700" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${formInputClass} min-h-[100px]`} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onCancel} variant="outline" className="border-white/10 text-gray-400">Cancel</Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-8" disabled={uploading}>
          {item ? 'Update Media' : 'Create Media'}
        </Button>
      </div>
    </form>
  );
};

export default MediaForm;

