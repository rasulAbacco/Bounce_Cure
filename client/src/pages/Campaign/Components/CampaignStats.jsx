import React from 'react';
import { Mail, Users, TrendingUp, Clock, ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, icon, change, period }) => {
    return (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 hover:border-[#c2831f]/50 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    {change !== undefined && (
                        <div className={`mt-2 text-sm flex items-center ${change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {change >= 0 ? (
                                <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                                <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(change)}% {period}
                        </div>
                    )}
                </div>
                <div className="p-2 rounded-full bg-[#c2831f]/20">
                    {React.cloneElement(icon, { className: "h-6 w-6 text-[#c2831f]" })}
                </div>
            </div>
        </div>
    );
};

const CampaignStats = () => {
    const stats = [
        {
            title: "Total Campaigns",
            value: "24",
            icon: <Mail />,
            change: 12.5,
            period: "vs last month"
        },
        {
            title: "Total Recipients",
            value: "12.5K",
            icon: <Users />,
            change: -3.2,
            period: "vs last month"
        },
        {
            title: "Avg Open Rate",
            value: "42.3%",
            icon: <TrendingUp />,
            change: 5.7,
            period: "vs last month"
        },
        {
            title: "Active Campaigns",
            value: "8",
            icon: <Clock />,
            change: 33.3,
            period: "vs last week"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    change={stat.change}
                    period={stat.period}
                />
            ))}
        </div>
    );
};

export default CampaignStats;