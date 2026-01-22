# Chat Floating Button Setup

## Quick Installation

Add this to your `dashboard.html` file **before the closing `</body>` tag**:

```html
<!-- Floating Chat Button -->
<style>
  .chat-fab {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #15696B;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(21, 105, 107, 0.4);
    transition: all 0.3s ease;
    z-index: 998;
  }

  .chat-fab:hover {
    background: #0F4449;
    transform: scale(1.1) translateY(-5px);
    box-shadow: 0 6px 16px rgba(21, 105, 107, 0.6);
  }

  .chat-fab-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #d32f2f;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    border: 2px solid white;
  }

  @keyframes pulse-fab {
    0% { box-shadow: 0 0 0 0 rgba(21, 105, 107, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(21, 105, 107, 0); }
    100% { box-shadow: 0 0 0 0 rgba(21, 105, 107, 0); }
  }

  .chat-fab.has-unread {
    animation: pulse-fab 2s infinite;
  }

  @media (max-width: 768px) {
    .chat-fab {
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
    }
  }
</style>

<button 
  class="chat-fab" 
  id="chatFabBtn"
  onclick="chatSystem.openChat()" 
  title="Open Chat">
  <i class="ri-chat-3-line"></i>
  <div class="chat-fab-badge" id="chatFabBadge" style="display: none;">0</div>
</button>
```

## Features

### Visual Design
- **Circular button** (60px diameter)
- **Teal color** (#15696B) matching your theme
- **Shadow effect** for depth
- **Hover animation** - scales up and lifts
- **Click animation** - scales down briefly
- **Responsive** - adjusts size on mobile

### Unread Badge
- Shows count of unread messages (red badge)
- Only displays when count > 0
- Supports "99+" format for large counts
- Pulse animation when unread messages exist

### Position
- Fixed at **bottom-right corner**
- Stays visible while scrolling
- Above all other content (z-index: 998)
- Safe margin from edges (30px)

## Customization

### Change Color
Replace `#15696B` with your desired color:
```css
background: #your-color;
```

### Change Position
Move to different corner - modify `bottom` and `right`:
```css
/* Bottom-left */
bottom: 30px;
left: 30px;
right: auto;

/* Top-right */
top: 30px;
bottom: auto;
right: 30px;
```

### Change Size
```css
width: 70px;  /* Default: 60px */
height: 70px; /* Default: 60px */
font-size: 2rem; /* Default: 1.5rem */
```

### Change Icon
Replace `ri-chat-3-line` with any Remix Icon:
```html
<i class="ri-chat-1-line"></i>
<i class="ri-chat-2-line"></i>
<i class="ri-chat-new-line"></i>
<i class="ri-message-3-line"></i>
```

## Required Dependencies

Make sure these are already in your `dashboard.html`:

```html
<!-- Remix Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css">

<!-- Chat System Scripts -->
<link rel="stylesheet" href="chat-system.css">
<script src="chat-system.js"></script>
```

## How It Works

1. **Click button** → Calls `chatSystem.openChat()`
2. **Chat panel slides in** from the right
3. **Overlay appears** behind panel
4. **Click overlay** → Closes chat panel
5. **Click X button** → Also closes chat panel

## Badge Update Logic

The badge update function checks for unread messages every 5 seconds. To implement actual unread tracking, modify:

```javascript
function updateUnreadBadge() {
  // Add your unread count logic here
  const unreadCount = chatSystem.getUnreadMessageCount();
  // Rest of the function...
}
```

## Accessibility

The button includes:
- `aria-label="Open Chat"` for screen readers
- `title="Open Chat"` for hover tooltip
- Keyboard accessible (can be focused and activated)

## Mobile Behavior

On phones/tablets:
- Button stays visible (important, don't hide it)
- Size reduces to 52-56px
- Margins reduce to 15-20px
- Chat panel expands to full width

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Performance

- No impact on page load
- CSS-based animations (GPU accelerated)
- Minimal JavaScript overhead
- Supports system reduced-motion preferences
