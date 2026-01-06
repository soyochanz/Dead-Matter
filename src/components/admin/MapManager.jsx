import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, MapPin, Trash2, Edit, Compass, Square, X } from 'lucide-react';
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
import InteractiveMap from '@/components/map/InteractiveMap';

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
    const [missionDialogOpen, setMissionDialogOpen] = useState(false);
    // State for categories, markers, and tags
    // We use refreshTrigger=0 to fetch initial data once, then manage locally
    const { categories, markers: initialMarkers, lootTags: initialTags, keys: availableKeys, missions: initialMissions, polygons: initialPolygons } = useMapData(0);

    // Local state for optimistic updates
    const [markers, setMarkers] = useState([]);
    const [missions, setMissions] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [lootTags, setLootTags] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const viewMode = searchParams.get('mode') || 'markers'; // 'markers', 'missions', 'zones'

    const setViewMode = (mode) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('mode', mode);
        setSearchParams(newParams);
    };
    const [isAddingStep, setIsAddingStep] = useState(false); // If true, next map click adds a step
    const [activeZonePoints, setActiveZonePoints] = useState([]); // [lat, lng] array for current polygon 

    // Initialize local state when data is fetched (ONLY if local is empty)
    useEffect(() => {
        if (initialMarkers && initialMarkers.length > 0) {
            setMarkers(prev => prev.length === 0 ? initialMarkers : prev);
        }
    }, [initialMarkers]);

    useEffect(() => {
        if (initialTags && initialTags.length > 0) {
            setLootTags(prev => prev.length === 0 ? initialTags : prev);
        }
    }, [initialTags]);

    useEffect(() => {
        if (initialMissions && initialMissions.length > 0) {
            setMissions(prev => prev.length === 0 ? initialMissions : prev);
        }
    }, [initialMissions]);

    useEffect(() => {
        if (initialPolygons && initialPolygons.length > 0) {
            setPolygons(prev => prev.length === 0 ? initialPolygons : prev);
        }
    }, [initialPolygons]);

    // State, form data, etc
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        image_url: '',
        infected_level: 'Low',
        selectedTags: [],
        requires_key: false,
        required_key_ids: [],
        required_key_id: ''
    });

    // Mission Form Data
    const [missionForm, setMissionForm] = useState({
        title: '',
        description: '',
        npc_id: '',
        start_npc_id: '',
        steps: [] // Array of { title, description, lat, lng, image_url }
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
        if (viewMode === 'missions') {
            if (isAddingStep) {
                setMissionForm(prev => {
                    const updated = {
                        ...prev,
                        steps: [...prev.steps, {
                            title: `Step ${prev.steps.length + 1}`,
                            description: '',
                            lat: latlng.lat,
                            lng: latlng.lng,
                            image_url: ''
                        }]
                    };
                    return updated;
                });
                setIsAddingStep(false);
                setMissionDialogOpen(true);
            }
            return;
        }

        if (viewMode === 'zones') {
            const newPoints = [...activeZonePoints, [latlng.lat, latlng.lng]];
            setActiveZonePoints(newPoints);

            if (newPoints.length === 4) {
                handleZoneSave(newPoints);
                setActiveZonePoints([]);
            }
            return;
        }

        // Default: Marker Mode
        setEditingMarker(null);
        setMarkerPos(latlng);
        setFormData({
            title: '',
            description: '',
            category_id: categories.length > 0 ? categories[0].id : '',
            image_url: '',
            infected_level: 'Low',
            selectedTags: [],
            requires_key: false,
            required_key_id: ''
        });
        setDialogOpen(true);
    };

    const handleCreateMission = () => {
        setMissionForm({ title: '', description: '', npc_id: '', start_npc_id: '', steps: [] });
        setIsAddingStep(false);
        setEditingMarker(null); // Ensure we aren't editing a marker
        setMissionDialogOpen(true);
    };

    const handleMissionSave = async () => {
        setLoading(true);
        try {
            // 1. Insert Mission
            const { data: mission, error: missionError } = await supabase
                .from('missions')
                .insert({
                    title: missionForm.title,
                    description: missionForm.description,
                    npc_id: missionForm.npc_id || null,
                    start_npc_id: missionForm.start_npc_id || null
                })
                .select()
                .single();
            if (missionError) throw missionError;

            // 2. Insert Steps
            if (missionForm.steps.length > 0) {
                const stepInserts = missionForm.steps.map((step, index) => ({
                    mission_id: mission.id,
                    step_order: index + 1,
                    title: step.title,
                    description: step.description,
                    image_url: step.image_url,
                    lat: step.lat,
                    lng: step.lng
                }));
                const { error: stepsError } = await supabase.from('mission_steps').insert(stepInserts);
                if (stepsError) throw stepsError;
            }

            toast({ title: 'Mission Created', description: `Added ${mission.title} with ${missionForm.steps.length} steps.` });
            setMissionDialogOpen(false);

            // Re-fetch or manually update local state if needed
            // For now we rely on refresh or reload, but let's push locally
            setMissions(prev => [{ ...mission, mission_steps: missionForm.steps }, ...prev]);

        } catch (e) {
            console.error(e);
            toast({ title: 'Error', variant: 'destructive', description: e.message });
        } finally {
            setLoading(false);
        }
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
                selectedTags: currentTags,
                requires_key: marker.requires_key || false,
                required_key_ids: marker.required_key_ids || (marker.required_key_id ? [marker.required_key_id] : [])
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

    const handleKeyToggle = (keyId) => {
        setFormData(prev => {
            const current = prev.required_key_ids || [];
            if (current.includes(keyId)) {
                return { ...prev, required_key_ids: current.filter(k => k !== keyId) };
            } else {
                return { ...prev, required_key_ids: [...current, keyId] };
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        // Generate a temporary ID for new markers to display them immediately
        const tempId = editingMarker ? editingMarker.id : `temp-${Date.now()}`;

        try {
            const payload = {
                lat: markerPos.lat,
                lng: markerPos.lng,
                title: formData.title,
                description: formData.description,
                category_id: formData.category_id,
                image_url: formData.image_url || null,
                infected_level: formData.infected_level,
                requires_key: formData.requires_key,
                required_key_ids: formData.requires_key ? formData.required_key_ids : [],
                required_key_id: (formData.requires_key && formData.required_key_ids?.length > 0) ? formData.required_key_ids[0] : null
            };

            // 1. OPTIMISTIC UPDATE: MARKER
            let optimisticMarker = { ...payload, id: tempId };

            if (editingMarker) {
                setMarkers(prev => prev.map(m => m.id === tempId ? { ...m, ...optimisticMarker } : m));
            } else {
                setMarkers(prev => [...prev, optimisticMarker]);
            }

            // 2. OPTIMISTIC UPDATE: TAGS
            // First remove old tags for this marker (simulated)
            setLootTags(prev => prev.filter(t => t.marker_id !== tempId));

            // Then add new ones locally
            const optimisticTags = formData.selectedTags.map(label => {
                const tagConfig = TAG_OPTIONS.find(t => t.label === label);
                return {
                    id: `temp-tag-${Math.random()}`,
                    marker_id: tempId,
                    label: label,
                    color: tagConfig ? tagConfig.color : '#ffffff'
                };
            });
            setLootTags(prev => [...prev, ...optimisticTags]);

            setDialogOpen(false); // Close immediately for smooth UX

            // 3. DATABASE OPERATIONS
            let targetMarkerId = editingMarker?.id;
            let finalMarker = null;

            if (editingMarker) {
                const { data, error } = await supabase
                    .from('map_markers')
                    .update(payload)
                    .eq('id', editingMarker.id)
                    .select()
                    .single();

                if (error) throw error;
                finalMarker = data;
                toast({ title: 'Success', description: 'Marker updated!' });
            } else {
                const { data, error } = await supabase
                    .from('map_markers')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                finalMarker = data;
                targetMarkerId = finalMarker.id;
                toast({ title: 'Success', description: 'Marker created!' });

                // Replace temp ID with real ID in local state
                setMarkers(prev => prev.map(m => m.id === tempId ? finalMarker : m));

                // Also update the marker_id in our local text tags to match the real ID
                setLootTags(prev => prev.map(t => t.marker_id === tempId ? { ...t, marker_id: finalMarker.id } : t));
            }

            if (targetMarkerId) {
                // Handle Tags in DB
                const { error: deleteError } = await supabase.from('marker_loot_tags').delete().eq('marker_id', targetMarkerId);
                if (deleteError) throw deleteError;

                if (formData.selectedTags.length > 0) {
                    const tagInserts = formData.selectedTags.map(label => {
                        const tagConfig = TAG_OPTIONS.find(t => t.label === label);
                        return { marker_id: targetMarkerId, label: label, color: tagConfig ? tagConfig.color : '#ffffff' };
                    });
                    // We select * to get the real IDs of tags too, if we wanted to be perfectly precise, 
                    // but for tags, re-fetching or just keeping optimistic ones is mostly fine until next reload.
                    // However, better to update them if possible. 
                    const { data: newTags, error: insertError } = await supabase.from('marker_loot_tags').insert(tagInserts).select();
                    if (insertError) throw insertError;

                    // Replace optimistic tags with real DB tags to ensure IDs are correct (future proofing)
                    setLootTags(prev => {
                        const otherTags = prev.filter(t => t.marker_id !== targetMarkerId);
                        return [...otherTags, ...newTags];
                    });
                } else {
                    // Ensure local tags are cleared if DB cleared them (already done optimistically, but safety check)
                    setLootTags(prev => prev.filter(t => t.marker_id !== targetMarkerId));
                }
            }

            // No refreshTrigger needed!

        } catch (error) {
            console.error("Save Error:", error);
            toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
            // Ideally: Revert optimistic updates here by re-fetching or undoing
            // For now, we trust the optimistic update or user will reload if verified error.
            if (!editingMarker) {
                // If create failed, remove the temp marker
                setMarkers(prev => prev.filter(m => String(m.id).startsWith('temp-')));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingMarker) return;
        if (!confirm('Are you sure you want to delete this marker?')) return;

        setLoading(true);
        const idToDelete = editingMarker.id;

        try {
            // OPTIMISTIC DELETE
            setMarkers(prev => prev.filter(m => m.id !== idToDelete));
            setLootTags(prev => prev.filter(t => t.marker_id !== idToDelete));
            setDialogOpen(false);

            // DB DELETE
            const { error } = await supabase.from('map_markers').delete().eq('id', idToDelete);

            if (error) throw error;
            toast({ title: 'Deleted', description: 'Marker deleted successfully.' });

        } catch (error) {
            console.error("Delete Error:", error);
            toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
            // Revert would require re-fetching or keeping backup
        } finally {
            setLoading(false);
        }
    };

    const handleZoneSave = async (points) => {
        setLoading(true);
        try {
            // Optimistic update
            const tempZone = {
                id: `temp-${Date.now()}`,
                points: points,
                type: 'house'
            };
            setPolygons(prev => [...prev, tempZone]);
            toast({ title: 'Zone Added', description: 'Building zone marked.' });

            // DB Insert
            const { data, error } = await supabase.from('map_polygons').insert({
                points: points,
                type: 'house'
            }).select().single();

            if (error) throw error;

            // Update temp ID
            setPolygons(prev => prev.map(p => p.id === tempZone.id ? data : p));

        } catch (e) {
            console.error(e);
            toast({ title: 'Error saving zone', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleZoneDelete = async (id) => {
        if (!confirm('Delete this zone?')) return;
        setLoading(true);
        try {
            setPolygons(prev => prev.filter(p => p.id !== id));
            await supabase.from('map_polygons').delete().eq('id', id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate manual polylines for interactive map
    const manualPolylines = useMemo(() => {
        if (viewMode === 'missions' && missionForm.steps.length > 0) {
            const steps = missionForm.steps;
            const poly = steps.map(s => [s.lat, s.lng]);
            // If NPC is selected, add it?
            if (missionForm.npc_id) {
                const npc = markers.find(m => m.id === missionForm.npc_id);
                if (npc) poly.push([npc.lat, npc.lng]);
            }
            return [poly];
        }
        return [];
    }, [viewMode, missionForm.steps, missionForm.npc_id, markers]);

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold text-white">Interactive Map Manager</h2>
                <div className="text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {viewMode === 'markers' ? 'Click map to add | Click marker to edit' : 'Click "New Mission" to start'}
                    </span>
                </div>
                {viewMode === 'missions' && (
                    <Button onClick={handleCreateMission} className="ml-4 bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Mission
                    </Button>
                )}
            </div>

            {/* TAB CONTROLS */}
            <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
                <Button
                    variant={viewMode === 'markers' ? "default" : "outline"}
                    onClick={() => setViewMode('markers')}
                    className={viewMode === 'markers' ? "bg-red-600 hover:bg-red-700" : "border-white/10 text-gray-400 hover:text-white"}
                >
                    <MapPin className="w-4 h-4 mr-2" />
                    Markers ({markers.length})
                </Button>
                <Button
                    variant={viewMode === 'missions' ? "default" : "outline"}
                    onClick={() => setViewMode('missions')}
                    className={viewMode === 'missions' ? "bg-amber-600 hover:bg-amber-700" : "border-white/10 text-gray-400 hover:text-white"}
                >
                    <Compass className="w-4 h-4 mr-2" />
                    Missions ({missions.length})
                </Button>
                <Button
                    variant={viewMode === 'zones' ? "default" : "outline"}
                    onClick={() => setViewMode('zones')}
                    className={viewMode === 'zones' ? "bg-blue-600 hover:bg-blue-700" : "border-white/10 text-gray-400 hover:text-white"}
                >
                    <Square className="w-4 h-4 mr-2" />
                    Zones ({polygons.length})
                </Button>
            </div>

            {viewMode === 'zones' && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg mb-4 flex items-center justify-between">
                    <div className="text-sm text-blue-200">
                        <strong className="text-blue-400">Add Building Zone:</strong> Click 4 corner points on the map.
                        {activeZonePoints.length > 0 && <span className="ml-2 text-white bg-blue-600 px-2 py-0.5 rounded-full text-xs">{activeZonePoints.length} / 4 points</span>}
                    </div>
                    {activeZonePoints.length > 0 && (
                        <Button size="sm" variant="ghost" className="h-6 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => setActiveZonePoints([])}>
                            <X className="w-3 h-3 mr-1" /> Clear Points
                        </Button>
                    )}
                </div>
            )}

            <div className="flex-grow border border-white/10 rounded-xl overflow-hidden relative min-h-[500px]">
                <InteractiveMap
                    adminMode={true}
                    disableUI={true}
                    onMapClick={handleMapClick}
                    onMarkerClick={handleMarkerClick}
                    markers={markers}
                    lootTags={lootTags}
                    categories={categories}
                    keys={availableKeys}
                    manualPolylines={manualPolylines}
                    polygons={polygons}
                    activePolygonPoints={activeZonePoints}
                    onPolygonClick={viewMode === 'zones' ? handleZoneDelete : undefined}
                />
            </div>

            {/* MARKER / ZONE DIALOG */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className="bg-neutral-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
                >
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

                                {/* Requires Key Checkbox */}
                                <div className="flex items-center space-x-2 border border-neutral-700 bg-neutral-800 p-3 rounded-md">
                                    <Checkbox
                                        id="requires_key"
                                        checked={formData.requires_key}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_key: checked }))}
                                    />
                                    <Label htmlFor="requires_key" className="text-sm font-medium cursor-pointer text-amber-500">
                                        Requires Key 🔐
                                    </Label>
                                </div>

                                {formData.requires_key && (
                                    <div className="grid gap-2 pl-4 border-l-2 border-amber-500/30">
                                        <Label className="text-amber-500">Select Keys (Multi-select)</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-neutral-800 rounded-md border border-neutral-700 max-h-[200px] overflow-y-auto">
                                            {availableKeys && availableKeys.sort((a, b) => a.name.localeCompare(b.name)).map(key => (
                                                <div key={key.id} className="flex items-center space-x-2 p-1 hover:bg-white/5 rounded">
                                                    <Checkbox
                                                        id={`key-${key.id}`}
                                                        checked={(formData.required_key_ids || []).includes(key.id)}
                                                        onCheckedChange={() => handleKeyToggle(key.id)}
                                                        className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black"
                                                    />
                                                    <label htmlFor={`key-${key.id}`} className="text-sm cursor-pointer select-none text-gray-300">
                                                        {key.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

            {/* MISSION DIALOG */}
            <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
                <DialogContent
                    className="bg-neutral-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
                >
                    <DialogHeader>
                        <DialogTitle>New Mission</DialogTitle>
                        <DialogDescription>
                            Define steps and NPC targets.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="m-title">Mission Title</Label>
                            <Input
                                id="m-title"
                                value={missionForm.title}
                                onChange={e => setMissionForm({ ...missionForm, title: e.target.value })}
                                className="bg-neutral-800 border-neutral-700"
                                placeholder="e.g., The Lost Shipment"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="m-desc">Mission Description</Label>
                            <Textarea
                                id="m-desc"
                                value={missionForm.description}
                                onChange={e => setMissionForm({ ...missionForm, description: e.target.value })}
                                className="bg-neutral-800 border-neutral-700"
                                placeholder="Brief overview..."
                            />
                        </div>

                        <div className="border border-white/10 rounded-lg p-3 space-y-3 bg-white/5">
                            <h4 className="font-semibold text-sm text-amber-500 flex justify-between items-center">
                                Mission Steps
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                                    onClick={() => {
                                        setIsAddingStep(true);
                                        setMissionDialogOpen(false); // Hide dialog to pick location
                                        toast({ description: "Click on the map to set the step location.", duration: 3000 });
                                    }}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Step
                                </Button>
                            </h4>

                            {missionForm.steps.length === 0 && (
                                <p className="text-xs text-neutral-500 italic">No steps added yet. Add steps to guide the player.</p>
                            )}

                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {missionForm.steps.map((step, idx) => (
                                    <div key={idx} className="bg-black/30 p-2 rounded text-xs border border-white/5">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-gray-300">Step {idx + 1}</span>
                                            <button onClick={() => {
                                                const newSteps = [...missionForm.steps];
                                                newSteps.splice(idx, 1);
                                                setMissionForm({ ...missionForm, steps: newSteps });
                                            }} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                                        </div>
                                        <Input
                                            value={step.title}
                                            onChange={e => {
                                                const newSteps = [...missionForm.steps];
                                                newSteps[idx].title = e.target.value;
                                                setMissionForm({ ...missionForm, steps: newSteps });
                                            }}
                                            className="h-6 text-xs bg-transparent border-none p-0 focus-visible:ring-0 placeholder-gray-600 mb-1"
                                            placeholder="Step Title"
                                        />
                                        <Input
                                            value={step.image_url}
                                            onChange={e => {
                                                const newSteps = [...missionForm.steps];
                                                newSteps[idx].image_url = e.target.value;
                                                setMissionForm({ ...missionForm, steps: newSteps });
                                            }}
                                            className="h-6 text-xs bg-white/5 border-white/10 mb-1"
                                            placeholder="Image URL (Optional)"
                                        />
                                        <Textarea
                                            value={step.description}
                                            onChange={e => {
                                                const newSteps = [...missionForm.steps];
                                                newSteps[idx].description = e.target.value;
                                                setMissionForm({ ...missionForm, steps: newSteps });
                                            }}
                                            className="min-h-[40px] text-xs bg-transparent border-white/10 p-1 focus-visible:ring-0 placeholder-gray-600"
                                            placeholder="Step instructions..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start NPC (Origin)</Label>
                                <select
                                    value={missionForm.start_npc_id}
                                    onChange={e => setMissionForm({ ...missionForm, start_npc_id: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white capitalize"
                                >
                                    <option value="">-- Select NPC --</option>
                                    {markers.filter(m => {
                                        const cat = categories.find(c => c.id === m.category_id);
                                        const name = cat?.name?.toLowerCase() || '';
                                        const group = cat?.group_name?.toLowerCase() || '';
                                        return name.includes('npc') || name.includes('vendor') || name.includes('trader') || group.includes('npc');
                                    }).map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label>End NPC (Goal)</Label>
                                <select
                                    value={missionForm.npc_id}
                                    onChange={e => setMissionForm({ ...missionForm, npc_id: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white capitalize"
                                >
                                    <option value="">-- Select NPC --</option>
                                    {markers.filter(m => {
                                        const cat = categories.find(c => c.id === m.category_id);
                                        const name = cat?.name?.toLowerCase() || '';
                                        const group = cat?.group_name?.toLowerCase() || '';
                                        return name.includes('npc') || name.includes('vendor') || name.includes('trader') || group.includes('npc');
                                    }).map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setMissionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleMissionSave} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Mission
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default MapManager;
