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
import PasswordSettings from '../components/PasswordManager';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from "../components/LandingFooter.jsx";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import logout from "../utils/logout";
import { useTheme } from '../context/ThemeContext';


const TeacherDashboard = () => {
  const announcements = [
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleDrawer = () => setIsOpen(!isOpen);
  const { user } = AppStates();
  const { isDark } = useTheme();

  return (
    <div className={`dashboard-container ${isDark ? 'dark' : ''} !bg-[#f5f7fb] dark:!bg-neutral-900`}>
      <LandingHeader toggleSidebar={toggleDrawer} />

      {/* Sidebar Overlay */}
      <div className={`sidebar h-full overflow-y-auto overscroll-contain flex flex-col p-6 bg-white dark:bg-neutral-900 border-r border-gray-100 ${isOpen ? 'open' : ''}`}>

        {/* Header: Title & Close */}
        <div className="flex flex-row justify-between items-center mb-8">
          <div>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-200 font-sans tracking-tight">
              {user?.role} <span className="text-indigo-600 font-bold text-lg"> Dashboard</span>
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
            {user?.avatar ? (
              <img
                className="h-12 w-12 rounded-xl object-cover border-2 border-indigo-400/50"
                src={user.avatar}
                alt="Avatar"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <img className="h-6 opacity-90" src={attendease_logo} alt="Logo" />
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden w-full">
            <p className="font-bold text-slate-100 leading-tight truncate">{user?.name}</p>
            <p className="text-xs text-slate-200 truncate font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Detailed Info Card */}
        <div className="flex flex-col gap-1 bg-slate-100 dark:bg-neutral-950/40 border border-slate-100 p-4 rounded-2xl">
          {user?.role === "Student" && (
            <>
              <InfoRow label="Year" value={user?.year} />
              <InfoRow label="Branch" value={user?.branch_id} isTruncated />
              <InfoRow label="Section" value={user?.section} />
              <div className="h-px bg-slate-200/60 my-2" />
            </>
          )}
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">ID Number</span>
            <span className="text-sm font-mono font-bold text-indigo-500 px-2 py-0.5 rounded">
              {user?.role === "Student" ? user?.student_id : user?.teacher_id}
            </span>
          </div>
        </div>
        <PasswordSettings />

        {/* Logout Button */}
        <button
          className="group mt-auto flex items-center justify-center gap-3 w-full py-3 rounded-lg
                          border-none bg-red-500 text-slate-100 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all duration-200 active:scale-95"
          onClick={() => {
            logout(setLoading)
          }}
          disabled={loading}
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

          <div className="card md:!h-[50rem] !h-[45rem] !shadow-xl !bg-white dark:!bg-neutral-950/40 mx-2">
            <StudentLeaveManagement />
          </div>

        </div>

      </main>

      {loading && (
        <div className="fixed inset-0 z-[999] bg-gradient-to-b from-neutral-900/60 to-neutral-900/60 via-neutral-900/30 backdrop-blur-lg flex items-center justify-center">
          <div className="bg-transparent px-6 py-4 rounded-2xl  items-center text-center">
            <AiOutlineLoading3Quarters className="text-indigo-500 text-4xl animate-spin mt-5 font-semibold" />
            <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Logging out...</p>
          </div>
        </div>
      )}

      <LandingFooter />

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