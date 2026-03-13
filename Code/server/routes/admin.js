const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/resources
// @desc    Get all resources (admin view)
// @access  Private/Admin
router.get('/resources', protect, admin, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/resources
// @desc    Create a new resource
// @access  Private/Admin
router.post('/resources', protect, admin, async (req, res) => {
  try {
    const {
      title, description, category, subject, topic,
      fileUrl, thumbnailUrl, author,
      files, links, references, videoLinks,
    } = req.body;

    const resource = await Resource.create({
      title, description, category, subject, topic,
      fileUrl, thumbnailUrl, author,
      files: files || [],
      links: links || [],
      references: references || [],
      videoLinks: videoLinks || [],
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/admin/resources/:id
// @desc    Update a resource
// @access  Private/Admin
router.put('/resources/:id', protect, admin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/admin/resources/:id
// @desc    Delete a resource
// @access  Private/Admin
router.delete('/resources/:id', protect, admin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const pptCount = await Resource.countDocuments({ category: 'ppt' });
    const textbookCount = await Resource.countDocuments({ category: 'textbook' });
    const pastPaperCount = await Resource.countDocuments({ category: 'past_paper' });

    res.json({
      totalResources,
      pptCount,
      textbookCount,
      pastPaperCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
