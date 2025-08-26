import React, { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp, Send, Users, Settings, FileText, Palette, Check } from "lucide-react";

const steps = [
    { id: "recipients", title: "To", description: "Choose who to send to", icon: Users },
    { id: "setup", title: "From", description: "Set up your email", icon: Settings },
    { id: "template", title: "Template", description: "Choose a template", icon: FileText },
    { id: "design", title: "Design", description: "Design your email", icon: Palette },
    { id: "confirm", title: "Confirm", description: "Review and send", icon: Check },
];

// Simplified Email Preview Component
function EmailPreview({ pages, activePage, zoomLevel = 0.6 }) {
    const renderElement = (element) => {
        return (
            <div key={element.id} className="mb-4" style={{
                transform: `rotate(${element.rotation || 0}deg)`,
                opacity: element.opacity || 1
            }}>
                {/* Text Elements */}
                {(element.type === "heading" || element.type === "paragraph" ||
                    element.type === "subheading" || element.type === "blockquote") && (
                        <div
                            className={`
              ${element.type === "heading" ? "font-bold text-2xl" :
                                    element.type === "subheading" ? "font-semibold text-xl" :
                                        element.type === "blockquote" ? "italic pl-4 border-l-4 border-gray-300" : ""}
            `}
                            style={{
                                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                                fontFamily: element.fontFamily || 'Arial',
                                color: element.color || '#000000',
                                fontWeight: element.fontWeight || 'normal',
                                fontStyle: element.fontStyle || 'normal',
                                textDecoration: element.textDecoration || 'none',
                                textAlign: element.textAlign || 'left',
                                backgroundColor: element.backgroundColor || 'transparent'
                            }}
                        >
                            {element.content || (
                                element.type === "heading" ? "Heading" :
                                    element.type === "subheading" ? "Subheading" :
                                        element.type === "blockquote" ? "Blockquote" : "Paragraph text"
                            )}
                        </div>
                    )}

                {/* Button Element */}
                {element.type === "button" && (
                    <button
                        className="font-medium cursor-pointer"
                        style={{
                            backgroundColor: element.backgroundColor || "#007bff",
                            color: element.color || "#fff",
                            padding: `${12 * zoomLevel}px ${24 * zoomLevel}px`,
                            borderRadius: `${(element.borderRadius || 6) * zoomLevel}px`,
                            fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                            fontFamily: element.fontFamily || 'Arial',
                            border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
                        }}
                    >
                        {element.content || "Click Me"}
                    </button>
                )}

                {/* Shape Elements */}
                {element.type === "rectangle" && (
                    <div
                        style={{
                            width: `${(element.width || 100) * zoomLevel}px`,
                            height: `${(element.height || 100) * zoomLevel}px`,
                            backgroundColor: element.backgroundColor || "#4ECDC4",
                            border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`,
                            borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`
                        }}
                    />
                )}

                {element.type === "circle" && (
                    <div
                        className="rounded-full"
                        style={{
                            width: `${(element.width || 100) * zoomLevel}px`,
                            height: `${(element.height || 100) * zoomLevel}px`,
                            backgroundColor: element.backgroundColor || "#FF6B6B",
                            border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`
                        }}
                    />
                )}

                {element.type === "triangle" && (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${(element.width || 50) * zoomLevel}px solid transparent`,
                            borderRight: `${(element.width || 50) * zoomLevel}px solid transparent`,
                            borderBottom: `${(element.height || 86) * zoomLevel}px solid ${element.backgroundColor || "#FF9F43"}`,
                            backgroundColor: 'transparent'
                        }}
                    />
                )}

                {/* Icon Elements */}
                {element.type === "star" && (
                    <div className="flex items-center justify-center">
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
                )}

                {element.type === "hexagon" && (
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: `${(element.width || 100) * zoomLevel}px`,
                            height: `${(element.height || 100) * zoomLevel}px`,
                            backgroundColor: element.backgroundColor || "#6C5CE7",
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                        }}
                    />
                )}

                {element.type === "arrow" && (
                    <div className="flex items-center justify-center">
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
                )}

                {/* Line Element */}
                {element.type === "line" && (
                    <div
                        style={{
                            width: `${(element.width || 150) * zoomLevel}px`,
                            height: `${(element.strokeWidth || 3) * zoomLevel}px`,
                            backgroundColor: element.strokeColor || '#000000'
                        }}
                    />
                )}

                {/* Image Element */}
                {element.type === "image" && (
                    <img
                        src={element.src}
                        alt="Preview element"
                        style={{
                            maxWidth: `${(element.width || 200) * zoomLevel}px`,
                            maxHeight: `${(element.height || 150) * zoomLevel}px`,
                            borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                            border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
                        }}
                        className="object-cover"
                    />
                )}

                {/* Video Element */}
                {element.type === "video" && (
                    <video
                        controls
                        className="max-w-full max-h-60 object-cover"
                        style={{
                            borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                            border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
                        }}
                    >
                        <source src={element.src || ""} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}

                {/* Audio Element */}
                {element.type === "audio" && (
                    <div
                        className="bg-gray-100 p-4 rounded"
                        style={{
                            borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                            border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
                        }}
                    >
                        <audio controls className="w-full">
                            <source src={element.src || ""} type="audio/mpeg" />
                        </audio>
                    </div>
                )}

                {/* Frame Element */}
                {element.type === "frame" && (
                    <div
                        className="border-2 border-dashed p-4 flex items-center justify-center"
                        style={{
                            borderColor: element.borderColor || '#A0AEC0',
                            borderRadius: `${(element.borderRadius || 8) * zoomLevel}px`,
                            backgroundColor: element.backgroundColor || 'transparent',
                            width: `${(element.width || 200) * zoomLevel}px`,
                            height: `${(element.height || 150) * zoomLevel}px`
                        }}
                    >
                        <span className="text-gray-400">Frame Content</span>
                    </div>
                )}

                {/* Interactive Elements */}
                {element.type === "input" && (
                    <input
                        type="text"
                        placeholder={element.placeholder || "Enter text..."}
                        className="px-3 py-2 border rounded"
                        style={{
                            borderColor: element.borderColor || '#CBD5E0',
                            borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`,
                            fontSize: `${(element.fontSize || 14) * zoomLevel}px`,
                            backgroundColor: element.backgroundColor || '#FFFFFF'
                        }}
                        readOnly
                    />
                )}

                {element.type === "checkbox" && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="w-6 h-6"
                            style={{
                                transform: `scale(${zoomLevel})`,
                                accentColor: element.color || '#4299E1'
                            }}
                            disabled
                        />
                        <span className="ml-2">Checkbox Option</span>
                    </div>
                )}

                {/* Icon Element */}
                {element.type === "icon" && (
                    <div className="flex items-center justify-center">
                        <div
                            style={{
                                color: element.color || '#000000',
                                fontSize: `${Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: `${Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}px`,
                                height: `${Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}px`,
                                fontWeight: 'bold'
                            }}
                        >
                            {element.name ? element.name.charAt(0).toUpperCase() : '★'}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-inner">
            {pages[activePage].elements.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">📧</div>
                        <p className="text-gray-500">No content yet</p>
                        <p className="text-sm mt-1">Design your email to see a preview</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{formData.subject || "Email Subject"}</h2>
                        <p className="text-sm text-gray-600 mt-1">From: {formData.fromName} &lt;{formData.fromEmail}&gt;</p>
                    </div>

                    {pages[activePage].elements
                        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                        .map(element => renderElement(element))}
                </div>
            )}
        </div>
    );
}

export default function CampaignBuilder() {
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
            const response = await fetch('/api/campaigns/send', {
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
                            <EmailPreview
                                pages={canvasPages}
                                activePage={canvasActivePage}
                                zoomLevel={canvasZoomLevel}
                            />
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