// client/src/pages/Campaign/components/Steps.jsx
import React from "react";

/** Shared Step Section wrapper */
function StepSection({
    id,
    title,
    description,
    expanded,
    toggleExpand,
    completedSteps,
    children,
}) {
    const isExpanded = expanded === id;
    const isCompleted = completedSteps.includes(id);

    return (
        <div
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
                        {isCompleted ? "✔" : <div className="w-2 h-2 bg-gray-500 rounded-full"></div>}
                    </div>
                    <div className="ml-4 text-left">
                        <div className="text-lg font-medium text-white">{title}</div>
                        <div className="text-sm text-gray-400">{description}</div>
                    </div>
                </div>
                <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
            </button>
            {isExpanded && (
                <div className="px-6 py-5 bg-gray-900 border-t border-gray-800">
                    {children}
                </div>
            )}
        </div>
    );
}

/* ================= Recipients Step ================= */
export function RecipientsStep({
    formData,
    setFormData,
    contacts,
    markComplete,
    handleFileUpload,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    return (
        <StepSection
            id="recipients"
            title="Recipients"
            description="Choose audience"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="space-y-4">
                <select
                    name="recipients"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                    value={formData.recipients}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, recipients: e.target.value }))
                    }
                >
                    <option value="">Select an option</option>
                    <option value="all-subscribers">All Subscribers</option>
                    <option value="new-customers">New Customers</option>
                    <option value="manual">Manual (paste emails)</option>
                    <option value="file">Upload File (CSV)</option>
                </select>

                {/* Audience summary */}
                <div className="bg-gray-800 p-4 rounded-md">
                    <h3 className="font-medium text-white mb-2">Audience Summary</h3>
                    <div className="text-sm text-gray-400">
                        {formData.recipients === "all-subscribers" && (
                            <p>
                                This will send to all {contacts.length} subscribers in your
                                contact list.
                            </p>
                        )}
                        {formData.recipients === "new-customers" && (
                            <p>
                                This will send to{" "}
                                {contacts.filter((c) => c.type === "new-customer").length} new
                                customers.
                            </p>
                        )}
                        {!formData.recipients && (
                            <p>Please select an audience to see recipient count.</p>
                        )}
                    </div>
                </div>

                {formData.recipients === "manual" && (
                    <textarea
                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                        placeholder="Paste emails separated by commas or new lines"
                        value={formData.manualEmails || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, manualEmails: e.target.value }))
                        }
                    />
                )}

                {formData.recipients === "file" && (
                    <input
                        type="file"
                        accept=".csv,.txt"
                        className="block text-sm text-gray-400"
                        onChange={handleFileUpload}
                    />
                )}

                <button
                    onClick={() => markComplete("recipients")}
                    disabled={!formData.recipients}
                    className={`mt-2 px-4 py-2 rounded-md ${!formData.recipients
                            ? "bg-gray-700 cursor-not-allowed"
                            : "bg-[#c2831f] hover:bg-[#d09025] text-white"
                        }`}
                >
                    Save and Continue
                </button>
            </div>
        </StepSection>
    );
}

/* ================= Setup Step ================= */
export function SetupStep({
    formData,
    setFormData,
    markComplete,
    emailVerificationStatus,
    sendVerificationEmail,
    isVerifying,
    verifiedEmails,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    const verification = formData.fromEmail
        ? emailVerificationStatus[formData.fromEmail]
        : null;

    return (
        <StepSection
            id="setup"
            title="Setup"
            description="Configure sender and subject"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="space-y-4">
                <input
                    type="text"
                    name="fromName"
                    placeholder="From name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    value={formData.fromName}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fromName: e.target.value }))
                    }
                />

                <div className="flex items-center gap-2">
                    <input
                        type="email"
                        name="fromEmail"
                        placeholder="From email"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        value={formData.fromEmail}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, fromEmail: e.target.value }))
                        }
                    />
                    {formData.fromEmail && (
                        <button
                            onClick={() =>
                                sendVerificationEmail(formData.fromEmail, formData.fromName, 'send-campaign')
                            }
                            disabled={isVerifying}
                            className="px-3 py-2 text-sm rounded-md bg-[#c2831f] hover:bg-[#d09025]"
                        >
                            {isVerifying ? "Sending..." : "Verify"}
                        </button>
                    )}
                </div>

                {verification && (
                    <p
                        className={`text-sm ${verification.isVerified ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {verification.isVerified
                            ? `Verified on ${verification.verifiedAt}`
                            : "Not verified"}
                    </p>
                )}

                <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    value={formData.subject}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                />

                <button
                    onClick={() => markComplete("setup")}
                    disabled={!formData.fromName || !formData.fromEmail || !formData.subject}
                    className="mt-2 px-4 py-2 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md"
                >
                    Save and Continue
                </button>
            </div>
        </StepSection>
    );
}



/* ================= Template Step ================= */
export function TemplateStep({
    formData,
    setFormData,
    markComplete,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    return (
        <StepSection
            id="template"
            title="Template"
            description="Choose template"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="grid grid-cols-2 gap-4">
                {["basic", "newsletter", "promo", "custom"].map((tpl) => (
                    <button
                        key={tpl}
                        onClick={() =>
                            setFormData((prev) => ({ ...prev, template: tpl }))
                        }
                        className={`p-4 rounded-md border ${formData.template === tpl
                                ? "border-[#c2831f] bg-[#c2831f]/10"
                                : "border-gray-700 hover:bg-gray-800"
                            }`}
                    >
                        {tpl.charAt(0).toUpperCase() + tpl.slice(1)}
                    </button>
                ))}
            </div>

            <button
                onClick={() => markComplete("template")}
                disabled={!formData.template}
                className="mt-4 px-4 py-2 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md"
            >
                Save and Continue
            </button>
        </StepSection>
    );
}
