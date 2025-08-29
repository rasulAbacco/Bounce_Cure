import React from 'react';

const EmailHTMLGenerator = ({ elements, canvasBackgroundColor, formData }) => {
  const renderElementToHTML = (element) => {
    const commonStyles = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation || 0}deg)`,
      opacity: element.opacity || 1,
      zIndex: element.zIndex || 0,
      boxSizing: 'border-box',
    };

    const commonTextStyles = {
      fontFamily: element.fontFamily || 'Arial, sans-serif',
      fontSize: `${element.fontSize || 16}px`,
      color: element.color || '#000000',
      fontWeight: element.fontWeight || 'normal',
      fontStyle: element.fontStyle || 'normal',
      textDecoration: element.textDecoration || 'none',
      textAlign: element.textAlign || 'left',
      lineHeight: '1.4',
      wordWrap: 'break-word',
    };

    switch (element.type) {
      case "heading":
      case "subheading":
      case "paragraph":
      case "blockquote":
        const headingStyles = {
          ...commonStyles,
          ...commonTextStyles,
          backgroundColor: element.backgroundColor || 'transparent',
          padding: '8px',
          ...(element.type === "heading" && { fontWeight: 'bold' }),
          ...(element.type === "subheading" && { fontWeight: '600' }),
          ...(element.type === "blockquote" && { 
            fontStyle: 'italic',
            paddingLeft: '16px',
            borderLeft: '4px solid #ccc'
          }),
        };
        return `<div style="${styleToString(headingStyles)}">${element.content || (
          element.type === "heading" ? "Heading" :
          element.type === "subheading" ? "Subheading" :
          element.type === "blockquote" ? "Blockquote" : "Paragraph text"
        )}</div>`;

      case "button":
        const buttonStyles = {
          ...commonStyles,
          backgroundColor: element.backgroundColor || "#007bff",
          color: element.color || "#fff",
          borderRadius: `${element.borderRadius || 6}px`,
          fontSize: `${element.fontSize || 16}px`,
          fontFamily: element.fontFamily || 'Arial, sans-serif',
          fontWeight: element.fontWeight || 'normal',
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          padding: '12px 24px',
          boxSizing: 'border-box',
          cursor: 'pointer',
        };
        return `<a href="${element.link || '#'}" target="_blank" style="${styleToString(buttonStyles)}">${element.content || "Click Me"}</a>`;

      case "card":
        const cardStyles = {
          ...commonStyles,
          backgroundColor: element.backgroundColor || "#FFFFFF",
          borderColor: element.borderColor || "#E2E8F0",
          borderWidth: `${element.borderWidth || 1}px`,
          borderStyle: 'solid',
          borderRadius: `${element.borderRadius || 8}px`,
          padding: `${element.padding || 16}px`,
          fontSize: `${element.fontSize || 16}px`,
          fontFamily: element.fontFamily || 'Arial, sans-serif',
          color: element.color || '#000000',
          fontWeight: element.fontWeight || 'normal',
          fontStyle: element.fontStyle || 'normal',
          textDecoration: element.textDecoration || 'none',
          textAlign: element.textAlign || 'left',
          lineHeight: '1.4',
          wordWrap: 'break-word',
          backgroundImage: element.backgroundImage || 'none',
          boxShadow: element.boxShadow || 'none',
          boxSizing: 'border-box',
        };
        return `<div style="${styleToString(cardStyles)}">${element.content || "Card content goes here"}</div>`;

      case "rectangle":
        const rectStyles = {
          ...commonStyles,
          backgroundColor: element.backgroundColor || "#4ECDC4",
          border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`,
          borderRadius: `${element.borderRadius || 4}px`,
        };
        return `<div style="${styleToString(rectStyles)}"></div>`;

      case "circle":
        const circleStyles = {
          ...commonStyles,
          backgroundColor: element.backgroundColor || "#FF6B6B",
          border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`,
          borderRadius: '50%',
        };
        return `<div style="${styleToString(circleStyles)}"></div>`;

      case "triangle":
        return `<div style="${styleToString({
          ...commonStyles,
          width: 0,
          height: 0,
          borderLeft: `${element.width || 50}px solid transparent`,
          borderRight: `${element.width || 50}px solid transparent`,
          borderBottom: `${element.height || 86}px solid ${element.backgroundColor || "#FF9F43"}`,
          backgroundColor: 'transparent',
        })}"></div>`;

      case "line":
        return `<div style="${styleToString({
          ...commonStyles,
          height: `${element.strokeWidth || 3}px`,
          backgroundColor: element.strokeColor || '#000000',
          marginTop: `${(element.height - (element.strokeWidth || 3)) / 2}px`,
        })}"></div>`;

      case "image":
        return `<img src="${element.src}" alt="Email image" style="${styleToString({
          ...commonStyles,
          objectFit: 'cover',
          borderRadius: `${element.borderRadius || 0}px`,
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
        })}" />`;

      case "video":
        return `<video controls style="${styleToString({
          ...commonStyles,
          objectFit: 'cover',
          borderRadius: `${element.borderRadius || 0}px`,
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
        })}"><source src="${element.src || ''}" type="video/mp4">Your browser does not support the video tag.</video>`;

      case "audio":
        return `<div style="${styleToString({
          ...commonStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          borderRadius: `${element.borderRadius || 0}px`,
          border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
        })}"><audio controls style="width: 80%"><source src="${element.src || ''}" type="audio/mpeg">Your browser does not support the audio element.</audio></div>`;

      case "input":
        return `<input type="text" placeholder="${element.placeholder || 'Enter text...'}" style="${styleToString({
          ...commonStyles,
          padding: '8px',
          borderColor: element.borderColor || '#CBD5E0',
          borderRadius: `${element.borderRadius || 4}px`,
          fontSize: `${element.fontSize || 14}px`,
          backgroundColor: element.backgroundColor || '#FFFFFF',
        })}" readonly />`;

      case "checkbox":
        return `<div style="${styleToString({
          ...commonStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}"><input type="checkbox" style="transform: scale(1); accent-color: ${element.color || '#4299E1'}" disabled /></div>`;

      case "icon":
      case "social":
        return `<div style="${styleToString({
          ...commonStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}"><div style="color: ${element.color || '#000000'}; font-size: ${Math.min(element.width, element.height) || 24}px; font-weight: bold;">${element.name ? element.name.charAt(0).toUpperCase() : '★'}</div></div>`;

      default:
        return `<div style="${styleToString(commonStyles)}">Unknown element type: ${element.type}</div>`;
    }
  };

  const styleToString = (style) => {
    return Object.entries(style)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  };

  const generateEmailHTML = () => {
    const elementsHTML = elements
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(element => renderElementToHTML(element))
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formData?.subject || "Email Subject"}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: ${canvasBackgroundColor || '#FFFFFF'};
          }
          .email-container {
            position: relative;
            width: 800px;
            height: 600px;
            margin: 0 auto;
            background-color: ${canvasBackgroundColor || '#FFFFFF'};
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${elementsHTML}
        </div>
      </body>
      </html>
    `;
  };

  return generateEmailHTML();
};

export default EmailHTMLGenerator;