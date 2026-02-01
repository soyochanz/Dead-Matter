import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';
import { AdminItemCard } from './AdminItemCard';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Info, Tag, Box, Sliders, Image as ImageIcon } from 'lucide-react';

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

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const folder = field === 'model_url' ? 'models' : 'textures';
        const filePath = `gear/${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);

        if (uploadError) {
            toast({ title: `Error uploading ${field}`, description: uploadError.message, variant: "destructive" });
            return;
        }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingItem({ ...editingItem, [field]: data.publicUrl });
    };

    const renderForm = () => (
        <FormContainer
            title={editingItem.id ? `Edit ${editingItem.name}` : 'Register New Equipment'}
            onSave={handleSave}
            onCancel={() => setEditingItem(null)}
            isSaving={loading}
        >
            <FormSection title="Equipment Designation" icon={Info}>
                <FormInput
                    label="Nomenclature"
                    placeholder="e.g., Tactical Vest"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
                <FormInput
                    label="Form Factor"
                    placeholder="Size (e.g., 2x4)"
                    value={editingItem.size}
                    onChange={(e) => setEditingItem({ ...editingItem, size: e.target.value })}
                />
                <FormInput
                    label="Mass (kg)"
                    type="number"
                    value={editingItem.weight}
                    onChange={(e) => setEditingItem({ ...editingItem, weight: parseFloat(e.target.value) || null })}
                />
                <FormSelect
                    label="Rarity Grade"
                    value={editingItem.rarity_id}
                    onChange={(e) => setEditingItem({ ...editingItem, rarity_id: e.target.value })}
                >
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormSelect
                    label="Class Assignment"
                    value={editingItem.subcategory_id}
                    onChange={(e) => setEditingItem({ ...editingItem, subcategory_id: e.target.value })}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Neural Visual Asset"
                    accept="image/*"
                    onChange={handleImageUpload}
                    previewUrl={editingItem.image_url}
                    fileName={editingItem.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Deployment Narrative" icon={Tag} columns={1}>
                <FormTextarea
                    label="Detailed Description"
                    placeholder="Enter equipment deployment notes..."
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
            </FormSection>

            <FormSection title="Economic Value" icon={Tag} columns={2}>
                <FormInput
                    label="Acquisition Price"
                    type="number"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Resale Recovery"
                    type="number"
                    value={editingItem.sell_price}
                    onChange={(e) => setEditingItem({ ...editingItem, sell_price: parseInt(e.target.value) || null })}
                />
            </FormSection>

            <FormSection title="3D Visualization Data" icon={Box}>
                <FormFileUpload
                    label="3D Model (.glb)"
                    accept=".glb"
                    onChange={(e) => handleFileUpload(e, 'model_url')}
                    fileName={editingItem.model_url?.split('/').pop()}
                />
                <FormFileUpload
                    label="Albedo Map"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'albedo_url')}
                    previewUrl={editingItem.albedo_url}
                    fileName={editingItem.albedo_url?.split('/').pop()}
                />
                <FormFileUpload
                    label="Normal Map"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'normal_url')}
                    previewUrl={editingItem.normal_url}
                    fileName={editingItem.normal_url?.split('/').pop()}
                />
                <FormFileUpload
                    label="RMA Map (Rough/Metal/AO)"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'rma_url')}
                    previewUrl={editingItem.rma_url}
                    fileName={editingItem.rma_url?.split('/').pop()}
                />
            </FormSection>

            <FormSection title="Performance Parameters" icon={Sliders}>
                <FormInput
                    label="Armor Rating"
                    type="number"
                    value={editingItem.armor_rating}
                    onChange={(e) => setEditingItem({ ...editingItem, armor_rating: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Inventory Capacity"
                    type="number"
                    value={editingItem.inventory_slots}
                    onChange={(e) => setEditingItem({ ...editingItem, inventory_slots: parseInt(e.target.value) || null })}
                />
                <FormInput type="number" label="Bleed Protection" value={editingItem.bleed_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, bleed_protection: parseInt(e.target.value) || null })} />
                <FormInput type="number" label="Blunt Protection" value={editingItem.blunt_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, blunt_protection: parseInt(e.target.value) || null })} />
                <FormInput type="number" label="Fire Protection" value={editingItem.fire_protection || ''} onChange={(e) => setEditingItem({ ...editingItem, fire_protection: parseInt(e.target.value) || null })} />
                <FormInput type="number" label="Insulation" value={editingItem.insulation || ''} onChange={(e) => setEditingItem({ ...editingItem, insulation: parseInt(e.target.value) || null })} />
                <FormSelect label="Weapon Slot" value={editingItem.weapon_slot_type || ''} onChange={(e) => setEditingItem({ ...editingItem, weapon_slot_type: e.target.value })}>
                    <option value="">No Weapon Slot</option>
                    <option value="small">Small Weapon Slot</option>
                    <option value="large">Large Weapon Slot</option>
                </FormSelect>
            </FormSection>

            <div className="pt-8 border-t border-white/5">
                <CustomStatManager
                    stats={editingItem.stats}
                    setStats={stats => setEditingItem({ ...editingItem, stats })}
                />
            </div>
        </FormContainer>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4 text-white">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Manage Gear</h2>
                <Button
                    onClick={() => setEditingItem({})}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Gear
                </Button>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-red-500 h-8 w-8" />
                </div>
            )}

            {editingItem && renderForm()}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
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
