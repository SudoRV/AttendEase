import React from 'react';

const AttendanceRing = ({ attendancePercent = 0 }) => {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (attendancePercent / 100) * circumference;

  const getStatus = (p) => {
    if (p >= 90) return { color: '#10b981', tag: 'Obedient Student', textClass: 'text-emerald-600' };
    if (p >= 75) return { color: '#6366f1', tag: 'Regular Student', textClass: 'text-indigo-600' };
    if (p >= 50) return { color: '#f59e0b', tag: 'Needs Improvement', textClass: 'text-amber-600' };
    return { color: '#ef4444', tag: 'At Risk', textClass: 'text-red-600' };
  };

  const status = getStatus(attendancePercent);

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
            width={size} 
            height={size} 
            className="transform -rotate-90 transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Path */}
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
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={`text-4xl font-black leading-none ${status.textClass}`}>
            {attendancePercent}%
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${status.textClass}`}>
            {status.tag}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRing;