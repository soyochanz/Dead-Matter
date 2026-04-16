import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X, Upload, Link2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminItemCard } from './AdminItemCard';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Info, Tag, Target, Swords, DollarSign, Image as ImageIcon } from 'lucide-react';

const StatInput = ({ label, value, onChange, placeholder = '0' }) => (
    <div>
        <label className="text-sm font-medium text-white block mb-1">{label}</label>
        <Input type="number" placeholder={placeholder} value={value || ''} onChange={onChange} />
    </div>
);

const ManageAttachmentsDialog = ({ weapon, onOpenChange, open }) => {
    const [allAccessories, setAllAccessories] = useState([]);
    const [linkedAccessories, setLinkedAccessories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const accessoryTypes = ['Sights', 'Muzzle', 'Grip', 'Magazine', 'Stock', 'Lights', 'Other'];

    const fetchAttachments = useCallback(async () => {
        setLoading(true);
        const { data: allAccData, error: allAccError } = await supabase.from('accessories').select('id, name, type');
        if (allAccError) toast({ title: "Fetch Failed", description: "Could not synchronize accessory database.", variant: "destructive" });
        else setAllAccessories(allAccData || []);

        const { data: linkedAccData, error: linkedAccError } = await supabase.from('weapon_attachments').select('accessory_id, slot_type').eq('weapon_id', weapon.id);
        if (linkedAccError) toast({ title: "Link Error", description: "Could not retrieve current hardware configuration.", variant: "destructive" });
        else setLinkedAccessories(linkedAccData || []);
        setLoading(false);
    }, [weapon.id, toast]);

    useEffect(() => {
        if (open) fetchAttachments();
    }, [open, fetchAttachments]);

    const handleLink = async (accessory_id, slot_type) => {
        const { error } = await supabase.from('weapon_attachments').insert({ weapon_id: weapon.id, accessory_id, slot_type });
        if (error) toast({ title: "Integration Failed", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Hardware Linked", description: "Weapon protocol updated." });
            setLinkedAccessories(prev => [...prev, { accessory_id, slot_type }]);
        }
    };

    const handleUnlink = async (accessory_id, slot_type) => {
        const { error } = await supabase.from('weapon_attachments').delete().match({ weapon_id: weapon.id, accessory_id, slot_type });
        if (error) toast({ title: "Removal Failed", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Hardware Purged", description: "Accessory removed from system." });
            setLinkedAccessories(prev => prev.filter(att => !(att.accessory_id === accessory_id && att.slot_type === slot_type)));
        }
    };

    const isLinked = (accessory_id, slot_type) => linkedAccessories.some(att => att.accessory_id === accessory_id && att.slot_type === slot_type);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl bg-[#0a0a0c] border-white/10 text-white rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-1">
                        <Link2 className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 font-mono">Hardware Integration Protocol</span>
                    </div>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Sync: {weapon.name}</DialogTitle>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Calibrate compatible tactical attachments and optic systems</p>
                </DialogHeader>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-red-500 w-12 h-12" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                            {accessoryTypes.map(slotType => {
                                const accessories = allAccessories.filter(acc => acc.type === slotType);
                                if (accessories.length === 0) return null;

                                return (
                                    <div key={slotType} className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">{slotType}</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {accessories.map(acc => {
                                                const linked = isLinked(acc.id, slotType);
                                                return (
                                                    <div key={acc.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${linked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                                        }`}>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${linked ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white'}`}>{acc.name}</span>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                linked ? handleUnlink(acc.id, slotType) : handleLink(acc.id, slotType);
                                                            }}
                                                            className={`h-8 px-4 rounded-lg font-black uppercase tracking-widest text-[8px] transition-all ${linked
                                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {linked ? 'Linked' : 'Link'}
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const WeaponManager = ({ sharedMetadata }) => {
    const [weapons, setWeapons] = useState([]);
    const [editingWeapon, setEditingWeapon] = useState(null);
    const [managingAttachmentsFor, setManagingAttachmentsFor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rarities, setRarities] = useState(sharedMetadata?.rarities || []);
    const [subcategories, setSubcategories] = useState([]);
    const { toast } = useToast();

    // Update local state if shared metadata changes or loads late
    useEffect(() => {
        if (sharedMetadata?.rarities?.length) setRarities(sharedMetadata.rarities);

        // Filter subcategories for Weapons category
        if (sharedMetadata?.categories?.length && sharedMetadata?.subcategories?.length) {
            const weaponCat = sharedMetadata.categories.find(c => c.name === 'Weapons');
            if (weaponCat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === weaponCat.id);
                setSubcategories(subs);
            }
        }
    }, [sharedMetadata]);

    const fetchWeapons = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('weapons').select('*, rarity:rarities(name, color), subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Error fetching weapons", description: error.message, variant: "destructive" });
        else setWeapons(data);
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchWeapons();
    }, [fetchWeapons]);

    const handleSave = async () => {
        const weaponData = { ...editingWeapon };
        delete weaponData.rarity;
        delete weaponData.subcategory;

        let error;
        if (weaponData.id) {
            ({ error } = await supabase.from('weapons').update(weaponData).eq('id', weaponData.id));
        } else {
            ({ error } = await supabase.from('weapons').insert([weaponData]));
        }

        if (error) {
            toast({ title: "Error saving weapon", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Weapon saved successfully" });
            setEditingWeapon(null);
            fetchWeapons();
        }
    };

    const handleDelete = async (weapon) => {
        await supabase.from('weapon_attachments').delete().eq('weapon_id', weapon.id);
        if (weapon.image_path) {
            await supabase.storage.from('Items').remove([weapon.image_path]);
        }
        const { error } = await supabase.from('weapons').delete().eq('id', weapon.id);
        if (error) {
            toast({ title: "Error deleting weapon", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Weapon deleted" });
            fetchWeapons();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `weapons/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);

        if (uploadError) {
            toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
            return;
        }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingWeapon({ ...editingWeapon, image_url: data.publicUrl, image_path: filePath });
    };

    const renderForm = () => (
        <FormContainer
            title={editingWeapon.id ? `Edit ${editingWeapon.name}` : 'Register New System'}
            onSave={handleSave}
            onCancel={() => setEditingWeapon(null)}
            isSaving={loading}
        >
            <FormSection title="Core Designation" icon={Info}>
                <FormInput
                    label="Nomenclature"
                    placeholder="e.g., M4A1 Carbine"
                    value={editingWeapon.name}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, name: e.target.value })}
                />
                <FormInput
                    label="Form Factor"
                    placeholder="Size (e.g., 3x9)"
                    value={editingWeapon.size}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, size: e.target.value })}
                />
                <FormInput
                    label="Mass (kg)"
                    type="number"
                    value={editingWeapon.weight}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, weight: parseFloat(e.target.value) || null })}
                />
                <FormSelect
                    label="Rarity Grade"
                    value={editingWeapon.rarity_id}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, rarity_id: e.target.value })}
                >
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormSelect
                    label="Class Assignment"
                    value={editingWeapon.subcategory_id}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, subcategory_id: e.target.value })}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Neural Visual Asset"
                    accept="image/*"
                    onChange={handleImageUpload}
                    previewUrl={editingWeapon.image_url}
                    fileName={editingWeapon.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Tactical Narrative" icon={Tag} columns={1}>
                <FormTextarea
                    label="Detailed Description"
                    placeholder="Enter system deployment notes..."
                    value={editingWeapon.description}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, description: e.target.value })}
                />
            </FormSection>

            <FormSection title="Economic Value" icon={DollarSign} columns={2}>
                <FormInput
                    label="Acquisition Price"
                    type="number"
                    value={editingWeapon.price}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, price: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Resale Recovery"
                    type="number"
                    value={editingWeapon.sell_price}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, sell_price: parseInt(e.target.value) || null })}
                />
            </FormSection>

            <FormSection title="Ballistic Performance" icon={Target}>
                <FormInput
                    label="Damage"
                    type="number"
                    value={editingWeapon.damage}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, damage: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Caliber"
                    value={editingWeapon.ammo}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, ammo: e.target.value })}
                />
                <FormInput
                    label="Magazine Capacity"
                    type="number"
                    value={editingWeapon.capacity}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, capacity: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Rate of Fire"
                    type="number"
                    value={editingWeapon.rate_of_fire}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, rate_of_fire: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Accuracy"
                    type="number"
                    value={editingWeapon.accuracy}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, accuracy: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Handling"
                    type="number"
                    value={editingWeapon.handling}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, handling: parseInt(e.target.value) || null })}
                />
            </FormSection>

            <FormSection title="Melee Specifications" icon={Swords}>
                <FormInput
                    label="Damage"
                    type="number"
                    value={editingWeapon.damage}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, damage: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Melee Range"
                    type="number"
                    value={editingWeapon.melee_range}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, melee_range: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Attack Speed"
                    type="number"
                    value={editingWeapon.attack_speed}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, attack_speed: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Stamina Efficiency"
                    type="number"
                    value={editingWeapon.stamina_efficiency}
                    onChange={(e) => setEditingWeapon({ ...editingWeapon, stamina_efficiency: parseInt(e.target.value) || null })}
                />
            </FormSection>

            <div className="pt-8 border-t border-white/5">
                <CustomStatManager
                    stats={editingWeapon.stats}
                    setStats={stats => setEditingWeapon({ ...editingWeapon, stats })}
                />
            </div>
        </FormContainer>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Manage Weapons</h2>
                <Button onClick={() => setEditingWeapon({})}><Plus className="w-4 h-4 mr-2" />Add Weapon</Button>
            </div>

            {loading && <Loader2 className="animate-spin" />}

            {editingWeapon && renderForm()}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {weapons.map((weapon, idx) => (
                    <AdminItemCard
                        key={weapon.id}
                        index={idx}
                        item={weapon}
                        type="weapon"
                        onEdit={setEditingWeapon}
                        onDelete={handleDelete}
                        onLink={!weapon.subcategory?.name?.toLowerCase().includes('melee') ? setManagingAttachmentsFor : null}
                    />
                ))}
            </div>
            {managingAttachmentsFor &&
                <ManageAttachmentsDialog
                    weapon={managingAttachmentsFor}
                    open={!!managingAttachmentsFor}
                    onOpenChange={(isOpen) => !isOpen && setManagingAttachmentsFor(null)}
                />
            }
        </div>
    );
};

export default WeaponManager;
