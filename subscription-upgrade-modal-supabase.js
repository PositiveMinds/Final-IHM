/**
 * Subscription Upgrade Modal - Supabase Edge Functions Version
 * Integrates with Supabase Edge Functions for logging and notifications
 */

// Configure your Supabase project ID
const SUPABASE_CONFIG = {
  projectId: 'your-project-id', // Replace with your Supabase project ID
  apiUrl: null, // Set automatically below
  
  // Auto-detect from localStorage session
  getApiUrl: function() {
    if (!this.apiUrl && this.projectId !== 'your-project-id') {
      this.apiUrl = `https://${this.projectId}.supabase.co/functions/v1`;
    }
    return this.apiUrl;
  }
};

const SubscriptionUpgradeModal = {
  /**
   * Show upgrade modal for a restricted feature
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
  },

  /**
   * Show upgrade prompt modal
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
        SubscriptionUpgradeModal.handleUpgradeClick(feature);
      }
    });
  },

  /**
   * Handle upgrade button click
   */
  handleUpgradeClick: function(feature) {
    // Log upgrade initiation
    FeatureAccessLogger.logAccessAttempt({
      feature: feature,
      status: 'upgrade_initiated',
      userAgent: navigator.userAgent
    });

    // Redirect to upgrade page or show upgrade options
    Swal.fire({
      title: 'Upgrade Your Plan',
      text: 'You will be redirected to our upgrade page. Contact support if you need assistance.',
      icon: 'info',
      confirmButtonColor: '#15696B'
    }).then(() => {
      // Replace with your actual upgrade URL
      window.location.href = '/upgrade'; 
    });
  }
};

/**
 * Feature Access Logger - Supabase Edge Function Integration
 */
const FeatureAccessLogger = {
  /**
   * Log feature access attempt to Supabase
   */
  logAccessAttempt: async function(data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      feature: data.feature,
      subscriptionType: data.subscriptionType,
      status: data.status || 'unknown',
      userAgent: data.userAgent
    };

    // Log to console
    console.log('[Feature Access Log]', logEntry);

    // Send to Supabase Edge Function
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      const apiUrl = SUPABASE_CONFIG.getApiUrl();

      if (!apiUrl) {
        console.warn('Supabase project ID not configured');
        this.storeLocalLog(logEntry);
        return;
      }

      // Get auth token from Supabase session or localStorage
      const token = session.token || localStorage.getItem('sb-token');

      const response = await fetch(`${apiUrl}/feature-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id || 'anonymous',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(logEntry)
      }).catch(err => {
        console.warn('Could not send log to Supabase:', err);
        this.storeLocalLog(logEntry);
      });

      if (response && !response.ok) {
        console.warn('Supabase returned error:', response.status);
        this.storeLocalLog(logEntry);
      }
    } catch (error) {
      console.error('Error logging access attempt:', error);
      this.storeLocalLog(logEntry);
    }
  },

  /**
   * Store log locally in localStorage as backup
   */
  storeLocalLog: function(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('featureAccessLogs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('featureAccessLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Could not store local log:', error);
    }
  },

  /**
   * Get local logs
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
 * Email Notification Service - Supabase Edge Function Integration
 */
const EmailNotificationService = {
  /**
   * Notify about feature access attempt
   */
  notifyAccessAttempt: async function(data) {
    try {
      const session = JSON.parse(localStorage.getItem('userSession') || '{}');
      
      if (!session.email) {
        console.warn('Cannot send notification: user email not found');
        return;
      }

      // Initialize throttle queue if needed
      if (!this.notificationQueue) {
        this.notificationQueue = {};
      }

      const key = `${session.email}_${data.feature}`;
      
      // Throttle: skip if notification sent in last 5 minutes
      if (this.notificationQueue[key]) {
        const timeDiff = Date.now() - this.notificationQueue[key];
        if (timeDiff < 5 * 60 * 1000) { // 5 minutes
          console.log('Notification throttled for:', key);
          return;
        }
      }

      // Update throttle timestamp
      this.notificationQueue[key] = Date.now();

      // Send to Supabase Edge Function
      const apiUrl = SUPABASE_CONFIG.getApiUrl();

      if (!apiUrl) {
        console.warn('Supabase project ID not configured');
        return;
      }

      const token = session.token || localStorage.getItem('sb-token');

      const response = await fetch(`${apiUrl}/feature-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': session.id || 'anonymous',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email: session.email,
          facilityName: session.facilityName,
          feature: data.feature,
          currentTier: data.currentTier,
          timestamp: data.timestamp
        })
      }).catch(err => {
        console.warn('Could not send notification:', err);
      });

      if (response && !response.ok) {
        console.warn('Notification send failed:', response.status);
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

// Configuration helper
window.configureSupabaseEdgeFunctions = function(projectId) {
  SUPABASE_CONFIG.projectId = projectId;
  SUPABASE_CONFIG.apiUrl = `https://${projectId}.supabase.co/functions/v1`;
  console.log('Supabase Edge Functions configured:', SUPABASE_CONFIG.apiUrl);
};
