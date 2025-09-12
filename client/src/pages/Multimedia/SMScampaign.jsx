import React, { useState, useRef, useEffect } from 'react';
import { Cloud, Send, Clock, Link, Smile, Trash2, Bold, Italic, Underline } from 'lucide-react';
import {
  X,
  Monitor,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from 'axios';

export default function SMSCampaignEditor() {
  const [message, setMessage] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Sans Serif');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // ✅ FIX
  const [previewDevice, setPreviewDevice] = useState("desktop");   // ✅ FIX
  const textareaRef = useRef(null);
  const [value, setValue] = useState("");
  const [campaigns, setCampaigns] = useState([]);
const [charCount, setCharCount] = useState(0);


  const smsCount = Math.ceil(message.length / 1600) || 1;
  const estimatedCost = (smsCount * 0.05).toFixed(2);

  const fonts = ['Sans Serif', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'];
  const variables = [
    { label: 'First Name', value: '{{firstName}}' },
    { label: 'Last Name', value: '{{lastName}}' },
    { label: 'Company', value: '{{company}}' },
    { label: 'Phone', value: '{{phone}}' }
  ];

  const emojis = ['😊', '👍', '🎉', '❤️', '🔥', '💯', '👏', '🚀'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowFontDropdown(false);
        setShowInsertDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

const sendCampaign = async () => {
  if (!message.trim()) return alert('Please enter a message');
  if (!campaignName.trim()) return alert('Please enter a campaign name');

  // Get recipients from your textarea input (manual input)
  const recipientsArray = value
    .split(/[\n,]+/) // split by comma or new line
    .map(num => num.trim())
    .filter(Boolean)
    .map(num => {
      // Add country code if missing (example for India +91)
      if (!num.startsWith('+')) return '+91' + num;
      return num;
    });

  if (recipientsArray.length === 0) {
    return alert('Please enter at least one recipient');
  }

  try {
    const res = await axios.post('http://localhost:5000/api/multimedia/', {
      name: campaignName,
      message,
      mediaUrl: '', // You can later integrate file upload
      recipients: recipientsArray
    });

    alert(`Campaign created! ID: ${res.data.campaign.id}`);
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error creating campaign:', err.response?.data || err.message);
    alert('Failed to create campaign. Check console for details.');
  }
};


useEffect(() => {
  const fetchCampaigns = async () => {
    const res = await axios.get('http://localhost:5000/api/multimedia/');
    setCampaigns(res.data);
  };
  fetchCampaigns();
}, []);


  const insertAtCursor = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newMessage = message.substring(0, start) + text + message.substring(end);
    setMessage(newMessage);
    
    // Set cursor position after inserted text
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
    text = text.replace(/\*([^*]+)\*/g, '$1'); // Bold
    text = text.replace(/_([^_]+)_/g, '$1');   // Italic
    text = text.replace(/~([^~]+)~/g, '$1');   // Underline
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links
    setMessage(text);
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
    // You can process the entered recipients here
  };
 

  // const sendCampaign = () => {
  //   if (!message.trim()) {
  //     alert('Please enter a message');
  //     return;
  //   }
  //   if (!campaignName.trim()) {
  //     alert('Please enter a campaign name');
  //     return;
  //   }
  //   alert('SMS Campaign sent successfully! 📱');
  // };

  const scheduleCampaign = () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    const datetime = prompt('Enter schedule date and time (YYYY-MM-DD HH:MM):');
    if (datetime) {
      alert(`SMS Campaign scheduled for ${datetime} ⏰`);
    }
  };

  const getCharCountColor = () => {
    if (charCount > 1600) return 'text-yellow-400';
    if (charCount > 1400) return 'text-orange-400';
    return 'text-gray-400';
  };

  const formatMessageForPreview = (msg) => {
    if (!msg.trim()) return 'Type your message to see preview...';
    return msg.replace(/\n/g, '<br />');
  };

return (
  <div className="flex-1  flex-col h-screen bg-gray-900 ">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-700">
      <h1 className="text-2xl font-semibold flex items-center gap-3 text-[#c2831f]">
        <Cloud className="w-6 h-6 opacity-70" />
         SMS Campaign
      </h1>
      
    </div>

    {/* Main Content with Form + Preview side by side */}
    <div className="flex flex-1 h-170">
      {/* Form Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* From Field */}
        <div className="">
          <label className="block text-sm font-medium mb-2">From</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* To Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">To</label>

          {/* Manual Entry Input */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Enter Recipients Manually</label>
            <textarea
              placeholder="Enter recipients separated by commas or new lines"
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-800 text-white"
              rows={4}
              onChange={handleManualChange}
            />
          </div>

          {/* File Upload Input */}
          <div>
            <label className="block text-sm mb-1">Upload Recipients File</label>
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
          <label className="block text-sm font-medium mb-2">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter your campaign name"
            className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Message Editor */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Message</label>
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
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => formatText('underline')}
                  className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* Font Dropdown */}
              <div className="relative dropdown-container pr-3 border-r border-gray-600">
                <button
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-24"
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
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-b-0"
                      >
                        {font}
                      </button>
                    ))}
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
                  <Link className="w-4 h-4" />
                </button>
                <button
                  onClick={insertEmoji}
                  className="p-2 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Insert Variables Dropdown */}
              <div className="relative dropdown-container pr-3 border-r border-gray-600">
                <button
                  onClick={() => setShowInsertDropdown(!showInsertDropdown)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                        className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-sm border-b border-gray-700 last:border-b-0"
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
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder="Type your SMS message here..."
                maxLength={1600}
                className="w-full h-48 p-4 bg-gray-800 border border-gray-700 border-t-0 rounded-b-md text-white text-sm resize-y focus:outline-none focus:border-blue-500 transition-colors"
                style={{ fontFamily: selectedFont === 'Sans Serif' ? 'inherit' : selectedFont }}
              />
              <div
                className={`absolute bottom-3 right-4 text-xs ${getCharCountColor()} bg-black px-2 py-1 rounded`}
              >
                {charCount}/1600
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
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Preview Header */}
        <button
          onClick={() => setShowPreviewModal(true)}
          className="bg-[#c2831f] text-white px-4 py-2 rounded-md"
        >
          Open Preview
        </button>

        {/* Phone Mockup */}
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="w-60 h-96 bg-gray-700 rounded-3xl p-5 border-2 border-gray-600">
            <div className="w-full h-full bg-gray-900 rounded-2xl p-4 overflow-y-auto">
              <div className="bg-[#c2831f] text-white p-3 rounded-2xl max-w-xs ml-auto mb-2 text-sm leading-relaxed break-words">
                <div
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
                Send test SMS
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto">
            {previewDevice === 'mobile' ? (
              <div className="flex justify-center items-start p-8 min-h-full bg-gray-50">
                <div className="w-80 bg-black rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  {/* SMS Header */}
                  <div className="p-4 bg-gray-100 border-b border-gray-200">
                    <div className="text-xl font-medium text-gray-900 mb-2">
                      Keith Burt &lt;+1234567890&gt;
                    </div>
                    <div className="text-sm text-blue-600 cursor-pointer">
                      to: Select recipients ▼
                    </div>
                  </div>

                  {/* SMS Content */}
                  <div className="p-6 min-h-[16rem] bg-gray-800 text-gray-100">
                    {message.trim() ? (
                      <div className="text-gray-900 whitespace-pre-wrap">{message}</div>
                    ) : (
                      <div className="text-gray-400 italic">
                        Your SMS message will appear here...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 min-h-full bg-gray-50">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Desktop SMS Header */}
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="text-xl font-medium text-gray-900 mb-2">
                      Keith Burt &lt;+1234567890&gt;
                    </div>
                    <div className="text-blue-600 cursor-pointer">to: Select recipients ▼</div>
                  </div>

                  {/* Desktop SMS Content */}
                  <div className="p-8 min-h-[24rem]">
                    {message.trim() ? (
                      <div className="text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                        {message}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic text-lg">
                        Your SMS message will appear here...
                      </div>
                    )}
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
};