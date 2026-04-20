import React from "react";

const AttendanceRing = ({ attendancePercent = 0 }) => {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (attendancePercent / 100) * circumference;

  const getStatus = (p) => {
    if (p >= 90)
      return { color: "#10b981", tag: "Obedient Student", textClass: "text-emerald-600" };
    if (p >= 75)
      return { color: "#6366f1", tag: "Regular Student", textClass: "text-indigo-600" };
    if (p >= 50)
      return { color: "#f59e0b", tag: "Needs Improvement", textClass: "text-amber-600" };
    return { color: "#ef4444", tag: "At Risk", textClass: "text-red-600" };
  };

  const status = getStatus(attendancePercent);

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={status.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-800">
            {attendancePercent}%
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${status.textClass}`}>
            {status.tag}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRing;