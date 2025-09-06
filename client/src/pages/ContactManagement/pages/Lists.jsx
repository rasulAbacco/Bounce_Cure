import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, X, Database, AlertCircle, Upload, FileText, Image, File, CheckCircle, FileSpreadsheet } from "lucide-react";
  import Papa from "papaparse";
const CreateListModal = ({ onClose, onListCreated }) => {
  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const response = await fetch("http://localhost:5000/lists", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to create list");
      }
      const data = await response.json();
      console.log("✅ Created list:", data);
      onListCreated(data); // ✅ Pass the new list to parent component
      onClose(); // ✅ close modal
    } catch (error) {
      console.error("❌ Error saving list:", error);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Create New List</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4" encType="multipart/form-data">
  <div>
    <label className="block text-sm font-medium mb-1">List Name</label>
    <input
      type="text"
      name="name"
      required
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Contacts Count</label>
    <input
      type="number"
      name="count"
      required
      min="0"
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Email</label>
    <input
      type="email"
      name="email"
      required
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Phone</label>
    <input
      type="tel"
      name="phone"
      required
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
    />
  </div>

  {/* ✅ File Upload Field */}
  <div>
    <label className="block text-sm font-medium mb-1">Upload File</label>
    <input
      type="file"
      name="file"
      accept=".json,.csv,.txt,image/*"
      className="w-full px-3 py-2 border rounded-lg bg-white text-black focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
    />
  </div>

  <div className="flex justify-end space-x-2 pt-2">
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
    >
      Create
    </button>
  </div>
</form>

      </div>
    </div>
  );
};

const Lists = () => {
  // State management
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [storageStatus, setStorageStatus] = useState({ available: true, message: "" });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({ visible: false, success: false, message: "" });
  const [uploadedData, setUploadedData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Initialize data from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedLists = localStorage.getItem("listsData");
      const savedNextId = localStorage.getItem("nextId");
      
      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        if (Array.isArray(parsedLists)) {
          setLists(parsedLists);
        }
      }
      if (savedNextId) {
        const parsedId = parseInt(savedNextId, 10);
        if (!isNaN(parsedId)) {
          setNextId(parsedId);
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      setStorageStatus({
        available: false,
        message: "Failed to access browser storage. Data won't be saved."
      });
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, []);
  
  // Save data to localStorage whenever lists or nextId changes
  useEffect(() => {
    if (!isInitialized || !storageStatus.available) return;
    
    try {
      localStorage.setItem("listsData", JSON.stringify(lists));
      localStorage.setItem("nextId", nextId.toString());
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      setStorageStatus({
        available: false,
        message: "Failed to save data to local storage."
      });
    }
  }, [lists, nextId, storageStatus.available, isInitialized]);
  
  // Filter lists based on search term
  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(search.toLowerCase()) ||
      list.id.toLowerCase().includes(search.toLowerCase()) ||
      list.email.toLowerCase().includes(search.toLowerCase()) ||
      list.phone.includes(search)
  );
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle form submission (create/edit)
  const handleSave = (e) => {
    e.preventDefault();
    const form = e.target;
    
    // Generate new ID if creating
    const id = editData ? editData.id : `LST-${nextId.toString().padStart(3, "0")}`;
    
    const newList = {
      id,
      name: form.name.value,
      count: parseInt(form.count.value, 10),
      email: form.email.value,
      phone: form.phone.value,
      created: editData ? editData.created : new Date().toISOString().split("T")[0],
      uploadedFile: editData ? editData.uploadedFile || null : null
    };
    if (editData) {
      // Update existing list
      setLists(lists.map((l) => (l.id === editData.id ? newList : l)));
    } else {
      // Add new list and increment nextId
      setLists([...lists, newList]);
      setNextId(nextId + 1);
    }
    
    // Reset form state
    setModalOpen(false);
    setEditData(null);
  };
  
  // Handle list deletion
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setLists(lists.filter((l) => l.id !== id));
    }
  };
  
  // Export data as JSON
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(lists, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `lists-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Export data as Excel (CSV)
  const exportAsExcel = () => {
    // Create CSV header
    let csvContent = "ID,List Name,Contacts,Email,Phone,Created\n";
    
    // Add data rows
    lists.forEach(list => {
      const row = [
        `"${list.id}"`,
        `"${list.name}"`,
        `"${list.count}"`,
        `"${list.email}"`,
        `"${list.phone}"`,
        `"${formatDate(list.created)}"`
      ].join(",");
      csvContent += row + "\n";
    });
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', `lists-${new Date().toISOString().split('T')[0]}.csv`);
    linkElement.style.visibility = 'hidden';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };
  
  // Export data as Text (TXT)
  const exportAsText = () => {
    let textContent = "LISTS DATA\n";
    textContent += "====================\n\n";
    
    lists.forEach((list, index) => {
      textContent += `List #${index + 1}\n`;
      textContent += "----------------\n";
      textContent += `ID: ${list.id}\n`;
      textContent += `List Name: ${list.name}\n`;
      textContent += `Contacts: ${list.count}\n`;
      textContent += `Email: ${list.email}\n`;
      textContent += `Phone: ${list.phone}\n`;
      textContent += `Created: ${formatDate(list.created)}\n\n`;
    });
    
    // Create Blob and download
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', `lists-${new Date().toISOString().split('T')[0]}.txt`);
    linkElement.style.visibility = 'hidden';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const handleViewFile = async (listId) => {
  try {
    const response = await fetch(`http://localhost:5000/lists/files/${listId}`);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const text = await blob.text();

    // If it's JSON, parse it
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      parsedData = text; // not JSON, maybe CSV or plain text
    }

    setViewData({
      type: typeof parsedData === "object" ? "json" : "text",
      data: parsedData,
      raw: text,
    });
  } catch (err) {
    console.error("❌ Error fetching file:", err);
  }
};

  
  // Import data from file
  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFile(file);
    const reader = new FileReader();
    
    // Handle different file types
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      // Process JSON file
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (Array.isArray(importedData)) {
            // Validate imported data structure
            if (importedData.some(item => !item.id || !item.name)) {
              setUploadStatus({
                visible: true,
                success: false,
                message: "Invalid JSON format. Some items are missing required fields."
              });
              setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
              return;
            }
            
            setUploadedData({
              type: 'json',
              data: importedData,
              name: file.name,
              size: (file.size / 1024).toFixed(2) + ' KB'
            });
            setUploadStatus({
              visible: true,
              success: true,
              message: "JSON file uploaded successfully! Click 'View Data' to see the contents."
            });
            setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
          } else {
            setUploadStatus({
              visible: true,
              success: false,
              message: "Invalid JSON format. Expected an array of lists."
            });
            setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
          }
        } catch (error) {
          setUploadStatus({
            visible: true,
            success: false,
            message: "Error parsing JSON file. Please ensure it's a valid JSON file."
          });
          setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
        }
      };
      reader.readAsText(file);
    } else if (fileType.startsWith('image/')) {
      // Process image file
      reader.onload = (event) => {
        setUploadedData({
          type: 'image',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        });
        setUploadStatus({
          visible: true,
          success: true,
          message: "Image uploaded successfully! Click 'View Data' to see the image."
        });
        setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      // Process text file
      reader.onload = (event) => {
        setUploadedData({
          type: 'text',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        });
        setUploadStatus({
          visible: true,
          success: true,
          message: "Text file uploaded successfully! Click 'View Data' to see the contents."
        });
        setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
      };
      reader.readAsText(file);
    } else {
      // Handle other file types
      reader.onload = (event) => {
        setUploadedData({
          type: 'binary',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          mimeType: fileType || 'Unknown'
        });
        setUploadStatus({
          visible: true,
          success: true,
          message: "File uploaded successfully! Click 'View Data' to see file information."
        });
        setTimeout(() => setUploadStatus(prev => ({ ...prev, visible: false })), 3000);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  // Apply uploaded data to the lists (only for JSON files)
  const applyUploadedData = () => {
    if (!uploadedData) {
      alert('No data to apply. Please upload a file first.');
      return;
    }
    
    if (uploadedData.type === 'json' && Array.isArray(uploadedData.data)) {
      setLists(uploadedData.data);
      // Find the highest ID to set nextId
      const maxId = Math.max(...uploadedData.data.map(list => {
        const idMatch = list.id.match(/LST-(\d+)/);
        return idMatch ? parseInt(idMatch[1], 10) : 0;
      }), 0);
      setNextId(maxId + 1);
      setUploadedData(null);
      setUploadedFile(null);
      alert('JSON data applied successfully!');
    } else {
      // Provide more detailed error message
      if (uploadedData.type !== 'json') {
        alert(`Cannot apply ${uploadedData.type.toUpperCase()} file to lists. Only JSON files can be applied.`);
      } else if (!Array.isArray(uploadedData.data)) {
        alert('Invalid JSON format. Expected an array of lists.');
      } else {
        alert('Unknown error. Cannot apply data to lists.');
      }
    }
  };
  
  // Handle file upload for a specific list
  const handleListFileUpload = (e, listId) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    reader.onload = (event) => {
      let fileData;
      
      if (fileType === 'application/json' || fileName.endsWith('.json')) {
        try {
          const parsedData = JSON.parse(event.target.result);
          fileData = {
            type: 'json',
            data: parsedData,
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB'
          };
        } catch (error) {
          alert('Error parsing JSON file. Please ensure it\'s a valid JSON file.');
          return;
        }
      } else if (fileType.startsWith('image/')) {
        fileData = {
          type: 'image',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        };
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        fileData = {
          type: 'text',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB'
        };
      } else {
        fileData = {
          type: 'binary',
          data: event.target.result,
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          mimeType: fileType || 'Unknown'
        };
      }
      
      // Update the list with the uploaded file
      setLists(lists.map(list => 
        list.id === listId ? { ...list, uploadedFile: fileData } : list
      ));
      
      alert(`File uploaded successfully for list ${listId}!`);
    };
    
    if (fileType.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to delete all lists? This cannot be undone.")) {
      setLists([]);
      setNextId(1);
      try {
        localStorage.removeItem("listsData");
        localStorage.removeItem("nextId");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    }
  };
  
  // Close modals when clicking outside
  const handleModalOverlayClick = (setter) => (e) => {
    if (e.target === e.currentTarget) {
      setter(null);
    }
  };
  
  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'json':
        return <FileText className="text-blue-500" size={24} />;
      case 'image':
        return <Image className="text-green-500" size={24} />;
      case 'text':
        return <FileText className="text-yellow-500" size={24} />;
      default:
        return <File className="text-gray-500" size={24} />;
    }
  };
  
  // Check if viewData is a list object
  const isListObject = (data) => {
    return data && 
           typeof data === 'object' && 
           !Array.isArray(data) && 
           !data.type && 
           data.id && 
           data.name && 
           data.count !== undefined && 
           data.email && 
           data.phone && 
           data.created;
  };
  
  // Function to handle when a new list is created
  const handleListCreated = (newList) => {
    // Ensure the new list has a created field
    const listWithCreated = {
      ...newList,
      created: newList.created || new Date().toISOString().split("T")[0]
    };
    
    // Add the new list to the state
    setLists(prevLists => [...prevLists, listWithCreated]);
    
    // Update nextId if the new list's ID is in the expected format
    const idMatch = newList.id.match(/LST-(\d+)/);
    if (idMatch) {
      const newIdNum = parseInt(idMatch[1], 10);
      setNextId(prevId => Math.max(prevId, newIdNum + 1));
    }
  };



const handleViewList = async (list) => {
  let uploadedFileData = null;

  if (list.uploadedFile) {
    try {
      const res = await fetch(`http://localhost:5000/lists/files/${list.id}`);
      if (!res.ok) throw new Error("Failed to fetch file");

      // Get file as text
      const text = await res.text();

      // Try to parse as JSON first
      try {
        const json = JSON.parse(text);
        uploadedFileData = { previewType: "json", data: json };
      } catch {
        // Try to parse CSV
        const csv = Papa.parse(text, { header: true });
        if (csv.data && csv.data.length > 0) {
          uploadedFileData = { previewType: "contacts", contacts: csv.data };
        } else {
          uploadedFileData = { previewType: "text", raw: text };
        }
      }
    } catch (err) {
      console.error("Error fetching file:", err);
    }
  }

  setViewData({
    ...list,
    uploadedFile: uploadedFileData,
  });
};

  
  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex-1 flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Database className="mr-2 text-[#EAA64D]" />
              Your Lists
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {lists.length} {lists.length === 1 ? 'list' : 'lists'} stored locally
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Export Dropdown */}
            <div className="relative group">
              <button className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                <FileSpreadsheet className="mr-1" size={16} /> Export
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg py-1 invisible group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={exportAsExcel}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <FileSpreadsheet className="mr-2" size={16} /> Export as Excel
                </button>
                <button
                  onClick={exportAsText}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <FileText className="mr-2" size={16} /> Export as Text
                </button>
                <button
                  onClick={exportAsJSON}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <File className="mr-2" size={16} /> Export as JSON
                </button>
              </div>
            </div>
            
            {uploadedData && (
              <>
                <button
                  onClick={() => setViewData(uploadedData)}
                  className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Eye className="mr-1" size={16} /> View Data
                </button>
                {uploadedData.type === 'json' && (
                  <button
                    onClick={applyUploadedData}
                    className="flex items-center px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Apply Data
                  </button>
                )}
              </>
            )}
           
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
            >
              <Plus className="mr-2" size={18} /> New List
            </button>
          </div>
        </div>
        
        {/* Upload Status Notification */}
        {uploadStatus.visible && (
          <div className={`mb-4 p-3 rounded-lg flex items-center ${uploadStatus.success ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {uploadStatus.success ? (
              <CheckCircle className="mr-2" size={18} />
            ) : (
              <AlertCircle className="mr-2" size={18} />
            )}
            <span>{uploadStatus.message}</span>
          </div>
        )}
        
        {/* Storage Status Warning */}
        {!storageStatus.available && (
          <div className="mb-6 p-3 bg-yellow-900 text-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
            <span>{storageStatus.message}</span>
          </div>
        )}
        
        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EAA64D] mb-4"></div>
              <p className="text-gray-400">Loading your lists...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search lists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#EAA64D] focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto bg-gray-900 rounded-lg shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white text-left text-sm font-semibold text-black">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">List Name</th>
                    <th className="px-4 py-3">Contacts</th>
                    <th className="px-4 py-3 hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Phone</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Created</th>
                    <th className="px-4 py-3">Upload File</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLists.map((list, index) => (
                    <tr
                      key={list.id}
                      className={`border-t border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                        } hover:bg-gray-700 transition-colors`}
                    >
                      <td className="px-4 py-3 text-sm">{list.id}</td>
                      <td className="px-4 py-3 font-medium">{list.name}</td>
                      <td className="px-4 py-3">{list.count}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{list.email}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">{list.phone}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{formatDate(list.created)}</td>
                      <td className="px-4 py-3">
                        <label className="flex items-center px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm cursor-pointer">
                          <Upload className="mr-1" size={14} />
                          <span className="hidden sm:inline">Upload</span>
                          <input 
                            type="file" 
                            onChange={(e) => handleListFileUpload(e, list.id)}
                            className="hidden" 
                          />
                        </label>
                      </td>
                      <td className="px-4 py-3 flex justify-center space-x-3">
                        <button
                          onClick={() => setViewData(list)}
                          className="text-gray-300 hover:text-white flex items-center transition-colors"
                          aria-label={`View details for ${list.name}`}
                        >
                          <Eye size={16} className="mr-1" /> <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditData(list);
                            setModalOpen(true);
                          }}
                          className="text-[#EAA64D] hover:text-yellow-400 flex items-center transition-colors"
                          aria-label={`Edit ${list.name}`}
                        >
                          <Edit size={16} className="mr-1" /> <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(list.id)}
                          className="text-red-500 hover:text-red-400 flex items-center transition-colors"
                          aria-label={`Delete ${list.name}`}
                        >
                          <Trash2 size={16} className="mr-1" /> <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty state */}
            {filteredLists.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">No lists found.</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
                >
                  Create your first list
                </button>
              </div>
            )}
          </>
        )}
        
        {/* CreateListModal - only for creating new lists */}
        {modalOpen && !editData && (
          <CreateListModal 
            onClose={() => setModalOpen(false)} 
            onListCreated={handleListCreated}
          />
        )}
        
        {/* Add/Edit Modal - only for editing existing lists */}
        {modalOpen && editData && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={handleModalOverlayClick(setModalOpen)}
          >
            <div 
              className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">
                  Edit List
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">List Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editData?.name || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contacts Count</label>
                  <input
                    type="number"
                    name="count"
                    defaultValue={editData?.count || ""}
                    required
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editData?.email || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editData?.phone || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
                  />
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setEditData(null);
                    }}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* View Modal */}
        {viewData && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    onClick={handleModalOverlayClick(setViewData)}
  >
    <div 
      className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 text-gray-800"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <FileText className="mr-2 text-blue-500" size={20} />
          List Details
        </h3>
        <button 
          onClick={() => setViewData(null)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>

      {/* --- Table for List Details --- */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200 bg-white">
              <td className="px-3 py-2 font-medium">ID</td>
              <td className="px-3 py-2">{viewData.id}</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-3 py-2 font-medium">List Name</td>
              <td className="px-3 py-2">{viewData.name}</td>
            </tr>
            <tr className="border-t border-gray-200 bg-white">
              <td className="px-3 py-2 font-medium">Contacts</td>
              <td className="px-3 py-2">{viewData.count}</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-3 py-2 font-medium">Email</td>
              <td className="px-3 py-2">{viewData.email}</td>
            </tr>
            <tr className="border-t border-gray-200 bg-white">
              <td className="px-3 py-2 font-medium">Phone</td>
              <td className="px-3 py-2">{viewData.phone}</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-3 py-2 font-medium">Created</td>
              <td className="px-3 py-2">{formatDate(viewData.created)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- Uploaded File Section --- */}
      {viewData.uploadedFile && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-3 flex items-center">
            <File className="mr-2 text-gray-500" size={16} />
            Uploaded File
          </h4>

          {/* File Preview */}
          {viewData.uploadedFile.previewType === "contacts" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {viewData.uploadedFile.contacts.map((contact, index) => (
                    <tr
                      key={index}
                      className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-3 py-2">{contact.name}</td>
                      <td className="px-3 py-2">{contact.email}</td>
                      <td className="px-3 py-2">{contact.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewData.uploadedFile.previewType === "text" ? (
            <pre className="bg-gray-100 p-3 rounded-lg text-sm max-h-[300px] overflow-y-auto">
              {viewData.uploadedFile.raw}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">Cannot preview this file type.</p>
          )}
        </div>
      )}

      {/* --- Footer --- */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() => setViewData(null)}
          className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default Lists;