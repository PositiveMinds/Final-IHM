# Debug Sidebar - Step by Step

## Quick Test (Do This First)

1. **Open test-sidebar.html** (the simplified version)
   - Navigate to: `e:/IHM/test-sidebar.html`
   - This should work perfectly - it has no dependencies

2. **Test on mobile view:**
   - Press `F12` to open DevTools
   - Click Device Toolbar icon (Ctrl+Shift+M)
   - Set width to 375px (mobile size)
   - Click the hamburger menu (☰)
   - Expected: Sidebar slides in from left

3. **Check console:**
   - If sidebar works, the issue is with dashboard.html, not the core functionality

## Debug dashboard.html (If test-sidebar works but dashboard doesn't)

### Step 1: Check Console Logs
1. Open dashboard.html
2. Press F12 → Console tab
3. Look for these messages:
   ```
   Dashboard.js functions loaded:
   toggleSidebar: function
   showSection: function
   logout: function
   
   Sidebar elements:
   Sidebar: Found
   Toggle button: Found
   Overlay: Found
   ```

**If you don't see these:**
- Page didn't load properly
- Clear cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check for 404 errors in Network tab

### Step 2: Test Function Manually
1. Open dashboard.html in mobile view
2. Open DevTools Console
3. Type and execute:
   ```javascript
   window.toggleSidebar()
   ```
4. Expected: Sidebar should slide in/out

**If nothing happens:**
- Function might not be defined
- Check if dashboard.js loaded (Network tab)
- Verify file path is correct

### Step 3: Check CSS Media Query
1. In DevTools, open Elements tab
2. Select the sidebar element (`<div class="sidebar">`)
3. Look at computed styles
4. Verify:
   - `position: fixed` (should be)
   - `left: -250px` (should be hidden)
   - When `.active` class added: `left: 0px`

**If position is still `relative`:**
- Media query not applying
- Check if viewport width is < 768px
- Resize window smaller

### Step 4: Test `.active` Class Toggle
1. Console type:
   ```javascript
   document.querySelector('.sidebar').classList.add('active')
   ```
2. Expected: Sidebar slides in
3. Console type:
   ```javascript
   document.querySelector('.sidebar').classList.remove('active')
   ```
4. Expected: Sidebar slides out

**If sidebar doesn't move:**
- CSS not applying correctly
- Sidebar might be behind other elements
- Z-index issue

### Step 5: Test Overlay
1. Console type:
   ```javascript
   document.getElementById('sidebarOverlay').classList.add('active')
   ```
2. Expected: Dark overlay appears over page
3. Console type:
   ```javascript
   document.getElementById('sidebarOverlay').classList.remove('active')
   ```
4. Expected: Overlay disappears

**If overlay doesn't show:**
- Media query CSS not applying
- Check `display: block !important;` is in CSS
- Z-index might be wrong (should be 998)

### Step 6: Test Click Events
1. Open console
2. Type:
   ```javascript
   document.getElementById('sidebarToggle').onclick = function(e) {
     e.preventDefault();
     console.log('Button clicked!');
   }
   ```
3. Click hamburger button
4. Expected: Console logs "Button clicked!"

**If nothing logs:**
- Button onclick not working
- Button might be hidden
- Event handler not attached

## Common Issues & Solutions

### Issue: Hamburger menu not visible
**Solution:**
```javascript
// Check if button is hidden
document.querySelector('.sidebar-toggle').style.display // Should NOT be 'none'
window.innerWidth // Should be <= 767 (mobile)
```

### Issue: Sidebar doesn't slide
**Solution:**
```javascript
// Check position and transition
const sb = document.querySelector('.sidebar');
console.log(window.getComputedStyle(sb).position); // Should be 'fixed'
console.log(window.getComputedStyle(sb).left); // Should be '-250px'
console.log(window.getComputedStyle(sb).transition); // Should have 'left'
```

### Issue: Overlay visible on desktop
**Solution:**
```javascript
// Check overlay display
const overlay = document.getElementById('sidebarOverlay');
console.log(window.getComputedStyle(overlay).display); // Should be 'none'
```

### Issue: Can't click sidebar links
**Solution:**
```javascript
// Check if overlay blocking clicks
const overlay = document.getElementById('sidebarOverlay');
console.log(window.getComputedStyle(overlay).pointerEvents); // Should be 'none' when not active
```

## Expected CSS at Different Widths

### Desktop (≥ 768px):
```
.sidebar: position: relative, left: auto, display: visible
.sidebar-overlay: display: none
.sidebar-toggle: display: none
```

### Mobile (< 768px):
```
.sidebar: position: fixed, left: -250px
.sidebar.active: left: 0
.sidebar-overlay: display: none initially
.sidebar-overlay.active: display: block
.sidebar-toggle: display: block
```

## Files to Check

1. **dashboard.html** - Verify media query exists at line ~440
2. **dashboard.js** - Verify window.toggleSidebar defined
3. **Browser cache** - Clear with Ctrl+Shift+Delete

## Commands to Run in Console

```javascript
// 1. Check functions exist
console.log({
  toggleSidebar: typeof window.toggleSidebar,
  showSection: typeof window.showSection,
  logout: typeof window.logout
});

// 2. Check elements
console.log({
  sidebar: !!document.querySelector('.sidebar'),
  toggle: !!document.getElementById('sidebarToggle'),
  overlay: !!document.getElementById('sidebarOverlay')
});

// 3. Test toggle manually
window.toggleSidebar();

// 4. Check viewport width
console.log('Viewport width:', window.innerWidth);

// 5. Check if mobile styles applying
console.log(window.getComputedStyle(document.querySelector('.sidebar')).position);
```

## If All Else Fails

1. Copy test-sidebar.html code structure exactly
2. Replace dashboard.html HTML with test-sidebar.html structure
3. Keep dashboard.html CSS and JS
4. Test gradually to find what breaks it

---

**Report these findings when submitting:**
- Console output from verification script
- Computed styles from DevTools
- Screenshot of DevTools showing sidebar element
- Window width when testing
