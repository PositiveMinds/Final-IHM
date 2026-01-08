// Supabase Configuration
const SUPABASE_URL = 'https://tnhbrekxxlenmziyefwx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xb_u65YWSqSuwmP1lMUbqQ_NohminIi';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized');
