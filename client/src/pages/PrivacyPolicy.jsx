import React, { useState } from 'react';
import { Shield, Lock, Database, Users, FileText, Mail, AlertCircle, Eye, UserCheck, RefreshCw, Baby, ChevronDown, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';


export default function PrivacyPolicy() {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const policyCards = [
    {
      id: 1,
      icon: Database,
      title: "Information We Collect",
      shortDesc: "What data we gather to provide our services",
      details: [
        {
          subtitle: "Information You Provide",
          points: [
            "Your name, email address, organization details",
            "Data you input in the CRM (contacts, notes, messages)"
          ]
        },
        {
          subtitle: "Connected Account Data",
          points: [
            "Basic profile information (name, email address)",
            "Email headers, subjects, or metadata (for syncing messages)",
            "Contacts or address book (for CRM integration)"
          ]
        }
      ],
      note: "We only request the minimum data necessary to provide CRM syncing features."
    },
    {
      id: 2,
      icon: Eye,
      title: "How We Use Your Information",
      shortDesc: "Your data powers your CRM experience",
      details: [
        {
          points: [
            "Authenticate your account and enable CRM sync",
            "Display and organize your email data within the Bouncecure CRM",
            "Manage and update contacts or leads",
            "Provide customer support and improve our services"
          ]
        }
      ],
      note: "We do not use your data for advertising or sell it to third parties."
    },
    {
      id: 3,
      icon: Lock,
      title: "Data Storage and Security",
      shortDesc: "Your data is protected with enterprise-grade security",
      details: [
        {
          points: [
            "We use strong encryption (HTTPS, TLS) and secure data centers",
            "Access tokens and credentials are encrypted",
            "Only authorized personnel can access user data"
          ]
        }
      ]
    },
    {
      id: 4,
      icon: Mail,
      title: "Third-Party Services",
      shortDesc: "Email integrations that power your workflow",
      details: [
        {
          subtitle: "Integrated Services",
          points: [
            "Google (Gmail, People API)",
            "Microsoft (Outlook API / Graph API)",
            "Zoho Mail API",
            "Rediff Mail API (IMAP/SMTP)"
          ]
        },
        {
          subtitle: "Compliance",
          points: [
            {
              text: "Google API Services User Data Policy",
              link: "https://developers.google.com/terms/api-services-user-data-policy"
            },
            {
              text: "Microsoft Privacy Statement",
              link: "https://privacy.microsoft.com"
            },
            {
              text: "Zoho Privacy Policy",
              link: "https://www.zoho.com/privacy.html"
            },
            {
              text: "Rediff Privacy Policy",
              link: "https://company.rediff.com/privacy.html"
            }
          ]
        }

      ],
      note: "We never share your data between providers or outside of Bouncecure."
    },
    {
      id: 5,
      icon: UserCheck,
      title: "Your Rights",
      shortDesc: "You're in control of your data",
      details: [
        {
          points: [
            "Revoke access to your email account from your provider's security settings",
            "Request deletion of your data by contacting us",
            "Access or correct your personal information"
          ]
        }
      ]
    },
    {
      id: 6,
      icon: RefreshCw,
      title: "Data Retention",
      shortDesc: "We keep data only as long as needed",
      details: [
        {
          points: [
            "We retain data only for as long as needed to provide CRM features",
            "When you disconnect an account, we delete associated data promptly",
            "Some data may be retained if legally required"
          ]
        }
      ]
    },
    {
      id: 7,
      icon: Baby,
      title: "Children's Privacy",
      shortDesc: "Our services are for adults only",
      details: [
        {
          points: [
            "Our services are not directed to individuals under 16",
            "We do not knowingly collect data from minors"
          ]
        }
      ]
    },
    {
      id: 8,
      icon: AlertCircle,
      title: "Updates to This Policy",
      shortDesc: "We'll notify you of any changes",
      details: [
        {
          points: [
            "We may update this Privacy Policy periodically",
            "Changes will be posted here with a revised 'Last updated' date",
            "We encourage you to review this policy regularly"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Landing Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-900 to-yellow-700 mb-8 animate-pulse">
              <Shield className="w-12 h-12" style={{ color: '#c2831f' }} />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#c2831f' }}>
              Privacy Policy
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Your privacy is our priority. We're committed to protecting your data and being transparent about how we handle your information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="flex items-center gap-2 text-gray-400">
                <FileText className="w-5 h-5" style={{ color: '#c2831f' }} />
                <span>Last Updated: September 30, 2025</span>
              </div>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center space-y-6">
              <p className="text-gray-300 leading-relaxed text-lg md:text-xl">
                Welcome to <span className="font-semibold" style={{ color: '#c2831f' }}>Bouncecure</span> ("we," "our," "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your data when you use Bouncecure, including features that connect to third-party email and contact services (e.g., Google, Outlook, Zoho, Rediff, etc.).
              </p>
              <p className="text-gray-400 text-lg">
                By using Bouncecure, you agree to this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

     {/* Policy Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {policyCards.map((card) => {
            const Icon = card.icon;
            const isExpanded = expandedCard === card.id;
            
            return (
              <div 
                key={card.id}
                className="border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300 bg-gradient-to-br from-gray-900/50 to-black"
              >
                <button
                  onClick={() => toggleCard(card.id)}
                  className="w-full p-6 text-left hover:bg-gray-900/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-900/30 to-yellow-700/30 flex items-center justify-center border border-yellow-900/50">
                      <Icon className="w-7 h-7" style={{ color: '#c2831f' }} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#c2831f' }}>
                        {card.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {card.shortDesc}
                      </p>
                    </div>
                    <ChevronDown 
                      className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-800 pt-6 bg-black/40">
                    {card.details.map((section, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        {section.subtitle && (
                          <h4 className="font-semibold text-white mb-3">
                            {section.subtitle}
                          </h4>
                        )}
                        <ul className="space-y-2">
                          {section.points.map((point, pointIdx) => (
                            <li key={pointIdx} className="flex items-start gap-2 text-gray-300">
                              <span className="text-yellow-600 mt-1.5 flex-shrink-0">●</span>
                              {typeof point === "string" ? (
                                <span>{point}</span>
                              ) : (
                                <a 
                                  href={point.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-gray-200 hover:underline"
                                >
                                  {point.text}
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {card.note && (
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-sm italic" style={{ color: '#c2831f' }}>
                          {card.note}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>


      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-2 rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br from-yellow-900/10 to-black" style={{ borderColor: '#c2831f' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-900 to-yellow-700 mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold mb-4" style={{ color: '#c2831f' }}>
            Questions? Contact Us
          </h3>
          <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or how we handle your data, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="mailto:support@bouncecure.com"
              className="flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-yellow-900 to-yellow-700 hover:from-yellow-800 hover:to-yellow-600 transition-all font-semibold text-lg shadow-lg"
            >
              <Mail className="w-5 h-5" />
              support@bouncecure.com
            </Link>
            
          </div>
        </div>
      </section>

      {/* Footer */}
       <Footer/>
    </div>
  );
}