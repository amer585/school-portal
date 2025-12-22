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
    // URL and Keys provided by user
    const url = supabaseUrl || 'https://ulkperthcztnnmnfjsbz.supabase.co';
    const key = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa3BlcnRoY3p0bm5tbmZqc2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NTcwNDcsImV4cCI6MjA4MTMzMzA0N30.zl-xXG-pNPmsyPgZ57viXlQMuvS4jOQPUirSMg8GNUs';

    // Fallback to service role if needed (ONLY FOR DEV/LOCAL)
    const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsa3BlcnRoY3p0bm5tbmZqc2J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc1NzA0NywiZXhwIjoyMDgxMzMzMDQ3fQ.o5bX19RlHI9-OH-e0dnOaz-YSMz3wSQo0o0Lez5PsEE';

    supabase = createClient(url, key);
} catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
