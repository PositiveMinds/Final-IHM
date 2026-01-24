# Subscription Type Troubleshooting Guide

## Issue: Subscription Type Not Showing in Dropdown

Follow these steps to debug and fix:

### Step 1: Verify Database Column Exists
Run this SQL query in Supabase:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'facilities' AND column_name = 'subscription_type';
```

**Expected Result:** Should return one row with `subscription_type`

**If not found:**
- Run the migration: `alter_facility_subscription_type.sql`
- Execute this:
```sql
ALTER TABLE facilities 
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'starter' 
CHECK (subscription_type IN ('starter', 'Advanced', 'Standard'));
```

### Step 2: Verify Facility Has Subscription Type
Run this query:
```sql
SELECT fid, facility_id, facility_name, subscription_type 
FROM facilities;
```

**Expected Result:** Each facility should have a subscription_type value

**If NULL or missing:**
- Update facilities with subscription type:
```sql
UPDATE facilities SET subscription_type = 'Advanced' WHERE facility_name = 'Kitwe HCIV';
UPDATE facilities SET subscription_type = 'Standard' WHERE facility_name = 'Other Facility';
-- etc.
```

### Step 3: Check Browser Console
1. Open dashboard in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for:
   - `Session data:` - Shows what session data is loaded
   - `Subscription type:` - Shows if subscriptionType is present

**Example output:**
```
Session data: {
  id: "...",
  email: "...",
  subscriptionType: "Advanced"  // Should show here
}
Subscription type: Advanced
```

**If subscriptionType is undefined:**
- User needs to log out and log back in
- Login.js will fetch fresh data from database

### Step 4: Verify Login.js Updated
Check that login.js has these lines:
- Line 72: `let subscriptionType = null;`
- Line 79: `.select('fid, facility_id, region, facility_name, subscription_type')`
- Line 86: `subscriptionType = facility.subscription_type;`
- Line 109: `subscriptionType: subscriptionType,`

### Step 5: Manual Testing
1. Open browser Developer Tools (F12)
2. Go to Application > Local Storage
3. Find `userSession` entry
4. Look for `"subscriptionType":"Advanced"` in the value
5. If not there, you need to log in again

### Step 6: Complete Workflow
```
1. Run SQL migration to add subscription_type column
   ↓
2. Update facilities with subscription types
   ↓
3. Log out from dashboard
   ↓
4. Log back in (login.js will fetch subscription_type)
   ↓
5. Check browser console for subscription type
   ↓
6. Dropdown should now show subscription badge
```

## Expected Behavior After Fix

When you log in:
1. Login.js fetches facility record WITH subscription_type
2. Subscription type stored in session
3. Dashboard loads session from localStorage
4. displayUserInfo() reads subscriptionType
5. If subscriptionType exists, dropdown shows colored badge:
   - **Advanced** → Red (#DC3545)
   - **Standard** → Yellow (#FFC107)
   - Other → Teal (#15696B)

## Debug Checklist

- [ ] SQL column `subscription_type` exists in facilities table
- [ ] Facilities have values in subscription_type column
- [ ] Browser console shows `Subscription type: Advanced` (or other value)
- [ ] localStorage contains `"subscriptionType":"Advanced"`
- [ ] User logged in AFTER migration was applied
- [ ] Dashboard dropdown shows subscription badge

## If Still Not Working

1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+Shift+R
3. Log out completely
4. Close all browser tabs with the dashboard
5. Log back in fresh
6. Check console logs

## Files Modified

- `alter_facility_subscription_type.sql` - Database migration
- `login.js` - Fetches subscription_type on login
- `dashboard.html` - Displays subscription_type in dropdown
