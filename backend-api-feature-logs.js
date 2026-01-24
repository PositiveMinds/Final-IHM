/**
 * Feature Access Logging API
 * Endpoints for storing and managing feature access logs
 * 
 * Usage: POST /api/logs/feature-access
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Middleware to validate request headers
 */
const validateRequest = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Missing X-User-ID header' });
    }
    req.userId = userId;
    next();
};

/**
 * POST /api/logs/feature-access
 * Store feature access attempt in database
 * 
 * Request body:
 * {
 *     feature: "chat.system",
 *     subscriptionType: "starter",
 *     status: "blocked", // "allowed", "blocked", "upgrade_initiated"
 *     userAgent: "Mozilla/5.0...",
 *     ipAddress: "192.168.1.1" (optional, determined by server if not provided)
 * }
 * 
 * Response: { success: true, logId: "...", message: "..." }
 */
router.post('/feature-access', validateRequest, async (req, res) => {
    try {
        const {
            feature,
            subscriptionType,
            status,
            userAgent = '',
            ipAddress = null
        } = req.body;

        // Validate required fields
        if (!feature || !subscriptionType || !status) {
            return res.status(400).json({
                error: 'Missing required fields: feature, subscriptionType, status'
            });
        }

        // Get actual IP address from request
        const actualIpAddress = ipAddress || 
            req.ip || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            'unknown';

        // Get user info from session
        let userEmail = null;
        let facilityName = null;
        
        if (req.userId !== 'anonymous') {
            try {
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('email, facility_name')
                    .eq('uid', req.userId)
                    .single();

                if (user && !userError) {
                    userEmail = user.email;
                    facilityName = user.facility_name;
                }
            } catch (error) {
                console.warn('Could not fetch user info:', error);
            }
        }

        // Insert log into database
        const { data, error } = await supabase
            .from('feature_access_logs')
            .insert({
                user_id: req.userId,
                user_email: userEmail,
                facility_name: facilityName,
                feature: feature,
                subscription_type: subscriptionType,
                status: status, // 'allowed', 'blocked', 'upgrade_initiated'
                user_agent: userAgent.substring(0, 500), // Cap at 500 chars
                ip_address: actualIpAddress,
                timestamp: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                error: 'Failed to store log',
                details: error.message
            });
        }

        // Return success with log ID
        res.status(200).json({
            success: true,
            logId: data && data.length > 0 ? data[0].id : null,
            message: `Feature access logged: ${feature} (${status})`
        });

    } catch (error) {
        console.error('Error logging feature access:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

/**
 * GET /api/logs/feature-access
 * Retrieve feature access logs (admin only)
 * Query params:
 *   - feature: filter by feature name
 *   - status: filter by status (blocked, allowed, upgrade_initiated)
 *   - subscription: filter by subscription type
 *   - limit: number of records (default 100, max 1000)
 *   - offset: pagination offset (default 0)
 */
router.get('/feature-access', validateRequest, async (req, res) => {
    try {
        const {
            feature,
            status,
            subscription,
            limit = 100,
            offset = 0
        } = req.query;

        // Build query
        let query = supabase
            .from('feature_access_logs')
            .select('*', { count: 'exact' });

        // Apply filters
        if (feature) {
            query = query.eq('feature', feature);
        }
        if (status) {
            query = query.eq('status', status);
        }
        if (subscription) {
            query = query.eq('subscription_type', subscription);
        }

        // Apply pagination
        const limitNum = Math.min(parseInt(limit) || 100, 1000);
        const offsetNum = parseInt(offset) || 0;

        query = query
            .order('timestamp', { ascending: false })
            .range(offsetNum, offsetNum + limitNum - 1);

        const { data, error, count } = await query;

        if (error) {
            return res.status(500).json({
                error: 'Failed to retrieve logs',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            data: data,
            pagination: {
                limit: limitNum,
                offset: offsetNum,
                total: count
            }
        });

    } catch (error) {
        console.error('Error retrieving logs:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

/**
 * GET /api/logs/feature-access/stats
 * Get statistics about feature access
 * Query params:
 *   - days: number of days to look back (default 7)
 *   - groupBy: group by 'feature', 'subscription', or 'status' (default 'feature')
 */
router.get('/feature-access/stats', validateRequest, async (req, res) => {
    try {
        const { days = 7, groupBy = 'feature' } = req.query;
        const daysNum = parseInt(days) || 7;

        // Calculate date range
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysNum);

        // Query logs for the date range
        const { data, error } = await supabase
            .from('feature_access_logs')
            .select('feature, subscription_type, status')
            .gte('timestamp', fromDate.toISOString());

        if (error) {
            return res.status(500).json({
                error: 'Failed to retrieve stats',
                details: error.message
            });
        }

        // Process data based on groupBy parameter
        let stats = {};

        if (groupBy === 'feature') {
            stats = data.reduce((acc, log) => {
                if (!acc[log.feature]) {
                    acc[log.feature] = { total: 0, allowed: 0, blocked: 0, upgrade_initiated: 0 };
                }
                acc[log.feature].total++;
                acc[log.feature][log.status]++;
                return acc;
            }, {});
        } else if (groupBy === 'subscription') {
            stats = data.reduce((acc, log) => {
                if (!acc[log.subscription_type]) {
                    acc[log.subscription_type] = { total: 0, allowed: 0, blocked: 0, upgrade_initiated: 0 };
                }
                acc[log.subscription_type].total++;
                acc[log.subscription_type][log.status]++;
                return acc;
            }, {});
        } else if (groupBy === 'status') {
            stats = data.reduce((acc, log) => {
                if (!acc[log.status]) {
                    acc[log.status] = 0;
                }
                acc[log.status]++;
                return acc;
            }, {});
        }

        res.status(200).json({
            success: true,
            period: { days: daysNum, from: fromDate.toISOString() },
            groupedBy: groupBy,
            stats: stats
        });

    } catch (error) {
        console.error('Error generating stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

/**
 * DELETE /api/logs/feature-access/:id
 * Delete a specific log entry (admin only)
 */
router.delete('/feature-access/:id', validateRequest, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('feature_access_logs')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({
                error: 'Failed to delete log',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Log ${id} deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

/**
 * DELETE /api/logs/feature-access/older-than/:days
 * Delete logs older than specified days (admin only)
 */
router.delete('/feature-access/older-than/:days', validateRequest, async (req, res) => {
    try {
        const { days } = req.params;
        const daysNum = parseInt(days) || 30;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysNum);

        const { count, error } = await supabase
            .from('feature_access_logs')
            .delete()
            .lt('timestamp', cutoffDate.toISOString());

        if (error) {
            return res.status(500).json({
                error: 'Failed to delete old logs',
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: `Deleted logs older than ${daysNum} days`,
            deletedCount: count
        });

    } catch (error) {
        console.error('Error deleting old logs:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;
