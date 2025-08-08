import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PageLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black flex flex-col relative">

            {/* Background Layer */}
            <div className="absolute inset-0 overflow-hidden z-0">
                {/* Top Right Circle */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>

                {/* Bottom Left Circle */}
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>

                {/* Middle Left Circle */}
                <div className="absolute top-40 left-40 w-60 h-60 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse"></div>

                {/* Decorative borders */}
                <div className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-24 h-24 border border-white/5 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-0 w-2 h-20 bg-white/20 rounded-full"></div>
                <div className="absolute top-1/4 right-0 w-1 h-32 bg-white/10 rounded-full"></div>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main style={{ paddingTop: '7%' }} className="flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default PageLayout;
