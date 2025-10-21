// client/src/pages/Campaign/pages/SendCampaign.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle, ChevronDown, ChevronUp, Send, Users, Settings,
  FileText, Palette, Check, Clock, Calendar, Shield, AlertCircle,
  Mail, RefreshCw, CreditCard, AlertTriangle
} from "lucide-react";
import CreateSendGridSender from "../../../components/CreateSendGridSender.jsx";
const API_URL = import.meta.env.VITE_VRI_URL;

const steps = [
  {
    id: "recipients",
    title: "To",
    description: "Choose who to send to",
    icon: Users,
  },
  {
    id: "setup",
    title: "From",
    description: "Set up your email",
    icon: Settings,
  },
  {
    id: "template",
    title: "Template",
    description: "Choose a template",
    icon: FileText,
  },
  {
    id: "design",
    title: "Design",
    description: "Design your email",
    icon: Palette,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Schedule your campaign",
    icon: Clock,
  },
  {
    id: "confirm",
    title: "Confirm",
    description: "Review and send",
    icon: Check,
  },
];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("EmailPreview Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">Preview Error</h3>
          <p className="text-red-600 text-sm mt-1">
            Unable to display email preview. Please check your email design.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Email Preview Component with Exact Editor Styles
function EmailPreview({ pages, activePage, zoomLevel = 1.0, formData }) {
  if (!pages || !pages.length || activePage === undefined || activePage >= pages.length) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-8">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3">📧</div>
          <p className="text-gray-600 font-medium">No content to preview</p>
          <p className="text-sm mt-2 text-gray-500">Design your email in the editor to see it here</p>
        </div>
      </div>
    );
  }

  const currentPage = pages[activePage];
  if (!currentPage || !currentPage.elements || currentPage.elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-lg p-8">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-3">📧</div>
          <p className="text-gray-600 font-medium">Empty canvas</p>
          <p className="text-sm mt-2 text-gray-500">Add elements to your email design</p>
        </div>
      </div>
    );
  }

  // Sort elements by Y position (top to bottom)
  const sortedElements = [...currentPage.elements].sort((a, b) => (a.y || 0) - (b.y || 0));

  const renderEmailElement = (element) => {
    try {
      const baseStyle = {
        fontFamily: element.fontFamily || 'Arial, sans-serif',
        color: element.color || '#000000',
        textAlign: element.textAlign || 'left',
        margin: '15px 0',
      };

      switch (element.type) {
        case "heading":
          return (
            <h1 key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 20}px`,
              fontWeight: element.fontWeight || 'bold',
              lineHeight: '1.3',
              marginTop: '25px',
              marginBottom: '15px',
            }}>
              {element.content || 'Heading'}
            </h1>
          );

        case "subheading":
          return (
            <h2 key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 24}px`,
              fontWeight: element.fontWeight || '600',
              lineHeight: '1.4',
              marginTop: '20px',
              marginBottom: '12px',
            }}>
              {element.content || 'Subheading'}
            </h2>
          );

        case "paragraph":
          return (
            <p key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 16}px`,
              lineHeight: '1.6',
              margin: '12px 0',
            }}
              dangerouslySetInnerHTML={{ __html: element.content || 'Paragraph text' }}
            />
          );

        case "blockquote":
          return (
            <blockquote key={element.id} style={{
              ...baseStyle,
              fontSize: `${element.fontSize || 16}px`,
              fontStyle: 'italic',
              borderLeft: `4px solid ${element.borderColor || '#cccccc'}`,
              paddingLeft: '20px',
              margin: '20px 0',
              lineHeight: '1.6',
              color: element.color || '#666666',
            }}>
              {element.content || 'Blockquote text'}
            </blockquote>
          );

        case "button":
          return (
            <div key={element.id} style={{ margin: '25px 0', textAlign: element.textAlign || 'center' }}>
              <a
                href={element.link || '#'}
                style={{
                  display: 'inline-block',
                  padding: '12px 35px',
                  fontSize: `${element.fontSize || 16}px`,
                  fontFamily: element.fontFamily || 'Arial, sans-serif',
                  color: element.color || '#ffffff',
                  backgroundColor: element.backgroundColor || '#007bff',
                  textDecoration: 'none',
                  fontWeight: element.fontWeight || 'bold',
                  borderRadius: `${element.borderRadius || 6}px`,
                  border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
                }}
              >
                {element.content || 'Click Me'}
              </a>
            </div>
          );

        case "image":
          return (
            <div key={element.id} style={{ margin: '20px 0', textAlign: element.textAlign || 'center' }}>
              <img
                src={element.src || 'https://via.placeholder.com/600x300/e0e0e0/666666?text=Image'}
                alt={element.alt || 'Email Image'}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: `${element.borderRadius || 0}px`,
                  border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
                }}
              />
            </div>
          );

        case "card":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#f8f9fa',
              border: `${element.borderWidth || 1}px solid ${element.borderColor || '#dee2e6'}`,
              borderRadius: `${element.borderRadius || 8}px`,
              padding: `${element.padding || 20}px`,
              margin: '20px 0',
            }}>
              <div style={{
                fontSize: `${element.fontSize || 16}px`,
                color: element.color || '#000000',
                fontFamily: element.fontFamily || 'Arial, sans-serif',
                lineHeight: '1.6',
              }}>
                {element.content || 'Card content goes here'}
              </div>
            </div>
          );

        case "line":
          return (
            <hr key={element.id} style={{
              border: 'none',
              borderTop: `${element.strokeWidth || 2}px solid ${element.strokeColor || '#cccccc'}`,
              margin: '20px 0',
            }} />
          );

        case "rectangle":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#e9ecef',
              height: `${Math.min(element.height || 100, 200)}px`,
              borderRadius: `${element.borderRadius || 0}px`,
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
              margin: '20px 0',
            }} />
          );

        case "circle":
          return (
            <div key={element.id} style={{
              backgroundColor: element.backgroundColor || '#e9ecef',
              width: `${Math.min(element.width || 100, 150)}px`,
              height: `${Math.min(element.height || 100, 150)}px`,
              borderRadius: '50%',
              border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor || '#cccccc'}` : 'none',
              margin: '20px auto',
            }} />
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering element:", element, error);
      return null;
    }
  };

  return (
    <div className="h-full bg-gray-100 overflow-auto">
    

      {/* Email Body */}
      <div className="max-w-2xl mx-auto my-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            {sortedElements.map(element => renderEmailElement(element))}
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2025 {formData.fromName || 'Your Company'}. All rights reserved.</p>
            <p className="mt-2">
              <a href="#" className="text-blue-600 hover:underline">Unsubscribe</a>
              {' | '}
              <a href="#" className="text-blue-600 hover:underline">View in Browser</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function CampaignBuilder() {
  const location = useLocation();
  const navigate = useNavigate();

  // Your existing state
  const [expanded, setExpanded] = useState("setup");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({
    recipients: "",
    fromEmail: "",
    fromName: "",
    subject: "",
    sendTime: "",
    template: "basic",
    designContent: "",
    scheduleType: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    recurringFrequency: "daily",
    recurringDays: [],
    recurringEndDate: "",
  });

  // Your existing state continues...
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [canvasPages, setCanvasPages] = useState([{ id: 1, elements: [] }]);
  const [canvasActivePage, setCanvasActivePage] = useState(0);
  const [canvasZoomLevel, setCanvasZoomLevel] = useState(0.6);

  // NEW STATE VARIABLES
  // const [emailVerificationStatus, setEmailVerificationStatus] = useState({});
  // const [isVerifying, setIsVerifying] = useState(false);
  // const [verificationSent, setVerificationSent] = useState(false);
  // const [verifiedEmails, setVerifiedEmails] = useState([]);
  const [verificationOption, setVerificationOption] = useState('preverified'); // 'preverified' or 'custom'
  const [authError, setAuthError] = useState(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Check email verification status
const checkEmailVerification = async (email) => {

  if (!email) return;
  try {

    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(

      `${API_URL}/api/senders/check/${encodeURIComponent(email)}`,

      { headers }

    );
 
    const contentType = response.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);

    }
 
    const data = await response.json();
    console.log("Check verification response:", data);

    setEmailVerificationStatus(prev => ({

      ...prev,

      [email]: {

        isVerified: data.isVerified || false,
        verifiedAt: data.record?.verifiedAt,
        fromName: data.record?.fromName
      }
    }));

  } catch (error) {

    console.error("Error checking email verification:", error);

    setEmailVerificationStatus(prev => ({
      ...prev,
      [email]: { isVerified: false }
    }));
  }
};


  // Send verification email
const sendVerificationEmail = async (email, fromName) => {
  setIsVerifying(true);

  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}/api/senders/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, name: fromName }),
    });

    // 🔹 Handle no response
    if (!response) {
      throw new Error("No response from server. Check if backend is running.");
    }

    // 🔹 Parse JSON safely
    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      throw new Error(
        `Server returned non-JSON response: ${text.substring(0, 100)}...`
      );
    }

    // 🔹 Handle success
    if (response.ok) {
      setVerificationSent(true);
      alert(
        `✅ Verification email sent to ${email}. Please check your inbox and click the verification link.`
      );

      // Recheck status after a short delay
      setTimeout(() => checkEmailVerification(email), 2000);
      return;
    }

    // 🔹 Handle specific SendGrid or backend errors
    const errorMessage =
      data?.error ||
      data?.details?.errors?.[0]?.message ||
      data?.details?.message ||
      "Unknown error occurred while creating sender.";

    if (errorMessage.includes("same nickname")) {
      alert(
        "⚠️ This sender email is already registered. Checking verification status..."
      );
      setTimeout(() => checkEmailVerification(email), 2000);
    } else if (errorMessage.includes("access forbidden")) {
      alert(
        "🚫 SendGrid API key is missing required permissions (scopes). Please update API key permissions in SendGrid."
      );
    } else if (response.status === 500) {
      alert("❌ Server error occurred. Please check backend logs for details.");
    } else if (response.status === 401) {
      alert("🔒 Unauthorized. Please log in again.");
    } else {
      alert(`❌ ${errorMessage}`);
    }
  } catch (err) {
    console.error("sendVerificationEmail error:", err);
    alert(`⚠️ Network or server error: ${err.message}`);
  } finally {
    setIsVerifying(false);
  }
};


  // Fetch verified emails on component mount
  // Fetch verified emails on component mount
  useEffect(() => {
    const fetchVerifiedEmails = async () => {
      try {
        const token = getAuthToken();

        const response = await fetch(`${API_URL}/api/senders/verified`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
        }

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched verified emails:", data);
          
          // Handle both old array format and new object format
          let emailsArray = [];
          if (Array.isArray(data)) {
            emailsArray = data;
          } else if (data.verifiedSenders && Array.isArray(data.verifiedSenders)) {
            emailsArray = data.verifiedSenders;
          }
          
          setVerifiedEmails(emailsArray);

          // If there are no pre-verified emails, switch to custom option
          if (emailsArray.length === 0) {
            setVerificationOption('custom');
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch verified emails:", errorData);
          setVerificationOption('custom');
        }
      } catch (error) {
        console.error("Error fetching verified emails:", error);
        setVerificationOption('custom');
      }
    };
    fetchVerifiedEmails();

  }, []);

  // Check verification when email changes (only for custom option)
  useEffect(() => {
    if (formData.fromEmail && verificationOption === 'custom') {
      checkEmailVerification(formData.fromEmail);
    }
    return result;
  };

  // Your existing useEffect hooks...
  useEffect(() => {
    if (location.state?.canvasData) {
      setCanvasPages([{ id: 1, elements: location.state.canvasData }]);
      setCompletedSteps([...completedSteps, "design"]);
      setFormData((prev) => ({
        ...prev,
        subject: location.state.subject || prev.subject,
      }));
    }
  }, [location.state]);

  useEffect(() => {
    fetchContacts();
  }, []);

  // Function to fetch contacts from API
  const fetchContacts = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/campaigncontacts`, {
        headers
      });

      if (response.status === 401) {
        setAuthError(true);
        console.error("Authentication error: Please log in again");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      } else {
        console.error("Failed to fetch contacts");
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const markComplete = (id) => {
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id]);
    }
    setExpanded(null); // collapse after complete
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const emails = text
        .split(/\r?\n|,/)
        .map((line) => line.trim())
        .filter((line) => line.includes("@"));
      setFormData((prev) => ({ ...prev, bulkFileEmails: emails }));
    };
    reader.readAsText(file);
  };

  const handleTemplateSelect = (template) => {
    setFormData({ ...formData, template });
    markComplete("template");
  };

  const handleRecurringDaysChange = (day) => {
    const days = formData.recurringDays || [];
    if (days.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...days, day]
      });
    }
  };
const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const handleSendCampaign = async () => {
    setIsSending(true);
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      // Fetch contacts
      const contactsResponse = await fetch(`${API_URL}/api/campaigncontacts`, { headers });
      if (!contactsResponse.ok) throw new Error("Failed to fetch contacts");
      const contactsData = await contactsResponse.json();

      // Prepare recipients
      let recipientsList = [];
      if (formData.recipients === "all-subscribers") {
        recipientsList = contactsData;
      } else if (formData.recipients === "new-customers") {
        recipientsList = contactsData.filter(c => c.type === "new-customer");
      } else if (formData.recipients === "vip-clients") {
        recipientsList = contactsData.filter(c => c.type === "vip-client");
      } else if (formData.recipients === "manual") {
        recipientsList = (formData.manualEmails || "")
          .split(/[\n,]+/)
          .map(email => ({ email: email.trim() }))
          .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
      } else if (formData.recipients === "file") {
        recipientsList = (formData.bulkFileEmails || [])
          .map(email => ({ email }))
          .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
      }

const handleSendCampaign = async () => {
  setIsSending(true);
  try {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ Fetch contacts
    const contactsResponse = await fetch(`${API_URL}/api/campaigncontacts`, { headers });
    if (!contactsResponse.ok) throw new Error("Failed to fetch contacts");
    const contactsData = await contactsResponse.json();

    // ✅ Prepare recipients
    let recipientsList = [];
    if (formData.recipients === "all-subscribers") {
      recipientsList = contactsData;
    } else if (formData.recipients === "new-customers") {
      recipientsList = contactsData.filter(c => c.type === "new-customer");
    } else if (formData.recipients === "vip-clients") {
      recipientsList = contactsData.filter(c => c.type === "vip-client");
    } else if (formData.recipients === "manual") {
      recipientsList = (formData.manualEmails || "")
        .split(/[\n,]+/)
        .map(email => ({ email: email.trim() }))
        .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
    } else if (formData.recipients === "file") {
      recipientsList = (formData.bulkFileEmails || [])
        .map(email => ({ email }))
        .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email));
    }

    if (recipientsList.length === 0) {
      alert("No valid recipients found.");
      setIsSending(false);
      return;
    }

    // ✅ Step 1: Fetch available email send credits
    const creditsRes = await fetch(`${API_URL}/api/users/credits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!creditsRes.ok) throw new Error("Failed to fetch user credits");
    const creditsData = await creditsRes.json();

    const availableCredits = creditsData.emailLimit || 0;
    const requiredCredits = recipientsList.length;

    if (availableCredits < requiredCredits) {
      alert(
        `You only have ${availableCredits} email send credits, but this campaign requires ${requiredCredits}. Please purchase more credits.`
      );
      setIsSending(false);
      return;
    }

    // ✅ Step 2: Send campaign
    const sendRes = await fetch(`${API_URL}/api/campaigns/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        recipients: recipientsList.map(r => r.email),
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
        subject: formData.subject,
        canvasData: canvasPages[canvasActivePage]?.elements || [],
      }),
    });

    const sendData = await sendRes.json();

    if (!sendRes.ok) {
      if (sendData.creditLimitReached) {
        alert("You have insufficient email send credits. Please purchase more credits.");
      } else {
        alert(sendData.error || "Failed to send campaign.");
      }
      setIsSending(false);
      return;
    }

    // ✅ Step 3: Deduct credits both locally and on backend
    const newRemainingCredits = Math.max(availableCredits - requiredCredits, 0);

    // --- Update backend user's credit balance ---
    await fetch(`${API_URL}/api/users/update-credits`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ emailLimit: newRemainingCredits }),
    }).catch(err => console.warn("Backend credit update failed:", err));

    // --- Update frontend (localStorage) ---
    localStorage.setItem("totalEmails", newRemainingCredits);
    window.dispatchEvent(new Event("storage"));

    // ✅ Step 4: Success UI
    setSendStatus({ success: true, message: "Campaign sent successfully!" });
    alert(`✅ Campaign sent successfully to ${recipientsList.length} recipients!`);
  } catch (error) {
    console.error("❌ Error sending campaign:", error);
    setSendStatus({ success: false, message: error.message });
    alert("Something went wrong while sending the campaign.");
  } finally {
    setIsSending(false);
  }
};



  // Get minimum date for scheduling (current date + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  // Handle authentication error
  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">
            You need to be logged in to access this feature. Please log in again.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Send Campaign</h1>

          {/* ✅ CREDIT DISPLAY IN HEADER */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/texteditor")}
              className="px-4 py-2 text-gray-100 hover:bg-[#c2831f] rounded-md cursor-pointer"
            >
              Text Editor Page
            </button>

            <button
              onClick={() => navigate("/all-templates")}
              className="px-4 py-2 text-gray-100 hover:bg-[#c2831f] rounded-md cursor-pointer"
            >
              Choose Templates
            </button>

            <button
              onClick={handleSendCampaign}
              disabled={
                !completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${!completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
                ? "bg-gray-800 cursor-not-allowed"
                : "bg-[#c2831f] hover:bg-[#d09025]"
                }`}
            >
              {formData.scheduleType === 'immediate' ? <Send size={16} /> : <Calendar size={16} />}
              {isSending
                ? "Processing..."
                : formData.scheduleType === 'immediate'
                  ? "Send Now"
                  : "Schedule Campaign"
              }
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Step Tracker */}
        <div className="w-64 bg-black border-r border-gray-800 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Campaign Steps
            </h2>
          </div>
          <div className="relative">
            {/* Vertical line connecting steps */}
            <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gray-700"></div>
            <div className="space-y-8">
              {steps.map(({ id, title, description, icon: Icon }, index) => {
                const isCompleted = completedSteps.includes(id);
                const isExpanded = expanded === id;
                const isLast = index === steps.length - 1;
                return (
                  <div key={id} className="relative flex items-start">
                    {/* Step circle */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isCompleted ? "bg-[#c2831f]" : "bg-gray-800"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckCircle size={20} className="text-white" />
                      ) : (
                        <Icon size={18} className="text-gray-400" />
                      )}
                    </div>
                    {/* Step content */}
                    <div className="ml-4 pt-1">
                      <button
                        onClick={() => toggleExpand(id)}
                        className={`text-left ${isExpanded ? "text-[#c2831f]" : "hover:text-gray-300"
                          }`}
                      >
                        <div className="font-medium">{title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {description}
                        </div>
                      </button>
                      {/* Progress indicator */}
                      {isCompleted && (
                        <div className="mt-2 text-xs text-[#c2831f] flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#c2831f] mr-1"></div>
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          <div className="max-w-3xl mx-auto">

            {/* ✅ CREDIT WARNING BANNER */}
            {!isLoadingCredits && getRecipientCount() > 0 && (
              <div className={`mb-6 p-4 rounded-lg border ${hasEnoughCredits()
                ? "bg-green-900/20 border-green-700 text-green-400"
                : "bg-red-900/20 border-red-700 text-red-400"
                }`}>
                <div className="flex items-start gap-3">
                  {hasEnoughCredits() ? (
                    <CheckCircle size={20} className="mt-0.5" />
                  ) : (
                    <AlertTriangle size={20} className="mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {hasEnoughCredits()
                        ? "✅ Sufficient Credits"
                        : "❌ Insufficient Credits"}
                    </p>
                    <p className="text-sm mt-1">
                      Recipients: <strong>{getRecipientCount()}</strong> |
                      Available Credits: <strong>{emailCredits}</strong>
                      {!hasEnoughCredits() && (
                        <span className="block mt-2">
                          You need {getRecipientCount() - emailCredits} more credits to send this campaign.
                          <a href="/pricingdash" className="underline ml-2 font-medium">
                            Buy More Credits
                          </a>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {steps.map(({ id, title, description }) => {
              const isExpanded = expanded === id;
              const isCompleted = completedSteps.includes(id);
              return (
                <div
                  key={id}
                  className={`mb-8 border border-gray-800 rounded-lg overflow-hidden transition-all ${isExpanded ? "shadow-lg" : ""
                    }`}
                >
                  <button
                    onClick={() => toggleExpand(id)}
                    className="flex justify-between items-center w-full px-6 py-4 bg-black hover:bg-gray-900 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isCompleted
                          ? "bg-[#c2831f]/20 text-[#c2831f]"
                          : "bg-gray-800 text-gray-400"
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={16} />
                        ) : (
                          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-4 text-left">
                        <div className="text-lg font-medium text-white">
                          {title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {description}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 py-5 bg-gray-900 border-t border-gray-800">
                      {/* Step content */}
                      {id === "recipients" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Choose an audience
                            </label>
                            <select
                              name="recipients"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              value={formData.recipients}
                              onChange={handleChange}
                            >
                              <option value="">Select an option</option>
                              {/* <option value="all-subscribers">
                                All Subscribers
                              </option>
                              <option value="new-customers">
                                New Customers
                              </option> */}
                              <option value="manual">
                                Manual (paste emails)
                              </option>
                              <option value="file">Upload File (CSV)</option>
                            </select>

                            {/* Manual input option */}
                            {formData.recipients === "manual" && (
                              <div className="mt-3">
                                <label className="block text-sm text-gray-300 mb-1">
                                  Paste emails (comma or newline separated)
                                </label>
                                <textarea
                                  rows={4}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                                  value={formData.manualEmails}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      manualEmails: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            )}

                            {/* File upload option */}
                            {formData.recipients === "file" && (
                              <div className="mt-3">
                                <label className="block text-sm text-gray-300 mb-1">
                                  Upload CSV file (with "email" column)
                                </label>
                                <input
                                  type="file"
                                  accept=".csv"
                                  className="block w-full text-gray-300"
                                  onChange={handleFileUpload}
                                />
                              </div>
                            )}

                            {/* ✅ CREDIT CHECK WARNING FOR RECIPIENTS */}
                            {getRecipientCount() > 0 && (
                              <div className={`mt-4 p-3 rounded-md ${getRecipientCount() <= emailCredits
                                ? "bg-blue-900/30 border border-blue-700"
                                : "bg-red-900/30 border border-red-700"
                                }`}>
                                <div className="flex items-center gap-2">
                                  <CreditCard size={16} />
                                  <span className="text-sm">
                                    {getRecipientCount()} recipients selected
                                    {getRecipientCount() <= emailCredits
                                      ? ` - You have ${emailCredits} credits available ✓`
                                      : ` - You need ${getRecipientCount() - emailCredits} more credits!`
                                    }
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => markComplete(id)}
                            disabled={!formData.recipients || getRecipientCount() === 0}
                            className={`mt-2 px-4 py-2 rounded-md ${!formData.recipients || getRecipientCount() === 0
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}

                      {/* Keep all other existing steps (setup, template, design, schedule, confirm) */}
                      {id === "setup" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              From Email Address
                            </label>
                            <input
                              type="email"
                              name="fromEmail"
                              required
                              value={formData.fromEmail}
                              onChange={handleChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              placeholder="Enter verified sender email"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                              ⚠️ Only verified emails can be used.{" "}
                              <a
                                href="/verifyformails"
                                className="text-[#c2831f] underline hover:text-[#d09025]"
                              >
                                Click here to request verification
                              </a>
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              From Name
                            </label>
                            <input
                              type="text"
                              name="fromName"
                              required
                              value={formData.fromName}
                              onChange={handleChange}
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              placeholder="Your sender name"
                            />
                          </div>

                          {/* Save Button */}
                          <button
                            onClick={() => markComplete(id)}
                            disabled={!formData.fromEmail || !formData.fromName}
                            className={`mt-4 px-4 py-2 rounded-md ${!formData.fromEmail || !formData.fromName
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}


                      {id === "template" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Choose a template
                          </label>
                          <div className="grid grid-cols-3 gap-4">
                            {["basic", "newsletter", "promotion"].map(
                              (template) => (
                                <div
                                  key={template}
                                  onClick={() => handleTemplateSelect(template)}
                                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.template === template
                                    ? "border-[#c2831f] bg-[#c2831f]/10"
                                    : "border-gray-700 hover:border-gray-600"
                                    }`}
                                >
                                  <div className="h-32 bg-gray-800 rounded mb-2 flex items-center justify-center">
                                    <span className="text-sm text-gray-400">
                                      {template.charAt(0).toUpperCase() +
                                        template.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-center text-white">
                                    {template.charAt(0).toUpperCase() +
                                      template.slice(1)}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {id === "design" && (
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Design your email
                          </label>
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-400 mb-4">
                              Use the design editor to create your email
                              template. Your design will appear in the preview
                              panel.
                            </p>
                            <a
                              href="/editor"
                              className="px-4 py-2 bg-[#c2831f] text-white rounded-md hover:bg-[#d09025]"
                            >
                              Open Design Editor
                            </a>
                          </div>
                        </div>
                      )}

                      {id === "schedule" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              When to send
                            </label>
                            <div className="space-y-3">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="immediate"
                                  checked={formData.scheduleType === "immediate"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Send Immediately</div>
                                  <div className="text-sm text-gray-400">Send as soon as you confirm</div>
                                </div>
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="scheduled"
                                  checked={formData.scheduleType === "scheduled"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Schedule for Later</div>
                                  <div className="text-sm text-gray-400">Pick a specific date and time</div>
                                </div>
                              </label>

                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="scheduleType"
                                  value="recurring"
                                  checked={formData.scheduleType === "recurring"}
                                  onChange={handleChange}
                                  className="mr-3 accent-[#c2831f]"
                                />
                                <div>
                                  <div className="font-medium text-white">Recurring Campaign</div>
                                  <div className="text-sm text-gray-400">Send automatically on a schedule</div>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Scheduled Campaign Options */}
                          {formData.scheduleType === "scheduled" && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    name="scheduledDate"
                                    min={getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Time
                                  </label>
                                  <input
                                    type="time"
                                    name="scheduledTime"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledTime}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Timezone
                                </label>
                                <select
                                  name="timezone"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.timezone}
                                  onChange={handleChange}
                                >
                                  <option value="America/New_York">Eastern Time</option>
                                  <option value="America/Chicago">Central Time</option>
                                  <option value="America/Denver">Mountain Time</option>
                                  <option value="America/Los_Angeles">Pacific Time</option>
                                  <option value="Europe/London">London</option>
                                  <option value="Europe/Paris">Paris</option>
                                  <option value="Asia/Tokyo">Tokyo</option>
                                  <option value="Asia/Kolkata">India</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Recurring Campaign Options */}
                          {formData.scheduleType === "recurring" && (
                            <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Frequency
                                </label>
                                <select
                                  name="recurringFrequency"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.recurringFrequency}
                                  onChange={handleChange}
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>

                              {formData.recurringFrequency === "weekly" && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Days of the week
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                      <label key={day} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={formData.recurringDays.includes(day)}
                                          onChange={() => handleRecurringDaysChange(day)}
                                          className="mr-2 accent-[#c2831f]"
                                        />
                                        <span className="text-sm text-white">{day}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    name="scheduledDate"
                                    min={getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.scheduledDate}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-1">
                                    End Date (optional)
                                  </label>
                                  <input
                                    type="date"
                                    name="recurringEndDate"
                                    min={formData.scheduledDate || getMinDate()}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                    value={formData.recurringEndDate}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                  Time
                                </label>
                                <input
                                  type="time"
                                  name="scheduledTime"
                                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                                  value={formData.scheduledTime}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => markComplete(id)}
                            disabled={
                              (formData.scheduleType === "scheduled" && (!formData.scheduledDate || !formData.scheduledTime)) ||
                              (formData.scheduleType === "recurring" && (!formData.scheduledDate || !formData.scheduledTime || (formData.recurringFrequency === "weekly" && formData.recurringDays.length === 0)))
                            }
                            className={`mt-2 px-4 py-2 rounded-md ${(formData.scheduleType === "scheduled" && (!formData.scheduledDate || !formData.scheduledTime)) ||
                              (formData.scheduleType === "recurring" && (!formData.scheduledDate || !formData.scheduledTime || (formData.recurringFrequency === "weekly" && formData.recurringDays.length === 0)))
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}

                      {id === "confirm" && (
                        <div className="space-y-6">
                          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-medium text-white mb-3">
                              Campaign Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Campaign:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.subject || "Untitled Campaign"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Recipients:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.recipients === "all-subscribers" &&
                                    `All Subscribers (${contacts.length} contacts)`}
                                  {formData.recipients === "new-customers" &&
                                    `New Customers (${contacts.filter((c) => c.type === "new-customer").length
                                    } contacts)`}
                                  {formData.recipients === "vip-clients" &&
                                    `VIP Clients (${contacts.filter((c) => c.type === "vip-client").length
                                    } contacts)`}
                                  {!formData.recipients && "Not selected"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  From:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.fromName} &lt;{formData.fromEmail}&gt;
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Subject:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.subject || "Not set"}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Template:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.template}
                                </span>
                              </div>

                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Schedule:
                                </span>
                                <span className="font-medium text-white">
                                  {formData.scheduleType === "immediate" && "Send Immediately"}
                                  {formData.scheduleType === "scheduled" &&
                                    `${formData.scheduledDate} at ${formData.scheduledTime}`}
                                  {formData.scheduleType === "recurring" &&
                                    `${formData.recurringFrequency} ${formData.recurringFrequency === "weekly"
                                      ? `(${formData.recurringDays.join(", ")})`
                                      : ""
                                    } starting ${formData.scheduledDate}`}
                                </span>
                              </div>

                              {/* Credit info in confirm step */}
                              <div className="flex">
                                <span className="w-32 text-gray-400">
                                  Credits:
                                </span>
                                <span className={`font-medium ${hasEnoughCredits() ? 'text-green-400' : 'text-red-400'}`}>
                                  {getRecipientCount()} required, {emailCredits} available
                                </span>
                              </div>
                            </div>
                          </div>

                          {sendStatus && (
                            <div className={`mt-4 p-3 rounded ${sendStatus.success
                              ? "bg-green-900/30 text-green-400"
                              : sendStatus.creditLimitReached
                                ? "bg-red-900/30 text-red-400"
                                : "bg-yellow-900/30 text-yellow-400"
                              }`}>
                              {sendStatus.message}
                            </div>
                          )}

                            {batchProgress.total > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-[#c2831f] h-2 rounded-full transition-all"
                                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  Batch {batchProgress.current} of {batchProgress.total}
                                </p>
                              </div>
                            )}

                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Section */}
        <div className="w-[500px] border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-lg">Email Preview</h3>

            {/* ✅ CREDIT STATUS IN PREVIEW */}
            <div className="mt-3 p-3 bg-gray-800 rounded-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Available Credits:</span>
                <span className={`font-bold ${emailCredits > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {emailCredits}
                </span>
              </div>
              {getRecipientCount() > 0 && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Required Credits:</span>
                  <span className="font-bold text-white">{getRecipientCount()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-full overflow-auto">
              <ErrorBoundary>
                <EmailPreview
                  pages={canvasPages}
                  activePage={canvasActivePage}
                  zoomLevel={canvasZoomLevel}
                  formData={formData}
                />
              </ErrorBoundary>
            </div>
          </div>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSendCampaign}
              disabled={
                !completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
              }
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-white ${!completedSteps.includes("recipients") ||
                !completedSteps.includes("setup") ||
                !completedSteps.includes("template") ||
                !completedSteps.includes("schedule") ||
                isSending
                ? "bg-gray-800 cursor-not-allowed"
                : "bg-[#c2831f] hover:bg-[#d09025]"
                }`}
            >
              {formData.scheduleType === 'immediate' ? <Send size={16} /> : <Calendar size={16} />}
              {isSending
                ? "Processing..."
                : formData.scheduleType === 'immediate'
                  ? "Send Now"
                  : "Schedule Campaign"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}