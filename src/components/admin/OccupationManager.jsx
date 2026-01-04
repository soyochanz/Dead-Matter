import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const OccupationForm = ({ item, onSave, onCancel }) => {
    const defaultState = { name: '', description: '', points: 0, effects: { attributes: {}, skills: {}, stats: {} } };
    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (item) {
            setFormData({ ...defaultState, ...item, effects: item.effects || defaultState.effects });
        } else {
            setFormData(defaultState);
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleEffectsChange = (e) => {
        const { value } = e.target;
        try {
            const parsedEffects = JSON.parse(value);
            setFormData(prev => ({ ...prev, effects: parsedEffects }));
        } catch (error) {
            // Handle JSON parsing error if needed, maybe show a toast
        }
    };
    
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    
    const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";
    const formLabelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={formLabelClass}>Name</label><input name="name" value={formData.name} onChange={handleChange} className={formInputClass} required/></div>
                <div><label className={formLabelClass}>Points</label><input name="points" type="number" value={formData.points || 0} onChange={handleChange} className={formInputClass} /></div>
                <div className="md:col-span-2"><label className={formLabelClass}>Description</label><textarea name="description" value={formData.description || ''} onChange={handleChange} className={`${formInputClass} h-24`} /></div>
                <div className="md:col-span-2">
                    <label className={formLabelClass}>Effects (JSON)</label>
                    <textarea 
                        value={JSON.stringify(formData.effects, null, 2)} 
                        onChange={handleEffectsChange} 
                        className={`${formInputClass} h-48 font-mono`} 
                        placeholder='e.g., { "attributes": { "Strength": 1 }, "skills": { "Mechanics": 10 } }'
                    />
                </div>
            </div>
            <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" onClick={onCancel} variant="outline">Cancel</Button></div>
        </form>
    );
};

const OccupationManager = () => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('occupations').select('*').order('name');
        if (error) toast({ title: "Error", description: "Could not load occupations.", variant: "destructive" });
        else setItems(data); setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSave = async (item) => {
        const { id, ...itemData } = item;
        const { error } = id ? await supabase.from('occupations').update(itemData).eq('id', id) : await supabase.from('occupations').insert(itemData);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Saved!", description: "Occupation saved." }); setShowForm(false); setEditingItem(null); loadItems(); }
    };
    
    const handleDelete = async (id) => {
        const { error } = await supabase.from('occupations').delete().eq('id', id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted!", description: "Occupation deleted." }); loadItems(); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Manage Occupations</h2><Button onClick={() => { setEditingItem(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> New Occupation</Button></div>
            {showForm && <OccupationForm item={editingItem} onSave={handleSave} onCancel={() => setShowForm(false)} />}
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                <div className="grid gap-4">{items.map(item => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <span className="font-bold text-xl text-white">{item.name}</span>
                            <span className={`ml-4 font-bold ${item.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>{item.points >= 0 ? `+${item.points}` : item.points} points</span>
                        </div>
                        <div className="flex gap-2"><Button onClick={() => { setEditingItem(item); setShowForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button><Button onClick={() => handleDelete(item.id)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                ))}</div>
            )}
        </div>
    );
};

export default OccupationManager;