// src/components/Editor/Toolbox.jsx
import React, { useState } from "react";
import { 
  Type, Image, Square, Circle, Minus, Upload, 
  RotateCcw, RotateCw, Copy, Trash2, ZoomIn, ZoomOut,
  Grid, MousePointer, Move, Palette, Shapes, Plus,
  FileImage, Camera, Link, Zap, Layers, ChevronDown,
  ChevronUp, Star, Triangle, Hexagon, ArrowRight, 
  PenTool, Frame, Video, Music, FileText, Hash,
  // Import the correct icons
  Heart, Home, User, Settings, Mail, Check
} from 'lucide-react';

const Toolbox = ({ 
  onAddElement, 
  onUploadImage, 
  onSelectStockImage,
  onUpdateElementStyle,
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
  const [expandedSections, setExpandedSections] = useState({
    text: true,
    shapes: true,
    interactive: true,
    media: true,
    advanced: false
  });
  
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
  
  const patterns = [
    'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
    'radial-gradient(circle, #333 10%, transparent 10%), radial-gradient(circle, #333 10%, transparent 10%)',
    'linear-gradient(90deg, #333 2px, transparent 2px), linear-gradient(#333 2px, transparent 2px)'
  ];
  
  const animations = [
    { id: 'fade', name: 'Fade In', icon: Zap },
    { id: 'slide', name: 'Slide In', icon: Move },
    { id: 'bounce', name: 'Bounce', icon: ChevronDown },
    { id: 'zoom', name: 'Zoom', icon: ZoomIn },
    { id: 'spin', name: 'Spin', icon: RotateCcw },
    { id: 'pulse', name: 'Pulse', icon: ChevronUp }
  ];
  
  // Fixed icons array with correct Lucide components
  const icons = [
    { name: 'Star', icon: Star },
    { name: 'Heart', icon: Heart },
    { name: 'Check', icon: Check },
    { name: 'Arrow', icon: ArrowRight },
    { name: 'Home', icon: Home },
    { name: 'User', icon: User },
    { name: 'Settings', icon: Settings },
    { name: 'Mail', icon: Mail }
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

  const handleStockImageSelect = (imageSrc) => {
    onAddElement("image", { src: imageSrc });
  };

  const handleColorSelect = (color) => {
    if (selectedElement) {
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
      onAddElement("rectangle", { 
        style: { backgroundColor: color }
      });
    }
  };

  const handleGradientSelect = (gradient) => {
    if (selectedElement) {
      const styleUpdates = {};
      
      if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle') {
        styleUpdates.background = gradient;
        styleUpdates.backgroundColor = 'black';
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      onAddElement("rectangle", { 
        style: { background: gradient }
      });
    }
  };

  const handlePatternSelect = (pattern) => {
    if (selectedElement) {
      const styleUpdates = {};
      
      if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle') {
        styleUpdates.background = pattern;
        styleUpdates.backgroundColor = 'transparent';
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      onAddElement("rectangle", { 
        style: { background: pattern }
      });
    }
  };

  const handleCustomColor = (e) => {
    handleColorSelect(e.target.value);
  };

  const handleAddIcon = (iconName) => {
  console.log("Adding icon:", iconName); // Debug log
  
  onAddElement("icon", { 
    name: iconName, // Ensure the name is set here
    color: '#000000',
    fontSize: 24
  });
};

  const handleAnimationSelect = (animationId) => {
    if (selectedElement) {
      onUpdateElementStyle(selectedElement.id, { 
        animation: animationId 
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const tabs = [
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'images', label: 'Images', icon: FileImage },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'animations', label: 'Animations', icon: Zap },
    { id: 'layers', label: 'Layers', icon: Layers }
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
            {/* Text Elements */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('text')}
              >
                <h3 className="text-sm font-medium text-gray-300">Text Elements</h3>
                {expandedSections.text ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.text && (
                <div className="grid grid-cols-2 gap-2 mt-3">
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
                  <button
                    onClick={() => onAddElement("subheading")}
                    className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Type size={18} className="text-purple-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Subheading</span>
                  </button>
                  <button
                    onClick={() => onAddElement("blockquote")}
                    className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <FileText size={16} className="text-yellow-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Quote</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Shapes */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('shapes')}
              >
                <h3 className="text-sm font-medium text-gray-300">Shapes</h3>
                {expandedSections.shapes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.shapes && (
                <div className="grid grid-cols-3 gap-2 mt-3">
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
                  <button
                    onClick={() => onAddElement("triangle")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Triangle size={20} className="text-green-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Triangle</span>
                  </button>
                  <button
                    onClick={() => onAddElement("star")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Star size={20} className="text-yellow-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Star</span>
                  </button>
                  <button
                    onClick={() => onAddElement("hexagon")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Hexagon size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Hexagon</span>
                  </button>
                  <button
                    onClick={() => onAddElement("arrow")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <ArrowRight size={20} className="text-red-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Arrow</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Interactive Elements */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('interactive')}
              >
                <h3 className="text-sm font-medium text-gray-300">Interactive</h3>
                {expandedSections.interactive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.interactive && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => onAddElement("button")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Square size={16} className="text-orange-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Button</span>
                  </button>
                  <button
                    onClick={() => onAddElement("input")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <PenTool size={16} className="text-indigo-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Input</span>
                  </button>
                  <button
                    onClick={() => onAddElement("checkbox")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Hash size={16} className="text-teal-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Checkbox</span>
                  </button>
                  <button
                    onClick={() => onAddElement("line")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Minus size={20} className="text-yellow-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Line</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Media Elements */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('media')}
              >
                <h3 className="text-sm font-medium text-gray-300">Media</h3>
                {expandedSections.media ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.media && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => onAddElement("image")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Image size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Image</span>
                  </button>
                  <button
                    onClick={() => onAddElement("video")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Video size={20} className="text-red-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Video</span>
                  </button>
                  <button
                    onClick={() => onAddElement("audio")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Music size={20} className="text-green-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Audio</span>
                  </button>
                  <button
                    onClick={() => onAddElement("frame")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <Frame size={20} className="text-purple-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Frame</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Icons */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Icons</h3>
              <div className="grid grid-cols-4 gap-2">
                {icons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddIcon(icon.name)}
                    className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                  >
                    <icon.icon size={18} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">{icon.name}</span>
                  </button>
                ))}
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
            
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Image Effects</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded"></div>
                    <span className="text-xs text-gray-300">Grayscale</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded"></div>
                    <span className="text-xs text-gray-300">Sepia</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded"></div>
                    <span className="text-xs text-gray-300">Blur</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-600 rounded"></div>
                    <span className="text-xs text-gray-300">Sharpen</span>
                  </div>
                </button>
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
              <h3 className="text-sm font-medium text-gray-300 mb-3">Patterns</h3>
              <div className="grid grid-cols-2 gap-2">
                {patterns.map((pattern, index) => (
                  <button
                    key={index}
                    className="h-10 rounded-lg border-2 border-gray-600 hover:border-white transition-colors hover:scale-105 transform"
                    style={{ background: pattern }}
                    onClick={() => handlePatternSelect(pattern)}
                    title="Apply pattern"
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
        
        {/* Animations Tab */}
        {activeTab === 'animations' && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-300">
                {selectedElement 
                  ? `Applying animations to selected ${selectedElement.type}`
                  : "Select an element to apply animations"
                }
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Animations</h3>
              <div className="grid grid-cols-2 gap-2">
                {animations.map((animation) => (
                  <button
                    key={animation.id}
                    onClick={() => handleAnimationSelect(animation.id)}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex flex-col items-center gap-2"
                  >
                    <animation.icon size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300">{animation.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Animation Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration</label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    defaultValue="1"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">1.0s</div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Delay</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    defaultValue="0"
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">0.0s</div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Easing</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Linear</option>
                    <option>Ease In</option>
                    <option>Ease Out</option>
                    <option>Ease In Out</option>
                    <option>Bounce</option>
                    <option>Elastic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Layers Tab */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">Layers</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">Reset Order</button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* This would be populated with actual layers from the parent component */}
              <div className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span className="text-sm">Rectangle 1</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Move size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Circle 1</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Move size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type size={16} className="text-purple-400" />
                  <span className="text-sm">Heading 1</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Move size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image size={16} className="text-yellow-400" />
                  <span className="text-sm">Image 1</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Eye size={14} />
                  </button>
                  <button className="p-1 hover:bg-gray-600 rounded">
                    <Move size={14} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Layer Management</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">Bring Forward</button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">Send Backward</button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">Bring to Front</button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">Send to Back</button>
              </div>
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