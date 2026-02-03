# PWA Installation Diagnostic Test

## Problem: App Not Installing on Device

This guide will help diagnose why the install prompt isn't appearing or working.

---

## Step 1: Check Service Worker Registration

Open browser console (F12) and paste:

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('=== SERVICE WORKER STATUS ===');
  if (regs.length === 0) {
    console.error('❌ NO SERVICE WORKERS REGISTERED!');
    console.log('This is the problem. Service worker must be registered.');
  } else {
    regs.forEach(reg => {
      console.log('✅ Service Worker found:');
      console.log('  Scope:', reg.scope);
      console.log('  Active:', reg.active ? 'YES' : 'NO');
      console.log('  Installing:', reg.installing ? 'YES' : 'NO');
      console.log('  Waiting:', reg.waiting ? 'YES' : 'NO');
    });
  }
});
```

**Expected output:**
```
✅ Service Worker found:
  Scope: https://username.github.io/Final-IHM/
  Active: YES
```

---

## Step 2: Check Manifest Validity

Paste in console:

```javascript
fetch('/Final-IHM/manifest.json')
  .then(r => {
    console.log('=== MANIFEST STATUS ===');
    console.log('Status:', r.status, r.ok ? '✅' : '❌');
    return r.json();
  })
  .then(manifest => {
    console.log('Name:', manifest.name);
    console.log('Short name:', manifest.short_name);
    console.log('Start URL:', manifest.start_url);
    console.log('Scope:', manifest.scope);
    console.log('Display:', manifest.display);
    console.log('Icons count:', manifest.icons.length);
    
    // Check required fields
    const required = ['name', 'short_name', 'start_url', 'scope', 'display', 'icons'];
    const missing = required.filter(f => !manifest[f]);
    if (missing.length > 0) {
      console.error('❌ Missing required fields:', missing);
    } else {
      console.log('✅ All required fields present');
    }
  })
  .catch(err => console.error('❌ Could not fetch manifest:', err));
```

**Expected output:**
```
✅ All required fields present
Icons count: 8
```

---

## Step 3: Check Manifest Link in HTML

Paste in console:

```javascript
const link = document.querySelector('link[rel="manifest"]');
if (link) {
  console.log('✅ Manifest link found');
  console.log('href:', link.href);
} else {
  console.error('❌ NO MANIFEST LINK IN HTML!');
  console.log('Add this to <head>:');
  console.log('<link rel="manifest" href="manifest.json">');
}
```

---

## Step 4: Check beforeinstallprompt Event

Paste in console:

```javascript
let promptFired = false;

window.addEventListener('beforeinstallprompt', (e) => {
  promptFired = true;
  console.log('✅ beforeinstallprompt event FIRED');
  console.log('Installation is available for this browser!');
});

// Wait 2 seconds to see if event fires
setTimeout(() => {
  if (!promptFired) {
    console.warn('⚠️ beforeinstallprompt event did NOT fire');
    console.log('This could mean:');
    console.log('1. Browser does not support PWA installation');
    console.log('2. Service worker not registered');
    console.log('3. Manifest invalid');
    console.log('4. Already installed');
  }
}, 2000);
```

Then reload the page and watch for the message.

---

## Step 5: Check HTTPS

Paste in console:

```javascript
console.log('=== HTTPS STATUS ===');
console.log('Protocol:', window.location.protocol);
if (window.location.protocol === 'https:') {
  console.log('✅ HTTPS is active (required for PWA)');
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('✅ Localhost (HTTP OK for dev)');
} else {
  console.error('❌ NOT HTTPS! PWA requires HTTPS!');
}
```

---

## Step 6: Check Icons Load

Paste in console:

```javascript
const basePath = window.APP_BASE_PATH || '/Final-IHM/';
const icons = [
  '192x192.png',
  '512x512.png'
];

console.log('=== CHECKING ICONS ===');
icons.forEach(icon => {
  const img = new Image();
  const url = basePath + 'assets/images/healthflow-icon-' + icon;
  img.onload = () => console.log('✅', icon, 'loads');
  img.onerror = () => console.error('❌', icon, 'NOT FOUND at', url);
  img.src = url;
});
```

---

## Step 7: Run Lighthouse Audit

1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "PWA" category
4. Click "Analyze page load"
5. Look for errors

---

## Most Common Issues & Fixes

### ❌ Service Worker Not Registered

**Problem:** Service worker not showing in DevTools → Application → Service Workers

**Fix:** Ensure this is in your HTML:
```html
<script src="pwa-install.js" defer></script>
```

Or manually register:
```javascript
navigator.serviceWorker.register('/Final-IHM/service-worker.js');
```

---

### ❌ Manifest Link Missing

**Problem:** Manifest showing as 404

**Fix:** Add to `<head>`:
```html
<link rel="manifest" href="manifest.json">
```

---

### ❌ Icons Not Found

**Problem:** Manifest loads but icons not found

**Check:** Icons exist at these paths:
```
assets/images/healthflow-icon-72x72.png
assets/images/healthflow-icon-192x192.png
assets/images/healthflow-icon-512x512.png
(etc.)
```

---

### ❌ beforeinstallprompt Never Fires

**Possible causes:**
1. Service worker not registered ← Most common
2. Manifest invalid
3. Browser doesn't support (iOS Safari)
4. App already installed
5. User dismissed permanently

**Fix:** Check #1 and #2 above

---

### ❌ Installation Dialog Never Appears

**Problem:** Modal shows, but nothing happens when clicking "Install Now"

**Cause:** The `deferredPrompt` is null

**Check in console:**
```javascript
console.log(window.CustomInstallButton.getDeferredPrompt());
// Should return object, not null
```

---

## Quick Test Script (Copy-Paste All)

```javascript
console.clear();
console.log('=== PWA INSTALLATION DIAGNOSTIC ===\n');

// 1. Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('1. SERVICE WORKER:', regs.length > 0 ? '✅' : '❌');
  if (regs.length > 0) {
    console.log('   Scope:', regs[0].scope);
  }
});

// 2. Manifest
fetch('/Final-IHM/manifest.json').then(r => {
  console.log('2. MANIFEST:', r.ok ? '✅' : '❌');
  return r.json();
}).then(m => {
  console.log('   Name:', m.name);
  console.log('   Icons:', m.icons.length);
}).catch(() => console.log('2. MANIFEST: ❌ Could not load'));

// 3. HTTPS
console.log('3. HTTPS:', window.location.protocol === 'https:' ? '✅' : '⚠️');

// 4. Manifest Link
const hasManifest = document.querySelector('link[rel="manifest"]');
console.log('4. MANIFEST LINK:', hasManifest ? '✅' : '❌');

// 5. Install Ready
setTimeout(() => {
  console.log('5. INSTALL AVAILABLE:', window.CustomInstallButton.getDeferredPrompt() ? '✅' : '❌');
  console.log('\n=== RESULT ===');
  const allOK = regs.length > 0 && hasManifest && window.CustomInstallButton.getDeferredPrompt();
  console.log(allOK ? '✅ Installation should work!' : '❌ Missing requirements');
}, 1000);
```

---

## Device-Specific Issues

### Android Chrome
✅ Should work if all checks pass

### Android Firefox
✅ Should work (might be slower)

### iOS Safari
⚠️ Limited support - no automatic prompt
→ User must manually: Share → "Add to Home Screen"

### Windows Edge
✅ Should work if all checks pass

---

## Still Not Working?

### Check Network Tab
1. Open DevTools
2. Go to Network tab
3. Refresh page
4. Check these load with status 200:
   - index.html ✅
   - manifest.json ✅
   - service-worker.js ✅
   - Custom icons (192x192, 512x512) ✅

### Check Console
1. Open DevTools
2. Go to Console tab
3. Look for errors (red text)
4. Look for warnings (yellow text)

### Check Application Tab
1. Open DevTools
2. Go to Application tab
3. Check Service Workers: Should show registered worker
4. Check Manifest: Should show valid manifest
5. Check Cache Storage: Should show cached assets

---

## Next Steps

1. **Run diagnostic** - Use the quick test script above
2. **Check output** - See which checks fail
3. **Fix issues** - Follow fixes for failed checks
4. **Test again** - Run diagnostic again
5. **Reload page** - Hard refresh (Ctrl+Shift+R)
6. **Wait** - Service worker takes 2-3 seconds
7. **Check modal** - Should appear or error should show

---

## Still Stuck?

Check these in order:

1. **Service worker registered?** → Check Application tab in DevTools
2. **Manifest loads?** → Check Network tab
3. **Icons exist?** → Check files in assets/images/
4. **HTTPS active?** → Check protocol in console
5. **Modal appears?** → Should see modal with features list
6. **Modal interactive?** → Can click "Install Now" button
7. **Browser supports?** → Try Chrome on Android

---

**Remember:** Installation requires HTTPS + Service Worker + Valid Manifest + Browser Support

If all 4 are met, it WILL work. If any is missing, it WON'T work.
