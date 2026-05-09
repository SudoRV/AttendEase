import React, { useEffect, useState } from "react";
import { 
  FiShield, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiCalendar, 
  FiClock, 
  FiCopy, 
  FiLoader 
} from "react-icons/fi";
import AttendanceRing from "./AttendanceRing";
import AttendanceTable from "./AttendanceTable";
import { AppStates } from "../services/states";

const injectionCode = `javascript:(()=>{
    const get = n => document.querySelector(\`[name=\${n}]\`)?.value || "";
    const data = ["CollegeId","StudentAdmissionId","CourseId","BranchId"].reduce((o,k)=>(o[k]=get(k),o),{});
    if (Object.values(data).some(v => !v)) return alert("Fill attendance page first");
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(text).then(() => alert("✅ Copied!\\n" + text));
})();`;

export default function AttendanceDashboard() {
  const { userData, buildUrl, classes, loadTimetable, setUserData } = AppStates();
  const [hasConfig, setHasConfig] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false);

  const [attendance, setAttendance] = useState({});
  const [skipReport, setSkipReport] = useState({});

  const [form, setForm] = useState({
    name: "", roll: "", collegeId: "", admissionId: "",
    courseId: "", branchId: "", durationId: "", startMonth: ""
  });

  const copyCode = () => {
    navigator.clipboard.writeText(injectionCode);
    alert("Injection code copied to clipboard.");
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return alert("Clipboard is empty");

      const parsed = JSON.parse(text);
      setForm(prev => ({
        ...prev,
        collegeId: parsed.CollegeId?.toString() || prev.collegeId,
        admissionId: parsed.StudentAdmissionId?.toString() || prev.admissionId,
        courseId: parsed.CourseId?.toString() || prev.courseId,
        branchId: parsed.BranchId?.toString() || prev.branchId,
      }));
      alert("Configuration IDs updated!");
    } catch (err) {
      alert("Invalid data format in clipboard.");
    }
  };

  const handleSubmit = async () => {
    if (!form.admissionId || !form.branchId) {
      alert("Please provide all ID fields.");
      return;
    }
    const response = await fetch(buildUrl("/save/utu-creds"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response?.json();

    if (data.success) {
      setHasConfig(true);
      if(!userData?.admissionId){
        const user_creds = { ...userData, collegeId: form?.collegeId, admissionId: form?.admissionId, courseId: form?.courseId, branchId: form?.branchId, semester: form?.durationId, start_month: form?.startMonth };
        localStorage.setItem("user_creds", JSON.stringify(user_creds));
        setUserData(user_creds);
      }
    }
  };

  async function loadAttendance(creds) {
    setLoading(true);
    try {
      const response = await fetch(buildUrl("/fetch-attendance"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "creds": JSON.stringify(creds)
        }
      });
      const data = await response.json();
      setAttendance(data.attendance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const utu_creds = {
      name: userData.name || "",
      roll: userData.student_id || "",
      collegeId: userData.collegeId?.toString() || "",
      admissionId: userData.admissionId?.toString() || "",
      courseId: userData.courseId?.toString() || "",
      branchId: userData.branchId?.toString() || "",
      durationId: userData.semester?.toString() || "",
      startMonth: userData.start_month?.toString() || new Date().getMonth() + 1
    };
    setForm(prev => ({...prev, ...utu_creds}));
    if (userData?.admissionId) {
      setHasConfig(true);
      loadAttendance(utu_creds);
    }
  }, [userData?.admissionId]);

  useEffect(() => {
    if (attendance.attendance) {
        skipClass(attendance);
    }
  }, [attendance.attendance]);

  async function skipClass(attendanceData) {
    if (!classes.classes || !attendanceData.attendance) return;

    const calculatSkipImpact = (att, clsList) => {
        return (parseInt(att?.report?.total_classes_attended) / (parseInt(att?.report?.total_classes_held) + clsList.length)) * 100;
    };

    const todayClasses = classes?.classes?.filter(c => c.subject_id?.trim() !== "" && c.cancelled === 0);
    const todayDrop = calculatSkipImpact(attendanceData, todayClasses);

    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayClasses = await loadTimetable(userData, nextDay.toLocaleString("en-Gb", { weekday: "long" }));
    const activeNextDayClasses = nextDayClasses?.classes?.filter(c => c.subject_id?.trim() !== "" && c.cancelled === 0);

    const nextDayDrop = calculatSkipImpact(attendanceData, activeNextDayClasses || []);

    setSkipReport({
      global: {
        message: parseFloat(attendanceData?.report?.attended) < 75.0 ? "You can't skip further classes" : "You are in safe zone",
        balanceFactor: Math.ceil((parseInt(attendanceData?.report?.total_classes_held) * 75) / 100 - parseInt(attendanceData?.report?.total_classes_attended))
      },
      today_skip: {
        drop: todayDrop,
        suggestion: todayDrop < 75 ? "You can't skip today's classes" : "You are safe to skip for today"
      },
      nextday_skip: {
        drop: nextDayDrop,
        suggestion: nextDayDrop < 75 ? "You can't skip classes" : "You are safe to skip tomorrow"
      }
    });
  }

  if (hasConfig) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 rounded-t-3xl overflow-y-auto">
        <div className="width-container mx-auto">
          <p className="text-gray-500 text-sm uppercase tracking-widest text-center mb-2">Attendance Report</p>
          <h1 className="text-2xl font-extrabold text-slate-800 text-center mb-8 uppercase">
            {form.name}
          </h1>

          <AttendanceRing attendancePercent={attendance?.report?.attended || 0} />

          <RiskReport skipReport={skipReport} />

          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Conducted" value={attendance?.report?.total_classes_held} color="text-slate-700" />
            <StatCard title="Attended" value={attendance?.report?.total_classes_attended} color="text-emerald-600" />
            <StatCard title="Missed" value={attendance?.report?.total_classes_held - attendance?.report?.total_classes_attended - (attendance?.report?.leaves || 0)} color="text-orange-500" />
            <StatCard title="Leaves" value={attendance?.report?.leaves || 0} color="text-blue-500" />
          </div>

          <div className="mt-8">
            <h2 className="text-slate-800 font-bold mb-3 text-lg">Monthly Breakdown</h2>
            <div className="flex flex-row overflow-x-scroll custom-scrollbar gap-2 pb-2">
              {(attendance?.attendance || [])?.map(m => (
                <button
                  key={m.month_id}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-6 py-2.5 rounded-full whitespace-nowrap font-semibold transition-colors ${selectedMonth?.month_id === m.month_id ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
                >
                  {m.month}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-white mt-4 rounded-3xl border border-slate-100 border-dashed">
                <FiLoader className="animate-spin text-indigo-600" size={32} />
                <p className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Updating...</p>
              </div>
            ) : (
              <AttendanceTable attendance={attendance} selectedMonth={selectedMonth} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-2 flex justify-center width-container mx-auto">
        <div className="attendance-data">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-800">Smart Setup</h1>
                <p className="text-slate-500 mt-1">Sync your academic records effortlessly.</p>
            </div>

            <div className="bg-slate-900 p-2 rounded-3xl mb-2 shadow-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-indigo-400 font-bold tracking-tighter uppercase text-xs">JS Console Script</span>
                    <button onClick={copyCode} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold transition-all">
                        COPY
                    </button>
                </div>
                <p className="text-slate-400 text-sm leading-5 italic line-clamp-3">
                    {injectionCode}
                </p>
            </div>

            <div className=" width-container bg-white p-2 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <InputField label="Student Name" value={form.name} editable={false} />
                <InputField label="Roll Number" value={form.roll} editable={false} />
                <div className="h-px bg-slate-100 my-4" />
                <InputField label="College ID" value={form.collegeId} onChange={v => setForm({...form, collegeId: v})} placeholder="e.g. 67" />
                <InputField label="Admission ID" value={form.admissionId} onChange={v => setForm({...form, admissionId: v})} placeholder="e.g. 2023001" />
                
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1"><InputField label="Course ID" value={form.courseId} onChange={v => setForm({...form, courseId: v})} /></div>
                    <div className="flex-1"><InputField label="Branch ID" value={form.branchId} onChange={v => setForm({...form, branchId: v})} /></div>
                </div>

                <div className="space-y-4">
                    <div onClick={() => setShowSemesterPicker(true)} className="cursor-pointer">
                        <p className="text-slate-500 text-xs font-bold uppercase ml-1 mb-1">Semester</p>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center">
                            <span className="text-slate-800 font-medium">Semester {form.durationId}</span>
                            <span className="text-indigo-600 font-bold text-sm">Change</span>
                        </div>
                    </div>

                    <div onClick={() => setShowMonthPicker(true)} className="cursor-pointer">
                        <p className="text-slate-500 text-xs font-bold uppercase ml-1 mb-1">Start Month</p>
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center">
                            <span className="text-slate-800 font-medium">{new Date(2024, form.startMonth || 0, 1).toLocaleString('en-GB', { month: 'long' })}</span>
                            <span className="text-indigo-600 font-bold text-sm">Change</span>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handlePaste} className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">
                Paste from Clipboard
            </button>

            <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 p-5 rounded-2xl shadow-xl font-bold text-lg transition-transform active:scale-95">
                Continue to Dashboard
            </button>

            {/* Simple Modals for Web */}
            {(showSemesterPicker || showMonthPicker) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center">
                    <div className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-slide-up">
                        <h3 className="text-xl font-bold text-center mb-6">{showSemesterPicker ? "Select Semester" : "Select Month"}</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {(showSemesterPicker ? [1,2,3,4,5,6,7,8,9,10] : [0,1,2,3,4,5,6,7,8,9,10,11]).map(num => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        if (showSemesterPicker) setForm({...form, durationId: num.toString()});
                                        else setForm({...form, startMonth: num.toString()});
                                        setShowSemesterPicker(false); setShowMonthPicker(false);
                                    }}
                                    className={`h-12 rounded-xl font-bold transition-all ${
                                        (showSemesterPicker ? form.durationId : form.startMonth) === num.toString() 
                                        ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    {showSemesterPicker ? num : new Date(2024, num, 1).toLocaleString('en-GB', { month: 'short' })}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => {setShowSemesterPicker(false); setShowMonthPicker(false);}} className="w-full mt-8 p-4 text-red-500 font-bold">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

function InputField({ label, value, onChange, editable = true, placeholder }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-slate-500 text-[10px] font-bold uppercase ml-1">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={!editable}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`p-4 rounded-2xl border outline-none transition-all ${editable ? 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400' : 'bg-slate-50 border-transparent text-slate-400 font-medium cursor-not-allowed'}`}
      />
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 w-full">
      <p className={`text-2xl font-black ${color}`}>{value || 0}</p>
      <p className="text-slate-400 text-[10px] font-bold uppercase mt-1 tracking-widest">{title}</p>
    </div>
  );
}

const RiskReport = ({ skipReport }) => {
  const isAtRisk = skipReport?.global?.balanceFactor > 0;

  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center justify-center gap-2">
        <FiShield className="text-slate-400" size={24} />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Risk Report</h2>
      </div>

      <div className={`w-full p-6 rounded-[28px] border-b-4 shadow-sm transition-colors ${isAtRisk ? "bg-red-50 border-red-500" : "bg-emerald-50 border-emerald-500"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-xl text-white ${isAtRisk ? "bg-red-500" : "bg-emerald-500"}`}>
            {isAtRisk ? <FiAlertTriangle size={20} /> : <FiCheckCircle size={20} />}
          </div>
          <p className={`flex-1 font-bold text-lg ${isAtRisk ? "text-red-700" : "text-emerald-700"}`}>
            {skipReport?.global?.message}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black ${isAtRisk ? "text-red-600" : "text-emerald-600"}`}>
            {Math.abs(skipReport?.global?.balanceFactor || 0)}
          </span>
          <span className="text-neutral-500 font-medium text-lg">
            {skipReport?.global?.balanceFactor > 0 
              ? "Classes to reach Safe Zone" 
              : "Classes above Danger zone"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {[
            { label: "Today", icon: <FiClock />, data: skipReport?.today_skip },
            { label: "Next Day", icon: <FiCalendar />, data: skipReport?.nextday_skip }
        ].map((item, i) => (
            <div key={i} className="min-w-[160px] flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase text-[10px] tracking-widest">
                    {item.icon} <span>{item.label}</span>
                </div>
                <p className="text-slate-800 font-black text-xl">{(item.data?.drop || 0).toFixed(2)}%</p>
                <p className={`text-[10px] font-bold leading-3 ${item.data?.drop < 75 ? "text-red-500" : "text-emerald-500"}`}>
                    {item.data?.suggestion}
                </p>
            </div>
        ))}
      </div>
    </div>
  );
};