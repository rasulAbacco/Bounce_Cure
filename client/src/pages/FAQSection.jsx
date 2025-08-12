import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageLayout from "../components/PageLayout";

const faqs = [
  {
    question: "What is this platform used for?",
    answer:
      "This platform helps businesses create, send, and track professional email campaigns. You can manage contacts, design emails, schedule sends, and view performance analytics—all in one place.",
  },
  {
    question: "How does email verification work?",
    answer:
      "Our system integrates with industry-leading APIs to validate your email addresses before sending. This reduces bounce rates and improves deliverability.",
  },
  {
    question: "Can I upload my own contact list?",
    answer:
      "Yes! You can upload CSV or Excel files containing your contact details. The system automatically validates and organizes them into lists or segments.",
  },
  {
    question: "Do you provide pre-built email templates?",
    answer:
      "Yes. Our drag-and-drop editor includes a library of customizable templates, plus the ability to save your own designs for future use.",
  },
  {
    question: "How do I track campaign performance?",
    answer:
      "The dashboard provides real-time statistics on open rates, click-through rates, bounces, and unsubscribes. You can also export detailed reports.",
  },
  {
    question: "What sending options are available?",
    answer:
      "You can send campaigns immediately, schedule them for later, or send a test email to yourself before launching.",
  },
  {
    question: "Can I integrate my own SMTP or email service?",
    answer:
      "Yes. We support integrations with providers like Mailgun, SendGrid, and AWS SES for complete control over delivery.",
  },
  {
    question: "Is there an unsubscribe feature?",
    answer:
      "Yes. Every email includes an unsubscribe link, and you can customize your unsubscribe page in the settings.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout>
    <div className="  text-white min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-[#c2831f] mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden transition-all duration-300"
            >
             <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex justify-between items-center p-5 text-left text-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
            >
            <span>{faq.question}</span>
            <span className="text-[#c2831f] text-2xl font-bold">
                {openIndex === index ? "−" : "+"}
            </span>
            </button>

              {openIndex === index && (
                <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
