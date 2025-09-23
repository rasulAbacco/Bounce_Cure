import React, { useState, useEffect, useRef } from 'react';
import { Check, Gift, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';
import PageLayout from "../components/PageLayout";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { useNotificationContext } from "../components/NotificationContext";
import emailTrackingService from '../services/EmailTrackingService';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showCreditMessage, setShowCreditMessage] = useState(false);
  const [slotsOver, setSlotsOver] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationContext();
  const notificationAdded = useRef(false);
  const weekWarningSent = useRef(false);

  // Fixed pricing structure based on your requirements
  const pricingPlans = {
    monthly: {
      free: {
        price: 0,
        emails: 50,
        features: [
          "Email marketing",
          "SMS marketing",
          "Advanced statistics"
        ]
      },
      pro: {
        price: 100,
        emails: 10000,
        features: [
          "Email marketing",
          "SMS marketing",
          "Marketing automation",
          "Free support 24/7"
        ]
      },
      growth: {
        price: 200,
        emails: 20000,
        features: [
          "CRM marketing",
          "SMS marketing",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      },
      enterprise: {
        price: 500,
        emails: 50000,
        features: [
          "CRM marketing",
          "Transactional emails",
          "SMS marketing",
          "Transactional SMS",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      }
    },
    quarterly: {
      pro: {
        price: 300,
        emails: 50000,
        features: [
          "Email marketing",
          "SMS marketing",
          "Marketing automation",
          "Free support 24/7"
        ]
      },
      growth: {
        price: 500,
        emails: 80000,
        features: [
          "CRM marketing",
          "SMS marketing",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      },
      enterprise: {
        price: 700,
        emails: 100000,
        features: [
          "CRM marketing",
          "Transactional emails",
          "SMS marketing",
          "Transactional SMS",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      }
    },
    annually: {
      pro: {
        price: 500,
        emails: 50000,
        features: [
          "Email marketing",
          "SMS marketing",
          "Marketing automation",
          "Free support 24/7"
        ]
      },
      growth: {
        price: 750,
        emails: 80000,
        features: [
          "CRM marketing",
          "SMS marketing",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      },
      enterprise: {
        price: 1000,
        emails: 100000,
        features: [
          "CRM marketing",
          "Transactional emails",
          "SMS marketing",
          "Transactional SMS",
          "Marketing automation",
          "Advanced statistics",
          "Free support 24/7",
          "Phone support"
        ]
      }
    }
  };

  const formatPeriod = () => {
    switch (billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'annually': return 'year';
      default: return 'month';
    }
  };

  // Get the number of days in the current billing period
  const getDaysInPeriod = (period) => {
    switch (period) {
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'annually': return 365;
      default: return 30;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 <= Date.now();
      return !isExpired;
    } catch (e) {
      return false;
    }
  };

  // Calculate days remaining in billing period
  const calculateDaysRemaining = () => {
    const planStartDate = localStorage.getItem('planStartDate');
    if (!planStartDate) return 0;
    
    const startDate = new Date(planStartDate);
    const daysInPeriod = getDaysInPeriod(billingPeriod);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysInPeriod);
    
    const today = new Date();
    const timeDiff = endDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysDiff);
  };

  // Check if user's email slots are exhausted
  const checkSlotsExhausted = () => {
    const currentPlan = JSON.parse(localStorage.getItem('currentPlan'));
    const emailUsage = parseInt(localStorage.getItem('emailUsage')) || 0;
    
    if (!currentPlan) return false;
    
    return emailUsage >= currentPlan.emails;
  };

  // Check if we need to send a week warning
  const checkWeekWarning = () => {
    const days = calculateDaysRemaining();
    
    // If we have exactly 7 days left and haven't sent the warning yet
    if (days <= 7 && days > 0 && !weekWarningSent.current) {
      addNotification({
        type: 'payment',
        message: `Your ${billingPeriod} plan will renew in ${days} days. Ensure your payment method is up to date.`,
        unread: true
      });
      
      // Send email notification
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        sendEmailNotification({
          to: userEmail,
          subject: 'Upcoming Payment Reminder',
          body: `Your ${billingPeriod} plan will renew in ${days} days. Please ensure your payment method is up to date to avoid service interruption.`
        });
      }
      
      weekWarningSent.current = true;
    }
    
    // Reset the warning if we're in a new billing period
    if (days > 7) {
      weekWarningSent.current = false;
    }
  };

  // Initialize plan data and listen for notifications
  useEffect(() => {
    // If no plan start date is set, create one
    if (!localStorage.getItem('planStartDate')) {
      const today = new Date();
      localStorage.setItem('planStartDate', today.toISOString());
    }
    
    // If no current plan is set, use the free plan
    if (!localStorage.getItem('currentPlan')) {
      localStorage.setItem('currentPlan', JSON.stringify(pricingPlans.monthly.free));
    }
    
    // Check initial slot status
    const isExhausted = checkSlotsExhausted();
    setSlotsOver(isExhausted);
    setShowCreditMessage(isExhausted);
    
    if (isExhausted && !notificationAdded.current) {
      addNotification({
        type: 'slots_exhausted',
        message: 'Your email slots are exhausted. Please upgrade your plan.',
        unread: true
      });
      notificationAdded.current = true;
    }
    
    // Check week warning
    checkWeekWarning();
    
    // Listen for payment success event
    const handlePaymentSuccess = (event) => {
      const { planName, totalSlots, slotsAdded, billingPeriod } = event.detail;
      console.log('Payment success event received:', event.detail);
      
      // Show detailed success message
      setPaymentSuccess(true);
      setPaymentDetails({
        planName,
        totalSlots,
        slotsAdded,
        billingPeriod
      });
      
      // Add notification to the notification system
      addNotification({
        type: 'payment_success',
        message: `Payment successful! Your ${planName} has been activated with ${totalSlots} email slots (${slotsAdded} new slots added).`,
        unread: true
      });
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    return () => window.removeEventListener('paymentSuccess', handlePaymentSuccess);
  }, [addNotification]);

  // Set up interval to check for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if slots are exhausted
      const isExhausted = checkSlotsExhausted();
      if (isExhausted && !notificationAdded.current) {
        addNotification({
          type: 'slots_exhausted',
          message: 'Your email slots are exhausted. Please upgrade your plan.',
          unread: true
        });
        notificationAdded.current = true;
        setSlotsOver(true);
        setShowCreditMessage(true);
        
        // Auto-hide the message after 5 seconds
        setTimeout(() => {
          setShowCreditMessage(false);
        }, 5000);
      }
      
      // Check week warning
      checkWeekWarning();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [billingPeriod, addNotification]);

  // Listen for new notifications from EmailTrackingService
  useEffect(() => {
    const handleNewNotification = (event) => {
      addNotification(event.detail);
    };

    window.addEventListener('newNotification', handleNewNotification);
    
    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, [addNotification]);

  // Initialize existing notifications from localStorage
  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    storedNotifications.forEach(notification => {
      addNotification(notification);
    });
  }, [addNotification]);

  const handlePlanSelection = (planName, planType) => {
    const planData = pricingPlans[billingPeriod][planType];

    const planDetails = {
      planName,
      planType,
      basePrice: planData.price,
      billingPeriod: formatPeriod(),
      emails: planData.emails,
      features: planData.features,
      slots: planData.emails,
      selectedIntegrations: [],
      additionalSlotsCost: 0,
      integrationCosts: 0,
      discount: 0,
      subtotal: planData.price,
      taxRate: 0.1,
      tax: planData.price * 0.1,
      total: planData.price * 1.1,
    };

    // Store plan temporarily
    localStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    sessionStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));

    const isLoggedIn = !!localStorage.getItem("authToken");

    if (!isLoggedIn && planData.price > 0) {
      // Redirect to Signin with state
      navigate("/signin", {
        state: {
          from: "/pricing",
          plan: planDetails,
          redirectTo: "/payment",
        },
        replace: true,
      });
    } else {
      // Go directly to payment
      navigate("/payment", { state: { plan: planDetails }, replace: true });
    }
  };

  // Function to send email notifications (simulated)
  const sendEmailNotification = (emailDetails) => {
    // In a real implementation, this would call an email service API
    console.log('Sending email notification:', emailDetails);
    
    // For demo purposes, we'll store it in localStorage
    const emailQueue = JSON.parse(localStorage.getItem('emailQueue') || '[]');
    emailQueue.push({
      ...emailDetails,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('emailQueue', JSON.stringify(emailQueue));
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#c2831f' }}>Pricing Plans</h1>
            <p className="text-xl text-gray-300">
              Pay only for what you use – $0.10 per email validation and send.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-1 border border-[#c2831f]/30">
              {['monthly', 'quarterly', 'annually'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${billingPeriod === period
                    ? 'bg-[#c2831f] text-white'
                    : 'text-gray-300 hover:text-white'
                    }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                  {period === 'annually' && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Save 20%</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Success Message */}
          {paymentSuccess && paymentDetails && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <div>
                  <div className="font-bold">Payment Successful!</div>
                  <div className="text-sm">
                    {paymentDetails.planName} activated with {paymentDetails.totalSlots} slots 
                    ({paymentDetails.slotsAdded} new slots added)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slots Over Message - Only shown when slots are actually exhausted */}
          {showCreditMessage && slotsOver && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>Your email slots are exhausted. Please upgrade your plan.</span>
              </div>
            </div>
          )}

          {/* Persistent Slots Over Notification - Only shown when slots are actually exhausted */}
          {slotsOver && (
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 mb-8 flex items-center">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mr-4">
                <span className="text-black">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-yellow-400">Slots Exhausted</h3>
                <p className="text-yellow-200">You've used all your email slots. Upgrade your plan to continue sending emails.</p>
              </div>
              <button 
                onClick={() => setShowCreditMessage(false)}
                className="ml-auto text-yellow-400 hover:text-yellow-200"
              >
                ✕
              </button>
            </div>
          )}

          {/* Pricing Cards - Centered */}
          <div className="flex justify-center mb-16">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${billingPeriod === 'monthly' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              } gap-6`}>
              {/* Free Plan - Only shown for monthly billing */}
              {billingPeriod === 'monthly' && (
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden transition-transform hover:scale-[1.02]">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Gift className="w-8 h-8 text-[#c2831f] mr-3" />
                      <h3 className="text-xl font-bold">Free Plan</h3>
                      <span className="ml-2 bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                        Always Free
                      </span>
                    </div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold">${pricingPlans.monthly.free.price.toFixed(2)}</div>
                      <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                      <div className="text-xs text-yellow-400 mt-2">Limited credits available</div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                        <span>{pricingPlans.monthly.free.emails} emails</span>
                      </li>
                      {pricingPlans.monthly.free.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanSelection("Free Plan", "free")}
                      className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center transition-colors hover:bg-[#d0a042]"
                    >
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pro Plan */}
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl border-2 border-[#c2831f] overflow-hidden relative transition-transform hover:scale-[1.02]">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#c2831f] text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                  Most Popular
                </div>
                <div className="p-6 pt-10">
                  <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 text-[#c2831f] mr-3" />
                    <h3 className="text-xl font-bold">Pro Plan</h3>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold">${pricingPlans[billingPeriod].pro.price.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                      <span>{pricingPlans[billingPeriod].pro.emails} emails</span>
                    </li>
                    {pricingPlans[billingPeriod].pro.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelection("Pro Plan", "pro")}
                    className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center transition-colors hover:bg-[#d0a042]"
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Growth Plan */}
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-8 h-8 text-[#c2831f] mr-3" />
                    <div>
                      <h3 className="text-xl font-bold">Growth Plan</h3>
                      <span className="text-xs bg-[#c2831f]/20 text-[#c2831f] px-2 py-1 rounded-full">
                        Advanced
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold">${pricingPlans[billingPeriod].growth.price.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                      <span>{pricingPlans[billingPeriod].growth.emails} emails</span>
                    </li>
                    {pricingPlans[billingPeriod].growth.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelection("Growth Plan", "growth")}
                    className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center transition-colors hover:bg-[#d0a042]"
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Star className="w-8 h-8 text-[#c2831f] mr-3" />
                    <div>
                      <h3 className="text-xl font-bold">Enterprise</h3>
                      <span className="text-xs bg-[#c2831f]/20 text-[#c2831f] px-2 py-1 rounded-full">
                        Best Value
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl font-bold">${pricingPlans[billingPeriod].enterprise.price.toFixed(2)}</div>
                    <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                      <span>{pricingPlans[billingPeriod].enterprise.emails} emails</span>
                    </li>
                    {pricingPlans[billingPeriod].enterprise.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelection("Enterprise Plan", "enterprise")}
                    className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center transition-colors hover:bg-[#d0a042]"
                  >
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                state={{ from: "/pricing", redirectTo: "/pricing" }}
                className="px-8 py-3 bg-[#c2831f] text-white rounded-xl font-medium transition-colors hover:bg-[#d0a042]"
              >
                Start Free Trial
              </Link>
              <Link
                to="/email-quote"
                className="px-8 py-3 bg-black border border-[#c2831f] text-white rounded-xl font-medium transition-colors hover:bg-[#c2831f]/10"
              >
                Email Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </PageLayout>
  );
};

export default Pricing;