# Image Preview Diagnostic Guide

## Step-by-Step Debugging

### Step 1: Open DevTools Console
1. Press **F12** or **Ctrl+Shift+I**
2. Go to **Console** tab
3. You should see `[Chat]` prefixed messages

### Step 2: Check if Image Was Created
1. In console, paste:
```javascript
// Check localStorage for messages
const msgKeys = Object.keys(localStorage).filter(k => k.startsWith('messages_'));
console.log('Chat message keys:', msgKeys);

// Get first chat's messages
if (msgKeys.length > 0) {
  const msgs = JSON.parse(localStorage.getItem(msgKeys[0]));
  console.log('Messages in first chat:', msgs);
  
  // Find image message
  const imageMsg = msgs.find(m => m.type === 'file' && m.attachments);
  if (imageMsg) {
    console.log('Image message found:', imageMsg);
    console.log('Attachment URL length:', imageMsg.attachments[0].url?.length);
    console.log('URL preview:', imageMsg.attachments[0].url?.substring(0, 100));
  }
}
```

### Step 3: Check if HTML Was Generated
1. In console, paste:
```javascript
// Check if images are in DOM
const images = document.querySelectorAll('.preview-thumbnail');
console.log('Image elements in DOM:', images.length);

// Check first image
if (images.length > 0) {
  const img = images[0];
  console.log('Image src:', img.src?.substring(0, 100));
  console.log('Image alt:', img.alt);
  console.log('Image display:', window.getComputedStyle(img).display);
  console.log('Image visibility:', window.getComputedStyle(img).visibility);
  console.log('Image dimensions:', img.offsetWidth, 'x', img.offsetHeight);
}
```

### Step 4: Check Container Styling
1. In console, paste:
```javascript
// Check image preview container
const container = document.querySelector('.message-file.image-preview');
if (container) {
  const style = window.getComputedStyle(container);
  console.log('Container display:', style.display);
  console.log('Container flex-direction:', style.flexDirection);
  console.log('Container visibility:', style.visibility);
  console.log('Container height:', style.height);
  console.log('Container overflow:', style.overflow);
}
```

### Step 5: Manually Test Image URL
1. In console, paste:
```javascript
// Get the image URL
const imageMsg = JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(k => k.startsWith('messages_'))[0]))[0];
const url = imageMsg?.attachments?.[0]?.url;

if (url) {
  // Test if it's a valid data URL
  console.log('URL starts with data:image:', url.startsWith('data:image'));
  console.log('URL length:', url.length);
  
  // Create test image
  const testImg = new Image();
  testImg.onload = () => console.log('✓ Image URL is valid and loads');
  testImg.onerror = () => console.log('✗ Image URL failed to load');
  testImg.src = url;
}
```

### Step 6: Check Network/Console for Errors
Look for any of these errors:

| Error | Cause | Fix |
|-------|-------|-----|
| `Uncaught SyntaxError` | Code has syntax error | Check console for line number |
| `Cannot read property 'url' of undefined` | Attachment missing | Reload page, try upload again |
| `Image failed to load` | Data URL corrupted | Use smaller image |
| `QuotaExceededError` | localStorage full | Clear old chats |

---

## Common Issues & Solutions

### Issue 1: No `[Chat]` logs at all

**Diagnosis:**
```javascript
typeof ChatSystem // should return "function"
typeof chatSystem // should return "object"
window.chatSystem // should be ChatSystem instance
```

**If undefined**: Chat system didn't load
- Check: Is `<script src="chat-system.js">` in dashboard.html?
- Check: Is JavaScript enabled?
- Solution: Reload page, check console for errors

---

### Issue 2: `[Chat] Files selected: 0`

**Cause**: File not being picked up from file input

**Debug**:
```javascript
const fileInput = document.getElementById('chatFileInput');
console.log('File input found:', !!fileInput);
console.log('File input type:', fileInput?.type);
console.log('File input accept:', fileInput?.accept);
```

**Fix**:
- Check file picker dialog opens
- Ensure you're selecting an image file
- Try with PNG instead of JPEG

---

### Issue 3: Upload logs show but image doesn't render

**Logs you see**:
```
[Chat] Files selected: 1
[Chat] Processing file: photo.jpg
[Chat] File read complete
[Chat] renderMessages: 1 messages
[Chat] Rendering image: photo.jpg
```

**But no image appears on screen**

**Diagnosis**:
```javascript
// Check if HTML was generated
const preview = document.querySelector('.message-file.image-preview');
console.log('Preview element exists:', !!preview);
console.log('Preview HTML:', preview?.innerHTML);

// Check CSS is applied
const img = document.querySelector('.preview-thumbnail');
const styles = window.getComputedStyle(img);
console.log('Display:', styles.display);
console.log('Max-width:', styles.maxWidth);
console.log('Max-height:', styles.maxHeight);
```

**Solutions**:
1. **Image might be hidden**:
   ```javascript
   // Force visible
   document.querySelector('.preview-thumbnail').style.display = 'block';
   document.querySelector('.preview-thumbnail').style.visibility = 'visible';
   ```

2. **CSS conflict**: Check if another CSS rule is hiding images
   ```javascript
   document.querySelector('.preview-thumbnail').style.cssText = 'display:block !important; width:100% !important; max-width:200px !important; height:auto !important;';
   ```

3. **Container issue**: Check container styling
   ```javascript
   document.querySelector('.message-file.image-preview').style.cssText = 'display:flex !important; flex-direction:column !important;';
   ```

---

### Issue 4: Image URL is empty or wrong

**Debug**:
```javascript
const msgs = JSON.parse(localStorage.getItem(Object.keys(localStorage).filter(k => k.startsWith('messages_'))[0]));
const att = msgs[0]?.attachments?.[0];
console.log('Attachment:', att);
console.log('URL length:', att?.url?.length);
console.log('URL type:', typeof att?.url);
console.log('URL starts with data:', att?.url?.startsWith('data:'));
```

**If URL is empty**:
- Check: Did `File read complete` log show dataUrl length > 0?
- If yes: Issue is in createFileMessage()
- If no: Issue is in FileReader

**If URL exists but doesn't start with "data:"**:
- Something overwrote the URL
- Check: Is there custom upload handler?

---

### Issue 5: Image HTML is there but appears as broken image

**Debug**:
```javascript
const img = document.querySelector('.preview-thumbnail');
console.log('Image loaded:', img.complete && img.naturalHeight > 0);
console.log('Image src:', img.src?.substring(0, 100));

// Try to load image
const testImg = new Image();
testImg.src = img.src;
testImg.onload = () => console.log('✓ Image URL works');
testImg.onerror = () => console.log('✗ Image URL broken');
```

**If broken**:
- Data URL is corrupted in localStorage
- May be truncated if it was too large
- Solution: Use smaller image

---

## Force Display Test

Run this to force show any hidden images:

```javascript
// Force all images visible
document.querySelectorAll('.preview-thumbnail').forEach(img => {
  img.style.display = 'block';
  img.style.visibility = 'visible';
  img.style.opacity = '1';
  img.style.pointerEvents = 'auto';
  img.parentElement.style.display = 'flex';
  img.parentElement.style.visibility = 'visible';
});

console.log('Forced display of', document.querySelectorAll('.preview-thumbnail').length, 'images');
```

---

## Complete Diagnostic Report

Save this output when reporting issues:

```javascript
// Run this in console and save output
console.log('=== CHAT IMAGE DIAGNOSTIC ===');
console.log('ChatSystem loaded:', typeof ChatSystem === 'function');
console.log('Messages in storage:', Object.keys(localStorage).filter(k => k.startsWith('messages_')).length);

const msgKey = Object.keys(localStorage).filter(k => k.startsWith('messages_'))[0];
if (msgKey) {
  const msgs = JSON.parse(localStorage.getItem(msgKey));
  const imageMsg = msgs.find(m => m.type === 'file');
  console.log('Image message exists:', !!imageMsg);
  if (imageMsg) {
    console.log('  - Type:', imageMsg.type);
    console.log('  - Attachments:', imageMsg.attachments?.length);
    console.log('  - URL length:', imageMsg.attachments?.[0]?.url?.length);
    console.log('  - URL valid:', imageMsg.attachments?.[0]?.url?.startsWith('data:image'));
  }
}

const images = document.querySelectorAll('.preview-thumbnail');
console.log('Image elements in DOM:', images.length);
if (images.length > 0) {
  console.log('  - First image src length:', images[0].src?.length);
  console.log('  - First image display:', window.getComputedStyle(images[0]).display);
}

console.log('=== END DIAGNOSTIC ===');
```

---

## Still Not Working?

1. **Refresh the page** (Ctrl+R)
2. **Clear cache** (Ctrl+Shift+Delete)
3. **Try a small PNG image** (<100KB)
4. **Check browser console** for any red errors
5. **Verify chat system loaded**: Run `typeof ChatSystem` in console

If still broken, run the diagnostic report above and include output when asking for help.
