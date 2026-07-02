import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from 'nativewind';
import { AppStates } from "../context/AppStates";

function RegisterPage({ onSwitch }) {
  const { setUserData, buildUrl } = AppStates();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  /* =====================
        VALIDATION
  ===================== */
  const validateField = async (field, value) => {
    try {
      const response = await fetch(buildUrl("/api/auth/verify"), {
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
      const response = await fetch(buildUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      });

      const res = await response.json();
      Alert.alert("User Registration", res.message);

      if (res.success) {
        await AsyncStorage.setItem(
          "user_creds",
          JSON.stringify(formData)
        );
        setUserData(formData);
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
        <View className="border border-zinc-200 dark:border-neutral-800 rounded-2xl mb-4 overflow-hidden bg-zinc-50/50 dark:bg-neutral-950">
          <Picker
            selectedValue={selectedRole}
            dropdownIconColor={isDark ? "#a3a3a3" : "#71717a"}
            style={{ color: isDark ? "#f5f5f5" : "#18181b" }}
            onValueChange={(value) => {
              setSelectedRole(value);
              handleChange("role", value);
            }}
          >
            <Picker.Item label="Select Role" value="" style={{ color: isDark ? "#a3a3a3" : "#71717a", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
            <Picker.Item label="Teacher" value="Teacher" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
            <Picker.Item label="Student" value="Student" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
          </Picker>
        </View>

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
          <TextInput
            placeholder="Teacher ID"
            placeholderTextColor="#a1a1aa"
            className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
            value={formData.teacher_id}
            onChangeText={(v) => handleChange("teacher_id", v)}
          />
        )}

        {/* STUDENT SPECIFIC */}
        {selectedRole === "Student" && (
          <>
            <View className="border border-zinc-200 dark:border-neutral-800 rounded-2xl mb-4 overflow-hidden bg-zinc-50/50 dark:bg-neutral-950">
              <Picker
                selectedValue={formData.branch_id}
                dropdownIconColor={isDark ? "#a3a3a3" : "#71717a"}
                style={{ color: isDark ? "#f5f5f5" : "#18181b" }}
                onValueChange={(v) => handleChange("branch_id", v)}
              >
                <Picker.Item label="Select Branch" value="" style={{ color: isDark ? "#a3a3a3" : "#71717a", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="Computer Science & Engineering" value="CSE" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="AI/ML" value="AI" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="Robotics & Automation" value="RA" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="Mechanical Engineering" value="ME" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="Civil Engineering" value="CE" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="BCA" value="BCA" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
              </Picker>
            </View>

            <View className="border border-zinc-200 dark:border-neutral-800 rounded-2xl mb-4 overflow-hidden bg-zinc-50/50 dark:bg-neutral-950">
              <Picker
                selectedValue={formData.year}
                dropdownIconColor={isDark ? "#a3a3a3" : "#71717a"}
                style={{ color: isDark ? "#f5f5f5" : "#18181b" }}
                onValueChange={(v) => handleChange("year", v)}
              >
                <Picker.Item label="Select Year" value="" style={{ color: isDark ? "#a3a3a3" : "#71717a", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="1st Year" value="1" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="2nd Year" value="2" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="3rd Year" value="3" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="4th Year" value="4" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                <Picker.Item label="5th Year" value="5" style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
              </Picker>
            </View>

            {/* SEMESTER PICKER (1-10) */}
            <View className="border border-zinc-200 dark:border-neutral-800 rounded-2xl mb-4 overflow-hidden bg-zinc-50/50 dark:bg-neutral-950">
              <Picker
                selectedValue={formData.semester}
                dropdownIconColor={isDark ? "#a3a3a3" : "#71717a"}
                style={{ color: isDark ? "#f5f5f5" : "#18181b" }}
                onValueChange={(v) => handleChange("semester", v)}
              >
                <Picker.Item label="Select Semester" value="" style={{ color: isDark ? "#a3a3a3" : "#71717a", backgroundColor: isDark ? "#0a0a0a" : "#fff" }} />
                {Array.from({ length: 10 }, (_, i) => (
                  <Picker.Item
                    key={i + 1}
                    label={`Semester ${i + 1}`}
                    value={(i + 1).toString()}
                    style={{ color: isDark ? "#f5f5f5" : "#18181b", backgroundColor: isDark ? "#0a0a0a" : "#fff" }}
                  />
                ))}
              </Picker>
            </View>

            {/* SECTION INPUT (Auto-Capitalized) */}
            <TextInput
              placeholder="Section (e.g. A, B, C)"
              placeholderTextColor="#a1a1aa"
              className="border border-zinc-200 dark:border-neutral-800 rounded-2xl px-4 py-3.5 mb-4 text-zinc-900 dark:text-neutral-100 bg-zinc-50/50 dark:bg-neutral-950 font-medium text-base"
              value={formData.section}
              autoCapitalize="characters"
              onChangeText={(v) => handleChange("section", v)}
            />

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