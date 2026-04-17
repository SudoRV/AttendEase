import React, { useState } from 'react';
import { FiX, FiMenu, FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { AppStates } from "../services/states";
import Announcements from "../components/Announcements";
import Announce from "../components/Announce";
import StudentLeaveManagement from "../components/LeaveApproval";
import TeacherAvailability from "../components/TeacherAvailablility";
import TimeTable from "../components/TimeTable";
import Footer from "../components/Footer";


const TeacherDashboard = () => {
  const announcements = [
    "Tomorrow is a holiday.",
    "Submit your assignments by Friday.",
    "CS Seminar scheduled for next Monday."
  ];
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  const navigate = useNavigate();
  const { userData } = AppStates();

  async function logout() {
    // simulate logout like buffering or loading 
    localStorage.removeItem("user_creds");
    navigate("/login");
  }


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <FiMenu onClick={toggleDrawer} />
        <h3>AttendEase</h3>
      </header>

      {/* Sidebar Overlay */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <FiX onClick={toggleDrawer} />
        <div className="flex flex-col items-start">
            <p className="text-lg font-bold font-sans">{userData?.role} Dashboard</p>
        </div>
        <div className="flex gap-3 bg-indigo-500 p-4 mt-4 rounded-md">
                <div className="avatar">
                {
                    userData?.avatar ? (
                    <img
                        className=""
                        src="https://via.placeholder.com/100"
                        alt="Profile Avatar"
                    />
                    ) : (
                    <FiUser className="text-xl text-slate-300 cursor-pointer" />
                    )
                }
                </div>

                <div>
                <p className="font-medium">{userData?.name}</p>
                <p className="text-xs">{userData?.email}</p>
                </div>
            </div>
        
        <div className="flex flex-col bg-indigo-500 p-4 mt-4 rounded-md overflow-hidden break-all text-slate-300">
            {
            userData?.role === "Student" && (
                <>
                <div className="info-item">
                    <span>Year</span><span>: {userData?.year}</span>
                </div>

                <div className="info-item">
                    <span>Branch</span><span>: {userData?.branch}</span>
                </div>

                <div className="info-item">
                    <span>Section</span><span>: {userData?.section}</span>
                </div>
                </>
            )
            }

            <span >Id : {userData?.role === "Student" ? userData?.student_id : userData?.teacher_id}</span>
        </div>
        <button className="logout-btn mt-auto flex items-center bg-transparent border-none text-gray-100 font-light font-sans gap-3 text-sm p-6 pb-4 !border !border-red-700" onClick={logout}>
            <FiLogOut size={20} />
            Logout
        </button>
      </div>

      {/* Backdrop (Optional: Clicks outside to close) */}
      {isOpen && <div className="backdrop" onClick={toggleDrawer} />}

      {/* Main Content (Remains stationary) */}
      <main className="main-content overflow-y-auto">
        <div className="timetable-section card other">
                    <TimeTable />
                </div>
        <div className="dashboard teacher-dashboard">
                <div className="card other announcements">
                  <Announce announcements={announcements} />
                </div>
                <div className="card teacher-availability">
                  <TeacherAvailability />
                </div>
                <div className="card other leave-management leave-verifier">
                  <StudentLeaveManagement />
                </div>
                <div className="footer">
                  <Footer />
                </div>
        </div>
        
      </main>
    </div>
  );
};

export default TeacherDashboard;