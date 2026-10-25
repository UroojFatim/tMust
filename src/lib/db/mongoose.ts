import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

type Cached = {
  promise?: Promise<typeof mongoose>;
};

const globalWithMongoose = global as typeof globalThis & {
  _mongooseCache?: Cached;
};

const cache = globalWithMongoose._mongooseCache ?? { promise: undefined };

globalWithMongoose._mongooseCache = cache;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI);
  }

  return cache.promise;
};
