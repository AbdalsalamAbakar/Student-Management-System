// Fetch all students
const fetchStudents = async () => {
  const res = await fetch("http://localhost:5000/students");
  const data = await res.json();
  setStudents(data);
};

// Add a student
const addStudent = async (student) => {
  const res = await fetch("http://localhost:5000/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  const newStudent = await res.json();
  setStudents([...students, newStudent]);
};

// Update a student
const updateStudent = async (student) => {
  const res = await fetch(`http://localhost:5000/students/${student.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
  const updated = await res.json();
  setStudents(students.map(s => s.id === updated._id ? updated : s));
  setEditingStudent(null);
};

// Delete a student
const deleteStudent = async (id) => {
  await fetch(`http://localhost:5000/students/${id}`, { method: "DELETE" });
  setStudents(students.filter(s => s.id !== id));
};
