import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";
import "../styles/Chatbot.css"; // External styles for clean code
import { HiChatBubbleLeftRight } from "react-icons/hi2";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm BounceCure Bot 🤖. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const qaPairs = [
    // --- Greetings & Small Talk (40+) ---
    { keywords: ["hello", "hi"], answer: "Hello there! 👋 Welcome to BounceCure. How can I help you today?" },
    { keywords: ["hey"], answer: "Hey! 😊 Glad to have you here. What would you like to know?" },
    { keywords: ["good morning"], answer: "Good morning! ☀️ Ready to boost your email deliverability?" },
    { keywords: ["good afternoon"], answer: "Good afternoon! How’s your day going?" },
    { keywords: ["good evening"], answer: "Good evening! 🌙 Need help cleaning your email list?" },
    { keywords: ["how are you"], answer: "I’m doing great, thanks for asking! How can I help you today?" },
    { keywords: ["what's up"], answer: "Not much, just verifying billions of emails! 📧 How can I help you?" },
    { keywords: ["yo"], answer: "Yo! 😎 Let’s talk email verification." },
    { keywords: ["sup"], answer: "All good here! How’s your email list doing?" },
    { keywords: ["hola"], answer: "¡Hola! Bienvenido a BounceCure." },
    { keywords: ["bonjour"], answer: "Bonjour! Comment puis-je vous aider?" },
    { keywords: ["thanks"], answer: "You’re welcome! 😊" },
    { keywords: ["thank you"], answer: "Anytime! 🙏" },
    { keywords: ["nice to meet you"], answer: "Nice to meet you too! 🤝" },
    { keywords: ["how’s it going"], answer: "All good here! Excited to help you improve your deliverability." },
    { keywords: ["yo bot"], answer: "Yo human! Let’s fix those bounces." },
    { keywords: ["you there"], answer: "Always here, always listening. 🤖" },
    { keywords: ["ok"], answer: "Got it 👍" },
    { keywords: ["bye"], answer: "Bye! Hope to see you again soon." },
    { keywords: ["see you"], answer: "See you! 👋" },
    { keywords: ["later"], answer: "Later! 🚀" },
    { keywords: ["goodbye"], answer: "Goodbye and happy emailing!" },
    { keywords: ["cheers"], answer: "Cheers! 🥂" },
    { keywords: ["welcome"], answer: "Thanks! I feel at home already." },
    { keywords: ["lol"], answer: "Haha, glad you’re having fun 😄" },
    { keywords: ["cool"], answer: "Cool indeed 😎" },
    { keywords: ["great"], answer: "Awesome! 🎉" },
    { keywords: ["amazing"], answer: "Thanks! We think our service is amazing too 😉" },
    { keywords: ["perfect"], answer: "Perfect is what we aim for!" },
    { keywords: ["sounds good"], answer: "Sounds great to me too!" },
    { keywords: ["how’s your day"], answer: "Busy verifying millions of emails — but always happy to chat!" },
    { keywords: ["rock"], answer: "You rock too! 🤘" },
    { keywords: ["hi bot"], answer: "Hi human! 🖐" },
    { keywords: ["morning"], answer: "Morning! ☀️" },
    { keywords: ["afternoon"], answer: "Afternoon! 🌞" },
    { keywords: ["evening"], answer: "Evening! 🌜" },
    { keywords: ["wow"], answer: "Wow indeed 😁" },
    { keywords: ["interesting"], answer: "Glad you think so!" },
    { keywords: ["impressive"], answer: "Thanks, we try our best! 🙌" },

    // --- Company Intro & Uniqueness ---
    { keywords: ["what do you do"], answer: "We verify, clean, and protect email lists so your messages always reach real people." },
    { keywords: ["who are you"], answer: "We’re BounceCure — experts in email verification and deliverability solutions." },
    { keywords: ["company"], answer: "BounceCure is a global leader in real-time email verification." },
    { keywords: ["about you"], answer: "We help businesses avoid bounces, spam traps, and bad email addresses." },
    { keywords: ["mission"], answer: "Our mission: To make email marketing clean, safe, and effective." },
    { keywords: ["vision"], answer: "Our vision: A spam-free world where every email reaches its destination." },
    { keywords: ["unique"], answer: "Our uniqueness lies in combining real-time verification, hygiene, and threat detection in one platform." },
    { keywords: ["special"], answer: "We specialize in identifying risky emails before they damage your sender reputation." },
    { keywords: ["best at"], answer: "We’re best at protecting your campaigns from bounces and harmful addresses." },
    { keywords: ["strength"], answer: "Our strength is accuracy, speed, and powerful AI-driven detection." },
    { keywords: ["reputation"], answer: "We have a trusted reputation with 200+ billion emails verified." },
    { keywords: ["experience"], answer: "Years of experience and constant innovation keep us ahead in email verification." },
    { keywords: ["trust"], answer: "Trusted by marketers worldwide for accurate, safe, and compliant email lists." },
    { keywords: ["award"], answer: "We’ve won multiple industry awards for innovation and accuracy." },
    { keywords: ["clients"], answer: "We serve clients across e-commerce, SaaS, agencies, and enterprise sectors." },
    { keywords: ["services"], answer: "We offer email verification, hygiene, phone validation, postal validation, and deliverability consulting." },
    { keywords: ["team"], answer: "Our team is a mix of email deliverability experts, data scientists, and friendly support staff." },
    { keywords: ["location"], answer: "We serve customers worldwide from multiple global offices." },
    { keywords: ["started"], answer: "We started BounceCure to solve the growing issue of fake and risky email signups." },

    // --- Features & Technical ---
    { keywords: ["accuracy"], answer: "We deliver 99.7% accuracy on verified emails." },
    { keywords: ["api"], answer: "We have an easy-to-use REST API for real-time email checks." },
    { keywords: ["bulk"], answer: "Bulk verification processes millions of emails in minutes." },
    { keywords: ["real-time"], answer: "Real-time verification ensures bad emails never enter your system." },
    { keywords: ["security"], answer: "We use encryption, GDPR compliance, and secure data handling." },
    { keywords: ["gdpr"], answer: "BounceCure is fully GDPR and CAN-SPAM compliant." },
    { keywords: ["speed"], answer: "Our systems verify emails in milliseconds." },
    { keywords: ["mx"], answer: "We check MX records for domain validity." },
    { keywords: ["syntax"], answer: "Syntax validation ensures the format is correct before sending." },
    { keywords: ["spam trap"], answer: "We detect spam traps to protect your sender score." },
    { keywords: ["role"], answer: "Role-based accounts like info@ and sales@ are flagged as risky." },
    { keywords: ["catch-all"], answer: "We detect catch-all domains and assess their risk." },
    { keywords: ["monitoring"], answer: "Our systems run 24/7 with global monitoring." },
    { keywords: ["dashboard"], answer: "Our dashboard gives you instant insight into your verification results." },
    { keywords: ["reports"], answer: "You get detailed reports on valid, invalid, and risky emails." },
    { keywords: ["alerts"], answer: "Custom alerts keep you updated on verification results." },
    { keywords: ["uptime"], answer: "We maintain 99.9% uptime for uninterrupted service." },
    { keywords: ["plan"], answer: "We offer Free, Pro, and Growth plans to suit your needs." },
    { keywords: ["pricing"], answer: "Plans start from $43.78/month with 50 slots included." },
    { keywords: ["trial"], answer: "Yes, we offer a free trial!" },
    { keywords: ["start"], answer: "To start, sign up on our website or request a demo." },
    { keywords: ["contact"], answer: "You can contact us via email, live chat, or phone." },

    // ---------------- GREETINGS ----------------
    {
      keywords: ["hi", "hello","hlo", "hey", "good morning", "good afternoon", "good evening", "how are you", "yo", "hiya", "sup", "greetings", "morning", "afternoon", "evening", "hello there", "hi there", "hey there", "nice to meet you", "pleased to meet you", "what’s up", "wassup", "good day", "long time no see", "hey buddy", "hi friend", "hi team", "bonjour", "hola", "namaste", "welcome", "start chat", "initiate chat", "start conversation", "open chat", "begin chat"],
      answer: "Hello there! 👋 Welcome to BounceCure. How can I help you today?"
    },

    // ---------------- COMPANY INFO ----------------
    {
      keywords: ["what is bouncecure","Bounce Cure","BounceCure","bouncecure", "tell me about bouncecure", "who are you", "about company", "about your company", "about us", "company profile", "company details", "about bounce cure", "who built this", "when was bouncecure founded", "history", "background", "mission", "vision", "our journey", "our story", "company intro", "founders", "team info", "team details", "company origin", "what do you do", "company overview", "business model", "brand story", "brand history", "when started"],
      answer: "BounceCure is a cutting-edge email verification and campaign optimization platform founded in 2023. We help businesses improve deliverability, reduce bounces, and protect sender reputation."
    },

    {
      keywords: ["why choose bouncecure", "why you", "why bouncecure", "why are you unique", "what makes you special", "why are you the best", "company uniqueness", "advantages", "benefits", "company strengths", "pros", "good points", "best things", "stand out", "special features"],
      answer: "We combine 99.9% accuracy, lightning-fast API responses, AI-powered detection, global coverage, and enterprise-grade security to give you unmatched email verification performance."
    },

    // ---------------- FEATURES ----------------
    {
      keywords: ["features", "what are the features", "site features", "website features", "services offered", "capabilities", "tools", "solutions", "offerings", "functions", "what you offer", "services list", "platform features", "benefits", "solutions offered", "product features", "main features"],
      answer: "BounceCure offers: Real-time email verification, bulk list validation, spam trap detection, deliverability scoring, disposable email detection, catch-all detection, domain & MX validation, risk assessment, advanced analytics dashboard, and seamless API integration."
    },

    {
      keywords: ["real time verification", "instant verification", "verify instantly", "fast verification", "quick check", "speed", "low latency", "fast results", "quick results", "fast api"],
      answer: "Our real-time verification processes emails in milliseconds, ensuring you get instant, accurate results for a smooth user experience."
    },

    {
      keywords: ["bulk verification", "bulk email check", "bulk validate", "list verification", "batch email verification", "csv upload", "multiple email check", "mass verification", "bulk processing"],
      answer: "With BounceCure, you can upload a CSV and verify thousands of emails at once, categorizing them into Valid, Invalid, and Risky for clean campaign lists."
    },

    {
      keywords: ["security", "data privacy", "secure", "compliance", "gdpr", "hipaa", "data protection", "privacy policy", "safe", "data safety", "encrypt", "secure data", "confidential"],
      answer: "We use enterprise-grade encryption, GDPR-compliant processes, and secure API endpoints to keep your data safe."
    },

    // ---------------- PRICING ----------------
    {
      keywords: ["pricing", "cost", "price", "plans", "packages", "how much", "charges", "rates", "fees", "billing", "subscription", "monthly cost", "annual cost", "quarterly cost", "price list", "plan details"],
      answer: "Our plans start from $43.78/month with 50 slots included. We offer monthly, quarterly, and annual billing with a 20% discount on annual plans."
    },

    {
      keywords: ["free trial", "trial", "demo", "sample", "test", "try", "try free", "free plan", "trial period"],
      answer: "We offer a free trial where you can verify up to 10 emails without logging in."
    },

    // ---------------- SUPPORT ----------------
    {
      keywords: ["support", "help", "contact", "get in touch", "customer care", "assistance", "need help", "how to contact", "technical support", "help desk", "customer service"],
      answer: "You can reach our support team 24/7 via the Contact page or by emailing support@bouncecure.com."
    },

    {
      keywords: ["api", "integration", "connect", "zapier", "mailchimp", "sendgrid", "hubspot", "pipedrive", "gmail", "salesforce", "sdk", "webhook", "rest api", "api docs", "integration guide"],
      answer: "BounceCure integrates with major platforms like Mailchimp, SendGrid, HubSpot, Salesforce, Pipedrive, Zapier, and more via REST API and Webhooks."
    },

  ];

  const findAnswer = (userText) => {
    const text = userText.toLowerCase();
    for (let pair of qaPairs) {
      if (pair.keywords.some(k => text.includes(k))) {
        return pair.answer;
      }
    }
    return "I’m not sure about that. Try asking about pricing, features, company details, or say hello!";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    const botReply = { sender: "bot", text: findAnswer(input) };
    setMessages(prev => [...prev, userMsg, botReply]);
    setInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <div className="chat-float-button" onClick={() => setIsOpen(!isOpen)}>
      <HiChatBubbleLeftRight />

      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window animate-slide-in">
          <div className="chat-header">BounceCure ChatBot</div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                <div className="icon">
                  <FontAwesomeIcon icon={msg.sender === "bot" ? faRobot : faUser} />
                </div>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              style={{ color: "#000" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
