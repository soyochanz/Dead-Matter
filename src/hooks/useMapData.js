import { useState, useEffect } from 'react';
import { supabase } from '../lib/customSupabaseClient';

export const useMapData = (refreshTrigger = 0) => {
    const [markers, setMarkers] = useState([]);
    const [personalMarkers, setPersonalMarkers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [lootTags, setLootTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Check auth
                const { data: { user } } = await supabase.auth.getUser();

                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('marker_categories')
                    .select('*')
                    .order('group_name');

                if (categoriesError) throw categoriesError;

                // Fetch markers
                const { data: markersData, error: markersError } = await supabase
                    .from('map_markers')
                    .select('*');

                if (markersError) throw markersError;

                // Fetch loot tags
                const { data: lootTagsData, error: lootTagsError } = await supabase
                    .from('marker_loot_tags')
                    .select('*');

                if (lootTagsError) throw lootTagsError;

                // Fetch User Markers & Groups if logged in
                let userMarkersData = [];
                let userGroupsData = [];

                if (user) {
                    const { data: pMarkers, error: pError } = await supabase
                        .from('user_personal_markers')
                        .select('*');

                    if (!pError && pMarkers) {
                        userMarkersData = pMarkers;
                    }

                    const { data: gData, error: gError } = await supabase
                        .from('marker_groups')
                        .select('*');

                    if (!gError && gData) {
                        userGroupsData = gData;
                    }
                }

                setCategories(categoriesData);
                setMarkers(markersData);
                setLootTags(lootTagsData);
                setPersonalMarkers(userMarkersData);
                setGroups(userGroupsData);

            } catch (err) {
                console.error('Error fetching map data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]);

    return { markers, personalMarkers, groups, categories, lootTags, loading, error };
};
