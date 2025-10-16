// src/pages/Pricing/PricingDash.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheckBig, CircleDot, User, Mail, Headphones, Check, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { setUserPlan } from "../../utils/PlanAccessControl";

const PricingDash = () => {
  const navigate = useNavigate();
  const [pricingType, setPricingType] = useState("monthly");
  const [selectedContacts, setSelectedContacts] = useState(500);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Currency exchange rates (relative to USD)
  const exchangeRates = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    INR: 88.12,
    AUD: 1.52,
    CAD: 1.36,
    JPY: 149.62,
    NZD: 1.66,
    NOK: 10.65,
    SEK: 10.75,
    CHF: 0.89,
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
    NZD: "NZ$",
    NOK: "kr",
    SEK: "kr",
    CHF: "CHF",
  };

  const formatPrice = (price) => {
    const convertedPrice = price * exchangeRates[selectedCurrency];
    const symbol = currencySymbols[selectedCurrency];
    if (selectedCurrency === "JPY") {
      return `${symbol}${Math.round(convertedPrice)}`;
    } else if (selectedCurrency === "CHF") {
      return `${Math.round(convertedPrice * 100) / 100} ${symbol}`;
    } else {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  // Per contact pricing rates
  const perContactRates = {
    essentials: {
      500: 0.05,
      2500: 0.05,
      5000: 0.05,
      10000: 0.04,
      20000: 0.04,
      30000: 0.03,
      40000: 0.03,
      50000: 0.03
    },
    standard: {
      500: 0.08,
      2500: 0.07,
      5000: 0.07,
      10000: 0.07,
      20000: 0.07,
      30000: 0.07,
      40000: 0.07,
      50000: 0.07
    },
    premium: {
      500: 0.10,
      2500: 0.09,
      5000: 0.08,
      10000: 0.07,
      20000: 0.07,
      30000: 0.06,
      40000: 0.06,
      50000: 0.06
    }
  };

  const contactTiers = [
    { value: 500, label: "500" },
    { value: 2500, label: "2,500" },
    { value: 5000, label: "5,000" },
    { value: 10000, label: "10,000" },
    { value: 20000, label: "20,000" },
    { value: 30000, label: "30,000" },
    { value: 40000, label: "40,000" },
    { value: 50000, label: "50,000" },
  ];

  const plans = [
    { 
      name: "Free", 
      tagline: "Easily create email campaigns and learn more about your customers", 
      basePrice: 0, 
      users: 1, 
      support: "Basic Support", 
      contactLimit: 500, 
      emailSendsPerContact: 0, 
      emailValidationPerContact: 0,
      hasWhatsApp: false,
      hasCRM: false
    },
    { 
      name: "Essentials", 
      tagline: "Send the right content at the right time with testing and scheduling features", 
      users: 3, 
      support: "Standard Support", 
      contactLimit: 50000,
      emailSendsPerContact: 1,
      emailValidationPerContact: 0,
      hasWhatsApp: false,
      hasCRM: false,
      isDiscounted: true 
    },
    { 
      name: "Standard", 
      tagline: "Sell even more with personalization, optimization tools, and enhanced automations", 
      users: 5, 
      support: "Priority Support", 
      contactLimit: 50000,
      emailSendsPerContact: 1,
      emailValidationPerContact: 1,
      hasWhatsApp: false,
      hasCRM: false,
      highlight: true, 
      isDiscounted: true 
    },
    { 
      name: "Premium", 
      tagline: "Scale fast with dedicated onboarding, unlimited contacts, and priority support; built for teams", 
      users: "Unlimited", 
      support: "Dedicated Support", 
      features: ["Email marketing", "Email validation", "SMS marketing", "WhatsApp campaigns", "CRM access", "Advanced automation", "A/B testing", "Priority support", "Custom integrations"], 
      contactLimit: Infinity,
      emailSendsPerContact: 1,
      emailValidationPerContact: 1,
      hasWhatsApp: true,
      hasSMS: true,
      hasCRM: true,
      isDiscounted: true 
    },
  ];

  const features = [
    { category: "Email Marketing", items: [
      { name: "Email Campaigns", plans: [true, true, true, true] },
      { name: "Email Templates", plans: ["Basic", "30+", "50+", "100+"] },
      { name: "Drag & Drop Email Builder", plans: [true, true, true, true] },
      { name: "Dynamic Content", plans: [false, true, true, true] },
      { name: "Send Time Optimization", plans: [false, false, true, true] },
      { name: "Email Sends per Contact", plans: ["—", "1", "1", "1"] },
      { name: "Email Validations per Contact", plans: ["—", "—", "1", "1"] },
    ]},
    { category: "Marketing Automation", items: [
      { name: "Customer Journey Builder", plans: [false, true, true, true] },
      { name: "Pre-built Automations", plans: ["—", "5", "15", "Unlimited"] },
      { name: "Behavioral Targeting", plans: [false, false, true, true] },
      { name: "Advanced Segmentation", plans: [false, false, true, true] },
      { name: "Predictive Segmentation", plans: [false, false, false, true] },
    ]},
    { category: "Testing & Optimization", items: [
      { name: "A/B Testing", plans: [false, false, true, true] },
      { name: "Multivariate Testing", plans: [false, false, false, true] },
      { name: "Campaign Recommendations", plans: [false, false, true, true] },
    ]},
    { category: "Analytics & Reporting", items: [
      { name: "Basic Reporting", plans: [true, true, true, true] },
      { name: "Advanced Analytics", plans: [false, false, true, true] },
      { name: "Custom Reports", plans: [false, false, false, true] },
      { name: "Comparative Reports", plans: [false, false, true, true] },
      { name: "Revenue Tracking", plans: [false, false, true, true] },
    ]},
    { category: "Contacts & Audience", items: [
      { name: "Contact Storage", plans: ["500", "50,000", "50,000", "Unlimited"] },
      { name: "Audiences", plans: ["1", "1", "1", "Unlimited"] },
      { name: "Signup Forms", plans: [true, true, true, true] },
      { name: "Landing Pages", plans: ["1", "5", "15", "Unlimited"] },
    ]},
    { category: "SMS & Messaging", items: [
      { name: "SMS Campaigns", plans: [false, true, true, true] },
      { name: "SMS Automation", plans: [false, false, true, true] },
      { name: "WhatsApp Campaigns", plans: [false, false, false, true] },
    ]},
    { category: "CRM & Integration", items: [
      { name: "CRM Access", plans: [false, false, false, true] },
      { name: "Custom Integrations", plans: [false, false, false, true] },
    ]},
    { category: "Support", items: [
      { name: "Support Level", plans: ["Basic Support", "Standard Support", "Priority Support", "Dedicated Support"] },
      { name: "Email & Chat Support", plans: ["Limited", "24/7", "24/7", "24/7"] },
      { name: "Phone Support", plans: [false, true, true, true] },
      { name: "Dedicated Account Manager", plans: [false, false, true, true] },
      { name: "Onboarding & Training", plans: [false, false, false, true] },
    ]},
  ];

  const getPlanContactLimit = (planName) =>
    ({ free: 500, essentials: 50000, standard: 50000, premium: Infinity }[planName.toLowerCase()] || selectedContacts);

  const isPlanAvailable = (planName) => selectedContacts <= getPlanContactLimit(planName);

  const calculateEmailSends = (plan, contacts) =>
    plan.name === "Free" ? 1000 : contacts * plan.emailSendsPerContact;
  
  const calculateEmailValidations = (plan, contacts) =>
    contacts * plan.emailValidationPerContact;

  const calculatePrice = (plan, contacts) => {
    if (plan.name === "Free") return 0;
    
    const planKey = plan.name.toLowerCase();
    const rates = perContactRates[planKey];
    
    if (!rates) return 0;
    
    // Find the appropriate rate for the contact tier
    let rate = 0;
    if (contacts <= 500) rate = rates[500];
    else if (contacts <= 2500) rate = rates[2500];
    else if (contacts <= 5000) rate = rates[5000];
    else if (contacts <= 10000) rate = rates[10000];
    else if (contacts <= 20000) rate = rates[20000];
    else if (contacts <= 30000) rate = rates[30000];
    else if (contacts <= 40000) rate = rates[40000];
    else rate = rates[50000];
    
    return contacts * rate;
  };

  const calculateDiscountedPrice = (fullPrice, isNewCustomer) => {
    return isNewCustomer ? fullPrice * 0.5 : fullPrice;
  };

  const handleBuyNow = (plan, contacts) => {
    const isLoggedIn = !!localStorage.getItem("authToken");
    const hasPurchasedBefore = localStorage.getItem("hasPurchasedBefore") === "true";
    
    const monthlyFullPrice = parseFloat(calculatePrice(plan, contacts));
    const isNewCustomer = !hasPurchasedBefore;
    const monthlyPrice = calculateDiscountedPrice(monthlyFullPrice, isNewCustomer);
    
    const multiplier = 
      pricingType === "yearly" ? 12 : 
      pricingType === "quarterly" ? 3 : 1;
    const price = monthlyPrice * multiplier;
    const originalPrice = monthlyFullPrice * multiplier;

    const emailSendLimit = calculateEmailSends(plan, contacts);
    const emailValidationLimit = calculateEmailValidations(plan, contacts);

// Convert to selected currency before sending to signin or payment
const convertedBasePrice = price * exchangeRates[selectedCurrency];
const convertedOriginalPrice = originalPrice * exchangeRates[selectedCurrency];
const convertedTotal = convertedBasePrice * 1.1;

const planDetails = {
  planName: plan.name,
  basePrice: convertedBasePrice,
  originalBasePrice: convertedOriginalPrice,
  discountApplied: isNewCustomer,
  discount: isNewCustomer ? 0.5 : 0,
  discountAmount: isNewCustomer ? convertedOriginalPrice * 0.5 : 0,
  billingPeriod: pricingType,
  total: convertedTotal,
  totalCost: convertedTotal,
  contactCount: contacts,
  slots: contacts,
  emailSends: emailSendLimit,
  emailValidations: emailValidationLimit,
  hasWhatsApp: plan.hasWhatsApp,
  hasCRM: plan.hasCRM,
  isFromPricingDash: true,
  isNewUser: isNewCustomer,
  currency: selectedCurrency,
};


    localStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    sessionStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    localStorage.setItem("pendingPlanUpgrade", plan.name);

    navigate(isLoggedIn ? "/payment" : "/signin", {
      state: { plan: planDetails, redirectTo: "/payment" },
    });
  };

  const standardPlan = plans[2];
  const fullPrice = calculatePrice(standardPlan, selectedContacts);
  const hasPurchasedBefore = localStorage.getItem("hasPurchasedBefore") === "true";
  const isNewCustomer = !hasPurchasedBefore;
  const discountedPrice = calculateDiscountedPrice(fullPrice, isNewCustomer);
  const emailSends = calculateEmailSends(standardPlan, selectedContacts);

  const renderCell = (val, idx) => (
    <td key={idx} className="text-center py-3 px-3">
      {typeof val === "boolean"
        ? val
          ? <Check size={16} className="text-green-500 mx-auto" />
          : <X size={16} className="text-red-500 mx-auto" />
        : val}
    </td>
  );

  return (
    <DashboardLayout>
      <div className="text-white min-h-screen py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
         

          {/* Header with Contact and Currency Selector */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <h2 className="text-2xl font-bold text-[#c2831f] mb-4 md:mb-0">Choose Plans</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-gray-400">Contacts:</label>
                <select className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm" value={selectedContacts} onChange={(e) => setSelectedContacts(Number(e.target.value))}>
                  {contactTiers.map((tier) => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-gray-400">Currency:</label>
                <select className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm" value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="NZD">NZD (NZ$)</option>
                  <option value="NOK">NOK (kr)</option>
                  <option value="SEK">SEK (kr)</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monthly/Quarterly/Yearly Toggle */}
          <div className="flex justify-center mb-30">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {["monthly", "quarterly", "yearly"].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`px-6 py-3 text-sm font-medium ${
                    type === "monthly"
                      ? "rounded-l-lg"
                      : type === "yearly"
                      ? "rounded-r-lg"
                      : ""
                  } ${
                    pricingType === type
                      ? "bg-[#c2831f] text-black"
                      : "bg-[#1e1e1e] text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setPricingType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Plans
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const monthlyFullPrice = parseFloat(calculatePrice(plan, selectedContacts));
              const multiplier = 
                pricingType === "yearly" ? 12 : 
                pricingType === "quarterly" ? 3 : 1;
              const price = monthlyFullPrice * multiplier;
              const planAvailable = isPlanAvailable(plan.name);
              const isNewCustomer = !localStorage.getItem("hasPurchasedBefore");
              const discountedPrice = calculateDiscountedPrice(monthlyFullPrice, isNewCustomer) * multiplier;

              return (
                <div
                  key={plan.name}
                  className={`bg-[#111] rounded-xl p-6 border relative shadow transition ${
                    plan.highlight
                      ? "border-yellow-500 -mt-10 z-10"
                      : "border-gray-700"
                  } ${!planAvailable ? "opacity-60" : ""}`}
                >
                  {plan.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">Best value</div>}
                  {!planAvailable && <div className="absolute top-0 left-0 right-0 bg-gray-700 text-white text-center py-2 text-sm font-bold z-10">NOT AVAILABLE</div>}
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.tagline}</p>
                  <div className="mb-4">
                    {plan.name === "Free" ? (
                      <div className="text-2xl font-bold">{formatPrice(price)}<span className="text-sm font-normal text-gray-500">/month</span></div>
                    ) : (
                      <>
                        {isNewCustomer && plan.isDiscounted ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <div className="text-xl line-through text-gray-500">{formatPrice(price)}<span className="text-sm font-normal text-gray-500">/{pricingType}</span></div>
                              <div className="text-2xl font-bold">{formatPrice(discountedPrice)}<span className="text-sm font-normal text-gray-500">/{pricingType}</span></div>
                            </div>
                            <div className="text-sm text-green-400 font-semibold">50% OFF for new customers!</div>
                          </>
                        ) : (
                          <div className="text-2xl font-bold">{formatPrice(price)}<span className="text-sm font-normal text-gray-500">/{pricingType}</span></div>
                        )}
                      </>
                    )}
                  </div>
                  <ul className="text-sm text-gray-300 mb-4 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <User size={16} /> Users: {plan.users}
                    </li>

                    <li className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail size={16} /> 
                        <span>
                          Email Sends:{" "}
                          {plan.name === "Free"
                            ? "1,000"
                            : `${selectedContacts.toLocaleString()} `}
                        </span>
                      </div>

                      {plan.name !== "Free" && (
                        <div className="ml-6 text-xs text-gray-400">
                          {(() => {
                            const planKey = plan.name.toLowerCase();
                            const rates = perContactRates[planKey];
                            if (!rates) return null;

                            let rate = 0;
                            if (selectedContacts <= 500) rate = rates[500];
                            else if (selectedContacts <= 2500) rate = rates[2500];
                            else if (selectedContacts <= 5000) rate = rates[5000];
                            else if (selectedContacts <= 10000) rate = rates[10000];
                            else if (selectedContacts <= 20000) rate = rates[20000];
                            else if (selectedContacts <= 30000) rate = rates[30000];
                            else if (selectedContacts <= 40000) rate = rates[40000];
                            else rate = rates[50000];

                            return (
                              <>Cost per contact: <span className="text-[#c2831f] font-semibold">{formatPrice(rate)}</span></>
                            );
                          })()}
                        </div>
                      )}
                    </li>


                    {plan.emailValidationPerContact > 0 && (
                      <li className="flex items-center gap-2">
                        <Check size={16} /> Email Validations:{" "}
                        {`${selectedContacts.toLocaleString()} (${plan.emailValidationPerContact} per contact)`}
                      </li>
                    )}

                    {plan.hasWhatsApp && (
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> WhatsApp Campaigns
                      </li>
                    )}
                    {plan.hasSMS && (
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> SMS Campaigns
                      </li>
                    )}

                    {plan.hasCRM && (
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" /> CRM Access
                      </li>
                    )}

                    <li className="flex items-center gap-2">
                      <Headphones size={16} /> Support: {plan.support}
                    </li>

              
                  </ul>

                  {/* <div className="mb-3 text-sm text-left">
                    <p className="text-gray-400 font-semibold mb-1">Features:</p>
                    <ul className="pl-1 space-y-1">{plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-gray-300"><Check size={14} className="text-green-500" />{f}</li>)}</ul>
                  </div> */}
                  <button
                    onClick={() => handleBuyNow(plan, selectedContacts)}
                    className={`mt-5 w-full font-semibold py-2 rounded cursor-pointer ${
                      plan.name === "Free"
                        ? "bg-gray-700 text-gray-400"
                        : planAvailable
                        ? "bg-[#c2831f] text-black hover:bg-[#dba743]"
                        : "bg-gray-700 text-gray-400"
                    }`}
                    disabled={plan.name === "Free" || !planAvailable}
                  >
                    {plan.name === "Free"
                      ? "Current Plan"
                      : planAvailable
                      ? "Buy Now"
                      : "Upgrade Required"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#c2831f] mb-6 text-center">Compare All Features</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 w-1/4">Features</th>
                    {plans.map((plan) => <th key={plan.name} className="text-center py-4 px-3 font-semibold">{plan.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {features.map((cat, catIdx) => (
                    <React.Fragment key={catIdx}>
                      <tr className="bg-gray-800"><td colSpan={5} className="py-2 px-4 font-semibold text-base">{cat.category}</td></tr>
                      {cat.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b border-gray-800 hover:bg-gray-900">
                          <td className="py-3 px-4">{item.name}</td>
                          {item.plans.map((val, idx) => renderCell(val, idx))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">All plans billed {pricingType} in {selectedCurrency} unless specified otherwise. Pricing based on per-contact rates.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingDash;