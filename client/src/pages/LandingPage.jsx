import React from 'react';
import { Mail, Send, Zap, Globe, Shield, Cpu } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative lg:mt-[-130px]">
      {/* Animated Background Circuit Board */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c2831f" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#c2831f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c2831f" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          <g className="animate-pulse">
            <path d="M0,100 Q250,50 500,100 T1000,100" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" />
            <path d="M0,300 Q250,250 500,300 T1000,300" stroke="url(#circuit-gradient)" strokeWidth="1.5" fill="none" />
            <path d="M0,500 Q250,450 500,500 T1000,500" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" />
            <path d="M0,700 Q250,650 500,700 T1000,700" stroke="url(#circuit-gradient)" strokeWidth="1" fill="none" />
          </g>

          <g>
            <circle cx="200" cy="100" r="4" fill="#c2831f" className="animate-ping" />
            <circle cx="400" cy="300" r="3" fill="#c2831f" className="animate-ping" style={{ animationDelay: '1s' }} />
            <circle cx="600" cy="500" r="5" fill="#c2831f" className="animate-ping" style={{ animationDelay: '2s' }} />
            <circle cx="800" cy="700" r="3" fill="#c2831f" className="animate-ping" style={{ animationDelay: '0.5s' }} />
          </g>
        </svg>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 lg:top-36 xl:top-38 left-10 w-6 h-6 border-2 border-[#c2831f] rotate-45 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-[#c2831f] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-36 lg:bottom-40 left-20 w-8 h-8 border border-[#c2831f] animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-56 lg:bottom-60 right-10 w-5 h-5 bg-gradient-to-r from-[#c2831f] to-transparent rotate-45 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen gap-18 xl:gap-0">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 space-y-8 lg:ml-10 xl:ml-15 px-4 sm:px-6 lg:px-0 mt-[50px]">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold leading-tight">
                <span className="text-[#c2831f] block animate-fade-in-up">
                  Real-Time Email Verification
                </span>
              </h1>

              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-lg sm:text-xl text-gray-300 font-light">
                  emails are sent every day*
                </p>
              </div>

              <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <p className="text-gray-600 text-base sm:text-lg mb-4 max-w-xl mx-auto lg:mx-0 text-white">
                  Ensure every email you collect is valid, deliverable, and safe to
                  use right at the point of entry. Say goodbye to fake or mistyped
                  emails that hurt your deliverability.
                </p>
                <p className="text-gray-600 text-base sm:text-lg mb-6 max-w-xl mx-auto lg:mx-0 text-white">
                  Integrate easily into your forms, lead generation pages, and CRMs
                  with just a few lines of code.
                </p>
              </div>

              <div className="flex justify-center lg:justify-start">
                <button
                  className="bg-[#c2831f] hover:bg-[#a06d1a] cursor-pointer text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-fade-in-up flex items-center space-x-2 group"
                  style={{ animationDelay: '0.8s' }}
                >
                  <span>Sign up for Free</span>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform " />
                </button>
              </div>
            </div>
          </div>

          {/* Right Visual Content */}
          <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:mr-13 xl:ml-20 px-4 sm:px-6 lg:px-0">
            <div className="relative">
              <div className="relative transform rotate-6 hover:rotate-3 transition-transform duration-700 animate-float mt-10 sm:mt-15">
                
                {/* Primary Email Device */}
                <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#c2831f] rounded-2xl p-6 shadow-2xl backdrop-blur-sm relative overflow-hidden w-full sm:w-96 lg:w-[26rem] xl:w-[28rem] lg:h-[22rem] xl:h-[24rem]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#c2831f] to-transparent opacity-20 animate-pulse"></div>

                  <div className="relative z-10 space-y-10 sm:space-y-17">
                    <div className="flex items-center space-x-2 mb-4">
                      <Mail className="w-6 h-6 text-[#c2831f]" />
                      <div className="text-sm text-gray-300"> Email Verify</div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-[#c2831f] to-transparent rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-700 rounded-full w-1/2"></div>
                      <div className="h-3 bg-gray-700 rounded-full w-5/6"></div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <Shield className="w-5 h-5 text-[#c2831f] animate-spin" style={{ animationDuration: '4s' }} />
                      <Globe className="w-5 h-5 text-[#c2831f] animate-spin" style={{ animationDuration: '4s' }} />
                      <Zap className="w-5 h-5 text-[#c2831f] animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                  </div>
                </div>

                {/* Secondary Device */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-gray-800 to-black border border-[#c2831f] rounded-xl p-4 shadow-xl w-24 sm:w-30 h-28 sm:h-32 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="space-y-2">
                    <div className="w-4 h-4 bg-[#c2831f] rounded-full animate-ping"></div>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-600 rounded w-full"></div>
                      <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-1 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Third Device */}
                <div className="absolute -bottom-4 -left-8 bg-gradient-to-br from-gray-900 to-black border border-[#c2831f] rounded-lg p-3 shadow-xl w-20 sm:w-25 h-24 sm:h-28 animate-float" style={{ animationDelay: '2s' }}>
                  <Cpu className="w-6 h-6 text-[#c2831f] animate-pulse mx-auto mb-2" />
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-600 rounded w-full"></div>
                    <div className="h-1 bg-[#c2831f] rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Flying Elements */}
              <div className="absolute -top-10 -right-20 animate-fly">
                <Send className="w-8 h-8 text-[#c2831f] transform rotate-45" />
              </div>
              <div className="absolute -bottom-10 -left-10 animate-fly-reverse">
                <Mail className="w-6 h-6 text-[#c2831f]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Circuit Animation */}
      <div className="absolute left-0 right-0 h-32 overflow-hidden" style={{ marginTop: "-150px" }}>
        
        {/* Animated Dots */}
        <div className="absolute bottom-6 left-3 w-2 h-2 bg-[#c2831f] rounded-full animate-slide-right"></div> 
        <div className="absolute bottom-14 left-10 w-1.5 h-1.5 bg-[#c2831f] rounded-full animate-slide-right" style={{ animationDelay: '1s' }}></div> 

        <div className="absolute bottom-24 left-6 w-2.5 h-2.5 bg-[#c2831f] rounded-full animate-slide-right"></div> 
        <div className="absolute bottom-32 left-14 w-1 h-1 bg-[#c2831f] rounded-full animate-slide-right" style={{ animationDelay: '1.2s' }}></div> 

        <div className="absolute bottom-10 left-20 w-2 h-2 bg-[#c2831f] rounded-full animate-slide-right" style={{ animationDelay: '0.7s' }}></div> 
        <div className="absolute bottom-28 left-2 w-1.5 h-1.5 bg-[#c2831f] rounded-full animate-slide-right" style={{ animationDelay: '1.5s' }}></div> 

      </div>

      {/* Custom Keyframes */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(6deg);
          }
          50% {
            transform: translateY(-10px) rotate(3deg);
          }
        }
        @keyframes fly {
          0% {
            transform: translateX(-20px) translateY(10px) rotate(45deg);
          }
          50% {
            transform: translateX(20px) translateY(-10px) rotate(45deg);
          }
          100% {
            transform: translateX(-20px) translateY(10px) rotate(45deg);
          }
        }
        @keyframes fly-reverse {
          0% {
            transform: translateX(20px) translateY(-10px) rotate(0deg);
          }
          50% {
            transform: translateX(-20px) translateY(10px) rotate(0deg);
          }
          100% {
            transform: translateX(20px) translateY(-10px) rotate(0deg);
          }
        }
        @keyframes slide-right {
          0% {
            left: -10px;
          }
          100% {
            left: 100%;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fly {
          animation: fly 4s ease-in-out infinite;
        }
        .animate-fly-reverse {
          animation: fly-reverse 5s ease-in-out infinite;
        }
        .animate-slide-right {
          animation: slide-right 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
