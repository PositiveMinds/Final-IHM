# CORS Configuration Fix for Supabase

## The Problem
You're getting "Cross-Origin Request Blocked" errors because Supabase is blocking requests from your current domain. This is a security feature, but it needs to be configured.

## Solution: Configure CORS in Supabase Dashboard

### Steps:

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Log in with your credentials
   - Select your project (tnhbrekxxlenmziyefwx)

2. **Navigate to Project Settings**
   - Click on "Settings" (gear icon) in the bottom left
   - Select "API" from the sidebar

3. **Configure CORS**
   - Look for the "CORS" section
   - Add your domain(s) to the allowed origins:
     - For local development: `http://localhost:*` or `http://127.0.0.1:*`
     - For production: `https://yourdomain.com`
     - For this project: `file://` (if running from file system)

4. **Save and Test**
   - Click Save
   - Refresh your dashboard page
   - Errors should be gone

## Alternative: Use Edge Function (Advanced)

If you want to avoid CORS issues entirely, set up a Supabase Edge Function as a proxy:

1. Create an edge function that calls your database
2. Call the edge function from your frontend instead of directly calling Supabase REST API
3. This keeps all API calls server-to-server (no CORS issues)

## Temporary Workaround

The dashboard will still function without data loading. The sidebar toggle and UI should work fine. Data will load once CORS is properly configured.

## Common Causes of CORS Failures

- ❌ Incorrect Supabase URL or API key
- ❌ CORS not configured in Supabase dashboard
- ❌ Invalid/revoked API key
- ❌ Project paused or deleted
- ✓ Network connectivity issues (temporary)

## Verify Your Setup

Run this in the browser console to test:

```javascript
// Check if Supabase client is initialized
console.log('Supabase URL:', SUPABASE_URL);
console.log('Client ready:', typeof supabaseClient !== 'undefined');

// Try a simple test query
supabaseClient
  .from('patients')
  .select('count', { count: 'exact' })
  .then(({ data, error }) => {
    if (error) console.error('Error:', error);
    else console.log('Success! Patient count:', data);
  });
```

If you see "Success", your Supabase connection is working!
