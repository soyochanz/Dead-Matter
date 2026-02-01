import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AdminItemCard } from './AdminItemCard';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Info, Tag, Sliders, DollarSign, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';

const accessoryTypes = ['Sights', 'Muzzle', 'Grip', 'Magazine', 'Stock', 'Other'];

const AccessoryForm = ({ item, onSave, onCancel, sharedMetadata }) => {
    const defaultState = { name: '', type: accessoryTypes[0], image_url: '', image_path: '', rarity_id: null, price: 0, sell_price: 0, damage_modifier: 0, rate_of_fire_modifier: 0, accuracy_modifier: 0, capacity_modifier: 0 };
    const [formData, setFormData] = useState(defaultState);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        if (sharedMetadata?.rarities) setRarities(sharedMetadata.rarities);
    }, [sharedMetadata]);

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
        <FormContainer
            title={item?.id ? `Calibrate ${formData.name}` : 'Register New Attachment System'}
            onSave={handleSubmit}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="System Designation" icon={Info}>
                <FormInput
                    label="Nomenclature"
                    name="name"
                    placeholder="Attachment Name"
                    value={formData.name}
                    onChange={handleChange}
                />
                <FormSelect label="System Type" name="type" value={formData.type} onChange={handleChange}>
                    {accessoryTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </FormSelect>
                <FormSelect
                    label="Rarity Grade"
                    name="rarity_id"
                    value={formData.rarity_id}
                    onChange={handleChange}
                >
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Neural Visual Asset"
                    accept="image/*"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Economic Value" icon={DollarSign} columns={2}>
                <FormInput
                    label="Acquisition Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Resale Recovery"
                    name="sell_price"
                    type="number"
                    value={formData.sell_price}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Performance Modification" icon={Sliders}>
                <FormInput
                    label="Damage Delta"
                    name="damage_modifier"
                    type="number"
                    value={formData.damage_modifier}
                    onChange={handleChange}
                />
                <FormInput
                    label="Cycle Rate Delta"
                    name="rate_of_fire_modifier"
                    type="number"
                    value={formData.rate_of_fire_modifier}
                    onChange={handleChange}
                />
                <FormInput
                    label="Precision Delta"
                    name="accuracy_modifier"
                    type="number"
                    value={formData.accuracy_modifier}
                    onChange={handleChange}
                />
                <FormInput
                    label="Capacity Delta"
                    name="capacity_modifier"
                    type="number"
                    value={formData.capacity_modifier}
                    onChange={handleChange}
                />
            </FormSection>
        </FormContainer>
    );
};


const AccessoryManager = ({ sharedMetadata }) => {
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
            <div className="flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Manage Accessories</h2>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Accessory
                </Button>
            </div>
            {showForm && (
                <div className="mt-8">
                    <AccessoryForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => setShowForm(false)}
                        sharedMetadata={sharedMetadata}
                    />
                </div>
            )}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-red-500 h-8 w-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
                    {items.map((item, idx) => (
                        <AdminItemCard
                            key={item.id}
                            index={idx}
                            item={item}
                            type="accessory"
                            onEdit={(it) => { setEditingItem(it); setShowForm(true); }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccessoryManager;
