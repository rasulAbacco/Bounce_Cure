// continuation of Steps.jsx
import React from "react";

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
                className="flex justify-between items-center w-full px-6 py-4 bg-black hover:bg-gray-900"
            >
                <div className="flex items-center">
                    <div
                        className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isCompleted
                                ? "bg-[#c2831f]/20 text-[#c2831f]"
                                : "bg-gray-800 text-gray-400"
                            }`}
                    >
                        {isCompleted ? "✔" : <div className="w-2 h-2 bg-gray-500 rounded-full" />}
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

/* ================= Design Step ================= */
export function DesignStep({
    formData,
    markComplete,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    return (
        <StepSection
            id="design"
            title="Design"
            description="Customize your email content"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="space-y-4">
                <textarea
                    className="w-full h-64 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c2831f] text-white"
                    placeholder="Write your email content here..."
                    value={formData.designContent || ""}
                    onChange={(e) =>
                        setFormData((prev) => ({
                            ...prev,
                            designContent: e.target.value,
                        }))
                    }
                />

                <button
                    onClick={() => markComplete("design")}
                    disabled={!formData.designContent}
                    className="mt-2 px-4 py-2 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md"
                >
                    Save and Continue
                </button>
            </div>
        </StepSection>
    );
}

/* ================= Schedule Step ================= */
export function ScheduleStep({
    formData,
    setFormData,
    markComplete,
    handleRecurringDaysChange,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    const getMinDate = () => new Date().toISOString().split("T")[0];
    const getMinDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
    };

    return (
        <StepSection
            id="schedule"
            title="Schedule"
            description="Choose when to send"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="space-y-4">
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="scheduleType"
                            value="immediate"
                            checked={formData.scheduleType === "immediate"}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduleType: e.target.value }))
                            }
                        />
                        Send immediately
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="scheduleType"
                            value="scheduled"
                            checked={formData.scheduleType === "scheduled"}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduleType: e.target.value }))
                            }
                        />
                        Schedule one-time
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="scheduleType"
                            value="recurring"
                            checked={formData.scheduleType === "recurring"}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduleType: e.target.value }))
                            }
                        />
                        Recurring
                    </label>
                </div>

                {formData.scheduleType === "scheduled" && (
                    <div className="flex gap-4">
                        <input
                            type="date"
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                            min={getMinDate()}
                            value={formData.scheduledDate}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduledDate: e.target.value }))
                            }
                        />
                        <input
                            type="time"
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                            value={formData.scheduledTime}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduledTime: e.target.value }))
                            }
                        />
                    </div>
                )}

                {formData.scheduleType === "recurring" && (
                    <div className="space-y-3">
                        <select
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                            value={formData.recurringFrequency}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, recurringFrequency: e.target.value }))
                            }
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>

                        {formData.recurringFrequency === "weekly" && (
                            <div className="flex gap-2 flex-wrap">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                                    <label key={d} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={formData.recurringDays.includes(d)}
                                            onChange={() => handleRecurringDaysChange(d)}
                                        />
                                        {d}
                                    </label>
                                ))}
                            </div>
                        )}

                        <input
                            type="time"
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                            value={formData.scheduledTime}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, scheduledTime: e.target.value }))
                            }
                        />

                        <input
                            type="date"
                            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                            min={getMinDate()}
                            value={formData.recurringEndDate}
                            onChange={(e) =>
                                setFormData((p) => ({ ...p, recurringEndDate: e.target.value }))
                            }
                        />
                    </div>
                )}

                <button
                    onClick={() => markComplete("schedule")}
                    disabled={
                        formData.scheduleType === "scheduled" &&
                        (!formData.scheduledDate || !formData.scheduledTime)
                    }
                    className="mt-2 px-4 py-2 bg-[#c2831f] hover:bg-[#d09025] text-white rounded-md"
                >
                    Save and Continue
                </button>
            </div>
        </StepSection>
    );
}

/* ================= Confirm Step ================= */
export function ConfirmStep({
    formData,
    sendStatus,
    expanded,
    toggleExpand,
    completedSteps,
}) {
    const spamTriggers = ["free", "winner", "buy now", "urgent"];
    const subjectLower = (formData.subject || "").toLowerCase();
    const foundTriggers = spamTriggers.filter((t) =>
        subjectLower.includes(t)
    );

    return (
        <StepSection
            id="confirm"
            title="Confirm"
            description="Review before sending"
            expanded={expanded}
            toggleExpand={toggleExpand}
            completedSteps={completedSteps}
        >
            <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-md">
                    <h3 className="font-medium text-white mb-2">Campaign Summary</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>
                            <strong>From:</strong> {formData.fromName} &lt;
                            {formData.fromEmail}&gt;
                        </li>
                        <li>
                            <strong>Subject:</strong> {formData.subject}
                        </li>
                        <li>
                            <strong>Template:</strong> {formData.template}
                        </li>
                        <li>
                            <strong>Schedule:</strong> {formData.scheduleType}
                        </li>
                    </ul>
                </div>

                {/* Deliverability Tips */}
                <div className="bg-gray-800 p-4 rounded-md">
                    <h3 className="font-medium text-white mb-2">Deliverability Tips</h3>
                    <ul className="text-sm text-gray-400 list-disc list-inside">
                        <li>Keep subject lines short &amp; clear.</li>
                        <li>Don’t use spammy words like “Free” or “Winner”.</li>
                        <li>Use verified sender addresses.</li>
                    </ul>
                </div>

                {/* Spam trigger warnings */}
                {foundTriggers.length > 0 && (
                    <div className="bg-red-900/40 p-4 rounded-md">
                        <h3 className="font-medium text-red-400 mb-2">⚠ Spam Triggers</h3>
                        <p className="text-sm text-red-300">
                            Your subject contains: {foundTriggers.join(", ")}
                        </p>
                    </div>
                )}

                {sendStatus && (
                    <div
                        className={`p-3 rounded-md text-sm ${sendStatus.success ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
                            }`}
                    >
                        {sendStatus.message}
                    </div>
                )}
            </div>
        </StepSection>
    );
}
