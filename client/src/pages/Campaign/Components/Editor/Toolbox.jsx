import React, { useState } from "react";
import { 
  Type, Image, Square, Circle, Minus, Upload, 
  RotateCcw, RotateCw, Copy, Trash2, ZoomIn, ZoomOut,
  Grid, MousePointer, Move, Palette, Shapes, Plus,
  FileImage, Camera, Link, Zap, Layers, ChevronDown,
  ChevronUp, Star, Triangle, Hexagon, ArrowRight, 
  PenTool, Frame, Video, Music, FileText, Hash,
  Heart, Home, User, Settings, Mail, Check,
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  CreditCard
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
  setShowGrid,
  canvasBackgroundColor,
  setCanvasBackgroundColor,
  onAddLayout
}) => {
  const [activeTab, setActiveTab] = useState('elements');
  const [imageUrl, setImageUrl] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    text: true,
    shapes: true,
    interactive: true,
    media: true,
    social: true,
    advanced: false,
    cards: true
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
    '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
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
  
  const socialIcons = [
    { name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ];
  
  const cardStyles = [
    {
      id: 'card-basic',
      name: 'Basic Card',
      description: 'Simple card with border',
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16
      }
    },
    {
      id: 'card-shadow',
      name: 'Shadow Card',
      description: 'Card with shadow effect',
      style: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E2E8F0',
        borderWidth: 0,
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    },
    {
      id: 'card-colored',
      name: 'Colored Card',
      description: 'Card with colored background',
      style: {
        backgroundColor: '#EBF8FF',
        borderColor: '#90CDF4',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16
      }
    },
    {
      id: 'card-gradient',
      name: 'Gradient Card',
      description: 'Card with gradient background',
      style: {
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: '#90CDF4',
        borderWidth: 0,
        borderRadius: 8,
        padding: 16,
        color: '#0000'
      }
    },
    {
      id: 'card-pattern',
      name: 'Pattern Card',
      description: 'Card with pattern background',
      style: {
        backgroundColor: '#F7FAFC',
        borderColor: '#CBD5E0',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        backgroundImage: 'repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)'
      }
    }
  ];
  
  const prebuiltLayouts = [
    {
      id: 1,
      name: "Header + Content",
      description: "Simple header with content section",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='40' fill='%234ECDC4'/%3E%3Crect y='50' width='200' height='100' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 2,
      name: "Two Columns",
      description: "Two column layout",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='95' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='105' width='95' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 3,
      name: "Three Columns",
      description: "Three column layout",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='65' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='68' width='64' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='135' width='65' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 4,
      name: "Header + Two Columns",
      description: "Header with two columns below",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='40' fill='%234ECDC4'/%3E%3Crect y='50' width='95' height='100' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='105' y='50' width='95' height='100' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 5,
      name: "Sidebar + Content",
      description: "Left sidebar with main content",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='60' height='150' fill='%23e9ecef' stroke='%23dee2e6'/%3E%3Crect x='65' width='135' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 6,
      name: "Hero Section",
      description: "Full width hero section",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='80' fill='%23FF6B6B'/%3E%3Crect y='90' width='200' height='60' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 7,
      name: "Card Layout",
      description: "Grid of cards",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='90' height='65' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='110' width='90' height='65' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect y='75' width='90' height='65' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='110' y='75' width='90' height='65' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 8,
      name: "Newsletter",
      description: "Newsletter signup layout",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='200' height='60' fill='%2345B7D1'/%3E%3Crect y='70' width='200' height='40' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect y='120' width='200' height='30' fill='%2328a745'/%3E%3C/svg%3E"
    },
    {
      id: 9,
      name: "Product Showcase",
      description: "Product showcase with image and details",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Crect width='100' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3Crect x='110' width='90' height='150' fill='%23f8f9fa' stroke='%23dee2e6'/%3E%3C/svg%3E"
    },
    {
      id: 10,
      name: "Testimonial",
      description: "Customer testimonial layout",
      thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 150'%3E%3Ccircle cx='100' cy='40' r='20' fill='%23dee2e6'/%3E%3Crect x='50' y='70' width='100' height='10' fill='%23dee2e6'/%3E%3Crect x='30' y='90' width='140' height='10' fill='%23dee2e6'/%3E%3Crect x='40' y='110' width='120' height='10' fill='%23dee2e6'/%3E%3C/svg%3E"
    }
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
        case 'card':
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
      onAddElement("card", { 
        style: { backgroundColor: color }
      });
    }
  };
  
  const handleGradientSelect = (gradient) => {
    if (selectedElement) {
      const styleUpdates = {};
      
      if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'card') {
        styleUpdates.background = gradient;
        styleUpdates.backgroundColor = 'black';
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      onAddElement("card", { 
        style: { background: gradient }
      });
    }
  };
  
  const handlePatternSelect = (pattern) => {
    if (selectedElement) {
      const styleUpdates = {};
      
      if (selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'card') {
        styleUpdates.background = pattern;
        styleUpdates.backgroundColor = 'transparent';
      }
      
      onUpdateElementStyle(selectedElement.id, styleUpdates);
    } else {
      onAddElement("card", { 
        style: { background: pattern }
      });
    }
  };
  
  const handleCustomColor = (e) => {
    handleColorSelect(e.target.value);
  };
  
  const handleAddIcon = (iconName) => {
    onAddElement("icon", { 
      name: iconName, 
      color: '#000000',
      fontSize: 24,
      link: null
    });
  };
  
  const handleAddSocialIcon = (socialName, socialColor) => {
    const link = prompt(`Enter link for ${socialName} (optional):`, "");
    
    onAddElement("social", { 
      name: socialName, 
      color: socialColor,
      fontSize: 24,
      link: link || null
    });
  };
  
  const handleAddCard = (cardStyle) => {
    onAddElement("card", {
      ...cardStyle.style,
      content: "This is a card element. You can edit this text.",
      width: 300,
      height: 200
    });
  };
  
  const handleAnimationSelect = (animationId) => {
    if (selectedElement) {
      onUpdateElementStyle(selectedElement.id, { 
        animation: animationId,
        animationDuration: 1,
        animationDelay: 0,
        animationTiming: 'ease'
      });
    }
  };
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleCanvasBackgroundChange = (color) => {
    setCanvasBackgroundColor(color);
  };
  
  const tabs = [
    { id: 'elements', label: 'Elements', icon: Shapes },
    { id: 'layouts', label: 'Layouts', icon: Layers },
    { id: 'images', label: 'Images', icon: FileImage },
    { id: 'colors', label: 'Colors', icon: Palette }
  ];
  
  return (
    <div className="w-80 bg-black border-r border-[#c2831f] flex flex-col h-full">
      {/* Header */}
      <div className="h-16 p-4 border-b border-[#c2831f]">
        <h2 className="text-2xl font-bold text-[#c2831f] flex items-center gap-2 px-15" title="Design Tools">
          Design Tools
        </h2>
      </div>
      
      {/* Quick Actions */}
      <div className="p-4 border-b border-[#c2831f]">
        <h3 className="text-sm font-medium text-gray-100 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-80 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Undo last action"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-80 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Redo last action"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={onDuplicate}
            disabled={!selectedElement}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-80 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Duplicate selected element"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={!selectedElement}
            className="p-3 bg-red-600 hover:bg-red-700 disabled:opacity-80 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Delete selected element"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-100">Zoom</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.1))}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-xs font-mono min-w-12 text-center text-gray-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 3))}
              className="p-1 bg-gray-700 hover:bg-gray-600 rounded"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
        
        {/* Grid Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
            showGrid ? 'bg-[#c2831f] text-white cursor-pointer' : 'bg-gray-700 hover:bg-gray-600 '
          }`}
          title="Toggle grid display"
        >
          <span className="text-sm">Show Grid</span>
          <Grid size={16} />
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-[#c2831f]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#c2831f] text-white'
                : 'text-white hover:text-gray-200 hover:bg-gray-700'
            }`}
            title={`View ${tab.label}`}
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
          <div className="space-y-4 ">
            {/* Text Elements */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('text')}
                title="Toggle text elements section"
              >
                <h3 className="text-sm font-medium text-gray-300">Text Elements</h3>
                {expandedSections.text ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.text && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => onAddElement("heading")}
                    className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add heading text"
                  >
                    <Type size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white cursor-pointer">Heading</span>
                  </button>
                  <button
                    onClick={() => onAddElement("paragraph")}
                    className="flex flex-col items-center gap-2 cursor-pointer p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add paragraph text"
                  >
                    <Type size={16} className="text-green-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white cursor-pointer">Paragraph</span>
                  </button>
                  <button
                    onClick={() => onAddElement("subheading")}
                    className="flex flex-col items-center gap-2 p-3 bg-transparent  hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add subheading text"
                  >
                    <Type size={18} className="text-purple-400 " />
                    <span className="text-xs text-gray-300 group-hover:text-white cursor-pointer">Subheading</span>
                  </button>
                  <button
                    onClick={() => onAddElement("blockquote")}
                    className="flex flex-col items-center gap-2 p-3 bg-transparent hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add blockquote text"
                  >
                    <FileText size={16} className="text-yellow-400 " />
                    <span className="text-xs text-gray-300 group-hover:text-white cursor-pointer">Quote</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Card Elements */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('cards')}
              >
                <h3 className="text-sm font-medium text-gray-300">Card Elements</h3>
                {expandedSections.cards ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.cards && (
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {cardStyles.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleAddCard(card)}
                      className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center justify-center w-16 h-10 rounded-md" 
                           style={{ 
                             backgroundColor: card.style.backgroundColor,
                             border: `${card.style.borderWidth}px solid ${card.style.borderColor}`,
                             borderRadius: `${card.style.borderRadius}px`
                           }}>
                        <CreditCard size={16} className="text-gray-700" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-300 group-hover:text-white">{card.name}</span>
                        <p className="text-xs text-gray-400">{card.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Shapes */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('shapes')}
                title="Toggle shapes section"
              >
                <h3 className="text-sm font-medium text-gray-300">Shapes</h3>
                {expandedSections.shapes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.shapes && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    onClick={() => onAddElement("rectangle")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add rectangle shape"
                  >
                    <Square size={20} className="text-purple-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Rectangle</span>
                  </button>
                  <button
                    onClick={() => onAddElement("circle")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add circle shape"
                  >
                    <Circle size={20} className="text-pink-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Circle</span>
                  </button>
                  <button
                    onClick={() => onAddElement("triangle")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add triangle shape"
                  >
                    <Triangle size={20} className="text-green-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Triangle</span>
                  </button>
                  <button
                    onClick={() => onAddElement("star")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add star shape"
                  >
                    <Star size={20} className="text-yellow-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Star</span>
                  </button>
                  <button
                    onClick={() => onAddElement("hexagon")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add hexagon shape"
                  >
                    <Hexagon size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Hexagon</span>
                  </button>
                  <button
                    onClick={() => onAddElement("arrow")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add arrow shape"
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
                title="Toggle interactive elements section"
              >
                <h3 className="text-sm font-medium text-gray-300">Interactive</h3>
                {expandedSections.interactive ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.interactive && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => {
                      const link = prompt("Enter button link (optional):", "");
                      onAddElement("button", { link: link || null });
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add button element"
                  >
                    <Square size={16} className="text-orange-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Button</span>
                  </button>
                  <button
                    onClick={() => onAddElement("input")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add input field"
                  >
                    <PenTool size={16} className="text-indigo-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Input</span>
                  </button>
                  <button
                    onClick={() => onAddElement("checkbox")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add checkbox"
                  >
                    <Hash size={16} className="text-teal-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Checkbox</span>
                  </button>
                  <button
                    onClick={() => onAddElement("line")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add line element"
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
                title="Toggle media elements section"
              >
                <h3 className="text-sm font-medium text-gray-300">Media</h3>
                {expandedSections.media ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.media && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => onAddElement("image")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add image element"
                  >
                    <Image size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Image</span>
                  </button>
                  <button
                    onClick={() => onAddElement("video")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add video element"
                  >
                    <Video size={20} className="text-red-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Video</span>
                  </button>
                  <button
                    onClick={() => onAddElement("audio")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add audio element"
                  >
                    <Music size={20} className="text-green-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Audio</span>
                  </button>
                  <button
                    onClick={() => onAddElement("frame")}
                    className="flex flex-col items-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title="Add frame element"
                  >
                    <Frame size={20} className="text-purple-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">Frame</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Social Icons */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('social')}
                title="Toggle social icons section"
              >
                <h3 className="text-sm font-medium text-gray-300">Social Icons</h3>
                {expandedSections.social ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSections.social && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {socialIcons.map((social, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddSocialIcon(social.name, social.color)}
                      className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                      title={`Add ${social.name} icon`}
                    >
                      <social.icon size={18} style={{ color: social.color }} />
                      <span className="text-xs text-gray-300 group-hover:text-white">{social.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Icons */}
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-3" title="Basic icons">Icons</h3>
              <div className="grid grid-cols-4 gap-2">
                {icons.map((icon, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddIcon(icon.name)}
                    className="flex flex-col items-center gap-1 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                    title={`Add ${icon.name} icon`}
                  >
                    <icon.icon size={18} className="text-blue-400" />
                    <span className="text-xs text-gray-300 group-hover:text-white">{icon.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Layouts Tab */}
        {activeTab === 'layouts' && (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Prebuilt Layouts</h3>
              <p className="text-xs text-gray-400 mb-3">Drag to add layouts to your email</p>
              
              <div className="grid grid-cols-2 gap-3">
                {prebuiltLayouts.map((layout) => (
                  <div 
                    key={layout.id}
                    className="bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => onAddLayout(layout.id)}
                    title={`Add ${layout.name} layout`}
                  >
                    <div className="p-2 bg-gray-800 flex items-center justify-center">
                      <img 
                        src={layout.thumbnail} 
                        alt={layout.name}
                        className="w-full h-20 object-contain"
                      />
                    </div>
                    <div className="p-2">
                      <h4 className="text-sm font-medium text-white">{layout.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{layout.description}</p>
                    </div>
                  </div>
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
                  <input type="file" accept="image/*" onChange={handleUpload} className="hidden" title="Upload image from device" />
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Enter image URL"
                  />
                  <button
                    onClick={handleUrlSubmit}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    title="Add image from URL"
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
                      title={`Add stock image ${i + 1}`}
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
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Apply grayscale effect">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded"></div>
                    <span className="text-xs text-gray-300">Grayscale</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Apply sepia effect">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-600 rounded"></div>
                    <span className="text-xs text-gray-300">Sepia</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Apply blur effect">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-600 rounded"></div>
                    <span className="text-xs text-gray-300">Blur</span>
                  </div>
                </button>
                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Apply sharpen effect">
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
            {/* Page Background Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Page Background</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colorPalette.map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-lg border-2 hover:border-white transition-colors hover:scale-110 transform ${
                      canvasBackgroundColor === color ? 'border-white ring-2 ring-blue-500' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCanvasBackgroundChange(color)}
                    title={`Set background to ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasBackgroundColor}
                  onChange={(e) => handleCanvasBackgroundChange(e.target.value)}
                  className="w-12 h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  title="Custom background color"
                />
                <input
                  type="text"
                  value={canvasBackgroundColor}
                  onChange={(e) => handleCanvasBackgroundChange(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#FFFFFF"
                  title="Enter custom color code"
                />
              </div>
            </div>
            
            {/* Instructions */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-300" title="Instructions for color selection">
                {selectedElement 
                  ? `Applying colors to selected ${selectedElement.type}`
                  : "Select an element or click a color to create a new card"
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
                    title={`Apply color ${color}`}
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
                    title={`Apply gradient ${index + 1}`}
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
                    title={`Apply pattern ${index + 1}`}
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
              <p className="text-xs text-gray-300" title="Animation instructions">
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
                    title={`Apply ${animation.name} animation`}
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
                    title="Set animation duration"
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
                    title="Set animation delay"
                  />
                  <div className="text-sm text-gray-400 text-center mt-1">0.0s</div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Easing</label>
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" title="Select animation easing">
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
      </div>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span title="Selection status">Elements: {selectedElement ? '1 selected' : 'None selected'}</span>
          <span title="Application status">Ready to design</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbox;