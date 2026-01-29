import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';
import { AdminItemCard } from './AdminItemCard';

const GearManager = ({ sharedMetadata }) => {
    const [gear, setGear] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rarities, setRarities] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        if (sharedMetadata?.rarities?.length) setRarities(sharedMetadata.rarities);
        // Filter subcategories for Gear category
        if (sharedMetadata?.categories?.length && sharedMetadata?.subcategories?.length) {
            const cat = sharedMetadata.categories.find(c => c.name === 'Gear');
            if (cat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === cat.id);
                setSubcategories(subs);
            }
        }
    }, [sharedMetadata]);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('gear').select('*, rarity:rarities(name), subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Error fetching gear", description: error.message, variant: "destructive" });
        else setGear(data);
        setLoading(false);
    };



    const handleSave = async () => {
        const itemData = { ...editingItem };
        delete itemData.rarity;
        delete itemData.subcategory;

        let error;
        if (itemData.id) {
            ({ error } = await supabase.from('gear').update(itemData).eq('id', itemData.id));
        } else {
            ({ error } = await supabase.from('gear').insert([itemData]));
        }

        if (error) {
            toast({ title: "Error saving gear", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Gear saved successfully" });
            setEditingItem(null);
            fetchData();
        }
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('gear').delete().eq('id', id);
        if (error) toast({ title: "Error deleting gear", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Gear deleted" });
            fetchData();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gear/${fileName}`;

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
            <h3 className="text-2xl font-bold text-white">{editingItem.id ? 'Edit Gear' : 'Add New Gear'}</h3>
            <Input placeholder="Name" value={editingItem.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            <textarea placeholder="Description" value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-800 p-2 rounded" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input type="number" placeholder="Buy Price" value={editingItem.price || ''} onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Sell Price" value={editingItem.sell_price || ''} onChange={(e) => setEditingItem({ ...editingItem, sell_price: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Weight (kg)" value={editingItem.weight || ''} onChange={(e) => setEditingItem({ ...editingItem, weight: parseFloat(e.target.value) || null })} />
                <Input placeholder="Size" value={editingItem.size || ''} onChange={(e) => setEditingItem({ ...editingItem, size: e.target.value })} />
                <select value={editingItem.rarity_id || ''} onChange={(e) => setEditingItem({ ...editingItem, rarity_id: e.target.value })} className="bg-slate-800 p-2 rounded">
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select value={editingItem.subcategory_id || ''} onChange={(e) => setEditingItem({ ...editingItem, subcategory_id: e.target.value })} className="bg-slate-800 p-2 rounded">
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={editingItem.weapon_slot_type || ''} onChange={(e) => setEditingItem({ ...editingItem, weapon_slot_type: e.target.value })} className="bg-slate-800 p-2 rounded">
                    <option value="">No Weapon Slot</option>
                    <option value="small">Small Weapon Slot</option>
                    <option value="large">Large Weapon Slot</option>
                </select>
            </div>

            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-slate-800 flex-grow" />
                {editingItem.image_url && <img src={editingItem.image_url} alt="preview" className="w-20 h-20 object-contain rounded bg-slate-700" />}
            </div>

            <h4 className="text-lg font-semibold text-white border-t border-slate-700 pt-4 mt-4">Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input type="number" placeholder="Armor Rating" value={editingItem.armor_rating || ''} onChange={(e) => setEditingItem({ ...editingItem, armor_rating: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Inventory Slots" value={editingItem.inventory_slots || ''} onChange={(e) => setEditingItem({ ...editingItem, inventory_slots: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Bleed Protection" value={editingItem.bleed_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, bleed_protection: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Blunt Protection" value={editingItem.blunt_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, blunt_protection: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Fire Protection" value={editingItem.fire_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, fire_protection: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Insulation" value={editingItem.insulation || ''} onChange={(e) => setEditingItem({ ...editingItem, insulation: parseInt(e.target.value) || null })} />
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
                <h2 className="text-2xl font-bold text-white">Manage Gear</h2>
                <Button onClick={() => setEditingItem({})}><Plus className="w-4 h-4 mr-2" />Add Gear</Button>
            </div>

            {loading && <Loader2 className="animate-spin" />}
            {editingItem && renderForm()}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {gear.map((item, idx) => (
                    <AdminItemCard
                        key={item.id}
                        index={idx}
                        item={item}
                        type="gear"
                        onEdit={setEditingItem}
                        onDelete={(it) => handleDelete(it.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GearManager;
