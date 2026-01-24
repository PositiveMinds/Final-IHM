# Advanced Subscription Feature Restriction

## Overview
Chat and AI Chatbot features are now restricted to "Advanced" subscription tier only. Users with Standard or starter subscriptions will see disabled buttons and receive a warning when attempting to access these features.

## Implementation Details

### Restricted Features
1. **Chat System** (fabChatBtn)
   - Chat Messages feature
   - Requires: Advanced subscription

2. **AI Chatbot** (fabChatbotBtn)
   - AI Assistant/Chatbot
   - Requires: Advanced subscription

### Available Features
- **Import Patient Data** (fabImportBtn) - Available to all subscriptions

## User Experience

### For Advanced Subscription Users
- Chat and Chatbot buttons appear normal (100% opacity)
- Buttons are fully clickable
- Features open normally

### For Standard/Starter Subscription Users
- Chat and Chatbot buttons appear grayed out (50% opacity)
- Cursor changes to "not-allowed" on hover
- Tooltip shows: "Chat available for Advanced subscriptions only"
- Clicking shows SweetAlert popup:
  ```
  Title: "Advanced Subscription Required"
  Message: "Chat feature is only available for Advanced subscription tier. 
            Please upgrade your subscription."
  ```

## Code Implementation

### Location: dashboard.html (Lines 2131-2237)

**Key Components:**

1. **Session Subscription Check**
```javascript
const sessionData = localStorage.getItem('userSession');
const session = sessionData ? JSON.parse(sessionData) : {};
const subscriptionType = session.subscriptionType;
const isAdvanced = subscriptionType === 'Advanced';
```

2. **Button State Management**
```javascript
if (!isAdvanced) {
    fabChatBtn.style.opacity = '0.5';
    fabChatBtn.style.cursor = 'not-allowed';
    fabChatBtn.title = 'Chat available for Advanced subscriptions only';
}
```

3. **Access Control**
```javascript
if (!isAdvanced) {
    Swal.fire({
        icon: 'warning',
        title: 'Advanced Subscription Required',
        text: 'Chat feature is only available for Advanced subscription tier...',
        confirmButtonColor: '#15696B'
    });
    return;
}
```

## Data Flow

```
User Logs In
    ↓
Login.js fetches subscription_type from facilities table
    ↓
Session stored in localStorage with subscriptionType field
    ↓
Dashboard loads, DOMContentLoaded event fires
    ↓
FAB Button script reads subscriptionType from session
    ↓
isAdvanced = (subscriptionType === 'Advanced')
    ↓
Button state updated based on isAdvanced flag
    ↓
Click handler checks isAdvanced before opening feature
    ↓
Shows warning modal if not Advanced subscription
```

## Testing Scenarios

### Test 1: Advanced Subscription User
- [ ] Log in with Advanced subscription account
- [ ] Chat and Chatbot buttons appear normal
- [ ] Buttons are clickable
- [ ] Features open when clicked

### Test 2: Standard Subscription User
- [ ] Log in with Standard subscription account
- [ ] Chat and Chatbot buttons appear grayed out
- [ ] Hover shows "not-allowed" cursor
- [ ] Tooltip displays subscription requirement message
- [ ] Clicking shows warning modal
- [ ] Feature does not open

### Test 3: Starter Subscription User
- [ ] Log in with starter subscription account (or null)
- [ ] Chat and Chatbot buttons appear grayed out
- [ ] Same behavior as Standard subscription user

## Visual Indicators

### Disabled Buttons (Non-Advanced)
- **Opacity**: 50% (0.5)
- **Cursor**: not-allowed
- **Tooltip**: Subscription requirement message
- **Color**: Grayed out appearance

### Enabled Buttons (Advanced)
- **Opacity**: 100% (normal)
- **Cursor**: pointer
- **Tooltip**: Feature description
- **Color**: Normal styling

## Frontend Dependencies
- `localStorage` - Session data storage
- `Swal.fire()` - Warning modal (SweetAlert2)
- CSS classes for button styling

## Database Requirements
- `facilities.subscription_type` column exists
- User's facility has subscription_type value set
- Valid values: 'starter', 'Standard', 'Advanced'

## Future Enhancements
- Add feature access matrix for other premium features
- Implement subscription upgrade modal
- Track feature usage by subscription tier
- Add audit logs for subscription-restricted access attempts
- Email notifications when users try to access premium features

## Security Considerations
✓ Client-side check prevents accidental clicks
✓ Backend API should also validate subscription for API calls
✓ Features disabled in UI, but API endpoints should also validate
✓ Prevent API direct calls bypassing UI checks

## Files Modified
- `dashboard.html` - FAB button logic and UI

## Related Files
- `login.js` - Fetches subscription_type from database
- `alter_facility_subscription_type.sql` - Database migration
- `USER_PROFILE_DROPDOWN_IMPROVEMENT.md` - Subscription display
