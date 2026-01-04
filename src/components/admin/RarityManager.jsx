import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const RarityForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', color: '#9ca3af' });

    useEffect(() => {
        if (item) setFormData({ name: item.name, color: item.color });
        else setFormData({ name: '', color: '#9ca3af' });
    }, [item]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...item, ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">{item ? 'Edit' : 'New'} Rarity</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({...prev, color: e.target.value}))}
                    className="w-full h-10 bg-transparent border-none cursor-pointer"
                    required
                />
            </div>
            <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Save</Button>
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>
        </form>
    );
};


const RarityManager = () => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('rarities').select('*').order('created_at');
        if (error) toast({ title: "Error", description: "Could not load rarities.", variant: "destructive" });
        else setItems(data);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSave = async (item) => {
        const { id, ...itemData } = item;
        const { error } = id
            ? await supabase.from('rarities').update(itemData).eq('id', id)
            : await supabase.from('rarities').insert(itemData);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Saved!", description: "Rarity saved." });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('rarities').delete().eq('id', id);
        if (error) toast({ title: "Error", description: `Could not delete: ${error.message}`, variant: "destructive" });
        else {
            toast({ title: "Deleted!", description: "Rarity deleted." });
            loadItems();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Rarities</h2>
                <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4" /> New Rarity
                </Button>
            </div>

            {showForm && <RarityForm item={editingItem} onSave={handleSave} onCancel={() => setShowForm(false)} />}

            {loading ? <Loader2 className="h-8 w-8 animate-spin text-red-500" /> : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="font-bold text-xl text-white">{item.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setEditingItem(item); setShowForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button onClick={() => handleDelete(item.id)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RarityManager;