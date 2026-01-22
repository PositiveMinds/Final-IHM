# Chat System Integration Guide

## Overview
The chat system provides private and group messaging with facility-based access control. It slides in from the right as an overlay panel.

## Features

### Private Chats
- One-on-one messaging between users
- Only visible to chat participants
- Facility-based contact filtering

### Group Chats
- Multiple members in one conversation
- Created with a custom group name
- Member management

### Access Control
- **Patients**: Can only chat with health workers from their registered facility
- **Health Workers**: Can chat with their patients and other health workers from the same facility
- Only registered facility contacts are visible

### Document Sharing
- Supported formats: PDF, PNG, JPEG, JPG
- Maximum file size: 10MB per file
- Files are clickable and downloadable from chat

## Installation

### 1. Add CSS & JS to dashboard.html head
```html
<link rel="stylesheet" href="chat-system.css">
<script src="chat-system.js"></script>
```

### 2. Add Chat Trigger Button to Navigation/Header
Add this button to your navbar or header:
```html
<button class="btn btn-outline-primary" onclick="chatSystem.openChat()" title="Open Chat">
  <i class="ri-chat-3-line"></i> Chat
</button>
```

Or use a floating button:
```html
<button 
  class="btn btn-primary rounded-circle" 
  style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; z-index: 998;"
  onclick="chatSystem.openChat()"
  title="Open Chat">
  <i class="ri-chat-3-line" style="font-size: 1.5rem;"></i>
</button>
```

## User Data Structure

The system expects user objects in localStorage with this structure:

```javascript
{
  id: "user-id",
  full_name: "John Doe",
  role: "patient" | "health_worker" | "admin",
  facility_id: "facility-id",
  email: "user@example.com",
  avatar: "initials" // optional
}
```

Store users in localStorage as:
```javascript
localStorage.setItem('currentUser', JSON.stringify(currentUserObject));
localStorage.setItem('allUsers', JSON.stringify(allUsersArray));
```

## API Integration

Replace localStorage calls with API endpoints in `chat-system.js`:

### Load Current User
```javascript
// Replace in loadCurrentUser()
const response = await fetch('/api/users/me');
this.currentUser = await response.json();
```

### Load Contacts
```javascript
// Replace in loadContacts()
const response = await fetch(`/api/contacts?facilityId=${this.currentUser.facility_id}`);
const contacts = await response.json();
```

### Save Messages
```javascript
// Add in sendMessage() after local save
await fetch(`/api/chats/${this.currentChat.id}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newMessage)
});
```

## Customization

### Change Panel Width
In `chat-system.css`, modify:
```css
.chat-container {
  width: 400px; /* Change this value */
}
```

### Change Colors
Update primary color references:
- `#15696B` - Primary teal color
- `#0F4449` - Darker teal
- `#e9ecef` - Border color

### Add New File Types
In `chat-system.js`, modify:
```javascript
this.allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'your-mime-type'];
this.fileExtensions = ['.pdf', '.png', '.jpeg', '.jpg', '.your-extension'];
```

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes
- Messages stored in localStorage (consider switching to IndexedDB for large datasets)
- Contacts filtered client-side (consider server-side filtering for scalability)
- No real-time updates currently (consider WebSocket integration)

## Future Enhancements
1. Real-time messaging with WebSocket
2. Typing indicators
3. Message read receipts
4. Image preview in chat
5. Voice/video call integration
6. Message search functionality
7. Message reactions/emojis
8. User online status
9. Message encryption
10. Chat notifications

## Troubleshooting

### Chat panel not appearing
- Verify `chat-system.js` is loaded before other scripts
- Check browser console for errors
- Ensure `currentUser` is set in localStorage

### Contacts not showing
- Verify `allUsers` array in localStorage
- Check facility_id matches
- Check user roles are set correctly

### Files not uploading
- Check file size (max 10MB)
- Verify file format is supported
- Check browser storage quota

## Support
For issues or feature requests, check the console for error messages and verify data structure compliance.
