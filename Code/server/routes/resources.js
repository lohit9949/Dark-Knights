const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/resources/subjects
// @desc    Get all distinct subjects
// @access  Public
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Resource.distinct('subject');
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/resources
// @desc    Get all resources (with optional search, category, subject filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, subject } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // If user is authenticated, add to recently viewed
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          // Remove if already in recently viewed
          user.recentlyViewed = user.recentlyViewed.filter(
            (id) => id.toString() !== resource._id.toString()
          );
          // Add to beginning
          user.recentlyViewed.unshift(resource._id);
          // Keep only last 10
          if (user.recentlyViewed.length > 10) {
            user.recentlyViewed = user.recentlyViewed.slice(0, 10);
          }
          await user.save({ validateBeforeSave: false });
        }
      } catch (err) {
        // Silently fail — user might not be authenticated
      }
    }

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
