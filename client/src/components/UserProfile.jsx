// components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { updateEmail, updateName, uploadProfileImage, getUser } from '../services/authService.js';

const UserProfile = () => {
    const [user, setUser] = useState({ name: '', email: '', profileImage: '' });
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await getUser();
                setUser(data);
                setName(data.name);
                setEmail(data.email);
                setPreview(data.profileImage ? `http://localhost:5000/uploads/${data.profileImage}` : '');
            } catch (err) {
                console.log('Error fetching user:', err.response?.data || err.message);
            }
        };
        fetchUser();
    }, []);

    const handleEmailUpdate = async () => {
        try {
            const { data } = await updateEmail(email);
            setUser(data.user);
            alert('Email updated!');
        } catch (err) {
            console.log('Email update error:', err.response?.data || err.message);
        }
    };

    const handleNameUpdate = async () => {
        try {
            const { data } = await updateName(name);
            setUser(data.user);
            alert('Name updated!');
        } catch (err) {
            console.log('Name update error:', err.response?.data || err.message);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file) return alert('Select a file first');
        try {
            const { data } = await uploadProfileImage(file);
            setUser(data.user);
            alert('Profile image uploaded!');
        } catch (err) {
            console.log('Upload error:', err.response?.data || err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center p-6 bg-black">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg text-white">
                <h2 className="text-center text-2xl font-bold mb-8">Profile Settings</h2>

                {/* Email */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 mb-3"
                        placeholder="Enter your email"
                    />
                    <button
                        onClick={handleEmailUpdate}
                        className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/40 font-semibold transition duration-300"
                    >
                        Update Email
                    </button>
                </div>

                {/* Name */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 mb-3"
                        placeholder="Enter your name"
                    />
                    <button
                        onClick={handleNameUpdate}
                        className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/40 font-semibold transition duration-300"
                    >
                        Update Name
                    </button>
                </div>

                {/* Profile Image */}
                <div>
                    <label className="block font-semibold mb-2">Profile Image</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="mb-4 w-full text-sm text-white/70"
                    />
                    <button
                        onClick={handleUpload}
                        className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/40 font-semibold transition duration-300 mb-4"
                    >
                        Upload Image
                    </button>
                    {preview && (
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="mx-auto w-28 h-28 object-cover rounded-full border-2 border-white/30"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
