const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resource = require('./models/Resource');
const User = require('./models/User');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear all existing resources (remove dummy data)
    await Resource.deleteMany({});
    console.log('Cleared all resources');

    // Delete and recreate admin user to ensure fresh password hash
    await User.deleteOne({ email: 'admin@acadfinder.com' });
    await User.create({
      name: 'Admin',
      email: 'admin@acadfinder.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin user created: admin@acadfinder.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
