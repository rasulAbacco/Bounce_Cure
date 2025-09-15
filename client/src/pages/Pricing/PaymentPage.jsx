import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// ✅ Normalize incoming plan data
const normalizePlan = (data) => {
  if (!data) return null;
  if (data.planName) {
    return {
      planName: data.planName,
      slots: data.slots || 0,
      basePrice: Number(data.basePrice || 0),
      additionalSlotsCost: Number(data.additionalSlotsCost || 0),
      integrationCosts: Number(data.integrationCosts || 0),
      selectedIntegrations: data.selectedIntegrations || [],
    };
  }
  if (data.name) {
    return {
      planName: data.name,
      slots: data.contacts || 0,
      basePrice: Number(data.basePrice || 0),
      additionalSlotsCost: Number(data.price || 0) - Number(data.basePrice || 0),
      integrationCosts: 0,
      selectedIntegrations: [],
    };
  }
  return null;
};

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(normalizePlan(state));
  const [redirecting, setRedirecting] = useState(false);

  // ✅ Load from localStorage if missing
  useEffect(() => {
    if (!plan) {
      const pendingPlan = localStorage.getItem("pendingUpgradePlan");
      if (pendingPlan) {
        try {
          const parsed = JSON.parse(pendingPlan);
          setPlan(normalizePlan(parsed));
          localStorage.removeItem("pendingUpgradePlan");
        } catch (e) {
          console.error("Error parsing plan", e);
          toast.error("Invalid plan data. Redirecting to pricing...");
          setRedirecting(true);
          setTimeout(() => navigate("/pricingdash"), 2000);
        }
      } else {
        toast.error("No plan selected. Redirecting to pricing...");
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

  // ✅ Card + Agreement states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ✅ Special offers & discounts
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

  // ✅ Memoized Calculations
  const { basePrice, additionalSlotsCost, integrationCosts, subtotal, discountAmount, tax, finalTotal } =
    useMemo(() => {
      const basePrice = Number(plan.basePrice || 0);
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
    }, [plan.basePrice, plan.additionalSlotsCost, plan.integrationCosts, discount, discountType]);

  // ✅ Input formatters
  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    setCardNumber(value.replace(/(\d{4})(?=\d)/g, "$1 "));
  };

  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) value = value.substring(0, 2) + "/" + value.substring(2, 4);
    setExpiry(value);
  };

  const handleCvvInput = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setCvv(value);
  };

  // ✅ Button Enable Condition
  const canPay =
    agreed &&
    cardNumber.replace(/\s/g, "").length >= 13 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvv.length >= 3;

  // ✅ Payment Handler
  const handlePay = () => {
    if (!canPay) return toast.error("Please fill all fields and agree to terms.");
    setProcessing(true);
    const toastId = toast.loading("Processing payment... Please wait 10 seconds.");

    setTimeout(() => {
      setProcessing(false);
      toast.success("Payment Successful!", { id: toastId });

      setTimeout(() => {
        navigate("/dashboard", {
          state: {
            from: "payment",
            plan: plan.planName,
            total: finalTotal,
            slots: plan.slots,
            selectedIntegrations: plan.selectedIntegrations,
            discountApplied: discountAmount > 0,
          },
        });
      }, 1500);
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 md:px-8 font-sans">
      <Toaster position="top-right" />
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
            You're just a step away from unlocking{" "}
            <span className="text-white font-semibold">{plan.planName}</span>.
          </p>

          {specialOffer && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#d4af37] to-[#f0c050] rounded-lg text-black">
              <div className="flex items-center">
                <div className="flex-1">
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
              <label className="block text-sm mb-1 text-gray-300">Card Number</label>
              <input
                type="text"
                className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardInput}
                maxLength={19}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">Expiry Date</label>
                <input
                  type="text"
                  className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryInput}
                  maxLength={5}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">CVV</label>
                <input
                  type="password"
                  className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                  placeholder="3-4 digits"
                  value={cvv}
                  onChange={handleCvvInput}
                  maxLength={4}
                />
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-300 mb-2">Or pay with:</p>
              <div className="flex flex-col sm:flex-row gap-3">
                {["razorpay", "stripe", "paypal"].map((gateway) => (
                  <button
                    key={gateway}
                    className="cursor-pointer flex-1 bg-[#ffffff0d] hover:bg-[#ffffff1a] border border-gray-600 py-2 rounded text-sm flex justify-center items-center transition-transform hover:scale-105"
                  >
                    <div className="bg-white p-2 rounded w-24 h-10 flex items-center justify-center shadow-md">
                      <img
                        src={`/payment/${gateway}.png`}
                        alt={gateway}
                        className="w-20 h-auto object-contain"
                      />
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
                  <span>{plan.selectedIntegrations.length} selected</span>
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
              />
              <label htmlFor="agree" className="text-sm text-gray-400">
                I agree to the{" "}
                <span className="underline text-white">Terms of Service</span> and{" "}
                <span className="underline text-white">Privacy Policy</span>.
              </label>
            </div>

            <button
              onClick={handlePay}
              className={`w-full ${
                canPay ? "bg-[#d4af37] hover:bg-[#eac94d]" : "bg-gray-700 cursor-not-allowed"
              } text-black font-bold py-2 rounded transition`}
              disabled={!canPay || processing}
            >
              {processing ? "Processing..." : `Pay $${finalTotal}`}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        <p>
          Need help? <span className="underline text-white cursor-pointer">Contact support</span>
        </p>
      </div>
    </div>
  );
}
