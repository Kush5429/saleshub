const mongoose = require("mongoose");

let cached = global._mongoConnection ?? null;

async function connectDB() {
  if (cached && cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  if (!cached) {
    cached = { conn: null, promise: null };
    global._mongoConnection = cached;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
