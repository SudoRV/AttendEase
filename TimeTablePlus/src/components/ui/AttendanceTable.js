import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';

const AttendanceTable = ({ attendance, selectedMonth }) => {
    const monthData = attendance?.attendance?.find(a => a?.month_id === selectedMonth?.month_id);
    const subjectsObj = monthData?.attendance || {};
    const subjects = Object.keys(subjectsObj);
    const attendanceTableRef = useRef(null);

    const { width, height } = useWindowDimensions();

    useEffect(() => {
        if (!attendanceTableRef?.current || !selectedMonth) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const isCurrentMonth = selectedMonth.month_id === currentMonth;

        const timeoutId = setTimeout(() => {
            if (isCurrentMonth) {
                // 1. CENTER TODAY: Calculate specific offset
                const today = now.getDate();
                const step = 42;

                const targetX = (today * step) - (width / 2);
                console.log(targetX)

                attendanceTableRef.current?.scrollTo({
                    x: Math.max(0, targetX),
                    animated: true
                });
            } else {
                attendanceTableRef.current?.scrollToEnd({ animated: true });
            }
        }, 150);
        return () => clearTimeout(timeoutId);
    }, [selectedMonth, width]);

    if (!selectedMonth?.month_id) {
        return (
            <></>
        );
    }

    return (
        <View className="flex-1 bg-white flex-row my-4 rounded-xl elevation-md overflow-hidden">
            {/* subjects */}
            <View className="flex flex-col bg-white w-24">
                <View className="h-14 justify-center px-3 border-b border-r border-slate-100">
                    <Text className="text-[12px] font-semibold text-slate-700 leading-4 text-center">SUBJECTS</Text>
                </View>
                {subjects.map((subject, index) => (
                    <View key={subject + index} className="h-14 justify-center px-3 border-b border-r border-slate-100">
                        <Text numberOfLines={2} className="text-[11px] font-semibold text-slate-700 leading-4">{subject}</Text>
                    </View>
                ))}
            </View>

            {/* attendance */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}
                ref={attendanceTableRef}
            >
                <View className="flex flex-col">
                    <View className="flex flex-row h-14 px-3 border-b border-slate-100 gap-2 items-center">
                        {
                            subjectsObj[Object.keys(subjectsObj)[0]]?.attendance?.map((data, index) => (
                                <View key={data + index} className="w-10 h-10  justify-center items-center">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase">Day</Text>
                                    <Text className="font-semibold text-neutral-700">{index + 1}</Text>
                                </View>
                            ))
                        }

                        <View className="w-10 h-10  justify-end items-center py-0.5">
                            <Text className="font-semibold text-neutral-700 text-sm">HELD</Text>
                        </View>

                        <View className="w-10 h-10  justify-end items-center py-0.5">
                            <Text className="font-semibold text-neutral-700 text-sm">ATTENDED</Text>
                        </View>

                        <View className="w-10 h-10  justify-end items-center py-0.5">
                            <Text className="font-semibold text-neutral-700 text-sm">%</Text>
                        </View>
                    </View>

                    {
                        Object.keys(subjectsObj).map((subject, index) => (
                            <View
                                key={subject + index}
                                className="flex flex-row h-14 px-3 border-b border-slate-100 gap-2 items-center">
                                {
                                    subjectsObj[subject]?.attendance?.map((status, index) => (
                                        <RenderStatus status={status} index={index} />
                                    ))
                                }
                                <View className="w-10 h-10 flex-1 justify-center items-center rounded-md bg-green-50">
                                    <Text className="text-sm">{subjectsObj[subject]?.total_classes_held}</Text>
                                </View>

                                <View className="w-10 h-10 flex-1 justify-center items-center rounded-md bg-yellow-50">
                                    <Text className="text-sm">{subjectsObj[subject]?.total_classes_attended}</Text>
                                </View>

                                <View className="w-12 h-10 flex-1 justify-center items-center rounded-md bg-indigo-50">
                                    <Text className="text-sm">{subjectsObj[subject]?.attended}</Text>
                                </View>
                            </View>
                        ))
                    }

                </View>
            </ScrollView>
        </View>
    );
};

export default AttendanceTable;

const RenderStatus = ({ status, index }) => {
    return (
        <View key={status + index} className="rounded-lg flex-col justify-center items-center py-1.5 gap-0.5">
            {
                status.split(",").map(s => (
                    <View key={s + index} className={`w-10 flex-1 justify-center items-center rounded-md ${s.trim() === "P" ? "bg-green-500" : s.trim() === "A" ? "bg-red-500" : "bg-blue-50"}`}>
                        <Text className={`text-xs ${s !== "NA" && "text-white font-semibold"}`}>{s === "NA" ? "-" : s}</Text>
                    </View>
                ))
            }
        </View>
    )
}