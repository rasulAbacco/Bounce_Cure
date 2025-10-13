// client/src/pages/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronUp, Gift, Users, TrendingUp, Star, ArrowRight, Phone, Mail, Zap, BarChart, Globe, Shield, Smartphone, Package, Target, Send, Layout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [contactCount, setContactCount] = useState(500);
  const [expandedSections, setExpandedSections] = useState({});
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  // Navigation hook
  const navigate = useNavigate();

  // Currency conversion rates (base: USD)
  const currencyRates = {
    USD: { symbol: '$', rate: 1, name: 'US Dollar' },
    EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
    GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
    INR: { symbol: '₹', rate: 83.12, name: 'Indian Rupee' },
    AUD: { symbol: 'A$', rate: 1.53, name: 'Australian Dollar' },
    CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
    JPY: { symbol: '¥', rate: 149.50, name: 'Japanese Yen' },
    NZD: { symbol: 'NZ$', rate: 1.67, name: 'New Zealand Dollar' },
    NOK: { symbol: 'kr', rate: 10.87, name: 'Norwegian Krone' },
    SEK: { symbol: 'kr', rate: 10.96, name: 'Swedish Krona' },
    CHF: { symbol: 'CHF', rate: 0.88, name: 'Swiss Franc' }
  };

  const contactTiers = [
    { value: 500, label: '500', pricing: { essentials: 4.31, standard: 6.44, premium: 128.79 } },
    { value: 1000, label: '1,000', pricing: { essentials: 8.62, standard: 12.88, premium: 257.58 } },
    { value: 1500, label: '1,500', pricing: { essentials: 12.93, standard: 19.32, premium: 386.37 } },
    { value: 2500, label: '2,500', pricing: { essentials: 21.55, standard: 32.20, premium: 643.95 } },
    { value: 5000, label: '5,000', pricing: { essentials: 43.10, standard: 64.40, premium: 1287.90 } },
    { value: 10000, label: '10,000', pricing: { essentials: 86.20, standard: 128.80, premium: 2575.80 } },
    { value: 15000, label: '15,000', pricing: { essentials: 129.30, standard: 193.20, premium: 3863.70 } },
    { value: 20000, label: '20,000', pricing: { essentials: 172.40, standard: 257.60, premium: 5151.60 } },
    { value: 25000, label: '25,000', pricing: { essentials: 215.50, standard: 322.00, premium: 6439.50 } },
    { value: 30000, label: '30,000', pricing: { essentials: 258.60, standard: 386.40, premium: 7727.40 } },
    { value: 40000, label: '40,000', pricing: { essentials: 344.80, standard: 515.20, premium: 10303.20 } },
    { value: 50000, label: '50,000', pricing: { essentials: 431.00, standard: 644.00, premium: 12879.00 } },
    { value: 75000, label: '75,000', pricing: { essentials: 646.50, standard: 966.00, premium: 19318.50 } },
    { value: 100000, label: '100,000', pricing: { essentials: 862.00, standard: 1288.00, premium: 25758.00 } },
    { value: 150000, label: '150,000', pricing: { essentials: 1293.00, standard: 1932.00, premium: 38637.00 } },
    { value: 200000, label: '200,000', pricing: { essentials: 1724.00, standard: 2576.00, premium: 51516.00 } },
    { value: 250000, label: '250,000+', pricing: { essentials: 2155.00, standard: 3220.00, premium: 64395.00 } }
  ];

  const getCurrentPricing = () => {
    const tier = contactTiers.find(t => t.value === contactCount);
    return tier ? tier.pricing : contactTiers[0].pricing;
  };

  // Convert price to selected currency
  const convertPrice = (priceUSD) => {
    const rate = currencyRates[selectedCurrency].rate;
    const convertedPrice = priceUSD * rate;
    // Format based on currency (JPY has no decimals)
    if (selectedCurrency === 'JPY') {
      return Math.round(convertedPrice).toLocaleString();
    }
    return convertedPrice.toFixed(2);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return currencyRates[selectedCurrency].symbol;
  };

  // Format price with currency symbol
  const formatPrice = (priceUSD) => {
    const symbol = getCurrencySymbol();
    const convertedPrice = convertPrice(priceUSD);
    
    // Special handling for CHF (symbol after amount)
    if (selectedCurrency === 'CHF') {
      return `${convertedPrice} ${symbol}`;
    }
    
    return `${symbol}${convertedPrice}`;
  };

  // Function to get plan-specific contact limit
  const getPlanContactLimit = (planType) => {
    switch(planType) {
      case 'free':
        return 500;
      case 'essentials':
        return 5000;
      case 'standard':
        return 100000;
      case 'premium':
        return Infinity;
      default:
        return contactCount;
    }
  };

  // Function to check if a plan is available for the selected contact count
  const isPlanAvailable = (planType) => {
    const planLimit = getPlanContactLimit(planType);
    return contactCount <= planLimit;
  };

  const plans = {
    free: {
      name: 'Free',
      tagline: 'Easily create email campaigns and learn more about your customers',
      icon: Gift,
      color: 'text-green-400',
      price: 0,
      disclaimer: '*Sending will be paused if contact or email send limit is exceeded.',
      cta: 'Sign Up',
      emailMultiplier: null,
      emailLimit: 1000,
      features: ["Email marketing", "Basic reporting", "1 audience"]
    },
    essentials: {
      name: 'Essentials',
      tagline: 'Send the right content at the right time with testing and scheduling features',
      icon: Users,
      color: 'text-blue-400',
      cta: 'Buy Now',
      emailMultiplier: 10,
      features: ["Email marketing", "SMS marketing", "Marketing automation", "Basic support"]
    },
    standard: {
      name: 'Standard',
      tagline: 'Sell even more with personalization, optimization tools, and enhanced automations',
      icon: TrendingUp,
      color: 'text-[#c2831f]',
      badge: 'Best value',
      popular: true,
      cta: 'Buy Now',
      emailMultiplier: 12,
      features: ["Email marketing", "SMS marketing", "Advanced automation", "A/B testing", "24/7 support"]
    },
    premium: {
      name: 'Premium',
      tagline: 'Scale fast with dedicated onboarding, unlimited contacts, and priority support; built for teams',
      icon: Star,
      color: 'text-purple-400',
      cta: 'Buy Now',
      emailMultiplier: 15,
      features: ["Email marketing", "SMS marketing", "Advanced automation", "A/B testing", "Priority support", "Custom integrations"]
    }
  };

  // Handle plan selection with navigation logic
  const handlePlanSelection = (planName, planType) => {
    if (!isPlanAvailable(planType)) {
      alert(`The ${planName} plan is not available for ${contactCount.toLocaleString()} contacts. Please select a different plan or reduce your contact count.`);
      return;
    }

    const planData = plans[planType];
    const pricing = getCurrentPricing();
    const priceUSD = planType === 'free' ? 0 : pricing[planType];
    const priceConverted = parseFloat(convertPrice(priceUSD).replace(/,/g, ''));
    
    // Calculate email send limit based on plan type and contact count
    let emailSendLimit;
    if (planType === 'free') {
      emailSendLimit = planData.emailLimit;
    } else {
      emailSendLimit = contactCount * planData.emailMultiplier;
    }

    // Build plan object consistent with PricingDash
    const planDetails = {
      planName: planName,
      planType: planType,
      basePrice: priceConverted,
      originalBasePrice: priceConverted * 2,
      billingPeriod: billingPeriod === 'monthly' ? 'month' : 'year',
      emails: emailSendLimit,
      features: planData.features,
      slots: contactCount,
      selectedIntegrations: [],
      additionalSlotsCost: 0,
      integrationCosts: 0,
      discount: 0.5,
      subtotal: priceConverted,
      taxRate: 0.1,
      tax: priceConverted * 0.1,
      totalCost: priceConverted * 1.1,
      contactCount: contactCount,
      currency: selectedCurrency,
      currencySymbol: getCurrencySymbol(),
      isFromPricingDash: false,
      pricingModel: "multiplier",
      discountApplied: true,
      discountAmount: priceConverted,
      isNewUser: true // Assume new user for discount
    };

    localStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    sessionStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    
    setSelectedPlan(planDetails);

    const isLoggedIn = !!localStorage.getItem("authToken");

    if (!isLoggedIn) {
      navigate("/signin", {
        state: {
          plan: planDetails,
          redirectTo: "/payment",
        },
      });
    } else { 
      navigate("/payment", {
        state: { plan: planDetails },
      });
    }
  };

  const keyPlanFeatures = {
    free: [
      { label: 'Monthly Email Sends', value: 'Max of 1,000/mo' },
      { label: 'SMS and MMS add-on', value: 'Not included' },
      { label: 'Marketing Automation Flows', value: 'Not included' },
     ],
    essentials: [
      { label: 'Monthly Email Sends', value: '10X contacts' },
      { label: 'SMS add-on', value: 'SMS add-on' },
      { label: 'Marketing Automation Flows', value: 'Up to 4 flow steps' },
     
    ],
    standard: [
      { label: 'Monthly Email Sends', value: '12X contacts' },
      { label: 'SMS and MMS add-on', value: 'SMS and MMS add-on' },
      { label: 'Marketing Automation Flows', value: 'Up to 200 flow steps' },
     ],
    premium: [
      { label: 'Monthly Email Sends', value: '15X contacts' },
      { label: 'SMS and MMS add-on', value: 'SMS and MMS add-on' },
      { label: 'Marketing Automation Flows', value: 'Up to 200 flow steps' },
      { label: 'Premium Migration Services', value: 'Contact Sales' }
    ]
  };

  const featureCategories = [
    {
      name: 'Core Features',
      icon: Mail,
      features: [
        { name: 'Remove Mailchimp Branding', free: false, essentials: true, standard: true, premium: true },
        { name: 'Email Scheduling', free: false, essentials: true, standard: true, premium: true },
        { name: 'A/B Testing', free: false, essentials: 'Limited', standard: true, premium: true },
        { name: 'Custom Templates', free: false, essentials: false, standard: true, premium: true },
        { name: 'Dynamic Content', free: false, essentials: false, standard: true, premium: true },
        { name: 'Multivariate Testing', free: false, essentials: false, standard: false, premium: true },
        { name: 'Send Time Optimization', free: false, essentials: false, standard: true, premium: true },
        { name: 'Comparative Reporting', free: false, essentials: false, standard: true, premium: true },
        { name: 'Predictive Segmentation', free: false, essentials: false, standard: true, premium: true },
        { name: 'Behavioral Targeting', free: false, essentials: false, standard: true, premium: true },
        { name: 'Advanced Insights', free: false, essentials: false, standard: true, premium: true }
      ]
    },
    {
      name: 'Contacts & Audience',
      icon: Users,
      features: [
        { name: 'Contacts', free: 'Up to 500', essentials: 'Up to 5,000', standard: 'Up to 100,000', premium: 'Unlimited' },
        { name: 'Audiences', free: '1', essentials: '1', standard: '1', premium: 'Multiple' },
        { name: 'Tags', free: true, essentials: true, standard: true, premium: true },
        { name: 'Basic Segmentation', free: true, essentials: true, standard: true, premium: true },
        { name: 'Advanced Segmentation', free: false, essentials: false, standard: true, premium: true },
        { name: 'Contact Scoring', free: false, essentials: false, standard: true, premium: true },
        { name: 'Purchase Likelihood', free: false, essentials: false, standard: true, premium: true },
        { name: 'Customer Lifetime Value', free: false, essentials: false, standard: true, premium: true }
      ]
    },
    {
      name: 'Email & Content Creation',
      icon: Layout,
      features: [
        { name: 'Email Campaigns', free: true, essentials: true, standard: true, premium: true },
        { name: 'Pre-built Templates', free: 'Limited', essentials: true, standard: true, premium: true },
        { name: 'Creative Assistant', free: 'Limited', essentials: 'Limited', standard: true, premium: true },
        { name: 'Custom-coded Templates', free: false, essentials: false, standard: true, premium: true },
        { name: 'Content Optimizer', free: false, essentials: false, standard: true, premium: true },
        { name: 'Dynamic Content', free: false, essentials: false, standard: true, premium: true },
        { name: 'Landing Pages', free: true, essentials: true, standard: true, premium: true },
        { name: 'Forms & Sign-up Forms', free: true, essentials: true, standard: true, premium: true }
      ]
    },
    {
      name: 'Marketing Automation',
      icon: Zap,
      features: [
        { name: 'Email Automation', free: 'Basic', essentials: true, standard: true, premium: true },
        { name: 'Customer Journeys', free: 'Basic', essentials: true, standard: true, premium: true },
        { name: 'Automation Triggers', free: 'Limited', essentials: true, standard: true, premium: true },
        { name: 'Behavioral Targeting', free: false, essentials: false, standard: true, premium: true },
        { name: 'Conditional Logic', free: false, essentials: 'Limited', standard: true, premium: true },
        { name: 'Advanced Journeys', free: false, essentials: false, standard: true, premium: true },
        { name: 'Journey Reporting', free: 'Basic', essentials: true, standard: true, premium: true }
      ]
    },
    {
      name: 'Reporting & Analytics',
      icon: BarChart,
      features: [
        { name: 'Basic Reporting', free: true, essentials: true, standard: true, premium: true },
        { name: 'Advanced Reporting', free: false, essentials: false, standard: true, premium: true },
        { name: 'Campaign Performance', free: true, essentials: true, standard: true, premium: true },
        { name: 'Click Map', free: true, essentials: true, standard: true, premium: true },
        { name: 'Industry Benchmarking', free: true, essentials: true, standard: true, premium: true },
        { name: 'A/B Testing Results', free: false, essentials: 'Limited', standard: true, premium: true },
        { name: 'Advanced A/B Testing', free: false, essentials: false, standard: true, premium: true },
        { name: 'Purchase Likelihood', free: false, essentials: false, standard: true, premium: true },
        { name: 'Content Optimizer', free: false, essentials: false, standard: true, premium: true },
        { name: 'Campaign Manager', free: false, essentials: false, standard: true, premium: true }
      ]
    },
    {
      name: 'Support & Services',
      icon: Phone,
      features: [
        { name: 'Email Support', free: true, essentials: true, standard: true, premium: true },
        { name: 'Chat Support', free: false, essentials: true, standard: true, premium: true },
        { name: '24/7 Support', free: false, essentials: false, standard: true, premium: true },
        { name: 'Phone Support', free: false, essentials: false, standard: false, premium: true },
        { name: 'Priority Support', free: false, essentials: false, standard: false, premium: true },
        { name: 'Onboarding', free: false, essentials: false, standard: 'Basic', premium: 'Dedicated' },
        { name: 'Personalized Onboarding', free: false, essentials: false, standard: false, premium: true }
      ]
    } 
  ];

  const faqs = [
    {
      q: 'How long is the Free Trial?',
      a: 'The free trial of Standard or Essentials lasts for 14 days. For example, if you start your trial on August 29, your trial would end on September 12.'
    },
    {
      q: 'Can I upgrade or downgrade during my trial?',
      a: 'Yes! You can upgrade or downgrade at any time during your trial. If you upgrade to Premium, you will pay the difference in price between the two plans for the remaining days.'
    },
    {
      q: 'What happens after my Free Trial ends?',
      a: 'We will send you reminders with upcoming billing estimates before your trial ends. When the free trial ends, you will be charged the then-current monthly fee.'
    },
    {
      q: 'Can I cancel during the free trial?',
      a: 'If you cancel your subscription during the free trial, you will not be charged for any services. You can pause or delete your account at any time.'
    },
    {
      q: 'How do I add SMS marketing?',
      a: 'SMS marketing is available in select markets with a paid plan. After you agree to the terms and get approved, you can purchase SMS credits.'
    },
    {
      q: 'How do SMS credits work?',
      a: 'Credits are purchased in blocks as an add-on to a paid monthly plan. Credit blocks are automatically re-purchased each month. Unused credits expire monthly.'
    },
    {
      q: 'Can I buy email credits instead?',
      a: 'Yes. If you send emails infrequently and prefer to pay as you go, you can buy email credits as an alternative to a monthly plan.'
    },
    {
      q: 'Do prices vary by currency?',
      a: 'Yes. Prices are displayed in multiple currencies for your convenience. All prices are converted from USD at current exchange rates and may vary slightly based on market conditions. The currency you select will be used throughout your purchase process.'
    },
    {
      q: 'Do you have plans for high-volume senders?',
      a: 'Yes. If you have more than 200,000 contacts, we have a high-volume plan that can meet your needs.'
    }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderFeatureValue = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-[#c2831f] mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-gray-400 mx-auto" />;
    return <span className="text-sm text-gray-300 text-center block px-2">{value}</span>;
  };

  const PlanCard = ({ planKey, plan }) => {
    const pricing = getCurrentPricing();
    const priceUSD = planKey === 'free' ? 0 : pricing[planKey];
    const price = convertPrice(priceUSD);
    const originalPriceUSD = planKey === 'free' ? 0 : (priceUSD * 2);
    const originalPrice = convertPrice(originalPriceUSD);
    const yearlyPriceUSD = planKey === 'free' ? 0 : (originalPriceUSD * 12);
    const yearlyPrice = convertPrice(yearlyPriceUSD);
    const currencySymbol = getCurrencySymbol();
    const Icon = plan.icon;
    
    const planContactLimit = getPlanContactLimit(planKey);
    const planAvailable = isPlanAvailable(planKey);
    
    let emailSendLimit;
    if (planKey === 'free') {
      emailSendLimit = plan.emailLimit;
    } else {
      emailSendLimit = contactCount * plan.emailMultiplier;
    }
    
    const displayContactCount = planKey === 'free' ? Math.min(contactCount, 500) : contactCount;
    
    return (
      <div className={`relative bg-gray-900 rounded-2xl border-2 ${
        plan.popular ? 'border-[#c2831f] shadow-lg' : 
        !planAvailable ? 'border-gray-800 opacity-60' : 'border-gray-700'
      } overflow-hidden transition-all hover:scale-[1.02] flex flex-col h-full`}>
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 bg-[#c2831f] text-white text-center py-2 text-sm font-bold z-10">
            {plan.badge.toUpperCase()}
          </div>
        )}
        
        {!planAvailable && (
          <div className="absolute top-0 left-0 right-0 bg-gray-700 text-white text-center py-2 text-sm font-bold z-10">
            NOT AVAILABLE
          </div>
        )}
        
        <div className={`p-6 flex-1 flex flex-col ${plan.popular ? 'pt-14' : ''} ${!planAvailable ? 'pt-14' : ''}`}>
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <Icon className={`w-8 h-8 ${plan.color} mr-3`} />
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-6 min-h-[60px]">{plan.tagline}</p>

          <div className="mb-6 border-b border-gray-700 pb-6">
            {planKey === 'free' && (
              <div className="text-4xl font-bold text-white mb-1">
                {formatPrice(0)}
                <span className="text-lg text-gray-300 font-normal"> per month</span>
              </div>
            )}
            {planKey !== 'free' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-baseline">
                  <div className="text-4xl font-bold text-white">
                    {formatPrice(priceUSD)}
                    <span className="text-lg text-gray-300 font-normal">/mo</span>
                  </div>
                   <div className="ml-0 sm:ml-2 text-green-500 font-bold text-sm">
                    50% OFF
                  </div>
                </div>
                <div className="ml-0 sm:ml-3 text-lg text-gray-400 line-through">
                    {formatPrice(originalPriceUSD)}
                  </div>
                
                <div className="mt-3">
                  <div className="text-sm text-gray-300">12 months: <span className="font-semibold text-white">{formatPrice(yearlyPriceUSD)}/yr</span></div>
                </div>
              </>
            )}
            {plan.disclaimer && (
              <p className="text-xs text-gray-400 mt-2">{plan.disclaimer}</p>
            )}
          </div>

          <div className="mb-6 bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Contacts:</span>
              <span className="text-sm font-semibold text-white">
                {planKey === 'free' ? 'Up to 500' : displayContactCount.toLocaleString()}
                {planKey !== 'free' && planKey !== 'premium' && ` (Limit: ${planContactLimit.toLocaleString()})`}
                {planKey === 'premium' && ' (Unlimited)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Email Sends:</span>
              <span className="text-sm font-semibold text-white">{emailSendLimit.toLocaleString()}/mo</span>
            </div>
          </div>

          <div className="mb-6 flex-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Key Plan Features</h4>
            <div className="space-y-3">
              {keyPlanFeatures[planKey].map((feature, idx) => (
                <div key={idx} className="border-b border-gray-800 pb-2 last:border-0">
                  <div className="text-xs text-gray-400 mb-1">{feature.label}</div>
                  <div className="text-sm text-white font-medium">{feature.value}</div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => handlePlanSelection(plan.name, planKey)}
            disabled={!planAvailable}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center transition-all mt-auto ${
              plan.popular 
                ? 'bg-[#c2831f] text-white hover:bg-[#d0a042]' 
                : planAvailable
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {planAvailable ? plan.cta : 'Upgrade Required'}
            {planAvailable && <ArrowRight className="w-5 h-5 ml-2" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12 mt-15">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 py-5 text-[#c2831f]">
            Pricing Plans
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Choose the plan that fits your business needs. All plans include powerful email marketing, automation, and analytics.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Count Selector */}
            <div>
              <label className="block text-center text-sm font-medium text-gray-300 mb-3">
                Number of Contacts
              </label>
              <div className="relative">
                <select 
                  value={contactCount}
                  onChange={(e) => setContactCount(Number(e.target.value))}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[#c2831f] focus:outline-none"
                >
                  {contactTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label} contacts
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {contactCount > 500 && (
                <p className="text-sm text-yellow-400 mt-2 text-center">
                  Free plan is not available for more than 500 contacts
                </p>
              )}
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-center text-sm font-medium text-gray-300 mb-3">
                Select Your Currency
              </label>
              <div className="relative">
                <select 
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:border-[#c2831f] focus:outline-none"
                >
                  {Object.entries(currencyRates).map(([code, data]) => (
                    <option key={code} value={code}>
                      {data.symbol} {code} - {data.name}
                    </option>
                  ))}
                </select>
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Object.entries(plans).map(([key, plan]) => (
            <PlanCard key={key} planKey={key} plan={plan} />
          ))}
        </div>

        <div className="text-center mb-12">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all"
          >
            {showComparison ? 'Hide' : 'Compare'} All Features
            {showComparison ? <ChevronUp className="ml-2 w-5 h-5" /> : <ChevronDown className="ml-2 w-5 h-5" />}
          </button>
        </div>

        {showComparison && (
          <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden mb-16">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-300 sticky left-0 bg-gray-800 z-10 min-w-[200px]">Features</th>
                    <th className="p-4 font-semibold text-center min-w-[150px]">
                      <div className="flex items-center justify-center">
                        <Gift className="w-5 h-5 text-green-400 mr-2" />
                        Free
                      </div>
                      <span className="text-xs text-gray-400 block mt-1">Up to 500 contacts</span>
                    </th>
                    <th className="p-4 font-semibold text-center min-w-[150px]">
                      <div className="flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400 mr-2" />
                        Essentials
                      </div>
                      <span className="text-xs text-gray-400 block mt-1">Up to 5,000 contacts</span>
                    </th>
                    <th className="p-4 font-semibold text-center min-w-[150px] bg-[#c2831f]/10">
                      <div className="flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#c2831f] mr-2" />
                        Standard
                      </div>
                      <span className="text-xs bg-[#c2831f] text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                        Best value
                      </span>
                      <span className="text-xs text-gray-300 block mt-1">Up to 100,000 contacts</span>
                    </th>
                    <th className="p-4 font-semibold text-center min-w-[150px]">
                      <div className="flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-400 mr-2" />
                        Premium
                      </div>
                      <span className="text-xs text-gray-400 block mt-1">Unlimited contacts</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureCategories.map((category, categoryIdx) => (
                    <React.Fragment key={category.name}>
                      <tr className="bg-gray-800 border-t-2 border-gray-700">
                        <td 
                          colSpan={5} 
                          className="p-4 sticky left-0 z-10 bg-gray-800"
                        >
                          <div className="flex items-center">
                            <category.icon className="w-5 h-5 text-[#c2831f] mr-3" />
                            <span className="font-semibold text-lg text-white">{category.name}</span>
                          </div>
                        </td>
                      </tr>
                      {category.features.map((feature, featureIdx) => (
                        <tr 
                          key={featureIdx} 
                          className={`border-t border-gray-700 hover:bg-gray-800 transition-colors ${
                            featureIdx % 2 === 0 ? 'bg-gray-900' : ''
                          }`}
                        >
                          <td className="p-4 text-gray-300 sticky left-0 bg-inherit z-10">
                            {feature.name}
                          </td>
                          <td className="p-4 text-center">{renderFeatureValue(feature.free)}</td>
                          <td className="p-4 text-center">{renderFeatureValue(feature.essentials)}</td>
                          <td className="p-4 text-center bg-[#c2831f]/5">{renderFeatureValue(feature.standard)}</td>
                          <td className="p-4 text-center">{renderFeatureValue(feature.premium)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#c2831f]">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedSections[`faq-${idx}`];
              return (
                <div key={idx} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <button
                    onClick={() => toggleSection(`faq-${idx}`)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                  >
                    <h3 className="font-semibold text-lg text-white pr-4">{faq.q}</h3>
                    {isExpanded ? 
                      <ChevronUp className="w-5 h-5 text-[#c2831f] flex-shrink-0" /> : 
                      <ChevronDown className="w-5 h-5 text-[#c2831f] flex-shrink-0" />
                    }
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#c2831f]/20 via-[#c2831f]/30 to-[#c2831f]/20 rounded-2xl border-2 border-[#c2831f]/50 p-8 sm:p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#c2831f]">Ready to Get Started?</h2>
            <p className="text-gray-200 mb-8 text-lg">
              Join thousands of businesses using our platform to grow their audience and increase revenue with powerful email marketing tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => handlePlanSelection("Standard", "standard")}
                className="px-8 py-4 bg-[#c2831f] text-white rounded-xl font-semibold hover:bg-[#d0a042] transition-all flex items-center justify-center"
              >
                Buy Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <Link 
                to="/login"
                className="px-8 py-4 bg-gray-800 border-2 border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-500 max-w-4xl mx-auto space-y-2">
          <p>*Terms and conditions apply. Statistics based on platform user data.</p>
          <p>Prices may vary globally depending on your region and selected currency.</p>
          <p>Currency conversions are approximate and based on current exchange rates.</p>
          <p>Selected currency: {selectedCurrency} {currencyRates[selectedCurrency].symbol}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;