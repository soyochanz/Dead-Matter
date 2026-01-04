import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MediaForm = ({ item, onSave, onCancel }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState(
    item || { title: '', type: 'image', url: '', description: '', image_path: '', meta_name: '', author: profile?.username || '' }
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  
  const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
  
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
        setFormData(prev => ({ ...prev, url: publicUrl, image_path: filePath }));
    }
    setUploading(false);
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
        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={formInputClass}>
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
                {uploading && <Loader2 className="h-5 w-5 animate-spin"/>}
            </div>
        )}
        <input type="url" placeholder={formData.type === 'image' ? "Or paste image URL" : "Paste video URL"} value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className={formInputClass} required />
        {formData.url && formData.type === 'image' && <img src={formData.url} alt="Preview" className="mt-4 h-32 w-auto object-cover rounded-md bg-gray-700" />}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${formInputClass} min-h-[100px]`} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700">{item ? 'Update' : 'Create'}</Button>
        <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
      </div>
    </form>
  );
};

export default MediaForm;