import { AppStates } from "../services/states";import React, { useEffect, useState } from "react";
import { FiX, FiChevronDown, FiChevronUp, FiCalendar, FiFileText } from "react-icons/fi";


const StudentLeave = () => {
  const { userData, leaveHistory, loadLeaves, buildUrl, formatDate } = AppStates();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [application, setApplication] = useState("");
  const [loading, setLoading] = useState(false);

  const [latestLeaveModal, setLatestLeaveModal] = useState(false);
  const [latestLeaveCollapsed, setLatestLeaveCollapsed] = useState({ collapsed: false, index: 0 });
  const [leavesFilter, setLeavesFilter] = useState({ month: new Date().getMonth(), set: true });
  const [leavesByMonth, setLeavesByMonth] = useState({});

  async function fetchLeaves() {
    if (!userData?.email) return;
    const leaves_by_month = await loadLeaves(leavesFilter);
    
    if (leaves_by_month?.data?.length > 0) {
      setLeavesByMonth(leaves_by_month);
    } else {
      setLeavesByMonth([]);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, [userData, leavesFilter]);

  async function submitLeave(e) {
    e.preventDefault();
    if (!application.trim() || !fromDate || !toDate) {
      alert("Please fill all leave details.");
      return;
    }

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (toDateObj < fromDateObj) {
      alert("'To' date cannot be before 'From' date.");
      return;
    }

    const subjectMatch = application.match(/[Ss]ubject\s*:\s*(.*)\n*/);
    const subject = subjectMatch ? subjectMatch[1] : "Leave Application";

    fromDateObj.setHours(0, 5, 0, 0);
    toDateObj.setHours(23, 55, 0, 0);

    const leave = {
      applicant: userData,
      subject,
      application,
      applicable_from: formatDate(fromDateObj),
      applicable_to: formatDate(toDateObj)
    };

    try {
      setLoading(true);
      const response = await fetch(buildUrl("/upload-leave"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leave)
      });

      const resdata = await response.json();

      if (resdata?.success) {
        alert(resdata.message);
        setApplication("");
        setFromDate("");
        setToDate("");
        loadLeaves();
      } else {
        alert(resdata.message || "Something went wrong.");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function FieldLabel({ text }) {
    return <label className="block text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{text}</label>;
  }

  const latestLeaveSource = leavesByMonth?.data?.length > 0 ? leavesByMonth : { data: leaveHistory };
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="border border-slate-200 shadow-xl rounded-2xl bg-white dark:bg-neutral-950/60 p-4 sm:p-6 md:p-8 transition-colors duration-200">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Leave Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Submit and track your leave applications</p>
        </div>

        {/* LEAVE SUMMARY */}
        <div className="bg-slate-100 dark:bg-neutral-900 rounded-3xl p-6 shadow-md border border-slate-200/60 dark:border-slate-800/80 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Leave History</h2>
            <button 
              onClick={() => setLatestLeaveModal(true)}
              className="text-white text-xs font-semibold px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-800 dark:hover:bg-indigo-500 rounded-full transition-colors border-slate-400"
            >
              View All
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">Leaves this month</p>
          <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{leaveHistory?.length || 0}</p>
        </div>

        {/* LATEST STATUS */}
        <div className="bg-slate-100 dark:bg-neutral-900 rounded-3xl p-6 shadow-md border border-slate-200/60 dark:border-slate-800/80 transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Leave Status</h2>

          {leaveHistory?.length ? (
            <div className="space-y-3">
              <p className="text-slate-700 dark:text-slate-300 font-medium">{leaveHistory[0]?.subject}</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                <FiCalendar />
                {new Date(leaveHistory[0]?.applicable_from).toLocaleDateString("en-IN")}
                {" — "}
                {new Date(leaveHistory[0]?.applicable_to).toLocaleDateString("en-IN")}
              </p>

              <div className="flex justify-between items-center pt-1">
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  leaveHistory[0]?.status === "Approved" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" :
                  leaveHistory[0]?.status === "Rejected" ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                }`}>
                  {leaveHistory[0]?.status}
                </span>

                <button 
                  onClick={() => setLatestLeaveModal(true)}
                  className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm italic">No leave submitted yet</p>
          )}
        </div>

        {/* SUBMIT FORM */}
        <form onSubmit={submitLeave} className="bg-slate-100  dark:bg-neutral-900 rounded-3xl p-6 shadow-md border border-slate-200/60 dark:border-slate-800/80 space-y-4 transition-colors">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Submit Leave</h2>

          <div>
            <FieldLabel text="From Date" />
            <input 
              type="date"
              value={fromDate}
              min={todayString}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <FieldLabel text="To Date" />
            <input 
              type="date"
              value={toDate}
              min={fromDate || todayString}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <FieldLabel text="Application" />
            <textarea
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              placeholder="Write your leave reason (Include Subject: ... for auto-parsing)"
              className="w-full h-36 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 outline-none transition-all resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
              loading ? "bg-indigo-300 dark:bg-indigo-800/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none"
            }`}
          >
            {loading ? "Submitting..." : "Submit Leave"}
          </button>
        </form>

      </div>

      {/* WEB LEAVE HISTORY MODAL OVERLAY */}
      {latestLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-[2rem] p-6 shadow-2xl flex flex-col max-h-[85vh] relative border border-transparent dark:border-slate-800/60 animate-in slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">Latest Application Details</h3>
              <button 
                onClick={() => setLatestLeaveModal(false)}
                className="px-2 py-1 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Collapsible Active Leave Preview */}
            {latestLeaveSource?.data?.length > 0 && (
              <div className="mt-4 bg-slate-100 shadow-md dark:bg-neutral-800 rounded-xl border border-slate-200/60 dark:border-slate-800 p-4 space-y-3 relative overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setLatestLeaveCollapsed(prev => ({ ...prev, collapsed: !prev.collapsed }))}
                  className="absolute right-3 top-3 py-1 px-2 text-slate-600 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-slate-400 bg-slate-200 dark:bg-neutral-700 rounded-full transition-colors"
                >
                  {latestLeaveCollapsed.collapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
                </button>

                {!latestLeaveCollapsed.collapsed && (
                  <>
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-1 rounded-md">
                        From: {new Date(latestLeaveSource.data[latestLeaveCollapsed.index]?.applicable_from).toLocaleDateString("en-IN")}
                      </span>
                      <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-1 rounded-md">
                        To: {new Date(latestLeaveSource.data[latestLeaveCollapsed.index]?.applicable_to).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2 py-1 rounded-md inline-block">
                      Subject: {latestLeaveSource.data[latestLeaveCollapsed.index]?.subject}
                    </p>
                    <div className="pt-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1"><FiFileText /> Description</span>
                      <p className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 min-h-[80px] p-2.5 rounded-xl mt-1.5 whitespace-pre-wrap overflow-y-auto max-h-32">
                        {latestLeaveSource.data[latestLeaveCollapsed.index]?.application}
                      </p>
                    </div>
                  </>
                )}
                {latestLeaveCollapsed.collapsed && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold truncate pr-6">
                    Viewing Description: {latestLeaveSource.data[latestLeaveCollapsed.index]?.subject}
                  </p>
                )}
              </div>
            )}

            {/* Filter Area */}
            <div className="flex justify-between items-center my-5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">History</h4>
              <select 
                value={leavesFilter.month}
                onChange={(e) => setLeavesFilter(prev => ({ ...prev, month: parseInt(e.target.value), set: false }))}
                className="bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-colors"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => (
                  <option key={m} value={m}>
                    {new Date(2026, m, 1).toLocaleDateString("en-GB", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            {/* Scrollable list items */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {leavesByMonth?.data?.length > 0 ? (
                leavesByMonth.data.map((leave, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLatestLeaveCollapsed({ collapsed: false, index: idx })}
                    className={`w-full text-left bg-slate-50 dark:bg-neutral-950/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col gap-2 transition-all group ${
                      latestLeaveCollapsed.index === idx ? 'ring-2 ring-indigo-500/20 border-indigo-300 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10' : ''
                    }`}
                  >
                    <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                      {leave?.subject}
                    </p>
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(leave?.applicable_from).toLocaleDateString("en-IN")} - {new Date(leave?.applicable_to).toLocaleDateString("en-IN")}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        leave?.status.trim().toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400" :
                        leave?.status.trim().toLowerCase() === "approved" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      }`}>
                        {leave?.status}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="font-semibold">No leaves found</p>
                  <p className="text-xs mt-1">For {new Date(2026, leavesFilter.month, 1).toLocaleDateString("en-GB", { month: "long" })}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLeave;