# Supabase CORS Configuration - Complete Setup Guide

## The Problem
Your dashboard can't connect to Supabase because CORS (Cross-Origin Resource Sharing) is not configured. This is a **required security setup** in Supabase.

## Step-by-Step Setup

### 1. Go to Supabase Dashboard
- Visit: https://app.supabase.com
- Sign in with your credentials
- Select your project: **tnhbrekxxlenmziyefwx**

### 2. Navigate to CORS Settings
```
Left Sidebar → Settings (gear icon)
               → API (in the submenu)
               → Scroll to "CORS"
```

### 3. Configure Your Domain

**For Local Development:**
Add these origins:
```
http://localhost:*
http://127.0.0.1:*
file://
```

**For Production:**
Add your actual domain:
```
https://yourdomain.com
https://www.yourdomain.com
```

**Format Rules:**
- One origin per line
- Include protocol (http:// or https://)
- Use `*` for port wildcard: `http://localhost:*`
- For file system: just `file://`

### 4. Save Configuration
- Click "Save" button
- Wait for confirmation
- Settings should show green checkmark

### 5. Restart Your Browser
- **Important**: Clear browser cache
- Close and reopen the browser tab
- Or press Ctrl+Shift+Delete to clear cache manually

## Verify It's Working

### Method 1: Check Dashboard Console
1. Open your dashboard
2. Press F12 to open DevTools
3. Go to "Console" tab
4. Run this command:

```javascript
supabaseClient
  .from('patients')
  .select('count', { count: 'exact' })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Still failing:', error.message);
    } else {
      console.log('✅ Success! Connection working');
    }
  });
```

**Good Result:**
```
✅ Success! Connection working
```

**Bad Result (still CORS error):**
```
❌ Still failing: CORS policy...
```

### Method 2: Check Network Tab
1. Open DevTools → Network tab
2. Reload the page
3. Look for requests to `tnhbrekxxlenmziyefwx.supabase.co`
4. Click on one to view details
5. Check Response Headers for CORS info

**Look for:**
```
Access-Control-Allow-Origin: [your domain]
Access-Control-Allow-Credentials: true
```

## Common Issues & Fixes

### Issue 1: Still Getting CORS Errors After Setup
**Solution:**
1. Wait 5-10 minutes for Supabase to propagate changes
2. Clear browser cache: Ctrl+Shift+Delete
3. Hard refresh: Ctrl+F5
4. Try incognito/private window

### Issue 2: Wrong Domain Format
**Wrong:**
```
localhost:8000
yourdomain.com
:3000
```

**Right:**
```
http://localhost:*
https://yourdomain.com
http://localhost:3000
```

### Issue 3: Project Status
Make sure your Supabase project:
- ✅ Is active (not paused/deleted)
- ✅ Has valid billing (if required)
- ✅ Shows "Active" status in dashboard

**Check Project Status:**
1. Go to Supabase Dashboard
2. Look at project card
3. Should show "Active" badge
4. If "Paused", click to resume

### Issue 4: API Key Validity
Verify your keys in `supabase-config.js`:

1. Go to Supabase → Settings → API
2. Copy the "Publishable Key" (anon role)
3. Check it matches your `SUPABASE_ANON_KEY`

**Current Key:**
```
sb_publishable_Xb_u65YWSqSuwmP1lMUbqQ_NohminIi
```

If it doesn't match, update `supabase-config.js` with the correct key.

## Testing Real Data

Once CORS is configured:

### 1. Reload Dashboard
- Your page should load without CORS errors
- Patient data should appear from Supabase
- No warning banners

### 2. Check Browser Console
- Press F12
- Should see no CORS errors
- Only normal console messages

### 3. Try Patient Operations
- Search patients ✅
- Filter by status ✅
- Edit patient ✅
- Delete patient ✅
- All should work with real data

## Useful Links

- **Supabase Docs**: https://supabase.com/docs/guides/api/cors
- **Your Project**: https://app.supabase.com/project/tnhbrekxxlenmziyefwx
- **API Settings**: https://app.supabase.com/project/tnhbrekxxlenmziyefwx/settings/api

## Quick Reference: Where to Find CORS Settings

```
Supabase Dashboard
    ↓
Settings (gear icon, bottom left)
    ↓
API (in the submenu)
    ↓
Scroll down to "CORS"
    ↓
Add your domain(s)
    ↓
Click Save
```

## After CORS is Working

Your dashboard will automatically:
- Load real patients from database
- Show real appointment data
- Save actual changes to database
- No more demo/fake data

## If You Still Have Issues

1. **Check Supabase project is active**
   - Go to https://app.supabase.com
   - Look for your project status

2. **Verify CORS settings saved**
   - Go back to Settings → API → CORS
   - Your domains should be listed

3. **Clear all caches**
   - Browser cache: Ctrl+Shift+Delete
   - Hard refresh: Ctrl+F5
   - Try incognito window

4. **Check domain format matches**
   - localhost and 127.0.0.1 need port wildcard: `*`
   - Production domains need full protocol: `https://`

5. **Wait for propagation**
   - Changes can take 5-10 minutes to fully apply
   - In rare cases up to 1 hour

## Support

If CORS is configured but still failing:
1. Take a screenshot of your CORS settings
2. Check browser console for exact error message
3. Verify the domain you added matches your current location
4. Ensure Supabase project hasn't been paused

Once CORS is properly configured, your dashboard will work perfectly with real data.
