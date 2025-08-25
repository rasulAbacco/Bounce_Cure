// src/components/Editor/Toolbox.jsx
import React, { useState } from "react";
import { 
  Type, Image, Square, Circle, Minus, Upload, 
  RotateCcw, RotateCw, Copy, Trash2, ZoomIn, ZoomOut,
  Grid, MousePointer, Move, Palette, Shapes, Plus,
  FileImage, Camera, Link
} from 'lucide-react';

const Toolbox = ({ 
  onAddElement, 
  onUploadImage, 
  onSelectStockImage,
  onUpdateElementStyle, // 🔹 New prop for updating element colors
  selectedElement,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  canUndo,
  canRedo,
  zoomLevel,
  setZoomLevel,
  showGrid,
  setShowGrid
}) => {
  const [activeTab, setActiveTab] = useState('elements');
  const [imageUrl, setImageUrl] = useState('');

  const stockImages = [
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?w=300&h=200&fit=crop", 
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop"
  ];

  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#000000', '#FFFFFF', '#808080', '#FF0000', '#00FF00',
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  const gradients = [
    'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #fa709a, #fee140)'
  ];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUploadImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onSelectStockImage(imageUrl);
      setImageUrl('');
    }
  };

  // 🔹 Handle stock image selection - create new image element
  const handleStockImageSelect = (imageSrc) => {
    onAddElement("image", { src: imageSrc });
  };

  // 🔹 Handle color selection - apply to selected element or create colored rectangle
  const handleColorSelect = (color) => {
    if (selectedElement) {
      // Apply color to selected element
      const styleUpdates = {};
      
      switch (selectedElement.type) {
        case 'rectangle':
        case 'circle':
          styleUpdates.backgroundColor = color;
          break;
        case 'heading':
        case 'paragraph':
        case 'button':
          styleUpdates.color = color;
          break;
        case 'line':
          styleUpdates.stroke = color;
          break;
        default:
          styleUpdates.color = color;
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      // Create new colored rectangle if no element is selected
      onAddElement("rectangle", { 
        style: { backgroundColor: color }
      });
    }
  };

  // 🔹 Handle gradient selection
  const handleGradientSelect = (gradient) => {
    if (selectedElement) {
      const styleUpdates = {};
      
      if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle') {
        styleUpdates.background = gradient;
        styleUpdates.backgroundColor = 'transparent'; // Clear solid color
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      // Create new gradient rectangle
      onAddElement("rectangle", { 
        style: { background: gradient }
      });
    }
  };

  // 🔹 Handle custom color input
  const handleCustomColor = (e) => {
    handleColorSelect(e.target.value);
  };

  const tabs = [
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'images', label: 'Images', icon: FileImage },
    { id: 'colors', label: 'Colors', icon: Palette }
  ];

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <Palette size={20} />
          Design Tools
        </h2>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Undo"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Redo"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={onDuplicate}
            disabled={!selectedElement}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={!selectedElement}
            className="p-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">Zoom</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.1))}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-mono min-w-12 text-center text-gray-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* Grid Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
            showGrid ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <span className="text-sm">Show Grid</span>
          <Grid size={16} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Text Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddElement("heading")}
                  className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Type size={20} className="text-blue-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Heading</span>
                </button>
                <button
                  onClick={() => onAddElement("paragraph")}
                  className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Type size={16} className="text-green-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Paragraph</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Shapes</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddElement("rectangle")}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Square size={20} className="text-purple-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Rectangle</span>
                </button>
                <button
                  onClick={() => onAddElement("circle")}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Circle size={20} className="text-pink-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Circle</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Interactive</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAddElement("button")}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Square size={16} className="text-orange-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Button</span>
                </button>
                <button
                  onClick={() => onAddElement("line")}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                >
                  <Minus size={20} className="text-yellow-400" />
                  <span className="text-xs text-gray-300 group-hover:text-white">Line</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Upload Image</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg cursor-pointer transition-colors group">
                  <Upload size={20} className="text-gray-400 group-hover:text-gray-300" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300">Choose file</span>
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    <Link size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Stock Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {stockImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Stock ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all"
                      onClick={() => handleStockImageSelect(img)}
                    />
                    <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Plus size={16} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-300">
                {selectedElement 
                  ? `Applying colors to selected ${selectedElement.type}`
                  : "Select an element or click a color to create a new rectangle"
                }
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Color Palette</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    className="w-10 h-10 rounded-lg border-2 border-gray-600 hover:border-white transition-colors hover:scale-110 transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Gradients</h3>
              <div className="grid grid-cols-2 gap-2">
                {gradients.map((gradient, index) => (
                  <button
                    key={index}
                    className="h-10 rounded-lg border-2 border-gray-600 hover:border-white transition-colors hover:scale-105 transform"
                    style={{ background: gradient }}
                    onClick={() => handleGradientSelect(gradient)}
                    title="Apply gradient"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Custom Color</h3>
              <input
                type="color"
                className="w-full h-12 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                onChange={handleCustomColor}
                title="Choose custom color"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Elements: {selectedElement ? '1 selected' : 'None selected'}</span>
          <span>Ready to design</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbox;