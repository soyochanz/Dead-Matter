
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://facbshcmgrjexsvpuwgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhY2JzaGNtZ3JqZXhzdnB1d2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTI1NjAsImV4cCI6MjA3Nzc2ODU2MH0.1-TvO37dJS8YvU_gkOpFpZlIx_0U-ebEEMrjqtBW5Og';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInserts() {
    console.log("1. Signing in/Creating temp user...")

    // Create a random email for test
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const email = `test_${uniqueId}@example.com`
    const password = 'password123'

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        console.error("Auth Error:", authError)
        // If sign up fails (maybe email confirm on), try to sign in with a known test user if you had one,
        // but here we assume we can sign up. 
        // If "User already registered", try sign in.
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email, // Re-use email if we failed to create but maybe it exists? In real debugging we'd use a known user.
            password
        })

        if (signInError) {
            console.error("Sign In Error:", signInError)
            return;
        }
    }

    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
        console.error("No user logged in.")
        return
    }
    console.log("Logged in as:", user.id)

    console.log("2. Testing Group Creation...")
    const inviteCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    const { data: group, error: groupError } = await supabase
        .from('marker_groups')
        .insert({
            name: "Debug Group",
            owner_id: user.id,
            invite_code: inviteCode
        })
        .select()
        .single()

    if (groupError) {
        console.error("Group Insert Error:", groupError)
    } else {
        console.log("Group Created:", group)
    }

    console.log("3. Testing Personal Marker Creation...")
    const { data: marker, error: markerError } = await supabase
        .from('user_personal_markers')
        .insert({
            user_id: user.id,
            lat: 0.01,
            lng: 0.01,
            title: "Debug Marker",
            visibility: 'private'
        })
        .select()
        .single()

    if (markerError) {
        console.error("Marker Insert Error:", markerError)
    } else {
        console.log("Marker Created:", marker)
    }
}

testInserts()
