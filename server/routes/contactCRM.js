// server/routes/contactCRM.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import csv from 'csv-parser';
import { protect } from '../middleware/authMiddleware.js'; // ✅ ensure this exists

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

// ✅ Apply authentication to all routes
router.use(protect);

// GET /contacts?page=1&search=
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';

    const where = {
        userId: req.user.id, // ✅ filter by user
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ],
    };

    const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.contact.count({ where }),
    ]);

    res.json({
        data: contacts,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    });
});

// POST /contacts
router.post('/', async (req, res) => {
    const { name, email, phone, company, status, last, priority } = req.body;

    const contact = await prisma.contact.create({
        data: {
            name,
            email,
            phone,
            company,
            status,
            last: last || new Date().toISOString().split('T')[0],
            priority,
            userId: req.user.id, // ✅ associate with user
        },
    });

    res.json(contact);
});

// POST /contacts/import
router.post('/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or wrong input field name' });
    }

    const filePath = req.file.path;
    const ext = req.file.originalname.split('.').pop().toLowerCase();

    try {
        if (ext === 'csv') {
            const contacts = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => contacts.push({ ...row, userId: req.user.id })) // ✅ attach userId
                .on('end', async () => {
                    await prisma.contact.createMany({ data: contacts });
                    fs.unlinkSync(filePath);
                    res.json({ message: 'CSV imported successfully' });
                });
        } else if (ext === 'xlsx') {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);

            const contacts = data.map((row) => ({ ...row, userId: req.user.id })); // ✅ attach userId

            await prisma.contact.createMany({ data: contacts });
            fs.unlinkSync(filePath);
            res.json({ message: 'Excel file imported successfully' });
        } else {
            fs.unlinkSync(filePath);
            res.status(400).json({ error: 'Unsupported file type' });
        }
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error during import' });
    }
});

// PUT /contacts/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { priority } = req.body;

    // ✅ Ensure user owns this contact
    const contact = await prisma.contact.findFirst({
        where: { id, userId: req.user.id },
    });

    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    const updated = await prisma.contact.update({
        where: { id },
        data: { priority },
    });
    res.json(updated);
});

// DELETE /contacts/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    // ✅ Ensure user owns this contact
    const contact = await prisma.contact.findFirst({
        where: { id, userId: req.user.id },
    });

    if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.contact.delete({ where: { id } });

    res.json({ success: true, message: 'Contact deleted successfully' });
});

export default router;
