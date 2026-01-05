import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import UpdateForm from '@/components/admin/UpdateForm';
import { supabase } from '@/lib/mySupabaseClient';

const UpdatesManager = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  /* Pagination State */
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);

  const loadItems = useCallback(async () => {
    setLoading(true);

    // First get total count
    const { count, error: countError } = await supabase
      .from('updates')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Error counting updates:", countError);
    } else {
      setTotalCount(count || 0);
    }

    // Then fetch paginated data
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('updates')
      .from('updates')
      .select('id, title, date, version, category, slug')
      .order('date', { ascending: false })
      .range(from, to);

    if (error) {
      toast({ title: "Error", description: "Could not load updates.", variant: "destructive" });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [toast, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSave = async () => {
    setShowForm(false);
    setEditingItem(null);
    loadItems();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('updates').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted!", description: "Update deleted successfully" });
      loadItems();
    }
  };

  const handleEdit = async (item) => {
    // Fetch full content on demand
    const { data, error } = await supabase
      .from('updates')
      .select('content, content_html')
      .eq('id', item.id)
      .single();

    if (error) {
      toast({ title: "Error", description: "Could not load update content.", variant: "destructive" });
      return;
    }

    setEditingItem({ ...item, ...data });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Updates</h2>
        {!showForm && (
          <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4" />
            New Update
          </Button>
        )}
      </div>

      {showForm && (
        <UpdateForm
          update={editingItem}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white truncate">{item.title}</h3>
                  <div className="flex gap-2 ml-4">
                    <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} variant="destructive" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 mb-3">
                  <span className="text-gray-500">{item.date}</span>
                  {item.version && (
                    <span className="inline-block px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full">
                      {item.version}
                    </span>
                  )}
                  <span className="inline-block px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full">
                    {item.category}
                  </span>
                </div>

                <div className="text-sm text-gray-400">
                  {/* Content summary removed for performance */}
                  Click edit to view content details.
                </div>

              </div>

            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between py-4 border-t border-white/5 mt-4">
            <span className="text-sm text-gray-400">
              Page {page + 1} of {Math.ceil(totalCount / pageSize)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatesManager;
