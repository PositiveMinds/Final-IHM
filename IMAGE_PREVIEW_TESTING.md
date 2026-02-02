# Image Preview Testing Guide

## How to Test Image Preview in Chat

### Quick Start
1. Open **dashboard.html** in your browser
2. Log in with any user account
3. Click the **FAB button** (+ icon at bottom right on mobile, or look for chat button)
4. Click **Chat** from the menu
5. Select or create a chat
6. Click the **attachment button** (📎) in the chat input area
7. Select a **PNG, JPEG, or JPG image** file
8. The image thumbnail should appear immediately in the chat

### Expected Behavior
- ✓ Image appears as a thumbnail (max 200px × 200px)
- ✓ Image filename appears below the thumbnail
- ✓ Click thumbnail to view full-size in modal
- ✓ Message persists in chat history (localStorage)
- ✓ Console shows upload progress with `[Chat]` logs

### Debugging - Open Browser Console (F12)

#### If image appears but says "Image not available"
Look for: `[Chat] No URL for image: filename.jpg`
- **Cause**: File data wasn't saved properly
- **Fix**: Try with a smaller image file

#### If image HTML renders but image doesn't load
Look for: `[Chat] Image failed to load: filename.jpg`
- **Cause**: Data URL might be truncated or corrupted in localStorage
- **Fix**: 
  1. Try smaller image (<2MB)
  2. Clear browser cache and localStorage
  3. Try PNG instead of JPEG

#### If nothing appears after uploading
Look for: `[Chat] renderMessages` logs
- **Expected**: Should show message count
- **Check**: `[Chat] Rendering image:` should appear in logs
- **If missing**: Message wasn't saved to localStorage

### Console Log Checklist

After uploading an image, you should see these logs in order:

```
[Chat] Files selected: 1
[Chat] Processing file: myimage.jpg, type: image/jpeg, size: 45000
[Chat] File read complete for myimage.jpg, dataUrl length: 60000
[Chat] renderMessages: 1 messages for chat [chatId]
  [0] Type: file, Has attachments: true, Count: 1
    [att 0] Name: myimage.jpg, Type: image/jpeg, URL length: 60000
[Chat] Rendering image: myimage.jpg, URL length: 60000
[Chat] Image loaded: myimage.jpg  (appears after image displays)
```

### Troubleshooting Steps

**Step 1: Check File Upload**
- Open DevTools Console
- Upload an image
- Look for `[Chat] Files selected: 1` and `[Chat] Processing file:` logs
- If you see these, file upload works ✓

**Step 2: Check Data URL Creation**
- Look for `[Chat] File read complete` log
- Check the `dataUrl length` - should be > 1000
- If length is 0 or very small, FileReader failed

**Step 3: Check localStorage**
- In DevTools Console, run: `Object.keys(localStorage).filter(k => k.startsWith('messages_'))`
- This shows all chat message keys
- Run: `JSON.parse(localStorage.getItem('messages_[chatId]'))` to see stored messages
- Check if the message has `attachments` array with URL

**Step 4: Check Image Rendering**
- Look for `[Chat] renderMessages:` log
- Check if attachment details are shown
- Look for `[Chat] Rendering image:` with URL length > 0
- If URL length is 0, image wasn't saved

**Step 5: Check Image Loading**
- Look for `[Chat] Image loaded:` (success) or `[Chat] Image failed to load:` (error)
- If failed, check image format (PNG/JPG/JPEG)
- Try with smaller image file

### localStorage Quota Issues

If you see error: `QuotaExceededError`
- Browser localStorage is full (images use a lot of space)
- **Fix Options**:
  1. Clear old messages: Delete messages_[chatId] in DevTools
  2. Use smaller images
  3. Clear all localStorage in DevTools Application tab

### Browser DevTools Tips

1. **View localStorage**:
   - DevTools → Application → Local Storage → your site
   - Search for keys starting with `messages_`

2. **Check Console Logs**:
   - Filter by `[Chat]` to see only image preview logs
   - Timestamps help track when upload happened

3. **Monitor Network** (if using blob URLs):
   - DevTools → Network tab
   - Look for image load requests
   - Check if they succeed or fail

### Mobile Testing

If testing on mobile:
1. Open DevTools via remote debugging
2. Same console logs apply
3. FAB menu might look different
4. Chat button may be in hamburger menu

### Test with Different File Sizes

| Size | Expected | Notes |
|------|----------|-------|
| <500KB | ✓ Works | Recommended |
| 500KB-2MB | ✓ Works | May be slower |
| 2MB-10MB | ✓ Works | Check localStorage space |
| >10MB | ✗ Rejected | File size limit enforced |

### Common Issues & Fixes

| Issue | Logs to Check | Fix |
|-------|---|---|
| Image doesn't appear | `renderMessages`, `Rendering image` | Check URL length in logs |
| Shows "Image not available" | `No URL for image` | Reload page, try again |
| Thumbnail loads but is blank | `Image loaded` appears in logs | Try different image format |
| Storage error | `QuotaExceededError` | Clear old chats/messages |
| Image fails to load after refresh | `renderMessages` shows messages | localStorage was cleared |

### Manual Test Script

Run this in DevTools Console to test image data URL manually:

```javascript
// Create a test data URL
const testImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

// Try to display it
const img = document.createElement('img');
img.src = testImageUrl;
img.style.maxWidth = '200px';
img.style.border = '1px solid red';
document.body.appendChild(img);

// Check if it loads
img.addEventListener('load', () => console.log('Test image loaded successfully'));
img.addEventListener('error', () => console.log('Test image failed to load'));
```

If test image loads, data URLs work in your browser. The issue is with the actual image upload.

## Still Not Working?

1. **Check browser console for errors** - Look for red errors
2. **Try the test-image-preview.html** file - Standalone test
3. **Check ChatSystem initialization** - Look for ChatSystem class logs in console
4. **Verify chat.system.js is loaded** - Run `typeof ChatSystem` in console, should return "function"
5. **Check file permissions** - Some browsers block data URLs in certain contexts

## Report Issues With This Info

Include when reporting issues:
1. Browser type and version
2. Image file size and format
3. Complete console log output with `[Chat]` messages
4. localStorage content (from DevTools)
5. Steps to reproduce
