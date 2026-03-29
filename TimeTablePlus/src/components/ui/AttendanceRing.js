import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AttendanceRing = ({ attendancePercent = 0 }) => {
  // Configuration
  const size = 180; // Total width/height
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate how much of the ring to fill
  const strokeDashoffset = circumference - (attendancePercent / 100) * circumference;

  // Determine Colors & Tags (Same logic as before)
  const getStatus = (p) => {
    if (p >= 90) return { color: '#10b981', tag: 'Obedient Student', textClass: 'text-emerald-600' };
    if (p >= 75) return { color: '#6366f1', tag: 'Regular Student', textClass: 'text-indigo-600' };
    if (p >= 50) return { color: '#f59e0b', tag: 'Needs Improvement', textClass: 'text-amber-600' };
    return { color: '#ef4444', tag: 'At Risk', textClass: 'text-red-600' };
  };

  const status = getStatus(attendancePercent);

  return (
    <View className="items-center justify-center mb-8">
      {/* Container for SVG and absolute-positioned text */}
      <View style={{ width: size, height: size }} className="items-center justify-center">
        
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background Circle (The Gray Track) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9" // slate-100
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle (The Colored Portion) */}
          <Circle
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
        </Svg>

        {/* Center Text (Positioned Absolutely) */}
        <View className="absolute items-center justify-center">
          <Text className="text-4xl font-black text-slate-800">
            {attendancePercent}%
          </Text>
          <Text className={`text-[10px] font-bold uppercase tracking-widest ${status.textClass}`}>
            {status.tag}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AttendanceRing;