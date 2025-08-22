

import React from "react";

const PropertiesPanel = ({ elements }) => {
  return (
    <div className="w-72 bg-black text-white p-4 border-l border-gray-800">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">Preview</h2>
      <div className="bg-white text-black p-4 rounded min-h-[500px]">
        {elements.map(el => (
          <div key={el.id} className="mb-4">
            {el.type === "heading" && (
              <h2 className="text-xl font-bold">{el.content || "Heading"}</h2>
            )}
            {el.type === "paragraph" && (
              <p>{el.content || "Paragraph text"}</p>
            )}
            {el.type === "button" && (
              <button className="bg-yellow-400 text-black px-4 py-2 rounded">
                {el.content || "Click Me"}
              </button>
            )}
            {el.type === "image" && (
              <img
                src={el.src}
                alt="uploaded"
                className="max-w-full object-contain"
              />
            )}
          </div>
        ))}
      </div> 
       
    </div>
  );
};

export default PropertiesPanel;
