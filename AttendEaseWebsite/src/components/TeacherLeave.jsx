import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { AppStates } from "../services/states";

const TeacherLeave = ({ onClose }) => {
    const { 
        userData, 
        classes, 
        loadTimetable, 
        loadLeaves, 
        buildUrl, 
        teacherLeaveHistory, 
        formatDate 
    } = AppStates();

    const [leaveType, setLeaveType] = useState("period");
    const [periods, setPeriods] = useState([]);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [onDate, setOnDate] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [filter, setFilter] = useState("Mine");

    // Substitution state
    const [substView, setSubstView] = useState({ visible: false, teacher_id: null });
    const [absentTeacherClasses, setAbsentTeacherClasses] = useState([]);

    useEffect(() => {
        setFromDate("");
        setToDate("");
        setOnDate("");
    }, [leaveType]);

    const togglePeriod = (item) => {
        const exists = periods.find(p => p.id === item.id);
        if (exists) {
            setPeriods(periods.filter(p => p.id !== item.id));
        } else {
            setPeriods([...periods, item]);
        }
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                leave_type: leaveType,
                applicant: userData,
                classes: periods,
                from: fromDate || onDate || new Date().toISOString().split('T')[0],
                to: toDate || onDate || new Date().toISOString().split('T')[0],
                on: onDate || null,
            };

            const response = await fetch(buildUrl("/teacher-availability"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const res_data = await response.json();
            if (!response.ok) throw new Error(res_data?.message || "Error submitting leave");

            loadTimetable();
            loadLeaves();
            alert(res_data.message);
        } catch (error) {
            alert(error.message);
        }
    };

    // Substitution logic
    useEffect(() => {
        if (substView.visible && substView.teacher_id) {
            const day = new Date().toLocaleDateString("en-Gb", { weekday: "long" });
            fetch(buildUrl(`/get-timetable?day=${day}&teacher_id=${substView.teacher_id}`))
                .then(res => res.json())
                .then(json => setAbsentTeacherClasses(json?.data?.classes || []));
        }
    }, [substView]);

    const processSubstitution = async (clas, action) => {
        const response = await fetch(buildUrl("/set-substitutor"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                class_id: clas.id,
                substitutee: { teacher_id: clas?.teacher_id },
                substitutor: {
                    teacher_name: userData?.name,
                    teacher_id: userData?.teacher_id,
                    substituted_till: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
                },
                action: action
            })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            setSubstView({ visible: false, teacher_id: null }); // Close modal on success
        }
    };

    const filteredLeaves = (teacherLeaveHistory || []).filter(l => {
          if (filter === "Mine") {
              return l.teacher_id === userData?.teacher_id;
          }
          return true;
      });
    return (
        <div className="flex flex-col h-full bg-slate-100 overflow-y-auto p-2">
            {/* HEADER */}
            <div className="flex justify-center items-center mb-2 items-center text-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Availability</h1>
                    <p className="text-slate-500">Mark your unavailability for classes</p>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 w-full">
                <h2 className="text-lg font-semibold text-slate-600 mb-4">Select Leave Type</h2>
                
                <div className="bg-slate-100 rounded-full p-1 flex mb-6">
                    {["period", "day", "duration"].map(type => (
                        <button
                            key={type}
                            onClick={() => setLeaveType(type)}
                            className={`flex-1 py-2 rounded-full capitalize font-medium transition ${leaveType === type ? "bg-indigo-600 text-white" : "text-slate-600"}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {leaveType === "period" && (
                    <div className="mb-4">
                        <label className="block text-slate-600 text-sm font-medium mb-2">Select Classes</label>
                        <button 
                            onClick={() => setModalVisible(true)}
                            className="w-full text-left bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-indigo-300 transition"
                        >
                            {periods.length ? `${periods.length} classes selected` : "Click to select classes"}
                        </button>
                    </div>
                )}

                {(leaveType === "duration" || leaveType === "period") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateField label="From Date" value={fromDate} onChange={setFromDate} />
                        <DateField label="To Date" value={toDate} onChange={setToDate} />
                    </div>
                )}

                {leaveType === "day" && (
                    <DateField label="Select Day" value={onDate} onChange={setOnDate} />
                )}

                <button onClick={handleSubmit} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-semibold shadow-lg transition">
                    Submit Leave
                </button>
            </div>

            {/* LEAVE HISTORY */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-4">Leave History</h2>
                <div className="flex gap-2 mb-6">
                    {["Mine", "All"].map(t => (
                        <button 
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`px-6 py-2 rounded-full font-semibold transition ${filter === t ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeaves.map((item, idx) => (
                        <div 
                            key={idx}
                            onClick={() => setSubstView({ visible: true, teacher_id: item.teacher_id })}
                            className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition"
                        >
                            <h3 className="font-bold text-slate-800">{item.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {new Date(item.applicable_from).toLocaleDateString()} 
                                {item.applicable_from !== item.applicable_to && ` → ${new Date(item.applicable_to).toLocaleDateString()}`}
                            </p>
                            <div className="flex justify-between items-center mt-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${item.status === 'Approved' ? 'bg-green-600' : 'bg-yellow-500'}`}>
                                    {item.status}
                                </span>
                                <span className="text-indigo-600 text-sm font-medium">Substitution &rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CLASS SELECTION MODAL (OVERLAY) */}
            {modalVisible && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-bold">Select Classes</h3>
                            <button onClick={() => setModalVisible(false)} className="text-indigo-600 font-bold rounded-full">Done</button>
                        </div>
                        {classes?.classes?.filter(c => c.subject_id)?.map((c, i) => (
                            <div 
                                key={i} 
                                onClick={() => togglePeriod(c)}
                                className={`p-4 mb-2 rounded-xl border cursor-pointer transition ${periods.find(p => p.id === c.id) ? "bg-indigo-50 border-indigo-500" : "bg-slate-50"}`}
                            >
                                {c.period_id}: {c.subject_name} ({c.subject_id})
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SUBSTITUTION MODAL */}
            {substView.visible && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setSubstView({ visible: false })} className="absolute top-6 right-6 text-2xl">&times;</button>
                        <h3 className="text-2xl font-bold mb-2">Substitute Class</h3>
                        <p className="text-slate-500 mb-8">Select a class to attend as a substitute teacher.</p>
                        
                        <div className="space-y-4">
                            {absentTeacherClasses.map(clas => (
                                <div key={clas.id} className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-slate-50">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold">{clas.subject_name}</h4>
                                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">P{clas.period_id}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">Room {clas.room_number} | {clas.branch_id}</p>
                                    
                                    {clas.substitute_teacher_id ? (
                                        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-lg text-center text-sm text-green-700 font-medium">
                                            ✅ Substituted by {clas.substitute_teacher_name}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => processSubstitution(clas, "confirm")}
                                            className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-xl font-medium"
                                        >
                                            Take Substitution
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DateField = ({ label, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-slate-600 text-sm font-medium mb-2">{label}</label>
        <input 
            type="date" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl outline-none focus:border-indigo-500 transition"
        />
    </div>
);

export default TeacherLeave;