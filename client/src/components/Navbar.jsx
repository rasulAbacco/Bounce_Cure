import React, { useState } from "react";
import { Menu, X, Mail, RefreshCw, CheckCircle } from "lucide-react";
import {
  FaEnvelope,
  FaListAlt,
  FaPlug,
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaSms,
  FaGoogle,
  FaAt
} from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { AtSign } from "lucide-react";


const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [multimediaOpen, setMultimediaOpen] = useState(false);

  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Features", to: "/features" },
    { name: "Services", to: "/services" },
    { name: "Multimedia", to: "/multimedia" },
    { name: "Pricing", to: "/pricing" },
    { name: "Contact", to: "/contact" },
  ];
  const services = [
    { name: "Email Verification", icon: <FaEnvelope />, to: "/services/email-verification" },
    { name: "Bulk Verification", icon: <FaListAlt />, to: "/services/bulk-verification" },
    { name: "Integrations", icon: <FaPlug />, to: "/services/integrations" },
  ];
  const multimedia = [
    { name: "WhatsApp Campaign", icon: <FaWhatsapp />, to: "/WatsupCampaign" },
    { name: "SMS Campaign", icon: <FaSms />, to: "/WatsupCampaign" },
    { name: "Facebook Campaign", icon: <FaFacebook />, to: "/WatsupCampaign" },
    { name: "Instagram Campaign", icon: <FaInstagram />, to: "/WatsupCampaign" },
    { name: "Twitter Campaign", icon: <RiTwitterXFill />, to: "/WatsupCampaign" },
    { name: "LinkedIn Campaign", icon: <FaLinkedin />, to: "/WatsupCampaign" },
    { name: "YouTube Ads", icon: <FaYoutube />, to: "/WatsupCampaign" },
    { name: "Google Ads", icon: <FaGoogle />, to: "/WatsupCampaign" },
  ];
  const SplitMailIcon = ({ startDelay = 0 }) => {
    const directions = [
      { x: -40, y: -40, delay: 0 },
      { x: 0, y: -50, delay: 0.1 },
      { x: 40, y: -40, delay: 0.2 },
      { x: -50, y: 0, delay: 0.3 },
      { x: 50, y: 0, delay: 0.4 },
      { x: -40, y: 40, delay: 0.5 },
      { x: 0, y: 50, delay: 0.6 },
      { x: 40, y: 40, delay: 0.7 },
    ];

    return (
      <div className="relative w-full h-full overflow-visible">
        {/* Central Mail that pulses/fades */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Mail
            className="w-8 h-8 text-gray-100 z-10"
            style={{ animation: "mainMailFade 1.5s ease-in-out infinite" }}
          />
        </div>

        {/* Surrounding scatter icons (Mail + @ alternating) */}
        {directions.map((dir, index) => (
          <div
            key={index}
            className="absolute top-1/2 left-1/2 opacity-0"
            style={{
              animation: `mailSplit 1.5s ease-out ${startDelay + dir.delay}s infinite`,
              "--x": `${dir.x}px`,
              "--y": `${dir.y}px`,
            }}
          >
            {index % 2 === 0 ? (
              <Mail className="w-3 h-3 text-yellow-400" />
            ) : (
              <span className="w-3 h-3 inline-block text-yellow-400 font-bold">@</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    console.log("Logo clicked");

    // Try using React Router navigation first
    try {
      navigate('/');
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to regular navigation
      window.location.href = '/';
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <style>{`
        .nav-link { position: relative; color: white; font-weight: 500; padding-bottom: 4px; transition: color 0.3s ease; }
        .nav-link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px; background-color: #c2831f; transition: width 0.3s ease; }
        .nav-link:hover { color: #c2831f; }
        .nav-link:hover::after { width: 100%; }
        .multimedia-item { display: flex; align-items: center; color: white; transition: color 0.3s ease; }
        .multimedia-item:hover { color: #c2831f; }
        .multimedia-item svg { color: inherit; transition: color 0.3s ease; }
        @keyframes typewriterBounce { 0% { opacity: 0; width: 0; } 5% { opacity: 1; width: 0; } 20% { width: 100%; opacity: 1; transform: scale(1); } 22% { transform: scale(1.1); } 25% { opacity: 0; transform: scale(1); } 100% { opacity: 0; } }
        @keyframes mailPop { 0%, 25% { opacity: 0; transform: scale(0.3); } 28% { opacity: 1; transform: scale(1.3); } 30% { transform: scale(1); } 35% { transform: scale(1.1); } 40% { opacity: 0; transform: scale(0.5); } 100% { opacity: 0; } }
        @keyframes mailScatter { 0% { opacity: 0; transform: translate(0,0) scale(0.5); } 10% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(0.3); } }
        @keyframes typewriterCure { 0%, 40% { opacity: 0; width: 0; } 43% { opacity: 1; width: 0; } 53% { width: 100%; opacity: 1; transform: scale(1.05); } 55% { transform: scale(1); } 58% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes fullTextAppear { 0%, 58% { opacity: 0; transform: scale(0.8); } 60% { opacity: 1; transform: scale(1.2); } 65% { transform: scale(0.9); } 70% { transform: scale(1); } 95% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes mainMailFade { 0%, 20% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes mailSplit { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.5); } }
        .animate-typewriter-bounce { display: inline-block; overflow: hidden; white-space: nowrap; animation: typewriterBounce 16s linear infinite; }
        .animate-typewriter-cure { display: inline-block; overflow: hidden; white-space: nowrap; animation: typewriterCure 16s linear infinite; }
        .animate-full-text { animation: fullTextAppear 16s ease-in-out infinite; }
        .mail-container { position: relative; display: inline-block; }
        .mail-scatter { position: absolute; top: 0; left: 0; color: #facc15; opacity: 0; font-size: 0.7em; animation: mailScatter 0.6s ease forwards; }
      `}</style>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-1 py-2 flex items-center justify-between">
        {/* Logo & Animated Text */}
        <Link
          to="/"
          className="flex flex-col min-w-[300px] cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="flex items-center">
            {/* Left Spinning Circle with Mail Split */}
            <div className="relative w-13 h-13 mt-2">
              <RefreshCw
                className="absolute w-full h-full text-yellow-400/30 animate-spin"
                style={{ animationDuration: "4s" }}
              />
              <div className="relative w-full h-full bg-gradient-to-br from-[#c2831f] to-[#c2831f] rounded-full flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-[#c2831f] rounded-full animate-ping opacity-30"></div>
                <SplitMailIcon /> {/* Splitting Mail + @ */}
              </div>
              <CheckCircle
                className="absolute -top-2 -left-2 w-6 h-6 text-green-400 animate-pulse"
                style={{ animationDuration: "3s" }}
              />
            </div>

            {/* Right Text Section */}
            <div className="flex flex-col ml-4">
              <div className="relative w-56 h-8">
                {/* Step 1: Bounce text */}
                <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-[#c2831f] bg-clip-text text-transparent animate-typewriter-bounce">
                  B@UNCE
                </h1>

                {/* Step 2: Mail + @ scatter */}
                <div className="absolute inset-0 flex items-center justify-center space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="mail-container"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {/* Pop Mail */}
                      <FaAt
                        className="text-[#c2831f]"
                        style={{
                          animation: `mailPop 16s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      />

                      {/* Scatter (Mail + @ alternating) */}
                      {[...Array(5)].map((_, j) =>
                        j % 2 === 0 ? (
                          <Mail 
                            key={j}
                            className="mail-scatter text-yellow-400"
                            style={{
                              "--x": `${Math.random() * 40 - 20}px`,
                              "--y": `${Math.random() * -30 - 10}px`,
                              animationDelay: `${i * 0.3 + 0.3}s`,
                            }}
                          />
                        ) : (
                          <span
                            key={j}
                            className="mail-scatter text-yellow-400 font-bold text-xs"
                            style={{
                              "--x": `${Math.random() * 40 - 20}px`,
                              "--y": `${Math.random() * -30 - 10}px`,
                              animationDelay: `${i * 0.3 + 0.3}s`,
                            }}
                          >
                            @
                          </span>
                        )
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 3: Cure text */}
                <h1 className="absolute right-0 text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-[#c2831f] bg-clip-text text-transparent animate-typewriter-cure">
                  CURE
                </h1>

                {/* Step 4: Full text bounce */}
                <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-yellow-500 bg-clip-text text-transparent animate-full-text">
                  B<span className="text-white">@</span>UNCE CURE
                </h1>
              </div>

              {/* Slogan */}
              <p className="text-[#c2831f] text-sm mt-1 opacity-90 animate-bounce">
                Stronger Lists, Smarter Deliveries
              </p>
            </div>
          </div>

        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-8 items-center">
          {links.map((link) => {
            if (link.name === "Services") {
              return (
                <div key={link.name} className="relative group">
                  <button onClick={() => setServicesOpen(!servicesOpen)} className="nav-link flex items-center cursor-pointer">
                    {link.name}
                    <svg className={`ml-1 w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10">
                      {services.map((item) => (
                        <Link key={item.name} to={item.to} className="flex items-center px-2 py-2 text-white hover:text-[#c2831f] rounded-lg">
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (link.name === "Multimedia") {
              return (
                <div key={link.name} className="relative group">
                  <button onClick={() => setMultimediaOpen(!multimediaOpen)} className="nav-link flex items-center cursor-pointer">
                    {link.name}
                    <svg className={`ml-1 w-4 h-4 transition-transform ${multimediaOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {multimediaOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-black backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10">
                      {multimedia.map((item) => (
                        <a key={item.name} href={item.to} target="_blank" rel="noopener noreferrer" className="multimedia-item px-4 py-2 rounded-lg">
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return <Link key={link.name} to={link.to} className="nav-link">{link.name}</Link>;
            }
          })}
          <a href="/signup" className="bg-[#c2831f] text-white px-4 py-2 rounded-xl hover:bg-[#a66a1a]">Sign Up</a>
          <a href="/login" className="border border-[#c2831f] text-white px-4 py-2 rounded-xl hover:bg-[#c2831f]">Sign In</a>
        </div>
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/40 backdrop-blur-lg px-6 pb-6 shadow-lg border-t border-white/10">
          {links.map((link) => (
            <div key={link.name} className="mt-2">
              {link.name === "Services" ? (
                <>
                  <button onClick={() => setServicesOpen(!servicesOpen)} className="w-full flex justify-between text-white">
                    {link.name} <span>{servicesOpen ? "-" : "+"}</span>
                  </button>
                  {servicesOpen && services.map((item) => (
                    <Link key={item.name} to={item.to} className="block pl-4 mt-1 text-white">{item.name}</Link>
                  ))}
                </>
              ) : link.name === "Multimedia" ? (
                <>
                  <button onClick={() => setMultimediaOpen(!multimediaOpen)} className="w-full flex justify-between text-white">
                    {link.name} <span>{multimediaOpen ? "-" : "+"}</span>
                  </button>
                  {multimediaOpen && multimedia.map((item) => (
                    <a key={item.name} href={item.to} className="multimedia-item block pl-4 mt-1">
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </a>
                  ))}
                </>
              ) : (
                <Link to={link.to} className="block text-white">{link.name}</Link>
              )}
            </div>
          ))}
          <a href="/signup" className="block bg-[#c2831f] text-white text-center px-4 py-2 mt-3 rounded-xl">Sign Up</a>
          <a href="/login" className="block border border-[#c2831f] text-white text-center px-4 py-2 mt-2 rounded-xl">Sign In</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;