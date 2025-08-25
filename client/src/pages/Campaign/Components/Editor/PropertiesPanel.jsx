// src/components/Editor/PropertiesPanel.jsx
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
} from "lucide-react";

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
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#000000",
    "#FFFFFF",
    "#808080",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
  ];

  const fonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Palatino",
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-blue-400">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedElementData && (
          <div className="p-6">
            {/* Layer Management */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-300 flex items-center">
                <Layers size={16} className="mr-2" />
                Layers ({elements.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {elements.map((element, index) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      selectedElement === element.id
                        ? "bg-blue-600 ring-2 ring-blue-400"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {element.type === "heading" && (
                          <Type size={14} className="text-blue-400" />
                        )}
                        {element.type === "paragraph" && (
                          <Type size={12} className="text-green-400" />
                        )}
                        {element.type === "button" && (
                          <Square size={12} className="text-orange-400" />
                        )}
                        {element.type === "rectangle" && (
                          <Square size={14} className="text-purple-400" />
                        )}
                        {element.type === "circle" && (
                          <Circle size={14} className="text-pink-400" />
                        )}
                        {element.type === "line" && (
                          <Minus size={14} className="text-yellow-400" />
                        )}
                        {element.type === "image" && (
                          <Image size={14} className="text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {element.type.charAt(0).toUpperCase() +
                            element.type.slice(1)}{" "}
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-32">
                          {element.content || element.type === "image"
                            ? "Image"
                            : "Empty"}
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
                    <p className="text-xs mt-1">
                      Add elements using the toolbox
                    </p>
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
                    {selectedElementData.type === "heading" && (
                      <Type size={16} className="text-blue-400" />
                    )}
                    {selectedElementData.type === "paragraph" && (
                      <Type size={14} className="text-green-400" />
                    )}
                    {selectedElementData.type === "button" && (
                      <Square size={14} className="text-orange-400" />
                    )}
                    {selectedElementData.type === "rectangle" && (
                      <Square size={16} className="text-purple-400" />
                    )}
                    {selectedElementData.type === "circle" && (
                      <Circle size={16} className="text-pink-400" />
                    )}
                    {selectedElementData.type === "line" && (
                      <Minus size={16} className="text-yellow-400" />
                    )}
                    {selectedElementData.type === "image" && (
                      <Image size={16} className="text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedElementData.type.charAt(0).toUpperCase() +
                        selectedElementData.type.slice(1)}
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

            {/* Position & Size */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">
                Position & Size
              </h4>
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
                  <label className="block text-sm text-gray-400 mb-1">
                    Width
                  </label>
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
                  <label className="block text-sm text-gray-400 mb-1">
                    Height
                  </label>
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
              selectedElementData.type === "paragraph" ||
              selectedElementData.type === "button") && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Text</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Content
                    </label>
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
                      <label className="block text-sm text-gray-400 mb-1">
                        Font Family
                      </label>
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
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Font Size
                      </label>
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
                    <label className="block text-sm text-gray-400 mb-2">
                      Text Style
                    </label>
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
                        className={`p-2 rounded transition-colors ${
                          selectedElementData.fontWeight === "bold"
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
                        className={`p-2 rounded transition-colors ${
                          selectedElementData.fontStyle === "italic"
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
                        className={`p-2 rounded transition-colors ${
                          selectedElementData.textDecoration === "underline"
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
                    <label className="block text-sm text-gray-400 mb-2">
                      Text Alignment
                    </label>
                    <div className="flex space-x-2">
                      {["left", "center", "right"].map((align) => (
                        <button
                          key={align}
                          onClick={() =>
                            updateElement(selectedElementData.id, {
                              textAlign: align,
                            })
                          }
                          className={`p-2 rounded transition-colors ${
                            selectedElementData.textAlign === align
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
                    <label className="block text-sm text-gray-400 mb-2">
                      Text Color
                    </label>
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

            {/* Shape Properties */}
            {(selectedElementData.type === "rectangle" ||
              selectedElementData.type === "circle" ||
              selectedElementData.type === "button") && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">
                  Fill & Stroke
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Fill Color
                    </label>
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

                  <label className="block text-sm text-gray-400 mb-1">
                      Border Radius
                    </label>
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

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Border Color
                    </label>
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
                    <label className="block text-sm text-gray-400 mb-1">
                      Border Width
                    </label>
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

                  {selectedElementData.type === "rectangle" && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Border Radius
                      </label>
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
                  )}
                </div>
              </div>
            )}

            {/* Background Color */}

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Background Color
              </label>

              {/* Swatches + Transparent */}
              <div className="grid grid-cols-6 gap-2 mb-3">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedElementData.backgroundColor === color
                        ? "border-white"
                        : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      updateElement(selectedElementData.id, {
                        backgroundColor: color,
                      })
                    }
                    title={color}
                  />
                ))}

                {/* Transparent swatch */}
                <button
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[17px] font-bold transition-all hover:scale-110 ${
                    selectedElementData.backgroundColor === "transparent"
                      ? "border-white bg-gray-800"
                      : "border-gray-600 bg-gray-800"
                  }`}
                  onClick={() =>
                    updateElement(selectedElementData.id, {
                      backgroundColor: "transparent",
                    })
                  }
                  title="Transparent"
                >
                  ⌀
                </button>
              </div>

              {/* Hex / Custom Picker */}
              <div className="flex gap-2">
                <input
                  type="color"
                  value={
                    selectedElementData.backgroundColor === "transparent"
                      ? "#000000"
                      : selectedElementData.backgroundColor || "#FFFFFF"
                  }
                  onChange={(e) =>
                    updateElement(selectedElementData.id, {
                      backgroundColor: e.target.value,
                    })
                  }
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElementData.backgroundColor || "transparent"}
                  onChange={(e) =>
                    updateElement(selectedElementData.id, {
                      backgroundColor: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#FFFFFF or transparent"
                />
              </div>
            </div>

            {/* Line Properties */}
            {selectedElementData.type === "line" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">Line Style</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Color
                    </label>
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
                    <label className="block text-sm text-gray-400 mb-1">
                      Thickness
                    </label>
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

            {/* Image Properties */}
            {selectedElementData.type === "image" && (
              <div>
                <h4 className="font-medium mb-3 text-gray-300">
                  Image Settings
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={selectedElementData.src || ""}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          src: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Border Radius
                    </label>
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
                </div>
              </div>
            )}

            {/* Transform Properties */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Transform</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Rotation
                  </label>
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
                  <label className="block text-sm text-gray-400 mb-1">
                    Opacity
                  </label>
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
                        selectedElementData.type === "paragraph"
                      ) {
                        updateElement(selectedElementData.id, { color });
                      } else if (
                        selectedElementData.type === "rectangle" ||
                        selectedElementData.type === "circle" ||
                        selectedElementData.type === "button"
                      ) {
                        updateElement(selectedElementData.id, {
                          backgroundColor: color,
                        });
                      } else if (selectedElementData.type === "line") {
                        updateElement(selectedElementData.id, {
                          strokeColor: color,
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
