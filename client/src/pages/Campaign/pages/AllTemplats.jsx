import React, { useState } from 'react';
import { Search, Filter, Grid, List, ArrowLeft, Star, Zap, Briefcase, Heart, Gift, Megaphone } from 'lucide-react';

const AllTemplates = ({ onNavigateToEditor, onNavigateBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'All', icon: Grid, count: 24 },
    { name: 'Social Media', icon: Megaphone, count: 8 },
    { name: 'Business', icon: Briefcase, count: 6 },
    { name: 'Events', icon: Gift, count: 5 },
    { name: 'Personal', icon: Heart, count: 5 }
  ];

  const templates = [
    // Social Media Templates
    {
      id: 1,
      name: 'Instagram Story Promo',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '12.5k',
      tags: ['instagram', 'story', 'promo'],
      gradient: 'from-pink-500 to-purple-600'
    },
    {
      id: 2,
      name: 'Facebook Event Cover',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '8.2k',
      tags: ['facebook', 'event', 'cover'],
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      id: 3,
      name: 'Twitter Header Design',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.7,
      downloads: '6.8k',
      tags: ['twitter', 'header', 'profile'],
      gradient: 'from-sky-500 to-blue-600'
    },
    {
      id: 4,
      name: 'LinkedIn Banner',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '15.3k',
      tags: ['linkedin', 'professional', 'banner'],
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      id: 5,
      name: 'YouTube Thumbnail',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.6,
      downloads: '22.1k',
      tags: ['youtube', 'thumbnail', 'video'],
      gradient: 'from-red-500 to-pink-600'
    },
    {
      id: 6,
      name: 'TikTok Video Cover',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '9.7k',
      tags: ['tiktok', 'video', 'cover'],
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 7,
      name: 'Pinterest Pin Design',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.7,
      downloads: '11.4k',
      tags: ['pinterest', 'pin', 'vertical'],
      gradient: 'from-rose-500 to-red-600'
    },
    {
      id: 8,
      name: 'Instagram Post Square',
      category: 'Social Media',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.9,
      downloads: '18.6k',
      tags: ['instagram', 'post', 'square'],
      gradient: 'from-orange-500 to-pink-600'
    },

    // Business Templates
    {
      id: 9,
      name: 'Business Card Modern',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '25.8k',
      tags: ['business', 'card', 'professional'],
      gradient: 'from-slate-600 to-gray-800'
    },
    {
      id: 10,
      name: 'Corporate Flyer',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '14.2k',
      tags: ['corporate', 'flyer', 'business'],
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      id: 11,
      name: 'Company Brochure',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.7,
      downloads: '8.9k',
      tags: ['company', 'brochure', 'tri-fold'],
      gradient: 'from-green-600 to-teal-700'
    },
    {
      id: 12,
      name: 'Product Catalog',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.6,
      downloads: '12.3k',
      tags: ['product', 'catalog', 'showcase'],
      gradient: 'from-purple-600 to-indigo-700'
    },
    {
      id: 13,
      name: 'Invoice Template',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '19.7k',
      tags: ['invoice', 'billing', 'professional'],
      gradient: 'from-gray-600 to-slate-700'
    },
    {
      id: 14,
      name: 'Presentation Slides',
      category: 'Business',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '16.5k',
      tags: ['presentation', 'slides', 'corporate'],
      gradient: 'from-teal-600 to-cyan-700'
    },

    // Events Templates
    {
      id: 15,
      name: 'Wedding Invitation',
      category: 'Events',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '31.2k',
      tags: ['wedding', 'invitation', 'elegant'],
      gradient: 'from-rose-400 to-pink-500'
    },
    {
      id: 16,
      name: 'Birthday Party Invite',
      category: 'Events',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.7,
      downloads: '24.8k',
      tags: ['birthday', 'party', 'celebration'],
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 17,
      name: 'Conference Poster',
      category: 'Events',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.8,
      downloads: '7.6k',
      tags: ['conference', 'poster', 'professional'],
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      id: 18,
      name: 'Concert Flyer',
      category: 'Events',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.6,
      downloads: '13.4k',
      tags: ['concert', 'music', 'event'],
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 19,
      name: 'Festival Banner',
      category: 'Events',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '9.1k',
      tags: ['festival', 'banner', 'colorful'],
      gradient: 'from-green-400 to-teal-500'
    },

    // Personal Templates
    {
      id: 20,
      name: 'Recipe Card',
      category: 'Personal',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.7,
      downloads: '18.3k',
      tags: ['recipe', 'cooking', 'food'],
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 21,
      name: 'Travel Journal',
      category: 'Personal',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.8,
      downloads: '11.7k',
      tags: ['travel', 'journal', 'memories'],
      gradient: 'from-cyan-400 to-blue-500'
    },
    {
      id: 22,
      name: 'Fitness Tracker',
      category: 'Personal',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.6,
      downloads: '14.9k',
      tags: ['fitness', 'health', 'tracker'],
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      id: 23,
      name: 'Photo Collage',
      category: 'Personal',
      preview: '/api/placeholder/300/400',
      premium: true,
      rating: 4.9,
      downloads: '27.5k',
      tags: ['photo', 'collage', 'memories'],
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 24,
      name: 'Daily Planner',
      category: 'Personal',
      preview: '/api/placeholder/300/400',
      premium: false,
      rating: 4.8,
      downloads: '22.8k',
      tags: ['planner', 'organization', 'daily'],
      gradient: 'from-indigo-400 to-purple-500'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleTemplateSelect = (template) => {
    const templateData = {
      id: template.id,
      name: template.name,
      category: template.category,
      elements: generateTemplateElements(template)
    };
    
    // Call the parent navigation function if provided
    if (onNavigateToEditor) {
      onNavigateToEditor(template, templateData);
    } else {
      console.log('Template selected:', template);
      console.log('Template data:', templateData);
      alert(`Selected: ${template.name}\nPass onNavigateToEditor prop to enable navigation`);
    }
  };

  const generateTemplateElements = (template) => {
    // Generate template-specific elements based on template type
    const baseElements = [
      {
        id: 'bg-' + template.id,
        type: 'background',
        gradient: template.gradient,
        position: { x: 0, y: 0 },
        size: { width: 800, height: 600 }
      },
      {
        id: 'title-' + template.id,
        type: 'text',
        content: template.name,
        position: { x: 50, y: 50 },
        style: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' }
      },
      {
        id: 'subtitle-' + template.id,
        type: 'text',
        content: 'Edit this text to customize your design',
        position: { x: 50, y: 100 },
        style: { fontSize: 16, color: '#e5e7eb' }
      }
    ];

    // Add category-specific elements
    if (template.category === 'Social Media') {
      baseElements.push({
        id: 'hashtag-' + template.id,
        type: 'text',
        content: '#YourHashtagHere',
        position: { x: 50, y: 500 },
        style: { fontSize: 14, color: '#60a5fa' }
      });
    } else if (template.category === 'Business') {
      baseElements.push({
        id: 'contact-' + template.id,
        type: 'text',
        content: 'contact@yourbusiness.com',
        position: { x: 50, y: 500 },
        style: { fontSize: 12, color: '#d1d5db' }
      });
    } else if (template.category === 'Events') {
      baseElements.push({
        id: 'date-' + template.id,
        type: 'text',
        content: 'Date: TBD | Location: TBD',
        position: { x: 50, y: 450 },
        style: { fontSize: 14, color: '#fbbf24' }
      });
    }

    return baseElements;
  };

  const handleBackClick = () => {
    // Call the parent navigation function if provided
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      alert('Pass onNavigateBack prop to enable back navigation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackClick}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Choose Templates</h1>
                <p className="text-gray-400 text-sm">Select from {filteredTemplates.length} professional templates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
                />
              </div>
              
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 sticky top-32">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        selectedCategory === category.name
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">Pro Templates</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Unlock premium templates with advanced features
                </p>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="group cursor-pointer bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105"
                  >
                    <div className="relative">
                      <div className={`aspect-[3/4] bg-gradient-to-br ${template.gradient} p-8 flex items-center justify-center`}>
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                          <p className="text-white/80 text-sm">Click to customize</p>
                        </div>
                      </div>
                      
                      {template.premium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          PRO
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{template.rating}</span>
                          </div>
                          <span>{template.downloads} downloads</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{template.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="group cursor-pointer bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-all duration-300 flex items-center gap-6"
                  >
                    <div className={`w-20 h-24 bg-gradient-to-br ${template.gradient} rounded-lg flex-shrink-0`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        {template.premium && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{template.category}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>{template.rating}</span>
                        </div>
                        <span>{template.downloads} downloads</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                  <p>Try adjusting your search terms or category filter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTemplates;