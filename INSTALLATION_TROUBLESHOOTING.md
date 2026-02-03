# Installation Troubleshooting Guide

## The Problem

Modal appears when you click the button, but **clicking "Install Now" does nothing**.

---

## Why This Happens

The `beforeinstallprompt` event (which triggers the browser's native install dialog) hasn't fired yet.

**The browser only fires this when:**
1. Service worker is registered ✅
2. Manifest is valid ✅
3. Site is HTTPS ✅
4. User hasn't dismissed it before

---

## Quick Fix (5 minutes)

### 1. Hard Refresh Your Browser
**On Computer:**
- Windows/Linux: Press `Ctrl + Shift + R`
- Mac: Press `Cmd + Shift + R`

**On Android:**
- Close browser completely
- Re-open browser
- Visit site again

### 2. Clear Site Data
1. Open DevTools (F12)
2. Go to Storage tab
3. Click "Clear Site Data"
4. Reload page

### 3. Wait 3 Seconds
The service worker needs time to register. Wait for the modal to fully appear.

---

## Diagnostic Test (10 minutes)

### Use the Interactive Tester

Open this file in your browser:
```
TEST_INSTALLATION.html
```

It will:
- ✅ Check Service Worker
- ✅ Check Manifest
- ✅ Check Icons
- ✅ Check HTTPS
- ✅ Check Browser Support
- ✅ Check Install Event

Then it shows exactly what's wrong.

---

## Manual Diagnostic (Console)

1. Open site on your device
2. Press F12 (open DevTools)
3. Go to "Console" tab
4. Copy-paste this entire block:

```javascript
console.log('=== PWA DIAGNOSTIC ===');

// Check Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length > 0 ? '✅' : '❌');
  if (regs.length > 0) {
    console.log('  Scope:', regs[0].scope);
    console.log('  Active:', regs[0].active ? 'Yes' : 'No');
  }
});

// Check Manifest
const basePath = window.APP_BASE_PATH || '/Final-IHM/';
fetch(basePath + 'manifest.json').then(r => {
  console.log('Manifest:', r.ok ? '✅' : '❌', '(' + r.status + ')');
  return r.json();
}).then(m => {
  console.log('  Name:', m.name);
  console.log('  Icons:', m.icons.length);
}).catch(() => {
  console.log('Manifest: ❌ Failed to load');
});

// Check HTTPS
console.log('HTTPS:', window.location.protocol === 'https:' ? '✅' : (window.location.hostname === 'localhost' ? '✅ Localhost' : '❌'));

// Check Manifest Link
console.log('Manifest Link in HTML:', document.querySelector('link[rel="manifest"]') ? '✅' : '❌');

// Check Custom Button
console.log('Custom Button:', window.CustomInstallButton ? '✅' : '❌');
if (window.CustomInstallButton) {
  console.log('  Prompt:', window.CustomInstallButton.getDeferredPrompt() ? '✅' : '❌');
}

// Listen for install event
window.addEventListener('beforeinstallprompt', () => {
  console.log('✅ beforeinstallprompt event FIRED!');
});

console.log('=== END DIAGNOSTIC ===');
```

Look at the output:
- All ✅ = Everything should work
- Any ❌ = Check that issue below

---

## Issues & Fixes

### Issue 1: Service Worker ❌

**What it means:** Service worker is not registered

**How to fix:**
1. Make sure `pwa-install.js` is in your HTML:
```html
<script src="pwa-install.js" defer></script>
```
2. Or manually register in console:
```javascript
navigator.serviceWorker.register('/Final-IHM/service-worker.js');
```

---

### Issue 2: Manifest ❌

**What it means:** Manifest file not found or invalid

**How to fix:**
1. Check `manifest.json` exists in root folder
2. Make sure this is in your HTML `<head>`:
```html
<link rel="manifest" href="manifest.json">
```
3. Verify manifest JSON is valid (no syntax errors)

---

### Issue 3: HTTPS ❌

**What it means:** Site is not HTTPS (required for PWA)

**How to fix:**
- If on GitHub Pages: It's already HTTPS, use `https://...`
- If on local computer: Use `http://localhost`
- If on live server: Get SSL certificate

---

### Issue 4: Manifest Link ❌

**What it means:** Manifest not linked in HTML head

**How to fix:**
Add this to `index.html` in the `<head>` section:
```html
<link rel="manifest" href="manifest.json">
```

---

### Issue 5: Custom Button ❌

**What it means:** Script didn't load properly

**How to fix:**
1. Check `custom-install-button.js` exists
2. Make sure it's loaded in HTML:
```html
<script src="custom-install-button.js" defer></script>
```
3. Check for JavaScript errors in console (red text)

---

### Issue 6: Prompt ❌

**What it means:** Browser hasn't sent the install event yet

**Why:**
- Service worker still initializing
- User already dismissed installation
- Browser doesn't support (iOS Safari, older browsers)

**How to fix:**
1. Hard refresh page: `Ctrl+Shift+R`
2. Wait 3-5 seconds
3. Watch DevTools console for "beforeinstallprompt event FIRED!"

---

## Step-by-Step Troubleshooting

### Step 1: Use TEST_INSTALLATION.html
Open `TEST_INSTALLATION.html` and click "Run All Tests"
- See which checks fail
- Follow the specific fix for that failure

### Step 2: Check DevTools
1. Press F12
2. Go to Application tab
3. Check Service Workers: Should show registered
4. Check Manifest: Should show valid manifest
5. Check Storage > Cache: Should show cached files

### Step 3: Hard Reset
1. DevTools > Storage > Clear Site Data
2. Close browser completely
3. Restart browser
4. Visit site fresh

### Step 4: Test Again
1. Open site
2. Wait 3 seconds
3. Modal should appear
4. Click "Install Now"
5. Browser dialog should appear

### Step 5: Still Not Working?
Run the diagnostic script and share the output showing which checks failed.

---

## What Success Looks Like

### ✅ Service Worker: YES
Shows: `Service Worker found: true` in console

### ✅ Manifest: VALID
Shows: `Manifest Status: 200` and lists name, icons, etc.

### ✅ HTTPS: ENABLED
Shows: `Protocol: https:` or `Localhost OK`

### ✅ beforeinstallprompt: FIRED
Shows: `beforeinstallprompt event FIRED!` after 2-3 seconds

### ✅ Installation: WORKS
1. Modal appears
2. Click "Install Now"
3. Browser dialog appears
4. Click "Install"
5. App installs to home screen

---

## Testing on Different Devices

### Android Chrome (Best Support)
- ✅ Should work if all checks pass
- ✅ Automatic install prompt
- ✅ Full offline support

### Android Firefox
- ✅ Should work
- ⚠️ Might be slower
- ✅ Full offline support

### iOS Safari
- ⚠️ No automatic prompt
- ⚠️ Must manually: Share → "Add to Home Screen"
- ✅ Works as web app

### Windows Edge
- ✅ Should work
- ✅ Install button in address bar
- ✅ Full offline support

### Android Samsung Internet
- ✅ Should work
- ✅ Similar to Chrome
- ✅ Full offline support

---

## Common Mistakes

### ❌ Not waiting for event
The `beforeinstallprompt` event takes 2-3 seconds to fire.
- **Fix:** Wait after page loads before testing

### ❌ Testing on iOS Safari
iOS has different install flow (manual).
- **Fix:** Test on Android Chrome first, iOS later

### ❌ Clearing browser cache immediately
Cache might be needed by service worker.
- **Fix:** Clear once, then let it rebuild

### ❌ Not using HTTPS
PWA requires HTTPS for security.
- **Fix:** Use GitHub Pages (auto HTTPS) or get SSL cert

### ❌ Modifying manifest without reloading
Manifest changes need page reload.
- **Fix:** Change file, then reload page

---

## Performance Check

Open DevTools Console and paste:

```javascript
// Check how long service worker takes to activate
navigator.serviceWorker.ready.then(() => {
  console.log('✅ Service Worker is ready');
});

// Check manifest load time
console.time('Manifest Load');
fetch('/Final-IHM/manifest.json').then(r => {
  console.timeEnd('Manifest Load');
  console.log('Manifest status:', r.status);
});
```

Should show:
- Service worker ready: < 3 seconds
- Manifest load: < 500ms

---

## Browser DevTools Tips

### Application Tab
```
Service Workers → Should show registered worker
Manifest → Should show valid manifest with icons
Storage → Should show cache stores
Cache Storage → Should show healthflow-v1, etc.
```

### Network Tab
1. Reload page
2. Filter by "manifest" or "service-worker"
3. Should show HTTP 200 (success)
4. If 404: File not found

### Console Tab
1. Look for red text (errors)
2. Look for yellow text (warnings)
3. Run diagnostic script
4. Watch for install event

---

## Final Checklist

Before declaring "not working", verify:

- [ ] Service worker registered (DevTools > Application)
- [ ] Manifest valid (DevTools > Manifest tab)
- [ ] HTTPS enabled (look at URL)
- [ ] Manifest linked in HTML (`<head>`)
- [ ] Icons exist (`assets/images/healthflow-icon-*.png`)
- [ ] Page hard refreshed (`Ctrl+Shift+R`)
- [ ] Site data cleared (DevTools > Storage > Clear)
- [ ] Waited 3+ seconds after page load
- [ ] Browser supports PWA (Chrome/Edge/Firefox)
- [ ] Not on iOS Safari (different flow)

---

## Still Need Help?

### Option 1: Run TEST_INSTALLATION.html
Most automatic. Shows exactly what's wrong.

### Option 2: Use Diagnostic Script
Copy-paste into console, see output.

### Option 3: Check Each File
- `manifest.json` - Valid and accessible?
- `service-worker.js` - Exists and loads?
- `custom-install-button.js` - Loaded in HTML?
- `custom-install-button.css` - Loaded in HTML?
- Icons - All exist with correct names?

---

## Success!

Once the modal appears and you can click "Install Now" successfully:

1. **Confirm Installation:** App appears on home screen
2. **Open App:** Click icon, should open in fullscreen
3. **Close App:** Return to browser
4. **Reload Site:** Modal no longer shows (app detected as installed)

If you see all these steps work, **your PWA installation is successful!** ✅

---

**Last Updated:** 2026-02-03  
**Status:** Troubleshooting Guide Complete
