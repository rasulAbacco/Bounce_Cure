// src/pages/Pricing/PricingDash.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheckBig, CircleDot, User, Mail, Headphones, Check, X } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { setUserPlan } from '../../utils/PlanAccessControl';

const PricingDash = () => {
  const navigate = useNavigate();
  const [pricingType, setPricingType] = useState("monthly");
  const [selectedContacts, setSelectedContacts] = useState(500);

  // Updated pricing tiers with FULL PRICES (existing users pay this, new users get 50% off)
  const contactTiers = [
    { value: 500, label: "500", pricing: { essentials: 10, standard: 14, premium: 256 } },
    { value: 1000, label: "1,000", pricing: { essentials: 18, standard: 30, premium: 256 } },
    { value: 1500, label: "1,500", pricing: { essentials: 54, standard: 78, premium: 256 } },
    { value: 2500, label: "2,500", pricing: { essentials: 90, standard: 130, premium: 296 } },
    { value: 5000, label: "5,000", pricing: { essentials: 180, standard: 260, premium: 592 } },
    { value: 10000, label: "10,000", pricing: { essentials: 360, standard: 520, premium: 1184 } },
    { value: 15000, label: "15,000", pricing: { essentials: 540, standard: 780, premium: 2368 } },
    { value: 20000, label: "20,000", pricing: { essentials: 720, standard: 1040, premium: 4736 } },
    { value: 25000, label: "25,000", pricing: { essentials: 900, standard: 1300, premium: 9472 } },
    { value: 30000, label: "30,000", pricing: { essentials: 1080, standard: 1560, premium: 18944 } },
    { value: 40000, label: "40,000", pricing: { essentials: 1440, standard: 2080, premium: 37888 } },
    { value: 50000, label: "50,000", pricing: { essentials: 1800, standard: 2600, premium: 75776 } },
    { value: 75000, label: "75,000", pricing: { essentials: 2700, standard: 3900, premium: 151552 } },
    { value: 100000, label: "100,000", pricing: { essentials: 3600, standard: 5200, premium: 303104 } },
    { value: 150000, label: "150,000", pricing: { essentials: 5400, standard: 7800, premium: 606208 } },
    { value: 200000, label: "200,000", pricing: { essentials: 7200, standard: 10400, premium: 1212416 } },
    { value: 250000, label: "250,000+", pricing: { essentials: 9000, standard: 13000, premium: 2424832 } },
  ];

  const plans = [
    { name: "Free", tagline: "Easily create email campaigns and learn more about your customers", basePrice: 0, users: 1, support: "Basic Support", features: ["Email marketing", "Basic reporting", "1 audience"], contactLimit: 500, emailLimit: 1000, emailMultiplier: null },
    { name: "Essentials", tagline: "Send the right content at the right time with testing and scheduling features", users: 3, support: "Standard Support", features: ["Email marketing", "SMS marketing", "Marketing automation", "Basic support"], contactLimit: 5000, emailMultiplier: 10, isDiscounted: true },
    { name: "Standard", tagline: "Sell even more with personalization, optimization tools, and enhanced automations", users: 5, support: "Priority Support", features: ["Email marketing", "SMS marketing", "Advanced automation", "A/B testing", "24/7 support"], contactLimit: 100000, emailMultiplier: 12, highlight: true, isDiscounted: true },
    { name: "Premium", tagline: "Scale fast with dedicated onboarding, unlimited contacts, and priority support; built for teams", users: "Unlimited", support: "Dedicated Support", features: ["Email marketing", "SMS marketing", "Advanced automation", "A/B testing", "Priority support", "Custom integrations"], contactLimit: Infinity, emailMultiplier: 15, isDiscounted: true },
  ];

  const features = [
    { category: "Email Marketing", items: [
      { name: "Email Campaigns", plans: [true, true, true, true] },
      { name: "Email Templates", plans: ["Basic", "30+", "50+", "100+"] },
      { name: "Drag & Drop Email Builder", plans: [true, true, true, true] },
      { name: "Dynamic Content", plans: [false, true, true, true] },
      { name: "Send Time Optimization", plans: [false, false, true, true] },
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
      { name: "Contact Storage", plans: ["500", "5,000", "100,000", "Unlimited"] },
      { name: "Audiences", plans: ["1", "1", "1", "Unlimited"] },
      { name: "Signup Forms", plans: [true, true, true, true] },
      { name: "Landing Pages", plans: ["1", "5", "15", "Unlimited"] },
    ]},
    
    { category: "SMS Marketing", items: [
      { name: "SMS Campaigns", plans: [false, true, true, true] },
      { name: "SMS Automation", plans: [false, false, true, true] },
    ]},
    { category: "Support", items: [
      { name: "Support Level", plans: ["Basic Support", "Standard Support", "Priority Support", "Dedicated Support"] },
      { name: "Email & Chat Support", plans: ["Limited", "24/7", "24/7", "24/7"] },
      { name: "Phone Support", plans: [false, true, true, true] },
      { name: "Dedicated Account Manager", plans: [false, false, true, true] },
      { name: "Onboarding & Training", plans: [false, false, false, true] },
    ]},
  ];

  const getPlanContactLimit = (planName) => ({ free: 500, essentials: 5000, standard: 100000, premium: Infinity }[planName.toLowerCase()] || selectedContacts);
  const isPlanAvailable = (planName) => selectedContacts <= getPlanContactLimit(planName);
  const calculateEmailSends = (plan, contacts) => plan.name === "Free" ? plan.emailLimit : contacts * plan.emailMultiplier;
  
  // Updated calculatePrice function - returns discounted price for new users, full price for existing
  const calculatePrice = (plan, contacts) => {
    if (plan.name === "Free") return 0;

    const tier = contactTiers.find((t) => t.value === contacts);
    if (!tier) return 0;

    const fullPrice = tier.pricing[plan.name.toLowerCase()]; // full price for existing users
    const hasPurchasedBefore = localStorage.getItem("hasPurchasedBefore") === "true";

    // For new users → apply 50% discount
    // For existing users → charge full price
    const finalPrice = hasPurchasedBefore ? fullPrice : fullPrice * 0.5;

    return finalPrice.toFixed(2);
  };

  // Updated handleBuyNow function
  const handleBuyNow = (plan, contacts, isAnnual = false) => {
    const isLoggedIn = !!localStorage.getItem("authToken");
    const hasPurchasedBefore = localStorage.getItem("hasPurchasedBefore") === "true";

    // Get the full price from tier
    const tier = contactTiers.find((t) => t.value === contacts);
    const fullPrice = tier ? tier.pricing[plan.name.toLowerCase()] : 0;
    
    // Calculate monthly price (with 50% discount for new users)
    const monthlyPrice = parseFloat(calculatePrice(plan, contacts));
    const price = isAnnual ? monthlyPrice * 12 : monthlyPrice;

    // Determine if discount applies (only for new customers)
    const isNewCustomer = !hasPurchasedBefore;
    const originalPrice = isAnnual ? fullPrice * 12 : fullPrice;

    const emailSendLimit = plan.name === "Free" ? plan.emailLimit : contacts * plan.emailMultiplier;

    const planDetails = {
      planName: plan.name,
      basePrice: price,
      originalBasePrice: originalPrice,
      discountApplied: isNewCustomer,
      discount: isNewCustomer ? 0.5 : 0,
      discountAmount: isNewCustomer ? originalPrice * 0.5 : 0,
      billingPeriod: isAnnual ? "year" : "month",
      total: price * 1.1, // including tax
      totalCost: price * 1.1, // including tax
      contactCount: contacts,
      slots: contacts,
      emails: emailSendLimit,
      emailLimit: plan.emailLimit,
      isFromPricingDash: true,
      isNewUser: isNewCustomer,
    };

    // Store purchase state
    localStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    sessionStorage.setItem("pendingUpgradePlan", JSON.stringify(planDetails));
    
    // IMPORTANT: Save the plan name to localStorage for access control
    // This will be confirmed after successful payment
    localStorage.setItem("pendingPlanUpgrade", plan.name);

    navigate(isLoggedIn ? "/payment" : "/signin", {
      state: { plan: planDetails, redirectTo: "/payment" },
    });
  };

  const standardPlan = plans[2];
  const promoPrice = calculatePrice(standardPlan, selectedContacts);
  const emailSends = calculateEmailSends(standardPlan, selectedContacts);

  const renderCell = (val, idx) => (
    <td key={idx} className="text-center py-3 px-3">
      {typeof val === "boolean" ? (val ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-red-500 mx-auto" />) : val}
    </td>
  );

  return (
    <DashboardLayout>
      <div className="text-white min-h-screen py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Promo Section */}
          <div className="rounded-xl p-8 md:flex md:items-center md:justify-between shadow-xl border border-gray-700 bg-[#111]">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-[#c2831f] mb-4">Try our Standard plan for 50% off!</h2>
              <p className="text-gray-400 mb-6 max-w-xl">Unlock advanced deliverability tools, AI insights, and priority support. Save 50% for 12 months and scale your outreach with confidence.</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white">
                {["Generative AI features", "Advanced segmentation & reporting", `Send up to ${emailSends.toLocaleString()} emails each month`, `Contacts: ${selectedContacts.toLocaleString()}`].map((txt, i) => (
                  <li key={i} className="flex items-center gap-2"><CircleCheckBig size={16} className="text-[#c2831f]" /> {txt}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-200 text-black p-6 rounded-xl mt-8 md:mt-0 md:w-1/3 shadow-lg">
              <h3 className="text-lg font-semibold">Standard Plan</h3>
              <p className="text-sm text-gray-600 mb-2">Send up to <strong>{(emailSends * 12).toLocaleString()}</strong> emails/year</p>
              <div className="mt-4 text-xl font-bold">${promoPrice}<span className="text-sm font-normal text-gray-500">/month</span></div>
              <p className="text-xs text-gray-500">Then ${(parseFloat(promoPrice) * 2).toFixed(2)} after 12 months</p>
              <button onClick={() => handleBuyNow(standardPlan, selectedContacts)} className="mt-4 w-full bg-[#c2831f] text-black font-semibold py-2 rounded hover:bg-[#dba743] cursor-pointer">Buy Now</button>
            </div>
          </div>

          {/* Header with Contact Selector */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <h2 className="text-2xl font-bold text-[#c2831f] mb-4 md:mb-0">Choose Plans</h2>
            <div className="flex items-center space-x-4">
              <label className="text-gray-400">Contacts:</label>
              <select className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-2 text-sm" value={selectedContacts} onChange={(e) => setSelectedContacts(Number(e.target.value))}>
                {contactTiers.map((tier) => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
              </select>
            </div>
          </div>

          {/* Monthly/Annual Toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {["monthly", "annual"].map((type) => (
                <button key={type} type="button" className={`px-6 py-3 text-sm font-medium ${type === "monthly" ? "rounded-l-lg" : "rounded-r-lg"} ${pricingType === type ? "bg-[#c2831f] text-black" : "bg-[#1e1e1e] text-gray-300 hover:bg-gray-700"}`} onClick={() => setPricingType(type)}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Plans
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className={`grid grid-cols-1 ${pricingType === "monthly" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-6 mt-25`}>
            {(pricingType === "monthly" ? plans : plans.slice(1)).map((plan) => {
              const monthlyPrice = parseFloat(calculatePrice(plan, selectedContacts));
              const price = pricingType === "annual" ? monthlyPrice * 12 : monthlyPrice;
              const planEmailSends = calculateEmailSends(plan, selectedContacts);
              const planAvailable = isPlanAvailable(plan.name);

              return (
                <div key={plan.name} className={`bg-[#111] rounded-xl p-6 border relative shadow transition ${plan.highlight ? "border-yellow-500 -mt-10 z-10" : "border-gray-700"} ${!planAvailable ? "opacity-60" : ""}`}>
                  {plan.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">Best value</div>}
                  {!planAvailable && <div className="absolute top-0 left-0 right-0 bg-gray-700 text-white text-center py-2 text-sm font-bold z-10">NOT AVAILABLE</div>}
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.tagline}</p>
                  <div className="mb-4">
                    {pricingType === "monthly" && plan.name === "Free" ? (
                      <div className="text-2xl font-bold">${price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl font-bold">${price.toFixed(2)}<span className="text-sm font-normal text-gray-500">{pricingType === "annual" ? "/12 months" : "/mo"}</span></div>
                        </div>
                        {plan.isDiscounted && !localStorage.getItem("hasPurchasedBefore") && (
                          <div className="text-sm text-green-400 font-semibold">50% OFF for new customers!</div>
                        )}
                        {plan.isDiscounted && localStorage.getItem("hasPurchasedBefore") && (
                          <div className="text-sm text-gray-500 font-semibold">Standard price for existing users</div>
                        )}
                      </>
                    )}
                  </div>
                  <ul className="text-sm text-gray-300 mb-4 space-y-2 text-left">
                    <li className="flex items-center gap-2"><User size={16} /> Users: {plan.users}</li>
                    <li className="flex items-center gap-2"><Mail size={16} /> Email Sends: {planEmailSends.toLocaleString()}/mo</li>
                    <li className="flex items-center gap-2"><Headphones size={16} /> Support: {plan.support}</li>
                    <li className="flex items-center gap-2"><CircleDot size={16} /> Contacts: {plan.name === "Free" ? "Up to 500" : plan.name === "Premium" ? "Unlimited" : `${selectedContacts.toLocaleString()}${plan.name !== "Premium" ? ` (Limit: ${plan.contactLimit.toLocaleString()})` : ""}`}</li>
                  </ul>
                  <div className="mb-3 text-sm text-left">
                    <p className="text-gray-400 font-semibold mb-1">Features:</p>
                    <ul className="pl-1 space-y-1">{plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-gray-300"><Check size={14} className="text-green-500" />{f}</li>)}</ul>
                  </div>
                  <button onClick={() => handleBuyNow(plan, selectedContacts, pricingType === "annual")} className={`mt-5 w-full font-semibold py-2 rounded cursor-pointer ${plan.name === "Free" ? "bg-gray-700 text-gray-400" : planAvailable ? "bg-[#c2831f] text-black hover:bg-[#dba743]" : "bg-gray-700 text-gray-400"}`} disabled={plan.name === "Free" || !planAvailable}>
                    {plan.name === "Free" ? "Current Plan" : planAvailable ? "Buy Now" : "Upgrade Required"}
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

          <p className="text-center text-xs text-gray-600 mt-8">All plans billed monthly in USD unless specified otherwise. Contact amount applies across all plans.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingDash;