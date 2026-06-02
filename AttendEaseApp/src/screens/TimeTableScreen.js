import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image, } from "react-native";

import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';

import { useNavigation } from "@react-navigation/native";

import Ionicons from 'react-native-vector-icons/Ionicons';
import AttendanceDashboard from "../components/AttendanceDashbboard";
import NotSignedIn from "../components/NotSignedIn";
import { AppStates } from "../context/AppStates";
import Selector from "../components/ui/Selector";
import PullToRefresh from "../components/ui/PullToRefresh";
import TeacherLeave from "../components/TeacherLeave";

const { width, height } = Dimensions.get("window");

const TimeTableScreen = () => {
  const navigation = useNavigation();
  const { classes, userData, teacherLeaveHistory, loadTimetable, buildUrl } = AppStates();

  const [rotated, setRotated] = useState(false);
  const [selectedDay, setSelectedDay] = useState(classes?.day || new Date().toLocaleString("en-Gb", { weekday: "long" }));
  const [selectedTimetable, setSelectedTimetable] = useState({});
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  // --- NEW STATE FOR ROOT BOOTSTRAPPING LOCK ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Modal Control States
  const [contextModalVisible, setContextModalVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);

  // Data States
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [teacherLeaves, setTeacherLeaves] = useState([]);
  const [currentActionOption, setCurrentActionOption] = useState(""); // "insert", "edit", or "delete"
  const [formData, setFormData] = useState({});

  const attendanceRef = useRef(null);

  const defaultTimeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM"
  ];

  // Single truth definition for active data array mapping
  const activeTimetableSource = selectedTimetable?.day ? selectedTimetable : classes;
  const activeClassesArray = activeTimetableSource?.classes || [];

  // --- INITIAL BOOTSTRAP SYNC CALL ---
  useEffect(() => {
    const startedTime = new Date().getTime();
    const bootstrapDataPipeline = async () => {
      try {
        // Run initial data population on mount
        if (!classes || Object.keys(classes).length === 0) {
          await loadTimetable(userData);
        }
      } catch (err) {
        console.error("Bootstrapping failed:", err);
      } finally {
        // Open the app viewport smoothly
        const consumedTime = (new Date().getTime() - startedTime);
        if(consumedTime < 2500) {
          const loadTimeout = setTimeout(() => {
            setIsInitialLoading(false);
            clearTimeout(loadTimeout);
          }, 2500 - consumedTime)
        } else {
          setIsInitialLoading(false);
        }
      }
    };
    bootstrapDataPipeline();
  }, []);

  // Triggered when any timetable card is long-pressed
  const handleLongPress = (item, index) => {
    setSelectedSlot(item || {});
    setSelectedSlotIndex(index);
    setContextModalVisible(true);
  };

  // Setup options menu routing based on choice
  const handleContextOption = (option) => {
    setContextModalVisible(false);
    setCurrentActionOption(option);

    if (option === "leaves") {
      if (!selectedSlot?.teacher_id) {
        setTeacherLeaves([]);
      } else {
        const leaves = teacherLeaveHistory?.filter(
          leave => leave.teacher_id === selectedSlot.teacher_id
        );
        setTeacherLeaves(leaves || []);
      }
      setLeaveModalVisible(true);
    } else if (option === "edit") {
      console.log("here")
      const data = activeClassesArray?.[selectedSlotIndex];
      if (data) {
        setFormData({
          day: data.day || activeTimetableSource.day || "",
          year: data.year ? String(data.year) : "",
          branch_id: data.branch_id || "",
          branch_name: data.branch_name || "",
          section: data.section || "",
          room_number: data.room_number ? String(data.room_number) : "",
          period_id: data.period_id !== undefined ? data.period_id : selectedSlotIndex,
          subject_id: data.subject_id || "",
          subject_name: data.subject_name || "",
          semester: data.semester ? String(data.semester) : ""
        });
      }
      setFormModalVisible(true);
    } else if (option === "insert") {
      setFormData({
        day: activeTimetableSource.day || classes.day || "",
        year: "",
        branch_id: "",
        branch_name: "",
        section: "",
        room_number: "",
        period_id: selectedSlotIndex,
        subject_id: "",
        subject_name: "",
        semester: ""
      });
      setFormModalVisible(true);
    } else if (option === "delete") {
      setFormModalVisible(true);
    }
  };

  // Form value updater
  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Backend sync engine matching web CRUD logic using Native Fetch API
  const updateSubject = async () => {
    let changes = {};
    const actionParam = currentActionOption === "insert" ? "Insert" : currentActionOption === "edit" ? "Update" : "Delete";

    if (actionParam === "Update") {
      Object.keys(formData).forEach(key => {
        let formVal = formData[key];
        let originalVal = activeClassesArray[selectedSlotIndex]?.[key];

        if (key === "year" || key === "room_number" || key === "semester" || key === "period_id") {
          formVal = formVal === "" ? "" : parseInt(formVal, 10);
          originalVal = originalVal ? parseInt(originalVal, 10) : "";
        }

        if (originalVal !== formVal) {
          changes[key] = formVal;
        }
      });

      if (Object.keys(changes).length === 0) {
        setFormModalVisible(false);
        return;
      }
    } else if (actionParam === "Insert") {
      changes = { ...formData };
      changes.period_id = changes.period_id === "" ? selectedSlotIndex : parseInt(changes.period_id, 10);
      changes.year = changes.year === "" ? "" : parseInt(changes.year, 10);
      changes.room_number = changes.room_number === "" ? "" : parseInt(changes.room_number, 10);
      changes.semester = changes.semester === "" ? "" : parseInt(changes.semester, 10);
      changes.teacher_id = userData?.teacher_id || "";
      changes.teacher_name = userData?.name || "";
    }

    const payload = {
      action: actionParam,
      subject_data: {
        id: activeClassesArray[selectedSlotIndex]?.id,
        changes: changes
      }
    };

    try {
      const response = await fetch(buildUrl("/update-schedule"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const res_data = await response.json();

      if (res_data.success) {
        setFormModalVisible(false);
        await loadSpecificTimetable();
      } else {
        console.error("Server handled request but returned failure:", res_data);
      }
    } catch (error) {
      console.error("Network error executing schedule change:", error);
    }
  };

  // --- PULSE ANIMATION FOR ACTIVE PERIOD ---
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const currentPeriodStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  useEffect(() => {
    const config = { duration: 600, easing: Easing.inOut(Easing.ease) };
    opacity.value = withRepeat(withTiming(0.8, config), -1, true);
    scale.value = withRepeat(withTiming(1.05, config), -1, true);
  }, []);

  // --- REFRESH SPIN LOGIC ---
  const spinValue = useSharedValue(0);
  const spinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }]
  }));

  useEffect(() => {
    if (loadingTimetable) {
      spinValue.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinValue.value = withTiming(0, { duration: 250 });
    }
  }, [loadingTimetable]);

  async function loadSpecificTimetable() {
    setLoadingTimetable(true);
    const timetable = await loadTimetable(userData, selectedDay);
    setSelectedTimetable(timetable || {});
    setLoadingTimetable(false);
  }

  useEffect(() => {
    if (!selectedDay) return;
    loadSpecificTimetable();
  }, [selectedDay]);

  async function refreshTimetable() {
    if (classes.day !== selectedDay) {
      setSelectedDay(classes.day);
    } else {
      setLoadingTimetable(true);
      await loadTimetable(userData);
      setSelectedDay(null);
      setSelectedTimetable({});
      setLoadingTimetable(false);
    }
  }

  async function refreshHomepage(params) {
    refreshTimetable();
    if (userData?.role === "Student" && attendanceRef.current) {
      attendanceRef.current.refreshData();
    }
  }

  // ==========================================================================
  // 🌟 FULL-HEIGHT BRAND SPLASH LOADER (VISIBLE UNTIL TIMETABLE LOADS)
  // ==========================================================================
  const [redirected, setRedirected] = useState(false);
  let notLoggedInTimer;

  if (!isInitialLoading && !!userData?.role === false) return <NotSignedIn />

  if (!!isInitialLoading) {

    return (
      <View className="flex-1 bg-white dark:bg-neutral-900 items-center justify-center w-full h-full pt-3.5">
        <View className="items-center flex-col gap-3">
          <Image
            source={require('../images/icon-512.png')}
            className="w-20 h-20"
            resizeMode="contain"
          />

          <Text className="text-4xl font-black tracking-tight text-neutral-800 dark:text-neutral-50">
            Attend<Text className="text-indigo-600 dark:text-blue-500">Ease</Text>
          </Text>

          <Text className="text-slate-400 dark:text-neutral-400 text-sm font-medium tracking-wide mb-4">
            Smart Academic Infrastructure
          </Text>
          <ActivityIndicator size="small" color={"#4F46E5"} />
        </View>
      </View>
    );
  }

  // ================= STANDARD VIEW MOUNT =================
  return (
    <PullToRefresh onRefresh={refreshHomepage}>
      <ScrollView className="flex-1 pt-14" showsVerticalScrollIndicator={false}>
        <Text className="text-[26px] font-bold ml-3 text-neutral-700 dark:text-neutral-50">Attend<Text className="text-indigo-600">Ease</Text></Text>

        <TouchableOpacity
          className="absolute top-1 right-4 bg-white dark:bg-transparent p-2 rounded-full elevation-5 z-20"
          onPress={() => setRotated(prev => !prev)}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={22}
            color="#333"
            className="dark:!text-neutral-50"
            style={{ transform: [{ rotate: rotated ? "90deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          style={
            rotated
              ? {
                width: height - 120,
                height: width,
                marginTop: 120,
                transform: [{ rotate: "90deg" }, { translateY: 120 }]
              }
              : undefined
          }
        >
          <View className="w-full px-4 flex-row justify-between items-center gap-4 mt-2">
            <Selector
              value={selectedDay || classes.day}
              defaultOption={{
                label: classes.day || new Date().toLocaleString("en-Gb", { weekday: "long" }),
                value: classes.day || new Date().toLocaleString("en-Gb", { weekday: "long" })
              }}
              options={[
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
                { label: "Saturday", value: "Saturday" },
                { label: "Sunday", value: "Sunday" }
              ]}
              onChange={(option) => { setSelectedDay(option.value) }}
              styleSelector={"w-fit min-w-[35%] bg-transparent text-lg"}
              selectedStyle={"text-2xl font-bold dark:text-neutral-50"}
              styleButton={"p-2"}
            />

            <TouchableOpacity className="px-2" onPress={refreshTimetable}>
              <Animated.View style={spinAnimatedStyle}>
                <Ionicons name="refresh" size={22} className="dark:!text-neutral-50" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Horizontal Schedule View Container */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-3 mr-3 pb-1 flex-1"
          >
            {defaultTimeSlots.map((time, index) => {
              const item = activeClassesArray?.[index];
              if (index === 0 && !item?.subject_id) return null;

              return (
                <View key={index} className="w-[120px] items-center gap-2 mr-3 mt-3 pb-3">
                  <View className="bg-neutral-800 w-full p-2.5 rounded-xl shadow-lg">
                    <Text className="text-white text-sm font-semibold text-center">{time}</Text>
                  </View>

                  <Animated.View
                    style={[item?.isCurrentPeriod && currentPeriodStyle]}
                    className="w-full flex-1"
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      delayLongPress={300}
                      onLongPress={() => handleLongPress(item, index)}
                      className="w-full flex-1"
                    >
                      {item?.subject_id ? (
                        item.subject_name === "LUNCH" ? (
                          <View className="w-full flex-1 min-h-[145px] justify-center items-center rounded-xl px-3 py-5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-500/60 shadow-md">
                            <View className="p-2.5 bg-teal-50 rounded-xl shadow-sm mb-2">
                              <Ionicons name="restaurant-outline" size={30} color="#14b8a6" />
                            </View>
                            <Text className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-center">
                              Lunch Break
                            </Text>
                          </View>
                        ) : (
                          <View
                            className={`w-full flex-1 min-h-[145px] justify-center items-center rounded-xl px-3 py-3 shadow-md ${item?.cancelled && !item?.substitute_teacher_id
                              ? "bg-red-50 dark:bg-neutral-800/50 border border-red-200 dark:border-red-200/40"
                              : item?.substitute_teacher_id ? "bg-neutral-50 dark:bg-neutral-800/40 border border-teal-500/40" : "bg-indigo-500"
                              }`}
                          >
                            {!!item?.cancelled && (
                              <View className={`absolute -bottom-3 px-2 py-0.5 rounded-full z-10 ${item?.substitute_teacher_id ? "bg-teal-500" : "bg-red-500"}`}>
                                <Text className="text-white text-[12px] font-semibold">
                                  {item?.substitute_teacher_id ? "Substituted" : "Cancelled"}
                                </Text>
                              </View>
                            )}

                            <Text className={`font-bold text-base ${item?.cancelled ? "text-red-500" : "text-neutral-50"}`}>
                              {item.subject_id}
                            </Text>

                            <View className="flex-1 justify-center items-center my-2 py-2 border-slate-200/40 border-y w-full">
                              <Text
                                numberOfLines={3}
                                ellipsizeMode="tail"
                                className={`text-center text-base font-medium ${item?.cancelled ? "text-red-400" : "text-neutral-50"}`}
                              >
                                {item.subject_name}
                              </Text>
                            </View>

                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              className={`text-[12px] italic text-center w-full ${item?.cancelled && !item?.substitute_teacher_id
                                ? "text-red-400"
                                : item?.substitute_teacher_id ? "text-teal-500" : "text-neutral-200"
                                }`}
                            >
                              {userData?.role === "Teacher"
                                ? `${item.branch_id || ""}-${item.year || ""}-${item.section || ""}`
                                : item?.substitute_teacher_name || item.teacher_name || "No Instructor"}
                            </Text>
                          </View>
                        )
                      ) : (
                        <View className="w-full flex-1 min-h-[145px] justify-center items-center rounded-xl px-2.5 bg-white dark:bg-neutral-800/50 border border-dashed border-neutral-300 dark:border-neutral-600 shadow-sm">
                          <Text className="font-bold text-neutral-400 text-sm">Free</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              );
            })}

          </ScrollView>

          {userData?.role === "Student" && <AttendanceDashboard ref={attendanceRef} />}

          {
            userData?.role === "Teacher" && (
              <TeacherLeave />
            )
          }

        </ScrollView>
      </ScrollView>

      {/* LONG PRESS PRIMARY CONTEXT ACTIONS MODAL */}
      <Modal visible={contextModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setContextModalVisible(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white dark:bg-neutral-900 w-full rounded-t-2xl p-5 pb-8 space-y-4">
            <Text className="text-base font-bold text-slate-400 tracking-wider uppercase mb-4">
              Period Slot Actions
            </Text>

            {selectedSlot?.subject_id ? (
              <View className="flex-col gap-2">
                <TouchableOpacity onPress={() => handleContextOption("edit")} className="flex-row items-center p-3 bg-slate-50 dark:bg-neutral-800/40 rounded-xl">
                  <Ionicons name="create-outline" size={22} color="#4f46e5" />
                  <Text className="text-lg font-semibold ml-3 text-slate-800 dark:text-neutral-300">Edit Subject</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleContextOption("delete")} className="flex-row items-center p-3 bg-red-50 dark:bg-neutral-800/40 rounded-xl">
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                  <Text className="text-lg font-semibold ml-3 text-red-600 ">Delete Subject</Text>
                </TouchableOpacity>

                {userData?.role === "Student" && (
                  <TouchableOpacity onPress={() => handleContextOption("leaves")} className="flex-row items-center p-3 bg-slate-50 dark:bg-neutral-800/40 rounded-xl">
                    <Ionicons name="calendar-outline" size={22} color="#6b7280" />
                    <Text className="text-lg font-semibold ml-3 text-slate-800 dark:text-neutral-300">View Teacher Leaves</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity onPress={() => handleContextOption("insert")} className="flex-row items-center p-3 bg-slate-50 dark:bg-neutral-800/40 rounded-xl">
                <Ionicons name="add-circle-outline" size={22} color="#10b981" />
                <Text className="text-lg font-semibold ml-3 text-slate-800 dark:text-neutral-300">Insert Subject</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setContextModalVisible(false)} className="w-full py-3 bg-slate-200 rounded-xl items-center mt-4">
              <Text className="text-base font-bold text-slate-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* TEACHER LEAVE DETAILS MODAL */}
      <Modal visible={leaveModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setLeaveModalVisible(false)}
          className="flex-1 bg-black/40 justify-center items-center"
        >
          <View className="bg-white dark:bg-neutral-900 w-[85%] rounded-xl p-4 max-h-[70%] elevation-md">
            <Text className="text-lg font-bold mb-2 dark:text-neutral-300">Teacher Leave Details</Text>
            {selectedSlot && <Text className="text-sm text-indigo-600 font-semibold mb-3">{selectedSlot.teacher_name || "Unknown Teacher"}</Text>}
            <ScrollView showsVerticalScrollIndicator={false}>
              {teacherLeaves.length > 0 ? (
                teacherLeaves.map((leave, i) => (
                  <View key={i} className="mb-2 border-b border-slate-200 pb-2">
                    <Text className="font-semibold dark:text-neutral-300">{leave.name}</Text>
                    <Text className="text-sm text-slate-600 dark:text-neutral-400">
                      {new Date(leave.applicable_from).toLocaleDateString()} → {new Date(leave.applicable_to).toLocaleDateString()}
                    </Text>
                    <Text className="text-base text-blue-500">Status: {leave.status}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-slate-500 text-sm py-4 text-center">No leave records found</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setLeaveModalVisible(false)} className="mt-4 p-2.5 bg-slate-100 rounded-lg items-center">
              <Text className="font-bold text-slate-700">Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CRUD UPDATE / INSERT / DELETE OPERATION MODAL */}
      <Modal visible={formModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 w-full max-w-[340px] space-y-4 elevation-md">
            <Text className="text-xl font-bold text-slate-800 dark:text-neutral-300 capitalize mb-4">
              {currentActionOption} Subject
            </Text>

            {currentActionOption === "delete" ? (
              <Text className="text-base text-center text-slate-600 dark:text-neutral-400 my-2">
                Are you sure you want to delete this subject slot?
              </Text>
            ) : (
              <ScrollView className="max-h-[380px] pr-1" contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Day</Text>
                    <TextInput
                      value={formData.day}
                      onChangeText={(val) => handleFormChange("day", val)}
                      placeholder="Day Name"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                  <View className="w-[80px]">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Period No</Text>
                    <TextInput
                      value={String(formData.period_id ?? "")}
                      editable={true}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        const sanitizedVal = val.replace(/[^0-9]/g, "");
                        handleFormChange("period_id", sanitizedVal === "" ? "" : parseInt(sanitizedVal, 10));
                      }}
                      placeholder="0-9"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Subject Code</Text>
                    <TextInput
                      value={formData.subject_id}
                      onChangeText={(val) => handleFormChange("subject_id", val)}
                      placeholder="e.g. CS-401"
                      autoCapitalize="characters"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Subject Name</Text>
                    <TextInput
                      value={formData.subject_name}
                      onChangeText={(val) => handleFormChange("subject_name", val)}
                      placeholder="e.g. Math"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Year</Text>
                    <TextInput
                      value={formData.year}
                      onChangeText={(val) => handleFormChange("year", val)}
                      placeholder="Year"
                      keyboardType="numeric"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Semester</Text>
                    <TextInput
                      value={formData.semester}
                      onChangeText={(val) => handleFormChange("semester", val)}
                      placeholder="Sem"
                      keyboardType="numeric"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Section</Text>
                    <TextInput
                      value={formData.section}
                      onChangeText={(val) => handleFormChange("section", val)}
                      placeholder="Sec"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="w-[100px]">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Room No</Text>
                    <TextInput
                      value={formData.room_number}
                      onChangeText={(val) => handleFormChange("room_number", val)}
                      placeholder="Room"
                      keyboardType="numeric"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-500 mb-1">Branch ID</Text>
                    <TextInput
                      value={formData.branch_id}
                      onChangeText={(val) => handleFormChange("branch_id", val)}
                      placeholder="e.g. CSE"
                      className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                    />
                  </View>
                </View>

                <View className="">
                  <Text className="text-base font-semibold text-slate-500 mb-1">Branch Name</Text>
                  <TextInput
                    value={formData.branch_name}
                    onChangeText={(val) => handleFormChange("branch_name", val)}
                    placeholder="e.g. Computer Science"
                    className="border border-slate-200 dark:border-slate-200/40 rounded-lg p-2 text-base bg-slate-50 dark:bg-neutral-800/40 dark:text-neutral-300"
                  />
                </View>
              </ScrollView>
            )}

            {/* ACTION FOOTER BUTTONS */}
            <View className="flex-row justify-end gap-2 pt-2">
              <TouchableOpacity
                onPress={() => setFormModalVisible(false)}
                className="px-4 py-2 bg-slate-100 rounded-lg"
              >
                <Text className="font-semibold text-slate-600">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={updateSubject}
                className={`px-5 py-2 rounded-lg ${currentActionOption === 'delete' ? 'bg-red-500' : 'bg-blue-600'}`}
              >
                <Text className="font-semibold text-white">
                  {currentActionOption === "insert" ? "Insert" : currentActionOption === "edit" ? "Update" : "Yes, Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </PullToRefresh>
  );
};

export default TimeTableScreen;