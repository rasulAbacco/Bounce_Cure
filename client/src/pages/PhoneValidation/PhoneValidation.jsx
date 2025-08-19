import React, { useState, useEffect } from "react";
import { Phone, CheckCircle, XCircle, AlertCircle, Shield, Trash2, Clock, LayoutDashboard } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const PhoneValidation = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("usa");
  const [validationResult, setValidationResult] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("");
  const [submittedResults, setSubmittedResults] = useState([]);
  
  // OTP related states
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Phone number validation patterns
  const patterns = {
    usa: {
      landline:
        /^(\+1)?[-.\s]?(\()?[2-9]\d{2}(\))?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}$/,
      mobile:
        /^(\+1)?[-.\s]?(\()?[2-9]\d{2}(\))?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}$/,
      formats: [
        "(555) 123-4567",
        "555-123-4567",
        "555.123.4567",
        "+1 555 123 4567",
      ],
    },
    india: {
      landline: /^(\+91)?[-.\s]?[1-9]\d{1,4}[-.\s]?\d{6,8}$/,
      mobile: /^(\+91)?[-.\s]?[6-9]\d{9}$/,
      formats: [
        "+91 98765 43210",
        "9876543210",
        "011-12345678",
        "+91-11-12345678",
      ],
    },
  };

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Real-time validation
  useEffect(() => {
    if (phoneNumber.length === 0) {
      setRealtimeStatus("");
      setShowOtpInput(false);
      setOtpSent(false);
      setOtpVerified(false);
      return;
    }

    const validateRealtime = () => {
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");
      const currentPattern = patterns[country];

      if (currentPattern.mobile.test(phoneNumber)) {
        setRealtimeStatus("valid-mobile");
      } else if (currentPattern.landline.test(phoneNumber)) {
        setRealtimeStatus("valid-landline");
      } else if (cleanNumber.length > 0) {
        setRealtimeStatus("invalid");
      } else {
        setRealtimeStatus("");
      }
    };

    const timeoutId = setTimeout(validateRealtime, 300);
    return () => clearTimeout(timeoutId);
  }, [phoneNumber, country]);

  const validatePhoneNumber = (number, selectedCountry) => {
    const cleanNumber = number.replace(/[^\d+]/g, "");
    const currentPattern = patterns[selectedCountry];

    if (cleanNumber.length === 0) {
      return {
        isValid: false,
        type: "empty",
        message: "Please enter a phone number",
      };
    }

    if (currentPattern.mobile.test(number)) {
      return {
        isValid: true,
        type: "mobile",
        message: `Valid ${selectedCountry.toUpperCase()} mobile number`,
        cleanNumber: cleanNumber,
      };
    } else if (currentPattern.landline.test(number)) {
      return {
        isValid: true,
        type: "landline",
        message: `Valid ${selectedCountry.toUpperCase()} landline number`,
        cleanNumber: cleanNumber,
      };
    } else {
      return {
        isValid: false,
        type: "invalid",
        message: `Invalid ${selectedCountry.toUpperCase()} phone number format`,
        cleanNumber: cleanNumber,
      };
    }
  };

  // Send OTP function (replace with actual backend API)
  const sendOTP = async (phoneNumber) => {
    setOtpLoading(true);
    setOtpError("");
    
    try {
      // Replace this with actual backend API call
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (response.ok) {
        setOtpSent(true);
        setShowOtpInput(true);
        setResendTimer(30); // 30 second cooldown
        setOtpError("");
      } else {
        const error = await response.json();
        setOtpError(error.message || 'Failed to send OTP');
      }
    } catch (error) {
      // For demo purposes, simulate OTP sending
      console.log(`Sending OTP to ${phoneNumber}`);
      setTimeout(() => {
        setOtpSent(true);
        setShowOtpInput(true);
        setResendTimer(30);
        setOtpError("");
      }, 1000);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP function (replace with actual backend API)
  const verifyOTP = async (phoneNumber, otpCode) => {
    setOtpLoading(true);
    setOtpError("");
    
    try {
      // Replace this with actual backend API call
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp: otpCode }),
      });
      
      if (response.ok) {
        setOtpVerified(true);
        setOtpError("");
        return true;
      } else {
        const error = await response.json();
        setOtpError(error.message || 'Invalid OTP');
        return false;
      }
    } catch (error) {
      // For demo purposes, simulate OTP verification
      // Consider OTP valid if it's "123456" for demo
      if (otpCode === "123456") {
        setOtpVerified(true);
        setOtpError("");
        return true;
      } else {
        setOtpError("Invalid OTP. Use '123456' for demo.");
        return false;
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async () => {
    const result = validatePhoneNumber(phoneNumber, country);
    setValidationResult(result);

    // If it's a valid Indian mobile number, require OTP verification
    if (result.isValid && result.type === "mobile" && country === "india") {
      if (!otpVerified) {
        if (!otpSent) {
          await sendOTP(phoneNumber);
        }
        return; // Don't add to results until OTP is verified
      }
    }

    // Add to submitted results history
    const newResult = {
      id: Date.now(),
      number: phoneNumber,
      country: country.toUpperCase(),
      ...result,
      otpVerified: result.type === "mobile" && country === "india" ? otpVerified : null,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSubmittedResults((prev) => [newResult, ...prev.slice(0, 4)]);
    
    // Reset OTP states
    setShowOtpInput(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
  };

  const handleSendOtp = async () => {
    const result = validatePhoneNumber(phoneNumber, country);
    if (result.isValid && result.type === "mobile" && country === "india") {
      await sendOTP(phoneNumber);
    }
  };

  const handleOtpVerification = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP");
      return;
    }

    const verified = await verifyOTP(phoneNumber, otp);
    if (verified) {
      // Automatically submit after verification
      handleSubmit();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      sendOTP(phoneNumber);
    }
  };

  const handleClear = () => {
    setPhoneNumber("");
    setValidationResult(null);
    setRealtimeStatus("");
    setShowOtpInput(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setOtpError("");
  };

  const deleteHistoryItem = async (id, phoneNumber, requiresOtp = false) => {
    if (requiresOtp) {
      const otpForDelete = prompt("Enter OTP to delete this entry:");
      if (!otpForDelete) return;
      
      // For demo, accept "123456" as valid OTP
      if (otpForDelete !== "123456") {
        alert("Invalid OTP. Use '123456' for demo.");
        return;
      }
    }
    
    setSubmittedResults(prev => prev.filter(item => item.id !== id));
  };

  const getRealtimeIcon = () => {
    switch (realtimeStatus) {
      case "valid-mobile":
      case "valid-landline":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "invalid":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Phone className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRealtimeMessage = () => {
    switch (realtimeStatus) {
      case "valid-mobile":
        return `Valid ${country.toUpperCase()} mobile number`;
      case "valid-landline":
        return `Valid ${country.toUpperCase()} landline number`;
      case "invalid":
        return "Invalid format";
      default:
        return "";
    }
  };

  const shouldShowValidateButton = () => {
    const result = validatePhoneNumber(phoneNumber, country);
    
    // For USA numbers or Indian landlines, show validate button directly
    if (country === "usa" || (country === "india" && result.type === "landline")) {
      return result.isValid;
    }
    
    // For Indian mobile numbers, show validate button only after OTP verification
    if (country === "india" && result.type === "mobile") {
      return result.isValid && otpVerified;
    }
    
    return false;
  };

  const shouldShowSendOtpButton = () => {
    const result = validatePhoneNumber(phoneNumber, country);
    return result.isValid && result.type === "mobile" && country === "india" && !otpSent && !otpVerified;
  };

  return (
     <DashboardLayout>
    <div className="min-h-screen bg-black py-8 px-4 mt-20 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">
            Phone Number Validator
          </h1>
          <p className="text-gray-300">
            Validate USA and Indian phone numbers with OTP verification for Indian mobiles
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Validation Form */}
          <div className="bg-black rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-yellow-500 mb-6">
              Validate Phone Number
            </h2>

            <div className="space-y-6">
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Country
                </label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    handleClear();
                  }}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-black text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="usa">United States</option>
                  <option value="india">India</option>
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={`Enter ${
                      country === "usa" ? "US" : "Indian"
                    } phone number`}
                    className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-lg bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    disabled={otpSent && !otpVerified}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getRealtimeIcon()}
                  </div>
                </div>

                {realtimeStatus && (
                  <p
                    className={`mt-2 text-sm ${
                      realtimeStatus.includes("valid")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {getRealtimeMessage()}
                    {realtimeStatus === "valid-mobile" && country === "india" && (
                      <span className="ml-2 text-yellow-500">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Requires OTP verification
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* OTP Input Section */}
              {showOtpInput && (
                <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500">
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-yellow-500 mr-2" />
                    <h4 className="text-yellow-500 font-medium">OTP Verification Required</h4>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">
                    We've sent a 6-digit OTP to {phoneNumber}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          setOtpError("");
                        }}
                        placeholder="Enter 6-digit OTP"
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-black text-white text-center text-lg tracking-widest focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        maxLength="6"
                      />
                      {otpError && (
                        <p className="text-red-400 text-sm mt-2">{otpError}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleOtpVerification}
                        disabled={otp.length !== 6 || otpLoading}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>
                      
                      <button
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || otpLoading}
                        className="px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {resendTimer > 0 ? (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {resendTimer}s
                          </span>
                        ) : (
                          "Resend"
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-400 text-center">
                      Demo: Use OTP "123456" for verification
                    </p>
                  </div>
                </div>
              )}

              {/* Format Examples */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-500 mb-2">
                  Accepted Formats for {country === "usa" ? "USA" : "India"}:
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {patterns[country].formats.map((format, index) => (
                    <li key={index} className="font-mono">
                      {format}
                    </li>
                  ))}
                </ul>
                {country === "india" && (
                  <p className="text-xs text-yellow-400 mt-2">
                    * Mobile numbers require OTP verification
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                {shouldShowSendOtpButton() && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </button>
                )}
                
                {shouldShowValidateButton() && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-yellow-500 text-black py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                  >
                    Validate Number
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div
                className={`mt-6 p-4 rounded-lg border-l-4 ${
                  validationResult.isValid
                    ? "bg-green-900 border-green-500"
                    : "bg-red-900 border-red-500"
                }`}
              >
                <div className="flex items-center">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <div>
                    <p
                      className={`font-medium ${
                        validationResult.isValid
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {validationResult.message}
                      {validationResult.isValid && 
                       validationResult.type === "mobile" && 
                       country === "india" && 
                       otpVerified && (
                        <span className="ml-2 text-yellow-400">
                          <Shield className="w-4 h-4 inline mr-1" />
                          OTP Verified
                        </span>
                      )}
                    </p>
                    {validationResult.isValid && (
                      <p className="text-sm text-gray-300 mt-1">
                        Type: {validationResult.type} | Clean format:{" "}
                        {validationResult.cleanNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results History */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-yellow-500 mb-6">
              Validation History
            </h2>

            {submittedResults.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No validations yet</p>
                <p className="text-sm text-gray-500">
                  Submit a phone number to see results here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-4 rounded-lg border ${
                      result.isValid
                        ? "border-green-700 bg-green-900"
                        : "border-red-700 bg-red-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {result.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className="font-mono text-sm font-medium">
                            {result.number}
                          </span>
                          <span className="ml-2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                            {result.country}
                          </span>
                          {result.otpVerified && (
                            <span className="ml-2 px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              OTP
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            result.isValid ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {result.message}
                        </p>
                        {result.isValid && (
                          <p className="text-xs text-gray-400 mt-1">
                            Clean: {result.cleanNumber} | Type: {result.type}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {result.timestamp}
                        </span>
                        <button
                          onClick={() => deleteHistoryItem(
                            result.id, 
                            result.number, 
                            result.otpVerified
                          )}
                          className="text-red-400 hover:text-red-300 p-1"
                          title={result.otpVerified ? "Delete (requires OTP)" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Numbers Section */}
        <div className="mt-8 bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-yellow-500 mb-4">
            Test Numbers
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-yellow-500 mb-3">
                USA Numbers
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">(555) 123-4567</span>
                  <span className="px-2 py-1 bg-green-700 text-green-200 rounded text-xs">
                    Valid
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">+1 555-987-6543</span>
                  <span className="px-2 py-1 bg-green-700 text-green-200 rounded text-xs">
                    Valid
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">123-456-7890</span>
                  <span className="px-2 py-1 bg-red-700 text-red-200 rounded text-xs">
                    Invalid
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-yellow-500 mb-3">
                Indian Numbers
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">+91 98765 43210</span>
                  <span className="px-2 py-1 bg-yellow-700 text-yellow-200 rounded text-xs">
                    Valid Mobile (OTP)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">011-12345678</span>
                  <span className="px-2 py-1 bg-green-700 text-green-200 rounded text-xs">
                    Valid Landline
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-mono">12345</span>
                  <span className="px-2 py-1 bg-red-700 text-red-200 rounded text-xs">
                    Invalid
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-3">
            Quick test with sample numbers:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                setCountry("usa");
                setPhoneNumber("(555) 123-4567");
                handleClear();
              }}
              className="px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              USA Valid
            </button>
            <button
              onClick={() => {
                setCountry("india");
                setPhoneNumber("+91 98765 43210");
                handleClear();
              }}
              className="px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              India Mobile (OTP)
            </button>
            <button
              onClick={() => {
                setCountry("india");
                setPhoneNumber("011-12345678");
                handleClear();
              }}
              className="px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              India Landline
            </button>
            <button
              onClick={() => {
                setCountry("usa");
                setPhoneNumber("123-45-6789");
                handleClear();
              }}
              className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-800 transition-colors"
            >
              Invalid Format
            </button>
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
    
  );
};

export default PhoneValidation;