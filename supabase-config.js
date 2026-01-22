// Supabase Configuration
if (typeof SUPABASE_URL === 'undefined') {
  var SUPABASE_URL = 'https://tnhbrekxxlenmziyefwx.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_Xb_u65YWSqSuwmP1lMUbqQ_NohminIi';
}

// Wait for supabase library to load, then initialize client
(function() {
  if (window.supabaseClient) {
    console.log('Supabase client already initialized');
    return;
  }
  
  if (typeof window.supabase !== 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized');
  } else {
    console.error('Supabase library not loaded');
  }
})();
