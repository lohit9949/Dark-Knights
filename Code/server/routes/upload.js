const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');
const filesDir = path.join(uploadDir, 'files');
const thumbsDir = path.join(uploadDir, 'thumbnails');

[uploadDir, filesDir, thumbsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Fallback logic: check body or default to files
    const folder = req.body.folder === 'thumbnails' ? thumbsDir : filesDir;
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Determine subfolder for the URL response
    const subfolder = req.file.destination.includes('thumbnails') ? 'thumbnails' : 'files';
    const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;

    res.json({
      url: fileUrl,
      name: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;