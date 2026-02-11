import { ObjectId } from "mongodb";
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

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: "Missing id" });

  let objId;
  try { objId = new ObjectId(id); } catch (e) { return res.status(400).json({ error: "Invalid id" }); }

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGO_DB || "studentdb");
    const col = db.collection("students");

    if (req.method === "GET") {
      const student = await col.findOne({ _id: objId });
      return res.status(200).json(student);
    }

    if (req.method === "PUT") {
      const update = parseBody(req);
      const result = await col.findOneAndUpdate({ _id: objId }, { $set: update }, { returnDocument: "after" });
      return res.status(200).json(result.value);
    }

    if (req.method === "DELETE") {
      const result = await col.deleteOne({ _id: objId });
      return res.status(200).json({ deletedCount: result.deletedCount });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
