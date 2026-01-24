# Supabase Edge Functions Implementation Summary

## Overview
Complete serverless backend for feature access logging and email notifications using Supabase Edge Functions.

## Files Created

### 1. **supabase-edge-function-logs.ts**
Serverless function for logging feature access attempts
- **Location**: `functions/feature-logs/index.ts`
- **POST /feature-logs** - Store access log
- **GET /feature-logs** - Retrieve logs with filters
- **GET /feature-logs/stats** - Get access statistics
- **DELETE /feature-logs/:id** - Delete specific log

### 2. **supabase-edge-function-notifications.ts**
Serverless function for sending upgrade notification emails
- **Location**: `functions/feature-notifications/index.ts`
- **POST /feature-notifications** - Send upgrade email
- **GET /feature-notifications** - Retrieve notification history
- Integrates with Resend or SendGrid
- Beautiful HTML email templates

### 3. **subscription-upgrade-modal-supabase.js**
Updated frontend integration for Supabase Edge Functions
- Replaces the old `subscription-upgrade-modal.js`
- Sends logs to Supabase Edge Function instead of generic API
- Automatic fallback to localStorage if network fails
- Throttles email notifications (1 per feature per 5 minutes)

### 4. **SUPABASE_EDGE_FUNCTIONS_SETUP.md**
Complete step-by-step setup guide
- Database table creation
- CLI installation and authentication
- Function deployment
- Environment variable configuration
- API endpoint documentation
- Testing and troubleshooting

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  dashboard.html + subscription-upgrade-modal-supabase.js    │
│                                                              │
│  When user clicks restricted feature:                       │
│    1. SubscriptionUpgradeModal.showAccessDenied()           │
│    2. FeatureAccessLogger.logAccessAttempt()                │
│    3. EmailNotificationService.notifyAccessAttempt()        │
└────────────┬────────────────────────────────────────────────┘
             │ POST JSON
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
├─────────────────────────────────────────────────────────────┤
│  POST /functions/v1/feature-logs                            │
│    ├─ Validate X-User-ID header                            │
│    ├─ Get user info from users table                        │
│    ├─ Insert log into feature_access_logs table             │
│    └─ Return logId                                          │
│                                                              │
│  POST /functions/v1/feature-notifications                   │
│    ├─ Validate required fields                             │
│    ├─ Store notification record                             │
│    ├─ Send email via Resend/SendGrid                        │
│    ├─ Update notification as sent                           │
│    └─ Return messageId                                      │
└────────────┬────────────────────────────────────────────────┘
             │ SQL INSERT/UPDATE
             ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase PostgreSQL Database                        │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│  - feature_access_logs                                      │
│    (user_id, feature, status, timestamp, etc)               │
│                                                              │
│  - feature_upgrade_notifications                            │
│    (user_email, feature, current_tier, sent, etc)           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Create Database Tables
```sql
-- See SUPABASE_EDGE_FUNCTIONS_SETUP.md for full SQL
CREATE TABLE feature_access_logs (...);
CREATE TABLE feature_upgrade_notifications (...);
```

### 2. Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 3. Create Edge Functions
```bash
supabase functions new feature-logs --typescript
supabase functions new feature-notifications --typescript
```

### 4. Copy Code
- Copy `supabase-edge-function-logs.ts` → `supabase/functions/feature-logs/index.ts`
- Copy `supabase-edge-function-notifications.ts` → `supabase/functions/feature-notifications/index.ts`

### 5. Set Environment Variables
```bash
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set SUPPORT_EMAIL=support@yourdomain.com
supabase secrets set FROM_EMAIL=notifications@yourdomain.com
```

### 6. Deploy
```bash
supabase functions deploy
```

### 7. Update Frontend
Replace `subscription-upgrade-modal.js` with `subscription-upgrade-modal-supabase.js` in dashboard.html

Add configuration in dashboard.html:
```javascript
// After page load, set your Supabase project ID
configureSupabaseEdgeFunctions('your-project-id');
```

## API Endpoints

### Feature Access Logs

#### Store Log
```
POST https://[project-id].supabase.co/functions/v1/feature-logs
Headers: X-User-ID: user123
Body: {
  feature: "chat.system",
  subscriptionType: "starter",
  status: "blocked",
  userAgent: "Mozilla/5.0..."
}
Response: { success: true, logId: 123, message: "..." }
```

#### Get Logs
```
GET https://[project-id].supabase.co/functions/v1/feature-logs
  ?feature=chat.system
  ?status=blocked
  ?limit=50
  ?offset=0
Headers: X-User-ID: user123
Response: { success: true, data: [...], pagination: {...} }
```

#### Get Stats
```
GET https://[project-id].supabase.co/functions/v1/feature-logs/stats
  ?days=7
  ?groupBy=feature
Headers: X-User-ID: user123
Response: { success: true, stats: {...} }
```

### Feature Upgrade Notifications

#### Send Email
```
POST https://[project-id].supabase.co/functions/v1/feature-notifications
Headers: X-User-ID: user123
Body: {
  email: "user@example.com",
  facilityName: "Kitwe HCIV",
  feature: "chat.system",
  currentTier: "starter",
  timestamp: "2024-01-24T10:30:00.000Z"
}
Response: { success: true, messageId: "...", message: "..." }
```

#### Get Notifications
```
GET https://[project-id].supabase.co/functions/v1/feature-notifications
  ?feature=chat.system
  ?status=sent
  ?limit=50
Headers: X-User-ID: user123
Response: { success: true, data: [...], pagination: {...} }
```

## Database Schema

### feature_access_logs
```sql
id (BIGSERIAL PRIMARY KEY)
user_id (VARCHAR)
user_email (VARCHAR)
facility_name (VARCHAR)
feature (VARCHAR) - e.g., 'chat.system'
subscription_type (VARCHAR) - 'starter', 'Standard', 'Advanced'
status (VARCHAR) - 'allowed', 'blocked', 'upgrade_initiated'
user_agent (TEXT)
ip_address (VARCHAR)
timestamp (TIMESTAMP)
created_at (TIMESTAMP)

Indexes: user_id, feature, status, subscription_type, timestamp
```

### feature_upgrade_notifications
```sql
id (BIGSERIAL PRIMARY KEY)
user_id (VARCHAR)
user_email (VARCHAR)
facility_name (VARCHAR)
feature (VARCHAR)
current_tier (VARCHAR)
feature_name (VARCHAR)
timestamp (TIMESTAMP)
sent (BOOLEAN)
sent_at (TIMESTAMP)
message_id (VARCHAR)
created_at (TIMESTAMP)

Indexes: user_email, feature, sent, timestamp
```

## Features

### Feature Access Logging
✓ Log all feature access attempts
✓ Capture user info, facility, subscription tier
✓ Get detailed statistics by feature/tier/status
✓ Filter logs by date range
✓ Automatic IP address detection
✓ User agent tracking for analytics

### Email Notifications
✓ Send beautiful HTML emails
✓ Integrates with Resend or SendGrid
✓ Throttles notifications (1 per feature per 5 minutes)
✓ Store notification history
✓ Track email delivery
✓ Reply-to support email

### Frontend Integration
✓ Automatic fallback to localStorage if network fails
✓ Async logging (non-blocking)
✓ Throttled email notifications
✓ Easy configuration with project ID
✓ No external dependencies (uses native Fetch API)

## Email Service Comparison

### Resend (Recommended)
- **Pros**: Free tier, easy setup, great for transactional emails
- **Cons**: Limited free emails per day
- **Setup**: Get API key from [resend.com](https://resend.com)

### SendGrid
- **Pros**: Reliable, good free tier, lots of features
- **Cons**: More complex setup
- **Setup**: Get API key from [sendgrid.com](https://sendgrid.com)

## Monitoring & Debugging

### View Function Logs
```bash
supabase functions logs feature-logs --follow
supabase functions logs feature-notifications --follow
```

### Query Logs in Database
```sql
-- Recent access attempts
SELECT * FROM feature_access_logs 
ORDER BY timestamp DESC LIMIT 20;

-- Statistics by feature
SELECT feature, status, COUNT(*) 
FROM feature_access_logs 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY feature, status;

-- Unsent notifications
SELECT * FROM feature_upgrade_notifications 
WHERE sent = false 
ORDER BY timestamp DESC;
```

### Test Locally
```bash
# Start local Supabase
supabase start

# Test logging
curl -X POST http://localhost:54321/functions/v1/feature-logs \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"feature":"chat.system","subscriptionType":"starter","status":"blocked"}'

# Test notifications
curl -X POST http://localhost:54321/functions/v1/feature-notifications \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user" \
  -d '{"email":"test@example.com","facilityName":"Test","feature":"chat.system","currentTier":"starter"}'
```

## Security Considerations

✓ **X-User-ID Header**: All endpoints require user ID
✓ **Row Level Security**: Database uses RLS policies
✓ **CORS Configured**: Proper headers for browser requests
✓ **Rate Limiting**: Consider adding middleware for production
✓ **Input Validation**: All endpoints validate required fields
✓ **Email Validation**: Email addresses checked before sending

## Production Deployment Checklist

- [ ] Create database tables
- [ ] Set up email service (Resend/SendGrid)
- [ ] Deploy Edge Functions
- [ ] Configure environment variables
- [ ] Update frontend with correct project ID
- [ ] Test email sending
- [ ] Monitor logs for errors
- [ ] Set up email domain verification
- [ ] Configure custom email from address
- [ ] Add rate limiting (optional but recommended)
- [ ] Set up alerts for failed sends
- [ ] Regular backups of log data

## Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` or `SENDGRID_API_KEY` is set
2. Verify sender email is verified in email service
3. Check function logs: `supabase functions logs feature-notifications`
4. Ensure `SUPPORT_EMAIL` is valid

### Logs not storing
1. Verify tables exist: `SELECT * FROM feature_access_logs;`
2. Check `X-User-ID` header is being sent
3. Review function logs
4. Verify RLS policies allow inserts

### Function timeouts
1. Default timeout is 10 seconds
2. Email services might be slow
3. Check network connectivity
4. Review function logs for slow queries

### CORS errors
1. Edge functions have CORS headers configured
2. Check browser console for specific error
3. Verify Authorization header format

## Performance Notes

- Logging is async and non-blocking
- Emails sent asynchronously
- Database indexes created for fast queries
- Email notifications throttled (5 min per feature)
- Local fallback prevents data loss on network failure
- Local logs kept to 100 entries to prevent bloat

## Future Enhancements

- Add analytics dashboard
- Implement rate limiting
- Add webhook integrations
- SMS notifications for high-priority
- Subscription tier details in emails
- Automated upgrade reminders
- Usage tracking and quotas
- A/B testing upgrade flows

## Support

For issues:
1. Check function logs: `supabase functions logs`
2. Review database records
3. Test endpoints with curl
4. Check email service status
5. Review browser console for errors
