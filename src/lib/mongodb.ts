
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;


if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (process.env.NODE_ENV === 'development') {
      const globalWithMongo = global as typeof global & {
        _mongoClientPromise?: Promise<MongoClient>
      }
      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          }
        });
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
      clientPromise = client.connect();
    }
} else if (process.env.NODE_ENV !== 'test') {
    // Do not log warning in test environment
    console.warn('WARNING: Invalid or missing MONGODB_URI. The application will not be able to connect to the database. Please add your MongoDB connection string to the .env file. It must start with "mongodb://" or "mongodb+srv://".');
}


export default clientPromise;
