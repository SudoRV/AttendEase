import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppStates } from "../context/AppStates";
import { Fetch } from "../services/api";

export default function Announce() {
  const { formatDate, isDark, userData } = AppStates();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const [targetCourses, setTargetCourses] = useState([]);
  const [targetYears, setTargetYears] = useState([]);
  const [targetBranches, setTargetBranches] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  const [scope, setScope] = useState("students");

  const [expiryDate, setExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setTargetYears([]);
    setTargetBranches([]);
    setTargetSections([]);
  }, [scope]);

  async function handleAnnounce() {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Error", "Title and Body are required.");
      return;
    }

    const payload = {
      title,
      body,
      scope,
      created_by: {
        name: userData?.name,
        id: userData?.teacher_id,
      },
      target_college: userData?.college_id,
      target_course: targetCourses.map(u => u.value),
      target_year: targetYears.map(u => u.value),
      target_branch: targetBranches.map(u => u.value),
      target_section: targetSections.map(u => u.value),
      status: "Active",
      expires_at: formatDate(expiryDate || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1))
    };

    try {
      setLoading(true);

      const response = await Fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (res.success) {
        Alert.alert("Success", "Announcement posted.");
        // setTitle("");
        // setBody("");
        setTargetYears([]);
        setTargetBranches([]);
        setTargetSections([]);
        // setExpiryDate(null);
      } else {
        Alert.alert("Error", res.message || "Failed.");
      }
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  }

  // load colleges, courses, branches, year, semester
  const [metadata, setMetadata] = useState({
    courses: [
      // { value: "all", label: "All Courses" }
    ],
    branches: [
      // { value: "all", label: "All Branches" }
    ],
    years: [
      // { value: "all", label: "All Years" }
    ],
    sections: [
      // { value: "all", label: "All Sections" }
    ]
  });

  const queryRef = useRef({
    query: "courses",
    added: true
  });

  let queryTimeout;

  useEffect(() => {
    if (!userData?.email || scope === "teachers") return;

    const query = queryRef.current?.query;
    // console.log(query, queryRef.current)

    if (!queryRef.current.added) return;
    if (query === "courses" && !userData?.college_id) return;
    if (query === "branches" && targetCourses.length == 0) return;
    if (query === "years" && targetBranches.length == 0) return;
    if (query === "sections" && targetYears.length == 0) return;

    const payload = {
      college_id: userData?.college_id,
      course_id: targetCourses.map(c => c.value),
      branch_id: targetBranches.map(b => b.value),
      year: targetYears.map(y => y.value)
    }

    // console.log(query, payload)

    async function fetchMetadata() {
      const response = await Fetch(`/college/metadata?query=${query}`, {
        method: "QUERY",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.courses) setMetadata(prev => ({ ...prev, courses: data.courses.map(c => ({ value: c.course_id, label: c.course_name })) }));

      if (data.branches) setMetadata(prev => ({ ...prev, branches: data.branches.map(b => ({ value: b.branch_id, label: b.branch_name })) }));

      if (data.years) setMetadata(prev => ({ ...prev, years: data.years.map(y => ({ value: y.year, label: y.year })) }));

      if (data.sections) setMetadata(prev => ({ ...prev, sections: data.sections.map(s => ({ value: s.section, label: s.section })) }));
    }

    if (queryTimeout) clearTimeout(queryTimeout);
    queryTimeout = setTimeout(() => {
      fetchMetadata();
    }, 600);

  }, [userData, targetCourses, targetBranches, targetYears])

  const toggleSelection = (label, value, list, setter) => {
    queryRef.current = {
      query: label,
      added: !list.includes(value)
    };

    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    );
  };

  const renderMultiSelect = (label, qLabel, data, selected, setter) => (
    <View className="mb-6">
      <Text className="text-base font-bold text-zinc-800 dark:text-neutral-200 mb-3 tracking-tight">
        {label}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {data.map(item => {
          const active = selected.includes(item);
          return (
            <TouchableOpacity
              key={item?.value}
              activeOpacity={0.7}
              onPress={() =>
                toggleSelection(qLabel, item, selected, setter)
              }
              className={`px-4 py-2 rounded-xl border font-medium ${active
                ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-600 dark:border-indigo-500"
                : "bg-zinc-50 border-zinc-200 dark:bg-neutral-900 dark:border-neutral-800"
                }`}
            >
              <Text
                className={`font-semibold text-base ${active
                  ? "text-white"
                  : "text-zinc-700 dark:text-neutral-300"
                  }`}
              >
                {item?.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 30 }}
      className="flex-1 px-4 bg-zinc-50 dark:bg-neutral-900 mt-4"
      showsVerticalScrollIndicator={false}
    >
      {/* MAIN CONTAINER CARD */}
      <View className="bg-white dark:bg-neutral-950/60 rounded-[30px] p-6 shadow-sm border border-zinc-100 dark:border-neutral-800/60">

        {/* TITLE INPUT */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-zinc-800 dark:text-neutral-200 mb-2 tracking-tight">
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter announcement title"
            placeholderTextColor="#a1a1aa"
            className="px-4 py-3.5 border border-zinc-200 dark:border-neutral-800 rounded-2xl bg-zinc-50/30 dark:bg-neutral-950 text-base font-medium text-zinc-900 dark:text-neutral-100"
          />
        </View>

        {/* BODY MESSAGE INPUT */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-zinc-800 dark:text-neutral-200 mb-2 tracking-tight">
            Message
          </Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your announcement..."
            placeholderTextColor="#a1a1aa"
            multiline
            textAlignVertical="top"
            className="px-4 py-4 border border-zinc-200 dark:border-neutral-800 rounded-2xl h-36 bg-zinc-50/30 dark:bg-neutral-950 text-base font-medium text-zinc-900 dark:text-neutral-100"
          />
        </View>

        {/* SCOPE CONFIGURATION TOGGLES */}
        <View className="mb-5 pt-5 border-t border-zinc-100 dark:border-neutral-800">
          <Text className="font-bold text-sm uppercase tracking-wider text-zinc-400 dark:text-neutral-500 mb-3">
            Target Audience Scope
          </Text>

          <View className="flex-row gap-x-6 px-1">
            {/* Students Selection Target */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setScope("students")}
              className="flex-row items-center gap-x-2"
            >
              <Ionicons
                name={scope === "students" ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={scope === "students" ? "#4f46e5" : (isDark ? "#525252" : "#a1a1aa")}
              />
              <Text className={`text-base font-bold ${scope === "students" ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-neutral-400"}`}>
                Students
              </Text>
            </TouchableOpacity>

            {/* Teachers Selection Target */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setScope("teachers")}
              className="flex-row items-center gap-x-2"
            >
              <Ionicons
                name={scope === "teachers" ? "radio-button-on" : "radio-button-off"}
                size={22}
                color={scope === "teachers" ? "#4f46e5" : (isDark ? "#525252" : "#a1a1aa")}
              />
              <Text className={`text-base font-bold ${scope === "teachers" ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-neutral-400"}`}>
                Teachers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CONDITIONALLY RENDERED MULTISELECTS FOR STUDENTS */}
        {scope === "students" && (
          <View className="bg-zinc-50/50 dark:bg-neutral-900/30 border border-zinc-100 dark:border-neutral-800/40 p-4 rounded-2xl mb-6">
            {renderMultiSelect("courses", "branches", metadata?.courses, targetCourses, setTargetCourses)}
            {renderMultiSelect("Branches", "years", metadata?.branches, targetBranches, setTargetBranches)}
            {renderMultiSelect("Years", "sections", metadata?.years, targetYears, setTargetYears)}
            {renderMultiSelect("Sections", undefined, metadata?.sections, targetSections, setTargetSections)}
          </View>
        )}

        {/* EXPIRY DATE CONFIGURATION */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-zinc-800 dark:text-neutral-200 mb-2 tracking-tight">
            Expiry Date
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center justify-between px-4 py-3.5 border border-zinc-200 dark:border-neutral-800 rounded-2xl bg-zinc-50/30 dark:bg-neutral-950"
          >
            <Text className="text-base font-medium text-zinc-800 dark:text-neutral-200">
              {expiryDate
                ? expiryDate.toLocaleString()
                : "Select expiry date & time"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={isDark ? "#a3a3a3" : "#71717a"} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={expiryDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const current = expiryDate ? new Date(expiryDate) : new Date();
                  current.setFullYear(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                  );
                  setExpiryDate(new Date(current));
                  if (Platform.OS === "android") {
                    setTimeout(() => setShowTimePicker(true), 200);
                  }
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={expiryDate || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const current = expiryDate ? new Date(expiryDate) : new Date();
                  current.setHours(
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                  );
                  setExpiryDate(new Date(current));
                }
              }}
            />
          )}
        </View>

        {/* TRANSACTION SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleAnnounce}
          disabled={loading}
          activeOpacity={0.8}
          className={`py-4 rounded-2xl shadow-sm items-center ${loading
            ? "bg-indigo-300 dark:bg-indigo-800/50"
            : "bg-indigo-600 dark:bg-indigo-600"
            }`}
        >
          <Text className={`text-sm font-bold tracking-wide ${loading ? 'text-indigo-100' : 'text-white'}`}>
            {loading ? "Publishing…" : "Publish Announcement"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}