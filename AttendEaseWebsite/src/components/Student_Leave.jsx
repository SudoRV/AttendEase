import { useEffect, useRef } from "react";
import { AppStates } from "../services/states";

const LeaveBox = () => {

  const applicationRef = useRef(HTMLTextAreaElement);
  const applicable_from_ref = useRef(HTMLInputElement);
  const applicable_to_ref = useRef(HTMLInputElement);

  const { userData, leaveHistory, loadLeaves, buildUrl } = AppStates();

  useEffect(() => {
    // fetch leave
    if (!userData?.email) return;
    loadLeaves(userData?.role);
  }, [userData])

  async function submitLeave() {
    const application = applicationRef.current.value;
    const from = applicable_from_ref.current.value;
    const to = applicable_to_ref.current.value;

    if (application === "" || !from || !to) {
      alert("Enter leave details");
      return;
    }

    const subjectMatch = application.match(/[Ss]ubject\s*:\s*(.*)\n*/);
    const subject = subjectMatch
      ? subjectMatch[1]
      : "Leave Application";

    // upload to database
    const leave = {
      applicant: userData,
      subject: subject,
      application: application,
      applicable_from: from,
      applicable_to: to
    }

    const response = await fetch(buildUrl("/upload-leave"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(leave)
    })

    const resdata = await response.json();
    if(resdata.success){
      alert(resdata.message);
      applicable_from_ref.value = "";
      applicable_to_ref.value = "";
      applicationRef.value = "";
    } else {
      alert(resdata.message);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
  
  {/* Top Section: History & Latest Status */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    
    {/* Leave History Card */}
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Leave History</h2>
      <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl">
        <p className="text-slate-600 font-medium">Leaves this month</p>
        <span className="text-xl font-black text-indigo-600">
          {leaveHistory?.length || 0}
        </span>
      </div>
    </div>

    {/* Latest Leave Status Card */}
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Latest Status</h2>
      {leaveHistory && leaveHistory.length > 0 ? (
        <div className="space-y-1 overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject</span>
            <span className="text-sm font-semibold text-slate-700 text-right truncate max-w-[150px]">
              {leaveHistory[0]?.subject}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Duration</span>
            <span className="text-sm font-medium text-slate-600">
              {new Date(leaveHistory[0]?.applicable_from).toLocaleDateString("en-IN")} 
              <span className="mx-1 text-slate-300">→</span>
              {new Date(leaveHistory[0]?.applicable_to).toLocaleDateString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tighter 
              ${leaveHistory[0]?.status === 'Approved' ? 'bg-green-100 text-green-600' : 
                leaveHistory[0]?.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
              {leaveHistory[0]?.status}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic py-4 text-center">No leave history found</p>
      )}
    </div>
  </div>

  {/* Submit Leave Form */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h2 className="text-xl font-bold text-slate-800 mb-6">Submit New Leave</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">From Date</label>
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
          ref={applicable_from_ref} 
          name="applicable_from" 
          type="date" 
          required 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">To Date</label>
        <input 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
          ref={applicable_to_ref} 
          name="applicable_to" 
          type="date" 
          required 
        />
      </div>
    </div>

    <div className="flex flex-col gap-2 mb-6">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Application Details</label>
      <textarea 
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" 
        ref={applicationRef} 
        name="leave_application" 
        placeholder="Reason for leave..." 
        rows={4} 
        required
      ></textarea>
    </div>

    <button
      className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200 border-none"
      onClick={submitLeave}
    >
      Submit Application
    </button>
  </div>

</div>
  );
};

export default LeaveBox;
