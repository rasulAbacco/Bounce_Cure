// src/pages/TemplatesPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Star, Eye, Heart } from "lucide-react";

// Enhanced templates with more variety
const templates = [
  {
    id: 1,
    name: "Welcome Email",
    category: "Email",
    preview: "https://static.vecteezy.com/system/resources/thumbnails/036/324/708/small/ai-generated-picture-of-a-tiger-walking-in-the-forest-photo.jpg",
    rating: 4.8,
    likes: 324,
    content: [
      {
        type: "text",
        value: "👋 Welcome to Our Family!",
        style: { fontSize: 32, color: "#2563eb", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "paragraph",
        value: "We’re thrilled to have you on board. Explore features, discover insights, and start your journey today.",
        style: { fontSize: 16, color: "#374151", textAlign: "center" },
      },
      {
        type: "image",
        value: "https://static.vecteezy.com/system/resources/thumbnails/036/324/708/small/ai-generated-picture-of-a-tiger-walking-in-the-forest-photo.jpg",
      },
      {
        type: "button",
        value: "Get Started →",
        style: {
          backgroundColor: "#2563eb",
          color: "#fff",
          padding: "14px 32px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          margin: "20px auto",
          display: "block",
        },
      },
    ],
  },
  {
    id: 2,
    name: "Modern Newsletter",
    category: "Marketing",
    preview: "https://img.freepik.com/free-vector/modern-email-newsletter-template.jpg",
    rating: 4.9,
    likes: 451,
    content: [
      {
        type: "text",
        value: "📢 Monthly Marketing Insights",
        style: { fontSize: 30, color: "#111827", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "image",
        value: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=200&fit=crop",
      },
      {
        type: "paragraph",
        value: "Stay ahead of the curve with the latest updates, exclusive offers, and curated insights just for you.",
        style: { fontSize: 16, color: "#4b5563", textAlign: "center" },
      },
      {
        type: "button",
        value: "Read More",
        style: {
          backgroundColor: "#059669",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "6px",
          fontWeight: "600",
          display: "block",
          margin: "20px auto",
        },
      },
    ],
  },
  {
    id: 3,
    name: "Social Media Post",
    category: "Social",
    preview: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    rating: 4.7,
    likes: 512,
    content: [
      {
        type: "image",
        value: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
      },
      {
        type: "text",
        value: "🌟 Believe in Yourself",
        style: { fontSize: 36, color: "#eb1111ff", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "paragraph",
        value: "Success is built on small daily actions. Start today. Keep moving forward.",
        style: { fontSize: 18, color: "#c01ff1ff", textAlign: "center" },
      },
    ],
  },
  {
    id: 4,
    name: "Event Invitation",
    category: "Event",
    preview: "https://img.freepik.com/free-vector/event-invitation-design-template.jpg",
    rating: 4.6,
    likes: 298,
    content: [
      {
        type: "text",
        value: "🎉 You’re Invited!",
        style: { fontSize: 34, color: "#7c3aed", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "paragraph",
        value: "Join us for an unforgettable evening of networking, knowledge-sharing, and fun.",
        style: { fontSize: 16, color: "#374151", textAlign: "center" },
      },
      {
        type: "button",
        value: "RSVP Now",
        style: {
          backgroundColor: "#7c3aed",
          color: "#fff",
          padding: "14px 32px",
          borderRadius: "8px",
          fontWeight: "600",
          display: "block",
          margin: "20px auto",
        },
      },
    ],
  },
  {
    id: 5,
    name: "Product Launch",
    category: "Marketing",
    preview: "https://img.freepik.com/free-vector/product-launch-email-template.jpg",
    rating: 4.8,
    likes: 387,
    content: [
      {
        type: "image",
        value: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=600&h=300&fit=crop",
      },
      {
        type: "text",
        value: "🚀 Introducing Our New Product",
        style: { fontSize: 28, color: "#059669", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "paragraph",
        value: "Revolutionary design meets cutting-edge technology. Be the first to experience the future.",
        style: { fontSize: 16, color: "#374151", textAlign: "center" },
      },
      {
        type: "button",
        value: "Pre-Order Now",
        style: {
          backgroundColor: "#10b981",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: "6px",
          fontWeight: "600",
          margin: "20px auto",
          display: "block",
        },
      },
    ],
  },
  {
    id: 6,
    name: "Thank You Card",
    category: "Personal",
    preview: "https://img.freepik.com/free-vector/thank-you-card-template.jpg",
    rating: 4.9,
    likes: 401,
    content: [
      {
        type: "text",
        value: "❤️ Thank You!",
        style: { fontSize: 32, color: "#dc2626", fontWeight: "bold", textAlign: "center" },
      },
      {
        type: "paragraph",
        value: "Your support means the world to us. We couldn’t have done it without you.",
        style: { fontSize: 18, color: "#374151", textAlign: "center" },
      },
    ],
  },
];


const categories = ["All", "Email", "Marketing", "Social", "Event", "Personal"];

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [previewTemplate, setPreviewTemplate] = React.useState(null);

  // const handleSelect = (template) => {
  //   navigate("/editor", { state: { template: { ...template, fixed: true } } });
  // };
  const handleSelect = (template) => {
  const elements = template.content.map((block, index) => {
    let defaults = {};

    switch (block.type) {
      case "text":
        defaults = {
          x: 200,
          y: 60 + index * 70,
          width: 400,
          height: 50,
        };
        break;

      case "paragraph":
        defaults = {
          x: 200,
          y: 150 + index * 80,
          width: 500,
          height: 80,
        };
        break;

      case "button":
        defaults = {
          x: 300,
          y: 300 + index * 80,
          width: 180,
          height: 50,
          backgroundColor: "#2563eb",
          color: "#fff",
          borderRadius: 6,
        };
        break;

      case "image":
        defaults = {
          x: 250,
          y: 120 + index * 120,
          width: 300,
          height: 200,
        };
        break;

      default:
        defaults = {
          x: 100,
          y: 100 + index * 80,
          width: 300,
          height: 60,
        };
    }
 return {
      id: crypto.randomUUID(),
      type: block.type === "text" ? "heading" : block.type,
      content: block.value || "",
      src: block.type === "image" ? block.value : null,
      ...defaults,
      style: block.style || {},
      fontSize: block.style?.fontSize || 16,
      color: block.style?.color || "#000000",
      backgroundColor: block.style?.backgroundColor || "transparent",
      fontFamily: "Arial",
      rotation: 0,
      opacity: 1,
    };
  });

  navigate("/editor", {
    state: {
      template: {
        elements,
        canvasBackgroundColor: "#FFFFFF",
      },
    },
  });
};
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 "></div>
        <div className="relative px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-clip-text text-white mb-6">
              Choose Your Perfect Template
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start with professionally designed templates and customize them to
              match your vision
            </p>
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-3 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c2831f] focus:border-transparent"
                title="Search for templates by name"
              />
            </div>
            {/* Create Blank */}
            <button
              onClick={() => navigate("/editor")}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-[#c2831f] from-[#c2831f] hover:border-[#c2831f] border border-transparent focus:ring-[#c2831f] hover:bg-black hover:text-white text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Start with a blank canvas"
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
                    ? "bg-[#c2831f] text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                title={`Filter by ${category} templates`}
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
                onClick={() => setPreviewTemplate(template)}
                title="Click to preview template details"
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    title={`Preview of ${template.name} template`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                      title="Preview this template"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye size={18} />
                      <span>Preview</span>
                    </button>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span 
                      className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full"
                      title={`Category: ${template.category}`}
                    >
                      {template.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 
                      className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-200"
                      title={`Template name: ${template.name}`}
                    >
                      {template.name}
                    </h3>
                    <button 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-700 rounded-full"
                      title="Like this template"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Like functionality would go here
                      }}
                    >
                      <Heart
                        size={18}
                        className="text-gray-400 hover:text-red-400"
                      />
                    </button>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div 
                      className="flex items-center space-x-1"
                      title={`Rating: ${template.rating} out of 5 stars`}
                    >
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span>{template.rating}</span>
                    </div>
                    <div 
                      className="flex items-center space-x-1"
                      title={`${template.likes} people liked this template`}
                    >
                      <Heart size={14} />
                      <span>{template.likes}</span>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div className="mt-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {template.content.slice(0, 2).map((element, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {element.type === "text" &&
                          `📝 ${element.value.substring(0, 30)}...`}
                        {element.type === "paragraph" &&
                          `📄 ${element.value.substring(0, 40)}...`}
                        {element.type === "button" && `🔘 ${element.value}`}
                        {element.type === "image" && `🖼️ Image included`}
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
              <div className="text-6xl mb-4" title="No templates found">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                No templates found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or category filter
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors duration-200"
                title="Clear all filters and show all templates"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          title="Template preview modal"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 w-[700px] relative text-gray-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
              title="Close preview"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4" title={`Previewing: ${previewTemplate.name}`}>
              {previewTemplate.name}
            </h2>
            <div className="space-y-4">
              {previewTemplate.content.map((block, index) => {
                if (block.type === "text") {
                  return (
                    <h3 
                      key={index} 
                      style={block.style}
                      title="Text element"
                    >
                      {block.value}
                    </h3>
                  );
                }
                if (block.type === "paragraph") {
                  return (
                    <p 
                      key={index} 
                      style={block.style}
                      title="Paragraph element"
                    >
                      {block.value}
                    </p>
                  );
                }
                if (block.type === "button") {
                  return (
                    <button 
                      key={index} 
                      style={block.style}
                      title="Button element"
                    >
                      {block.value}
                    </button>
                  );
                }
                if (block.type === "image") {
                  return (
                    <img
                      key={index}
                      src={block.value}
                      alt="content"
                      className="rounded-lg"
                      title="Image element"
                    />
                  );
                }
                return null;
              })}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => handleSelect(previewTemplate)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium"
                title="Use this template in the editor"
              >
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;