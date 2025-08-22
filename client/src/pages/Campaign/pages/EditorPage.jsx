// src/pages/EditPage.jsx
import React, { useState } from "react";
import CanvasArea from "../components/Editor/CanvasArea";
import Toolbox from "../components/Editor/Toolbox";
import PropertiesPanel from "../components/Editor/PropertiesPanel";

const EditPage = () => {
  // Shared state for pages
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [activePage, setActivePage] = useState(0);

  // Add element from Toolbox
  const handleAddElement = (type) => {
    const newElement = {
      id: crypto.randomUUID(),
      type,
      content:
        type === "heading"
          ? "Heading"
          : type === "paragraph"
          ? "Paragraph text"
          : type === "button"
          ? "Click Me"
          : "",
      src: type === "image" ? "" : null,
      x: 50,
      y: 50,
      style:
        type === "button"
          ? { backgroundColor: "#007bff", color: "#fff", padding: "10px 20px", borderRadius: "6px" }
          : {},
    };
    const updatedPages = [...pages];
    updatedPages[activePage].elements.push(newElement);
    setPages(updatedPages);
  };

  // Upload image
  const handleUploadImage = (src) => {
    const newElement = {
      id: crypto.randomUUID(),
      type: "image",
      src,
      x: 50,
      y: 50,
    };
    const updatedPages = [...pages];
    updatedPages[activePage].elements.push(newElement);
    setPages(updatedPages);
  };

  // Update elements after drag/resize/edit
  const handleUpdate = (updatedElements) => {
    const updatedPages = [...pages];
    updatedPages[activePage].elements = updatedElements;
    setPages(updatedPages);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Toolbox */}
      <Toolbox
        onAddElement={handleAddElement}
        onUploadImage={handleUploadImage}
        onSelectStockImage={handleUploadImage}
      />

      {/* Canvas */}
      <div className="flex-1 overflow-auto">
        <CanvasArea
          pages={pages}
          setPages={setPages}
          activePage={activePage}
          setActivePage={setActivePage}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 text-yellow-400">Properties</h2>
        <PropertiesPanel
          elements={pages[activePage].elements}
          setElements={(updatedElements) => handleUpdate(updatedElements)}
        />
      </div>
    </div>
  );
};

export default EditPage;
