import React, { useState } from 'react';
import { FiX, FiMenu, FiLogOut, FiUser } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { AppStates } from "../services/states";
import Announcements from "../components/Announcements";
import LeaveBox from "../components/Student_Leave";
import TimeTable from "../components/TimeTable";
import Footer from "../components/Footer";
import attendease_logo from "../images/attendease_icon.png";

const StudentDashboard = () => {
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
            <header className="header bg-gradient-to-br from-indigo-500 to-indigo-600">
                <div className='logo'>
                    <img src={attendease_logo} onClick={toggleDrawer} />
                </div>
                <h3>AttendEase</h3>
            </header>

            {/* Sidebar Overlay */}
            <div className={`sidebar h-full flex flex-col p-6 bg-white border-r border-gray-100 ${isOpen ? 'open' : ''}`}>

                {/* Header: Title & Close */}
                <div className="flex flex-row justify-between items-center mb-8">
                    <div className='flex-col'>
                        <p className="text-xs uppercase tracking-widest text-indigo-500 font-bold">Portal</p>
                        <p className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">
                            {userData?.role} <span className="text-indigo-600">.</span>
                        </p>
                    </div>

                    <button
                        onClick={toggleDrawer}
                        className="p-2 border-none bg-transparent"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* User Profile Section */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6">
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
                    <div className="flex flex-col overflow-hidden">
                        <p className="font-bold text-white leading-tight truncate">{userData?.name}</p>
                        <p className="text-xs text-indigo-100/80 truncate font-medium">{userData?.email}</p>
                    </div>
                </div>

                {/* Detailed Info Card */}
                <div className="flex flex-col gap-1 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
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
                        <span className="text-sm font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                            {userData?.role === "Student" ? userData?.student_id : userData?.teacher_id}
                        </span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    className="group mt-auto flex items-center justify-center gap-3 w-full py-4 rounded-xl
                    border-none bg-slate-50 text-slate-600 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all duration-200 active:scale-95"
                    onClick={logout}
                >
                    <FiLogOut size={18} className="transition-transform group-hover:translate-x-0.5" />
                    <span>Logout System</span>
                </button>
            </div>

            {/* Backdrop (Optional: Clicks outside to close) */}
            {isOpen && <div className="backdrop" onClick={toggleDrawer} />}

            {/* Main Content (Remains stationary) */}
            <main className="main-content">
                <div className="timetable-section card other">
                    <TimeTable />
                </div>
                <div className="dashboard">
                    <div className="leave-management card other">
                        <LeaveBox />
                    </div>

                    <div className="announcements card other">
                        <Announcements />
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

/** * Reusable Helper component for the rows to keep code clean 
 */
function InfoRow({ label, value, isTruncated = false }) {
    return (
        <div className="flex justify-between items-center py-1.5 px-1">
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <span className={`font-semibold text-sm text-neutral-600 ${isTruncated ? 'truncate max-w-[120px]' : ''}`}>
                {value}
            </span>
        </div>
    );
}

export default StudentDashboard;