const mongoose = require('mongoose');
const dns = require('dns');

// Configure Node's DNS resolver to use public DNS servers to resolve MongoDB SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback if DNS set fails
}

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI is not defined. Skipping database connection for Milestone 1.');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Backend server will continue running. Check your MONGODB_URI, internet connection, or DNS settings if database features are needed.');
  }
};

module.exports = connectDB;