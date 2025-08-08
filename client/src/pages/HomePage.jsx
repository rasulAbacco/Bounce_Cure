import Navbar from "../components/Navbar";
import { CheckCircle } from "lucide-react"; // icon

import React, { useState } from "react";
import {
  Mail,
  Phone,
  Activity,
  Database,
  MapPin,
  Shield,
  Users,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

function HomePage() {
  const [activeTab, setActiveTab] = useState("phone");

  const tabs = [
    {
      id: "email",
      label: "Email Validation",
      icon: Mail,
      content: {
        title: "Email Hygiene + Real-Time Email Verification",
        description:
          "Verify if your emails will deliver and eliminate any email threats that will bounce, disrupt deliverability or harm sender reputation. 99.7% accurate with high speed file processing.",
        stats: "150+ Billion Emails Verified",
      },
    },
    {
      id: "phone",
      label: "Phone Validation",
      icon: Phone,
      content: {
        title: "Phone Validation",
        description:
          "Verify if your phone numbers are mobile or landlines while eliminating unknowns, TCPA Litigators and blacklisted phones. Find out previous and current carrier information to build more accurate SMS campaigns.",
        stats: "50+ Billion Numbers Validated",
      },
    },
    {
      id: "activity",
      label: "Email Activity",
      icon: Activity,
      content: {
        title: "Email Activity",
        description:
          "Identify your most active emails based on 30, 60, or 90 day engagement metrics through WEB and EMAIL based triggers. Monetize your data more effectively by targeting to those that are most recently engaged in online traffic.",
        stats: "25+ Billion Activities Tracked",
      },
    },
    {
      id: "enrichment",
      label: "Data Enrichment",
      icon: Database,
      content: {
        title: "Data Enrichment",
        description:
          "Enhance your customer data with additional demographic, geographic, and behavioral information to create more targeted marketing campaigns and improve conversion rates.",
        stats: "10+ Billion Records Enriched",
      },
    },
    {
      id: "postal",
      label: "Postal Validation",
      icon: MapPin,
      content: {
        title: "Postal Validation",
        description:
          "Validate and standardize postal addresses worldwide. Ensure accurate delivery with address correction and geolocation services for improved mail deliverability.",
        stats: "75+ Billion Addresses Verified",
      },
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const renderEmailValidation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Charts and Stats */}
      <div className="space-y-6">
        {/* Pie Chart Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Validation Results
              </h4>
              <p className="text-sm text-gray-500">23,526 Total Records</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">19,648</div>
              <div className="text-sm text-gray-500">Valid Emails</div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg
                className="w-32 h-32 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="83.5, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">83.5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Valid List
              </span>
              <span className="text-sm font-medium">19,648</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Risky
              </span>
              <span className="text-sm font-medium">2,314</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Invalid
              </span>
              <span className="text-sm font-medium">1,564</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Breakdown
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Syntax Valid</span>
              <span className="font-medium">4,283 (18.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Domain Valid</span>
              <span className="font-medium">4,174 (17.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MX Record</span>
              <span className="font-medium">3,992 (17.0%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disposable</span>
              <span className="font-medium">842 (3.6%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role Account</span>
              <span className="font-medium">567 (2.4%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <Mail className="h-12 w-12 text-blue-600 mr-4 p-2 bg-blue-100 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTabData.content.title}
            </h3>
            <p className="text-blue-600 font-semibold">
              {activeTabData.content.stats}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {activeTabData.content.description}
        </p>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">Key Features:</h4>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Real-time email verification</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Syntax and domain validation</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Spam trap detection</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Deliverability scoring</span>
          </div>
        </div>

        <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Learn more
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderPhoneValidation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Phone Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700">
          <h4 className="text-xl font-semibold text-white flex items-center">
            <Phone className="h-6 w-6 mr-2" />
            Phone Validation Results
          </h4>
          <p className="text-blue-100 text-sm mt-1">Real-time processing</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  571-286-7111
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">Michael</td>
                <td className="px-4 py-4 text-sm">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Valid Mobile
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                  98
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  517-555-4444
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">Sarah</td>
                <td className="px-4 py-4 text-sm">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Valid Landline
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                  85
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  971-808-5555
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">David</td>
                <td className="px-4 py-4 text-sm">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Disconnected
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <Phone className="h-12 w-12 text-blue-600 mr-4 p-2 bg-blue-100 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTabData.content.title}
            </h3>
            <p className="text-blue-600 font-semibold">
              {activeTabData.content.stats}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {activeTabData.content.description}
        </p>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">Key Features:</h4>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Mobile vs landline detection</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Carrier information lookup</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">TCPA compliance checking</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Number portability tracking</span>
          </div>
        </div>

        <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Learn More
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderEmailActivity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Activity Dashboard */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Email Activity Dashboard
          </h4>
          <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
            Processing
          </span>
        </div>

        <div className="space-y-6">
          {/* Activity Items */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">13,486,797</div>
                <div className="text-sm text-gray-500">30-day active</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">Active</div>
              <div className="text-xs text-gray-500">High engagement</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-medium">8,375,443</div>
                <div className="text-sm text-gray-500">60-day active</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-yellow-600">Medium</div>
              <div className="text-xs text-gray-500">Moderate engagement</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">2.4M</div>
                <div className="text-sm text-gray-500">90-day active</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">Low</div>
              <div className="text-xs text-gray-500">Minimal engagement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <Activity className="h-12 w-12 text-red-600 mr-4 p-2 bg-red-100 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTabData.content.title}
            </h3>
            <p className="text-red-600 font-semibold">
              {activeTabData.content.stats}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {activeTabData.content.description}
        </p>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">Key Features:</h4>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              30/60/90 day engagement tracking
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              Web and email trigger analysis
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Behavioral segmentation</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">
              Active subscriber identification
            </span>
          </div>
        </div>

        <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Learn More
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderDataEnrichment = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Enrichment Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">
          Data Enhancement Overview
        </h4>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <div className="text-sm text-gray-600">Match Rate</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">156</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <span className="text-gray-700">Demographic Data</span>
            <span className="text-green-600 font-medium">Available</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <span className="text-gray-700">Geographic Info</span>
            <span className="text-green-600 font-medium">Available</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <span className="text-gray-700">Social Profiles</span>
            <span className="text-yellow-600 font-medium">Partial</span>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <span className="text-gray-700">Purchase History</span>
            <span className="text-blue-600 font-medium">Enhanced</span>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <Database className="h-12 w-12 text-purple-600 mr-4 p-2 bg-purple-100 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTabData.content.title}
            </h3>
            <p className="text-purple-600 font-semibold">
              {activeTabData.content.stats}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {activeTabData.content.description}
        </p>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">Key Features:</h4>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Demographic profiling</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Social media matching</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Income estimation</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Interest categorization</span>
          </div>
        </div>

        <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Learn More
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderPostalValidation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Side - Address Validation */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <MapPin className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Postal Validation
            </h4>
            <p className="text-sm text-gray-500">
              75+ Billion Addresses Verified
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                Address Standardization
              </span>
              <span className="text-green-600 text-sm font-medium">
                ✓ Active
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Formats addresses to postal standards
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                ZIP+4 Code Validation
              </span>
              <span className="text-green-600 text-sm font-medium">
                ✓ Active
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Validates and appends ZIP+4 codes
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                International Support
              </span>
              <span className="text-blue-600 text-sm font-medium">
                ✓ Global
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Supports 240+ countries worldwide
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                Geocoding Services
              </span>
              <span className="text-purple-600 text-sm font-medium">
                ✓ Enhanced
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Provides latitude/longitude coordinates
            </p>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">
                Delivery Point Validation
              </span>
              <span className="text-green-600 text-sm font-medium">
                ✓ USPS Certified
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Confirms actual delivery points
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Info */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <MapPin className="h-12 w-12 text-blue-600 mr-4 p-2 bg-blue-100 rounded-xl" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeTabData.content.title}
            </h3>
            <p className="text-blue-600 font-semibold">
              {activeTabData.content.stats}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {activeTabData.content.description}
        </p>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-900">Key Features:</h4>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Address standardization</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">ZIP+4 code validation</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">International address support</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-gray-700">Delivery point validation</span>
          </div>
        </div>

        <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
          Learn More
          <svg
            className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "email":
        return renderEmailValidation();
      case "phone":
        return renderPhoneValidation();
      case "activity":
        return renderEmailActivity();
      case "enrichment":
        return renderDataEnrichment();
      case "postal":
        return renderPostalValidation();
      default:
        return renderEmailValidation();
    }
  };

  return (
    <div>
      <Navbar />
      <section className="bg-white py-16 px-6 lg:px-20 flex flex-col lg:flex-row items-center justify-between">
        {/* Left Image Section */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
          <img
            src="https://assets-global.website-files.com/608cb500f53dc42d2811089c/608f8c1f5b4bfa173b259eef_verify-Real-Time%20Email%20Verification_000.jpg"
            alt="Email Verification Illustration"
            className="w-full max-w-150 mt-26 mx-auto lg:mx-0"
          />
        </div>

        {/* Right Text Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left mt-25">
          {/* Icon + Label */}
          <div className="flex items-center justify-center lg:justify-start mb-3 text-blue-600 font-semibold">
            <CheckCircle className="w-5 h-5 mr-2" />
            Verify
          </div>

          {/* Title */}
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Real-Time Email Verification
          </h2>

          {/* Expanded Description */}
          <p className="text-gray-600 text-lg mb-4 max-w-xl">
            Ensure every email you collect is valid, deliverable, and safe to
            use—right at the point of entry. Say goodbye to fake or mistyped
            emails that hurt your deliverability.
          </p>
          <p className="text-gray-600 text-lg mb-6 max-w-xl">
            Integrate easily into your forms, lead generation pages, and CRMs
            with just a few lines of code.
          </p>

          {/* Feature List */}
          <ul className="text-left text-gray-700 mb-6 space-y-3 max-w-md mx-auto lg:mx-0">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
              Instantly validate emails at form submission
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
              Catch typos, disposable & spam-trap emails
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
              Improve email deliverability and sender score
            </li>
          </ul>

          {/* CTA Button */}
          <button className="bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold px-6 py-3 rounded-md shadow-lg">
            Try it Free
          </button>
        </div>
      </section>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold text-gray-900">
                  EmailOversight
                </h1>
              </div>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                200+ Billion Emails Verified and Counting
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                EmailOversight provides a smarter way to validate emails through
                our multi-method validation approach. We combine both real-time
                email verification, validation and email hygiene, which
                identifies more hard bounces and email threats such as
                spamtraps, complainers, bots, litigators and more. By simply
                removing these harmful email addresses, it will increase email
                deliverability performance, help create conversions, increase
                website traffic, raise engagement rates, and improve sender
                reputation.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide ml-45">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 whitespace-nowrap border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent
                      className={`h-5 w-5 mr-2 ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {renderTabContent()}
        </div>
      </div>

      {/* -------- */}
      <div class="bg-[#f9f9fc] py-12">
  <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
    <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-10 text-center">
      <p class="text-4xl font-bold text-[#0f1e49]">99.7%</p>
      <p class="text-base text-gray-500 mt-3">accuracy rate</p>
    </div>
    <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-10 text-center">
      <p class="text-4xl font-bold text-[#0f1e49]">2 billion</p>
      <p class="text-base text-gray-500 mt-3">verifications per month</p>
    </div>
    <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-10 text-center">
      <p class="text-4xl font-bold text-[#0f1e49]">200+ billion</p>
      <p class="text-base text-gray-500 mt-3">emails validated</p>
    </div>
  </div>
</div>

      {/* =============== */}
    </div>
  );
}

export default HomePage;
