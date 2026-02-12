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

  // ✅ API FROM ENV
  const API = `${import.meta.env.VITE_API_URL}/students`;

  const fetchStudents = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStudents(data.map(s => ({ ...s, id: s._id })));
    } catch {
      alert("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async (student) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    const newStudent = await res.json();
    setStudents([...students, { ...newStudent, id: newStudent._id }]);
  };

  const updateStudent = async (student) => {
    const res = await fetch(`${API}/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    const updated = await res.json();
    setStudents(
      students.map(s =>
        s.id === updated._id ? { ...updated, id: updated._id } : s
      )
    );
    setEditingStudent(null);
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete this student?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setStudents(students.filter(s => s.id !== id));
  };

  const filteredStudents = students.filter(s =>
    (s.fullName.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === "All" || s.status === filterStatus)
  );

  return (
    <div className="app-container">
      <h1>Student Management System</h1>

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
      />

      {students.length > 0 && (
        <>
          <CSVLink data={filteredStudents} filename="students.csv">
            Export CSV
          </CSVLink>
          <button onClick={() => {
            const doc = new jsPDF();
            autoTable(doc, {
              head: [["Name", "Email", "Age", "Course", "Status"]],
              body: filteredStudents.map(s => [
                s.fullName, s.email, s.age, s.course, s.status
              ]),
            });
            doc.save("students.pdf");
          }}>
            Export PDF
          </button>
        </>
      )}
    </div>
  );
}
