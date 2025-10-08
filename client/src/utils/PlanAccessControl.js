// src/utils/PlanAccessControl.js

/**
 * Plan-based feature access control
 * Defines which features are available for each plan
 */

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
 * Get user's current plan from localStorage or API
 */
export const getUserPlan = () => {
  try {
    const userPlan = localStorage.getItem('userPlan');
    return userPlan || 'Free'; // Default to Free if no plan found
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
    return true;
  } catch (error) {
    console.error('Error setting user plan:', error);
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
  
  return planFeatures[featureName] === true;
};

/**
 * Check if user has CRM access
 */
export const hasCRMAccess = () => {
  const userPlan = getUserPlan();
  // Case-insensitive check for Standard or Premium
  const planName = userPlan.toLowerCase();
  return planName === 'standard' || planName === 'premium';
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
  return !hasFeatureAccess(featureName);
};