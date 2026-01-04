import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Upload, Gem, DoorOpen, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';

const DoorForm = ({ door, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ door_description: '', door_image_url: '', door_image_path: '' });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        if (door) setFormData(door);
    }, [door]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `doors/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, door_image_url: publicUrl, door_image_path: filePath }));
        }
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 p-4 bg-black/20 rounded-lg space-y-2">
            <Input type="text" placeholder="Door Description" value={formData.door_description} onChange={e => setFormData(p => ({...p, door_description: e.target.value}))} required />
            <div className="flex items-center gap-2">
                <Button type="button" size="sm" onClick={() => fileInputRef.current.click()} disabled={uploading}>{uploading ? <Loader2 className="animate-spin"/> : <Upload/>}</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {formData.door_image_url && <img src={formData.door_image_url} alt="Door" className="h-10 w-10 rounded" />}
            </div>
            <div className="flex gap-2">
                <Button type="submit" size="sm">Save Door</Button>
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
};

const KeyForm = ({ item, onSave, onCancel }) => {
    const defaultState = { name: '', price: 0, sell_price: 0, rarity_id: null, spawn_locations: '', image_url: '', image_path: '' };
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
        if (error) { toast({ title: "Upload Error", description: error.message, variant: "destructive" });
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
         <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-lg space-y-6">
            <h3 className="text-2xl font-bold text-white">{item ? 'Edit Key' : 'New Key'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label className={formLabelClass}>Name</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label className={formLabelClass}><DollarSign className="inline-block mr-1 h-4 w-4"/>Buy Price</label>
                    <Input name="price" type="number" value={formData.price || 0} onChange={handleChange} />
                </div>
                <div>
                    <label className={formLabelClass}><DollarSign className="inline-block mr-1 h-4 w-4"/>Sell Price</label>
                    <Input name="sell_price" type="number" value={formData.sell_price || 0} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                    <label className={formLabelClass}><Gem className="inline-block mr-1 h-4 w-4"/>Rarity</label>
                    <select name="rarity_id" value={formData.rarity_id || ''} onChange={handleChange} className={formSelectClass}>
                        <option value="">Select Rarity</option>
                        {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className={formLabelClass}>Spawn Locations</label>
                    <textarea name="spawn_locations" value={formData.spawn_locations || ''} onChange={handleChange} className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm" />
                </div>
            </div>
             <div>
                <label className={formLabelClass}>Image</label>
                <div className="flex items-center gap-4">
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2"><Upload /> Upload</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-md" />}
                </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-white/10"><Button type="submit">Save Key</Button><Button type="button" onClick={onCancel} variant="outline">Cancel</Button></div>
        </form>
    );
};

const KeyManager = () => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [managingDoorsForKey, setManagingDoorsForKey] = useState(null);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('keys').select('*, rarity:rarities(name, color), doors:key_doors(*)').order('created_at');
        if (error) toast({ title: "Error", description: "Could not load keys.", variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSaveKey = async (item) => {
        const { id, rarity, doors, ...itemData } = item;
        const { error } = id ? await supabase.from('keys').update(itemData).eq('id', id) : await supabase.from('keys').insert(itemData);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Saved!", description: "Key saved." }); setShowForm(false); setEditingItem(null); loadItems(); }
    };
    
    const handleDeleteKey = async (item) => {
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        await supabase.from('key_doors').delete().eq('key_id', item.id);
        const { error } = await supabase.from('keys').delete().eq('id', item.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted!", description: "Key deleted." }); loadItems(); }
    };

    const handleSaveDoor = async (door) => {
        const { id, ...doorData } = door;
        const payload = { ...doorData, key_id: managingDoorsForKey.keyId };
        const { error } = managingDoorsForKey.doorId ? await supabase.from('key_doors').update(payload).eq('id', managingDoorsForKey.doorId) : await supabase.from('key_doors').insert(payload);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Saved!", description: "Door saved." }); setManagingDoorsForKey(null); loadItems(); }
    };

    const handleDeleteDoor = async (doorId, doorPath) => {
        if (doorPath) await supabase.storage.from('Items').remove([doorPath]);
        const { error } = await supabase.from('key_doors').delete().eq('id', doorId);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted!", description: "Door deleted." }); loadItems(); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-white">Manage Keys</h2><Button onClick={() => { setEditingItem(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> New Key</Button></div>
            {showForm && <KeyForm item={editingItem} onSave={handleSaveKey} onCancel={() => setShowForm(false)} />}
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                <div className="grid gap-4">{items.map(item => (
                    <div key={item.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {item.image_url && <img src={item.image_url} alt={item.name} className="h-12 w-12 object-cover rounded-md" />}
                                <div>
                                    <span className="font-bold text-xl text-white">{item.name}</span>
                                    {item.rarity && <span className="text-xs ml-2 px-2 py-1 rounded" style={{ backgroundColor: item.rarity.color }}>{item.rarity.name}</span>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setEditingItem(item); setShowForm(true);}} variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                                <Button onClick={() => handleDeleteKey(item)} variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-bold mb-2 text-white">Doors ({item.doors.length}) <Button size="sm" onClick={() => setManagingDoorsForKey({ keyId: item.id, doorId: null, door: null })}><Plus size={14}/></Button></h4>
                            <div className="space-y-2">
                                {item.doors.map(d => (
                                    <div key={d.id} className="flex justify-between items-center bg-black/20 p-2 rounded">
                                        <span className="text-gray-300">{d.door_description}</span>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => setManagingDoorsForKey({ keyId: item.id, doorId: d.id, door: d })}><Edit size={14}/></Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteDoor(d.id, d.door_image_path)}><Trash2 size={14}/></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {managingDoorsForKey?.keyId === item.id && <DoorForm door={managingDoorsForKey.door} onSave={handleSaveDoor} onCancel={() => setManagingDoorsForKey(null)} />}
                        </div>
                    </div>
                ))}</div>
            )}
        </div>
    );
};

export default KeyManager;