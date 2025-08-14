// controllers/userController.js
// import User from '../models/userModel.js';
import fs from 'fs';


// controllers/userController.js
// export const getMe = async (req, res) => {
//     try {
//         const user = await prisma.user.findUnique({
//             where: { id: req.user.id },
//             select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 email: true,
//                 createdAt: true
//             }
//         });

//         if (!user) return res.status(404).json({ message: "User not found" });

//         res.json(user);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };


// PUT /api/auth/users/update-name

export const getMe = async (req, res) => {
    try {
        res.json(req.user); // already selected fields
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateName = async (req, res) => {
    try {
        const { firstName, lastName } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName },
            select: { id: true, firstName: true, lastName: true, email: true }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating name:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/auth/users/update-email
export const updateEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { email },
            select: { id: true, firstName: true, lastName: true, email: true }
        });
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({ message: "Server error" });
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


