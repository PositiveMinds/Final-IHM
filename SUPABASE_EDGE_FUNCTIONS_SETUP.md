# Supabase Edge Functions Setup Guide

## Overview
Deploy serverless functions to Supabase to handle:
1. **Feature Access Logging** - Store all feature access attempts
2. **Email Notifications** - Send upgrade prompts to users

## Prerequisites
- Supabase project (already set up)
- Supabase CLI installed
- Email service (Resend or SendGrid)

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or use Homebrew:
```bash
brew install supabase/tap/supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

Follow the prompts to authenticate.

## Step 3: Create Database Tables

Run these SQL queries in your Supabase SQL editor:

### Create feature_access_logs table
```sql
CREATE TABLE feature_access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  facility_name VARCHAR(255),
  feature VARCHAR(100) NOT NULL,
  subscription_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'allowed', 'blocked', 'upgrade_initiated'
  user_agent TEXT,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_feature_access_logs_user_id ON feature_access_logs(user_id);
CREATE INDEX idx_feature_access_logs_feature ON feature_access_logs(feature);
CREATE INDEX idx_feature_access_logs_status ON feature_access_logs(status);
CREATE INDEX idx_feature_access_logs_timestamp ON feature_access_logs(timestamp);
CREATE INDEX idx_feature_access_logs_subscription ON feature_access_logs(subscription_type);

-- Enable RLS (Row Level Security)
ALTER TABLE feature_access_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view their own logs
CREATE POLICY "Users can view their own logs"
  ON feature_access_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

### Create feature_upgrade_notifications table
```sql
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

-- Create indexes
CREATE INDEX idx_notifications_email ON feature_upgrade_notifications(user_email);
CREATE INDEX idx_notifications_feature ON feature_upgrade_notifications(feature);
CREATE INDEX idx_notifications_sent ON feature_upgrade_notifications(sent);
CREATE INDEX idx_notifications_timestamp ON feature_upgrade_notifications(timestamp);

-- Enable RLS
ALTER TABLE feature_upgrade_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own notifications"
  ON feature_upgrade_notifications
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

## Step 4: Initialize Edge Functions Project

```bash
# Navigate to your project directory
cd e:/IHM

# Initialize Supabase project (if not done)
supabase init

# This creates a `supabase` folder with `functions` directory
```

## Step 5: Create Feature Logs Edge Function

```bash
# Create the function
supabase functions new feature-logs --typescript

# This creates: supabase/functions/feature-logs/index.ts
```

Copy the content from `supabase-edge-function-logs.ts` to `supabase/functions/feature-logs/index.ts`

## Step 6: Create Notifications Edge Function

```bash
# Create the function
supabase functions new feature-notifications --typescript

# This creates: supabase/functions/feature-notifications/index.ts
```

Copy the content from `supabase-edge-function-notifications.ts` to `supabase/functions/feature-notifications/index.ts`

## Step 7: Set Environment Variables

### Option A: Using Supabase Dashboard

1. Go to Project Settings → Edge Functions → Secrets
2. Add these environment variables:

```
RESEND_API_KEY=your_resend_api_key
SUPPORT_EMAIL=support@yourdomain.com
FROM_EMAIL=notifications@yourdomain.com
UPGRADE_URL=https://yourapp.com/upgrade
```

### Option B: Using CLI

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set SUPPORT_EMAIL=support@yourdomain.com
supabase secrets set FROM_EMAIL=notifications@yourdomain.com
supabase secrets set UPGRADE_URL=https://yourapp.com/upgrade
```

## Step 8: Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy feature-logs
supabase functions deploy feature-notifications
```

## Step 9: Get Your Function URLs

After deployment, your functions will be available at:

```
POST https://[project-id].supabase.co/functions/v1/feature-logs
POST https://[project-id].supabase.co/functions/v1/feature-notifications
```

Replace `[project-id]` with your actual Supabase project ID.

## Step 10: Update Frontend to Use Edge Functions

Update `subscription-upgrade-modal.js` to use the correct endpoint:

```javascript
const SUPABASE_PROJECT_ID = 'your-project-id'; // Replace with your ID

// In FeatureAccessLogger.logAccessAttempt():
const response = await fetch(
  `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/feature-logs`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': session.id || 'anonymous',
      'Authorization': `Bearer ${session.token}`
    },
    body: JSON.stringify(logEntry)
  }
);

// In EmailNotificationService.notifyAccessAttempt():
const response = await fetch(
  `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/feature-notifications`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': session.id || 'anonymous',
      'Authorization': `Bearer ${session.token}`
    },
    body: JSON.stringify({
      email: session.email,
      facilityName: session.facilityName,
      feature: data.feature,
      currentTier: data.currentTier,
      timestamp: data.timestamp
    })
  }
);
```

## Email Service Setup

### Option 1: Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Add your domain
4. Get API key from settings
5. Set `RESEND_API_KEY` environment variable

### Option 2: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create free account
3. Create API key
4. Set `SENDGRID_API_KEY` environment variable

## Testing Functions Locally

```bash
# Start Supabase locally
supabase start

# The functions will be available at:
# http://localhost:54321/functions/v1/feature-logs
# http://localhost:54321/functions/v1/feature-notifications

# Test logging
curl -X POST http://localhost:54321/functions/v1/feature-logs \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "feature": "chat.system",
    "subscriptionType": "starter",
    "status": "blocked",
    "userAgent": "Mozilla/5.0..."
  }'

# Test notification
curl -X POST http://localhost:54321/functions/v1/feature-notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{
    "email": "user@example.com",
    "facilityName": "Kitwe HCIV",
    "feature": "chat.system",
    "currentTier": "starter",
    "timestamp": "2024-01-24T10:30:00.000Z"
  }'
```

## API Endpoints

### Feature Access Logs

#### POST /feature-logs
Store a feature access attempt

```bash
curl -X POST https://[project].supabase.co/functions/v1/feature-logs \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user123" \
  -d '{
    "feature": "chat.system",
    "subscriptionType": "starter",
    "status": "blocked",
    "userAgent": "Mozilla/5.0..."
  }'
```

Response:
```json
{
  "success": true,
  "logId": 123,
  "message": "Feature access logged: chat.system (blocked)"
}
```

#### GET /feature-logs
Retrieve logs with filters

```bash
curl https://[project].supabase.co/functions/v1/feature-logs \
  ?feature=chat.system \
  ?status=blocked \
  ?limit=50 \
  ?offset=0 \
  -H "X-User-ID: user123"
```

#### GET /feature-logs/stats
Get access statistics

```bash
curl https://[project].supabase.co/functions/v1/feature-logs/stats \
  ?days=7 \
  ?groupBy=feature \
  -H "X-User-ID: user123"
```

Response:
```json
{
  "success": true,
  "period": { "days": 7, "from": "2024-01-17..." },
  "groupedBy": "feature",
  "stats": {
    "chat.system": { "total": 45, "allowed": 10, "blocked": 35, "upgrade_initiated": 5 },
    "chatbot.ai": { "total": 30, "allowed": 8, "blocked": 20, "upgrade_initiated": 2 }
  }
}
```

### Feature Upgrade Notifications

#### POST /feature-notifications
Send upgrade notification email

```bash
curl -X POST https://[project].supabase.co/functions/v1/feature-notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user123" \
  -d '{
    "email": "user@example.com",
    "facilityName": "Kitwe HCIV",
    "feature": "chat.system",
    "currentTier": "starter",
    "timestamp": "2024-01-24T10:30:00.000Z"
  }'
```

Response:
```json
{
  "success": true,
  "messageId": "email-id-123",
  "message": "Email notification sent to user@example.com"
}
```

#### GET /feature-notifications
Retrieve notification history

```bash
curl https://[project].supabase.co/functions/v1/feature-notifications \
  ?feature=chat.system \
  ?status=sent \
  ?limit=50 \
  -H "X-User-ID: user123"
```

## Monitoring & Debugging

### View Function Logs

```bash
# View logs in real-time
supabase functions list

# View specific function logs
supabase functions logs feature-logs --follow
```

### Check Database Records

```sql
-- View recent access logs
SELECT * FROM feature_access_logs 
ORDER BY timestamp DESC 
LIMIT 10;

-- View email notifications sent
SELECT * FROM feature_upgrade_notifications 
WHERE sent = true 
ORDER BY sent_at DESC 
LIMIT 10;

-- Get statistics
SELECT 
  feature, 
  status, 
  COUNT(*) as count
FROM feature_access_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY feature, status;
```

## Troubleshooting

### Emails not sending
1. Check email service API key is set correctly
2. Verify sender email is verified in SendGrid/Resend
3. Check function logs: `supabase functions logs feature-notifications`

### Logs not storing
1. Verify database tables were created
2. Check X-User-ID header is being sent
3. Review RLS policies in database

### CORS errors
- Edge functions have CORS headers configured
- Check browser console for specific error

### Function timeouts
- Default timeout is 10 seconds
- For emails, timeout may be reached if service is slow
- Check email service status

## Security

✓ All endpoints require `X-User-ID` header
✓ CORS properly configured
✓ Database uses RLS (Row Level Security)
✓ Email addresses validated before sending
✓ Rate limiting recommended (add middleware)

## Next Steps

1. Test functions locally with `supabase start`
2. Deploy to production with `supabase functions deploy`
3. Monitor logs regularly
4. Set up email service domain verification
5. Add rate limiting to prevent abuse
6. Create admin dashboard to view logs and stats

## Reference Files

- `supabase-edge-function-logs.ts` - Logging function code
- `supabase-edge-function-notifications.ts` - Notification function code
- `subscription-upgrade-modal.js` - Frontend integration
- `FEATURE_ACCESS_MATRIX.js` - Feature definitions
