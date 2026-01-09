# Stats Grid Visibility Debug

## Issue
The stats-grid section with stat cards is not visible on the dashboard page.

## Steps to Debug:

### 1. In Browser DevTools (F12)
```javascript
// Check if overview section is active
document.getElementById('overview').classList.contains('active')
// Should return: true

// Check if stats-grid is visible
document.querySelector('.stats-grid').offsetHeight
// Should return: > 0 (not 0)

// Check computed style
getComputedStyle(document.querySelector('.stats-grid')).display
// Should return: 'grid'

// Check if overview section is hidden
getComputedStyle(document.getElementById('overview')).display
// Should return: 'block'
```

### 2. Possible Causes
- [ ] Overview section not active (class="section active" missing)
- [ ] Stats-grid has `display: none` or `visibility: hidden`
- [ ] Stats-grid has `height: 0` or `max-height: 0`
- [ ] Parent container has overflow hidden
- [ ] CSS conflict from media queries
- [ ] JavaScript removing the content

### 3. Visual Inspection Checklist
- [ ] Scroll down in the main-content area - is the stats-grid below the fold?
- [ ] Check if page is loading at mobile breakpoint (< 768px)
- [ ] Open DevTools Elements tab and search for "stats-grid"
- [ ] Right-click stats-grid → Inspect → Check "Styles" panel for display property

### 4. If still not visible:
- Check browser console for JavaScript errors
- Verify that dashboard.js is loaded and initialized
- Check if initializeDashboard() function is being called
- Verify showSection() function is setting active class correctly

## HTML Structure
```
<div id="overview" class="section active">
    <div class="page-title">...</div>
    <div>Facility Information Card</div>
    <div class="stats-grid">  <!-- THIS IS NOT VISIBLE -->
        <div class="stat-card success">...</div>
        ...
    </div>
</div>
```

## Expected CSS
```css
.section.active {
    display: block;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
}
```
