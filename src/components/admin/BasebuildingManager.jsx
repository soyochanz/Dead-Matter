import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Box, Hammer, DollarSign, Activity, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';

const CATEGORIES = ["Items", "Storage", "Walls", "Doors", "Window", "Lighting", "Tents"];

const RequirementsManager = ({ requirements, setRequirements }) => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchMaterials = async () => {
            const { data } = await supabase.from('crafting_materials').select('id, name').order('name');
            setMaterials(data || []);
        };
        fetchMaterials();
    }, []);

    const addRequirement = () => setRequirements([...(requirements || []), { item_id: '', quantity: 1 }]);
    const removeRequirement = (index) => setRequirements(requirements.filter((_, i) => i !== index));
    const updateRequirement = (index, field, value) => {
        const newRequirements = [...requirements];
        newRequirements[index][field] = value;
        setRequirements(newRequirements);
    };

    return (
        <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-xl mt-4">
            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Hammer className="w-3 h-3" /> Synthesis Requirements
            </h4>
            {(requirements || []).map((req, index) => (
                <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <select
                        value={req.item_id}
                        onChange={(e) => updateRequirement(index, 'item_id', e.target.value)}
                        className="flex-grow h-10 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                        <option value="">Select Resource</option>
                        {materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                    </select>
                    <input
                        type="number"
                        placeholder="Qty"
                        value={req.quantity}
                        onChange={(e) => updateRequirement(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20 h-10 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRequirement(index)}
                        className="text-gray-500 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                className="w-full bg-white/5 border-dashed border-white/10 hover:bg-white/10 text-[10px] uppercase tracking-widest font-bold"
            >
                <Plus className="w-3 h-3 mr-2" /> Integrate Material
            </Button>
        </div>
    );
};

const BasebuildingForm = ({ item, onSave, onCancel, rarities }) => {
    const [formData, setFormData] = useState({ category: CATEGORIES[0], name: '', description: '', price: 0, sell_price: 0, weight: 0, health: 100 });
    const [requirements, setRequirements] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) {
            setFormData(item);
            setRequirements(item.requirements || []);
        }
    }, [item]);

    const isCraftable = !["Items", "Tents"].includes(formData.category);
    const isStorage = formData.category === "Storage";
    const isItems = formData.category === "Items";
    const isTent = formData.category === "Tents";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value) }));
    };

    const handleFileChange = async (event, fieldUrl, fieldPath) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `basebuilding/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, [fieldUrl]: publicUrl, [fieldPath]: filePath }));
        }
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (isCraftable) {
            dataToSave.requirements = requirements.filter(r => r.item_id && r.quantity > 0);
        } else {
            delete dataToSave.requirements;
        }
        if (!isStorage) delete dataToSave.slots;
        if (!isItems) delete dataToSave.use;

        onSave(dataToSave);
    };

    return (
        <FormContainer
            title={item?.id ? `Calibrating Asset: ${formData.name}` : 'Initializing Construction Asset'}
            onSave={handleSubmit}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Base Specs" icon={Box}>
                <FormInput
                    label="Asset Nomenclature"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Structure designation..."
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect label="Structural Category" name="category" value={formData.category} onChange={handleChange}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </FormSelect>
                    <FormSelect label="Integrity Grade" name="rarity_id" value={formData.rarity_id} onChange={handleChange}>
                        <option value="">Select Rarity</option>
                        {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </FormSelect>
                </div>
                <FormTextarea
                    label="Technical Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Material composition and structural utility..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFileUpload
                        label="Structural Blueprint (Packed)"
                        onChange={(e) => handleFileChange(e, 'image_url', 'image_path')}
                        previewUrl={formData.image_url}
                        fileName={formData.image_path?.split('/').pop()}
                        icon={ImageIcon}
                    />
                    {isTent && (
                        <FormFileUpload
                            label="Blueprint (Deployed)"
                            onChange={(e) => handleFileChange(e, 'image_unpacked_url', 'image_unpacked_path')}
                            previewUrl={formData.image_unpacked_url}
                            fileName={formData.image_unpacked_path?.split('/').pop()}
                            icon={ImageIcon}
                        />
                    )}
                </div>
            </FormSection>

            <FormSection title="Logistics & Integrity" icon={Activity} columns={2}>
                <FormInput
                    label="Acquisition Value"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Resource Recovery"
                    name="sell_price"
                    type="number"
                    value={formData.sell_price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Mass (KG)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                />
                <FormInput
                    label="Structural Health"
                    name="health"
                    type="number"
                    value={formData.health}
                    onChange={handleChange}
                />
                {isStorage && (
                    <FormInput
                        label="Storage Capacity (Slots)"
                        name="slots"
                        type="number"
                        value={formData.slots}
                        onChange={handleChange}
                    />
                )}
                {isItems && (
                    <FormInput
                        label="Asset Utility"
                        name="use"
                        value={formData.use}
                        onChange={handleChange}
                        placeholder="Power generation, etc."
                    />
                )}
            </FormSection>

            {isCraftable && (
                <FormSection title="Construction Logic" icon={Hammer} columns={1}>
                    <RequirementsManager requirements={requirements} setRequirements={setRequirements} />
                </FormSection>
            )}
        </FormContainer>
    );
};

const BasebuildingManager = ({ sharedMetadata }) => {
    const [items, setItems] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const { data: itemsData, error: itemsError } = await supabase.from('basebuilding_items').select('*, rarity:rarities(name, color)').order('name');
        if (itemsError) toast({ title: 'Error', description: itemsError.message, variant: 'destructive' });
        else setItems(itemsData || []);

        if (sharedMetadata?.rarities) setRarities(sharedMetadata.rarities);
        else {
            const { data: raritiesData } = await supabase.from('rarities').select('*');
            setRarities(raritiesData || []);
        }
        setLoading(false);
    }, [toast, sharedMetadata]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleSave = async (formData) => {
        const { id, rarity, ...data } = formData;
        if (data.rarity_id === '') data.rarity_id = null;

        const { error } = id
            ? await supabase.from('basebuilding_items').update(data).eq('id', id)
            : await supabase.from('basebuilding_items').insert([data]);

        if (error) toast({ title: 'System Error', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Success', description: `Asset ${id ? 'calibrated' : 'registered'}.` });
            setShowForm(false);
            setEditingItem(null);
            fetchItems();
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Confirm deconstruction of ${item.name}? This action is irreversible.`)) return;
        const paths = [item.image_path, item.image_unpacked_path].filter(Boolean);
        if (paths.length > 0) await supabase.storage.from('Items').remove(paths);
        const { error } = await supabase.from('basebuilding_items').delete().eq('id', item.id);
        if (error) toast({ title: 'Deconstruction Failed', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Success', description: 'Asset decommissioned.' }); fetchItems(); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Box className="text-red-600" />
                        Infrastructure Assets
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage structural components and base building modules</p>
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Register Infrastructure
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <BasebuildingForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        rarities={rarities}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group flex flex-col bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300">
                            <div className="p-4 bg-black/40 flex items-center justify-center h-40 relative overflow-hidden">
                                {item.image_url ? (
                                    <img src={item.image_url} alt="" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <Box className="w-12 h-12 text-gray-800" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <div
                                        className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                                        style={{ color: item.rarity?.color || '#94a3b8' }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 space-y-4 flex-grow flex flex-col bg-gradient-to-b from-white/[0.02] to-transparent">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-bold text-white truncate pr-2">{item.name}</h3>
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter whitespace-nowrap">{item.category}</span>
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: item.rarity?.color || '#666' }}>
                                        {item.rarity?.name || 'Standard'} Grade
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                                        className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white h-8 text-[9px] font-bold uppercase tracking-widest"
                                    >
                                        <Edit className="w-3 h-3 mr-2" /> Modify
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDelete(item)}
                                        className="bg-red-500/5 hover:bg-red-500/20 text-red-500/70 hover:text-red-500 h-8 text-[9px] font-bold uppercase tracking-widest"
                                    >
                                        <Trash2 className="w-3 h-3 mr-2" /> Purge
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BasebuildingManager;
