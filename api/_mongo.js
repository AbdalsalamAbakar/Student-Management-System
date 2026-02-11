import { MongoClient } from "mongodb";

let cachedClient = global._mongoClient || null;

export async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI environment variable");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  global._mongoClient = client;
  return client;
}

export function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}
