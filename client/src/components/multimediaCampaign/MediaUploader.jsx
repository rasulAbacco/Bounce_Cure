import React, { useState } from "react";

export default function MediaUploader({ mediaUrl, onChange }) {
    const [preview, setPreview] = useState(mediaUrl);
    const [uploading, setUploading] = useState(false);
    const [manualUrl, setManualUrl] = useState("");
    const [mode, setMode] = useState("upload");

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Cloudinary config missing in .env");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (data.secure_url) {
                onChange(data.secure_url);
                setPreview(data.secure_url);
            } else {
                alert(`Upload failed: ${data.error?.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Failed to upload media. Check your Cloudinary setup.");
        } finally {
            setUploading(false);
        }
    };

    const handleLinkSubmit = () => {
        if (!manualUrl.trim()) {
            alert("Please enter a valid image or video link");
            return;
        }
        onChange(manualUrl.trim());
        setPreview(manualUrl.trim());
    };

    const handleClear = () => {
        onChange(null);
        setPreview(null);
        setManualUrl("");
    };

    const renderPreview = () => {
        if (!preview) return null;
        const isVideo = preview.match(/\.(mp4|mov|avi|webm|mkv)$/i);
        return (
            <div className="mt-4 relative group/preview animate-fadeIn">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-2xl blur-xl"></div>
                {isVideo ? (
                    <video src={preview} controls className="relative rounded-2xl max-h-52 w-auto border border-amber-500/30" />
                ) : (
                    <img src={preview} alt="preview" className="relative rounded-2xl max-h-52 w-auto border border-amber-500/30" />
                )}
                <button
                    onClick={handleClear}
                    className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition-all duration-300 opacity-0 group-hover/preview:opacity-100"
                >
                    ✕ Remove
                </button>
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black p-5 rounded-xl border border-amber-500/20">
            <label className="font-semibold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                Media (optional)
            </label>

            <div className="flex gap-2 mt-4">
                <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === "upload"
                            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-lg shadow-amber-500/50"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                >
                    📤 Upload
                </button>
                <button
                    type="button"
                    onClick={() => setMode("link")}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === "link"
                            ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-lg shadow-amber-500/50"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                >
                    🔗 Paste Link
                </button>
            </div>

            {mode === "upload" && (
                <div className="mt-4">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-600 file:cursor-pointer transition-all duration-300"
                        onChange={handleFile}
                        disabled={uploading}
                    />
                    {uploading && (
                        <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm">
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                        </div>
                    )}
                </div>
            )}

            {mode === "link" && (
                <div className="mt-4 space-y-3">
                    <input
                        type="text"
                        placeholder="https://example.com/media.jpg"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        className="w-full p-3 border rounded-lg bg-black border-amber-500/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300"
                    />
                    <button
                        type="button"
                        onClick={handleLinkSubmit}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-black rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-300"
                    >
                        Add Media Link
                    </button>
                </div>
            )}

            {renderPreview()}
        </div>
    );
}