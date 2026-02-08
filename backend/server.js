import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Mongoose 7+)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Student Schema
const studentSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  age: Number,
  course: String,
  status: String,
});

const Student = mongoose.model("Student", studentSchema);

// Root route (friendly message)
app.get("/", (req, res) => {
  res.send("Student Management System Backend is running!");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is healthy!" });
});

// CRUD Routes
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
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// Catch-all route for undefined paths
app.all("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
