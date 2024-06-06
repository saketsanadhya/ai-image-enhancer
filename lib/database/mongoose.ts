import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Augment the global object to include our mongoose connection cache
declare global {
    // This keeps the cache type-safe
    var mongoose: MongooseConnection;
}

// Check if the global mongoose cache exists, otherwise initialize it
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URL) {
        throw new Error('Missing MONGODB_URL');
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'ai-image-enhancer',
            bufferCommands: false,
        }).catch((err) => {
            cached.promise = null; // Reset the promise cache on error
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
};
