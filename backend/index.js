import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */

// Allow requests from frontend and production
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Add your production frontend URL here
  "https://your-frontend-domain.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
  })
);

// Parse JSON requests
app.use(express.json());

/* =======================
   DATABASE CONNECTION
======================= */

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not set in environment variables");
  process.exit(1); // Stop server if no DB URI
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Stop server if DB fails
  });

/* =======================
   SCHEMA & MODEL
======================= */

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number },
    course: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.send("✅ Student Management System Backend is running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

/* =======================
   404 HANDLER
======================= */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =======================
   SERVER
======================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
