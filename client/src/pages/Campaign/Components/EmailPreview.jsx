// client/src/pages/Campaign/components/EmailPreview.jsx
import React from "react";

export default function EmailPreview({ pages, activePage, zoomLevel, formData }) {
    const currentPage = pages[activePage];
    if (!currentPage) return <div className="p-6 text-gray-400">No content to preview</div>;

    const renderElement = (el) => {
        const style = {
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            transform: `rotate(${el.rotation}deg)`,
            opacity: el.opacity,
            zIndex: el.zIndex,
            fontSize: el.fontSize,
            color: el.color,
            fontWeight: el.bold ? "bold" : "normal",
            fontStyle: el.italic ? "italic" : "normal",
            textDecoration: el.underline ? "underline" : "none",
            backgroundColor: el.backgroundColor || "transparent",
            borderRadius: el.borderRadius || 0,
            border: el.border || "none",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: el.align || "left",
            cursor: el.link ? "pointer" : "default",
        };

        switch (el.type) {
            case "text":
                return (
                    <div
                        key={el.id}
                        style={style}
                        dangerouslySetInnerHTML={{ __html: el.content }}
                    />
                );

            case "shape":
                return <div key={el.id} style={style} />;

            case "button":
                return (
                    <a
                        key={el.id}
                        href={el.link || "#"}
                        style={{
                            ...style,
                            display: "inline-flex",
                            backgroundColor: el.backgroundColor || "#c2831f",
                            color: el.color || "#fff",
                            padding: "8px 16px",
                            borderRadius: el.borderRadius || 6,
                            textDecoration: "none",
                            fontWeight: "bold",
                        }}
                    >
                        {el.label || "Button"}
                    </a>
                );

            case "image":
                return (
                    <img
                        key={el.id}
                        src={el.src}
                        alt={el.alt || ""}
                        style={{
                            ...style,
                            objectFit: el.objectFit || "cover",
                        }}
                    />
                );

            case "video":
                return (
                    <video
                        key={el.id}
                        controls
                        src={el.src}
                        style={{
                            ...style,
                            background: "#000",
                        }}
                    />
                );

            case "audio":
                return (
                    <audio
                        key={el.id}
                        controls
                        src={el.src}
                        style={{ ...style, width: el.width || "100%" }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div
            className="relative bg-white rounded-lg shadow-inner mx-auto"
            style={{
                width: `${600 * zoomLevel}px`,
                height: `${800 * zoomLevel}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                overflow: "hidden",
            }}
        >
            {currentPage.elements.map((el) => renderElement(el))}
        </div>
    );
}
