export default function StudentList({ students, onEdit, onDelete, editingStudent }) {
  if (!students.length) return <p className="empty">No students found.</p>;

  return (
    <div className="student-table-container">
      <table className="student-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Course</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.id}
              className={editingStudent?.id === student.id ? "editing" : ""}
            >
              <td data-label="No.">{index + 1}</td>
              <td data-label="Full Name">{student.fullName}</td>
              <td data-label="Email">{student.email}</td>
              <td data-label="Age">{student.age}</td>
              <td data-label="Course">{student.course}</td>
              <td data-label="Status" className={student.status === "Active" ? "active" : "inactive"}>
                {student.status}
              </td>
              <td data-label="Actions">
                <button className="edit-btn" onClick={() => onEdit(student)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
