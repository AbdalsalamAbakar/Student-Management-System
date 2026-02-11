import mongoose from "mongoose";
import Cors from "cors";

// Helper to initialize CORS middleware
function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve(result);
      });
    });
}

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("❌ MONGO_URI is not defined in environment variables");
}

// Global cache to avoid reconnecting on every request
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Student Schema
const studentSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  age: Number,
  course: String,
  status: String,
});

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

// Serverless handler
export default async function handler(req, res) {
  await cors(req, res);
  await dbConnect();

  const { method } = req;

  try {
    if (method === "GET") {
      // Get all students
      const students = await Student.find();
      return res.status(200).json(students);
    }

    if (method === "POST") {
      // Add a new student
      const student = new Student(req.body);
      await student.save();
      return res.status(201).json(student);
    }

    if (method === "PUT") {
      // Update a student
      const { id, ...data } = req.body;
      const updated = await Student.findByIdAndUpdate(id, data, { new: true });
      return res.status(200).json(updated);
    }

    if (method === "DELETE") {
      // Delete a student
      const { id } = req.body;
      await Student.findByIdAndDelete(id);
      return res.status(200).json({ message: "Deleted" });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
