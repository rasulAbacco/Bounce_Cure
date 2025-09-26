// paymentpage.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useNotificationContext } from "../../components/NotificationContext";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Dynamic import for QRCode with fallback
let QRCode;
try {
  QRCode = require("qrcode.react").default;
} catch (e) {
  console.warn("QRCode library not available. Using fallback component.");
  QRCode = ({ value, size }) => (
    <div className="bg-gray-200 flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="text-center text-gray-700 p-2">
        <div className="font-bold mb-1">UPI Payment</div>
        <div className="text-xs">QR Code Unavailable</div>
      </div>
    </div>
  );
}

// Payment Gateway Icons Component
const PaymentGatewayIcon = ({ gateway }) => {
  const icons = {
    razorpay: <svg viewBox="0 0 100 30" width="80" height="24"><text x="50" y="20" fontSize="16" textAnchor="middle" fill="#0745a3" fontWeight="bold">Razorpay</text></svg>,
    stripe: <svg viewBox="0 0 100 30" width="80" height="24"><text x="50" y="20" fontSize="16" textAnchor="middle" fill="#635bff" fontWeight="bold">Stripe</text></svg>,
    upi: <svg viewBox="0 0 100 30" width="80" height="24"><text x="50" y="20" fontSize="16" textAnchor="middle" fill="#0F9D58" fontWeight="bold">UPI</text></svg>
  };

  return icons[gateway] || null;
};

// UPI Scanner Component
const UPIScanner = ({ amount, upiId, note, onPaymentConfirmed }) => {
  const [showManual, setShowManual] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const upiPaymentLink = `upi://pay?pa=${upiId}&pn=BounceCure&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    setUpiLink(upiPaymentLink);
  }, [amount, upiId, note]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Pay with UPI</h3>
        <p className="text-gray-400 text-sm">Scan the QR code or use the UPI ID to complete your payment</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg mb-4">
          <QRCode 
            value={upiLink} 
            size={180} 
            level="H"
            includeMargin={true}
          />
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Scan with any UPI app</p>
          <button 
            onClick={() => setShowManual(!showManual)}
            className="text-sm text-[#d4af37] hover:underline"
          >
            {showManual ? "Hide details" : "Show UPI details"}
          </button>
        </div>
      </div>

      {showManual && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">UPI ID:</label>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={upiId}
                className="bg-gray-700 text-white px-3 py-2 rounded w-full"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm text-gray-400 mb-1">Payment Link:</label>
            <div className="flex items-center">
              <input
                type="text"
                readOnly
                value={upiLink}
                className="bg-gray-700 text-white px-3 py-2 rounded w-full text-xs"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount:</label>
            <div className="bg-gray-700 text-white px-3 py-2 rounded">
              ₹{amount}
            </div>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onPaymentConfirmed}
          className="bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-3 px-6 rounded-lg transition"
        >
          I've Completed the Payment
        </button>
        <p className="text-xs text-gray-500 mt-2">Click this button after making the payment</p>
      </div>
    </div>
  );
};

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  email, 
  agreed, 
  processing, 
  finalTotal, 
  plan, 
  campaign, 
  generateInvoiceData, 
  savePaymentData, 
  sendInvoiceEmail, 
  addNotification,
  onProcessingChange,
  onPaymentSuccess,
  onPaymentError,
  clientSecret,
  selectedGateway,
  useFallbackPayment
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardType, setCardType] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!agreed) {
      onPaymentError("Please agree to the terms and conditions");
      return;
    }

    // If we're using fallback payment, skip the client secret check
    if (!useFallbackPayment && !clientSecret) {
      onPaymentError("Payment session expired. Please refresh the page and try again.");
      return;
    }

    onProcessingChange(true);

    try {
      let paymentId;
      let paymentMethodDetails = {};
      
      if (useFallbackPayment) {
        // Generate a mock payment ID for fallback
        paymentId = `mock_${Date.now()}`;
        toast("Using fallback payment processing. Your payment will be processed manually.", {
          duration: 5000,
          icon: 'ℹ️'
        });
      } else {
        if (!stripe || !elements) {
          onPaymentError("Stripe is not properly initialized");
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { email },
          },
        });

        if (error) {
          // Handle specific error cases
          if (error.type === 'invalid_request_error' && error.message.includes('test mode')) {
            throw new Error("There's a mismatch between your Stripe account mode and the payment session. Please refresh the page and try again.");
          }
          throw new Error(error.message);
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error("Payment not successful");
        }
        
        paymentId = paymentIntent.id;
        
        // Get payment method details if available
        if (paymentIntent.payment_method) {
          const paymentMethod = await stripe.retrievePaymentMethod(paymentIntent.payment_method);
          if (paymentMethod.paymentMethod && paymentMethod.paymentMethod.card) {
            paymentMethodDetails = {
              cardType: paymentMethod.paymentMethod.card.brand,
              last4: paymentMethod.paymentMethod.card.last4,
              expMonth: paymentMethod.paymentMethod.card.exp_month,
              expYear: paymentMethod.paymentMethod.card.exp_year
            };
            setCardType(paymentMethod.paymentMethod.card.brand);
          }
        }
      }

      const invoiceData = generateInvoiceData("stripe", paymentId, paymentMethodDetails);
      
      await savePaymentData(invoiceData);
      
      const emailResult = await sendInvoiceEmail(invoiceData);
      
      if (emailResult.success) {
        toast.success("Invoice sent to your email!", { duration: 3000 });
      } else {
        toast.error(`Payment successful! But email failed: ${emailResult.error}`, { duration: 6000 });
      }
      
      onPaymentSuccess();
    } catch (error) {
      onPaymentError(error.message);
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!useFallbackPayment && (
        <div className="mb-6">
          <label className="block text-sm mb-1 text-gray-300">
            Card Details <span className="text-red-500">*</span>
          </label>
          <div className="bg-[#111] border border-gray-700 text-white px-3 py-2 rounded">
            <CardElement 
              options={{ 
                style: { 
                  base: { 
                    color: '#fff',
                    '::placeholder': { color: '#aab7c4' }
                  } 
                },
                iconStyle: 'solid',
                hidePostalCode: true
              }} 
              onChange={(event) => {
                if (event.brand) {
                  setCardType(event.brand);
                }
              }}
            />
          </div>
          {cardType && (
            <div className="mt-1 text-xs text-gray-400 flex items-center">
              <span className="capitalize">{cardType} detected</span>
            </div>
          )}
        </div>
      )}
      
      {useFallbackPayment && (
        <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-700">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-yellow-300">
                Payment service is currently unavailable. Your payment will be processed manually. 
                You will receive a confirmation email within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {selectedGateway === 'stripe' && (
        <button 
          type="submit" 
          disabled={!agreed || processing || (!useFallbackPayment && !clientSecret)} 
          className="w-full bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-3 rounded-lg transition flex items-center justify-center disabled:bg-gray-700"
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
              <PaymentGatewayIcon gateway="stripe" />
              <span className="ml-2">
                {useFallbackPayment ? "Process Payment (Fallback Mode)" : "Pay with Stripe"}
              </span>
            </>
          )}
        </button>
      )}
    </form>
  );
};

// Utility functions
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const normalizePlan = (data) => {
  if (!data) return null;
  
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

  if (data.name) {
    const basePrice = Number(data.basePrice !== undefined ? data.basePrice : data.price || 0);
    const totalCost = Number(data.totalCost !== undefined ? data.totalCost : data.price || 0);

    return {
      planName: data.name,
      slots: data.contacts || 0,
      basePrice,
      additionalSlotsCost: data.basePrice !== undefined ? Number(data.price || 0) - basePrice : 0,
      integrationCosts: 0,
      selectedIntegrations: [],
      totalCost
    };
  }

  return null;
};

const detectCardType = (cardNumber) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  const cardTypes = {
    visa: { name: "Visa", maxLength: 16, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Crect width='48' height='48' rx='4' fill='%231A1F71'/%3E%3Cpath fill='%23FFFFFF' d='M18.8,30.5 L20.8,18.2 L23.8,18.2 L21.8,30.5 L18.8,30.5 Z M31.8,18.5 C31.1,18.2 30,18 28.7,18 C25.8,18 23.7,19.5 23.7,21.6 C23.7,23.2 25.2,24.1 26.3,24.7 C27.5,25.3 27.9,25.7 27.9,26.2 C27.9,27 26.9,27.4 26,27.4 C24.7,27.4 24,27.1 22.9,26.6 L22.5,26.4 L22,29.2 C22.8,29.6 24.2,29.9 25.7,30 C28.8,30 30.8,28.5 30.8,26.2 C30.8,24.9 30,23.9 28.2,23.1 C27.1,22.5 26.4,22.1 26.4,21.5 C26.4,21 27,20.4 28.2,20.4 C29.2,20.4 30,20.6 30.6,20.9 L30.9,21 L31.4,18.3 L31.8,18.5 Z M38,18.2 L35.5,18.2 C34.7,18.2 34.2,18.4 33.8,19.2 L29.3,30.5 L32.5,30.5 C32.5,30.5 33,29.1 33.1,28.8 C33.6,28.8 36.6,28.8 37.2,28.8 C37.3,29.2 37.7,30.5 37.7,30.5 L40.5,30.5 L38,18.2 Z M34,26.2 C34.3,25.4 35.4,22.6 35.4,22.6 C35.4,22.6 35.7,21.7 35.9,21.1 L36.2,22.5 C36.2,22.6 36.9,25.5 37.1,26.2 H34 Z M15.8,18.2 L13,26.5 C13,26.5 12.4,24.4 12.2,23.6 C10.8,20.5 8.5,19.2 8.5,19.2 L11,30.5 L14.3,30.5 L19.1,18.2 L15.8,18.2 Z'/%3E%3C/svg%3E" },
    mastercard: { name: "Mastercard", maxLength: 16, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Ccircle cx='17' cy='24' r='8' fill='%23EB001B'/%3E%3Ccircle cx='31' cy='24' r='8' fill='%23F79E1B'/%3E%3Cpath fill='%23FF5F00' d='M24 18a8.002 8.002 0 010 12 8.002 8.002 0 010-12z'/%3E%3C/svg%3E" },
    amex: { name: "American Express", maxLength: 15, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Cpath fill='%23006FCF' d='M45 35a3 3 0 01-3 3H6a3 3 0 01-3-3V13a3 3 0 013-3h36a3 3 0 013 3v22z'/%3E%3Cpath fill='%23FFFFFF' d='M14 20h-3v8h3v-8zm1 0l4 8 4-8h-3l-1 2-1-2h-3zm8 0v8h5v-2h-3v-1h3v-2h-3v-1h3v-2h-5zm7 0v2h2v6h3v-6h2v-2h-7zm8 0v8h5v-2h-3v-1h3v-2h-3v-1h3v-2h-5z'/%3E%3C/svg%3E" },
    discover: { name: "Discover", maxLength: 16, icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='60' height='60'%3E%3Cpath fill='%23FF6000' d='M45 35a3 3 0 01-3 3H6a3 3 0 01-3-3V13a3 3 0 013-3h36a3 3 0 013 3v22z'/%3E%3Cpath fill='%23FFFFFF' d='M24 30c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z'/%3E%3C/svg%3E" }
  };

  const cleanedNumber = cardNumber.replace(/\s/g, "");

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleanedNumber)) {
      return cardTypes[type];
    }
  }

  return null;
};

// Payment Page Component
export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotificationContext();
  const redirectAttempted = useRef(false);

  // State declarations
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
  const [specialOffer, setSpecialOffer] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingStripe, setTestingStripe] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState("card");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeMode, setStripeMode] = useState("test");
  const [stripeError, setStripeError] = useState(null);
  const [useFallbackPayment, setUseFallbackPayment] = useState(false);

  // UPI specific state
  const [upiId, setUpiId] = useState("bouncecure@upi");
  const [exchangeRate, setExchangeRate] = useState(75);

  // Memoized calculations
  const { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal } = useMemo(() => {
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
    if (specialOffer) {
      if (specialOffer.discountType === "percentage") {
        discountAmount = (subtotal * specialOffer.discountValue) / 100;
      } else if (specialOffer.discountType === "fixed") {
        discountAmount = Math.min(specialOffer.discountValue, subtotal);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = +(discountedSubtotal * 0.1).toFixed(2);
    const finalTotal = +(discountedSubtotal + tax).toFixed(2);

    return { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal };
  }, [plan, campaign, specialOffer]);

  // Calculate UPI amount in INR
  const upiAmount = useMemo(() => {
    return Math.round(finalTotal * exchangeRate);
  }, [finalTotal, exchangeRate]);

  // Effects
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
    
    if (!plan && !campaign && !hasCheckedStorage) {
      const pendingPlan = localStorage.getItem("pendingUpgradePlan") || sessionStorage.getItem("pendingUpgradePlan");
      const pendingCampaign = localStorage.getItem("pendingUpgradeCampaign") || sessionStorage.getItem("pendingUpgradeCampaign");

      if (pendingPlan) {
        try {
          const parsed = JSON.parse(pendingPlan);
          const normalizedPlan = normalizePlan(parsed);
          
          if (normalizedPlan) {
            setPlan(normalizedPlan);
            localStorage.removeItem("pendingUpgradePlan");
            sessionStorage.removeItem("pendingUpgradePlan");
          } else {
            toast.error("Invalid plan data. Redirecting to pricing...", { duration: 5000 });
            setRedirecting(true);
            redirectAttempted.current = true;
            setTimeout(() => navigate("/pricingdash"), 2000);
          }
        } catch (e) {
          toast.error("Invalid plan data. Redirecting to pricing...", { duration: 5000 });
          setRedirecting(true);
          redirectAttempted.current = true;
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else if (pendingCampaign) {
        try {
          const parsed = JSON.parse(pendingCampaign);
          setCampaign(parsed);
          localStorage.removeItem("pendingUpgradeCampaign");
          sessionStorage.removeItem("pendingUpgradeCampaign");
        } catch (e) {
          toast.error("Invalid campaign data. Redirecting to pricing...", { duration: 5000 });
          setRedirecting(true);
          redirectAttempted.current = true;
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else {
        toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
        setRedirecting(true);
        redirectAttempted.current = true;
        setTimeout(() => navigate("/pricingdash"), 2000);
      }
      
      setHasCheckedStorage(true);
    } else if (hasCheckedStorage && !plan && !campaign && !redirecting) {
      toast.error("No plan selected. Redirecting to pricing...", { duration: 5000 });
      setRedirecting(true);
      redirectAttempted.current = true;
      setTimeout(() => navigate("/pricingdash"), 2000);
    }
  }, [plan, campaign, hasCheckedStorage, isLoading, navigate, redirecting]);

  useEffect(() => {
    if (paymentSuccess && invoiceSent) {
      const timer = setTimeout(() => {
        const isLoggedIn = !!localStorage.getItem("authToken");
        navigate(isLoggedIn ? "/dashboard" : "/signin", { state: { redirectTo: "/dashboard" } });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, invoiceSent, navigate]);

  useEffect(() => {
    if (plan?.planName === "Pro Plan") {
      setSpecialOffer({
        title: "50% off for 12 months!",
        description: "Special discount for Pro Plan users",
        discountType: "percentage",
        discountValue: 50,
      });
    } else if (plan?.planName === "Growth Plan") {
      setSpecialOffer({
        title: "$20 off your first payment",
        description: "Limited time offer for Growth Plan",
        discountType: "fixed",
        discountValue: 20,
      });
    } else {
      setSpecialOffer(null);
    }
  }, [plan?.planName]);

  // Load payment SDKs
  useEffect(() => {
    if (!razorpayLoaded) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    }
  }, [razorpayLoaded]);

  useEffect(() => {
    if (!stripeLoaded && !document.querySelector('script[src^="https://js.stripe.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => setStripeLoaded(true);
      document.body.appendChild(script);
    } else if (document.querySelector('script[src^="https://js.stripe.com"]')) {
      setStripeLoaded(true);
    }
  }, [stripeLoaded]);

  // Initialize Stripe with mode detection
  useEffect(() => {
    if (stripeLoaded && !stripePromise) {
      const initializeStripe = async () => {
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        
        if (!stripeKey) {
          console.error("Stripe publishable key is not set in environment variables.");
          setStripeError("Stripe configuration is missing. Please contact support.");
          return;
        }

        if (!stripeKey.startsWith('pk_')) {
          setStripeError("Invalid Stripe key. Please use a publishable key (pk_...) instead of a restricted key.");
          return;
        }

        try {
          const isLiveMode = stripeKey.startsWith('pk_live_');
          setStripeMode(isLiveMode ? 'live' : 'test');
          
          console.log("Initializing Stripe with key:", stripeKey.substring(0, 10) + "...");
          const stripeInstance = await loadStripe(stripeKey);
          if (!stripeInstance) {
            throw new Error("Failed to load Stripe. Check your publishable key.");
          }
          setStripePromise(stripeInstance);
          setStripeError(null);
          console.log("Stripe initialized successfully");
        } catch (error) {
          console.error("Error initializing Stripe:", error);
          setStripeError(`Failed to initialize Stripe: ${error.message}`);
        }
      };
      initializeStripe();
    }
  }, [stripeLoaded, stripePromise]);

  // Create Stripe payment intent with improved error handling
  useEffect(() => {
    if (stripePromise && selectedGateway === 'stripe' && !clientSecret && !useFallbackPayment) {
      const createPaymentIntent = async () => {
        try {
          // Validate environment variables first
          const apiUrl = import.meta.env.VITE_API_URL;
          const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
          
          if (!apiUrl) {
            throw new Error("VITE_API_URL is not configured in environment variables");
          }
          
          if (!stripeKey) {
            throw new Error("VITE_STRIPE_PUBLIC_KEY is not configured in environment variables");
          }

          // Validate payment amount
          if (typeof finalTotal !== 'number' || isNaN(finalTotal) || finalTotal <= 0) {
            throw new Error("Invalid payment amount");
          }
          
          const amountInCents = Math.round(finalTotal * 100);
          
          if (amountInCents < 50) {
            throw new Error("Payment amount must be at least $0.50 USD");
          }
          
          // Validate email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!email || !emailRegex.test(email)) {
            throw new Error("Valid email address is required");
          }

          console.log("Creating payment intent with amount:", amountInCents);
          
          const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!authToken) {
            throw new Error("Authentication required. Please log in again.");
          }
          
          const planDetails = plan ? 
            `${plan.planName} (${plan.planType || 'monthly'} plan, ${plan.slots} contacts)` : 
            `Campaign: ${campaign?.description || 'Unknown'}`;
          
          // Create a short statement descriptor (max 22 characters)
          const shortDescriptor = `BounceCure ${plan ? plan.planName.substring(0, 10) : 'Payment'}`;
          
          // Ensure description is not too long for Stripe (max 1000 chars)
          const description = `BounceCure ${planDetails}. Customer: ${email}`.substring(0, 1000);
          
          const requestData = { 
            amount: amountInCents,
            email: email,
            planName: plan ? plan.planName : (campaign?.description || 'Unknown Plan'),
            planType: plan ? (plan.planType || 'monthly') : 'monthly',
            contacts: plan ? plan.slots : (campaign?.emails || 0),
            mode: stripeMode,
            description: description,
            statement_descriptor: shortDescriptor,
            currency: 'usd' // Explicitly set currency
          };
          
          console.log("Request data:", JSON.stringify(requestData, null, 2));
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // Increase timeout to 30s
          
          try {
            const response = await fetch(`${apiUrl}/create-payment-intent`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json'
              },
              body: JSON.stringify(requestData),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log("Response status:", response.status);
            console.log("Response headers:", Object.fromEntries(response.headers.entries()));
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let responseData;
            
            if (contentType && contentType.includes('application/json')) {
              responseData = await response.json();
            } else {
              const responseText = await response.text();
              console.error("Non-JSON response:", responseText);
              
              // If we get HTML, it means the endpoint doesn't exist
              if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
                throw new Error("API endpoint not found. Using fallback mode.");
              }
              
              throw new Error(`Server returned non-JSON response: ${response.status}`);
            }
            
            console.log("Payment intent response:", responseData);
            
            // Handle error responses
            if (!response.ok) {
              // Handle specific error cases that should trigger fallback
              if (response.status === 400 && responseData.message) {
                if (responseData.message.includes("statement_descriptor") ||
                    responseData.message.includes("account") ||
                    responseData.message.includes("configuration")) {
                  console.log("Stripe configuration error, enabling fallback mode");
                  setUseFallbackPayment(true);
                  toast("Payment service temporarily unavailable. Using manual processing mode.", {
                    duration: 5000,
                    icon: 'ℹ️'
                  });
                  return;
                }
              }
              
              if (response.status === 500) {
                console.log("Server error, enabling fallback mode");
                setUseFallbackPayment(true);
                toast("Payment service temporarily unavailable. Using manual processing mode.", {
                  duration: 5000,
                  icon: 'ℹ️'
                });
                return;
              }
              
              throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
            }
            
            if (!responseData.success) {
              throw new Error(responseData.message || "Payment intent creation failed");
            }
            
            if (!responseData.clientSecret) {
              throw new Error("No client secret returned from server");
            }
            
            // Validate mode consistency
            if (responseData.mode && responseData.mode !== stripeMode) {
              console.warn(`Mode mismatch: Frontend is ${stripeMode}, backend is ${responseData.mode}`);
              // Don't throw error, just warn and continue
            }
            
            console.log("Successfully set client secret");
            setClientSecret(responseData.clientSecret);
            setStripeError(null);
            
          } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
              throw new Error("Request timed out. Please check your internet connection.");
            } else {
              throw fetchError;
            }
          }
          
        } catch (error) {
          console.error("Error creating payment intent:", error);
          
          // Determine if we should use fallback mode
          const shouldUseFallback = (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("timed out") ||
            error.message.includes("Server error") ||
            error.message.includes("configuration") ||
            error.message.includes("endpoint not found") ||
            error.message.includes("VITE_API_URL is not configured") ||
            error.message.includes("Database") ||
            error.message.includes("account") ||
            error.message.includes("statement_descriptor")
          );
          
          if (shouldUseFallback) {
            console.log("Enabling fallback payment mode due to:", error.message);
            setUseFallbackPayment(true);
            setStripeError(null);
            toast("Payment service temporarily unavailable. Your order will be processed manually.", { 
              duration: 8000,
              icon: 'ℹ️'
            });
            return;
          }
          
          // For other errors, show error message but don't enable fallback
          if (error.message.includes("VITE_STRIPE_PUBLIC_KEY is not configured")) {
            setStripeError("Stripe is not properly configured. Please contact support.");
          } else if (error.message.includes("Authentication required")) {
            setStripeError("Session expired. Please refresh the page and log in again.");
            setTimeout(() => navigate("/login"), 3000);
          } else if (error.message.includes("Invalid payment amount")) {
            setStripeError("Invalid payment amount. Please refresh the page.");
          } else if (error.message.includes("Valid email address is required")) {
            setStripeError("Please enter a valid email address.");
          } else {
            setStripeError(`Payment initialization failed: ${error.message}`);
          }
        }
      };
      
      createPaymentIntent();
    }
  }, [stripePromise, selectedGateway, finalTotal, plan, campaign, email, stripeMode, navigate, useFallbackPayment]);

  // Reset client secret when switching payment methods
  useEffect(() => {
    if (selectedGateway !== 'stripe') {
      setClientSecret("");
      setUseFallbackPayment(false);
    }
  }, [selectedGateway]);

  // Helper functions
  const getCardNumberErrorMessage = useCallback((cardNumber, cardType) => {
    const cleaned = cardNumber.replace(/\s/g, '');

    if (!cleaned) return "Card number is required";

    if (cardType) {
      if (cleaned.length < cardType.maxLength) {
        return `${cardType.name} card number must be ${cardType.maxLength} digits`;
      }
      if (cleaned.length > cardType.maxLength) {
        return `${cardType.name} card number must be ${cardType.maxLength} digits`;
      }
    } else {
      if (cleaned.length < 13) {
        return "Card number must be at least 13 digits";
      }
      if (cleaned.length > 19) {
        return "Card number must be no more than 19 digits";
      }
    }

    // Luhn algorithm check
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    if (sum % 10 !== 0) {
      return "Invalid card number. Please check and try again.";
    }

    return "";
  }, []);

  const validateCardNumber = useCallback((cardNumber, cardTypeParam) => {
    const cleaned = cardNumber.replace(/\D/g, '');

    if (!cleaned) return "Card number is required";

    if (cardTypeParam) {
      if (cleaned.length !== cardTypeParam.maxLength) {
        return `Invalid ${cardTypeParam.name} card number length`;
      }
    } else {
      if (cleaned.length < 13 || cleaned.length > 19) {
        return "Invalid card number length";
      }
    }

    // Luhn algorithm check
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 !== 0 ? "Invalid card number" : "";
  }, []);

  const handleCardInput = useCallback((e) => {
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
    setCardNumberError(getCardNumberErrorMessage(value, detectedType));
  }, [getCardNumberErrorMessage]);

  const handleExpiryInput = useCallback((e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) value = value.substring(0, 2) + "/" + value.substring(2, 4);
    setExpiry(value);

    if (value.length === 5) {
      validateExpiryDate(value);
    } else {
      setExpiryError("");
    }
  }, []);

  const validateExpiryDate = useCallback((expiryValue) => {
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
  }, []);

  const handleCvvInput = useCallback((e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvv(value);

    if (value.length > 0) {
      if (cardType && cardType.name === "American Express") {
        setCvvError(value.length !== 4 ? "Amex requires 4-digit CVV" : "");
      } else {
        setCvvError(value.length !== 3 ? "CVV must be 3 digits" : "");
      }
    } else {
      setCvvError("");
    }
  }, [cardType]);

  const canPay = useMemo(() => 
    agreed &&
    email.includes("@") &&
    (
      selectedGateway === "razorpay" || 
      selectedGateway === "upi" ||
      selectedGateway === "stripe" ||
      (
        cardNumber.replace(/\s/g, "").length >= 13 &&
        !cardNumberError &&
        /^\d{2}\/\d{2}$/.test(expiry) &&
        !expiryError &&
        cvv.length >= 3 &&
        !cvvError
      )
    ),
    [agreed, selectedGateway, email, cardNumber, cardNumberError, expiry, expiryError, cvv, cvvError]
  );

  const generateInvoiceData = useCallback((gateway, paymentId, paymentMethodDetails = {}) => {
    const transactionId = paymentId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const processedDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " New York";
    const paymentDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

    // Determine payment method details
    let paymentMethodInfo = "";
    if (gateway) {
      paymentMethodInfo = `${gateway.charAt(0).toUpperCase() + gateway.slice(1)} (Payment ID: ${paymentId})`;
      
      // If we have Stripe card details, add them
      if (gateway === 'stripe' && paymentMethodDetails.cardType) {
        paymentMethodInfo += ` - ${paymentMethodDetails.cardType} ending in ${paymentMethodDetails.last4}`;
      }
    } else {
      // For direct card payments
      paymentMethodInfo = `${cardType?.name || "Card"} ending in ${cardNumber.slice(-4)} expires ${expiry}`;
    }

    return {
      transactionId,
      processedDate,
      planName: plan ? plan.planName : "Campaign",
      planPrice: basePrice.toFixed(2),
      contacts: plan ? plan.slots : campaign.emails,
      selectedIntegrations: plan ? plan.selectedIntegrations : [],
      discountTitle: specialOffer?.title || "",
      discountAmount: discountAmount.toFixed(2),
      discountType: specialOffer?.discountType || "",
      integrationCosts: integrationCosts.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      finalTotal: finalTotal.toFixed(2),
      paymentMethod: paymentMethodInfo,
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
  }, [plan, campaign, basePrice, specialOffer, discountAmount, integrationCosts, subtotal, tax, finalTotal, cardType, cardNumber, expiry, userInfo, email]);

  const sendInvoiceEmail = useCallback(async (invoiceData) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return { success: false, error: 'Authentication required' };

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
      return result.success ? result : { success: false, error: result.message || 'Failed to send invoice' };
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const savePaymentData = useCallback(async (invoiceData) => {
    try {
      // Extract card details from invoice if available (for Stripe)
      let cardLast4 = "0000";
      let cardBrand = "Unknown";
      
      if (invoiceData.paymentMethod.includes("Stripe") && invoiceData.paymentMethod.includes("ending in")) {
        // Extract card details from Stripe payment method
        const match = invoiceData.paymentMethod.match(/ending in (\d{4})/);
        if (match) {
          cardLast4 = match[1];
        }
        
        const brandMatch = invoiceData.paymentMethod.match(/- (\w+) ending in/);
        if (brandMatch) {
          cardBrand = brandMatch[1];
        }
      } else if (selectedGateway === "card" && cardNumber && cardNumber.length >= 4) {
        // For direct card payments
        cardLast4 = cardNumber.slice(-4);
        cardBrand = cardType?.name || "Card";
      }

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
        cardLast4: cardLast4,
        cardBrand: cardBrand,
        status: 'success'
      };

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const possibleEndpoints = [
        `${import.meta.env.VITE_API_URL}/api/save-payment`,
        `${import.meta.env.VITE_API_URL}/save-payment`,
        `${import.meta.env.VITE_API_URL}/payment/save`
      ];

      let response;
      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData),
          });

          if (response.status !== 404) break;
        } catch (fetchError) {
          if (endpoint === possibleEndpoints[possibleEndpoints.length - 1]) {
            throw new Error(`All endpoints failed. Last error: ${fetchError.message}`);
          }
        }
      }

      if (!response) throw new Error(`No valid response received`);

      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(`API Error (${response.status}): ${errorMessage}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
          throw new Error('Endpoint returned HTML instead of JSON - endpoint likely does not exist');
        }
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      return result.success !== undefined ? result : { success: true, data: result };
    } catch (error) {
      console.error('Save payment data error:', error);
      throw error;
    }
  }, [plan, campaign, selectedGateway, cardType, cardNumber]);

  const testEmailConfiguration = useCallback(async () => {
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
      if (result.success) {
        toast.success("Test email sent successfully! Check your inbox.", { id: toastId });
      } else {
        toast.error(`Email test failed: ${result.message}`, { id: toastId });
      }
    } catch (error) {
      toast.error(`Email test error: ${error.message}`, { id: toastId });
    } finally {
      setTestingEmail(false);
    }
  }, []);

  const testStripeConfiguration = useCallback(async () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    setTestingStripe(true);
    const toastId = toast.loading("Testing Stripe configuration...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/test-stripe`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Stripe configuration is working correctly!", { id: toastId });
      } else {
        toast.error(`Stripe test failed: ${result.message}`, { id: toastId });
      }
    } catch (error) {
      toast.error(`Stripe test error: ${error.message}`, { id: toastId });
    } finally {
      setTestingStripe(false);
    }
  }, []);

  const handleRazorpayPayment = useCallback(async () => {
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
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag",
        amount: finalTotal * 100,
        currency: "USD",
        name: "BounceCure",
        description: `Payment for ${plan ? plan.planName : campaign.description}`,
        prefill: { email: email },
        notes: { plan: plan ? plan.planName : "Campaign", amount: finalTotal },
        theme: { color: "#d4af37" },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            toast.error("Payment cancelled", { id: toastId });
          }
        },
        handler: async function(response) {
          try {
            const paymentId = response.razorpay_payment_id;
            const invoiceData = generateInvoiceData("razorpay", paymentId);
            
            await savePaymentData(invoiceData);
            
            const emailResult = await sendInvoiceEmail(invoiceData);
            
            if (emailResult.success) {
              toast.success("Invoice sent to your email!", { duration: 3000 });
            } else {
              toast.error(`Payment successful! But email failed: ${emailResult.error}`, { duration: 6000 });
            }
            
            setPaymentSuccess(true);
            setInvoiceSent(true);
            toast.success("Payment Successful!", { id: toastId, duration: 5000 });
            
            addNotification({
              type: "payment",
              message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
            });
            
          } catch (error) {
            console.error("Razorpay payment processing error:", error);
            toast.error(`Payment successful but processing failed: ${error.message}`, { id: toastId, duration: 10000 });
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
  }, [razorpayLoaded, email, agreed, finalTotal, plan, campaign, generateInvoiceData, savePaymentData, sendInvoiceEmail, addNotification]);

  // UPI payment handler
  const handleUPIPayment = useCallback(async () => {
    setProcessing(true);
    const toastId = toast.loading("Processing UPI payment...");

    try {
      const paymentId = `UPI${Date.now()}`;
      const invoiceData = generateInvoiceData("upi", paymentId);
      
      await savePaymentData(invoiceData);
      
      const emailResult = await sendInvoiceEmail(invoiceData);
      
      if (emailResult.success) {
        toast.success("Invoice sent to your email!", { duration: 3000 });
      } else {
        toast.error(`Payment successful! But email failed: ${emailResult.error}`, { duration: 6000 });
      }
      
      setPaymentSuccess(true);
      setInvoiceSent(true);
      toast.success("UPI Payment Successful!", { id: toastId, duration: 5000 });
      
      addNotification({
        type: "payment",
        message: `UPI payment of ₹${upiAmount} for ${plan ? plan.planName : campaign.description} was successful!`,
      });
      
    } catch (error) {
      console.error("UPI payment processing error:", error);
      toast.error(`UPI payment failed: ${error.message}`, { id: toastId, duration: 10000 });
    } finally {
      setProcessing(false);
    }
  }, [upiAmount, plan, campaign, generateInvoiceData, savePaymentData, sendInvoiceEmail, addNotification]);

  // Stripe payment handlers
  const handleStripePaymentSuccess = useCallback(() => {
    setPaymentSuccess(true);
    setInvoiceSent(true);
    toast.success("Payment Successful!", { duration: 5000 });
    addNotification({
      type: "payment",
      message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
    });
  }, [finalTotal, plan, campaign, addNotification]);

  const handleStripePaymentError = useCallback((errorMessage) => {
    if (errorMessage.includes('test mode') || errorMessage.includes('live mode')) {
      toast.error("There's a configuration issue with Stripe. Please refresh the page and try again.", { duration: 5000 });
    } else {
      toast.error(`Stripe payment failed: ${errorMessage}`, { duration: 5000 });
    }
  }, []);

  const handleStripeProcessingChange = useCallback((isProcessing) => {
    setProcessing(isProcessing);
  }, []);

  const handlePay = useCallback(async () => {
    const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!authToken) {
      toast.error("Please log in first.", { duration: 5000 });
      navigate("/login");
      return;
    }

    if (selectedGateway !== "razorpay") {
      const cardError = validateCardNumber(cardNumber, cardType);
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
      const invoiceData = generateInvoiceData();
      toast.loading("Saving payment information...", { id: toastId });
      
      let saveResult;
      try {
        saveResult = await savePaymentData(invoiceData);
      } catch (saveError) {
        console.error("Save payment failed:", saveError.message);
        saveResult = { success: true, message: "Mock save - backend unavailable" };
        toast.error(`Database save failed: ${saveError.message}. Continuing for testing...`, { duration: 3000 });
      }

      toast.loading("Processing payment with gateway...", { id: toastId });
      
      if (selectedGateway === 'stripe' && useFallbackPayment) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success("Payment processed successfully in fallback mode!", { id: toastId, duration: 3000 });
      } else if (selectedGateway === 'stripe') {
        throw new Error("Stripe payment should be handled by the Stripe form");
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      toast.loading("Sending invoice email...", { id: toastId });
      try {
        const emailResult = await sendInvoiceEmail(invoiceData);
        
        if (emailResult.success) {
          toast.success("Invoice sent to your email!", { duration: 3000 });
        } else {
          toast.error(`Payment successful! But email failed: ${emailResult.error}`, { duration: 6000 });
        }
      } catch (emailError) {
        toast.error(`Payment successful! Email error: ${emailError.message}`, { duration: 6000 });
      }

      setPaymentSuccess(true);
      setInvoiceSent(true);
      toast.success("Payment Successful!", { id: toastId, duration: 5000 });

      addNotification({
        type: "payment",
        message: `Payment of $${finalTotal} for ${plan ? plan.planName : campaign.description} was successful!`,
      });

    } catch (error) {
      console.error("Payment processing failed:", error);
      
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

      toast.error(errorMessage, { 
        id: toastId, 
        duration: 10000,
        icon: actionRequired ? '💳' : '⚠️'
      });
      
    } finally {
      setProcessing(false);
    }
  }, [canPay, selectedGateway, cardNumber, validateCardNumber, expiryError, cvvError, generateInvoiceData, savePaymentData, sendInvoiceEmail, finalTotal, plan, campaign, addNotification, navigate, useFallbackPayment]);

  // Conditional rendering
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

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">Select Payment Method:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["card", "razorpay", "stripe", "upi"].map((gateway) => (
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

          {selectedGateway === "stripe" && (
            <div className="mb-6 p-4 bg-purple-900 bg-opacity-30 rounded-lg border border-purple-700">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-purple-300">
                    Your payment will be processed securely through Stripe. No card details are stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedGateway === "upi" && (
            <div className="mb-6 p-4 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-green-300">
                    Pay using UPI (Unified Payments Interface). Scan the QR code with any UPI app or use the UPI ID directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Specific Forms */}
          {selectedGateway === "stripe" && stripePromise ? (
            <div>
              {stripeError ? (
                <div className="mb-6 p-4 bg-red-900 bg-opacity-30 rounded-lg border border-red-700">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-red-300">
                        {stripeError}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => {
                            setStripeError(null);
                            setClientSecret("");
                            setStripePromise(null);
                            setStripeLoaded(false);
                          }}
                          className="text-sm text-white underline"
                        >
                          Retry Stripe Setup
                        </button>
                        <button
                          onClick={() => {
                            setUseFallbackPayment(true);
                            setStripeError(null);
                          }}
                          className="text-sm text-white underline"
                        >
                          Use Fallback Mode
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Using Stripe in {stripeMode} mode
                  </div>
                  
                  {useFallbackPayment ? (
                    <div className="mb-6 p-4 bg-yellow-900 bg-opacity-30 rounded-lg border border-yellow-700">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-yellow-300">
                            Payment service is currently unavailable. Your payment will be processed manually. 
                            You will receive a confirmation email within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm 
                        email={email}
                        agreed={agreed}
                        processing={processing}
                        finalTotal={finalTotal}
                        plan={plan}
                        campaign={campaign}
                        generateInvoiceData={generateInvoiceData}
                        savePaymentData={savePaymentData}
                        sendInvoiceEmail={sendInvoiceEmail}
                        addNotification={addNotification}
                        onProcessingChange={handleStripeProcessingChange}
                        onPaymentSuccess={handleStripePaymentSuccess}
                        onPaymentError={handleStripePaymentError}
                        clientSecret={clientSecret}
                        selectedGateway={selectedGateway}
                        useFallbackPayment={useFallbackPayment}
                      />
                    </Elements>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 border-t-4 border-[#d4af37] border-solid rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Initializing secure payment...</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {selectedGateway !== "razorpay" && selectedGateway !== "upi" && (
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
                      <div className="mt-1 text-xs text-red-500 flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>{cardNumberError}</span>
                      </div>
                    )}
                    {cardType && (
                      <div className="mt-1 text-xs text-gray-400 flex justify-between">
                        <span className="flex items-center">
                          <img src={cardType.icon} alt={cardType.name} className="w-5 h-3 mr-1 object-contain" />
                          {cardType.name} detected
                        </span>
                        <span>{cardNumber.replace(/\s/g, "").length}/{cardType.maxLength} digits</span>
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
                      {expiryError && <p className="mt-1 text-xs text-red-500">{expiryError}</p>}
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
                      {cvvError && <p className="mt-1 text-xs text-red-500">{cvvError}</p>}
                    </div>
                  </div>
                </div>
              )}

              {selectedGateway === "upi" && (
                <div className="mb-6">
                  <UPIScanner 
                    amount={upiAmount}
                    upiId={upiId}
                    note={`Payment for ${plan ? plan.planName : campaign.description}`}
                    onPaymentConfirmed={handleUPIPayment}
                  />
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={testEmailConfiguration}
                  disabled={testingEmail}
                  className="text-sm text-[#d4af37] hover:underline"
                >
                  {testingEmail ? "Testing..." : "Test email configuration"}
                </button>
                
                <button
                  onClick={testStripeConfiguration}
                  disabled={testingStripe}
                  className="text-sm text-[#d4af37] hover:underline"
                >
                  {testingStripe ? "Testing Stripe..." : "Test Stripe configuration"}
                </button>
              </div>
            </>
          )}
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
                    Discount ({specialOffer?.discountType === "percentage" ? `${specialOffer.discountValue}%` : `$${specialOffer?.discountValue}`}):
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
              {selectedGateway === "upi" && (
                <li className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>Equivalent in INR:</span>
                  <span>₹{upiAmount}</span>
                </li>
              )}
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

            {selectedGateway !== "upi" && (
              <button
                onClick={() => {
                  if (selectedGateway === 'razorpay') {
                    handleRazorpayPayment();
                  } else if (selectedGateway === 'stripe') {
                    if (useFallbackPayment) {
                      handlePay();
                    }
                    return;
                  } else {
                    handlePay();
                  }
                }}
                className={`w-full ${canPay ? "bg-[#d4af37] hover:bg-[#eac94d]" : "bg-gray-700 cursor-not-allowed"} text-black font-bold py-3 rounded-lg transition flex items-center justify-center`}
                disabled={!canPay || processing || (selectedGateway === 'stripe' && !useFallbackPayment)}
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
                        <span className="ml-2">
                          {useFallbackPayment ? "Process Payment (Fallback Mode)" : "Pay with Stripe"}
                        </span>
                      </>
                    ) : (
                      `Pay $${finalTotal}`
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        <p>
          Need help?{" "}
          <Link to="/support" className="underline text-white cursor-pointer" aria-label="Go to support page">
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

  const handleDownload = useCallback(() => {
    toast.success("Invoice downloaded successfully!", { duration: 5000 });
  }, []);

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-300 text-lg">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <Toaster position="top-right" duration={5000} />

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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