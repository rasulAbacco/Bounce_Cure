import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// Normalize plan data
const normalizePlan = (data) => {
  if (!data) return null;

  // Handle data from Pricing page
  if (data.planName && data.basePrice !== undefined) {
    return {
      planName: data.planName,
      slots: data.slots || 0,
      basePrice: Number(data.basePrice || 0),
      additionalSlotsCost: Number(data.additionalSlotsCost || 0),
      integrationCosts: Number(data.integrationCosts || 0),
      selectedIntegrations: data.selectedIntegrations || [],
      basePricing: data.basePricing,
      planType: data.planType
    };
  }

  // Handle legacy data structure
  if (data.name) {
    const basePrice = data.basePrice !== undefined ? Number(data.basePrice) : Number(data.price || 0);
    return {
      planName: data.name,
      slots: data.contacts || 0,
      basePrice,
      additionalSlotsCost: data.basePrice !== undefined
        ? Number(data.price || 0) - basePrice
        : 0,
      integrationCosts: 0,
      selectedIntegrations: [],
    };
  }

  return null;
};

// Card type detection function with corrected SVG icons
const detectCardType = (cardNumber) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  const cardTypes = {
    visa: {
      name: "Visa",
      maxLength: 16,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Crect width='48' height='48' rx='4' fill='%231A1F71'/%3E%3Cpath fill='%23FFFFFF' d='M18.8,30.5 L20.8,18.2 L23.8,18.2 L21.8,30.5 L18.8,30.5 Z M31.8,18.5 C31.1,18.2 30,18 28.7,18 C25.8,18 23.7,19.5 23.7,21.6 C23.7,23.2 25.2,24.1 26.3,24.7 C27.5,25.3 27.9,25.7 27.9,26.2 C27.9,27 26.9,27.4 26,27.4 C24.7,27.4 24,27.1 22.9,26.6 L22.5,26.4 L22,29.2 C22.8,29.6 24.2,29.9 25.7,30 C28.8,30 30.8,28.5 30.8,26.2 C30.8,24.9 30,23.9 28.2,23.1 C27.1,22.5 26.4,22.1 26.4,21.5 C26.4,21 27,20.4 28.2,20.4 C29.2,20.4 30,20.6 30.6,20.9 L30.9,21 L31.4,18.3 L31.8,18.5 Z M38,18.2 L35.5,18.2 C34.7,18.2 34.2,18.4 33.8,19.2 L29.3,30.5 L32.5,30.5 C32.5,30.5 33,29.1 33.1,28.8 C33.6,28.8 36.6,28.8 37.2,28.8 C37.3,29.2 37.7,30.5 37.7,30.5 L40.5,30.5 L38,18.2 Z M34,26.2 C34.3,25.4 35.4,22.6 35.4,22.6 C35.4,22.6 35.7,21.7 35.9,21.1 L36.2,22.5 C36.2,22.5 36.9,25.5 37.1,26.2 H34 Z M15.8,18.2 L13,26.5 C13,26.5 12.4,24.4 12.2,23.6 C10.8,20.5 8.5,19.2 8.5,19.2 L11,30.5 L14.3,30.5 L19.1,18.2 L15.8,18.2 Z'/%3E%3C/svg%3E"
    },
    mastercard: {
      name: "Mastercard",
      maxLength: 16,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Ccircle cx='17' cy='24' r='8' fill='%23EB001B'/%3E%3Ccircle cx='31' cy='24' r='8' fill='%23F79E1B'/%3E%3Cpath fill='%23FF5F00' d='M24 18a8.002 8.002 0 010 12 8.002 8.002 0 010-12z'/%3E%3C/svg%3E"
    },
    amex: {
      name: "American Express",
      maxLength: 15,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Cpath fill='%23006FCF' d='M45 35a3 3 0 01-3 3H6a3 3 0 01-3-3V13a3 3 0 013-3h36a3 3 0 013 3v22z'/%3E%3Cpath fill='%23FFFFFF' d='M14 20h-3v8h3v-8zm1 0l4 8 4-8h-3l-1 2-1-2h-3zm8 0v8h5v-2h-3v-1h3v-2h-3v-1h3v-2h-5zm7 0v2h2v6h3v-6h2v-2h-7zm8 0v8h5v-2h-3v-1h3v-2h-3v-1h3v-2h-5z'/%3E%3C/svg%3E"
    },
    discover: {
      name: "Discover",
      maxLength: 16,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Cpath fill='%23FF6000' d='M45 35a3 3 0 01-3 3H6a3 3 0 01-3-3V13a3 3 0 013-3h36a3 3 0 013 3v22z'/%3E%3Cpath fill='%23FFFFFF' d='M24 30c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z'/%3E%3Cpath fill='%23FFFFFF' d='M24 20c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z'/%3E%3C/svg%3E"
    }
  };

  const cleanedNumber = cardNumber.replace(/\s/g, "");

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanedNumber)) {
      return cardTypes[type];
    }
  }

  return null;
};

// Payment Gateway Icons Component
const PaymentGatewayIcon = ({ gateway }) => {
  switch (gateway) {
    case 'razorpay':
      return (
        <svg viewBox="0 0 100 30" width="80" height="24">
          <text x="50" y="20" fontSize="16" textAnchor="middle" fill="#0745a3" fontWeight="bold">Razorpay</text>
        </svg>
      );
    case 'stripe':
      return (
        <svg viewBox="0 0 100 30" width="80" height="24">
          <text x="50" y="20" fontSize="16" textAnchor="middle" fill="#635bff" fontWeight="bold">Stripe</text>
        </svg>
      );
    case 'paypal':
      return (
        <svg viewBox="0 0 100 30" width="80" height="24">
          <text x="50" y="20" fontSize="16" textAnchor="middle" fill="#003087" fontWeight="bold">PayPal</text>
        </svg>
      );
    default:
      return null;
  }
};

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(normalizePlan(state));
  const [redirecting, setRedirecting] = useState(false);

  // Load from localStorage if missing
  useEffect(() => {
    if (!plan) {
      const pendingPlan = localStorage.getItem("pendingUpgradePlan");
      if (pendingPlan) {
        try {
          const parsed = JSON.parse(pendingPlan);
          setPlan(normalizePlan(parsed));
          localStorage.removeItem("pendingUpgradePlan");
        } catch (e) {
          toast.error("Invalid plan data. Redirecting to pricing...", { duration: 5000 });
          setRedirecting(true);
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else {
        toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
        setRedirecting(true);
        setTimeout(() => navigate("/pricingdash"), 2000);
      }
    }
  }, [plan, navigate]);

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-300 text-lg">Redirecting to Pricing...</p>
      </div>
    );
  }

  if (!plan) return null;

  // Payment & Agreement states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [cardType, setCardType] = useState(null);
  const [expiryError, setExpiryError] = useState("");
  
  // New validation states
  const [cardNumberError, setCardNumberError] = useState("");
  const [cvvError, setCvvError] = useState("");

  // Special offers
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [specialOffer, setSpecialOffer] = useState(null);

  useEffect(() => {
    if (plan.planName === "Pro Plan") {
      setSpecialOffer({
        title: "50% off for 12 months!",
        description: "Special discount for Pro Plan users",
        discountType: "percentage",
        discountValue: 50,
      });
      setDiscountType("percentage");
      setDiscount(50);
    } else if (plan.planName === "Growth Plan") {
      setSpecialOffer({
        title: "$20 off your first payment",
        description: "Limited time offer for Growth Plan",
        discountType: "fixed",
        discountValue: 20,
      });
      setDiscountType("fixed");
      setDiscount(20);
    } else {
      setSpecialOffer(null);
      setDiscount(0);
      setDiscountType(null);
    }
  }, [plan.planName]);

  // Memoized calculations
  const { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal } =
    useMemo(() => {
      // FIXED: Get base price with fallback
      let basePrice = plan.basePrice !== undefined
        ? Number(plan.basePrice)
        : (plan.basePricing && plan.planType ? Number(plan.basePricing[plan.planType]) : 0);

      const additionalSlotsCost = Number(plan.additionalSlotsCost || 0);
      const integrationCosts = Number(plan.integrationCosts || 0);
      const subtotal = basePrice + additionalSlotsCost + integrationCosts;

      let discountAmount = 0;
      if (discountType === "percentage") discountAmount = (subtotal * discount) / 100;
      if (discountType === "fixed") discountAmount = Math.min(discount, subtotal);

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const tax = +(discountedSubtotal * 0.1).toFixed(2);
      const finalTotal = +(discountedSubtotal + tax).toFixed(2);

      return { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal };
    }, [plan.basePrice, plan.additionalSlotsCost, plan.integrationCosts, plan.basePricing, plan.planType, discount, discountType]);

  // Luhn algorithm for card validation
  const validateCardNumber = (cardNumber) => {
    // Remove all non-digit characters
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check if the card number is empty
    if (!cleaned) {
      return "Card number is required";
    }
    
    // Check length based on card type
    if (cardType) {
      if (cleaned.length !== cardType.maxLength) {
        return `Invalid ${cardType.name} card number length`;
      }
    } else {
      // Generic check if card type not detected
      if (cleaned.length < 13 || cleaned.length > 19) {
        return "Invalid card number length";
      }
    }
    
    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    if (sum % 10 !== 0) {
      return "Invalid card number";
    }
    
    return ""; // No error
  };

  // Input handlers with validation
  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    const detectedType = detectCardType(value);
    setCardType(detectedType);

    // Format based on card type
    if (detectedType && detectedType.name === "American Express") {
      // Format as 4-6-5 for Amex
      if (value.length > 4 && value.length <= 10) {
        value = value.substring(0, 4) + " " + value.substring(4, 10);
      } else if (value.length > 10) {
        value = value.substring(0, 4) + " " + value.substring(4, 10) + " " + value.substring(10, 15);
      }
    } else {
      // Format as 4-4-4-4 for other cards
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    setCardNumber(value);
    
    // Validate card number
    const error = validateCardNumber(value);
    setCardNumberError(error);
  };

  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) value = value.substring(0, 2) + "/" + value.substring(2, 4);
    setExpiry(value);

    // Validate expiry date when we have a complete MM/YY format
    if (value.length === 5) {
      validateExpiryDate(value);
    } else {
      setExpiryError("");
    }
  };

  const validateExpiryDate = (expiryValue) => {
    // Check if format is MM/YY
    if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
      setExpiryError("Invalid format. Use MM/YY");
      return false;
    }

    const [monthStr, yearStr] = expiryValue.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Validate month
    if (month < 1 || month > 12) {
      setExpiryError("Invalid month");
      return false;
    }

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Get last two digits
    const currentMonth = now.getMonth() + 1; // Months are 0-indexed

    // Validate year and month
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setExpiryError("Card has expired");
      return false;
    }

    // Check if year is too far in the future (more than 20 years)
    if (year > currentYear + 20) {
      setExpiryError("Invalid year");
      return false;
    }

    setExpiryError("");
    return true;
  };

  const handleCvvInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvv(value);
    
    // Validate CVV
    if (value.length > 0) {
      if (cardType && cardType.name === "American Express") {
        if (value.length !== 4) {
          setCvvError("Amex requires 4-digit CVV");
        } else {
          setCvvError("");
        }
      } else {
        if (value.length !== 3) {
          setCvvError("CVV must be 3 digits");
        } else {
          setCvvError("");
        }
      }
    } else {
      setCvvError("");
    }
  };

  const canPay =
    agreed &&
    cardNumber.replace(/\s/g, "").length >= 13 &&
    !cardNumberError &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    !expiryError &&
    cvv.length >= 3 &&
    !cvvError &&
    email.includes("@");

  // Generate invoice data
  const generateInvoiceData = () => {
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const processedDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " New York";
    const paymentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    return {
      transactionId,
      processedDate,
      planName: plan.planName,
      planPrice: basePrice.toFixed(2),
      contacts: plan.slots,
      selectedIntegrations: plan.selectedIntegrations,
      discountTitle: specialOffer?.title || "",
      discountAmount: discountAmount.toFixed(2),
      discountType,
      integrationCosts: integrationCosts.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
      paymentMethod: `${cardType?.name || "Card"} ending in ${cardNumber.slice(-4)} expires ${expiry}`,
      paymentDate,
      nextPaymentDate: nextPaymentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      email,
      issuedTo: {
        companyName: "Abacco Technology",
        email,
        address: "HMT layout vidyaranyapura Vidyaranyapura Bangalore, KA 560094",
        placeOfSupply: "KARNATAKA 029 India",
      },
      issuedBy: {
        name: "BounceCure",
        address: "c/o The Rocket Science Group, LLC\n405 N. Angier Ave. NE, Atlanta, GA 30312 USA",
        website: "www.bouncecure.com",
        taxId: "9922USA29012OSN",
      },
    };
  };

  // Validate payment details with backend
  const validatePaymentWithBackend = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/validate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiryDate: expiry,
          cvv: cvv
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => toast.error(error, { duration: 5000 }));
        } else {
          toast.error(result.message || "Payment validation failed", { duration: 5000 });
        }
        return false;
      }
      
      return true;
    } catch (error) {
      toast.error("Error validating payment: " + error.message, { duration: 5000 });
      return false;
    }
  };

  // Send invoice
  const sendInvoiceEmail = async (invoiceData) => {
    try {
      const res = await fetch("http://localhost:5000/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const result = await res.json();
      if (result.success) toast.success("Invoice sent to your email!", { duration: 5000 });
      else throw new Error(result.message || "Failed to send invoice");
    } catch (err) {
      toast.error("Failed to send invoice: " + err.message, { duration: 5000 });
    }
  };

  // Save payment data for reminders
  const savePaymentData = async (invoiceData) => {
    try {
      const paymentData = {
        email: invoiceData.email,
        transactionId: invoiceData.transactionId,
        planName: invoiceData.planName,
        paymentDate: invoiceData.paymentDate,
        nextPaymentDate: invoiceData.nextPaymentDate,
        amount: invoiceData.finalTotal,
        cardNumber: cardNumber, // Full card number for backend validation
        expiryDate: expiry,
        cvv: cvv
      };

      const res = await fetch("http://localhost:5000/api/save-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      const result = await res.json();
      if (result.success) {
        console.log("Payment data saved successfully");
      } else {
        console.error("Failed to save payment data:", result.message);
      }
    } catch (err) {
      console.error("Error saving payment data:", err);
    }
  };

  // Payment handler
  const handlePay = async () => {
    // Validate all fields before processing
    const cardError = validateCardNumber(cardNumber);
    if (cardError) {
      setCardNumberError(cardError);
      toast.error("Please fix card number errors", { duration: 5000 });
      return;
    }
    
    if (expiryError) {
      toast.error("Please fix the expiry date error", { duration: 5000 });
      return;
    }
    
    if (cvvError) {
      toast.error("Please fix the CVV error", { duration: 5000 });
      return;
    }
    
    if (!canPay) {
      toast.error("Please fill all required fields and agree to terms.", { duration: 5000 });
      return;
    }

    // Validate payment details with backend
    const validatePaymentWithBackend = async (paymentId, orderId, signature) => {
  const response = await fetch("http://localhost:5000/api/validate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentId,
      orderId,
      signature
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Validation failed");
  return data;
};


    setProcessing(true);
    const toastId = toast.loading("Processing payment...");

    setTimeout(() => {
      setProcessing(false);
      toast.success("Payment Successful!", { id: toastId, duration: 5000 });

      const invoiceData = generateInvoiceData();
      sendInvoiceEmail(invoiceData);
      savePaymentData(invoiceData); // Save payment data for reminders

      // Navigate to invoice page with data
      navigate("/dashboard", { state: { invoiceData } });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 md:px-8 font-sans">
      <Toaster position="top-right" duration={5000} />
      {/* <div className="mb-6">
        <Link to="/pricingdash" className="text-sm text-[#d4af37] hover:underline inline-block">
          ← Back to Pricing
        </Link>
      </div> */}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Payment Form */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-3">Complete Your Purchase</h2>
          <p className="text-gray-400 mb-5 text-sm">
            You're just a step away from unlocking <span className="text-white font-semibold">{plan.planName}</span>.
          </p>

          <div className="mb-4">
            <label className="block text-sm mb-1 text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {specialOffer && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#d4af37] to-[#f0c050] rounded-lg text-black">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{specialOffer.title}</h3>
                  <p className="text-sm">{specialOffer.description}</p>
                </div>
                <div className="text-2xl font-bold">
                  {specialOffer.discountType === "percentage"
                    ? `${specialOffer.discountValue}% OFF`
                    : `$${specialOffer.discountValue} OFF`}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Card Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full bg-[#111] border ${cardNumberError ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded pr-12`}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardInput}
                  maxLength={cardType ? (cardType.name === "American Express" ? 17 : 19) : 19}
                  required
                />
                {cardType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <img
                      src={cardType.icon}
                      alt={cardType.name}
                      className="w-10 h-6 object-contain"
                    />
                  </div>
                )}
              </div>
              {cardNumberError && (
                <p className="mt-1 text-xs text-red-500">{cardNumberError}</p>
              )}
              {cardType && (
                <div className="mt-1 text-xs text-gray-400 flex justify-between">
                  <span className="flex items-center">
                    <img
                      src={cardType.icon}
                      alt={cardType.name}
                      className="w-5 h-3 mr-1 object-contain"
                    />
                    {cardType.name} detected
                  </span>
                  <span>
                    {cardNumber.replace(/\s/g, "").length}/{cardType.maxLength} digits
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full bg-[#111] border ${expiryError ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded`}
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryInput}
                  maxLength={5}
                  required
                />
                {expiryError && (
                  <p className="mt-1 text-xs text-red-500">{expiryError}</p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">
                  CVV <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className={`w-full bg-[#111] border ${cvvError ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded`}
                  placeholder="3-4 digits"
                  value={cvv}
                  onChange={handleCvvInput}
                  maxLength={4}
                  required
                />
                {cvvError && (
                  <p className="mt-1 text-xs text-red-500">{cvvError}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-medium text-gray-300 mb-2">Or pay with:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {["razorpay", "stripe", "paypal"].map((gateway) => (
                  <button
                    key={gateway}
                    className="cursor-pointer flex-1 bg-[#ffffff0d] hover:bg-[#ffffff1a] border border-gray-600 py-2 rounded text-sm flex justify-center items-center transition-transform hover:scale-105"
                  >
                    <div className="bg-white p-2 rounded w-24 h-10 flex items-center justify-center shadow-md">
                      <PaymentGatewayIcon gateway={gateway} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#d4af37] mb-4">Purchase Summary</h3>
            <ul className="text-sm space-y-3">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Plan:</span>
                <span className="text-white font-medium">{plan.planName || "N/A"}</span>
              </li>
              <li className="flex justify-between">
                <span>Slots/Contacts:</span>
                <span>{plan.slots || 0}</span>
              </li>
              {Array.isArray(plan.selectedIntegrations) && plan.selectedIntegrations.length > 0 && (
                <li className="flex justify-between">
                  <span>Integrations:</span>
                  <span>{plan.selectedIntegrations.join(", ")}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span>Base Price:</span>
                <span>${basePrice.toFixed(2)}</span>
              </li>
              {additionalSlotsCost > 0 && (
                <li className="flex justify-between">
                  <span>Additional Slots:</span>
                  <span>${additionalSlotsCost.toFixed(2)}</span>
                </li>
              )}
              {integrationCosts > 0 && (
                <li className="flex justify-between">
                  <span>Integrations Cost:</span>
                  <span>${integrationCosts.toFixed(2)}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </li>
              {discountAmount > 0 && (
                <li className="flex justify-between text-green-400">
                  <span>
                    Discount ({discountType === "percentage" ? `${discount}%` : `$${discount}`}):
                  </span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${tax}</span>
              </li>
              <hr className="my-3 border-gray-700" />
              <li className="flex justify-between text-lg font-bold text-white">
                <span>Total:</span>
                <span>${finalTotal}</span>
              </li>
              {discountAmount > 0 && (
                <li className="flex justify-center text-green-400 text-sm mt-2">
                  You're saving ${discountAmount.toFixed(2)} with this offer!
                </li>
              )}
            </ul>
          </div>

          <div className="mt-6">
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                id="agree"
                className="mr-2 mt-1"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                required
              />
              <label htmlFor="agree" className="text-sm text-gray-400">
                I agree to the{" "}
                <span className="underline text-white">Terms of Service</span> and{" "}
                <span className="underline text-white">Privacy Policy</span>. <span className="text-red-500">*</span>
              </label>
            </div>

            <button
              onClick={handlePay}
              className={`w-full ${canPay ? "bg-[#d4af37] hover:bg-[#eac94d]" : "bg-gray-700 cursor-not-allowed"} text-black font-bold py-2 rounded transition`}
              disabled={!canPay || processing}
            >
              {processing ? "Processing..." : `Pay $${finalTotal}`}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        <p>
          Need help?{" "}
          <Link
            to="/support"
            className="underline text-white cursor-pointer"
            aria-label="Go to support page"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

// Invoice Page Component (unchanged)
export function InvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    if (state && state.invoiceData) {
      setInvoiceData(state.invoiceData);
    } else {
      // If no invoice data, redirect to pricing
      navigate("/pricingdash");
    }
  }, [state, navigate]);

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-300 text-lg">Loading invoice...</p>
      </div>
    );
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    toast.success("Invoice downloaded successfully!", { duration: 5000 });
    // For demo purposes, we'll just show a success message
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <Toaster position="top-right" duration={5000} />

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-start p-8 border-b">
          {/* Left: Logo and Company */}
          <div className="flex items-center">
            <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              AT
            </div>
            <div>
              <h1 className="text-2xl font-bold">{invoiceData.issuedTo.companyName}</h1>
              <p className="text-gray-600">{invoiceData.issuedTo.email}</p>
            </div>
          </div>

          {/* Right: Invoice Title and Details */}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#d4af37]">BounceCure Invoice</h1>
            <p className="text-gray-600">Invoice #{invoiceData.transactionId}</p>
            <p className="text-gray-600">{invoiceData.processedDate}</p>
          </div>
        </div>

        {/* Issued To and Issued By Section */}
        <div className="grid grid-cols-2 gap-8 p-8 border-b">
          {/* Left: Issued To */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Issued To:</h2>
            <p className="font-medium">{invoiceData.issuedTo.companyName}</p>
            <p>{invoiceData.issuedTo.email}</p>
            <p className="whitespace-pre-line">{invoiceData.issuedTo.address}</p>
            <p>{invoiceData.issuedTo.placeOfSupply}</p>
          </div>

          {/* Right: Issued By */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Issued By:</h2>
            <p className="font-medium">{invoiceData.issuedBy.name}</p>
            <p className="whitespace-pre-line">{invoiceData.issuedBy.address}</p>
            <p>Website: {invoiceData.issuedBy.website}</p>
            <p>Tax ID: {invoiceData.issuedBy.taxId}</p>
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Invoice Details</h2>

          <div className="grid grid-cols-3 gap-8">
            {/* Left: Plan Details */}
            <div className="col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Plan Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Plan Name:</span>
                    <span className="font-medium">{invoiceData.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contacts:</span>
                    <span className="font-medium">{invoiceData.contacts}</span>
                  </div>
                  {invoiceData.selectedIntegrations.length > 0 && (
                    <div className="flex justify-between">
                      <span>Integrations:</span>
                      <span className="font-medium">{invoiceData.selectedIntegrations.join(", ")}</span>
                    </div>
                  )}
                  {invoiceData.discountTitle && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">{invoiceData.discountTitle}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-lg mt-6 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium">{invoiceData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Date:</span>
                    <span className="font-medium">{invoiceData.paymentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Payment Date:</span>
                    <span className="font-medium">{invoiceData.nextPaymentDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Summary */}
            <div className="col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg h-full">
                <h3 className="font-semibold text-lg mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Plan Price:</span>
                    <span>${invoiceData.planPrice}</span>
                  </div>
                  {invoiceData.integrationCosts > 0 && (
                    <div className="flex justify-between">
                      <span>Integration Costs:</span>
                      <span>${invoiceData.integrationCosts}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${invoiceData.subtotal}</span>
                  </div>
                  {invoiceData.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${invoiceData.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${invoiceData.tax}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${invoiceData.finalTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full mt-6 bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-3 rounded transition"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 text-center text-gray-600 text-sm">
          <p>Thank you for your business! If you have any questions, please contact support.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-[#d4af37] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}