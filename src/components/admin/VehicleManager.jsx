import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminItemCard } from './AdminItemCard';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Info, Tag, Gauge, Users, Fuel, HeartPulse, Sliders, Image as ImageIcon, Wrench } from 'lucide-react';
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
        <DialogContent className="bg-[#0a0a0c] border-white/5 text-white max-w-2xl rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            <DialogHeader className="p-6 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-3 mb-1">
                    <Wrench className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Mechanical Configuration</span>
                </div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">System Integrity: {vehicleName}</DialogTitle>
            </DialogHeader>

            {loading ? (
                <div className="flex justify-center p-12 relative z-10">
                    <Loader2 className="animate-spin w-8 h-8 text-red-500" />
                </div>
            ) : (
                <div className="max-h-[50vh] overflow-y-auto space-y-3 p-6 relative z-10 custom-scrollbar">
                    {components.map(component => {
                        const linked = linkedComponents.find(lc => lc.component_id === component.id);
                        return (
                            <div key={component.id} className="group flex items-center justify-between bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-center">
                                        <img src={component.image_url} alt={component.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white uppercase tracking-wide">{component.name}</span>
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mt-1">Component ID: {component.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {linked && (
                                        <div className="flex flex-col items-end mr-2">
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Quantity Required</span>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 h-8 bg-black/40 border border-white/10 rounded-lg text-center text-xs font-bold text-white focus:border-red-500/50 focus:outline-none transition-all"
                                                value={linked.quantity}
                                                onChange={(e) => handleQuantityChange(component.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => handleLinkToggle(component.id)}
                                        variant="ghost"
                                        className={`h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] px-4 transition-all ${linked
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {linked ? 'De-Link' : 'Establish Link'}
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

const VehicleManager = ({ sharedMetadata }) => {
    const [vehicles, setVehicles] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState([]);
    const [managingMechanicsFor, setManagingMechanicsFor] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
        // Filter subcategories for Vehicles category
        if (sharedMetadata?.categories?.length && sharedMetadata?.subcategories?.length) {
            const cat = sharedMetadata.categories.find(c => c.name === 'Vehicles');
            if (cat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === cat.id);
                setSubcategories(subs);
            }
        }
    }, [sharedMetadata]);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicles').select('*, subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Error fetching vehicles", description: error.message, variant: "destructive" });
        else setVehicles(data);
        setLoading(false);
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
        <FormContainer
            title={editingItem.id ? `Recalibrate ${editingItem.name}` : 'Initialize Vehicle System'}
            onSave={handleSave}
            onCancel={() => setEditingItem(null)}
            isSaving={loading}
        >
            <FormSection title="System Assignment" icon={Info}>
                <FormInput
                    label="Nomenclature"
                    placeholder="e.g., Tactical SUV"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
                <FormSelect
                    label="Class Assignment"
                    value={editingItem.subcategory_id}
                    onChange={(e) => setEditingItem({ ...editingItem, subcategory_id: e.target.value })}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
                <FormInput
                    label="Tow Capacity"
                    placeholder="e.g., 2000kg"
                    value={editingItem.capacity}
                    onChange={(e) => setEditingItem({ ...editingItem, capacity: e.target.value })}
                />
                <FormInput
                    label="Operational Role"
                    placeholder="e.g., Heavy Transport"
                    value={editingItem.use_case}
                    onChange={(e) => setEditingItem({ ...editingItem, use_case: e.target.value })}
                />
                <FormFileUpload
                    label="Neural Visual Asset"
                    accept="image/*"
                    onChange={handleImageUpload}
                    previewUrl={editingItem.image_url}
                    fileName={editingItem.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Operational Narrative" icon={Tag} columns={1}>
                <FormTextarea
                    label="Detailed Technical Log"
                    placeholder="Enter system deployment notes..."
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
            </FormSection>

            <FormSection title="Performance Parameters" icon={Sliders}>
                <FormInput
                    label="Inventory Capacity"
                    type="number"
                    value={editingItem.inventory_slots}
                    onChange={(e) => setEditingItem({ ...editingItem, inventory_slots: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Terminal Velocity (km/h)"
                    type="number"
                    value={editingItem.speed}
                    onChange={(e) => setEditingItem({ ...editingItem, speed: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Handling Coefficient"
                    type="number"
                    value={editingItem.driving_handling}
                    onChange={(e) => setEditingItem({ ...editingItem, driving_handling: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Occupancy Modules"
                    type="number"
                    value={editingItem.occupants}
                    onChange={(e) => setEditingItem({ ...editingItem, occupants: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Fuel Reservoir (L)"
                    type="number"
                    value={editingItem.fuel_capacity}
                    onChange={(e) => setEditingItem({ ...editingItem, fuel_capacity: parseInt(e.target.value) || null })}
                />
                <FormInput
                    label="Structural Integrity"
                    type="number"
                    value={editingItem.health}
                    onChange={(e) => setEditingItem({ ...editingItem, health: parseInt(e.target.value) || null })}
                />
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
        <Dialog open={!!managingMechanicsFor} onOpenChange={(open) => !open && setManagingMechanicsFor(null)}>
            <div>
                <div className="flex justify-between items-center text-white mb-8">
                    <h2 className="text-2xl font-bold uppercase tracking-tight">Manage Vehicles</h2>
                    <Button
                        onClick={() => setEditingItem({})}
                        className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                    </Button>
                </div>

                {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-red-500" /></div>}

                {editingItem && renderForm()}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {vehicles.map((item, idx) => (
                        <div key={item.id}>
                            <AdminItemCard
                                index={idx}
                                item={item}
                                type="vehicle"
                                onEdit={setEditingItem}
                                onDelete={(it) => handleDelete(it.id)}
                                onLink={(it) => setManagingMechanicsFor(it)}
                            />
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
