import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Lock, Bell, Palette, Globe, CreditCard, Shield } from 'lucide-react';
import { FaUserAlt } from "react-icons/fa";
const SectionCard = ({ icon: Icon, title, description, color }) => (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 
                    shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-300
                    flex flex-col gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
    </div>
);

const Settings = () => {
    const sections = [
        { icon: FaUserAlt, title: "Profile", description: "Update your name, email, profile picture and personal details.", color: "bg-blue-500" },
        { icon: Lock, title: "Security", description: "Change password, enable 2FA, and review login history.", color: "bg-red-500" },
        { icon: Bell, title: "Notifications", description: "Set your email, push, and in-app notification preferences.", color: "bg-yellow-500" },
        { icon: Palette, title: "Appearance", description: "Switch between light, dark, or custom themes with accents.", color: "bg-purple-500" },
        { icon: Globe, title: "Language & Region", description: "Choose your language, timezone, and date formatting.", color: "bg-green-500" },
        { icon: CreditCard, title: "Billing", description: "Manage subscriptions, invoices, and payment methods.", color: "bg-pink-500" },
        { icon: Shield, title: "Privacy", description: "Control your account visibility, permissions, and sharing.", color: "bg-teal-500" },
    ];

    return (
        <DashboardLayout pageName="Settings">
            <div className="p-8 text-white">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((sec, index) => (
                        <SectionCard key={index} {...sec} />
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
