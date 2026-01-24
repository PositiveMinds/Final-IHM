# User Profile Dropdown Improvement & Subscription Type

## Changes Made

### 1. Enhanced User Profile Dropdown UI (dashboard.html)
- **Location**: Lines 1050-1091
- **Improvements**:
  - Larger, more prominent avatar with user initials (48x48px)
  - Better visual hierarchy with clear sections
  - Added building icon for facility name
  - Added crown icon for subscription status
  - Action menu items: Profile Settings, Account Settings
  - Improved button styling with icon for Logout
  - Better spacing and borders between sections
  - Minimum width of 280px for better readability

### 2. Subscription Type Display
- **Display Format**: 
  - Advanced: Red badge (#DC3545)
  - Standard: Yellow badge (#FFC107)
  - starter: Gray badge (#6C757D)
- **Color Coding**: Visual distinction between subscription tiers
- **Location**: In dropdown profile section with icon

### 3. JavaScript Updates (displayUserInfo function)
- **Lines 2895-2935**
- Reads `subscriptionType` from session object
- Updates both regular and large initials
- Dynamically colors subscription type badge based on tier
- Handles facility name with icon display

### 4. CSS Styling Added
- **Lines 271-305**
- Dropdown menu with rounded corners (8px)
- Hover effects for menu items
- Avatar box styling with gradient background
- Subscription type styling with background gradient
- Responsive design maintained

## Database Changes

### SQL Migration File
**File**: `alter_facility_subscription_type.sql`

```sql
ALTER TABLE facilities 
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'starter' 
CHECK (subscription_type IN ('starter', 'Advanced', 'Standard'));

CREATE INDEX idx_facilities_subscription_type ON facilities(subscription_type);

-- Set subscription type for Kitwe HCIV
UPDATE facilities SET subscription_type = 'Advanced' WHERE facility_name = 'Kitwe HCIV';
```

### Features
- Default value: 'starter'
- CHECK constraint ensures only valid values
- Index created for query performance
- Pre-populated Kitwe HCIV with 'Advanced' tier

## Session Object Requirements

The `session` object should now include:
```javascript
{
    fullname: "User Name",
    username: "username",
    userRole: "Admin",
    facilityName: "Kitwe HCIV",
    subscriptionType: "Advanced"  // New field
}
```

## Color Scheme
- **Advanced**: Red (#DC3545) - Premium tier
- **Standard**: Yellow (#FFC107) - Mid-tier
- **starter**: Gray (#6C757D) - Basic tier

## Next Steps
1. Apply the SQL migration to add the subscription_type column
2. Update user session logic to fetch subscription_type from facilities table
3. Test dropdown with different subscription types
4. Verify facility lookup retrieves subscription type correctly

## User Experience Improvements
✓ Clear subscription status visibility
✓ Professional dropdown appearance
✓ Better organized profile information
✓ Color-coded subscription tiers
✓ Quick access to account actions
✓ Responsive design maintained
