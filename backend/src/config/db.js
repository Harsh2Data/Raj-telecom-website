const mongoose = require('mongoose');

// Fail fast instead of Mongoose's 10s default — a misconfigured/unreachable
// MONGODB_URI must not make every lead/booking request hang for 10 seconds
// waiting on conversation tracking that's meant to be best-effort.
mongoose.set('bufferTimeoutMS', 3000);

let connectPromise = null;

function connectDB() {
  if (connectPromise) return connectPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Returned as a rejected promise, not thrown — this must be safe to
    // call from server.js without crashing the process synchronously.
    connectPromise = Promise.reject(
      new Error('MONGODB_URI is not set — the admin panel needs a MongoDB connection string.')
    );
    connectPromise.catch(() => {}); // prevent an unhandledRejection crash if nothing else awaits this
    return connectPromise;
  }

  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('error', (error) => console.error('❌ MongoDB connection error:', error.message));
  mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));

  connectPromise = mongoose.connect(uri);
  return connectPromise;
}

module.exports = { connectDB };
