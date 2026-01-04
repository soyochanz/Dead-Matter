import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import WikiForm from '@/components/admin/WikiForm';
import { supabase } from '@/lib/customSupabaseClient';

const WikiManager = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('wiki_articles').select('*, wiki_subcategories(name, wiki_categories(name))').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Error", description: "Could not load wiki articles.", variant: "destructive" });
    } else {
      setItems(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSave = async (item) => {
    const { wiki_subcategories, ...itemData } = item;
    
    let error;
    if (editingItem) {
      ({ error } = await supabase.from('wiki_articles').update(itemData).eq('id', itemData.id));
      if (!error) toast({ title: "Updated!", description: "Article updated successfully" });
    } else {
      ({ error } = await supabase.from('wiki_articles').insert(itemData));
      if (!error) toast({ title: "Created!", description: "Article created successfully" });
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setShowForm(false);
      setEditingItem(null);
      loadItems();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('wiki_articles').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted!", description: "Article deleted successfully" });
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
        <h2 className="text-2xl font-bold text-white">Manage Wiki Articles</h2>
        <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {showForm && (
        <WikiForm
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
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                {item.wiki_subcategories && (
                  <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs">
                    {item.wiki_subcategories.wiki_categories.name} / {item.wiki_subcategories.name}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(item)} variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleDelete(item.id)} variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WikiManager;