import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, X, Database, AlertCircle, Upload, FileText, Image, File, CheckCircle, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { VscJson } from "react-icons/vsc";
import { TbFileText } from "react-icons/tb";
import { FiDownload } from "react-icons/fi";

// Helper function to extract numeric ID from formatted ID
const getNumericId = (id) => {
  if (typeof id === 'number') return id;
  const match = String(id).match(/\d+/);
  return match ? parseInt(match[0], 10) : id;
};

// Helper function to format ID as LST-001
const formatListId = (id) => {
  if (typeof id === 'string' && id.startsWith('LST-')) {
    return id; // Already formatted
  }
  const numericId = typeof id === 'number' ? id : parseInt(id, 10);
  return `LST-${String(numericId).padStart(3, '0')}`;
};

const CreateListModal = ({ onClose, onListCreated, editData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: editData?.name || "",
    count: editData?.count || "",
    email: editData?.email || "",
    phone: editData?.phone || ""
  });

  // Update form data when editData changes
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        count: editData.count || "",
        email: editData.email || "",
        phone: editData.phone || ""
      });
    } else {
      setFormData({
        name: "",
        count: "",
        email: "",
        phone: ""
      });
    }
  }, [editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.target;
      const fileInput = form.file;
      const hasFile = fileInput && fileInput.files.length > 0;
      
      let body;
      let headers = {};
      
      if (hasFile) {
        // Use FormData for file upload
        body = new FormData(form);
        // Don't include ID in FormData - it will be in the URL
      } else {
        // Use JSON for non-file updates
        body = JSON.stringify({
          name: formData.name,
          count: parseInt(formData.count, 10),
          email: formData.email,
          phone: formData.phone,
        });
        headers = {
          'Content-Type': 'application/json'
        };
      }
      
      // Use the full formatted ID for URL (e.g., "LST-001")
      const url = editData
        ? `http://localhost:5000/lists/${editData.id}`
        : "http://localhost:5000/lists";
      const method = editData ? "PUT" : "POST";
      
      console.log(`Sending ${method} request to:`, url);
      console.log("Request body:", body);
      
      const response = await fetch(url, {
        method,
        body,
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editData ? 'update' : 'create'} list: ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`✅ ${editData ? 'Updated' : 'Created'} list:`, data);
      
      if (editData) {
        onListCreated(data, true); // true indicates this is an update
      } else {
        onListCreated(data);
      }
      
      onClose();
    } catch (error) {
      console.error(`❌ Error ${editData ? 'updating' : 'saving'} list:`, error);
      alert(`Error ${editData ? 'updating' : 'creating'} list: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
          <h3 className="text-lg font-bold">
            {editData ? "Edit List" : "Create New List"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-4" encType="multipart/form-data">
          {editData && (
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <input
                type="text"
                value={editData.id}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">List Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contacts Count</label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
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
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#154c7c] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload File (Optional)</label>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (editData ? "Update" : "Create")}
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
          // Ensure all IDs are properly formatted
          const normalizedLists = parsedLists.map(list => ({
            ...list,
            id: formatListId(list.id)
          }));
          setLists(normalizedLists);
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
    (list) => {
      const lowerSearch = search.toLowerCase();
      // Ensure all values are strings before calling toLowerCase()
      const id = String(list.id || '').toLowerCase();
      const name = String(list.name || '').toLowerCase();
      const email = String(list.email || '').toLowerCase();
      const phone = String(list.phone || '').toLowerCase();
      return (
        name.includes(lowerSearch) ||
        id.includes(lowerSearch) ||
        email.includes(lowerSearch) ||
        phone.includes(lowerSearch)
      );
    }
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle list deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        // Use the full formatted ID for URL (e.g., "LST-001")
        const response = await fetch(`http://localhost:5000/lists/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete list from server");
        }
        // If successful, update local state
        setLists(lists.filter((l) => l.id !== id));
        console.log("✅ Deleted list:", id);
      } catch (error) {
        console.error("❌ Error deleting list:", error);
        // If backend deletion fails, still remove from local state
        setLists(lists.filter((l) => l.id !== id));
        alert("List deleted locally, but there was an issue with the server.");
      }
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

  // View file data for a list
  const handleViewFile = async (listId) => {
    try {
      // Extract numeric ID for the files endpoint (which expects a number)
      const numericId = getNumericId(listId);
      
      const response = await fetch(`http://localhost:5000/lists/files/${numericId}`);
      if (!response.ok) throw new Error("Failed to fetch file");
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        setViewData({
          type: "json",
          data: jsonData,
          listId
        });
      } else if (contentType && contentType.includes('text/csv')) {
        const text = await response.text();
        const parsedCsv = Papa.parse(text, { header: true });
        setViewData({
          type: "csv",
          data: parsedCsv.data,
          listId
        });
      } else if (contentType && contentType.startsWith('image/')) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setViewData({
          type: "image",
          data: imageUrl,
          listId
        });
      } else {
        const text = await response.text();
        setViewData({
          type: "text",
          data: text,
          listId
        });
      }
    } catch (err) {
      console.error("❌ Error fetching file:", err);
      alert(`Error fetching file: ${err.message}`);
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
            // Validate imported data structure and format IDs
            const normalizedData = importedData.map(item => ({
              ...item,
              id: formatListId(item.id)
            }));
            if (normalizedData.some(item => !item.id || !item.name)) {
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
              data: normalizedData,
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
        const idMatch = String(list.id).match(/LST-(\d+)/);
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
  const handleListFileUpload = async (e, listId) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // First, get the current list data
      const listResponse = await fetch(`http://localhost:5000/lists/${listId}`);
      if (!listResponse.ok) {
        throw new Error("Failed to fetch list data");
      }
      const listData = await listResponse.json();
      
      // Create FormData with the current list data and the new file
      const formData = new FormData();
      formData.append('name', listData.name);
      formData.append('count', listData.count);
      formData.append('email', listData.email);
      formData.append('phone', listData.phone);
      formData.append('file', file);
      
      const response = await fetch(`http://localhost:5000/lists/${listId}`, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      
      const result = await response.json();
      console.log("✅ File uploaded:", result);
      
      // Update the list in state
      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, uploadedFile: { name: file.name, size: file.size, type: file.type } }
          : list
      ));
      
      alert(`File uploaded successfully for list ${listId}!`);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert(`Error uploading file: ${error.message}`);
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

  // Function to handle when a new list is created or updated
  const handleListCreated = (newList, isUpdate = false) => {
    // Format the ID to ensure it's in LST-001 format
    const formattedId = formatListId(newList.id);
    
    const listWithCreated = {
      ...newList,
      id: formattedId,
      created: newList.created || new Date().toISOString().split("T")[0]
    };
    
    if (isUpdate) {
      // Update existing list
      setLists(prevLists =>
        prevLists.map(list => list.id === formattedId ? listWithCreated : list)
      );
    } else {
      // Add new list
      setLists(prevLists => [...prevLists, listWithCreated]);
      // Update nextId if the new list's ID is in the expected format
      const idMatch = formattedId.match(/LST-(\d+)/);
      if (idMatch) {
        const newIdNum = parseInt(idMatch[1], 10);
        setNextId(prevId => Math.max(prevId, newIdNum + 1));
      }
    }
  };

  // Handle viewing a list and its file data
  const handleViewList = async (list) => {
    let uploadedFileData = null;
    if (list.uploadedFile) {
      try {
        // Extract numeric ID for the files endpoint (which expects a number)
        const numericId = getNumericId(list.id);
        
        const res = await fetch(`http://localhost:5000/lists/files/${numericId}`);
        if (!res.ok) throw new Error("Failed to fetch file");
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonData = await res.json();
          uploadedFileData = { previewType: "json", data: jsonData };
        } else if (contentType && contentType.includes('text/csv')) {
          const text = await res.text();
          const parsedCsv = Papa.parse(text, { header: true });
          uploadedFileData = { previewType: "contacts", contacts: parsedCsv.data };
        } else if (contentType && contentType.startsWith('image/')) {
          const blob = await res.blob();
          const imageUrl = URL.createObjectURL(blob);
          uploadedFileData = { previewType: "image", data: imageUrl };
        } else {
          const text = await res.text();
          uploadedFileData = { previewType: "text", raw: text };
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
              <button className="flex items-center px-3 py-2 cursor-pointer bg-gray-900 text-white border border-gray-600 rounded-lg hover:bg-gray-800 hover:scale-[1.02] transition-all text-sm">
                <FiDownload className="mr-2 text-green-400" size={16} /> Download
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-black rounded-lg shadow-lg py-1 invisible group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={exportAsExcel}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <FileSpreadsheet className="mr-2 text-green-500" size={16} /> Export as Excel
                </button>
                <button
                  onClick={exportAsText}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <TbFileText className="mr-2 text-blue-400" size={16} /> Export as Text
                </button>
                <button
                  onClick={exportAsJSON}
                  className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors"
                >
                  <VscJson className="mr-2 text-yellow-400" size={16} /> Export as JSON
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
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
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
                className="w-full px-4 py-2 pl-10 rounded-lg border border-[#c2831f] bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-[#EAA64D] focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {/* Table */}
            <div className="overflow-x-auto bg-gray-900 rounded-lg shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white text-left text-lg font-semibold text-black">
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
                      className={`border-t border-gray-600 ${index % 2 === 0 ? "bg-black" : "bg-black"
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
                          onClick={() => handleViewList(list)}
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
                  onClick={() => {
                    setEditData(null);
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#0f3659] transition-colors"
                >
                  Create your first list
                </button>
              </div>
            )}
          </>
        )}
        {/* Create/Edit Modal */}
        {modalOpen && (
          <CreateListModal
            onClose={() => {
              setModalOpen(false);
              setEditData(null);
            }}
            onListCreated={handleListCreated}
            editData={editData}
          />
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
                  {viewData.type ? (
                    <>
                      {getFileIcon(viewData.type)}
                      {viewData.name || "File Data"}
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 text-blue-500" size={20} />
                      List Details
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setViewData(null)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              {/* If viewing a list */}
              {viewData.id && !viewData.type && (
                <>
                  {/* List Details Table */}
                  <div className="overflow-x-auto mb-6">
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
                  {/* Uploaded File Section */}
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
                                {Object.keys(viewData.uploadedFile.contacts[0] || {}).map((key, index) => (
                                  <th key={index} className="px-3 py-2">{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {viewData.uploadedFile.contacts.map((contact, index) => (
                                <tr
                                  key={index}
                                  className={`border-t border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                >
                                  {Object.values(contact).map((value, valIndex) => (
                                    <td key={valIndex} className="px-3 py-2">{value}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : viewData.uploadedFile.previewType === "json" ? (
                        <pre className="bg-gray-100 p-3 rounded-lg text-sm max-h-[300px] overflow-y-auto">
                          {JSON.stringify(viewData.uploadedFile.data, null, 2)}
                        </pre>
                      ) : viewData.uploadedFile.previewType === "image" ? (
                        <div className="flex justify-center">
                          <img
                            src={viewData.uploadedFile.data}
                            alt="Uploaded content"
                            className="max-w-full max-h-[300px] object-contain"
                          />
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
                </>
              )}
              {/* If viewing uploaded data */}
              {viewData.type && (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    <p>File: {viewData.name}</p>
                    <p>Size: {viewData.size}</p>
                    {viewData.mimeType && <p>Type: {viewData.mimeType}</p>}
                  </div>
                  {viewData.type === 'json' && (
                    <pre className="bg-gray-100 p-3 rounded-lg text-sm max-h-[400px] overflow-y-auto">
                      {JSON.stringify(viewData.data, null, 2)}
                    </pre>
                  )}
                  {viewData.type === 'text' && (
                    <pre className="bg-gray-100 p-3 rounded-lg text-sm max-h-[400px] overflow-y-auto">
                      {viewData.data}
                    </pre>
                  )}
                  {viewData.type === 'image' && (
                    <div className="flex justify-center">
                      <img
                        src={viewData.data}
                        alt="Uploaded content"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                  )}
                  {viewData.type === 'binary' && (
                    <div className="bg-gray-100 p-3 rounded-lg text-sm">
                      <p>Binary file data cannot be displayed.</p>
                      <p className="mt-2">File information:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Name: {viewData.name}</li>
                        <li>Size: {viewData.size}</li>
                        <li>Type: {viewData.mimeType || 'Unknown'}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {/* Footer */}
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
    </div >
  );
};

export default Lists;