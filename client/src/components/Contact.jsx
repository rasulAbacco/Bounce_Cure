import React, { useState } from 'react';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    service: 'general',
    message: '',
    subscribe: false,
  });

  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const temp = {};
    if (!formData.fullname.trim()) temp.fullname = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      temp.email = 'Please enter a valid email.';
    if (!formData.message.trim() || formData.message.length < 8)
      temp.message = 'Message is too short (minimum 8 characters).';
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFeedback('');

    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback('success');
      setFormData({
        fullname: '',
        email: '',
        phone: '',
        service: 'general',
        message: '',
        subscribe: false,
      });

      setTimeout(() => setFeedback(''), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'USA Office',
      content: '3524 SILVERSIDE ROAD, SUITE 35B\nWILMINGTON, DE 19810-4929',
      gradient: '',
    },
    {
      icon: FaPhone,
      title: 'Call (USA)',
      content: '+1 771-220-4003',
      link: 'tel:+17712204003',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'India Office',
      content: '3RD FLOOR, 12-4.13,12A, J.B. Kaval,\nMAJOR SANDEEP UNNIKRISHNAN ROAD,\nADITYANAGAR, VIDYARANYAPURA,\nBangalore 560097',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: FaPhone,
      title: 'Call (India)',
      content: '+91 99724 52044',
      link: 'tel:+919972452044',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      content: 'support@bouncecure.com',
      link: 'mailto:support@bouncecure.com',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
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
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-8px);
        }

        .input-field {
          transition: all 0.3s ease;
        }

        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .success-animation {
          animation: fadeInUp 0.5s ease-out, pulse 0.5s ease-in-out;
        }
      `}</style>

      {/* Animated Background Circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="text-5xl md:text-7xl font-bold text-[#c2831f] mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Questions, feedback or want a demo? Fill the form and we'll get back within 1 business day.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Info Cards */}
          <div className="space-y-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="glassmorphism rounded-2xl p-6 card-hover"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`bg-[#c2831f] ${info.gradient} p-4 rounded-xl animate-pulse-slow`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{info.title}</h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-gray-300 text-sm whitespace-pre-line">{info.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="glassmorphism rounded-3xl p-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 input-field"
                  />
                  {errors.fullname && (
                    <p className="text-red-400 text-sm mt-1">{errors.fullname}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 input-field"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 input-field"
                  >
                    <option value="general" className="bg-slate-800">General inquiry</option>
                    <option value="support" className="bg-slate-800">Support</option>
                    <option value="sales" className="bg-slate-800">Sales / Demo</option>
                    <option value="enterprise" className="bg-slate-800">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your request..."
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 input-field resize-none"
                ></textarea>
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="subscribe"
                  id="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-white/10 border-white/20"
                />
                <label htmlFor="subscribe" className="text-gray-300 text-sm">
                  Subscribe to product updates
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 animate-glow"
                style={{
                  backgroundImage: isSubmitting
                    ? 'linear-gradient(to right, #c2831f, #c2831f)'
                    : 'linear-gradient(to right, #c2831f, #d99c2b)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>



              {feedback === 'success' && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 success-animation">
                  <FaCheckCircle className="text-green-400 text-xl" />
                  <p className="text-green-400 font-medium">
                    Thanks! Your message has been sent. We'll reply soon!
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="glassmorphism rounded-3xl p-12 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-4xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-gray-300 text-lg mb-8">
            Join 10,000+ professionals getting product updates and tips.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks for subscribing!');
            }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 input-field"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Subscribe
              </button>
            </div>
          </form>

          <div className="flex justify-center gap-6">
            {[
              { Icon: FaFacebookF, link: 'https://facebook.com', color: 'hover:text-blue-500' },
              { Icon: FaTwitter, link: 'https://twitter.com', color: 'hover:text-sky-400' },
              { Icon: FaInstagram, link: 'https://instagram.com', color: 'hover:text-pink-500' },
              { Icon: FaLinkedinIn, link: 'https://linkedin.com', color: 'hover:text-blue-600' },
            ].map(({ Icon, link, color }, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white ${color} transition-all duration-300 transform hover:scale-110 hover:bg-white/20`}
              >
                <Icon className="text-xl" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;