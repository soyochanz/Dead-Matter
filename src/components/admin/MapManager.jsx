import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, MapPin, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import InteractiveMap from '@/components/Map/InteractiveMap';

const MapManager = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // State
    const [categories, setCategories] = useState([]);
    const [editingMarker, setEditingMarker] = useState(null); // null = creating new
    const [markerPos, setMarkerPos] = useState(null); // LatLng

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        image_url: '',
        infected_level: 'Low',
        loot_color: '#ffffff'
    });

    // Fetch Categories
    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await supabase.from('marker_categories').select('*').order('name');
            if (data) setCategories(data);
        };
        fetchCats();
    }, []);

    // Handlers
    const handleMapClick = (latlng) => {
        setEditingMarker(null);
        setMarkerPos(latlng);
        setFormData({
            title: '',
            description: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            image_url: '',
            infected_level: 'Low',
            loot_color: '#ffffff'
        });
        setDialogOpen(true);
    };

    const handleMarkerClick = (marker) => {
        setEditingMarker(marker);
        setMarkerPos({ lat: marker.lat, lng: marker.lng });

        setFormData({
            title: marker.title,
            description: marker.description || '',
            category_id: marker.category_id,
            image_url: marker.image_url || '',
            infected_level: marker.infected_level || 'Low',
            loot_color: '#ffffff'
        });
        setDialogOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                lat: markerPos.lat,
                lng: markerPos.lng,
                title: formData.title,
                description: formData.description,
                category_id: formData.category_id,
                image_url: formData.image_url || null, // Allow empty for "dot" markers
                infected_level: formData.infected_level,
            };

            if (editingMarker) {
                // Update
                const { error } = await supabase
                    .from('map_markers')
                    .update(payload)
                    .eq('id', editingMarker.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Marker updated!' });
            } else {
                // Insert
                const { data: newMarker, error } = await supabase
                    .from('map_markers')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;

                toast({ title: 'Success', description: 'Marker created!' });
            }

            setDialogOpen(false);
            setRefreshTrigger(prev => prev + 1); // Trigger map refresh

        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingMarker) return;
        if (!confirm('Are you sure you want to delete this marker?')) return;

        setLoading(true);
        try {
            await supabase.from('marker_loot_tags').delete().eq('marker_id', editingMarker.id); // clean tags
            const { error } = await supabase.from('map_markers').delete().eq('id', editingMarker.id);
            if (error) throw error;

            toast({ title: 'Deleted', description: 'Marker removed.' });
            setDialogOpen(false);
            setRefreshTrigger(prev => prev + 1); // Trigger map refresh
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold text-white">Interactive Map Manager</h2>
                <div className="text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        Click map to add | Click marker to edit
                    </span>
                </div>
            </div>

            <div className="flex-grow border border-white/10 rounded-xl overflow-hidden relative min-h-[500px]">
                <InteractiveMap
                    adminMode={true}
                    onMapClick={handleMapClick}
                    onMarkerClick={handleMarkerClick}
                    refreshTrigger={refreshTrigger}
                />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMarker ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                            Location: {markerPos?.lat.toFixed(5)}, {markerPos?.lng.toFixed(5)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Name / Text</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="bg-neutral-800 border-neutral-700"
                                placeholder={formData.category_id && categories.find(c => c.id === formData.category_id)?.name.includes('Zone') ? "e.g., Dead Mans Flats" : "e.g., Hidden Cache"}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Type / Category</Label>
                            <select
                                id="category"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white capitalize"
                            >
                                <option value="" disabled>Select Type</option>
                                {/* Group Categories dynamically */}
                                {[...new Set(categories.map(c => c.group_name))].sort().map(group => {
                                    // Make "meta" group appear as "Zones" or similar if prefered, but "meta" is in DB.
                                    // Custom labels for well known groups
                                    let label = group;
                                    if (group === 'meta') label = 'Zones (Text Labels)';

                                    return (
                                        <optgroup key={group} label={label.charAt(0).toUpperCase() + label.slice(1)}>
                                            {categories.filter(c => c.group_name === group).map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Hide Image/Infected/Desc for Zones to simplify */}
                        {(!formData.category_id || !categories.find(c => c.id === formData.category_id)?.name.startsWith('Zones')) && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="image_url">Featured Image (Popup)</Label>
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={handleInputChange}
                                        className="bg-neutral-800 border-neutral-700"
                                    />
                                    <p className="text-xs text-gray-500">
                                        This image will appear inside the popup when clicking the marker.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="loot_type">Loot Type (Tag)</Label>
                                    <select
                                        id="loot_type"
                                        name="loot_color" // Reusing this state for the tag selection
                                        value={formData.loot_color}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                                    >
                                        <option value="#ffffff">None / Custom</option>
                                        <option value="Military">Military (Red)</option>
                                        <option value="Industrial">Industrial (Orange)</option>
                                        <option value="Civilian">Civilian (Green)</option>
                                        <option value="Medical">Medical (Purple)</option>
                                    </select>
                                </div>



                                <div className="grid gap-2">
                                    <Label htmlFor="infected_level">Infected Level</Label>
                                    <select
                                        id="infected_level"
                                        name="infected_level"
                                        value={formData.infected_level}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                                    >
                                        <option value="None">None</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="bg-neutral-800 border-neutral-700"
                                        rows={4}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        {editingMarker && (
                            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="mr-auto">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MapManager;