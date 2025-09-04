import React, { useState } from "react";
import { Star, StarOff, Trash2 } from "lucide-react";

const Inbox = () => {
  const [selectedMail, setSelectedMail] = useState(null);
  const [starredMails, setStarredMails] = useState([1]);
  const [composeOpen, setComposeOpen] = useState(false);

  const mails = [
    {
      id: 1,
      sender: "John Doe",
      subject: "Welcome to Bounce Cure",
      preview: "Thanks for joining us. Here’s what you need to know...",
      time: "10:45 AM",
    },
    {
      id: 2,
      sender: "Support Team",
      subject: "Your verification is complete",
      preview: "We’ve successfully verified your email list...",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "Jane Smith",
      subject: "Subscription Renewal",
      preview: "Your subscription will renew on Sept 20th...",
      time: "Aug 30",
    },
  ];

  const toggleStar = (id) => {
    setStarredMails((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-full min-h-screen bg-black rounded-lg shadow overflow-hidden text-white relative">
      {/* Mail List */}
      <div className="flex-1 flex flex-col border-r border-gray-700">
        {/* Top bar for actions */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-black">
          <h2 className="font-semibold text-gray-200">Inbox</h2>
          <button
            onClick={() => setComposeOpen(true)}
            className="bg-[#154c7c] text-white px-3 py-1 rounded-lg hover:bg-[#EAA64D] hover:text-black transition"
          >
            + Compose
          </button>
        </div>

        {/* Mail items */}
        <div className="flex-1 overflow-y-auto">
          {mails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedMail(mail)}
              className={`flex items-center justify-between p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                selectedMail?.id === mail.id ? "bg-gray-700" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-white">{mail.sender}</p>
                <p className="text-sm text-gray-300">{mail.subject}</p>
                <p className="text-xs text-gray-500">{mail.preview}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(mail.id);
                  }}
                >
                  {starredMails.includes(mail.id) ? (
                    <Star className="text-yellow-400" size={18} />
                  ) : (
                    <StarOff className="text-gray-500" size={18} />
                  )}
                </button>
                <span className="text-xs text-gray-400">{mail.time}</span>
                <Trash2
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                  size={18}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mail Preview */}
      <div className="w-[350px] bg-black hidden lg:block border-l border-gray-700">
        {selectedMail ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white">
              {selectedMail.subject}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              From: {selectedMail.sender}
            </p>
            <p className="text-gray-300 leading-relaxed">
              {selectedMail.preview} <br />
              <br />
              This is a sample preview of the email body. In a real system, this
              would display the entire email content.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a mail to read
          </div>
        )}
      </div>

      {/* Compose Box (bottom-right popup inside inbox) */}
      {composeOpen && (
        <div className="absolute bottom-80 right-20 left-70 bg-gray-900 border border-gray-700 rounded-lg shadow-lg w-[400px] p-6 z-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">New Message</h2>
            <button
              onClick={() => setComposeOpen(false)}
              className="text-gray-400 hover:text-red-500"
            >
              ✖
            </button>
          </div>
          <input
            type="text"
            placeholder="To"
            className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#154c7c]"
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#154c7c]"
          />
          <textarea
            rows="6"
            placeholder="Message..."
            className="w-full border border-gray-700 bg-gray-800 text-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#154c7c]"
          ></textarea>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setComposeOpen(false)}
              className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-[#154c7c] text-white rounded-lg hover:bg-[#EAA64D] hover:text-black">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
