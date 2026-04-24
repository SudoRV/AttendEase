import React, { useEffect, useRef } from 'react';

const AttendanceTable = ({ attendance, selectedMonth }) => {
    const monthData = attendance?.attendance?.find(a => a?.month_id === selectedMonth?.month_id);
    const subjectsObj = monthData?.attendance || {};
    const subjects = Object.keys(subjectsObj);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!scrollRef.current || !selectedMonth) return;

        const now = new Date();
        if (selectedMonth.month_id === now.getMonth()) {
            const today = now.getDate();
            const step = 42;
            const targetX = (today * step) - (window.innerWidth / 2);
            scrollRef.current.scrollTo({ left: Math.max(0, targetX), behavior: 'smooth' });
        } else {
            scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
        }
    }, [selectedMonth]);

    if (!selectedMonth?.month_id && selectedMonth?.month_id !== 0) return null;

    return (
        <div className="attendance-dashboard bg-black shadow-lg pb-4 custom-scrollbar">
            {/* Subject Sidebar (Sticky replacement) */}
            <div className="flex flex-col bg-white w-24 flex-shrink-0 z-10 border-r border-slate-100 shadow-sm">
                <div className="h-16 flex items-center justify-center border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Subjects</span>
                </div>
                {subjects.map((subject) => (
                    <div key={subject} className="h-16 flex items-center p-2 border-b border-slate-100 last:border-b-0 overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-700 leading-3 line-clamp-5 uppercase">
                            {subject}
                        </span>
                    </div>
                ))}
            </div>

            {/* Scrollable Attendance Data */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-x-auto scrollbar-hide flex flex-col"
            >
                {/* Header Row */}
                <div className="flex h-16 border-b border-slate-100 min-w-max items-center px-2 gap-2">
                    {subjectsObj[subjects[0]]?.attendance?.map((_, i) => (
                        <div key={i} className="w-10 flex flex-col items-center justify-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase">Day</span>
                            <span className="text-xs font-bold text-slate-700">{i + 1}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 pl-4 border-l border-slate-50 italic">
                        <span className="w-10 text-[9px] font-black text-center text-slate-400 uppercase">Held</span>
                        <span className="w-10 text-[9px] font-black text-center text-slate-400 uppercase">Att.</span>
                        <span className="w-12 text-[9px] font-black text-center text-slate-400 uppercase">%</span>
                    </div>
                </div>

                {/* Subject Rows */}
                {subjects.map((sub) => (
                    <div key={sub} className="flex h-16 border-b border-slate-100 last:border-b-0 min-w-max items-center px-2 gap-2">
                        {subjectsObj[sub]?.attendance?.map((status, i) => (
                            <div key={i} className="flex flex-col gap-0.5">
                                {status.split(",").map((s, si) => (
                                    <div 
                                        key={si} 
                                        className={`w-10 h-5 flex items-center justify-center rounded-md text-[10px] font-black transition-colors ${
                                            s.trim() === "P" ? "bg-emerald-500 text-white" : 
                                            s.trim() === "A" ? "bg-red-500 text-white" : "bg-blue-50 text-slate-400"
                                        }`}
                                    >
                                        {s.trim() === "NA" ? "-" : s}
                                    </div>
                                ))}
                            </div>
                        ))}
                        {/* Summary Stats */}
                        <div className="flex gap-2 pl-4 border-l border-slate-50">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs">
                                {subjectsObj[sub]?.total_classes_held}
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-50 text-amber-700 font-black text-xs">
                                {subjectsObj[sub]?.total_classes_attended}
                            </div>
                            <div className="w-12 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-black text-xs">
                                {subjectsObj[sub]?.attended}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceTable;