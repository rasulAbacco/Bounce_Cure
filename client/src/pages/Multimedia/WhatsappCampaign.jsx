import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Clock, Link, Smile, Trash2, Bold, Italic, Underline, Image, Upload, Palette, Square } from 'lucide-react';
import {
  X,
  Monitor,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function WhatsAppCampaignEditor() {
  const [message, setMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Sans Serif');
  const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
  const [selectedBgColor, setSelectedBgColor] = useState('#25D366');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [imageStyles, setImageStyles] = useState({
    width: 200,
    height: 150,
    borderRadius: 8,
    opacity: 100,
    filter: 'none'
  });
  const textareaRef = useRef(null);
  const [value, setValue] = useState("");

  const charCount = message.length;
  const estimatedCost = (0.02).toFixed(2); // WhatsApp pricing

  const fonts = ['Sans Serif', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'];
  const textColors = ['#ffffff', '#000000', '#25D366', '#c2831f', '#ff0000', '#0000ff', '#800080', '#ffa500'];
  const bgColors = ['#25D366', '#128C7E', '#075E54', '#c2831f', '#ff0000', '#0000ff', '#800080', '#ffa500'];
  const variables = [
    { label: 'First Name', value: '{{firstName}}' },
    { label: 'Last Name', value: '{{lastName}}' },
    { label: 'Company', value: '{{company}}' },
    { label: 'Phone', value: '{{phone}}' }
  ];

  const emojis = ['😊', '👍', '🎉', '❤️', '🔥', '💯', '👏', '🚀'];
  const filters = ['none', 'blur(2px)', 'brightness(1.2)', 'contrast(1.2)', 'grayscale(100%)', 'sepia(100%)'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
        setShowInsertDropdown(false);
        setShowTextColorPicker(false);
        setShowBgColorPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newMessage = message.substring(0, start) + text + message.substring(end);
    setMessage(newMessage);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  const formatText = (command) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start === end) {
      alert('Please select text to format');
      return;
    }
    
    const selectedText = message.substring(start, end);
    let formattedText = '';
    
    switch(command) {
      case 'bold':
        formattedText = `*${selectedText}*`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'underline':
        formattedText = `~${selectedText}~`;
        break;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formattedText.length;
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      insertAtCursor(`[link](${url})`);
    }
  };

  const insertEmoji = () => {
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    insertAtCursor(emoji);
  };

  const clearFormatting = () => {
    let text = message;
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');
    text = text.replace(/~([^~]+)~/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    setMessage(text);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setShowImageEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setImageUrl(url);
      setUploadedImage(url);
      setShowImageEditor(true);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImageUrl('');
    setShowImageEditor(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  const handleManualChange = (e) => {
    const value = e.target.value;
    console.log("Manual input:", value);
  };

  const sendCampaign = () => {
    if (!message.trim() && !uploadedImage) {
      alert('Please enter a message or upload an image');
      return;
    }
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    alert('WhatsApp Campaign sent successfully! 💬');
  };

  const scheduleCampaign = () => {
    if (!message.trim() && !uploadedImage) {
      alert('Please enter a message or upload an image');
      return;
    }
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    const datetime = prompt('Enter schedule date and time (YYYY-MM-DD HH:MM):');
    if (datetime) {
      alert(`WhatsApp Campaign scheduled for ${datetime} ⏰`);
    }
  };

  const formatMessageForPreview = (msg) => {
    if (!msg.trim()) return 'Type your message to see preview...';
    return msg.replace(/\n/g, '<br />');
  };

  return (
    <div className="flex-1 flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h1 className="text-2xl font-semibold flex items-center gap-3 text-[#c2831f]">
          <MessageCircle className="w-6 h-6 opacity-70" />
          WhatsApp Campaign
        </h1>
      </div>

      {/* Main Content with Form + Preview side by side */}
      <div className="flex flex-1 h-170">
        {/* Form Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* From Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-white">From</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* To Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-white">To</label>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-300">Enter Recipients Manually</label>
              <textarea
                placeholder="Enter recipients separated by commas or new lines"
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-800 text-white"
                rows={4}
                onChange={handleManualChange}
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">Upload Recipients File</label>
              <input
                type="file"
                accept=".csv, .txt"
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-800 text-white"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Campaign Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-white">Campaign Name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter your campaign name"
              className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-white">Image</label>
            <div className="flex gap-2 mb-3">
              <label className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleImageUrl}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Image URL
              </button>
              {uploadedImage && (
                <button
                  onClick={removeImage}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>

            {/* Image Editor */}
            {showImageEditor && uploadedImage && (
              <div className="bg-gray-800 border border-gray-600 rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-3 text-white">Image Styling</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs mb-1 text-gray-300">Width (px)</label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={imageStyles.width}
                      onChange={(e) => setImageStyles({...imageStyles, width: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageStyles.width}px</span>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-300">Height (px)</label>
                    <input
                      type="range"
                      min="50"
                      max="300"
                      value={imageStyles.height}
                      onChange={(e) => setImageStyles({...imageStyles, height: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageStyles.height}px</span>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-300">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={imageStyles.borderRadius}
                      onChange={(e) => setImageStyles({...imageStyles, borderRadius: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageStyles.borderRadius}px</span>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-300">Opacity</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={imageStyles.opacity}
                      onChange={(e) => setImageStyles({...imageStyles, opacity: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{imageStyles.opacity}%</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs mb-1 text-gray-300">Filter</label>
                  <select
                    value={imageStyles.filter}
                    onChange={(e) => setImageStyles({...imageStyles, filter: e.target.value})}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                  >
                    {filters.map(filter => (
                      <option key={filter} value={filter}>
                        {filter === 'none' ? 'None' : filter}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-center">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    style={{
                      width: `${imageStyles.width}px`,
                      height: `${imageStyles.height}px`,
                      borderRadius: `${imageStyles.borderRadius}px`,
                      opacity: imageStyles.opacity / 100,
                      filter: imageStyles.filter
                    }}
                    className="object-cover border border-gray-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Message Editor */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2 text-white">Message</label>
            <div className="relative">
              {/* Toolbar */}
              <div className="flex items-center gap-2 p-3 bg-gray-900 border border-gray-700 rounded-t-md flex-wrap">
                {/* Format Group */}
                <div className="flex items-center gap-1 pr-3 border-r border-gray-600">
                  <button
                    onClick={() => formatText('bold')}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => formatText('italic')}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => formatText('underline')}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Font Dropdown */}
                <div className="relative dropdown-container pr-3 border-r border-gray-600">
                  <button
                    onClick={() => setShowFontDropdown(!showFontDropdown)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-24 text-white"
                  >
                    {selectedFont} ▼
                  </button>
                  {showFontDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-50 min-w-36">
                      {fonts.map((font) => (
                        <button
                          key={font}
                          onClick={() => {
                            setSelectedFont(font);
                            setShowFontDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-b-0 text-white"
                        >
                          {font}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text Color Picker */}
                <div className="relative dropdown-container pr-3 border-r border-gray-600">
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Text Color"
                  >
                    <Palette className="w-4 h-4 text-white" />
                  </button>
                  {showTextColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-50 p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {textColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedTextColor(color);
                              setShowTextColorPicker(false);
                            }}
                            className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Color Picker */}
                <div className="relative dropdown-container pr-3 border-r border-gray-600">
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Background Color"
                  >
                    <Square className="w-4 h-4 text-white" />
                  </button>
                  {showBgColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-50 p-2">
                      <div className="grid grid-cols-4 gap-2">
                        {bgColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedBgColor(color);
                              setShowBgColorPicker(false);
                            }}
                            className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Insert Tools */}
                <div className="flex items-center gap-1 pr-3 border-r border-gray-600">
                  <button
                    onClick={insertLink}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Insert Link"
                  >
                    <Link className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={insertEmoji}
                    className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    title="Insert Emoji"
                  >
                    <Smile className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Insert Variables Dropdown */}
                <div className="relative dropdown-container pr-3 border-r border-gray-600">
                  <button
                    onClick={() => setShowInsertDropdown(!showInsertDropdown)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 text-white"
                  >
                    Insert ▼
                  </button>
                  {showInsertDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md z-50 min-w-32">
                      {variables.map((variable) => (
                        <button
                          key={variable.value}
                          onClick={() => {
                            insertAtCursor(variable.value);
                            setShowInsertDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-b-0 text-white"
                        >
                          {variable.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear Formatting */}
                <button
                  onClick={clearFormatting}
                  className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                  title="Clear Formatting"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your WhatsApp message here..."
                  className="w-full h-48 p-4 bg-gray-800 border border-gray-700 border-t-0 rounded-b-md text-sm resize-y focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ 
                    fontFamily: selectedFont === 'Sans Serif' ? 'inherit' : selectedFont,
                    color: selectedTextColor
                  }}
                />
                <div className="absolute bottom-3 right-4 text-xs text-gray-400 bg-black px-2 py-1 rounded">
                  {charCount} chars
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <button
              onClick={sendCampaign}
              className="bg-[#c2831f] hover:bg-[#d98c10] cursor-pointer text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Campaign
            </button>
            <button
              onClick={scheduleCampaign}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Schedule Campaign
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Preview Header */}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="bg-[#c2831f] text-white px-4 py-2 rounded-md m-4"
          >
            Open Preview
          </button>

          {/* Phone Mockup */}
          <div className="flex-1 flex items-center justify-center p-5">
            <div className="w-60 h-96 bg-gray-700 rounded-3xl p-5 border-2 border-gray-600">
              <div className="w-full h-full bg-gray-900 rounded-2xl p-4 overflow-y-auto">
                <div 
                  className="p-3 rounded-2xl max-w-xs ml-auto mb-2 text-sm leading-relaxed break-words"
                  style={{ backgroundColor: selectedBgColor }}
                >
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      style={{
                        width: `${Math.min(imageStyles.width, 200)}px`,
                        height: `${Math.min(imageStyles.height, 150)}px`,
                        borderRadius: `${imageStyles.borderRadius}px`,
                        opacity: imageStyles.opacity / 100,
                        filter: imageStyles.filter
                      }}
                      className="object-cover mb-2 rounded"
                    />
                  )}
                  <div
                    style={{ color: selectedTextColor }}
                    dangerouslySetInnerHTML={{
                      __html: formatMessageForPreview(message),
                    }}
                    className={message.trim() ? '' : 'opacity-50'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Preview campaign</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Device Toggle and Navigation */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-3 rounded-md transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Desktop view"
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-3 rounded-md transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Mobile view"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-sm">No recipients</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Send test WhatsApp
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto">
              {previewDevice === 'mobile' ? (
                <div className="flex justify-center items-start p-8 min-h-full bg-gray-50">
                  <div className="w-80 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* WhatsApp Header */}
                    <div className="p-4 bg-green-600 text-white">
                      <div className="text-lg font-medium">
                        WhatsApp Business
                      </div>
                      <div className="text-sm opacity-90">
                        to: Select recipients ▼
                      </div>
                    </div>

                    {/* WhatsApp Content */}
                    <div className="p-6 min-h-[16rem] bg-gray-100">
                      <div 
                        className="p-3 rounded-lg max-w-xs ml-auto text-sm leading-relaxed break-words shadow-sm"
                        style={{ backgroundColor: selectedBgColor }}
                      >
                        {uploadedImage && (
                          <img
                            src={uploadedImage}
                            alt="Preview"
                            style={{
                              width: `${Math.min(imageStyles.width, 200)}px`,
                              height: `${Math.min(imageStyles.height, 150)}px`,
                              borderRadius: `${imageStyles.borderRadius}px`,
                              opacity: imageStyles.opacity / 100,
                              filter: imageStyles.filter
                            }}
                            className="object-cover mb-2 rounded w-full"
                          />
                        )}
                        {message.trim() ? (
                          <div 
                            className="whitespace-pre-wrap"
                            style={{ color: selectedTextColor }}
                          >
                            {message}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">
                            Your WhatsApp message will appear here...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 min-h-full bg-gray-50">
                  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Desktop WhatsApp Header */}
                    <div className="p-6 bg-green-600 text-white">
                      <div className="text-xl font-medium mb-2">
                        WhatsApp Business
                      </div>
                      <div className="text-green-100 cursor-pointer">to: Select recipients ▼</div>
                    </div>

                    {/* Desktop WhatsApp Content */}
                    <div className="p-8 min-h-[24rem] bg-gray-50">
                      <div 
                        className="p-6 rounded-lg max-w-md ml-auto text-lg leading-relaxed shadow-sm"
                        style={{ backgroundColor: selectedBgColor }}
                      >
                        {uploadedImage && (
                          <img
                            src={uploadedImage}
                            alt="Preview"
                            style={{
                              width: `${imageStyles.width}px`,
                              height: `${imageStyles.height}px`,
                              borderRadius: `${imageStyles.borderRadius}px`,
                              opacity: imageStyles.opacity / 100,
                              filter: imageStyles.filter
                            }}
                            className="object-cover mb-4 rounded"
                          />
                        )}
                        {message.trim() ? (
                          <div 
                            className="whitespace-pre-wrap"
                            style={{ color: selectedTextColor }}
                          >
                            {message}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">
                            Your WhatsApp message will appear here...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}