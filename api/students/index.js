import { connectToDatabase, setCorsHeaders } from "../_mongo.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGO_DB || "studentdb");
    const col = db.collection("students");

    if (req.method === "GET") {
      const students = await col.find({}).toArray();
      return res.status(200).json(students);
    }

    if (req.method === "POST") {
      const student = parseBody(req);
      const result = await col.insertOne(student);
      const created = await col.findOne({ _id: result.insertedId });
      return res.status(201).json(created);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
