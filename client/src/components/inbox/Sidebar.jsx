// frontend/src/components/Sidebar.jsx
import React, { useState } from "react";
import { api } from "../../api";

export default function Sidebar({ conversations, onSelect, selected, refreshConversations }) {
    const [selectedForDelete, setSelectedForDelete] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toggle selection for a single conversation
    const toggleSelection = (conversation) => {
        setSelectedForDelete(prev => {
            if (prev.find(c => c.id === conversation.id)) {
                return prev.filter(c => c.id !== conversation.id);
            } else {
                return [...prev, conversation];
            }
        });
    };

    // Toggle select all
    const toggleSelectAll = () => {
        if (selectedForDelete.length === conversations.length) {
            setSelectedForDelete([]);
        } else {
            setSelectedForDelete([...conversations]);
        }
    };

    // Delete selected conversations
    const deleteSelectedConversations = async () => {
        if (selectedForDelete.length === 0) return;
        
        if (window.confirm(`Are you sure you want to delete ${selectedForDelete.length} conversation(s)?`)) {
            setIsDeleting(true);
            try {
                // Delete each selected conversation
                for (const conversation of selectedForDelete) {
                    await api.delete(`/conversations/${conversation.id}`);
                }
                
                // Refresh the conversation list
                refreshConversations();
                
                // Clear selection
                setSelectedForDelete([]);
                
                // If the currently selected conversation was deleted, clear it
                if (selectedForDelete.find(c => c.id === selected?.id)) {
                    onSelect(null);
                }
            } catch (err) {
                console.error("Failed to delete conversations:", err);
                alert("Failed to delete conversations. Please try again.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="w-80 border-r bg-black flex flex-col">
            <div className="p-4 font-bold flex justify-between items-center">
                <span>Shared Inbox</span>
                {selectedForDelete.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                            {selectedForDelete.length} selected
                        </span>
                        <button
                            onClick={deleteSelectedConversations}
                            disabled={isDeleting}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Selection controls */}
            <div className="px-4 py-2 border-b border-gray-800 flex items-center">
                <input
                    type="checkbox"
                    checked={selectedForDelete.length === conversations.length && conversations.length > 0}
                    onChange={toggleSelectAll}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-400">
                    {selectedForDelete.length === conversations.length && conversations.length > 0 
                        ? "Deselect All" 
                        : "Select All"}
                </span>
            </div>
            
            <div className="overflow-auto flex-1">
                {conversations.map((c) => (
                    <div 
                        key={c.id}
                        className={`p-3 border-b cursor-pointer flex ${selected?.id === c.id ? "bg-gray-800" : "hover:bg-gray-800"}`}
                        onClick={() => onSelect(c)}
                    >
                        <input
                            type="checkbox"
                            checked={!!selectedForDelete.find(conv => conv.id === c.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelection(c)}
                            className="mr-3 h-4 w-4 text-blue-600 rounded self-start mt-1"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{c.subject}</div>
                            <div className="text-xs text-gray-500 truncate">{c.snippet || c.lastMessage}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                From: {c.from} • {new Date(c.date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
                
                {conversations.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No conversations found
                    </div>
                )}
            </div>
        </div>
    );
}