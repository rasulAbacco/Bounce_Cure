// File: pages/CustomRecordsPage.jsx (FIXED VERSION)
import React, { useState, useEffect } from "react";
import { Database, Download, RefreshCw, Plus, Filter } from "lucide-react";
import CustomRecordsTable from "../CustomFields/CustomRecordsTable";
import CustomRecordModal from "../CustomFields/CustomRecordModal";
import CustomFieldsDropdown from "../CustomFields/CustomFieldsDropdown";

const Section = ({ title, children }) => (
  <section className="bg-black/80 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xl transition">
    <h2 className="text-xl font-semibold tracking-wide text-yellow-500 dark:text-yellow-400 mb-4">
      {title}
    </h2>
    <div>{children}</div>
  </section>
);

export default function CustomRecordsPage() {
  const [customRecords, setCustomRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedCustomField, setSelectedCustomField] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    fetchCustomRecords();
  }, []);

  useEffect(() => {
    // Filter records when a custom field is selected
    if (selectedCustomField) {
      const filtered = Array.isArray(customRecords) 
        ? customRecords.filter(record => record.recordType === selectedCustomField.name)
        : [];
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(Array.isArray(customRecords) ? customRecords : []);
    }
  }, [selectedCustomField, customRecords]);

  const fetchCustomRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_VRI_URL}/api/custom/records`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched custom records:', data);
      
      const records = Array.isArray(data) ? data : [];
      setCustomRecords(records);
      setFilteredRecords(records);
    } catch (err) {
      console.error('Error fetching custom records:', err);
      setError(err.message);
      setCustomRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async (recordData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isEdit = modalMode === 'edit';
      const url = isEdit 
        ? `${import.meta.env.VITE_VRI_URL}/api/custom/records/${selectedRecord.id}`
        : `${import.meta.env.VITE_VRI_URL}/api/custom/records`;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log(`${method} request to:`, url);
      console.log('Payload:', recordData);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const savedRecord = await response.json();
      console.log('Saved record:', savedRecord);
      
      let updatedRecords = Array.isArray(customRecords) ? [...customRecords] : [];
      if (isEdit) {
        updatedRecords = updatedRecords.map(r => 
          r.id === selectedRecord.id ? savedRecord : r
        );
      } else {
        updatedRecords = [savedRecord, ...updatedRecords];
      }
      
      setCustomRecords(updatedRecords);
      
      // Update filtered records
      if (selectedCustomField) {
        const updatedFiltered = updatedRecords.filter(record => 
          record.recordType === selectedCustomField.name
        );
        setFilteredRecords(updatedFiltered);
      } else {
        setFilteredRecords(updatedRecords);
      }
      
      setIsModalOpen(false);
      alert(`✅ Record ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving record:', err);
      alert(`Error saving record: ${err.message}`);
    }
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Are you sure you want to delete this record?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_VRI_URL}/api/custom/records/${record.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      // Remove from state
      const updatedRecords = Array.isArray(customRecords) 
        ? customRecords.filter(r => r.id !== record.id)
        : [];
      setCustomRecords(updatedRecords);
      
      // Update filtered records
      if (selectedCustomField) {
        const updatedFiltered = updatedRecords.filter(r => 
          r.recordType === selectedCustomField.name
        );
        setFilteredRecords(updatedFiltered);
      } else {
        setFilteredRecords(updatedRecords);
      }
      
      alert('✅ Record deleted successfully!');
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(`Error deleting record: ${err.message}`);
    }
  };

  const handleExportRecords = () => {
    const recordsToExport = Array.isArray(filteredRecords) ? filteredRecords : [];
    
    if (recordsToExport.length === 0) {
      alert('No records to export');
      return;
    }

    const dataStr = JSON.stringify(recordsToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = selectedCustomField 
      ? `${selectedCustomField.name.toLowerCase()}-records.json`
      : 'custom-records.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleClearFilter = () => {
    setSelectedCustomField(null);
    setFilteredRecords(Array.isArray(customRecords) ? customRecords : []);
  };

  return (
    <div className="space-y-6">
      <Section title="Custom Records">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-gray-400">
              {Array.isArray(filteredRecords) ? filteredRecords.length : 0} of {Array.isArray(customRecords) ? customRecords.length : 0} custom record{Array.isArray(customRecords) && customRecords.length !== 1 ? 's' : ''}
              {selectedCustomField && ` (${selectedCustomField.name})`}
            </p>
            {error && (
              <span className="text-red-400 text-sm">
                ⚠️ API error: {error}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <CustomFieldsDropdown
                selectedField={selectedCustomField}
                onSelect={setSelectedCustomField}
                placeholder="Filter by record type"
              />
              {selectedCustomField && (
                <button
                  onClick={handleClearFilter}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              onClick={handleCreateRecord}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded font-semibold transition"
            >
              <Plus className="w-4 h-4" /> New Record
            </button>
            
            <button
              onClick={fetchCustomRecords}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            
            <button
              onClick={handleExportRecords}
              disabled={!Array.isArray(filteredRecords) || filteredRecords.length === 0}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-gray-400 mt-3">Loading custom records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/40 rounded-lg border border-gray-800">
            <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">
              {selectedCustomField 
                ? `No ${selectedCustomField.name} records found`
                : 'No custom records found'}
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Create your first custom record using the sidebar in your inbox
            </p>
            <button
              onClick={handleCreateRecord}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded font-semibold transition"
            >
              <Plus className="w-4 h-4" /> Create Record
            </button>
          </div>
        ) : (
          <CustomRecordsTable
            records={filteredRecords}
            onView={handleViewRecord}
            onEdit={handleEditRecord}
            onDelete={handleDeleteRecord}
          />
        )}
      </Section>

      <CustomRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={selectedRecord}
        mode={modalMode}
        onSave={handleSaveRecord}
      />
    </div>
  );
}