import { useState, useEffect } from "react";
import StudentForm from "./components/studentForm";
import StudentList from "./components/studentList";
import SearchFilter from "./components/searchFilter";
import { CSVLink } from "react-csv";
import "./App.css";

// PDF libraries (correct import for ES modules)
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const API = "http://localhost:5000/students";

  // Fetch students
  const fetchStudents = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setStudents(data.map((s) => ({ ...s, id: s._id })));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add student
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
    setStudents(
      students.map((s) =>
        s.id === updated._id ? { ...updated, id: updated._id } : s
      )
    );
    setEditingStudent(null);
  };

  // Delete student
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  // Filter & search
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // CSV data
  const csvData = filteredStudents.map((s, index) => ({
    "No.": index + 1,
    "Full Name": s.fullName,
    Email: s.email,
    Age: s.age,
    Course: s.course,
    Status: s.status,
  }));

  // PDF export
  const exportPDF = () => {
    if (filteredStudents.length === 0) {
      alert("No students to export!");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["No.", "Full Name", "Email", "Age", "Course", "Status"];
    const tableRows = [];

    filteredStudents.forEach((s, index) => {
      tableRows.push([index + 1, s.fullName, s.email, s.age, s.course, s.status]);
    });

    doc.text("Student Management System", 14, 15);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] }, // blue header
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap", // responsive on mobile
            marginTop: "20px",
          }}
        >
          {/* CSV Export */}
          <CSVLink
            data={csvData}
            headers={[
              { label: "No.", key: "No." },
              { label: "Full Name", key: "Full Name" },
              { label: "Email", key: "Email" },
              { label: "Age", key: "Age" },
              { label: "Course", key: "Course" },
              { label: "Status", key: "Status" },
            ]}
            filename="students.csv"
            className="export-btn"
          >
            Export CSV
          </CSVLink>

          {/* PDF Export */}
          <button type="button" className="export-btn" onClick={exportPDF}>
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
