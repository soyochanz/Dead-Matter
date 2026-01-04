import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NpcManager = () => {
    const [npcs, setNpcs] = useState([]);
    const [editingNpc, setEditingNpc] = useState(null);
    const [missions, setMissions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allItems, setAllItems] = useState({ weapons: [], gear: [], consumables: [], keys: [], toolbelts: [], medicines: [] });
    const { toast } = useToast();

    useEffect(() => {
        fetchNpcs();
        fetchAllItems();
    }, []);

    const fetchNpcs = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('npcs').select('*').order('name');
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setNpcs(data);
        }
        setLoading(false);
    };

    const fetchAllItems = async () => {
        const [weapons, gear, consumables, keys, toolbelts, medicines] = await Promise.all([
            supabase.from('weapons').select('id, name, subcategory:wiki_subcategories(name), image_url'),
            supabase.from('gear').select('id, name, subcategory:wiki_subcategories(name), image_url'),
            supabase.from('consumables').select('id, name, type, image_url'),
            supabase.from('keys').select('id, name, image_url'),
            supabase.from('toolbelts').select('id, name, image_url'),
            supabase.from('medicines').select('id, name, image_url')
        ]);

        setAllItems({
            weapons: weapons.data || [],
            gear: gear.data || [],
            consumables: consumables.data || [],
            keys: keys.data || [],
            toolbelts: toolbelts.data || [],
            medicines: medicines.data || [],
        });
    };

    const handleEdit = async (npc) => {
        setEditingNpc(npc);
        
        const [missionsRes, inventoryRes] = await Promise.all([
            supabase.from('missions').select('*').eq('npc_id', npc.id),
            supabase.from('npc_inventory').select('*').eq('npc_id', npc.id)
        ]);

        setMissions(missionsRes.data || []);
        setInventory(inventoryRes.data || []);
    };

    const handleSaveNpc = async () => {
        let error;
        if (editingNpc.id) {
            ({ error } = await supabase.from('npcs').update({
                name: editingNpc.name,
                location: editingNpc.location,
                image_url: editingNpc.image_url,
                image_path: editingNpc.image_path
            }).eq('id', editingNpc.id));
        } else {
            const { data: insertedData, error: insertError } = await supabase.from('npcs').insert([{
                name: editingNpc.name,
                location: editingNpc.location,
                image_url: editingNpc.image_url,
                image_path: editingNpc.image_path
            }]).select().single();
            error = insertError;
            if (!error) setEditingNpc(insertedData);
        }

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Success", description: "NPC saved successfully" }); fetchNpcs(); }
    };
    
    const handleAddMission = async () => {
        if (!editingNpc?.id) return;

        const { error } = await supabase.from('missions').insert([{
            npc_id: editingNpc.id,
            title: 'New Mission',
            difficulty: 'Medium',
            content: 'Mission description',
            content_html: '<p>Mission description</p>'
        }]);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            const { data } = await supabase.from('missions').select('*').eq('npc_id', editingNpc.id);
            setMissions(data || []);
            toast({ title: "Success", description: "Mission added" });
        }
    };

    const handleUpdateMission = async (mission) => {
        const { error } = await supabase.from('missions').update(mission).eq('id', mission.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else toast({ title: "Success", description: "Mission updated" });
    };

    const handleDeleteMission = async (missionId) => {
        const { error } = await supabase.from('missions').delete().eq('id', missionId);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            setMissions(missions.filter(m => m.id !== missionId));
            toast({ title: "Success", description: "Mission deleted" });
        }
    };

    const handleAddInventoryItem = async (itemType, itemId) => {
        if (!editingNpc?.id || inventory.some(i => i.item_type === itemType && i.item_id === itemId)) return;

        const { error } = await supabase.from('npc_inventory').insert([{ npc_id: editingNpc.id, item_type: itemType, item_id: itemId }]);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            const { data } = await supabase.from('npc_inventory').select('*').eq('npc_id', editingNpc.id);
            setInventory(data || []);
            toast({ title: "Success", description: "Item added to inventory" });
        }
    };

    const handleRemoveInventoryItem = async (itemType, itemId) => {
        const { error } = await supabase.from('npc_inventory').delete().match({ npc_id: editingNpc.id, item_type: itemType, item_id: itemId });
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            setInventory(inventory.filter(i => !(i.item_type === itemType && i.item_id === itemId)));
            toast({ title: "Success", description: "Item removed" });
        }
    };

    const handleDelete = async (id) => {
        await supabase.from('missions').delete().eq('npc_id', id);
        await supabase.from('npc_inventory').delete().eq('npc_id', id);
        const { error } = await supabase.from('npcs').delete().eq('id', id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Success", description: "NPC deleted" }); fetchNpcs(); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `npcs/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);
        if (uploadError) { toast({ title: "Error", description: uploadError.message, variant: "destructive" }); return; }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingNpc({ ...editingNpc, image_url: data.publicUrl, image_path: filePath });
    };

    const getInventoryItemDetails = (itemType, itemId) => {
        const source = allItems[itemType] || [];
        return source.find(i => i.id === itemId);
    };

    const selectClass = "w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10 text-white";

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">NPCs Management</h2>
                <Button onClick={() => setEditingNpc({ name: '', location: '', image_url: '', image_path: '' })}><Plus className="w-4 h-4 mr-2" />Add NPC</Button>
            </div>

            {editingNpc && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-6">
                    <h3 className="text-2xl font-bold text-white">{editingNpc.id ? 'Edit NPC' : 'New NPC'}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="NPC Name" value={editingNpc.name} onChange={(e) => setEditingNpc({ ...editingNpc, name: e.target.value })}/>
                        <Input placeholder="Location" value={editingNpc.location} onChange={(e) => setEditingNpc({ ...editingNpc, location: e.target.value })}/>
                    </div>

                    <div>
                        <label className="block text-white mb-2">Image</label>
                        <Input type="file" accept="image/*" onChange={handleImageUpload} />
                        {editingNpc.image_url && <img src={editingNpc.image_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />}
                    </div>

                    <div className="flex gap-2"><Button onClick={handleSaveNpc}><Save className="w-4 h-4 mr-2" />Save NPC</Button><Button variant="outline" onClick={() => setEditingNpc(null)}><X className="w-4 h-4 mr-2" />Cancel</Button></div>

                    {editingNpc.id && (
                        <>
                            {/* Missions Section */}
                            <div className="border-t border-white/10 pt-6">
                                <div className="flex justify-between items-center mb-4"><h4 className="text-xl font-bold text-white">Missions</h4><Button size="sm" onClick={handleAddMission}><Plus className="w-4 h-4 mr-2" />Add Mission</Button></div>
                                <div className="space-y-4">{missions.map(mission => (
                                    <div key={mission.id} className="bg-black/20 p-4 rounded-lg space-y-3">
                                        <Input placeholder="Mission Title" value={mission.title} onChange={(e) => setMissions(missions.map(m => m.id === mission.id ? { ...m, title: e.target.value } : m))}/>
                                        <select className={selectClass} value={mission.difficulty} onChange={(e) => setMissions(missions.map(m => m.id === mission.id ? { ...m, difficulty: e.target.value } : m))}>
                                            <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                                        </select>
                                        <textarea className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded" rows={4} placeholder="Mission Content (HTML supported)" value={mission.content_html || mission.content || ''} onChange={(e) => setMissions(missions.map(m => m.id === mission.id ? { ...m, content_html: e.target.value, content: e.target.value } : m))}/>
                                        <div className="flex gap-2"><Button size="sm" onClick={() => handleUpdateMission(mission)}><Save className="w-4 h-4 mr-2" />Save</Button><Button size="sm" variant="destructive" onClick={() => handleDeleteMission(mission.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button></div>
                                    </div>
                                ))}</div>
                            </div>

                            {/* Inventory Section */}
                            <div className="border-t border-white/10 pt-6">
                                <h4 className="text-xl font-bold text-white mb-4">Inventory (Items for Sale)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {Object.entries(allItems).map(([type, items]) => (
                                        <div key={type}>
                                            <label className="text-white mb-2 block capitalize">{type}</label>
                                            <select className={selectClass} onChange={(e) => { if (e.target.value) { handleAddInventoryItem(type, e.target.value); e.target.value = ''; } }}>
                                                <option value="">Add {type.slice(0, -1)}...</option>
                                                {items.map(item => (<option key={item.id} value={item.id}>{item.name} {item.subcategory ? `(${item.subcategory.name})` : item.type ? `(${item.type})` : ''}</option>))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {inventory.map((invItem, idx) => {
                                        const itemDetails = getInventoryItemDetails(invItem.item_type, invItem.item_id);
                                        return (
                                            <div key={idx} className="bg-black/20 p-2 rounded flex flex-col items-center text-center">
                                                {itemDetails?.image_url && <img src={itemDetails.image_url} alt={itemDetails.name} className="w-16 h-16 object-contain mb-2"/>}
                                                <span className="text-white text-sm truncate w-full">{itemDetails?.name || invItem.item_id}</span>
                                                <span className="text-gray-400 text-xs capitalize">{invItem.item_type.slice(0, -1)}</span>
                                                <Button size="sm" variant="destructive" className="mt-2 w-full" onClick={() => handleRemoveInventoryItem(invItem.item_type, invItem.item_id)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {npcs.map(npc => (
                    <div key={npc.id} className="bg-white/5 p-4 rounded-lg">
                        {npc.image_url && <img src={npc.image_url} alt={npc.name} className="w-full h-32 object-cover rounded mb-2" />}
                        <h3 className="font-bold text-white">{npc.name}</h3>
                        <p className="text-sm text-gray-400">{npc.location}</p>
                        <div className="flex gap-2 mt-2">
                           <Button size="icon" variant="outline" onClick={() => handleEdit(npc)}><Edit className="w-4 h-4" /></Button>
                           <Button size="icon" variant="destructive" onClick={() => handleDelete(npc.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NpcManager;