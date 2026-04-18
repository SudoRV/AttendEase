import { useEffect, useState } from "react";
import { AppStates } from "../services/states";

import { FiInfo, FiX, FiCheck } from "react-icons/fi";

const StudentLeaveManagement = () => {
  const {
    userData,
    doFetch,
    buildUrl,
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

  async function verifyLeave(action, applicant) {
    try {
      const response = await fetch(buildUrl("/verify-leave"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          {
            action: action,
            applicant: applicant,
            verifier: {
              role: userData.role,
              teacher_id: userData.teacher_id,
              teacher_name: userData.name
            },
          }
        )
      });

      const res_data = await response.json();

      if (res_data?.success) {
        setLeaveHistory(prev =>
          prev.filter(l => l.student_id !== applicant.student_id)
        );
      }
    } catch (error) {
      console.log("Verify error:", error);
    } finally {
      loadLeaves();
    }
  }

  /* ---------------- effects ---------------- */

  useEffect(() => {
    loadLeaves("Teacher");
  }, [userData, loadLeaves]);

  useEffect(() => {
    setCurrentClass(classes.classes?.find(c => c.isCurrentPeriod));
  }, [classes])


  /* ---------------- UI ---------------- */

  useEffect(() => {
    const leaveCount = leaveHistory.filter(l => l.status === (activeTab === "leaves" ? "Pending" : "Approved")).length;
    setLeavesCount(leaveCount)
  }, [activeTab, leaveHistory])

  return (
    <div className="w-full flex flex-col h-full">

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 gap-4 mb-4">

        {/* Tabs Wrapper with Track */}
        <div className="relative flex items-center bg-slate-100 p-1 rounded-xl w-fit gap-2">
          {/* Badge - LOGIC & STYLES UNCHANGED */}
          {leavesCount > 0 && (
            <div
              className={`absolute p-2 w-6 h-6 flex justify-center items-center rounded-full bg-red-500 text-white text-sm 
          -top-2 transition-transform duration-300 delay-500
          ${activeTab === "leaves" ? "-right-2" : "-left-2"}`}
            >
              {leavesCount}
            </div>
          )}

          {/* Tab Buttons */}
          {["leaves", "verify"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`uppercase transition-all duration-200 px-8 py-2 rounded-lg text-[12px] tracking-tight border-none shadow-md ${activeTab === tab
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                : "bg-neutral-50 text-neutral-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters Wrapper */}
        <div className="flex items-center gap-2">
          {["all", "period"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              disabled={mode === "period" && !currentClass}
              className={`px-4 py-2 rounded-lg text-[12px]  uppercase transition-all border ${filterMode === mode
                ? "bg-slate-800 border-slate-800 text-white shadow-lg"
                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                } ${mode === "period" && !currentClass ? "opacity-40 grayscale cursor-not-allowed" : ""}`}
            >
              {mode === "all" ? "All Applications" : "By Current Period"}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Warning Message */}
      {filterMode === "period" && !currentClass && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-xs font-medium mb-6">
          <FiInfo size={14} />
          <span>No active class found in the current period.</span>
        </div>
      )}

      {/* Leaves list */}
      <div className="w-full flex-1 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 overflow-y-auto custom-scrollbar pb-4">

        {filteredLeaves?.length > 0 ? (
          filteredLeaves.map((leave, id) => (
            <div
              key={id}
              className="flex justify-between p-4 rounded-2xl border border-slate-200 shadow-md bg-white hover:border-indigo-200 transition-colors max-w-[28rem] h-fit min-w-0"
            >
              {/* Left: Metadata Grid */}
              <div className="flex flex-col gap-3 flex-1 min-w-0 pr-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">{leave.name}</h4>
                  <p className="text-[11px] font-black uppercase text-slate-400">
                    {leave.branch} • Year {leave.year}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  {activeTab === "verify" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">Sub:</span>
                      <span className="text-xs text-slate-600 truncate font-medium">{leave.subject}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">From</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {new Date(leave.applicable_from).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="text-slate-300">→</div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">To</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {new Date(leave.applicable_to).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Actions & Stats */}
              <div className="flex flex-col items-end justify-between shrink-0 border-l border-slate-100 pl-4">
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => setSelectedLeave(leave)}
                    className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-tighter border-none bg-transparent"
                  >
                    View Application
                  </button>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-[12px] font-bold text-slate-500">{leave.total_leaves} Leaves</span>
                  </div>
                </div>

                {activeTab === "verify" && (
                  <div className="flex gap-1 mt-3">
                    <button
                      onClick={() => verifyLeave("Rejected", leave, id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Reject"
                    >
                      <FiX size={18} />
                    </button>
                    <button
                      onClick={() => verifyLeave("Approved", leave, id)}
                      className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
                      title="Approve"
                    >
                      <FiCheck size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No Leaves</p>
        )}
      </div>

      {/* Modal */}
      {selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Leave Application
            </h3>

            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Name:</span> {selectedLeave.name}</p>
              <p><span className="font-medium">Subject:</span> {selectedLeave.subject}</p>
              <p>
                <span className="font-medium">From:</span>{" "}
                {new Date(selectedLeave.applicable_from).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </p>
              <p>
                <span className="font-medium">To:</span>{" "}
                {new Date(selectedLeave.applicable_to).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>

            <hr className="my-4" />

            <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedLeave.application}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeaveManagement;
