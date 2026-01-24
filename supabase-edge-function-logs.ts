/**
 * Supabase Edge Function: Feature Access Logs
 * 
 * Deploy to: functions/feature-logs/index.ts
 * 
 * Usage:
 * POST https://[project].supabase.co/functions/v1/feature-logs
 * Headers: Authorization: Bearer [token]
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * CORS headers
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
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

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const method = req.method

    // POST /feature-logs - Store access log
    if (method === 'POST' && path === 'feature-logs') {
      const body = await req.json()
      
      const {
        feature,
        subscriptionType,
        status,
        userAgent = '',
        ipAddress = null
      } = body

      // Validate required fields
      if (!feature || !subscriptionType || !status) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: feature, subscriptionType, status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user info
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

      // Get client IP
      const clientIp = req.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
                       req.headers.get('CF-Connecting-IP') ||
                       ipAddress ||
                       'unknown'

      // Insert log
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

    // GET /feature-logs - Retrieve logs (with filters)
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
          pagination: {
            limit,
            offset,
            total: count
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /feature-logs/stats - Get statistics
    if (method === 'GET' && path === 'stats') {
      const days = parseInt(url.searchParams.get('days') || '7')
      const groupBy = url.searchParams.get('groupBy') || 'feature'

      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)

      const { data, error } = await supabase
        .from('feature_access_logs')
        .select('feature, subscription_type, status')
        .gte('timestamp', fromDate.toISOString())

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve stats', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Process stats
      let stats = {}

      if (groupBy === 'feature') {
        stats = data.reduce((acc, log) => {
          if (!acc[log.feature]) {
            acc[log.feature] = { total: 0, allowed: 0, blocked: 0, upgrade_initiated: 0 }
          }
          acc[log.feature].total++
          acc[log.feature][log.status]++
          return acc
        }, {})
      } else if (groupBy === 'subscription') {
        stats = data.reduce((acc, log) => {
          if (!acc[log.subscription_type]) {
            acc[log.subscription_type] = { total: 0, allowed: 0, blocked: 0, upgrade_initiated: 0 }
          }
          acc[log.subscription_type].total++
          acc[log.subscription_type][log.status]++
          return acc
        }, {})
      }

      return new Response(
        JSON.stringify({
          success: true,
          period: { days, from: fromDate.toISOString() },
          groupedBy: groupBy,
          stats: stats
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /feature-logs/:id - Delete log
    if (method === 'DELETE' && path.match(/^\d+$/)) {
      const id = parseInt(path)

      const { error } = await supabase
        .from('feature_access_logs')
        .delete()
        .eq('id', id)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to delete log', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Log ${id} deleted successfully`
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
