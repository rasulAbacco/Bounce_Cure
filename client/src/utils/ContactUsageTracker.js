// src/utils/ContactUsageTracker.js
import { updateUsedContacts, getContactUsage, hasCRMAccess } from './PlanAccessControl';

/**
 * Track when contacts are used (added, imported, etc.)
 * Call this function whenever a user adds or imports contacts
 * 
 * @param {number} count - Number of contacts being added
 * @returns {Object} - { success: boolean, message: string, remaining: number }
 */
export const trackContactUsage = (count) => {
    try {
        // Get current usage
        const usage = getContactUsage();
        
        // Check if user has enough remaining contacts
        if (usage.total !== Infinity && usage.remaining < count) {
            return {
                success: false,
                message: `Not enough contacts remaining. You have ${usage.remaining} contacts left, but tried to add ${count}.`,
                remaining: usage.remaining,
                needsUpgrade: true
            };
        }
        
        // Update usage
        if (usage.total !== Infinity) {
            updateUsedContacts(count);
        }
        
        // Get updated usage
        const newUsage = getContactUsage();
        
        console.log(`📊 Contact usage tracked: +${count} contacts`);
        console.log(`📊 New usage: ${newUsage.used}/${newUsage.total} (${newUsage.remaining} remaining)`);
        
        // Check if CRM access should be revoked
        const stillHasAccess = hasCRMAccess();
        
        return {
            success: true,
            message: `Successfully tracked ${count} contacts`,
            remaining: newUsage.remaining,
            used: newUsage.used,
            total: newUsage.total,
            crmAccessRevoked: !stillHasAccess,
            warning: newUsage.remaining < 100 ? `Warning: Only ${newUsage.remaining} contacts remaining` : null
        };
        
    } catch (error) {
        console.error('Error tracking contact usage:', error);
        return {
            success: false,
            message: 'Error tracking contact usage',
            remaining: 0
        };
    }
};

/**
 * Check if user can add specific number of contacts
 * 
 * @param {number} count - Number of contacts to check
 * @returns {Object} - { canAdd: boolean, message: string }
 */
export const canAddContacts = (count) => {
    try {
        const usage = getContactUsage();
        
        // Unlimited plan
        if (usage.total === Infinity || usage.total === 0) {
            return {
                canAdd: true,
                message: 'Unlimited contacts available'
            };
        }
        
        // Check remaining
        if (usage.remaining >= count) {
            return {
                canAdd: true,
                message: `You can add ${count} contacts. ${usage.remaining - count} will remain.`,
                remaining: usage.remaining - count
            };
        } else {
            return {
                canAdd: false,
                message: `Cannot add ${count} contacts. Only ${usage.remaining} remaining.`,
                remaining: usage.remaining,
                needed: count - usage.remaining
            };
        }
        
    } catch (error) {
        console.error('Error checking contact availability:', error);
        return {
            canAdd: false,
            message: 'Error checking contact availability'
        };
    }
};

/**
 * Get usage statistics for display
 * 
 * @returns {Object} - Formatted usage statistics
 */
export const getUsageStats = () => {
    try {
        const usage = getContactUsage();
        
        return {
            used: usage.used,
            total: usage.total === Infinity ? 'Unlimited' : usage.total,
            remaining: usage.total === Infinity ? 'Unlimited' : usage.remaining,
            percentage: usage.percentage,
            isUnlimited: usage.total === Infinity || usage.total === 0,
            isNearLimit: usage.percentage > 80,
            isAtLimit: usage.remaining <= 0
        };
        
    } catch (error) {
        console.error('Error getting usage stats:', error);
        return {
            used: 0,
            total: 0,
            remaining: 0,
            percentage: 0,
            isUnlimited: false,
            isNearLimit: false,
            isAtLimit: true
        };
    }
};

/**
 * Example usage in your contact import/add functions:
 * 
 * // Before adding contacts
 * const check = canAddContacts(contactsToAdd.length);
 * if (!check.canAdd) {
 *     alert(check.message);
 *     // Redirect to pricing or show upgrade modal
 *     return;
 * }
 * 
 * // After successfully adding contacts
 * const result = trackContactUsage(contactsToAdd.length);
 * if (result.success) {
 *     if (result.crmAccessRevoked) {
 *         alert('You have used all your contacts. CRM access has been revoked. Please upgrade to continue.');
 *         // Redirect to pricing
 *     } else if (result.warning) {
 *         alert(result.warning);
 *     }
 * }
 */

// Export a hook for React components
export const useContactUsage = () => {
    const [usage, setUsage] = React.useState(getUsageStats());
    
    React.useEffect(() => {
        // Update usage every 5 seconds
        const interval = setInterval(() => {
            setUsage(getUsageStats());
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);
    
    return {
        usage,
        trackUsage: trackContactUsage,
        canAdd: canAddContacts,
        refresh: () => setUsage(getUsageStats())
    };
};