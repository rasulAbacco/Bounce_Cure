
// src/pages/EditorPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';


import CanvasArea from "../components/Editor/CanvasArea";
import Toolbox from "../components/Editor/Toolbox";
import PropertiesPanel from "../components/Editor/PropertiesPanel";

const EditorPage = () => {
  const location = useLocation();
  const template = location.state?.template;

  // Shared state for pages
  const [pages, setPages] = useState([{ id: 1, elements: [] }]);
  const [activePage, setActivePage] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Load template if provided
  useEffect(() => {
    if (template && template.content) {
      const templateElements = template.content.map((item, index) => ({
        id: `template-${index}`,
        type: item.type === 'text' ? 'heading' : item.type,
        content: item.value || item.content || '',
        src: item.type === 'image' ? item.value : null,
        x: 50 + (index * 20),
        y: 50 + (index * 80),
        width: item.type === 'text' ? 300 : item.type === 'image' ? 200 : 150,
        height: item.type === 'text' ? 40 : item.type === 'image' ? 150 : 100,
        style: item.style || {},
        fontSize: item.style?.fontSize || 24,
        color: item.style?.color || '#000000',
        backgroundColor: item.style?.backgroundColor || '#4ECDC4',
        fontFamily: 'Arial',
        rotation: 0,
        opacity: 1
      }));
      
      const updatedPages = [...pages];
      updatedPages[0].elements = templateElements;
      setPages(updatedPages);
    }
  }, [template]);

  // Add element from Toolbox
const handleAddElement = (type) => {
  const newElement = {
    id: crypto.randomUUID(),
    type,
    content: type === "heading" ? "Heading" : type === "paragraph" ? "Paragraph text" : type === "button" ? "Click Me" : "",
    src: type === "image" ? "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop" : null,
    x: 50 + Math.random() * 100,
    y: 50 + Math.random() * 100,
    width: type === "heading" || type === "paragraph" ? 200 : type === "image" ? 150 : 120,
    height: type === "heading" ? 40 : type === "paragraph" ? 60 : type === "image" ? 100 : 40,
    fontSize: type === "heading" ? 24 : 16,
    fontFamily: 'Arial',
    color: '#000000',
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: type === "rectangle" || type === "circle" ? 2 : 0,
    borderRadius: type === "button" ? 6 : type === "rectangle" ? 4 : 0,
    rotation: 0,
    opacity: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    textDecoration: 'none'
  };
  
  const updatedPages = [...pages];
  updatedPages[activePage].elements.push(newElement);
  setPages(updatedPages);
  setSelectedElement(newElement.id);
  saveToUndoStack();
};

  // Upload image
  const handleUploadImage = (src) => {
    const newElement = {
      id: crypto.randomUUID(),
      type: "image",
      src,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      width: 150,
      height: 100,
      rotation: 0,
      opacity: 1,
      borderRadius: 0
    };
    
    const updatedPages = [...pages];
    updatedPages[activePage].elements.push(newElement);
    setPages(updatedPages);
    setSelectedElement(newElement.id);
    saveToUndoStack();
  };

  // Update elements after drag/resize/edit
  const handleUpdate = (updatedElements) => {
    const updatedPages = [...pages];
    updatedPages[activePage].elements = updatedElements;
    setPages(updatedPages);
  };

  // Update single element
  const updateElement = (id, updates) => {
    const updatedPages = [...pages];
    updatedPages[activePage].elements = updatedPages[activePage].elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    setPages(updatedPages);
  };

  // Undo/Redo functionality
  const saveToUndoStack = () => {
    setUndoStack(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(pages))]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [JSON.parse(JSON.stringify(pages)), ...prev.slice(0, 19)]);
      setPages(previousState);
      setUndoStack(prev => prev.slice(0, -1));
      setSelectedElement(null);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      setUndoStack(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(pages))]);
      setPages(nextState);
      setRedoStack(prev => prev.slice(1));
      setSelectedElement(null);
    }
  };

  // Delete selected element
  const deleteElement = () => {
    if (selectedElement) {
      const updatedPages = [...pages];
      updatedPages[activePage].elements = updatedPages[activePage].elements.filter(
        el => el.id !== selectedElement
      );
      setPages(updatedPages);
      setSelectedElement(null);
      saveToUndoStack();
    }
  };

  // Duplicate element
  const duplicateElement = () => {
    if (selectedElement) {
      const element = pages[activePage].elements.find(el => el.id === selectedElement);
      if (element) {
        const duplicated = {
          ...element,
          id: crypto.randomUUID(),
          x: element.x + 20,
          y: element.y + 20
        };
        const updatedPages = [...pages];
        updatedPages[activePage].elements.push(duplicated);
        setPages(updatedPages);
        setSelectedElement(duplicated.id);
        saveToUndoStack();
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Toolbox */}
      <Toolbox
        onAddElement={handleAddElement}
        onUploadImage={handleUploadImage}
        onSelectStockImage={handleUploadImage}
        selectedElement={selectedElement}
        onUndo={undo}
        onRedo={redo}
        onDelete={deleteElement}
        onDuplicate={duplicateElement}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
      />

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <CanvasArea
          pages={pages}
          setPages={setPages}
          activePage={activePage}
          setActivePage={setActivePage}
          onUpdate={handleUpdate}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          updateElement={updateElement}
          zoomLevel={zoomLevel}
          showGrid={showGrid}
        />
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        elements={pages[activePage].elements}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        updateElement={updateElement}
        setElements={(updatedElements) => handleUpdate(updatedElements)}
      />
    </div>
  );
};

export default EditorPage;