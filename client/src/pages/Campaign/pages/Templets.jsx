import React from "react";
import { useNavigate } from "react-router-dom";

// Example templates
const templates = [
  {
    id: 1,
    name: "Welcome Email",
    preview: "https://coreldrawdesign.com/resources/previews/preview-abstract-business-webinar-conference-poster-template-1646282947.webp",
    content: [
      { type: "text", value: "Welcome to our service!", style: { fontSize: 22, color: "#333" } },
      { type: "paragraph", value: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Velit sapiente animi quisquam delectus, sed saepe vero dicta rem repellat voluptas a doloremque, nemo assumenda at? Tempora ullam tenetur vero aspernatur!", style: { fontSize: 22, color: "#333" } },
      { type: "button", value: "Get Started", style: { backgroundColor: "#007bff", color: "#fff" } }
    ]
  },
  {
    id: 2,
    name: "Newsletter",
    preview: "https://png.pngtree.com/thumb_back/fh260/background/20250319/pngtree-pastel-aesthetic-template-with-minimalist-frame-mockup-image_17102138.jpg",
    content: [
      { type: "text", value: "This Month’s Updates", style: { fontSize: 24, color: "#000" } },
      { type: "image", value: "https://png.pngtree.com/thumb_back/fh260/background/20250319/pngtree-pastel-aesthetic-template-with-minimalist-frame-mockup-image_17102138.jpg" }
    ]
  }
];

const TemplatesPage = () => {
  const navigate = useNavigate();

  const handleSelect = (template) => {
    navigate("/editor", { state: { template } });
  };

  return (
    <div className="p-10   min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Choose a Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="cursor-pointer bg-black shadow-lg rounded-xl overflow-hidden"
            onClick={() => handleSelect(tpl)}
          > 
            <img src={tpl.preview} alt={tpl.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{tpl.name}</h2>
              {/* <div className="mt-2 text-sm text-gray-400">
                {tpl.content.map((el, idx) => (
                  <div key={idx} className="mb-1">
                    {el.type === "text" && <span style={el.style}>{el.value}</span>}
                    {el.type === "paragraph" && <p style={el.style}>{el.value}</p>}
                    {el.type === "button" && (
                      <button style={el.style} className="px-3 py-1 rounded">
                        {el.value}
                      </button>
                    )}
                    {el.type === "image" && (
                      <img src={el.value} alt="Template Element" className="mt-2 w-full h-20 object-cover rounded" />
                    )}
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;



// import React from 'react'

// function Templets() {
//   return (
//     <div className=''>
//       Templets
//       Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus fugit rem provident mollitia debitis ea necessitatibus nemo suscipit, beatae sunt temporibus, quasi cupiditate qui quos itaque error nihil. Rerum, accusamus.
//     </div>
//   )
// }

// export default Templets
