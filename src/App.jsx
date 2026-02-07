import { useState, useEffect } from "react";
import StudentForm from "./components/studentForm";
import StudentList from "./components/studentList";
import SearchFilter from "./components/searchFilter";
import { CSVLink } from "react-csv";
import "./App.css";

export default function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const API = "http://localhost:5000/students";

  // Fetch students from backend
  const fetchStudents = async () => {
    const res = await fetch(API);
    const data = await res.json();
    // Map _id to id for React keys
    setStudents(data.map(s => ({ ...s, id: s._id })));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add new student
  const addStudent = async (student) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    const newStudent = await res.json();
    setStudents([...students, { ...newStudent, id: newStudent._id }]);
  };

  // Update student
  const updateStudent = async (student) => {
    const res = await fetch(`${API}/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    const updated = await res.json();
    setStudents(students.map(s => (s.id === updated._id ? { ...updated, id: updated._id } : s)));
    setEditingStudent(null);
  };

  // Delete student
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setStudents(students.filter(s => s.id !== id));
    }
  };

  // Filtered & searched students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <CSVLink data={students} filename="students.csv" className="export-btn">
            Export CSV
          </CSVLink>
        </div>
      )}
    </div>
  );
}
