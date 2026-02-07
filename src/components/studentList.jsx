export default function StudentList({ students, onEdit, onDelete, editingStudent }) {
  if (!students.length) return <p className="empty">No students found.</p>;

  return (
    <div className="student-grid">
      {students.map((student) => (
        <div
          className={`student-card ${editingStudent?.id === student.id ? "editing" : ""}`}
          key={student.id}
        >
          <h3>{student.fullName}</h3>
          <p>{student.email}</p>
          <p>Age: {student.age}</p>
          <p>Course: {student.course}</p>
          <span className={student.status === "Active" ? "active" : "inactive"}>
            {student.status}
          </span>

          <div className="actions">
            <button onClick={() => onEdit(student)}>Edit</button>
            <button onClick={() => onDelete(student.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
