import { MongoClient } from "mongodb";


const uri = process.env.MONGO_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri!);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise!;

export default clientPromise;
