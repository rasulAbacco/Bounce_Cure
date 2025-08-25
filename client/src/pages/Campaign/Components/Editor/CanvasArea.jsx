// // src/components/Editor/CanvasArea.jsx
// import React, { useState } from "react";
// import { Rnd } from "react-rnd";
// import { Eye, X } from "lucide-react";

// export default function CanvasArea({
//   pages,
//   setPages,
//   activePage,
//   setActivePage,
//   selectedElement,
//   setSelectedElement,
//   updateElement,
//   zoomLevel,
//   showGrid,
// }) {
//   const [preview, setPreview] = useState(false);

//   // Add a new page
//   const addPage = () => {
//     const newPage = { id: pages.length + 1, elements: [] };
//     setPages([...pages, newPage]);
//     setActivePage(pages.length);
//   };

//   // Delete current page
//   const deletePage = () => {
//     if (pages.length > 1) {
//       const newPages = pages.filter((_, i) => i !== activePage);
//       setPages(newPages);
//       setActivePage(Math.max(0, activePage - 1));
//     }
//   };

//   return (
//     <div className="flex-1 bg-gray-900 p-6 overflow-auto relative">
//       {/* Top Controls */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex gap-2">
//           {pages.map((p, idx) => (
//             <button
//               key={p.id}
//               onClick={() => setActivePage(idx)}
//               className={`px-4 py-2 rounded ${
//                 idx === activePage ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"
//               }`}
//             >
//               Page {p.id}
//             </button>
//           ))}
//           <button
//             onClick={addPage}
//             className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
//           >
//             + Add Page
//           </button>
//           {pages.length > 1 && (
//             <button
//               onClick={deletePage}
//               className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
//             >
//               – Delete Page
//             </button>
//           )}
//         </div>

//         <button
//           onClick={() => setPreview(!preview)}
//           className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded flex items-center gap-2 shadow-lg"
//         >
//           {preview ? (
//             <>
//               <X size={18} /> Close Preview
//             </>
//           ) : (
//             <>
//               <Eye size={18} /> Preview
//             </>
//           )}
//         </button>
//       </div>

//       {/* Edit Mode */}
//       {!preview && (
//         <div
//           className="relative border-2 border-dashed border-gray-600 rounded bg-white mx-auto"
//           style={{
//             width: `${800 * zoomLevel}px`,
//             height: `${600 * zoomLevel}px`,
//             backgroundImage: showGrid
//               ? "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)"
//               : "none",
//             backgroundSize: showGrid ? "20px 20px" : "none",
//           }}
//         >
//           {pages[activePage].elements.map((el) => (
//             <Rnd
//               key={el.id}
//               size={{ width: el.width, height: el.height }}
//               position={{ x: el.x, y: el.y }}
//               bounds="parent"
//               onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
//               onResizeStop={(e, dir, ref, delta, pos) =>
//                 updateElement(el.id, {
//                   width: parseInt(ref.style.width, 10),
//                   height: parseInt(ref.style.height, 10),
//                   ...pos,
//                 })
//               }
//               onClick={() => setSelectedElement(el.id)}
//               style={{
//                 border: selectedElement === el.id ? "2px solid #3b82f6" : "none",
//               }}
//             >
//               {/* Render element by type */}
//               {el.type === "heading" && (
//                 <h2
//                   style={{
//                     fontSize: el.fontSize,
//                     fontFamily: el.fontFamily,
//                     color: el.color,
//                     fontWeight: el.fontWeight,
//                     fontStyle: el.fontStyle,
//                     textAlign: el.textAlign,
//                     textDecoration: el.textDecoration,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                   className="w-full h-full p-1"
//                   contentEditable
//                   suppressContentEditableWarning
//                   onInput={(e) => updateElement(el.id, { content: e.currentTarget.textContent })}
//                 >
//                   {el.content || "Heading"}
//                 </h2>
//               )}

//               {el.type === "paragraph" && (
//                 <p
//                   style={{
//                     fontSize: el.fontSize,
//                     fontFamily: el.fontFamily,
//                     color: el.color,
//                     textAlign: el.textAlign,
//                     textDecoration: el.textDecoration,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                   className="w-full h-full p-1"
//                   contentEditable
//                   suppressContentEditableWarning
//                   onInput={(e) => updateElement(el.id, { content: e.currentTarget.textContent })}
//                 >
//                   {el.content || "Paragraph text"}
//                 </p>
//               )}

//               {el.type === "button" && (
//                 <button
//                   style={{
//                     backgroundColor: el.backgroundColor,
//                     color: el.color,
//                     borderRadius: el.borderRadius,
//                     fontSize: el.fontSize,
//                     fontWeight: el.fontWeight,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                   className="w-full h-full"
//                   contentEditable
//                   suppressContentEditableWarning
//                   onInput={(e) => updateElement(el.id, { content: e.currentTarget.textContent })}
//                 >
//                   {el.content || "Click Me"}
//                 </button>
//               )}

//               {el.type === "rectangle" && (
//                 <div
//                   className="w-full h-full"
//                   style={{
//                     backgroundColor: el.backgroundColor,
//                     border: `${el.borderWidth}px solid ${el.borderColor}`,
//                     borderRadius: `${el.borderRadius}px`,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                 />
//               )}

//               {el.type === "circle" && (
//                 <div
//                   className="w-full h-full rounded-full"
//                   style={{
//                     backgroundColor: el.backgroundColor,
//                     border: `${el.borderWidth}px solid ${el.borderColor}`,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                 />
//               )}

//               {el.type === "line" && (
//                 <div
//                   style={{
//                     width: "100%",
//                     height: el.strokeWidth,
//                     backgroundColor: el.strokeColor,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                 />
//               )}

//               {el.type === "image" && (
//                 <img
//                   src={el.src}
//                   alt="uploaded"
//                   className="w-full h-full object-contain"
//                   style={{
//                     borderRadius: `${el.borderRadius || 0}px`,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                 />
//               )}

//               {el.type === "video" && (
//                 <video
//                   controls
//                   className="w-full h-full object-cover"
//                   style={{
//                     borderRadius: `${el.borderRadius || 0}px`,
//                     transform: `rotate(${el.rotation}deg)`,
//                     opacity: el.opacity,
//                   }}
//                 >
//                   <source src={el.src || ""} type="video/mp4" />
//                 </video>
//               )}
//             </Rnd>
//           ))}
//         </div>
//       )}

//       {/* Preview Mode */}
//       {preview && (
//         <div className="bg-white p-8 rounded shadow-lg min-h-[600px] mx-auto w-[800px]">
//           {pages[activePage].elements.length === 0 && (
//             <p className="text-gray-500 italic">This page is empty</p>
//           )}
//           {pages[activePage].elements.map((el) => (
//             <div key={el.id} className="mb-4">
//               {el.type === "heading" && (
//                 <h2 style={{ fontSize: el.fontSize, fontWeight: el.fontWeight }}>{el.content}</h2>
//               )}
//               {el.type === "paragraph" && <p>{el.content}</p>}
//               {el.type === "button" && (
//                 <button className="bg-yellow-400 text-black px-4 py-2 rounded">{el.content}</button>
//               )}
//               {el.type === "rectangle" && (
//                 <div
//                   className="w-32 h-20"
//                   style={{
//                     backgroundColor: el.backgroundColor,
//                     border: `${el.borderWidth}px solid ${el.borderColor}`,
//                     borderRadius: `${el.borderRadius}px`,
//                   }}
//                 />
//               )}
//               {el.type === "circle" && (
//                 <div
//                   className="w-20 h-20 rounded-full"
//                   style={{
//                     backgroundColor: el.backgroundColor,
//                     border: `${el.borderWidth}px solid ${el.borderColor}`,
//                   }}
//                 />
//               )}
//               {el.type === "line" && (
//                 <div
//                   className="w-40"
//                   style={{ height: el.strokeWidth, backgroundColor: el.strokeColor }}
//                 />
//               )}
//               {el.type === "image" && (
//                 <img src={el.src} alt="uploaded" className="max-w-full max-h-60 object-contain" />
//               )}
//               {el.type === "video" && (
//                 <video controls className="max-w-full max-h-60 object-cover">
//                   <source src={el.src || ""} type="video/mp4" />
//                 </video>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/Editor/CanvasArea.jsx
import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { Eye, X, Plus, Download, Play, Layers } from "lucide-react";

export default function CanvasArea({ 
  pages, 
  setPages, 
  activePage, 
  setActivePage, 
  onUpdate, 
  selectedElement, 
  setSelectedElement, 
  updateElement,
  zoomLevel = 1,
  showGrid = true
}) {
  const [preview, setPreview] = useState(false);
  const canvasRef = useRef(null);

  const addPage = () => {
    const newPage = { id: pages.length + 1, elements: [] };
    setPages([...pages, newPage]);
    setActivePage(pages.length);
  };

  const deletePage = (pageIndex) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      setPages(updatedPages);
      if (activePage >= updatedPages.length) {
        setActivePage(updatedPages.length - 1);
      }
    }
  };

  const handleElementClick = (elementId, e) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-background')) {
      setSelectedElement(null);
    }
  };

  const handleElementUpdate = (elementId, newProps) => {
    updateElement(elementId, newProps);
    const updatedElements = pages[activePage].elements.map(el =>
      el.id === elementId ? { ...el, ...newProps } : el
    );
    onUpdate(updatedElements);
  };

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    
    return (
      <Rnd
        key={element.id}
        default={{
          x: element.x || 50,
          y: element.y || 50,
          width: element.width || "auto",
          height: element.height || "auto",
        }}
        position={{ x: element.x * zoomLevel, y: element.y * zoomLevel }}
        size={{ 
          width: element.width * zoomLevel, 
          height: element.height * zoomLevel 
        }}
        bounds="parent"
        onDragStop={(e, d) => {
          handleElementUpdate(element.id, { 
            x: d.x / zoomLevel, 
            y: d.y / zoomLevel 
          });
        }}
        onResizeStop={(e, dir, ref, delta, pos) => {
          handleElementUpdate(element.id, {
            width: parseInt(ref.style.width) / zoomLevel,
            height: parseInt(ref.style.height) / zoomLevel,
            x: pos.x / zoomLevel,
            y: pos.y / zoomLevel,
          });
        }}
        className={`${isSelected ? 'z-50' : 'z-10'}`}
      >
        <div
          className={`w-full h-full cursor-pointer border-2 transition-all ${
            isSelected 
              ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20' 
              : 'border-transparent hover:border-blue-300/50'
          }`}
          style={{
            transform: `rotate(${element.rotation || 0}deg)`,
            opacity: element.opacity || 1
          }}
          onClick={(e) => handleElementClick(element.id, e)}
        >
          {/* Text Elements */}
          {(element.type === "heading" || element.type === "paragraph") && (
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning
              className={`w-full h-full p-2 outline-none ${
                element.type === "heading" ? "font-bold" : ""
              }`}
              style={{
                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                fontFamily: element.fontFamily || 'Arial',
                color: element.color || '#000000',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'left',
                lineHeight: '1.4',
                wordWrap: 'break-word',
                backgroundColor: element.backgroundColor || 'transparent'
              }}
              onInput={(e) => handleElementUpdate(element.id, { content: e.currentTarget.textContent })}
              onBlur={() => setSelectedElement(null)}
            >
              {element.content || (element.type === "heading" ? "Heading" : "Paragraph text")}
            </div>
          )}

          {/* Button Element */}
          {element.type === "button" && (
            <div
              contentEditable={isSelected}
              suppressContentEditableWarning
              className="w-full h-full flex items-center justify-center outline-none cursor-pointer"
              style={{
                backgroundColor: element.backgroundColor || "#007bff",
                color: element.color || "#fff",
                borderRadius: `${(element.borderRadius || 6) * zoomLevel}px`,
                fontSize: `${(element.fontSize || 16) * zoomLevel}px`,
                fontFamily: element.fontFamily || 'Arial',
                fontWeight: element.fontWeight || 'normal',
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
              }}
              onInput={(e) => handleElementUpdate(element.id, { content: e.currentTarget.textContent })}
              onBlur={() => setSelectedElement(null)}
            >
              {element.content || "Click Me"}
            </div>
          )}

          {/* Rectangle Element */}
          {element.type === "rectangle" && (
            <div
              className="w-full h-full"
              style={{
                backgroundColor: element.backgroundColor || "#4ECDC4",
                border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`,
                borderRadius: `${(element.borderRadius || 4) * zoomLevel}px`
              }}
            />
          )}

          {/* Circle Element */}
          {element.type === "circle" && (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: element.backgroundColor || "#FF6B6B",
                border: `${(element.borderWidth || 2) * zoomLevel}px solid ${element.borderColor || '#000'}`
              }}
            />
          )}

          {/* Line Element */}
          {element.type === "line" && (
            <div
              className="w-full"
              style={{
                height: `${(element.strokeWidth || 3) * zoomLevel}px`,
                backgroundColor: element.strokeColor || '#000000',
                marginTop: `${((element.height * zoomLevel) - (element.strokeWidth || 3) * zoomLevel) / 2}px`
              }}
            />
          )}

          {/* Image Element */}
          {element.type === "image" && (
            <img
              src={element.src}
              alt="Canvas element"
              className="w-full h-full object-cover"
              style={{
                borderRadius: `${(element.borderRadius || 0) * zoomLevel}px`,
                border: element.borderWidth ? `${element.borderWidth * zoomLevel}px solid ${element.borderColor}` : 'none'
              }}
            />
          )}

          {/* Selection Handles */}
          {isSelected && !preview && (
            <>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize shadow-lg"></div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize shadow-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize shadow-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-lg"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-n-resize shadow-lg"></div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-s-resize shadow-lg"></div>
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-w-resize shadow-lg"></div>
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-e-resize shadow-lg"></div>
            </>
          )}
        </div>
      </Rnd>
    );
  };

  return (
    <div className="flex-1 bg-gray-700 flex flex-col overflow-hidden">
      
      {/* Top Controls */}
      <div className="h-16 bg-gray-800 border-b border-gray-600 flex items-center justify-between px-6">
        {/* Page Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
            {pages.map((page, idx) => (
              <div key={page.id} className="flex items-center">
                <button
                  onClick={() => setActivePage(idx)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    idx === activePage 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-300 hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  Page {page.id}
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(idx);
                    }}
                    className="ml-1 p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={addPage}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <Plus size={16} />
            Add Page
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Layers size={16} />
            <span>{pages[activePage].elements.length} elements</span>
          </div>
          
          <div className="w-px h-6 bg-gray-600"></div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Play size={16} />
            Animate
          </button>
          
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              preview 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {preview ? (
              <>
                <X size={16} />
                Exit Preview
              </>
            ) : (
              <>
                <Eye size={16} />
                Preview
              </>
            )}
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-700 p-8" onClick={handleCanvasClick}>
        <div className="flex justify-center">
          <div 
            ref={canvasRef}
            className={`canvas-background relative bg-white shadow-2xl rounded-lg overflow-hidden ${
              preview ? '' : 'ring-1 ring-gray-400/20'
            }`}
            style={{ 
              width: 800 * zoomLevel, 
              height: 600 * zoomLevel,
              backgroundImage: showGrid && !preview ? `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: showGrid && !preview ? `${20 * zoomLevel}px ${20 * zoomLevel}px` : 'none'
            }}
          >
            {/* Edit Mode */}
            {!preview && pages[activePage].elements.map(element => renderElement(element))}

            {/* Preview Mode */}
            {preview && (
              <div className="p-8 h-full overflow-y-auto">
                {pages[activePage].elements.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-xl">This page is empty</p>
                      <p className="text-sm mt-2">Add some elements to see them here</p>
                    </div>
                  </div>
                )}
                
                {pages[activePage].elements
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map(element => (
                    <div key={element.id} className="mb-4" style={{
                      transform: `rotate(${element.rotation || 0}deg)`,
                      opacity: element.opacity || 1
                    }}>
                      {(element.type === "heading" || element.type === "paragraph") && (
                        <div
                          className={element.type === "heading" ? "font-bold" : ""}
                          style={{
                            fontSize: element.fontSize || 16,
                            fontFamily: element.fontFamily || 'Arial',
                            color: element.color || '#000000',
                            fontWeight: element.fontWeight || 'normal',
                            fontStyle: element.fontStyle || 'normal',
                            textDecoration: element.textDecoration || 'none',
                            textAlign: element.textAlign || 'left',
                            backgroundColor: element.backgroundColor || 'transparent'
                          }}
                        >
                          {element.content || (element.type === "heading" ? "Heading" : "Paragraph text")}
                        </div>
                      )}
                      
                      {element.type === "button" && (
                        <button
                          className="font-medium cursor-pointer"
                          style={{
                            backgroundColor: element.backgroundColor || "#007bff",
                            color: element.color || "#fff",
                            padding: "12px 24px",
                            borderRadius: element.borderRadius || 6,
                            fontSize: element.fontSize || 16,
                            fontFamily: element.fontFamily || 'Arial',
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                        >
                          {element.content || "Click Me"}
                        </button>
                      )}
                      
                      {element.type === "rectangle" && (
                        <div
                          style={{
                            width: element.width || 100,
                            height: element.height || 100,
                            backgroundColor: element.backgroundColor || "#4ECDC4",
                            border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`,
                            borderRadius: element.borderRadius || 4
                          }}
                        />
                      )}
                      
                      {element.type === "circle" && (
                        <div
                          className="rounded-full"
                          style={{
                            width: element.width || 100,
                            height: element.height || 100,
                            backgroundColor: element.backgroundColor || "#FF6B6B",
                            border: `${element.borderWidth || 2}px solid ${element.borderColor || '#000'}`
                          }}
                        />
                      )}
                      
                      {element.type === "line" && (
                        <div
                          style={{
                            width: element.width || 150,
                            height: element.strokeWidth || 3,
                            backgroundColor: element.strokeColor || '#000000'
                          }}
                        />
                      )}
                      
                      {element.type === "image" && (
                        <img
                          src={element.src}
                          alt="Preview element"
                          style={{
                            maxWidth: element.width || 200,
                            maxHeight: element.height || 150,
                            borderRadius: element.borderRadius || 0,
                            border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                          }}
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Empty State */}
            {!preview && pages[activePage].elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-xl font-medium">Start Creating</p>
                  <p className="text-sm mt-2">Use the toolbox to add elements to your design</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
