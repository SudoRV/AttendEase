import { useState } from "react";
import Select from "react-select";
import { AppStates } from "../services/states";
import { FiCalendar, FiClock, FiCheckCircle, FiInfo } from "react-icons/fi";

const TeacherAvailability1 = ({ onSubmit }) => {
  const { userData, classes, doFetch, loadTimetable } = AppStates();
  const [leaveType, setLeaveType] = useState("");
  const [periods, setPeriods] = useState([]);

  const handleTeacherAvailability = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());
    formData.applicant = userData;
    formData.classes = periods;

    const response = await doFetch("/teacher-availability", "POST", { "Content-Type": "application/json" }, JSON.stringify(formData));
    const res_data = await response.data.json();
    loadTimetable();
    alert(res_data.message);
  };

  // Custom styles for react-select to match the modern UI
  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '12px',
      padding: '4px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      boxShadow: 'none',
      '&:hover': { border: '1px solid #6366f1' }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e0e7ff',
      borderRadius: '6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#4338ca',
      fontWeight: '600',
      fontSize: '12px'
    })
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <FiClock size={20} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-800 tracking-tight">Teacher Availability</h4>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Update your schedule status</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleTeacherAvailability}>
        
        {/* Leave Type Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type of Absence</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 appearance-none cursor-pointer font-semibold text-sm" 
            name="leave_type" 
            value={leaveType} 
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Select Absence Mode</option>
            <option value="period">Specific Periods</option>
            <option value="day">Entire Work Day</option>
            <option value="duration">Date Range (Multiple Days)</option>
          </select>
        </div>

        {leaveType && (
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {leaveType === "period" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Affected Classes</label>
                  <Select
                    className="w-full"
                    name="classes"
                    isMulti
                    styles={selectStyles}
                    placeholder="Search periods..."
                    options={classes.classes
                      ?.filter(c => !!c?.code?.trim())
                      .map(c => ({
                        value: JSON.stringify(c),
                        label: `${c.period}: ${c.code} (${c.section})`
                      }))
                    }
                    onChange={(values) => setPeriods(values.map(v => JSON.parse(v.value)))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <DateInput label="From Date" name="from" />
                  <DateInput label="To Date" name="to" />
                </div>
              </div>
            )}

            {leaveType === "duration" && (
              <div className="grid grid-cols-2 gap-4">
                <DateInput label="Starts On" name="from" />
                <DateInput label="Ends On" name="to" />
              </div>
            )}

            {leaveType === "day" && (
              <DateInput label="Select Specific Day" name="on" />
            )}

          </div>
        )}

        {/* Info Note */}
        {!leaveType && (
          <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
            <FiInfo className="text-indigo-400 shrink-0" />
            <p className="text-xs text-indigo-600 font-medium">Please select a leave type to view available scheduling options.</p>
          </div>
        )}

        <button 
          className="w-full md:w-fit md:ml-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all border-none" 
          type="submit"
        >
          <FiCheckCircle size={18} />
          Submit Availability
        </button>
      </form>
    </div>
  );
};

// Internal Helper for Date Inputs
const DateInput = ({ label, name }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <input 
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-colors" 
        name={name} 
        type="date" 
        min={new Date().toISOString().split("T")[0]} 
      />
    </div>
  </div>
);

export default TeacherAvailability1;