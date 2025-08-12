const express = require('express');
const multer = require('multer');
const fs = require('fs');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const EmailValidator = require('email-deep-validator');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const validator = new EmailValidator({
  verifyMailbox: true,
  timeout: 7000,
});

// Single Email Verify
router.post('/verify-single', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const { wellFormed, validDomain, validMailbox } = await validator.verify(email);

    let status = 'invalid';
    if (validMailbox) status = 'valid';
    else if (wellFormed && validDomain) status = 'risky';

    res.json({ email, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Email Verify
router.post('/verify-bulk', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });

  const filePath = req.file.path;
  let emails = [];

  try {
    if (req.file.originalname.toLowerCase().endsWith('.csv')) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(fileContent, { header: true });
      emails = parsed.data
        .map((row) => row.Email || row.email || row.EMail)
        .filter(Boolean);
    } else if (req.file.originalname.toLowerCase().endsWith('.xlsx')) {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      emails = jsonData
        .map((row) => row.Email || row.email || row.EMail)
        .filter(Boolean);
    } else if (req.file.originalname.toLowerCase().endsWith('.txt')) {
      emails = fs
        .readFileSync(filePath, 'utf8')
        .split(/\r?\n/)
        .map((e) => e.trim())
        .filter(Boolean);
    } else {
      throw new Error('Unsupported file type');
    }

    fs.unlinkSync(filePath);

    if (!emails.length) {
      return res.status(400).json({ error: 'No valid emails found in file' });
    }

    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const { wellFormed, validDomain, validMailbox } = await validator.verify(email);

          let status = 'invalid';
          if (validMailbox) status = 'valid';
          else if (wellFormed && validDomain) status = 'risky';

          return { email, status };
        } catch {
          return { email, status: 'invalid' };
        }
      })
    );

    res.json({ results });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
