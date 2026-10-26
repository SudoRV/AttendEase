import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from 'nativewind';
import { AppStates } from "../context/AppStates";
import { Fetch } from "../services/api";
import Selector from "../components/ui/Selector";

function RegisterPage({ onSwitch }) {
  const { setUserData } = AppStates();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigator = useNavigation();

  const [selectedRole, setSelectedRole] = useState("");
  const [isEmailValid, setEmailValid] = useState(null);
  const [isIDValid, setIDValid] = useState(null);

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    student_id: "",
    teacher_id: "",
    branch_id: "",
    year: "",
    semester: "",
    section: "A"
  });

  // load colleges, courses, branches, year, semester
  const [metadata, setMetadata] = useState({
    colleges: [],
    courses: [],
    branches: [],
    years: [],
    sections: []
  });

  const queryRef = useRef(null);

  useEffect(() => {
    if (selectedRole === "") return;

    const queries = {
      role: "colleges", college_id: "courses", course_id: "branches", branch_id: "years", year: "sections", section: ""
    };
    const query = queries[queryRef.current];

    console.log(query, queryRef.current)

    if (query === null) return;

    Object.keys(queries).slice(Object.keys(queries).indexOf(query)).forEach(q => {
      setFormData(prev => ({ ...prev, [q]: "" }))
    })

    async function fetchMetadata() {
      const payload = {
        college_id: [formData?.college_id],
        course_id: [formData?.course_id],
        branch_id: [formData?.branch_id],
        year: [formData?.year]
      };

      const response = await Fetch(`/college/metadata?query=${query}`, {
        method: "QUERY",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Metadata query failed");

      const data = await response.json();
      console.log(data)
      setMetadata(prev => ({ ...prev, ...data }));
    }

    fetchMetadata();
  }, [selectedRole, formData.college_id, formData.course_id, formData.branch_id, formData.year])

  /* =====================
        VALIDATION
  ===================== */
  const validateField = async (field, value) => {
    try {
      const response = await Fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value })
      });

      const res = await response.json();
      const available = !res.success;

      if (field === "email") setEmailValid(available);
      else setIDValid(available);
    } catch (error) {
      console.error("Validation Error:", error);
    }
  };

  const handleChange = (name, value) => {
    // Auto-capitalize Section input
    const finalValue = name === "section" ? value.toUpperCase() : value;

    queryRef.current = name;

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (["email", "student_id", "teacher_id"].includes(name)) {
      validateField(name, finalValue);
    }
  };

  const handleSubmit = async () => {
    if (!isEmailValid || !isIDValid) {
      Alert.alert("Error", "Please fix validation errors.");
      return;
    }

    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? null : value;
      return acc;
    }, {});

    try {
      const response = await Fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      });

      const res = await response.json();
      Alert.alert("User Registration", res.message);

      if (res.success) {
        navigator.navigate("Profile");
      }
    } catch (error) {
      Alert.alert("Error", "Registration failed. Check your connection.");
    }
  };

  return (
    <ScrollView
      className="flex-1 px-6 bg-zinc-50 dark:bg-neutral-900"
      showsVerticalScrollIndicator={false}
    >
      {/* TITLE */}
      <View className="items-center mt-20 pt-8">
        <Text className="text-4xl font-black tracking-tight text-indigo-500">
          AttendEase
        </Text>
        <Text className="text-base text-zinc-400 dark:text-neutral-400 mt-1 mb-6">
          Smart academic communication
        </Text>
      </View>

      {/* CARD */}
      <View className="bg-white dark:bg-neutral-950/60 rounded-[32px] shadow-md p-6 mb-10 border border-zinc-100 dark:border-neutral-800/60">
        <Text className="text-2xl font-bold text-center mb-1 text-zinc-900 dark:text-neutral-50 tracking-tight">
          Create Account
        </Text>
        <Text className="text-center text-zinc-400 dark:text-neutral-400 text-sm mb-6">
          Register to continue
        </Text>

        {/* ROLE PICKER */}
        <Selector
          value={selectedRole}
          options={[
            { label: "Role", value: "" },
            { label: "Student", value: "Student" },
            { label: "Teacher", value: "Teacher" }
          ]}
          onChange={(item) => {
            setSelectedRole(item.value);
            handleChange("role", item.value);
          }}
          styleSelector={"w-full mb-4 bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
          styleButton={"bg-transparent"}
        />

        {/* NAME */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#a1a1aa"
          className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#a1a1aa"
          className={`border rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base ${isEmailValid === false
            ? "border-rose-500 dark:border-red-500"
            : isEmailValid === true
              ? "border-emerald-500 dark:border-green-500"
              : "border-zinc-200 dark:border-neutral-800"
            }`}
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* TEACHER SPECIFIC */}
        {selectedRole === "Teacher" && (
          <>
            <Selector
              value={formData.college_id}
              options={[{ label: "Select College", value: "" }, ...metadata?.colleges?.map((college) => ({
                label: college.college_name,
                value: college.college_id,
              }))]}
              onChange={(item) => handleChange("college_id", item.value)}
              styleSelector={"w-full mb-4 bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
              styleButton={"bg-transparent"}
            />

            <TextInput
              placeholder="Teacher ID"
              placeholderTextColor="#a1a1aa"
              className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
              value={formData.teacher_id}
              onChangeText={(v) => handleChange("teacher_id", v)}
            /></>
        )}

        {/* STUDENT SPECIFIC */}
        {selectedRole === "Student" && (
          <>
            {/* College Picker */}
            <Selector
              value={formData.college_id}
              options={[{ label: "Select College", value: "" }, ...metadata?.colleges?.map((college) => ({
                label: college.college_name,
                value: college.college_id,
              }))]}
              onChange={(item) => handleChange("college_id", item.value)}
              styleSelector={"w-full mb-4 bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
              styleButton={"bg-transparent"}
            />

            {/* Course Picker */}
            <Selector
              value={formData.course_id}
              options={[{ label: "Select Course", value: "" }, ...metadata?.courses?.map((course) => ({
                label: `${course.course_id} - ${course?.course_name}`,
                value: course.course_id,
              }))]}
              onChange={(item) => handleChange("course_id", item.value)}
              styleSelector={"w-full mb-4 bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
              styleButton={"bg-transparent"}
            />

            {/* Branch Picker */}
            <Selector
              value={formData.branch_id}
              options={[{ label: "Select Branch", value: "" }, ...metadata?.branches?.map((branch) => ({
                label: `${branch.branch_id} - ${branch?.branch_name}`,
                value: branch.branch_id,
              }))]}
              onChange={(item) => handleChange("branch_id", item.value)}
              styleSelector={"w-full mb-4 bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
              styleButton={"bg-transparent"}
            />

            {/* Grouped: Year + Semester + Section */}
            <View className="flex-row gap-2 mb-4">
              {/* Year */}
              <View className="flex-1">
                <Selector
                  value={formData.year}
                  options={[{ label: "Year", value: "" }, ...metadata?.years?.map((year) => ({
                    label: String(year.year),
                    value: year.year,
                  }))]}
                  onChange={(item) => handleChange("year", item.value)}
                  styleSelector={"w-full bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
                  styleButton={"bg-transparent"}
                />
              </View>

              {/* Semester */}
              <View className="flex-1">
                <Selector
                  value={formData.semester}
                  options={
                    formData?.year
                      ? [
                        { label: "Semester", value: "" },
                        {
                          label: String(Number(formData.year) * 2 - 1),
                          value: Number(formData.year) * 2 - 1,
                        },
                        {
                          label: String(Number(formData.year) * 2),
                          value: Number(formData.year) * 2,
                        },
                      ]
                      : [{ label: "Semester", value: "" }]
                  }
                  onChange={(item) => handleChange("semester", item.value)}
                  styleSelector={"w-full bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
                  styleButton={"bg-transparent"}
                />
              </View>

              {/* Section */}
              <View className="flex-1">
                <Selector
                  value={formData.section}
                  options={[{ label: "Section", value: "" }, ...metadata?.sections?.map((section) => ({
                    label: section.section,
                    value: section.section,
                  }))]}
                  onChange={(item) => handleChange("section", item.value)}
                  styleSelector={"w-full bg-zinc-50/50 dark:bg-neutral-950/40 rounded-2xl px-3 py-3 border border-zinc-200 dark:border-neutral-800"}
                  styleButton={"bg-transparent"}
                />
              </View>
            </View>

            <TextInput
              placeholder="Student ID"
              placeholderTextColor="#a1a1aa"
              className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
              value={formData.student_id}
              onChangeText={(v) => handleChange("student_id", v)}
            />
          </>
        )}

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#a1a1aa"
          secureTextEntry
          className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-6 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
          value={formData.password}
          onChangeText={(v) => handleChange("password", v)}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!(isEmailValid && isIDValid)}
          activeOpacity={0.8}
          className={`py-4 rounded-2xl shadow-sm ${isEmailValid && isIDValid
            ? "bg-zinc-900 dark:bg-indigo-500"
            : "bg-zinc-200 dark:bg-neutral-800"
            }`}
        >
          <Text className={isEmailValid && isIDValid ? "text-white text-center font-bold tracking-wide" : "text-zinc-400 dark:text-neutral-500 text-center font-bold tracking-wide"}>
            Register
          </Text>
        </TouchableOpacity>

        {/* SWITCH TO LOGIN */}
        <TouchableOpacity
          onSwitch={onSwitch}
          className="mt-5"
          onPress={onSwitch}
          activeOpacity={0.7}
        >
          <View className="flex-row text-center justify-center">
            <Text className="text-base font-medium text-zinc-500 dark:text-neutral-400">Already have an account? </Text>
            <Text className="text-base text-center font-bold text-zinc-900 dark:text-indigo-400 underline decoration-zinc-300">
              Login
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default RegisterPage;