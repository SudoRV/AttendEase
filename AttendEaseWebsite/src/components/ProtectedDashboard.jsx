import { useEffect, useState } from "react";
import TeacherDashboard from "../pages/Teacher_Dashboard";
import StudentDashboard from "../pages/Student_Dashboard"; 
import RequestNotification from "./RequestNotification";
import { AppStates } from "../services/states";

export default function ProtectedDashboard() {
  const { user } = AppStates();
  const [loginScreen, setLoginScreen] = useState(0);

  // initial
  if (loginScreen !== 0) {
    return (
      <div className="bg-neutral-100 dark:bg-neutral-900 w-full min-h-screen flex justify-center items-center">
        {
          loginScreen === 2 ? (
            <p className="text-2xl">Redirecting to login page...</p>
          ) : (
            <p className="text-2xl">Please login first to access dashboard.</p>
          )
        } 
      </div>
    )
  }
  
  if(!user && user === null) {
    return <div className="w-full min-h-screen bg-neutral-100 dark:bg-neutral-900 flex justify-center items-center">
      <p className="text-3xl font-light">loading...</p>
    </div>
  }

  if (user) return (
    <div>
      <RequestNotification />
      {
        user?.role === "Student" ? (
          <StudentDashboard />
        ) : (
          <TeacherDashboard />
        )
      }
    </div>
  )
}
