/**
 * Supabase Configuration Template for Patient Portal
 * 
 * INSTRUCTIONS:
 * 1. Copy this file and rename it to: supabase-patient-config.js
 * 2. Replace the placeholder values with your actual Supabase credentials
 * 3. DO NOT commit supabase-patient-config.js to GitHub (it's in .gitignore)
 * 
 * To get your credentials:
 * 1. Go to https://app.supabase.com
 * 2. Select your project
 * 3. Click Settings → API
 * 4. Copy your Project URL and anon/public key
 */

const SUPABASE_CONFIG = {
    URL: 'https://your-project-id.supabase.co',
    KEY: 'your-anon-key-here'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
