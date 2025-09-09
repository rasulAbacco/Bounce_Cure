import React, { useState } from 'react';

const AddEmailModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    imapHost: '',
    imapPort: '',
    imapUser: '',
    imapPass: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imapPortInt = parseInt(formData.imapPort, 10);
    if (isNaN(imapPortInt)) {
      setMessage("❌ IMAP Port must be a valid number");
      return;
    }

    const emailData = {
      ...formData,
      imapPort: imapPortInt
      // encryptedPass is removed; instead, send imapPass as plain text
    };

    try {
      const response = await fetch('http://localhost:5000/api/email-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error');
      }

      const result = await response.json();
      setMessage('✅ Account added successfully!');
      console.log('Account added:', result);

      setFormData({
        userId: '',
        email: '',
        imapHost: '',
        imapPort: '',
        imapUser: '',
        imapPass: ''
      });
    } catch (error) {
      console.error('Error adding account:', error);
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
      >
        ➕ Add Email Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-zinc-900 text-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Email Account</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="userId"
                placeholder="User ID"
                value={formData.userId}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <input
                type="text"
                name="imapHost"
                placeholder="IMAP Host"
                value={formData.imapHost}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <input
                type="number"
                name="imapPort"
                placeholder="IMAP Port"
                value={formData.imapPort}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <input
                type="text"
                name="imapUser"
                placeholder="IMAP User"
                value={formData.imapUser}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <input
                type="password"
                name="imapPass"
                placeholder="App Password"
                value={formData.imapPass}
                onChange={handleChange}
                required
                className="p-2 bg-zinc-800 rounded outline-none"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 p-2 rounded text-white"
              >
                Save Account
              </button>
            </form>
            {message && <p className="mt-3 text-center">{message}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default AddEmailModal;
