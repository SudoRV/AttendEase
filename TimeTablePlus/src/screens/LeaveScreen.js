import React from "react";
import { AppStates } from "../context/AppStates";
import StudentLeave from "../components/StudentLeave";
import StudentLeaveManagement from "../components/LeaveApproval";
import NotSignedIn from "../components/NotSignedIn";

export default function LeaveScreen() {
  const { userData } = AppStates();

  if (userData?.role === "Student") {
    return <StudentLeave />;
  } 
  else if (userData?.role === "Teacher") {
    return <StudentLeaveManagement />;
  } 
  else {
    return <NotSignedIn />;
  }
}