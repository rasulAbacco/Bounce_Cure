// server/routes/campaignRoutes.js
import express from 'express';
import { prisma } from '../prisma/prismaClient.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all campaigns for logged-in user
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single campaign by ID (only if it belongs to user)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new campaign for current user
router.post('/', async (req, res) => {
  try {
    const { name, subject, recipients, fromName, fromEmail, template } = req.body;

    if (!name || !subject || !recipients || !fromName || !fromEmail) {
      return res.status(400).json({
        message: 'Name, subject, recipients, from name, and from email are required'
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        recipients,
        fromName,
        fromEmail,
        template: template || null,
        userId: req.user.id
      }
    });

    res.status(201).json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update campaign (only if it belongs to user)
router.patch('/:id', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { name, subject, recipients, fromName, fromEmail, template, status } = req.body;

    // Check ownership
    const existing = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(recipients && { recipients }),
        ...(fromName && { fromName }),
        ...(fromEmail && { fromEmail }),
        ...(template !== undefined && { template }),
        ...(status && { status }),
        ...(status === 'sent' && { sentAt: new Date() }),
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete campaign (only if it belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const existing = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await prisma.campaign.delete({ where: { id: campaignId } });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send campaign (only if it belongs to user)
router.post('/:id/send', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        sentAt: new Date()
      }
    });

    // Replace with your actual sending logic

    res.json({
      message: 'Campaign sent successfully',
      campaign: updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;







// import express from 'express';
// import { prisma } from '../prisma/prismaClient.js'

// const router = express.Router();
// // Get all campaigns
// router.get('/', async (req, res) => {
//   try {
//     const campaigns = await prisma.campaign.findMany({
//       orderBy: { createdAt: 'desc' }
//     });
//     res.json(campaigns);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get single campaign
// router.get('/:id', async (req, res) => {
//   try {
//     const campaign = await prisma.campaign.findUnique({
//       where: { id: parseInt(req.params.id) }
//     });
    
//     if (!campaign) {
//       return res.status(404).json({ message: 'Campaign not found' });
//     }
    
//     res.json(campaign);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create new campaign
// router.post('/', async (req, res) => {
//   try {
//     const { name, subject, recipients, fromName, fromEmail, template, canvasData } = req.body;
    
//     if (!name || !subject || !recipients || !fromName || !fromEmail) {
//       return res.status(400).json({ 
//         message: 'Name, subject, recipients, from name and from email are required' 
//       });
//     }
    
//     const campaign = await prisma.campaign.create({
//       data: {
//         name,
//         subject,
//         recipients,
//         fromName,
//         fromEmail,
//         template: template || null
//       }
//     });
    
//     res.status(201).json(campaign);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update campaign
// router.patch('/:id', async (req, res) => {
//   try {
//     const { name, subject, recipients, fromName, fromEmail, template, status } = req.body;
//     const campaignId = parseInt(req.params.id);
    
//     // Check if campaign exists
//     const existingCampaign = await prisma.campaign.findUnique({
//       where: { id: campaignId }
//     });
    
//     if (!existingCampaign) {
//       return res.status(404).json({ message: 'Campaign not found' });
//     }
    
//     const campaign = await prisma.campaign.update({
//       where: { id: campaignId },
//       data: {
//         ...(name && { name }),
//         ...(subject && { subject }),
//         ...(recipients && { recipients }),
//         ...(fromName && { fromName }),
//         ...(fromEmail && { fromEmail }),
//         ...(template !== undefined && { template }),
//         ...(status && { status }),
//         ...(status === 'sent' && { sentAt: new Date() })
//       }
//     });
    
//     res.json(campaign);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete campaign
// router.delete('/:id', async (req, res) => {
//   try {
//     const campaignId = parseInt(req.params.id);
    
//     // Check if campaign exists
//     const existingCampaign = await prisma.campaign.findUnique({
//       where: { id: campaignId }
//     });
    
//     if (!existingCampaign) {
//       return res.status(404).json({ message: 'Campaign not found' });
//     }
    
//     await prisma.campaign.delete({
//       where: { id: campaignId }
//     });
    
//     res.json({ message: 'Campaign deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Send campaign
// router.post('/:id/send', async (req, res) => {
//   try {
//     const campaignId = parseInt(req.params.id);
    
//     // Check if campaign exists
//     const campaign = await prisma.campaign.findUnique({
//       where: { id: campaignId }
//     });
    
//     if (!campaign) {
//       return res.status(404).json({ message: 'Campaign not found' });
//     }
    
//     // Update campaign status to sent
//     const updatedCampaign = await prisma.campaign.update({
//       where: { id: campaignId },
//       data: {
//         status: 'sent',
//         sentAt: new Date()
//       }
//     });
    
//     // Here you would implement your actual email sending logic
//     // For now, we'll just return success
    
//     res.json({ 
//       message: 'Campaign sent successfully',
//       campaign: updatedCampaign
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// export default router;