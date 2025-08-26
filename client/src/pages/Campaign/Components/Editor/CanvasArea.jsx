// src/components/Editor/CanvasArea.jsx
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { Send } from 'lucide-react';

import {
  Eye, X, Plus, Download, Play, Layers,
  Type, Square, Circle, Minus, Image, Video, Music,
  Frame, Star, Triangle, Hexagon, ArrowRight,
  PenTool, Hash, FileText, ChevronDown, ChevronUp,
  Zap, Move, ZoomIn, RotateCcw,
  // Import all the icons we need for the icon elements
  Heart, Home, User, Settings, Mail, Check
} from "lucide-react";

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
  showGrid = true
}) {
  const [preview, setPreview] = useState(false);
  const canvasRef = useRef(null);

  const addPage = () => {
    const newPage = { id: pages.length + 1, elements: [] };
    setPages([...pages, newPage]);
    setActivePage(pages.length);
  };

  const deletePage = (pageIndex) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      setPages(updatedPages);
      if (activePage >= updatedPages.length) {
        setActivePage(updatedPages.length - 1);
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
    onUpdate(updatedElements);
  };

  // Fixed and more robust icon rendering function
  const renderIcon = (element) => {
    // Debug: log the icon element
    console.log("Rendering icon element:", element);

    // Get the icon name from the element
    const iconName = element.name || element.iconName || 'Star';
    const color = element.color || element.style?.color || '#000000';
    const size = Math.min(element.width, element.height) * zoomLevel || 24 * zoomLevel;

    console.log("Icon details:", { iconName, color, size });

    // Create icon mapping with all possible variations
    const iconMap = {
      'star': Star,
      'heart': Heart,
      'check': Check,
      'arrow': ArrowRight,
      'home': Home,
      'user': User,
      'settings': Settings,
      'mail': Mail,
      // Add capitalized versions
      'Star': Star,
      'Heart': Heart,
      'Check': Check,
      'Arrow': ArrowRight,
      'Home': Home,
      'User': User,
      'Settings': Settings,
      'Mail': Mail
    };

    // Get the icon component
    const IconComponent = iconMap[iconName];

    if (IconComponent) {
      console.log("Found icon component for:", iconName);
      return <IconComponent color={color} size={size} />;
    } else {
      console.log("No icon component found for:", iconName);
      // Fallback with the icon name for debugging
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

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;

    return (
      <Rnd
        key={element.id}
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
            opacity: element.opacity || 1
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
            >
              {element.content || "Click Me"}
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

          {/* Icon Element - Fixed */}
          {element.type === "icon" && (
            <div className="w-full h-full flex items-center justify-center">
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

  return (
    <div className="flex-1 bg-gray-700 flex flex-col overflow-hidden">

      {/* Top Controls */}
      <div className="h-16 bg-gray-800 border-b border-gray-600 flex items-center justify-between px-6">
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
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <Plus size={16} />
            Add Page
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Layers size={16} />
            <span>{pages[activePage].elements.length} elements</span>
          </div>

          <div className="w-px h-6 bg-gray-600"></div>

          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Play size={16} />
            Animate
          </button>

          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preview
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
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            onClick={() => window.location.href = '/send-campaign'}  // Change to your target URL
          >
            <Send size={16} />
            Send
          </button>

        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-700 p-8" onClick={handleCanvasClick}>
        <div className="flex justify-center">
          <div
            ref={canvasRef}
            className={`canvas-background relative bg-white shadow-2xl rounded-lg overflow-hidden ${preview ? '' : 'ring-1 ring-gray-400/20'
              }`}
            style={{
              width: 800 * zoomLevel,
              height: 600 * zoomLevel,
              backgroundImage: showGrid && !preview ? `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: showGrid && !preview ? `${20 * zoomLevel}px ${20 * zoomLevel}px` : 'none'
            }}
          >
            {/* Edit Mode */}
            {!preview && pages[activePage].elements.map(element => renderElement(element))}

            {/* Preview Mode */}
            {preview && (
              <div className="p-8 h-full overflow-y-auto">
                {pages[activePage].elements.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-xl">This page is empty</p>
                      <p className="text-sm mt-2">Add some elements to see them here</p>
                    </div>
                  </div>
                )}

                {pages[activePage].elements
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map(element => (
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
                              fontSize: element.fontSize || 16,
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

                      {element.type === "button" && (
                        <button
                          className="font-medium cursor-pointer"
                          style={{
                            backgroundColor: element.backgroundColor || "#007bff",
                            color: element.color || "#fff",
                            padding: "12px 24px",
                            borderRadius: element.borderRadius || 6,
                            fontSize: element.fontSize || 16,
                            fontFamily: element.fontFamily || 'Arial',
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                        >
                          {element.content || "Click Me"}
                        </button>
                      )}

                      {element.type === "rectangle" && (
                        <div
                          style={{
                            width: element.width || 100,
                            height: element.height || 100,
                            backgroundColor: element.backgroundColor || "#4ECDC4",
                            border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`,
                            borderRadius: element.borderRadius || 4
                          }}
                        />
                      )}

                      {element.type === "circle" && (
                        <div
                          className="rounded-full"
                          style={{
                            width: element.width || 100,
                            height: element.height || 100,
                            backgroundColor: element.backgroundColor || "#FF6B6B",
                            border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`
                          }}
                        />
                      )}

                      {element.type === "triangle" && (
                        <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${element.width || 50}px solid transparent`,
                            borderRight: `${element.width || 50}px solid transparent`,
                            borderBottom: `${element.height || 86}px solid ${element.backgroundColor || "#FF9F43"}`,
                            backgroundColor: 'transparent'
                          }}
                        />
                      )}

                      {element.type === "star" && (
                        <div className="flex items-center justify-center">
                          <Star
                            size={Math.min(element.width, element.height) || 24}
                            color={element.color || '#FFD93D'}
                            fill={element.backgroundColor || '#FFD93D'}
                          />
                        </div>
                      )}

                      {element.type === "hexagon" && (
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: element.width || 100,
                            height: element.height || 100,
                            backgroundColor: element.backgroundColor || "#6C5CE7",
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                          }}
                        />
                      )}

                      {element.type === "arrow" && (
                        <div className="flex items-center justify-center">
                          <ArrowRight
                            size={Math.min(element.width, element.height) || 24}
                            color={element.color || '#00CEC9'}
                          />
                        </div>
                      )}

                      {element.type === "line" && (
                        <div
                          style={{
                            width: element.width || 150,
                            height: element.strokeWidth || 3,
                            backgroundColor: element.strokeColor || '#000000'
                          }}
                        />
                      )}

                      {element.type === "image" && (
                        <img
                          src={element.src}
                          alt="Preview element"
                          style={{
                            maxWidth: element.width || 200,
                            maxHeight: element.height || 150,
                            borderRadius: element.borderRadius || 0,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                          className="object-cover"
                        />
                      )}

                      {element.type === "video" && (
                        <video
                          controls
                          className="max-w-full max-h-60 object-cover"
                          style={{
                            borderRadius: element.borderRadius || 0,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                        >
                          <source src={element.src || ""} type="video/mp4" />
                        </video>
                      )}

                      {element.type === "audio" && (
                        <div
                          className="bg-gray-100 p-4 rounded"
                          style={{
                            borderRadius: element.borderRadius || 0,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                        >
                          <audio controls className="w-full">
                            <source src={element.src || ""} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}

                      {element.type === "frame" && (
                        <div
                          className="border-2 border-dashed p-4 flex items-center justify-center"
                          style={{
                            borderColor: element.borderColor || '#A0AEC0',
                            borderRadius: element.borderRadius || 8,
                            backgroundColor: element.backgroundColor || 'transparent',
                            width: element.width || 200,
                            height: element.height || 150
                          }}
                        >
                          <span className="text-gray-400">Frame Content</span>
                        </div>
                      )}

                      {element.type === "input" && (
                        <input
                          type="text"
                          placeholder={element.placeholder || "Enter text..."}
                          className="px-3 py-2 border rounded"
                          style={{
                            borderColor: element.borderColor || '#CBD5E0',
                            borderRadius: element.borderRadius || 4,
                            fontSize: element.fontSize || 14,
                            backgroundColor: element.backgroundColor || '#FFFFFF'
                          }}
                        />
                      )}

                      {element.type === "checkbox" && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-6 h-6"
                            style={{
                              accentColor: element.color || '#4299E1'
                            }}
                          />
                          <span className="ml-2">Checkbox Option</span>
                        </div>
                      )}

                      {element.type === "icon" && (
                        <div className="flex items-center justify-center">
                          {renderIcon(element)}
                        </div>
                      )}
                    </div>
                  ))}
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