import React, { useEffect, useState } from "react";
import { AppStates } from "../services/states";
import {
  FiInfo,
  FiX,
  FiCheck,
  FiCalendar,
  FiUser,
  FiInbox,
  FiFileText,
  FiClock,
  FiGrid
} from "react-icons/fi";

import { Fetch } from "../services/api";

const StudentLeaveManagement = () => {
  const {
    userData,
    loadLeaves,
    leaveHistory,
    setLeaveHistory,
    classes
  } = AppStates();

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [activeTab, setActiveTab] = useState("leaves"); // verify | leaves
  const [filterMode, setFilterMode] = useState("all"); // all | period
  const [leavesCount, setLeavesCount] = useState(0);

  /* ---------------- current period class ---------------- */
  const [currentClass, setCurrentClass] = useState(classes.classes?.find(c => c.isCurrentPeriod) || {});

  /* ---------------- filtering logic ---------------- */
  const filteredLeaves = leaveHistory
    ?.filter(l =>
      activeTab === "verify"
        ? l.status === "Pending"
        : l.status === "Approved" || l.status === "Partialy-Approved"
    )
    ?.filter(l => {
      if (filterMode === "all") return true;
      if (!currentClass) return false;

      return (
        l.year === currentClass.year &&
        l.branch === currentClass.branch &&
        l.section === currentClass.section
      );
    });

  /* ---------------- verify action ---------------- */
  async function verifyLeave(action, application) {
    try {
      const response = await Fetch("/api/leaves/students/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: action,
          application: application,
          verifier: {
            role: userData.role,
            teacher_id: userData.teacher_id,
            teacher_name: userData.name
          },
        })
      });

      const res_data = await response.json();

      if (res_data?.success) {
        setLeaveHistory(prev =>
          prev.filter(l => l.student_id !== application.student_id)
        );
      }
    } catch (error) {
      console.error("Verify error:", error);
    } finally {
      loadLeaves();
    }
  }

  /* ---------------- effects ---------------- */
  useEffect(() => {
    loadLeaves("Teacher");
  }, [userData]);

  useEffect(() => {
    setCurrentClass(classes.classes?.find(c => c.isCurrentPeriod));
  }, [classes]);

  useEffect(() => {
    const leaveCount = leaveHistory.filter(l => l.status === (activeTab === "leaves" ? "Pending" : "Approved")).length;
    setLeavesCount(leaveCount);
  }, [activeTab, leaveHistory]);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="w-full flex flex-col space-y-4  p-4 py-2 bg-transparent antialiased text-neutral-800 dark:text-neutral-100">

      {/* Title Header Section */}
      <div className="border-b border-neutral-100 dark:border-neutral-900 pb-2 flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent sm:text-3xl">
          Student Leaves
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
          Review, analyze, and sign off student leave records and verification metrics
        </p>
      </div>

      {/* Control Filters Toolbar Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-2">

        {/* Navigation Action Segment Track Selector */}
        <div className="flex gap-2 items-center bg-neutral-100 dark:bg-neutral-900/80 p-1 rounded-xl w-fit border border-neutral-200/20">
          {["leaves", "verify"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative  px-5 py-1.5 lg:py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 border-none select-none
                ${activeTab === tab
                  ? "bg-white dark:bg-neutral-100 text-neutral-900 dark:text-neutral-800 shadow-sm"
                  : "bg-neutral-200 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
              {tab === "leaves" ? "Approved Leaves" : "Awaiting Verification"}

              {leavesCount > 0 && activeTab !== tab && (
                <span className={`absolute opacity-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-4 ring-white dark:ring-neutral-950 -top-3 z-20 -right-2 transition-all duration-300 delay-300 ${leavesCount > 0 ? "opacity-100" : "opacity-0"}`}
                >
                  {leavesCount}
                </span>
              )}

            </button>
          ))}
        </div>

        {/* Dynamic Class Boundary Filters */}
        <div className="flex items-center gap-2">
          {["all", "period"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              disabled={mode === "period" && !currentClass}
              className={`px-3.5 py-1.5 lg:py-2.5 rounded-lg text-xs uppercase font-bold transition-all duration-200 border-none
                ${filterMode === mode
                  ? "bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-white dark:text-neutral-950 shadow-md"
                  : "bg-neutral-300 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700"
                } ${mode === "period" && !currentClass ? "opacity-30 cursor-not-allowed select-none" : ""}`}
            >
              {mode === "all" ? "All Leaves" : "Active Period"}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Active Class Warning Alert Notification Banner */}
      {filterMode === "period" && !currentClass && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 text-xs font-medium animate-in fade-in duration-200">
          <FiInfo size={14} className="shrink-0" />
          <span>No lecture runtime structural metadata found in your current period.</span>
        </div>
      )}

      {/* Main Multi-Column Interactive Card Canvas Content List */}
      <div className="w-full flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 overflow-y-auto custom-scrollbar pb-6">
        {filteredLeaves?.length > 0 ? (
          filteredLeaves.map((leave, id) => (
            <div
              key={id}
              className="group relative bg-neutral-50 dark:bg-neutral-950/60 p-5 rounded-2xl border border-neutral-200/50 dark:border-neutral-900/80 shadow-md hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-200 flex flex-col justify-between min-w-0"
            >
              <div className="space-y-1">
                {/* Profile Meta Frame Metadata */}
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="lg:text-lg font-bold text-neutral-900 dark:text-neutral-300">
                      {leave.name}
                    </h4>
                    <p className="text-xs uppercase text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                      {leave.branch_id} • Year {leave.year}
                    </p>
                  </div>
                  <span className="shrink-0 text-[14px] px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-neutral-900 font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200/20">
                    {leave.total_leaves || 1} {leave.total_leaves === 1 ? 'leave' : 'leaves'}
                  </span>
                </div>

                {/* Sub-context contextual conditional blocks */}
                <div className="min-w-0">

                  <div className="flex items-center gap-1.5 bg-neutral-50/50 dark:bg-neutral-950 py-2 rounded-xl border border-neutral-200/30 dark:border-neutral-900">
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mt-0.5 shrink-0">Sub:</span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold truncate flex-1">
                      {leave.subject}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-neutral-200/50 dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200/30 dark:border-neutral-900">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">From</span>
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
                        {formatDateDisplay(leave.applicable_from)}
                      </span>
                    </div>

                    <div className="text-neutral-300 dark:text-neutral-700 font-light select-none">→</div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-neutral-400 uppercase tracking-wide">To</span>
                      <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
                        {formatDateDisplay(leave.applicable_to)}
                      </span>
                    </div>

                  </div>

                </div>
              </div>

              {/* Action Rows Trigger Interface Block */}
              <div className="flex items-center justify-between mt-2 border-t border-neutral-100 dark:border-neutral-900/60 gap-4">
                <button
                  onClick={() => setSelectedLeave(leave)}
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider border-none bg-transparent p-0 inline-flex items-center gap-1 cursor-pointer"
                >
                  <FiFileText size={16} /> View File
                </button>

                {activeTab === "verify" && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => verifyLeave("Rejected", leave)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-none bg-transparent transition-colors cursor-pointer"
                      title="Reject Request"
                    >
                      <FiX size={15} />
                    </button>
                    <button
                      onClick={() => verifyLeave("Approved", leave)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10 border-none transition-all duration-150 cursor-pointer"
                      title="Approve Request"
                    >
                      <FiCheck size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          /* High-Fidelity Modern Empty State Fallback Screen Layout Container */
          <div className="col-span-full h-full flex flex-col items-center justify-center py-16 px-4 text-center bg-neutral-50/40 dark:bg-neutral-900/10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl select-none animate-in fade-in duration-300">

            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3 border border-neutral-200/50 dark:border-neutral-800">
              <FiInbox size={30} />
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              No Leaves Found
            </h3>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-[280px] leading-relaxed mt-1 font-medium">
              There are no matching student leave applications cataloged in this filter view stream segment.
            </p>
          </div>
        )}
      </div>

      {/* Frosted Layered Modal View File Overlay Overlay Panel */}
      {selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                  Leave Document Meta
                </h3>
                <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                  <FiUser size={12} /> {selectedLeave.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Profile Grid Data Variables info */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200/30 dark:border-neutral-900">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Notice Subject</span>
                <span className="text-neutral-900 dark:text-neutral-100 text-sm font-bold truncate block">{selectedLeave.subject}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Total Range</span>
                <span className="text-neutral-900 dark:text-neutral-100 text-sm font-bold block">{selectedLeave.total_leaves || 1} Days</span>
              </div>
              <div className="space-y-0.5 col-span-2 pt-2 border-t border-neutral-200/40 dark:border-neutral-900/60 flex items-center gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Applicable From</span>
                  <span className="text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1 mt-0.5"><FiClock size={12} />{formatDateDisplay(selectedLeave.applicable_from)}</span>
                </div>
                <div className="text-neutral-300 dark:text-neutral-700 pt-3 select-none">→</div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Applicable Till</span>
                  <span className="text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1 mt-0.5"><FiClock size={12} />{formatDateDisplay(selectedLeave.applicable_to)}</span>
                </div>
              </div>
            </div>

            {/* Main scrollable textarea segment text wrapper block */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block pl-1">Application Statement</span>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/30 dark:border-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-medium leading-relaxed">
                {selectedLeave.application}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-[0.98]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaveManagement;