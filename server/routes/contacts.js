import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// --- Mock auth middleware to simulate logged-in user ---
// In real apps, replace this with proper auth (JWT/session/etc)
function mockAuthMiddleware(req, res, next) {
  // For testing: assign a fixed user id per request
  // In real, extract user id from token/session
  req.user = { id: req.headers['x-user-id'] || 'user1' };
  next();
}

// Use the auth middleware globally on this router
router.use(mockAuthMiddleware);

// Contacts store per userId
// Structure: { userId: [ contacts ] }
const userContacts = {
  user1: [
    { id: uuidv4(), name: 'John Doe', email: 'jeffwilseyb2bleads@gmail.com', type: 'all-subscribers' },
    { id: uuidv4(), name: 'Emily Davis', email: 'anusha.abacco@gmail.com', type: 'all-subscribers' },
  ],
  user2: [
    { id: uuidv4(), name: 'Jane Smith', email: 'rasulabaccotech@gmail.com', type: 'new-customer' },
  ],
};

// Helper to get contacts array for a user (create if none)
function getContactsForUser(userId) {
  if (!userContacts[userId]) {
    userContacts[userId] = [];
  }
  return userContacts[userId];
}

// GET all contacts for logged in user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const contacts = getContactsForUser(userId);
  res.json(contacts);
});

// POST add new contact for logged in user
router.post('/', (req, res) => {
  const userId = req.user.id;
  const { name, email, type } = req.body;
  if (!name || !email || !type) {
    return res.status(400).json({ error: 'Name, email, and type are required' });
  }

  const contacts = getContactsForUser(userId);

  const newContact = { id: uuidv4(), name, email, type };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

// DELETE contact by id for logged in user
router.delete('/:id', (req, res) => {
  const userId = req.user.id;
  const contactId = req.params.id;

  let contacts = getContactsForUser(userId);
  const originalLength = contacts.length;

  contacts = contacts.filter(contact => contact.id !== contactId);

  if (contacts.length === originalLength) {
    // No contact deleted — not found
    return res.status(404).json({ error: 'Contact not found' });
  }

  // Update store
  userContacts[userId] = contacts;

  res.json({ message: 'Contact deleted successfully' });
});

export { router };








// // server/routes/contacts.js
// import express from 'express';
// import { v4 as uuidv4 } from 'uuid';

// const router = express.Router();

// // Mock contacts database
// let contacts = [
//   { id: uuidv4(), name: 'John Doe', email: 'jeffwilseyb2bleads@gmail.com', type: 'all-subscribers' },
//   { id: uuidv4(), name: 'Jane Smith', email: 'rasulabaccotech@gmail.com', type: 'new-customer' },
//   { id: uuidv4(), name: 'Robert Johnson', email: 'abacco83@gmail.com', type: 'vip-client' },
//   { id: uuidv4(), name: 'Emily Davis', email: 'anusha.abacco@gmail.com', type: 'all-subscribers' },
//   { id: uuidv4(), name: 'Michael Wilson', email: 'vamsimdohan2692000@gmail.com', type: 'new-customer' },
//   { id: uuidv4(), name: 'Sarah Brown', email: 'sarah@example.com', type: 'vip-client' },
// ];

// // Get all contacts
// router.get('/', (req, res) => {
//   res.json(contacts);
// });

// // Add new contact
// router.post('/', (req, res) => {
//   const { name, email, type } = req.body;
//   if (!name || !email || !type) {
//     return res.status(400).json({ error: 'Name, email, and type are required' });
//   }

//   const newContact = { id: uuidv4(), name, email, type };
//   contacts.push(newContact);
//   res.status(201).json(newContact);
// });

// // Delete contact
// router.delete('/:id', (req, res) => {
//   const { id } = req.params;
//   contacts = contacts.filter(contact => contact.id !== id);
//   res.status(200).json({ message: 'Contact deleted successfully' });
// });

// export { router };

// // ⚠️ Note: The 600-email sending limit is enforced in frontend (SendCampaign.jsx),
// // not here, to keep backend flexible if future scaling is needed.
