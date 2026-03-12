const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@interviewai.com' });
    if (existing) {
      console.log('Admin already exists!');
      await mongoose.disconnect();
      return;
    }

    await User.create({
      name: 'Admin',
      email: 'admin@interviewai.com',
      password: 'Admin@123',
      role: 'admin',
    });

    console.log('Admin created!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
