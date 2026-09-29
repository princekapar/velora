import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads in development.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  connectedUri: string | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null, connectedUri: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/velora';

  // If active connection is on a different URI (e.g. was previously on localhost, now configured with Atlas)
  const isHostMismatch =
    uri.includes('mongodb.net') &&
    mongoose.connection.readyState === 1 &&
    (mongoose.connection.host === 'localhost' || mongoose.connection.host === '127.0.0.1');

  if (isHostMismatch || (cached.connectedUri && cached.connectedUri !== uri)) {
    console.log('[VELORA DB] Reconnecting to new MongoDB URI...');
    try {
      await mongoose.disconnect();
    } catch (e) {
      console.error('[VELORA DB] Disconnect error:', e);
    }
    cached.conn = null;
    cached.promise = null;
    cached.connectedUri = null;
  }

  // If already connected to the correct target URI
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s timeout for cloud Atlas clusters
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        cached.connectedUri = uri;
        console.log('[VELORA DB] Successfully connected to MongoDB:', m.connection.host, `(DB: ${m.connection.name})`);
        return m;
      })
      .catch((err) => {
        console.warn('[VELORA DB] MongoDB connection failed:', err.message, '- falling back to in-memory store.');
        cached.promise = null;
        cached.connectedUri = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    console.error('[VELORA DB] connectToDatabase error:', e?.message || e);
    cached.promise = null;
    cached.connectedUri = null;
    return null;
  }

  return cached.conn;
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
