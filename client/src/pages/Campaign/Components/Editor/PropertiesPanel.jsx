import React from "react";
import {
  Type,
  Square,
  Circle,
  Image,
  Minus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
  Star,
  Triangle,
  Hexagon,
  ArrowRight,
  Video,
  Music,
  Frame,
  PenTool,
  Hash,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
  Move,
  ZoomIn,
  RotateCcw,
  Play,
  CreditCard
} from "lucide-react";
import { LuTableProperties } from "react-icons/lu";

const PropertiesPanel = ({
  elements,
  selectedElement,
  setSelectedElement,
  updateElement,
}) => {
  // Get selected element data
  const selectedElementData = elements.find((el) => el.id === selectedElement);

  // Color palettes
  const colorPalette = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#000000", "#FFFFFF", "#808080", "#FF0000", "#00FF00",
    "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500",
  ];

  const fonts = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
    "Courier New", "Impact", "Comic Sans MS", "Trebuchet MS", "Palatino",
  ];

  const iconOptions = [
    { value: "Star", label: "Star" },
    { value: "Heart", label: "Heart" },
    { value: "Check", label: "Check" },
    { value: "Arrow", label: "Arrow" },
    { value: "Home", label: "Home" },
    { value: "User", label: "User" },
    { value: "Settings", label: "Settings" },
    { value: "Mail", label: "Mail" }
  ];

  const socialIconOptions = [
    { value: "Facebook", label: "Facebook" },
    { value: "Twitter", label: "Twitter" },
    { value: "Instagram", label: "Instagram" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "YouTube", label: "YouTube" }
  ];

  const animations = [
    { value: "fade", label: "Fade In" },
    { value: "slide", label: "Slide In" },
    { value: "bounce", label: "Bounce" },
    { value: "zoom", label: "Zoom" },
    { value: "spin", label: "Spin" },
    { value: "pulse", label: "Pulse" }
  ];

  // Function to get the appropriate icon for an element type
  const getElementIcon = (elementType, size = 14) => {
    const iconProps = { size };

    switch (elementType) {
      case "heading": return <Type {...iconProps} className="text-blue-400" />;
      case "subheading": return <Type {...iconProps} className="text-purple-400" />;
      case "paragraph": return <Type {...iconProps} className="text-green-400" />;
      case "blockquote": return <FileText {...iconProps} className="text-yellow-400" />;
      case "button": return <Square {...iconProps} className="text-orange-400" />;
      case "card": return <CreditCard {...iconProps} className="text-indigo-400" />;
      case "rectangle": return <Square {...iconProps} className="text-purple-400" />;
      case "circle": return <Circle {...iconProps} className="text-pink-400" />;
      case "triangle": return <Triangle {...iconProps} className="text-green-400" />;
      case "star": return <Star {...iconProps} className="text-yellow-400" />;
      case "hexagon": return <Hexagon {...iconProps} className="text-blue-400" />;
      case "arrow": return <ArrowRight {...iconProps} className="text-red-400" />;
      case "line": return <Minus {...iconProps} className="text-yellow-400" />;
      case "image": return <Image {...iconProps} className="text-indigo-400" />;
      case "video": return <Video {...iconProps} className="text-red-400" />;
      case "audio": return <Music {...iconProps} className="text-green-400" />;
      case "frame": return <Frame {...iconProps} className="text-gray-400" />;
      case "input": return <PenTool {...iconProps} className="text-indigo-400" />;
      case "checkbox": return <Hash {...iconProps} className="text-teal-400" />;
      case "icon": return <Star {...iconProps} className="text-yellow-400" />;
      case "social": return <Star {...iconProps} className="text-blue-400" />;
      default: return <Square {...iconProps} className="text-gray-400" />;
    }
  };

  return (
    <div className="w-80 bg-black border-l border-[#c2831f] flex flex-col h-full text-white overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-[#c2831f]">
        <h2 className="text-2xl font-bold text-[#c2831f] py-5 mb-6 flex gap-2 items-center justify-center">

          <LuTableProperties />
          Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedElementData && (
          <div className="p-6">
            {/* Layer Management */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-white flex items-center">
                <Layers size={16} className="mr-2" />
                Layers ({elements.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedElement === element.id
                      ? "bg-blue-600 ring-2 ring-blue-400"
                      : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {getElementIcon(element.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {element.type.charAt(0).toUpperCase() + element.type.slice(1)} {index + 1}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-32">
                          {element.content ||
                            (element.type === "image" || element.type === "video" ? "Media" :
                              element.type === "icon" || element.type === "social" ? element.name || "Icon" :
                                element.type === "card" ? "Card" : "Empty")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-gray-800 rounded opacity-70 hover:opacity-100">
                        <Eye size={12} />
                      </button>
                      <button className="p-1 hover:bg-gray-800 rounded opacity-70 hover:opacity-100">
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {elements.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Layers size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No elements yet</p>
                    <p className="text-xs mt-1">Add elements using the toolbox</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h4 className="font-medium text-gray-300 mb-2">💡 Quick Tips</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Select an element to edit its properties</li>
                <li>• Use Ctrl+D to duplicate elements</li>
                <li>• Double-click text to edit content</li>
                <li>• Hold Shift while resizing to maintain aspect ratio</li>
              </ul>
            </div>
          </div>
        )}

        {selectedElementData && (
          <div className="p-4 space-y-6">
            {/* Element Info */}
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    {getElementIcon(selectedElementData.type, 16)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)}
                    </h3>
                    <p className="text-xs text-gray-400">Selected Element</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Link Properties */}
            {(selectedElementData.type === "button" ||
              selectedElementData.type === "icon" ||
              selectedElementData.type === "social") && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-300">Link</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">URL</label>
                      <input
                        type="text"
                        value={selectedElementData.link || ""}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            link: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Leave empty to disable link functionality
                    </div>
                  </div>
                </div>
              )}

            {/* Position & Size */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Position & Size</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.x || 0)}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        x: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.y || 0)}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        y: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.width || 0)}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        width: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(selectedElementData.height || 0)}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        height: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Text Properties */}
            {(selectedElementData.type === "heading" ||
              selectedElementData.type === "subheading" ||
              selectedElementData.type === "paragraph" ||
              selectedElementData.type === "blockquote" ||
              selectedElementData.type === "button" ||
              selectedElementData.type === "card") && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-300">Text</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Content</label>
                      <textarea
                        value={selectedElementData.content || ""}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter your text..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Font Family</label>
                        <select
                          value={selectedElementData.fontFamily || "Arial"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              fontFamily: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {fonts.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Font Size</label>
                        <input
                          type="number"
                          value={selectedElementData.fontSize || 16}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              fontSize: parseInt(e.target.value) || 12,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="8"
                          max="200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Text Style</label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              fontWeight:
                                selectedElementData.fontWeight === "bold"
                                  ? "normal"
                                  : "bold",
                            })
                          }
                          className={`p-2 rounded transition-colors ${selectedElementData.fontWeight === "bold"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            }`}
                          title="Bold"
                        >
                          <Bold size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              fontStyle:
                                selectedElementData.fontStyle === "italic"
                                  ? "normal"
                                  : "italic",
                            })
                          }
                          className={`p-2 rounded transition-colors ${selectedElementData.fontStyle === "italic"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            }`}
                          title="Italic"
                        >
                          <Italic size={16} />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textDecoration:
                                selectedElementData.textDecoration === "underline"
                                  ? "none"
                                  : "underline",
                            })
                          }
                          className={`p-2 rounded transition-colors ${selectedElementData.textDecoration === "underline"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            }`}
                          title="Underline"
                        >
                          <Underline size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Text Alignment</label>
                      <div className="flex space-x-2">
                        {["left", "center", "right"].map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              updateElement(selectedElementData.id, {
                                textAlign: align,
                              })
                            }
                            className={`p-2 rounded transition-colors ${selectedElementData.textAlign === align
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              }`}
                            title={align.charAt(0).toUpperCase() + align.slice(1)}
                          >
                            {align === "left" && <AlignLeft size={16} />}
                            {align === "center" && <AlignCenter size={16} />}
                            {align === "right" && <AlignRight size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Text Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.color || "#000000"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.color || "#000000"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              color: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Card Properties */}
            {selectedElementData.type === "card" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Card Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElementData.backgroundColor || "#FFFFFF"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            backgroundColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElementData.backgroundColor || "#FFFFFF"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            backgroundColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Border Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElementData.borderColor || "#E2E8F0"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            borderColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElementData.borderColor || "#E2E8F0"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            borderColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#E2E8F0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Border Width</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={selectedElementData.borderWidth || 1}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          borderWidth: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.borderWidth || 1}px
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={selectedElementData.borderRadius || 8}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          borderRadius: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.borderRadius || 8}px
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Padding</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={selectedElementData.padding || 16}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          padding: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.padding || 16}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shape Properties */}
            {(selectedElementData.type === "rectangle" ||
              selectedElementData.type === "circle" ||
              selectedElementData.type === "triangle" ||
              selectedElementData.type === "star" ||
              selectedElementData.type === "hexagon" ||
              selectedElementData.type === "arrow" ||
              selectedElementData.type === "button" ||
              selectedElementData.type === "frame") && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-300">Fill & Stroke</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Fill Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.backgroundColor || "#4ECDC4"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.backgroundColor || "#4ECDC4"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#4ECDC4"
                        />
                      </div>
                    </div>

                    {(selectedElementData.type === "rectangle" ||
                      selectedElementData.type === "circle" ||
                      selectedElementData.type === "button" ||
                      selectedElementData.type === "frame") && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Border Radius</label>
                            <input
                              type="range"
                              min="0"
                              max="150"
                              value={selectedElementData.borderRadius || 0}
                              onChange={(e) =>
                                updateElement(selectedElementData.id, {
                                  borderRadius: parseInt(e.target.value),
                                })
                              }
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-sm text-gray-400 text-center mt-1">
                              {selectedElementData.borderRadius || 0}px
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Border Color</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedElementData.borderColor || "#000000"}
                                onChange={(e) =>
                                  updateElement(selectedElementData.id, {
                                    borderColor: e.target.value,
                                  })
                                }
                                className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={selectedElementData.borderColor || "#000000"}
                                onChange={(e) =>
                                  updateElement(selectedElementData.id, {
                                    borderColor: e.target.value,
                                  })
                                }
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#000000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Border Width</label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={selectedElementData.borderWidth || 2}
                              onChange={(e) =>
                                updateElement(selectedElementData.id, {
                                  borderWidth: parseInt(e.target.value),
                                })
                              }
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-sm text-gray-400 text-center mt-1">
                              {selectedElementData.borderWidth || 2}px
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              )}

            {/* Line Properties */}
            {selectedElementData.type === "line" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Line Style</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElementData.strokeColor || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            strokeColor: e.target.value,
                          })
                        }
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElementData.strokeColor || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            strokeColor: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Thickness</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={selectedElementData.strokeWidth || 3}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          strokeWidth: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.strokeWidth || 3}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Properties */}
            {(selectedElementData.type === "image" ||
              selectedElementData.type === "video" ||
              selectedElementData.type === "audio") && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-300">Media Settings</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Source URL</label>
                      <input
                        type="text"
                        value={selectedElementData.src || ""}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            src: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter media URL..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedElementData.borderRadius || 0}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            borderRadius: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-sm text-gray-400 text-center mt-1">
                        {selectedElementData.borderRadius || 0}px
                      </div>
                    </div>

                    {(selectedElementData.type === "image" || selectedElementData.type === "video") && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Border Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={selectedElementData.borderColor || "#000000"}
                              onChange={(e) =>
                                updateElement(selectedElementData.id, {
                                  borderColor: e.target.value,
                                })
                              }
                              className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={selectedElementData.borderColor || "#000000"}
                              onChange={(e) =>
                                updateElement(selectedElementData.id, {
                                  borderColor: e.target.value,
                                })
                              }
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Border Width</label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={selectedElementData.borderWidth || 0}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                borderWidth: parseInt(e.target.value),
                              })
                            }
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="text-sm text-gray-400 text-center mt-1">
                            {selectedElementData.borderWidth || 0}px
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            {/* Interactive Elements Properties */}
            {(selectedElementData.type === "input" ||
              selectedElementData.type === "checkbox") && (
                <div>
                  <h4 className="font-medium mb-3 text-gray-300">Input Settings</h4>
                  <div className="space-y-3">
                    {selectedElementData.type === "input" && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={selectedElementData.placeholder || ""}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              placeholder: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter placeholder text..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.backgroundColor || "#FFFFFF"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.backgroundColor || "#FFFFFF"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Border Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedElementData.borderColor || "#CBD5E0"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              borderColor: e.target.value,
                            })
                          }
                          className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElementData.borderColor || "#CBD5E0"}
                          onChange={(e) =>
                            updateElement(selectedElementData.id, {
                              borderColor: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="#CBD5E0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Border Radius</label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={selectedElementData.borderRadius || 4}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            borderRadius: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-sm text-gray-400 text-center mt-1">
                        {selectedElementData.borderRadius || 4}px
                      </div>
                    </div>

                    {selectedElementData.type === "checkbox" && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Check Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedElementData.color || "#4299E1"}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                color: e.target.value,
                              })
                            }
                            className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedElementData.color || "#4299E1"}
                            onChange={(e) =>
                              updateElement(selectedElementData.id, {
                                color: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="#4299E1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Icon Properties */}
            {selectedElementData.type === "icon" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Icon Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Icon Type</label>
                    <select
                      value={selectedElementData.name || "Star"}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Icon Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElementData.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            color: e.target.value,
                          })
                        }
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElementData.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            color: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Icon Size</label>
                    <input
                      type="range"
                      min="8"
                      max="100"
                      value={selectedElementData.fontSize || 24}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.fontSize || 24}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Icon Properties */}
            {selectedElementData.type === "social" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Social Icon Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Icon Type</label>
                    <select
                      value={selectedElementData.name || "Facebook"}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {socialIconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Icon Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElementData.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            color: e.target.value,
                          })
                        }
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElementData.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            color: e.target.value,
                          })
                        }
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Icon Size</label>
                    <input
                      type="range"
                      min="8"
                      max="100"
                      value={selectedElementData.fontSize || 24}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-400 text-center mt-1">
                      {selectedElementData.fontSize || 24}px
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Animation Properties */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Animation</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Animation Type</label>
                  <select
                    value={selectedElementData.animation || "none"}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        animation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    {animations.map((anim) => (
                      <option key={anim.value} value={anim.value}>
                        {anim.label}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedElementData.animation && selectedElementData.animation !== "none" && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Duration (s)</label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={selectedElementData.animationDuration || 1}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            animationDuration: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-sm text-gray-400 text-center mt-1">
                        {selectedElementData.animationDuration || 1}s
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Delay (s)</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={selectedElementData.animationDelay || 0}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            animationDelay: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-sm text-gray-400 text-center mt-1">
                        {selectedElementData.animationDelay || 0}s
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Transform Properties */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Transform</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElementData.rotation || 0}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        rotation: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">
                    {selectedElementData.rotation || 0}°
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedElementData.opacity || 1}
                    onChange={(e) =>
                      updateElement(selectedElementData.id, {
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">
                    {Math.round((selectedElementData.opacity || 1) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Color Palette */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Quick Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-lg border-2 border-gray-600 hover:border-white transition-all hover:scale-110 transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      if (
                        selectedElementData.type === "heading" ||
                        selectedElementData.type === "subheading" ||
                        selectedElementData.type === "paragraph" ||
                        selectedElementData.type === "blockquote" ||
                        selectedElementData.type === "button" ||
                        selectedElementData.type === "card"
                      ) {
                        updateElement(selectedElementData.id, { color });
                      } else if (
                        selectedElementData.type === "rectangle" ||
                        selectedElementData.type === "circle" ||
                        selectedElementData.type === "triangle" ||
                        selectedElementData.type === "star" ||
                        selectedElementData.type === "hexagon" ||
                        selectedElementData.type === "arrow" ||
                        selectedElementData.type === "frame" ||
                        selectedElementData.type === "input"
                      ) {
                        updateElement(selectedElementData.id, {
                          backgroundColor: color,
                        });
                      } else if (selectedElementData.type === "line") {
                        updateElement(selectedElementData.id, {
                          strokeColor: color,
                        });
                      } else if (selectedElementData.type === "checkbox" ||
                        selectedElementData.type === "icon" ||
                        selectedElementData.type === "social") {
                        updateElement(selectedElementData.id, {
                          color: color,
                        });
                      }
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;