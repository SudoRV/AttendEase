import React, { useState } from 'react';
import { FiX, FiLogOut } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { AppStates } from "../services/states";
import Announcements from "../components/Announcements";
import Announce from "../components/Announce";
import StudentLeaveManagement from "../components/LeaveApproval";
import TimeTable from "../components/TimeTable";
import attendease_logo from "../images/attendease_icon.png";
import TeacherLeave from '../components/TeacherLeave';

import LandingHeader from '../components/LandingHeader';
import { useTheme } from '../context/ThemeContext';

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

  const { isDark } = useTheme();

  async function logout() {
    // simulate logout like buffering or loading 
    localStorage.removeItem("user_creds");
    navigate("/login");
  }

  return (
    <div className={`dashboard-container ${isDark ? 'dark' : ''} !bg-[#f5f7fb] dark:!bg-neutral-900`}>
      <LandingHeader toggleSidebar={toggleDrawer} />

      {/* Sidebar Overlay */}
      <div className={`sidebar h-full flex flex-col p-6 bg-white dark:bg-neutral-800 border-r border-gray-100 ${isOpen ? 'open' : ''}`}>

        {/* Header: Title & Close */}
        <div className="flex flex-row justify-between items-center mb-8">
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-sans tracking-tight">
              {userData?.role} <span className="text-indigo-600 font-bold text-lg"> Dashboard</span>
            </p>
          </div>

          <button
            onClick={toggleDrawer}
            className="p-2 border-none bg-transparent ml-2"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4 p-4 bg-indigo-600 rounded-2xl shadow-lg mb-6">
          <div className="shrink-0">
            {userData?.avatar ? (
              <img
                className="h-12 w-12 rounded-xl object-cover border-2 border-indigo-400/50"
                src={userData.avatar}
                alt="Avatar"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <img className="h-6 opacity-90" src={attendease_logo} alt="Logo" />
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <p className="font-bold text-slate-100 leading-tight truncate">{userData?.name}</p>
            <p className="text-xs text-slate-200 truncate font-medium">{userData?.email}</p>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="flex flex-col gap-1 bg-slate-100 dark:bg-neutral-950/40 border border-slate-100 p-4 rounded-2xl">
          {userData?.role === "Student" && (
            <>
              <InfoRow label="Year" value={userData?.year} />
              <InfoRow label="Branch" value={userData?.branch_id} isTruncated />
              <InfoRow label="Section" value={userData?.section} />
              <div className="h-px bg-slate-200/60 my-2" />
            </>
          )}
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">ID Number</span>
            <span className="text-sm font-mono font-bold text-indigo-500 px-2 py-0.5 rounded">
              {userData?.role === "Student" ? userData?.student_id : userData?.teacher_id}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="group mt-auto flex items-center justify-center gap-3 w-full py-4 rounded-xl
                          border-none bg-red-500 text-slate-100 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all duration-200 active:scale-95"
          onClick={logout}
        >
          <FiLogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
          <span>Logout System</span>
        </button>
      </div>

      {/* Backdrop (Optional: Clicks outside to close) */}
      {isOpen && <div className="backdrop" onClick={toggleDrawer} />}


      {/* Main Content (Remains stationary) */}
      <main className="main-content overflow-y-auto max-w-[1350px] mx-auto !bg-[#f5f7fb] dark:!bg-neutral-900">

        <div className="timetable-section card other !shadow-none !bg-transparent !p-0">
          <TimeTable />
        </div>

        <div className="dashboard teacher-dashboard mt-2">
          <div className="other announcer">
            <Announce announcements={announcements} />
          </div>
          <div className="card other announcements !shadow-xl !bg-white dark:!bg-neutral-950/40 mr-2">
            <Announcements />
          </div>

          <div className="teacher-availability">
            <TeacherLeave />
          </div>

          <div className="card !h-[50rem] !shadow-xl !bg-white dark:!bg-neutral-950/40 mx-2">
            <StudentLeaveManagement />
          </div>

        </div>

      </main>

      {/* <Footer /> */}
    </div>
  );
};

/** * Reusable Helper component for the rows to keep code clean 
 */
function InfoRow({ label, value, isTruncated = false }) {
  return (
    <div className="flex justify-between items-center py-1.5 px-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isTruncated ? 'truncate max-w-[120px]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default TeacherDashboard;