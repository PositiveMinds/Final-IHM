# Quick Start: Supabase Edge Functions

## 5-Minute Setup

### Step 1: Create Database Tables (1 min)

Go to Supabase SQL Editor and run:

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

### Step 2: Setup Email Service (1 min)

Choose one:

**Option A: Resend (Easier)**
- Go to [resend.com](https://resend.com) → Sign up (free)
- Get API key from Settings
- Copy your project ID

**Option B: SendGrid**
- Go to [sendgrid.com](https://sendgrid.com) → Sign up (free)
- Create API key
- Copy your project ID

### Step 3: Deploy Edge Functions (2 min)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Go to your project
cd e:/IHM

# Initialize (if needed)
supabase init

# Create functions
supabase functions new feature-logs --typescript
supabase functions new feature-notifications --typescript
```

Replace the generated files with:
- `supabase/functions/feature-logs/index.ts` ← Copy from `supabase-edge-function-logs.ts`
- `supabase/functions/feature-notifications/index.ts` ← Copy from `supabase-edge-function-notifications.ts`

### Step 4: Set Environment Variables (1 min)

```bash
# Set email API key
supabase secrets set RESEND_API_KEY=re_abc123... 
# OR
supabase secrets set SENDGRID_API_KEY=SG.abc123...

# Set support email
supabase secrets set SUPPORT_EMAIL=support@yourdomain.com
supabase secrets set FROM_EMAIL=notifications@yourdomain.com

# Set upgrade URL
supabase secrets set UPGRADE_URL=https://yourapp.com/upgrade
```

### Step 5: Deploy (1 min)

```bash
supabase functions deploy
```

Get your function URLs from Supabase Dashboard → Edge Functions:
- `https://[project-id].supabase.co/functions/v1/feature-logs`
- `https://[project-id].supabase.co/functions/v1/feature-notifications`

## Integration with Dashboard

### Update dashboard.html

Replace:
```html
<script src="subscription-upgrade-modal.js"></script>
```

With:
```html
<script src="FEATURE_ACCESS_MATRIX.js"></script>
<script src="subscription-upgrade-modal-supabase.js"></script>

<script>
  // Configure Supabase after login
  document.addEventListener('DOMContentLoaded', function() {
    configureSupabaseEdgeFunctions('your-project-id');
  });
</script>
```

Replace `your-project-id` with your actual Supabase project ID.

## Test It Works

### Test Logging
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/feature-logs \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "feature": "chat.system",
    "subscriptionType": "starter",
    "status": "blocked",
    "userAgent": "Test"
  }'
```

Should return:
```json
{ "success": true, "logId": 1, "message": "Feature access logged..." }
```

### Test Email
```bash
curl -X POST https://[project-id].supabase.co/functions/v1/feature-notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "email": "test@example.com",
    "facilityName": "Kitwe HCIV",
    "feature": "chat.system",
    "currentTier": "starter"
  }'
```

Should return:
```json
{ "success": true, "messageId": "...", "message": "Email notification sent..." }
```

## Verify in Supabase

Check data in tables:

```sql
-- View logs
SELECT * FROM feature_access_logs ORDER BY timestamp DESC LIMIT 10;

-- View notifications
SELECT * FROM feature_upgrade_notifications ORDER BY timestamp DESC LIMIT 10;
```

## Done! ✓

Your feature access system is now live:
- ✓ Chat/Chatbot restricted to Advanced subscriptions
- ✓ Access attempts logged to database
- ✓ Users get upgrade email prompts
- ✓ Admin can view analytics

## What Happens When User Clicks Chat Button

1. **Client checks subscription** → shows modal if not Advanced
2. **Modal shows** → displays upgrade prompt
3. **Log stored** → sent to `feature-logs` endpoint
4. **Email sent** → via `feature-notifications` endpoint
5. **History tracked** → viewable in database

## File Structure

```
dashboard.html (updated with config)
├── FEATURE_ACCESS_MATRIX.js (already added)
├── subscription-upgrade-modal-supabase.js (new)
└── (chat/chatbot buttons check subscription)

Supabase Project
├── Database
│   ├── feature_access_logs (table)
│   └── feature_upgrade_notifications (table)
└── Edge Functions
    ├── feature-logs (stores access logs)
    └── feature-notifications (sends emails)

Email Service
├── Resend or SendGrid API
└── HTML email templates
```

## Next Steps

1. ✓ Deploy Edge Functions
2. ✓ Update dashboard.html with project ID
3. ✓ Test with curl commands
4. ✓ Try clicking Chat button as non-Advanced user
5. ✓ Check email received
6. ✓ View logs in database

## Troubleshooting

**Functions not deploying?**
```bash
# Check CLI login
supabase projects list

# Check function code
supabase functions list
```

**Emails not sending?**
- Check email service is configured
- Verify API key is correct
- Check FROM_EMAIL is verified in email service

**Logs not saving?**
- Check tables exist: `SELECT * FROM feature_access_logs;`
- Verify X-User-ID header is sent
- Check function logs: `supabase functions logs feature-logs`

## Get Your Project ID

In Supabase Dashboard:
- Settings → General → Project ID (copy this)
- Or from URL: `app.supabase.com/project/[project-id]`

Use it here:
```javascript
configureSupabaseEdgeFunctions('your-project-id');
```

That's it! You're done. 🎉
