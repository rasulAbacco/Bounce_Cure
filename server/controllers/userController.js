// controllers/userController.js
// import User from '../models/userModel.js';
import fs from 'fs';

export const updateEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { email }, { new: true });
        res.json({ message: 'Email updated', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateName = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true });
        res.json({ message: 'Name updated', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Optionally delete previous image if exists
        const user = await User.findById(req.user.id);
        if (user.profileImage) fs.unlinkSync(`uploads/${user.profileImage}`);

        user.profileImage = req.file.filename;
        await user.save();

        res.json({ message: 'Profile image uploaded', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
