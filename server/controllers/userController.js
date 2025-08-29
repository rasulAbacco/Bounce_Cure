// controllers/userController.js
// import User from '../models/userModel.js';

import fs from 'fs';
import util from 'util';
import { fileTypeFromBuffer } from 'file-type';

import { prisma } from "../prisma/prismaClient.js";
const readFile = util.promisify(fs.readFile);

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true, // binary buffer
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profileImageBase64 = null;

        if (user.profileImage) {
            // Convert Prisma's Buffer (Uint8Array) to Base64
            const buffer = Buffer.from(user.profileImage);
            profileImageBase64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
        }

        res.json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profileImage: profileImageBase64,
        });
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

        const imageBuffer = req.file.buffer; // ← from memory

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                profileImage: imageBuffer,
            },
        });

        res.json({ message: 'Profile image uploaded', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getProfileImage = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.userId) },
            select: { profileImage: true },
        });

        if (!user || !user.profileImage) {
            return res.status(404).send('Image not found');
        }

        const type = await fileTypeFromBuffer(user.profileImage);

        if (!type) {
            return res.status(400).send('Unsupported image type');
        }

        res.set('Content-Type', type.mime); // ← e.g., image/png, image/jpeg
        res.send(user.profileImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




