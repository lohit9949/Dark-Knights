const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/bookmarks
// @desc    Get user's bookmarked resources
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/bookmarks/:resourceId
// @desc    Toggle bookmark a resource
// @access  Private
router.post('/:resourceId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const resourceId = req.params.resourceId;

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === resourceId
    );

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== resourceId
      );
      await user.save({ validateBeforeSave: false });
      res.json({ message: 'Bookmark removed', bookmarked: false, bookmarks: user.bookmarks });
    } else {
      // Add bookmark
      user.bookmarks.push(resourceId);
      await user.save({ validateBeforeSave: false });
      res.json({ message: 'Bookmark added', bookmarked: true, bookmarks: user.bookmarks });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
