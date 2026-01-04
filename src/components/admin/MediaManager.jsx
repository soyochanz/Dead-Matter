import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MediaForm from '@/components/admin/MediaForm';
import { supabase } from '@/lib/customSupabaseClient';

const MediaManager = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Could not load media items.", variant: "destructive" });
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSave = async (item) => {
    const { id, ...itemData } = item;
    const { error } = id ? 
        await supabase.from('media_items').update(itemData).eq('id', id) : 
        await supabase.from('media_items').insert(itemData);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: `Media item ${id ? 'updated' : 'created'}.` });
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    }
  };

  const handleDelete = async (item) => {
    if (item.image_path) {
        await supabase.storage.from('Items').remove([item.image_path]);
    }
    const { error } = await supabase.from('media_items').delete().eq('id', item.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted!", description: "Media item deleted successfully" });
      loadItems();
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Media</h2>
        <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4" />
          New Media Item
        </Button>
      </div>

      {showForm && (
        <MediaForm
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                {item.author && (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <User className="h-4 w-4" />
                        <span>{item.author}</span>
                    </div>
                )}
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(item)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(item)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManager;