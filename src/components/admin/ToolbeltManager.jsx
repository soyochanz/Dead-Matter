import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';

const ToolbeltManager = ({ sharedMetadata }) => {
    const [toolbelts, setToolbelts] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rarities, setRarities] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        if (sharedMetadata?.rarities) setRarities(sharedMetadata.rarities);
    }, [sharedMetadata]);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('toolbelts').select('*, rarity:rarities(name, color)').order('name');
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else setToolbelts(data);
        setLoading(false);
    };



    const handleSave = async () => {
        const itemData = { ...editingItem };
        delete itemData.rarity;

        let error;
        if (itemData.id) {
            ({ error } = await supabase.from('toolbelts').update(itemData).eq('id', itemData.id));
        } else {
            ({ error } = await supabase.from('toolbelts').insert([itemData]));
        }

        if (error) {
            toast({ title: "Error saving toolbelt", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Toolbelt saved successfully" });
            setEditingItem(null);
            fetchData();
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('toolbelts').delete().eq('id', id);
        if (error) {
            toast({ title: "Error deleting toolbelt", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Toolbelt deleted" });
            fetchData();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `toolbelts/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);

        if (uploadError) {
            toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
            return;
        }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingItem({ ...editingItem, image_url: data.publicUrl, image_path: filePath });
    };

    const renderForm = () => (
        <div className="bg-slate-900 p-6 rounded-lg space-y-6 my-4">
            <h3 className="text-2xl font-bold text-white">{editingItem.id ? 'Edit Toolbelt' : 'Add New Toolbelt'}</h3>
            <Input placeholder="Name" value={editingItem.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            <textarea placeholder="Description" value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-800 p-2 rounded" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input type="number" placeholder="Buy Price" value={editingItem.price || ''} onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Sell Price" value={editingItem.sell_price || ''} onChange={(e) => setEditingItem({ ...editingItem, sell_price: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Weight (kg)" value={editingItem.weight || ''} onChange={(e) => setEditingItem({ ...editingItem, weight: parseFloat(e.target.value) || null })} />
                <Input placeholder="Size" value={editingItem.size || ''} onChange={(e) => setEditingItem({ ...editingItem, size: e.target.value })} />
                <Input type="number" placeholder="Storage Capacity" value={editingItem.storage_capacity || ''} onChange={(e) => setEditingItem({ ...editingItem, storage_capacity: parseInt(e.target.value) || null })} />
                <Input placeholder="Use Function" value={editingItem.use_function || ''} onChange={(e) => setEditingItem({ ...editingItem, use_function: e.target.value })} />
                <select value={editingItem.rarity_id || ''} onChange={(e) => setEditingItem({ ...editingItem, rarity_id: e.target.value })} className="bg-slate-800 p-2 rounded">
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-slate-800 flex-grow" />
                {editingItem.image_url && <img src={editingItem.image_url} alt="preview" className="w-20 h-20 object-contain rounded bg-slate-700" />}
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
                <CustomStatManager stats={editingItem.stats} setStats={stats => setEditingItem({ ...editingItem, stats })} />
            </div>

            <div className="flex gap-4">
                <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Manage Toolbelts</h2>
                <Button onClick={() => setEditingItem({})}><Plus className="w-4 h-4 mr-2" />Add Toolbelt</Button>
            </div>

            {loading && <Loader2 className="animate-spin" />}
            {editingItem && renderForm()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {toolbelts.map(item => (
                    <div key={item.id} className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-contain rounded-md bg-slate-700 mb-2" />}
                            <h3 className="font-bold text-white">{item.name}</h3>
                            <p className="text-sm" style={{ color: item.rarity?.color }}>{item.rarity?.name}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="icon" variant="outline" onClick={() => setEditingItem(item)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToolbeltManager;
