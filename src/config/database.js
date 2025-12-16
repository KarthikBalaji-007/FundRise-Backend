const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');

    // Get MONGO_URI from environment variables
    const mongoURI = process.env.MONGO_URI;

    // Detailed debugging
    if (!mongoURI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      throw new Error('MONGO_URI environment variable is required');
    }

    console.log('MongoDB URI loaded successfully (length:', mongoURI.length, 'chars)');

    // Remove potential whitespace/newlines
    const cleanURI = mongoURI.trim();

    // Connect without deprecated options (Mongoose 6+ doesn't need them)
    await mongoose.connect(cleanURI);

    console.log('\n✅ MongoDB connected successfully!');
    console.log(`✅ Database: ${mongoose.connection.name}`);
    console.log(`✅ Host: ${mongoose.connection.host}\n`);
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('\nFull Error Details:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
