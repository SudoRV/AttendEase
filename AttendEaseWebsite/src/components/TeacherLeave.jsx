import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import { AppStates } from "../services/states";
import {
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiX,
    FiMapPin,
    FiLayers,
    FiUser,
    FiArrowRight,
    FiRotateCcw,
    FiInbox
} from 'react-icons/fi';

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
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [onDate, setOnDate] = useState(null);
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
            console.log(fromDate, toDate, onDate);
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
            const day = classes?.day || new Date().toLocaleDateString("en-Gb", { weekday: "long" });
            fetch(buildUrl(`/get-timetable?day=${day}&teacher_id=${substView.teacher_id}`))
                .then(res => res.json())
                .then(json => setAbsentTeacherClasses(json?.data?.classes || []));
        }
    }, [substView]);

    const handleSelectClass = (clas, action) => {
        const title = action === "acquired" ? "Confirm Substitution" : "Cancel Substitution";
        const message = `Are you sure you want to ${action === "cancel" ? "cancel" : "acquire"} substitute for ${clas?.subject_name}?`;

        const confirmed = window.confirm(`${title}\n\n${message}`);

        if (confirmed) {
            processSubstitution(clas, action);
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
                    teacher_name: userData?.name,
                    teacher_id: userData?.teacher_id,
                    substituted_till: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
                },
                action: action
            })
        });

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
                        };
                    }
                    return item;
                })
            );

            alert(`Substitution of ${clas.subject_name} ${action}\n\n ${data.message}`);
        } else {
            alert(data.message);
        }
    };

    const filteredLeaves = (teacherLeaveHistory || []).filter(l => {
        if (filter === "Mine") {
            return l.teacher_id === userData?.teacher_id;
        }
        return true;
    });

    return (
        <div className="flex flex-col h-full text-neutral-800 dark:text-neutral-100 overflow-y-auto px-2 antialiased">

            {/* Header Block */}
            <div className="flex justify-between items-center pb-5">
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        Availability Engine
                    </h1>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-500 mt-0.5">
                        Log institutional absence or capture pending class substitutions
                    </p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                        <FiX size={18} />
                    </button>
                )}
            </div>

            {/* Form Setup Card Layout */}
            <div className="bg-white dark:bg-neutral-950/50 border border-neutral-200/50 dark:border-neutral-900 p-6 rounded-3xl shadow-xl dark:shadow-none space-y-6 max-w-3xl">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                        Select Leave Category
                    </h2>
                    <div className="p-1 rounded-xl flex gap-4 border border-neutral-200/30 dark:border-neutral-800/40">
                        {["period", "day", "duration"].map(type => (
                            <button
                                key={type}
                                onClick={() => setLeaveType(type)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide border-none uppercase transition-all duration-200
                                  ${leaveType === type
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                                        : "text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conditional Form Render Fields */}
                {leaveType === "period" && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            Target Period Bindings
                        </label>
                        <button
                            onClick={() => setModalVisible(true)}
                            className="w-full flex items-center justify-between bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 px-4 py-3 rounded-xl hover:border-indigo-500/50 transition duration-200 font-medium text-sm text-neutral-700 dark:text-neutral-300"
                        >
                            <span>{periods.length ? `${periods.length} periods selected` : "Tap to map specific classes"}</span>
                            <FiLayers size={16} className="text-neutral-400" />
                        </button>
                    </div>
                )}

                {leaveType === "duration" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                        <DateField label="From Date" value={fromDate} onChange={(date) => setFromDate(new Date(date))} />
                        <DateField label="To Date" value={toDate} onChange={(date) => setToDate(new Date(date))} />
                    </div>
                )}

                {leaveType === "day" && (
                    <div className="animate-in fade-in duration-200">
                        <DateField label="Select Absence Day" value={onDate} onChange={(date) => setOnDate(new Date(date))} />
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-indigo-500/10 transition active:scale-[0.99] border-none"
                >
                    Submit Absence Log
                    <FiArrowRight size={16} />
                </button>
            </div>

            {/* Leave & Substitution History Log Section */}
            <div className="h-full flex flex-col mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/60 dark:border-neutral-900 pb-3">
                    <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-neutral-50">
                        Leaves & Substitutions
                    </h2>
                    <div className="flex gap-2 p-0.5 rounded-lg border border-neutral-200/20 dark:border-neutral-800">
                        {["Mine", "All"].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 border-none
                                  ${filter === t
                                        ? "bg-white text-neutral-900 shadow-md"
                                        : "bg-neutral-200 text-neutral-100 dark:text-neutral-00 dark:bg-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-800"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 h-full">
                    {filteredLeaves.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSubstView({ visible: true, teacher_id: item.teacher_id })}
                            className="group relative bg-white dark:bg-neutral-950/40 p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-900 shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-800 transition cursor-pointer flex flex-col justify-between h-[140px]"
                        >
                            <div className="space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[12px] font-bold uppercase tracking-wider
                                      ${item.status === 'Approved'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-400 dark:text-neutral-500 font-medium inline-flex items-center gap-1">
                                    <FiCalendar size={12} />
                                    {new Date(item.applicable_from).toLocaleDateString()}
                                    {item.applicable_from !== item.applicable_to && ` → ${new Date(item.applicable_to).toLocaleDateString()}`}
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-900">
                                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400  inline-flex items-center gap-1">
                                    Substitutions
                                    <FiArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLeaves?.length === 0 && (
                    <div className="col-span-full flex-1 flex flex-col items-center justify-center py-12 px-4 text-center bg-neutral-50/40 dark:bg-neutral-900/10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl animate-in fade-in duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3 border border-neutral-200/50 dark:border-neutral-800">
                            <FiInbox size={40} />
                        </div>
                        <h3 className="font-bold text-neutral-800 dark:text-neutral-200">
                            No Leaves Logged
                        </h3>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-[260px] leading-relaxed mt-1 font-medium">
                            Your leave history pipeline is completely clear. Any recorded absences will appear here.
                        </p>
                    </div>
                )}
            </div>

            {/* Classes Mapping Selection Overlay Panel */}
            {modalVisible && (
                <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-base font-bold tracking-tight">Select Classes</h3>
                            <button
                                onClick={() => setModalVisible(false)}
                                className=" bg-transparent text-neutral-700 dark:text-indigo-400 hover:text-red-400 dark:hover:text-red-400 transition-colors border-none"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-2">
                            {classes?.classes?.filter(c => c.subject_id)?.map((c, i) => {
                                const isSelected = !!periods.find(p => p.id === c.id);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => togglePeriod(c)}
                                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between group
                                          ${isSelected
                                                ? "bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-300"
                                                : "bg-neutral-50 dark:bg-neutral-950 border-neutral-200/70 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"}`}
                                    >
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Period {c.period_id}</p>
                                            <p className="text-sm font-bold tracking-tight">{c.subject_name}</p>
                                        </div>
                                        {isSelected && <FiCheckCircle size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Substitution Execution Panel Overlay */}
            {substView.visible && (
                <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col max-h-[85vh] relative">
                        <button
                            onClick={() => setSubstView({ visible: false, teacher_id: null })}
                            className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition border-none"
                        >
                            <FiX size={18} />
                        </button>

                        <div className="mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                            <h3 className="text-2xl">Substitute Classes</h3>
                            <p className="font-medium text-neutral-400 dark:text-neutral-500">Select an open slot to claim coverage for this schedule track</p>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-3">
                            {absentTeacherClasses?.length > 0 ? (
                                absentTeacherClasses.map((clas) => {
                                    const isSubstituted = !!clas.substitute_teacher_id;
                                    const isMySubstitution = userData?.teacher_id === clas.substitute_teacher_id;

                                    return (
                                        <div
                                            key={clas.id}
                                            className={`p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 border 
                                              ${isSubstituted
                                                    ? 'bg-neutral-200/30 !border-green-500 dark:bg-neutral-950/40 border-neutral-200/20 dark:border-neutral-900/60'
                                                    : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-700 dark:border-neutral-800'}`}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className={`font-bold tracking-tight ${isSubstituted ? 'text-neutral-400 dark:text-neutral-500 line-through' : 'text-neutral-900 dark:text-white'}`}>
                                                        {clas.subject_name}
                                                    </h4>
                                                    <p className="text-[14px] text-neutral-400 font-medium tracking-wide uppercase mt-0.5">Code: {clas.subject_id}</p>
                                                </div>
                                                <span className={`text-[14px] px-2.5 py-0.5 rounded-md ${isSubstituted ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-900' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'}`}>
                                                    Period {clas.period_id}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-neutral-400 dark:text-neutral-500 font-medium pt-2 border-t border-neutral-100 dark:border-neutral-900/60">
                                                <span className="inline-flex items-center gap-1"><FiMapPin size={16} /> Room {clas.room_number}</span>
                                                <span>{clas.branch_id} • Year {clas.year} • Section {clas.section}</span>
                                            </div>

                                            {isSubstituted ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 bg-neutral-100 dark:bg-neutral-900/60 py-2 px-3 rounded-xl border border-neutral-200/20 text-center text-sm font-bold text-neutral-500 dark:text-neutral-400 inline-flex items-center justify-center gap-1.5">
                                                        <FiCheckCircle className="text-emerald-500" size={14} />
                                                        Acquired by {isMySubstitution ? "You" : clas.substitute_teacher_name}
                                                    </div>
                                                    {isMySubstitution && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectClass(clas, "cancel")}
                                                            className="p-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 text-red-600 dark:text-red-400 rounded-xl transition text-sm border-none font-bold inline-flex items-center gap-1"
                                                        >
                                                            <FiRotateCcw size={14} /> Release
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSelectClass(clas, "acquired")}
                                                    className="w-full mt-1 bg-indigo-500 hover:bg-indigo-600 transition text-white text-sm font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-md shadow-indigo-500/5 border-none"
                                                >
                                                    Acquire Substitution <FiArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center space-y-1">
                                    <FiAlertCircle className="text-neutral-300 dark:text-neutral-700 mx-auto" size={32} />
                                    <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 italic">No classes cataloged for substitution.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DateField = ({ label, value, onChange }) => {
    // Safely extract YYYY-MM-DD input string if a Date object is passed down
    const safeStringValue = value instanceof Date && !isNaN(value)
        ? value.toISOString().split('T')[0]
        : typeof value === "string" ? value : "";

    return (
        <div className="space-y-1.5 w-full">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {label}
            </label>
            <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 pointer-events-none z-20">
                    <FiCalendar size={16} />
                </span>
                <input
                    type="date"
                    value={safeStringValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 pl-11 pr-4 py-2.5 rounded-xl outline-none text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition duration-200 text-neutral-800 dark:text-neutral-100 [color-scheme:light] dark:[color-scheme:dark]"
                />
            </div>
        </div>
    );
};

export default TeacherLeave;