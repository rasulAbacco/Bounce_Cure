import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Loader2,
    Tag,
    Mail,
    Save,
    Plus,
    Edit3,
} from "lucide-react";

/**
 * 💎 Elegant CRM Sidebar
 * - Auto-fills data from email
 * - Tag system with custom fields
 * - Modern, clean UI (HubSpot inspired)
 * - Black background + gold accents
 */

export default function InboxSidebar({ email, userId }) {
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({});
    const [tags, setTags] = useState([
        { name: "Lead", fields: [] },
        { name: "Contact", fields: [] },
        { name: "Deal", fields: [] },
        { name: "Task", fields: [] },
    ]);
    const [customTag, setCustomTag] = useState("");
    const [saving, setSaving] = useState(false);

    const defaultTypes = ["Lead", "Contact", "Deal", "Task"];

    // Auto-fill from email
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

    const handleAddTag = () => {
        const tagName = customTag.trim();
        if (!tagName) return;
        if (tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase()))
            return alert("Tag already exists.");
        setTags([...tags, { name: tagName, fields: [] }]);
        setCustomTag("");
    };

    const handleAddTagField = (tagName) => {
        const fieldName = prompt(`Enter a field name for "${tagName}"`);
        if (!fieldName) return;
        setTags((prev) =>
            prev.map((t) =>
                t.name === tagName
                    ? { ...t, fields: [...t.fields, { key: fieldName, value: "" }] }
                    : t
            )
        );
    };

    // New: add custom field from main form area for selected tag
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
            // Find the selected tag fields and merge them with formData
            const tag = tags.find((t) => t.name === selectedType);

            // Build an object with custom fields keys & values
            const customFieldsData = {};
            if (tag?.fields.length) {
                tag.fields.forEach((f) => {
                    customFieldsData[f.key] = f.value;
                });
            }
            console.log("🧩 Custom fields data:", customFieldsData);

            const payload = {
                ...formData,
                ...customFieldsData, // merge custom fields into main payload
                userId,
                tags,
                createdAt: new Date().toISOString(),
            };

            console.log("💾 Saving payload:", payload);

            const endpoint = `http://localhost:5000/api/${selectedType.toLowerCase()}s`;
            await axios.post(endpoint, payload, {
                headers: { "x-user-id": userId },
            });

            alert(`✅ ${selectedType} created successfully!`);
            setFormData({});
            setSelectedType(null);
        } catch (err) {
            console.error("❌ Save failed:", err);
            alert("Error saving record.");
        } finally {
            setSaving(false);
        }
    };

    // Find fields for the selected tag/type
    const selectedTag = tags.find((t) => t.name === selectedType);

    return (
        <aside
            className="flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white shadow-2xl border-l border-gray-800"
            style={{ width: 400 }}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-black/80 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
                    <Tag className="w-5 h-5" /> CRM Assistant
                </h2>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Record Selector */}
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
                            <div className="w-full mt-2 text-xs text-gray-500">Custom</div>
                        )}

                        {tags
                            .filter(tag => !defaultTypes.includes(tag.name))
                            .map((tag) => (
                                <RecordTypeButton
                                    key={tag.name}
                                    type={tag.name}
                                    selectedType={selectedType}
                                    setSelectedType={setSelectedType}
                                />
                            ))}
                    </div>
                </section>

                {/* Email Context */}
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

                {/* Tags Section */}
                <section className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                            <Edit3 className="w-4 h-4" /> Tags & Custom Fields
                        </h3>
                    </div>

                    {/* <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                        {tags.map((tag) => (
                            <div
                                key={tag.name}
                                className="bg-gray-800/70 p-3 rounded-md border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-yellow-400 font-medium">{tag.name}</span>
                                    <button
                                        onClick={() => handleAddTagField(tag.name)}
                                        className="text-xs flex items-center gap-1 text-yellow-400 hover:text-yellow-300"
                                    >
                                        <Plus className="w-3 h-3" /> Add Field
                                    </button>
                                </div>
                                {tag.fields.length > 0 ? (
                                    tag.fields.map((f) => (
                                        <Input
                                            key={`${tag.name}-${f.key}`}
                                            label={f.key}
                                            value={f.value}
                                            onChange={(v) =>
                                                handleTagFieldChange(tag.name, f.key, v)
                                            }
                                        />
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 italic">
                                        No fields for this tag
                                    </p>
                                )}
                            </div>
                        ))}
                    </div> */}

                    {/* Add New Tag */}
                    <div className="mt-3 flex gap-2">
                        <input
                            type="text"
                            placeholder="Add custom tag"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            className="flex-1 p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                        />
                        <button
                            onClick={handleAddTag}
                            className="bg-yellow-500 px-3 rounded text-black font-semibold"
                        >
                            Add
                        </button>
                    </div>
                </section>

                {/* Main Form */}
                <section className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-3 shadow-inner">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                        {selectedType ? `${selectedType} Details` : "Select Record Type"}
                    </h3>

                    {/* Standard fields */}
                    <Input label="Name" value={formData.name} onChange={(v) => handleChange("name", v)} />
                    <Input label="Email *" value={formData.email} onChange={(v) => handleChange("email", v)} />
                    <Input label="Company" value={formData.company} onChange={(v) => handleChange("company", v)} />
                    <Input label="Phone" value={formData.phone} onChange={(v) => handleChange("phone", v)} />
                    <Input label="Website" value={formData.website} onChange={(v) => handleChange("website", v)} />
                    <Input label="Source" value={formData.source} onChange={(v) => handleChange("source", v)} />

                    {/* Custom fields from selected tag */}
                    {selectedTag && selectedTag.fields.length > 0 && (
                        <>
                            <h4 className="text-yellow-400 font-semibold mt-4">
                                Custom Fields
                            </h4>
                            {selectedTag.fields.map((field) => (
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

                    {/* Button to add new custom field to selected type */}
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

            {/* Footer / Save */}
            <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-sm">
                {selectedType ? (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
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

// 🧩 Reusable Input
function Input({ label, value, onChange, type = "text" }) {
    return (
        <div>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 bg-gray-800/90 border border-gray-700 rounded text-white text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
            />
        </div>
    );
}

// 🧩 Record Type Button
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
