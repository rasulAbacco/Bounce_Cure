import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // icons from lucide-react
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

const links = [
  { name: 'Home', to: '/' },
  { name: 'About', to: '/about' },
  { name: 'Featurs', to: '/Featurs' },
  { name: 'Integrations', to: '/integrations' },
  { name: 'Pricing', to: '/pricing' },
  { name: 'Free Validation', to: '/validation' },
  { name: 'Contact', to: '/contact' },
];


  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 tracking-wide w-45 ">
          {/* <span className="animate-bounce inline-block">Bounce Core</span>  */}
           <img src="./Logo/1.png" alt=""  />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 items-center">
          {links.map((link) => (
          <Link
            key={link.name}
            to={link.to}
            className="relative text-gray-600 hover:text-blue-600 font-medium transition duration-300 
                      after:content-[''] after:absolute after:left-0 after:-bottom-1 
                      after:h-[2px] after:w-0 after:bg-blue-600 
                      hover:after:w-full after:transition-all after:duration-300 cursor-pointer"
          >
            {link.name}
          </Link>
          ))}

          {/* Auth Buttons */}
          <a
            href="#signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </a>
          <a
            href="#signin"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition duration-300"
          >
            Sign In
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-6 pb-6 shadow-lg space-y-4">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block text-gray-700 hover:text-blue-600 font-medium transition duration-300"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#signup"
            className="block bg-blue-600 text-white text-center px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </a>
          <a
            href="#signin"
            className="block border border-blue-600 text-blue-600 text-center px-4 py-2 rounded-xl hover:bg-blue-50 transition duration-300"
          >
            Sign In
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
