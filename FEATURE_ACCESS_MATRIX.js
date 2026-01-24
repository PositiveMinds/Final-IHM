/**
 * Feature Access Matrix
 * Defines which features are available for each subscription tier
 */

const FEATURE_ACCESS_MATRIX = {
    'starter': {
        tier: 'starter',
        displayName: 'Starter',
        features: {
            // Dashboard
            'dashboard.view': true,
            'dashboard.stats': true,
            
            // Patients
            'patients.view': true,
            'patients.add': true,
            'patients.edit': true,
            'patients.delete': false,
            'patients.export': false,
            
            // Appointments
            'appointments.view': true,
            'appointments.add': true,
            'appointments.edit': true,
            'appointments.delete': false,
            'appointments.export': false,
            
            // Chat & Communication
            'chat.system': false,
            'chatbot.ai': false,
            
            // Data Management
            'data.import': true,
            'data.export': false,
            'data.backup': false,
            
            // Reports
            'reports.view': false,
            'reports.generate': false,
            'reports.custom': false,
            
            // Users
            'users.manage': false,
            'users.roles': false,
            
            // Settings
            'settings.facility': false,
            'settings.api': false,
            'settings.integrations': false,
        }
    },
    'Standard': {
        tier: 'Standard',
        displayName: 'Standard',
        features: {
            // Dashboard
            'dashboard.view': true,
            'dashboard.stats': true,
            
            // Patients
            'patients.view': true,
            'patients.add': true,
            'patients.edit': true,
            'patients.delete': true,
            'patients.export': true,
            
            // Appointments
            'appointments.view': true,
            'appointments.add': true,
            'appointments.edit': true,
            'appointments.delete': true,
            'appointments.export': true,
            
            // Chat & Communication
            'chat.system': false,
            'chatbot.ai': false,
            
            // Data Management
            'data.import': true,
            'data.export': true,
            'data.backup': false,
            
            // Reports
            'reports.view': true,
            'reports.generate': true,
            'reports.custom': false,
            
            // Users
            'users.manage': false,
            'users.roles': false,
            
            // Settings
            'settings.facility': true,
            'settings.api': false,
            'settings.integrations': false,
        }
    },
    'Advanced': {
        tier: 'Advanced',
        displayName: 'Advanced',
        features: {
            // Dashboard
            'dashboard.view': true,
            'dashboard.stats': true,
            
            // Patients
            'patients.view': true,
            'patients.add': true,
            'patients.edit': true,
            'patients.delete': true,
            'patients.export': true,
            
            // Appointments
            'appointments.view': true,
            'appointments.add': true,
            'appointments.edit': true,
            'appointments.delete': true,
            'appointments.export': true,
            
            // Chat & Communication
            'chat.system': true,
            'chatbot.ai': true,
            
            // Data Management
            'data.import': true,
            'data.export': true,
            'data.backup': true,
            
            // Reports
            'reports.view': true,
            'reports.generate': true,
            'reports.custom': true,
            
            // Users
            'users.manage': true,
            'users.roles': true,
            
            // Settings
            'settings.facility': true,
            'settings.api': true,
            'settings.integrations': true,
        }
    }
};

/**
 * Feature permission descriptions
 */
const FEATURE_DESCRIPTIONS = {
    'chat.system': {
        name: 'Chat System',
        description: 'Real-time messaging between team members',
        icon: '💬'
    },
    'chatbot.ai': {
        name: 'AI Chatbot',
        description: 'AI-powered assistant for healthcare automation',
        icon: '🤖'
    },
    'patients.delete': {
        name: 'Delete Patients',
        description: 'Remove patient records from the system',
        icon: '🗑️'
    },
    'patients.export': {
        name: 'Export Patient Data',
        description: 'Export patient information to Excel/PDF',
        icon: '📊'
    },
    'appointments.delete': {
        name: 'Delete Appointments',
        description: 'Remove appointment records',
        icon: '🗑️'
    },
    'appointments.export': {
        name: 'Export Appointments',
        description: 'Export appointment data',
        icon: '📊'
    },
    'data.export': {
        name: 'Data Export',
        description: 'Export facility data',
        icon: '💾'
    },
    'data.backup': {
        name: 'Data Backup',
        description: 'Automatic and manual data backups',
        icon: '🔒'
    },
    'reports.generate': {
        name: 'Generate Reports',
        description: 'Create custom healthcare reports',
        icon: '📈'
    },
    'reports.custom': {
        name: 'Custom Reports',
        description: 'Design and run custom report queries',
        icon: '⚙️'
    },
    'users.manage': {
        name: 'Manage Users',
        description: 'Create, edit, and delete user accounts',
        icon: '👥'
    },
    'users.roles': {
        name: 'User Roles',
        description: 'Assign and manage user roles and permissions',
        icon: '🔐'
    },
    'settings.api': {
        name: 'API Settings',
        description: 'Configure API keys and integrations',
        icon: '🔑'
    },
    'settings.integrations': {
        name: 'Integrations',
        description: 'Connect third-party services',
        icon: '🔗'
    }
};

/**
 * Check if a feature is available for the current subscription
 * @param {string} subscriptionType - Subscription tier (starter, Standard, Advanced)
 * @param {string} featureName - Feature name (e.g., 'chat.system')
 * @returns {boolean} - True if feature is available
 */
function hasFeatureAccess(subscriptionType, featureName) {
    const tier = FEATURE_ACCESS_MATRIX[subscriptionType];
    if (!tier) {
        console.warn(`Unknown subscription type: ${subscriptionType}`);
        return false;
    }
    return tier.features[featureName] === true;
}

/**
 * Get all features available for a subscription tier
 * @param {string} subscriptionType - Subscription tier
 * @returns {object} - Features object
 */
function getAvailableFeatures(subscriptionType) {
    const tier = FEATURE_ACCESS_MATRIX[subscriptionType];
    if (!tier) return {};
    return tier.features;
}

/**
 * Get restricted features for a subscription tier
 * @param {string} subscriptionType - Subscription tier
 * @returns {array} - Array of restricted feature names
 */
function getRestrictedFeatures(subscriptionType) {
    const tier = FEATURE_ACCESS_MATRIX[subscriptionType];
    if (!tier) return [];
    
    const features = tier.features;
    const restricted = [];
    
    for (let [feature, allowed] of Object.entries(features)) {
        if (!allowed) {
            restricted.push(feature);
        }
    }
    
    return restricted;
}

/**
 * Get features available in Advanced but not in current tier
 * @param {string} subscriptionType - Current subscription tier
 * @returns {array} - Array of premium features
 */
function getPremiumFeatures(subscriptionType) {
    const currentTier = FEATURE_ACCESS_MATRIX[subscriptionType];
    const advancedTier = FEATURE_ACCESS_MATRIX['Advanced'];
    
    if (!currentTier || !advancedTier) return [];
    
    const premiumFeatures = [];
    
    for (let [feature, allowed] of Object.entries(advancedTier.features)) {
        if (allowed && !currentTier.features[feature]) {
            premiumFeatures.push(feature);
        }
    }
    
    return premiumFeatures;
}

/**
 * Check feature access and return result with upgrade info
 * @param {string} subscriptionType - Current subscription tier
 * @param {string} featureName - Feature name
 * @returns {object} - {hasAccess: boolean, requiresUpgrade: boolean, currentTier: string, feature: object}
 */
function checkFeatureAccess(subscriptionType, featureName) {
    const hasAccess = hasFeatureAccess(subscriptionType, featureName);
    const feature = FEATURE_DESCRIPTIONS[featureName];
    
    return {
        hasAccess: hasAccess,
        requiresUpgrade: !hasAccess,
        currentTier: subscriptionType,
        targetTier: 'Advanced',
        feature: feature || { name: featureName, description: 'Premium Feature' }
    };
}

// Make functions globally available
window.FEATURE_ACCESS_MATRIX = FEATURE_ACCESS_MATRIX;
window.FEATURE_DESCRIPTIONS = FEATURE_DESCRIPTIONS;
window.hasFeatureAccess = hasFeatureAccess;
window.getAvailableFeatures = getAvailableFeatures;
window.getRestrictedFeatures = getRestrictedFeatures;
window.getPremiumFeatures = getPremiumFeatures;
window.checkFeatureAccess = checkFeatureAccess;
