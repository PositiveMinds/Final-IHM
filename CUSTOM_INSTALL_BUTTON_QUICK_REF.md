# Custom Install Button - Quick Reference

## What It Does

✅ Shows a beautiful install button  
✅ Hides when app is already installed  
✅ Works offline (via service worker)  
✅ Supports 3 button styles  
✅ Mobile & dark mode optimized  

---

## Files Added

| File | Purpose |
|------|---------|
| `custom-install-button.css` | Styles for button (all 3 variants) |
| `custom-install-button.js` | Logic & event handlers |
| `index.html` (modified) | Links to both files |

---

## Three Button Styles

### 1. **Floating** (Default) - Bottom Right
```javascript
const CURRENT_STYLE = BUTTON_STYLES.FLOATING;
```
Best for: Most websites

### 2. **Banner** - Top of Page
```javascript
const CURRENT_STYLE = BUTTON_STYLES.BANNER;
```
Best for: Prominent placement

### 3. **Modal** - Center Dialog
```javascript
const CURRENT_STYLE = BUTTON_STYLES.MODAL;
```
Best for: Strong call-to-action

---

## How to Switch Styles

1. Open `custom-install-button.js`
2. Line ~20: Change `BUTTON_STYLES.FLOATING` to one of:
   - `BUTTON_STYLES.BANNER`
   - `BUTTON_STYLES.MODAL`
3. Save & refresh

---

## When Button Shows

✅ User visits on Chrome/Edge (Android)  
✅ App meets PWA criteria (it does)  
✅ User hasn't installed app yet  
✅ Browser fires `beforeinstallprompt` event  

## When Button Hides

✖️ App already installed  
✖️ User running as standalone app  
✖️ Installation prompt not available  

---

## JavaScript Control

```javascript
// Show button
window.CustomInstallButton.show();

// Hide button
window.CustomInstallButton.hide();

// Trigger install
window.CustomInstallButton.handleInstall();

// Get button element
window.CustomInstallButton.getButton();

// Check if installed
await window.CustomInstallButton.isInstalled();
```

---

## Customize Colors

In `custom-install-button.css`:

```css
.custom-install-button-content {
  background: linear-gradient(135deg, #15696B 0%, #0f4a4c 100%);
  /* Change #15696B to your brand color */
}
```

---

## Customize Button Text

In `custom-install-button.js`, in `createFloatingButton()`:

```html
<span class="install-button-text">Install App</span>
<!-- Change to: -->
<span class="install-button-text">Get HealthFlow</span>
```

---

## Change Position (Floating)

In `custom-install-button.css`:

```css
.custom-install-button {
  bottom: 30px;  /* Distance from bottom */
  right: 30px;   /* Distance from right */
}
```

---

## Dark Mode

Automatically supported! Adapts to:
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles already included */
}
```

---

## Mobile Responsive

| Device | Display |
|--------|---------|
| Mobile < 576px | Icon only, smaller |
| Tablet 577-991px | Medium size |
| Desktop > 991px | Full size with text |

---

## Testing

### On Android:
1. Visit site in Chrome
2. Button should appear in 2-3 seconds
3. Click "Install App"
4. Choose "Install"
5. App appears on home screen

### On iPhone:
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Name appears (HealthFlow)
4. Tap Add
5. App on home screen

### In Browser DevTools:
```javascript
// Check button exists
document.getElementById('custom-install-button')

// Check prompt available
window.CustomInstallButton.getDeferredPrompt()

// Check app installed
await window.CustomInstallButton.isInstalled()
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Yes |
| Edge | ✅ Yes |
| Firefox | ✅ Yes |
| Safari | ⚠️ Partial |
| Mobile Safari | ⚠️ Add to Home Screen |

---

## File Sizes

| File | Size |
|------|------|
| custom-install-button.css | ~8 KB |
| custom-install-button.js | ~12 KB |
| **Combined (gzipped)** | ~5 KB |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Button never shows | Install not available (try Chrome/Android) |
| Button shows but doesn't work | Service worker might not be registered |
| Already installed but button still shows | Browser doesn't detect installed state |
| Notification doesn't appear | Grant notification permission |

---

## Integration Notes

✅ Already integrated in `index.html`  
✅ Works with existing PWA system  
✅ Service worker already configured  
✅ Manifest already valid  

---

## CSS Classes Reference

```css
/* Main button container */
.custom-install-button

/* Button content/clickable area */
.custom-install-button-content

/* Button icon */
.custom-install-button-icon

/* States */
.custom-install-button.show      /* Visible */
.custom-install-button.hide      /* Hidden (animating) */
.custom-install-button.loading   /* During installation */
.custom-install-button.success   /* After install success */
.custom-install-button.pulse     /* Attention animation */

/* Banner styles */
.install-banner
.install-banner-content
.install-banner-btn

/* Modal styles */
.install-modal-overlay
.install-modal-content
.install-modal-icon
```

---

## Default Setup Summary

```
Style:              FLOATING (bottom-right)
Position:           30px from bottom, 30px from right
Color:              Teal (#15696B)
Animation:          Slide in + fade
Text:               "Install App"
Icon:               Download icon
Mobile text:        Hidden (icon only)
Auto-hide:          When app installed
Dark mode:          Supported
Accessibility:      Full keyboard & screen reader support
```

---

Quick Start: **Just works!** No configuration needed.  
Ready for production: **Yes** ✅
