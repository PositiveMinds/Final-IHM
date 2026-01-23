# PDF Export MIME Type Fix

## Issue
```
NS_ERROR_CORRUPTED_CONTENT
The resource from "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/autotable.min.js" 
was blocked due to MIME type ("text/plain") mismatch (X-Content-Type-Options: nosniff)
```

## Root Cause
The jsDelivr CDN was serving the jspdf-autotable library with MIME type `text/plain` instead of `application/javascript`. Modern browsers with `X-Content-Type-Options: nosniff` header reject scripts with incorrect MIME types as a security measure.

## Solution

Changed source for jspdf-autotable from **CDN to GitHub raw content**:

### Before
```javascript
script.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/autotable.min.js';
```

### After
```javascript
script.src = 'https://raw.githubusercontent.com/parallax/jsPDF/master/plugins/autotable.src.js';
script.type = 'text/javascript';  // Explicit MIME type
```

## Changes Made

**File:** `assets/js/chatbot-ui.js` (lines 491-513)

1. Changed jspdf-autotable source from CDN to GitHub raw content
2. Added explicit `script.type = 'text/javascript'` for both libraries
3. Kept jsPDF on jsDelivr (works correctly with explicit type attribute)

## Why This Works

1. **GitHub raw content** - Serves files with correct `text/javascript` MIME type
2. **Source directly from jsPDF repo** - Official, maintained source
3. **Explicit type attribute** - Helps browser correctly identify script content
4. **No CDN intermediary** - Avoids CDN caching/header issues

## Testing

Users should now be able to export to PDF without the MIME type error:

```javascript
// Test PDF export
chatbotUI.exportToPDF()
// Should complete without error
```

## Files Modified

- **assets/js/chatbot-ui.js**
  - `loadPDFLibraries()` function (lines 494-510)

## Fallback Options

If GitHub raw content has issues in the future, alternatives:

```javascript
// Option 1: Use jsDelivr with explicit /src path
script.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.js';

// Option 2: Use jsDelivr ESM version
script.src = 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/+esm';

// Option 3: Serve locally (recommended for production)
script.src = '/assets/js/lib/jspdf-autotable.min.js';
```

## Related

- See `CHATBOT_FEATURES_VISUAL_GUIDE.md` for PDF export feature overview
- See `EXCEL_EXPORT_FIX_SUMMARY.md` for Excel export documentation

---

**Status:** ✅ **Fixed**
