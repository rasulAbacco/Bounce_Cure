// src/pages/TemplatesPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Star, Eye, Heart } from 'lucide-react';

// Enhanced templates with more variety
const templates = [
  {
    id: 1,
    name: "Welcome Email",
    category: "Email",
    preview: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    rating: 4.8,
    likes: 234,
    content: [
      { 
        type: "text", 
        value: "Welcome to our service!", 
        style: { fontSize: 28, color: "#2563eb", fontWeight: "bold" } 
      },
      { 
        type: "paragraph", 
        value: "We're excited to have you on board. Get started with our amazing features and create something incredible today.", 
        style: { fontSize: 16, color: "#374151" } 
      },
      { 
        type: "button", 
        value: "Get Started", 
        style: { backgroundColor: "#3b82f6", color: "#fff", padding: "12px 24px", borderRadius: "8px" } 
      }
    ]
  },
  {
    id: 2,
    name: "Newsletter",
    category: "Marketing",
    preview: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
    rating: 4.9,
    likes: 189,
    content: [
      { 
        type: "text", 
        value: "Monthly Newsletter", 
        style: { fontSize: 32, color: "#1f2937", fontWeight: "bold" } 
      },
      { 
        type: "image", 
        value: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop" 
      },
      { 
        type: "paragraph", 
        value: "Stay updated with our latest news, features, and exclusive content delivered right to your inbox.", 
        style: { fontSize: 16, color: "#6b7280" } 
      }
    ]
  },
  {
    id: 3,
    name: "Social Media Post",
    category: "Social",
    preview: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
    rating: 4.7,
    likes: 312,
    content: [
      { 
        type: "text", 
        value: "Follow Your Dreams", 
        style: { fontSize: 36, color: "#ffffff", fontWeight: "bold" } 
      },
      { 
        type: "paragraph", 
        value: "Success is not final, failure is not fatal: it is the courage to continue that counts.", 
        style: { fontSize: 18, color: "#f3f4f6" } 
      }
    ]
  },
  {
    id: 4,
    name: "Event Invitation",
    category: "Event",
    preview: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    rating: 4.6,
    likes: 156,
    content: [
      { 
        type: "text", 
        value: "You're Invited!", 
        style: { fontSize: 30, color: "#7c3aed", fontWeight: "bold" } 
      },
      { 
        type: "paragraph", 
        value: "Join us for an unforgettable evening of networking, learning, and fun.", 
        style: { fontSize: 16, color: "#374151" } 
      },
      { 
        type: "button", 
        value: "RSVP Now", 
        style: { backgroundColor: "#7c3aed", color: "#fff", padding: "12px 24px", borderRadius: "6px" } 
      }
    ]
  },
  {
    id: 5,
    name: "Product Launch",
    category: "Marketing",
    preview: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    rating: 4.8,
    likes: 278,
    content: [
      { 
        type: "text", 
        value: "Introducing Our Latest Product", 
        style: { fontSize: 26, color: "#059669", fontWeight: "bold" } 
      },
      { 
        type: "image", 
        value: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop" 
      },
      { 
        type: "paragraph", 
        value: "Revolutionary design meets cutting-edge technology. Experience the future today.", 
        style: { fontSize: 16, color: "#374151" } 
      }
    ]
  },
  {
    id: 6,
    name: "Thank You Card",
    category: "Personal",
    preview: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    rating: 4.9,
    likes: 198,
    content: [
      { 
        type: "text", 
        value: "Thank You!", 
        style: { fontSize: 32, color: "#dc2626", fontWeight: "bold" } 
      },
      { 
        type: "paragraph", 
        value: "Your support means the world to us. We couldn't have done it without you.", 
        style: { fontSize: 18, color: "#374151" } 
      }
    ]
  }
];

const categories = ["All", "Email", "Marketing", "Social", "Event", "Personal"];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSelect = (template) => {
    navigate("/editor", { state: { template } });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Choose Your Perfect Template
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start with professionally designed templates and customize them to match your vision
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Create Blank */}
            <button
              onClick={() => navigate("/editor")}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Start from Blank</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleSelect(template)}
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye size={18} />
                      <span>Use Template</span>
                    </button>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                      {template.name}
                    </h3>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-700 rounded-full">
                      <Heart size={18} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{template.likes}</span>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="mt-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {template.content.slice(0, 2).map((element, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {element.type === 'text' && `📝 ${element.value.substring(0, 30)}...`}
                        {element.type === 'paragraph' && `📄 ${element.value.substring(0, 40)}...`}
                        {element.type === 'button' && `🔘 ${element.value}`}
                        {element.type === 'image' && `🖼️ Image included`}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">No templates found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;