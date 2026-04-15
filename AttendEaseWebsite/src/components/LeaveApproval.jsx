import { useEffect, useState } from "react";
import { AppStates } from "../services/states";

const StudentLeaveManagement = () => {
  const {
    userData,
    doFetch,
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

  async function verifyLeave(action, applicant, id) {
    const response = await doFetch(
      "/verify-leave",
      "GET",
      {
        "X-Action": action,
        "X-Applicant": applicant.student_id,
        "X-Verifier": JSON.stringify({
          role: userData.role,
          teacher_id: userData.teacher_id,
          teacher_name: userData.name
        })
      }
    );

    const res_data = await response.data?.json();
    if (res_data?.success) {
      setLeaveHistory(prev => prev.filter((_, i) => i !== id));
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
    <div className="w-full flex flex-col  mx-auto">

      {/* Tabs */}
      <div className="flex border-b w-full justify-between">

        <div className="relative">
          {
            leavesCount > 0 && (
              <div
                className={`absolute p-2 w-7 h-7 flex justify-center items-center rounded-full bg-red-500 text-white text-lg 
  -top-4 transition-transform duration-300 delay-500
  ${activeTab === "leaves" ? "-right-4" : "-left-4"}`}
              >
                {leavesCount}
              </div>
            )
          }
          {["leaves", "verify"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize transition w-[6rem] p-2 px-4 rounded-md border-none  ${activeTab === tab
                ? " bg-blue-600 text-white font-semibold"
                : "text-gray-500 hover:text-gray-700"
                } ${tab === "leaves" ? "rounded-r-none" : "rounded-l-none"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["all", "period"].map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              disabled={mode === "period" && !currentClass}
              className={`p-2 px-4 border-0 rounded-md text-sm transition ${filterMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
                } ${mode === "period" && !currentClass ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {mode === "all" ? "All" : "By Period"}
            </button>
          ))}
        </div>
      </div>

      {filterMode === "period" && !currentClass && (
        <p className="text-sm text-gray-500 mb-4">
          No active class in the current period.
        </p>
      )}

      {/* Leaves list */}
      <div className="w-full flex-1 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 overflow-y-auto">

        {filteredLeaves?.length > 0 ? (
          filteredLeaves.map((leave, id) => (
            <div
              key={id}
              className="flex justify-between p-4 rounded-xl border shadow-sm max-w-[30rem] h-fit bg-blue-50"
            >
              {/* Left */}
              <div className="text-sm">
                <p><span className="font-medium">Name:</span> {leave.name}</p>
                <p><span className="font-medium">Branch:</span> {leave.branch}</p>
                <p><span className="font-medium">Year:</span> {leave.year}</p>

                {
                  activeTab === "verify" ? (
                    <p><span className="font-medium">Subject:</span> {leave.subject}</p>
                  ) : (
                    <div className="flex gap-4">
                      <p><span className="font-medium">From:</span> {new Date(leave.applicable_from).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}</p>

                      <p><span className="font-medium">To:</span> {new Date(leave.applicable_to).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}</p>
                    </div>
                  )
                }

              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2 flex-1 text-sm">
                <button
                  onClick={() => setSelectedLeave(leave)}
                  className="border-none underline text-blue-600 hover:underline bg-transparent"
                >
                  View Application
                </button>

                <p className="text-gray-500">
                  Leaves this month: {leave.total_leaves}
                </p>

                {activeTab === "verify" && (
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => verifyLeave("Rejected", leave, id)}
                      className="px-3 py-1 rounded-md border-none bg-red-500 text-white hover:bg-red-600"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => verifyLeave("Approved", leave, id)}
                      className="px-3 py-1 border-none rounded-md bg-green-500 text-white hover:bg-green-600"
                    >
                      Approve
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
