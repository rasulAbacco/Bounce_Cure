import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, param, validationResult } from 'express-validator';
import { sendMms } from '../services/twilioService.js';

const router = express.Router();
const prisma = new PrismaClient();

async function createMmsCampaign(data) {
  const { name, message, mediaUrl, recipients } = data;

  const campaign = await prisma.mmsCampaign.create({
    data: {
      name,
      message,
      mediaUrl,
      recipients: {
        create: recipients.map(phone => ({ phone }))
      }
    },
    include: {
      recipients: true
    }
  });

  return campaign;
}

async function getAllMmsCampaigns() {
  return await prisma.mmsCampaign.findMany({
    include: {
      recipients: true
    }
  });
}

async function getMmsCampaignById(id) {
  return await prisma.mmsCampaign.findUnique({
    where: { id: Number(id) },
    include: {
      recipients: true
    }
  });
}

// Create a new MMS campaign
router.post('/',
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('mediaUrl').isURL().withMessage('Media URL must be a valid URL'),
  body('recipients').isArray({ min: 1 }).withMessage('At least one recipient is required'),
  body('recipients.*')
    .matches(/^\+\d{7,15}$/)
    .withMessage('Each recipient must be a valid phone number in E.164 format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const campaign = await createMmsCampaign(req.body);
      const sendResults = await Promise.all(
        campaign.recipients.map(recipient =>
          sendMms(recipient.phone, campaign.message, campaign.mediaUrl)
        )
      );
      res.status(201).json({ message: 'MMS campaign created and messages sent', campaign, sendResults });
    } catch (error) {
      console.error("Error creating MMS campaign:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all MMS campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await getAllMmsCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching MMS campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific MMS campaign by ID
router.get('/:id',
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const campaign = await getMmsCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
