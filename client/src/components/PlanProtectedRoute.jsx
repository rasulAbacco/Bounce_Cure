// client/src/components/PlanProtectedRoute.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hasCRMAccess, getUserPlan } from '../utils/PlanAccessControl';
import { Lock, ArrowRight } from 'lucide-react';

const PlanProtectedRoute = ({ children, requiresCRM = false }) => {
    const navigate = useNavigate();
    const userPlan = getUserPlan();
    const hasAccess = hasCRMAccess();

    // If route requires CRM access and user doesn't have it
    if (requiresCRM && !hasAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
                    {/* Lock Icon */}
                    <div className="mx-auto w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-10 h-10 text-yellow-500" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-3">
                        CRM Access Restricted
                    </h2>

                    {/* Description */}
                    <p className="text-gray-300 mb-2">
                        Your current <span className="font-semibold text-yellow-400">{userPlan}</span> plan doesn't include CRM access.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                        Upgrade to <span className="font-semibold text-white">Standard</span> or <span className="font-semibold text-white">Premium</span> plan to unlock full CRM features.
                    </p>

                    {/* Features List */}
                    <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
                        <p className="text-white font-semibold mb-3 text-sm">CRM Features Include:</p>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                Inbox & Lead Management
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                Contact Management
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                Advanced Segmentation
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                Customer Journey Tracking
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                Custom Fields & Tags
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/pricingdash')}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            Upgrade Now
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-lg transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // User has access, render the protected content
    return children;
};

export default PlanProtectedRoute;