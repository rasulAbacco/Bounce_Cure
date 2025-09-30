import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Check, Gift, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';
import PageLayout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useNotificationContext } from "../components/NotificationContext";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showCreditMessage, setShowCreditMessage] = useState(false);
  const [slotsOver, setSlotsOver] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationContext();
  
  // Use refs to prevent unnecessary re-renders
  const notificationAdded = useRef(false);
  const weekWarningSent = useRef(false);
  const intervalRef = useRef(null);

  // Memoize pricing plans to prevent recreation on every render
  const pricingPlans = useMemo(() => ({
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
  }), []);

  // Memoize helper functions to prevent recreation
  const formatPeriod = useCallback(() => {
    switch (billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'annually': return 'year';
      default: return 'month';
    }
  }, [billingPeriod]);

  const getDaysInPeriod = useCallback((period) => {
    switch (period) {
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'annually': return 365;
      default: return 30;
    }
  }, []);

  // Memoize expensive calculations
  const calculateDaysRemaining = useCallback(() => {
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
  }, [billingPeriod, getDaysInPeriod]);

  const checkSlotsExhausted = useCallback(() => {
    const currentPlan = JSON.parse(localStorage.getItem('currentPlan') || 'null');
    const emailUsage = parseInt(localStorage.getItem('emailUsage') || '0');
    
    if (!currentPlan) return false;
    
    return emailUsage >= currentPlan.emails;
  }, []);

  // Debounced notification check to prevent spam
  const checkAndNotify = useCallback(() => {
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
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowCreditMessage(false);
      }, 5000);
    }
    
    // Check week warning
    const days = calculateDaysRemaining();
    if (days <= 7 && days > 0 && !weekWarningSent.current) {
      addNotification({
        type: 'payment',
        message: `Your ${billingPeriod} plan will renew in ${days} days. Ensure your payment method is up to date.`,
        unread: true
      });
      
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
    
    // Reset warning if new billing period
    if (days > 7) {
      weekWarningSent.current = false;
    }
  }, [billingPeriod, calculateDaysRemaining, checkSlotsExhausted, addNotification]);

  // Optimized initialization - run once
  useEffect(() => {
    // Initialize plan data only if not exists
    if (!localStorage.getItem('planStartDate')) {
      localStorage.setItem('planStartDate', new Date().toISOString());
    }
    
    if (!localStorage.getItem('currentPlan')) {
      localStorage.setItem('currentPlan', JSON.stringify(pricingPlans.monthly.free));
    }
    
    // Initial check
    checkAndNotify();
    
    // Setup interval with longer delay to reduce performance impact
    intervalRef.current = setInterval(checkAndNotify, 5 * 60 * 1000); // Check every 5 minutes instead of 1
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - run once

  // Separate effect for payment success listener - run once
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      const { planName, totalSlots, slotsAdded, billingPeriod } = event.detail;
      
      setPaymentSuccess(true);
      setPaymentDetails({
        planName,
        totalSlots,
        slotsAdded,
        billingPeriod
      });
      
      addNotification({
        type: 'payment_success',
        message: `Payment successful! Your ${planName} has been activated with ${totalSlots} email slots (${slotsAdded} new slots added).`,
        unread: true
      });
      
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    return () => window.removeEventListener('paymentSuccess', handlePaymentSuccess);
  }, [addNotification]);

 const handlePlanSelection = useCallback((planName, planType) => {
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

  if (!isLoggedIn) {
    if (planData.price === 0) {
      // Free plan - go to login page
      navigate("/login", {
        state: {
          from: "/pricing",
          plan: planDetails,
          redirectTo: "/dashboard", // After login, go to dashboard
        },
        replace: true,
      });
    } else {
      // Paid plan - go to sign-in page
      navigate("/signin", {
        state: {
          from: "/pricing",
          plan: planDetails,
          redirectTo: "/payment",
        },
        replace: true,
      });
    }
  } else {
    // User is logged in
    if (planData.price === 0) {
      // Free plan - activate and go to dashboard
      localStorage.setItem("currentPlan", JSON.stringify(planDetails));
      navigate("/dashboard", { replace: true });
    } else {
      // Paid plan - go to payment
      navigate("/payment", { 
        state: { plan: planDetails }, 
        replace: true 
      });
    }
  }
}, [pricingPlans, billingPeriod, formatPeriod, navigate]);

  // Memoized email notification function
  const sendEmailNotification = useCallback((emailDetails) => {
    console.log('Sending email notification:', emailDetails);
    
    const emailQueue = JSON.parse(localStorage.getItem('emailQueue') || '[]');
    emailQueue.push({
      ...emailDetails,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('emailQueue', JSON.stringify(emailQueue));
  }, []);

  // Memoize plan cards to prevent unnecessary re-renders
  const planCards = useMemo(() => {
    const plans = [];
    
    // Free Plan - Only for monthly
    if (billingPeriod === 'monthly') {
      plans.push(
        <div key="free" className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden transition-transform hover:scale-[1.02]">
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
      );
    }

    // Add other plans
    ['pro', 'growth', 'enterprise'].forEach(planType => {
      const plan = pricingPlans[billingPeriod][planType];
      const icons = { pro: Users, growth: TrendingUp, enterprise: Star };
      const Icon = icons[planType];
      const labels = { 
        pro: { name: 'Pro Plan', badge: 'Most Popular', badgeClass: 'bg-[#c2831f]' },
        growth: { name: 'Growth Plan', badge: 'Advanced', badgeClass: 'bg-[#c2831f]/20 text-[#c2831f]' },
        enterprise: { name: 'Enterprise', badge: 'Best Value', badgeClass: 'bg-[#c2831f]/20 text-[#c2831f]' }
      };

      plans.push(
        <div 
          key={planType} 
          className={`bg-black/30 backdrop-blur-lg rounded-2xl border ${
            planType === 'pro' ? 'border-2 border-[#c2831f]' : 'border-[#c2831f]/30'
          } overflow-hidden relative transition-transform hover:scale-[1.02]`}
        >
          {planType === 'pro' && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#c2831f] text-white px-4 py-1 rounded-b-lg text-sm font-medium">
              Most Popular
            </div>
          )}
          <div className={`p-6 ${planType === 'pro' ? 'pt-10' : ''}`}>
            <div className="flex items-center mb-4">
              <Icon className="w-8 h-8 text-[#c2831f] mr-3" />
              <div>
                <h3 className="text-xl font-bold">{labels[planType].name}</h3>
                {planType !== 'pro' && (
                  <span className={`text-xs px-2 py-1 rounded-full ${labels[planType].badgeClass}`}>
                    {labels[planType].badge}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold">${plan.price.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                <span>{plan.emails} emails</span>
              </li>
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelection(labels[planType].name, planType)}
              className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center transition-colors hover:bg-[#d0a042]"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      );
    });

    return plans;
  }, [billingPeriod, pricingPlans, formatPeriod, handlePlanSelection]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#c2831f' }}>Pricing Plans</h1>
            <p className="text-xl text-gray-300">
              Pay only for what you use — $0.10 per email validation and send.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-1 border border-[#c2831f]/30">
              {['monthly', 'quarterly', 'annually'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    billingPeriod === period
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

          {/* Slots Over Messages */}
          {showCreditMessage && slotsOver && (
            <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>Your email slots are exhausted. Please upgrade your plan.</span>
              </div>
            </div>
          )}

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

          {/* Pricing Cards */}
          <div className="flex justify-center mb-16">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${
              billingPeriod === 'monthly' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-6`}>
              {planCards}
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