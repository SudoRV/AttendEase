import React from "react";
import { AppStates } from "../context/AppStates";
import StudentLeave from "../components/StudentLeave";
import StudentLeaveManagement from "../components/LeaveApproval";
import NotSignedIn from "../components/NotSignedIn";

export default function LeaveScreen() {
  const { user } = AppStates();

  if (user?.role === "Student") {
    return <StudentLeave />;
  } 
  else if (user?.role === "Teacher") {
    return <StudentLeaveManagement />;
  } 
  else {
    return <NotSignedIn />;
  }
}