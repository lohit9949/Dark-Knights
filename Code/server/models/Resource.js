const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['ppt', 'textbook', 'past_paper'],
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    // Downloadable files stored on ImageKit (PDF, PPT, images)
    files: [
      {
        name: String,
        url: String,
        type: { type: String }, // pdf, ppt, image, doc, other
        size: Number,
      },
    ],
    // General resource links (websites, articles, etc.)
    links: [
      {
        title: String,
        url: String,
      },
    ],
    // Academic references
    references: [
      {
        title: String,
        url: String,
      },
    ],
    // YouTube / video links
    videoLinks: [
      {
        title: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Text index for search
resourceSchema.index({ title: 'text', description: 'text', subject: 'text', topic: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
