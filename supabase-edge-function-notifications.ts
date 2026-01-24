/**
 * Supabase Edge Function: Feature Upgrade Notifications
 * 
 * Deploy to: functions/feature-notifications/index.ts
 * 
 * Environment variables needed:
 * - RESEND_API_KEY (recommended for emails)
 * - SENDGRID_API_KEY (alternative)
 * - SUPPORT_EMAIL (e.g., support@healthflow.com)
 * 
 * Usage:
 * POST https://[project].supabase.co/functions/v1/feature-notifications
 * Headers: Authorization: Bearer [token], X-User-ID: userId
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') || 'support@healthflow.com'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'notifications@healthflow.com'

/**
 * Feature information
 */
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

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
}

/**
 * Build email HTML template
 */
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
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .feature-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #15696B; }
        .feature-box h3 { margin: 0 0 10px 0; color: #15696B; }
        .feature-box p { margin: 0; color: #666; }
        .benefits { background: #e8f5e9; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .benefits h4 { margin: 0 0 10px 0; color: #2e7d32; }
        .benefits ul { margin: 0; padding-left: 20px; }
        .benefits li { margin: 5px 0; color: #2e7d32; }
        .tier-info { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: white; border-radius: 6px; }
        .tier-item { flex: 1; text-align: center; }
        .tier-item .label { font-size: 12px; color: #999; text-transform: uppercase; }
        .tier-item .value { font-size: 16px; font-weight: bold; color: #15696B; margin-top: 5px; }
        .tier-item.required .value { color: #DC3545; }
        .cta-button { display: inline-block; background: #15696B; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .support-link { color: #15696B; text-decoration: none; }
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
          
          <p>We noticed you tried to access <strong>${feature}</strong>, an amazing feature that's available in our Advanced subscription plan.</p>
          
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
          
          <a href="${Deno.env.get('UPGRADE_URL') || 'https://app.healthflow.com/upgrade'}" class="cta-button">Upgrade to Advanced Now</a>
          
          <p>Questions? <a href="mailto:${SUPPORT_EMAIL}" class="support-link">Contact our support team</a></p>
          
          <p>Best regards,<br>HealthFlow Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent because you attempted to access a premium feature. You can manage your preferences in your account settings.</p>
          <p>&copy; ${new Date().getFullYear()} HealthFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send email via Resend
 */
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

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(to: string, subject: string, html: string): Promise<string> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: FROM_EMAIL },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
      reply_to: { email: SUPPORT_EMAIL },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${error}`)
  }

  // SendGrid doesn't return message ID in the same way
  return `sendgrid-${Date.now()}`
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user ID from header
    const userId = req.headers.get('X-User-ID')
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing X-User-ID header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /feature-notifications - Send email
    if (req.method === 'POST') {
      const body = await req.json()
      
      const {
        email,
        facilityName,
        feature,
        currentTier,
        timestamp
      } = body

      // Validate required fields
      if (!email || !feature || !currentTier) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, feature, currentTier' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if email service is configured
      if (!RESEND_API_KEY && !SENDGRID_API_KEY) {
        console.warn('No email service configured (RESEND_API_KEY or SENDGRID_API_KEY)')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Email service not configured',
            stored: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get feature info
      const featureInfo = FEATURE_INFO[feature] || {
        name: feature.replace('_', ' '),
        description: 'Premium Feature',
        benefits: []
      }

      // Store notification record
      const { data: notifData, error: notifError } = await supabase
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

      if (notifError) {
        console.warn('Could not store notification:', notifError)
      }

      // Build email content
      const emailSubject = `Upgrade to Advanced Plan to Access ${featureInfo.name}`
      const emailHtml = buildEmailTemplate({
        feature: featureInfo.name,
        description: featureInfo.description,
        currentTier: currentTier,
        facilityName: facilityName,
        benefits: featureInfo.benefits
      })

      // Send email
      let messageId = null
      let sendError = null

      try {
        if (RESEND_API_KEY) {
          messageId = await sendViaResend(email, emailSubject, emailHtml)
        } else if (SENDGRID_API_KEY) {
          messageId = await sendViaSendGrid(email, emailSubject, emailHtml)
        }

        // Update notification as sent
        if (notifData && notifData.length > 0) {
          await supabase
            .from('feature_upgrade_notifications')
            .update({ sent: true, sent_at: new Date().toISOString(), message_id: messageId })
            .eq('id', notifData[0].id)
        }

      } catch (error) {
        console.error('Email send error:', error)
        sendError = error.message
        
        // Still return success if we stored the notification
        if (notifData && notifData.length > 0) {
          return new Response(
            JSON.stringify({
              success: true,
              stored: true,
              message: `Notification stored (email send failed: ${sendError})`,
              messageId: null
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
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

    // GET /feature-notifications - Retrieve notifications
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const feature = url.searchParams.get('feature')
      const status = url.searchParams.get('status')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000)
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
        .from('feature_upgrade_notifications')
        .select('*', { count: 'exact' })

      if (feature) query = query.eq('feature', feature)
      if (status === 'sent') query = query.eq('sent', true)
      if (status === 'unsent') query = query.eq('sent', false)

      const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve notifications', details: error.message }),
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
