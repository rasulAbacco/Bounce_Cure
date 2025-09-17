import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Default plan values if no state is passed
  const defaultPlan = {
    name: "Pro Plan",
    basePrice: 57.5,
    price: 57.5,
    contacts: 500,
  };

  const [formData, setFormData] = useState({
    to: "",
    name: state?.name || defaultPlan.name,
    price: state?.price || defaultPlan.price,
    contacts: state?.contacts || defaultPlan.contacts,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // If no plan state, redirect after showing toast
  useEffect(() => {
    if (!state) {
      toast.error("No plan selected. Default plan loaded.");
    }
  }, [state]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "contacts" ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.to) newErrors.to = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.to)) newErrors.to = "Email is invalid";
    if (!formData.name) newErrors.name = "Plan name is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.contacts <= 0) newErrors.contacts = "Contacts must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Send invoice handler
  const sendInvoice = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setMessage("");

    try {
      // Replace this with your real API endpoint
      const res = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Invoice sent successfully!");
        setFormData({
          to: "",
          name: state?.name || defaultPlan.name,
          price: state?.price || defaultPlan.price,
          contacts: state?.contacts || defaultPlan.contacts,
        });
      } else {
        setMessage(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Frontend error:", err);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-xl border border-gray-200">
      <Toaster position="top-right" />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment</h2>

      <div className="space-y-4">
        {/* Customer Email */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Customer Email</label>
          <input
            type="email"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="Enter customer email"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.to ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.to && <p className="mt-1 text-red-500 text-sm">{errors.to}</p>}
        </div>

        {/* Plan */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Plan</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Price ($)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.price && <p className="mt-1 text-red-500 text-sm">{errors.price}</p>}
        </div>

        {/* Contacts */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">Contacts / Slots</label>
          <input
            type="number"
            name="contacts"
            value={formData.contacts}
            onChange={handleChange}
            min="1"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.contacts ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.contacts && <p className="mt-1 text-red-500 text-sm">{errors.contacts}</p>}
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={sendInvoice}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Send Invoice"}
      </button>

      {message && (
        <p className={`mt-4 text-center font-medium ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
