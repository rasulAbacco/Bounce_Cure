// This service runs in the background to track email usage and send notifications
class EmailTrackingService {
  constructor() {
    this.initialized = false;
    this.checkInterval = null;
  }

  // Initialize the service
  init() {
    if (this.initialized) return;
    
    // Set up default values if they don't exist
    this.setupDefaults();
    
    // Start the periodic checks
    this.startPeriodicChecks();
    
    this.initialized = true;
    console.log('Email tracking service initialized');
  }

  // Set up default values in localStorage
  setupDefaults() {
    if (!localStorage.getItem('planStartDate')) {
      const today = new Date();
      localStorage.setItem('planStartDate', today.toISOString());
    }
    
    if (!localStorage.getItem('emailUsage')) {
      localStorage.setItem('emailUsage', '0');
    }
    
    if (!localStorage.getItem('currentPlan')) {
      const defaultPlan = {
        name: 'Free Plan',
        emails: 50,
        billingPeriod: 'monthly'
      };
      localStorage.setItem('currentPlan', JSON.stringify(defaultPlan));
    }
    
    if (!localStorage.getItem('notificationsSent')) {
      localStorage.setItem('notificationsSent', JSON.stringify({
        slotsExhausted: false,
        weekWarning: false
      }));
    }
    
    if (!localStorage.getItem('emailQueue')) {
      localStorage.setItem('emailQueue', JSON.stringify([]));
    }
  }

  // Start periodic checks for notifications
  startPeriodicChecks() {
    // Check every hour
    this.checkInterval = setInterval(() => {
      this.checkSlotExhaustion();
      this.checkWeekWarning();
    }, 60 * 60 * 1000); // 1 hour
    
    // Also check immediately
    this.checkSlotExhaustion();
    this.checkWeekWarning();
  }

  // Stop the periodic checks
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Get the number of days in the current billing period
  getDaysInPeriod(period) {
    switch (period) {
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'annually': return 365;
      default: return 30;
    }
  }

  // Calculate days remaining in billing period
  calculateDaysRemaining() {
    const planStartDate = localStorage.getItem('planStartDate');
    if (!planStartDate) return 0;
    
    const currentPlan = JSON.parse(localStorage.getItem('currentPlan') || '{}');
    const billingPeriod = currentPlan.billingPeriod || 'monthly';
    
    const startDate = new Date(planStartDate);
    const daysInPeriod = this.getDaysInPeriod(billingPeriod);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysInPeriod);
    
    const today = new Date();
    const timeDiff = endDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysDiff);
  }

  // Check if slots are exhausted and send notification if needed
  checkSlotExhaustion() {
    const currentPlan = JSON.parse(localStorage.getItem('currentPlan') || '{}');
    const emailUsage = parseInt(localStorage.getItem('emailUsage') || '0');
    const notificationsSent = JSON.parse(localStorage.getItem('notificationsSent') || '{}');
    
    if (currentPlan.emails && emailUsage >= currentPlan.emails && !notificationsSent.slotsExhausted) {
      // Send notification with slot count prominently displayed
      this.sendNotification({
        type: 'slots_exhausted',
        message: `Slots/Contacts: ${currentPlan.emails} - Your email slots are exhausted. You've used ${emailUsage} out of ${currentPlan.emails} emails. Please upgrade your plan.`,
        unread: true,
        slotCount: currentPlan.emails
      });
      
      // Update notification sent status
      notificationsSent.slotsExhausted = true;
      localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
      
      console.log('Slot exhaustion notification sent');
    }
  }

  // Check if we need to send a week warning
  checkWeekWarning() {
    const daysRemaining = this.calculateDaysRemaining();
    const notificationsSent = JSON.parse(localStorage.getItem('notificationsSent') || '{}');
    
    if (daysRemaining <= 7 && daysRemaining > 0 && !notificationsSent.weekWarning) {
      // Get current plan details
      const currentPlan = JSON.parse(localStorage.getItem('currentPlan') || '{}');
      
      // Send in-app notification with slot count
      this.sendNotification({
        type: 'payment',
        message: `Slots/Contacts: ${currentPlan.emails} - Your billing period will end in ${daysRemaining} days. Make sure your payment method is up to date.`,
        unread: true,
        slotCount: currentPlan.emails
      });
      
      // Send email notification
      this.sendEmailNotification({
        to: localStorage.getItem('userEmail'),
        subject: 'Upcoming Payment Reminder',
        body: `Your ${currentPlan.name || 'current plan'} with ${currentPlan.emails} slots will renew in ${daysRemaining} days. Please ensure your payment method is up to date to avoid service interruption.`
      });
      
      // Update notification sent status
      notificationsSent.weekWarning = true;
      localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
      
      console.log('Week warning notification and email sent');
    }
    
    // Reset the week warning if we're in a new billing period
    if (daysRemaining > 7) {
      notificationsSent.weekWarning = false;
      localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
    }
  }

  // Handle successful payment
  handlePaymentSuccess(planDetails, paymentAmount) {
    console.log('Processing payment success with plan details:', planDetails);
    
    // Get previous plan for comparison
    const previousPlan = JSON.parse(localStorage.getItem('currentPlan') || '{}');
    const previousEmails = previousPlan.emails || 0;
    
    // Update current plan
    localStorage.setItem('currentPlan', JSON.stringify(planDetails));
    
    // Reset email usage
    localStorage.setItem('emailUsage', '0');
    
    // Reset notification flags
    const notificationsSent = JSON.parse(localStorage.getItem('notificationsSent') || '{}');
    notificationsSent.slotsExhausted = false;
    notificationsSent.weekWarning = false;
    localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
    
    // Set new plan start date
    const today = new Date();
    localStorage.setItem('planStartDate', today.toISOString());
    
    // Calculate slots added
    const slotsAdded = planDetails.emails - previousEmails;
    const totalSlots = planDetails.emails;
    
    // Create detailed notification message with slot count prominently displayed
    const notificationMessage = `Slots/Contacts: ${totalSlots} - Payment successful! ${slotsAdded} new slots added (${totalSlots} total). Amount paid: $${paymentAmount}.`;
    
    // Send confirmation notification
    this.sendNotification({
      type: 'payment_success',
      message: notificationMessage,
      unread: true,
      slotCount: totalSlots,
      details: {
        planName: planDetails.planName,
        totalSlots: totalSlots,
        slotsAdded: slotsAdded,
        billingPeriod: planDetails.billingPeriod,
        paymentAmount: paymentAmount
      }
    });
    
    // Send confirmation email
    this.sendEmailNotification({
      to: localStorage.getItem('userEmail'),
      subject: 'Payment Successful - Plan Activated',
      body: `Your payment for ${planDetails.planName} was successful. Amount paid: $${paymentAmount}. You now have ${totalSlots} email slots available (${slotsAdded} new slots added) for the ${planDetails.billingPeriod} billing period.`
    });
    
    // Dispatch payment success event with details
    window.dispatchEvent(new CustomEvent('paymentSuccess', {
      detail: {
        planName: planDetails.planName,
        totalSlots: totalSlots,
        slotsAdded: slotsAdded,
        billingPeriod: planDetails.billingPeriod,
        paymentAmount: paymentAmount
      }
    }));
    
    console.log('Payment processed successfully. Notification sent:', notificationMessage);
  }

  // Simulate sending an email (for testing)
  sendEmail() {
    const currentUsage = parseInt(localStorage.getItem('emailUsage') || '0');
    const newUsage = currentUsage + 1;
    localStorage.setItem('emailUsage', newUsage.toString());
    
    console.log(`Email sent. Usage: ${newUsage}`);
    
    // Check if slots are now exhausted
    this.checkSlotExhaustion();
    
    return newUsage;
  }

  // Get current usage statistics
  getUsageStats() {
    const currentPlan = JSON.parse(localStorage.getItem('currentPlan') || '{}');
    const emailUsage = parseInt(localStorage.getItem('emailUsage') || '0');
    const daysRemaining = this.calculateDaysRemaining();
    
    return {
      emailsUsed: emailUsage,
      emailsLimit: currentPlan.emails || 0,
      daysRemaining: daysRemaining,
      percentage: currentPlan.emails ? Math.min(100, (emailUsage / currentPlan.emails) * 100) : 0
    };
  }

  // Reset email usage (for testing or when plan renews)
  resetUsage() {
    localStorage.setItem('emailUsage', '0');
    
    // Reset notification sent status
    const notificationsSent = JSON.parse(localStorage.getItem('notificationsSent') || '{}');
    notificationsSent.slotsExhausted = false;
    localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
    
    console.log('Email usage reset');
  }

  // Update plan (when user upgrades)
  updatePlan(plan) {
    localStorage.setItem('currentPlan', JSON.stringify(plan));
    
    // Reset the plan start date
    const today = new Date();
    localStorage.setItem('planStartDate', today.toISOString());
    
    // Reset notification sent status
    const notificationsSent = JSON.parse(localStorage.getItem('notificationsSent') || '{}');
    notificationsSent.slotsExhausted = false;
    notificationsSent.weekWarning = false;
    localStorage.setItem('notificationsSent', JSON.stringify(notificationsSent));
    
    console.log('Plan updated:', plan);
  }

  // Send a notification
  sendNotification(notification) {
    // Create the notification object
    const newNotification = {
      id: Date.now(),
      unread: true,
      time: 'Just now',
      ...notification
    };
    
    // Dispatch a custom event to notify the UI
    window.dispatchEvent(new CustomEvent('newNotification', { detail: newNotification }));
    
    console.log('Notification sent:', newNotification);
  }

  // Send an email notification
  sendEmailNotification(emailDetails) {
    // In a real implementation, this would integrate with an email service
    // For now, we'll simulate by storing in localStorage
    const emailQueue = JSON.parse(localStorage.getItem('emailQueue') || '[]');
    emailQueue.push({
      ...emailDetails,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('emailQueue', JSON.stringify(emailQueue));
    
    console.log('Email queued for sending:', emailDetails);
  }
}

// Create a singleton instance
const emailTrackingService = new EmailTrackingService();

// Initialize the service when the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    emailTrackingService.init();
  });
}

export default emailTrackingService;