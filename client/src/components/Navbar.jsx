import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import {
  FaEnvelope, FaListAlt, FaPlug, FaInstagram, FaTwitter, FaWhatsapp,
  FaFacebook, FaLinkedin, FaYoutube, FaSms, FaGoogle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { RiTwitterXFill } from "react-icons/ri";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [multimediaOpen, setMultimediaOpen] = useState(false);

  // 🔹 Looping Typewriter states
  const text = "BOUNCE CURE";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;

    if (!isDeleting && index < text.length) {
      // Typing forward
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 150);
    } else if (isDeleting && index > 0) {
      // Deleting backward
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        setIndex(index - 1);
      }, 100);
    } else if (index === text.length) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (index === 0 && isDeleting) {
      // Restart typing
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting, text]);

  const links = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Features', to: '/features' },
    { name: 'Services', to: '/services' },
    { name: 'Multimedia', to: '/multimedia' },
    { name: 'Pricing', to: '/pricing' },
    { name: 'Contact', to: '/contact' },
  ];

  const services = [
    { name: 'Email Verification', icon: <FaEnvelope />, to: '/services/email-verification' },
    { name: 'Bulk Verification', icon: <FaListAlt />, to: '/services/bulk-verification' },
    { name: 'Integrations', icon: <FaPlug />, to: '/services/integrations' },
  ];

  const multimedia = [
    { name: 'Instagram Campaign', icon: <FaInstagram className="text-pink-500" />, to: '' },
    { name: 'Twitter Campaign', icon: <RiTwitterXFill className="text-sky-400" />, to: '' },
    { name: 'WhatsApp Campaign', icon: <FaWhatsapp className="text-green-500" />, to: '' },
    { name: 'Facebook Campaign', icon: <FaFacebook className="text-blue-500" />, to: '' },
    { name: 'LinkedIn Campaign', icon: <FaLinkedin className="text-blue-700" />, to: '' },
    { name: 'YouTube Ads', icon: <FaYoutube className="text-red-600" />, to: '' },
    { name: 'SMS Campaign', icon: <FaSms className="text-purple-500" />, to: '' },
    { name: 'Google Ads ', icon: <FaGoogle className="text-yellow-500" />, to: '' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">


        {/* Logo with Typewriter */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          {/* Logo */}
          <img
            src="../Bounce.logo.gif"
            alt="Bounce Cure Logo"
            className="w-[60px] h-auto"
          />

          {/* Brand Name + Slogan */}
          <div className="flex flex-col leading-tight">
            <h1
              className="text-2xl font-extrabold text-[#c2831f] flex items-center relative"
              style={{ fontFamily: "'League Spartan', sans-serif" }}
            >
              {displayedText}
              <span className="animate-pulse">|</span>

              {/* 🔥 Blinking Underline */}
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#c2831f] animate-blink"></span>
            </h1>

            <p className="text-xs font-medium bg-gradient-to-r from-[#c2831f] to-[#ffffff] bg-clip-text text-transparent mt-1 animate-blink">
              Stronger Lists & Smarter Deliveries
            </p>

          </div>

        </div>




        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-8 items-center">
          {links.map((link) =>
            link.name === "Services" ? (
              <div key={link.name} className="relative group">
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="relative inline-flex items-center text-white hover:text-[#c2831f] font-medium transition duration-600 cursor-pointer
            after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
            after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left"
                >
                  {link.name}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-600 ${servicesOpen ? "rotate-180" : "rotate-0"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10">
                    {services.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="flex items-center whitespace-nowrap px-4 py-2 hover:bg-white/10 rounded-lg text-white transition duration-300"
                      >
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>
                        <span className="ml-3 relative text-left hover:text-[#c2831f]
                    after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
                    after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left">
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : link.name === "Multimedia" ? (
              <div key={link.name} className="relative group">
                <button
                  onClick={() => setMultimediaOpen(!multimediaOpen)}
                  className="relative inline-flex items-center text-white hover:text-[#c2831f] font-medium transition duration-600 cursor-pointer
            after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
            after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left"
                >
                  {link.name}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-100 ${multimediaOpen ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {multimediaOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10">
                    {multimedia.map((item) => (
                      <a
                        key={item.name}
                        href={item.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center whitespace-nowrap px-4 py-2 hover:bg-white/10 rounded-lg text-white transition duration-300"
                      >
                        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          {item.icon}
                        </span>
                        <span className="ml-3 relative text-left hover:text-[#c2831f]
                    after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
                    after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left">
                          {item.name}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.to}
                className="relative inline-block text-white hover:text-[#c2831f] font-medium transition duration-300
          after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
          after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left"
              >
                {link.name}
              </Link>
            )
          )}

          {/* Auth Buttons */}
          <a
            href="/signup"
            className="bg-[#c2831f] text-white text-1xl px-4 py-2 rounded-xl hover:bg-[#a86d1b] transition duration-300"
          >
            Sign Up
          </a>
          <a
            href="/login"
            className="border border-[#c2831f] text-white text-1xl px-4 py-2 rounded-xl hover:bg-[#c2831f] transition duration-300"
          >
            Sign In
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/40 backdrop-blur-lg px-6 pb-6 shadow-lg space-y-4 border-t border-white/10">
          <div className="space-y-3">
            {links.map((link) =>
              link.name === 'Services' ? (
                <div key={link.name}>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full flex justify-between items-center text-white text-lg font-medium hover:text-[#c2831f] transition duration-300"
                  >
                    {link.name}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : 'rotate-0'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {servicesOpen && (
                    <div className="mt-2 space-y-2 pl-4">
                      {services.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className="flex items-center space-x-2 text-white text-base hover:text-[#c2831f] transition duration-300"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : link.name === 'Multimedia' ? (
                <div key={link.name}>
                  <button
                    onClick={() => setMultimediaOpen(!multimediaOpen)}
                    className="w-full flex justify-between items-center text-white text-lg font-medium hover:text-[#c2831f] transition duration-300"
                  >
                    {link.name}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform duration-300 ${multimediaOpen ? 'rotate-180' : 'rotate-0'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {multimediaOpen && (
                    <div className="mt-2 space-y-2 pl-4">
                      {multimedia.map((item) => (
                        <a
                          key={item.name}
                          href={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-white text-base hover:text-[#c2831f] transition duration-300"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.to}
                  className="block text-white text-lg hover:text-[#c2831f] font-medium transition duration-300"
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3 pt-4">
            <a
              href="/signup"
              className="block bg-[#c2831f] text-white text-center text-lg px-4 py-2 rounded-xl hover:bg-[#a86d1b] transition duration-300"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="block border border-[#c2831f] text-white text-center text-lg px-4 py-2 rounded-xl hover:bg-[#c2831f] transition duration-300"
            >
              Sign In
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
