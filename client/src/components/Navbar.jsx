import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FaEnvelope, FaListAlt, FaPlug } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const links = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Features', to: '/features' },
    { name: 'Services', to: '/services' },
    { name: 'Pricing', to: '/pricing' },
    { name: 'Contact', to: '/contact' },
  ];

  const services = [
    { name: 'Email Verification', icon: <FaEnvelope />, to: '/services/email-verification' },
    { name: 'Bulk Verification', icon: <FaListAlt />, to: '/services/bulk-verification' },
    { name: 'Integrations', icon: <FaPlug />, to: '/services/integrations' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 tracking-wide w-45">
          <img src="./Logo/2.png" alt="Logo" />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {links.map((link) =>
            link.name === 'Services' ? (
              <div
                key={link.name}
                className="relative group"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <span className="relative text-white hover:text-[#c2831f] font-medium transition duration-600 cursor-pointer after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left flex items-center">
                  {link.name}
                  <svg
                    className={`ml-1 w-4 h-4 transition-transform duration-300 ${servicesOpen ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg py-2 w-56 border border-white/10">
                    {services.map((item) => (
                      <Link
                        key={item.name}
                        to={item.to}
                        className="relative flex items-center space-x-2 px-4 py-2 text-white hover:text-[#c2831f] transition duration-300 after:content-[''] after:absolute after:left-4 after:-bottom-1 after:h-[2px] after:w-[calc(100%-5rem)] after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left"
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.to}
                className="relative text-white hover:text-[#c2831f] font-medium transition duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:scale-x-0 hover:after:scale-x-100 after:bg-[#c2831f] after:transition-transform after:duration-300 after:origin-left"
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

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/40 backdrop-blur-lg px-6 pb-6 shadow-lg space-y-4 border-t border-white/10">
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
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
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
