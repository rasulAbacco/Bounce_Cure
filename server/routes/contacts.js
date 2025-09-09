import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock contacts database
let contacts = [
  { id: uuidv4(), name: 'John Doe', email: 'jeffwilseyb2bleads@gmail.com', type: 'all-subscribers' },
  { id: uuidv4(), name: 'Jane Smith', email: 'rasulabaccotech@gmail.com', type: 'new-customer' },
  { id: uuidv4(), name: 'Robert Johnson', email: 'abacco83@gmail.com', type: 'vip-client' },
  { id: uuidv4(), name: 'Emily Davis', email: 'anusha.abacco@gmail.com', type: 'all-subscribers' },
  { id: uuidv4(), name: 'Michael Wilson', email: 'vamsimdohan2692000@gmail.com', type: 'new-customer' },
  { id: uuidv4(), name: 'Sarah Brown', email: 'sarah@example.com', type: 'vip-client' },
];

// Get all contacts
router.get('/', (req, res) => {
  res.json(contacts);
});

// Add new contact
router.post('/', (req, res) => {
  const { name, email, type } = req.body;
  if (!name || !email || !type) {
    return res.status(400).json({ error: 'Name, email, and type are required' });
  }

  const newContact = { id: uuidv4(), name, email, type };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

// Delete contact
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  contacts = contacts.filter(contact => contact.id !== id);
  res.status(200).json({ message: 'Contact deleted successfully' });
});

export { router };

// ⚠️ Note: The 600-email sending limit is enforced in frontend (SendCampaign.jsx),
// not here, to keep backend flexible if future scaling is needed.
