# Quick Test Checklist (5 Minutes Each)

## LOCAL MACHINE TEST (5 min)

### Setup (1 min)
```
Ctrl+Shift+R              Hard refresh
F12 → Application        Open DevTools
  → Service Workers      Unregister if present
  → Storage              Click Clear Site Data
Close browser completely
Reopen browser
```

### Test (3 min)
```
Visit: http://127.0.0.1:5500 (or your local server)
Wait: 3-5 seconds
Expected: Modal appears in center of screen
          ✅ Title: "Install HealthFlow"
          ✅ 4 feature checkmarks
          ✅ "Install Now" button
Click: "Install Now"
Expected: Browser dialog appears
          "Install HealthFlow?" [Install] [Cancel]
Click: "Install"
Expected: Modal hides
          Console shows: "✅ HealthFlow installed successfully!"
```

### Verify (1 min)
```
Check Console (F12):
  ❌ No red error messages
  ✅ Shows "beforeinstallprompt FIRED"
  ✅ Shows "installed successfully"
```

---

## GITHUB PAGES TEST (5 min)

### Prepare (1 min)
```
On Android Phone:
  Open Chrome browser
  Visit: https://PositiveMinds.github.io/Final-IHM
```

### Test (3 min)
```
Wait: 3-5 seconds (slower than local, HTTPS)
Expected: Modal appears (centered on screen)
          ✅ Icon visible at top
          ✅ Title: "Install HealthFlow"
          ✅ Description text
          ✅ 4 features listed
Click: "Install Now"
Expected: Browser shows: "Install HealthFlow?"
          ✅ [Install] and [Cancel] buttons
Click: "Install"
Expected: Modal disappears
          App installs
```

### Verify (1 min)
```
✅ Look at home screen
  Icon appears for "HealthFlow"
Click: HealthFlow icon
Expected: ✅ Opens in fullscreen (no URL bar)
          ✅ All features visible
Test Offline:
  Toggle Network OFF (DevTools)
  Reload page
  Expected: ✅ Works offline
```

---

## QUICK DIAGNOSTIC (If Issues)

**Open DevTools Console (F12)** and run:

```javascript
// Check everything at once
console.log(
  'Manifest:', fetch('./manifest.json').then(r => console.log(r.ok ? '✅' : '❌')),
  'SW:', navigator.serviceWorker.getRegistrations().then(r => console.log(r.length > 0 ? '✅' : '❌')),
  'Prompt:', window.CustomInstallButton?.getDeferredPrompt() ? '✅' : '⚠️'
);
```

---

## RESULTS TABLE

Fill this out while testing:

### LOCAL
| Item | Status | Notes |
|------|--------|-------|
| Page loads | ☐ Yes ☐ No | |
| Modal appears | ☐ Yes ☐ No | After ___ seconds |
| Install prompt works | ☐ Yes ☐ No | |
| No errors | ☐ Yes ☐ No | |
| **RESULT** | ✅ PASS ☐ FAIL | |

### GITHUB PAGES
| Item | Status | Notes |
|------|--------|-------|
| Page loads | ☐ Yes ☐ No | |
| Modal appears | ☐ Yes ☐ No | After ___ seconds |
| Installation succeeds | ☐ Yes ☐ No | |
| App on home screen | ☐ Yes ☐ No | |
| Works offline | ☐ Yes ☐ No | |
| **RESULT** | ✅ PASS ☐ FAIL | |

---

## MOST COMMON ISSUES

### Modal Never Appears
1. Hard refresh: `Ctrl+Shift+R`
2. Clear cache: DevTools → Storage → Clear
3. Close browser completely
4. Reopen and wait 5 seconds

### Icons Show 404
1. Hard refresh: `Ctrl+Shift+R`
2. Check files exist: `assets/images/healthflow-icon-*.png`
3. Verify manifest paths: `./assets/images/`

### Service Worker Won't Register
1. Unregister old: DevTools → Service Workers → Unregister
2. Clear cache completely
3. Hard refresh: `Ctrl+Shift+R`
4. Wait 5 seconds

### Still Not Working?
1. Run full diagnostic: See `TESTING_GUIDE_BOTH_ENVIRONMENTS.md`
2. Check error messages in console
3. Compare with success screenshots

---

## SUCCESS LOOKS LIKE

### LOCAL (HTTP)
```
✅ Modal appears centered
✅ All features visible
✅ "Install Now" clickable
✅ Browser dialog appears
✅ Installation completes
✅ No red errors
```

### GITHUB (HTTPS)
```
✅ Modal appears centered
✅ All features visible
✅ Installation dialog appears
✅ App installs to home screen
✅ Icon visible on home screen
✅ Opens in fullscreen mode
✅ Works offline
```

---

## NEXT STEPS

✅ **Test Local First** (faster, easier to debug)
✅ **Test GitHub** (real-world scenario)
✅ **Compare Results** (both should work identically)
✅ **Document Issues** (note any errors or timing)

**Time needed:** ~10 minutes total

Good luck! 🚀

