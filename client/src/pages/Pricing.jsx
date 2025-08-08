import React, { useState, useEffect } from 'react';
import { Check, Mail, Users, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [slots, setSlots] = useState(100);
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);

  // Base pricing structure
  const basePricing = {
    monthly: {
      emailWarmUp: 18.78,
      proPlan: 32.5,
      growthPlan: 140.8
    },
    quarterly: {
      emailWarmUp: 16.90, // 10% discount
      proPlan: 29.25,
      growthPlan: 126.72
    },
    annually: {
      emailWarmUp: 15.02, // 20% discount
      proPlan: 26.00,
      growthPlan: 112.64
    }
  };

  // Integration options
  const integrations = [
    { id: 'salesforce', name: 'Salesforce', price: 15 },
    { id: 'hubspot', name: 'HubSpot', price: 12 },
    { id: 'pipedrive', name: 'Pipedrive', price: 10 },
    { id: 'zapier', name: 'Zapier', price: 8 },
    { id: 'slack', name: 'Slack', price: 5 },
    { id: 'gmail', name: 'Gmail', price: 7 }
  ];

  // Calculate slot-based pricing
  const calculateSlotPrice = (basePrice, slotCount) => {
    const additionalSlots = Math.max(0, slotCount - 50); // First 50 slots included
    const slotPrice = billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4;
    return basePrice + (additionalSlots * slotPrice);
  };

  // Calculate integration costs
  const integrationCosts = selectedIntegrations.reduce((total, integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    const multiplier = billingPeriod === 'monthly' ? 1 : billingPeriod === 'quarterly' ? 3 : 12;
    return total + (integration ? integration.price * multiplier : 0);
  }, 0);

  const toggleIntegration = (integrationId) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const currentPricing = basePricing[billingPeriod];
  const emailWarmUpPrice = calculateSlotPrice(currentPricing.emailWarmUp, slots) + integrationCosts;
  const proPrice = calculateSlotPrice(currentPricing.proPlan, slots) + integrationCosts;
  const growthPrice = calculateSlotPrice(currentPricing.growthPlan, slots) + integrationCosts;

  const formatPeriod = () => {
    switch(billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'annually': return 'year';
      default: return 'month';
    }
  };

  return (
    <div className="">
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Calculator</h1>
          <p className="text-xl text-gray-600">Calculate pricing based on your needs</p>
        </div>

        {/* Billing Period Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg border">
            {[
              { key: 'monthly', label: 'Monthly' },
              { key: 'quarterly', label: 'Quarterly' },
              { key: 'annually', label: 'Annually', badge: 'Save 20%' }
            ].map(({ key, label, badge }) => (
              <button
                key={key}
                onClick={() => setBillingPeriod(key)}
                className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  billingPeriod === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {label}
                {badge && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Slots Input */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border max-w-md w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Slots
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={slots}
              onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold text-center"
            />
            <p className="text-sm text-gray-500 mt-2">
              First 50 slots included • Additional slots from ${billingPeriod === 'monthly' ? '0.50' : billingPeriod === 'quarterly' ? '0.45' : '0.40'} each
            </p>
          </div>
        </div>

        {/* Integrations */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Add Integrations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {integrations.map((integration) => (
              <button
                key={integration.id}
                onClick={() => toggleIntegration(integration.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedIntegrations.includes(integration.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{integration.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${integration.price}/{formatPeriod() === 'month' ? 'mo' : formatPeriod() === 'quarter' ? 'qtr' : 'yr'}
                </div>
                {selectedIntegrations.includes(integration.id) && (
                  <Check className="w-4 h-4 mx-auto mt-2 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Email Warm Up */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-4">
                <Mail className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Email Warm Up</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Automatically warm up your professional email account through strategic interactions
              </p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${emailWarmUpPrice.toFixed(2)}
                </div>
                <div className="text-gray-500">per {formatPeriod()}, billed {billingPeriod}</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Up to {slots} slots per {formatPeriod()}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Smart warm-up algorithm</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">24/7 monitoring</span>
                </li>
              </ul>

              <button className="w-full bg-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-500 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-b-lg text-sm font-medium">
              Most Popular
            </div>
            <div className="p-8 pt-12">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Pro Plan</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Access all your recruitment activities in one single team and collaborate
              </p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${proPrice.toFixed(2)}
                </div>
                <div className="text-gray-500">per {formatPeriod()}, billed {billingPeriod}</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Up to {slots} slots per {formatPeriod()}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">25 candidates per slot</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Team collaboration</span>
                </li>
              </ul>

              <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>

          {/* Growth Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-300 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Growth Plan</h3>
                <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                  Most Advanced
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Access all your recruitment activities in one single team and collaborate
              </p>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  ${growthPrice.toFixed(2)}
                </div>
                <div className="text-gray-500">per {formatPeriod()}, billed {billingPeriod}</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Up to {slots} slots per {formatPeriod()}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">200 candidates per slot</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
              </ul>

              <button className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {(selectedIntegrations.length > 0 || slots > 50) && (
          <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing Summary</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Base slots (50):</span>
                <span>Included</span>
              </div>
              {slots > 50 && (
                <div className="flex justify-between">
                  <span>Additional slots ({slots - 50}):</span>
                  <span>${((slots - 50) * (billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4)).toFixed(2)}</span>
                </div>
              )}
              {selectedIntegrations.length > 0 && (
                <div className="flex justify-between">
                  <span>Integrations ({selectedIntegrations.length}):</span>
                  <span>${integrationCosts.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 font-semibold text-gray-900">
                <div className="flex justify-between">
                  <span>Total additional cost:</span>
                  <span>${(integrationCosts + Math.max(0, slots - 50) * (billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4)).toFixed(2)} per {formatPeriod()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200">
            Start free trial
          </button>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200">
            Email me this quote
          </button>
        </div>
      </div>
    </div>

    {/* footer */}
    <Footer/>
    </div>
  );
};

export default Pricing;