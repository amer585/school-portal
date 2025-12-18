import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase credentials. Application will not work correctly until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
}

// Safe initialization to prevent crash if keys are missing
let supabase: SupabaseClient;
try {
    const url = supabaseUrl || 'https://placeholder.supabase.co';
    const key = supabaseKey || 'placeholder-key';
    supabase = createClient(url, key);
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    // Create a dummy client that will fail gracefully
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
