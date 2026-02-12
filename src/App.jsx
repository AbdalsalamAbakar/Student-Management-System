import { useState, useEffect } from "react";
import StudentForm from "./components/studentForm";
import StudentList from "./components/studentList";
import SearchFilter from "./components/searchFilter";
import { CSVLink } from "react-csv";
import "./App.css";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // ✅ USE ENV VARIABLE (RENDER FRIENDLY)
  const API = `${import.meta.env.VITE_API_URL}/students`;

  // ✅ Fetch students (with error handling)
  const fetchStudents = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data.map((s) => ({ ...s, id: s._id })));
    } catch (error) {
      console.error(error);
      alert("Could not load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Add student
  const addStudent = async (student) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const newStudent = await res.json();
      setStudents([...students, { ...newStudent, id: newStudent._id }]);
    } catch (error) {
      console.error(error);
      alert("Failed to add student");
    }
  };

  // ✅ Update student
  const updateStudent = async (student) => {
    try {
      const res = await fetch(`${API}/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const updated = await res.json();
      setStudents(
        students.map((s) =>
          s.id === updated._id ? { ...updated, id: updated._id } : s
        )
      );
      setEditingStudent(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update student");
    }
  };

  // ✅ Delete student
  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setStudents(students.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete student");
    }
  };

  // ✅ Filter & search
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ✅ CSV data
  const csvData = filteredStudents.map((s, index) => ({
    "No.": index + 1,
    "Full Name": s.fullName,
    Email: s.email,
    Age: s.age,
    Course: s.course,
    Status: s.status,
  }));

  // ✅ PDF export
  const exportPDF = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["No.", "Full Name", "Email", "Age", "Course", "Status"];
    const tableRows = filteredStudents.map((s, index) => [
      index + 1,
      s.fullName,
      s.email,
      s.age,
      s.course,
      s.status,
    ]);

    doc.text("Student Management System", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
    });

    doc.save("students.pdf");
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Student Management System</h1>

      <StudentForm
        addStudent={addStudent}
        updateStudent={updateStudent}
        editingStudent={editingStudent}
      />

      <SearchFilter
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <StudentList
        students={filteredStudents}
        onEdit={setEditingStudent}
        onDelete={deleteStudent}
        editingStudent={editingStudent}
      />

      {students.length > 0 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <CSVLink data={csvData} filename="students.csv" className="export-btn">
            Export CSV
          </CSVLink>

          <button className="export-btn" onClick={exportPDF}>
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
