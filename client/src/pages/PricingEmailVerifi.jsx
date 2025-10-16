import React, { useState } from 'react';
import { Check, Mail, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

const EmailVerificationPricing = ({ selectedCurrency: propCurrency, currencyRates, onClose, navigate }) => {
  const [selectedVerificationTier, setSelectedVerificationTier] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(propCurrency || 'USD');
  const [pricingType, setPricingType] = useState("monthly");

  // ✅ Currency rates
  const rates = currencyRates || {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    INR: { symbol: '₹', rate: 88.12 },
    AUD: { symbol: 'A$', rate: 1.53 },
    CAD: { symbol: 'C$', rate: 1.36 },
    JPY: { symbol: '¥', rate: 149.5 },
    NZD: { symbol: 'NZ$', rate: 1.67 },
    NOK: { symbol: 'kr', rate: 10.87 },
    SEK: { symbol: 'kr', rate: 10.96 },
    CHF: { symbol: 'CHF', rate: 0.88 },
  };

  // ✅ Verification tiers
  const verificationTiers = [
    { credits: 10000 },
    { credits: 20000 },
    { credits: 50000 },
    { credits: 75000 },
    { credits: 100000 },
    { credits: Infinity, label: 'Unlimited' },
  ];

  // ✅ Pricing calculation logic
  const getTierPricing = (credits) => {
    let basePriceUSD = 0;
    let discountPercent = 25;

    if (credits === Infinity) {
      basePriceUSD = 1500; // Base for Unlimited
      discountPercent = 30; // 50% off for Unlimited
    } else {
      basePriceUSD = credits * 0.01; // $0.01 per verification
      discountPercent = 25; // 25% off for all tiers including 10,000
    }

    const discountedPriceUSD = basePriceUSD * (1 - discountPercent / 100);
    return { basePriceUSD, discountedPriceUSD, discountPercent };
  };

  // ✅ Currency formatting
  const formatPrice = (priceUSD) => {
    const rate = rates[selectedCurrency]?.rate || 1;
    const symbol = rates[selectedCurrency]?.symbol || '$';
    const convertedPrice = priceUSD * rate;

    if (selectedCurrency === 'JPY') return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
    if (selectedCurrency === 'CHF') return `${convertedPrice.toFixed(2)} ${symbol}`;
    return `${symbol}${convertedPrice.toFixed(2)}`;
  };

  // ✅ Navigation to buy
  const handleBuyVerification = (tier) => {
    const { basePriceUSD, discountedPriceUSD } = getTierPricing(tier.credits);
    const rate = rates[selectedCurrency]?.rate || 1;
    const convertedPrice = discountedPriceUSD * rate;

    const isUnlimited = tier.credits === Infinity;
    const verificationPlan = {
      planName: isUnlimited
        ? 'Unlimited Email Verification'
        : `${tier.credits.toLocaleString()} Email Verifications`,
      planType: 'email-verification',
      originalBasePrice: basePriceUSD * rate,
      basePrice: convertedPrice,
      discountAmount: (basePriceUSD - discountedPriceUSD) * rate,
      periodPrice: convertedPrice,
      billingPeriod: 'one-time',
      subtotal: convertedPrice,
      taxRate: 0.1,
      tax: convertedPrice * 0.1,
      totalCost: convertedPrice * 1.1,
      verificationCredits: isUnlimited ? 'Unlimited' : tier.credits,
      features: [
        'Real-time verification',
        'Syntax & format validation',
        'Domain & MX record check',
        'Disposable email detection',
        ...(isUnlimited ? ['Priority support', 'API access'] : []),
      ],
      currency: selectedCurrency,
      currencySymbol: rates[selectedCurrency]?.symbol || '$',
      isFromPricingDash: false,
      pricingModel: 'email-verification',
    };

    localStorage.setItem('pendingUpgradePlan', JSON.stringify(verificationPlan));
    sessionStorage.setItem('pendingUpgradePlan', JSON.stringify(verificationPlan));

    const isLoggedIn = !!localStorage.getItem('authToken');
    if (!isLoggedIn) {
      navigate('/signin', { state: { plan: verificationPlan, redirectTo: '/payment' } });
    } else {
      navigate('/payment', { state: { plan: verificationPlan } });
    }
  };

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔙 Back Button */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Pricing Plans</span>
          </button>
        </div>

        {/* 🧾 Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-5xl font-bold text-[#c2831f]">
              Email Verification Plans
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ensure your email lists are clean and deliverable with our professional email verification service
          </p>
        </div>

        {/* 💱 Currency Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800 rounded-xl p-3 inline-flex items-center gap-3 border-2 border-gray-700">
            <span className="text-gray-400 text-sm px-2">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg px-4 py-2 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.keys(rates).map((code) => (
                <option key={code} value={code}>
                  {code} ({rates[code].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 💰 Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {verificationTiers.map((tier, index) => {
            const { basePriceUSD, discountedPriceUSD, discountPercent } = getTierPricing(tier.credits);
            const isUnlimited = tier.credits === Infinity;
            const isPopular = tier.credits === 50000;

            return (
              <div
                key={index}
                className="relative bg-gradient-to-br from-gray-900 to-gray-900 rounded-2xl p-8 border-2 transition-all hover:scale-105 hover:shadow-xl border-yellow-900"
              >
                <div className="text-center mb-6">
                  <Mail className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-3xl font-bold mb-2">
                    {isUnlimited ? 'Unlimited' : tier.credits.toLocaleString()}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {isUnlimited ? 'Verification Credits' : 'Email Verifications'}
                  </p>
                </div>

                {/* ✅ Discount display */}
                <div className="text-center mb-8 pb-6 border-b border-gray-700">
                  <div className="text-4xl font-bold text-green-400 mb-1">
                    {formatPrice(discountedPriceUSD)}
                  </div>
                  <div className="text-gray-400 line-through mb-1">
                    {formatPrice(basePriceUSD)}
                  </div>
                  <div className="text-sm text-yellow-400 font-semibold">
                    {discountPercent}% OFF
                  </div>
                  {!isUnlimited && (
                    <div className="text-gray-400 text-sm mt-1">
                      {formatPrice(0.01)} per verification
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-2" /> Real-time verification
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-2" /> Syntax & format validation
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-2" /> Domain & MX record check
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-2" /> Disposable email detection
                  </div>
                  {isUnlimited && (
                    <>
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-2" /> Priority support
                      </div>
                      <div className="flex items-center text-sm text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-2" /> API access
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleBuyVerification(tier)}
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all"
                >
                  Buy Now <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>All verification credits are valid for one month from purchase date</p>
          <p className="mt-2">Need more? Contact us for custom enterprise solutions</p>
          <p>Selected currency: {selectedCurrency} {currencyRates[selectedCurrency].symbol}</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPricing;
