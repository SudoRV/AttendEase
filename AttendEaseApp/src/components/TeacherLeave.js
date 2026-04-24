import React, { act, useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Platform,
    Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';

import { AppStates } from "../context/AppStates";

const TeacherLeave = ({ onClose }) => {
    const { userData, classes, loadTimetable, loadLeaves, buildUrl, teacherLeaveHistory, formatDate } = AppStates();

    const [leaveType, setLeaveType] = useState("");
    const [periods, setPeriods] = useState([]);

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [onDate, setOnDate] = useState(null);

    const [showFrom, setShowFrom] = useState(false);
    const [showTo, setShowTo] = useState(false);
    const [showOn, setShowOn] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);

    const [filter, setFilter] = useState("Mine");

    useEffect(() => {
        setFromDate(null);
        setToDate(null);
        setOnDate(null);
    }, [leaveType])

    const togglePeriod = (item) => {
        const exists = periods.find(p => p.code === item.code);
        if (exists) {
            setPeriods(periods.filter(p => p.code !== item.code));
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

    const format = (d) =>
        d ? new Date(d).toLocaleDateString("en-IN") : "Select Date";


    return (
        <View className="flex-1 bg-slate-100">

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingTop: 20, paddingBottom: 20 }}
            >

                {/* HEADER */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-3xl font-bold text-slate-900">
                            Availability
                        </Text>

                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-slate-200 px-4 py-1.5 rounded-full"
                        >
                            <Text className="text-slate-700 font-medium">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-slate-500 mt-1">
                        Mark your unavailability for classes
                    </Text>
                </View>

                {/* CARD */}
                <View className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">

                    <Text className="text-lg font-semibold text-neutral-600 mb-4">Select Leave Type</Text>

                    {/* LEAVE TYPE SEGMENT */}
                    <View className="bg-slate-100 rounded-full p-1 flex-row mb-6">
                        {["period", "day", "duration"].map(type => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setLeaveType(type)}
                                className={`flex-1 py-2 rounded-full ${leaveType === type
                                    ? "bg-indigo-600"
                                    : ""
                                    }`}
                            >
                                <Text
                                    className={`text-center text-lg font-medium ${leaveType === type
                                        ? "text-white"
                                        : "text-slate-600"
                                        }`}
                                >
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* PERIOD MODE */}
                    {leaveType === "period" && (
                        <>
                            <FieldLabel text="Select Classes" />

                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4"
                            >
                                <Text className="text-slate-800">
                                    {periods.length
                                        ? `${periods.length} classes selected`
                                        : "Tap to select classes"}
                                </Text>
                            </TouchableOpacity>

                            {periods.length > 0 && (
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {periods.map((p, i) => (
                                        <View
                                            key={i}
                                            className="bg-indigo-100 px-3 py-1 rounded-full"
                                        >
                                            <Text className="text-indigo-600 text-sm font-medium">
                                                {p.subject_id}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* <DateField
                                label="From Date"
                                value={format(fromDate)}
                                onPress={() => setShowFrom(true)}
                            />

                            <DateField
                                label="To Date"
                                value={format(toDate)}
                                onPress={() => setShowTo(true)}
                            /> */}
                        </>
                    )}

                    {/* DURATION MODE */}
                    {leaveType === "duration" && (
                        <>
                            <DateField
                                label="From Date"
                                value={format(fromDate)}
                                onPress={() => setShowFrom(true)}
                            />
                            <DateField
                                label="To Date"
                                value={format(toDate)}
                                onPress={() => setShowTo(true)}
                            />
                        </>
                    )}

                    {/* DAY MODE */}
                    {leaveType === "day" && (
                        <DateField
                            label="Select Day"
                            value={format(onDate)}
                            onPress={() => setShowOn(true)}
                        />
                    )}

                    {/* SUBMIT */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="mt-4 bg-indigo-600 py-4 rounded-2xl shadow-md"
                    >
                        <Text className="text-white text-center text-lg font-semibold">
                            Submit Leave
                        </Text>
                    </TouchableOpacity>

                </View>


                {/* teacher leaves */}
                {renderTeacherLeaves(
                    teacherLeaveHistory,
                    userData,
                    filter,
                    setFilter
                )}
            </ScrollView>

            {/* DATE PICKERS */}
            {showFrom && (
                <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, date) => {
                        setShowFrom(false);
                        if (date) setFromDate(date);
                    }}
                />
            )}

            {showTo && (
                <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, date) => {
                        setShowTo(false);
                        if (date) setToDate(date);
                    }}
                />
            )}

            {showOn && (
                <DateTimePicker
                    value={onDate || new Date()}
                    mode="date"
                    minimumDate={new Date()}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, date) => {
                        setShowOn(false);
                        if (date) setOnDate(date);
                    }}
                />
            )}

            {/* MULTI SELECT MODAL */}
            <Modal visible={modalVisible} animationType="slide">
                <View className="flex-1 bg-white pt-14 px-4">

                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold">Select Classes</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-indigo-600 font-medium">Done</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {classes?.classes
                            ?.filter(c => c.subject_id !== undefined && c.subject_id?.trim() !== "")
                            ?.map((c, index) => {
                                const selected = periods.find(p => p.subject_id === c.subject_id);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => togglePeriod(c)}
                                        className={`p-4 rounded-2xl mb-3 border ${selected
                                            ? "bg-indigo-50 border-indigo-200"
                                            : "bg-slate-50 border-slate-200"
                                            }`}
                                    >
                                        <Text className="font-medium text-slate-800">
                                            {c.period_id}: {c.subject_id} - {c.subject_name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </ScrollView>

                </View>
            </Modal>

        </View>
    );
};

export default TeacherLeave;

/* Reusable Date Field */

const FieldLabel = ({ text }) => (
    <Text className="text-slate-600 text-sm font-medium mb-2">
        {text}
    </Text>
);

const DateField = ({ label, value, onPress }) => (
    <View className="mb-4">
        <FieldLabel text={label} />
        <TouchableOpacity
            onPress={onPress}
            className="bg-slate-50 border border-slate-200 p-4 rounded-2xl"
        >
            <Text className="text-slate-800 text-base">
                {value}
            </Text>
        </TouchableOpacity>
    </View>
);


const renderTeacherLeaves = (
    teacherLeaveHistory = [],
    userData,
    filter,
    setFilter
) => {

    const { buildUrl } = AppStates();

    const filteredLeaves = (() => {
        switch (filter) {
            case "Mine":
                return teacherLeaveHistory.filter(
                    (leave) => leave.teacher_id === userData?.teacher_id
                );

            default:
                return teacherLeaveHistory;
        }
    })();

    const formatDate = (date) =>
        new Date(date).toLocaleDateString();


    // substitution logic
    const [isSubstitutorVisible, setIsSubstitutorVisible] = useState({ visible: false, teacher_id: null });

    const [absentTeacherClasses, setAbsentTeacherClasses] = useState(null);

    useEffect(() => {
        if (isSubstitutorVisible?.visible && isSubstitutorVisible.teacher_id) {
            fetch(buildUrl(`/get-timetable?day=${new Date().toLocaleDateString("en-Gb", { weekday: "long" })}&teacher_id=${isSubstitutorVisible.teacher_id}`))
                .then(response => response.json())
                .then(timetable => {
                    setAbsentTeacherClasses(timetable?.data?.classes);
                })
        }
    }, [isSubstitutorVisible])

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
            if (action === "confirm") {
                setAbsentTeacherClasses(prev => ({ ...prev, substitute_teacher_id: userData?.teacher_id, substitute_teacher_name: userData?.name, substituted_till: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss') }));

                Alert.alert(`Substitution ${clas.subject_name}`, data.message);
            } else {
                setAbsentTeacherClasses(prev => ({ ...prev, substitute_teacher_id: null, substitute_teacher_name: null, substituted_till: null }));

                Alert.alert(`Substitution ${clas.subject_name}`, data.message);
            }

        } else {
            Alert.alert(data.message);
        }
    }

    const handleSelectClass = (clas, action) => {
        Alert.alert(
            action === "confirm" ? "Confirm Substitution" : "Cancel Substitution", // Title
            `Are you sure you want to ${action === "cancel" && "cancel"} substitute for ${clas?.subject_name}?`, // Message
            [
                {
                    text: "No",
                    onPress: () => console.log("Cancelled"),
                    style: "cancel", // This gives it a 'cancel' look on iOS
                },
                {
                    text: "Yes",
                    onPress: () => {
                        // React to the response here
                        processSubstitution(clas, action);
                    }
                },
            ],
            { cancelable: true } // Allows tapping outside the alert to dismiss
        );
    }

    return (
        <View className="flex-1 w-full">

            <Text className="text-2xl font-bold mt-6">Leave History</Text>
            {/* FILTER TABS */}
            <View className="flex-row justify-start gap-2 my-4">
                {["Mine", "All"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setFilter(tab)}
                        className={`px-5 py-2 rounded-full ${filter === tab
                            ? "bg-indigo-600"
                            : "bg-gray-200"
                            }`}
                    >
                        <Text
                            className={`font-semibold ${filter === tab
                                ? "text-white"
                                : "text-gray-700"
                                }`}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* CARDS */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {filteredLeaves.length === 0 && (
                    <Text className="text-center text-gray-400 mt-10">
                        No leave records found
                    </Text>
                )}

                {filteredLeaves.map((item, index) => (
                    <TouchableOpacity
                        key={`${item.applicable_from}-${index}`}

                        onPress={() => setIsSubstitutorVisible(prev => ({ visible: !prev?.visible, teacher_id: item?.teacher_id }))}

                        activeOpacity={0.8}
                    >
                        <View
                            className="bg-white mb-4 p-4 rounded-3xl shadow"
                        >
                            <Text className="text-base font-semibold text-gray-800">
                                {item.name}
                            </Text>

                            <Text className="text-gray-500 mt-1">
                                {formatDate(item.applicable_from)} {
                                    new Date(item.applicable_from).setHours(0, 0, 0, 0) !== new Date(item.applicable_to).setHours(0, 0, 0, 0) && `→ ${formatDate(item.applicable_to)}`
                                }
                            </Text>

                            <View className="flex-row items-end justify-between">
                                <Text className={`mt-3 self-start px-3 py-1 rounded-full ${item.status === "Approved"
                                    ? "bg-green-600"
                                    : item.status === "Pending"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }  text-white text-xs font-semibold`} >
                                    {item.status}
                                </Text>

                                <Text className="text-blue-700">Check substitution</Text>
                            </View>

                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* substitute modal */}
            <Modal visible={!!isSubstitutorVisible?.visible}
                animationType="slide">
                <View className="p-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-2xl font-bold text-neutral-800">Substitute Class</Text>

                        <TouchableOpacity onPress={() => setIsSubstitutorVisible(prev => ({ visible: false, teacher_id: null }))}>
                            <View>
                                <Ionicons name="close" size={22} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-500">
                        Select a class from the list below to attend the class as substitute teacher.
                    </Text>

                    {/* classes */}
                    {absentTeacherClasses?.length > 0 ? (
                        <View className="flex-col space-y-4 mt-8">
                            {absentTeacherClasses.map((clas) => {
                                const isSubstituted = !!clas.substitute_teacher_id;

                                return (
                                    <TouchableOpacity
                                        key={clas.id}
                                        // Logic: Disable if a substitute is already assigned
                                        disabled={!!clas.substitute_teacher_id}
                                        onPress={() => handleSelectClass(clas, "acquired")}
                                        className={`p-4 rounded-3xl elevation-md ${clas.substitute_teacher_id
                                            ? 'bg-gray-100 opacity-80' // Muted background for substituted classes
                                            : 'bg-white active:bg-blue-50'
                                            } mb-6`}
                                    >
                                        <View className="flex-row justify-between items-center mb-2">
                                            <View className="flex-1">
                                                <Text className={`text-lg font-bold ${clas.substitute_teacher_id ? 'text-gray-500' : 'text-gray-800'
                                                    }`}>
                                                    {clas.subject_name}
                                                </Text>
                                                <Text className="text-gray-400 text-sm">
                                                    Code: {clas.subject_id}
                                                </Text>
                                            </View>

                                            {/* Dynamic Badge Color */}
                                            <View className={`${clas.substitute_teacher_id ? 'bg-gray-200' : 'bg-blue-100'
                                                } px-3 py-1 rounded-full`}>
                                                <Text className={`${clas.substitute_teacher_id ? 'text-gray-600' : 'text-blue-700'
                                                    } font-semibold text-xs`}>
                                                    Period {clas.period_id}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
                                            <Text className="text-gray-500">
                                                📍 Room {clas.room_number}
                                            </Text>
                                            <Text className="text-gray-500">
                                                {clas.branch_id} - Year {clas.year} - Sec {clas.section}
                                            </Text>
                                        </View>

                                        {/* 🔥 Substitution Info Logic */}
                                        {clas.substitute_teacher_id ? (
                                            <View className="flex-row justify-between items-center mt-4 gap-2">
                                                <View className="bg-gray-200 p-2 rounded-lg border border-gray-300 flex-1">
                                                    <Text className="text-gray-600 text-center font-medium text-sm">
                                                        ✅ Substituted by {clas.substitute_teacher_name}
                                                    </Text>
                                                </View>

                                                {
                                                    userData?.teacher_id === clas.substitute_teacher_id && (
                                                        <TouchableOpacity activeOpacity={0.6}
                                                            onPress={() => handleSelectClass(clas, "cancel")}>
                                                            <Text className="p-2 px-3 bg-red-500 rounded-lg text-white text-sm">Cancel</Text>
                                                        </TouchableOpacity>
                                                    )
                                                }
                                            </View>
                                        ) : (
                                            <View className="mt-3 bg-blue-600 py-2 rounded-lg">
                                                <Text className="text-white text-center font-medium">
                                                    Select for Substitution
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="p-10 items-center">
                            <Text className="text-gray-400 italic">No classes available for substitution.</Text>
                        </View>
                    )}

                </View>

            </Modal>

        </View>
    );
};