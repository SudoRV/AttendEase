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
        setFromDate(null);
        setToDate(null);
        setOnDate(null);
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
            console.log(fromDate, toDate, onDate)
            const payload = {
                leave_type: leaveType,
                applicant: userData,
                classes: periods,

                from: formatDate(fromDate?.setHours(0, 5, 0, 0) || (onDate ? onDate.setHours(0, 5, 0, 0) : new Date().setHours(0, 5, 0, 0))),

                to: formatDate(toDate?.setHours(23, 55, 0, 0) || (onDate ? new Date(onDate).setHours(23, 55, 0, 0) : new Date().setHours(23, 55, 0, 0))),

                on: onDate ? formatDate(onDate?.setHours(0, 5, 0, 0)) : onDate,
            };

            const response = await fetch(
                buildUrl("/teacher-availability"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const res_data = await response.json();

            if (!response.ok) {
                throw new Error(res_data?.message || "Something went wrong");
            }

            loadTimetable();
            loadLeaves();
            alert(res_data.message);

        } catch (error) {
            console.error("Teacher Availability Error:", error);
            alert(error.message || "Network error. Please try again.");
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

    const handleSelectClass = (clas, action) => {
        const title = action === "acquired" ? "Confirm Substitution" : "Cancel Substitution";
        const message = `Are you sure you want to ${action === "cancel" ? "cancel" : "acquire"} substitute for ${clas?.subject_name}?`;

        // window.confirm returns true if 'OK' is clicked, false if 'Cancel' is clicked
        const confirmed = window.confirm(`${title}\n\n${message}`);

        if (confirmed) {
            processSubstitution(clas, action);
        } else {
            console.log("Cancelled");
        }
    };

    const processSubstitution = async (clas, action) => {

        const response = await fetch(buildUrl("/set-substitutor"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                class_id: clas.id,
                substitutee: {
                    teacher_id: clas?.teacher_id
                },
                substitutor: {
                    teacher_name: userData?.name, teacher_id: userData?.teacher_id, substituted_till: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
                },
                action: action
            })
        })

        const data = await response.json();

        if (!!data.success) {
            setAbsentTeacherClasses(previousClasses => 
                previousClasses?.map(item => {
                    if (item.id === clas.id) {
                        return {
                            ...item,
                            substitute_teacher_id: action === "acquired" ? userData?.teacher_id : null,
                            substitute_teacher_name: action === "acquired" ? userData?.name : null,
                            substituted_till: action === "acquired"
                                ? dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
                                : null,
                        }
                    }

                    return item;
                })
            );

            alert(`Substitution of ${clas.subject_name} ${action}\n\n ${data.message}`);
        } else {
            alert(data.message);
        }
    }

    const filteredLeaves = (teacherLeaveHistory || []).filter(l => {
        if (filter === "Mine") {
            return l.teacher_id === userData?.teacher_id;
        }
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-slate-100 overflow-y-auto p-2">
            {/* HEADER */}
            <div className="flex justify-center mb-2 items-center text-center">
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

                {leaveType === "duration" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateField label="From Date" value={fromDate} onChange={(date) => setFromDate(new Date(date))} />
                        <DateField label="To Date" value={toDate} onChange={(date) => setToDate(new Date(date))} />
                    </div>
                )}

                {leaveType === "day" && (
                    <DateField label="Select Day" value={onDate} onChange={(date) => setOnDate(new Date(date))} />
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
                            {absentTeacherClasses?.length > 0 ? (
                                <div className="flex flex-col space-y-4 mt-8">
                                    {absentTeacherClasses.map((clas) => {
                                        const isSubstituted = !!clas.substitute_teacher_id;
                                        const isMySubstitution = userData?.teacher_id === clas.substitute_teacher_id;

                                        return (
                                            <div
                                                key={clas.id}
                                                // Logic: Change cursor/pointer-events if disabled
                                                className={`p-4 rounded-3xl shadow-md transition-all ${isSubstituted
                                                    ? 'bg-gray-100 opacity-80 cursor-not-allowed'
                                                    : 'bg-white hover:bg-blue-50 cursor-pointer active:scale-[0.98]'
                                                    } mb-6 border border-gray-100`}
                                                onClick={() => !isSubstituted && handleSelectClass(clas, "acquired")}
                                            >
                                                <div className="flex flex-row justify-between items-center mb-2">
                                                    <div className="flex-1 text-left">
                                                        <h3 className={`text-lg font-bold ${isSubstituted ? 'text-gray-500' : 'text-gray-800'}`}>
                                                            {clas.subject_name}
                                                        </h3>
                                                        <p className="text-gray-400 text-sm">
                                                            Code: {clas.subject_id}
                                                        </p>
                                                    </div>

                                                    {/* Dynamic Badge */}
                                                    <div className={`${isSubstituted ? 'bg-gray-200' : 'bg-blue-100'} px-3 py-1 rounded-full`}>
                                                        <span className={`${isSubstituted ? 'text-gray-600' : 'text-blue-700'} font-semibold text-xs`}>
                                                            Period {clas.period_id}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row justify-between mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-gray-500 text-sm">
                                                        📍 Room {clas.room_number}
                                                    </p>
                                                    <p className="text-gray-500 text-sm text-right">
                                                        {clas.branch_id} - Year {clas.year} - Sec {clas.section}
                                                    </p>
                                                </div>

                                                {/* 🔥 Substitution Info Logic */}
                                                {isSubstituted ? (
                                                    <div className="flex flex-row justify-between items-center mt-4 gap-2">
                                                        <div className="bg-gray-200 p-2 rounded-lg border border-gray-300 flex-1">
                                                            <p className="text-gray-600 text-center font-medium text-sm">
                                                                ✅ Substituted by {clas.substitute_teacher_name}
                                                            </p>
                                                        </div>

                                                        {isMySubstitution && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevents triggering the parent div's onClick
                                                                    handleSelectClass(clas, "cancel");
                                                                }}
                                                                className="p-2 px-3 bg-red-500 hover:bg-red-600 transition-colors rounded-lg text-white text-sm whitespace-nowrap"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                                        <p className="text-white text-center font-medium">
                                                            Select for Substitution
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-10 text-center">
                                    <p className="text-gray-400 italic">No classes available for substitution.</p>
                                </div>
                            )}
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