import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator // 🔹 Added this
} from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import AttendanceRing from "./ui/AttendanceRing";
import AttendanceTable from "./ui/AttendanceTable";
import { AppStates } from "../context/AppStates";

const injectionCode = `javascript:(()=>{
    const get = n => document.querySelector(\`[name=\${n}]\`)?.value || "";
    const data = ["CollegeId","StudentAdmissionId","CourseId","BranchId"].reduce((o,k)=>(o[k]=get(k),o),{});
    if (Object.values(data).some(v => !v)) return alert("Fill attendance page first");
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(text).then(() => alert("✅ Copied!\\n" + text));
})();`;

export default function AttendanceDashboard() {
  const { userData, buildUrl } = AppStates();
  const [hasConfig, setHasConfig] = useState(false);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false); // 🔹 Added loading state

  const [attendance, setAttendance] = useState({});

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

  useEffect(() => {
    if (userData) {
      setForm(prev => ({
        ...prev,
        name: userData.name || "",
        roll: userData.student_id || "",
        collegeId: userData.collegeId?.toString() || "",
        admissionId: userData.admissionId?.toString() || "",
        courseId: userData.courseId?.toString() || "",
        branchId: userData.branchId?.toString() || "",
        durationId: userData.semester?.toString() || "",
        startMonth: userData.start_month?.toString() || new Date().getMonth() + 1
      }));
    }
  }, [userData]);

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
    if (!form.admissionId || !form.branchId) {
      Alert.alert("Missing Info", "Please provide all ID fields.");
      return;
    }

    const response = await fetch(buildUrl("/save/utu-creds"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
    const data = await response?.json();

    if (data.success) {
      setHasConfig(true);
    }
  };

  async function loadAttendance(form) {
    setLoading(true); // 🔹 Start Loading
    try {
      const response = await fetch(buildUrl("/fetch-attendance"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "creds": JSON.stringify(form)
        }
      })
      const data = await response.json();
      setAttendance(data.attendance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // 🔹 Stop Loading
    }
  }

  useEffect(() => {
    if (!form.admissionId) return;
    setHasConfig(true);
    loadAttendance(form);
  }, [form.admissionId, selectedMonth?.month_id]) // 🔹 month_id is now a dependency for the loader

  // ================= DASHBOARD VIEW =================

  if (hasConfig) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 my-6 rounded-t-3xl">
        <ScrollView className="p-5">
          <Text className="text-gray-500 text-sm uppercase tracking-widest text-center mb-2">Attendance Report</Text>
          <Text className="text-2xl font-extrabold text-slate-800 text-center mb-8">
            {form.name.toUpperCase()}
          </Text>

          <AttendanceRing attendancePercent={attendance?.report?.attended || 0} />

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            <StatCard title="Conducted" value={attendance?.report?.total_classes_held} width="w-[48%]" color="text-slate-700" />
            <StatCard title="Attended" value={attendance?.report?.total_classes_attended} width="w-[48%]" color="text-emerald-600" />
            <StatCard title="Missed" value={attendance?.report?.total_classes_held - attendance?.report?.total_classes_attended} width="w-[48%] mt-4" color="text-orange-500" />
            <StatCard title="Leaves" value="0" width="w-[48%] mt-4" color="text-blue-500" />
          </View>

          {/* Filter Section */}
          <View className="mt-8">
            <Text className="text-slate-800 font-bold mb-3 text-lg">Monthly Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {(attendance?.attendance || [])?.map(m => (
                <TouchableOpacity
                  key={m.month_id}
                  onPress={() => setSelectedMonth(m)}
                  className={`px-6 py-2.5 rounded-full mr-2 ${selectedMonth?.month_id === m.month_id ? "bg-indigo-600" : "bg-white border border-slate-200"}`}
                >
                  <Text className={`font-semibold ${selectedMonth?.month_id === m.month_id ? "text-white" : "text-slate-600"}`}>{m.month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 🔹 Conditionally render Loader or Table */}
            {loading ? (
              <View className="py-20 items-center justify-center bg-white mt-4 rounded-3xl border border-slate-100 border-dashed">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Updating Timetable...</Text>
              </View>
            ) : (
              <AttendanceTable attendance={attendance} selectedMonth={selectedMonth} />
            )}

          </View>
        </ScrollView >
      </SafeAreaView >
    );
  }

  // ================= SETUP VIEW =================
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="p-6">
        <View className="mb-6">
          <Text className="text-3xl font-black text-slate-800">Smart Setup</Text>
          <Text className="text-slate-500 mt-1">Sync your academic records effortlessly.</Text>
        </View>

        {/* Script Section */}
        <View className="bg-slate-900 p-5 rounded-3xl mb-6 shadow-2xl">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-indigo-400 font-bold tracking-tighter">JS CONSOLE SCRIPT</Text>
            <TouchableOpacity onPress={copyCode} className="bg-indigo-500 px-3 py-1 rounded-lg">
              <Text className="text-white text-sm font-bold">COPY</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-400 text-sm leading-5 italic" numberOfLines={6}>
            {injectionCode}
          </Text>
        </View>

        {/* Input Form */}
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <InputField label="Student Name" value={form.name} editable={false} />
          <InputField label="Roll Number" value={form.roll} editable={false} />

          <View className="h-[1px] bg-slate-100 my-4" />

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

          <TouchableOpacity
            onPress={() => setShowSemesterPicker(true)}
            className="mb-4"
          >
            <Text className="text-slate-500 text-xs font-bold uppercase ml-1 mb-1">Semester / Duration</Text>
            <View className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex-row justify-between items-center">
              <Text className="text-slate-800 font-medium">Semester {form.durationId}</Text>
              <Text className="text-indigo-600 font-bold">Change</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            className="mb-4"
          >
            <Text className="text-slate-500 text-xs font-bold uppercase ml-1 mb-1">Start Month</Text>
            <View className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex-row justify-between items-center">
              <Text className="text-slate-800 font-medium"> {new Date(new Date().getFullYear(), form.startMonth, 1).toLocaleString('en-GB', { month: 'long' })}</Text>
              <Text className="text-indigo-600 font-bold">Change</Text>
            </View>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          onPress={handlePaste}
          className="mt-6 py-4 rounded-2xl border-2 border-dashed border-indigo-200 items-center"
        >
          <Text className="text-indigo-600 font-bold">Paste from Clipboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-indigo-600 mt-4 p-5 rounded-2xl shadow-xl shadow-indigo-200"
        >
          <Text className="text-white text-center font-bold text-lg">Continue to Dashboard</Text>
        </TouchableOpacity>

        {/* Semester Picker Modal */}
        <Modal visible={showSemesterPicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-[40px] p-8">
              <Text className="text-xl font-bold text-center mb-6">Select Semester</Text>
              <View className="flex-row flex-wrap justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => {
                      setForm({ ...form, durationId: num.toString() });
                      setShowSemesterPicker(false);
                    }}
                    className={`w-14 h-14 m-2 rounded-2xl items-center justify-center ${form.durationId === num.toString() ? 'bg-indigo-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`font-bold ${form.durationId === num.toString() ? 'text-white' : 'text-slate-700'}`}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowSemesterPicker(false)} className="mt-8 p-4">
                <Text className="text-center text-red-500 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Month Picker Modal */}
        <Modal visible={showMonthPicker} transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-[40px] p-8">
              <Text className="text-xl font-bold text-center mb-6">Select Month</Text>
              <View className="flex-row flex-wrap justify-center">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => {
                      setForm({ ...form, startMonth: num.toString() });
                      setShowMonthPicker(false);
                    }}
                    className={`w-14 h-14 m-2 rounded-2xl items-center justify-center ${form.startMonth === num.toString() ? 'bg-indigo-600' : 'bg-slate-100'}`}
                  >
                    <Text className={`font-bold ${form.startMonth === num.toString() ? 'text-white' : 'text-slate-700'}`}>{new Date(new Date().getFullYear(), num, 1).toLocaleString("en-Gb", { month: "short" })}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)} className="mt-8 p-4">
                <Text className="text-center text-red-500 font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

// 🔹 Reusable Components
function InputField({ label, value, onChange, editable = true, placeholder }) {
  return (
    <View className="mb-4">
      <Text className="text-slate-500 text-sm font-bold uppercase ml-1 mb-1">{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        className={`p-4 rounded-2xl border ${editable ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-50 border-transparent text-slate-400 font-medium'}`}
      />
    </View>
  );
}

function StatCard({ title, value, color, width }) {
  return (
    <View className={`${width} bg-white p-5 rounded-3xl shadow-sm border border-slate-50`}>
      <Text className={`text-2xl font-black ${color}`}>{value}</Text>
      <Text className="text-slate-400 text-xs font-bold uppercase mt-1">{title}</Text>
    </View>
  );
}