import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X, Upload, Link2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    const accessoryTypes = ['Sights', 'Muzzle', 'Grip', 'Magazine', 'Stock', 'Other'];

    const fetchAttachments = useCallback(async () => {
        setLoading(true);
        
        const { data: allAccData, error: allAccError } = await supabase.from('accessories').select('id, name, type');
        if (allAccError) toast({ title: "Error", description: "Could not load accessories.", variant: "destructive" });
        else setAllAccessories(allAccData || []);

        const { data: linkedAccData, error: linkedAccError } = await supabase.from('weapon_attachments').select('accessory_id, slot_type').eq('weapon_id', weapon.id);
        if (linkedAccError) toast({ title: "Error", description: "Could not load linked accessories.", variant: "destructive" });
        else setLinkedAccessories(linkedAccData || []);

        setLoading(false);
    }, [weapon.id, toast]);

    useEffect(() => {
        if (open) fetchAttachments();
    }, [open, fetchAttachments]);

    const handleLink = async (accessory_id, slot_type) => {
        const { error } = await supabase.from('weapon_attachments').insert({ weapon_id: weapon.id, accessory_id, slot_type });
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Success", description: "Accessory linked." });
            setLinkedAccessories(prev => [...prev, { accessory_id, slot_type }]);
        }
    };

    const handleUnlink = async (accessory_id, slot_type) => {
        const { error } = await supabase.from('weapon_attachments').delete().match({ weapon_id: weapon.id, accessory_id, slot_type });
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Success", description: "Accessory unlinked." });
            setLinkedAccessories(prev => prev.filter(att => !(att.accessory_id === accessory_id && att.slot_type === slot_type)));
        }
    };

    const isLinked = (accessory_id, slot_type) => linkedAccessories.some(att => att.accessory_id === accessory_id && att.slot_type === slot_type);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-white">Manage Attachments for {weapon.name}</DialogTitle>
                </DialogHeader>
                {loading ? <Loader2 className="animate-spin text-red-500 mx-auto" /> : (
                    <div className="max-h-[60vh] overflow-y-auto mt-4 pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accessoryTypes.map(slotType => (
                                <div key={slotType}>
                                    <h4 className="font-bold text-lg text-red-400 mb-2">{slotType}</h4>
                                    <div className="space-y-2">
                                        {allAccessories.filter(acc => acc.type === slotType).map(acc => (
                                            <div key={acc.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                                                <span className="text-white">{acc.name}</span>
                                                <Button 
                                                    size="sm"
                                                    variant={isLinked(acc.id, slotType) ? "destructive" : "default"}
                                                    onClick={() => isLinked(acc.id, slotType) ? handleUnlink(acc.id, slotType) : handleLink(acc.id, slotType)}
                                                >
                                                    {isLinked(acc.id, slotType) ? 'Unlink' : 'Link'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

const WeaponManager = () => {
    const [weapons, setWeapons] = useState([]);
    const [editingWeapon, setEditingWeapon] = useState(null);
    const [managingAttachmentsFor, setManagingAttachmentsFor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rarities, setRarities] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const { toast } = useToast();

    const fetchWeapons = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('weapons').select('*, rarity:rarities(name, color), subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Error fetching weapons", description: error.message, variant: "destructive" });
        else setWeapons(data);
        setLoading(false);
    }, [toast]);
    
    const fetchMeta = useCallback(async () => {
        const { data: raritiesData } = await supabase.from('rarities').select('*');
        const { data: weaponCategory } = await supabase.from('wiki_categories').select('id').eq('name', 'Weapons').single();
        if (weaponCategory) {
            const { data: subcategoriesData } = await supabase.from('wiki_subcategories').select('*').eq('category_id', weaponCategory.id);
            setSubcategories(subcategoriesData || []);
        }
        setRarities(raritiesData || []);
    }, []);

    useEffect(() => {
        fetchWeapons();
        fetchMeta();
    }, [fetchWeapons, fetchMeta]);

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
      <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-6 my-4">
        <h3 className="text-2xl font-bold text-white">{editingWeapon.id ? 'Edit Weapon' : 'Add New Weapon'}</h3>
        
        <div className="border border-slate-700 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-white">General Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Name" value={editingWeapon.name || ''} onChange={(e) => setEditingWeapon({...editingWeapon, name: e.target.value })} />
                <Input placeholder="Size (e.g. 3x9)" value={editingWeapon.size || ''} onChange={(e) => setEditingWeapon({ ...editingWeapon, size: e.target.value })} />
                <StatInput label="Weight (kg)" value={editingWeapon.weight} onChange={(e) => setEditingWeapon({ ...editingWeapon, weight: parseFloat(e.target.value) || null })} />
            </div>
            <textarea placeholder="Description" value={editingWeapon.description || ''} onChange={(e) => setEditingWeapon({...editingWeapon, description: e.target.value })} className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select value={editingWeapon.rarity_id || ''} onChange={(e) => setEditingWeapon({...editingWeapon, rarity_id: e.target.value})} className="bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10">
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <select value={editingWeapon.subcategory_id || ''} onChange={(e) => setEditingWeapon({...editingWeapon, subcategory_id: e.target.value})} className="bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10">
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <StatInput label="Buy Price" value={editingWeapon.price} onChange={(e) => setEditingWeapon({ ...editingWeapon, price: parseInt(e.target.value) || null })} />
                <StatInput label="Sell Price" value={editingWeapon.sell_price} onChange={(e) => setEditingWeapon({ ...editingWeapon, sell_price: parseInt(e.target.value) || null })} />
            </div>
            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-grow"/>
                {editingWeapon.image_url && <img src={editingWeapon.image_url} alt="preview" className="w-20 h-20 object-contain rounded bg-slate-700"/>}
            </div>
        </div>
        
        <div className="border border-slate-700 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-white">Firearm Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatInput label="Damage" value={editingWeapon.damage} onChange={(e) => setEditingWeapon({ ...editingWeapon, damage: parseInt(e.target.value) || null })} />
                <Input placeholder="Ammo Type" value={editingWeapon.ammo || ''} onChange={(e) => setEditingWeapon({...editingWeapon, ammo: e.target.value})} className="self-end" />
                <StatInput label="Capacity" value={editingWeapon.capacity} onChange={(e) => setEditingWeapon({ ...editingWeapon, capacity: parseInt(e.target.value) || null })} />
                <StatInput label="Rate of Fire" value={editingWeapon.rate_of_fire} onChange={(e) => setEditingWeapon({ ...editingWeapon, rate_of_fire: parseInt(e.target.value) || null })} />
                <StatInput label="Accuracy" value={editingWeapon.accuracy} onChange={(e) => setEditingWeapon({ ...editingWeapon, accuracy: parseInt(e.target.value) || null })} />
                <StatInput label="Handling" value={editingWeapon.handling} onChange={(e) => setEditingWeapon({ ...editingWeapon, handling: parseInt(e.target.value) || null })} />
            </div>
        </div>

        <div className="border border-slate-700 p-4 rounded-lg space-y-4">
            <h4 className="text-lg font-semibold text-white">Melee Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatInput label="Melee Range" value={editingWeapon.melee_range} onChange={(e) => setEditingWeapon({ ...editingWeapon, melee_range: parseInt(e.target.value) || null })} />
                <StatInput label="Attack Speed" value={editingWeapon.attack_speed} onChange={(e) => setEditingWeapon({ ...editingWeapon, attack_speed: parseInt(e.target.value) || null })} />
                <StatInput label="Stamina Efficiency" value={editingWeapon.stamina_efficiency} onChange={(e) => setEditingWeapon({ ...editingWeapon, stamina_efficiency: parseInt(e.target.value) || null })} />
            </div>
        </div>

        <div className="border-t border-slate-700 pt-4 mt-4">
            <CustomStatManager stats={editingWeapon.stats} setStats={stats => setEditingWeapon({...editingWeapon, stats})} />
        </div>

        <div className="flex gap-4">
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2"/>Save</Button>
            <Button variant="outline" onClick={() => setEditingWeapon(null)}><X className="w-4 h-4 mr-2"/>Cancel</Button>
        </div>
      </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Manage Weapons</h2>
                <Button onClick={() => setEditingWeapon({})}><Plus className="w-4 h-4 mr-2"/>Add Weapon</Button>
            </div>

            {loading && <Loader2 className="animate-spin" />}
            
            {editingWeapon && renderForm()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weapons.map(weapon => (
                    <div key={weapon.id} className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            {weapon.image_url && <img src={weapon.image_url} alt={weapon.name} className="w-full h-32 object-contain rounded-md bg-slate-700 mb-2"/>}
                            <h3 className="font-bold text-white">{weapon.name}</h3>
                            <p className="text-sm text-gray-400">{weapon.subcategory?.name}</p>
                            <p className="text-sm" style={{color: weapon.rarity?.color}}>{weapon.rarity?.name}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="icon" variant="outline" onClick={() => setEditingWeapon(weapon)}><Edit className="w-4 h-4"/></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(weapon)}><Trash2 className="w-4 h-4"/></Button>
                            {!weapon.subcategory?.name?.toLowerCase().includes('melee') &&
                                <Button size="icon" variant="outline" onClick={() => setManagingAttachmentsFor(weapon)}><Link2 className="w-4 h-4"/></Button>
                            }
                        </div>
                    </div>
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