# 🚀 START HERE: Supabase Setup Guide

## What You Have

Complete subscription-based feature access system:
- Chat & Chatbot restricted to Advanced tier only
- Access logging to database
- Email notifications for upgrades
- Professional UI with modals and dropdowns

## What You Need to Do

### Phase 1: Database (5 minutes)

**Go to Supabase Dashboard → SQL Editor**

Copy and paste this (all at once):

```sql
-- Feature Access Logs Table
CREATE TABLE feature_access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  facility_name VARCHAR(255),
  feature VARCHAR(100) NOT NULL,
  subscription_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feature_access_logs_user_id ON feature_access_logs(user_id);
CREATE INDEX idx_feature_access_logs_feature ON feature_access_logs(feature);
CREATE INDEX idx_feature_access_logs_status ON feature_access_logs(status);
CREATE INDEX idx_feature_access_logs_timestamp ON feature_access_logs(timestamp);

ALTER TABLE feature_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON feature_access_logs FOR SELECT
  USING (auth.uid()::text = user_id);

-- Feature Upgrade Notifications Table
CREATE TABLE feature_upgrade_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  user_email VARCHAR(255) NOT NULL,
  facility_name VARCHAR(255),
  feature VARCHAR(100) NOT NULL,
  current_tier VARCHAR(50) NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP,
  message_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_email ON feature_upgrade_notifications(user_email);
CREATE INDEX idx_notifications_feature ON feature_upgrade_notifications(feature);
CREATE INDEX idx_notifications_sent ON feature_upgrade_notifications(sent);

ALTER TABLE feature_upgrade_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON feature_upgrade_notifications FOR SELECT
  USING (auth.uid()::text = user_id);
```

Click **Run** → Done with database!

---

### Phase 2: Email Service (3 minutes)

Choose **Resend** (easier) OR **SendGrid**:

#### Option A: Resend (Recommended)
1. Go to https://resend.com
2. Sign up (free)
3. Verify your domain (or use default)
4. Copy your **API Key**

#### Option B: SendGrid
1. Go to https://sendgrid.com
2. Sign up (free)
3. Create **API Key**
4. Copy the key

Keep this API key handy!

---

### Phase 3: Deploy Edge Functions (5 minutes) - Cloud Dashboard

**Using Supabase Cloud (no CLI needed):**

1. Go to **Supabase Dashboard**
2. Select your project
3. Go to **Edge Functions** (left sidebar)

**Function 1 - Logging:**
1. Click **Create a new function**
2. Name: `feature-logs`
3. Runtime: **TypeScript**
4. Click **Create function**
5. Delete the default code
6. Paste ALL content from `supabase-edge-function-logs.ts`
7. Click **Deploy**

**Function 2 - Notifications:**
1. Click **Create a new function**
2. Name: `feature-notifications`
3. Runtime: **TypeScript**
4. Click **Create function**
5. Delete the default code
6. Paste ALL content from `supabase-edge-function-notifications.ts`
7. Click **Deploy**

**Set Environment Variables:**
1. Click on `feature-notifications` function
2. Scroll to **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - OR `SENDGRID_API_KEY` = your SendGrid key
   - `SUPPORT_EMAIL` = support@yourdomain.com
   - `FROM_EMAIL` = notifications@yourdomain.com
4. Click **Save**

**Get your Project ID:**
- Supabase Dashboard → Settings (gear icon) → General → **Project ID**
- Copy this ID (looks like: `abc123def456`)

---

### Phase 4: Update Dashboard (2 minutes)

**In your `dashboard.html`, find:**

```html
<script src="chat-system.js"></script>

<!-- FAB Button Script -->
```

**Replace with:**

```html
<script src="chat-system.js"></script>

<!-- Feature Access Matrix -->
<script src="FEATURE_ACCESS_MATRIX.js"></script>

<!-- Subscription Upgrade Modal & Logging -->
<script src="subscription-upgrade-modal-supabase.js"></script>

<!-- Configuration -->
<script>
  // Set your Supabase project ID here
  configureSupabaseEdgeFunctions('your-project-id-here');
</script>

<!-- FAB Button Script -->
```

Replace `your-project-id-here` with your actual project ID!

---

### Phase 5: Test It! (5 minutes)

#### Test 1: Database Works
Go to Supabase SQL Editor, run:
```sql
SELECT * FROM feature_access_logs;
SELECT * FROM feature_upgrade_notifications;
```

Both should return empty tables (no error = good!)

#### Test 2: Logging Function Works
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/feature-logs \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "feature": "chat.system",
    "subscriptionType": "starter",
    "status": "blocked",
    "userAgent": "Test"
  }'
```

Should return: `{"success": true, "logId": 1, ...}`

#### Test 3: Email Function Works
```bash
curl -X POST https://[your-project-id].supabase.co/functions/v1/feature-notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "email": "your-email@gmail.com",
    "facilityName": "Test",
    "feature": "chat.system",
    "currentTier": "starter"
  }'
```

Should send you an email! Check spam folder.

#### Test 4: In the App
1. Log in with a **non-Advanced** subscription user
2. Click the Chat button (💬)
3. See the upgrade modal
4. Check your email for upgrade notification
5. In Supabase, check the logs appeared in the database

---

## Done! ✓

Your system is now live. Here's what happens:

### When User Clicks Chat (Non-Advanced):
```
1. Modal appears → "Upgrade Required"
2. Log sent to database
3. Email sent with upgrade prompt
4. User can click "Upgrade Now"
```

### When User Clicks Chat (Advanced):
```
1. Log sent to database (status: allowed)
2. Chat opens normally
```

---

## What's Working Now

- ✓ Subscription shown in user profile dropdown
- ✓ Chat button disabled for non-Advanced users
- ✓ Chatbot button disabled for non-Advanced users
- ✓ Access attempts logged to database
- ✓ Upgrade emails sent automatically
- ✓ Statistics available in database

---

## Quick Reference

### Your Supabase URLs

Replace `[your-project-id]` with your actual ID:

```
Functions:
- Logs: https://[your-project-id].supabase.co/functions/v1/feature-logs
- Notifications: https://[your-project-id].supabase.co/functions/v1/feature-notifications

Database tables:
- feature_access_logs
- feature_upgrade_notifications
```

### Key Files

- `dashboard.html` - Updated with feature access
- `FEATURE_ACCESS_MATRIX.js` - Feature definitions
- `subscription-upgrade-modal-supabase.js` - Modal handler
- `supabase-edge-function-logs.ts` - Logging function code
- `supabase-edge-function-notifications.ts` - Email function code

---

## Troubleshooting

### Email not working?
- Verify API key: `supabase secrets list`
- Check email is verified in Resend/SendGrid
- View logs: `supabase functions logs feature-notifications`

### Logs not saving?
- Check tables exist: `SELECT * FROM feature_access_logs;`
- View logs: `supabase functions logs feature-logs`

### Can't find Project ID?
- Supabase Dashboard → Top left corner
- Or check your URL: `app.supabase.com/project/[ID]`

### Chat button still works for non-Advanced?
- Clear browser cache (Ctrl+Shift+Delete)
- Log out and back in
- Hard refresh (Ctrl+Shift+R)

---

## Next: Admin Dashboard (Optional)

Later, you can create an admin page to view:
- Access logs with filters
- Statistics by feature/tier
- Email notification history
- Conversion metrics

For now, you can query directly in Supabase SQL:

```sql
-- Most tried features
SELECT feature, COUNT(*) as attempts 
FROM feature_access_logs 
GROUP BY feature 
ORDER BY attempts DESC;

-- Email open rate
SELECT sent, COUNT(*) 
FROM feature_upgrade_notifications 
GROUP BY sent;
```

---

## Support

For detailed information:
- Full setup: `SUPABASE_EDGE_FUNCTIONS_SETUP.md`
- Quick start: `QUICK_START_SUPABASE_EDGE_FUNCTIONS.md`
- Technical: `SUPABASE_EDGE_FUNCTIONS_IMPLEMENTATION_SUMMARY.md`

---

## That's It! 🎉

You've successfully implemented:
- Subscription-based feature access
- Automatic upgrade prompts
- Complete audit logging
- Professional email notifications

**Total time**: ~20 minutes
**Cost**: Free (or minimal)
**Ready**: Immediately

Good luck! 🚀
