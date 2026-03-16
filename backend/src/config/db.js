const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected:', conn.connection.host);

    // Drop the stale supabaseId unique index if it exists.
    // The field was removed from the User schema; leaving the index
    // causes E11000 duplicate-key errors on null values.
    try {
      await conn.connection.collection('users').dropIndex('supabaseId_1');
      console.log('Dropped stale supabaseId_1 index');
    } catch (_) {
      // Index doesn't exist – nothing to do
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
