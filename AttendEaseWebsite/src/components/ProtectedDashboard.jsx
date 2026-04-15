import { Navigate } from "react-router-dom";
import TeacherDashboard from "../pages/Teacher_Dashboard";
import StudentDashboard from "../pages/Student_Dashboard";

export default function ProtectedDashboard() {
  const user_data = localStorage.getItem("user_creds");
  const userCreds = user_data ? JSON.parse(user_data) : undefined;

  // No login → go to login page
  if (!userCreds) {
    return <Navigate to="/login" replace />;
  }

  // Role-based switching
  if (userCreds?.role === "Teacher") {
    return <TeacherDashboard />;
  }

  if (userCreds?.role === "Student") {
    return <StudentDashboard />;
  }

  // Unknown role → redirect or show error
  return <Navigate to="/unauthorized" replace />;
}
