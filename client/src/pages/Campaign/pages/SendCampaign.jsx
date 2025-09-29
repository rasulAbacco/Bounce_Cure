// client/src/pages/Campaign/pages/SendCampaign.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle, ChevronDown, ChevronUp, Send, Users, Settings,
  FileText, Palette, Check, Clock, Calendar, Shield, AlertCircle, Mail, RefreshCw
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
function EmailPreview({ pages, activePage, zoomLevel = 0.6, formData }) {
  // Safety checks
  if (
    !pages ||
    !pages.length ||
    activePage === undefined ||
    activePage >= pages.length
  ) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-inner">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📧</div>
            <p className="text-gray-500">No content to preview</p>
            <p className="text-sm mt-1">Design your email to see a preview</p>
          </div>
        </div>
      </div>
    );
  }
  const currentPage = pages[activePage];
  if (!currentPage || !currentPage.elements) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-inner">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📧</div>
            <p className="text-gray-500">No content to preview</p>
            <p className="text-sm mt-1">Design your email to see a preview</p>
          </div>
        </div>
      </div>
    );
  }
  const renderElement = (element) => {
    try {
      // Calculate position and size with zoom
      const style = {
        position: "absolute",
        left: `${element.x * zoomLevel}px`,
        top: `${element.y * zoomLevel}px`,
        width: `${element.width * zoomLevel}px`,
        height: `${element.height * zoomLevel}px`,
        transform: `rotate(${element.rotation || 0}deg)`,
        opacity: element.opacity || 1,
        zIndex: element.zIndex || 0,
      };
      // Common style properties
      const commonStyle = {
        width: "100%",
        height: "100%",
        fontFamily: element.fontFamily || "Arial",
        color: element.color || "#000000",
        backgroundColor: element.backgroundColor || "transparent",
        border: element.borderWidth
          ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}`
          : "none",
        borderRadius: element.borderRadius
          ? `${element.borderRadius * zoomLevel}px`
          : "0",
        fontWeight: element.fontWeight || "normal",
        fontStyle: element.fontStyle || "normal",
        textDecoration: element.textDecoration || "none",
        textAlign: element.textAlign || "left",
      };
      // Render based on element type
      switch (element.type) {
        case "heading":
        case "subheading":
        case "paragraph":
        case "blockquote":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  ...commonStyle,
                  fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  padding: "8px",
                  ...(element.type === "heading" && { fontWeight: "bold" }),
                  ...(element.type === "subheading" && { fontWeight: "600" }),
                  ...(element.type === "blockquote" && {
                    fontStyle: "italic",
                    paddingLeft: "16px",
                    borderLeft: "4px solid #ccc",
                  }),
                }}
              >
                {element.content ||
                  (element.type === "heading"
                    ? "Heading"
                    : element.type === "subheading"
                      ? "Subheading"
                      : element.type === "blockquote"
                        ? "Blockquote"
                        : "Paragraph text")}
              </div>
            </div>
          );

        case "button":
          return (
            <div key={element.id} style={style}>
              <table
                border="0"
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{
                  borderCollapse: "separate",
                  width: `${element.width * zoomLevel}px`,
                  height: `${element.height * zoomLevel}px`,
                }}
              >
                <tbody>
                  <tr>
                    <td
                      align="center"
                      valign="middle"
                      style={{
                        backgroundColor: element.backgroundColor || "#007bff",
                        borderRadius: element.borderRadius
                          ? `${element.borderRadius}px`
                          : "6px",
                        textAlign: "center",
                        width: `${element.width * zoomLevel}px`,
                        height: `${element.height * zoomLevel}px`,
                      }}
                    >
                      <a
                        href={element.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          width: "100%",
                          height: "100%",
                          fontSize: `${element.fontSize || 16}px`,
                          fontFamily: element.fontFamily || "Arial, sans-serif",
                          color: element.color || "#ffffff",
                          fontWeight: element.fontWeight || "bold",
                          textDecoration: "none",
                          lineHeight: `${element.height * zoomLevel}px`, // vertically center
                        }}
                      >
                        {element.content || "Click Me"}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );

        case "card":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  ...commonStyle,
                  padding: `${(element.padding || 16) * zoomLevel}px`,
                  fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  backgroundImage: element.backgroundImage || "none",
                  boxShadow: element.boxShadow || "none",
                }}
              >
                {element.content || "Card content goes here"}
              </div>
            </div>
          );
        case "rectangle":
          return (
            <div key={element.id} style={style}>
              <div style={commonStyle} />
            </div>
          );
        case "circle":
          return (
            <div key={element.id} style={style}>
              <div style={{ ...commonStyle, borderRadius: "50%" }} />
            </div>
          );
        case "triangle":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${(element.width || 50) * zoomLevel
                    }px solid transparent`,
                  borderRight: `${(element.width || 50) * zoomLevel
                    }px solid transparent`,
                  borderBottom: `${(element.height || 86) * zoomLevel
                    }px solid ${element.backgroundColor || "#FF9F43"}`,
                  backgroundColor: "transparent",
                }}
              />
            </div>
          );
        case "star":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <svg
                  width={
                    Math.min(element.width, element.height) * zoomLevel ||
                    24 * zoomLevel
                  }
                  height={
                    Math.min(element.width, element.height) * zoomLevel ||
                    24 * zoomLevel
                  }
                  viewBox="0 0 24 24"
                  fill={element.backgroundColor || "#FFD93D"}
                  stroke={element.color || "#FFD93D"}
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          );
        case "hexagon":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  ...commonStyle,
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              />
            </div>
          );
        case "arrow":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <svg
                  width={
                    Math.min(element.width, element.height) * zoomLevel ||
                    24 * zoomLevel
                  }
                  height={
                    Math.min(element.width, element.height) * zoomLevel ||
                    24 * zoomLevel
                  }
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={element.color || "#00CEC9"}
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          );
        case "line":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  width: "100%",
                  height: `${(element.strokeWidth || 3) * zoomLevel}px`,
                  backgroundColor: element.strokeColor || "#000000",
                  marginTop: `${(element.height * zoomLevel -
                    (element.strokeWidth || 3) * zoomLevel) /
                    2
                    }px`,
                }}
              />
            </div>
          );
        case "image":
          return (
            <div key={element.id} style={style}>
              <img
                src={element.src}
                alt="Preview element"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: element.borderRadius
                    ? `${element.borderRadius * zoomLevel}px`
                    : "0",
                  border: element.borderWidth
                    ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor
                    }`
                    : "none",
                }}
              />
            </div>
          );
        case "video":
          return (
            <div key={element.id} style={style}>
              <video
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: element.borderRadius
                    ? `${element.borderRadius * zoomLevel}px`
                    : "0",
                  border: element.borderWidth
                    ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor
                    }`
                    : "none",
                }}
              >
                <source src={element.src || ""} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        case "audio":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  ...commonStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <audio controls style={{ width: "80%" }}>
                  <source src={element.src || ""} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          );
        case "frame":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  ...commonStyle,
                  border: "2px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#999", fontSize: "14px" }}>
                  Frame Content
                </span>
              </div>
            </div>
          );
        case "input":
          return (
            <div key={element.id} style={style}>
              <input
                type="text"
                placeholder={element.placeholder || "Enter text..."}
                style={{
                  ...commonStyle,
                  padding: "8px",
                  boxSizing: "border-box",
                }}
                readOnly
              />
            </div>
          );
        case "checkbox":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    accentColor: element.color || "#4299E1",
                  }}
                  disabled
                />
              </div>
            </div>
          );
        case "icon":
        case "social":
          return (
            <div key={element.id} style={style}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    color: element.color || "#000000",
                    fontSize: `${Math.min(element.width, element.height) * zoomLevel ||
                      24 * zoomLevel
                      }px`,
                    fontWeight: "bold",
                  }}
                >
                  {element.name ? element.name.charAt(0).toUpperCase() : "★"}
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div key={element.id} style={style}>
              <div style={commonStyle}>
                Unknown element type: {element.type}
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error("Error rendering element:", element, error);
      return (
        <div
          key={element.id}
          className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm"
        >
          Error rendering element: {element.type}
        </div>
      );
    }
  };

  return (
    <div
      className="p-4 bg-white rounded-lg shadow-inner"
      style={{ position: "relative", minHeight: "600px" }}
    >
      {currentPage.elements.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">📧</div>
            <p className="text-gray-500">No content yet</p>
            <p className="text-sm mt-1">Design your email to see a preview</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "900px",
            minHeight: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
          }}
        >
          {currentPage.elements
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((element) => renderElement(element))}
        </div>
      )}
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
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifiedEmails, setVerifiedEmails] = useState([]);
  const [verificationOption, setVerificationOption] = useState('preverified'); // 'preverified' or 'custom'

  // Check email verification status
  const checkEmailVerification = async (email) => {
    if (!email) return;

    try {
      const response = await fetch(`
        /api/sendrs/check/${encodeURIComponent(email)}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();

      setEmailVerificationStatus(prev => ({
        ...prev,
        [email]: {
          isVerified: data.isVerified || false,
          verifiedAt: data.verifiedAt,
          fromName: data.fromName
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
      const response = await fetch(`${API_URL}/api/senders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fromName })  // <-- changed here
      });

      if (!response) {
        throw new Error("Unable to connect to the server. Please check if the backend is running.");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (response.ok) {
        setVerificationSent(true);
        alert(`Verification email sent to ${email}. Please check your inbox and click the verification link.`);
        setTimeout(() => checkEmailVerification(email), 2000);
      } else {
        alert(data.error || "Failed to send verification email");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      if (error.message.includes("Failed to fetch") || error.message.includes("Unable to connect")) {
        alert("Unable to connect to the server. Please ensure the backend is running on port 5000.");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };


  // Fetch verified emails on component mount
  useEffect(() => {
    const fetchVerifiedEmails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/senders/verified`);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const errorText = await response.text();
          throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
        }

        if (response.ok) {
          const data = await response.json();
          setVerifiedEmails(data);
          // If there are no pre-verified emails, switch to custom option
          if (data.length === 0) {
            setVerificationOption('custom');
          }
        }
      } catch (error) {
        console.error("Error fetching verified emails:", error);
      }
    };

    fetchVerifiedEmails();
  }, []);

  // Check verification when email changes (only for custom option)
  useEffect(() => {
    if (formData.fromEmail && verificationOption === 'custom') {
      checkEmailVerification(formData.fromEmail);
    }
  }, [formData.fromEmail, verificationOption]);

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
      const response = await fetch(
        `${API_URL}/api/campaigncontacts`
      );
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

  const handleSendCampaign = async () => {
    setIsSending(true);
    try {
      // Fetch latest contacts
      const contactsResponse = await fetch(`${API_URL}/api/campaigncontacts`);
      if (!contactsResponse.ok) throw new Error("Failed to fetch contacts");
      const contactsData = await contactsResponse.json();

      // Build recipients list
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
          .filter(c => c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)); // Validate emails
      } else if (formData.recipients === "file") {
        recipientsList = (formData.bulkFileEmails || [])
          .map(email => ({ email }))
          .filter(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)); // Validate emails
      }

      // Check for spam trigger words in subject
      const spamTriggers = [
        'free', 'urgent', 'act now', 'limited time', 'click here', 'make money',
        'guaranteed', 'no cost', 'risk free', 'winner', 'congratulations'
      ];
      const subjectLower = formData.subject.toLowerCase();
      const hasSpamTriggers = spamTriggers.some(trigger => subjectLower.includes(trigger));

      if (hasSpamTriggers) {
        const confirmation = window.confirm(
          "Your subject line contains words that might trigger spam filters. This could affect delivery rates. Do you want to continue?"
        );
        if (!confirmation) {
          setIsSending(false);
          return;
        }
      }

      // Limit to 1000 recipients for better deliverability
      if (recipientsList.length > 1000) {
        recipientsList = recipientsList.slice(0, 1000);
        setSendStatus({
          success: false,
          message: "⚠️ Limited to 1000 emails for better deliverability. Consider sending to smaller, more engaged audiences.",
        });
      }

      if (recipientsList.length === 0) {
        setSendStatus({ success: false, message: "No valid email addresses found for the selected audience." });
        setIsSending(false);
        return;
      }

      // Build payload for backend
      const payload = {
        campaignName: formData.subject,
        subject: formData.subject,
        fromEmail: formData.fromEmail,
        fromName: formData.fromName,
        recipients: recipientsList,
        canvasData: canvasPages[0].elements,
        scheduleType: formData.scheduleType,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        timezone: formData.timezone,
        recurringFrequency: formData.recurringFrequency,
        recurringDays: formData.recurringDays,
        recurringEndDate: formData.recurringEndDate || null,
      };

      // Determine which API endpoint to use based on schedule type
      const url = formData.scheduleType === 'immediate'
        ? `${API_URL}/api/campaigns/send`
        : `${API_URL}/api/automation/send`;

      // Send request
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Ensure JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        throw new Error(`Server returned non-JSON response: ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();

      if (response.ok) {
        // Enhanced success message with deliverability info
        let successMessage = data.message;

        if (data.results) {
          const successRate = (data.results.success.length / recipientsList.length * 100).toFixed(1);
          successMessage += ` (${successRate}% delivery rate)`;
        }

        setSendStatus({
          success: true,
          message: successMessage,
          results: formData.scheduleType === 'immediate' ? (data.results || null) : null,
          deliverabilityTips: data.deliverabilityTips || null,
        });

        // Navigate based on schedule type
        if (formData.scheduleType === 'immediate') {
          navigate("/analytics", { state: { fromEmail: formData.fromEmail } });
        } else {
          navigate("/automation");
        }
      } else {
        // Check if it's a sender verification error
        if (data.senderVerificationRequired) {
          setSendStatus({
            success: false,
            message: `${data.error} Please verify this email address in SendGrid and set up domain authentication for better delivery.`,
            senderVerificationRequired: true,
            deliverabilityTips: data.deliverabilityTips || [
              "Verify your sender email in SendGrid",
              "Set up SPF, DKIM, and DMARC records",
              "Use a professional domain email",
              "Avoid spam trigger words",
              "Send to engaged subscribers only"
            ]
          });
        } else {
          setSendStatus({
            success: false,
            message: data.error || "Failed to send campaign",
            results: data.results || null,
            deliverabilityTips: data.deliverabilityTips || null,
          });
        }
      }
    } catch (error) {
      console.error("Error sending campaign:", error);
      setSendStatus({
        success: false,
        message: `Error: ${error.message || "Network error. Please try again."}`,
      });
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

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Send Campaign</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/editor")}
              className="px-4 py-2 text-gray-300 hover:bg-gray-900 rounded-md"
            >
              Canva Page
            </button>

            <button
              onClick={() => navigate("/all-templates")}
              className="px-4 py-2 text-gray-300 hover:bg-gray-900 rounded-md"
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
                              <option value="all-subscribers">
                                All Subscribers
                              </option>
                              <option value="new-customers">
                                New Customers
                              </option>
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

                            {/* Warnings for 600 limit */}
                            {formData.recipients === "manual" &&
                              ((formData.manualEmails || "")
                                .split(/[\n,]+/)
                                .filter((e) => e.trim()).length > 6000) && (
                                <p className="text-yellow-400 mt-2">
                                  ⚠️ You pasted more than 6000 emails. Only the first 6000 will be used.
                                </p>
                              )}

                            {formData.recipients === "file" &&
                              ((formData.bulkFileEmails || []).length > 6000) && (
                                <p className="text-yellow-400 mt-2">
                                  ⚠️ Your file contains more than 6000 emails. Only the first 6000 will be used.
                                </p>
                              )}

                          </div>
                          <div className="bg-gray-800 p-4 rounded-md">
                            <h3 className="font-medium text-white mb-2">
                              Audience Summary
                            </h3>
                            <div className="text-sm text-gray-400">
                              {formData.recipients === "all-subscribers" && (
                                <p>
                                  This will send to all {contacts.length}{" "}
                                  subscribers in your contact list.
                                </p>
                              )}
                              {formData.recipients === "new-customers" && (
                                <p>
                                  This will send to{" "}
                                  {
                                    contacts.filter(
                                      (c) => c.type === "new-customer"
                                    ).length
                                  }{" "}
                                  new customers.
                                </p>
                              )}
                              {!formData.recipients && (
                                <p>
                                  Please select an audience to see recipient
                                  count.
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => markComplete(id)}
                            disabled={!formData.recipients}
                            className={`mt-2 px-4 py-2 rounded-md ${!formData.recipients
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            Save and Continue
                          </button>
                        </div>
                      )}
                      {id === "setup" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              From name
                            </label>
                            <input
                              name="fromName"
                              type="text"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              value={formData.fromName}
                              onChange={handleChange}
                              placeholder="Enter sender name"
                              disabled={verificationOption === 'preverified'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              From email address
                            </label>

                            {/* Verification Options */}
                            <div className="flex space-x-4 mb-3">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="verificationOption"
                                  value="preverified"
                                  checked={verificationOption === 'preverified'}
                                  onChange={() => setVerificationOption('preverified')}
                                  className="mr-2 accent-[#c2831f]"
                                />
                                <span className="text-white">Use pre-verified email</span>
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="verificationOption"
                                  value="custom"
                                  checked={verificationOption === 'custom'}
                                  onChange={() => setVerificationOption('custom')}
                                  className="mr-2 accent-[#c2831f]"
                                />
                                <span className="text-white">Use custom email</span>
                              </label>
                            </div>

                            {/* Option 1: Pre-verified dropdown */}
                            {verificationOption === 'preverified' && (
                              <div>
                                <select
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                  value={formData.fromEmail}
                                  onChange={(e) => {
                                    const selectedEmail = verifiedEmails.find(email => email.email === e.target.value);
                                    if (selectedEmail) {
                                      setFormData(prev => ({
                                        ...prev,
                                        fromEmail: selectedEmail.email,
                                        fromName: selectedEmail.fromName
                                      }));
                                      // Mark as verified
                                      setEmailVerificationStatus(prev => ({
                                        ...prev,
                                        [selectedEmail.email]: { isVerified: true }
                                      }));
                                    }
                                  }}
                                >
                                  <option value="">Select a pre-verified email</option>
                                  {verifiedEmails.map(email => (
                                    <option key={email.id} value={email.email}>
                                      {email.fromName} &lt;{email.email}&gt;
                                    </option>
                                  ))}
                                </select>

                                {verifiedEmails.length === 0 && (
                                  <div className="mt-2 text-yellow-400 text-sm">
                                    No pre-verified emails available. Please verify a custom email.
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Option 2: Custom email input and verification */}
                            {verificationOption === 'custom' && (
                              <div className="space-y-2">
                                <div className="relative">
                                  <input
                                    name="fromEmail"
                                    type="email"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                    value={formData.fromEmail}
                                    onChange={handleChange}
                                    placeholder="Enter sender email"
                                  />
                                  {formData.fromEmail && emailVerificationStatus[formData.fromEmail] && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      {emailVerificationStatus[formData.fromEmail].isVerified ? (
                                        <Shield className="w-5 h-5 text-green-500" />
                                      ) : (
                                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Verification status and button for custom email */}
                                {/* Sender Verification Status Box */}
                                {formData.fromEmail && emailVerificationStatus[formData.fromEmail] && (
                                  <div className={`p-3 rounded-md border ${emailVerificationStatus[formData.fromEmail].isVerified
                                    ? "bg-green-900/30 border-green-600 text-green-400"
                                    : "bg-yellow-900/30 border-yellow-600 text-yellow-400"
                                    }`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        {emailVerificationStatus[formData.fromEmail].isVerified ? (
                                          <Shield className="w-4 h-4" />
                                        ) : (
                                          <AlertCircle className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                          {emailVerificationStatus[formData.fromEmail].isVerified
                                            ? "Email Verified"
                                            : "Email Not Verified"}
                                        </span>
                                      </div>

                                      {!emailVerificationStatus[formData.fromEmail].isVerified && (
                                        <button
                                          onClick={() => sendVerificationEmail(formData.fromEmail, formData.fromName)}
                                          disabled={!formData.fromName || isVerifying}
                                          className="flex items-center space-x-1 px-3 py-1 bg-[#c2831f] hover:bg-[#d09025] text-white text-sm rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                          {isVerifying ? (
                                            <>
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                              <span>Sending...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="w-3 h-3" />
                                              <span>Verify</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>

                                    <p className="text-xs mt-2">
                                      {emailVerificationStatus[formData.fromEmail].isVerified
                                        ? `Verified on ${new Date(emailVerificationStatus[formData.fromEmail].verifiedAt).toLocaleDateString()}`
                                        : "You must verify this email before sending campaigns. Click 'Verify' to receive a verification email."}
                                    </p>
                                  </div>
                                )}


                                {/* Verification instructions for custom email */}
                                {!formData.fromEmail && (
                                  <div className="bg-blue-900/30 border border-blue-600 rounded-md p-3">
                                    <div className="flex items-start space-x-2">
                                      <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                                      <div>
                                        <p className="text-blue-400 text-sm font-medium">Email Verification Required</p>
                                        <p className="text-blue-300 text-xs mt-1">
                                          All sender emails must be verified before sending campaigns. Enter your email and name above, then click 'Verify' to receive a verification link.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Email subject
                            </label>
                            <input
                              name="subject"
                              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                              value={formData.subject}
                              onChange={handleChange}
                              placeholder="Enter subject"
                            />
                          </div>

                          <button
                            onClick={() => markComplete(id)}
                            disabled={
                              !formData.fromName ||
                              !formData.fromEmail ||
                              !formData.subject ||
                              (verificationOption === 'custom' && !emailVerificationStatus[formData.fromEmail]?.isVerified)
                            }
                            className={`mt-2 px-4 py-2 rounded-md ${!formData.fromName ||
                              !formData.fromEmail ||
                              !formData.subject ||
                              (verificationOption === 'custom' && !emailVerificationStatus[formData.fromEmail]?.isVerified)
                              ? "bg-gray-700 cursor-not-allowed"
                              : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                              }`}
                          >
                            {(verificationOption === 'custom' && !emailVerificationStatus[formData.fromEmail]?.isVerified && formData.fromEmail)
                              ? "Email verification required"
                              : "Save and Continue"
                            }
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
                            </div>
                          </div>

                          {sendStatus && (
                            <div className={`p-4 rounded-md space-y-2 ${sendStatus.success ? "bg-[#c2831f]/20 text-[#c2831f]" : "bg-red-900/30 text-red-400"}`}>
                              <div className="font-medium">{sendStatus.message}</div>

                              {sendStatus.deliverabilityTips && (
                                <div className="text-sm mt-3">
                                  <div className="font-medium mb-2">💡 To improve inbox delivery:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    {sendStatus.deliverabilityTips.map((tip, i) => (
                                      <li key={i}>{tip}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
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
        {/* Preview Section with Email Preview */}
        <div className="w-[500px] border-l border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-bold text-lg">Email Preview</h3>
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