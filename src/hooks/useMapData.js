import { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';

export const useMapData = (refreshTrigger = 0, { enabled = true } = {}) => {
    const [categories, setCategories] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [lootTags, setLootTags] = useState([]);

    const [personalMarkers, setPersonalMarkers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const fetchMapData = async () => {
            try {
                // Only show loading spinner on initial fetch, not refreshes
                if (markers.length === 0) setLoading(true);

                // Check auth
                const { data: { user } } = await supabase.auth.getUser();

                // 1. Fetch Categories (Required)
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('marker_categories')
                    .select('*')
                    .order('group_name');
                if (categoriesError) throw categoriesError;

                // 2. Fetch Markers (Required)
                const { data: markersData, error: markersError } = await supabase
                    .from('map_markers')
                    .select('*');
                if (markersError) throw markersError;

                // 3. Optional Data (Loot Tags, Personal)
                // We wrap these in try-catch blocks to prevent breaking the map if tables are missing or RLS fails.

                let lootTagsData = [];
                try {
                    const { data, error } = await supabase.from('marker_loot_tags').select('*');
                    if (error) console.warn('Loot tags fetch warning:', error.message);
                    else lootTagsData = data;
                } catch (e) {
                    console.warn('Loot tags fetch failed:', e);
                }



                let userMarkersData = [];
                let userGroupsData = [];
                if (user) {
                    try {
                        const { data, error } = await supabase.from('user_personal_markers').select('*');
                        if (error) console.warn('Personal markers warning:', error.message);
                        else userMarkersData = data;
                    } catch (e) { console.warn('Personal markers fetch failed', e); }

                    try {
                        const { data, error } = await supabase.from('marker_groups').select('*');
                        if (error) console.warn('Groups warning:', error.message);
                        else userGroupsData = data;
                    } catch (e) { console.warn('Groups fetch failed', e); }
                }

                setCategories(categoriesData);
                setMarkers(markersData);
                setLootTags(lootTagsData || []);
                setPersonalMarkers(userMarkersData || []);
                setGroups(userGroupsData || []);
            } catch (err) {
                console.error('Error fetching map data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMapData();
    }, [refreshTrigger]);

    return {
        categories,
        markers,
        lootTags,

        personalMarkers,
        groups,
        loading,
        error
    };
};
