# Supabase Cloud Setup Guide (No CLI Required)

## Overview
Deploy Edge Functions directly through the Supabase Dashboard - no command line needed.

---

## Step 1: Create Database Tables (5 minutes)

**In Supabase Dashboard:**

1. Go to **SQL Editor**
2. Click **New Query**
3. Paste this entire SQL (all at once):

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

4. Click **Run**
5. You should see: ✓ All queries completed successfully

---

## Step 2: Set Up Email Service (2 minutes)

Choose **Resend** OR **SendGrid**:

### Resend (Easier)
1. Go to https://resend.com
2. Sign up (free)
3. Navigate to **API Keys**
4. Copy your API Key (starts with `re_`)
5. Save this key

### SendGrid
1. Go to https://sendgrid.com
2. Sign up (free)
3. Go to **Settings → API Keys**
4. Create API Key
5. Copy the key

---

## Step 3: Create Edge Function #1 - Logging (3 minutes)

**In Supabase Dashboard:**

1. Go to **Edge Functions** (left sidebar)
2. Click **Create a new function**
3. Name it: `feature-logs`
4. Runtime: **TypeScript**
5. Click **Create function**

You'll see a code editor. Delete all default code and paste this entire content:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userId = req.headers.get('X-User-ID')
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing X-User-ID header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const method = req.method

    // POST - Store access log
    if (method === 'POST' && path === 'feature-logs') {
      const body = await req.json()
      
      const {
        feature,
        subscriptionType,
        status,
        userAgent = '',
        ipAddress = null
      } = body

      if (!feature || !subscriptionType || !status) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: feature, subscriptionType, status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let userEmail = null
      let facilityName = null

      if (userId !== 'anonymous') {
        const { data: user } = await supabase
          .from('users')
          .select('email, facility_name')
          .eq('uid', userId)
          .single()

        if (user) {
          userEmail = user.email
          facilityName = user.facility_name
        }
      }

      const clientIp = req.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
                       req.headers.get('CF-Connecting-IP') ||
                       ipAddress ||
                       'unknown'

      const { data, error } = await supabase
        .from('feature_access_logs')
        .insert({
          user_id: userId,
          user_email: userEmail,
          facility_name: facilityName,
          feature: feature,
          subscription_type: subscriptionType,
          status: status,
          user_agent: userAgent.substring(0, 500),
          ip_address: clientIp,
          timestamp: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to store log', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          logId: data && data.length > 0 ? data[0].id : null,
          message: `Feature access logged: ${feature} (${status})`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET - Retrieve logs
    if (method === 'GET' && path === 'feature-logs') {
      const feature = url.searchParams.get('feature')
      const status = url.searchParams.get('status')
      const subscription = url.searchParams.get('subscription')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000)
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
        .from('feature_access_logs')
        .select('*', { count: 'exact' })

      if (feature) query = query.eq('feature', feature)
      if (status) query = query.eq('status', status)
      if (subscription) query = query.eq('subscription_type', subscription)

      const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve logs', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: data,
          pagination: { limit, offset, total: count }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

6. Click **Deploy**
7. Wait for "✓ Function deployed successfully"

---

## Step 4: Create Edge Function #2 - Notifications (3 minutes)

**In Supabase Dashboard:**

1. Go to **Edge Functions**
2. Click **Create a new function**
3. Name it: `feature-notifications`
4. Runtime: **TypeScript**
5. Click **Create function**

Delete default code and paste this entire content:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') || 'support@healthflow.com'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'notifications@healthflow.com'

const FEATURE_INFO = {
  'chat.system': {
    name: 'Chat System',
    description: 'Real-time messaging between team members',
    benefits: ['Team collaboration', 'Quick communication', 'Message history']
  },
  'chatbot.ai': {
    name: 'AI Chatbot',
    description: 'AI-powered assistant for healthcare automation',
    benefits: ['Automated responses', '24/7 support', 'Reduces workload']
  },
  'data.export': {
    name: 'Data Export',
    description: 'Export facility data to Excel/PDF formats',
    benefits: ['Data analysis', 'Report generation', 'Backup capabilities']
  },
  'data.backup': {
    name: 'Data Backup',
    description: 'Automatic and manual data backups',
    benefits: ['Data protection', 'Disaster recovery', 'Peace of mind']
  },
  'users.manage': {
    name: 'User Management',
    description: 'Create, edit, and manage user accounts',
    benefits: ['Access control', 'Team management', 'Security']
  },
  'reports.custom': {
    name: 'Custom Reports',
    description: 'Design custom report queries',
    benefits: ['Custom analytics', 'Business insights', 'Data-driven decisions']
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
}

function buildEmailTemplate(data: any): string {
  const { feature, description, currentTier, facilityName, benefits } = data

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #15696B 0%, #0F4449 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .feature-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #15696B; }
        .feature-box h3 { margin: 0 0 10px 0; color: #15696B; }
        .benefits { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .benefits h4 { margin: 0 0 10px 0; color: #2e7d32; }
        .benefits ul { margin: 0; padding-left: 20px; }
        .benefits li { margin: 5px 0; color: #2e7d32; }
        .tier-info { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: white; border-radius: 6px; }
        .tier-item { flex: 1; text-align: center; }
        .tier-item .label { font-size: 12px; color: #999; text-transform: uppercase; }
        .tier-item .value { font-size: 16px; font-weight: bold; color: #15696B; margin-top: 5px; }
        .tier-item.required .value { color: #DC3545; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⭐ Unlock Premium Features</h1>
          <p>Upgrade to Advanced plan and get instant access</p>
        </div>
        
        <div class="content">
          <p>Hi there,</p>
          <p>We noticed you tried to access <strong>${feature}</strong>, an amazing feature available in our Advanced subscription.</p>
          
          <div class="feature-box">
            <h3>${feature}</h3>
            <p>${description}</p>
          </div>
          
          <div class="benefits">
            <h4>✓ Benefits of ${feature}:</h4>
            <ul>
              ${benefits.map((b: string) => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          
          <div class="tier-info">
            <div class="tier-item">
              <div class="label">Your Current Plan</div>
              <div class="value">${currentTier}</div>
            </div>
            <div class="tier-item required">
              <div class="label">Required Plan</div>
              <div class="value">Advanced</div>
            </div>
          </div>
          
          <p><strong>Advanced Subscription Includes:</strong></p>
          <ul>
            <li>✓ Chat System with team collaboration</li>
            <li>✓ AI Chatbot powered by advanced AI</li>
            <li>✓ Data Export & Backup capabilities</li>
            <li>✓ User Management & Role Assignment</li>
            <li>✓ Custom Reports & Analytics</li>
            <li>✓ API Access & Integrations</li>
            <li>✓ Priority Support</li>
          </ul>
          
          ${facilityName ? `<p><strong>Facility:</strong> ${facilityName}</p>` : ''}
          
          <p>Questions? Contact us at ${SUPPORT_EMAIL}</p>
          <p>Best regards,<br>HealthFlow Team</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} HealthFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendViaResend(to: string, subject: string, html: string): Promise<string> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: html,
      reply_to: SUPPORT_EMAIL,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send email via Resend')
  }
  
  return data.id
}

async function sendViaSendGrid(to: string, subject: string, html: string): Promise<string> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], subject: subject }],
      from: { email: FROM_EMAIL },
      content: [{ type: 'text/html', value: html }],
      reply_to: { email: SUPPORT_EMAIL },
    }),
  })

  if (!response.ok) {
    throw new Error(`SendGrid error`)
  }

  return `sendgrid-${Date.now()}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const userId = req.headers.get('X-User-ID')
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing X-User-ID header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      const {
        email,
        facilityName,
        feature,
        currentTier,
        timestamp
      } = body

      if (!email || !feature || !currentTier) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, feature, currentTier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!RESEND_API_KEY && !SENDGRID_API_KEY) {
        console.warn('No email service configured')
        return new Response(
          JSON.stringify({ success: false, message: 'Email service not configured' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const featureInfo = FEATURE_INFO[feature] || {
        name: feature.replace('_', ' '),
        description: 'Premium Feature',
        benefits: []
      }

      const { data: notifData } = await supabase
        .from('feature_upgrade_notifications')
        .insert({
          user_id: userId,
          user_email: email,
          facility_name: facilityName,
          feature: feature,
          current_tier: currentTier,
          feature_name: featureInfo.name,
          timestamp: timestamp || new Date().toISOString(),
          sent: false
        })
        .select()

      const emailSubject = `Upgrade to Advanced Plan to Access ${featureInfo.name}`
      const emailHtml = buildEmailTemplate({
        feature: featureInfo.name,
        description: featureInfo.description,
        currentTier: currentTier,
        facilityName: facilityName,
        benefits: featureInfo.benefits
      })

      let messageId = null
      let sendError = null

      try {
        if (RESEND_API_KEY) {
          messageId = await sendViaResend(email, emailSubject, emailHtml)
        } else if (SENDGRID_API_KEY) {
          messageId = await sendViaSendGrid(email, emailSubject, emailHtml)
        }

        if (notifData && notifData.length > 0) {
          await supabase
            .from('feature_upgrade_notifications')
            .update({ sent: true, sent_at: new Date().toISOString(), message_id: messageId })
            .eq('id', notifData[0].id)
        }

      } catch (error) {
        console.error('Email send error:', error)
        sendError = error.message
      }

      return new Response(
        JSON.stringify({
          success: !sendError,
          messageId: messageId,
          message: `Email notification sent to ${email}`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

6. Click **Deploy**
7. Wait for "✓ Function deployed successfully"

---

## Step 5: Set Environment Variables (2 minutes)

**In Supabase Dashboard:**

1. Go to **Edge Functions** → Click **feature-logs**
2. Look for **Environment Variables** section
3. Add this variable (leave it empty, it's auto-set):
   - `SUPABASE_URL` (auto-populated)
   - `SUPABASE_SERVICE_ROLE_KEY` (auto-populated)

4. Go to **Edge Functions** → Click **feature-notifications**
5. Add these Environment Variables:
   - `RESEND_API_KEY` = your Resend key
   - OR `SENDGRID_API_KEY` = your SendGrid key
   - `SUPPORT_EMAIL` = support@yourdomain.com
   - `FROM_EMAIL` = notifications@yourdomain.com

6. Click **Save**

---

## Step 6: Get Your Function URLs (1 minute)

**In Supabase Dashboard:**

1. Go to **Edge Functions**
2. Click on **feature-logs** function
3. Copy the URL at the top - it looks like:
   ```
   https://[project-id].supabase.co/functions/v1/feature-logs
   ```

4. Do the same for **feature-notifications** function

**Save both URLs** - you'll need your `[project-id]` for the dashboard.

Your Project ID is in:
- Supabase Dashboard → Settings (gear icon) → General
- Or your URL: `app.supabase.com/project/[project-id]`

---

## Step 7: Update Dashboard (2 minutes)

**In your `dashboard.html`:**

Find:
```html
<script src="chat-system.js"></script>

<!-- FAB Button Script -->
```

Replace with:
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

## Step 8: Test Everything (5 minutes)

### Test 1: Check Functions Are Working

Go to Supabase Dashboard → Edge Functions

You should see both functions:
- ✓ feature-logs (Deployed)
- ✓ feature-notifications (Deployed)

### Test 2: Test in Browser

1. Log in as a **non-Advanced** user
2. Click the **Chat button** (💬)
3. You should see an **upgrade modal**
4. Check your **email** (spam folder too)
5. You should receive an upgrade notification email

### Test 3: Check Database

**In Supabase Dashboard → SQL Editor:**

```sql
SELECT * FROM feature_access_logs ORDER BY timestamp DESC LIMIT 5;
```

You should see entries with your access attempts.

```sql
SELECT * FROM feature_upgrade_notifications ORDER BY timestamp DESC LIMIT 5;
```

You should see entries with your notifications.

---

## ✅ You're Done!

Your system is now live:
- ✓ Chat restricted to Advanced users
- ✓ Upgrade modals show
- ✓ Emails send
- ✓ Logs are stored
- ✓ Everything works!

---

## Quick Reference

### Your Function URLs
```
Logging: https://[project-id].supabase.co/functions/v1/feature-logs
Notifications: https://[project-id].supabase.co/functions/v1/feature-notifications
```

### Your Project ID
Find it in Supabase Dashboard → Settings → General → Project ID

### Environment Variables Set
Go to Edge Functions → select function → Environment Variables

---

## Troubleshooting

### Functions show "Error" status?
- Click the function
- Check the **Logs** tab
- Look for error messages
- Fix the issue and redeploy

### Emails not sending?
- Verify API key is correct in Environment Variables
- Check email is verified in Resend/SendGrid
- View function logs for errors

### Logs not saving?
- Check `feature_access_logs` table exists
- Verify X-User-ID header is being sent
- Check function logs for database errors

---

**Total Setup Time: ~20 minutes**

**No CLI required - everything through the dashboard!**
