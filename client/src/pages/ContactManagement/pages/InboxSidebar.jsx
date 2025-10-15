// File: inboxsidebar.jsx (FIXED VERSION)
import React, { useEffect, useState } from "react";
import {
    Loader2,
    Tag,
    Mail,
    Save,
    Plus,
    Edit3,
    Trash2,
    X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_VRI_URL || "http://localhost:5000";

export default function InboxSidebar({ email, userId }) {
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({});
    const [customTag, setCustomTag] = useState("");
    const [saving, setSaving] = useState(false);
    const [loadingFields, setLoadingFields] = useState(false);

    const defaultTypes = ["Lead", "Contact", "Deal", "Task", "Order"];

    const [tags, setTags] = useState(() => {
        const defaultTags = defaultTypes.map(type => ({ name: type, fields: [] }));
        return defaultTags;
    });

    // Fetch custom fields from database on mount
    useEffect(() => {
        fetchCustomFields();
    }, []);

    const fetchCustomFields = async () => {
        setLoadingFields(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/custom/record-types`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const types = await response.json();
                const customFields = types
                    .filter(type => !defaultTypes.includes(type))
                    .map(type => ({ name: type, fields: [] }));
                
                setTags(prev => {
                    const defaultTags = prev.filter(t => defaultTypes.includes(t.name));
                    return [...defaultTags, ...customFields];
                });
            }
        } catch (err) {
            console.error('Error fetching custom fields:', err);
        } finally {
            setLoadingFields(false);
        }
    };

    useEffect(() => {
        if (!email) return;

        const senderEmail = email.fromEmail || email.from || "";
        const nameGuess =
            email.fromName ||
            senderEmail.split("@")[0].replace(/[._]/g, " ") ||
            "";
        const [firstName, ...rest] = nameGuess.split(" ");
        const companyGuess =
            email.parsingMeta?.company ||
            senderEmail.split("@")[1]?.split(".")[0] ||
            "";

        setFormData({
            name: `${firstName} ${rest.join(" ")}`.trim(),
            email: senderEmail,
            company: companyGuess.charAt(0).toUpperCase() + companyGuess.slice(1),
            phone: email.parsingMeta?.phone || "",
            website: email.parsingMeta?.website || "",
            source: "email",
        });
    }, [email]);

    const handleChange = (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const handleAddTag = async () => {
        const tagName = customTag.trim();
        if (!tagName) return;
        if (tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())) {
            return alert("Tag already exists.");
        }

        // Save to database
        try {
            const token = localStorage.getItem('token');
            
            // Create a dummy record to register the new type
            const response = await fetch(`${API_URL}/api/custom/records`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recordType: tagName,
                    name: `${tagName} Placeholder`,
                    email: 'placeholder@example.com',
                    source: 'system',
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create custom field');
            }

            const newTag = { name: tagName, fields: [] };
            setTags(prev => [...prev, newTag]);
            setCustomTag("");
            
            alert(`✅ Custom field "${tagName}" created successfully!`);
        } catch (err) {
            console.error('Error creating custom field:', err);
            alert(`Error creating custom field: ${err.message}`);
        }
    };

    const handleRemoveTag = async (tagName) => {
        if (!window.confirm(`Remove custom field "${tagName}"? This will delete all associated records.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            // First, get all records of this type
            const response = await fetch(`${API_URL}/api/custom/records/type/${tagName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const records = await response.json();
                
                // Delete all records of this type
                for (const record of records) {
                    await fetch(`${API_URL}/api/custom/records/${record.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
            }

            // Remove from state
            setTags(prev => prev.filter(t => t.name !== tagName));
            
            // Clear selection if this was selected
            if (selectedType === tagName) {
                setSelectedType(null);
            }

            alert(`✅ Custom field "${tagName}" removed successfully!`);
        } catch (err) {
            console.error('Error removing custom field:', err);
            alert(`Error removing custom field: ${err.message}`);
        }
    };

    const handleAddFieldToSelectedType = () => {
        if (!selectedType) {
            alert("Select a record type first");
            return;
        }
        const fieldName = prompt(`Enter a new field name for "${selectedType}"`);
        if (!fieldName) return;

        setTags((prev) =>
            prev.map((t) =>
                t.name === selectedType
                    ? { ...t, fields: [...t.fields, { key: fieldName, value: "" }] }
                    : t
            )
        );
    };

    const handleTagFieldChange = (tagName, key, value) => {
        setTags((prev) =>
            prev.map((t) =>
                t.name === tagName
                    ? {
                        ...t,
                        fields: t.fields.map((f) =>
                            f.key === key ? { ...f, value } : f
                        ),
                    }
                    : t
            )
        );
    };

    const handleSave = async () => {
        if (!selectedType) return alert("Select a record type first.");
        if (!formData.email) return alert("Email is mandatory for all records.");
        if (!window.confirm(`Save as ${selectedType}?`)) return;

        setSaving(true);
        try {
            const tag = tags.find((t) => t.name === selectedType);
            const customFieldsData = {};
            if (tag?.fields.length) {
                tag.fields.forEach((f) => {
                    customFieldsData[f.key] = f.value;
                });
            }

            const token = window.localStorage.getItem('token');
            if (!token) {
                alert("Authentication required. Please log in.");
                return;
            }

            let endpoint = "";
            let payload = {};

            switch (selectedType) {
                case "Lead":
                    endpoint = `${API_URL}/api/leads`;
                    payload = {
                        name: formData.name || "",
                        email: formData.email || "",
                        company: formData.company || "",
                        source: formData.source || "email",
                        status: customFieldsData.status || "Opened",
                        score: Number(customFieldsData.score) || 50,
                        last: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        ...customFieldsData
                    };
                    break;

                case "Contact":
                    endpoint = `${API_URL}/contact`;
                    payload = {
                        name: formData.name || "",
                        email: formData.email || "",
                        phone: formData.phone || "",
                        company: formData.company || "",
                        status: customFieldsData.status || "Prospect",
                        priority: customFieldsData.priority || "new",
                        last: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        ...customFieldsData
                    };
                    break;

                case "Deal":
                    endpoint = `${API_URL}/deals`;
                    payload = {
                        name: formData.name || "",
                        client: formData.name || "",
                        stage: customFieldsData.stage || "Negotiation",
                        value: customFieldsData.value || "",
                        closing: customFieldsData.closing || "",
                        status: customFieldsData.status || "Open",
                        ...customFieldsData
                    };
                    break;

                case "Task":
                    endpoint = `${API_URL}/tasks`;
                    payload = {
                        title: customFieldsData.title || `Follow up with ${formData.name}`,
                        description: customFieldsData.description || `Email from ${formData.email}`,
                        status: customFieldsData.status || "pending",
                        priority: customFieldsData.priority || "medium",
                        due: customFieldsData.due || new Date().toISOString().split('T')[0],
                        ...customFieldsData
                    };
                    break;

                case "Order":
                    endpoint = `${API_URL}/orders`;
                    
                    let amountValue = 0;
                    if (customFieldsData.amount) {
                        const cleanAmountStr = customFieldsData.amount.replace(/[^\d.]/g, '');
                        amountValue = parseFloat(cleanAmountStr) || 0;
                    }
                    
                    if (amountValue <= 0) {
                        alert("Amount must be a positive number");
                        return;
                    }
                    
                    payload = {
                        name: formData.name || "",
                        phone: formData.phone || "",
                        plan: customFieldsData.plan || "Starter Plan",
                        amount: String(amountValue),
                        status: customFieldsData.status || "Open",
                        date: customFieldsData.date || new Date().toISOString().split('T')[0],
                    };
                    break;

                default:
                    endpoint = `${API_URL}/api/custom/records`;
                    payload = {
                        recordType: selectedType,
                        name: formData.name || "",
                        email: formData.email || "",
                        phone: formData.phone || "",
                        company: formData.company || "",
                        website: formData.website || "",
                        source: formData.source || "email",
                        status: customFieldsData.status || null,
                        score: customFieldsData.score ? Number(customFieldsData.score) : null,
                        last: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        customFields: customFieldsData,
                    };
            }

            console.log("💾 Saving to:", endpoint);
            console.log("📦 Payload:", payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.error("Error response text:", errorText);
                    errorMessage = errorText || errorMessage;
                } catch (e) {
                    console.error("Could not get error response text", e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("✅ Response:", data);

            alert(`✅ ${selectedType} created successfully!`);
            
            setFormData({});
            setSelectedType(null);
            
            setTags((prev) =>
                prev.map((t) => ({
                    ...t,
                    fields: t.fields.map((f) => ({ ...f, value: "" }))
                }))
            );

        } catch (err) {
            console.error("❌ Save failed:", err);
            alert(`Error saving record: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const selectedTag = tags.find((t) => t.name === selectedType);

    return (
        <aside
            className="flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white shadow-2xl border-l border-gray-800"
            style={{ width: 400 }}
        >
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-black/80 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                    <Tag className="w-5 h-5" /> CRM Assistant
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <section>
                    <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                        Record Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {defaultTypes.map((type) => (
                            <RecordTypeButton
                                key={type}
                                type={type}
                                selectedType={selectedType}
                                setSelectedType={setSelectedType}
                            />
                        ))}

                        {tags.filter(tag => !defaultTypes.includes(tag.name)).length > 0 && (
                            <div className="w-full mt-2 text-xs text-gray-500 flex items-center justify-between">
                                <span>Custom Fields</span>
                                {loadingFields && <Loader2 className="w-3 h-3 animate-spin" />}
                            </div>
                        )}

                        {tags
                            .filter(tag => !defaultTypes.includes(tag.name))
                            .map((tag) => (
                                <div key={tag.name} className="relative group">
                                    <RecordTypeButton
                                        type={tag.name}
                                        selectedType={selectedType}
                                        setSelectedType={setSelectedType}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTag(tag.name);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={`Remove ${tag.name}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                    </div>
                </section>

                {email && (
                    <section className="p-4 rounded-lg bg-gray-900/80 border border-gray-800 shadow-inner">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-300">
                                    {email.fromEmail}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 italic">
                                    {email.subject || "No subject"}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <section className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Add Custom Record Type
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="e.g., Customer, Partner, Vendor"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            className="flex-1 p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                        />
                        <button
                            onClick={handleAddTag}
                            className="bg-yellow-500 px-3 rounded text-black font-semibold hover:bg-yellow-400 transition flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </div>
                </section>

                <section className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-3 shadow-inner">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                        {selectedType ? `${selectedType} Details` : "Select Record Type"}
                    </h3>

                    <Input label="Name *" value={formData.name} onChange={(v) => handleChange("name", v)} />
                    <Input label="Email *" value={formData.email} onChange={(v) => handleChange("email", v)} />
                    <Input label="Company" value={formData.company} onChange={(v) => handleChange("company", v)} />
                    <Input label="Phone" value={formData.phone} onChange={(v) => handleChange("phone", v)} />
                    <Input label="Website" value={formData.website} onChange={(v) => handleChange("website", v)} />
                    <Input label="Source" value={formData.source} onChange={(v) => handleChange("source", v)} />

                    {selectedType === "Lead" && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "status")?.value || "Opened"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "status")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "status", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "status", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="Opened">Opened</option>
                                    <option value="Clicked">Clicked</option>
                                    <option value="Bounced">Bounced</option>
                                    <option value="Unsubscribed">Unsubscribed</option>
                                </select>
                            </div>
                            <Input 
                                label="Engagement Score (0-100)" 
                                value={selectedTag?.fields.find(f => f.key === "score")?.value || "50"}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "score")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "score", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "score", v);
                                    }
                                }}
                                type="number"
                            />
                        </>
                    )}

                    {selectedType === "Deal" && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Stage</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "stage")?.value || "Negotiation"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "stage")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "stage", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "stage", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option>Negotiation</option>
                                    <option>Proposal Sent</option>
                                    <option>Closed Won</option>
                                    <option>Closed Lost</option>
                                </select>
                            </div>
                            <Input 
                                label="Deal Value ($)" 
                                value={selectedTag?.fields.find(f => f.key === "value")?.value || ""}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "value")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "value", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "value", v);
                                    }
                                }}
                                type="number"
                            />
                            <Input 
                                label="Closing Date" 
                                value={selectedTag?.fields.find(f => f.key === "closing")?.value || ""}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "closing")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "closing", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "closing", v);
                                    }
                                }}
                                type="date"
                            />
                        </>
                    )}

                    {selectedType === "Contact" && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "priority")?.value || "new"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "priority")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "priority", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "priority", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="vip">VIP</option>
                                    <option value="subscriber">Subscriber</option>
                                    <option value="new">New</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "status")?.value || "Prospect"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "status")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "status", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "status", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Prospect">Prospect</option>
                                    <option value="Customer">Customer</option>
                                </select>
                            </div>
                        </>
                    )}

                    {selectedType === "Task" && (
                        <>
                            <Input 
                                label="Task Title" 
                                value={selectedTag?.fields.find(f => f.key === "title")?.value || `Follow up with ${formData.name}`}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "title")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "title", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "title", v);
                                    }
                                }}
                            />
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "status")?.value || "pending"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "status")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "status", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "status", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "priority")?.value || "medium"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "priority")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "priority", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "priority", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <Input 
                                label="Due Date" 
                                value={selectedTag?.fields.find(f => f.key === "due")?.value || new Date().toISOString().split('T')[0]}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "due")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "due", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "due", v);
                                    }
                                }}
                                type="date"
                            />
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    value={selectedTag?.fields.find(f => f.key === "description")?.value || `Email from ${formData.email}`}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "description")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "description", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "description", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}

                    {selectedType === "Order" && (
                        <>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Plan</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "plan")?.value || "Starter Plan"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "plan")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "plan", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "plan", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="Basic Plan">Basic Plan</option>
                                    <option value="Starter Plan">Starter Plan</option>
                                    <option value="Pro Plan">Pro Plan</option>
                                    <option value="Enterprise Plan">Enterprise Plan</option>
                                </select>
                            </div>
                            <Input 
                                label="Amount ($)" 
                                value={selectedTag?.fields.find(f => f.key === "amount")?.value || "0"}
                                onChange={(v) => {
                                    const numericValue = v.replace(/[^\d.]/g, '');
                                    if (!selectedTag?.fields.find(f => f.key === "amount")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "amount", value: numericValue }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "amount", numericValue);
                                    }
                                }}
                                type="number"
                                min="0"
                                step="0.01"
                            />
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                                <select
                                    value={selectedTag?.fields.find(f => f.key === "status")?.value || "Open"}
                                    onChange={(e) => {
                                        if (!selectedTag?.fields.find(f => f.key === "status")) {
                                            setTags(prev => prev.map(t => 
                                                t.name === selectedType 
                                                    ? { ...t, fields: [...t.fields, { key: "status", value: e.target.value }] }
                                                    : t
                                            ));
                                        } else {
                                            handleTagFieldChange(selectedType, "status", e.target.value);
                                        }
                                    }}
                                    className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Processed">Processed</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <Input 
                                label="Date" 
                                value={selectedTag?.fields.find(f => f.key === "date")?.value || new Date().toISOString().split('T')[0]}
                                onChange={(v) => {
                                    if (!selectedTag?.fields.find(f => f.key === "date")) {
                                        setTags(prev => prev.map(t => 
                                            t.name === selectedType 
                                                ? { ...t, fields: [...t.fields, { key: "date", value: v }] }
                                                : t
                                        ));
                                    } else {
                                        handleTagFieldChange(selectedType, "date", v);
                                    }
                                }}
                                type="date"
                            />
                        </>
                    )}

                    {selectedTag && selectedTag.fields.filter(f => 
                        !['status', 'score', 'stage', 'value', 'closing', 'priority', 
                          'title', 'due', 'description', 'plan', 'amount', 'date'].includes(f.key)
                    ).length > 0 && (
                        <>
                            <h4 className="text-yellow-400 font-semibold mt-4 text-sm">
                                Additional Custom Fields
                            </h4>
                            {selectedTag.fields.filter(f => 
                                !['status', 'score', 'stage', 'value', 'closing', 'priority',
                                  'title', 'due', 'description', 'plan', 'amount', 'date'].includes(f.key)
                            ).map((field) => (
                                <Input
                                    key={field.key}
                                    label={field.key}
                                    value={field.value}
                                    onChange={(v) =>
                                        handleTagFieldChange(selectedTag.name, field.key, v)
                                    }
                                />
                            ))}
                        </>
                    )}

                    {selectedType && (
                        <button
                            onClick={handleAddFieldToSelectedType}
                            className="mt-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs py-1 px-3 rounded font-semibold transition"
                        >
                            + Add Custom Field
                        </button>
                    )}
                </section>
            </div>

            <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-sm">
                {selectedType ? (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Save {selectedType}
                            </>
                        )}
                    </button>
                ) : (
                    <p className="text-xs text-gray-500 text-center">
                        Select a record type to enable saving
                    </p>
                )}
            </div>
        </aside>
    );
}

function Input({ label, value, onChange, type = "text", ...props }) {
    return (
        <div>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                {...props}
            />
        </div>
    );
}

function RecordTypeButton({ type, selectedType, setSelectedType }) {
    return (
        <button
            onClick={() => setSelectedType(type)}
            className={`px-3 py-2 rounded-md text-sm font-semibold transition-all ${selectedType === type
                ? "bg-yellow-500 text-black"
                : "bg-gray-900 border border-gray-700 text-yellow-400 hover:bg-gray-800"
                }`}
        >
            {type}
        </button>
    );
}