import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { Eye, X, Plus } from "lucide-react";

export default function CanvasArea({ pages, setPages, activePage, setActivePage, onUpdate }) {
  const [preview, setPreview] = useState(false);

  // update elements for active page
  const updateElement = (id, newProps) => {
    const updatedPages = [...pages];
    updatedPages[activePage].elements = updatedPages[activePage].elements.map(el =>
      el.id === id ? { ...el, ...newProps } : el
    );
    setPages(updatedPages);
    onUpdate(updatedPages[activePage].elements);
  };

  // add a new blank page
  const addPage = () => {
    const newPage = { id: pages.length + 1, elements: [] };
    setPages([...pages, newPage]);
    setActivePage(pages.length); // go to new page
  };

  return (
    <div className="flex-1 bg-gray-900 p-6 overflow-auto relative">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {pages.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePage(idx)}
              className={`px-4 py-2 rounded ${
                idx === activePage ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"
              }`}
            >
              Page {p.id}
            </button>
          ))}
          <button
            onClick={addPage}
            className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            <Plus size={18} /> Add Page
          </button>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setPreview(!preview)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
        >
          {preview ? (
            <>
              <X size={18} /> Close Preview
            </>
          ) : (
            <>
              <Eye size={18} /> Preview
            </>
          )}
        </button>
      </div>

      {/* ----------- Edit Mode ----------- */}
      {!preview && (
        <div className="min-h-[600px] relative border-2 border-dashed border-gray-600 rounded bg-white">
          {pages[activePage].elements.map(el => (
            <Rnd
              key={el.id}
              default={{
                x: el.x || 50,
                y: el.y || 50,
                width: el.width || "auto",
                height: "auto",
              }}
              bounds="parent"
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, pos) =>
                updateElement(el.id, {
                  width: ref.style.width,
                  height: ref.style.height,
                  ...pos,
                })
              }
            >
              {el.type === "heading" && (
                <h2 className="text-xl font-bold">{el.content || "Heading"}</h2>
              )}
              {el.type === "paragraph" && (
                <p className="text-gray-700">{el.content || "Paragraph text"}</p>
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
                  className="max-w-full max-h-60 object-contain"
                />
              )}
            </Rnd>
          ))}
        </div>
      )}

      {/* ----------- Preview Mode ----------- */}
      {preview && (
        <div className="bg-white p-8 rounded shadow-lg min-h-[600px]">
          {pages[activePage].elements.length === 0 && (
            <p className="text-gray-500 italic">This page is empty</p>
          )}
          {pages[activePage].elements.map(el => (
            <div key={el.id} className="mb-4">
              {el.type === "heading" && (
                <h2 className="text-xl font-bold">{el.content || "Heading"}</h2>
              )}
              {el.type === "paragraph" && (
                <p className="text-gray-700">{el.content || "Paragraph text"}</p>
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
                  className="max-w-full max-h-60 object-contain"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
