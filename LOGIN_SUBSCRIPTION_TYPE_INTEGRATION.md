# Login Integration - Subscription Type Fetch

## Overview
Updated the login.js to fetch `subscription_type` from the facilities table and include it in the user session data.

## Changes Made

### File: login.js

#### 1. Facility Query Enhanced (Lines 69-94)
**Before:**
```javascript
const { data: facility, error: facilityError } = await supabaseClient
  .from('facilities')
  .select('fid, facility_id, region, facility_name')
  .eq('fid', users.fid)
  .single();
```

**After:**
```javascript
let subscriptionType = "starter"; // Default subscription type
const { data: facility, error: facilityError } = await supabaseClient
  .from('facilities')
  .select('fid, facility_id, region, facility_name, subscription_type')
  .eq('fid', users.fid)
  .single();
```

**Changes:**
- Added `subscription_type` to the SELECT query
- Initialize `subscriptionType` with default value "starter"
- Handles case where subscription_type field doesn't exist in facilities table

#### 2. Facility Data Processing (Lines 83-89)
**Added:**
```javascript
if (facility && !facilityError) {
  // ... existing code ...
  subscriptionType = facility.subscription_type || "starter";
}
```

**Purpose:**
- Extracts subscription_type from facility record
- Falls back to "starter" if not found

#### 3. Session Data Updated (Lines 95-111)
**Added:**
```javascript
const sessionData = {
  // ... existing fields ...
  subscriptionType: subscriptionType,
  loginTime: new Date().toISOString(),
};
```

**New Field:**
- `subscriptionType`: Contains the facility's subscription tier ("starter", "Standard", or "Advanced")

## Data Flow

```
User Login (email + password)
    ↓
Query users table for user record
    ↓
Verify password
    ↓
Fetch facility record with subscription_type
    ↓
Create session with subscriptionType field
    ↓
Store session in localStorage
    ↓
Redirect to dashboard
    ↓
Dashboard reads subscription_type from session
    ↓
Display subscription badge in user profile dropdown
```

## Session Object Structure

After login, the sessionData includes:
```javascript
{
  id: "user_id",
  email: "user@example.com",
  fullname: "User Name",
  username: "username",
  facilityName: "Kitwe HCIV",
  facility_id: 1,
  fid: 1,
  facilityIdCode: "FAC001",
  facilityRegion: "region_name",
  userRole: "Admin",
  isActive: true,
  subscriptionType: "Advanced",  // New field
  loginTime: "2024-01-24T..."
}
```

## Benefits

✓ Subscription status fetched on login
✓ No additional queries needed in dashboard
✓ Default fallback to "starter" tier
✓ Backwards compatible with existing code
✓ Enables feature access control based on subscription
✓ Subscription info available throughout user session

## Testing Checklist

- [ ] Login with user from facility with "Advanced" subscription
- [ ] Verify dropdown shows "Advanced" in red
- [ ] Login with user from facility with "Standard" subscription
- [ ] Verify dropdown shows "Standard" in yellow
- [ ] Login with user from facility with no subscription_type set
- [ ] Verify dropdown shows "starter" in gray
- [ ] Check browser console for facility lookup logs
- [ ] Verify subscriptionType is in localStorage sessionData

## Error Handling

- If subscription_type field doesn't exist: defaults to "starter"
- If facility lookup fails: still logs in with default "starter"
- If facility record not found: uses default subscription type
- Console warnings logged for troubleshooting

## Database Requirement

The facilities table must have the subscription_type column:
```sql
ALTER TABLE facilities 
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'starter' 
CHECK (subscription_type IN ('starter', 'Advanced', 'Standard'));
```

(See: alter_facility_subscription_type.sql)
