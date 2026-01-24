/**
 * Subscription Upgrade Modal Handler
 * Shows upgrade prompts for restricted premium features
 */

const SubscriptionUpgradeModal = {
    /**
     * Show upgrade modal for a restricted feature
     * @param {object} options - Configuration options
     * @param {string} options.feature - Feature name (e.g., 'chat.system')
     * @param {string} options.currentTier - Current subscription tier
     * @param {string} options.featureName - Feature display name
     * @param {string} options.featureDescription - Feature description
     * @param {string} options.icon - Feature icon/emoji
     */
    showUpgradePrompt: function(options) {
        const {
            feature,
            currentTier,
            featureName = 'Premium Feature',
            featureDescription = 'This feature is only available for Advanced subscriptions',
            icon = '⭐'
        } = options;

        // Log the access attempt
        FeatureAccessLogger.logAccessAttempt({
            feature: feature,
            subscriptionType: currentTier,
            status: 'blocked',
            userAgent: navigator.userAgent
        });

        const upgradeHTML = `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 20px;">${icon}</div>
                <h3 style="margin-bottom: 15px; color: #15696B;">${featureName}</h3>
                <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
                    ${featureDescription}
                </p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 13px; color: #666;">
                        <strong>Current Plan:</strong> ${currentTier || 'Starter'}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">
                        <strong>Required Plan:</strong> <span style="color: #15696B; font-weight: 600;">Advanced</span>
                    </p>
                </div>
                <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0; font-size: 13px; color: #2e7d32;">
                        ✓ Unlimited access to all premium features<br>
                        ✓ Priority support<br>
                        ✓ Advanced analytics and reporting
                    </p>
                </div>
            </div>
        `;

        Swal.fire({
            title: 'Upgrade Required',
            html: upgradeHTML,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Upgrade Now',
            cancelButtonText: 'Maybe Later',
            confirmButtonColor: '#15696B',
            cancelButtonColor: '#6C757D',
            didOpen: (modal) => {
                // Send email notification about access attempt
                EmailNotificationService.notifyAccessAttempt({
                    feature: featureName,
                    currentTier: currentTier,
                    timestamp: new Date().toISOString()
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Handle upgrade action
                SubscriptionUpgradeModal.handleUpgradeClick(feature);
            }
        });
    },

    /**
     * Handle upgrade button click
     * @param {string} feature - Feature name
     */
    handleUpgradeClick: function(feature) {
        // Log upgrade initiation
        FeatureAccessLogger.logAccessAttempt({
            feature: feature,
            status: 'upgrade_initiated',
            userAgent: navigator.userAgent
        });

        // In a real application, redirect to upgrade page or billing system
        // For now, show a message
        Swal.fire({
            title: 'Upgrade Your Plan',
            text: 'You will be redirected to our upgrade page. Contact support if you need assistance.',
            icon: 'info',
            confirmButtonColor: '#15696B'
        });
    },

    /**
     * Show modal for feature access denied
     * @param {string} feature - Feature name
     * @param {string} subscriptionType - Current subscription tier
     */
    showAccessDenied: function(feature, subscriptionType) {
        const featureInfo = FEATURE_DESCRIPTIONS[feature] || {
            name: feature.replace('_', ' '),
            description: 'This premium feature is not available in your plan',
            icon: '🔒'
        };

        this.showUpgradePrompt({
            feature: feature,
            currentTier: subscriptionType,
            featureName: featureInfo.name,
            featureDescription: featureInfo.description,
            icon: featureInfo.icon || '⭐'
        });
    }
};

/**
 * Feature Access Logger
 * Tracks all feature access attempts for audit purposes
 */
const FeatureAccessLogger = {
    /**
     * Log feature access attempt
     * @param {object} data - Log data
     */
    logAccessAttempt: async function(data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            feature: data.feature,
            subscriptionType: data.subscriptionType,
            status: data.status, // 'allowed', 'blocked', 'upgrade_initiated'
            userAgent: data.userAgent,
            ipAddress: 'client-side' // Client-side cannot determine actual IP
        };

        // Log to browser console
        console.log('[Feature Access Log]', logEntry);

        // Send to backend for persistent logging
        try {
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            const response = await fetch('/api/logs/feature-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': session.id || 'anonymous'
                },
                body: JSON.stringify(logEntry)
            }).catch(err => {
                console.warn('Could not send log to server:', err);
                // Store locally if server unavailable
                FeatureAccessLogger.storeLocalLog(logEntry);
            });

            if (response && !response.ok) {
                console.warn('Server returned error for log:', response.status);
                FeatureAccessLogger.storeLocalLog(logEntry);
            }
        } catch (error) {
            console.error('Error logging access attempt:', error);
            FeatureAccessLogger.storeLocalLog(logEntry);
        }
    },

    /**
     * Store log entry locally in IndexedDB or localStorage
     * @param {object} logEntry - Log entry to store
     */
    storeLocalLog: function(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('featureAccessLogs') || '[]');
            logs.push(logEntry);
            // Keep only last 100 logs to prevent storage overflow
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            localStorage.setItem('featureAccessLogs', JSON.stringify(logs));
        } catch (error) {
            console.error('Could not store local log:', error);
        }
    },

    /**
     * Get all local logs
     * @returns {array} - Array of log entries
     */
    getLocalLogs: function() {
        try {
            return JSON.parse(localStorage.getItem('featureAccessLogs') || '[]');
        } catch (error) {
            console.error('Could not retrieve local logs:', error);
            return [];
        }
    },

    /**
     * Clear local logs
     */
    clearLocalLogs: function() {
        try {
            localStorage.removeItem('featureAccessLogs');
        } catch (error) {
            console.error('Could not clear local logs:', error);
        }
    }
};

/**
 * Email Notification Service
 * Sends notifications when users try to access premium features
 */
const EmailNotificationService = {
    /**
     * Notify about access attempt
     * @param {object} data - Notification data
     */
    notifyAccessAttempt: async function(data) {
        try {
            const session = JSON.parse(localStorage.getItem('userSession') || '{}');
            
            // Only send email if we have user email
            if (!session.email) {
                console.warn('Cannot send notification: user email not found');
                return;
            }

            // Queue notification (implement debounce to avoid spam)
            if (!this.notificationQueue) {
                this.notificationQueue = {};
            }

            const key = `${session.email}_${data.feature}`;
            
            // Skip if we just sent a notification for this feature in the last 5 minutes
            if (this.notificationQueue[key]) {
                const timeDiff = Date.now() - this.notificationQueue[key];
                if (timeDiff < 5 * 60 * 1000) { // 5 minutes
                    console.log('Notification throttled for:', key);
                    return;
                }
            }

            this.notificationQueue[key] = Date.now();

            // Send to backend
            const response = await fetch('/api/notifications/feature-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-ID': session.id || 'anonymous'
                },
                body: JSON.stringify({
                    email: session.email,
                    facilityName: session.facilityName,
                    feature: data.feature,
                    currentTier: data.currentTier,
                    timestamp: data.timestamp
                })
            }).catch(err => {
                console.warn('Could not send email notification:', err);
            });

            if (response && !response.ok) {
                console.warn('Email notification failed:', response.status);
            }
        } catch (error) {
            console.error('Error in email notification:', error);
        }
    }
};

// Make globally available
window.SubscriptionUpgradeModal = SubscriptionUpgradeModal;
window.FeatureAccessLogger = FeatureAccessLogger;
window.EmailNotificationService = EmailNotificationService;
