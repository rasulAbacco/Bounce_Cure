import React, { useState, useEffect } from "react";
import { Phone, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";

const PhoneValidation = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("usa");
  const [validationResult, setValidationResult] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("");
  const [submittedResults, setSubmittedResults] = useState([]);

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

  // Real-time validation
  useEffect(() => {
    if (phoneNumber.length === 0) {
      setRealtimeStatus("");
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

  const handleSubmit = () => {
    const result = validatePhoneNumber(phoneNumber, country);
    setValidationResult(result);

    // Add to submitted results history
    const newResult = {
      id: Date.now(),
      number: phoneNumber,
      country: country.toUpperCase(),
      ...result,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSubmittedResults((prev) => [newResult, ...prev.slice(0, 4)]);
  };

  const handleClear = () => {
    setPhoneNumber("");
    setValidationResult(null);
    setRealtimeStatus("");
  };

  const deleteHistoryItem = (id) => {
    setSubmittedResults((prev) => prev.filter(item => item.id !== id));
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black py-8 px-4 mt-20 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-500 mb-2">
              Phone Number Validator
            </h1>
            <p className="text-gray-300">
              Validate USA and Indian phone numbers (mobile + landline)
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
                      placeholder={`Enter ${country === "usa" ? "US" : "Indian"} phone number`}
                      className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-lg bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getRealtimeIcon()}
                    </div>
                  </div>
                  
                </div>

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
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-yellow-500 text-black py-3 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                  >
                    Validate Number
                  </button>
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
                            onClick={() => deleteHistoryItem(result.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Delete"
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PhoneValidation;
