import React from 'react';
import { Sun, Cloud, Moon } from 'lucide-react';

const Greeting = () => {
    const hour = new Date().getHours();

    let greeting = '';
    let Icon = null;

    if (hour >= 5 && hour < 12) {
        greeting = 'Good Morning';
        Icon = Sun;
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
        Icon = Cloud;
    } else {
        greeting = 'Good Evening';
        Icon = Moon;
    }

    return (
        <div className="flex items-center space-x-2 text-white font-bold text-xl">
            <Icon className="w-6 h-6 text-yellow-300" />
            <span>{greeting}</span>
        </div>
    );
};

export default Greeting;
