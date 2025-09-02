import React, { useState } from "react";
import {
  Search,
  Grid,
  List,
  ArrowLeft,
  Star,
  Crown,
  Briefcase,
  Heart,
  Gift,
  Megaphone,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";  // ✅ add this

const AllTemplats = ({ onNavigateBack, onTemplateSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();   // ✅ add this

  const categories = [
    { name: "All", icon: Grid, count: 24 },
    { name: "Social Media", icon: Megaphone, count: 8 },
    { name: "Business", icon: Briefcase, count: 6 },
    { name: "Events", icon: Gift, count: 5 },
    { name: "Personal", icon: Heart, count: 5 },
  ];

  // Enhanced Templates Data with Rich Content
  const templates = [
    // --- Social Media ---
    {
      id: 1,
      name: "Instagram Story Promo",
      category: "Social Media",
      premium: false,
      rating: 4.8,
      downloads: "12.5k",
      tags: ["instagram", "story", "promo"],
      description: "Eye-catching Instagram story template for product promotions",
      dimensions: "1080x1920",
      elements: {
        mainTitle: "FLASH SALE",
        subtitle: "Up to 50% OFF",
        productName: "Premium Collection",
        callToAction: "Shop Now",
        hashtag: "#FlashSale #Fashion #Deal",
        website: "www.yourstore.com",
        discount: "50% OFF",
        validUntil: "Limited Time Only"
      }
    },
    {
      id: 2,
      name: "Facebook Event Cover",
      category: "Social Media",
      premium: true,
      rating: 4.9,
      downloads: "8.2k",
      tags: ["facebook", "event", "cover"],
      description: "Professional Facebook event cover for conferences and workshops",
      dimensions: "1920x1080",
      elements: {
        mainTitle: "DIGITAL MARKETING SUMMIT 2024",
        subtitle: "Master the Future of Marketing",
        eventDate: "March 15-17, 2024",
        location: "Convention Center, San Francisco",
        speakers: "50+ Industry Experts",
        callToAction: "Register Today",
        website: "www.marketingsummit.com",
        price: "Early Bird: $299"
      }
    },
    {
      id: 3,
      name: "Twitter Header Design",
      category: "Social Media",
      premium: false,
      rating: 4.7,
      downloads: "6.8k",
      tags: ["twitter", "header", "profile"],
      description: "Modern Twitter header design for personal branding",
      dimensions: "1500x500",
      elements: {
        mainTitle: "John Doe",
        subtitle: "Digital Marketing Expert & Content Creator",
        tagline: "Helping brands grow through digital strategies",
        location: "New York, USA",
        website: "johndoe.com",
        expertise: "SEO • Content • Social Media",
        experience: "10+ Years Experience"
      }
    },
    {
      id: 4,
      name: "LinkedIn Banner",
      category: "Social Media",
      premium: true,
      rating: 4.9,
      downloads: "15.3k",
      tags: ["linkedin", "professional", "banner"],
      description: "Professional LinkedIn banner for career advancement",
      dimensions: "1584x396",
      elements: {
        mainTitle: "Sarah Johnson",
        subtitle: "Senior Product Manager",
        company: "Tech Innovations Inc.",
        tagline: "Transforming Ideas into Market-Leading Products",
        skills: "Product Strategy • Team Leadership • Innovation",
        contact: "sarah.johnson@email.com",
        achievement: "Led 15+ Successful Product Launches"
      }
    },
    {
      id: 5,
      name: "YouTube Thumbnail",
      category: "Social Media",
      premium: false,
      rating: 4.6,
      downloads: "22.1k",
      tags: ["youtube", "thumbnail", "video"],
      description: "High-conversion YouTube thumbnail template",
      dimensions: "1280x720",
      elements: {
        mainTitle: "HOW TO MAKE $10K/MONTH",
        subtitle: "Complete Beginner's Guide",
        channelName: "Success Academy",
        videoLength: "15:32",
        viewPromise: "Step by Step Tutorial",
        urgency: "MUST WATCH 2024",
        category: "Business & Finance"
      }
    },
    {
      id: 6,
      name: "TikTok Video Cover",
      category: "Social Media",
      premium: false,
      rating: 4.8,
      downloads: "9.7k",
      tags: ["tiktok", "video", "cover"],
      description: "Trendy TikTok video cover for viral content",
      dimensions: "1080x1920",
      elements: {
        mainTitle: "Life Hack Alert!",
        subtitle: "This Will Change Everything",
        creator: "@lifehacks_daily",
        tip: "5-Minute Organization Trick",
        hashtags: "#lifehack #organization #productivity",
        engagement: "Follow for more tips!",
        trending: "Trending Now"
      }
    },
    {
      id: 7,
      name: "Pinterest Pin Design",
      category: "Social Media",
      premium: true,
      rating: 4.7,
      downloads: "11.4k",
      tags: ["pinterest", "pin", "vertical"],
      description: "Pinterest-optimized pin for maximum engagement",
      dimensions: "1000x1500",
      elements: {
        mainTitle: "10 Home Decor Ideas That Actually Work",
        subtitle: "Transform Your Space on a Budget",
        website: "homedesignblog.com",
        category: "Interior Design",
        promise: "Easy DIY Projects Inside",
        savings: "Save $1000s on Decor",
        timeframe: "Weekend Projects"
      }
    },
    {
      id: 8,
      name: "Instagram Post Square",
      category: "Social Media",
      premium: false,
      rating: 4.9,
      downloads: "18.6k",
      tags: ["instagram", "post", "square"],
      description: "Square Instagram post for feed consistency",
      dimensions: "1080x1080",
      elements: {
        mainTitle: "Monday Motivation",
        quote: "Success is not final, failure is not fatal",
        author: "Winston Churchill",
        brandName: "Inspire Daily",
        hashtags: "#motivation #success #mindset",
        website: "inspiredaily.com",
        callToAction: "Double tap if you agree!"
      }
    },
    
    // --- Business ---
    {
      id: 9,
      name: "Business Card Modern",
      category: "Business",
      premium: true,
      rating: 4.9,
      downloads: "25.8k",
      tags: ["business", "card", "professional"],
      description: "Elegant business card with gold accents",
      dimensions: "3.5x2 inches",
      elements: {
        name: "Alexander Smith",
        title: "Chief Executive Officer",
        company: "Gold Standard Consulting",
        phone: "+1 (555) 123-4567",
        email: "alex@goldstandardconsulting.com",
        website: "www.goldstandardconsulting.com",
        address: "123 Business Ave, Suite 100, NY 10001",
        tagline: "Excellence in Every Detail"
      }
    },
    {
      id: 10,
      name: "Corporate Flyer",
      category: "Business",
      premium: false,
      rating: 4.8,
      downloads: "14.2k",
      tags: ["corporate", "flyer", "business"],
      description: "Professional corporate service flyer",
      dimensions: "8.5x11 inches",
      elements: {
        mainTitle: "TRANSFORM YOUR BUSINESS",
        subtitle: "Professional Consulting Services",
        services: "Strategy • Operations • Technology • Growth",
        company: "Elite Business Solutions",
        experience: "15+ Years of Proven Results",
        clientSuccess: "500+ Successful Projects",
        contact: "Call: (555) 987-6543",
        website: "www.elitebusinesssolutions.com",
        offer: "Free Initial Consultation"
      }
    },
    {
      id: 11,
      name: "Company Brochure",
      category: "Business",
      premium: true,
      rating: 4.7,
      downloads: "8.9k",
      tags: ["company", "brochure", "tri-fold"],
      description: "Tri-fold company brochure template",
      dimensions: "11x8.5 inches",
      elements: {
        companyName: "Pinnacle Enterprises",
        tagline: "Reaching New Heights Together",
        aboutUs: "Leading innovation in business solutions since 2010",
        services: "Consulting • Development • Support • Training",
        stats: "1000+ Clients • 50+ Countries • 99% Success Rate",
        mission: "Empowering businesses to achieve extraordinary results",
        contact: "info@pinnacleenterprises.com",
        address: "456 Corporate Blvd, Business City, BC 12345"
      }
    },
    {
      id: 12,
      name: "Product Catalog",
      category: "Business",
      premium: false,
      rating: 4.6,
      downloads: "12.3k",
      tags: ["product", "catalog", "showcase"],
      description: "Professional product showcase catalog",
      dimensions: "8x10 inches",
      elements: {
        catalogTitle: "LUXURY COLLECTION 2024",
        companyName: "Premium Products Co.",
        productLine: "Signature Series",
        featuredProduct: "Gold Edition Timepiece",
        price: "Starting at $2,999",
        features: "Swiss Movement • 18K Gold • Lifetime Warranty",
        newCollection: "Limited Edition Available",
        contact: "orders@premiumproducts.com"
      }
    },
    {
      id: 13,
      name: "Invoice Template",
      category: "Business",
      premium: false,
      rating: 4.8,
      downloads: "19.7k",
      tags: ["invoice", "billing", "professional"],
      description: "Professional invoice template for businesses",
      dimensions: "8.5x11 inches",
      elements: {
        invoiceTitle: "INVOICE",
        invoiceNumber: "INV-2024-001",
        companyName: "Golden Gate Services",
        clientName: "ABC Corporation",
        serviceDescription: "Web Development Services",
        amount: "$5,500.00",
        dueDate: "Net 30 Days",
        paymentTerms: "Payment due within 30 days",
        contact: "billing@goldengateservices.com"
      }
    },
    {
      id: 14,
      name: "Presentation Slides",
      category: "Business",
      premium: true,
      rating: 4.9,
      downloads: "16.5k",
      tags: ["presentation", "slides", "corporate"],
      description: "Corporate presentation slide deck",
      dimensions: "16:9 format",
      elements: {
        presentationTitle: "QUARTERLY BUSINESS REVIEW",
        subtitle: "Q4 2024 Performance & 2025 Strategy",
        presenter: "Michael Chen, VP of Operations",
        company: "TechVision Industries",
        agenda: "Performance • Growth • Strategy • Next Steps",
        keyMetric: "25% Revenue Growth",
        achievement: "Exceeded All KPI Targets"
      }
    },

    // --- Events ---
    {
      id: 15,
      name: "Wedding Invitation",
      category: "Events",
      premium: true,
      rating: 4.9,
      downloads: "31.2k",
      tags: ["wedding", "invitation", "elegant"],
      description: "Elegant wedding invitation with gold details",
      dimensions: "5x7 inches",
      elements: {
        coupleNames: "Emily & James",
        mainText: "Together with their families",
        ceremonyDate: "Saturday, June 15th, 2024",
        ceremonyTime: "4:00 PM",
        venue: "Rosewood Manor",
        address: "123 Garden Lane, Springfield, IL",
        reception: "Reception to follow",
        rsvp: "RSVP by May 1st, 2024",
        contact: "emily.james2024@email.com"
      }
    },
    {
      id: 16,
      name: "Birthday Party Invite",
      category: "Events",
      premium: false,
      rating: 4.7,
      downloads: "24.8k",
      tags: ["birthday", "party", "celebration"],
      description: "Fun birthday party invitation design",
      dimensions: "5x7 inches",
      elements: {
        celebrantName: "Sophie",
        age: "Sweet 16",
        mainText: "You're Invited to the Party of the Year!",
        date: "Saturday, August 12th",
        time: "7:00 PM - 11:00 PM",
        venue: "The Grand Ballroom",
        address: "789 Celebration Ave, Party City",
        dresscode: "Cocktail Attire",
        rsvp: "RSVP by August 5th • (555) PARTY-16"
      }
    },
    {
      id: 17,
      name: "Conference Poster",
      category: "Events",
      premium: true,
      rating: 4.8,
      downloads: "7.6k",
      tags: ["conference", "poster", "professional"],
      description: "Academic conference poster template",
      dimensions: "36x48 inches",
      elements: {
        conferenceTitle: "INTERNATIONAL TECH SUMMIT 2024",
        subtitle: "Shaping the Future of Technology",
        date: "September 20-22, 2024",
        location: "San Francisco Convention Center",
        keynoteTitle: "AI Revolution: What's Next?",
        speaker: "Dr. Sarah Williams, MIT",
        topics: "AI • Blockchain • IoT • Quantum Computing",
        registration: "Register at techsummit2024.com"
      }
    },
    {
      id: 18,
      name: "Concert Flyer",
      category: "Events",
      premium: false,
      rating: 4.6,
      downloads: "13.4k",
      tags: ["concert", "music", "event"],
      description: "Concert event flyer for music venues",
      dimensions: "11x17 inches",
      elements: {
        artistName: "The Golden Strings",
        concertTitle: "SUMMER NIGHTS TOUR 2024",
        venue: "Harmony Amphitheater",
        date: "July 28, 2024",
        showtime: "Doors: 7PM • Show: 8PM",
        ticketPrice: "Tickets from $45",
        specialGuest: "Opening Act: Rising Stars",
        ticketing: "Available at TicketMaster.com"
      }
    },
    {
      id: 19,
      name: "Festival Banner",
      category: "Events",
      premium: false,
      rating: 4.8,
      downloads: "9.1k",
      tags: ["festival", "banner", "colorful"],
      description: "Vibrant festival banner design",
      dimensions: "10x3 feet",
      elements: {
        festivalName: "GOLDEN SUNSET FESTIVAL",
        year: "2024",
        dates: "August 15-17, 2024",
        location: "Riverside Park",
        lineup: "50+ Artists • 3 Stages • 3 Days",
        genres: "Rock • Pop • Electronic • Indie",
        tickets: "3-Day Pass: $199",
        website: "goldensunsetfest.com"
      }
    },

    // --- Personal ---
    {
      id: 20,
      name: "Recipe Card",
      category: "Personal",
      premium: false,
      rating: 4.7,
      downloads: "18.3k",
      tags: ["recipe", "cooking", "food"],
      description: "Beautiful recipe card for food bloggers",
      dimensions: "6x4 inches",
      elements: {
        recipeName: "Golden Honey Glazed Salmon",
        cookTime: "Prep: 15 min • Cook: 20 min",
        serves: "Serves 4",
        difficulty: "Easy",
        ingredients: "Salmon • Honey • Soy Sauce • Garlic • Ginger",
        method: "Marinate • Sear • Glaze • Serve",
        chef: "Chef Maria's Kitchen",
        website: "chefmariaskitchen.com"
      }
    },
    {
      id: 21,
      name: "Travel Journal",
      category: "Personal",
      premium: true,
      rating: 4.8,
      downloads: "11.7k",
      tags: ["travel", "journal", "memories"],
      description: "Travel journal page layout template",
      dimensions: "8x10 inches",
      elements: {
        destination: "Paris, France",
        travelDates: "March 10-17, 2024",
        weather: "Sunny, 18°C",
        highlights: "Eiffel Tower • Louvre • Seine River Cruise",
        accommodation: "Hotel de Luxe, Champs-Élysées",
        favorite: "Sunset at Trocadéro",
        foodTried: "Croissants • Macarons • French Onion Soup",
        memoryNote: "Most magical week ever!"
      }
    },
    {
      id: 22,
      name: "Fitness Tracker",
      category: "Personal",
      premium: false,
      rating: 4.6,
      downloads: "14.9k",
      tags: ["fitness", "health", "tracker"],
      description: "Personal fitness tracking sheet",
      dimensions: "8.5x11 inches",
      elements: {
        title: "30-DAY FITNESS CHALLENGE",
        goal: "Get Stronger • Feel Better • Build Habits",
        weeklyTarget: "5 Workouts per Week",
        focusAreas: "Cardio • Strength • Flexibility • Nutrition",
        progressMetrics: "Weight • Measurements • Energy Level",
        motivation: "Every Day is a New Opportunity",
        reminder: "Consistency Beats Perfection"
      }
    },
    {
      id: 23,
      name: "Photo Collage",
      category: "Personal",
      premium: true,
      rating: 4.9,
      downloads: "27.5k",
      tags: ["photo", "collage", "memories"],
      description: "Family photo collage layout",
      dimensions: "12x12 inches",
      elements: {
        title: "FAMILY MEMORIES 2024",
        subtitle: "Moments That Matter Most",
        occasions: "Birthdays • Holidays • Adventures • Milestones",
        familyName: "The Johnson Family",
        year: "2024",
        photoSlots: "15 Photo Placeholders",
        quote: "Family: Where Life Begins & Love Never Ends"
      }
    },
    {
      id: 24,
      name: "Daily Planner",
      category: "Personal",
      premium: false,
      rating: 4.8,
      downloads: "22.8k",
      tags: ["planner", "organization", "daily"],
      description: "Daily planning and productivity tracker",
      dimensions: "8.5x11 inches",
      elements: {
        date: "Today's Date: _______",
        priorities: "Top 3 Priorities",
        schedule: "Hourly Schedule: 6AM - 10PM",
        goals: "Today's Goals & Intentions",
        gratitude: "3 Things I'm Grateful For",
        reflection: "End of Day Reflection",
        tomorrow: "Tomorrow's Prep",
        motto: "Make Today Amazing!"
      }
    },
  ];

  // Filtering
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate comprehensive editable elements per template
  const generateTemplateElements = (template) => {
    const elements = [];
    const elementData = template.elements;
    
    // Add elements based on template content
    Object.entries(elementData).forEach(([key, value], index) => {
      const yPosition = 80 + (index * 40); // Distribute elements vertically
      elements.push({
        id: `${key}-${template.id}`,
        type: "text",
        content: value,
        x: 50,
        y: yPosition,
        style: getStyleForElement(key, template.category),
      });
    });

    return elements;
  };

  const getStyleForElement = (elementKey, category) => {
    const baseStyles = {
      title: { fontSize: 32, fontWeight: "bold", color: "#FFD700" }, // Gold
      mainTitle: { fontSize: 28, fontWeight: "bold", color: "#FFD700" },
      subtitle: { fontSize: 18, fontWeight: "500", color: "#FFFFFF" },
      name: { fontSize: 24, fontWeight: "bold", color: "#FFD700" },
      company: { fontSize: 16, fontWeight: "500", color: "#FFFFFF" },
      contact: { fontSize: 14, color: "#D1D5DB" },
      price: { fontSize: 20, fontWeight: "bold", color: "#FFD700" },
      date: { fontSize: 16, color: "#FFFFFF" },
      description: { fontSize: 14, color: "#D1D5DB" },
    };

    // Return style based on element key or default
    return baseStyles[elementKey] || baseStyles[elementKey.toLowerCase()] || 
           { fontSize: 14, color: "#FFFFFF" };
  };

 const handleTemplateSelect = (template) => {
    const templateData = {
      id: template.id,
      name: template.name,
      category: template.category,
      elements: template.elements,  // you can also use generateTemplateElements
    };

    if (onTemplateSelect) {
      onTemplateSelect(templateData);
    }

    // ✅ Navigate to editor with state
     navigate('/editor', { state: { template: templateData } });
  };

  const renderTemplatePreview = (template) => {
    const elements = template.elements;
    
    return (
      <div className="relative aspect-[3/4] bg-black rounded-lg flex flex-col justify-center items-center p-6 overflow-hidden" 
           style={{ border: '1px solid rgba(255, 215, 0, 0.3)' }}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5"
             style={{ 
               background: 'linear-gradient(to bottom right, #FFD700, transparent)' 
             }} />
        
        {/* Content Preview */}
        <div className="relative z-10 text-center space-y-3 w-full">
          {/* Main Title */}
          {elements.mainTitle && (
            <h3 className="text-xl font-bold truncate" style={{ color: '#FFD700' }}>
              {elements.mainTitle}
            </h3>
          )}
          {elements.name && !elements.mainTitle && (
            <h3 className="text-xl font-bold truncate" style={{ color: '#FFD700' }}>
              {elements.name}
            </h3>
          )}
          {elements.recipeName && !elements.mainTitle && !elements.name && (
            <h3 className="text-xl font-bold truncate" style={{ color: '#FFD700' }}>
              {elements.recipeName}
            </h3>
          )}
          
          {/* Subtitle */}
          {elements.subtitle && (
            <p className="text-sm text-white opacity-90 truncate">{elements.subtitle}</p>
          )}
          {elements.title && !elements.subtitle && (
            <p className="text-sm text-white opacity-90 truncate">{elements.title}</p>
          )}
          
          {/* Key Information */}
          {elements.date && (
            <p className="text-xs truncate flex items-center justify-center gap-1" 
               style={{ color: '#FCD34D' }}>
              <Calendar className="w-3 h-3" />
              {elements.date}
            </p>
          )}
          {elements.ceremonyDate && (
            <p className="text-xs truncate flex items-center justify-center gap-1" 
               style={{ color: '#FCD34D' }}>
              <Calendar className="w-3 h-3" />
              {elements.ceremonyDate}
            </p>
          )}
          {elements.location && (
            <p className="text-xs text-white opacity-70 truncate flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              {elements.location}
            </p>
          )}
          {elements.venue && (
            <p className="text-xs text-white opacity-70 truncate flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              {elements.venue}
            </p>
          )}
          
          {/* Contact/Website */}
          {elements.website && (
            <p className="text-xs truncate flex items-center justify-center gap-1" 
               style={{ color: '#FFD700' }}>
              <Globe className="w-3 h-3" />
              {elements.website}
            </p>
          )}
          {elements.contact && (
            <p className="text-xs text-white opacity-60 truncate">{elements.contact}</p>
          )}
        </div>

        {/* Premium Badge */}
        {template.premium && (
          <div className="absolute top-3 right-3 text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
               style={{ 
                 background: 'linear-gradient(to right, #FFD700, #FFA500)' 
               }}>
            <Crown className="w-3 h-3" />
            PRO
          </div>
        )}

        {/* Stats */}
        <div className="absolute bottom-3 left-3 right-3 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg p-2"
             style={{ border: '1px solid rgba(255, 215, 0, 0.2)' }}>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" style={{ color: '#FFD700' }} />
              <span>{template.rating}</span>
            </div>
            <span>{template.downloads} downloads</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black bg-opacity-95 backdrop-blur-md"
           style={{ borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigateBack && onNavigateBack()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              style={{ 
                border: '1px solid rgba(255, 215, 0, 0.3)',
                '&:hover': { borderColor: '#FFD700' }
              }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#FFD700' }} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">
                <span style={{ 
                  background: 'linear-gradient(to right, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Premium Templates
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                Select from {filteredTemplates.length} professionally designed templates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                      style={{ color: '#FFD700' }} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900 rounded-lg w-64 outline-none text-white placeholder-gray-400"
                style={{ 
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  '&:focus': {
                    borderColor: '#FFD700',
                    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2)'
                  }
                }}
              />
            </div>
            <div className="flex bg-gray-900 rounded-lg p-1"
                 style={{ border: '1px solid rgba(255, 215, 0, 0.3)' }}>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" 
                    ? "text-black" 
                    : "hover:bg-gray-800"
                }`}
                style={viewMode === "grid" ? 
                  { backgroundColor: '#FFD700', color: 'black' } : 
                  { color: '#FFD700' }
                }
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" 
                    ? "text-black" 
                    : "hover:bg-gray-800"
                }`}
                style={viewMode === "list" ? 
                  { backgroundColor: '#FFD700', color: 'black' } : 
                  { color: '#FFD700' }
                }
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-xl p-6 sticky top-32"
               style={{ border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#FFD700' }}>
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      selectedCategory === cat.name
                        ? "font-medium"
                        : "hover:bg-gray-700"
                    }`}
                    style={selectedCategory === cat.name ? 
                      { backgroundColor: '#FFD700', color: 'black' } : 
                      { 
                        backgroundColor: 'rgba(75, 85, 99, 0.5)',
                        color: '#D1D5DB',
                        border: '1px solid rgba(255, 215, 0, 0.1)'
                      }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === cat.name
                        ? "text-black"
                        : ""
                    }`}
                    style={selectedCategory === cat.name ? 
                      { backgroundColor: 'rgba(0, 0, 0, 0.2)' } : 
                      { backgroundColor: 'rgba(255, 215, 0, 0.2)', color: '#FFD700' }
                    }>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 p-4 rounded-lg"
                 style={{ 
                   background: 'linear-gradient(to bottom right, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05))',
                   border: '1px solid rgba(255, 215, 0, 0.3)'
                 }}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4" style={{ color: '#FFD700' }} />
                <span className="text-sm font-medium" style={{ color: '#FFD700' }}>
                  Premium Templates
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Unlock exclusive templates with advanced design elements
              </p>
              <button className="w-full text-black py-2 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(to right, #FFD700, #FFA500)',
                        '&:hover': {
                          background: 'linear-gradient(to right, #FFA500, #FFD700)'
                        }
                      }}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="flex-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group cursor-pointer bg-gray-900 bg-opacity-50 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{ 
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    '&:hover': {
                      borderColor: '#FFD700',
                      boxShadow: '0 25px 50px -12px rgba(255, 215, 0, 0.1)'
                    }
                  }}
                >
                  {renderTemplatePreview(template)}
                  <div className="p-4" style={{ borderTop: '1px solid rgba(255, 215, 0, 0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white truncate mr-2">{template.name}</h3>
                      {template.premium && (
                        <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#FFD700' }} />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{template.category}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{template.dimensions}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" style={{ color: '#FFD700' }} />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: 'rgba(255, 215, 0, 0.2)',
                            color: '#FFD700',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                          }}
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
                  className="group cursor-pointer bg-gray-900 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 flex items-center gap-6 hover:bg-gray-900 hover:bg-opacity-70"
                  style={{ border: '1px solid rgba(255, 215, 0, 0.2)' }}
                >
                  <div className="w-24 h-32 bg-black rounded-lg flex-shrink-0 overflow-hidden"
                       style={{ border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    <div className="w-full h-full flex flex-col justify-center items-center p-3 text-center">
                      <div className="text-xs font-bold mb-1 truncate w-full" style={{ color: '#FFD700' }}>
                        {template.elements.mainTitle || template.elements.name || template.name}
                      </div>
                      <div className="text-white opacity-70 text-[10px] truncate w-full">
                        {template.elements.subtitle || template.elements.title || template.category}
                      </div>
                      {template.elements.date && (
                        <div className="text-[8px] mt-1 truncate w-full" style={{ color: '#FCD34D' }}>
                          {template.elements.date}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-lg truncate">{template.name}</h3>
                      {template.premium && (
                        <span className="text-black text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0"
                              style={{ background: 'linear-gradient(to right, #FFD700, #FFA500)' }}>
                          <Crown className="w-3 h-3" />
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1" style={{ color: '#FFD700' }}>{template.category}</p>
                    <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {template.downloads} downloads
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" style={{ color: '#FFD700' }} />
                        <span>{template.rating}</span>
                      </div>
                      <span>{template.dimensions}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: 'rgba(255, 215, 0, 0.2)',
                            color: '#FFD700',
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 group-hover:translate-x-1 transition-transform">
                    <ArrowLeft className="w-5 h-5 rotate-180" style={{ color: '#FFD700' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#FFD700' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#FFD700' }}>
                  No templates found
                </h3>
                <p>Try adjusting your search terms or category filter</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        input:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2) !important;
        }
        
        button:hover {
          border-color: #FFD700 !important;
        }
        
        .group:hover {
          border-color: #FFD700 !important;
          box-shadow: 0 25px 50px -12px rgba(255, 215, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default AllTemplats;