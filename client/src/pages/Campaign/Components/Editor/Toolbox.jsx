

import React from "react";

const Toolbox = ({ onAddElement, onUploadImage, onSelectStockImage }) => {
  const stockImages = [
    "https://media1.thrillophilia.com/filestore/v7h4ylcvnjh7dkpxg85jgw5gfqx4_IMG%20World%20Dubai%20Fun%20(1).jpg",
    "https://images.unsplash.com/photo-1520209759809-a9bcb6cb3241?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1nfGVufDB8fDB8fHww",
    "https://www.sportico.com/wp-content/uploads/2020/09/0911_IMG.jpg",
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

  return (
    <div className="w-60 bg-black text-white p-4 border-r border-gray-800">
      <h2 className="text-lg font-bold text-yellow-400 mb-4">Toolbox</h2>

      <button
        onClick={() => onAddElement("heading")}
        className="w-full mb-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        Add Heading
      </button>
 
      <button
        onClick={() => onAddElement("paragraph")}
        className="w-full mb-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        Add Paragraph
      </button>

      <button
        onClick={() => onAddElement("button")}
        className="w-full mb-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
      >
        Add Button
      </button>

      <div className="mt-4">
        <label className="block mb-1">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-yellow-400 mb-2">Stock Images</h3>
        <div className="grid grid-cols-2 gap-2">
          {stockImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="stock"
              className="cursor-pointer rounded border border-gray-700 hover:border-yellow-400"
              onClick={() => onSelectStockImage(img)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbox;

