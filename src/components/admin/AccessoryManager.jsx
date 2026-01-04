import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Upload, Gem, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';

const accessoryTypes = ['Sights', 'Muzzle', 'Grip', 'Magazine', 'Stock', 'Other'];

const AccessoryForm = ({ item, onSave, onCancel }) => {
    const defaultState = { name: '', type: accessoryTypes[0], image_url: '', image_path: '', rarity_id: null, price: 0, sell_price: 0, damage_modifier: 0, rate_of_fire_modifier: 0, accuracy_modifier: 0, capacity_modifier: 0 };
    const [formData, setFormData] = useState(defaultState);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchRarities = async () => {
            const { data } = await supabase.from('rarities').select('*');
            setRarities(data || []);
        };
        fetchRarities();
    }, []);

    useEffect(() => {
        if (item) setFormData({ ...defaultState, ...item });
        else setFormData(defaultState);
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
        const filePath = `public/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        }
        setUploading(false);
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    
    const formSelectClass = "w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm";
    const formLabelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={formLabelClass}>Name</label><Input name="name" value={formData.name} onChange={handleChange} required/></div>
                <div><label className={formLabelClass}>Type</label><select name="type" value={formData.type} onChange={handleChange} className={formSelectClass}>{accessoryTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                <div><label className={formLabelClass}><DollarSign className="inline-block mr-1 h-4 w-4"/>Buy Price</label><Input name="price" type="number" value={formData.price || 0} onChange={handleChange} /></div>
                <div><label className={formLabelClass}><DollarSign className="inline-block mr-1 h-4 w-4"/>Sell Price</label><Input name="sell_price" type="number" value={formData.sell_price || 0} onChange={handleChange} /></div>
                <div className="md:col-span-2"><label className={formLabelClass}><Gem className="inline-block mr-1 h-4 w-4"/>Rarity</label><select name="rarity_id" value={formData.rarity_id || ''} onChange={handleChange} className={formSelectClass}><option value="">Select Rarity</option>{rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div><label className={formLabelClass}>Damage</label><Input name="damage_modifier" type="number" value={formData.damage_modifier || 0} onChange={handleChange} /></div>
                <div><label className={formLabelClass}>Rate of Fire</label><Input name="rate_of_fire_modifier" type="number" value={formData.rate_of_fire_modifier || 0} onChange={handleChange} /></div>
                <div><label className={formLabelClass}>Accuracy</label><Input name="accuracy_modifier" type="number" value={formData.accuracy_modifier || 0} onChange={handleChange} /></div>
                <div><label className={formLabelClass}>Capacity</label><Input name="capacity_modifier" type="number" value={formData.capacity_modifier || 0} onChange={handleChange} /></div>
            </div>
            <div>
                <label className={formLabelClass}>Image</label>
                <div className="flex items-center gap-4">
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2"><Upload /> Upload</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-md" />}
                </div>
            </div>
            <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" onClick={onCancel} variant="outline">Cancel</Button></div>
        </form>
    );
};


const AccessoryManager = () => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('accessories').select('*, rarity:rarities(name, color)').order('created_at');
        if (error) toast({ title: "Error", description: "Could not load accessories.", variant: "destructive" });
        else setItems(data); setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSave = async (item) => {
        const { id, rarity, ...itemData } = item;
        const { error } = id ? await supabase.from('accessories').update(itemData).eq('id', id) : await supabase.from('accessories').insert(itemData);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Saved!", description: "Accessory saved." }); setShowForm(false); setEditingItem(null); loadItems(); }
    };
    
    const handleDelete = async (item) => {
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        await supabase.from('weapon_attachments').delete().eq('accessory_id', item.id);
        const { error } = await supabase.from('accessories').delete().eq('id', item.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted!", description: "Accessory deleted." }); loadItems(); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Manage Accessories</h2><Button onClick={() => { setEditingItem(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> New Accessory</Button></div>
            {showForm && <AccessoryForm item={editingItem} onSave={handleSave} onCancel={() => setShowForm(false)} />}
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                <div className="grid gap-4">{items.map(item => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {item.image_url && <img src={item.image_url} alt={item.name} className="h-12 w-12 object-cover rounded-md" />}
                            <div>
                                <span className="font-bold text-xl text-white">{item.name}</span>
                                <span className="text-xs ml-2 px-2 py-1 rounded bg-gray-600">{item.type}</span>
                                {item.rarity && <span className="text-xs ml-2 px-2 py-1 rounded" style={{ backgroundColor: item.rarity.color }}>{item.rarity.name}</span>}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => { setEditingItem(item); setShowForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                            <Button onClick={() => handleDelete(item)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}</div>
            )}
        </div>
    );
};

export default AccessoryManager;