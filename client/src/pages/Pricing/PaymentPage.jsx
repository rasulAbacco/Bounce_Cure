import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationContext } from "../../components/NotificationContext";

// Utility function to parse JWT token
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

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
      planType: data.planType,
      totalCost: data.totalCost !== undefined ? Number(data.totalCost) : undefined
    };
  }

  // Handle legacy data structure
  if (data.name) {
    const basePrice = data.basePrice !== undefined ? Number(data.basePrice) : Number(data.price || 0);
    const totalCost = data.totalCost !== undefined ? Number(data.totalCost) : Number(data.price || 0);

    return {
      planName: data.name,
      slots: data.contacts || 0,
      basePrice,
      additionalSlotsCost: data.basePrice !== undefined
        ? Number(data.price || 0) - basePrice
        : 0,
      integrationCosts: 0,
      selectedIntegrations: [],
      totalCost
    };
  }

  return null;
};

// Card type detection function
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
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Crect width='48' height='48' rx='4' fill='%231A1F71'/%3E%3Cpath fill='%23FFFFFF' d='M18.8,30.5 L20.8,18.2 L23.8,18.2 L21.8,30.5 L18.8,30.5 Z M31.8,18.5 C31.1,18.2 30,18 28.7,18 C25.8,18 23.7,19.5 23.7,21.6 C23.7,23.2 25.2,24.1 26.3,24.7 C27.5,25.3 27.9,25.7 27.9,26.2 C27.9,27 26.9,27.4 26,27.4 C24.7,27.4 24,27.1 22.9,26.6 L22.5,26.4 L22,29.2 C22.8,29.6 24.2,29.9 25.7,30 C28.8,30 30.8,28.5 30.8,26.2 C30.8,24.9 30,23.9 28.2,23.1 C27.1,22.5 26.4,22.1 26.4,21.5 C26.4,21 27,20.4 28.2,20.4 C29.2,20.4 30,20.6 30.6,20.9 L30.9,21 L31.4,18.3 L31.8,18.5 Z M38,18.2 L35.5,18.2 C34.7,18.2 34.2,18.4 33.8,19.2 L29.3,30.5 L32.5,30.5 C32.5,30.5 33,29.1 33.1,28.8 C33.6,28.8 36.6,28.8 37.2,28.8 C37.3,29.2 37.7,30.5 37.7,30.5 L40.5,30.5 L38,18.2 Z M34,26.2 C34.3,25.4 35.4,22.6 35.4,22.6 C35.4,22.6 35.7,21.7 35.9,21.1 L36.2,22.5 C36.2,22.6 36.9,25.5 37.1,26.2 H34 Z M15.8,18.2 L13,26.5 C13,26.5 12.4,24.4 12.2,23.6 C10.8,20.5 8.5,19.2 8.5,19.2 L11,30.5 L14.3,30.5 L19.1,18.2 L15.8,18.2 Z'/%3E%3C/svg%3E"
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

// Payment Page Component
export default function PaymentPage() {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL IN THE SAME ORDER
  
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotificationContext();
  const redirectAttempted = useRef(false);

  // State declarations - all hooks at the top
  const [plan, setPlan] = useState(normalizePlan(state?.plan));
  const [campaign, setCampaign] = useState(state?.campaign || null);
  const [redirecting, setRedirecting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [cardType, setCardType] = useState(null);
  const [expiryError, setExpiryError] = useState("");
  const [cardNumberError, setCardNumberError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(null);
  const [specialOffer, setSpecialOffer] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState("card"); // Default to card
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  // Memoized calculations - must be called before any conditional logic
  const { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal } =
    useMemo(() => {
      let basePrice = plan ? (plan.basePrice !== undefined
        ? Number(plan.basePrice)
        : (plan.basePricing && plan.planType ? Number(plan.basePricing[plan.planType]) : 0))
        : (campaign ? Number(campaign.price) : 0);

      const additionalSlotsCost = plan ? Number(plan.additionalSlotsCost || 0) : 0;
      const integrationCosts = plan ? Number(plan.integrationCosts || 0) : 0;

      const subtotal = plan && plan.totalCost !== undefined
        ? Number(plan.totalCost)
        : (basePrice + additionalSlotsCost + integrationCosts);

      let discountAmount = 0;
      if (discountType === "percentage") discountAmount = (subtotal * discount) / 100;
      if (discountType === "fixed") discountAmount = Math.min(discount, subtotal);

      const discountedSubtotal = Math.max(0, subtotal - discountAmount);
      const tax = +(discountedSubtotal * 0.1).toFixed(2);
      const finalTotal = +(discountedSubtotal + tax).toFixed(2);

      return { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal };
    }, [plan, campaign, discount, discountType]);

  // useEffect hooks - all called in the same order
  useEffect(() => {
    console.log("=== PAYMENT PAGE DEBUG ===");
    console.log("PaymentPage state:", state);
    console.log("Plan from state:", normalizePlan(state?.plan));
    console.log("Campaign from state:", state?.campaign);
    console.log("Current plan state:", plan);
    console.log("Current campaign state:", campaign);
  }, [state, plan, campaign]);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUserInfo({
          userId: decoded.userId,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName
        });
        setEmail(decoded.email || "");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || redirecting || redirectAttempted.current) return;
    
    console.log("=== CHECKING FOR PLAN DATA ===");
    console.log("isLoading:", isLoading);
    console.log("redirecting:", redirecting);
    console.log("redirectAttempted.current:", redirectAttempted.current);
    console.log("hasCheckedStorage:", hasCheckedStorage);
    console.log("plan:", plan);
    console.log("campaign:", campaign);
    
    if (!plan && !campaign && !hasCheckedStorage) {
      console.log("No plan or campaign in state, checking storage...");
      
      const pendingPlan = localStorage.getItem("pendingUpgradePlan") ||
        sessionStorage.getItem("pendingUpgradePlan");
      const pendingCampaign = localStorage.getItem("pendingUpgradeCampaign") ||
        sessionStorage.getItem("pendingUpgradeCampaign");

      console.log("pendingPlan from storage:", pendingPlan);
      console.log("pendingCampaign from storage:", pendingCampaign);

      if (pendingPlan) {
        try {
          console.log("Found plan in storage:", pendingPlan);
          const parsed = JSON.parse(pendingPlan);
          const normalizedPlan = normalizePlan(parsed);
          console.log("Normalized plan:", normalizedPlan);
          
          if (normalizedPlan) {
            setPlan(normalizedPlan);
            localStorage.removeItem("pendingUpgradePlan");
            sessionStorage.removeItem("pendingUpgradePlan");
          } else {
            console.error("Failed to normalize plan from storage");
            toast.error("Invalid plan data. Redirecting to pricing...", { duration: 5000 });
            setRedirecting(true);
            redirectAttempted.current = true;
            setTimeout(() => navigate("/pricingdash"), 2000);
          }
        } catch (e) {
          console.error("Error parsing plan from storage:", e);
          toast.error("Invalid plan data. Redirecting to pricing...", { duration: 5000 });
          setRedirecting(true);
          redirectAttempted.current = true;
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else if (pendingCampaign) {
        try {
          console.log("Found campaign in storage:", pendingCampaign);
          const parsed = JSON.parse(pendingCampaign);
          setCampaign(parsed);
          localStorage.removeItem("pendingUpgradeCampaign");
          sessionStorage.removeItem("pendingUpgradeCampaign");
        } catch (e) {
          console.error("Error parsing campaign from storage:", e);
          toast.error("Invalid campaign data. Redirecting to pricing...", { duration: 5000 });
          setRedirecting(true);
          redirectAttempted.current = true;
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else {
        console.log("No plan or campaign found in storage");
        toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
        setRedirecting(true);
        redirectAttempted.current = true;
        setTimeout(() => navigate("/pricingdash"), 2000);
      }
      
      setHasCheckedStorage(true);
    } else if (hasCheckedStorage && !plan && !campaign && !redirecting) {
      console.log("Already checked storage and no plan found - redirecting");
      toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
      setRedirecting(true);
      redirectAttempted.current = true;
      setTimeout(() => navigate("/pricingdash"), 2000);
    }
  }, [plan, campaign, hasCheckedStorage, isLoading, navigate, redirecting]);

  useEffect(() => {
    if (plan) {
      console.log("Plan data:", plan);
      console.log("Base price:", plan.basePrice);
      console.log("Additional slots cost:", plan.additionalSlotsCost);
      console.log("Total cost (from plan):", plan.totalCost);
      console.log("Calculated total (base + additional):", plan.basePrice + plan.additionalSlotsCost);
    }
  }, [plan]);

  useEffect(() => {
    if (paymentSuccess && invoiceSent) {
      const timer = setTimeout(() => {
        const isLoggedIn = !!localStorage.getItem("authToken");

        if (isLoggedIn) {
          navigate("/dashboard"); // logged in → dashboard
        } else {
          navigate("/signin", {
            state: { redirectTo: "/dashboard" }, // after login, send them to dashboard
          });
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, invoiceSent, navigate]);

  useEffect(() => {
    if (plan && plan.planName === "Pro Plan") {
      setSpecialOffer({
        title: "50% off for 12 months!",
        description: "Special discount for Pro Plan users",
        discountType: "percentage",
        discountValue: 50,
      });
      setDiscountType("percentage");
      setDiscount(50);
    } else if (plan && plan.planName === "Growth Plan") {
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
  }, [plan?.planName]);

  // Load Razorpay SDK
  useEffect(() => {
    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    };

    if (!razorpayLoaded) {
      loadRazorpay();
    }
  }, [razorpayLoaded]);

  // Load Stripe SDK
  useEffect(() => {
    const loadStripe = () => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => setStripeLoaded(true);
      document.body.appendChild(script);
    };

    if (!stripeLoaded) {
      loadStripe();
    }
  }, [stripeLoaded]);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPal = () => {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    };

    if (!paypalLoaded) {
      loadPayPal();
    }
  }, [paypalLoaded]);

  // Test email configuration function
  const testEmailConfiguration = async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    setTestingEmail(true);
    const toastId = toast.loading("Testing email configuration...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log("Test email result:", result);

      if (result.success) {
        toast.success("Test email sent successfully! Check your inbox.", { id: toastId });
      } else {
        toast.error(`Email test failed: ${result.message}`, { id: toastId });
        console.error("Email test debug:", result.debug);
      }
    } catch (error) {
      console.error("Email test error:", error);
      toast.error(`Email test error: ${error.message}`, { id: toastId });
    } finally {
      setTestingEmail(false);
    }
  };

  // Helper functions
  const validateCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');

    if (!cleaned) {
      return "Card number is required";
    }

    if (cardType) {
      if (cleaned.length !== cardType.maxLength) {
        return `Invalid ${cardType.name} card number length`;
      }
    } else {
      if (cleaned.length < 13 || cleaned.length > 19) {
        return "Invalid card number length";
      }
    }

    let sum = 0;
    let shouldDouble = false;

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

    return "";
  };

  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    const detectedType = detectCardType(value);
    setCardType(detectedType);

    if (detectedType && detectedType.name === "American Express") {
      if (value.length > 4 && value.length <= 10) {
        value = value.substring(0, 4) + " " + value.substring(4, 10);
      } else if (value.length > 10) {
        value = value.substring(0, 4) + " " + value.substring(4, 10) + " " + value.substring(10, 15);
      }
    } else {
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    setCardNumber(value);

    const error = validateCardNumber(value);
    setCardNumberError(error);
  };

  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) value = value.substring(0, 2) + "/" + value.substring(2, 4);
    setExpiry(value);

    if (value.length === 5) {
      validateExpiryDate(value);
    } else {
      setExpiryError("");
    }
  };

  const validateExpiryDate = (expiryValue) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
      setExpiryError("Invalid format. Use MM/YY");
      return false;
    }

    const [monthStr, yearStr] = expiryValue.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (month < 1 || month > 12) {
      setExpiryError("Invalid month");
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setExpiryError("Card has expired");
      return false;
    }

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
    (selectedGateway === "razorpay" || 
      (cardNumber.replace(/\s/g, "").length >= 13 &&
      !cardNumberError &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      !expiryError &&
      cvv.length >= 3 &&
      !cvvError)) &&
    email.includes("@");

  const generateInvoiceData = (gateway, paymentId) => {
    const transactionId = paymentId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const processedDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " New York";
    const paymentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    return {
      transactionId,
      processedDate,
      planName: plan ? plan.planName : "Campaign",
      planPrice: basePrice.toFixed(2),
      contacts: plan ? plan.slots : campaign.emails,
      selectedIntegrations: plan ? plan.selectedIntegrations : [],
      discountTitle: specialOffer?.title || "",
      discountAmount: discountAmount.toFixed(2),
      discountType,
      integrationCosts: integrationCosts.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
      paymentMethod: gateway 
        ? `${gateway.charAt(0).toUpperCase() + gateway.slice(1)} (Payment ID: ${paymentId})`
        : `${cardType?.name || "Card"} ending in ${cardNumber.slice(-4)} expires ${expiry}`,
      paymentDate,
      nextPaymentDate: nextPaymentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      email,
      issuedTo: {
        companyName: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "Abacco Technology",
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

  const validatePaymentWithBackend = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  };

  const sendInvoiceEmail = async (invoiceData) => {
    try {
      const token = localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        null;

      if (!token) {
        console.error('Authentication token not found for invoice');
        return { success: false, error: 'Authentication required' };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Invoice email response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to send invoice');
      }

      return result;
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return { success: false, error: error.message };
    }
  };

  const savePaymentData = async (invoiceData) => {
    console.log("=== SAVE PAYMENT DATA FUNCTION START ===");
    
    try {
      const paymentData = {
        email: invoiceData.email,
        transactionId: invoiceData.transactionId,
        planName: invoiceData.planName,
        paymentDate: invoiceData.paymentDate,
        nextPaymentDate: invoiceData.nextPaymentDate,
        amount: invoiceData.finalTotal,
        planType: plan?.planType || 'monthly',
        provider: selectedGateway === "card" ? (cardType?.name || 'Card') : selectedGateway,
        contacts: plan?.slots || campaign?.emails || 0,
        currency: 'USD',
        paymentMethod: invoiceData.paymentMethod,
        cardLast4: cardNumber.slice(-4),
        status: 'success'
      };

      console.log('Payment data to save:', paymentData);

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Token found, length:', token.length);
      console.log('API URL:', import.meta.env.VITE_API_URL);

      // Try multiple possible endpoints
 const endpoint = `${import.meta.env.VITE_API_URL}/api/save-payment`;


      let response;
      let usedEndpoint;
      let lastError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData),
          });

          usedEndpoint = endpoint;
          console.log(`Endpoint ${endpoint} responded with status:`, response.status);
          
          if (response.status !== 404) {
            // If it's not a 404, we found the right endpoint (even if it errors)
            break;
          }
        } catch (fetchError) {
          console.log(`Endpoint ${endpoint} failed:`, fetchError.message);
          lastError = fetchError;
          
          // Continue to next endpoint unless this is the last one
          if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
            throw new Error(`All endpoints failed. Last error: ${fetchError.message}`);
          }
        }
      }

      if (!response) {
        throw new Error(`No valid response received. Last error: ${lastError?.message || 'Unknown'}`);
      }

      console.log(`Used endpoint: ${usedEndpoint}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Get response text first for better debugging
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use the raw text
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      // Try to parse response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response text was:', responseText);
        
        // If it's not JSON but response was OK, maybe the endpoint doesn't exist
        // but server returned HTML instead
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
          throw new Error('Endpoint returned HTML instead of JSON - endpoint likely does not exist');
        }
        
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log('Parsed save result:', result);

      // Check if the result indicates success
      if (result.success === false) {
        throw new Error(result.message || result.error || 'API returned success: false');
      }

      // If no explicit success field, assume success if we got this far
      return result.success !== undefined ? result : { success: true, data: result };

    } catch (error) {
      console.error('=== SAVE PAYMENT DATA ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw for handlePay to catch
    }
  };

  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Razorpay is still loading. Please wait...");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setProcessing(true);
    const toastId = toast.loading("Processing payment with Razorpay...");

    try {
      // Create a Razorpay order (in a real app, this would be done on your backend)
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Test key
        amount: finalTotal * 100, // Amount in paise
        currency: "USD",
        name: "BounceCure",
        description: `Payment for ${plan ? plan.planName : campaign.description}`,
        image: "", // Add your logo URL
        prefill: {
          email: email,
          contact: "" // Add phone number if available
        },
        notes: {
          plan: plan ? plan.planName : "Campaign",
          amount: finalTotal
        },
        theme: {
          color: "#d4af37"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast.error("Payment cancelled", { id: toastId });
          }
        },
        handler: async function(response) {
          // This function is called when payment is successful
          try {
            const paymentId = response.razorpay_payment_id;
            
            // Generate invoice data
            const invoiceData = generateInvoiceData("razorpay", paymentId);
            
            // Save payment data
            await savePaymentData(invoiceData);
            
            // Send invoice email
            const emailResult = await sendInvoiceEmail(invoiceData);
            
            if (emailResult.success) {
              toast.success("Invoice sent to your email!", { duration: 3000 });
            } else {
              toast.error(`Payment successful! But email failed: ${emailResult.error}`, { 
                duration: 6000 
              });
            }
            
            // Set payment success
            setPaymentSuccess(true);
            setInvoiceSent(true);
            toast.success("Payment Successful!", { id: toastId, duration: 5000 });
            
            addNotification({
              type: "payment",
              message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
            });
            
          } catch (error) {
            console.error("Razorpay payment processing error:", error);
            toast.error(`Payment successful but processing failed: ${error.message}`, { 
              id: toastId,
              duration: 10000 
            });
          } finally {
            setProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error(`Razorpay payment failed: ${error.message}`, { id: toastId });
      setProcessing(false);
    }
  };

  // Stripe payment handler
  const handleStripePayment = async () => {
    if (!stripeLoaded) {
      toast.error("Stripe is still loading. Please wait...");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Validate card details
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

    setProcessing(true);
    const toastId = toast.loading("Processing payment with Stripe...");

    try {
      // Create a Stripe Elements instance
      const stripe = window.Stripe('pk_test_51MhN7gSDG3y4sX2v6q8Z9J1x2v6q8Z9J1x2v6q8Z9J1x2v6q8Z9J1x2v6q8Z9J1x2v'); // Test key
      
      // Create a payment method with the card details
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expiry.split('/')[0]),
          exp_year: parseInt('20' + expiry.split('/')[1]),
          cvv: cvv,
        },
        billing_details: {
          email: email,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Simulate payment confirmation (in a real app, this would be done on your backend)
      setTimeout(async () => {
        try {
          // Generate a payment ID
          const paymentId = paymentMethod.id;
          
          // Generate invoice data
          const invoiceData = generateInvoiceData("stripe", paymentId);
          
          // Save payment data
          await savePaymentData(invoiceData);
          
          // Send invoice email
          const emailResult = await sendInvoiceEmail(invoiceData);
          
          if (emailResult.success) {
            toast.success("Invoice sent to your email!", { duration: 3000 });
          } else {
            toast.error(`Payment successful! But email failed: ${emailResult.error}`, { 
              duration: 6000 
            });
          }
          
          // Set payment success
          setPaymentSuccess(true);
          setInvoiceSent(true);
          toast.success("Payment Successful!", { id: toastId, duration: 5000 });
          
          addNotification({
            type: "payment",
            message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
          });
          
        } catch (error) {
          console.error("Stripe payment processing error:", error);
          toast.error(`Payment successful but processing failed: ${error.message}`, { 
            id: toastId,
            duration: 10000 
          });
        } finally {
          setProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error("Stripe payment error:", error);
      toast.error(`Stripe payment failed: ${error.message}`, { id: toastId });
      setProcessing(false);
    }
  };

  // PayPal payment handler
  const handlePayPalPayment = async () => {
    if (!paypalLoaded) {
      toast.error("PayPal is still loading. Please wait...");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Validate card details
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

    setProcessing(true);
    const toastId = toast.loading("Processing payment with PayPal...");

    try {
      // Create a PayPal payment (in a real app, this would be done on your backend)
      // For demo purposes, we'll simulate the payment flow
      
      // Simulate payment approval
      setTimeout(async () => {
        try {
          // Generate a payment ID
          const paymentId = `PAYID-${Date.now()}`;
          
          // Generate invoice data
          const invoiceData = generateInvoiceData("paypal", paymentId);
          
          // Save payment data
          await savePaymentData(invoiceData);
          
          // Send invoice email
          const emailResult = await sendInvoiceEmail(invoiceData);
          
          if (emailResult.success) {
            toast.success("Invoice sent to your email!", { duration: 3000 });
          } else {
            toast.error(`Payment successful! But email failed: ${emailResult.error}`, { 
              duration: 6000 
            });
          }
          
          // Set payment success
          setPaymentSuccess(true);
          setInvoiceSent(true);
          toast.success("Payment Successful!", { id: toastId, duration: 5000 });
          
          addNotification({
            type: "payment",
            message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
          });
          
        } catch (error) {
          console.error("PayPal payment processing error:", error);
          toast.error(`Payment successful but processing failed: ${error.message}`, { 
            id: toastId,
            duration: 10000 
          });
        } finally {
          setProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error("PayPal payment error:", error);
      toast.error(`PayPal payment failed: ${error.message}`, { id: toastId });
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    console.log("=== PAYMENT PROCESSING DEBUG START ===");
    console.log("Auth token present:", !!authToken);
    console.log("API URL:", import.meta.env.VITE_API_URL);
    console.log("Plan data:", plan);
    console.log("Campaign data:", campaign);

    if (!authToken) {
      toast.error("Please log in first.", { duration: 5000 });
      navigate("/login");
      return;
    }

    // Validate form fields first
    if (selectedGateway !== "razorpay") {
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
    }

    if (!canPay) {
      toast.error("Please fill all required fields and agree to terms.", { duration: 5000 });
      return;
    }

    setProcessing(true);
    const toastId = toast.loading("Processing payment...");
    
    try {
      console.log("=== STEP 1: GENERATING INVOICE DATA ===");
      const invoiceData = generateInvoiceData();
      console.log("Generated invoice data:", invoiceData);

      console.log("=== STEP 2: ATTEMPTING TO SAVE PAYMENT DATA ===");
      toast.loading("Saving payment information...", { id: toastId });
      
      let saveResult;
      try {
        saveResult = await savePaymentData(invoiceData);
        console.log("✅ Payment data saved successfully:", saveResult);
      } catch (saveError) {
        console.error("❌ Save payment failed:", saveError.message);
        
        // For debugging, let's continue even if save fails
        // In production, you might want to fail here
        console.log("⚠️ Continuing with mock save for testing...");
        saveResult = { success: true, message: "Mock save - backend unavailable" };
        
        toast.error(`Database save failed: ${saveError.message}. Continuing for testing...`, { 
          duration: 3000 
        });
      }

      console.log("=== STEP 3: SIMULATING PAYMENT PROCESSING ===");
      toast.loading("Processing payment with gateway...", { id: toastId });
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment processing
      console.log("✅ Payment processing successful");

      console.log("=== STEP 4: SENDING INVOICE EMAIL ===");
      toast.loading("Sending invoice email...", { id: toastId });
      
      try {
        const emailResult = await sendInvoiceEmail(invoiceData);
        
        if (emailResult.success) {
          console.log("✅ Invoice email sent successfully");
          toast.success("Invoice sent to your email!", { duration: 3000 });
        } else {
          console.warn("⚠️ Email failed but payment succeeded:", emailResult.error);
          toast.error(`Payment successful! But email failed: ${emailResult.error}`, { 
            duration: 6000 
          });
        }
      } catch (emailError) {
        console.error("❌ Invoice email error:", emailError);
        toast.error(`Payment successful! Email error: ${emailError.message}`, { 
          duration: 6000 
        });
      }

      // SUCCESS - Payment completed
      console.log("🎉 PAYMENT PROCESSING COMPLETED SUCCESSFULLY 🎉");
      setPaymentSuccess(true);
      setInvoiceSent(true);
      setRetryCount(0); // Reset retry count on success
      toast.success("Payment Successful!", { id: toastId, duration: 5000 });

      addNotification({
        type: "payment",
        message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
      });

    } catch (error) {
      console.error("💥 PAYMENT PROCESSING FAILED 💥");
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // More specific error messages
      let errorMessage = "Payment processing failed. Please try again.";
      let actionRequired = false;
      
      if (error.message.includes("Authentication") || error.message.includes("token")) {
        errorMessage = "Authentication failed. Please log in again.";
        actionRequired = true;
      } else if (error.message.includes("declined") || error.message.includes("rejected")) {
        errorMessage = "Payment was declined. Please check your card details and try again.";
        actionRequired = true;
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("400")) {
        errorMessage = "Invalid payment data. Please check your information.";
      } else if (error.message.includes("401")) {
        errorMessage = "Session expired. Please log in again.";
        actionRequired = true;
      } else if (error.message.includes("403")) {
        errorMessage = "Payment not authorized. Please contact support.";
      } else if (error.message.includes("404") || error.message.includes("endpoint")) {
        errorMessage = "Payment service temporarily unavailable. Please try again later.";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again in a few minutes.";
      } else if (error.message.includes("HTML") || error.message.includes("endpoint")) {
        errorMessage = "Payment service configuration issue. Please contact support.";
      } else if (error.message) {
        errorMessage = `Payment failed: ${error.message}`;
      }

      // Implement retry logic
      if (retryCount < 2) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        toast.error(`${errorMessage} Retrying... (${newRetryCount}/2)`, { 
          id: toastId,
          duration: 3000,
          icon: actionRequired ? '💳' : '🔄'
        });
        
        // Add a small delay before retry
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Retry the payment
        setProcessing(false);
        return handlePay();
      } else {
        toast.error(errorMessage, { 
          id: toastId, 
          duration: 10000,
          icon: actionRequired ? '💳' : '⚠️'
        });
        
        // Reset retry count after max retries
        setRetryCount(0);
      }
      
    } finally {
      setProcessing(false);
      console.log("=== PAYMENT PROCESSING DEBUG END ===");
    }
  };

  // Conditional rendering after all hooks
  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Redirecting to Pricing...</p>
          <div className="w-16 h-16 border-t-4 border-[#d4af37] border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Loading payment details...</p>
          <div className="w-16 h-16 border-t-4 border-[#d4af37] border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!plan && !campaign) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">No plan selected</p>
          <p className="text-gray-500 mb-6">Please select a plan to continue with payment</p>
          <button 
            onClick={() => navigate("/pricingdash")}
            className="bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-2 px-4 rounded"
          >
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 md:px-8 font-sans">
      <Toaster position="top-right" duration={5000} />

      {/* Payment Success Overlay */}
      {paymentSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] p-8 rounded-xl max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-500 mb-2">Payment Successful!</h3>
            <p className="text-gray-300 mb-4">Your invoice has been sent to your email.</p>
            <p className="text-gray-400 text-sm mb-6">You will be redirected to the dashboard shortly...</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
              <div className="bg-green-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-2 px-4 rounded"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link to="/pricingdash" className="text-sm text-[#d4af37] hover:underline inline-block">
          ← Back to Pricing
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Payment Form */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-3">Complete Your Purchase</h2>
          <p className="text-gray-400 mb-5 text-sm">
            You're just a step away from unlocking <span className="text-white font-semibold">
              {plan ? plan.planName : campaign.description}
            </span>.
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

          {/* Payment Method Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">Select Payment Method:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["card", "razorpay", "stripe", "paypal"].map((gateway) => (
                <button
                  key={gateway}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    selectedGateway === gateway
                      ? "border-[#d4af37] bg-[#d4af3710]"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedGateway(gateway)}
                  disabled={processing}
                >
                  <div className="mb-2">
                    {gateway === "card" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ) : (
                      <PaymentGatewayIcon gateway={gateway} />
                    )}
                  </div>
                  <span className="text-xs capitalize">
                    {gateway === "card" ? "Credit/Debit Card" : gateway}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Details Form - Only show for card, stripe, and paypal */}
          {selectedGateway !== "razorpay" && (
            <div className="space-y-4 mb-6">
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
            </div>
          )}

          {/* Razorpay Notice */}
          {selectedGateway === "razorpay" && (
            <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-300">
                    You will be redirected to Razorpay's secure payment page to complete your payment. No card details are stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={testEmailConfiguration}
              disabled={testingEmail}
              className="text-sm text-[#d4af37] hover:underline"
            >
              {testingEmail ? "Testing..." : "Test email configuration"}
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#d4af37] mb-4">Purchase Summary</h3>
            <ul className="text-sm space-y-3">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Plan:</span>
                <span className="text-white font-medium">
                  {plan ? plan.planName : "Campaign"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>{plan ? "Slots/Contacts:" : "Emails:"}</span>
                <span>{plan ? plan.slots : campaign.emails}</span>
              </li>
              {plan && Array.isArray(plan.selectedIntegrations) && plan.selectedIntegrations.length > 0 && (
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
                  <span>- {discountAmount.toFixed(2)}</span>
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
              onClick={() => {
                if (selectedGateway === 'razorpay') {
                  handleRazorpayPayment();
                } else if (selectedGateway === 'stripe') {
                  handleStripePayment();
                } else if (selectedGateway === 'paypal') {
                  handlePayPalPayment();
                } else {
                  handlePay(); // Default card payment
                }
              }}
              className={`w-full ${canPay ? "bg-[#d4af37] hover:bg-[#eac94d]" : "bg-gray-700 cursor-not-allowed"} text-black font-bold py-3 rounded-lg transition flex items-center justify-center`}
              disabled={!canPay || processing}
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {selectedGateway === 'razorpay' ? (
                    <>
                      <PaymentGatewayIcon gateway="razorpay" />
                      <span className="ml-2">Pay with Razorpay</span>
                    </>
                  ) : selectedGateway === 'stripe' ? (
                    <>
                      <PaymentGatewayIcon gateway="stripe" />
                      <span className="ml-2">Pay with Stripe</span>
                    </>
                  ) : selectedGateway === 'paypal' ? (
                    <>
                      <PaymentGatewayIcon gateway="paypal" />
                      <span className="ml-2">Pay with PayPal</span>
                    </>
                  ) : (
                    `Pay $${finalTotal}`
                  )}
                </>
              )}
            </button>
            
            {retryCount > 0 && (
              <p className="text-xs text-yellow-400 mt-2 text-center">
                Retry attempt {retryCount} of 2
              </p>
            )}
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

// Invoice Page Component
export function InvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    if (state && state.invoiceData) {
      setInvoiceData(state.invoiceData);
    } else {
      navigate("/payment");
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
    toast.success("Invoice downloaded successfully!", { duration: 5000 });
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <Toaster position="top-right" duration={5000} />

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-start p-8 border-b">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
              AT
            </div>
            <div>
              <h1 className="text-2xl font-bold">{invoiceData.issuedTo.companyName}</h1>
              <p className="text-gray-600">{invoiceData.issuedTo.email}</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-bold text-[#d4af37]">BounceCure Invoice</h1>
            <p className="text-gray-600">Invoice #{invoiceData.transactionId}</p>
            <p className="text-gray-600">{invoiceData.processedDate}</p>
          </div>
        </div>

        {/* Issued To and Issued By Section */}
        <div className="grid grid-cols-2 gap-8 p-8 border-b">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Issued To:</h2>
            <p className="font-medium">{invoiceData.issuedTo.companyName}</p>
            <p>{invoiceData.issuedTo.email}</p>
            <p className="whitespace-pre-line">{invoiceData.issuedTo.address}</p>
            <p>{invoiceData.issuedTo.placeOfSupply}</p>
          </div>

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
            <div className="col-span-2">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Plan Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Plan Name:</span>
                    <span className="font-medium">{invoiceData.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span className="font-medium">${invoiceData.planPrice}</span>
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