import React from 'react';
import { IconType } from 'react-icons';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    className = ''
}) => {
    return (
        <div className={`
      bg-gradient-card p-6 rounded-xl shadow-card border border-border
      hover:shadow-hover hover:bg-dashboard-card-hover transition-all duration-300
      group cursor-pointer ${className}
    `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{value}</h3>
                    {trend && (
                        <div className="flex items-center space-x-1">
                            <span className={`text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'
                                }`}>
                                {trend.isPositive ? '↗' : '↘'} {trend.value}
                            </span>
                            <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-golden/10 rounded-lg group-hover:bg-golden/20 transition-colors">
                    <Icon className="h-6 w-6 text-golden" />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;