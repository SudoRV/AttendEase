import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import AttendanceRing from "./ui/AttendanceRing";
import AttendanceTable from "./ui/AttendanceTable";
import { AppStates } from "../context/AppStates";
import { Fetch } from "../services/api";

const injectionCode = `javascript:(()=>{
  // 1. Fixed: Used normal single quotes and string concatenation to bypass backtick parsing errors
  const get = n => document.querySelector('[name=' + n + ']')?.value || "";
  const data = ["CollegeId","StudentAdmissionId","CourseId","BranchId"].reduce((o,k)=>(o[k]=get(k),o),{});
  if (Object.values(data).some(v => !v)) return alert("❌ Fill attendance page first");
  const text = JSON.stringify(data, null, 2);

  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px'; 
  document.body.appendChild(el);
  el.select();
  el.setSelectionRange(0, 99999); 

  try {
      const success = document.execCommand('copy');
      if (success) {
          alert("✅ Copied!\\n" + text); // 2. Fixed: Escaped the newline character (\\n) so it passes through the string correctly
      } else {
          throw new Error("ExecCommand failed");
      }
  } catch (err) {
      alert("❌ Automatic copy failed. Object printed to developer console.");
      console.log("Attendance Data:", data);
  }
  document.body.removeChild(el);
})();`;

const AttendanceDashboard = forwardRef((props, ref) => {

  const { user, classes, loadTimetable, setUserData } = AppStates();
  const [hasConfig, setHasConfig] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false); // 🔹 Added loading state

  const [attendance, setAttendance] = useState({});
  const [skipReport, setSkipReport] = useState({});

  const [form, setForm] = useState({
    name: "",
    roll: "",
    collegeId: "",
    admissionId: "",
    courseId: "",
    branchId: "",
    durationId: "",
    startMonth: ""
  });

  const copyCode = () => {
    Clipboard.setString(injectionCode);
    Alert.alert("Success", "Injection code copied to clipboard.");
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (!text) return Alert.alert("Empty", "Clipboard is empty");

      const parsed = JSON.parse(text);
      setForm(prev => ({
        ...prev,
        collegeId: parsed.CollegeId?.toString() || prev.collegeId,
        admissionId: parsed.StudentAdmissionId?.toString() || prev.admissionId,
        courseId: parsed.CourseId?.toString() || prev.courseId,
        branchId: parsed.BranchId?.toString() || prev.branchId,
      }));
      Alert.alert("Success", "Configuration IDs updated!");
    } catch (err) {
      Alert.alert("Error", "Invalid data format in clipboard.");
    }
  };

  const handleSubmit = async () => {
    if (Object.values(form).filter(f => !!f === false)?.length > 0) {
      Alert.alert("Missing Info", "Please provide all ID fields.");
      return;
    }

    const response = await Fetch("/api/attendance/portal/credentials", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
    const data = await response?.json();

    if (data.success) {
      setHasConfig(true);
      // set userdata
      if (!user?.admissionId) {
        const user_creds = { ...user, collegeId: form?.collegeId, admissionId: form?.admissionId, courseId: form?.courseId, branchId: form?.branchId, semester: form?.durationId, start_month: form?.startMonth };

        AsyncStorage.setItem("user_creds", JSON.stringify(user_creds));
        setUserData(user_creds);
      }
    }
  };

  useEffect(() => {
    async function loadCachedAttendance() {
      const raw_attendance_report = await AsyncStorage.getItem("attendance_report");
      const attendance_report = JSON.parse(raw_attendance_report || "{}");

      setAttendance(attendance_report?.attendance);
    }

    loadCachedAttendance();
  }, [])

  async function loadAttendance(form) {
    setLoading(true); // 🔹 Start Loading
    try {
      const response = await Fetch("/api/attendance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "creds": JSON.stringify(form)
        }
      })
      const data = await response.json();
      setAttendance(data?.attendance);
      await AsyncStorage.setItem("attendance_report", JSON.stringify(data));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // 🔹 Stop Loading
    }
  }

  useImperativeHandle(ref, () => ({
    refreshData: () => {
      loadAttendance(form);
    }
  }));

  useEffect(() => {
    const utu_creds = {
      name: user.name || "",
      roll: user.student_id || "",
      collegeId: user.collegeId?.toString() || "",
      admissionId: user.admissionId?.toString() || "",
      courseId: user.courseId?.toString() || "",
      branchId: user.branchId?.toString() || "",
      durationId: user.semester?.toString() || "",
      startMonth: user.start_month?.toString() || ""
    };
    setForm(prev => ({ ...prev, ...utu_creds }));
    if (!user?.admissionId) return;

    setHasConfig(true);
    loadAttendance(utu_creds);
  }, [user?.admissionId, selectedMonth?.month_id])

  function calculatSkipImpact(attendance, classes) {
    return parseInt(attendance?.report?.total_classes_attended) / (parseInt(attendance?.report?.total_classes_held) + classes?.length) * 100;
  }

  async function skipClass(attendance) {
    if (!classes?.classes || !attendance?.attendance) return;

    // todays classes skip impact
    const todayClasses = classes?.classes?.filter(c => c.subject_id?.trim() !== "" && c.cancelled === 0);
    const todayDrop = calculatSkipImpact(attendance, todayClasses);

    // next day classes skip impact
    const nextDayClasses = await loadTimetable(user, new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).toLocaleString("en-Gb", { weekday: "long" }));
    const activeNextDayClasses = nextDayClasses?.classes?.filter(c => c.subject_id?.trim() !== "" && c.cancelled === 0)

    const nextDayDrop = calculatSkipImpact(attendance, activeNextDayClasses);

    const report = {
      global: {
        message: parseFloat(attendance?.report?.attended) < 75.0 ? "You can't skip further classes" : "You are in safe zone",
        balanceFactor: Math.ceil((parseInt(attendance?.report?.total_classes_held) * 75) / 100 - parseInt(attendance?.report?.total_classes_attended))
      },
      today_skip: {
        drop: todayDrop,
        message: `Your attendance will drop to ${todayDrop.toFixed(2)}%`,
        suggestion: todayDrop < 75 ? "You can't skip today's classes" : "You are safe to skip classes for today"
      },
      nextday_skip: {
        drop: nextDayDrop,
        message: `Your attendance will drop to ${nextDayDrop.toFixed(2)}%`,
        suggestion: nextDayDrop < 75 ? "You can't skip classes" : "You are safe to skip classes"
      }
    }

    setSkipReport(report)
  }

  useEffect(() => {
    skipClass(attendance);
  }, [attendance?.attendance])

  // ================= DASHBOARD VIEW =================

  if (hasConfig) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-[#1e1f21] mt-6 rounded-t-3xl">
        <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
          <Text className="text-gray-500 dark:text-neutral-300 text-sm uppercase tracking-widest text-center mb-2">Attendance Report</Text>
          <Text className="text-2xl font-extrabold text-slate-800 dark:text-neutral-200 text-center mb-8">
            {form.name.toUpperCase()}
          </Text>

          <AttendanceRing attendancePercent={attendance?.report?.attended || 0} />

          <RiskReport skipReport={skipReport} />

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            <StatCard title="Conducted" value={attendance?.report?.total_classes_held} width="w-[48%]" color="text-slate-700 dark:text-neutral-300" />
            <StatCard title="Attended" value={attendance?.report?.total_classes_attended} width="w-[48%]" color="text-emerald-600" />
            <StatCard title="Missed" value={attendance?.report?.total_classes_held - attendance?.report?.total_classes_attended - attendance?.report?.leaves || 0} width="w-[48%] mt-4" color="text-orange-500" />
            <StatCard title="Leaves" value={attendance?.report?.leaves || 0} width="w-[48%] mt-4" color="text-blue-500" />
          </View>

          {/* Filter Section */}
          <View className="mt-8">
            <Text className="text-slate-800 dark:text-neutral-300 font-bold mb-3 text-lg">Monthly Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {(attendance?.attendance || [])?.map(m => (
                <TouchableOpacity
                  key={"filter-" + m.month_id}
                  onPress={() => setSelectedMonth(m)}
                  className={`px-6 py-2.5 rounded-full mr-2 ${selectedMonth?.month_id === m.month_id ? "bg-indigo-600" : "bg-white dark:bg-neutral-950/40 border border-slate-200 dark:border-neutral-800"}`}
                >
                  <Text className={`font-semibold ${selectedMonth?.month_id === m.month_id ? "text-white dark:text-neutral-100" : "text-slate-600 dark:text-neutral-400"}`}>{m.month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 🔹 Conditionally render Loader or Table */}
            {loading ? (
              <View className="py-20 items-center justify-center bg-white dark:bg-neutral-900 mt-4 rounded-3xl border border-slate-100 dark:border-gray-600 border-dashed">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Updating Attendance...</Text>
              </View>
            ) : (
              <AttendanceTable attendance={attendance} selectedMonth={selectedMonth} />
            )}

          </View>
        </ScrollView >
      </View >
    );
  }

  // ================= SETUP VIEW =================
  return (
    <View className="flex-1 bg-slate-50 dark:bg-neutral-900 mt-4">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-3xl font-black text-slate-800 dark:text-neutral-50">Smart Attendance Setup</Text>
          <Text className="text-slate-500 dark:text-neutral-400 mt-1">Sync your academic records effortlessly.</Text>
        </View>

        {/* Instructions Container */}
        <View className="p-4 bg-gray-50 dark:bg-neutral-900/40 rounded-xl border border-gray-200 dark:border-neutral-800/60 mb-8">
          <Text className="text-lg font-bold text-gray-800 dark:text-neutral-100 mb-3">
            Instructions
          </Text>

          <View className="space-y-2">
            <Text className="text-gray-600 dark:text-neutral-400 leading-6">
              <Text className="font-semibold text-blue-600 dark:text-blue-400">1.</Text> Copy the given code.
            </Text>

            <Text className="text-gray-600 dark:text-neutral-400 leading-6">
              <Text className="font-semibold text-blue-600 dark:text-blue-400">2.</Text> Open your UTU attendance report page.
            </Text>

            <Text className="text-gray-600 dark:text-neutral-400 leading-6">
              <Text className="font-semibold text-blue-600 dark:text-blue-400">3.</Text> Open dev mode (<Text className="bg-gray-200 dark:bg-neutral-800 px-1 rounded font-mono text-xs text-gray-800 dark:text-neutral-200">CTRL + SHIFT + I</Text>).
            </Text>

            <Text className="text-gray-600 dark:text-neutral-400 leading-6">
              <Text className="font-semibold text-blue-600 dark:text-blue-400">4.</Text> Paste the code (you may need to type "allow pasting" first).
            </Text>

            <Text className="text-gray-600 dark:text-neutral-400 leading-6">
              <Text className="font-semibold text-blue-600 dark:text-blue-400">5.</Text> Return to the app and press <Text className="italic font-medium text-slate-800 dark:text-neutral-200">Paste from Clipboard</Text>.
            </Text>
          </View>
        </View>

        {/* Script Section Card */}
        <View className="bg-slate-900 dark:bg-neutral-900 p-5 rounded-3xl mb-4 elevation-md border border-transparent dark:border-neutral-800/60">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-indigo-400 dark:text-blue-400 font-bold tracking-tighter">JS CONSOLE SCRIPT</Text>
            <TouchableOpacity onPress={copyCode} className="bg-indigo-500 dark:bg-blue-600 px-3 py-1 rounded-lg active:opacity-80">
              <Text className="text-white text-sm font-bold">COPY</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-400 dark:text-neutral-400 text-sm leading-5 italic" numberOfLines={6}>
            {injectionCode}
          </Text>
        </View>

        {/* Clipboard Action Box */}
        <TouchableOpacity
          onPress={handlePaste}
          className="my-4 mb-8 py-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-neutral-800 items-center active:bg-indigo-50/20 dark:active:bg-neutral-900/40"
        >
          <Text className="text-indigo-600 dark:text-blue-400 font-bold">Paste from Clipboard</Text>
        </TouchableOpacity>

        {/* Input Form Module */}
        <View className="bg-white dark:bg-neutral-900 p-6 rounded-3xl elevation-md border border-slate-100 dark:border-neutral-800/60">
          <InputField label="Student Name" value={form.name} editable={false} />
          <InputField label="Roll Number" value={form.roll} editable={false} />

          <View className="h-[1px] bg-slate-100 dark:bg-neutral-800/60 my-4" />

          <InputField
            label="College ID"
            value={form.collegeId}
            onChange={v => setForm({ ...form, collegeId: v })}
            placeholder="e.g. 67"
          />

          <InputField
            label="Admission ID"
            value={form.admissionId}
            onChange={v => setForm({ ...form, admissionId: v })}
            placeholder="e.g. 2023001"
          />

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <InputField
                label="Course ID"
                value={form.courseId}
                onChange={v => setForm({ ...form, courseId: v })}
              />
            </View>
            <View className="w-[48%]">
              <InputField
                label="Branch ID"
                value={form.branchId}
                onChange={v => setForm({ ...form, branchId: v })}
              />
            </View>
          </View>

          {/* Semester Trigger Option */}
          <TouchableOpacity
            onPress={() => setShowSemesterPicker(true)}
            className="mb-4 active:opacity-90"
          >
            <Text className="text-slate-500 dark:text-neutral-400 text-sm font-bold uppercase ml-1 mb-1">Current semester</Text>
            <View className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800/60 p-4 rounded-2xl flex-row justify-between items-center">
              <Text className="text-slate-800 dark:text-neutral-100 font-medium">{form?.durationId ? `Semester ${form.durationId}` : "Select semester"}</Text>
              <Text className="text-indigo-600 dark:text-blue-400 font-bold">Change</Text>
            </View>
          </TouchableOpacity>

          {/* Month Trigger Option */}
          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            className="mb-4 active:opacity-90"
          >
            <Text className="text-slate-500 dark:text-neutral-400 text-sm font-bold uppercase ml-1 mb-1">Semester Start Month  <Text className="text-red-500 text-sm">*</Text></Text>
            <View className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800/60 p-4 rounded-2xl flex-row justify-between items-center">
              <Text className="text-slate-800 dark:text-neutral-100 font-medium">{form?.startMonth ? new Date(new Date().getFullYear(), form?.startMonth, 1).toLocaleString('en-GB', { month: 'long' }) : "Select start month..."}</Text>
              <Text className="text-indigo-600 dark:text-blue-400 font-bold">Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-indigo-600 mt-8 p-5 rounded-2xl elevation-md active:opacity-90"
        >
          <Text className="text-white text-center font-bold text-lg">Continue to Dashboard</Text>
        </TouchableOpacity>

        {/* Semester Picker Modal Container */}
        <Modal visible={showSemesterPicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40 dark:bg-black/60">
            <View className="bg-white dark:bg-neutral-900 rounded-t-[40px] p-8 border-t border-transparent dark:border-neutral-800">
              <Text className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-neutral-50">Select Semester</Text>
              <View className="flex-row flex-wrap justify-center">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <TouchableOpacity
                    key={"sem-" + num}
                    onPress={() => {
                      setForm({ ...form, durationId: num.toString() });
                      setShowSemesterPicker(false);
                    }}
                    className={`w-14 h-14 m-2 rounded-2xl items-center justify-center active:scale-95 ${form.durationId === num.toString() ? 'bg-indigo-600 dark:bg-blue-600' : 'bg-slate-100 dark:bg-neutral-800'}`}
                  >
                    <Text className={`font-bold ${form.durationId === num.toString() ? 'text-white' : 'text-slate-700 dark:text-neutral-300'}`}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowSemesterPicker(false)} className="mt-8 p-4">
                <Text className="text-center text-red-500 dark:text-red-400 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Month Picker Modal Container */}
        <Modal visible={showMonthPicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40 dark:bg-black/60">
            <View className="bg-white dark:bg-neutral-900 rounded-t-[40px] p-8 border-t border-transparent dark:border-neutral-800">
              <Text className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-neutral-50">Select Month</Text>
              <View className="flex-row flex-wrap justify-center">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                  <TouchableOpacity
                    key={"month-" + num}
                    onPress={() => {
                      setForm({ ...form, startMonth: num.toString() });
                      setShowMonthPicker(false);
                    }}
                    className={`w-14 h-14 m-2 rounded-2xl items-center justify-center active:scale-95 ${form.startMonth === num.toString() ? 'bg-indigo-600 dark:bg-blue-600' : 'bg-slate-100 dark:bg-neutral-800'}`}
                  >
                    <Text className={`font-bold ${form.startMonth === num.toString() ? 'text-white' : 'text-slate-700 dark:text-neutral-300'}`}>{new Date(new Date().getFullYear(), num, 1).toLocaleString("en-Gb", { month: "short" })}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)} className="mt-8 p-4">
                <Text className="text-center text-red-500 dark:text-red-400 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );

})

export default AttendanceDashboard;


// 🔹 Reusable Components
function InputField({ label, value, onChange, editable = true, placeholder }) {
  return (
    <View className="mb-4">
      <Text className="text-slate-500 dark:text-slate-300 text-sm font-bold uppercase ml-1 mb-1">{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        className={`p-4 rounded-2xl border ${editable ? 'bg-white border-slate-200 dark:border-gray-600 text-slate-800 dark:text-slate-300 dark:bg-neutral-800' : 'bg-slate-50 dark:bg-neutral-800 border-transparent text-slate-400 font-medium'}`}
      />
    </View>
  );
}

function StatCard({ title, value, color, width }) {
  return (
    <View className={`${width} bg-white dark:bg-neutral-800/40 p-5 rounded-3xl elevation-sm dark:elevation-none border border-slate-50 dark:border-neutral-600`}>
      <Text className={`text-2xl font-black ${color}`}>{value}</Text>
      <Text className="text-slate-400 text-xs font-bold uppercase mt-1">{title}</Text>
    </View>
  );
}

const RiskReport = ({ skipReport }) => {
  // Check if there is a risk (balanceFactor > 0)
  const isAtRisk = skipReport?.global?.balanceFactor > 0;
  const accentColor = isAtRisk ? "red" : "green";

  return (
    <View className="mb-8">
      {/* HEADER */}
      <View className="flex-row items-center justify-center mb-6 gap-2">
        <Ionicons name="shield-checkmark-outline" size={24} color="#64748b" />
        <Text className="text-2xl font-black text-slate-800 dark:text-neutral-200 tracking-tight">
          Risk Report
        </Text>
      </View>

      {/* ⚠️ GLOBAL RISK CARD */}
      <View
        className={`w-full p-5 rounded-[28px] border-b-4 mb-6 elevation-md dark:elevation-none 
          ${isAtRisk ? "bg-red-50 border-red-500 dark:bg-red-500/5" : "bg-emerald-50  dark:bg-emerald-500/5 border-emerald-500"}`}
      >
        <View className="flex-row items-center gap-3 mb-2">
          <View className={`p-2 flex-row items-end rounded-xl ${isAtRisk ? "bg-red-500" : "bg-emerald-500"}`}>
            <Ionicons name={isAtRisk ? "warning" : "checkmark-circle"} size={20} color="white" />
          </View>
          <Text className={`flex-1 font-bold text-lg ${isAtRisk ? "text-red-700" : "text-emerald-700"}`}>
            {skipReport?.global?.message}
          </Text>
        </View>

        <View className="flex-row items-baseline gap-4">
          <Text className={`text-4xl font-black ${isAtRisk ? "text-red-600" : "text-emerald-600"}`}>
            {Math.abs(skipReport?.global?.balanceFactor || 0)}
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-300 font-medium">
            {skipReport?.global?.balanceFactor > 0
              ? "Classes to reach Safe Zone"
              : "Classes above Danger zone"}
          </Text>
        </View>
      </View>

      <Text className="text-neutral-800 dark:text-neutral-300 font-semibold text-xl m-2">Impact of SKIPS</Text>

      {/* 📅 DAILY PREDICTIONS GRID */}
      <View className="flex-row gap-3">

        {/* TODAY TILE */}
        <View className="flex-1 bg-white dark:bg-neutral-950/40 p-4 rounded-3xl border border-slate-100 dark:border-neutral-600 elevation-sm dark:elevation-none">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="today-outline" size={18} color="#6366f1" />
            <Text className="text-slate-400 dark:text-neutral-400 font-bold uppercase text-[12px] tracking-widest">Today</Text>
          </View>
          <Text className="text-slate-800 dark:text-neutral-300 font-extrabold text-lg">
            {skipReport?.today_skip?.drop.toFixed(2)}%
          </Text>
          <Text className={`${skipReport?.nextday_skip?.drop < 75 ? "text-red-500" : "text-green-500"} text-[12px] font-medium mt-1`}>
            {skipReport?.today_skip?.suggestion}
          </Text>
        </View>

        {/* NEXT DAY TILE */}
        <View className="flex-1 bg-white dark:bg-neutral-950/40 p-4 rounded-3xl border border-slate-100 dark:border-neutral-600 elevation-sm dark:elevation-none">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="calendar-outline" size={18} color="#6366f1" />
            <Text className="text-slate-400 dark:text-neutral-400 font-bold uppercase text-[12px] tracking-widest">Next Day</Text>
          </View>
          <Text className="text-slate-800 dark:text-neutral-300 font-extrabold text-lg">
            {skipReport?.nextday_skip?.drop.toFixed(2)}%
          </Text>
          <Text className={`${skipReport?.nextday_skip?.drop < 75 ? "text-red-500" : "text-green-500"} text-[12px] font-medium mt-1`}>
            {skipReport?.nextday_skip?.suggestion}
          </Text>
        </View>

      </View>
    </View>
  );
};