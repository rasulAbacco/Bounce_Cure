import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronUp, Send, Users, Settings, FileText, Palette, Check } from "lucide-react";

const steps = [
    { id: "recipients", title: "To", description: "Choose who to send to", icon: Users },
    { id: "setup", title: "From", description: "Set up your email", icon: Settings },
    { id: "template", title: "Template", description: "Choose a template", icon: FileText },
    { id: "design", title: "Design", description: "Design your email", icon: Palette },
    { id: "confirm", title: "Confirm", description: "Review and send", icon: Check },
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
                    <p className="text-red-600 text-sm mt-1">Unable to display email preview. Please check your email design.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

// Email Preview Component with Exact Editor Styles
function EmailPreview({ pages, activePage, zoomLevel = 0.6, formData }) {
    // Safety checks
    if (!pages || !pages.length || activePage === undefined || activePage >= pages.length) {
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
                position: 'absolute',
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
                width: '100%',
                height: '100%',
                fontFamily: element.fontFamily || 'Arial',
                color: element.color || '#000000',
                backgroundColor: element.backgroundColor || 'transparent',
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none',
                borderRadius: element.borderRadius ? `${element.borderRadius * zoomLevel}px` : '0',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'left',
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
                                    lineHeight: '1.4',
                                    wordWrap: 'break-word',
                                    padding: '8px',
                                    ...(element.type === "heading" && { fontWeight: 'bold' }),
                                    ...(element.type === "subheading" && { fontWeight: '600' }),
                                    ...(element.type === "blockquote" && { 
                                        fontStyle: 'italic',
                                        paddingLeft: '16px',
                                        borderLeft: '4px solid #ccc'
                                    }),
                                }}
                            >
                                {element.content || (
                                    element.type === "heading" ? "Heading" :
                                    element.type === "subheading" ? "Subheading" :
                                    element.type === "blockquote" ? "Blockquote" : "Paragraph text"
                                )}
                            </div>
                        </div>
                    );

                case "button":
                    return (
                        <div key={element.id} style={style}>
                            <button
                                style={{
                                    ...commonStyle,
                                    fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                                    padding: `${12 * zoomLevel}px ${24 * zoomLevel}px`,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {element.content || "Click Me"}
                            </button>
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
                            <div style={{ ...commonStyle, borderRadius: '50%' }} />
                        </div>
                    );

                case "triangle":
                    return (
                        <div key={element.id} style={style}>
                            <div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: `${(element.width || 50) * zoomLevel}px solid transparent`,
                                    borderRight: `${(element.width || 50) * zoomLevel}px solid transparent`,
                                    borderBottom: `${(element.height || 86) * zoomLevel}px solid ${element.backgroundColor || "#FF9F43"}`,
                                    backgroundColor: 'transparent',
                                }}
                            />
                        </div>
                    );

                case "star":
                    return (
                        <div key={element.id} style={style}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <svg
                                    width={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                                    height={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                                    viewBox="0 0 24 24"
                                    fill={element.backgroundColor || '#FFD93D'}
                                    stroke={element.color || '#FFD93D'}
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
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                }}
                            />
                        </div>
                    );

                case "arrow":
                    return (
                        <div key={element.id} style={style}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <svg
                                    width={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                                    height={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={element.color || '#00CEC9'}
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
                                    width: '100%',
                                    height: `${(element.strokeWidth || 3) * zoomLevel}px`,
                                    backgroundColor: element.strokeColor || '#000000',
                                    marginTop: `${((element.height * zoomLevel) - (element.strokeWidth || 3) * zoomLevel) / 2}px`,
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
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: element.borderRadius ? `${element.borderRadius * zoomLevel}px` : '0',
                                    border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none',
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
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: element.borderRadius ? `${element.borderRadius * zoomLevel}px` : '0',
                                    border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none',
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f0f0f0',
                                }}
                            >
                                <audio controls style={{ width: '80%' }}>
                                    <source src={element.src || ""} type="audio/mpeg" />
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
                                    border: '2px dashed #ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <span style={{ color: '#999', fontSize: '14px' }}>Frame Content</span>
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
                                    padding: '8px',
                                    boxSizing: 'border-box',
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    style={{
                                        transform: `scale(${zoomLevel})`,
                                        accentColor: element.color || '#4299E1',
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <div
                                    style={{
                                        color: element.color || '#000000',
                                        fontSize: `${Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}px`,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {element.name ? element.name.charAt(0).toUpperCase() : '★'}
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
                <div key={element.id} className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    Error rendering element: {element.type}
                </div>
            );
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-inner" style={{ position: 'relative', minHeight: '600px' }}>
            {currentPage.elements.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📧</div>
                        <p className="text-gray-500">No content yet</p>
                        <p className="text-sm mt-1">Design your email to see a preview</p>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            {formData?.subject || "Email Subject"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            From: {formData?.fromName || "Sender Name"} &lt;{formData?.fromEmail || "sender@example.com"}&gt;
                        </p>
                    </div>
                    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
                        {currentPage.elements
                            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                            .map(element => renderElement(element))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CampaignBuilder() {
    const location = useLocation();
    const [expanded, setExpanded] = useState("setup"); // default open step
    const [completedSteps, setCompletedSteps] = useState(["setup"]);
    const [formData, setFormData] = useState({
        recipients: "",
        fromName: "Abacco Technology",
        fromEmail: "info@abaccotech.com",
        subject: "",
        sendTime: "",
        template: "basic",
        designContent: "",
    });
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null);
    
    // Canvas state
    const [canvasPages, setCanvasPages] = useState([{ id: 1, elements: [] }]);
    const [canvasActivePage, setCanvasActivePage] = useState(0);
    const [canvasZoomLevel, setCanvasZoomLevel] = useState(0.6); // Smaller zoom for preview
    
    // Check if canvas data was passed from the editor
    useEffect(() => {
        if (location.state?.canvasData) {
            setCanvasPages([{ id: 1, elements: location.state.canvasData }]);
            setCompletedSteps([...completedSteps, "design"]);
            setFormData(prev => ({
                ...prev,
                subject: location.state.subject || prev.subject
            }));
        }
    }, [location.state]);
    
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
    
    const handleTemplateSelect = (template) => {
        setFormData({ ...formData, template });
        markComplete("template");
    };
    
    const handleSendCampaign = async () => {
        setIsSending(true);
        try {
            // Backend API call
            const response = await fetch('/api/sendCampaigns/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    canvasData: canvasPages // Include canvas data in the request
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setSendStatus({ success: true, message: data.message });
            } else {
                setSendStatus({ success: false, message: data.error || 'Failed to send campaign' });
            }
        } catch (error) {
            setSendStatus({ success: false, message: 'Network error. Please try again.' });
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header */}
            <header className="bg-black border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Send Campaign</h1>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-gray-300 hover:bg-gray-900 rounded-md">Save as Draft</button>
                        <button
                            onClick={handleSendCampaign}
                            disabled={!completedSteps.includes("recipients") || !completedSteps.includes("setup") || !completedSteps.includes("template") || isSending}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${(!completedSteps.includes("recipients") || !completedSteps.includes("setup") || !completedSteps.includes("template") || isSending)
                                    ? "bg-gray-800 cursor-not-allowed"
                                    : "bg-[#c2831f] hover:bg-[#d09025]"
                                }`}
                        >
                            <Send size={16} />
                            {isSending ? 'Sending...' : 'Send Campaign'}
                        </button>
                    </div>
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Step Tracker */}
                <div className="w-64 bg-black border-r border-gray-800 p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaign Steps</h2>
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
                                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isCompleted ? 'bg-[#c2831f]' : 'bg-gray-800'
                                            }`}>
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
                                                className={`text-left ${isExpanded ? 'text-[#c2831f]' : 'hover:text-gray-300'}`}
                                            >
                                                <div className="font-medium">{title}</div>
                                                <div className="text-xs text-gray-400 mt-1">{description}</div>
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
                                <div key={id} className={`mb-8 border border-gray-800 rounded-lg overflow-hidden transition-all ${isExpanded ? 'shadow-lg' : ''
                                    }`}>
                                    <button
                                        onClick={() => toggleExpand(id)}
                                        className="flex justify-between items-center w-full px-6 py-4 bg-black hover:bg-gray-900 focus:outline-none"
                                    >
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isCompleted ? 'bg-[#c2831f]/20 text-[#c2831f]' : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                {isCompleted ? <CheckCircle size={16} /> : <div className="w-2 h-2 bg-gray-500 rounded-full"></div>}
                                            </div>
                                            <div className="ml-4 text-left">
                                                <div className="text-lg font-medium text-white">{title}</div>
                                                <div className="text-sm text-gray-400">{description}</div>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                    </button>
                                    {isExpanded && (
                                        <div className="px-6 py-5 bg-gray-900 border-t border-gray-800">
                                            {/* Step content */}
                                            {id === "recipients" && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Choose an audience</label>
                                                        <select
                                                            name="recipients"
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                                            value={formData.recipients}
                                                            onChange={handleChange}
                                                        >
                                                            <option value="">Select an audience</option>
                                                            <option value="all-subscribers">All Subscribers</option>
                                                            <option value="new-customers">New Customers</option>
                                                            <option value="vip-clients">VIP Clients</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => markComplete(id)}
                                                        className="mt-2 bg-[#c2831f] text-white px-4 py-2 rounded-md hover:bg-[#d09025]"
                                                    >
                                                        Save and Continue
                                                    </button>
                                                </div>
                                            )}
                                            {id === "setup" && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">From name</label>
                                                        <input
                                                            name="fromName"
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                                            value={formData.fromName}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">From email address</label>
                                                        <input
                                                            name="fromEmail"
                                                            type="email"
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                                            value={formData.fromEmail}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-300 mb-1">Email subject</label>
                                                        <input
                                                            name="subject"
                                                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                                                            value={formData.subject}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => markComplete(id)}
                                                        className="mt-2 bg-[#c2831f] text-white px-4 py-2 rounded-md hover:bg-[#d09025]"
                                                    >
                                                        Save and Continue
                                                    </button>
                                                </div>
                                            )}
                                            {id === "template" && (
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-medium text-gray-300 mb-3">Choose a template</label>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {['basic', 'newsletter', 'promotion'].map((template) => (
                                                            <div
                                                                key={template}
                                                                onClick={() => handleTemplateSelect(template)}
                                                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.template === template
                                                                        ? 'border-[#c2831f] bg-[#c2831f]/10'
                                                                        : 'border-gray-700 hover:border-gray-600'
                                                                    }`}
                                                            >
                                                                <div className="h-32 bg-gray-800 rounded mb-2 flex items-center justify-center">
                                                                    <span className="text-sm text-gray-400">{template.charAt(0).toUpperCase() + template.slice(1)}</span>
                                                                </div>
                                                                <div className="text-sm font-medium text-center text-white">{template.charAt(0).toUpperCase() + template.slice(1)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {id === "design" && (
                                                <div className="space-y-4">
                                                    <label className="block text-sm font-medium text-gray-300 mb-1">Design your email</label>
                                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                                        <p className="text-gray-400 mb-4">Use the design editor to create your email template. Your design will appear in the preview panel.</p>
                                                        <a
                                                            href="/editor"
                                                            className="px-4 py-2 bg-[#c2831f] text-white rounded-md hover:bg-[#d09025]"
                                                        >
                                                            Open Design Editor
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            {id === "confirm" && (
                                                <div className="space-y-6">
                                                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                                        <h3 className="font-medium text-white mb-3">Campaign Summary</h3>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex">
                                                                <span className="w-32 text-gray-400">Recipients:</span>
                                                                <span className="font-medium text-white">{formData.recipients || 'Not selected'}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-32 text-gray-400">From:</span>
                                                                <span className="font-medium text-white">{formData.fromName} &lt;{formData.fromEmail}&gt;</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-32 text-gray-400">Subject:</span>
                                                                <span className="font-medium text-white">{formData.subject || 'Not set'}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-32 text-gray-400">Template:</span>
                                                                <span className="font-medium text-white">{formData.template}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {sendStatus && (
                                                        <div className={`p-4 rounded-md ${sendStatus.success ? 'bg-[#c2831f]/20 text-[#c2831f]' : 'bg-red-900/30 text-red-400'
                                                            }`}>
                                                            {sendStatus.message}
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
                            disabled={!completedSteps.includes("recipients") || !completedSteps.includes("setup") || !completedSteps.includes("template") || isSending}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-white ${(!completedSteps.includes("recipients") || !completedSteps.includes("setup") || !completedSteps.includes("template") || isSending)
                                    ? "bg-gray-800 cursor-not-allowed"
                                    : "bg-[#c2831f] hover:bg-[#d09025]"
                                }`}
                        >
                            <Send size={16} />
                            {isSending ? 'Sending...' : 'Send Campaign'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}