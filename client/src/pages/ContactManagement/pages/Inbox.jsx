
import React from "react";

const Inbox = () => {

  const handleDelete = (id) => {
    setMails((prev) => prev.filter((m) => m.id !== id));
    if (selectedMail?.id === id) setSelectedMail(null);
  };

  return (
    <div className="flex h-full min-h-screen bg-black rounded-lg shadow overflow-hidden text-white relative">
      <h1>Inbox</h1>

    </div>
  );
};

export default Inbox;
