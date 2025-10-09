// src/utils/PlanAccessControl.js
import { useContext } from 'react';
import { UserContext } from '../components/UserContext';

export const PLAN_FEATURES = {
  Free: {
    crm: false,
    emailCampaign: true,
    multimediaCampaign: false,
    automation: false,
    analytics: true,
    verification: false,
    maxContacts: 500,
    maxEmails: 1000,
  },
  Essentials: {
    crm: false,
    emailCampaign: true,
    multimediaCampaign: true,
    automation: true,
    analytics: true,
    verification: true,
    maxContacts: 5000,
    maxEmails: 50000,
  },
  Standard: {
    crm: true,
    emailCampaign: true,
    multimediaCampaign: true,
    automation: true,
    analytics: true,
    verification: true,
    maxContacts: 100000,
    maxEmails: 1200000,
  },
  Premium: {
    crm: true,
    emailCampaign: true,
    multimediaCampaign: true,
    automation: true,
    analytics: true,
    verification: true,
    maxContacts: Infinity,
    maxEmails: Infinity,
  },
};

/**
 * Get user's current plan from context or localStorage
 */
export const getUserPlan = () => {
  try {
    // Try localStorage first (more reliable)
    const userPlan = localStorage.getItem('userPlan');
    if (userPlan) {
      return userPlan;
    }
    
    // Fallback to default
    return 'Free';
  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'Free';
  }
};

/**
 * Set user's plan in localStorage
 */
export const setUserPlan = (planName) => {
  try {
    localStorage.setItem('userPlan', planName);
    console.log('✅ Plan saved to localStorage:', planName);
    return true;
  } catch (error) {
    console.error('Error setting user plan:', error);
    return false;
  }
};

/**
 * Get user's contact usage statistics
 */
export const getContactUsage = () => {
  try {
    const usedContacts = parseInt(localStorage.getItem('usedContacts') || '0');
    const totalContacts = parseInt(localStorage.getItem('totalContacts') || '0');
    const remainingContacts = Math.max(0, totalContacts - usedContacts);
    
    return {
      used: usedContacts,
      total: totalContacts,
      remaining: remainingContacts,
      percentage: totalContacts > 0 ? (usedContacts / totalContacts) * 100 : 0
    };
  } catch (error) {
    console.error('Error getting contact usage:', error);
    return { used: 0, total: 0, remaining: 0, percentage: 0 };
  }
};

/**
 * Update used contacts count
 */
export const updateUsedContacts = (count) => {
  try {
    const currentUsed = parseInt(localStorage.getItem('usedContacts') || '0');
    const newUsed = currentUsed + count;
    localStorage.setItem('usedContacts', newUsed.toString());
    console.log(`📊 Updated used contacts: ${currentUsed} → ${newUsed}`);
    return true;
  } catch (error) {
    console.error('Error updating used contacts:', error);
    return false;
  }
};

/**
 * Set total purchased contacts
 */
export const setTotalContacts = (total) => {
  try {
    localStorage.setItem('totalContacts', total.toString());
    console.log('📦 Total contacts set:', total);
    return true;
  } catch (error) {
    console.error('Error setting total contacts:', error);
    return false;
  }
};

/**
 * Reset contact usage (when buying new plan)
 */
export const resetContactUsage = () => {
  try {
    localStorage.setItem('usedContacts', '0');
    console.log('🔄 Contact usage reset');
    return true;
  } catch (error) {
    console.error('Error resetting contact usage:', error);
    return false;
  }
};

/**
 * Check if user has CRM access based on:
 * 1. They purchased Standard/Premium plan
 * 2. They still have remaining contacts (credits)
 */
export const hasCRMAccess = () => {
  try {
    const userPlan = getUserPlan();
    const planName = userPlan.toLowerCase();
    
    // Check if plan includes CRM
    const planIncludesCRM = planName === 'standard' || planName === 'premium';
    
    if (!planIncludesCRM) {
      console.log('🔒 CRM access denied: Plan does not include CRM');
      return false;
    }
    
    // Check if user has purchased before
    const hasPurchased = localStorage.getItem('hasPurchasedBefore') === 'true';
    
    if (!hasPurchased) {
      console.log('🔒 CRM access denied: No purchase history');
      return false;
    }
    
    // Check remaining contacts
    const usage = getContactUsage();
    
    // For Premium plan with unlimited contacts
    if (usage.total === Infinity || usage.total === 0) {
      console.log('✅ CRM access granted: Unlimited plan');
      return true;
    }
    
    // For plans with limited contacts
    const hasRemainingContacts = usage.remaining > 0;
    
    if (!hasRemainingContacts) {
      console.log('🔒 CRM access denied: No remaining contacts');
      console.log(`📊 Usage: ${usage.used}/${usage.total} contacts used`);
      return false;
    }
    
    console.log('✅ CRM access granted');
    console.log(`📊 Remaining contacts: ${usage.remaining}/${usage.total}`);
    return true;
    
  } catch (error) {
    console.error('Error checking CRM access:', error);
    return false;
  }
};

/**
 * Check if user has access to a specific feature
 */
export const hasFeatureAccess = (featureName) => {
  const userPlan = getUserPlan();
  const planFeatures = PLAN_FEATURES[userPlan];
  
  if (!planFeatures) {
    return false;
  }
  
  // Special handling for CRM - check credits
  if (featureName === 'crm') {
    return hasCRMAccess();
  }
  
  return planFeatures[featureName] === true;
};

/**
 * Get plan features for current user
 */
export const getCurrentPlanFeatures = () => {
  const userPlan = getUserPlan();
  return PLAN_FEATURES[userPlan] || PLAN_FEATURES.Free;
};

/**
 * Check if user needs to upgrade for a feature
 */
export const needsUpgradeFor = (featureName) => {
  // Special handling for CRM
  if (featureName === 'crm') {
    const usage = getContactUsage();
    if (usage.remaining <= 0 && usage.total > 0) {
      return 'recharge'; // Need to buy more contacts
    }
  }
  
  return !hasFeatureAccess(featureName);
};

/**
 * Initialize user data after successful payment
 */
export const initializeUserAfterPurchase = (plan) => {
  try {
    // Save plan name
    setUserPlan(plan.planName);
    
    // Set purchase flag
    localStorage.setItem('hasPurchasedBefore', 'true');
    
    // Set total contacts from plan
    const totalContacts = plan.slots || plan.contactCount || 0;
    setTotalContacts(totalContacts);
    
    // Reset usage
    resetContactUsage();
    
    console.log('✅ User initialized after purchase:', {
      plan: plan.planName,
      totalContacts: totalContacts
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing user after purchase:', error);
    return false;
  }
};