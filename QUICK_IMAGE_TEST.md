# Quick Image Preview Test

## 30-Second Test

1. Open **dashboard.html**
2. Click **FAB menu** → **Chat**
3. Select a chat
4. Click **📎 (attachment)** button
5. Pick any **PNG, JPEG, or JPG image**
6. Image thumbnail should appear immediately ✓

## If Image Doesn't Appear

### Step 1: Open Browser Console
- Press **F12** or **Ctrl+Shift+I**
- Look at the **Console** tab

### Step 2: Check for Error Messages
Look for messages starting with `[Chat]`:
- `[Chat] Files selected: 1` ← File uploaded
- `[Chat] File read complete` ← Converted to image data
- `[Chat] renderMessages:` ← Drawing on screen
- `[Chat] Rendering image:` ← Creating image element

### Step 3: Identify the Issue

| What You See | Problem | Solution |
|---|---|---|
| `[Chat] Files selected: 0` | File not selected | Check file picker dialog |
| No logs at all | Chat system not loaded | Reload page |
| `[Chat] Rendering image: [name], URL length: 0` | Data URL not created | Try smaller image |
| Logs show everything but no image | Image won't load | Clear browser cache |

### Step 4: Quick Fixes
1. **Try a smaller image** (< 1MB)
2. **Try PNG format** instead of JPEG
3. **Reload the page** (Ctrl+R or Cmd+R)
4. **Clear browser cache** (Ctrl+Shift+Delete)
5. **Try a different chat** (might be localStorage full)

## Console Command to Test

Copy this into console and press Enter:

```javascript
// Check if chat system is loaded
console.log('ChatSystem loaded:', typeof ChatSystem === 'function');

// Check if messages are stored
const chats = Object.keys(localStorage).filter(k => k.startsWith('messages_'));
console.log('Chat messages stored:', chats);

// Show first message from first chat
if (chats.length > 0) {
  const msgs = JSON.parse(localStorage.getItem(chats[0]));
  console.log('First message:', msgs[0]);
}
```

## Expected Console Output

After uploading image:
```
[Chat] Files selected: 1
[Chat] Processing file: photo.jpg, type: image/jpeg, size: 125432
[Chat] File read complete for photo.jpg, dataUrl length: 167243
[Chat] Created file message: {id: 1704067200000, ...}
[Chat] Attachment URL length: 167243
[Chat] renderMessages: 1 messages for chat abc123
  [0] Type: file, Has attachments: true, Count: 1
    [att 0] Name: photo.jpg, Type: image/jpeg, URL length: 167243
[Chat] Rendering image: photo.jpg, URL length: 167243
[Chat] Image loaded: photo.jpg  ← Image displays!
```

## If Still Not Working

1. **Is ChatSystem defined?** Run: `typeof ChatSystem`
   - Should return: `"function"`
   - If `"undefined"`: chat-system.js didn't load

2. **Is chat being rendered?** Run: `document.getElementById("chatContainer")`
   - Should return element
   - If `null`: chat panel not created

3. **Is message saved?** Run in console:
   ```javascript
   const chats = Object.keys(localStorage).filter(k => k.startsWith('messages_'));
   JSON.parse(localStorage.getItem(chats[0]));
   ```
   - Look for message with `type: "file"`
   - Check if `attachments` array has URL

## Working Indicators

✓ Console shows `[Chat]` prefixed logs  
✓ `renderMessages:` shows message count  
✓ `Rendering image:` shows URL length > 1000  
✓ `Image loaded:` appears in console  
✓ Image thumbnail visible in chat  

## Not Working Indicators

✗ No `[Chat]` logs in console  
✗ `Image failed to load` error  
✗ URL length shows 0  
✗ Storage quota error  
✗ Chat panel not visible  

## File Size Reference

| Type | Size | Works? |
|---|---|---|
| Screenshot PNG | 100-500KB | ✓ Yes |
| Phone photo JPEG | 1-3MB | ✓ Yes |
| High-res image | 5-10MB | ✓ Maybe (storage limits) |
| Very large image | >10MB | ✗ Rejected |

---

**Still stuck?** Check the detailed guide: `IMAGE_PREVIEW_TESTING.md`
