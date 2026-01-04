import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, MapPin, Trash2, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useMapData } from '@/hooks/useMapData';
import InteractiveMap from '@/components/Map/InteractiveMap';

// Tag options configuration
const TAG_OPTIONS = [
    { label: 'Military', color: '#ef4444' },   // Red-500
    { label: 'Industrial', color: '#f97316' }, // Orange-500
    { label: 'Civilian', color: '#22c55e' },   // Green-500
    { label: 'Medical', color: '#a855f7' },    // Purple-500
    { label: 'Food', color: '#eab308' },       // Yellow-500
    { label: 'Calculated', color: '#3b82f6' }  // Blue-500
];

const MapManager = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch categories using the hook (robust against errors)
    const { categories } = useMapData(refreshTrigger);

    // State, form data, etc
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        image_url: '',
        infected_level: 'Low',
        selectedTags: []
    });
    const [markerPos, setMarkerPos] = useState({ lat: 0, lng: 0 });
    const [editingMarker, setEditingMarker] = useState(null);

    const [itemSearchType, setItemSearchType] = useState('keys');
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [itemSearchResults, setItemSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Item Search Handler
    const handleItemSearch = async () => {
        if (!itemSearchQuery || itemSearchQuery.length < 2) return;
        setIsSearching(true);
        try {
            const { data, error } = await supabase
                .from(itemSearchType)
                .select('*')
                .ilike('name', `%${itemSearchQuery}%`)
                .limit(5);

            if (error) throw error;
            setItemSearchResults(data || []);
        } catch (error) {
            console.error("Search error:", error);
            toast({ title: 'Search skipped', description: 'Could not search that table (check permissions).', variant: 'destructive' });
        } finally {
            setIsSearching(false);
        }
    };



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
            selectedTags: []
        });
        setDialogOpen(true);
    };

    const handleMarkerClick = async (marker) => {
        setLoading(true);
        try {
            setEditingMarker(marker);
            setMarkerPos({ lat: marker.lat, lng: marker.lng });

            // 1. Fetch tags
            const { data: tags, error: tagError } = await supabase
                .from('marker_loot_tags')
                .select('label')
                .eq('marker_id', marker.id);
            if (tagError) throw tagError;



            const currentTags = tags ? tags.map(t => t.label) : [];

            setFormData({
                title: marker.title,
                description: marker.description || '',
                category_id: marker.category_id,
                image_url: marker.image_url || '',
                infected_level: marker.infected_level || 'Low',
                selectedTags: currentTags
            });
            setDialogOpen(true);
        } catch (error) {
            console.error("Error preparing edit:", error);
            toast({ title: 'Error loading marker', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tagLabel) => {
        setFormData(prev => {
            const current = prev.selectedTags;
            if (current.includes(tagLabel)) {
                return { ...prev, selectedTags: current.filter(t => t !== tagLabel) };
            } else {
                return { ...prev, selectedTags: [...current, tagLabel] };
            }
        });
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
                image_url: formData.image_url || null,
                infected_level: formData.infected_level,
            };

            let targetMarkerId = editingMarker?.id;

            if (editingMarker) {
                const { error } = await supabase.from('map_markers').update(payload).eq('id', editingMarker.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Marker updated!' });
            } else {
                const { data: newMarker, error } = await supabase.from('map_markers').insert(payload).select().single();
                if (error) throw error;
                targetMarkerId = newMarker.id;
                toast({ title: 'Success', description: 'Marker created!' });
            }

            if (targetMarkerId) {
                // Tags Logic
                const { error: deleteError } = await supabase.from('marker_loot_tags').delete().eq('marker_id', targetMarkerId);
                if (deleteError) throw deleteError;
                if (formData.selectedTags.length > 0) {
                    const tagInserts = formData.selectedTags.map(label => {
                        const tagConfig = TAG_OPTIONS.find(t => t.label === label);
                        return { marker_id: targetMarkerId, label: label, color: tagConfig ? tagConfig.color : '#ffffff' };
                    });
                    const { error: insertError } = await supabase.from('marker_loot_tags').insert(tagInserts);
                    if (insertError) throw insertError;
                }
            }

            setDialogOpen(false);
            setRefreshTrigger(prev => prev + 1);

        } catch (error) {
            console.error("Save Error:", error);
            toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingMarker) return;
        if (!confirm('Are you sure you want to delete this marker?')) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('map_markers').delete().eq('id', editingMarker.id);
            if (error) throw error;
            toast({ title: 'Deleted', description: 'Marker deleted successfully.' });
            setDialogOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Delete Error:", error);
            toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
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
                    disableUI={true}
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
                                placeholder="e.g., Hidden Cache"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category">Type / Category</Label>
                            <select
                                id="category"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white capitalize text-left"
                            >
                                <option value="" disabled>Select Type</option>
                                {[...new Set(categories.map(c => c.group_name))].sort().map(group => {
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

                        {(!formData.category_id || !categories.find(c => c.id === formData.category_id)?.name.startsWith('Zones')) && (
                            <>
                                {/* FEATURED IMAGE */}
                                <div className="grid gap-2">
                                    <Label htmlFor="image_url">Featured Image</Label>
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={handleInputChange}
                                        className="bg-neutral-800 border-neutral-700"
                                    />
                                </div>



                                <div className="grid gap-2">
                                    <Label>Loot Tags (Multi-select)</Label>
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-800 rounded-md border border-neutral-700">
                                        {TAG_OPTIONS.map((tag) => (
                                            <div key={tag.label} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`tag-${tag.label}`}
                                                    checked={formData.selectedTags.includes(tag.label)}
                                                    onCheckedChange={() => handleTagToggle(tag.label)}
                                                />
                                                <label htmlFor={`tag-${tag.label}`} className="text-sm font-medium" style={{ color: tag.color }}>
                                                    {tag.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
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