import React, { useState, useRef, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { Send, Save, Trash2 } from 'lucide-react';
import {
  Eye, X, Plus, Download, Play, Layers,
  Type, Square, Circle, Minus, Image, Video, Music,
  Frame, Star, Triangle, Hexagon, ArrowRight,
  PenTool, Hash, FileText, ChevronDown, ChevronUp,
  Zap, Move, ZoomIn, RotateCcw,
  Heart, Home, User, Settings, Mail, Check,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  CreditCard
} from 'lucide-react';

export default function CanvasArea({
  pages,
  setPages,
  activePage,
  setActivePage,
  onUpdate,
  selectedElement,
  setSelectedElement,
  updateElement,
  zoomLevel = 1,
  setZoomLevel,
  showGrid = true,
  canvasBackgroundColor = '#FFFFFF',
  onSendCampaign
}) {
  const [preview, setPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'saving', 'error'
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('canvasData');
    if (savedData) {
      try {
        const { pages: savedPages, activePage: savedActivePage, canvasBackgroundColor: savedBg } = JSON.parse(savedData);
        setPages(savedPages);
        setActivePage(savedActivePage);
        // Note: canvasBackgroundColor is a prop, so we can't set it directly here
        // You might need to lift this state up or handle it differently
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [setPages, setActivePage]);

  // Add animation styles
  useEffect(() => {
    if (document.getElementById('animation-styles')) return;
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
      @keyframes fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slide {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes zoom {
        from { transform: scale(0); }
        to { transform: scale(1); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .animate-fade {
        animation: fade 1s ease both;
      }
      .animate-slide {
        animation: slide 1s ease both;
      }
      .animate-bounce {
        animation: bounce 1s ease both;
      }
      .animate-zoom {
        animation: zoom 1s ease both;
      }
      .animate-spin {
        animation: spin 1s linear both;
      }
      .animate-pulse {
        animation: pulse 1s ease both;
      }
      
      /* Custom scrollbar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 5px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    `;
    document.head.appendChild(style);
  }, []);

  const addPage = () => {
    const newPage = { id: pages.length + 1, elements: [] };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    setActivePage(pages.length);
    // Auto-save when adding a page
    saveToLocalStorage(updatedPages, pages.length, canvasBackgroundColor);
  };

  const deletePage = (pageIndex) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      setPages(updatedPages);
      if (activePage >= updatedPages.length) {
        const newActivePage = updatedPages.length - 1;
        setActivePage(newActivePage);
        saveToLocalStorage(updatedPages, newActivePage, canvasBackgroundColor);
      } else {
        saveToLocalStorage(updatedPages, activePage, canvasBackgroundColor);
      }
    }
  };

  const handleElementClick = (elementId, e) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
      setSelectedElement(null);
    }
  };

  const handleElementUpdate = (elementId, newProps) => {
    updateElement(elementId, newProps);
    const updatedElements = pages[activePage].elements.map(el =>
      el.id === elementId ? { ...el, ...newProps } : el
    );
    const updatedPages = [...pages];
    updatedPages[activePage] = { ...updatedPages[activePage], elements: updatedElements };
    setPages(updatedPages);
    onUpdate(updatedElements);
    // Auto-save when element is updated
    saveToLocalStorage(updatedPages, activePage, canvasBackgroundColor);
  };

  // Save data to localStorage
  const saveToLocalStorage = useCallback((pagesToSave, activePageToSave, bgColor) => {
    const dataToSave = {
      pages: pagesToSave,
      activePage: activePageToSave,
      canvasBackgroundColor: bgColor
    };
    localStorage.setItem('canvasData', JSON.stringify(dataToSave));
  }, []);

  // Clear canvas and localStorage
  const handleClear = useCallback(() => {
    // Reset to initial state with one empty page
    const initialPages = [{ id: 1, elements: [] }];
    setPages(initialPages);
    setActivePage(0);

    // Clear localStorage
    localStorage.removeItem('canvasData');

    // Update save status
    setSaveStatus('');

    console.log('Canvas cleared and saved data removed');
  }, [setPages, setActivePage]);

  // Fixed save functionality
  const handleSave = useCallback(() => {
    setSaveStatus('saving');

    // Save to localStorage
    saveToLocalStorage(pages, activePage, canvasBackgroundColor);

    // Simulate API call to save data
    setTimeout(() => {
      setSaveStatus('saved');
      console.log('Save completed successfully');
    }, 1000);
  }, [pages, activePage, canvasBackgroundColor, saveToLocalStorage]);

  // Fixed and more robust icon rendering function
  const renderIcon = (element) => {
    const iconName = element.name || element.iconName || 'Star';
    const color = element.color || element.style?.color || '#000000';
    const size = Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel;
    
    const iconMap = {
      'star': Star,
      'heart': Heart,
      'check': Check,
      'arrow': ArrowRight,
      'home': Home,
      'user': User,
      'settings': Settings,
      'mail': Mail,
      'facebook': Facebook,
      'twitter': Twitter,
      'instagram': Instagram,
      'linkedin': Linkedin,
      'youtube': Youtube,
      'Star': Star,
      'Heart': Heart,
      'Check': Check,
      'Arrow': ArrowRight,
      'Home': Home,
      'User': User,
      'Settings': Settings,
      'Mail': Mail,
      'Facebook': Facebook,
      'Twitter': Twitter,
      'Instagram': Instagram,
      'LinkedIn': Linkedin,
      'YouTube': Youtube
    };

    // Get the icon component

    const IconComponent = iconMap[iconName.toLowerCase()];
    if (IconComponent) {
      return <IconComponent color={color} size={size} />;
    } else {
      return (
        <div
          style={{
            color,
            fontSize: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            fontWeight: 'bold'
          }}
        >
          {iconName.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  // Helper function to get animation style
  const getAnimationStyle = (element) => {
    if (!element.animation || element.animation === 'none') {
      return {};
    }
    const duration = (element.animationDuration || 1) + 's';
    const delay = (element.animationDelay || 0) + 's';
    const timing = element.animationTiming || 'ease';
    return {
      animation: `${element.animation} ${duration} ${delay} ${timing} both`
    };
  };

  // Handle link click
  const handleLinkClick = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    return (
      <Rnd
        key={`${element.id}-${zoomLevel}`} // Added zoomLevel to key to force re-render on zoom change
        default={{
          x: element.x || 50,
          y: element.y || 50,
          width: element.width || "auto",
          height: element.height || "auto",
        }}
        position={{ x: element.x * zoomLevel, y: element.y * zoomLevel }}
        size={{
          width: element.width * zoomLevel,
          height: element.height * zoomLevel
        }}
        bounds="parent"
        onDragStop={(e, d) => {
          handleElementUpdate(element.id, {
            x: d.x / zoomLevel,
            y: d.y / zoomLevel
          });
        }}
        onResizeStop={(e, dir, ref, delta, pos) => {
          handleElementUpdate(element.id, {
            width: parseInt(ref.style.width) / zoomLevel,
            height: parseInt(ref.style.height) / zoomLevel,
            x: pos.x / zoomLevel,
            y: pos.y / zoomLevel,
          });
        }}
        className={`${isSelected ? 'z-50' : 'z-10'}`}
      >
        <div
          className={`w-full h-full cursor-pointer border-2 transition-all ${isSelected
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
            : 'border-transparent hover:border-blue-300/50'
            }`}
          style={{
            transform: `rotate(${element.rotation || 0}deg)`,
            opacity: element.opacity || 1,
            ...getAnimationStyle(element)   // ✅ Apply animation here too
          }}
          onClick={(e) => handleElementClick(element.id, e)}
        >

          {/* Text Elements */}
          {(element.type === "heading" || element.type === "paragraph" ||
            element.type === "subheading" || element.type === "blockquote") && (
              <div
                contentEditable={isSelected}
                suppressContentEditableWarning
                className={`w-full h-full p-2 outline-none ${element.type === "heading" ? "font-bold" :
                  element.type === "subheading" ? "font-semibold" :
                    element.type === "blockquote" ? "italic pl-4 border-l-4 border-gray-300" : ""
                  }`}
                style={{
                  fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                  fontFamily: element.fontFamily || 'Arial',
                  color: element.color || '#000000',
                  fontWeight: element.fontWeight || 'normal',
                  fontStyle: element.fontStyle || 'normal',
                  textDecoration: element.textDecoration || 'none',
                  textAlign: element.textAlign || 'left',
                  lineHeight: '1.4',
                  wordWrap: 'break-word',
                  backgroundColor: element.backgroundColor || 'transparent'
                }}
                onInput={(e) => handleElementUpdate(element.id, { content: e.currentTarget.textContent })}
                onBlur={() => setSelectedElement(null)}
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
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning
              className="w-full h-full flex items-center justify-center outline-none cursor-pointer"
              style={{
                backgroundColor: element.backgroundColor || "#007bff",
                color: element.color || "#fff",
                borderRadius: `${(element.borderRadius || 6) * zoomLevel}px`,
                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                fontFamily: element.fontFamily || 'Arial',
                fontWeight: element.fontWeight || 'normal',
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
              }}
              onInput={(e) => handleElementUpdate(element.id, { content: e.currentTarget.textContent })}
              onBlur={() => setSelectedElement(null)}
              onClick={() => handleLinkClick(element.link)}
            >
              {element.content || "Click Me"}
            </div>
          )}
          {/* Card Element */}
          {element.type === "card" && (
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning
              className="w-full h-full outline-none overflow-hidden"
              style={{
                backgroundColor: element.backgroundColor || "#FFFFFF",
                borderColor: element.borderColor || "#E2E8F0",
                borderWidth: `${(element.borderWidth || 1) * zoomLevel}px`,
                borderRadius: `${(element.borderRadius || 8) * zoomLevel}px`,
                padding: `${(element.padding || 16) * zoomLevel}px`,
                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                fontFamily: element.fontFamily || 'Arial',
                color: element.color || '#000000',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'left',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                backgroundImage: element.backgroundImage || 'none',
                boxShadow: element.boxShadow || 'none'
              }}
              onInput={(e) => handleElementUpdate(element.id, { content: e.currentTarget.textContent })}
              onBlur={() => setSelectedElement(null)}
            >
              {element.content || "Card content goes here"}
            </div>
          )}
          {/* Shape Elements */}
          {element.type === "rectangle" && (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: element.backgroundColor || "#4ECDC4",
                border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`,
                borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`
              }}
            />
          )}
          {element.type === "circle" && (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: element.backgroundColor || "#FF6B6B",
                border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`
              }}
            />
          )}
          {element.type === "triangle" && (
            <div
              className="w-full h-full"
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
          {element.type === "star" && (
            <div className="w-full h-full flex items-center justify-center">
              <Star
                size={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                color={element.color || '#FFD93D'}
                fill={element.backgroundColor || '#FFD93D'}
                style={{ transform: `rotate(${element.rotation || 0}deg)` }}
              />
            </div>
          )}
          {element.type === "hexagon" && (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: element.backgroundColor || "#6C5CE7",
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            />
          )}
          {element.type === "arrow" && (
            <div className="w-full h-full flex items-center justify-center">
              <ArrowRight
                size={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
                color={element.color || '#00CEC9'}
                style={{ transform: `rotate(${element.rotation || 0}deg)` }}
              />
            </div>
          )}
          {/* Line Element */}
          {element.type === "line" && (
            <div
              className="w-full"
              style={{
                height: `${(element.strokeWidth || 3) * zoomLevel}px`,
                backgroundColor: element.strokeColor || '#000000',
                marginTop: `${((element.height * zoomLevel) - (element.strokeWidth || 3) * zoomLevel) / 2}px`
              }}
            />
          )}
          {/* Image Element */}
          {element.type === "image" && (
            <img
              src={element.src}
              alt="Canvas element"
              className="w-full h-full object-cover"
              style={{
                borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
              }}
            />
          )}
          {/* Video Element */}
          {element.type === "video" && (
            <video
              controls
              className="w-full h-full object-cover"
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
              className="w-full h-full flex items-center justify-center bg-gray-100"
              style={{
                borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
              }}
            >
              <audio controls className="w-full">
                <source src={element.src || ""} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {/* Frame Element */}
          {element.type === "frame" && (
            <div
              className="w-full h-full border-2 border-dashed flex items-center justify-center"
              style={{
                borderColor: element.borderColor || '#A0AEC0',
                borderRadius: `${(element.borderRadius || 8) * zoomLevel}px`,
                backgroundColor: element.backgroundColor || 'transparent'
              }}
            >
              <span className="text-gray-400 text-sm">Frame</span>
            </div>
          )}
          {/* Interactive Elements */}
          {element.type === "input" && (
            <input
              type="text"
              placeholder={element.placeholder || "Enter text..."}
              className="w-full h-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: element.borderColor || '#CBD5E0',
                borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`,
                fontSize: `${(element.fontSize || 14) * zoomLevel}px`,
                backgroundColor: element.backgroundColor || '#FFFFFF'
              }}
              readOnly={!isSelected}
            />
          )}
          {element.type === "checkbox" && (
            <div className="w-full h-full flex items-center justify-center">
              <input
                type="checkbox"
                className="w-6 h-6"
                style={{
                  transform: `scale(${zoomLevel})`,
                  accentColor: element.color || '#4299E1'
                }}
                disabled={!isSelected}
              />
            </div>
          )}
          {/* Icon Element */}
          {element.type === "icon" && (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={() => handleLinkClick(element.link)}
            >
              {renderIcon(element)}
            </div>
          )}
          {/* Social Icon Element */}
          {element.type === "social" && (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={() => handleLinkClick(element.link)}
            >
              {renderIcon(element)}
            </div>
          )}
          {/* Selection Handles */}
          {isSelected && !preview && (
            <>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize shadow-lg"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize shadow-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize shadow-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-lg"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-n-resize shadow-lg"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-s-resize shadow-lg"></div>
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-w-resize shadow-lg"></div>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-e-resize shadow-lg"></div>
            </>
          )}
        </div>
      </Rnd>
    );
  };

  // New function to render preview elements with absolute positioning
  const renderPreviewElement = (element) => {
    const animationStyle = preview ? getAnimationStyle(element) : {};

    return (
      <div
        key={element.id}
        className="absolute"
        style={{
          left: element.x * zoomLevel,
          top: element.y * zoomLevel,
          width: element.width * zoomLevel,
          height: element.height * zoomLevel,
          transform: `rotate(${element.rotation || 0}deg)`,
          opacity: element.opacity || 1,
          zIndex: element.zIndex || 0,
          ...animationStyle
        }}
      >
        {/* Text Elements */}
        {(element.type === "heading" || element.type === "paragraph" ||
          element.type === "subheading" || element.type === "blockquote") && (
            <div
              className={`w-full h-full p-2 ${element.type === "heading" ? "font-bold" :
                element.type === "subheading" ? "font-semibold" :
                  element.type === "blockquote" ? "italic pl-4 border-l-4 border-gray-300" : ""
                }`}
              style={{
                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                fontFamily: element.fontFamily || 'Arial',
                color: element.color || '#000000',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'left',
                lineHeight: '1.4',
                wordWrap: 'break-word',
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
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: element.backgroundColor || "#007bff",
              color: element.color || "#fff",
              borderRadius: `${(element.borderRadius || 6) * zoomLevel}px`,
              fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
              fontFamily: element.fontFamily || 'Arial',
              fontWeight: element.fontWeight || 'normal',
              border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
            }}
            onClick={() => handleLinkClick(element.link)}
          >
            {element.content || "Click Me"}
          </div>
        )}
        {/* Card Element */}
        {element.type === "card" && (
          <div
            className="w-full h-full overflow-hidden"
            style={{
              backgroundColor: element.backgroundColor || "#FFFFFF",
              borderColor: element.borderColor || "#E2E8F0",
              borderWidth: `${(element.borderWidth || 1) * zoomLevel}px`,
              borderRadius: `${(element.borderRadius || 8) * zoomLevel}px`,
              padding: `${(element.padding || 16) * zoomLevel}px`,
              fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
              fontFamily: element.fontFamily || 'Arial',
              color: element.color || '#000000',
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              textAlign: element.textAlign || 'left',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              backgroundImage: element.backgroundImage || 'none',
              boxShadow: element.boxShadow || 'none'
            }}
          >
            {element.content || "Card content goes here"}
          </div>
        )}
        {/* Shape Elements */}
        {element.type === "rectangle" && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.backgroundColor || "#4ECDC4",
              border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`,
              borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`
            }}
          />
        )}
        {element.type === "circle" && (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: element.backgroundColor || "#FF6B6B",
              border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`
            }}
          />
        )}
        {element.type === "triangle" && (
          <div
            className="w-full h-full"
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
        {element.type === "star" && (
          <div className="w-full h-full flex items-center justify-center">
            <Star
              size={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
              color={element.color || '#FFD93D'}
              fill={element.backgroundColor || '#FFD93D'}
            />
          </div>
        )}
        {element.type === "hexagon" && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: element.backgroundColor || "#6C5CE7",
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
          />
        )}
        {element.type === "arrow" && (
          <div className="w-full h-full flex items-center justify-center">
            <ArrowRight
              size={Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel}
              color={element.color || '#00CEC9'}
            />
          </div>
        )}
        {/* Line Element */}
        {element.type === "line" && (
          <div
            className="w-full"
            style={{
              height: `${(element.strokeWidth || 3) * zoomLevel}px`,
              backgroundColor: element.strokeColor || '#000000',
              marginTop: `${((element.height * zoomLevel) - (element.strokeWidth || 3) * zoomLevel) / 2}px`
            }}
          />
        )}
        {/* Image Element */}
        {element.type === "image" && (
          <img
            src={element.src}
            alt="Preview element"
            className="w-full h-full object-cover"
            style={{
              borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
              border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
            }}
          />
        )}
        {/* Video Element */}
        {element.type === "video" && (
          <video
            controls
            className="w-full h-full object-cover"
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
            className="w-full h-full flex items-center justify-center bg-gray-100"
            style={{
              borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
              border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
            }}
          >
            <audio controls className="w-full">
              <source src={element.src || ""} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        {/* Frame Element */}
        {element.type === "frame" && (
          <div
            className="w-full h-full border-2 border-dashed flex items-center justify-center"
            style={{
              borderColor: element.borderColor || '#A0AEC0',
              borderRadius: `${(element.borderRadius || 8) * zoomLevel}px`,
              backgroundColor: element.backgroundColor || 'transparent'
            }}
          >
            <span className="text-gray-400 text-sm">Frame</span>
          </div>
        )}
        {/* Interactive Elements */}
        {element.type === "input" && (
          <input
            type="text"
            placeholder={element.placeholder || "Enter text..."}
            className="w-full h-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              borderColor: element.borderColor || '#CBD5E0',
              borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`,
              fontSize: `${(element.fontSize || 14) * zoomLevel}px`,
              backgroundColor: element.backgroundColor || '#FFFFFF'
            }}
          />
        )}
        {element.type === "checkbox" && (
          <div className="w-full h-full flex items-center justify-center">
            <input
              type="checkbox"
              className="w-6 h-6"
              style={{
                transform: `scale(${zoomLevel})`,
                accentColor: element.color || '#4299E1'
              }}
            />
          </div>
        )}
        {/* Icon Element */}
        {element.type === "icon" && (
          <div
            className="w-full h-full flex items-center justify-center"
            onClick={() => handleLinkClick(element.link)}
          >
            {renderIcon(element)}
          </div>
        )}
        {/* Social Icon Element */}
        {element.type === "social" && (
          <div
            className="w-full h-full flex items-center justify-center"
            onClick={() => handleLinkClick(element.link)}
          >
            {renderIcon(element)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-700 flex flex-col overflow-hidden">

      {/* Top Controls */}
      <div className="h-16 bg-gray-800 border-b border-gray-600 flex items-center justify-between px-6 flex-shrink-0">
        {/* Page Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            {pages.map((page, idx) => (
              <div key={page.id} className="flex items-center">
                <button
                  onClick={() => setActivePage(idx)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${idx === activePage
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                >
                  Page {page.id}
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(idx);
                    }}
                    className="ml-1 p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addPage}
            className="relative group flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <Plus size={16} />
            Add Page

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              Add a New Page
            </span>
          </button>

        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <div className="flex items-center text-yellow-400">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping mr-1"></div>
                Saving...
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                Saved
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-red-400">
                <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                Save failed
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Layers size={16} />
            <span>{pages[activePage].elements.length} elements</span>
          </div>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="relative group flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              Clear
            </span>
          </button>


          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors group ${saveStatus === "saving"
              ? "bg-yellow-600 text-white cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            <Save size={16} />

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              Save
            </span>
          </button>


          <button
            className="relative group flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={16} />

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              Play
            </span>
          </button>


          <button
            onClick={() => setPreview(!preview)}
            className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preview
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {preview ? (
              <>
                <X size={16} />
                Exit Preview
              </>
            ) : (
              <>
                <Eye size={16} />
                Preview
              </>
            )}

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              {preview ? "Exit Preview" : "Preview"}
            </span>
          </button>

          <button
            onClick={onSendCampaign}
            className="relative group flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Send size={16} />
            Send

            {/* Tooltip */}
            <span
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
               opacity-0 group-hover:opacity-100 transition
               bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap"
            >
              Send Campaign
            </span>
          </button>

        </div>
      </div>
      
      {/* Canvas Container */}
      
      <div className="flex-1 overflow-auto bg-gray-700 p-8" onClick={handleCanvasClick}>
        <div className="flex justify-center items-center min-w-full min-h-full">
          <div
            ref={canvasRef}
            className={`canvas-background relative shadow-2xl rounded-lg overflow-hidden ${preview ? '' : 'ring-1 ring-gray-400/20'
              }`}
            style={{
              width: 800 * zoomLevel,
              height: 600 * zoomLevel,
              backgroundColor: canvasBackgroundColor,
              backgroundImage: showGrid && !preview ? `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: showGrid && !preview ? `${20 * zoomLevel}px ${20 * zoomLevel}px` : 'none',
              boxSizing: 'border-box',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {/* Edit Mode */}
            {!preview && pages[activePage].elements.map(element => renderElement(element))}

            {/* Preview Mode */}
            {preview && (
              <div className="relative w-full h-full">
                {pages[activePage].elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-xl">This page is empty</p>
                      <p className="text-sm mt-2">Add some elements to see them here</p>
                    </div>
                  </div>
                )}
                {pages[activePage].elements
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map(element => renderPreviewElement(element))}
              </div>
            )}

            {/* Empty State */}
            {!preview && pages[activePage].elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-xl font-medium">Start Creating</p>
                  <p className="text-sm mt-2">Use the toolbox to add elements to your design</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}