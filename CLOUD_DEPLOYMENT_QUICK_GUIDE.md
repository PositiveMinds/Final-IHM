# Cloud Deployment Quick Guide (Dashboard Only)

## No CLI - Everything Through Dashboard

**Total time: 20 minutes**

---

## 1. Database Tables (Copy-Paste)

**Supabase Dashboard → SQL Editor → New Query**

Paste all this:

<details>
<summary>Click to expand SQL</summary>

```sql
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

</details>

**Click Run** ✓

---

## 2. Email Service (Choose One)

### Resend
- Go to https://resend.com
- Sign up
- Copy your API key

### SendGrid
- Go to https://sendgrid.com
- Sign up
- Create API key

**Keep the key ready!**

---

## 3. Create Edge Functions

### Function 1: feature-logs

**Dashboard → Edge Functions → Create a new function**

- Name: `feature-logs`
- Runtime: `TypeScript`
- Click Create

Copy-paste all code from: **`supabase-edge-function-logs.ts`**

Click **Deploy** ✓

### Function 2: feature-notifications

**Dashboard → Edge Functions → Create a new function**

- Name: `feature-notifications`
- Runtime: `TypeScript`
- Click Create

Copy-paste all code from: **`supabase-edge-function-notifications.ts`**

Click **Deploy** ✓

---

## 4. Set Environment Variables

**Dashboard → Edge Functions → feature-notifications**

Click the function, scroll to **Environment Variables**

Add these:
```
RESEND_API_KEY = your_api_key
SUPPORT_EMAIL = support@yourdomain.com
FROM_EMAIL = notifications@yourdomain.com
```

Or use `SENDGRID_API_KEY` instead of `RESEND_API_KEY`

Click **Save** ✓

---

## 5. Get Project ID

**Dashboard → Settings (gear icon) → General**

Copy the **Project ID** (looks like: `abc123def456`)

---

## 6. Update Dashboard Code

In `dashboard.html`, find:
```html
<script src="chat-system.js"></script>

<!-- FAB Button Script -->
```

Replace with:
```html
<script src="chat-system.js"></script>

<!-- Feature Access Matrix -->
<script src="FEATURE_ACCESS_MATRIX.js"></script>

<!-- Subscription Upgrade Modal -->
<script src="subscription-upgrade-modal-supabase.js"></script>

<script>
  configureSupabaseEdgeFunctions('your-project-id-here');
</script>

<!-- FAB Button Script -->
```

Replace `your-project-id-here` with your actual Project ID!

---

## 7. Test

1. Log in as **non-Advanced** user
2. Click **Chat button**
3. See upgrade modal
4. Check email
5. Check database:
   ```sql
   SELECT * FROM feature_access_logs ORDER BY timestamp DESC LIMIT 10;
   ```

---

## ✅ Done!

Everything is live and working!

---

## Your Function URLs

```
https://[project-id].supabase.co/functions/v1/feature-logs
https://[project-id].supabase.co/functions/v1/feature-notifications
```

Replace `[project-id]` with your actual Project ID

---

## Troubleshooting

**Functions not showing?**
- Refresh the page
- Check Edge Functions section

**Emails not sending?**
- Verify API key is correct
- Check email address in Resend/SendGrid

**Logs not showing?**
- Run: `SELECT * FROM feature_access_logs;`
- Check console for errors

---

**Time: ~20 minutes | Cost: Free | Ready: Immediately** ✨
