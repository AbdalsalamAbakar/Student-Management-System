import { useEffect, useState } from "react";

const initialState = {
  fullName: "",
  email: "",
  age: "",
  course: "",
  status: "Active",
};

export default function StudentForm({ addStudent, updateStudent, editingStudent }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (editingStudent) setForm(editingStudent);
    else setForm(initialState);
  }, [editingStudent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.fullName || form.fullName.length < 3) {
      alert("Full Name must be at least 3 characters");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      alert("Please enter a valid email");
      return;
    }

    const ageNum = Number(form.age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) {
      alert("Age must be between 16 and 100");
      return;
    }

    if (!form.course) {
      alert("Please enter course");
      return;
    }

    if (editingStudent) {
      updateStudent(form);
    } else {
      addStudent({ ...form, id: crypto.randomUUID() });
    }

    setForm(initialState);
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <h2>{editingStudent ? "Edit Student" : "Add Student"}</h2>

      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
      <input name="course" placeholder="Course" value={form.course} onChange={handleChange} />

      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      <button type="submit">{editingStudent ? "Update" : "Add"}</button>
    </form>
  );
}
