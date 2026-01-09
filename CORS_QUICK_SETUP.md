# CORS Configuration - 5 Minute Setup

## Quick Version (Copy-Paste Ready)

### 1. Log In
Go to: https://app.supabase.com
- Sign in with your email/password
- Select project: **tnhbrekxxlenmziyefwx**

### 2. Go to CORS Settings
```
Bottom Left Sidebar
    ↓ Click Settings (gear icon)
    ↓ Click "API" in submenu
    ↓ Scroll down to "CORS"
```

### 3. Add Your Domain

**Copy ONE of these based on where you're running:**

**For localhost (local development):**
```
http://localhost:*
```

**For 127.0.0.1 (local development):**
```
http://127.0.0.1:*
```

**For file:// (opening HTML file directly):**
```
file://
```

**For production (replace example.com):**
```
https://yourdomain.com
```

### 4. Paste & Save

In Supabase:
1. Click in the CORS input field
2. Paste one of the above domains
3. Press Enter or Tab (adds it to list)
4. Click **Save** button
5. Wait for green checkmark

### 5. Verify It Works

**In your browser:**
1. Open your dashboard
2. Press F12 (open DevTools)
3. Go to Console tab
4. Paste this:

```javascript
supabaseClient.from('patients').select('count', { count: 'exact' }).then(({data,error}) => console.log(error ? '❌ Still broken: ' + error.message : '✅ SUCCESS!'))
```

5. Press Enter
6. Look for **✅ SUCCESS!** message

---

## Visual Step-by-Step

### Step 1: Open Supabase
```
Browser Address Bar
    ↓ Type: https://app.supabase.com
    ↓ Press Enter
    ↓ Sign in if needed
```

### Step 2: Select Your Project
```
You should see a list of projects
    ↓ Look for: tnhbrekxxlenmziyefwx
    ↓ Click on it
```

### Step 3: Find API Settings
```
Look at BOTTOM LEFT of page

You'll see:
    Project Settings (gear icon) ← CLICK HERE
        ├─ General
        ├─ API ← CLICK HERE
        ├─ Database
        └─ ...
```

### Step 4: Find CORS Section
```
You're now in API settings

Scroll DOWN until you see:

API Settings
├─ Project URL
├─ Anon public key
├─ Service role key
├─ CORS ← YOU ARE HERE
│   └─ [Text input box]
```

### Step 5: Add Your Domain

**Example for localhost:**

```
Before:
┌─────────────────────────────┐
│ CORS                        │
│ ┌───────────────────────────┤
│ │ http://localhost:*        │  ← Click here
│ └───────────────────────────┤
└─────────────────────────────┘
```

1. Click in the input box
2. Type: `http://localhost:*`
3. Press Enter or Tab
4. See it appear in the list below

### Step 6: Save

Look for a **Save** button near the CORS section
- Click it
- Wait for confirmation (usually a checkmark)
- Page may refresh briefly

---

## Complete Domain List

Choose what applies to your setup:

| Where You Access It | Domain to Add | Use Case |
|---|---|---|
| `http://localhost:3000` | `http://localhost:*` | Local dev (any port) |
| `http://127.0.0.1:8000` | `http://127.0.0.1:*` | Local IP (any port) |
| `file:///C:/path/file.html` | `file://` | Opening HTML directly |
| `https://myapp.com` | `https://myapp.com` | Production domain |
| `https://www.myapp.com` | `https://www.myapp.com` | Production with www |

**If you have multiple:**
Add each one separately (one per line in the input field)

---

## After Saving - Test It

### Browser Console Test

1. **Open DevTools:**
   - Press `F12` on your keyboard
   - Or right-click → "Inspect"

2. **Go to Console tab**

3. **Paste this test:**

```javascript
supabaseClient.from('patients').select('count', { count: 'exact' }).then(({ data, error }) => {
  if (error) {
    console.error('❌ FAILED:', error.message);
  } else {
    console.log('✅ SUCCESS! Your CORS is configured correctly');
  }
});
```

4. **Look for:**
   - ✅ **SUCCESS!** = CORS is working
   - ❌ **FAILED** = Still needs fixing

### If Still Getting Error:

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Click "Clear now"

2. **Hard refresh page:**
   - Press `Ctrl + F5`

3. **Try again**

4. **If still failing:**
   - Wait 5 minutes (changes take time to propagate)
   - Check you used correct domain
   - Verify domain in CORS list matches your current location

---

## Troubleshooting

### ❌ "CORS request did not succeed"
**Fix:**
1. Go back to Supabase CORS settings
2. Check your domain is listed
3. Make sure it matches where you're accessing from
4. Clear cache and hard refresh

### ❌ "NetworkError"
**Fix:**
1. Check your internet connection
2. Verify Supabase project is "Active" (not paused)
3. Check your API key is valid

### ❌ "Invalid or expired API key"
**Fix:**
1. Go to Settings → API
2. Copy the "Publishable Key" (anon role)
3. Check it matches in `supabase-config.js`
4. If different, update the key

### ✅ "No domains have been configured"
**This means:**
- You haven't added any domains yet
- Follow steps above to add one

### ✅ Test passes but dashboard still shows error
**Fix:**
1. Refresh the dashboard page (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close and reopen browser tab

---

## What Each Domain Does

### `http://localhost:*`
- Allows ANY port on localhost
- Examples:
  - `http://localhost:3000` ✅
  - `http://localhost:8000` ✅
  - `http://localhost:5000` ✅
- Use for: Local development with multiple ports

### `http://127.0.0.1:*`
- Same as localhost but using IP address
- Use for: When localhost doesn't work

### `file://`
- Allows file:// protocol
- Examples:
  - `file:///C:/path/to/dashboard.html` ✅
  - `file:///home/user/dashboard.html` ✅
- Use for: Opening HTML directly from filesystem

### `https://yourdomain.com`
- Only allows that exact domain
- Examples:
  - `https://myapp.com` ✅
  - `https://myapp.com/` (with trailing slash) ✅
  - `http://myapp.com` ❌ (wrong protocol)
  - `https://www.myapp.com` ❌ (different subdomain)
- Use for: Production deployment

---

## After CORS Works

Your dashboard will automatically:
- Load real patient data from database
- Display actual statistics
- Save changes to Supabase
- All features work properly

**No code changes needed** - just needs CORS configured!

---

## Still Having Issues?

### Check These:

1. **Is your Supabase project active?**
   - Go to https://app.supabase.com
   - Look for your project
   - Should show "Active" status
   - If "Paused", click to resume

2. **Is the domain correct?**
   - Check where you're accessing your dashboard
   - If it's `http://localhost:3000`, add `http://localhost:*` to CORS
   - Make sure protocol and port match

3. **Did you click Save?**
   - Look for Save button near CORS section
   - Click it
   - Wait for confirmation

4. **Try a different domain:**
   - If `localhost` doesn't work, try `127.0.0.1:*`
   - If `file://` doesn't work, try hosting locally

5. **Check browser console:**
   - Press F12
   - Look for red error messages
   - Search for "CORS" in the errors
   - The error message often tells you what domain it expects

---

## Quick Checklist

- [ ] Logged into https://app.supabase.com
- [ ] Selected project: tnhbrekxxlenmziyefwx
- [ ] Navigated to Settings → API
- [ ] Found CORS section
- [ ] Added domain (http://localhost:* or file://)
- [ ] Clicked Save button
- [ ] Waited for confirmation
- [ ] Ran console test and saw ✅ SUCCESS
- [ ] Refreshed dashboard and saw real data

If all checked, you're done! Your dashboard should work now.
