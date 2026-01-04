import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Upload, HeartPulse, Gem, DollarSign, Droplet, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';

const MedicineForm = ({ item, onSave, onCancel }) => {
    const defaultState = {
        name: '', description: '', image_url: '', image_path: '', subcategory_id: null,
        health: 0, price: 0, sell_price: 0, rarity_id: null, side_effects: {},
        hydration: 0, energy: 0
    };

    const [formData, setFormData] = useState(defaultState);
    const [subcategories, setSubcategories] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const { data: subData } = await supabase.from('wiki_subcategories').select('id, name, wiki_categories(name)')
                .eq('wiki_categories.name', 'Meds');
            const { data: rarData } = await supabase.from('rarities').select('*');
            setSubcategories(subData || []);
            setRarities(rarData || []);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (item) {
            setFormData({
                ...defaultState,
                ...item,
                side_effects: item.side_effects || {},
                subcategory_id: item.subcategory_id || null,
            });
        } else {
            setFormData(defaultState);
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `medicines/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
            setUploading(false);
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const formSelectClass = "w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm";
    const formLabelClass = "block text-sm font-medium text-gray-300 mb-1";
    
    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className={formLabelClass}>Name</label>
                <Input name="name" placeholder="Item Name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="md:col-span-2">
                <label className={formLabelClass}>Subcategory (Optional)</label>
                <select name="subcategory_id" value={formData.subcategory_id || ''} onChange={handleChange} className={formSelectClass}>
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div>
                <label className={formLabelClass}><DollarSign className="inline mr-2 h-4 w-4"/>Buy Price</label>
                <Input name="price" type="number" value={formData.price || 0} onChange={handleChange} />
            </div>
            <div>
                <label className={formLabelClass}><DollarSign className="inline mr-2 h-4 w-4"/>Sell Price</label>
                <Input name="sell_price" type="number" value={formData.sell_price || 0} onChange={handleChange} />
            </div>
             <div className="md:col-span-2">
                <label className={formLabelClass}><Gem className="inline mr-2 h-4 w-4"/>Rarity</label>
                <select name="rarity_id" value={formData.rarity_id || ''} onChange={handleChange} className={formSelectClass}>
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            <div className="md:col-span-2">
                <label className={formLabelClass}>Description</label>
                <textarea name="description" placeholder="Item description..." value={formData.description || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm min-h-[80px]" />
            </div>

            <div className="grid grid-cols-3 gap-4 md:col-span-2">
                <div>
                     <label className={formLabelClass}><HeartPulse className="inline mr-2 h-4 w-4"/>Health</label>
                     <Input name="health" type="number" value={formData.health || 0} onChange={handleChange} />
                </div>
                <div>
                     <label className={formLabelClass}><Droplet className="inline mr-2 h-4 w-4"/>Hydration</label>
                     <Input name="hydration" type="number" value={formData.hydration || 0} onChange={handleChange} />
                </div>
                <div>
                     <label className={formLabelClass}><Sparkles className="inline mr-2 h-4 w-4"/>Energy</label>
                     <Input name="energy" type="number" value={formData.energy || 0} onChange={handleChange} />
                </div>
            </div>
           
            <div className="md:col-span-2">
                <label className={formLabelClass}>Side Effects (JSON)</label>
                <textarea name="side_effects" placeholder='{ "Drowsiness": "Reduces stamina regeneration" }' value={typeof formData.side_effects === 'object' ? JSON.stringify(formData.side_effects, null, 2) : formData.side_effects} onChange={(e) => setFormData(p => ({...p, side_effects: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm min-h-[80px]" />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-white/10">
                <label className={formLabelClass}>Image</label>
                <div className="flex items-center gap-4">
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-md bg-gray-700" />}
                </div>
            </div>

            <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Save</Button>
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>
        </form>
    );
};

const MedicineManager = ({ onSaveCallback }) => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('medicines').select('*, subcategory:wiki_subcategories(name), rarity:rarities(name, color)').order('created_at');

        if (error) toast({ title: "Error", description: "Could not load medicines.", variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSave = async (item) => {
        const { id, subcategory, rarity, ...itemData } = item;
        const dataToSubmit = { ...itemData };
        if (dataToSubmit.subcategory_id === '') dataToSubmit.subcategory_id = null;
        if (dataToSubmit.rarity_id === '') dataToSubmit.rarity_id = null;
        
        try {
            if (typeof dataToSubmit.side_effects === 'string' && dataToSubmit.side_effects.trim()) {
                dataToSubmit.side_effects = JSON.parse(dataToSubmit.side_effects);
            } else if (typeof dataToSubmit.side_effects === 'string' && !dataToSubmit.side_effects.trim()){
                 dataToSubmit.side_effects = {};
            }
        } catch(e) { 
            toast({ title: "Invalid JSON", description: "Side Effects format is not valid JSON.", variant: "destructive" });
            return;
        }

        const { error } = id
            ? await supabase.from('medicines').update(dataToSubmit).eq('id', id)
            : await supabase.from('medicines').insert(dataToSubmit);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Saved!", description: "Medicine saved." });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
            if(onSaveCallback) onSaveCallback();
        }
    };
    
    const handleDelete = async (item) => {
        if (item.image_path) {
            await supabase.storage.from('Items').remove([item.image_path]);
        }
        const { error } = await supabase.from('medicines').delete().eq('id', item.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Deleted!", description: "Medicine deleted." });
            loadItems();
             if(onSaveCallback) onSaveCallback();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Manage Medicines</h2>
                <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="gap-2 bg-red-600 hover:bg-red-700">
                    <Plus className="h-4 w-4" /> New Medicine
                </Button>
            </div>
            {showForm && <MedicineForm item={editingItem} onSave={handleSave} onCancel={() => setShowForm(false)} />}
            {loading ? <Loader2 className="h-8 w-8 animate-spin text-red-500" /> : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {item.image_url && <img src={item.image_url} alt={item.name} className="h-12 w-12 object-cover rounded-md" />}
                                <div>
                                    <span className="font-bold text-xl text-white">{item.name}</span>
                                    {item.rarity && item.rarity.name && <span className="text-xs ml-2 px-2 py-1 rounded" style={{backgroundColor: item.rarity.color || '#888'}}>{item.rarity.name}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setEditingItem(item); setShowForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button onClick={() => handleDelete(item)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicineManager;