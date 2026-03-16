const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected:', conn.connection.host);

    // Drop stale supabaseId unique index if it exists
    try {
      const db = conn.connection.db;
      const indexes = await db.collection('users').indexes();
      if (indexes.some(idx => idx.name === 'supabaseId_1')) {
        await db.collection('users').dropIndex('supabaseId_1');
        console.log('Dropped stale supabaseId_1 index');
      }
    } catch (indexErr) {
      console.warn('Index cleanup warning:', indexErr.message);
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
