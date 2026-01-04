import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X, Wrench } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CustomStatManager } from '@/components/admin/CustomStatManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const VehicleMechanicsManager = ({ vehicleId, vehicleName, onClose }) => {
    const [components, setComponents] = useState([]);
    const [linkedComponents, setLinkedComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!vehicleId) return;
        const fetchData = async () => {
            setLoading(true);
            const { data: componentsData } = await supabase.from('vehicle_components').select('*').order('name');
            const { data: linkedData } = await supabase.from('vehicle_required_components').select('*').eq('vehicle_id', vehicleId);
            
            setComponents(componentsData || []);
            setLinkedComponents(linkedData || []);
            setLoading(false);
        };
        fetchData();
    }, [vehicleId]);

    const handleLinkToggle = async (componentId) => {
        const isLinked = linkedComponents.some(lc => lc.component_id === componentId);
        if (isLinked) {
            const { error } = await supabase.from('vehicle_required_components').delete().match({ vehicle_id: vehicleId, component_id: componentId });
            if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
            else setLinkedComponents(prev => prev.filter(lc => lc.component_id !== componentId));
        } else {
            const { data, error } = await supabase.from('vehicle_required_components').insert({ vehicle_id: vehicleId, component_id: componentId, quantity: 1 }).select().single();
            if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
            else setLinkedComponents(prev => [...prev, data]);
        }
    };

    const handleQuantityChange = async (componentId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (isNaN(quantity) || quantity < 1) return;

        const { error } = await supabase.from('vehicle_required_components').update({ quantity }).match({ vehicle_id: vehicleId, component_id: componentId });
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else setLinkedComponents(prev => prev.map(lc => lc.component_id === componentId ? { ...lc, quantity } : lc));
    };

    return (
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
                <DialogTitle>Manage Mechanics for: {vehicleName}</DialogTitle>
            </DialogHeader>
            {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-red-500" /></div> : (
                <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">
                    {components.map(component => {
                        const linked = linkedComponents.find(lc => lc.component_id === component.id);
                        return (
                            <div key={component.id} className="flex items-center justify-between bg-black/20 p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={component.image_url} alt={component.name} className="w-10 h-10 object-contain bg-black/30 rounded" />
                                    <span>{component.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {linked && (
                                        <Input 
                                            type="number" 
                                            min="1"
                                            className="w-20 bg-slate-800" 
                                            value={linked.quantity} 
                                            onChange={(e) => handleQuantityChange(component.id, e.target.value)}
                                        />
                                    )}
                                    <Button onClick={() => handleLinkToggle(component.id)} variant={linked ? 'destructive' : 'default'}>
                                        {linked ? 'Unlink' : 'Link'}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DialogContent>
    );
};

const VehicleManager = () => {
    const [vehicles, setVehicles] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState([]);
    const [managingMechanicsFor, setManagingMechanicsFor] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        fetchMeta();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicles').select('*, subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Error fetching vehicles", description: error.message, variant: "destructive" });
        else setVehicles(data);
        setLoading(false);
    };

    const fetchMeta = async () => {
        const { data: category } = await supabase.from('wiki_categories').select('id').eq('name', 'Vehicles').single();
        if (category) {
            const { data: subcategoriesData } = await supabase.from('wiki_subcategories').select('*').eq('category_id', category.id);
            setSubcategories(subcategoriesData || []);
        }
    };

    const handleSave = async () => {
        const itemData = { ...editingItem };
        delete itemData.subcategory;

        let error;
        if (itemData.id) {
            ({ error } = await supabase.from('vehicles').update(itemData).eq('id', itemData.id));
        } else {
            ({ error } = await supabase.from('vehicles').insert([itemData]));
        }

        if (error) {
            toast({ title: "Error saving vehicle", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Vehicle saved successfully" });
            setEditingItem(null);
            fetchData();
        }
    };
    
    const handleDelete = async (id) => {
        await supabase.from('vehicle_required_components').delete().eq('vehicle_id', id);
        const { error } = await supabase.from('vehicles').delete().eq('id', id);
        if (error) toast({ title: "Error deleting vehicle", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Vehicle deleted" });
            fetchData();
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `vehicles/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);

        if (uploadError) {
            toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
            return;
        }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingItem({ ...editingItem, image_url: data.publicUrl, image_path: filePath });
    };

    const renderForm = () => (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-6 my-4">
            <h3 className="text-2xl font-bold text-white">{editingItem.id ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <Input placeholder="Name" value={editingItem.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            <textarea placeholder="Description" value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <select value={editingItem.subcategory_id || ''} onChange={(e) => setEditingItem({ ...editingItem, subcategory_id: e.target.value })} className="bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10 col-span-2">
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Input placeholder="Capacity (Towable)" value={editingItem.capacity || ''} onChange={(e) => setEditingItem({ ...editingItem, capacity: e.target.value })} />
                <Input placeholder="Use Case (Towable)" value={editingItem.use_case || ''} onChange={(e) => setEditingItem({ ...editingItem, use_case: e.target.value })} />
            </div>

            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-grow"/>
                {editingItem.image_url && <img src={editingItem.image_url} alt="preview" className="w-20 h-20 object-contain rounded bg-slate-700"/>}
            </div>

            <h4 className="text-lg font-semibold text-white border-t border-slate-700 pt-4 mt-4">Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input type="number" placeholder="Inventory Slots" value={editingItem.inventory_slots || ''} onChange={(e) => setEditingItem({ ...editingItem, inventory_slots: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Speed (km/h)" value={editingItem.speed || ''} onChange={(e) => setEditingItem({ ...editingItem, speed: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Handling" value={editingItem.driving_handling || ''} onChange={(e) => setEditingItem({ ...editingItem, driving_handling: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Occupants" value={editingItem.occupants || ''} onChange={(e) => setEditingItem({ ...editingItem, occupants: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Fuel Capacity (L)" value={editingItem.fuel_capacity || ''} onChange={(e) => setEditingItem({ ...editingItem, fuel_capacity: parseInt(e.target.value) || null })} />
                <Input type="number" placeholder="Health" value={editingItem.health || ''} onChange={(e) => setEditingItem({ ...editingItem, health: parseInt(e.target.value) || null })} />
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
                <CustomStatManager stats={editingItem.stats} setStats={stats => setEditingItem({...editingItem, stats})} />
            </div>

            <div className="flex gap-4">
                <Button onClick={handleSave}><Save className="w-4 h-4 mr-2"/>Save</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2"/>Cancel</Button>
            </div>
        </div>
    );

    return (
        <Dialog open={!!managingMechanicsFor} onOpenChange={(open) => !open && setManagingMechanicsFor(null)}>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Manage Vehicles</h2>
                    <Button onClick={() => setEditingItem({})}><Plus className="w-4 h-4 mr-2"/>Add Vehicle</Button>
                </div>

                {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-red-500" /></div>}
                
                {editingItem && renderForm()}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(item => (
                        <div key={item.id} className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
                            <div>
                                {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-contain rounded-md bg-slate-700 mb-2"/>}
                                <h3 className="font-bold text-white">{item.name}</h3>
                                <p className="text-sm text-gray-400">{item.subcategory?.name}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button size="icon" variant="outline" onClick={() => setEditingItem(item)}><Edit className="w-4 h-4"/></Button>
                                <DialogTrigger asChild>
                                    <Button size="icon" variant="outline" onClick={() => setManagingMechanicsFor(item)}><Wrench className="w-4 h-4"/></Button>
                                </DialogTrigger>
                                <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4"/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {managingMechanicsFor && (
                <VehicleMechanicsManager 
                    vehicleId={managingMechanicsFor.id} 
                    vehicleName={managingMechanicsFor.name}
                />
            )}
        </Dialog>
    );
};

export default VehicleManager;