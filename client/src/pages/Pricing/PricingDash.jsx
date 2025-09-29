// PricingDash.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleCheckBig, CircleDot, User, Mail, Headphones } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const PricingDash = () => {
  const navigate = useNavigate();

  // Contacts options
  const contactOptions = [500, 1000, 2500, 5000, 10000];

  // Promo state
  const [promoContacts, setPromoContacts] = useState(500);

  // Card state
  const [cardContacts, setCardContacts] = useState(500);

  // Plans
  const plans = [
    {
      name: "Standard",
      basePrice: 1149.71, // Base price for 500 contacts
      users: 1,
      emails: "5,000",
      support: "Standard Support",
      features: ["Basic Reports", "Email Validation", "1 Integration"],
    },
    {
      name: "Pro",
      basePrice: 2299.99, // Base price for 500 contacts
      users: 5,
      emails: "20,000",
      support: "Priority Support",
      features: ["Advanced Reports", "Bulk Verification", "Unlimited Integrations"],
      highlight: true,
    },
    {
      name: "Enterprise",
      basePrice: 4599.99, // Base price for 500 contacts
      users: "Unlimited",
      emails: "100,000+",
      support: "Dedicated Support",
      features: ["Custom Solutions", "Dedicated Manager", "SLA Uptime"],
    },
  ];

  // Price calculators
  const calculatePrice = (basePrice, contacts) => {
    // Calculate price based on base price for 500 contacts
    const baseContacts = 500;
    const pricePerContact = basePrice / baseContacts;
    return (pricePerContact * contacts).toFixed(2);
  };

  // Get Pro plan for promo calculations
  const proPlan = plans.find(plan => plan.name === "Pro");
  const promoBasePrice = proPlan ? proPlan.basePrice * 0.5 : 37.5; // 50% off Pro plan
  const promoPrice = calculatePrice(promoBasePrice, promoContacts);

  const calculatedPrices = plans.reduce((acc, plan) => {
    acc[plan.name] = calculatePrice(plan.basePrice, cardContacts);
    return acc;
  }, {});

  // Build plan object
  const buildPlanObject = ({
    planName,
    basePrice,
    totalCost,
    slots,
    billingPeriod,
    baseContacts,
    pricingModel,
  }) => {
    return {
      planName,
      basePrice,
      totalCost,
      slots,
      selectedIntegrations: [],
      additionalSlotsCost: totalCost - basePrice,
      integrationCosts: 0,
      billingPeriod,
      isFromPricingDash: true,
      baseContacts,
      pricingModel,
    };
  };

  // Handle Buy Now
  const handleBuyNow = (plan, contacts, price) => {
    // Calculate base price for selected contacts
    const basePriceForContacts = parseFloat(calculatePrice(plan.basePrice, contacts));
    
    const selectedPlan = buildPlanObject({
      planName: plan.name,
      basePrice: basePriceForContacts, // Use calculated base price
      totalCost: parseFloat(price),
      slots: contacts,
      billingPeriod: "month",
      baseContacts: contacts, // Update baseContacts to selected contacts
      pricingModel: "multiplier",
    });

    localStorage.setItem("pendingUpgradePlan", JSON.stringify(selectedPlan));

    const isLoggedIn = !!localStorage.getItem("authToken");

    if (!isLoggedIn) {
      navigate("/signin", {
        state: {
          plan: selectedPlan,
          redirectTo: "/payment",
        },
      });
    } else {
      navigate("/payment", {
        state: { plan: selectedPlan },
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="text-white min-h-screen py-10 px-4 mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Promo Section */}
          <div className="rounded-xl p-8 md:flex md:items-center md:justify-between shadow-xl border border-gray-700 bg-[#111]">
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-[#c2831f] mb-4">
                Try our Pro Plan for 50% off!
              </h2>
              <p className="text-gray-400 mb-6 max-w-xl">
                Unlock advanced deliverability tools, AI insights, and priority
                support. Save 50% for 12 months and scale your outreach with
                confidence.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white">
                <li className="flex items-center gap-2">
                  <CircleCheckBig size={16} className="text-[#c2831f]" /> AI
                  Optimization & A/B Testing
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheckBig size={16} className="text-[#c2831f]" /> Priority
                  Support & Deliverability Boost
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheckBig size={16} className="text-[#c2831f]" /> Unlimited
                  Templates
                </li>
                <li className="flex items-center gap-2">
                  <CircleCheckBig size={16} className="text-[#c2831f]" /> Advanced
                  Reporting Dashboard
                </li>
              </ul>
            </div>
            <div className="bg-gray-200 text-black p-6 rounded-xl mt-8 md:mt-0 md:w-1/3 shadow-lg">
              <h3 className="text-lg font-semibold">Pro Plan</h3>
              <p className="text-sm text-gray-600 mb-2">
                Send up to <strong>{promoContacts * 12}</strong> emails/month
              </p>
              <label className="block text-sm font-medium text-gray-700 mt-2">
                Contacts
              </label>
              <select
                className="w-full mt-1 border border-gray-300 rounded px-3 py-2 text-sm"
                value={promoContacts}
                onChange={(e) => setPromoContacts(Number(e.target.value))}
              >
                {contactOptions.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              <div className="mt-4 text-xl font-bold">${promoPrice}</div>
              <p className="text-xs text-gray-500">
                Then ${calculatePrice(proPlan ? proPlan.basePrice : 2299.99, promoContacts)} after 12 months
              </p>
              <button
                onClick={() =>
                  handleBuyNow(
                    {
                      name: "Pro Plan",
                      basePrice: promoBasePrice,
                      users: 5,
                      emails: "10,000",
                      support: "Priority Support",
                    },
                    promoContacts,
                    promoPrice
                  )
                }
                className="mt-4 w-full bg-[#c2831f] text-black font-semibold py-2 rounded hover:bg-[#dba743] cursor-pointer"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
              <h2 className="text-2xl font-bold text-[#c2831f] mb-4 md:mb-0">
                Choose Plans
              </h2>
              <div className="flex items-center">
                <label className="text-sm font-medium text-gray-300 mr-3">
                  Select contact:
                </label>
                <select
                  className="bg-[#1e1e1e] text-white border border-gray-600 rounded px-3 py-1 text-sm"
                  value={cardContacts}
                  onChange={(e) => setCardContacts(Number(e.target.value))}
                >
                  {contactOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-[#111] rounded-xl p-6 border border-gray-700 relative shadow transition ${
                    plan.highlight ? "border-yellow-500 -mt-10 z-10" : ""
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      Best value
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Billed monthly • ${calculatedPrices[plan.name]}
                  </p>
                  <ul className="text-sm text-gray-300 mb-4 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <User size={16} /> Users: {plan.users}
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail size={16} /> Emails: {plan.emails}
                    </li>
                    <li className="flex items-center gap-2">
                      <Headphones size={16} /> Support: {plan.support}
                    </li>
                  </ul>
                  <div className="mb-3 text-sm text-left">
                    <p className="text-gray-400 font-semibold mb-1">Features:</p>
                    <ul className="pl-1 space-y-1">
                      {plan.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-gray-300"
                        >
                          <CircleDot size={14} className="text-[#c2831f]" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() =>
                      handleBuyNow(plan, cardContacts, calculatedPrices[plan.name])
                    }
                    className="mt-5 w-full bg-[#c2831f] text-black font-semibold py-2 rounded hover:bg-[#dba743] cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-8">
            All plans billed monthly in USD. Contact amount applies across all
            plans.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingDash;