# CORS Setup - Visual Step-by-Step

## The 5 Simple Steps

### STEP 1: Go to Supabase
```
Open your browser and go to:
https://app.supabase.com
```

### STEP 2: Open Your Project
```
You see a list of projects. Find and click:
"tnhbrekxxlenmziyefwx"
```

### STEP 3: Find Settings

Look at the bottom left of your screen:

```
┌─────────────────────┐
│ Project Settings    │ ← CLICK THIS
│ (It's a gear icon)  │
└─────────────────────┘
```

A menu appears. Click **API**:

```
├─ General
├─ API ← CLICK HERE
├─ Database
├─ Auth
└─ ...
```

### STEP 4: Find CORS

Scroll down the page. You'll see:

```
┌──────────────────────────────────────────┐
│ API Settings                             │
├──────────────────────────────────────────┤
│                                          │
│ Project URL: https://tnhbrek...          │
│                                          │
│ Anon public key: sb_publishable_...      │
│                                          │
│ Service role key: [hidden]               │
│                                          │
│ CORS                                     │
│ ┌──────────────────────────────────────┐ │
│ │ [Click here to add domain]           │ │
│ │                                      │ │
│ │ You haven't configured any origins   │ │
│ └──────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

### STEP 5: Add Your Domain

Click in the text box and type ONE of these:

#### If you're using localhost:
```
http://localhost:*
```

#### If you're opening the file directly:
```
file://
```

#### If you're using production domain:
```
https://yourdomain.com
```

After typing, press **Enter**. You should see it appear in a list below.

Then click **Save**.

---

## That's It! You're Done!

Now reload your dashboard and your data will load.

---

## Verify It Works

To make sure CORS is working:

1. **Open your dashboard**
2. **Press `F12`** (this opens developer tools)
3. **Click "Console" tab** at the top
4. **Copy and paste this:**

```javascript
supabaseClient.from('patients').select('count', { count: 'exact' }).then(({ data, error }) => console.log(error ? '❌ CORS Still broken' : '✅ CORS Works!'))
```

5. **Press Enter**

You should see: **✅ CORS Works!**

If you see an error, go back and check your domain is correct.

---

## Common Domains

| Where You're Using It | What to Add |
|---|---|
| Browser at `http://localhost:3000` | `http://localhost:*` |
| Browser at `http://localhost:8000` | `http://localhost:*` |
| Browser at `http://127.0.0.1:5000` | `http://127.0.0.1:*` |
| Opening HTML file directly | `file://` |
| Website at `https://example.com` | `https://example.com` |

---

## If It's Still Not Working

**Try these fixes:**

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Click "Clear now"
   - Refresh page

2. **Hard refresh:**
   - Press `Ctrl + F5` (or `Cmd + Shift + R` on Mac)

3. **Wait a few minutes:**
   - Supabase takes time to apply changes
   - Wait 5 minutes and try again

4. **Check the domain matches:**
   - What's in your browser address bar?
   - Does it match what you added to CORS?
   - Example: If using `localhost:3000`, you added `http://localhost:*`?

5. **Verify project is active:**
   - Go to https://app.supabase.com
   - Does your project show "Active"?
   - If paused, click to resume it

---

## Visual: What You Should See

### Before (Wrong):
```
Browser Console:
❌ CORS request did not succeed
❌ NetworkError when attempting to fetch resource
```

### After (Correct):
```
Browser Console:
✅ CORS Works!

Dashboard:
✅ Real patient data appears
✅ Statistics load correctly
✅ All features work
```

---

## Questions?

- **Where do I find the CORS section?** → Settings → API → Scroll down
- **What domain do I add?** → Depends where you're accessing it (see table above)
- **How long does it take?** → Usually instant, sometimes 5 minutes
- **Do I need to restart anything?** → Just refresh your browser

---

## The Complete Picture

```
1. You open dashboard.html
            ↓
2. Dashboard tries to load data from Supabase
            ↓
3. Your browser blocks it (CORS security)
            ↓
4. You add your domain to Supabase CORS list
            ↓
5. Browser sees domain is allowed
            ↓
6. Data loads successfully ✅
            ↓
7. Dashboard shows real patient information
```

Without CORS configured: steps 5-7 fail ❌
With CORS configured: steps 5-7 work ✅

---

That's all you need to know to set up CORS!
