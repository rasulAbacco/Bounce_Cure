// File: CustomFields/CustomFieldsDropdown.jsx (Updated)
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomFieldsDropdown({ onSelect, selectedField, placeholder = "Select a custom field", disabled = false }) {
  const [customFields, setCustomFields] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchRecordTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_VRI_URL}/api/custom/record-types`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const types = await response.json();
        const fields = types.map(type => ({ name: type, fields: [] }));
        setCustomFields(fields);
      } catch (err) {
        console.error('Error fetching record types:', err);
        
        // Fallback to localStorage
        const saved = localStorage.getItem('customFields');
        const fields = saved ? JSON.parse(saved) : [];
        setCustomFields(fields);
      }
    };
    
    fetchRecordTypes();
  }, []);

  const handleSelect = (field) => {
    onSelect(field);
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-2 bg-gray-800 border border-gray-700 rounded text-sm focus:ring-1 focus:ring-yellow-500 outline-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span>{selectedField ? selectedField.name : placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
          {customFields.length === 0 ? (
            <div className="p-2 text-gray-400 text-center">No custom fields available</div>
          ) : (
            customFields.map((field, index) => (
              <div
                key={index}
                onClick={() => handleSelect(field)}
                className={`p-2 hover:bg-gray-800 cursor-pointer ${selectedField?.name === field.name ? 'bg-gray-800' : ''}`}
              >
                {field.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}